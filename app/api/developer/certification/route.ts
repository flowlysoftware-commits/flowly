import { NextResponse } from "next/server";
import { runFlowCertificationSuite } from "@/lib/flowlyCertificationEngine";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(runFlowCertificationSuite());
}
