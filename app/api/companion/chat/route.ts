import { NextRequest, NextResponse } from "next/server";
import { runFlowlyBrain, type FlowlyBrainMessage } from "@/lib/flowlyBrain";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { detectFlowlyCompanionActions } from "@/lib/flowlyCompanionActions";
import { requireCompanionAuth } from "../_auth";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireCompanionAuth(request);
    if (!auth) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const message = String(body.message || "").trim();
    const pathname = String(body.pathname || "/dashboard");
    const conversation = Array.isArray(body.conversation) ? (body.conversation as FlowlyBrainMessage[]) : [];
    const extraContext = body.extraContext && typeof body.extraContext === "object" ? body.extraContext as Record<string, unknown> : {};

    if (!message) {
      return NextResponse.json({ error: "Falta el mensaje." }, { status: 400 });
    }

    const result = await runFlowlyBrain({
      message,
      pathname,
      conversation: conversation.slice(-20),
      extraContext: { ...extraContext, authenticatedUserId: auth.userId, authenticatedBusinessId: auth.businessId },
    });
    const actions = detectFlowlyCompanionActions(message);

    // Memoria ligera del Companion: no bloquea la respuesta si Supabase no tiene aún la tabla.
    try {
      await supabaseAdmin.from("flowly_companion_conversation_memory").insert({
        user_id: auth.userId,
        business_id: auth.businessId,
        mode: result.mode,
        source: typeof extraContext.source === "string" ? extraContext.source : "text",
        message,
        answer: result.answer,
        context: { pathname, intent: result.intent, tools: result.tools?.map((tool) => tool.id), extraContext },
      });
    } catch {
      // La memoria nunca debe romper el chat.
    }

    return NextResponse.json({ ...result, actions });
  } catch (error) {
    console.error("Flowly Companion Brain error", error);
    return NextResponse.json({ error: "No se pudo generar la respuesta del Brain." }, { status: 500 });
  }
}
