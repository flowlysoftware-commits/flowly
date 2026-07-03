import { NextRequest, NextResponse } from "next/server";
import { runDeveloperPipeline } from "@/lib/flowlyDeveloperPipeline";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { logDeveloperConversationEvent } from "@/lib/flowlyDeveloperIntelligenceEngine";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const instruction = String(body.instruction || "").trim();
    const approved = Boolean(body.approved);
    const approvedPlan = body.approvedPlan && typeof body.approvedPlan === "object" ? body.approvedPlan : undefined;
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : undefined;
    if (!instruction) return NextResponse.json({ ok: false, error: "Falta la instrucción para ejecutar Developer Pipeline." }, { status: 400 });
    if (!approved) return NextResponse.json({ ok: false, error: "Necesito aprobación explícita antes de crear rama y Pull Request." }, { status: 400 });

    await logDeveloperConversationEvent({
      conversationId,
      role: "system",
      content: "Aprobación recibida. Developer ejecuta el plan congelado en una rama segura.",
      intent: "approval",
      details: { instruction, approvedPlanSummary: approvedPlan?.summary || null },
    });

    const result = await runDeveloperPipeline(instruction, approved, approvedPlan);

    try {
      await supabaseAdmin.from("flowly_developer_pipeline_runs").insert({
        instruction,
        phase: "run",
        status: result.status || (result.error ? "error" : "created"),
        risk: result.risk,
        pull_request_url: result.pullRequestUrl || null,
        branch: result.branch || null,
        details: result,
      });
    } catch {
      // El log no debe bloquear el PR.
    }

    await logDeveloperConversationEvent({
      conversationId,
      role: "assistant",
      content: result.error ? `No pude terminar la ejecución: ${result.error}` : result.pullRequestUrl ? `Pull Request creado: ${result.pullRequestUrl}` : "Ejecución terminada sin URL de Pull Request.",
      intent: result.error ? "correction" : "approval",
      details: { branch: result.branch, pullRequestUrl: result.pullRequestUrl, pullRequestNumber: result.pullRequestNumber, qaStatus: result.qaStatus },
    });

    return NextResponse.json(result, { status: result.error ? 400 : 200 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
