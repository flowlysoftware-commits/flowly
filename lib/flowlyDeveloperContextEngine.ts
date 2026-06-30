import { promises as fs } from "fs";
import * as path from "path";

export type DeveloperContextSourceKind = "bootstrap" | "summary" | "architecture" | "companion" | "engine" | "docs" | "code";

export type DeveloperContextSource = {
  path: string;
  title: string;
  kind: DeveloperContextSourceKind;
  loaded: boolean;
  score: number;
  summary: string;
  excerpt?: string;
};

export type DeveloperContextBundle = {
  query: string;
  intent: {
    target: string;
    action: string;
    confidence: number;
    needsClarification: boolean;
  };
  sources: DeveloperContextSource[];
  loadedSources: DeveloperContextSource[];
  missingSources: DeveloperContextSource[];
  contextText: string;
  instructionsForAgent: string[];
  warnings: string[];
};

const ROOT = process.cwd();
const DOCS_ROOT = path.join(ROOT, "docs");

const ALWAYS_READ = [
  "AI_BOOTSTRAP.md",
  "docs/SUMMARY.md",
  "docs/README.md",
  "docs/architecture-bible/08-context-engine.md",
  "docs/architecture-bible/13-knowledge-engine.md",
  "docs/architecture-bible/19-conversation-engine.md",
  "docs/architecture-bible/28-execution-engine.md",
  "docs/architecture-bible/29-flowly-cognitive-loop.md",
  "docs/agent-operating-protocol/developer-pipeline.md",
];

