import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateStudioArtifacts, normalizeStudioDefinition, type FlowlyStudioArtifactKind } from "@/lib/flowlyStudio";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ artifacts: [] });
  const kind = request.nextUrl.searchParams.get("kind") as FlowlyStudioArtifactKind | null;
  const search = request.nextUrl.searchParams.get("q") || "";
  let query = supabaseAdmin.from("flowly_studio_artifacts").select("*").order("updated_at", { ascending: false });
  if (kind) query = query.eq("kind", kind);
  if (search) query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,domain.ilike.%${search}%`);
  const { data, error } = await query.limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ artifacts: data || [] });
}

export async function POST(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado. Ejecuta supabase/flowly_studio.sql." }, { status: 503 });
  const definition = normalizeStudioDefinition(await request.json());
  const artifacts = generateStudioArtifacts(definition);
  const payload = {
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
  const { data, error } = await supabaseAdmin.from("flowly_studio_artifacts").upsert(payload, { onConflict: "kind,slug" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ artifact: data, artifacts });
}

export async function DELETE(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  const kind = request.nextUrl.searchParams.get("kind");
  const slug = request.nextUrl.searchParams.get("slug");
  if (!kind || !slug) return NextResponse.json({ error: "kind y slug son obligatorios." }, { status: 400 });
  const { error } = await supabaseAdmin.from("flowly_studio_artifacts").delete().eq("kind", kind).eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
