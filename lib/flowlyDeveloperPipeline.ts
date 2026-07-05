import { inspectPullRequestForQA, fixPullRequestWithQA } from "@/lib/flowlyQAAgent";
import { planExecutorV3, runExecutorV3, runExecutorV3FromApprovedPlan, type ExecutorV3Plan, type ExecutorV3RunResult } from "@/lib/flowlyExecutorV3";
import { getGitHubExecutorConfig, listRepositoryTree } from "@/lib/flowlyGitHubExecutor";
import { analyzeFlowlyImpact, buildFlowlyProjectGraph, summarizeProjectGraph } from "@/lib/flowlyProjectGraph";
import { buildDeveloperContextBundle, summarizeDeveloperContext, type DeveloperContextBundle } from "@/lib/flowlyDeveloperContextEngine";
import type { DeveloperIntelligenceDecision } from "@/lib/flowlyDeveloperIntelligenceEngine";
import { validatePlanGrounding } from "@/lib/flowlyGroundingGuard";
import { buildFlowlyProjectSnapshot } from "@/lib/flowlyProjectReader";
import { evaluateGoalFidelity, isBudgetCrmObjective } from "@/lib/flowlyGoalFidelityGuard";

export type DeveloperPipelineStageId =
  | "intake"
  | "bootstrap"
  | "knowledge"
  | "graph"
  | "blueprint"
  | "approval"
  | "executor"
  | "pull_request"
  | "checks"
  | "qa"
  | "done";

export type DeveloperPipelineStageStatus = "done" | "active" | "waiting" | "blocked" | "error";

export type DeveloperPipelineStage = {
  id: DeveloperPipelineStageId;
  label: string;
  description: string;
  status: DeveloperPipelineStageStatus;
  details?: string[];
};

export type DeveloperPipelineKnowledgeSource = {
  path: string;
  loaded: boolean;
  summary: string;
  excerpt?: string;
};

export type DeveloperPipelinePlan = ExecutorV3Plan & {
  pipelineVersion: "developer_pipeline_v1";
  pipelineReady: boolean;
  operatingProtocol: DeveloperPipelineKnowledgeSource[];
  contextEngine: ReturnType<typeof summarizeDeveloperContext>;
  conversationReply: string;
  needsMoreContext: boolean;
  intelligence?: DeveloperIntelligenceDecision;
  stages: DeveloperPipelineStage[];
  buildVerification: {
    strategy: "build_guard_and_pull_request_checks";
    message: string;
    automaticFixAvailable: boolean;
  };
  unifiedEngines: {
    developer: string;
    planner: string;
    executor: string;
    qa: string;
    knowledge: string;
    context: string;
  };
};

export type DeveloperPipelineRunResult = ExecutorV3RunResult & {
  pipelineVersion: "developer_pipeline_v1";
  stages: DeveloperPipelineStage[];
  qaStatus?: Awaited<ReturnType<typeof inspectPullRequestForQA>>;
  nextAction: string;
};

function toKnowledgeSources(bundle: DeveloperContextBundle): DeveloperPipelineKnowledgeSource[] {
  return bundle.sources.map((source) => ({
    path: source.path,
    loaded: source.loaded,
    summary: source.loaded
      ? `${source.title} · ${source.summary}`
      : `No disponible: ${source.summary}`,
    excerpt: source.excerpt,
  }));
}

