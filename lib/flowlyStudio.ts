export type FlowlyStudioFieldType =
  | "text"
  | "long_text"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "email"
  | "phone"
  | "currency"
  | "relation"
  | "file"
  | "json"
  | "ai";

export type FlowlyStudioStatus = "draft" | "review" | "stable";
export type FlowlyStudioArtifactKind = "business_object" | "capability" | "workflow" | "policy" | "app" | "architect_blueprint";

export type FlowlyStudioField = {
  id: string;
  name: string;
  label: string;
  type: FlowlyStudioFieldType;
  required: boolean;
  unique?: boolean;
  relationTo?: string;
  description?: string;
};

export type FlowlyStudioState = {
  id: string;
  name: string;
  label: string;
  isInitial?: boolean;
  description?: string;
};

export type FlowlyStudioNamedItem = {
  id: string;
  name: string;
  description?: string;
};

export type FlowlyStudioRelationship = {
  id: string;
  target: string;
  type: "ownership" | "reference" | "composition" | "association" | "dependency" | "collaboration" | "hierarchy" | "temporal";
  cardinality?: "one_to_one" | "one_to_many" | "many_to_one" | "many_to_many";
  description?: string;
};

export type FlowlyBusinessObjectDefinition = {
  id?: string;
  kind?: "business_object";
  name: string;
  slug: string;
  domain: string;
  description: string;
  status: FlowlyStudioStatus;
  fields: FlowlyStudioField[];
  states: FlowlyStudioState[];
  commands: FlowlyStudioNamedItem[];
  queries: FlowlyStudioNamedItem[];
  events: FlowlyStudioNamedItem[];
  policies: FlowlyStudioNamedItem[];
  capabilities: FlowlyStudioNamedItem[];
  relationships: FlowlyStudioRelationship[];
  notes?: string;
};

export type FlowlyCapabilityParameter = {
  id: string;
  name: string;
  type: FlowlyStudioFieldType | "business_object" | "array";
  required: boolean;
  description?: string;
};

export type FlowlyCapabilityDefinition = {
  id?: string;
  kind: "capability";
  name: string;
  slug: string;
  domain: string;
  description: string;
  status: FlowlyStudioStatus;
  businessObjects: string[];
  inputs: FlowlyCapabilityParameter[];
  outputs: FlowlyCapabilityParameter[];
  commands: FlowlyStudioNamedItem[];
  queries: FlowlyStudioNamedItem[];
  policies: FlowlyStudioNamedItem[];
  events: FlowlyStudioNamedItem[];
  usesAI: boolean;
  observability: string[];
  notes?: string;
};

export type FlowlyWorkflowStep = {
  id: string;
  name: string;
  type: "trigger" | "capability" | "approval" | "condition" | "notification" | "wait" | "event";
  target?: string;
  description?: string;
};

export type FlowlyWorkflowDefinition = {
  id?: string;
  kind: "workflow";
  name: string;
  slug: string;
  domain: string;
  description: string;
  status: FlowlyStudioStatus;
  trigger: string;
  steps: FlowlyWorkflowStep[];
  events: FlowlyStudioNamedItem[];
  policies: FlowlyStudioNamedItem[];
  notes?: string;
};

export type FlowlyPolicyRule = {
  id: string;
  subject: string;
  condition: string;
  effect: "allow" | "deny" | "require_approval" | "notify";
  description?: string;
};

export type FlowlyPolicyDefinition = {
  id?: string;
  kind: "policy";
  name: string;
  slug: string;
  domain: string;
  description: string;
  status: FlowlyStudioStatus;
  scope: "organization" | "workspace" | "business_object" | "capability" | "workflow";
  rules: FlowlyPolicyRule[];
  notes?: string;
};

export type FlowlyAppDefinition = {
  id?: string;
  kind: "app";
  name: string;
  slug: string;
  domain: string;
  description: string;
  status: FlowlyStudioStatus;
  businessObjects: string[];
  capabilities: string[];
  navigation: FlowlyStudioNamedItem[];
  widgets: FlowlyStudioNamedItem[];
  notes?: string;
};

