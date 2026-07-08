import { NextRequest, NextResponse } from "next/server";
import { createGatewayEventResponse, type FlowCompanionGatewayEvent } from "@/lib/flowlyCompanionGateway";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const type = typeof body.type === "string" ? body.type : "session.started";

    const event: FlowCompanionGatewayEvent = {
      type: type as FlowCompanionGatewayEvent["type"],
      companionId: typeof body.companionId === "string" ? body.companionId : undefined,
      userId: typeof body.userId === "string" ? body.userId : undefined,
      sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
      pathname: typeof body.pathname === "string" ? body.pathname : undefined,
      text: typeof body.text === "string" ? body.text : undefined,
      x: typeof body.x === "number" ? body.x : undefined,
      y: typeof body.y === "number" ? body.y : undefined,
      payload: body.payload && typeof body.payload === "object" ? body.payload : undefined,
    };

    return NextResponse.json(createGatewayEventResponse(event));
  } catch (error) {
    console.error("Flow Companion Gateway event error", error);
    return NextResponse.json({ ok: false, error: "No se pudo procesar el evento del Companion." }, { status: 500 });
  }
}