function buildNaturalDeveloperReply(params: { instruction: string; context: DeveloperContextBundle; hasProposedFiles: boolean; target?: string; humanChanges?: Array<{ title: string; description: string }> }) {
  const { context, hasProposedFiles } = params;
  const humanChanges = params.humanChanges || [];
  const target = params.target || context.intent.target;
  const sources = context.loadedSources.slice(0, 4).map((source) => source.title).filter(Boolean);
  const base = `He revisado la memoria de Flowly en /docs antes de responder. He identificado que la petición va sobre ${target} y la acción principal es ${context.intent.action}.`;


  if (context.intent.needsClarification && !hasProposedFiles) {
    return `${base} Antes de ejecutar nada necesito concretar un poco más para no crear cambios falsos ni duplicados. Cuéntame exactamente qué quieres cambiar, dónde lo ves en el panel y qué resultado esperas.`;
  }

  if (!hasProposedFiles) {
    return `${base} He encontrado documentación relevante (${sources.join(", ") || "docs/SUMMARY"}), pero todavía no veo un cambio de código seguro. Puedo seguir investigando o puedes indicarme el archivo, pantalla o comportamiento exacto.`;
  }

  const changePreview = humanChanges.length ? ` En concreto: ${humanChanges.slice(0, 3).map((item) => item.title.toLowerCase()).join("; ")}.` : "";
  return `${base} También he cargado ${context.loadedSources.length} documentos relevantes (${sources.join(", ") || "Flowly Knowledge"}). Tengo una propuesta segura y te explicaré el cambio en lenguaje de producto, no solo como lista de archivos.${changePreview} Solo si das el OK crearé una rama y un Pull Request.`;
}


function buildConcreteStudioReply(params: {
  instruction: string;
  intelligence?: DeveloperIntelligenceDecision;
  context: DeveloperContextBundle;
  hasProposedFiles: boolean;
  humanChanges: Array<{ title: string; description: string; userImpact?: string; safetyNote?: string }>;
  proposedFiles: Array<{ path: string; message?: string }>;
  preflight?: { ok: boolean; blockedReason?: string; checks?: Array<{ label: string; ok: boolean; detail: string }> };
  target?: string;
}) {
  const { intelligence, context, humanChanges, proposedFiles, hasProposedFiles, instruction, preflight } = params;
  const target = params.target || context.intent.target || "Flowly OS";
  const docs = context.loadedSources.slice(0, 4).map((source) => source.title).filter(Boolean);
  const intro =
    intelligence?.directReply && !/voy a investigar|consultando|preparar[eé] una propuesta/i.test(intelligence.directReply)
      ? intelligence.directReply.trim()
      : `He analizado la petición dentro de Flowly OS y la enfoco sobre ${target}.`;

  const scopeFailure = preflight?.checks?.find((check) => check.label === "Planner Scope Guard" && !check.ok);
  if (scopeFailure) {
    return [
      intro,
      "",
      "No tengo un plan aprobable todavía.",
      `Motivo: ${scopeFailure.detail}`,
      "",
      "No voy a proponer archivos fuera del scope validado. Ejecuta primero una verificación de evidencia si quieres ampliar el scope de esta misión.",
    ].join("\n");
  }

  if (context.intent.needsClarification && !hasProposedFiles) {
    return [
      intro,
      "",
      "Antes de tocar código necesito una precisión para no crear un cambio falso:",
      `- Qué pantalla o flujo exacto quieres modificar dentro de ${target}.`,
      "- Qué debe ver el usuario cuando el cambio esté terminado.",
      "- Qué no quieres que toque.",
    ].join("\n");
  }

  if (!hasProposedFiles) {
    return [
      intro,
      "",
      "Todavía no tengo un cambio de código suficientemente seguro para ejecutar.",
      `He leído ${context.loadedSources.length} documentos (${docs.join(", ") || "Flowly Docs"}) y prefiero pedirte una instrucción más concreta antes que crear archivos duplicados o un PR vacío.`,
    ].join("\n");
  }

  const changes = humanChanges.length
    ? humanChanges
        .slice(0, 5)
        .map((item, index) => {
          const impact = item.userImpact ? ` Impacto: ${item.userImpact}` : "";
          return `${index + 1}. ${item.title}: ${item.description}${impact}`;
        })
        .join("\n")
    : proposedFiles
        .slice(0, 5)
        .map((file, index) => `${index + 1}. ${file.message || `Ajustaré ${file.path} para cumplir la petición sin crear una pieza paralela.`}`)
        .join("\n");

  const safety = [
    "No tocaré producción directamente.",
    "No modificaré main.",
    "No crearé motores duplicados.",
    "No cambiaré Brain, Memory, Heart, Voice o GitHub Executor salvo que la petición lo exija claramente.",
  ].join(" ");

  return [
    intro,
    "",
    "Mi propuesta concreta es:",
    changes,
    "",
    `Documentación usada: ${docs.join(", ") || "AI_BOOTSTRAP + docs/SUMMARY"}.`,
    `Seguridad: ${safety}`,
    "",
    "Si lo apruebas, crearé una rama y un Pull Request con exactamente este plan.",
  ].join("\n");
}

