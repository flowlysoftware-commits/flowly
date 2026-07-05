import { callFlowlyOpenAI } from "@/lib/flowlyOpenAI";
import { classifyFlowlyIntent, type FlowlyIntent, type FlowlyIntentMode } from "@/lib/flowlyIntentEngine";
import { buildFlowlyIntelligenceContext, type FlowlyIntelligenceContext } from "@/lib/flowlyIntelligenceContext";
import { runFlowReasoningPipeline, type FlowReasoningPipelineResult } from "@/lib/flowlyReasoningPipeline";

export type FlowOrchestratorMode = FlowlyIntentMode;

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

export type FlowOrchestratorDecision = {
  ok: true;
  engine: "flow_orchestrator_v2";
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
  reasoningPipeline?: Pick<FlowReasoningPipelineResult, "engine" | "usedAI" | "model" | "stages" | "critique" | "certification">;
  intelligence?: {
    rawIntent: FlowlyIntent;
    confidence: number;
    explicitNoExecution: boolean;
    explicitNoAudit: boolean;
    contextSources: Array<{ path: string; title: string; kind: string }>;
  };
};

type OrchestratorInput = {
  instruction: string;
  conversationId?: string;
  history?: Array<{ role?: string; text?: string }>;
  currentPlan?: unknown;
};

function hasCurrentPlan(currentPlan: unknown) {
  return Boolean(currentPlan && typeof currentPlan === "object" && ("summary" in currentPlan || "instruction" in currentPlan || "conversationReply" in currentPlan));
}

function mapIntent(intent: FlowlyIntent): FlowOrchestratorIntent {
  if (intent === "audit_project") return "audit_project";
  if (intent === "planning") return "new_change";
  if (intent === "execution_approval") return "approve_change";
  if (intent === "qa_fix") return "fix_error";
  if (intent === "continue_session") return "continue_session";
  if (intent === "internal_diagnostic") return "diagnose_orchestrator";
  return "ask_architecture";
}

function enginePolicy(mode: FlowOrchestratorMode) {
  if (mode === "audit" || mode === "consultation" || mode === "diagnostic" || mode === "conversation") {
    return {
      activeEngines: ["brain", "docs", "memory", "projectGraph"] as FlowOrchestratorEngineName[],
      blockedEngines: ["planning", "executor", "github", "qa", "learning"] as FlowOrchestratorEngineName[],
    };
  }

  if (mode === "execution") {
    return {
      activeEngines: ["brain", "memory", "planning", "executor", "github", "qa"] as FlowOrchestratorEngineName[],
      blockedEngines: [] as FlowOrchestratorEngineName[],
    };
  }

  if (mode === "qa") {
    return {
      activeEngines: ["brain", "memory", "projectGraph", "qa", "github"] as FlowOrchestratorEngineName[],
      blockedEngines: ["executor"] as FlowOrchestratorEngineName[],
    };
  }

  return {
    activeEngines: ["brain", "docs", "memory", "projectGraph", "planning"] as FlowOrchestratorEngineName[],
    blockedEngines: ["executor", "github", "qa", "learning"] as FlowOrchestratorEngineName[],
  };
}

function buildGuardrails(mode: FlowOrchestratorMode, explicitNoExecution: boolean, explicitNoAudit: boolean) {
  const rules = [
    "No tocar main directamente.",
    "No crear PR sin aprobación explícita.",
    "No duplicar Brain, Memory, Heart, Voice, Executor, QA ni runtimes.",
    "Responder en lenguaje de producto antes de enseñar archivos técnicos.",
  ];

  if (explicitNoExecution) rules.push("El usuario ha prohibido código/ejecución/PR: Executor y GitHub quedan bloqueados.");
  if (explicitNoAudit) rules.push("El usuario ha prohibido repetir auditoría: no devolver la auditoría CTO completa.");
  if (["audit", "consultation", "diagnostic", "conversation"].includes(mode)) rules.push("Modo no ejecutivo: Planning/Executor/GitHub/PR bloqueados.");
  if (mode === "planning") rules.push("Modo planificación: preparar propuesta pequeña y esperar aprobación antes de ejecutar.");
  if (mode === "execution") rules.push("Modo ejecución: solo continuar si existe aprobación clara y plan aprobado.");

  return rules;
}