export type FlowlyArchitectBlueprint = {
  id?: string;
  kind: "architect_blueprint";
  name: string;
  slug: string;
  domain: string;
  description: string;
  status: FlowlyStudioStatus;
  goal: string;
  businessObjects: string[];
  capabilities: string[];
  workflows: string[];
  policies: string[];
  risks: string[];
  notes?: string;
};

export type FlowlyStudioDefinition =
  | FlowlyBusinessObjectDefinition
  | FlowlyCapabilityDefinition
  | FlowlyWorkflowDefinition
  | FlowlyPolicyDefinition
  | FlowlyAppDefinition
  | FlowlyArchitectBlueprint;

export type FlowlyGeneratedArtifacts = {
  sql: string;
  typescript: string;
  apiRoute: string;
  markdown: string;
  testPlan: string;
  sdk: string;
};

export type FlowlyGeneratedBusinessObjectArtifacts = FlowlyGeneratedArtifacts;

export function slugifyStudio(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "flowly-artifact"
  );
}

export function toPascalCase(value: string) {
  return slugifyStudio(value)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("") || "FlowlyArtifact";
}

export function toSnakeCase(value: string) {
  return slugifyStudio(value).replace(/-/g, "_");
}

export function createStudioId(prefix = "item") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export const studioDomains = ["sales", "finance", "projects", "people", "marketing", "support", "organization", "operations", "system", "custom"];

export const initialBusinessObjectDefinition: FlowlyBusinessObjectDefinition = {
  kind: "business_object",
  name: "Customer",
  slug: "customer",
  domain: "sales",
  description: "Representa un cliente dentro de una organización de Flowly.",
  status: "draft",
  fields: [
    { id: "field_name", name: "name", label: "Nombre", type: "text", required: true, description: "Nombre visible del cliente." },
    { id: "field_email", name: "email", label: "Email", type: "email", required: false },
    { id: "field_phone", name: "phone", label: "Teléfono", type: "phone", required: false },
  ],
  states: [
    { id: "state_draft", name: "draft", label: "Borrador", isInitial: true },
    { id: "state_active", name: "active", label: "Activo" },
    { id: "state_archived", name: "archived", label: "Archivado" },
  ],
  commands: [
    { id: "cmd_create", name: "CreateCustomer", description: "Crea un nuevo cliente." },
    { id: "cmd_update", name: "UpdateCustomer", description: "Actualiza datos del cliente." },
    { id: "cmd_archive", name: "ArchiveCustomer", description: "Archiva el cliente." },
  ],
  queries: [
    { id: "qry_get", name: "GetCustomer", description: "Obtiene un cliente por ID." },
    { id: "qry_search", name: "SearchCustomers", description: "Busca clientes." },
  ],
  events: [
    { id: "evt_created", name: "CustomerCreated", description: "Se genera al crear el cliente." },
    { id: "evt_updated", name: "CustomerUpdated", description: "Se genera al actualizar el cliente." },
  ],
  policies: [{ id: "pol_org", name: "OrganizationIsolation", description: "El objeto pertenece siempre a una organización." }],
  capabilities: [{ id: "cap_create", name: "CreateCustomer", description: "Capability oficial para crear clientes." }],
  relationships: [{ id: "rel_company", target: "Company", type: "reference", cardinality: "many_to_one", description: "Cliente asociado a una empresa." }],
  notes: "Primer ejemplo generado desde Flowly Studio.",
};

export const initialCapabilityDefinition: FlowlyCapabilityDefinition = {
  kind: "capability",
  name: "Create Customer",
  slug: "create-customer",
  domain: "sales",
  description: "Crea un cliente utilizando Commands oficiales del dominio.",
  status: "draft",
  businessObjects: ["Customer"],
  inputs: [
    { id: "in_name", name: "name", type: "text", required: true, description: "Nombre del cliente." },
    { id: "in_email", name: "email", type: "email", required: false, description: "Email del cliente." },
  ],
  outputs: [{ id: "out_customer", name: "customerId", type: "text", required: true, description: "ID del cliente creado." }],
  commands: [{ id: "cmd", name: "CreateCustomer", description: "Command del dominio." }],
  queries: [],
  policies: [{ id: "pol", name: "CanCreateCustomer", description: "La identidad puede crear clientes." }],
  events: [{ id: "evt", name: "CustomerCreated", description: "Evento del dominio." }],
  usesAI: false,
  observability: ["trace", "duration", "success", "events"],
  notes: "Capability inicial del Studio.",
};

