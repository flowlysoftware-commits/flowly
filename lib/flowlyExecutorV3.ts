import { createExecutorPullRequest, listRepositoryTree, readRepositoryFile, type ExecutorFileChange, type GitHubTreeItem } from "@/lib/flowlyGitHubExecutor";
import { flowlyMigrationModules } from "@/lib/flowlyOSMigration";
import { analyzeFlowlyImpact, buildFlowlyProjectGraph, summarizeProjectGraph, type FlowlyImpactAnalysis } from "@/lib/flowlyProjectGraph";

export type ExecutorV3Risk = "bajo" | "medio" | "alto";

export type ExecutorV3Candidate = {
  path: string;
  reason: string;
  score: number;
  size?: number;
  role: "principal" | "relacionado" | "documentacion" | "api" | "estilo" | "datos";
};

export type ExecutorV3Dependency = {
  source: string;
  target: string;
  type: "import" | "ruta" | "modulo" | "posible";
};

export type ExecutorV3ProjectMap = {
  totalFiles: number;
  analyzedFiles: number;
  relatedFiles: number;
  editableFiles: number;
  modules: string[];
  dependencies: ExecutorV3Dependency[];
  candidates: ExecutorV3Candidate[];
  projectGraph?: ReturnType<typeof summarizeProjectGraph>;
  impact?: FlowlyImpactAnalysis;
};

export type ExecutorV3Plan = {
  ok: true;
  version: "v3";
  status: "planned";
  instruction: string;
  summary: string;
  risk: ExecutorV3Risk;
  projectMap: ExecutorV3ProjectMap;
  reasoning: string[];
  proposedSteps: string[];
  proposedFiles: ExecutorFileChange[];
  requiresApproval: true;
};

export type ExecutorV3RunResult = Omit<ExecutorV3Plan, "status"> & {
  status: "planned" | "pull_request_created";
  pullRequestUrl?: string;
  pullRequestNumber?: number;
  branch?: string;
  error?: string;
};

const MAX_CONTEXT_FILES = 10;
const MAX_CONTEXT_CHARS = 10000;

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function slug(value: string) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56) || "flowly-change";
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function isEditablePath(path: string) {
  return /\.(tsx|ts|css|md|sql|json)$/.test(path) && !path.includes("node_modules") && !path.includes(".next/");
}

function roleForPath(path: string): ExecutorV3Candidate["role"] {
  const lower = normalize(path);
  if (lower.includes("/api/")) return "api";
  if (lower.endsWith(".css") || lower.includes("style")) return "estilo";
  if (lower.endsWith(".md") || lower.includes("docs/")) return "documentacion";
  if (lower.includes("supabase") || lower.endsWith(".sql")) return "datos";
  if (lower.includes("components/") || lower.includes("app/")) return "principal";
  return "relacionado";
}

function detectModules(instruction: string) {
  const text = normalize(instruction);
  const modules = flowlyMigrationModules
    .filter((module) => {
      const terms = [module.id, module.name, module.targetDomain, ...module.currentRoutes, ...module.businessObjects, ...module.capabilities];
      return terms.some((term) => text.includes(normalize(term)));
    })
    .map((module) => module.name);

  if (/(companion|avatar|mascota|asistente|assistant)/.test(text)) modules.push("Companion Runtime");
  if (/(crm|cliente|clientes|pipeline|lead|oportunidad)/.test(text)) modules.push("CRM");
  if (/(factura|facturacion|facturación|presupuesto|invoice)/.test(text)) modules.push("Facturación");
  if (/whatsapp/.test(text)) modules.push("WhatsApp");
  if (/(studio|builder|kernel|brain|executor|developer)/.test(text)) modules.push("Flowly OS");
  return unique(modules.length ? modules : ["Flowly OS"]);
}

