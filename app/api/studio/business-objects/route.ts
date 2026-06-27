import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateBusinessObjectArtifacts, slugifyStudio, type FlowlyBusinessObjectDefinition } from "@/lib/flowlyStudio";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function normalizeDefinition(body: any): FlowlyBusinessObjectDefinition {
  const name = String(body.name || "Business Object").trim();
  const slug = slugifyStudio(body.slug || name);
  return {
    id: body.id,
    name,
    slug,
    domain: String(body.domain || "custom").trim().toLowerCase(),
    description: String(body.description || "Business Object diseñado desde Flowly Studio.").trim(),
    status: body.status || "draft",
    fields: Array.isArray(body.fields) ? body.fields : [],
    states: Array.isArray(body.states) ? body.states : [],
    commands: Array.isArray(body.commands) ? body.commands : [],
    queries: Array.isArray(body.queries) ? body.queries : [],
    events: Array.isArray(body.events) ? body.events : [],
    policies: Array.isArray(body.policies) ? body.policies : [],
    capabilities: Array.isArray(body.capabilities) ? body.capabilities : [],
    relationships: Array.isArray(body.relationships) ? body.relationships : [],
    notes: body.notes || "",
  };
}

export async function GET(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ businessObjects: [] });
  const search = request.nextUrl.searchParams.get("q") || "";
  let query = supabaseAdmin.from("flowly_studio_business_objects").select("*").order("updated_at", { ascending: false });
  if (search) query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,domain.ilike.%${search}%`);
  const { data, error } = await query.limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ businessObjects: data || [] });
}

export async function POST(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado. Ejecuta supabase/flowly_studio.sql y revisa las variables de entorno." }, { status: 503 });
  const body = await request.json();
  const definition = normalizeDefinition(body);
  const artifacts = generateBusinessObjectArtifacts(definition);
  const payload = {
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
  const { data, error } = await supabaseAdmin
    .from("flowly_studio_business_objects")
    .upsert(payload, { onConflict: "slug" })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ businessObject: data, artifacts });
}

export async function DELETE(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug es obligatorio." }, { status: 400 });
  const { error } = await supabaseAdmin.from("flowly_studio_business_objects").delete().eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
