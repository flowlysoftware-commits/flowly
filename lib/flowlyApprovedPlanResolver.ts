import type { FlowlyMission } from "@/lib/flowlyMissionEngine";
import type { DeveloperSessionPlan } from "@/lib/flowlyDeveloperSessionEngine";
import { attachExecutableApprovedPlanContract } from "@/lib/flowlyExecutableApprovedPlanContract";

export type FlowlyPlanDomain = "budget_crm" | "companion_avatar" | "seo" | "engine_architecture" | "general_flowly" | "unknown";

export type FlowlyApprovedPlanResolution = {
  requestedDomain: FlowlyPlanDomain;
  planDomain: FlowlyPlanDomain;
  missionDomain: FlowlyPlanDomain;
  hasMismatch: boolean;
  safePlan: unknown | null;
  safeMission: FlowlyMission | null;
  reason: string;
  shouldBlockExecution: boolean;
  shouldForceFreshPlanning: boolean;
};

type HistoryItem = { role?: string; text?: string; content?: string };

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function compactStringFromUnknown(value: unknown, limit = 9000): string {
  const parts: string[] = [];
  const seen = new WeakSet<object>();

  function visit(item: unknown, depth: number) {
    if (parts.join("\n").length > limit || depth > 5) return;
    if (typeof item === "string") {
      if (item.trim()) parts.push(item.trim());
      return;
    }
    if (typeof item === "number" || typeof item === "boolean") return;
    if (!item || typeof item !== "object") return;
    if (seen.has(item)) return;
    seen.add(item);

    if (Array.isArray(item)) {
      item.slice(0, 30).forEach((entry) => visit(entry, depth + 1));
      return;
    }

    const obj = item as Record<string, unknown>;
    const priorityKeys = [
      "instruction",
      "objective",
      "summary",
      "conversationReply",
      "title",
      "description",
      "message",
      "path",
      "proposedFiles",
      "humanChanges",
      "productChangePlan",
      "details",
    ];

    for (const key of priorityKeys) {
      if (key in obj) visit(obj[key], depth + 1);
    }
  }

  visit(value, 0);
  return parts.join("\n").slice(0, limit);
}

export function detectFlowlyPlanDomain(value: unknown): FlowlyPlanDomain {
  const text = normalize(typeof value === "string" ? value : compactStringFromUnknown(value));

  const hasBudget = /presupuesto|presupuestos|budget|salesbudget|budgetmodule|app\/admin\/presupuestos/.test(text);
  const hasCrm = /\bcrm\b|cliente|clientes|contacto|contactos|app\/admin\/clientes/.test(text);
  if (hasBudget && hasCrm) return "budget_crm";

  if (/(companion|avatar|mascota|asistente|assistant|flowlycompanion|evolutionarycompanionavatar|flowlycompanionruntime)/.test(text)) {
    return "companion_avatar";
  }

  if (/\bseo\b|metadata|metadatos|robots\.ts|sitemap\.ts|open\s*graph|opengraph|twitter\s*image|indexacion|indexaci[oó]n|rutas\s+publicas|rutas\s+p[uú]blicas/.test(text)) {
    return "seo";
  }

  if (/segundo\s+brain|otro\s+brain|budgetengine|nuevo\s+engine|motor\s+nuevo|motores\s+duplicados/.test(text)) {
    return "engine_architecture";
  }

  if (/flowly|developer|mission\s+engine|intent\s+engine|context\s+builder|project\s+reader|executor|github|pull\s+request|supabase|vercel|next\.js|typescript/.test(text)) {
    return "general_flowly";
  }

  return "unknown";
}

function latestDomainFromHistory(history: HistoryItem[] = []): FlowlyPlanDomain {
  const userItems = history
    .filter((item) => String(item.role || "").toLowerCase() === "user")
    .map((item) => String(item.text || item.content || ""))
    .filter(Boolean)
    .slice(-8)
    .reverse();

  for (const item of userItems) {
    const domain = detectFlowlyPlanDomain(item);
    if (domain !== "unknown" && domain !== "general_flowly") return domain;
  }

  return "unknown";
}

function isResumeOrExecutionRequest(instruction: string) {
  const text = normalize(instruction);
  return /\b(implementa|ejecuta|aplica|hazlo|adelante|apruebo|aprobado|continua|continúa|continuar|sigue|plan\s+aprobado|exactamente\s+el\s+plan)\b/.test(text);
}

function domainsCompatible(requested: FlowlyPlanDomain, plan: FlowlyPlanDomain) {
  if (requested === "unknown" || plan === "unknown") return true;
  if (requested === plan) return true;
  if (requested === "general_flowly" || plan === "general_flowly") return true;
  return false;
}