export const initialWorkflowDefinition: FlowlyWorkflowDefinition = {
  kind: "workflow",
  name: "Customer Onboarding",
  slug: "customer-onboarding",
  domain: "sales",
  description: "Workflow inicial para dar de alta y activar un cliente.",
  status: "draft",
  trigger: "CustomerCreated",
  steps: [
    { id: "step_trigger", name: "CustomerCreated", type: "trigger", description: "Se activa al crear el cliente." },
    { id: "step_notify", name: "Notify Sales", type: "notification", target: "Sales Team", description: "Avisa al equipo comercial." },
    { id: "step_task", name: "Schedule Follow Up", type: "capability", target: "ScheduleMeeting", description: "Programa seguimiento." },
  ],
  events: [{ id: "evt_finished", name: "CustomerOnboardingStarted", description: "Workflow iniciado." }],
  policies: [{ id: "pol_sales", name: "SalesAccess", description: "Solo equipo comercial." }],
};

export const initialPolicyDefinition: FlowlyPolicyDefinition = {
  kind: "policy",
  name: "High Value Approval",
  slug: "high-value-approval",
  domain: "finance",
  description: "Solicita aprobación para operaciones de alto valor.",
  status: "draft",
  scope: "capability",
  rules: [{ id: "rule_amount", subject: "Invoice", condition: "amount > 5000", effect: "require_approval", description: "Importes superiores a 5.000 requieren aprobación." }],
};

export const initialAppDefinition: FlowlyAppDefinition = {
  kind: "app",
  name: "Customer Workspace",
  slug: "customer-workspace",
  domain: "sales",
  description: "App adaptativa para gestionar clientes y oportunidades.",
  status: "draft",
  businessObjects: ["Customer", "Opportunity"],
  capabilities: ["CreateCustomer", "SearchCustomers", "GenerateProposal"],
  navigation: [{ id: "nav_customers", name: "Clientes", description: "Vista principal de clientes." }],
  widgets: [{ id: "w_health", name: "Customer Health", description: "Salud de la cartera." }],
};

export const initialArchitectBlueprint: FlowlyArchitectBlueprint = {
  kind: "architect_blueprint",
  name: "Vehicle Rental Module",
  slug: "vehicle-rental-module",
  domain: "operations",
  description: "Blueprint generado para un módulo de alquiler de vehículos.",
  status: "draft",
  goal: "Gestionar vehículos, reservas, conductores, contratos y facturación de alquileres.",
  businessObjects: ["Vehicle", "Rental", "Driver", "Insurance", "Maintenance", "Invoice"],
  capabilities: ["CreateVehicle", "CreateRental", "AssignDriver", "ScheduleMaintenance", "GenerateRentalInvoice"],
  workflows: ["Rental Onboarding", "Vehicle Maintenance", "Rental Closing"],
  policies: ["DriverLicenseRequired", "DepositRequired", "HighValueRentalApproval"],
  risks: ["Duplicar Invoice si ya existe en Finance", "Datos sensibles de conductores", "Integración futura con GPS"],
  notes: "Architect Mode generará diseños revisables antes del código.",
};

function sqlType(field: FlowlyStudioField | FlowlyCapabilityParameter) {
  switch (field.type) {
    case "number":
      return "numeric";
    case "boolean":
      return "boolean";
    case "date":
      return "date";
    case "datetime":
      return "timestamptz";
    case "currency":
      return "numeric(12,2)";
    case "json":
    case "ai":
    case "array":
      return "jsonb";
    default:
      return "text";
  }
}

