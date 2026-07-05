import type { FlowlyIntelligenceContext } from "@/lib/flowlyIntelligenceContext";
import type { FlowOrchestratorEngineName, FlowOrchestratorMode } from "@/lib/flowlyOrchestrator";

export type FlowCertificationCheckId =
  | "intent_gate"
  | "engine_scope"
  | "grounding"
  | "evidence"
  | "genericity"
  | "audit_contract"
  | "execution_block";

export type FlowCertificationCheck = {
  id: FlowCertificationCheckId;
  title: string;
  passed: boolean;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
};

export type FlowCertificationResult = {
  ok: true;
  engine: "flow_certification_v1";
  certified: boolean;
  score: number;
  mode: FlowOrchestratorMode;
  target: string;
  checks: FlowCertificationCheck[];
  summary: string;
  requiredFormat: string[];
};

export type FlowCertificationInput = {
  instruction: string;
  mode: FlowOrchestratorMode;
  activeEngines: FlowOrchestratorEngineName[];
  blockedEngines: FlowOrchestratorEngineName[];
  context?: FlowlyIntelligenceContext | null;
  reply?: string;
};

const FORBIDDEN_GENERIC_FILES = [
  "index.html",
  "about.html",
  "blog.html",
  "header.php",
  "footer.php",
  "functions.php",
];

