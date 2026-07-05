export type FlowlyIntentTransition = {
  intent: "planning" | "audit_evidence_check" | "unknown";
  reason: string;
  mustNotRepeatEvidence: boolean;
  hasEnoughPlanningInput: boolean;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const PLANNING_TRANSITION_PATTERNS = [
  /con\s+esa\s+evidencia/,
  /evidencia\s+ya\s+(esta|est[aá])\s+(aceptada|validada|entregada)/,
  /ahora\s+(vuelve\s+a\s+)?planifica/,
  /convierte\s+(esa\s+)?(propuesta|evidencia)\s+en\s+(un\s+)?plan/,
  /plan\s+tecnico/,
  /planificaci[oó]n\s+para/,
];

const EXPLICIT_EVIDENCE_PATTERNS = [
  /verifica(r|cion|ci[oó]n)?\s+(de\s+)?evidencia/,
  /comprueba(r)?\s+(la\s+)?evidencia/,
  /lee\s+(los\s+)?archivos/,
  /muestra\s+(las\s+)?primeras\s+\d+\s+lineas/,
  /primeras\s+\d+\s+lineas\s+reales/,
  /project\s+reader\s+real/,
  /si\s+existe\s+o\s+no\s+existe/,
];

export function analyzeIntentTransition(instruction: string): FlowlyIntentTransition {
  const text = normalize(instruction);
  const asksPlanningTransition = PLANNING_TRANSITION_PATTERNS.some((pattern) => pattern.test(text));
  const asksEvidence = EXPLICIT_EVIDENCE_PATTERNS.some((pattern) => pattern.test(text));
  const hasBudgetCrmGoal = /presupuesto|presupuestos|budget/.test(text) && /crm|cliente|clientes|contacto|contactos/.test(text);
  const hasRequestedPlanFormat = /que\s+ya\s+existe/.test(text) && /que\s+falta/.test(text) && /riesgos/.test(text);
  const hasEnoughPlanningInput = hasBudgetCrmGoal || (asksPlanningTransition && hasRequestedPlanFormat);

  if (asksPlanningTransition || (hasRequestedPlanFormat && !asksEvidence)) {
    return {
      intent: "planning",
      reason: "El usuario aceptó o reutiliza evidencia previa y pide convertirla en plan técnico.",
      mustNotRepeatEvidence: true,
      hasEnoughPlanningInput,
    };
  }

  if (asksEvidence) {
    return {
      intent: "audit_evidence_check",
      reason: "El usuario pide verificar archivos o mostrar líneas reales.",
      mustNotRepeatEvidence: false,
      hasEnoughPlanningInput: false,
    };
  }

  return {
    intent: "unknown",
    reason: "No hay transición explícita de intent.",
    mustNotRepeatEvidence: false,
    hasEnoughPlanningInput,
  };
}

export function mustTreatAsPlanningTransition(instruction: string) {
  return analyzeIntentTransition(instruction).intent === "planning";
}

export function blocksUnnecessaryClarification(instruction: string) {
  const transition = analyzeIntentTransition(instruction);
  return transition.intent === "planning" && transition.hasEnoughPlanningInput;
}
