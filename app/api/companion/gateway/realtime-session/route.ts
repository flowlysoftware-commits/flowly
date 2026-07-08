import { NextRequest, NextResponse } from "next/server";
import { createOpenAIRealtimeSession } from "@/lib/flowlyCompanionGateway";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await createOpenAIRealtimeSession({
      voice: typeof body.voice === "string" ? body.voice : undefined,
      instructions: typeof body.instructions === "string" ? body.instructions : undefined,
    });

    const status = result.ok ? 200 : 500;
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("Flow Companion Realtime session error", error);
    return NextResponse.json({ ok: false, error: "No se pudo crear la sesión Realtime." }, { status: 500 });
  }
}
