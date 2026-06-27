import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildSeedModuleSuggestion } from "@/lib/flowlyStudioHeart";
import { generateStudioArtifacts, slugifyStudio, type FlowlyStudioDefinition } from "@/lib/flowlyStudio";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function cleanName(name: string) {
  return name.replace(/\s+/g, "");
}

function businessObject(name: string, domain: string): FlowlyStudioDefinition {
  const slug = slugifyStudio(name);
  return {
    kind: "business_object",
    name,
    slug,
    domain,
    description: `Representa ${name} dentro del módulo diseñado por Architect.`,
    status: "draft",
    fields: [
      { id: `field_${slug}_name`, name: "name", label: "Nombre", type: "text", required: true },
      { id: `field_${slug}_description`, name: "description", label: "Descripción", type: "long_text", required: false },
    ],
    states: [
      { id: `state_${slug}_draft`, name: "draft", label: "Borrador", isInitial: true },
      { id: `state_${slug}_active`, name: "active", label: "Activo" },
      { id: `state_${slug}_archived`, name: "archived", label: "Archivado" },
    ],
    commands: [
      { id: `cmd_create_${slug}`, name: `Create${cleanName(name)}` },
      { id: `cmd_update_${slug}`, name: `Update${cleanName(name)}` },
      { id: `cmd_archive_${slug}`, name: `Archive${cleanName(name)}` },
    ],
    queries: [
      { id: `qry_get_${slug}`, name: `Get${cleanName(name)}` },
      { id: `qry_search_${slug}`, name: `Search${cleanName(name)}s` },
    ],
    events: [{ id: `evt_created_${slug}`, name: `${cleanName(name)}Created` }],
    policies: [{ id: `pol_org_${slug}`, name: "OrganizationIsolation" }],
    capabilities: [{ id: `cap_create_${slug}`, name: `Create${cleanName(name)}` }],
    relationships: [],
  } as FlowlyStudioDefinition;
}

function capability(name: string, domain: string, firstBusinessObject: string): FlowlyStudioDefinition {
  const slug = slugifyStudio(name);
  return {
    kind: "capability",
    name,
    slug,
    domain,
    description: `Capacidad reutilizable ${name} generada por Architect.`,
    status: "draft",
    businessObjects: firstBusinessObject ? [firstBusinessObject] : [],
    inputs: [{ id: `input_${slug}`, name: "payload", type: "json", required: true, description: "Datos de entrada de la capacidad." }],
    outputs: [{ id: `output_${slug}`, name: "result", type: "json", required: true, description: "Resultado estructurado." }],
    commands: [{ id: `cmd_${slug}`, name: cleanName(name) }],
    queries: [],
    policies: [{ id: `pol_${slug}`, name: "RequiresAuthorization" }],
    events: [{ id: `evt_${slug}`, name: `${cleanName(name)}Executed` }],
    usesAI: false,
    observability: ["trace", "duration", "success", "events"],
  } as FlowlyStudioDefinition;
}

function workflow(name: string, domain: string): FlowlyStudioDefinition {
  const slug = slugifyStudio(name);
  return {
    kind: "workflow",
    name,
    slug,
    domain,
    description: `Proceso ${name} diseñado por Architect.`,
    status: "draft",
    trigger: "ManualStart",
    steps: [
      { id: `step_${slug}_start`, name: "Inicio", type: "trigger", description: "Inicio del proceso." },
      { id: `step_${slug}_review`, name: "Revisión", type: "approval", description: "Revisión antes de ejecutar." },
    ],
    events: [{ id: `evt_${slug}`, name: `${cleanName(name)}Started` }],
    policies: [{ id: `pol_${slug}`, name: "HumanApprovalRequired" }],
  } as FlowlyStudioDefinition;
}

function policy(name: string, domain: string): FlowlyStudioDefinition {
  const slug = slugifyStudio(name);
  return {
    kind: "policy",
    name,
    slug,
    domain,
    description: `Política ${name} diseñada por Architect.`,
    status: "draft",
    scope: "organization",
    rules: [{ id: `rule_${slug}`, subject: "Organization", condition: "always", effect: "require_approval", description: "Requiere revisión hasta definir reglas reales." }],
  } as FlowlyStudioDefinition;
}

export async function POST(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado. Ejecuta supabase/flowly_studio.sql." }, { status: 503 });
  const body = await request.json();
  const prompt = String(body.prompt || "");
  const suggestion = buildSeedModuleSuggestion(prompt);
  const normalized = prompt.toLowerCase();
  const domain = normalized.includes("rrhh") || normalized.includes("emple") || normalized.includes("human") ? "people" : normalized.includes("veh") || normalized.includes("alquiler") || normalized.includes("coche") ? "operations" : "custom";
  const definitions: FlowlyStudioDefinition[] = [
    ...suggestion.businessObjects.map((item) => businessObject(item, domain)),
    ...suggestion.capabilities.map((item) => capability(item, domain, suggestion.businessObjects[0] || "")),
    ...suggestion.workflows.map((item) => workflow(item, domain)),
    ...suggestion.policies.map((item) => policy(item, domain)),
  ];
  const rows = definitions.map((definition) => {
    const artifacts = generateStudioArtifacts(definition);
    return {
      kind: definition.kind || "business_object",
      name: definition.name,
      slug: definition.slug,
      domain: definition.domain,
      description: definition.description,
      status: definition.status,
      definition,
      generated_sql: artifacts.sql,
      generated_typescript: artifacts.typescript,
      generated_api: artifacts.apiRoute,
      generated_markdown: artifacts.markdown,
      generated_tests: artifacts.testPlan,
      generated_sdk: artifacts.sdk,
      updated_at: new Date().toISOString(),
    };
  });
  const { data, error } = await supabaseAdmin.from("flowly_studio_artifacts").upsert(rows, { onConflict: "kind,slug" }).select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ suggestion, created: data || [] });
}