function projectStatsFromContext(context: FlowlyIntelligenceContext): FlowAuditReport["projectStats"] {
  return {
    totalFiles: context.projectSummary?.totalFiles,
    routes: context.projectSummary?.routes,
    apiRoutes: context.projectSummary?.apiRoutes,
    components: context.projectSummary?.components,
    modules: context.projectSummary?.modules?.map((item) => item.name).filter(Boolean).slice(0, 12) || [],
  };
}

function buildAuditReport(context: FlowlyIntelligenceContext): FlowAuditReport {
  const stats = projectStatsFromContext(context);
  return {
    title: "Auditoría CTO de Flowly OS",
    summary: `He analizado Flowly como sistema operativo empresarial. La auditoría combina /docs, Project Graph y contexto técnico. Módulo principal detectado: ${context.contextSummary?.target || "Flowly OS"}.`,
    sourcesRead: context.sources.map((source) => ({ path: source.path, title: source.title, kind: source.kind })),
    projectStats: stats,
    sections: [
      {
        title: "Arquitectura",
        verdict: "La arquitectura ya tiene piezas potentes, pero debe ser Orchestrator-first: entender intención antes de planificar o ejecutar.",
        strengths: ["Brain, Docs, Project Graph, Executor, QA y Build Guard están separados.", "La documentación permite construir contexto antes de responder."],
        risks: ["Si el Intent Engine falla, Developer responde con auditorías o PRs fuera de contexto.", "Las tareas grandes pueden provocar cambios masivos difíciles de revisar."],
        recommendations: ["Mantener Flow Orchestrator como puerta única.", "Usar OpenAI para clasificar intención con fallback local y guardrails estrictos."],
      },
      {
        title: "SEO y conversión",
        verdict: "Flowly necesita SEO técnico por fases y landings por intención, no un cambio masivo único.",
        strengths: ["Ya existen landing, analítica y una propuesta diferencial clara: IA que trabaja por tu empresa."],
        risks: ["Competir por términos genéricos de CRM/ERP es caro.", "Sin schema, sitemap, canonical y Open Graph, Google entiende peor el producto."],
        recommendations: ["Primero metadata, sitemap, robots, manifest y JSON-LD básico.", "Después landings CRM con IA, ERP con IA, WhatsApp y automatización."],
      },
      {
        title: "Developer / Flow Studio",
        verdict: "Developer ya es utilizable para tareas pequeñas, pero debe mejorar memoria de misión, clasificación y autocorrección.",
        strengths: ["Tiene pipeline, PR, Build Guard y conexión con OpenAI Core."],
        risks: ["Todavía puede perder el hilo si el Orchestrator clasifica mal.", "Sin contexto fuerte, el modelo puede responder genérico."],
        recommendations: ["Centralizar Context Builder.", "Usar OpenAI para intención, respuesta, planificación y diagnóstico, dejando Flowly como control de seguridad."],
      },
    ],
    roadmap: [
      { priority: "crítica", title: "Intent Engine con OpenAI", reason: "Evita que planificación se confunda con auditoría." },
      { priority: "crítica", title: "Context Builder único", reason: "Developer y Companion deben compartir contexto de Brain, Docs, Memory y Project Graph." },
      { priority: "alta", title: "SEO técnico fase 1", reason: "Mejora indexación, apariencia en Google y compartidos sociales." },
      { priority: "media", title: "Companion conectado al mismo Core", reason: "Flow debe ser una interfaz del mismo cerebro, no otra IA aislada." },
    ],
  };
}

