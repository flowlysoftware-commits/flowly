import type { FlowlyPlanDomain } from "@/lib/flowlyApprovedPlanResolver";
import { detectFlowlyPlanDomain } from "@/lib/flowlyApprovedPlanResolver";

export type FlowlyStructuredPendingAction = {
  type: "execution";
  target: FlowlyPlanDomain;
  instruction: string;
  sourceInstruction: string;
  approvalRequired: true;
  createdAt: string;
  filesToModify?: string[];
  forbiddenTopics?: string[];
};

type HistoryItem = { role?: string; text?: string; content?: string; details?: unknown };

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function textOf(item: HistoryItem) {
  return String(item.text || item.content || "");
}

export function responseRequestsApproval(reply: string) {
  const text = normalize(reply);
  return /\b(apruebas|aprobas|aprueba|aprobar|aprobacion|aprobación|si lo apruebas|si lo aprobas|dame luz verde|confirmas|confirmacion|confirmación)\b/.test(text)
    || /\b(no ejecutare|no ejecutar[eé]|no tocare|no tocar[eé])\b.*\b(aprobacion|aprobación|confirmacion|confirmación)\b/.test(text);
}

export function instructionRequestsExecution(instruction: string) {
  const text = normalize(instruction);
  return /\b(implementa|ejecuta|aplica|hazlo|haz\s+el|haz\s+la|modifica|cambia|arregla|aumenta|reduce|sube|baja)\b/.test(text);
}

function instructionAsExecution(instruction: string, domain: FlowlyPlanDomain) {
  if (domain === "companion_avatar") {
    return "Haz el avatar del Companion un 25% más grande en escritorio y móvil, sin modificar las animaciones ni la lógica de conversación. Implementa el cambio aprobado directamente.";
  }
  if (domain === "budget_crm") {
    return "Implementa exactamente el plan aprobado de integración de presupuestos en el CRM. No vuelvas a planificar. Entra directamente en EXECUTION.";
  }
  return instruction.trim() || "Implementa la acción aprobada directamente sin volver a planificar.";
}

function filesForDomain(domain: FlowlyPlanDomain) {
  if (domain === "budget_crm") {
    return ["app/admin/clientes/page.tsx", "app/admin/presupuestos/page.tsx", "app/admin/presupuestos/pdf.tsx"];
  }
  if (domain === "companion_avatar") {
    return [
      "components/EvolutionaryCompanionAvatar.tsx",
      "components/FlowlyAssistant3D.tsx",
      "components/FlowlyCompanionRuntime.tsx",
      "components/FlowlyCompanionGate.tsx",
      "lib/flowlyAvatarRuntime.ts",
      "lib/flowlyCompanionRuntime.ts",
    ];
  }
  return undefined;
}

export function buildStructuredPendingAction(params: {
  instruction: string;
  reply?: string;
  force?: boolean;
}): FlowlyStructuredPendingAction | null {
  const reply = params.reply || "";
  const isApprovalRequest = reply ? responseRequestsApproval(reply) : false;
  const isDirectExecutionRequest = instructionRequestsExecution(params.instruction);
  if (!params.force && !isApprovalRequest && !isDirectExecutionRequest) return null;

  const domain = detectFlowlyPlanDomain(params.instruction);
  if (domain === "unknown" || domain === "general_flowly" || domain === "seo") return null;

  return {
    type: "execution",
    target: domain,
    instruction: instructionAsExecution(params.instruction, domain),
    sourceInstruction: params.instruction,
    approvalRequired: true,
    createdAt: new Date().toISOString(),
    filesToModify: filesForDomain(domain),
    forbiddenTopics: domain === "companion_avatar" ? ["seo", "robots.ts", "sitemap.ts", "metadata"] : ["seo", "robots.ts", "sitemap.ts", "metadata", "app/docs/studio/page.tsx"],
  };
}

function readPendingActionFromDetails(details: unknown): FlowlyStructuredPendingAction | null {
  if (!isObject(details)) return null;

  const direct = details.pendingAction || details.structuredPendingAction;
  if (isObject(direct) && direct.type === "execution" && typeof direct.instruction === "string") {
    return {
      type: "execution",
      target: typeof direct.target === "string" ? (direct.target as FlowlyPlanDomain) : detectFlowlyPlanDomain(direct.instruction),
      instruction: direct.instruction,
      sourceInstruction: typeof direct.sourceInstruction === "string" ? direct.sourceInstruction : direct.instruction,
      approvalRequired: true,
      createdAt: typeof direct.createdAt === "string" ? direct.createdAt : "",
      filesToModify: Array.isArray(direct.filesToModify) ? direct.filesToModify.map(String) : undefined,
      forbiddenTopics: Array.isArray(direct.forbiddenTopics) ? direct.forbiddenTopics.map(String) : undefined,
    };
  }

  // Some logs wrap useful payload inside nested details.
  for (const value of Object.values(details).slice(0, 20)) {
    const nested = readPendingActionFromDetails(value);
    if (nested) return nested;
  }

  return null;
}

export function findLatestStructuredPendingAction(history: HistoryItem[] = []): FlowlyStructuredPendingAction | null {
  for (const item of history.slice(-12).reverse()) {
    const role = normalize(String(item.role || ""));
    if (role && role !== "assistant" && role !== "brain" && role !== "system") continue;

    const fromDetails = readPendingActionFromDetails(item.details);
    if (fromDetails) return fromDetails;

    const text = textOf(item);
    if (!responseRequestsApproval(text)) continue;

    const inferred = buildStructuredPendingAction({ instruction: history.slice(0, history.indexOf(item)).map(textOf).join("\n"), reply: text });
    if (inferred) return inferred;
  }

  return null;
}