function tsType(field: FlowlyStudioField | FlowlyCapabilityParameter) {
  switch (field.type) {
    case "number":
    case "currency":
      return "number";
    case "boolean":
      return "boolean";
    case "json":
    case "ai":
      return "Record<string, unknown>";
    case "array":
      return "unknown[]";
    default:
      return "string";
  }
}

function list(items: string[] | FlowlyStudioNamedItem[] | undefined) {
  if (!items?.length) return "- Pendiente";
  return items
    .map((item) => {
      if (typeof item === "string") return `- ${item}`;
      return `- ${item.name}${item.description ? `: ${item.description}` : ""}`;
    })
    .join("\n");
}

export function generateBusinessObjectArtifacts(definition: FlowlyBusinessObjectDefinition): FlowlyGeneratedArtifacts {
  const pascal = toPascalCase(definition.name);
  const slug = slugifyStudio(definition.slug || definition.name);
  const table = `flowly_${toSnakeCase(slug)}s`;
  const stateUnion = definition.states.length ? definition.states.map((state) => `"${state.name}"`).join(" | ") : '"draft" | "active" | "archived"';
  const fieldsSql = definition.fields.map((field) => `  ${toSnakeCase(field.name)} ${sqlType(field)}${field.required ? " not null" : ""}${field.unique ? " unique" : ""}`).join(",\n");
  const fieldsTs = definition.fields.map((field) => `  ${field.name}${field.required ? "" : "?"}: ${tsType(field)}${field.required ? "" : " | null"};`).join("\n");
  const sql = `-- Generated by Flowly Studio\ncreate table if not exists public.${table} (\n  id uuid primary key default gen_random_uuid(),\n  organization_id uuid not null,\n  status text not null default '${definition.states.find((state) => state.isInitial)?.name || definition.states[0]?.name || "draft"}',\n${fieldsSql ? `${fieldsSql},\n` : ""}  metadata jsonb not null default '{}'::jsonb,\n  created_at timestamptz not null default now(),\n  updated_at timestamptz not null default now()\n);\n\ncreate index if not exists ${table}_organization_id_idx on public.${table} (organization_id);\ncreate index if not exists ${table}_status_idx on public.${table} (status);\n\nalter table public.${table} enable row level security;\n\ncreate policy \"${table}_organization_isolation\" on public.${table}\n  for all using (true) with check (true);`;
  const typescript = `// Generated by Flowly Studio\nexport type ${pascal}Status = ${stateUnion};\n\nexport type ${pascal} = {\n  id: string;\n  organization_id: string;\n  status: ${pascal}Status;\n${fieldsTs}\n  metadata: Record<string, unknown>;\n  created_at: string;\n  updated_at: string;\n};\n\nexport type Create${pascal}Input = {\n${definition.fields.map((field) => `  ${field.name}${field.required ? "" : "?"}: ${tsType(field)}${field.required ? "" : " | null"};`).join("\n")}\n};`;
  const apiRoute = `// Generated by Flowly Studio\nimport { NextRequest, NextResponse } from "next/server";\nimport { supabaseAdmin } from "@/lib/supabaseAdmin";\n\nconst TABLE = "${table}";\n\nexport async function GET(request: NextRequest) {\n  const organizationId = request.nextUrl.searchParams.get("organizationId");\n  if (!organizationId) return NextResponse.json({ error: "organizationId is required" }, { status: 400 });\n  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("organization_id", organizationId).order("created_at", { ascending: false });\n  if (error) return NextResponse.json({ error: error.message }, { status: 500 });\n  return NextResponse.json({ items: data || [] });\n}`;
  const markdown = `# ${definition.name}\n\n${definition.description}\n\n## Domain\n\n${definition.domain}\n\n## Fields\n\n${definition.fields.map((field) => `- **${field.name}** (${field.type})${field.required ? " — required" : ""}: ${field.description || field.label}`).join("\n")}\n\n## States\n\n${definition.states.map((state) => `- ${state.name}${state.isInitial ? " (initial)" : ""}`).join("\n")}\n\n## Commands\n\n${list(definition.commands)}\n\n## Queries\n\n${list(definition.queries)}\n\n## Events\n\n${list(definition.events)}\n\n## Policies\n\n${list(definition.policies)}\n\n## Capabilities\n\n${list(definition.capabilities)}\n\n## Relationships\n\n${definition.relationships.map((relationship) => `- ${relationship.type} ${relationship.cardinality || ""} → ${relationship.target}: ${relationship.description || "Relación del dominio."}`).join("\n") || "- Sin relaciones definidas todavía."}`;
  const testPlan = `# ${pascal} Test Plan\n\n- should create ${definition.name} with valid input.\n- should reject invalid required fields.\n- should preserve organization isolation.\n- should emit ${definition.events[0]?.name || `${pascal}Created`} event.\n- should respect policies before state changes.\n- should expose contract-compatible queries.`;
  const sdk = `// Generated by Flowly Studio\nexport async function create${pascal}(input: Create${pascal}Input) {\n  const response = await fetch("/api/${slug}", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });\n  if (!response.ok) throw new Error("Failed to create ${definition.name}");\n  return response.json();\n}`;
  return { sql, typescript, apiRoute, markdown, testPlan, sdk };
}

