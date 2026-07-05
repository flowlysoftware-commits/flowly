import { detectFlowlyPlanDomain, type FlowlyApprovedPlanResolution } from "@/lib/flowlyApprovedPlanResolver";

export type FlowlyApprovedPlanExecutionTriggerResult = {
  shouldExecuteApprovedPlan: boolean;
  reason: string;
  executionInstruction: string;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isApprovedPlanExecutionRequest(instruction: string) {
  const text = normalize(instruction);
  const hasExecutionVerb = /\b(implementa|ejecuta|aplica|hazlo|adelante|apruebo|aprobado|continua|continúa|continuar|sigue)\b/.test(text);
  const hasApprovedPlanReference = /\b(plan\s+aprobado|exactamente\s+el\s+plan|plan\s+que\s+aprobamos|propuesta\s+aprobada)\b/.test(text);

  return hasExecutionVerb && (hasApprovedPlanReference || /\b(implementa|ejecuta|aplica|hazlo|adelante)\b/.test(text));
}

function getPlanInstruction(plan: unknown) {
  if (!plan || typeof plan !== "object") return "";
  const item = plan as Record<string, unknown>;
  return [item.instruction, item.summary, item.conversationReply]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join("\n")
    .trim();
}

export function analyzeApprovedPlanExecutionTrigger(params: {
  instruction: string;
  planResolution: FlowlyApprovedPlanResolution;
}): FlowlyApprovedPlanExecutionTriggerResult {
  if (!isApprovedPlanExecutionRequest(params.instruction)) {
    return {
      shouldExecuteApprovedPlan: false,
      reason: "La instrucción actual no es una orden clara de ejecutar un plan aprobado.",
      executionInstruction: params.instruction,
    };
  }

  if (params.planResolution.shouldBlockExecution || params.planResolution.hasMismatch) {
    return {
      shouldExecuteApprovedPlan: false,
      reason: params.planResolution.reason || "El plan recuperado no es compatible con la petición actual.",
      executionInstruction: params.instruction,
    };
  }

  const plan = params.planResolution.safePlan;
  if (!plan || typeof plan !== "object") {
    return {
      shouldExecuteApprovedPlan: false,
      reason: "El usuario pidió ejecutar, pero no hay un plan aprobado compatible en la sesión.",
      executionInstruction: params.instruction,
    };
  }

  const planDomain = detectFlowlyPlanDomain(plan);
  const requestedDomain = params.planResolution.requestedDomain;
  if (requestedDomain !== "unknown" && planDomain !== "unknown" && requestedDomain !== "general_flowly" && planDomain !== "general_flowly" && requestedDomain !== planDomain) {
    return {
      shouldExecuteApprovedPlan: false,
      reason: `El plan aprobado pertenece a ${planDomain}, pero la petición actual apunta a ${requestedDomain}.`,
      executionInstruction: params.instruction,
    };
  }

  return {
    shouldExecuteApprovedPlan: true,
    reason: "Existe un plan aprobado compatible y el usuario ha pedido ejecutarlo explícitamente.",
    executionInstruction: getPlanInstruction(plan) || params.instruction,
  };
}

export function buildApprovedPlanExecutionReply(result: FlowlyApprovedPlanExecutionTriggerResult) {
  return [
    "Plan aprobado compatible recuperado.",
    "No voy a volver a planificar ni a mostrar el plan otra vez.",
    "Paso a ejecución segura con Executor, Build Guard y QA.",
    `Motivo: ${result.reason}`,
  ].join("\n");
}
