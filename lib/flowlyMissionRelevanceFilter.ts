import type { FlowlyMission } from "@/lib/flowlyMissionEngine";
import { isEvidenceCheckInstruction } from "@/lib/flowlyEvidenceCheck";
import { mustTreatAsPlanningTransition } from "@/lib/flowlyIntentTransitionGuard";

export type FlowlyMissionRelevance = {
  relevant: boolean;
  confidence: number;
  mode: "mission_relevant" | "mission_suspended" | "no_active_mission";
  reason: string;
  sharedTerms: string[];
};

const STOPWORDS = new Set([
  "quiero",
  "necesito",
  "hacer",
  "haz",
  "dame",
  "devuelve",
  "ahora",
  "esto",
  "esta",
  "este",
  "para",
  "como",
  "dentro",
  "sobre",
  "plan",
  "planifica",
  "implementa",
  "modifica",
  "archivo",
  "archivos",
  "flowly",
  "proyecto",
  "sistema",
  "modulo",
  "módulo",
]);

const EXECUTION_PATTERNS = [
  /\b(implementa|ejecuta|aplica|hazlo|adelante|apruebo|aprobado|puedes\s+hacerlo|crea\s+el\s+pr|abre\s+pr)\b/,
  /\b(corrige|arregla|fix|fallo|falla|error|build|deploy|vercel|typescript|type\s+error)\b/,
];

const STATUS_PATTERNS = [
  /\b(estado|donde\s+estamos|dónde\s+estamos|que\s+queda|qué\s+queda|continua|continúa|sigue)\b/,
];

const INDEPENDENT_ARCHITECTURE_PATTERNS = [
  /\b(actua\s+como\s+cto|actúa\s+como\s+cto|como\s+cto)\b/,
  /\b(lo\s+apruebas\s+o\s+lo\s+rechazas|apruebas\s+o\s+rechazas|critica\s+mi\s+idea|critiques\s+la\s+idea)\b/,
  /\b(segundo\s+brain|otro\s+brain|budgetengine|nuevo\s+engine|motor\s+nuevo)\b/,
];

