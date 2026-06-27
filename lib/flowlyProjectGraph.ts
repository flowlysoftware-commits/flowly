import { listRepositoryTree, readRepositoryFile, type GitHubTreeItem } from "@/lib/flowlyGitHubExecutor";

export type FlowlyGraphNodeType =
  | "module"
  | "route"
  | "api"
  | "component"
  | "library"
  | "database"
  | "doc"
  | "config"
  | "unknown";

export type FlowlyGraphEdgeType = "contains" | "imports" | "calls" | "documents" | "uses_table" | "related";

export type FlowlyGraphNode = {
  id: string;
  label: string;
  type: FlowlyGraphNodeType;
  path?: string;
  module?: string;
  weight: number;
  metadata?: Record<string, string | number | boolean | string[]>;
};

export type FlowlyGraphEdge = {
  source: string;
  target: string;
  type: FlowlyGraphEdgeType;
  confidence: number;
  reason: string;
};

export type FlowlyProjectModule = {
  id: string;
  name: string;
  description: string;
  paths: string[];
  routes: string[];
  apis: string[];
  components: string[];
  libraries: string[];
  docs: string[];
  sql: string[];
  score: number;
};

export type FlowlyProjectGraph = {
  generatedAt: string;
  totalFiles: number;
  analyzedFiles: number;
  modules: FlowlyProjectModule[];
  nodes: FlowlyGraphNode[];
  edges: FlowlyGraphEdge[];
  routes: string[];
  apiRoutes: string[];
  components: string[];
  libraries: string[];
  sqlFiles: string[];
  docs: string[];
  tables: string[];
  environmentHints: string[];
  recommendations: string[];
};

export type FlowlyImpactAnalysis = {
  instruction: string;
  detectedModules: FlowlyProjectModule[];
  primaryFiles: string[];
  secondaryFiles: string[];
  avoidCreating: string[];
  safeChangeStrategy: string[];
  risk: "bajo" | "medio" | "alto";
};

const MODULE_RULES = [
  {
    id: "companion",
    name: "Companion Runtime",
    description: "Avatar, chat, contexto, memoria y experiencia conversacional global.",
    keywords: ["companion", "avatar", "mascota", "assistant", "brand-avatar", "flowlycompanion", "evolutionarycompanion"],
  },
  {
    id: "crm",
    name: "CRM",
    description: "Clientes, contactos, leads, oportunidades, pipeline y actividad comercial.",
    keywords: ["crm", "cliente", "clientes", "customer", "contact", "lead", "opportunity", "pipeline"],
  },
  {
    id: "billing",
    name: "Facturación",
    description: "Ingresos, gastos, presupuestos, facturas, pagos y finanzas.",
    keywords: ["factura", "facturacion", "facturación", "invoice", "budget", "presupuesto", "payment", "stripe", "finance"],
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Integración de mensajes, webhooks, lectura, envío y conversaciones.",
    keywords: ["whatsapp", "message", "webhook", "messages"],
  },
  {
    id: "studio",
    name: "Studio / Builder",
    description: "Creación de módulos, blueprints, generator, proyectos y edición visual.",
    keywords: ["studio", "builder", "generator", "blueprint", "crear", "project"],
  },
  {
    id: "brain",
    name: "Brain / AI Engine",
    description: "Cerebro, razonamiento, contexto, planner, executor y respuestas inteligentes.",
    keywords: ["brain", "executor", "ai-engine", "copilot", "context", "openai", "planner"],
  },
  {
    id: "kernel",
    name: "Kernel",
    description: "Runtime central, eventos, plugins, capabilities y business objects.",
    keywords: ["kernel", "runtime", "event", "plugin", "capability", "business-object"],
  },
  {
    id: "docs",
    name: "Knowledge / Docs",
    description: "Documentación viva, base de conocimiento, capítulos, libros y búsqueda.",
    keywords: ["docs", "knowledge", "chapter", "book", "markdown"],
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Planes, onboarding, checkout, campañas y promoción.",
    keywords: ["marketing", "campaign", "checkout", "onboarding"],
  },
  {
    id: "sales",
    name: "Panel comercial",
    description: "Comerciales, comisiones, ventas, equipo y administración comercial.",
    keywords: ["sales", "comercial", "commission", "commissions", "payout"],
  },
] as const;