export function generateCapabilityArtifacts(definition: FlowlyCapabilityDefinition): FlowlyGeneratedArtifacts {
  const pascal = toPascalCase(definition.name);
  const inputType = `${pascal}Input`;
  const outputType = `${pascal}Output`;
  const typescript = `// Generated by Flowly Studio\nexport type ${inputType} = {\n${definition.inputs.map((input) => `  ${input.name}${input.required ? "" : "?"}: ${tsType(input)}${input.required ? "" : " | null"};`).join("\n")}\n};\n\nexport type ${outputType} = {\n${definition.outputs.map((output) => `  ${output.name}${output.required ? "" : "?"}: ${tsType(output)}${output.required ? "" : " | null"};`).join("\n")}\n};\n\nexport const ${slugifyStudio(definition.name).replace(/-/g, "_").toUpperCase()}_CONTRACT = {\n  id: "${definition.slug}",\n  domain: "${definition.domain}",\n  usesAI: ${definition.usesAI},\n} as const;`;
  const sql = `-- Capability metadata generated by Flowly Studio\ninsert into public.flowly_studio_artifacts (kind, name, slug, domain, description, status, definition, generated_markdown)\nvalues ('capability', '${definition.name.replace(/'/g, "''")}', '${definition.slug}', '${definition.domain}', '${definition.description.replace(/'/g, "''")}', '${definition.status}', '${JSON.stringify(definition).replace(/'/g, "''")}'::jsonb, '# ${definition.name.replace(/'/g, "''")}')\non conflict (kind, slug) do update set definition = excluded.definition, updated_at = now();`;
  const markdown = `# ${definition.name}\n\n${definition.description}\n\n## Business Objects\n\n${list(definition.businessObjects)}\n\n## Input\n\n${definition.inputs.map((input) => `- **${input.name}** (${input.type})${input.required ? " — required" : ""}: ${input.description || ""}`).join("\n")}\n\n## Output\n\n${definition.outputs.map((output) => `- **${output.name}** (${output.type}): ${output.description || ""}`).join("\n")}\n\n## Commands\n\n${list(definition.commands)}\n\n## Queries\n\n${list(definition.queries)}\n\n## Policies\n\n${list(definition.policies)}\n\n## Events\n\n${list(definition.events)}\n\n## AI\n\n${definition.usesAI ? "Uses AI Runtime" : "No AI required"}`;
  return {
    sql,
    typescript,
    apiRoute: `// ${definition.name} should be exposed through Capability Runtime, not a direct route.`,
    markdown,
    testPlan: `# ${pascal} Capability Tests\n\n- should validate input contract.\n- should enforce policies.\n- should execute commands/queries through runtime.\n- should emit events: ${definition.events.map((event) => event.name).join(", ") || "none"}.\n- should publish observability metrics.`,
    sdk: `export async function ${slugifyStudio(definition.name).replace(/-([a-z])/g, (_, char) => char.toUpperCase())}(input: ${inputType}) {\n  return flowly.capabilities.execute("${definition.slug}", input);\n}`,
  };
}

