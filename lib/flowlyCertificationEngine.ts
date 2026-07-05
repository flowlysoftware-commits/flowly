import type { FlowlyIntelligenceContext } from "@/lib/flowlyIntelligenceContext";
import type { FlowOrchestratorEngineName, FlowOrchestratorMode } from "@/lib/flowlyOrchestrator";
import { evaluateGoalFidelity } from "@/lib/flowlyGoalFidelityGuard";
import { analyzeIntentTransition } from "@/lib/flowlyIntentTransitionGuard";
import { analyzeMissionRelevance, buildIndependentArchitectureCritiqueReply } from "@/lib/flowlyMissionRelevanceFilter";
import { validatePlannerScope } from "@/lib/flowlyPlannerScopeGuard";

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

export type FlowCertificationSuiteCase = {
  id: string;
  title: string;
  layer:
    | "intent"
    | "mission"
    | "evidence"
    | "planner"
    | "scope"
    | "architecture"
    | "execution";
  input: string;
  expected: string;
  passed: boolean;
  severity: "critical" | "high" | "medium" | "low";
  details: string[];
};

export type FlowCertificationSuiteResult = {
  ok: true;
  engine: "flow_certification_suite_v1";
  suite: "flow_certification_regression";
  certified: boolean;
  score: number;
  passed: number;
  failed: number;
  cases: FlowCertificationSuiteCase[];
  certificationGates: string[];
  nextAction: string;
};

function suiteCase(params: Omit<FlowCertificationSuiteCase, "passed"> & { checks: boolean[] }): FlowCertificationSuiteCase {
  return {
    id: params.id,
    title: params.title,
    layer: params.layer,
    input: params.input,
    expected: params.expected,
    severity: params.severity,
    details: params.details,
    passed: params.checks.every(Boolean),
  };
}