const TOPIC_DOCS: Array<{ target: string; terms: string[]; paths: string[] }> = [
  {
    target: "Companion",
    terms: ["companion", "avatar", "flow", "mascota", "asistente", "personaje", "voz", "hablar", "escuchar", "memoria", "emocion"],
    paths: [
      "docs/architecture-bible/16-companion-os.md",
      "docs/architecture-bible/17-companion-identity-engine.md",
      "docs/architecture-bible/18-companion-initiative-engine.md",
      "docs/architecture-bible/19-conversation-engine.md",
      "docs/architecture-bible/31-personality-engine.md",
      "docs/architecture-bible/32-avatar-engine.md",
      "docs/architecture-bible/33-voice-engine.md",
      "docs/companion/01-companion-identity.md",
      "docs/companion/03-conversation-model.md",
      "docs/companion/04-memory-usage.md",
      "docs/companion/08-avatar-behaviour.md",
      "docs/companion/09-voice-behaviour.md",
      "docs/companion/10-tool-usage.md",
    ],
  },
  {
    target: "Developer OS",
    terms: ["developer", "executor", "codex", "pipeline", "github", "pull request", "pr", "build", "qa", "crear", "modificar", "arreglar"],
    paths: [
      "docs/agent-operating-protocol/01-codex-operating-protocol.md",
      "docs/agent-operating-protocol/02-companion-debug-protocol.md",
      "docs/agent-operating-protocol/03-voice-runtime-protocol.md",
      "docs/agent-operating-protocol/developer-pipeline.md",
      "docs/architecture-bible/27-planning-engine.md",
      "docs/architecture-bible/28-execution-engine.md",
      "docs/architecture-bible/30-flowly-internal-protocol.md",
    ],
  },
  {
    target: "CRM",
    terms: ["crm", "cliente", "clientes", "lead", "pipeline", "oportunidad", "comercial"],
    paths: [
      "docs/business-objects/customer.md",
      "docs/business-objects/lead.md",
      "docs/business-objects/opportunity.md",
      "docs/capability-catalog/01-create-customer.md",
      "docs/capability-catalog/05-create-lead.md",
      "docs/capability-catalog/08-create-opportunity.md",
    ],
  },
  {
    target: "Facturación",
    terms: ["factura", "facturacion", "facturación", "presupuesto", "ingreso", "gasto", "stripe"],
    paths: [
      "docs/capability-catalog/10-generate-proposal.md",
      "docs/capability-catalog/11-generate-quote.md",
      "docs/capability-catalog/13-create-invoice.md",
      "docs/capability-catalog/15-mark-invoice-paid.md",
      "docs/database-supabase/02-schema-foundation.md",
    ],
  },
  {
    target: "AI Runtime",
    terms: ["brain", "cerebro", "ia", "context", "contexto", "knowledge", "docs", "memoria", "razonar"],
    paths: [
      "docs/ai-specification/05-context-injection.md",
      "docs/ai-specification/06-rag-strategy.md",
      "docs/architecture-bible/09-memory-engine.md",
      "docs/architecture-bible/10-learning-engine.md",
      "docs/architecture-bible/13-knowledge-engine.md",
      "docs/architecture-bible/24-reasoning-engine.md",
      "docs/architecture-bible/39-ai-runtime.md",
    ],
  },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function excerpt(content: string, max = 900) {
  return content.replace(/\s+/g, " ").trim().slice(0, max);
}

function titleFromMarkdown(filePath: string, content: string) {
  const firstHeading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (firstHeading) return firstHeading;
  return filePath.split("/").pop()?.replace(/\.md$/, "") || filePath;
}

function kindForPath(filePath: string): DeveloperContextSourceKind {
  if (filePath === "AI_BOOTSTRAP.md") return "bootstrap";
  if (filePath.endsWith("SUMMARY.md")) return "summary";
  if (filePath.includes("architecture-bible")) return "architecture";
  if (filePath.includes("companion")) return "companion";
  if (/(engine|runtime|pipeline|protocol)/i.test(filePath)) return "engine";
  return "docs";
}

async function readLocalFile(relativePath: string, score: number): Promise<DeveloperContextSource> {
  const normalizedPath = relativePath.replace(/\\/g, "/");
  try {
    const content = await fs.readFile(path.join(ROOT, normalizedPath), "utf8");
    return {
      path: normalizedPath,
      title: titleFromMarkdown(normalizedPath, content),
      kind: kindForPath(normalizedPath),
      loaded: true,
      score,
      summary: `Leído desde el repositorio local (${Math.round(content.length / 1000)}k caracteres).`,
      excerpt: excerpt(content),
    };
  } catch (error) {
    return {
      path: normalizedPath,
      title: normalizedPath,
      kind: kindForPath(normalizedPath),
      loaded: false,
      score,
      summary: error instanceof Error ? error.message : String(error),
    };
  }
}

async function listMarkdownDocs(dir = DOCS_ROOT): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return listMarkdownDocs(full);
        if (!entry.name.endsWith(".md")) return [];
        return [path.relative(ROOT, full).replace(/\\/g, "/")];
      })
    );
    return files.flat();
  } catch {
    return [];
  }
}