function scorePath(path: string, instruction: string, modules: string[]) {
  const text = normalize(instruction);
  const p = normalize(path);
  let score = 0;

  const keywordGroups = [
    ["Companion Runtime", ["companion", "avatar", "mascota", "assistant", "brand-avatar", "floatingavatar"]],
    ["CRM", ["crm", "cliente", "clientes", "pipeline", "contact", "lead", "opportunity", "customer"]],
    ["Facturación", ["factura", "facturacion", "invoice", "budget", "presupuesto", "finance"]],
    ["WhatsApp", ["whatsapp", "message", "webhook"]],
    ["Flowly OS", ["studio", "builder", "kernel", "brain", "executor", "developer", "docs", "knowledge"]],
  ] as const;

  for (const [moduleName, words] of keywordGroups) {
    if (modules.includes(moduleName) || words.some((word) => text.includes(word))) {
      for (const word of words) if (p.includes(word)) score += 12;
    }
  }

  for (const token of text.split(/\s+/).filter((item) => item.length > 4)) {
    if (p.includes(token)) score += 2;
  }

  if (p.includes("components/")) score += 5;
  if (p.includes("app/")) score += 4;
  if (p.includes("lib/")) score += 4;
  if (p.endsWith("page.tsx")) score += 3;
  if (p.endsWith(".md")) score += 1;
  if (p.includes("v2") && !text.includes("v2")) score -= 8;
  if (!isEditablePath(path)) score -= 100;
  return score;
}

function extractImports(path: string, content: string): ExecutorV3Dependency[] {
  const deps: ExecutorV3Dependency[] = [];
  const importRegex = /import\s+(?:[^"']+\s+from\s+)?["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content))) {
    deps.push({ source: path, target: match[1], type: "import" });
  }
  return deps.slice(0, 24);
}

async function readContext(candidates: ExecutorV3Candidate[]) {
  const context: Array<{ path: string; content: string }> = [];
  const dependencies: ExecutorV3Dependency[] = [];

  for (const file of candidates.slice(0, MAX_CONTEXT_FILES)) {
    try {
      const data = await readRepositoryFile(file.path);
      const content = data.content.slice(0, MAX_CONTEXT_CHARS);
      context.push({ path: data.path, content });
      dependencies.push(...extractImports(data.path, content));
    } catch {
      // No bloquear el análisis si un archivo no se puede leer.
    }
  }

  return { context, dependencies };
}