export function generateWorkflowArtifacts(definition: FlowlyWorkflowDefinition): FlowlyGeneratedArtifacts {
  const pascal = toPascalCase(definition.name);
  const markdown = `# ${definition.name}\n\n${definition.description}\n\n## Trigger\n\n${definition.trigger}\n\n## Steps\n\n${definition.steps.map((step, index) => `${index + 1}. **${step.name}** (${step.type})${step.target ? ` → ${step.target}` : ""}: ${step.description || ""}`).join("\n")}\n\n## Policies\n\n${list(definition.policies)}\n\n## Events\n\n${list(definition.events)}`;
  return {
    sql: `-- Workflow definition generated by Flowly Studio\ninsert into public.flowly_studio_artifacts (kind, name, slug, domain, description, status, definition, generated_markdown) values ('workflow', '${definition.name.replace(/'/g, "''")}', '${definition.slug}', '${definition.domain}', '${definition.description.replace(/'/g, "''")}', '${definition.status}', '${JSON.stringify(definition).replace(/'/g, "''")}'::jsonb, '${markdown.replace(/'/g, "''")}') on conflict (kind, slug) do update set definition = excluded.definition, updated_at = now();`,
    typescript: `export const ${pascal}Workflow = ${JSON.stringify(definition, null, 2)} as const;`,
    apiRoute: "// Workflows are executed by Workflow Runtime.",
    markdown,
    testPlan: `# ${pascal} Workflow Tests\n\n- should start from trigger ${definition.trigger}.\n- should execute steps in order.\n- should respect approval/policy steps.\n- should emit workflow events.`,
    sdk: `flowly.workflows.start("${definition.slug}");`,
  };
}

export function generatePolicyArtifacts(definition: FlowlyPolicyDefinition): FlowlyGeneratedArtifacts {
  const pascal = toPascalCase(definition.name);
  const markdown = `# ${definition.name}\n\n${definition.description}\n\n## Scope\n\n${definition.scope}\n\n## Rules\n\n${definition.rules.map((rule) => `- **${rule.subject}** when \`${rule.condition}\` → ${rule.effect}: ${rule.description || ""}`).join("\n")}`;
  return {
    sql: `-- Policy definition generated by Flowly Studio\ninsert into public.flowly_studio_artifacts (kind, name, slug, domain, description, status, definition, generated_markdown) values ('policy', '${definition.name.replace(/'/g, "''")}', '${definition.slug}', '${definition.domain}', '${definition.description.replace(/'/g, "''")}', '${definition.status}', '${JSON.stringify(definition).replace(/'/g, "''")}'::jsonb, '${markdown.replace(/'/g, "''")}') on conflict (kind, slug) do update set definition = excluded.definition, updated_at = now();`,
    typescript: `export const ${pascal}Policy = ${JSON.stringify(definition, null, 2)} as const;`,
    apiRoute: "// Policies are evaluated by Governance / Authorization Engine.",
    markdown,
    testPlan: `# ${pascal} Policy Tests\n\n- should apply scope ${definition.scope}.\n- should evaluate all rules deterministically.\n- should produce explainable authorization output.`,
    sdk: `flowly.policies.evaluate("${definition.slug}", context);`,
  };
}

export function generateAppArtifacts(definition: FlowlyAppDefinition): FlowlyGeneratedArtifacts {
  const pascal = toPascalCase(definition.name);
  const markdown = `# ${definition.name}\n\n${definition.description}\n\n## Business Objects\n\n${list(definition.businessObjects)}\n\n## Capabilities\n\n${list(definition.capabilities)}\n\n## Navigation\n\n${list(definition.navigation)}\n\n## Widgets\n\n${list(definition.widgets)}`;
  return {
    sql: `-- App metadata generated by Flowly Studio\ninsert into public.flowly_studio_artifacts (kind, name, slug, domain, description, status, definition, generated_markdown) values ('app', '${definition.name.replace(/'/g, "''")}', '${definition.slug}', '${definition.domain}', '${definition.description.replace(/'/g, "''")}', '${definition.status}', '${JSON.stringify(definition).replace(/'/g, "''")}'::jsonb, '${markdown.replace(/'/g, "''")}') on conflict (kind, slug) do update set definition = excluded.definition, updated_at = now();`,
    typescript: `export const ${pascal}App = ${JSON.stringify(definition, null, 2)} as const;`,
    apiRoute: "// Apps consume Capabilities and Queries, they do not own API routes.",
    markdown,
    testPlan: `# ${pascal} App Tests\n\n- should render navigation.\n- should consume declared capabilities only.\n- should not contain business logic.\n- should respect permissions from runtime.`,
    sdk: `flowly.apps.open("${definition.slug}");`,
  };
}