function buildAuditReply(report: FlowAuditReport) {
  const sections = report.sections.map((section) => [
    `## ${section.title}`,
    section.verdict,
    `Bien: ${section.strengths.join(" ")}`,
    `Riesgos: ${section.risks.join(" ")}`,
    `Recomendación: ${section.recommendations.join(" ")}`,
  ].join("\n")).join("\n\n");

  return [
    "He entendido que esto es una AUDITORÍA completa, no una tarea de ejecución.",
    "He bloqueado Executor, GitHub y Pull Request. Solo activo Brain, Docs, Memory y Project Graph.",
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
    report.roadmap.map((item, index) => `${index + 1}. [${item.priority.toUpperCase()}] ${item.title}: ${item.reason}`).join("\n"),
  ].join("\n");
}

async function askOpenAIForReply(params: {
  input: OrchestratorInput;
  context: FlowlyIntelligenceContext;
  mode: FlowOrchestratorMode;
  intent: FlowOrchestratorIntent;
  guardrails: string[];
}) {
  const system = [
    "Eres Flow, el CTO digital de Flowly OS.",
    "Respondes desde Flow Studio con el contexto del proyecto, no como chatbot genérico.",
    "Debes obedecer el modo clasificado por el Intent Engine.",
    "Si mode=planning: entrega un plan pequeño, concreto y ejecutable después de aprobación. No hagas auditoría completa.",
    "Si mode=diagnostic: diagnostica el fallo interno solicitado. No audites Flowly entero.",
    "Si mode=consultation: responde la pregunta directamente y no propongas PR.",
    "Si el usuario prohibió código/PR/ejecución, no sugieras ejecutar todavía.",
    "Estructura útil: qué cambia en lenguaje normal, qué tocarías, riesgos, qué NO tocarás y siguiente paso.",
    "Grounding obligatorio: el contexto incluye Project Snapshot. Si indica Next.js App Router, no menciones index.html, about.html, blog.html, header.php ni archivos genéricos.",
    "Para SEO/metadata/Open Graph usa solo rutas reales de projectSnapshot.keyPaths o projectSnapshot.seoRelevantPaths.",
    "Habla español, directo, profesional y sin frases de relleno.",
  ].join("\n");

  const ai = await callFlowlyOpenAI({
    purpose: "developer",
    system,
    user: JSON.stringify({
      instruction: params.input.instruction,
      conversationId: params.input.conversationId || null,
      recentHistory: (params.input.history || []).slice(-10),
      currentPlan: params.input.currentPlan || null,
      mode: params.mode,
      intent: params.intent,
      guardrails: params.guardrails,
      contextSummary: params.context.contextSummary,
      projectSummary: params.context.projectSummary ? {
        totalFiles: params.context.projectSummary.totalFiles,
        routes: params.context.projectSummary.routes,
        apiRoutes: params.context.projectSummary.apiRoutes,
        components: params.context.projectSummary.components,
        modules: params.context.projectSummary.modules?.slice(0, 10),
      } : null,
      projectSnapshot: params.context.projectSnapshot ? {
        framework: params.context.projectSnapshot.framework,
        packageInfo: params.context.projectSnapshot.packageInfo,
        counts: params.context.projectSnapshot.counts,
        keyPaths: params.context.projectSnapshot.keyPaths,
        publicRoutes: params.context.projectSnapshot.publicRoutes.slice(0, 80),
        privateRoutes: params.context.projectSnapshot.privateRoutes.slice(0, 80),
        apiRoutes: params.context.projectSnapshot.apiRoutes.slice(0, 80),
        seoRelevantPaths: params.context.projectSnapshot.seoRelevantPaths,
        notes: params.context.projectSnapshot.notes,
        warnings: params.context.projectSnapshot.warnings,
      } : null,
      projectSnapshotText: params.context.projectSnapshotText,
      docsSources: params.context.sources,
      docsContext: params.context.docsContext,
      warnings: params.context.warnings,
    }),
    temperature: params.mode === "planning" ? 0.12 : 0.2,
    maxOutputTokens: params.mode === "planning" ? 2200 : 1800,
  });

  if (!ai.ok || !ai.text.trim()) return null;
  return ai.text.trim();
}

