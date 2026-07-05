import { callFlowlyOpenAI } from "@/lib/flowlyOpenAI";

export type FlowlyGeneralConversationDecision = {
  shouldHandle: boolean;
  reason: string;
  category: "math" | "general" | "flowly";
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(normalize(term)));
}

function isSimpleMathQuestion(instruction: string) {
  const text = normalize(instruction).replace(/,/g, ".");
  return (
    /cuanto\s+es\s+[-+\d\s.,x×*\/()]+\??/.test(text) ||
    /^[\s¿?]*[-+\d\s.,x×*\/()]+\??[\s?]*$/.test(text)
  );
}

function isFlowlyDomainQuestion(instruction: string) {
  const text = normalize(instruction);
  return hasAny(text, [
    "flowly",
    "developer",
    "brain",
    "mission engine",
    "intent engine",
    "context builder",
    "project reader",
    "grounding guard",
    "build guard",
    "executor",
    "github",
    "pull request",
    "crm",
    "presupuesto",
    "presupuestos",
    "facturacion",
    "facturación",
    "supabase",
    "vercel",
    "next.js",
    "typescript",
    "app/",
    "lib/",
    "docs/",
    "archivo",
    "archivos",
    "codigo",
    "código",
    "zip",
    "implementa",
    "planifica",
    "auditoria",
    "auditoría",
    "evidencia",
  ]);
}

function isLikelyGeneralConversation(instruction: string) {
  const text = normalize(instruction).trim();
  if (!text) return false;
  if (isFlowlyDomainQuestion(instruction)) return false;
  if (isSimpleMathQuestion(instruction)) return true;

  return (
    /^(quien|quién|que|qué|como|cómo|cuanto|cuánto|cuando|cuándo|donde|dónde|por que|por qué|recomiendame|recomiéndame|dime|explicame|explícame)\b/.test(text) ||
    text.endsWith("?")
  );
}

export function analyzeGeneralConversationMode(params: {
  instruction: string;
  missionRelevant: boolean;
  isolatedIntent?: string;
}): FlowlyGeneralConversationDecision {
  if (params.missionRelevant) {
    return { shouldHandle: false, category: "flowly", reason: "El turno pertenece a la misión activa; debe seguir el pipeline de Flowly." };
  }

  if (params.isolatedIntent && params.isolatedIntent !== "current_turn") {
    return { shouldHandle: false, category: "flowly", reason: "El turno ya fue aislado por un guard específico." };
  }

  if (isFlowlyDomainQuestion(params.instruction)) {
    return { shouldHandle: false, category: "flowly", reason: "El mensaje contiene términos del dominio Flowly o de ingeniería del proyecto." };
  }

  if (isSimpleMathQuestion(params.instruction)) {
    return { shouldHandle: true, category: "math", reason: "Pregunta matemática general no relacionada con Flowly." };
  }

  if (isLikelyGeneralConversation(params.instruction)) {
    return { shouldHandle: true, category: "general", reason: "Consulta general independiente de la misión activa." };
  }

  return { shouldHandle: false, category: "flowly", reason: "No hay suficiente seguridad para sacarlo del pipeline Flowly." };
}

function tryEvaluateSimpleMath(instruction: string) {
  const match = normalize(instruction)
    .replace(/cuanto\s+es/g, "")
    .replace(/[¿?]/g, "")
    .replace(/x|×/g, "*")
    .replace(/,/g, ".")
    .trim();

  if (!/^[\d\s+\-*/().]+$/.test(match)) return null;
  try {
    // eslint-disable-next-line no-new-func
    const value = Function(`"use strict"; return (${match});`)();
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(8)));
  } catch {
    return null;
  }
}

export async function buildGeneralConversationReply(instruction: string, category: FlowlyGeneralConversationDecision["category"]) {
  if (category === "math") {
    const result = tryEvaluateSimpleMath(instruction);
    if (result) return result;
  }

  const ai = await callFlowlyOpenAI({
    purpose: "developer",
    system: [
      "Responde como ChatGPT general en español.",
      "Esta consulta NO pertenece al pipeline de ingeniería de Flowly OS.",
      "No menciones Flowly, Brain, Mission, Project Reader, PR, planes ni certificaciones salvo que el usuario lo pida explícitamente.",
      "Sé directo y útil.",
    ].join("\n"),
    user: instruction,
    temperature: 0.25,
    maxOutputTokens: 900,
  });

  if (ai.ok && ai.text.trim()) return ai.text.trim();
  return "Puedo responder a eso fuera del flujo de Flowly, pero ahora mismo no tengo respuesta suficiente.";
}
