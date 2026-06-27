import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildRefactorPlan } from "@/lib/flowlyStudioCore";
import type { FlowlyStudioStoredArtifact } from "@/lib/flowlyStudioHeart";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function POST(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  const body = await request.json();
  const from = String(body.from || "").trim();
  const to = String(body.to || "").trim();
  if (!from || !to) return NextResponse.json({ error: "Indica el nombre actual y el nuevo nombre." }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("flowly_studio_artifacts").select("*").limit(1000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const plan = buildRefactorPlan((data || []) as FlowlyStudioStoredArtifact[], from, to);
  await supabaseAdmin.from("flowly_studio_refactor_plans").insert({ from_name: from, to_name: to, plan, risk_level: plan.riesgo });
  return NextResponse.json({ plan });
}
