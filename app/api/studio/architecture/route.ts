import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { analyzeStudioArchitecture, type FlowlyStudioStoredArtifact } from "@/lib/flowlyStudioHeart";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET() {
  if (!dbReady()) {
    return NextResponse.json({
      analysis: analyzeStudioArchitecture([]),
      message: "Supabase no está configurado. Ejecuta supabase/flowly_studio.sql.",
    });
  }

  const { data, error } = await supabaseAdmin
    .from("flowly_studio_artifacts")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ analysis: analyzeStudioArchitecture((data || []) as FlowlyStudioStoredArtifact[]) });
}
