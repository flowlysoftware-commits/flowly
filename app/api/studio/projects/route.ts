import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildProjectBlueprint, buildProjectRows, type FlowlyProjectType } from "@/lib/flowlyStudioProjects";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const validTypes = new Set(["erp", "crm", "rrhh", "hotel", "clinica", "logistica", "taller", "vehiculos", "libre", "ia_assistant"]);

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

async function deleteProjectById(id: string, deleteArtifacts: boolean) {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado. Ejecuta supabase/flowly_studio.sql." }, { status: 503 });
  const { data: project, error: fetchError } = await supabaseAdmin
    .from("flowly_studio_projects")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !project) return NextResponse.json({ error: fetchError?.message || "Proyecto no encontrado." }, { status: 404 });

  if (deleteArtifacts) {
    const blueprint = (project.blueprint || {}) as Record<string, unknown>;
    const groups = ["businessObjects", "capabilities", "workflows", "policies", "apps"] as const;
    const slugs = groups.flatMap((group) => {
      const items = Array.isArray(blueprint[group]) ? blueprint[group] : [];
      return items
        .map((item) => typeof item === "object" && item && "slug" in item ? String((item as { slug?: unknown }).slug || "") : "")
        .filter(Boolean);
    });
    if (slugs.length) {
      const { error: artifactError } = await supabaseAdmin.from("flowly_studio_artifacts").delete().in("slug", slugs);
      if (artifactError) return NextResponse.json({ error: artifactError.message }, { status: 500 });
    }
  }

  const { error: deleteError } = await supabaseAdmin.from("flowly_studio_projects").delete().eq("id", id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  return NextResponse.json({ ok: true, deletedProject: project, deletedArtifacts: deleteArtifacts });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta el id del proyecto." }, { status: 400 });
  return deleteProjectById(id, request.nextUrl.searchParams.get("deleteArtifacts") === "true");
}

export async function POST(request: NextRequest) {
  const rawBody = await request.json();
  if ((rawBody as Record<string, unknown>)._method === "DELETE") {
    const id = request.nextUrl.searchParams.get("id") || String((rawBody as Record<string, unknown>).id || "");
    if (!id) return NextResponse.json({ error: "Falta el id del proyecto." }, { status: 400 });
    return deleteProjectById(id, request.nextUrl.searchParams.get("deleteArtifacts") === "true" || (rawBody as Record<string, unknown>).deleteArtifacts === true);
  }
  const input = normalizeBody(rawBody);
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
