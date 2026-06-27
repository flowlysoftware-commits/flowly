import { NextRequest, NextResponse } from "next/server";
import { analyzeCopilotRequest } from "@/lib/flowlyPanelCopilot";
import { buildProjectRows } from "@/lib/flowlyStudioProjects";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const message = String(body.message || "");
  const result = analyzeCopilotRequest(message);

  if (!dbReady()) {
    return NextResponse.json({ error: "Supabase no está configurado. Ejecuta los SQL de Flowly Studio/Copilot." }, { status: 503 });
  }

  if (result.intent === "crear" && result.projectInput) {
    const { blueprint, rows } = buildProjectRows(result.projectInput);
    const now = new Date().toISOString();

    const { data: project, error: projectError } = await supabaseAdmin
      .from("flowly_studio_projects")
      .upsert(
        {
          name: blueprint.name,
          slug: blueprint.slug,
          type: blueprint.type,
          description: blueprint.description,
          modules: blueprint.modules,
          blueprint,
          status: "draft",
          updated_at: now,
        },
        { onConflict: "slug" },
      )
      .select("*")
      .single();

    if (projectError) return NextResponse.json({ error: projectError.message }, { status: 500 });

    const { data: artifacts, error: artifactsError } = await supabaseAdmin
      .from("flowly_studio_artifacts")
      .upsert(rows, { onConflict: "kind,slug" })
      .select("*");

    if (artifactsError) return NextResponse.json({ error: artifactsError.message }, { status: 500 });

    await supabaseAdmin.from("flowly_copilot_requests").insert({
      title: result.title,
      intent: result.intent,
      target: result.target,
      status: "applied",
      request_text: result.summary,
      response: result,
      project_slug: blueprint.slug,
    });

    return NextResponse.json({ ok: true, mode: "project", project, blueprint, artifacts: artifacts || [], studioRoute: `/studio/v2?project=${blueprint.slug}` });
  }

  const { data, error } = await supabaseAdmin
    .from("flowly_copilot_requests")
    .insert({
      title: result.title,
      intent: result.intent,
      target: result.target,
      status: "pending_review",
      request_text: result.summary,
      response: result,
      project_slug: result.blueprint?.slug || null,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, mode: "change_request", request: data, studioRoute: result.studioRoute });
}
