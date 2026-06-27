import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildProjectBlueprint, buildProjectRows, type FlowlyProjectType } from "@/lib/flowlyStudioProjects";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const validTypes = new Set(["erp", "crm", "rrhh", "hotel", "clinica", "logistica", "taller", "vehiculos", "libre"]);

function normalizeBody(body: Record<string, unknown>) {
  const type = String(body.type || "libre") as FlowlyProjectType;
  return {
    name: String(body.name || "Nuevo proyecto Flowly"),
    description: String(body.description || ""),
    type: validTypes.has(type) ? type : "libre",
    modules: Array.isArray(body.modules) ? body.modules.map(String).filter(Boolean) : [],
    prompt: String(body.prompt || ""),
    createArtifacts: body.createArtifacts !== false,
  };
}

export async function GET() {
  if (!dbReady()) return NextResponse.json({ projects: [] });
  const { data, error } = await supabaseAdmin
    .from("flowly_studio_projects")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projects: data || [] });
}

export async function POST(request: NextRequest) {
  const input = normalizeBody(await request.json());
  const blueprintOnly = request.nextUrl.searchParams.get("preview") === "true";
  const blueprint = buildProjectBlueprint(input);

  if (blueprintOnly) return NextResponse.json({ blueprint });
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado. Ejecuta supabase/flowly_studio.sql." }, { status: 503 });

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

  const created = input.createArtifacts
    ? await supabaseAdmin.from("flowly_studio_artifacts").upsert(rows, { onConflict: "kind,slug" }).select("*")
    : { data: [], error: null };

  if (created.error) return NextResponse.json({ error: created.error.message }, { status: 500 });

  return NextResponse.json({ project, blueprint, artifacts: created.data || [] });
}
