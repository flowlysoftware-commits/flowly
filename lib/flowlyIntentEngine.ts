import { callFlowlyOpenAI } from "@/lib/flowlyOpenAI";

export type FlowlyIntent =
  | "audit_project"
  | "consultation"
  | "planning"
  | "execution_approval"
  | "qa_fix"
  | "continue_session"
  | "internal_diagnostic"
  | "conversation";

export type FlowlyIntentMode = "audit" | "consultation" | "planning" | "execution" | "qa" | "diagnostic" | "conversation";

export type FlowlyIntentDecision = {
  intent: FlowlyIntent;
  mode: FlowlyIntentMode;
  confidence: number;
  shouldPlan: boolean;
  shouldExecute: boolean;
  requiresApproval: boolean;
  explicitNoExecution: boolean;
  explicitNoAudit: boolean;
  refinedInstruction: string;
  reasoning: string[];
};

type IntentInput = {
  instruction: string;
  history?: Array<{ role?: string; text?: string }>;
  currentPlan?: unknown;
};

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(normalize(term)));
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}

function hasCurrentPlan(plan: unknown) {
  return Boolean(plan && typeof plan === "object" && ("summary" in plan || "instruction" in plan || "conversationReply" in plan));
}

function modeFromIntent(intent: FlowlyIntent): FlowlyIntentMode {
  if (intent === "audit_project") return "audit";
  if (intent === "planning") return "planning";
  if (intent === "execution_approval") return "execution";
  if (intent === "qa_fix") return "qa";
  if (intent === "internal_diagnostic") return "diagnostic";
  if (intent === "continue_session") return "conversation";
  return "consultation";
}

function policyFromMode(mode: FlowlyIntentMode, explicitNoExecution: boolean) {
  if (mode === "execution" && !explicitNoExecution) {
    return { shouldPlan: false, shouldExecute: true, requiresApproval: true };
  }
  if (mode === "planning" || mode === "qa") {
    return { shouldPlan: true, shouldExecute: false, requiresApproval: true };
  }
  return { shouldPlan: false, shouldExecute: false, requiresApproval: false };
}

function fallbackIntent(input: IntentInput): FlowlyIntentDecision {
  const text = normalize(input.instruction);
  const explicitNoExecution = hasAny(text, ["no escribas codigo", "no escribas código", "no modifiques", "no ejecutes", "no hagas pr", "no crees pr", "no crees rama", "solo un documento", "solo quiero"]);
  const explicitNoAudit = hasAny(text, ["no hagas auditoria", "no hagas auditoría", "no quiero auditoria", "la auditoria ya estaba hecha", "la auditoría ya estaba hecha", "no hagas otra auditoria", "no hagas otra auditoría"]);

  let intent: FlowlyIntent = "consultation";
  if (hasAny(text, ["fallo del intent classifier", "fallo del orchestrator", "por que clasificaste", "por qué clasificaste", "has clasificado mal", "developer respondio mal", "developer respondió mal"])) intent = "internal_diagnostic";
  else if (!explicitNoAudit && hasAny(text, ["auditoria completa", "auditoría completa", "auditar el proyecto", "audita el proyecto", "analiza todo flowly", "revision completa", "revisión completa"])) intent = "audit_project";
  else if (hasAny(text, ["convierte", "plan", "roadmap", "fase", "prepara propuesta", "que archivos tocarias", "qué archivos tocarías"])) intent = "planning";
  else if (hasAny(text, ["error", "build", "vercel", "typescript", "no compila", "arregla este error"])) intent = "qa_fix";
  else if (!explicitNoExecution && /^(ok|vale|adelante|hazlo|aprobado|aplica|ejecuta|si|sí)\b/.test(text)) intent = "execution_approval";
  else if (hasAny(text, ["continua", "continúa", "sigue", "seguimos", "lo de antes"])) intent = "continue_session";
  else if (hasCurrentPlan(input.currentPlan) && (text.includes("?") || hasAny(text, ["que", "qué", "como", "cómo", "dime", "explica"]))) intent = "consultation";

  if (explicitNoExecution && intent === "execution_approval") intent = "planning";
  if (explicitNoAudit && intent === "audit_project") intent = hasAny(text, ["plan", "fase", "propuesta"]) ? "planning" : "consultation";

  const mode = modeFromIntent(intent);
  const policy = policyFromMode(mode, explicitNoExecution);
  return {
    intent,
    mode,
    confidence: 0.62,
    explicitNoExecution,
    explicitNoAudit,
    refinedInstruction: input.instruction,
    reasoning: ["Clasificación fallback por reglas locales.", explicitNoAudit ? "El usuario prohibió auditoría." : "", explicitNoExecution ? "El usuario prohibió ejecución." : ""].filter(Boolean),
    ...policy,
  };
}

