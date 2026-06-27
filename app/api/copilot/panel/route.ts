import { NextRequest, NextResponse } from "next/server";
import { analyzeCopilotRequest } from "@/lib/flowlyPanelCopilot";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const message = String(body.message || "");
  const result = analyzeCopilotRequest(message);
  return NextResponse.json({ result });
}