function stage(id: DeveloperPipelineStageId, label: string, description: string, status: DeveloperPipelineStageStatus, details?: string[]): DeveloperPipelineStage {
  return { id, label, description, status, details };
}

function buildPlanStages(params: {
  protocolLoaded: boolean;
  hasProposedFiles: boolean;
  graphFiles?: number;
  approval?: boolean;
}): DeveloperPipelineStage[] {
  return [
    stage("intake", "Entender petición", "Brain recibe la idea en lenguaje normal y la convierte en intención técnica.", "done"),
    stage("bootstrap", "Leer protocolo OS", "Lee AI_BOOTSTRAP y la memoria viva de /docs antes de proponer cambios.", params.protocolLoaded ? "done" : "blocked"),
    stage("knowledge", "Consultar memoria/documentación", "Context Engine selecciona documentos relevantes de /docs según la petición.", params.protocolLoaded ? "done" : "waiting"),
    stage("graph", "Construir Project Graph", "Analiza rutas, APIs, componentes, dependencias y módulos afectados.", params.graphFiles ? "done" : "active", params.graphFiles ? [`${params.graphFiles} archivos indexados.`] : undefined),
    stage("blueprint", "Preparar blueprint", "Convierte el análisis en una propuesta revisable con archivos afectados.", params.hasProposedFiles ? "done" : "blocked"),
    stage("approval", "Esperar aprobación", "No escribe código hasta que tú pulses aplicar cambios.", params.approval ? "done" : "active"),
    stage("executor", "Aplicar cambios", "Executor modifica una rama segura, nunca main directamente.", params.approval ? "active" : "waiting"),
    stage("pull_request", "Crear Pull Request", "GitHub recibe el cambio para revisión humana.", "waiting"),
    stage("checks", "Verificar build/deploy", "Lee checks de GitHub/Vercel cuando estén disponibles.", "waiting"),
    stage("qa", "QA automático", "Si falla el build, QA Agent corrige sobre la misma rama con el log.", "waiting"),
    stage("done", "Resultado final", "Te muestra PR, estado y siguiente acción.", "waiting"),
  ];
}

function mergedInstructionForReply(baseInstruction: string, refinedInstruction?: string) {
  return [baseInstruction, refinedInstruction || ""].filter(Boolean).join("\n");
}

function buildRunStages(params: { prCreated: boolean; qaStatus?: string; error?: string }): DeveloperPipelineStage[] {
  return [
    stage("intake", "Entender petición", "Petición recibida y preparada.", "done"),
    stage("bootstrap", "Leer protocolo OS", "Context Engine y reglas de Flowly OS aplicadas.", "done"),
    stage("knowledge", "Consultar memoria/documentación", "Documentación relevante de /docs aplicada antes de ejecutar.", "done"),
    stage("graph", "Construir Project Graph", "Mapa de proyecto usado para decidir archivos.", "done"),
    stage("blueprint", "Preparar blueprint", "Propuesta convertida en cambios seguros.", "done"),
    stage("approval", "Esperar aprobación", "Aprobación humana recibida.", "done"),
    stage("executor", "Aplicar cambios", "Cambios enviados a una rama segura.", params.error ? "error" : "done"),
    stage("pull_request", "Crear Pull Request", "Pull Request creado para revisión.", params.prCreated ? "done" : params.error ? "error" : "waiting"),
    stage("checks", "Verificar build/deploy", "Checks consultados cuando GitHub/Vercel los publica.", params.qaStatus === "green" ? "done" : params.qaStatus === "failed" ? "error" : "active"),
    stage("qa", "QA automático", "Si hay fallo, pega el log para corregir sobre la misma rama.", params.qaStatus === "failed" ? "active" : params.qaStatus === "green" ? "done" : "waiting"),
    stage("done", "Resultado final", "Trabajo listo para revisar.", params.prCreated ? "active" : "waiting"),
  ];
}