function selectCandidatePlan(params: {
  bodyPlan?: unknown | null;
  mission?: FlowlyMission | null;
  rememberedPlan?: DeveloperSessionPlan | null;
}) {
  return (
    params.bodyPlan ||
    params.mission?.approved_plan ||
    params.mission?.current_plan ||
    params.rememberedPlan?.plan ||
    null
  );
}

function findRecentPlanForDomain(recentPlans: DeveloperSessionPlan[] | undefined, requestedDomain: FlowlyPlanDomain) {
  if (!recentPlans?.length || requestedDomain === "unknown" || requestedDomain === "general_flowly") return null;

  return recentPlans.find((item) => {
    const domain = detectFlowlyPlanDomain([item.instruction, item.summary || "", item.plan].filter(Boolean));
    return domainsCompatible(requestedDomain, domain);
  }) || null;
}

export function resolveApprovedPlanForTurn(params: {
  instruction: string;
  history?: HistoryItem[];
  mission?: FlowlyMission | null;
  rememberedPlan?: DeveloperSessionPlan | null;
  recentPlans?: DeveloperSessionPlan[];
  bodyPlan?: unknown | null;
}): FlowlyApprovedPlanResolution {
  const directDomain = detectFlowlyPlanDomain(params.instruction);
  const recentDomain = latestDomainFromHistory(params.history || []);
  const requestedDomain = directDomain !== "unknown" && directDomain !== "general_flowly" ? directDomain : recentDomain;
  const missionDomain = detectFlowlyPlanDomain(params.mission?.objective || params.mission?.title || "");
  const initialCandidatePlan = selectCandidatePlan(params);
  const initialPlanDomain = detectFlowlyPlanDomain(initialCandidatePlan || "");
  const recentMatchingPlan = !domainsCompatible(requestedDomain, initialPlanDomain)
    ? findRecentPlanForDomain(params.recentPlans, requestedDomain)
    : null;
  const rawCandidatePlan = recentMatchingPlan?.plan || initialCandidatePlan;
  const candidatePlan = rawCandidatePlan && typeof rawCandidatePlan === "object" && !Array.isArray(rawCandidatePlan)
    ? attachExecutableApprovedPlanContract(rawCandidatePlan as Record<string, unknown>, params.instruction)
    : rawCandidatePlan;
  const planDomain = detectFlowlyPlanDomain(candidatePlan || "");
  const isResume = isResumeOrExecutionRequest(params.instruction);
  const hasMismatch = isResume && requestedDomain !== "unknown" && planDomain !== "unknown" && !domainsCompatible(requestedDomain, planDomain);

  if (hasMismatch) {
    return {
      requestedDomain,
      planDomain,
      missionDomain,
      hasMismatch: true,
      safePlan: null,
      safeMission: null,
      reason: `El usuario está retomando ${requestedDomain}, pero el plan recuperado pertenece a ${planDomain}. Se bloquea para no ejecutar un plan antiguo o contaminado.`,
      shouldBlockExecution: true,
      shouldForceFreshPlanning: directDomain !== "unknown" && directDomain !== "general_flowly",
    };
  }

  const missionMismatch = isResume && requestedDomain !== "unknown" && missionDomain !== "unknown" && !domainsCompatible(requestedDomain, missionDomain);

  return {
    requestedDomain,
    planDomain,
    missionDomain,
    hasMismatch: false,
    safePlan: candidatePlan,
    safeMission: missionMismatch ? null : params.mission || null,
    reason: missionMismatch
      ? `La misión activa pertenece a ${missionDomain}, pero la petición actual apunta a ${requestedDomain}. La misión queda suspendida para este turno.`
      : recentMatchingPlan
        ? `Se recuperó un plan reciente compatible con ${requestedDomain} en lugar del último plan contaminado.`
        : "El plan/misión recuperado es compatible con el objetivo solicitado o no hay evidencia suficiente de conflicto.",
    shouldBlockExecution: false,
    shouldForceFreshPlanning: missionMismatch && !candidatePlan && directDomain !== "unknown" && directDomain !== "general_flowly",
  };
}

export function buildApprovedPlanMismatchReply(resolution: FlowlyApprovedPlanResolution) {
  return [
    "No ejecuto ese plan.",
    "",
    `Motivo: ${resolution.reason}`,
    "",
    "Para evitar contaminación entre misiones, necesito un plan aprobado compatible con el objetivo actual antes de ejecutar. Si quieres continuar con presupuestos del CRM, primero debo recuperar o rehacer ese plan dentro del scope correcto.",
  ].join("\n");
}
