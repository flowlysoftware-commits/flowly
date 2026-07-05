import { NextRequest, NextResponse } from "next/server";
import { planDeveloperPipeline } from "@/lib/flowlyDeveloperPipeline";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { decideDeveloperConversation } from "@/lib/flowlyDeveloperConversationEngine";
import { logDeveloperConversationEvent, thinkWithDeveloperIntelligence } from "@/lib/flowlyDeveloperIntelligenceEngine";
import { getLatestDeveloperSessionPlan, getRecentDeveloperSessionMessages, getRecentDeveloperSessionPlans, rememberDeveloperSessionPlan } from "@/lib/flowlyDeveloperSessionEngine";
import { orchestrateFlowRequest } from "@/lib/flowlyOrchestrator";
import { buildMissionStatusReply, getActiveDeveloperMission, interpretDeveloperMissionInstruction, rememberDeveloperMission, updateDeveloperMission } from "@/lib/flowlyMissionEngine";
import { fixDeveloperPipelinePullRequest } from "@/lib/flowlyDeveloperPipeline";
import { isEvidenceCheckInstruction, runFlowlyEvidenceCheck } from "@/lib/flowlyEvidenceCheck";
import { analyzeIntentTransition, mustTreatAsPlanningTransition } from "@/lib/flowlyIntentTransitionGuard";
import { analyzeMissionRelevance, buildIndependentArchitectureCritiqueReply, isIndependentArchitectureCritiqueInstruction } from "@/lib/flowlyMissionRelevanceFilter";
import { analyzeTurnIsolation } from "@/lib/flowlyTurnIsolationGuard";
import { analyzeGeneralConversationMode, buildGeneralConversationReply } from "@/lib/flowlyGeneralConversationMode";
import { buildApprovedPlanMismatchReply, resolveApprovedPlanForTurn } from "@/lib/flowlyApprovedPlanResolver";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const instruction = String(body.instruction || "").trim();
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : undefined;
    if (!instruction) return NextResponse.json({ ok: false, error: "Falta la instrucción para Developer Pipeline." }, { status: 400 });

    const clientHistory = Array.isArray(body.history) ? body.history : [];
    const rememberedHistory = await getRecentDeveloperSessionMessages(conversationId);
    const history = [
      ...rememberedHistory.map((item) => ({ role: item.role, text: item.content })),
      ...clientHistory,
    ].slice(-24);
    const rememberedPlan = await getLatestDeveloperSessionPlan(conversationId);
    const recentPlans = await getRecentDeveloperSessionPlans(conversationId);
    const activeMission = await getActiveDeveloperMission(conversationId);
    const turnIsolation = analyzeTurnIsolation(instruction);
    const missionRelevance = analyzeMissionRelevance({ mission: turnIsolation.mustIgnoreCurrentMission ? null : activeMission, instruction });
    const bodyCurrentPlan = body.currentPlan && typeof body.currentPlan === "object" ? body.currentPlan : null;
    const planResolution = resolveApprovedPlanForTurn({
      instruction,
      history,
      mission: missionRelevance.relevant ? activeMission : null,
      rememberedPlan,
      recentPlans,
      bodyPlan: bodyCurrentPlan,
    });
    const missionForTurn = missionRelevance.relevant ? planResolution.safeMission : null;
    const historyForTurn = missionRelevance.relevant ? history : [];
    type ConversationCurrentPlan = Parameters<typeof decideDeveloperConversation>[0]["currentPlan"];
    const currentPlan = (missionRelevance.relevant ? planResolution.safePlan : null) as ConversationCurrentPlan;

    await logDeveloperConversationEvent({
      conversationId,
      role: "user",
      content: instruction,
      details: { source: "developer_page", activeMission, missionRelevance, turnIsolation, planResolution },
    });

    const intentTransition = analyzeIntentTransition(instruction);

    if (planResolution.shouldBlockExecution && !planResolution.shouldForceFreshPlanning) {
      const reply = buildApprovedPlanMismatchReply(planResolution);
      await logDeveloperConversationEvent({
        conversationId,
        role: "assistant",
        content: reply,
        intent: "approved_plan_mismatch",
        details: { activeMission, missionRelevance, turnIsolation, planResolution },
      });

      return NextResponse.json({
        ok: true,
        conversationOnly: true,
        conversationIntent: "approved_plan_mismatch",
        shouldRun: false,
        conversationReply: reply,
        mission: null,
        missionRelevance,
        turnIsolation,
        planResolution,
      });
    }

    const generalConversation = analyzeGeneralConversationMode({
      instruction,
      missionRelevant: Boolean(missionForTurn),
      isolatedIntent: turnIsolation.intent,
    });

    if (generalConversation.shouldHandle) {
      const reply = await buildGeneralConversationReply(instruction, generalConversation.category);
      await logDeveloperConversationEvent({
        conversationId,
        role: "assistant",
        content: reply,
        intent: "general_conversation",
        details: { activeMission, missionRelevance, turnIsolation, generalConversation },
      });

      return NextResponse.json({
        ok: true,
        conversationOnly: true,
        conversationIntent: "general_conversation",
        shouldRun: false,
        conversationReply: reply,
        mission: null,
        missionRelevance,
        turnIsolation,
        generalConversation,
      });
    }

    if ((turnIsolation.intent === "audit_evidence_check" || isEvidenceCheckInstruction(instruction)) && !mustTreatAsPlanningTransition(instruction)) {
      const evidence = await runFlowlyEvidenceCheck(instruction);
      await logDeveloperConversationEvent({
        conversationId,
        role: "assistant",
        content: evidence.reply,
        intent: "audit_evidence_check",
        details: { evidence, activeMission, missionRelevance, turnIsolation },
      });

      return NextResponse.json({
        ok: true,
        conversationOnly: true,
        conversationIntent: "audit_evidence_check",
        shouldRun: false,
        conversationReply: evidence.reply,
        evidence,
        mission: missionForTurn,
        turnIsolation,
      });
    }

    if (!missionRelevance.relevant && turnIsolation.intent === "architecture_critique" && isIndependentArchitectureCritiqueInstruction(instruction)) {
      const reply = buildIndependentArchitectureCritiqueReply(instruction);
      await logDeveloperConversationEvent({
        conversationId,
        role: "assistant",
        content: reply,
        intent: "architecture_critique",
        details: { activeMission, missionRelevance, turnIsolation },
      });

      return NextResponse.json({
        ok: true,
        conversationOnly: true,
        conversationIntent: "architecture_critique",
        shouldRun: false,
        conversationReply: reply,
        mission: null,
        missionRelevance,
        turnIsolation,
      });
    }

    const missionDirective = interpretDeveloperMissionInstruction({ mission: missionForTurn, instruction });

    if (missionDirective.kind === "fix_active_pr" && missionDirective.mission) {
      const pr = missionDirective.mission.pull_request_url || String(missionDirective.mission.pull_request_number || "");
      if (!pr.trim()) {
        const reply = [
          "Hay una misión activa, pero no encuentro el Pull Request asociado.",
          buildMissionStatusReply(missionDirective.mission),
          "Pega la URL o número del PR para corregirlo sobre la misma rama.",
        ].join("\n\n");

        await logDeveloperConversationEvent({ conversationId, role: "assistant", content: reply, intent: "mission_fix_missing_pr", details: { missionDirective } });
        return NextResponse.json({ ok: true, conversationOnly: true, conversationIntent: "mission_fix_missing_pr", shouldRun: false, conversationReply: reply, mission: missionDirective.mission });
      }

      await updateDeveloperMission({
        conversationId,
        status: "executing",
        currentStep: "qa_fix_active_pr",
        lastBuildLog: instruction,
      });

      const qaResult = await fixDeveloperPipelinePullRequest({ pr, buildLog: instruction });
      await updateDeveloperMission({
        conversationId,
        status: qaResult.fixed ? "executing" : "failed",
        currentStep: qaResult.fixed ? "qa_fix_committed_waiting_checks" : "qa_needs_build_log_or_manual_review",
        lastError: qaResult.message,
        details: qaResult,
      });

      const reply = qaResult.fixed
        ? `He corregido la misión activa sobre la misma rama del PR #${qaResult.prNumber}. No he creado otro PR. Espera el nuevo deploy y pásame el siguiente log si vuelve a fallar.`
        : `He mantenido la misión activa y no he vuelto a planificar. ${qaResult.message}`;

      await logDeveloperConversationEvent({ conversationId, role: "assistant", content: reply, intent: "mission_fix_active_pr", details: { missionDirective, qaResult } });
      return NextResponse.json({ ok: true, conversationOnly: true, conversationIntent: "mission_fix_active_pr", shouldRun: false, conversationReply: reply, mission: missionDirective.mission, qa: qaResult });
    }

    if (missionDirective.kind === "block_replan" && missionDirective.mission) {
      const reply = [
        "No voy a generar un plan nuevo porque ya hay una misión activa en ejecución o fallida.",
        buildMissionStatusReply(missionDirective.mission),
        "Dime si quieres corregir el PR actual, cancelar la misión o pegar el log exacto del build.",
      ].join("\n\n");

      await logDeveloperConversationEvent({ conversationId, role: "assistant", content: reply, intent: "mission_block_replan", details: { missionDirective } });
      return NextResponse.json({ ok: true, conversationOnly: true, conversationIntent: "mission_block_replan", shouldRun: false, conversationReply: reply, mission: missionDirective.mission });
    }

    if (missionDirective.kind === "explain_active_mission" && missionDirective.mission) {
      const reply = buildMissionStatusReply(missionDirective.mission);
      await logDeveloperConversationEvent({ conversationId, role: "assistant", content: reply, intent: "mission_status", details: { missionDirective } });
      return NextResponse.json({ ok: true, conversationOnly: true, conversationIntent: "mission_status", shouldRun: false, conversationReply: reply, mission: missionDirective.mission });
    }

    const orchestration = await orchestrateFlowRequest({
      instruction,
      conversationId,
      currentPlan,
      history: historyForTurn,
    });

    if (!orchestration.shouldPlan && !orchestration.shouldExecute) {
      await logDeveloperConversationEvent({
        conversationId,
        role: "assistant",
        content: orchestration.reply,
        intent: orchestration.intent,
        details: { orchestration, turnIsolation, planResolution },
      });

      return NextResponse.json({
        ok: true,
        conversationOnly: true,
        conversationIntent: orchestration.intent,
        shouldRun: false,
        conversationReply: orchestration.reply,
        orchestration,
      });
    }

    const intelligence = await thinkWithDeveloperIntelligence({
      instruction: orchestration.refinedInstruction || instruction,
      conversationId,
      currentPlan,
      history: historyForTurn,
    });

    if (!intelligence.shouldPlan) {
      await logDeveloperConversationEvent({
        conversationId,
        role: "assistant",
        content: intelligence.directReply,
        intent: intelligence.intent,
        details: { intelligence, turnIsolation },
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
      history: historyForTurn,
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

    const mergedInstruction = conversation.mergedInstruction || intelligence.refinedInstruction || orchestration.refinedInstruction || instruction;
    const result = await planDeveloperPipeline(mergedInstruction, { intelligence });

    try {
      await supabaseAdmin.from("flowly_developer_pipeline_runs").insert({
        instruction,
        phase: "plan",
        status: result.pipelineReady ? "ready" : "needs_review",
        risk: result.risk,
        pull_request_url: null,
        branch: null,
        details: { ...result, conversationId, intelligence, orchestration, intentTransition, missionRelevance, planResolution },
      });
    } catch {
      // El log no debe bloquear el plan.
    }

    const sessionPlanId = await rememberDeveloperSessionPlan({
      conversationId,
      instruction: mergedInstruction,
      plan: result,
      summary: result.summary,
      risk: result.risk,
    });

    const mission = await rememberDeveloperMission({
      conversationId,
      objective: mergedInstruction,
      status: "planning",
      currentStep: "plan_ready_waiting_approval",
      currentPlan: result,
      details: { sessionPlanId, orchestration, intelligence, intentTransition, missionRelevance, planResolution },
    });

    const resultWithSession = { ...result, sessionPlanId, orchestration, mission };

    await logDeveloperConversationEvent({
      conversationId,
      role: "assistant",
      content: result.conversationReply,
      intent: intelligence.intent,
      details: { planSummary: result.summary, risk: result.risk, proposedFiles: result.proposedFiles?.map((file) => file.path), intelligence, orchestration },
    });

    return NextResponse.json(resultWithSession);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
