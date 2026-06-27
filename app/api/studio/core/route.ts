import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildStudioCoreSnapshot } from "@/lib/flowlyStudioCore";
import type { FlowlyStudioStoredArtifact } from "@/lib/flowlyStudioHeart";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET() {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado. Ejecuta supabase/flowly_studio.sql." }, { status: 503 });
  const { data, error } = await supabaseAdmin.from("flowly_studio_artifacts").select("*").order("kind", { ascending: true }).order("name", { ascending: true }).limit(1000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const snapshot = buildStudioCoreSnapshot((data || []) as FlowlyStudioStoredArtifact[]);
  await supabaseAdmin.from("flowly_studio_core_snapshots").insert({ snapshot, architecture_score: snapshot.registry.resumen.puntuacionArquitectonica, risk_level: snapshot.registry.resumen.riesgo }).select("id").maybeSingle();
  return NextResponse.json({ snapshot });
}