function suiteScore(cases: FlowCertificationSuiteCase[]) {
  const weights = { critical: 28, high: 18, medium: 10, low: 5 } as const;
  const penalty = cases
    .filter((item) => !item.passed)
    .reduce((total, item) => total + weights[item.severity], 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}

function buildMockMission() {
  return {
    id: "cert-mission-budget-crm",
    conversation_id: "cert-suite",
    title: "Integrar presupuestos en CRM",
    objective: "Integrar presupuestos dentro del CRM usando app/admin/presupuestos/page.tsx, app/admin/presupuestos/pdf.tsx y app/admin/clientes/page.tsx",
    status: "planning" as const,
    current_step: "plan_ready_waiting_approval",
    current_plan: null,
    approved_plan: null,
    branch: null,
    pull_request_url: null,
    pull_request_number: null,
    last_build_log: null,
    last_error: null,
    details: null,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  };
}

export function runFlowCertificationSuite(): FlowCertificationSuiteResult {
  const mockMission = buildMockMission();
  const crmBudgetInstruction = "Quiero añadir un sistema de presupuestos al CRM.";
  const goodBudgetPlan = [
    "Integrar presupuestos dentro del CRM.",
    "Modificar app/admin/clientes/page.tsx para enlazar presupuestos asociados a clientes.",
    "Modificar app/admin/presupuestos/page.tsx para aceptar contexto de cliente.",
    "Modificar app/admin/presupuestos/pdf.tsx solo si el PDF requiere datos del cliente.",
    "Mantener el CRM dentro del scope de presupuestos sin cambios visuales generales.",
  ].join("\n");
  const badBudgetPlan = "Reorganizar el CRM para que respire mejor y modificar app/docs/studio/page.tsx.";
  const transitionToPlan = analyzeIntentTransition([
    "La evidencia ya está aceptada.",
    "Intent correcto: PLANNING.",
    "Objetivo: Integrar presupuestos dentro del CRM.",
    "Devuelve exactamente qué ya existe, qué falta y riesgos.",
  ].join("\n"));
  const evidenceCheck = analyzeIntentTransition([
    "NO APROBADO.",
    "La petición actual es una verificación de evidencia.",
    "Ejecuta Project Reader real y muestra las primeras 20 líneas reales.",
  ].join("\n"));
  const missionIndependent = analyzeMissionRelevance({
    mission: mockMission,
    instruction: "Actúa como CTO. Quiero crear un BudgetEngine. ¿Lo apruebas o lo rechazas? No planifiques. No implementes. No abras PR.",
  });
  const missionRelevant = analyzeMissionRelevance({
    mission: mockMission,
    instruction: "Implementa exactamente el plan aprobado de presupuestos en CRM.",
  });
  const scopeOk = validatePlannerScope({
    instruction: crmBudgetInstruction,
    files: [
      { path: "app/admin/clientes/page.tsx" },
      { path: "app/admin/presupuestos/page.tsx" },
      { path: "app/admin/presupuestos/pdf.tsx" },
    ],
  });
  const scopeBad = validatePlannerScope({
    instruction: crmBudgetInstruction,
    files: [{ path: "app/docs/studio/page.tsx" }],
  });
  const goalGood = evaluateGoalFidelity({ objective: crmBudgetInstruction, candidate: goodBudgetPlan });
  const goalBad = evaluateGoalFidelity({ objective: crmBudgetInstruction, candidate: badBudgetPlan });
  const budgetEngineReply = buildIndependentArchitectureCritiqueReply("Quiero crear un BudgetEngine para presupuestos.");
  const secondBrainReply = buildIndependentArchitectureCritiqueReply("Quiero crear un segundo Brain solo para CRM.");
  const auditCertified = certifyFlowReasoningResponse({
    instruction: "Haz una auditoría del CRM.",
    mode: "audit",
    activeEngines: ["brain", "docs", "memory", "projectGraph"],
    blockedEngines: ["planning", "executor", "github", "qa"],
    context: {
      sources: [{ path: "docs/product-modules/03-crm.md", title: "CRM", kind: "doc", summary: "CRM" }],
      projectSnapshot: { existingPaths: ["app/admin/clientes/page.tsx", "app/admin/presupuestos/page.tsx"] },
    } as unknown as FlowlyIntelligenceContext,
    reply: [
      "Clasificación del intent: AUDIT.",
      "Motores activados y bloqueados: brain/docs activos; planning/executor/github bloqueados.",
      "Fuentes inspeccionadas: app/admin/clientes/page.tsx, docs/product-modules/03-crm.md.",
      "Hallazgo con evidencia: app/admin/clientes/page.tsx gestiona contactos/clientes.",
      "Qué NO se puede concluir todavía: no hay evidencia suficiente de pipeline completo.",
      "Puntuación Flow Certification por áreas: Arquitectura 8/10.",
      "Veredicto: NO CERTIFICADO.",
    ].join("\n"),
  });
  const genericAudit = certifyFlowReasoningResponse({
    instruction: "Haz una auditoría del CRM.",
    mode: "audit",
    activeEngines: ["brain", "docs", "memory", "projectGraph"],
    blockedEngines: ["planning", "executor", "github", "qa"],
    context: {
      sources: [{ path: "docs/product-modules/03-crm.md", title: "CRM", kind: "doc", summary: "CRM" }],
      projectSnapshot: { existingPaths: ["app/admin/clientes/page.tsx"] },
    } as unknown as FlowlyIntelligenceContext,
    reply: [
      "El CRM debe ser intuitivo.",
      "Se recomienda realizar pruebas de usabilidad, optimizar consultas y aplicar mejores prácticas.",
      "También revisar robots.ts y sitemap.ts.",
    ].join("\n"),
  });

  const cases: FlowCertificationSuiteCase[] = [
    suiteCase({
      id: "CERT-001",
      title: "Intent transition: evidencia aceptada pasa a planificación",
      layer: "intent",
      input: "La evidencia ya está aceptada. Intent correcto: PLANNING.",
      expected: "Debe cambiar a planning y no repetir AUDIT_EVIDENCE_CHECK.",
      severity: "critical",
      checks: [transitionToPlan.intent === "planning", transitionToPlan.mustNotRepeatEvidence, transitionToPlan.hasEnoughPlanningInput],
      details: [transitionToPlan.reason],
    }),
    suiteCase({
      id: "CERT-002",
      title: "Intent transition: verificación explícita conserva Evidence Check",
      layer: "evidence",
      input: "Ejecuta Project Reader real y muestra las primeras 20 líneas.",
      expected: "Debe clasificar como audit_evidence_check.",
      severity: "high",
      checks: [evidenceCheck.intent === "audit_evidence_check", !evidenceCheck.mustNotRepeatEvidence],
      details: [evidenceCheck.reason],
    }),
    suiteCase({
      id: "CERT-003",
      title: "Mission Relevance: crítica CTO no pertenece a misión activa",
      layer: "mission",
      input: "Actúa como CTO. Quiero crear un BudgetEngine. ¿Lo apruebas o lo rechazas?",
      expected: "La misión activa debe suspenderse en este turno.",
      severity: "critical",
      checks: [missionIndependent.mode === "mission_suspended", !missionIndependent.relevant],
      details: [missionIndependent.reason, `Términos compartidos: ${missionIndependent.sharedTerms.join(", ") || "ninguno"}`],
    }),
    suiteCase({
      id: "CERT-004",
      title: "Mission Relevance: ejecución explícita sí pertenece a misión activa",
      layer: "mission",
      input: "Implementa exactamente el plan aprobado de presupuestos en CRM.",
      expected: "La misión activa debe reactivarse para ejecución/aprobación.",
      severity: "high",
      checks: [missionRelevant.mode === "mission_relevant", missionRelevant.relevant],
      details: [missionRelevant.reason],
    }),
    suiteCase({
      id: "CERT-005",
      title: "Goal Fidelity: plan correcto mantiene presupuestos + CRM",
      layer: "planner",
      input: goodBudgetPlan,
      expected: "Debe conservar el objetivo presupuestos + CRM y bloquear reorganización genérica.",
      severity: "critical",
      checks: [goalGood.ok, goalGood.objectiveTerms.includes("presupuestos"), goalGood.objectiveTerms.includes("crm")],
      details: [goalGood.summary, `Términos candidatos: ${goalGood.candidateTerms.join(", ")}`],
    }),
    suiteCase({
      id: "CERT-006",
      title: "Goal Fidelity: reorganizar CRM es drift",
      layer: "planner",
      input: badBudgetPlan,
      expected: "Debe fallar si convierte presupuestos CRM en reorganización visual o archivos ajenos.",
      severity: "critical",
      checks: [!goalBad.ok, goalBad.driftTerms.includes("reorganizar_crm")],
      details: [goalBad.summary, `Drift detectado: ${goalBad.driftTerms.join(", ") || "ninguno"}`],
    }),
    suiteCase({
      id: "CERT-007",
      title: "Scope Guard: archivos validados permitidos",
      layer: "scope",
      input: "Modificar clientes + presupuestos + PDF.",
      expected: "Solo permite los tres archivos validados para la misión presupuestos CRM.",
      severity: "high",
      checks: [scopeOk.ok, scopeOk.blockedFiles.length === 0, scopeOk.safeFiles.length === 3],
      details: [scopeOk.summary],
    }),
    suiteCase({
      id: "CERT-008",
      title: "Scope Guard: archivo fuera de scope bloqueado",
      layer: "scope",
      input: "Modificar app/docs/studio/page.tsx.",
      expected: "Debe bloquear archivos no relacionados salvo nueva evidencia explícita.",
      severity: "critical",
      checks: [!scopeBad.ok, scopeBad.blockedFiles.includes("app/docs/studio/page.tsx")],
      details: [scopeBad.summary],
    }),
    suiteCase({
      id: "CERT-009",
      title: "Engine Duplication Guard: BudgetEngine rechazado",
      layer: "architecture",
      input: "Quiero crear un BudgetEngine.",
      expected: "Debe responder 'Lo rechazo' y defender Brain único / no motores paralelos.",
      severity: "critical",
      checks: [/lo rechazo/i.test(budgetEngineReply), /no apruebo crear un budgetengine/i.test(budgetEngineReply), /motor nuevo|engine|cerebro|brain/i.test(budgetEngineReply)],
      details: [budgetEngineReply.split("\n").slice(0, 4).join(" ")],
    }),
    suiteCase({
      id: "CERT-010",
      title: "Brain único: segundo Brain rechazado",
      layer: "architecture",
      input: "Quiero crear un segundo Brain solo para CRM.",
      expected: "Debe rechazar un segundo Brain y preservar el único cerebro compartido.",
      severity: "critical",
      checks: [/lo rechazo/i.test(secondBrainReply), /segundo brain/i.test(secondBrainReply), /único Brain|unico brain|brain compartido/i.test(secondBrainReply)],
      details: [secondBrainReply.split("\n").slice(0, 4).join(" ")],
    }),
    suiteCase({
      id: "CERT-011",
      title: "Auditoría con evidencia supera contrato",
      layer: "evidence",
      input: "Haz una auditoría del CRM.",
      expected: "Debe citar fuentes reales, declarar motores y terminar con veredicto.",
      severity: "high",
      checks: [auditCertified.score >= 82, auditCertified.checks.filter((item) => !item.passed && item.severity === "critical").length === 0],
      details: [auditCertified.summary],
    }),
    suiteCase({
      id: "CERT-012",
      title: "Auditoría genérica queda no certificada",
      layer: "evidence",
      input: "Auditoría CRM con checklist genérico y SEO sin evidencia.",
      expected: "Debe fallar por falta de evidencia y genericidad.",
      severity: "critical",
      checks: [!genericAudit.certified, genericAudit.score < 82],
      details: [genericAudit.summary],
    }),
  ];

  const score = suiteScore(cases);
  const failedCases = cases.filter((item) => !item.passed);
  const certified = score >= 90 && failedCases.filter((item) => item.severity === "critical").length === 0;

  return {
    ok: true,
    engine: "flow_certification_suite_v1",
    suite: "flow_certification_regression",
    certified,
    score,
    passed: cases.length - failedCases.length,
    failed: failedCases.length,
    cases,
    certificationGates: [
      "Intent Transition Guard debe permitir evidencia → planificación sin quedarse atascado.",
      "Mission Relevance Filter debe impedir que una misión activa contamine preguntas independientes.",
      "Planner debe mantener Goal Fidelity y no convertir objetivos técnicos en mejoras genéricas.",
      "Planner Scope Guard debe bloquear archivos fuera de la evidencia validada.",
      "Architecture/CTO guard debe rechazar Brains o Engines duplicados.",
      "Auditorías deben basarse en evidencia real y no en checklists genéricos.",
    ],
    nextAction: certified
      ? "Flow Certification Suite v1 certificada. Ejecutar esta ruta tras cada cambio del pipeline Developer."
      : "Flow Certification Suite v1 no certificada. Corregir los casos fallidos antes de aprobar cambios del pipeline Developer.",
  };
}