const MAX_READ_FILES = 72;
const MAX_READ_CHARS = 18000;

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function compactPath(path: string) {
  return path.replace(/\\/g, "/").replace(/^\.\//, "");
}

function routeFromPage(path: string) {
  return `/${path.replace(/^app\//, "").replace(/\/page\.tsx$/, "").replace(/\/page\.ts$/, "").replace(/^page$/, "")}`.replace(/\/\(.*?\)/g, "").replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

function apiRouteFromFile(path: string) {
  return `/${path.replace(/^app\//, "").replace(/\/route\.ts$/, "").replace(/\/route\.tsx$/, "")}`.replace(/\/+/g, "/");
}

function nodeTypeForPath(path: string): FlowlyGraphNodeType {
  if (/^app\/api\/.+\/route\.(ts|tsx)$/.test(path)) return "api";
  if (/^app\/.+\/page\.(ts|tsx)$/.test(path)) return "route";
  if (/^components\/.+\.(tsx|ts)$/.test(path)) return "component";
  if (/^lib\/.+\.(ts|tsx)$/.test(path)) return "library";
  if (/^supabase\/.+\.(sql|ts)$/.test(path) || path.endsWith(".sql")) return "database";
  if (/^(docs|app\/docs)\//.test(path) || path.endsWith(".md")) return "doc";
  if (/^(package|next|tailwind|tsconfig|postcss)/.test(path)) return "config";
  return "unknown";
}

function labelForPath(path: string) {
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

function moduleForPathAndContent(path: string, content = "") {
  const text = normalize(`${path}\n${content.slice(0, 5000)}`);
  let best = MODULE_RULES[0];
  let bestScore = 0;

  for (const rule of MODULE_RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (text.includes(normalize(keyword))) score += path.includes(keyword) ? 8 : 3;
    }
    if (score > bestScore) {
      best = rule;
      bestScore = score;
    }
  }

  if (bestScore <= 0) return undefined;
  return { ...best, score: bestScore };
}

function extractImports(path: string, content: string): FlowlyGraphEdge[] {
  const edges: FlowlyGraphEdge[] = [];
  const regex = /import\s+(?:type\s+)?(?:[^"']+?\s+from\s+)?["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content))) {
    edges.push({ source: path, target: match[1], type: "imports", confidence: 0.86, reason: "Import detectado por análisis estático." });
  }
  return edges.slice(0, 40);
}

function extractApiCalls(path: string, content: string): FlowlyGraphEdge[] {
  const edges: FlowlyGraphEdge[] = [];
  const regex = /fetch\([`"']([^`"']+)[`"']/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content))) {
    edges.push({ source: path, target: match[1], type: "calls", confidence: 0.76, reason: "Llamada fetch detectada." });
  }
  return edges.slice(0, 24);
}

function extractTables(content: string) {
  const tables: string[] = [];
  const createRegex = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-zA-Z0-9_]+)/gi;
  const alterRegex = /alter\s+table\s+(?:if\s+exists\s+)?(?:public\.)?([a-zA-Z0-9_]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = createRegex.exec(content))) tables.push(match[1]);
  while ((match = alterRegex.exec(content))) tables.push(match[1]);
  return unique(tables);
}

function shouldReadForGraph(path: string, instruction?: string) {
  const type = nodeTypeForPath(path);
  if (["route", "api", "component", "library", "database", "doc", "config"].includes(type)) return true;
  const text = normalize(instruction || "");
  return text.split(/\s+/).some((token) => token.length > 4 && normalize(path).includes(token));
}

