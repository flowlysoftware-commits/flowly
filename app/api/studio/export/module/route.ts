import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateModuleFromArtifacts, type FlowlyStudioStoredArtifact } from "@/lib/flowlyStudioHeart";
import { buildModuleZip, reviewModuleGeneration } from "@/lib/flowlyStudioModuleExporter";
import { slugifyStudio } from "@/lib/flowlyStudio";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function loadArtifacts(slugs: string[], kinds: string[]) {
  let query = supabaseAdmin.from("flowly_studio_artifacts").select("*").order("kind", { ascending: true }).order("name", { ascending: true });
  if (slugs.length) query = query.in("slug", slugs);
  if (kinds.length) query = query.in("kind", kinds);
  const { data, error } = await query.limit(500);
  if (error) throw new Error(error.message);
  return (data || []) as FlowlyStudioStoredArtifact[];
}

export async function POST(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado. Ejecuta supabase/flowly_studio.sql." }, { status: 503 });
  const body = await request.json();
  const moduleName = String(body.moduleName || "Módulo Flowly").trim();
  const slugs = Array.isArray(body.slugs) ? body.slugs.map(String).filter(Boolean) : [];
  const kinds = Array.isArray(body.kinds) ? body.kinds.map(String).filter(Boolean) : [];
  const artifacts = await loadArtifacts(slugs, kinds);
  if (!artifacts.length) return NextResponse.json({ error: "No hay artefactos seleccionados para exportar." }, { status: 400 });
  const generation = generateModuleFromArtifacts(moduleName, artifacts);
  const review = reviewModuleGeneration(generation);
  if (!review.approved && body.force !== true) return NextResponse.json({ error: "La revisión automática ha bloqueado la exportación.", review }, { status: 422 });
  const zip = buildModuleZip(generation);
  return new NextResponse(zip, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${slugifyStudio(moduleName)}-flowly-module.zip"`,
      "x-flowly-review-score": String(review.score),
    },
  });
}
