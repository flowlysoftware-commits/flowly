import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateModuleFromArtifacts, type FlowlyStudioStoredArtifact } from "@/lib/flowlyStudioHeart";
import { buildModuleFiles, reviewModuleGeneration } from "@/lib/flowlyStudioModuleExporter";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function POST(request: NextRequest) {
  if (process.env.FLOWLY_STUDIO_ALLOW_FILE_WRITE !== "true") {
    return NextResponse.json({ error: "Instalación directa desactivada. Por seguridad, exporta el ZIP e instálalo manualmente. Para desarrollo local puedes activar FLOWLY_STUDIO_ALLOW_FILE_WRITE=true." }, { status: 403 });
  }
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  const body = await request.json();
  const moduleName = String(body.moduleName || "Módulo Flowly").trim();
  const slugs = Array.isArray(body.slugs) ? body.slugs.map(String).filter(Boolean) : [];
  let query = supabaseAdmin.from("flowly_studio_artifacts").select("*").order("kind", { ascending: true }).order("name", { ascending: true });
  if (slugs.length) query = query.in("slug", slugs);
  const { data, error } = await query.limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const artifacts = (data || []) as FlowlyStudioStoredArtifact[];
  if (!artifacts.length) return NextResponse.json({ error: "No hay artefactos seleccionados para instalar." }, { status: 400 });
  const generation = generateModuleFromArtifacts(moduleName, artifacts);
  const review = reviewModuleGeneration(generation);
  if (!review.approved && body.force !== true) return NextResponse.json({ error: "La revisión automática ha bloqueado la instalación.", review }, { status: 422 });
  const files = buildModuleFiles(generation);
  const root = process.cwd();
  const written: string[] = [];
  for (const file of files) {
    const target = path.join(root, file.path);
    if (!target.startsWith(root)) continue;
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, file.content, "utf8");
    written.push(file.path);
  }
  return NextResponse.json({ ok: true, written, review });
}