function scoreForInstruction(path: string, content: string, instruction?: string) {
  const text = normalize(instruction || "");
  if (!text) return 1;
  const haystack = normalize(`${path}\n${content.slice(0, 6000)}`);
  let score = 0;
  for (const token of text.split(/\s+/).filter((item) => item.length > 3)) {
    if (haystack.includes(token)) score += token.length > 7 ? 4 : 2;
  }
  for (const rule of MODULE_RULES) {
    if (rule.keywords.some((keyword) => text.includes(normalize(keyword)))) {
      for (const keyword of rule.keywords) if (haystack.includes(normalize(keyword))) score += 8;
    }
  }
  if (path.includes("components/")) score += 3;
  if (path.includes("lib/")) score += 3;
  if (path.includes("app/api/")) score += 2;
  return score;
}

export async function buildFlowlyProjectGraph(instruction?: string): Promise<FlowlyProjectGraph> {
  const tree = await listRepositoryTree();
  const files = (tree.items || [])
    .filter((item: GitHubTreeItem) => item.type === "blob")
    .map((item) => ({ ...item, path: compactPath(item.path) }));

  const interestingFiles = files.filter((file) => shouldReadForGraph(file.path, instruction));
  const prioritized = interestingFiles
    .map((file) => {
      const n = normalize(`${file.path} ${instruction || ""}`);
      let boost = 0;
      for (const rule of MODULE_RULES) {
        if (rule.keywords.some((keyword) => n.includes(normalize(keyword)))) boost += 10;
      }
      if (nodeTypeForPath(file.path) !== "unknown") boost += 4;
      return { file, boost };
    })
    .sort((a, b) => b.boost - a.boost)
    .slice(0, MAX_READ_FILES);

  const contents: Record<string, string> = {};
  for (const { file } of prioritized) {
    try {
      const result = await readRepositoryFile(file.path);
      contents[file.path] = result.content.slice(0, MAX_READ_CHARS);
    } catch {
      contents[file.path] = "";
    }
  }

  const modulesMap = new Map<string, FlowlyProjectModule>();
  const nodes: FlowlyGraphNode[] = [];
  const edges: FlowlyGraphEdge[] = [];
  const tables: string[] = [];

  for (const file of files) {
    const content = contents[file.path] || "";
    const module = moduleForPathAndContent(file.path, content);
    const type = nodeTypeForPath(file.path);
    const id = file.path;
    if (type !== "unknown") {
      nodes.push({
        id,
        label: labelForPath(file.path),
        path: file.path,
        type,
        module: module?.name,
        weight: scoreForInstruction(file.path, content, instruction),
        metadata: { size: file.size || 0 },
      });
    }

    if (module) {
      const current = modulesMap.get(module.id) || {
        id: module.id,
        name: module.name,
        description: module.description,
        paths: [],
        routes: [],
        apis: [],
        components: [],
        libraries: [],
        docs: [],
        sql: [],
        score: 0,
      };
      current.paths.push(file.path);
      current.score += module.score + scoreForInstruction(file.path, content, instruction);
      if (type === "route") current.routes.push(routeFromPage(file.path));
      if (type === "api") current.apis.push(apiRouteFromFile(file.path));
      if (type === "component") current.components.push(file.path);
      if (type === "library") current.libraries.push(file.path);
      if (type === "doc") current.docs.push(file.path);
      if (type === "database") current.sql.push(file.path);
      modulesMap.set(module.id, current);
      edges.push({ source: `module:${module.id}`, target: file.path, type: "contains", confidence: 0.8, reason: "Archivo clasificado dentro del módulo por ruta/contenido." });
    }

    if (content) {
      edges.push(...extractImports(file.path, content));
      edges.push(...extractApiCalls(file.path, content));
      if (type === "database") tables.push(...extractTables(content));
    }
  }

  const modules = Array.from(modulesMap.values())
    .map((module) => ({
      ...module,
      paths: unique(module.paths).slice(0, 80),
      routes: unique(module.routes),
      apis: unique(module.apis),
      components: unique(module.components).slice(0, 40),
      libraries: unique(module.libraries).slice(0, 40),
      docs: unique(module.docs).slice(0, 40),
      sql: unique(module.sql).slice(0, 24),
    }))
    .sort((a, b) => b.score - a.score);

  const routes = files.filter((file) => nodeTypeForPath(file.path) === "route").map((file) => routeFromPage(file.path));
  const apiRoutes = files.filter((file) => nodeTypeForPath(file.path) === "api").map((file) => apiRouteFromFile(file.path));
  const components = files.filter((file) => nodeTypeForPath(file.path) === "component").map((file) => file.path);
  const libraries = files.filter((file) => nodeTypeForPath(file.path) === "library").map((file) => file.path);
  const sqlFiles = files.filter((file) => nodeTypeForPath(file.path) === "database").map((file) => file.path);
  const docs = files.filter((file) => nodeTypeForPath(file.path) === "doc").map((file) => file.path);

  return {
    generatedAt: new Date().toISOString(),
    totalFiles: files.length,
    analyzedFiles: prioritized.length,
    modules,
    nodes: nodes.sort((a, b) => b.weight - a.weight).slice(0, 280),
    edges: edges.slice(0, 480),
    routes: unique(routes),
    apiRoutes: unique(apiRoutes),
    components,
    libraries,
    sqlFiles,
    docs,
    tables: unique(tables),
    environmentHints: [
      "GitHub App conectada para ramas y Pull Requests.",
      "OPENAI_API_KEY habilita razonamiento avanzado del Brain/Executor.",
      "Supabase almacena logs, ejecuciones y registros OS.",
    ],
    recommendations: [
      "Priorizar modificaciones sobre archivos existentes antes de crear variantes V2/V3.",
      "Consultar Project Graph antes de ejecutar cualquier cambio con impacto alto.",
      "Crear Pull Requests pequeños y revisables con documentación de decisión.",
      "Sincronizar Knowledge después de cada cambio aprobado.",
    ],
  };
}