function fallbackReply(mode: FlowOrchestratorMode, intent: FlowOrchestratorIntent, hasPlan: boolean) {
  if (mode === "planning") {
    return [
      "He entendido que esto es PLANIFICACIÓN, no ejecución.",
      "No voy a tocar código ni crear PR todavía.",
      "Prepararía una propuesta pequeña, con cambios concretos, archivos candidatos, riesgos y partes que no se tocarán.",
      "Cuando me des aprobación explícita, Developer podrá pasar a ejecución segura con Build Guard.",
    ].join("\n");
  }

  if (mode === "diagnostic") {
    return [
      "He entendido que esto es DIAGNÓSTICO INTERNO.",
      "No voy a repetir la auditoría completa ni activar Executor.",
      "El fallo probable es una clasificación por palabras clave sin respetar negaciones ni contexto de sesión.",
      "La solución es que Intent Engine clasifique primero con OpenAI y después aplique guardrails locales: no auditoría si el usuario la prohíbe, no ejecución si el usuario la bloquea.",
    ].join("\n");
  }

  if (intent === "ask_current_plan" && hasPlan) {
    return "Respondo sobre el plan actual sin regenerarlo. Si quieres, puedo convertir una parte concreta en plan pequeño o esperar aprobación explícita para ejecutar.";
  }

  return "Esto queda tratado como consulta. No activo Executor, GitHub ni PR. Si quieres que lo convierta en plan, dime exactamente la fase o cambio que quieres planificar.";
}

