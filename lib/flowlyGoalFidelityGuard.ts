export type FlowlyGoalFidelityResult = {
  ok: boolean;
  score: number;
  objectiveTerms: string[];
  candidateTerms: string[];
  missingTerms: string[];
  driftTerms: string[];
  summary: string;
};

const GROUPS = [
  { key: "presupuestos", terms: ["presupuesto", "presupuestos", "budget", "budgets", "cotizacion", "cotización"] },
  { key: "crm", terms: ["crm", "cliente", "clientes", "contacto", "contactos", "lead", "leads", "oportunidad", "oportunidades", "customer"] },
  { key: "facturacion", terms: ["factura", "facturas", "facturacion", "facturación", "invoice", "billing"] },
  { key: "whatsapp", terms: ["whatsapp", "wa", "mensaje", "mensajes"] },
  { key: "developer", terms: ["developer", "planner", "planificador", "mission", "evidence", "certification", "certificacion", "certificación"] },
  { key: "companion", terms: ["companion", "avatar", "mascota", "asistente"] },
  { key: "seo", terms: ["seo", "metadata", "metadatos", "robots", "sitemap", "opengraph", "open graph"] },
];

const DRIFT_PATTERNS = [
  { key: "reorganizar_crm", pattern: /reorganiz|respir|saturad|layout|distribuci[oó]n/i, allowedBy: ["ux", "diseño", "diseño", "layout", "reorganizar", "interfaz"] },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function extractGoalTerms(value: string) {
  const text = normalize(value);
  return GROUPS.filter((group) => group.terms.some((term) => text.includes(normalize(term)))).map((group) => group.key);
}

export function evaluateGoalFidelity(params: { objective: string; candidate: string }): FlowlyGoalFidelityResult {
  const objective = normalize(params.objective);
  const candidate = normalize(params.candidate);
  const objectiveTerms = extractGoalTerms(objective);
  const candidateTerms = extractGoalTerms(candidate);
  const missingTerms = objectiveTerms.filter((term) => !candidateTerms.includes(term));
  const driftTerms = DRIFT_PATTERNS
    .filter((item) => item.pattern.test(candidate) && !item.allowedBy.some((term) => objective.includes(normalize(term))))
    .map((item) => item.key);

  const coverage = objectiveTerms.length ? (objectiveTerms.length - missingTerms.length) / objectiveTerms.length : 1;
  const driftPenalty = driftTerms.length ? 0.35 : 0;
  const score = Math.max(0, Math.round((coverage - driftPenalty) * 100));
  const ok = score >= 70 && driftTerms.length === 0;

  return {
    ok,
    score,
    objectiveTerms,
    candidateTerms,
    missingTerms,
    driftTerms,
    summary: ok
      ? `Goal Fidelity OK (${score}/100): el plan mantiene el objetivo detectado.`
      : `Goal Fidelity bloqueado (${score}/100): el plan se desvía del objetivo o pierde términos críticos.`,
  };
}

export function isBudgetCrmObjective(instruction: string) {
  const terms = extractGoalTerms(instruction);
  return terms.includes("presupuestos") && terms.includes("crm");
}