const INDEPENDENT_QUERY_PATTERNS = [
  /\b(explicame|explícame|como\s+funciona|qué\s+es|que\s+es)\b/,
  /\b(haz\s+una\s+auditoria|auditoría|auditoria\s+completa)\b/,
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function tokenize(value: string) {
  const text = normalize(value);
  return Array.from(new Set((text.match(/[a-z0-9_/-]{3,}/g) || [])
    .map((term) => term.replace(/^app\//, "app/"))
    .filter((term) => !STOPWORDS.has(term))));
}

function hasAny(patterns: RegExp[], text: string) {
  return patterns.some((pattern) => pattern.test(text));
}

function sharedTermsBetween(a: string, b: string) {
  const aTerms = tokenize(a);
  const bTerms = new Set(tokenize(b));
  return aTerms.filter((term) => bTerms.has(term));
}


export function isIndependentArchitectureCritiqueInstruction(instruction: string) {
  const text = normalize(instruction);
  return hasAny(INDEPENDENT_ARCHITECTURE_PATTERNS, text);
}

export function buildIndependentArchitectureCritiqueReply(instruction: string) {
  const text = normalize(instruction);
  const isBudgetEngine = /budgetengine|nuevo\s+engine|motor\s+nuevo/.test(text);
  const isSecondBrain = /segundo\s+brain|otro\s+brain/.test(text);

  if (isSecondBrain) {
    return [
      "Lo rechazo.",
      "",
      "Crear un segundo Brain contradice la arquitectura principal de Flowly OS: debe existir un único Brain compartido para Developer, Companion, CRM, Marketing, automatizaciones y futuros módulos.",
      "",
      "La solución correcta es ampliar el Brain existente con más contexto, capacidades o documentación, no duplicar inteligencia. Un segundo Brain introduciría divergencia de memoria, reglas distintas, más coste de mantenimiento y decisiones inconsistentes entre módulos.",
      "",
      "No planifico, no implemento y no abro PR.",
    ].join("\n");
  }

  if (isBudgetEngine) {
    return [
      "Lo rechazo.",
      "",
      "No apruebo crear un BudgetEngine. Presupuestos no necesitan un motor nuevo: ya existe una pantalla de presupuestos, un generador PDF y el CRM puede integrarse reutilizando Brain, Context Builder, Project Reader y los módulos existentes.",
      "",
      "La solución correcta es crear o ajustar componentes/capacidades dentro del flujo actual, no añadir otro Engine. Crear un BudgetEngine duplicaría responsabilidades y rompería el principio de un único cerebro y una arquitectura sin motores paralelos.",
      "",
      "No planifico, no implemento y no abro PR.",
    ].join("\n");
  }

  return [
    "No lo apruebo todavía.",
    "",
    "Como CTO, cualquier cambio arquitectónico que cree motores, Brains o pipelines paralelos debe rechazarse por defecto salvo evidencia técnica fuerte. Flowly OS debe reutilizar Brain, Context Builder, Mission Engine, Project Reader y los guardrails existentes antes de crear piezas nuevas.",
    "",
    "No planifico, no implemento y no abro PR.",
  ].join("\n");
}

export function analyzeMissionRelevance(params: {
  mission?: FlowlyMission | null;
  instruction: string;
}): FlowlyMissionRelevance {
  const mission = params.mission || null;
  if (!mission) {
    return {
      relevant: false,
      confidence: 1,
      mode: "no_active_mission",
      reason: "No hay misión activa para esta conversación.",
      sharedTerms: [],
    };
  }

  const instruction = normalize(params.instruction);
  const objective = normalize(mission.objective || mission.title || "");
  const sharedTerms = sharedTermsBetween(objective, instruction);
  const hasSharedDomain = sharedTerms.length >= 1;
  const asksExecution = hasAny(EXECUTION_PATTERNS, instruction);
  const asksStatus = hasAny(STATUS_PATTERNS, instruction);
  const asksArchitectureCritique = hasAny(INDEPENDENT_ARCHITECTURE_PATTERNS, instruction);
  const asksIndependentQuery = hasAny(INDEPENDENT_QUERY_PATTERNS, instruction);
  const asksEvidence = isEvidenceCheckInstruction(params.instruction);
  const asksPlanningTransition = mustTreatAsPlanningTransition(params.instruction);

  if (asksArchitectureCritique) {
    return {
      relevant: false,
      confidence: 0.95,
      mode: "mission_suspended",
      reason: "La petición es una revisión/decisión arquitectónica independiente; la misión activa no debe contaminar el turno.",
      sharedTerms,
    };
  }

  if (asksEvidence) {
    return {
      relevant: hasSharedDomain,
      confidence: hasSharedDomain ? 0.82 : 0.9,
      mode: hasSharedDomain ? "mission_relevant" : "mission_suspended",
      reason: hasSharedDomain
        ? "La verificación de evidencia comparte dominio con la misión activa."
        : "La verificación de evidencia no comparte dominio suficiente con la misión activa.",
      sharedTerms,
    };
  }

  if (asksPlanningTransition) {
    return {
      relevant: hasSharedDomain,
      confidence: hasSharedDomain ? 0.84 : 0.88,
      mode: hasSharedDomain ? "mission_relevant" : "mission_suspended",
      reason: hasSharedDomain
        ? "El usuario pide planificar usando evidencia relacionada con la misión activa."
        : "El usuario pide planificar, pero la petición no comparte dominio con la misión activa.",
      sharedTerms,
    };
  }

  if (asksExecution || asksStatus) {
    return {
      relevant: true,
      confidence: hasSharedDomain ? 0.9 : 0.72,
      mode: "mission_relevant",
      reason: asksExecution
        ? "La petición parece aprobar, ejecutar, corregir o continuar la misión activa."
        : "La petición parece consultar el estado o continuidad de la misión activa.",
      sharedTerms,
    };
  }

  if (asksIndependentQuery && !hasSharedDomain) {
    return {
      relevant: false,
      confidence: 0.9,
      mode: "mission_suspended",
      reason: "La petición es consulta/auditoría independiente y no comparte dominio suficiente con la misión activa.",
      sharedTerms,
    };
  }

  if (hasSharedDomain) {
    return {
      relevant: true,
      confidence: 0.72,
      mode: "mission_relevant",
      reason: "La petición comparte términos de dominio con la misión activa.",
      sharedTerms,
    };
  }

  return {
    relevant: false,
    confidence: 0.8,
    mode: "mission_suspended",
    reason: "No hay señales suficientes de que la petición pertenezca a la misión activa.",
    sharedTerms,
  };
}
