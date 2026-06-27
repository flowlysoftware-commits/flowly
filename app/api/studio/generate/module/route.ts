import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateModuleFromArtifacts, type FlowlyStudioStoredArtifact } from "@/lib/flowlyStudioHeart";
import { slugifyStudio } from "@/lib/flowlyStudio";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function POST(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado. Ejecuta supabase/flowly_studio.sql." }, { status: 503 });

  const body = await request.json();
  const moduleName = String(body.moduleName || "Flowly Module").trim();
  const slugs = Array.isArray(body.slugs) ? body.slugs.map(String).filter(Boolean) : [];
  const kinds = Array.isArray(body.kinds) ? body.kinds.map(String).filter(Boolean) : [];

  let query = supabaseAdmin.from("flowly_studio_artifacts").select("*").order("kind", { ascending: true }).order("name", { ascending: true });
  if (slugs.length) query = query.in("slug", slugs);
  if (kinds.length) query = query.in("kind", kinds);

  const { data, error } = await query.limit(300);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const artifacts = (data || []) as FlowlyStudioStoredArtifact[];
  if (!artifacts.length) return NextResponse.json({ error: "No hay artefactos seleccionados para generar." }, { status: 400 });

  const generation = generateModuleFromArtifacts(moduleName, artifacts);

  const { error: insertError } = await supabaseAdmin.from("flowly_studio_generations").insert({
    module_name: generation.moduleName,
    slug: slugifyStudio(generation.slug),
    summary: generation.summary,
    selected_artifacts: artifacts.map((artifact) => ({ kind: artifact.kind, slug: artifact.slug, name: artifact.name })),
    migration_sql: generation.migrationSql,
    typescript_index: generation.typeScriptIndex,
    api_manifest: generation.apiManifest,
    sdk_index: generation.sdkIndex,
    docs_index: generation.docsIndex,
    test_plan: generation.testPlan,
    impact_report: generation.impactReport,
  });

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ generation });
}