async function buildProjectMap(instruction: string): Promise<{ map: ExecutorV3ProjectMap; context: Array<{ path: string; content: string }> }> {
  const modules = detectModules(instruction);
  const tree = await listRepositoryTree();
  const files = (tree.items || []).filter((item: GitHubTreeItem) => item.type === "blob");
  const graph = await buildFlowlyProjectGraph(instruction);
  const impact = await analyzeFlowlyImpact(instruction);
  const graphSummary = summarizeProjectGraph(graph);
  const scored = files
    .map((item) => ({ item, score: scorePath(item.path, instruction, modules) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  const candidates: ExecutorV3Candidate[] = scored.slice(0, 32).map(({ item, score }, index) => ({
    path: item.path,
    size: item.size,
    score,
    role: index < 8 ? roleForPath(item.path) : "relacionado",
    reason: index < 8 ? "Archivo principal probable. Prioridad alta para revisar antes de crear archivos nuevos." : "Archivo relacionado detectado por contexto, imports o palabras clave.",
  }));

  const { context, dependencies } = await readContext(candidates);
  return {
    map: {
      totalFiles: files.length,
      analyzedFiles: files.length,
      relatedFiles: candidates.length,
      editableFiles: candidates.filter((file) => isEditablePath(file.path)).length,
      modules,
      dependencies: [
        ...dependencies,
        ...graph.edges
          .filter((edge) => edge.type === "imports")
          .slice(0, 32)
          .map((edge) => ({ source: edge.source, target: edge.target, type: "import" as const })),
      ].slice(0, 72),
      candidates,
      projectGraph: graphSummary,
      impact,
    },
    context,
  };
}

function buildPlanDoc(plan: Omit<ExecutorV3Plan, "proposedFiles">) {
  return [
    "# Flowly Executor V3 - Plan inteligente",
    "",
    `Fecha: ${new Date().toISOString()}`,
    "",
    "## Instrucción",
    "",
    plan.instruction,
    "",
    "## Resumen",
    "",
    plan.summary,
    "",
    "## Módulos detectados",
    "",
    ...plan.projectMap.modules.map((item) => `- ${item}`),
    "",
    "## Mapa del proyecto",
    "",
    `- Archivos analizados: ${plan.projectMap.analyzedFiles}`,
    `- Archivos relacionados: ${plan.projectMap.relatedFiles}`,
    `- Archivos editables: ${plan.projectMap.editableFiles}`,
    `- Dependencias detectadas: ${plan.projectMap.dependencies.length}`,
    "",
    "## Archivos principales candidatos",
    "",
    ...plan.projectMap.candidates.slice(0, 12).map((file) => `- \`${file.path}\` — ${file.reason} Puntuación: ${file.score}`),
    "",
    "## Project Graph",
    "",
    `- Módulos del grafo: ${plan.projectMap.projectGraph?.modules?.map((module) => module.name).join(", ") || "No disponible"}`,
    `- Rutas: ${plan.projectMap.projectGraph?.routes || 0}`,
    `- APIs: ${plan.projectMap.projectGraph?.apiRoutes || 0}`,
    `- Componentes: ${plan.projectMap.projectGraph?.components || 0}`,
    `- Dependencias: ${plan.projectMap.projectGraph?.edges || 0}`,
    "",
    "## Archivos que deben revisarse antes de crear duplicados",
    "",
    ...(plan.projectMap.impact?.avoidCreating || []).map((file) => `- \`${file}\``),
    "",
    "## Razonamiento",
    "",
    ...plan.reasoning.map((item) => `- ${item}`),
    "",
    "## Pasos propuestos",
    "",
    ...plan.proposedSteps.map((item, index) => `${index + 1}. ${item}`),
    "",
    "## Seguridad",
    "",
    "Executor V3 nunca modifica main directamente. Crea una rama y Pull Request para revisión humana.",
    "",
  ].join("\n");
}

function fallbackFiles(_plan: Omit<ExecutorV3Plan, "proposedFiles">): ExecutorFileChange[] {
  // El Executor ya no convierte conversaciones/prompts en archivos Markdown.
  // Los planes se guardan como datos estructurados en Supabase desde las APIs de ejecución.
  // Si la IA no puede proponer un cambio seguro sobre archivos reales, no se crea Pull Request.
  return [];
}

async function buildAIFiles(params: {
  plan: Omit<ExecutorV3Plan, "proposedFiles">;
  context: Array<{ path: string; content: string }>;
}): Promise<ExecutorFileChange[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const system = [
    "Eres Flowly Executor V3, un agente de ingeniería para un proyecto Next.js/TypeScript.",
    "Responde SOLO JSON válido: {\"files\":[{\"path\":\"...\",\"content\":\"...\",\"message\":\"...\"}]}",
    "Reglas obligatorias:",
    "- Máximo 5 archivos.",
    "- Prefiere MODIFICAR archivos existentes de candidateFiles antes que crear archivos nuevos.",
    "- NO crees archivos con sufijos V2/V3 si ya existe un componente equivalente. Mejora el existente.",
    "- No elimines archivos.",
    "- No añadas dependencias nuevas al package.json.",
    "- Mantén cambios pequeños, revisables y compatibles con TypeScript estricto.",
    "- Si no puedes estar seguro, devuelve {\"files\":[]} y NO crees documentación ni archivos de plan.",
    "- Usa projectGraph e impact para decidir. Si impact.avoidCreating contiene archivos, revisa esos archivos antes de crear otros.",
    "- Si existe un componente equivalente, devuélvelo modificado completo; no crees una versión paralela.",
    "- No expongas secretos ni variables privadas.",
    "- Nunca crees archivos dentro de docs/executor/ a partir del texto del usuario. Las conversaciones van a Brain Memory, no al repositorio.",
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.FLOWLY_EXECUTOR_MODEL || process.env.FLOWLY_AI_MODEL || "gpt-4o-mini",
      temperature: 0.08,
      max_tokens: 9000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: JSON.stringify({
            instruction: params.plan.instruction,
            risk: params.plan.risk,
            projectMap: params.plan.projectMap,
            projectGraph: params.plan.projectMap.projectGraph,
            impact: params.plan.projectMap.impact,
            contextFiles: params.context,
          }),
        },
      ],
    }),
  });

  if (!response.ok) return null;
  const data = await response.json().catch(() => null);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") return null;

  try {
    const parsed = JSON.parse(content) as { files?: ExecutorFileChange[] };
    if (!Array.isArray(parsed.files)) return null;
    const safe = parsed.files
      .filter((file) => typeof file.path === "string" && typeof file.content === "string")
      .filter((file) => !file.path.includes("..") && !file.path.startsWith("/") && isEditablePath(file.path))
      .filter((file) => !normalize(file.path).startsWith("docs/executor/"))
      .slice(0, 5)
      .map((file) => ({ path: file.path, content: file.content, message: file.message || "Executor V3: cambio inteligente" }));
    return safe.length ? safe : null;
  } catch {
    return null;
  }
}

