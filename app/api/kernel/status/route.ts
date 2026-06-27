import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildKernelHealthSummary, buildKernelRegistryFromArtifacts } from "@/lib/flowlyKernel";
import type { FlowlyStudioStoredArtifact } from "@/lib/flowlyStudioHeart";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET() {
  if (!dbReady()) {
    const registry = buildKernelRegistryFromArtifacts([]);
    return NextResponse.json({ kernel: buildKernelHealthSummary(registry), registry, dbReady: false });
  }

  const { data, error } = await supabaseAdmin.from("flowly_studio_artifacts").select("*").limit(1000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const registry = buildKernelRegistryFromArtifacts((data || []) as FlowlyStudioStoredArtifact[]);
  return NextResponse.json({ kernel: buildKernelHealthSummary(registry), registry, dbReady: true });
}
