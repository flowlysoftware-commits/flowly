import { inspectPullRequestForQA, fixPullRequestWithQA } from "@/lib/flowlyQAAgent";
import { planExecutorV3, runExecutorV3, runExecutorV3FromApprovedPlan, type ExecutorV3Plan, type ExecutorV3RunResult } from "@/lib/flowlyExecutorV3";
import { getGitHubExecutorConfig } from "@/lib/flowlyGitHubExecutor";
import { analyzeFlowlyImpact, buildFlowlyProjectGraph, summarizeProjectGraph } from "@/lib/flowlyProjectGraph";
import { buildDeveloperContextBundle, summarizeDeveloperContext, type DeveloperContextBundle } from "@/lib/flowlyDeveloperContextEngine";

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
  stages: DeveloperPipelineStage[];
  buildVerification: {
    strategy: "pull_request_checks";
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

export async function planDeveloperPipeline(instruction: string): Promise<DeveloperPipelinePlan> {
  const clean = instruction.trim();
  if (!clean) throw new Error("Falta la instrucción para Developer Pipeline.");

  const contextBundle = await buildDeveloperContextBundle(clean);
  const contextSummary = summarizeDeveloperContext(contextBundle);

  const [graph, impact, executorPlan] = await Promise.all([
    buildFlowlyProjectGraph(clean).catch(() => null),
    analyzeFlowlyImpact(clean).catch(() => null),
    planExecutorV3(clean, contextSummary),
  ]);

  const graphSummary = graph ? summarizeProjectGraph(graph) : executorPlan.projectMap.projectGraph;
  const protocol = toKnowledgeSources(contextBundle);
  const protocolLoaded = contextBundle.loadedSources.length > 0;
  const hasProposedFiles = executorPlan.proposedFiles.length > 0;

  return {
    ...executorPlan,
    conversationReply: buildNaturalDeveloperReply({ instruction: clean, context: contextBundle, hasProposedFiles, target: executorPlan.projectMap.modules[0], humanChanges: executorPlan.humanChangePlan }),
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
      strategy: "pull_request_checks",
      message: executorPlan.preflight.ok
        ? "Preflight interno superado antes del PR. Después GitHub/Vercel publicarán checks y QA Agent podrá corregir sobre la misma rama si aparece un fallo."
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

export async function runDeveloperPipeline(instruction: string, approved: boolean, approvedPlan?: DeveloperPipelinePlan): Promise<DeveloperPipelineRunResult> {
  const contextBundle = await buildDeveloperContextBundle(instruction);
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
    stages: ["Brain", "Knowledge", "Project Graph", "Executor V3", "Pull Request", "Checks", "QA Agent"],
    missing: github.missing,
  };
}
