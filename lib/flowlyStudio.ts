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
  description?: string;
};

export type FlowlyBusinessObjectDefinition = {
  id?: string;
  name: string;
  slug: string;
  domain: string;
  description: string;
  status: "draft" | "review" | "stable";
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

export type FlowlyGeneratedBusinessObjectArtifacts = {
  sql: string;
  typescript: string;
  apiRoute: string;
  markdown: string;
  testPlan: string;
  sdk: string;
};

export function slugifyStudio(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "business-object";
}

export function toPascalCase(value: string) {
  return slugifyStudio(value)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("") || "BusinessObject";
}

export function toSnakeCase(value: string) {
  return slugifyStudio(value).replace(/-/g, "_");
}

export function createStudioId(prefix = "item") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export const initialBusinessObjectDefinition: FlowlyBusinessObjectDefinition = {
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
  relationships: [{ id: "rel_company", target: "Company", type: "reference", description: "Cliente asociado a una empresa." }],
  notes: "Primer ejemplo generado desde Flowly Studio.",
};

function sqlType(field: FlowlyStudioField) {
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
      return "jsonb";
    default:
      return "text";
  }
}

function tsType(field: FlowlyStudioField) {
  switch (field.type) {
    case "number":
    case "currency":
      return "number";
    case "boolean":
      return "boolean";
    case "json":
    case "ai":
      return "Record<string, unknown>";
    default:
      return "string";
  }
}

export function generateBusinessObjectArtifacts(definition: FlowlyBusinessObjectDefinition): FlowlyGeneratedBusinessObjectArtifacts {
  const pascal = toPascalCase(definition.name);
  const slug = slugifyStudio(definition.slug || definition.name);
  const table = `flowly_${toSnakeCase(slug)}s`;
  const stateUnion = definition.states.length ? definition.states.map((state) => `"${state.name}"`).join(" | ") : '"draft" | "active" | "archived"';
  const fieldsSql = definition.fields
    .map((field) => `  ${toSnakeCase(field.name)} ${sqlType(field)}${field.required ? " not null" : ""}${field.unique ? " unique" : ""}`)
    .join(",\n");
  const fieldsTs = definition.fields
    .map((field) => `  ${field.name}${field.required ? "" : "?"}: ${tsType(field)}${field.required ? "" : " | null"};`)
    .join("\n");
  const events = definition.events.map((event) => `- ${event.name}: ${event.description || "Evento del dominio."}`).join("\n") || "- PendingEvents";
  const commands = definition.commands.map((command) => `- ${command.name}: ${command.description || "Command del dominio."}`).join("\n") || "- Create" + pascal;
  const queries = definition.queries.map((query) => `- ${query.name}: ${query.description || "Query del dominio."}`).join("\n") || "- Get" + pascal;
  const policies = definition.policies.map((policy) => `- ${policy.name}: ${policy.description || "Policy aplicable."}`).join("\n") || "- OrganizationIsolation";

  const sql = `-- Generated by Flowly Studio\ncreate table if not exists public.${table} (\n  id uuid primary key default gen_random_uuid(),\n  organization_id uuid not null,\n  status text not null default '${definition.states.find((state) => state.isInitial)?.name || definition.states[0]?.name || "draft"}',\n${fieldsSql ? `${fieldsSql},\n` : ""}  metadata jsonb not null default '{}'::jsonb,\n  created_at timestamptz not null default now(),\n  updated_at timestamptz not null default now()\n);\n\ncreate index if not exists ${table}_organization_id_idx on public.${table} (organization_id);\ncreate index if not exists ${table}_status_idx on public.${table} (status);\n\nalter table public.${table} enable row level security;\n\n-- Ajusta esta policy si tu tabla de organizaciones usa otro modelo de pertenencia.\ncreate policy \"${table}_organization_isolation\" on public.${table}\n  for all using (true) with check (true);`;

  const typescript = `// Generated by Flowly Studio\nexport type ${pascal}Status = ${stateUnion};\n\nexport type ${pascal} = {\n  id: string;\n  organization_id: string;\n  status: ${pascal}Status;\n${fieldsTs}\n  metadata: Record<string, unknown>;\n  created_at: string;\n  updated_at: string;\n};\n\nexport type Create${pascal}Input = {\n${definition.fields.map((field) => `  ${field.name}${field.required ? "" : "?"}: ${tsType(field)}${field.required ? "" : " | null"};`).join("\n")}\n};`;

  const apiRoute = `// Generated by Flowly Studio\nimport { NextRequest, NextResponse } from "next/server";\nimport { supabaseAdmin } from "@/lib/supabaseAdmin";\n\nconst TABLE = "${table}";\n\nexport async function GET(request: NextRequest) {\n  const organizationId = request.nextUrl.searchParams.get("organizationId");\n  if (!organizationId) return NextResponse.json({ error: "organizationId is required" }, { status: 400 });\n  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("organization_id", organizationId).order("created_at", { ascending: false });\n  if (error) return NextResponse.json({ error: error.message }, { status: 500 });\n  return NextResponse.json({ items: data || [] });\n}\n\nexport async function POST(request: NextRequest) {\n  const body = await request.json();\n  const { data, error } = await supabaseAdmin.from(TABLE).insert(body).select("*").single();\n  if (error) return NextResponse.json({ error: error.message }, { status: 500 });\n  return NextResponse.json({ item: data });\n}`;

  const markdown = `# ${definition.name}\n\n${definition.description}\n\n## Domain\n\n${definition.domain}\n\n## Fields\n\n${definition.fields.map((field) => `- **${field.name}** (${field.type})${field.required ? " — required" : ""}: ${field.description || field.label}`).join("\n")}\n\n## States\n\n${definition.states.map((state) => `- ${state.name}${state.isInitial ? " (initial)" : ""}`).join("\n")}\n\n## Commands\n\n${commands}\n\n## Queries\n\n${queries}\n\n## Events\n\n${events}\n\n## Policies\n\n${policies}\n\n## Relationships\n\n${definition.relationships.map((relationship) => `- ${relationship.type} → ${relationship.target}: ${relationship.description || "Relación del dominio."}`).join("\n") || "- Sin relaciones definidas todavía."}`;

  const testPlan = `# ${pascal} Test Plan\n\n- should create ${definition.name} with valid input.\n- should reject invalid required fields.\n- should preserve organization isolation.\n- should emit ${definition.events[0]?.name || `${pascal}Created`} event.\n- should respect policies before state changes.\n- should expose contract-compatible queries.`;

  const sdk = `// Generated by Flowly Studio\nexport async function create${pascal}(input: Create${pascal}Input) {\n  const response = await fetch("/api/${slug}", {\n    method: "POST",\n    headers: { "content-type": "application/json" },\n    body: JSON.stringify(input),\n  });\n  if (!response.ok) throw new Error("Failed to create ${definition.name}");\n  return response.json();\n}`;

  return { sql, typescript, apiRoute, markdown, testPlan, sdk };
}
