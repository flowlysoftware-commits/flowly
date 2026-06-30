import { NextRequest, NextResponse } from "next/server";
import { planDeveloperPipeline } from "@/lib/flowlyDeveloperPipeline";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { decideDeveloperConversation } from "@/lib/flowlyDeveloperConversationEngine";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const instruction = String(body.instruction || "").trim();
    if (!instruction) return NextResponse.json({ ok: false, error: "Falta la instrucción para Developer Pipeline." }, { status: 400 });

    const conversation = decideDeveloperConversation({
      instruction,
      currentPlan: body.currentPlan && typeof body.currentPlan === "object" ? body.currentPlan : null,
      history: Array.isArray(body.history) ? body.history : [],
    });

    if (conversation.conversationOnly) {
      return NextResponse.json({
        ok: true,
        conversationOnly: true,
        conversationIntent: conversation.intent,
        shouldRun: conversation.shouldRun || false,
        conversationReply: conversation.reply || "Sigo en la misma sesión. Dime cómo quieres ajustar el plan.",
      });
    }

    const result = await planDeveloperPipeline(conversation.mergedInstruction || instruction);

    try {
      await supabaseAdmin.from("flowly_developer_pipeline_runs").insert({
        instruction,
        phase: "plan",
        status: result.pipelineReady ? "ready" : "needs_review",
        risk: result.risk,
        pull_request_url: null,
        branch: null,
        details: result,
      });
    } catch {
      // El log no debe bloquear el plan.
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
