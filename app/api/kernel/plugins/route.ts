import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { slugifyStudio } from "@/lib/flowlyStudio";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET() {
  if (!dbReady()) return NextResponse.json({ plugins: [], dbReady: false });
  const { data, error } = await supabaseAdmin.from("flowly_plugin_registry").select("*").order("updated_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plugins: data || [], dbReady: true });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = String(body.name || body.manifest?.name || "Flowly Plugin");
  const slug = String(body.slug || body.manifest?.slug || slugifyStudio(name));
  const manifest = body.manifest && typeof body.manifest === "object" ? body.manifest : { name, slug, capabilities: [], permissions: [] };
  const plugin = { name, slug, version: String(body.version || body.manifest?.version || "1.0.0"), status: "installed", manifest };
  if (!dbReady()) return NextResponse.json({ plugin, dbReady: false });
  const { data, error } = await supabaseAdmin.from("flowly_plugin_registry").upsert(plugin, { onConflict: "slug" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plugin: data, dbReady: true });
}