export async function analyzeFlowlyImpact(instruction: string): Promise<FlowlyImpactAnalysis> {
  const graph = await buildFlowlyProjectGraph(instruction);
  const modules = graph.modules.slice(0, 4);
  const allModuleFiles = modules.flatMap((module) => [...module.components, ...module.libraries, ...module.apis.map((api) => `app${api}/route.ts`), ...module.docs, ...module.sql]);
  const scoredNodes = graph.nodes
    .filter((node) => node.path)
    .sort((a, b) => b.weight - a.weight)
    .map((node) => node.path!)
    .filter(Boolean);
  const primaryFiles = unique([...scoredNodes, ...allModuleFiles]).slice(0, 12);
  const secondaryFiles = unique([...allModuleFiles, ...graph.nodes.map((node) => node.path || "")]).filter((path) => path && !primaryFiles.includes(path)).slice(0, 24);

  return {
    instruction,
    detectedModules: modules,
    primaryFiles,
    secondaryFiles,
    avoidCreating: primaryFiles.filter((path) => /companion|avatar|crm|studio|kernel|brain|executor/i.test(path)).slice(0, 8),
    safeChangeStrategy: [
      "Leer primero los archivos principales y sus imports.",
      "Modificar componentes existentes cuando resuelvan la intención.",
      "No crear duplicados con sufijos V2/V3 salvo que el proyecto no tenga equivalente claro.",
      "Registrar el razonamiento y crear Pull Request para revisión humana.",
    ],
    risk: primaryFiles.length > 10 || modules.length > 2 ? "medio" : "bajo",
  };
}

export function summarizeProjectGraph(graph: FlowlyProjectGraph) {
  return {
    generatedAt: graph.generatedAt,
    totalFiles: graph.totalFiles,
    analyzedFiles: graph.analyzedFiles,
    modules: graph.modules.map((module) => ({
      id: module.id,
      name: module.name,
      score: module.score,
      routes: module.routes.length,
      apis: module.apis.length,
      components: module.components.length,
      libraries: module.libraries.length,
      docs: module.docs.length,
      sql: module.sql.length,
    })),
    routes: graph.routes.length,
    apiRoutes: graph.apiRoutes.length,
    components: graph.components.length,
    libraries: graph.libraries.length,
    sqlFiles: graph.sqlFiles.length,
    docs: graph.docs.length,
    tables: graph.tables.length,
    edges: graph.edges.length,
    recommendations: graph.recommendations,
  };
}
