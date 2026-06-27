import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateModuleFromArtifacts, type FlowlyStudioStoredArtifact } from "@/lib/flowlyStudioHeart";
import { reviewModuleGeneration } from "@/lib/flowlyStudioModuleExporter";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function POST(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado. Ejecuta supabase/flowly_studio.sql." }, { status: 503 });
  const body = await request.json();
  const moduleName = String(body.moduleName || "Módulo Flowly").trim();
  const slugs = Array.isArray(body.slugs) ? body.slugs.map(String).filter(Boolean) : [];
  const kinds = Array.isArray(body.kinds) ? body.kinds.map(String).filter(Boolean) : [];
  let query = supabaseAdmin.from("flowly_studio_artifacts").select("*").order("kind", { ascending: true }).order("name", { ascending: true });
  if (slugs.length) query = query.in("slug", slugs);
  if (kinds.length) query = query.in("kind", kinds);
  const { data, error } = await query.limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const artifacts = (data || []) as FlowlyStudioStoredArtifact[];
  if (!artifacts.length) return NextResponse.json({ error: "No hay artefactos seleccionados para revisar." }, { status: 400 });
  const generation = generateModuleFromArtifacts(moduleName, artifacts);
  return NextResponse.json({ review: reviewModuleGeneration(generation), generation });
}