export async function orchestrateFlowRequest(input: OrchestratorInput): Promise<FlowOrchestratorDecision> {
  const intentDecision = await classifyFlowlyIntent(input);
  const intent = mapIntent(intentDecision.intent);
  const mode = intentDecision.mode;
  const policy = enginePolicy(mode);
  const guardrails = buildGuardrails(mode, intentDecision.explicitNoExecution, intentDecision.explicitNoAudit);
  const currentObjective = hasCurrentPlan(input.currentPlan) ? "Continuar o revisar el plan activo" : input.instruction;

  const shouldPlan = intentDecision.shouldPlan && !intentDecision.explicitNoExecution;
  const shouldExecute = intentDecision.shouldExecute && !intentDecision.explicitNoExecution;

  if (mode === "audit") {
    const context = await buildFlowlyIntelligenceContext(input.instruction);
    const audit = buildAuditReport(context);
    const reasoningPipeline = await runFlowReasoningPipeline({
      instruction: input.instruction,
      conversationId: input.conversationId,
      history: input.history,
      currentPlan: input.currentPlan,
      mode,
      intent,
      guardrails,
      activeEngines: policy.activeEngines,
      blockedEngines: policy.blockedEngines,
      context,
    });

    return {
      ok: true,
      engine: "flow_orchestrator_v2",
      intent,
      mode,
      shouldPlan: false,
      shouldExecute: false,
      requiresApproval: false,
      refinedInstruction: intentDecision.refinedInstruction,
      reply: reasoningPipeline.reply || buildAuditReply(audit),
      currentObjective: "Auditar Flowly OS sin ejecutar cambios",
      ...policy,
      guardrails,
      reasoning: [
        ...intentDecision.reasoning,
        "Modo auditoría confirmado: se devuelve informe y roadmap, no plan de PR.",
        "Flow Reasoning Pipeline ejecutó Architect Pass, Critic Pass y Final Pass antes de responder.",
      ],
      audit,
      reasoningPipeline: {
        engine: reasoningPipeline.engine,
        usedAI: reasoningPipeline.usedAI,
        model: reasoningPipeline.model,
        stages: reasoningPipeline.stages,
        critique: reasoningPipeline.critique,
        certification: reasoningPipeline.certification,
      },
      intelligence: {
        rawIntent: intentDecision.intent,
        confidence: intentDecision.confidence,
        explicitNoExecution: intentDecision.explicitNoExecution,
        explicitNoAudit: intentDecision.explicitNoAudit,
        contextSources: context.sources.map((source) => ({ path: source.path, title: source.title, kind: source.kind })),
      },
    };
  }

  if (mode === "consultation" || mode === "diagnostic" || mode === "conversation" || (mode === "planning" && intentDecision.explicitNoExecution)) {
    const context = await buildFlowlyIntelligenceContext(input.instruction);
    const reasoningPipeline = await runFlowReasoningPipeline({
      instruction: input.instruction,
      conversationId: input.conversationId,
      history: input.history,
      currentPlan: input.currentPlan,
      mode,
      intent,
      guardrails,
      activeEngines: policy.activeEngines,
      blockedEngines: policy.blockedEngines,
      context,
    });

    return {
      ok: true,
      engine: "flow_orchestrator_v2",
      intent,
      mode,
      shouldPlan: mode === "planning" && !intentDecision.explicitNoExecution,
      shouldExecute: false,
      requiresApproval: mode === "planning",
      refinedInstruction: intentDecision.refinedInstruction,
      reply: reasoningPipeline.reply || fallbackReply(mode, intent, hasCurrentPlan(input.currentPlan)),
      currentObjective,
      ...policy,
      guardrails,
      reasoning: [
        ...intentDecision.reasoning,
        mode === "planning" && intentDecision.explicitNoExecution
          ? "El usuario pidió plan, pero prohibió código/ejecución: se entrega propuesta sin activar Pipeline."
          : "Modo no ejecutivo: se responde con Flow Reasoning Pipeline y se bloquea ejecución.",
      ],
      reasoningPipeline: {
        engine: reasoningPipeline.engine,
        usedAI: reasoningPipeline.usedAI,
        model: reasoningPipeline.model,
        stages: reasoningPipeline.stages,
        critique: reasoningPipeline.critique,
        certification: reasoningPipeline.certification,
      },
      intelligence: {
        rawIntent: intentDecision.intent,
        confidence: intentDecision.confidence,
        explicitNoExecution: intentDecision.explicitNoExecution,
        explicitNoAudit: intentDecision.explicitNoAudit,
        contextSources: context.sources.map((source) => ({ path: source.path, title: source.title, kind: source.kind })),
      },
    };
  }

  const refinedInstruction = [
    intentDecision.refinedInstruction || input.instruction,
    "",
    "[Flow Orchestrator v2]",
    `Intent: ${intentDecision.intent}`,
    `Mode: ${mode}`,
    `Confidence: ${intentDecision.confidence}`,
    "Antes de ejecutar, explica el resultado visual/funcional en lenguaje normal y espera aprobación explícita.",
    "No crees PR sin Build Guard.",
  ].join("\n");

  return {
    ok: true,
    engine: "flow_orchestrator_v2",
    intent,
    mode,
    shouldPlan,
    shouldExecute,
    requiresApproval: intentDecision.requiresApproval,
    refinedInstruction,
    reply: shouldPlan ? "He entendido la petición como PLANIFICACIÓN. Voy a preparar un plan pequeño y seguro antes de tocar código." : "He entendido la aprobación. Solo ejecutaré si existe un plan aprobado y Build Guard lo permite.",
    currentObjective,
    ...policy,
    guardrails,
    reasoning: [
      ...intentDecision.reasoning,
      `Intent detectado por Intent Engine: ${intentDecision.intent}.`,
      `Modo activado: ${mode}.`,
      shouldPlan ? "Planning permitido; Executor/GitHub siguen bloqueados hasta aprobación." : "Se permite continuar hacia ejecución si hay plan aprobado.",
    ],
    intelligence: {
      rawIntent: intentDecision.intent,
      confidence: intentDecision.confidence,
      explicitNoExecution: intentDecision.explicitNoExecution,
      explicitNoAudit: intentDecision.explicitNoAudit,
      contextSources: [],
    },
  };
}
