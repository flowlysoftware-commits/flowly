import { NextResponse } from "next/server";
import { getDeveloperPipelineStatus } from "@/lib/flowlyDeveloperPipeline";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getDeveloperPipelineStatus());
}
