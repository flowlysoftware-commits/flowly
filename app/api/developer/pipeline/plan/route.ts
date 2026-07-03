import { NextRequest, NextResponse } from "next/server";
import { planDeveloperPipeline } from "@/lib/flowlyDeveloperPipeline";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { decideDeveloperConversation } from "@/lib/flowlyDeveloperConversationEngine";
import { logDeveloperConversationEvent, thinkWithDeveloperIntelligence } from "@/lib/flowlyDeveloperIntelligenceEngine";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const instruction = String(body.instruction || "").trim();
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : undefined;
    if (!instruction) return NextResponse.json({ ok: false, error: "Falta la instrucción para Developer Pipeline." }, { status: 400 });

    const history = Array.isArray(body.history) ? body.history : [];
    const currentPlan = body.currentPlan && typeof body.currentPlan === "object" ? body.currentPlan : null;

    await logDeveloperConversationEvent({
      conversationId,
      role: "user",
      content: instruction,
      details: { source: "developer_page" },
    });

    const intelligence = await thinkWithDeveloperIntelligence({
      instruction,
      conversationId,
      currentPlan,
      history,
    });

    if (!intelligence.shouldPlan) {
      await logDeveloperConversationEvent({
        conversationId,
        role: "assistant",
        content: intelligence.directReply,
        intent: intelligence.intent,
        details: { intelligence },
      });

      return NextResponse.json({
        ok: true,
        conversationOnly: true,
        conversationIntent: intelligence.intent,
        shouldRun: intelligence.intent === "approval",
        conversationReply: intelligence.directReply,
        intelligence,
      });
    }

    const conversation = decideDeveloperConversation({
      instruction: intelligence.refinedInstruction || instruction,
      currentPlan,
      history,
    });

    if (conversation.conversationOnly && intelligence.intent !== "new_task" && intelligence.intent !== "refinement") {
      const reply = intelligence.directReply || conversation.reply || "Sigo en la misma sesión. Dime cómo quieres ajustar el plan.";
      await logDeveloperConversationEvent({ conversationId, role: "assistant", content: reply, intent: intelligence.intent, details: { intelligence, conversation } });
      return NextResponse.json({
        ok: true,
        conversationOnly: true,
        conversationIntent: conversation.intent,
        shouldRun: conversation.shouldRun || false,
        conversationReply: reply,
        intelligence,
      });
    }

    const mergedInstruction = conversation.mergedInstruction || intelligence.refinedInstruction || instruction;
    const result = await planDeveloperPipeline(mergedInstruction, { intelligence });

    try {
      await supabaseAdmin.from("flowly_developer_pipeline_runs").insert({
        instruction,
        phase: "plan",
        status: result.pipelineReady ? "ready" : "needs_review",
        risk: result.risk,
        pull_request_url: null,
        branch: null,
        details: { ...result, conversationId, intelligence },
      });
    } catch {
      // El log no debe bloquear el plan.
    }

    await logDeveloperConversationEvent({
      conversationId,
      role: "assistant",
      content: result.conversationReply,
      intent: intelligence.intent,
      details: { planSummary: result.summary, risk: result.risk, proposedFiles: result.proposedFiles?.map((file) => file.path), intelligence },
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
