import { createExecutorPullRequest, listRepositoryTree, readRepositoryFile, type ExecutorFileChange, type GitHubTreeItem } from "@/lib/flowlyGitHubExecutor";
import { runFlowlyBuildGuard, type FlowlyBuildGuardResult } from "@/lib/flowlyBuildGuard";
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

export type ExecutorV3HumanChange = {
  title: string;
  description: string;
  userImpact: string;
  safetyNote: string;
};

export type ExecutorV3Preflight = {
  ok: boolean;
  status: "passed" | "blocked";
  checks: Array<{ label: string; ok: boolean; detail: string }>;
  blockedReason?: string;
  buildGuard?: FlowlyBuildGuardResult;
};

export type ExecutorV3Plan = {
  developerContext?: unknown;
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
  humanChangePlan: ExecutorV3HumanChange[];
  preflight: ExecutorV3Preflight;
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
    ["SEO", ["seo", "metadata", "metadatos", "open graph", "opengraph", "twitter", "canonical", "robots", "sitemap", "manifest", "favicon", "schema", "json-ld"]],
  ] as const;

  for (const [moduleName, words] of keywordGroups) {
    if (modules.includes(moduleName) || words.some((word) => text.includes(word))) {
      for (const word of words) if (p.includes(word)) score += 12;
    }
  }

  for (const token of text.split(/\s+/).filter((item) => item.length > 4)) {
    if (p.includes(token)) score += 2;
  }

  if (/(seo|metadata|metadatos|open graph|opengraph|twitter|canonical|robots|sitemap|manifest|favicon|schema|json-ld)/.test(text)) {
    if (/^app\/(layout|page)\.(tsx|ts|jsx|js)$/.test(p)) score += 40;
    if (/^app\/(robots|sitemap|manifest)\.(ts|js)$/.test(p)) score += 42;
    if (/^app\/(opengraph-image|twitter-image)\.(tsx|ts|jsx|js)$/.test(p)) score += 38;
    if (/^app\/(icon|favicon)\.(png|jpg|jpeg|svg|ico)$/.test(p)) score += 18;
    if (/^public\/(favicon|apple-touch-icon|site\.webmanifest|.*og.*|.*twitter.*)/.test(p)) score += 20;
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

function buildPlanDoc(plan: Omit<ExecutorV3Plan, "proposedFiles" | "humanChangePlan" | "preflight">) {
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

function fallbackFiles(_plan: Omit<ExecutorV3Plan, "proposedFiles" | "humanChangePlan" | "preflight">): ExecutorFileChange[] {
  // El Executor ya no convierte conversaciones/prompts en archivos Markdown.
  // Los planes se guardan como datos estructurados en Supabase desde las APIs de ejecución.
  // Si la IA no puede proponer un cambio seguro sobre archivos reales, no se crea Pull Request.
  return [];
}

function isCompanionInstruction(instruction: string) {
  return /(companion|avatar|mascota|asistente|assistant|personaje|emocion|emoci[oó]n|vivo|evolutivo|animaci[oó]n)/i.test(instruction);
}

function findCandidatePath(plan: Omit<ExecutorV3Plan, "proposedFiles" | "humanChangePlan" | "preflight">, pattern: RegExp) {
  return plan.projectMap.candidates.find((file) => pattern.test(file.path))?.path;
}

function upgradeEvolutionaryAvatarContent(content: string) {
  let next = content;

  if (!next.includes("memory?: string")) {
    next = next.replace(
      "  onClick?: () => void;\n};",
      "  onClick?: () => void;\n  memory?: string;\n  energy?: number;\n  autonomy?: boolean;\n};"
    );
  }

  if (!next.includes("memory = \"Aprendiendo de la empresa\"")) {
    next = next.replace(
      "  compact = false,\n  onClick,\n}: EvolutionaryCompanionAvatarProps) {",
      "  compact = false,\n  onClick,\n  memory = \"Aprendiendo de la empresa\",\n  energy = 82,\n  autonomy = true,\n}: EvolutionaryCompanionAvatarProps) {"
    );
  }

  if (!next.includes("const safeEnergy")) {
    next = next.replace(
      "  const safeXp = Math.max(4, Math.min(100, xpPercent));",
      "  const safeXp = Math.max(4, Math.min(100, xpPercent));\n  const safeEnergy = Math.max(0, Math.min(100, energy));"
    );
  }

  if (!next.includes("evo-status-strip")) {
    next = next.replace(
      `          <span className="evo-xp"><i style={{ width: \`\${safeXp}%\` }} /></span>\n        </span>`,
      `          <span className="evo-xp"><i style={{ width: \`\${safeXp}%\` }} /></span>\n          <span className="evo-status-strip">\n            <small>Memoria: {memory}</small>\n            <small>Energía: {safeEnergy}% · {autonomy ? "Autónomo" : "Guiado"}</small>\n          </span>\n        </span>`
    );
  }

  return next;
}

function upgradeCompanionCssContent(content: string) {
  if (content.includes(".evo-status-strip")) return content;
  return `${content}

/* Flowly Companion: capa evolutiva de memoria, energía y vida visual */
.evo-status-strip {
  display: grid;
  gap: .18rem;
  margin-top: .42rem;
  font-size: .58rem;
  line-height: 1.15;
  color: rgba(224,242,254,.72);
}
.evo-status-strip small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.evo-companion::after {
  content: "";
  position: absolute;
  inset: 10% 4% auto auto;
  width: .55rem;
  height: .55rem;
  border-radius: 999px;
  background: var(--accent, #67e8f9);
  box-shadow: 0 0 18px var(--accent, #67e8f9);
  opacity: .72;
  animation: evo-life-pulse 2.4s ease-in-out infinite;
}
@keyframes evo-life-pulse {
  0%, 100% { transform: scale(.72); opacity: .45; }
  50% { transform: scale(1.14); opacity: .9; }
}
`;
}

async function buildDeterministicSafeFiles(plan: Omit<ExecutorV3Plan, "proposedFiles" | "humanChangePlan" | "preflight">): Promise<ExecutorFileChange[]> {
  if (!isCompanionInstruction(plan.instruction)) return [];

  const avatarPath = findCandidatePath(plan, /(^|\/)EvolutionaryCompanionAvatar\.tsx$/i) || "components/EvolutionaryCompanionAvatar.tsx";
  const cssPath = findCandidatePath(plan, /(^|\/)globals\.css$/i) || "app/globals.css";
  const files: ExecutorFileChange[] = [];

  try {
    const avatar = await readRepositoryFile(avatarPath);
    const content = upgradeEvolutionaryAvatarContent(avatar.content);
    if (content !== avatar.content) {
      files.push({
        path: avatar.path,
        content,
        message: "Mejorar el avatar existente con memoria, energía y comportamiento evolutivo sin duplicarlo.",
      });
    }
  } catch {
    // No crear archivos nuevos si no podemos leer el avatar existente.
  }

  try {
    const css = await readRepositoryFile(cssPath);
    const content = upgradeCompanionCssContent(css.content);
    if (content !== css.content) {
      files.push({
        path: css.path,
        content,
        message: "Añadir microinteracciones visuales evolutivas al Companion existente.",
      });
    }
  } catch {
    // No bloquear si CSS no está disponible.
  }

  return files.slice(0, 3);
}

async function buildAIFiles(params: {
  plan: Omit<ExecutorV3Plan, "proposedFiles" | "humanChangePlan" | "preflight">;
  context: Array<{ path: string; content: string }>;
  developerContext?: unknown;
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
    "- Grounding obligatorio: usa solo archivos reales incluidos en projectMap.candidates, projectGraph, impact o developerContext.projectSnapshot.",
    "- Este repositorio usa Next.js App Router si developerContext.projectSnapshot.framework.router='app-router'. Nunca inventes index.html, about.html, blog.html, header.php ni archivos de otros frameworks.",
    "- Para SEO/metadata/Open Graph prioriza app/layout.tsx, app/page.tsx, app/sitemap.ts, app/robots.ts, app/manifest.ts, app/opengraph-image.tsx, app/twitter-image.tsx, app/icon.png o public/favicon.ico SOLO si aparecen como rutas reales en developerContext.projectSnapshot.",
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
            developerContext: params.developerContext || params.plan.developerContext || null,
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

function humanizeChangeFromFile(file: ExecutorFileChange, instruction: string): ExecutorV3HumanChange {
  const path = normalize(file.path);
  const text = normalize(`${instruction} ${file.message || ""}`);

  if (path.includes("app/developer") || path.includes("flowlydeveloper") || text.includes("developer")) {
    return {
      title: "Developer será más conversacional y menos forzado",
      description: "Voy a mejorar la forma en la que Developer explica el trabajo: primero entenderá la petición, después contará con palabras normales qué cambiará en la pantalla o flujo afectado, y solo al final enseñará los archivos técnicos como detalle secundario.",
      userImpact: "Podrás hablarle como a una persona: pedir cambios, corregir el rumbo, continuar una idea anterior y entender exactamente qué resultado visual o funcional va a aplicar antes de aprobar.",
      safetyNote: "No se modifica producción directamente; el cambio se aplicará en una rama y Pull Request.",
    };
  }

  if (path.includes("companion") || path.includes("avatar") || text.includes("companion")) {
    return {
      title: "El Companion cambiará su comportamiento visible",
      description: "Voy a ajustar la experiencia del Companion existente en vez de crear otro: controles, presencia en pantalla, estado visual, movimiento o comportamiento según lo que hayas pedido.",
      userImpact: "El usuario verá a Flow más controlable y menos molesto, manteniendo la idea de asistente permanente dentro del OS.",
      safetyNote: "Reutilizaré el runtime/componente existente para evitar duplicados.",
    };
  }

  if (path.includes("crm") || text.includes("crm") || text.includes("cliente")) {
    return {
      title: "El CRM se reorganizará para ser más claro",
      description: "Voy a ajustar la distribución del CRM, priorizando que la ficha, listas, acciones y navegación respiren mejor y no compitan por espacio.",
      userImpact: "El CRM se sentirá menos saturado, más profesional y más fácil de usar para comerciales o administración.",
      safetyNote: "No tocaré base de datos salvo que el plan lo indique expresamente.",
    };
  }

  if (path.includes("css") || path.includes("globals")) {
    return {
      title: "La interfaz recibirá ajustes visuales controlados",
      description: "Voy a tocar estilos globales o microinteracciones para que la pantalla se sienta más pulida sin cambiar la lógica principal.",
      userImpact: "El cambio se notará en el aspecto, espaciado, animación o presencia visual de la zona afectada.",
      safetyNote: "Mantendré los estilos acotados para no romper otras pantallas.",
    };
  }

  if (path.includes("api/")) {
    return {
      title: "La API afectada se hará más segura o fiable",
      description: "Voy a ajustar el endpoint existente para validar mejor la entrada, devolver respuestas más claras y evitar ejecuciones ambiguas.",
      userImpact: "El panel tendrá menos errores silenciosos y Developer podrá explicar mejor qué ha ocurrido.",
      safetyNote: "No expondré claves ni cambiaré permisos sensibles sin aprobación explícita.",
    };
  }

  return {
    title: "Se modificará una pieza existente de Flowly",
    description: file.message || "Voy a aplicar un cambio pequeño y revisable sobre una parte existente del proyecto, evitando crear versiones paralelas.",
    userImpact: "El usuario verá el cambio en el comportamiento o la presentación de la zona relacionada con la petición.",
    safetyNote: "El cambio se ejecutará en rama segura y Pull Request.",
  };
}

export function buildHumanReadableChangePlan(files: ExecutorFileChange[], instruction: string): ExecutorV3HumanChange[] {
  const unique = new Map<string, ExecutorV3HumanChange>();
  for (const file of files.slice(0, 8)) {
    const item = humanizeChangeFromFile(file, instruction);
    if (!unique.has(item.title)) unique.set(item.title, item);
  }
  return Array.from(unique.values());
}

export function runExecutorPreflight(files: ExecutorFileChange[], options?: { approvedPackageJson?: boolean; buildGuard?: FlowlyBuildGuardResult }): ExecutorV3Preflight {
  const checks: ExecutorV3Preflight["checks"] = [];
  const approvedPackageJson = Boolean(options?.approvedPackageJson);
  const buildGuard = options?.buildGuard || runFlowlyBuildGuard(files);
  const normalized = files.map((file) => normalize(file.path));
  const hasUnsafePath = files.some((file) => file.path.includes("..") || file.path.startsWith("/"));
  const packageTouched = normalized.some((file) => file === "package.json" || file.endsWith("/package.json"));
  const duplicateRuntime = normalized.some((file) => /(v2|v3|new|copy|copia|backup)/.test(file) && /(companion|voice|brain|memory|executor)/.test(file));
  const emptyContent = files.some((file) => !file.content || file.content.trim().length < 20);
  const docsOnly = files.length > 0 && normalized.every((file) => file.startsWith("docs/"));

  checks.push({ label: "Rutas seguras", ok: !hasUnsafePath, detail: hasUnsafePath ? "Hay rutas absolutas o con .." : "Todas las rutas son relativas y seguras." });
  checks.push({ label: "Contenido válido", ok: !emptyContent, detail: emptyContent ? "Algún archivo viene vacío o incompleto." : "Los archivos tienen contenido suficiente." });
  checks.push({ label: "Sin cambios sensibles", ok: !packageTouched || approvedPackageJson, detail: packageTouched ? "package.json requiere aprobación explícita." : "No se cambian dependencias ni package.json." });
  checks.push({ label: "Sin motores duplicados", ok: !duplicateRuntime, detail: duplicateRuntime ? "Se detectó posible archivo paralelo V2/V3/copia en un motor crítico." : "No se detectan runtimes o motores duplicados." });
  checks.push({ label: "No documentación falsa", ok: !docsOnly, detail: docsOnly ? "El cambio solo generaría documentación; no se creará PR automático." : "El PR contiene cambios de producto/código, no solo docs." });
  checks.push({ label: "Build Guard", ok: buildGuard.ok, detail: buildGuard.summary });

  const failed = checks.find((check) => !check.ok);
  return {
    ok: !failed,
    status: failed ? "blocked" : "passed",
    checks,
    blockedReason: failed?.detail,
    buildGuard,
  };
}

export async function planExecutorV3(instruction: string, developerContext?: unknown): Promise<ExecutorV3Plan> {
  const clean = instruction.trim();
  const { map, context } = await buildProjectMap(clean);
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
    developerContext,
  };

  const aiFiles = await buildAIFiles({ plan: planBase, context, developerContext });
  const deterministicFiles = aiFiles?.length ? [] : await buildDeterministicSafeFiles(planBase);
  const proposedFiles = (aiFiles?.length ? aiFiles : deterministicFiles).filter((file) => !normalize(file.path).startsWith("docs/executor/"));

  const initialProposedFiles = proposedFiles.length ? proposedFiles : fallbackFiles(planBase);
  const buildGuard = runFlowlyBuildGuard(initialProposedFiles);
  const safeProposedFiles = buildGuard.files;
  return {
    ...planBase,
    proposedFiles: safeProposedFiles,
    humanChangePlan: buildHumanReadableChangePlan(safeProposedFiles, clean),
    preflight: runExecutorPreflight(safeProposedFiles, { buildGuard }),
  };
}

export async function runExecutorV3FromApprovedPlan(plan: ExecutorV3Plan, approved: boolean): Promise<ExecutorV3RunResult> {
  if (!approved) return plan;

  const rawFiles = (plan.proposedFiles || []).filter((file) => file.content && !normalize(file.path).startsWith("docs/executor/"));
  const buildGuard = runFlowlyBuildGuard(rawFiles);
  const files = buildGuard.files;
  const preflight = runExecutorPreflight(files, { buildGuard });

  if (!files.length || !preflight.ok) {
    return {
      ...plan,
      preflight,
      status: "planned",
      proposedFiles: files,
      error: preflight.blockedReason || "Executor V3 no ha encontrado cambios de código seguros para aplicar. No crearé PR falso ni archivos duplicados.",
    };
  }

  const title = `Flowly Developer: ${plan.instruction.slice(0, 72)}`;
  const pr = await createExecutorPullRequest({
    title,
    body: [
      "## Flowly Developer OS",
      "Este Pull Request fue creado automáticamente por Flowly Developer usando el plan aprobado por el usuario.",
      "",
      "### Petición aprobada",
      plan.instruction,
      "",
      "### Cambios entendibles para usuario",
      ...plan.humanChangePlan.flatMap((item) => [`- **${item.title}**: ${item.description}`, `  Impacto: ${item.userImpact}`]),
      "",
      "### Archivos modificados",
      ...files.map((file) => `- \`${file.path}\` — ${file.message || "Cambio aprobado"}`),
      "",
      "### Preflight",
      ...preflight.checks.map((check) => `- ${check.ok ? "✅" : "❌"} ${check.label}: ${check.detail}`),
      "",
      "### Build Guard",
      preflight.buildGuard?.summary || "Build Guard no ejecutado.",
      ...(preflight.buildGuard?.issues.length ? preflight.buildGuard.issues.map((issue) => `- ${issue.severity === "error" ? "❌" : "⚠️"} ${issue.path}: ${issue.message}`) : ["- Sin incidencias estáticas conocidas."]),
      "",
      "### Seguridad",
      "No se modifica la rama principal directamente. Este PR debe revisarse antes de hacer merge.",
    ].join("\n"),
    branchName: `flowly/developer-${slug(plan.instruction)}-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 12)}`,
    files,
  });

  return {
    ...plan,
    status: pr.ok ? "pull_request_created" : "planned",
    proposedFiles: files,
    preflight,
    pullRequestUrl: pr.pullRequestUrl,
    pullRequestNumber: pr.pullRequestNumber,
    branch: pr.branch,
    error: pr.error,
  };
}

export async function runExecutorV3(instruction: string, approved: boolean, developerContext?: unknown): Promise<ExecutorV3RunResult> {
  const plan = await planExecutorV3(instruction, developerContext);
  return runExecutorV3FromApprovedPlan(plan, approved);
}
