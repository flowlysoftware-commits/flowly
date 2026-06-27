import { NextRequest, NextResponse } from "next/server";
import { runFlowlyAIEngine, type FlowlyAIMessage } from "@/lib/flowlyAIEngine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = String(body.message || "").trim();
    const pathname = String(body.pathname || "/dashboard");
    const conversation = Array.isArray(body.conversation) ? (body.conversation as FlowlyAIMessage[]) : [];

    if (!message) {
      return NextResponse.json({ error: "Falta el mensaje." }, { status: 400 });
    }

    const result = await runFlowlyAIEngine({ message, pathname, conversation });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Flowly Companion Chat error", error);
    return NextResponse.json({ error: "No se pudo generar la respuesta del Companion." }, { status: 500 });
  }
}
