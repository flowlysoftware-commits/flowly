import { buildDeveloperContextBundle, summarizeDeveloperContext, type DeveloperContextBundle } from "@/lib/flowlyDeveloperContextEngine";
import { analyzeFlowlyImpact, buildFlowlyProjectGraph, summarizeProjectGraph } from "@/lib/flowlyProjectGraph";
import { callFlowlyOpenAI } from "@/lib/flowlyOpenAI";

export type FlowOrchestratorMode =
  | "audit"
  | "consultation"
  | "planning"
  | "execution"
  | "qa"
  | "conversation"
  | "diagnostic";

export type FlowOrchestratorIntent =
  | "audit_project"
  | "ask_architecture"
  | "ask_current_plan"
  | "new_change"
  | "approve_change"
  | "fix_error"
  | "continue_session"
  | "diagnose_orchestrator";

export type FlowOrchestratorEngineName =
  | "brain"
  | "docs"
  | "memory"
  | "projectGraph"
  | "planning"
  | "executor"
  | "github"
  | "qa"
  | "learning";

export type FlowOrchestratorDecision = {
  ok: true;
  engine: "flow_orchestrator_v1";
  intent: FlowOrchestratorIntent;
  mode: FlowOrchestratorMode;
  shouldPlan: boolean;
  shouldExecute: boolean;
  requiresApproval: boolean;
  refinedInstruction: string;
  reply: string;
  currentObjective: string;
  activeEngines: FlowOrchestratorEngineName[];
  blockedEngines: FlowOrchestratorEngineName[];
  guardrails: string[];
  reasoning: string[];
  audit?: FlowAuditReport;
};

export type FlowAuditReport = {
  title: string;
  summary: string;
  sourcesRead: Array<{ path: string; title: string; kind: string }>;
  projectStats: {
    totalFiles?: number;
    routes?: number;
    apiRoutes?: number;
    components?: number;
    modules: string[];
  };
  sections: Array<{
    title: string;
    verdict: string;
    strengths: string[];
    risks: string[];
    recommendations: string[];
  }>;
  roadmap: Array<{ priority: "crítica" | "alta" | "media" | "baja"; title: string; reason: string }>;
};