export async function planDeveloperPipeline(instruction: string, options: { intelligence?: DeveloperIntelligenceDecision } = {}): Promise<DeveloperPipelinePlan> {
  const clean = instruction.trim();
  if (!clean) throw new Error("Falta la instrucción para Developer Pipeline.");

  const contextBundle = await buildDeveloperContextBundle(clean);
  const contextSummary = summarizeDeveloperContext(contextBundle);

  const snapshot = await buildFlowlyProjectSnapshot().catch(() => null);
  const developerContextForExecutor = {
    contextSummary,
    projectSnapshot: snapshot
      ? {
          framework: snapshot.framework,
          packageInfo: snapshot.packageInfo,
          counts: snapshot.counts,
          keyPaths: snapshot.keyPaths,
          publicRoutes: snapshot.publicRoutes.slice(0, 80),
          privateRoutes: snapshot.privateRoutes.slice(0, 80),
          apiRoutes: snapshot.apiRoutes.slice(0, 80),
          seoRelevantPaths: snapshot.seoRelevantPaths,
          notes: snapshot.notes,
          warnings: snapshot.warnings,
        }
      : null,
  };

  const [graph, impact, executorPlan] = await Promise.all([
    buildFlowlyProjectGraph(clean).catch(() => null),
    analyzeFlowlyImpact(clean).catch(() => null),
    planExecutorV3(clean, developerContextForExecutor),
  ]);

  const graphSummary = graph ? summarizeProjectGraph(graph) : executorPlan.projectMap.projectGraph;
  const protocol = toKnowledgeSources(contextBundle);
  const protocolLoaded = contextBundle.loadedSources.length > 0;
  const hasProposedFiles = executorPlan.proposedFiles.length > 0;
  const intelligenceChanges = options.intelligence?.productChangePlan?.length ? options.intelligence.productChangePlan : null;
  const humanChangePlan = intelligenceChanges || executorPlan.humanChangePlan;

  return {
    ...executorPlan,
    humanChangePlan,
    conversationReply: buildConcreteStudioReply({
      instruction: mergedInstructionForReply(clean, options.intelligence?.refinedInstruction),
      intelligence: options.intelligence,
      context: contextBundle,
      hasProposedFiles,
      target: executorPlan.projectMap.modules[0],
      humanChanges: humanChangePlan,
      proposedFiles: executorPlan.proposedFiles,
      preflight: executorPlan.preflight,
    }),
    intelligence: options.intelligence,
    needsMoreContext: contextBundle.intent.needsClarification && !hasProposedFiles,
    pipelineVersion: "developer_pipeline_v1",
    pipelineReady: protocolLoaded && (hasProposedFiles || contextBundle.intent.needsClarification),
    operatingProtocol: protocol,
    contextEngine: contextSummary,
    stages: buildPlanStages({
      protocolLoaded,
      hasProposedFiles,
      graphFiles: graphSummary?.totalFiles || executorPlan.projectMap.analyzedFiles,
      approval: false,
    }),
    buildVerification: {
      strategy: "build_guard_and_pull_request_checks",
      message: executorPlan.preflight.ok
        ? "Build Guard y Preflight superados antes del PR. Después GitHub/Vercel publicarán checks y QA Agent podrá corregir sobre la misma rama si aparece un fallo."
        : `Preflight bloqueado: ${executorPlan.preflight.blockedReason || "el cambio no es suficientemente seguro"}. No debe crearse PR hasta corregirlo.`,
      automaticFixAvailable: true,
    },
    unifiedEngines: {
      developer: "/developer",
      planner: "Developer Pipeline + Executor V3",
      executor: "Executor V3",
      qa: "QA Agent",
      knowledge: "/docs + AI_BOOTSTRAP + Project Graph",
      context: "Flowly Developer Context Engine",
    },
    projectMap: {
      ...executorPlan.projectMap,
      projectGraph: graphSummary || executorPlan.projectMap.projectGraph,
      impact: impact || executorPlan.projectMap.impact,
    },
  };
}

