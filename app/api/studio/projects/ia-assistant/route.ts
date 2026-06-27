import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildProjectBlueprint, buildProjectRows, getIaAssistantProjectInput } from "@/lib/flowlyStudioProjects";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function POST() {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado. Ejecuta supabase/flowly_studio.sql." }, { status: 503 });

  const input = getIaAssistantProjectInput();
  const blueprint = buildProjectBlueprint(input);
  const { rows } = buildProjectRows(input);
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

  return NextResponse.json({ project, blueprint, artifacts: artifacts || [] });
}
