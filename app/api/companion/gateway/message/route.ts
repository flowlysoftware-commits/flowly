import { NextRequest } from "next/server";
import { companionJson, companionOptions } from "@/lib/flowlyCompanionCors";
import { createGatewayMessageResponse } from "@/lib/flowlyCompanionGateway";
import type { FlowlyBrainMessage } from "@/lib/flowlyBrain";

export const runtime = "nodejs";

export async function OPTIONS() {
  return companionOptions();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return companionJson({ ok: false, error: "Falta el mensaje." }, { status: 400 });
    }

    const conversation = Array.isArray(body.conversation)
      ? (body.conversation as FlowlyBrainMessage[])
      : [];

    const response = await createGatewayMessageResponse({
      message,
      pathname: typeof body.pathname === "string" ? body.pathname : "/dashboard",
      conversation,
      companionId: typeof body.companionId === "string" ? body.companionId : undefined,
      userId: typeof body.userId === "string" ? body.userId : undefined,
      sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
      extraContext: body.extraContext && typeof body.extraContext === "object" ? body.extraContext : undefined,
    });

    return companionJson(response);
  } catch (error) {
    console.error("Flow Companion Gateway message error", error);
    return companionJson({ ok: false, error: "No se pudo procesar el mensaje del Companion." }, { status: 500 });
  }
}