const GENERIC_AUDIT_PHRASES = [
  "debe ser intuitivo",
  "realizar pruebas de usabilidad",
  "optimizar consultas",
  "revisiones de código regulares",
  "documentación esté actualizada",
  "implementar métricas",
  "herramientas de análisis",
  "mejores prácticas",
  "áreas de mejora",
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function targetFromInstruction(instruction: string, context?: FlowlyIntelligenceContext | null) {
  const text = normalize(instruction);
  if (text.includes("crm") || text.includes("cliente") || text.includes("lead")) return "CRM";
  if (text.includes("developer")) return "Developer";
  if (text.includes("companion")) return "Companion";
  if (text.includes("factur")) return "Facturación";
  return context?.contextSummary?.target || "Flowly OS";
}

function existingPaths(context?: FlowlyIntelligenceContext | null) {
  return context?.projectSnapshot?.existingPaths || [];
}

function sources(context?: FlowlyIntelligenceContext | null) {
  return context?.sources || [];
}

function pathsForTarget(target: string, context?: FlowlyIntelligenceContext | null) {
  const targetText = normalize(target);
  const repoPaths = existingPaths(context);
  const sourcePaths = sources(context).map((source) => source.path);
  const all = unique([...repoPaths, ...sourcePaths]);

  if (targetText.includes("crm")) {
    return all.filter((path) => /crm|customer|cliente|lead|opportunit|contact/i.test(path)).slice(0, 24);
  }

  if (targetText.includes("developer")) {
    return all.filter((path) => /developer|pipeline|executor|qa|mission|intent|reasoning|guard|projectreader/i.test(path)).slice(0, 24);
  }

  return all.slice(0, 24);
}

function hasForbiddenFile(reply: string) {
  const text = normalize(reply);
  return FORBIDDEN_GENERIC_FILES.find((file) => text.includes(file));
}

function countGenericAuditPhrases(reply: string) {
  const text = normalize(reply);
  return GENERIC_AUDIT_PHRASES.filter((phrase) => text.includes(normalize(phrase))).length;
}

function check(condition: boolean, params: Omit<FlowCertificationCheck, "passed">): FlowCertificationCheck {
  return { ...params, passed: condition };
}

function scoreChecks(checks: FlowCertificationCheck[]) {
  const weights = { critical: 34, high: 22, medium: 13, low: 7 } as const;
  const penalty = checks
    .filter((item) => !item.passed)
    .reduce((total, item) => total + weights[item.severity], 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}

export function buildFlowCertificationPrompt(input: FlowCertificationInput) {
  const target = targetFromInstruction(input.instruction, input.context);
  const targetPaths = pathsForTarget(target, input.context);
  const sourcePaths = sources(input.context).map((source) => source.path);

  if (input.mode !== "audit") {
    return [
      "FLOW CERTIFICATION CONTRACT",
      `- Intent clasificado: ${input.mode}.`,
      `- Target detectado: ${target}.`,
      `- Motores activos permitidos: ${input.activeEngines.join(", ") || "ninguno"}.`,
      `- Motores bloqueados: ${input.blockedEngines.join(", ") || "ninguno"}.`,
      "- No inventes archivos. No actives motores bloqueados. No propongas ejecución si el modo no lo permite.",
    ].join("\n");
  }

  return [
    "FLOW CERTIFICATION CONTRACT PARA AUDITORÍAS",
    `Target auditado: ${target}.`,
    `Motores activos permitidos: ${input.activeEngines.join(", ") || "ninguno"}.`,
    `Motores bloqueados: ${input.blockedEngines.join(", ") || "ninguno"}.`,
    "Formato obligatorio:",
    "1. Clasificación del intent: AUDIT.",
    "2. Motores activados y motores bloqueados.",
    "3. Fuentes inspeccionadas: archivos/docs/rutas concretas del contexto.",
    "4. Hallazgos con evidencia: cada hallazgo debe apoyarse en una fuente real o decir 'no certificado por falta de evidencia'.",
    "5. Qué NO se puede concluir todavía.",
    "6. Puntuación Flow Certification por áreas.",
    "7. Veredicto: CERTIFICADO o NO CERTIFICADO.",
    "Reglas:",
    "- No uses checklist genérico.",
    "- No hables de SEO en auditoría CRM salvo que cites una fuente real y expliques por qué afecta al CRM.",
    "- No menciones index.html, about.html, blog.html, header.php ni archivos ajenos al snapshot.",
    "- Si no hay evidencia suficiente para auditar una capa, dilo; no rellenes huecos.",
    "Fuentes candidatas del target:",
    ...(targetPaths.length ? targetPaths.map((path) => `- ${path}`) : ["- No hay fuentes específicas detectadas para este target."]),
    "Fuentes de documentación cargadas:",
    ...(sourcePaths.length ? sourcePaths.slice(0, 18).map((path) => `- ${path}`) : ["- No hay docs cargados."]),
  ].join("\n");
}

export function certifyFlowReasoningResponse(input: FlowCertificationInput): FlowCertificationResult {
  const reply = input.reply || "";
  const normalizedReply = normalize(reply);
  const target = targetFromInstruction(input.instruction, input.context);
  const targetPaths = pathsForTarget(target, input.context);
  const forbiddenFile = hasForbiddenFile(reply);
  const genericCount = countGenericAuditPhrases(reply);
  const sourcePaths = sources(input.context).map((source) => source.path);
  const mentionedTargetPath = targetPaths.some((path) => normalizedReply.includes(normalize(path)));
  const mentionedAnySource = [...targetPaths, ...sourcePaths]
    .filter(Boolean)
    .some((path) => normalizedReply.includes(normalize(path)));
  const mentionsSeoInCrmAudit = input.mode === "audit" && target === "CRM" && /\bseo\b|robots\.ts|sitemap\.ts|open graph|twitter/i.test(reply);
  const hasSeoEvidence = mentionsSeoInCrmAudit && /app\/|docs\/|public\//i.test(reply) && /crm|cliente|lead|dashboard/i.test(reply);

  const checks: FlowCertificationCheck[] = [
    check(Boolean(reply.trim()), {
      id: "intent_gate",
      title: "Respuesta generada",
      severity: "critical",
      message: reply.trim() ? "Hay respuesta final para certificar." : "No existe respuesta final.",
    }),
    check(!forbiddenFile, {
      id: "grounding",
      title: "Grounding de archivos",
      severity: "critical",
      message: forbiddenFile ? `La respuesta menciona un archivo no verificado: ${forbiddenFile}.` : "No se han detectado archivos genéricos ajenos al proyecto.",
    }),
    check(input.blockedEngines.includes("executor") ? !/pull request|crear pr|ejecutar|executor|github/i.test(reply) || /bloquead/i.test(reply) : true, {
      id: "execution_block",
      title: "Bloqueo de ejecución",
      severity: "high",
      message: "La respuesta no debe activar ejecución cuando Executor/GitHub están bloqueados.",
    }),
    check(input.mode !== "audit" || /intent|intención|intencion/i.test(reply), {
      id: "audit_contract",
      title: "Intent explícito en auditoría",
      severity: "medium",
      message: "Una auditoría certificable debe declarar la clasificación de intent.",
    }),
    check(input.mode !== "audit" || /motores|engines|activados|bloqueados/i.test(reply), {
      id: "engine_scope",
      title: "Motores declarados",
      severity: "high",
      message: "Una auditoría debe explicar qué motores se activaron y cuáles quedaron bloqueados.",
    }),
    check(input.mode !== "audit" || mentionedTargetPath || mentionedAnySource, {
      id: "evidence",
      title: "Evidencia real",
      severity: "critical",
      message: mentionedTargetPath || mentionedAnySource
        ? "La respuesta cita al menos una fuente real del contexto."
        : "La auditoría no cita archivos ni docs reales; parece genérica.",
    }),
    check(input.mode !== "audit" || genericCount <= 2, {
      id: "genericity",
      title: "No genericidad",
      severity: "high",
      message: genericCount > 2
        ? `Demasiadas frases de checklist genérico detectadas (${genericCount}).`
        : "No parece depender de un checklist genérico dominante.",
    }),
    check(!mentionsSeoInCrmAudit || hasSeoEvidence, {
      id: "evidence",
      title: "SEO contextualizado",
      severity: "high",
      message: mentionsSeoInCrmAudit && !hasSeoEvidence
        ? "La auditoría CRM habla de SEO sin evidencia ni relación clara con CRM."
        : "No hay SEO fuera de contexto, o está justificado con evidencia.",
    }),
    check(input.mode !== "audit" || /certificado|no certificado|veredicto/i.test(reply), {
      id: "audit_contract",
      title: "Veredicto final",
      severity: "medium",
      message: "Una auditoría debe terminar con veredicto de certificación.",
    }),
  ];

  const score = scoreChecks(checks);
  const certified = score >= 82 && checks.filter((item) => !item.passed && item.severity === "critical").length === 0;

  return {
    ok: true,
    engine: "flow_certification_v1",
    certified,
    score,
    mode: input.mode,
    target,
    checks,
    summary: certified
      ? `CERTIFICADO (${score}/100): respuesta suficientemente grounded para ${target}.`
      : `NO CERTIFICADO (${score}/100): la respuesta necesita más evidencia real antes de aprobarse.`,
    requiredFormat: input.mode === "audit"
      ? [
          "Clasificación del intent",
          "Motores activados/bloqueados",
          "Fuentes inspeccionadas",
          "Hallazgos con evidencia",
          "Límites de la auditoría",
          "Puntuación por áreas",
          "Veredicto Flow Certification",
        ]
      : ["Respetar intent", "No activar motores bloqueados", "No inventar archivos"],
  };
}

export function buildCertificationFailureReply(input: FlowCertificationInput, result: FlowCertificationResult) {
  const failed = result.checks.filter((item) => !item.passed);
  const targetPaths = pathsForTarget(result.target, input.context);

  return [
    `FLOW CERTIFICATION: NO CERTIFICADO (${result.score}/100)`,
    "No voy a aprobar esta respuesta porque no supera el estándar mínimo de Developer como ingeniero real.",
    "",
    `Intent clasificado: ${input.mode.toUpperCase()}`,
    `Target: ${result.target}`,
    `Motores activados: ${input.activeEngines.join(", ") || "ninguno"}`,
    `Motores bloqueados: ${input.blockedEngines.join(", ") || "ninguno"}`,
    "",
    "Fallos detectados:",
    ...failed.map((item) => `- ${item.title}: ${item.message}`),
    "",
    "Fuentes reales disponibles para rehacer la respuesta:",
    ...(targetPaths.length ? targetPaths.slice(0, 14).map((path) => `- ${path}`) : ["- No hay fuentes específicas detectadas para este target en el contexto actual."]),
    "",
    "Decisión CTO: una auditoría sin evidencia concreta no se entrega como válida. Developer debe volver a construir contexto, citar fuentes reales y producir hallazgos verificables antes de proponer cambios.",
  ].join("\n");
}

export function runFlowCertificationSuite() {
  const cases = [
    {
      name: "Consulta CRM no activa planificación",
      input: "Explícame cómo funciona el CRM.",
      expectedMode: "consultation",
      expectedBlocked: ["planning", "executor", "github", "qa"],
    },
    {
      name: "Auditoría CRM exige evidencia",
      input: "Haz una auditoría del CRM.",
      expectedMode: "audit",
      expectedBlocked: ["planning", "executor", "github", "qa"],
    },
    {
      name: "Ejecución no puede ocurrir sin aprobación previa",
      input: "Hazlo.",
      expectedMode: "execution",
      expectedRequiresMission: true,
    },
  ];

  return {
    ok: true,
    engine: "flow_certification_v1",
    suite: "flow_certification_baseline",
    cases,
    acceptanceCriteria: [
      "Intent Engine debe diferenciar consulta, auditoría, planificación, ejecución, bug, QA y deploy.",
      "Mission Engine debe bloquear replanning cuando hay misión/PR activo.",
      "Reasoning Pipeline debe pasar por Critic antes de respuesta final.",
      "Grounding Guard debe impedir archivos inventados.",
      "Auditorías deben citar fuentes reales y terminar con veredicto de certificación.",
      "Executor/GitHub solo se activan con aprobación y plan congelado.",
      "Build Guard y QA son obligatorios antes de considerar terminado un cambio.",
    ],
  };
}