export async function classifyFlowlyIntent(input: IntentInput): Promise<FlowlyIntentDecision> {
  const fallback = fallbackIntent(input);

  const system = [
    "Eres el Intent Engine de Flowly OS.",
    "Tu único trabajo es clasificar la intención del usuario antes de activar cualquier motor.",
    "Debes respetar instrucciones negativas explícitas por encima de palabras sueltas.",
    "Reglas críticas:",
    "- Si el usuario dice 'no hagas auditoría' o 'la auditoría ya estaba hecha', NO uses audit_project.",
    "- Si pide convertir una fase en plan, preparar roadmap/propuesta o indicar archivos, usa planning.",
    "- Si pide analizar por qué falló Developer, Orchestrator o Intent Classifier, usa internal_diagnostic.",
    "- Si dice no escribas código/no ejecutes/no PR, shouldExecute debe ser false.",
    "- audit_project solo cuando pide auditar/revisar todo el proyecto desde cero.",
    "Devuelve SOLO JSON válido con este esquema:",
    "{\"intent\":\"audit_project|consultation|planning|execution_approval|qa_fix|continue_session|internal_diagnostic|conversation\",\"confidence\":number,\"refinedInstruction\":string,\"reasoning\":[string]}",
  ].join("\n");

  const ai = await callFlowlyOpenAI({
    purpose: "developer",
    system,
    user: JSON.stringify({
      instruction: input.instruction,
      hasCurrentPlan: hasCurrentPlan(input.currentPlan),
      currentPlan: input.currentPlan || null,
      recentHistory: (input.history || []).slice(-10),
      fallback,
    }),
    temperature: 0,
    maxOutputTokens: 650,
    expectJson: true,
  });

  if (!ai.ok || !ai.text.trim()) return fallback;
  const parsed = safeJsonParse<Partial<FlowlyIntentDecision>>(ai.text);
  if (!parsed || typeof parsed.intent !== "string") return fallback;

  const allowed: FlowlyIntent[] = ["audit_project", "consultation", "planning", "execution_approval", "qa_fix", "continue_session", "internal_diagnostic", "conversation"];
  const intent = allowed.includes(parsed.intent as FlowlyIntent) ? parsed.intent as FlowlyIntent : fallback.intent;
  const explicitNoExecution = fallback.explicitNoExecution;
  const explicitNoAudit = fallback.explicitNoAudit;
  const correctedIntent = explicitNoAudit && intent === "audit_project" ? fallback.intent : explicitNoExecution && intent === "execution_approval" ? "planning" : intent;
  const mode = modeFromIntent(correctedIntent);
  const policy = policyFromMode(mode, explicitNoExecution);

  return {
    intent: correctedIntent,
    mode,
    confidence: typeof parsed.confidence === "number" ? Math.max(0, Math.min(1, parsed.confidence)) : 0.8,
    explicitNoExecution,
    explicitNoAudit,
    refinedInstruction: typeof parsed.refinedInstruction === "string" && parsed.refinedInstruction.trim() ? parsed.refinedInstruction.trim() : input.instruction,
    reasoning: Array.isArray(parsed.reasoning) ? parsed.reasoning.map(String).slice(0, 8) : fallback.reasoning,
    ...policy,
  };
}
