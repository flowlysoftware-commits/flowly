import { findLatestStructuredPendingAction } from "@/lib/flowlyStructuredPendingActionStore";

export type FlowlyPendingActionResolution = {
  shouldContinuePendingAction: boolean;
  reason: string;
  instruction: string;
  detectedDomain: "budget_crm" | "companion_avatar" | "seo" | "unknown";
};

type HistoryItem = { role?: string; text?: string; content?: string; details?: unknown };

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isConfirmationOnly(value: string) {
  const text = normalize(value).trim();
  return /^(si|sí|ok|vale|dale|adelante|correcto|confirmo|aprobado|apruebo|hazlo)$/.test(text)
    || /^(si|sí|ok|vale|dale|adelante|correcto|confirmo|aprobado|apruebo)[,\s]+.*\b(implementa|ejecuta|hazlo|aplica|continua|continúa)\b/.test(text);
}

function textOf(item: HistoryItem) {
  return String(item.text || item.content || "");
}

function detectDomainFromText(value: string): FlowlyPendingActionResolution["detectedDomain"] {
  const text = normalize(value);
  const hasBudget = /presupuesto|presupuestos|budget|salesbudget|budgetmodule|app\/admin\/presupuestos/.test(text);
  const hasCrm = /\bcrm\b|cliente|clientes|contacto|contactos|app\/admin\/clientes/.test(text);
  if (hasBudget && hasCrm) return "budget_crm";
  if (/(companion|avatar|mascota|asistente|assistant|flowlycompanion|evolutionarycompanionavatar|flowlycompanionruntime)/.test(text)) return "companion_avatar";
  if (/\bseo\b|robots\.ts|sitemap\.ts|metadata|metadatos|indexacion|indexaci[oó]n/.test(text)) return "seo";
  return "unknown";
}

function findRecentDomain(history: HistoryItem[]) {
  const joined = history.slice(-12).map(textOf).join("\n");
  return detectDomainFromText(joined);
}

function hasPendingExecutionPrompt(history: HistoryItem[]) {
  const recentAssistant = history
    .slice(-8)
    .filter((item) => normalize(String(item.role || "")) === "assistant")
    .map(textOf)
    .join("\n");

  const text = normalize(recentAssistant);
  return /iniciar ejecucion|iniciar ejecución|paso a ejecucion|paso a ejecución|plan aprobado compatible recuperado|ejecuto exactamente el plan aprobado|esperando aprobacion|esperando aprobación|si lo apruebas|si lo aprobas|apruebas este cambio|aprobas este cambio|dame aprobacion|dame aprobación/.test(text);
}

export function resolvePendingActionForTurn(params: {
  instruction: string;
  history?: HistoryItem[];
}): FlowlyPendingActionResolution {
  const history = params.history || [];
  const domain = findRecentDomain(history);

  if (!isConfirmationOnly(params.instruction)) {
    return {
      shouldContinuePendingAction: false,
      reason: "La instrucción actual no es una confirmación aislada.",
      instruction: params.instruction,
      detectedDomain: domain,
    };
  }

  const structuredPendingAction = findLatestStructuredPendingAction(history);
  if (structuredPendingAction) {
    return {
      shouldContinuePendingAction: true,
      reason: `El usuario confirmó una acción pendiente estructurada (${structuredPendingAction.target}).`,
      instruction: structuredPendingAction.instruction,
      detectedDomain: structuredPendingAction.target === "budget_crm" || structuredPendingAction.target === "companion_avatar" || structuredPendingAction.target === "seo" ? structuredPendingAction.target : domain,
    };
  }

  if (!hasPendingExecutionPrompt(history)) {
    return {
      shouldContinuePendingAction: false,
      reason: "La confirmación no tiene una acción pendiente clara en los últimos turnos.",
      instruction: params.instruction,
      detectedDomain: domain,
    };
  }

  if (domain === "budget_crm") {
    return {
      shouldContinuePendingAction: true,
      reason: "El usuario confirmó una acción pendiente y el contexto reciente apunta a presupuestos del CRM.",
      instruction: "Implementa exactamente el plan aprobado de integración de presupuestos en el CRM. No vuelvas a planificar. Entra directamente en EXECUTION.",
      detectedDomain: domain,
    };
  }

  if (domain === "companion_avatar") {
    return {
      shouldContinuePendingAction: true,
      reason: "El usuario confirmó una acción pendiente y el contexto reciente apunta al avatar del Companion.",
      instruction: "Haz el avatar del Companion un 25% más grande en escritorio y móvil, sin modificar las animaciones ni la lógica de conversación. Implementa el cambio aprobado directamente.",
      detectedDomain: domain,
    };
  }

  return {
    shouldContinuePendingAction: true,
    reason: "El usuario confirmó una acción pendiente; se continúa la ejecución aprobada sin reinterpretar el turno desde cero.",
    instruction: "Implementa exactamente el plan aprobado. No vuelvas a planificar. Entra directamente en EXECUTION.",
    detectedDomain: domain,
  };
}
