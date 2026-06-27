import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateModuleFromArtifacts, type FlowlyStudioStoredArtifact } from "@/lib/flowlyStudioHeart";
import { buildModuleFiles, reviewModuleGeneration } from "@/lib/flowlyStudioModuleExporter";
import { slugifyStudio } from "@/lib/flowlyStudio";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function artifactsFromBody(body: Record<string, unknown>): FlowlyStudioStoredArtifact[] {
  if (!Array.isArray(body.artifacts)) return [];
  return body.artifacts
    .filter((item): item is FlowlyStudioStoredArtifact => Boolean(item && typeof item === "object" && "kind" in item && "slug" in item && "definition" in item))
    .map((item) => ({ ...item, id: item.id || `${item.kind}:${item.slug}` }));
}

function classifyFile(path: string) {
  if (path.endsWith(".sql")) return "sql";
  if (path.includes("app/api/")) return "api";
  if (path.includes("app/") && path.endsWith("page.tsx")) return "app";
  if (path.includes("lib/generated/")) return "typescript";
  if (path.includes("sdk/")) return "sdk";
  if (path.includes("docs/")) return "docs";
  if (path.includes("tests/")) return "tests";
  if (path.includes("marketplace/")) return "marketplace";
  return "archivo";
}

function describeFile(path: string) {
  if (path.endsWith(".sql")) return "Migración Supabase lista para revisar y ejecutar.";
  if (path.includes("app/api/")) return "Endpoint de API generado para exponer el módulo.";
  if (path.includes("app/generated/")) return "Página navegable inicial del módulo.";
  if (path.includes("lib/generated/")) return "Tipos, índice y metadatos TypeScript del módulo.";
  if (path.includes("sdk/")) return "SDK generado para consumir el módulo.";
  if (path.includes("docs/")) return "Documentación sincronizada con Flowly Docs.";
  if (path.includes("tests/")) return "Plan de pruebas base para validar el módulo.";
  if (path.includes("marketplace/")) return "Manifest preparado para empaquetar/publicar el módulo.";
  return "Archivo generado por Flowly Builder.";
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const incomingArtifacts = artifactsFromBody(body as Record<string, unknown>);
  if (!dbReady() && !incomingArtifacts.length) return NextResponse.json({ error: "Supabase no está configurado. Ejecuta supabase/flowly_studio.sql." }, { status: 503 });

  const moduleName = String(body.moduleName || "Módulo Flowly").trim();
  const slugs = Array.isArray(body.slugs) ? body.slugs.map(String).filter(Boolean) : [];
  const kinds = Array.isArray(body.kinds) ? body.kinds.map(String).filter(Boolean) : [];

  let artifacts = incomingArtifacts;
  if (!artifacts.length) {
    let query = supabaseAdmin.from("flowly_studio_artifacts").select("*").order("kind", { ascending: true }).order("name", { ascending: true });
    if (slugs.length) query = query.in("slug", slugs);
    if (kinds.length) query = query.in("kind", kinds);
    const { data, error } = await query.limit(500);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    artifacts = (data || []) as FlowlyStudioStoredArtifact[];
  }

  if (!artifacts.length) return NextResponse.json({ error: "No hay piezas del Blueprint para fabricar." }, { status: 400 });

  const generation = generateModuleFromArtifacts(moduleName, artifacts);
  const review = reviewModuleGeneration(generation);
  const files = buildModuleFiles(generation).map((file) => ({ path: file.path, kind: classifyFile(file.path), description: describeFile(file.path) }));

  const phases = [
    { id: "blueprint", name: "Leer Blueprint", status: "completed", detail: `${artifacts.length} piezas analizadas desde Studio.` },
    { id: "review", name: "Revisión automática", status: review.approved ? "completed" : "warning", detail: `Puntuación ${review.score}/100 con ${review.warnings.length} avisos.` },
    { id: "sql", name: "Preparar Supabase", status: "completed", detail: `${artifacts.filter((item) => item.kind === "business_object").length} tablas candidatas incluidas en la migración.` },
    { id: "runtime", name: "Registrar en Kernel", status: "completed", detail: "Business Objects, Capabilities y App preparados para registro." },
    { id: "api", name: "Generar API", status: "completed", detail: "Manifest y ruta API generada para revisión." },
    { id: "ui", name: "Generar aplicación", status: "completed", detail: "Pantalla inicial navegable preparada." },
    { id: "docs", name: "Actualizar Docs", status: "completed", detail: "Documentación Markdown preparada." },
    { id: "tests", name: "Preparar pruebas", status: "completed", detail: "Plan de pruebas generado para QA." },
  ] as const;

  const run = {
    id: `builder_${slugifyStudio(moduleName)}_${Date.now()}`,
    moduleName: generation.moduleName,
    slug: generation.slug,
    status: review.approved ? "completed" : "ready",
    phases,
    files,
    review,
    nextActions: [
      "Exportar el ZIP instalable si quieres revisar los archivos antes de aplicarlos.",
      "Ejecutar la migración SQL del módulo en Supabase cuando esté validada.",
      "Conectar las Capabilities al Runtime real antes de producción.",
      "Abrir la app generada y probar el flujo básico.",
    ],
    createdAt: new Date().toISOString(),
  };

  if (dbReady()) {
    const payload = {
      id: run.id,
      module_name: run.moduleName,
      slug: run.slug,
      status: run.status,
      phases: run.phases,
      files: run.files,
      review: run.review,
      next_actions: run.nextActions,
      generation,
    };
    const { error } = await supabaseAdmin.from("flowly_builder_runs").insert(payload);
    // No bloqueamos el Builder si el usuario todavía no ha ejecutado el SQL nuevo.
    if (error && !String(error.message).toLowerCase().includes("does not exist")) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ run, generation });
}