export async function planExecutorV3(instruction: string): Promise<ExecutorV3Plan> {
  const clean = instruction.trim();
  const { map } = await buildProjectMap(clean);
  const risk: ExecutorV3Risk = map.relatedFiles > 24 ? "medio" : "bajo";
  const reasoning = [
    `Se han analizado ${map.analyzedFiles} archivos del repositorio antes de proponer cambios.`,
    `Se han detectado ${map.relatedFiles} archivos relacionados y ${map.editableFiles} editables.`,
    `Project Graph detecta ${map.projectGraph?.modules.length || 0} módulos, ${map.projectGraph?.apiRoutes || 0} APIs y ${map.projectGraph?.edges || 0} dependencias.`,
    "Executor V3 prioriza editar piezas existentes antes de crear componentes duplicados.",
    "El cambio se preparará en una rama nueva y Pull Request para revisión humana.",
  ];
  const proposedSteps = [
    "Construir Project Graph del repositorio completo.",
    "Detectar módulos, rutas, APIs, componentes, SQL y dependencias.",
    "Leer archivos principales antes de decidir cambios.",
    "Preparar una modificación pequeña y coherente con la arquitectura actual.",
    "Crear rama segura y Pull Request.",
    "Esperar revisión humana antes de merge/deploy.",
  ];

  const planBase = {
    ok: true as const,
    version: "v3" as const,
    status: "planned" as const,
    instruction: clean,
    summary: `Executor V3 ha construido Project Graph: ${map.projectGraph?.totalFiles || map.analyzedFiles} archivos, ${map.projectGraph?.modules.length || 0} módulos, ${map.projectGraph?.edges || 0} dependencias y ${map.relatedFiles} candidatos relacionados.`,
    risk,
    projectMap: map,
    reasoning,
    proposedSteps,
    requiresApproval: true as const,
  };

  return { ...planBase, proposedFiles: fallbackFiles(planBase) };
}

export async function runExecutorV3(instruction: string, approved: boolean): Promise<ExecutorV3RunResult> {
  const plan = await planExecutorV3(instruction);
  if (!approved) return plan;

  const { context } = await buildProjectMap(plan.instruction);
  const aiFiles = await buildAIFiles({ plan, context });
  const files = (aiFiles || []).filter((file) => !normalize(file.path).startsWith("docs/executor/"));

  if (!files.length) {
    return {
      ...plan,
      status: "planned",
      proposedFiles: [],
      error: "Executor V3 no ha encontrado cambios de código seguros para aplicar. No crearé documentación falsa ni archivos duplicados. Revisa el plan, concreta mejor la petición o selecciona archivos existentes desde Project Graph.",
    };
  }

  const title = `Flowly Executor V3: ${plan.instruction.slice(0, 72)}`;
  const pr = await createExecutorPullRequest({
    title,
    body: [
      "## Flowly Executor V3",
      "Este Pull Request fue creado automáticamente por Flowly Brain/Executor V3.",
      "",
      "### Petición",
      plan.instruction,
      "",
      "### Análisis",
      `- Archivos analizados: ${plan.projectMap.analyzedFiles}`,
      `- Archivos relacionados: ${plan.projectMap.relatedFiles}`,
      `- Archivos editables: ${plan.projectMap.editableFiles}`,
      "",
      "### Seguridad",
      "No se modifica la rama principal directamente. Este PR debe revisarse antes de hacer merge.",
    ].join("\n"),
    branchName: `flowly/executor-v3-${slug(plan.instruction)}-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 12)}`,
    files,
  });

  return {
    ...plan,
    status: pr.ok ? "pull_request_created" : "planned",
    proposedFiles: files,
    pullRequestUrl: pr.pullRequestUrl,
    pullRequestNumber: pr.pullRequestNumber,
    branch: pr.branch,
    error: pr.error,
  };
}