export function generateArchitectArtifacts(definition: FlowlyArchitectBlueprint): FlowlyGeneratedArtifacts {
  const pascal = toPascalCase(definition.name);
  const markdown = `# ${definition.name}\n\n${definition.description}\n\n## Goal\n\n${definition.goal}\n\n## Proposed Business Objects\n\n${list(definition.businessObjects)}\n\n## Proposed Capabilities\n\n${list(definition.capabilities)}\n\n## Proposed Workflows\n\n${list(definition.workflows)}\n\n## Proposed Policies\n\n${list(definition.policies)}\n\n## Risks\n\n${list(definition.risks)}\n\n## Notes\n\n${definition.notes || "Pendiente de revisión."}`;
  return {
    sql: `-- Architect blueprint generated by Flowly Studio\ninsert into public.flowly_studio_artifacts (kind, name, slug, domain, description, status, definition, generated_markdown) values ('architect_blueprint', '${definition.name.replace(/'/g, "''")}', '${definition.slug}', '${definition.domain}', '${definition.description.replace(/'/g, "''")}', '${definition.status}', '${JSON.stringify(definition).replace(/'/g, "''")}'::jsonb, '${markdown.replace(/'/g, "''")}') on conflict (kind, slug) do update set definition = excluded.definition, updated_at = now();`,
    typescript: `export const ${pascal}Blueprint = ${JSON.stringify(definition, null, 2)} as const;`,
    apiRoute: "// Architect Mode produces reviewable designs before implementation.",
    markdown,
    testPlan: `# ${pascal} Architecture Review\n\n- validate reused objects before creating new ones.\n- check policy/security implications.\n- check duplicated capabilities.\n- approve before generation.`,
    sdk: `flowly.architect.review("${definition.slug}");`,
  };
}

export function getDefinitionKind(definition: Partial<FlowlyStudioDefinition>): FlowlyStudioArtifactKind {
  if (definition.kind) return definition.kind;
  if ("fields" in definition) return "business_object";
  return "business_object";
}

export function generateStudioArtifacts(definition: FlowlyStudioDefinition): FlowlyGeneratedArtifacts {
  switch (getDefinitionKind(definition)) {
    case "capability":
      return generateCapabilityArtifacts(definition as FlowlyCapabilityDefinition);
    case "workflow":
      return generateWorkflowArtifacts(definition as FlowlyWorkflowDefinition);
    case "policy":
      return generatePolicyArtifacts(definition as FlowlyPolicyDefinition);
    case "app":
      return generateAppArtifacts(definition as FlowlyAppDefinition);
    case "architect_blueprint":
      return generateArchitectArtifacts(definition as FlowlyArchitectBlueprint);
    default:
      return generateBusinessObjectArtifacts(definition as FlowlyBusinessObjectDefinition);
  }
}

export function normalizeStudioDefinition(body: any): FlowlyStudioDefinition {
  const kind = getDefinitionKind(body);
  const name = String(body.name || "Flowly Artifact").trim();
  const base = {
    ...body,
    kind,
    name,
    slug: slugifyStudio(body.slug || name),
    domain: String(body.domain || "custom").trim().toLowerCase(),
    description: String(body.description || "Diseñado desde Flowly Studio.").trim(),
    status: (body.status || "draft") as FlowlyStudioStatus,
  };
  return base as FlowlyStudioDefinition;
}