async function listExistingRepositoryPaths() {
  const tree = await listRepositoryTree();
  return (tree.items || [])
    .filter((item) => item.type === "blob")
    .map((item) => item.path);
}

export async function runDeveloperPipeline(instruction: string, approved: boolean, approvedPlan?: DeveloperPipelinePlan): Promise<DeveloperPipelineRunResult> {
  const contextBundle = await buildDeveloperContextBundle(instruction);

  if (approvedPlan) {
    const existingPaths = await listExistingRepositoryPaths().catch(() => []);
    const grounding = validatePlanGrounding({
      objective: approvedPlan.instruction || instruction,
      files: (approvedPlan.proposedFiles || []).map((file) => file.path),
      existingPaths,
    });

    if (!grounding.allowed) {
      const error = grounding.reasons.join(" ") || "Grounding Guard bloqueó la ejecución por seguridad.";
      const safeFileSet = new Set(grounding.safeFiles);
      const blockedResult = {
        ...approvedPlan,
        status: "planned" as const,
        proposedFiles: (approvedPlan.proposedFiles || []).filter((file) => safeFileSet.has(file.path)),
        preflight: {
          ...approvedPlan.preflight,
          ok: false,
          status: "blocked" as const,
          blockedReason: error,
          checks: [
            ...(approvedPlan.preflight?.checks || []),
            { label: "Grounding Guard", ok: false, detail: error },
          ],
        },
        error,
      };

      return {
        ...blockedResult,
        pipelineVersion: "developer_pipeline_v1",
        stages: buildRunStages({ prCreated: false, error }),
        nextAction: "Grounding Guard ha bloqueado la ejecución. Rehaz el plan usando únicamente archivos reales del Project Graph y manteniendo el objetivo aprobado.",
      };
    }
  }

  const result = approvedPlan
    ? await runExecutorV3FromApprovedPlan(approvedPlan, approved)
    : await runExecutorV3(instruction, approved, summarizeDeveloperContext(contextBundle));
  let qaStatus: Awaited<ReturnType<typeof inspectPullRequestForQA>> | undefined;

  if (result.pullRequestNumber) {
    try {
      qaStatus = await inspectPullRequestForQA(String(result.pullRequestNumber));
    } catch {
      qaStatus = undefined;
    }
  }

  const nextAction = result.error
    ? "Executor no pudo crear el Pull Request. Revisa el error y no hagas cambios manuales en main."
    : qaStatus?.status === "green"
      ? "El PR está en verde. Revísalo visualmente y haz merge si te convence."
      : qaStatus?.status === "failed"
        ? "El PR falla. Abre QA Agent, pega el log de Vercel/GitHub y corrige sobre la misma rama."
        : result.pullRequestUrl
          ? "PR creado. Espera a que Vercel/GitHub publique checks; si falla, usa QA Agent sobre el mismo PR."
          : "Trabajo preparado, pero no se recibió URL del PR.";

  return {
    ...result,
    pipelineVersion: "developer_pipeline_v1",
    stages: buildRunStages({ prCreated: Boolean(result.pullRequestUrl), qaStatus: qaStatus?.status, error: result.error }),
    qaStatus,
    nextAction,
  };
}

export async function inspectDeveloperPipelinePullRequest(pr: string) {
  return inspectPullRequestForQA(pr);
}

export async function fixDeveloperPipelinePullRequest(params: { pr: string; buildLog?: string }) {
  return fixPullRequestWithQA(params);
}

export function getDeveloperPipelineStatus() {
  const github = getGitHubExecutorConfig();
  return {
    ready: github.hasCredentials,
    github,
    pipeline: "developer_pipeline_v1",
    stages: ["Brain", "Knowledge", "Project Graph", "Executor V3", "Build Guard", "Pull Request", "Checks", "QA Agent"],
    missing: github.missing,
  };
}
