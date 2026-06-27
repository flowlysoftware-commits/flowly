import { NextRequest, NextResponse } from "next/server";
import { runFlowlyBrain, type FlowlyBrainMessage } from "@/lib/flowlyBrain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = String(body.message || "").trim();
    const pathname = String(body.pathname || "/os/brain");
    const conversation = Array.isArray(body.conversation) ? (body.conversation as FlowlyBrainMessage[]) : [];

    if (!message) {
      return NextResponse.json({ error: "Falta el mensaje." }, { status: 400 });
    }

    const result = await runFlowlyBrain({ message, pathname, conversation });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Flowly Brain ask error", error);
    return NextResponse.json({ error: "No se pudo ejecutar Flowly Brain." }, { status: 500 });
  }
}
