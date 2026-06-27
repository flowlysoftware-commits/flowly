import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateModuleFromArtifacts, type FlowlyStudioStoredArtifact } from "@/lib/flowlyStudioHeart";
import { buildReviewerAIReport } from "@/lib/flowlyStudioCore";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function POST(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  const body = await request.json();
  const moduleName = String(body.moduleName || "Módulo Flowly");
  const slugs = Array.isArray(body.slugs) ? body.slugs.map(String).filter(Boolean) : [];
  let query = supabaseAdmin.from("flowly_studio_artifacts").select("*").order("kind", { ascending: true }).order("name", { ascending: true });
  if (slugs.length) query = query.in("slug", slugs);
  const { data, error } = await query.limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const artifacts = (data || []) as FlowlyStudioStoredArtifact[];
  if (!artifacts.length) return NextResponse.json({ error: "No hay artefactos para revisar." }, { status: 400 });
  const generation = generateModuleFromArtifacts(moduleName, artifacts);
  const report = buildReviewerAIReport(generation);
  await supabaseAdmin.from("flowly_studio_reviews").insert({ module_name: moduleName, slug: generation.slug, report, score: report.puntuacion, approved: report.aprobado });
  return NextResponse.json({ report, generation });
}
