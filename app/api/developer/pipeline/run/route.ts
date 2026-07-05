import { NextRequest, NextResponse } from "next/server";
import { runDeveloperPipeline } from "@/lib/flowlyDeveloperPipeline";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { logDeveloperConversationEvent } from "@/lib/flowlyDeveloperIntelligenceEngine";
import { getLatestDeveloperSessionPlan, getRecentDeveloperSessionPlans, updateLatestDeveloperSessionPlanStatus } from "@/lib/flowlyDeveloperSessionEngine";
import { getActiveDeveloperMission, rememberDeveloperMission, updateDeveloperMission } from "@/lib/flowlyMissionEngine";
import type { DeveloperPipelinePlan } from "@/lib/flowlyDeveloperPipeline";
import { buildApprovedPlanMismatchReply, resolveApprovedPlanForTurn } from "@/lib/flowlyApprovedPlanResolver";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const instruction = String(body.instruction || "").trim();
    const approved = Boolean(body.approved);
    const approvedPlanFromBody = body.approvedPlan && typeof body.approvedPlan === "object" ? (body.approvedPlan as DeveloperPipelinePlan) : undefined;
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : undefined;
    if (!instruction) return NextResponse.json({ ok: false, error: "Falta la instrucción para ejecutar Developer Pipeline." }, { status: 400 });
    if (!approved) return NextResponse.json({ ok: false, error: "Necesito aprobación explícita antes de crear rama y Pull Request." }, { status: 400 });

    const latestSessionPlan = approvedPlanFromBody ? null : await getLatestDeveloperSessionPlan(conversationId);
    const recentPlans = approvedPlanFromBody ? [] : await getRecentDeveloperSessionPlans(conversationId);
    const activeMission = await getActiveDeveloperMission(conversationId);
    const planResolution = resolveApprovedPlanForTurn({
      instruction,
      mission: activeMission,
      rememberedPlan: latestSessionPlan,
      recentPlans,
      bodyPlan: approvedPlanFromBody,
    });
    const approvedPlan = planResolution.safePlan as DeveloperPipelinePlan | undefined;
    const executionInstruction = approvedPlan?.instruction || instruction;

    if (planResolution.shouldBlockExecution || planResolution.hasMismatch) {
      return NextResponse.json(
        {
          ok: false,
          error: buildApprovedPlanMismatchReply(planResolution),
          planResolution,
        },
        { status: 409 }
      );
    }

    if (!approvedPlan) {
      return NextResponse.json(
        { ok: false, error: "No encuentro un plan aprobado/congelado para esta sesión. Pide primero una propuesta y después pulsa aprobar." },
        { status: 400 }
      );
    }

    await updateLatestDeveloperSessionPlanStatus(conversationId, "approved", { approvedAt: new Date().toISOString() });
    await rememberDeveloperMission({
      conversationId,
      objective: executionInstruction,
      status: "approved",
      currentStep: "approval_received",
      currentPlan: approvedPlan,
      approvedPlan,
      details: { approvedAt: new Date().toISOString() },
    });

    await logDeveloperConversationEvent({
      conversationId,
      role: "system",
      content: "Aprobación recibida. Developer ejecuta el plan congelado en una rama segura.",
      intent: "approval",
      details: { instruction: executionInstruction, approvedPlanSummary: approvedPlan?.summary || null },
    });

    const result = await runDeveloperPipeline(executionInstruction, approved, approvedPlan);
    await updateLatestDeveloperSessionPlanStatus(conversationId, result.error ? "error" : result.pullRequestUrl ? "completed" : "running", result);
    await updateDeveloperMission({
      conversationId,
      status: result.error ? "failed" : result.pullRequestUrl ? "executing" : "failed",
      currentStep: result.error ? "execution_failed" : result.pullRequestUrl ? "pull_request_created_waiting_checks" : "execution_finished_without_pr",
      branch: result.branch || null,
      pullRequestUrl: result.pullRequestUrl || null,
      pullRequestNumber: result.pullRequestNumber || null,
      lastError: result.error || null,
      details: result,
    });

    try {
      await supabaseAdmin.from("flowly_developer_pipeline_runs").insert({
        instruction: executionInstruction,
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