function detectIntent(query: string) {
  const text = normalize(query);
  const target = TOPIC_DOCS.map((topic) => ({
    topic,
    score: topic.terms.reduce((acc, term) => acc + (text.includes(normalize(term)) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score)[0];

  const action = /(crear|nuevo|construir|generar|montar)/.test(text)
    ? "crear"
    : /(arreglar|fallo|error|bug|no funciona|corrige|reparar)/.test(text)
      ? "arreglar"
      : /(mejorar|optimizar|rediseñar|modificar|cambiar)/.test(text)
        ? "mejorar"
        : /(explica|revisa|investiga|analiza|comprueba)/.test(text)
          ? "analizar"
          : "conversar";

  const confidence = target?.score ? Math.min(1, 0.35 + target.score * 0.18) : 0.28;
  const needsClarification = text.length < 18 || (action === "conversar" && confidence < 0.45);

  return {
    target: target?.score ? target.topic.target : "Flowly OS",
    action,
    confidence,
    needsClarification,
  };
}

async function scoreDocsByContent(query: string, limit = 8) {
  const text = normalize(query);
  const tokens = text.split(/\s+/).filter((token) => token.length > 3);
  const docs = await listMarkdownDocs();
  const scored: Array<{ path: string; score: number }> = [];

  for (const docPath of docs.slice(0, 900)) {
    const name = normalize(docPath);
    let score = tokens.reduce((acc, token) => acc + (name.includes(token) ? 4 : 0), 0);
    if (score === 0 && !/(companion|voice|brain|memory|developer|context|executor|pipeline|knowledge)/i.test(docPath)) continue;
    try {
      const content = normalize(await fs.readFile(path.join(ROOT, docPath), "utf8"));
      score += tokens.reduce((acc, token) => acc + (content.includes(token) ? 1 : 0), 0);
    } catch {
      // Ignore unreadable docs.
    }
    if (score > 0) scored.push({ path: docPath, score });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

function buildContextText(sources: DeveloperContextSource[]) {
  const loaded = sources.filter((source) => source.loaded && source.excerpt);
  return loaded
    .slice(0, 14)
    .map((source) => [`## ${source.path}`, source.excerpt].join("\n"))
    .join("\n\n---\n\n")
    .slice(0, 9000);
}

export async function buildDeveloperContextBundle(query: string): Promise<DeveloperContextBundle> {
  const intent = detectIntent(query);
  const normalizedQuery = normalize(query);
  const topicPaths = TOPIC_DOCS.filter((topic) => topic.target === intent.target || topic.terms.some((term) => normalizedQuery.includes(normalize(term))))
    .flatMap((topic) => topic.paths);
  const contentMatches = await scoreDocsByContent(query);
  const paths = Array.from(new Set([...ALWAYS_READ, ...topicPaths, ...contentMatches.map((item) => item.path)]));
  const scoreMap = new Map(contentMatches.map((item) => [item.path, item.score]));

  const sources = await Promise.all(paths.map((filePath, index) => readLocalFile(filePath, (scoreMap.get(filePath) || 0) + Math.max(1, 80 - index))));
  const ordered = sources.sort((a, b) => Number(b.loaded) - Number(a.loaded) || b.score - a.score);
  const loadedSources = ordered.filter((source) => source.loaded);
  const missingSources = ordered.filter((source) => !source.loaded);
  const contextText = buildContextText(ordered);
  const warnings: string[] = [];

  if (!loadedSources.some((source) => source.path === "AI_BOOTSTRAP.md")) warnings.push("AI_BOOTSTRAP.md no está disponible para el Context Engine.");
  if (!loadedSources.some((source) => source.path === "docs/SUMMARY.md")) warnings.push("docs/SUMMARY.md no está disponible para el Context Engine.");
  if (intent.needsClarification) warnings.push("La petición es amplia o poco concreta: conviene responder conversando antes de ejecutar cambios.");

  return {
    query,
    intent,
    sources: ordered,
    loadedSources,
    missingSources,
    contextText,
    warnings,
    instructionsForAgent: [
      "Usa /docs como memoria y fuente de verdad de Flowly OS antes de planificar.",
      "No trates cualquier mensaje como reinicio de proyecto; primero interpreta intención, módulo y riesgo.",
      "Si falta contexto, pregunta de forma natural antes de ejecutar.",
      "No crees motores duplicados: reutiliza Brain, Heart, Memory, Context, Executor, QA y Project Graph existentes.",
      "Nunca generes PR si no hay cambios seguros sobre archivos reales.",
    ],
  };
}

export function summarizeDeveloperContext(bundle: DeveloperContextBundle) {
  return {
    target: bundle.intent.target,
    action: bundle.intent.action,
    confidence: bundle.intent.confidence,
    needsClarification: bundle.intent.needsClarification,
    loaded: bundle.loadedSources.length,
    missing: bundle.missingSources.length,
    sources: bundle.loadedSources.slice(0, 12).map((source) => ({ path: source.path, title: source.title, kind: source.kind })),
    warnings: bundle.warnings,
  };
}