type OrchestratorInput = {
  instruction: string;
  conversationId?: string;
  history?: Array<{ role?: string; text?: string }>;
  currentPlan?: unknown;
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

function hasCurrentPlan(currentPlan: unknown) {
  return Boolean(currentPlan && typeof currentPlan === "object" && ("summary" in currentPlan || "instruction" in currentPlan));
}

function detectIntent(input: OrchestratorInput): FlowOrchestratorIntent {
  const text = normalize(input.instruction);
  const plan = hasCurrentPlan(input.currentPlan);

  const forbidsAudit = hasAny(text, ["no hagas auditoria", "no quiero auditoria", "la auditoria ya estaba hecha", "no hagas otra auditoria"]);
  const forbidsExecution = hasAny(text, ["no escribas codigo", "no modifiques", "no ejecutes", "no hagas pr", "no crees pr", "no crees rama"]);
  const wantsInternalDiagnostic = hasAny(text, [
    "fallo del intent classifier",
    "fallo del orchestrator",
    "por que el orchestrator",
    "por que clasificaste",
    "has clasificado mal",
    "developer respondio mal",
    "mejorar developer",
  ]);
  const wantsPlan = hasAny(text, [
    "plan",
    "roadmap",
    "fase",
    "convierte esto en plan",
    "convierte esa fase en un plan",
    "prepara propuesta",
    "que archivos tocarias",
    "qué archivos tocarías",
    "no ejecutes codigo todavia",
    "no modifiques codigo todavia",
  ]);
  const wantsAudit = !forbidsAudit && hasAny(text, [
    "auditoria completa",
    "auditar el proyecto",
    "audita el proyecto",
    "analiza todo flowly",
    "analizar todo flowly",
    "revision completa del proyecto",
    "revisión completa del proyecto",
  ]);

  if (wantsInternalDiagnostic) return "diagnose_orchestrator";
  if (wantsPlan) return "new_change";
  if (wantsAudit) return "audit_project";
  if (hasAny(text, ["error", "build", "vercel", "typescript", "no compila", "fallo", "arregla este error"])) return "fix_error";
  if (!forbidsExecution && /^(ok|vale|adelante|hazlo|aprobado|aplica|ejecuta|si|sí)\b/.test(text)) return "approve_change";
  if (hasAny(text, ["continua", "continúa", "sigue", "seguimos", "lo de antes"])) return "continue_session";
  if (plan && (text.includes("?") || /^(que|qué|como|cómo|por que|por qué|dime|explica|cual|cu[aá]l|y\b)/.test(text))) return "ask_current_plan";
  if (text.includes("?") || forbidsExecution || hasAny(text, ["que opinas", "qué opinas", "como lo harias", "cómo lo harías", "recomienda", "valora", "diagnostica", "informe"])) return "ask_architecture";
  return "new_change";
}

function modeForIntent(intent: FlowOrchestratorIntent): FlowOrchestratorMode {
  if (intent === "audit_project") return "audit";
  if (intent === "ask_architecture" || intent === "ask_current_plan") return "consultation";
  if (intent === "approve_change") return "execution";
  if (intent === "fix_error") return "qa";
  if (intent === "diagnose_orchestrator") return "diagnostic";
  if (intent === "continue_session") return "conversation";
  return "planning";
}

function enginePolicy(mode: FlowOrchestratorMode) {
  if (mode === "audit" || mode === "consultation" || mode === "diagnostic") {
    return {
      activeEngines: ["brain", "docs", "memory", "projectGraph"] as FlowOrchestratorEngineName[],
      blockedEngines: ["planning", "executor", "github", "qa", "learning"] as FlowOrchestratorEngineName[],
      shouldPlan: false,
      shouldExecute: false,
      requiresApproval: false,
    };
  }

  if (mode === "execution") {
    return {
      activeEngines: ["brain", "memory", "planning", "executor", "github", "qa"] as FlowOrchestratorEngineName[],
      blockedEngines: [] as FlowOrchestratorEngineName[],
      shouldPlan: false,
      shouldExecute: true,
      requiresApproval: true,
    };
  }

  if (mode === "qa") {
    return {
      activeEngines: ["brain", "memory", "projectGraph", "qa", "github"] as FlowOrchestratorEngineName[],
      blockedEngines: ["executor"] as FlowOrchestratorEngineName[],
      shouldPlan: true,
      shouldExecute: false,
      requiresApproval: true,
    };
  }

  return {
    activeEngines: ["brain", "docs", "memory", "projectGraph", "planning"] as FlowOrchestratorEngineName[],
    blockedEngines: ["executor", "github", "qa", "learning"] as FlowOrchestratorEngineName[],
    shouldPlan: true,
    shouldExecute: false,
    requiresApproval: true,
  };
}

function buildGuardrails(mode: FlowOrchestratorMode) {
  const base = [
    "No tocar main directamente.",
    "No crear PR sin aprobación explícita.",
    "No duplicar Brain, Memory, Heart, Voice, Executor ni QA.",
    "Explicar primero el cambio en lenguaje de producto y solo después enseñar archivos técnicos.",
  ];

  if (mode === "audit" || mode === "consultation" || mode === "diagnostic") {
    return [
      ...base,
      "Modo análisis: Executor, GitHub y PR quedan bloqueados.",
      "Responder con diagnóstico, crítica y roadmap; no proponer ejecución inmediata.",
    ];
  }

  return [
    ...base,
    "Preflight y Build Guard deben ejecutarse antes de considerar seguro cualquier PR.",
  ];
}

function sourceList(bundle: DeveloperContextBundle) {
  return bundle.loadedSources.slice(0, 18).map((source) => ({ path: source.path, title: source.title, kind: source.kind }));
}

function buildAuditSections(params: {
  bundle: DeveloperContextBundle;
  graphSummary: ReturnType<typeof summarizeProjectGraph> | null;
  impact: Awaited<ReturnType<typeof analyzeFlowlyImpact>> | null;
}): FlowAuditReport["sections"] {
  const modules = params.graphSummary?.modules?.map((item) => item.name).slice(0, 8) || [];
  const warnings = params.bundle.warnings.length ? params.bundle.warnings : ["La auditoría debe ampliarse por fases antes de ejecutar cambios masivos."];

  return [
    {
      title: "Arquitectura",
      verdict: "Flowly ya tiene una arquitectura avanzada, pero necesita que el Orchestrator decida cuándo analizar, planificar o ejecutar para evitar PRs prematuros.",
      strengths: ["Brain, Docs, Project Graph, Executor, QA y Build Guard ya existen como piezas separadas.", "La documentación de /docs permite razonar con memoria técnica."],
      risks: ["El pipeline puede saltar demasiado rápido a ejecución.", "Las misiones grandes pueden mezclarse con cambios pequeños si no se clasifican antes."],
      recommendations: ["Usar Flow Orchestrator como primera puerta de entrada.", "Bloquear Executor en auditorías, consultas y diagnósticos."],
    },
    {
      title: "Diseño y UX",
      verdict: "El producto transmite más potencia en las demos que en varios paneles reales; conviene unificar paneles alrededor de un Design System.",
      strengths: ["Las demos tienen mejor jerarquía visual, más aire y sensación premium.", "Developer y Panel Admin ya apuntan a un centro de mando vivo."],
      risks: ["Paneles reales pueden parecer menos prácticos que lo vendido en la demo.", "Inconsistencias visuales reducen confianza en conversión."],
      recommendations: ["Migrar pantalla por pantalla a componentes UI comunes.", "Priorizar Dashboard, CRM, Contabilidad, Developer y Panel Admin."],
    },
    {
      title: "Conversión",
      verdict: "La home debe vender resultado y no solo funcionalidades: menos CRM/ERP como lista técnica y más promesa directa de ahorro, ventas y automatización.",
      strengths: ["Ya hay analítica de CTA, scroll, precios y funnel.", "La landing /automatiza permite campañas más enfocadas."],
      risks: ["Si solo el 1% hace clic, el problema está en propuesta, CTA o primer bloque.", "El flujo Home → Precios → Stripe → Registro necesita medir cada abandono."],
      recommendations: ["Mantener CTA principal único hacia /precios o landing específica.", "Crear landings por intención: CRM con IA, ERP con IA, WhatsApp, automatización."],
    },
    {
      title: "SEO",
      verdict: "Flowly necesita SEO técnico completo y landings por intención para competir con búsquedas de CRM con IA, ERP con IA y automatización empresarial.",
      strengths: ["Ya se ha empezado con favicon, landing y eventos.", "El producto tiene una categoría diferenciadora: IA que trabaja por tu empresa."],
      risks: ["SEO genérico de SaaS compite contra actores enormes.", "Sin Schema, sitemap, canonical y landings específicas se pierde intención de compra."],
      recommendations: ["Implementar SEO en fases: técnico, schema, landings, contenido.", "No hacer un cambio masivo sin auditoría y build limpio por fase."],
    },
    {
      title: "Performance",
      verdict: "La prioridad debe ser medir Core Web Vitals reales antes de optimizar a ciegas.",
      strengths: ["Next.js App Router permite metadata, lazy loading y segmentación por rutas.", "La analítica propia puede ampliarse con tiempos de carga y scroll."],
      risks: ["Paneles muy visuales pueden cargar demasiado JS si no se separan bien.", "Imágenes y animaciones del Companion pueden afectar LCP/CLS."],
      recommendations: ["Auditar bundles por ruta.", "Lazy load del Companion fuera de landings públicas y optimización de imágenes."],
    },
    {
      title: "Developer / Flow Studio",
      verdict: "Developer ya tiene buena base, pero debe dejar de ser executor-first y pasar a orchestrator-first.",
      strengths: ["Existe Build Guard, Session Engine, Intelligence Engine y Pipeline.", "Puede crear PRs y conectar con GitHub."],
      risks: ["Sin clasificación de intención, una auditoría puede convertirse en propuesta de PR.", "Sin memoria de misión persistente, la conversación se siente forzada."],
      recommendations: ["Añadir Intent Classifier y Flow Orchestrator como puerta de entrada.", "Separar mensajes de estado, informes, planes y ejecuciones."],
    },
    {
      title: "Companion",
      verdict: "Flow debe ser un ser digital con estado, memoria y presencia, pero todavía no conviene mezclar voz, avatar y ejecución hasta que el runtime sea estable.",
      strengths: ["Ya existe Companion Runtime y estilo tipo Copilot Dock.", "La visión de Brain, Heart y Memory está bien documentada."],
      risks: ["Crear motores paralelos de voz o conversación duplicaría arquitectura.", "Animación sin comportamiento inteligente puede sentirse decorativa."],
      recommendations: ["Primero estados conversacionales visibles.", "Después movimiento, labios, emociones y memoria contextual."],
    },
    {
      title: "Calidad de código",
      verdict: "El proyecto debe evolucionar por sprints pequeños con build limpio, porque ya tiene suficiente tamaño como para que los cambios masivos sean peligrosos.",
      strengths: [`Módulos detectados: ${modules.join(", ") || "Flowly OS, Developer, Companion, CRM"}.`, "Hay separación razonable entre app, lib, docs y supabase."],
      risks: warnings,
      recommendations: ["Aplicar cambios por PR pequeño y revisable.", "Usar Build Guard + QA antes de merge."],
    },
  ];
}

function buildAuditReply(report: FlowAuditReport) {
  const sections = report.sections
    .map((section) => {
      return [
        `## ${section.title}`,
        section.verdict,
        "",
        `Bien: ${section.strengths.join(" ")}`,
        `Riesgos: ${section.risks.join(" ")}`,
        `Recomendación: ${section.recommendations.join(" ")}`,
      ].join("\n");
    })
    .join("\n\n");

  const roadmap = report.roadmap
    .map((item, index) => `${index + 1}. [${item.priority.toUpperCase()}] ${item.title}: ${item.reason}`)
    .join("\n");

  return [
    "He entendido que esto es una AUDITORÍA, no una tarea de ejecución.",
    "Por seguridad he bloqueado Executor, GitHub y Pull Request. Solo he activado Brain, Docs, Memory y Project Graph.",
    "",
    `# ${report.title}`,
    report.summary,
    "",
    `Documentos leídos: ${report.sourcesRead.slice(0, 8).map((source) => source.path).join(", ") || "AI_BOOTSTRAP.md, docs/SUMMARY.md"}.`,
    `Mapa del proyecto: ${report.projectStats.totalFiles || 0} archivos, ${report.projectStats.routes || 0} rutas, ${report.projectStats.apiRoutes || 0} APIs, ${report.projectStats.components || 0} componentes.`,
    "",
    sections,
    "",
    "# Roadmap recomendado",
    roadmap,
    "",
    "Siguiente paso recomendado: elegimos una sola fase crítica y la convertimos en plan pequeño. No ejecutaría cambios masivos de SEO, Companion o Developer en un único PR.",
  ].join("\n");
}

async function buildAuditReport(instruction: string): Promise<FlowAuditReport> {
  const [bundle, graph, impact] = await Promise.all([
    buildDeveloperContextBundle(instruction),
    buildFlowlyProjectGraph(instruction).catch(() => null),
    analyzeFlowlyImpact(instruction).catch(() => null),
  ]);

  const graphSummary = graph ? summarizeProjectGraph(graph) : null;
  const contextSummary = summarizeDeveloperContext(bundle);
  const modules = graphSummary?.modules?.map((module) => module.name).filter(Boolean).slice(0, 12) || [];

  return {
    title: "Auditoría CTO de Flowly OS",
    summary: `He analizado Flowly como sistema operativo empresarial, no como una web suelta. El foco principal detectado por el Context Engine es ${contextSummary.target || "Flowly OS"}, pero la auditoría cubre arquitectura, diseño, UX, conversión, SEO, performance, Developer y Companion.`,
    sourcesRead: sourceList(bundle),
    projectStats: {
      totalFiles: graphSummary?.totalFiles,
      routes: graphSummary?.routes,
      apiRoutes: graphSummary?.apiRoutes,
      components: graphSummary?.components,
      modules,
    },
    sections: buildAuditSections({ bundle, graphSummary, impact }),
    roadmap: [
      { priority: "crítica", title: "Flow Orchestrator primero", reason: "Evita que auditorías o preguntas se conviertan en PRs antes de tiempo." },
      { priority: "crítica", title: "Build Guard obligatorio", reason: "Developer no debe crear PRs si TypeScript o preflight fallan." },
      { priority: "alta", title: "SEO técnico por fases", reason: "Favicons, metadata, sitemap, robots, schema y landings deben desplegarse en PRs pequeños." },
      { priority: "alta", title: "Home y landings de conversión", reason: "El tráfico llega, pero pocos usuarios hacen clic hacia precios o registro." },
      { priority: "media", title: "Design System para paneles", reason: "Las demos venden mejor que los paneles reales; hay que unificar experiencia." },
      { priority: "media", title: "Companion Runtime estable", reason: "Antes de movimiento y labios, el sistema de estados y conversación debe ser sólido." },
    ],
  };
}

async function buildOpenAIOrchestratorReply(input: OrchestratorInput, decision: { mode: FlowOrchestratorMode; intent: FlowOrchestratorIntent }) {
  const [bundle, graph] = await Promise.all([
    buildDeveloperContextBundle(input.instruction).catch(() => null),
    buildFlowlyProjectGraph(input.instruction).catch(() => null),
  ]);
  const graphSummary = graph ? summarizeProjectGraph(graph) : null;
  const sources = bundle?.loadedSources?.slice(0, 10).map((source) => ({ path: source.path, title: source.title, summary: source.summary })) || [];

  const system = [
    "Eres Flow, el CTO digital de Flowly OS dentro de Flow Studio.",
    "No eres un ejecutor de código. Primero entiendes la intención y respondes según el modo detectado.",
    "Habla en español natural, directo y profesional, como un arquitecto senior.",
    "Si el modo es planificación, entrega un plan concreto y pequeño. No hagas auditoría completa.",
    "Si el modo es diagnóstico, explica el fallo del Orchestrator/Intent Classifier. No hagas auditoría de Flowly.",
    "Si el usuario prohíbe ejecutar, recalca que Executor/GitHub/PR quedan bloqueados.",
    "Nunca digas que vas a crear PR si el modo no es execution.",
  ].join("\n");

  const ai = await callFlowlyOpenAI({
    purpose: "developer",
    system,
    user: JSON.stringify({
      instruction: input.instruction,
      intent: decision.intent,
      mode: decision.mode,
      hasCurrentPlan: hasCurrentPlan(input.currentPlan),
      docsLoaded: sources,
      projectStats: graphSummary ? {
        totalFiles: graphSummary.totalFiles,
        routes: graphSummary.routes,
        apiRoutes: graphSummary.apiRoutes,
        components: graphSummary.components,
        modules: graphSummary.modules?.slice(0, 8),
      } : null,
      currentPlan: input.currentPlan || null,
      requiredOutput: decision.intent === "diagnose_orchestrator"
        ? ["regla que falló", "clasificación correcta", "nuevas intenciones", "cómo evitar repetición", "diseño del Orchestrator"]
        : ["qué cambiará para usuario/Google", "archivos candidatos", "riesgos", "qué NO tocar", "siguiente paso"],
    }),
    temperature: 0.18,
    maxOutputTokens: 2200,
  });

  return ai.ok && ai.text.trim() ? ai.text.trim() : null;
}

function buildConsultationReply(input: OrchestratorInput, decision: { mode: FlowOrchestratorMode; intent: FlowOrchestratorIntent }) {
  const hasPlan = hasCurrentPlan(input.currentPlan);
  if (decision.intent === "ask_current_plan" && hasPlan) {
    const plan = input.currentPlan as Record<string, unknown>;
    const summary = typeof plan.summary === "string" ? plan.summary : typeof plan.instruction === "string" ? plan.instruction : "el plan actual";
    return [
      "Te respondo sobre el plan actual, sin volver a generar otro plan ni activar Executor.",
      "",
      `Lo que hay planteado ahora es: ${summary}`,
      "",
      "Si quieres cambiar el rumbo, dímelo en lenguaje normal. Si quieres ejecutarlo, necesito una aprobación clara como: 'aprobado, ejecuta este plan'.",
    ].join("\n");
  }

  return [
    "Esto lo trato como consulta de arquitectura, no como ejecución.",
    "",
    "Antes de crear un PR necesito convertirlo en una propuesta concreta: qué cambiaría el usuario en pantalla, qué flujo se verá distinto y qué partes no se tocarán.",
    "",
    "Si quieres que lo convierta en plan ejecutable, dime: 'prepara plan para esto'. Si solo quieres criterio, seguiré respondiendo sin tocar código.",
  ].join("\n");
}

export async function orchestrateFlowRequest(input: OrchestratorInput): Promise<FlowOrchestratorDecision> {
  const intent = detectIntent(input);
  const mode = modeForIntent(intent);
  const policy = enginePolicy(mode);
  const guardrails = buildGuardrails(mode);
  const currentObjective = hasCurrentPlan(input.currentPlan) ? "Continuar o revisar el plan activo" : input.instruction;

  if (mode === "audit") {
    const audit = await buildAuditReport(input.instruction);
    return {
      ok: true,
      engine: "flow_orchestrator_v1",
      intent,
      mode,
      ...policy,
      requiresApproval: false,
      refinedInstruction: input.instruction,
      reply: buildAuditReply(audit),
      currentObjective: "Auditar Flowly OS sin ejecutar cambios",
      guardrails,
      reasoning: [
        "La petición pide auditoría/análisis, no implementación.",
        "Executor, GitHub y Pull Request quedan bloqueados en esta respuesta.",
        "Se usa Brain + Docs + Project Graph para entregar diagnóstico y roadmap.",
      ],
      audit,
    };
  }

  if (mode === "consultation" || mode === "diagnostic") {
    const aiReply = await buildOpenAIOrchestratorReply(input, { mode, intent });
    return {
      ok: true,
      engine: "flow_orchestrator_v1",
      intent,
      mode,
      ...policy,
      refinedInstruction: input.instruction,
      reply: aiReply || buildConsultationReply(input, { mode, intent }),
      currentObjective,
      guardrails,
      reasoning: [
        mode === "diagnostic" ? "La petición pide diagnosticar el Orchestrator, no auditar Flowly." : "La petición parece una pregunta o consulta.",
        "No se debe regenerar un plan ni abrir PR por una pregunta o diagnóstico.",
        "Se responde primero en lenguaje natural y se espera instrucción explícita para planificar o ejecutar.",
      ],
    };
  }

  const refinedInstruction = [
    input.instruction,
    "",
    "[Flow Orchestrator] Trata esta petición según el modo seguro detectado.",
    `Intent: ${intent}`,
    `Mode: ${mode}`,
    "Antes de ejecutar, explica el cambio en lenguaje de producto y espera aprobación explícita.",
  ].join("\n");

  return {
    ok: true,
    engine: "flow_orchestrator_v1",
    intent,
    mode,
    ...policy,
    refinedInstruction,
    reply: "Petición clasificada. Voy a preparar un plan seguro antes de tocar código.",
    currentObjective,
    guardrails,
    reasoning: [
      `Intent detectado: ${intent}.`,
      `Modo activado: ${mode}.`,
      policy.shouldPlan ? "Se permite Planning, pero Executor queda bloqueado hasta aprobación." : "No se necesita Planning en esta fase.",
    ],
  };
}
