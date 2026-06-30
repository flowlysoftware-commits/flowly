import { inspectPullRequestForQA, fixPullRequestWithQA } from "@/lib/flowlyQAAgent";
import { planExecutorV3, runExecutorV3, type ExecutorV3Plan, type ExecutorV3RunResult } from "@/lib/flowlyExecutorV3";
import { getGitHubExecutorConfig, readRepositoryFile } from "@/lib/flowlyGitHubExecutor";
import { analyzeFlowlyImpact, buildFlowlyProjectGraph, summarizeProjectGraph } from "@/lib/flowlyProjectGraph";

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
  };
};

export type DeveloperPipelineRunResult = ExecutorV3RunResult & {
  pipelineVersion: "developer_pipeline_v1";
  stages: DeveloperPipelineStage[];
  qaStatus?: Awaited<ReturnType<typeof inspectPullRequestForQA>>;
  nextAction: string;
};

const OPERATING_PROTOCOL_PATHS = [
  "AI_BOOTSTRAP.md",
  ".github/copilot-instructions.md",
  "docs/SUMMARY.md",
  "docs/architecture-bible/16-companion-os.md",
  "docs/architecture-bible/19-conversation-engine.md",
  "docs/architecture-bible/09-memory-engine.md",
  "docs/architecture-bible/28-execution-engine.md",
];

function excerpt(content: string) {
  return content.replace(/\s+/g, " ").trim().slice(0, 380);
}

async function readOperatingProtocol(): Promise<DeveloperPipelineKnowledgeSource[]> {
  const sources: DeveloperPipelineKnowledgeSource[] = [];
  for (const path of OPERATING_PROTOCOL_PATHS) {
    try {
      const file = await readRepositoryFile(path);
      sources.push({
        path: file.path,
        loaded: true,
        summary: `Leído correctamente (${Math.round(file.content.length / 1000)}k caracteres).`,
        excerpt: excerpt(file.content),
      });
    } catch (error) {
      sources.push({
        path,
        loaded: false,
        summary: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return sources;
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
    stage("bootstrap", "Leer protocolo OS", "Lee AI_BOOTSTRAP, instrucciones de Copilot y reglas internas antes de proponer cambios.", params.protocolLoaded ? "done" : "blocked"),
    stage("knowledge", "Consultar memoria/documentación", "Busca Companion, Brain, Memory, Execution Engine y arquitectura relacionada.", params.protocolLoaded ? "done" : "waiting"),
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
    stage("bootstrap", "Leer protocolo OS", "Reglas de Flowly OS aplicadas.", "done"),
    stage("knowledge", "Consultar memoria/documentación", "Contexto técnico aplicado antes de ejecutar.", "done"),
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

  const [protocol, graph, impact, executorPlan] = await Promise.all([
    readOperatingProtocol(),
    buildFlowlyProjectGraph(clean).catch(() => null),
    analyzeFlowlyImpact(clean).catch(() => null),
    planExecutorV3(clean),
  ]);

  const graphSummary = graph ? summarizeProjectGraph(graph) : executorPlan.projectMap.projectGraph;
  const protocolLoaded = protocol.some((source) => source.loaded);
  const hasProposedFiles = executorPlan.proposedFiles.length > 0;

  return {
    ...executorPlan,
    pipelineVersion: "developer_pipeline_v1",
    pipelineReady: protocolLoaded && hasProposedFiles,
    operatingProtocol: protocol,
    stages: buildPlanStages({
      protocolLoaded,
      hasProposedFiles,
      graphFiles: graphSummary?.totalFiles || executorPlan.projectMap.analyzedFiles,
      approval: false,
    }),
    buildVerification: {
      strategy: "pull_request_checks",
      message: "La verificación real ocurre tras crear el Pull Request: GitHub/Vercel publican checks y QA Agent puede corregir sobre la misma rama si pegas el log.",
      automaticFixAvailable: true,
    },
    unifiedEngines: {
      developer: "/developer",
      planner: "Developer Pipeline + Executor V3",
      executor: "Executor V3",
      qa: "QA Agent",
      knowledge: "AI_BOOTSTRAP + Docs + Project Graph",
    },
    projectMap: {
      ...executorPlan.projectMap,
      projectGraph: graphSummary || executorPlan.projectMap.projectGraph,
      impact: impact || executorPlan.projectMap.impact,
    },
  };
}

export async function runDeveloperPipeline(instruction: string, approved: boolean): Promise<DeveloperPipelineRunResult> {
  const result = await runExecutorV3(instruction, approved);
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
