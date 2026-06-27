import {
  BookOpen,
  Bot,
  BrainCircuit,
  Boxes,
  Building2,
  Code2,
  Database,
  FileCode2,
  FileText,
  GitBranch,
  Landmark,
  Layers3,
  LifeBuoy,
  Palette,
  Rocket,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Workflow,
  Wrench,
} from "lucide-react";
import { flowlyDocBooks, type FlowlyDocBook, type FlowlyDocStatus } from "@/lib/flowlyDocsContent";

export type FlowlyDocChapter = {
  slug: string;
  title: string;
  summary: string;
  status: FlowlyDocStatus;
};

export type FlowlyDocSection = {
  slug: string;
  title: string;
  badge: string;
  description: string;
  icon: typeof BookOpen;
  color: string;
  chapters: FlowlyDocChapter[];
};

const sectionVisuals: Record<string, { icon: typeof BookOpen; color: string }> = {
  constitution: { icon: Landmark, color: "from-amber-300/25 to-orange-500/10" },
  "architecture-bible": { icon: BookOpen, color: "from-violet-400/25 to-fuchsia-500/10" },
  "reference-architecture": { icon: Layers3, color: "from-cyan-300/25 to-blue-500/10" },
  "engineering-handbook": { icon: Code2, color: "from-emerald-300/25 to-teal-500/10" },
  "implementation-blueprint": { icon: Rocket, color: "from-rose-300/25 to-red-500/10" },
  "domain-catalog": { icon: Boxes, color: "from-indigo-300/25 to-violet-500/10" },
  "capability-catalog": { icon: BrainCircuit, color: "from-purple-300/25 to-pink-500/10" },
  "product-modules": { icon: Building2, color: "from-sky-300/25 to-blue-500/10" },
  "design-system": { icon: Palette, color: "from-pink-300/25 to-rose-500/10" },
  "database-supabase": { icon: Database, color: "from-green-300/25 to-emerald-500/10" },
  "workflow-automation": { icon: Workflow, color: "from-orange-300/25 to-amber-500/10" },
  "tools-integrations": { icon: Wrench, color: "from-cyan-300/25 to-teal-500/10" },
  "ai-specification": { icon: Sparkles, color: "from-fuchsia-300/25 to-purple-500/10" },
  api: { icon: FileCode2, color: "from-sky-300/25 to-cyan-500/10" },
  sdk: { icon: GitBranch, color: "from-blue-300/25 to-indigo-500/10" },
  marketplace: { icon: Building2, color: "from-lime-300/25 to-green-500/10" },
  companion: { icon: Bot, color: "from-violet-300/25 to-cyan-500/10" },
  "security-governance": { icon: ShieldCheck, color: "from-lime-300/25 to-emerald-500/10" },
  "devops-manual": { icon: Settings2, color: "from-slate-300/25 to-zinc-500/10" },
  "operations-manual": { icon: LifeBuoy, color: "from-yellow-300/25 to-orange-500/10" },
  "docs-platform": { icon: Search, color: "from-cyan-300/25 to-fuchsia-500/10" },
  roadmap: { icon: Rocket, color: "from-red-300/25 to-pink-500/10" },
  glossary: { icon: FileText, color: "from-white/20 to-white/5" },
  adr: { icon: FileText, color: "from-stone-300/25 to-zinc-500/10" },
  "api-sdk-marketplace": { icon: GitBranch, color: "from-sky-300/25 to-cyan-500/10" },
};

function toSection(book: FlowlyDocBook): FlowlyDocSection {
  const visual = sectionVisuals[book.slug] || { icon: BookOpen, color: "from-white/20 to-white/5" };
  return {
    slug: book.slug,
    title: book.title,
    badge: book.badge,
    description: book.description,
    icon: visual.icon,
    color: visual.color,
    chapters: book.chapters.map((chapter) => ({ slug: chapter.slug, title: chapter.title, summary: chapter.summary, status: chapter.status })),
  };
}

export const flowlyDocSections: FlowlyDocSection[] = flowlyDocBooks.map(toSection);

const totalChapters = flowlyDocBooks.reduce((total, book) => total + book.chapters.length, 0);
const readyChapters = flowlyDocBooks.reduce((total, book) => total + book.chapters.filter((chapter) => chapter.status === "ready").length, 0);

export const flowlyDocsStats = [
  { label: "Libros disponibles", value: String(flowlyDocBooks.length) },
  { label: "Capítulos base", value: `${totalChapters}+` },
  { label: "Capítulos listos", value: String(readyChapters) },
  { label: "Modo", value: "Nativo" },
];

export const flowlyDocsRoadmap = [
  {
    title: "1. Consolidar documentación",
    text: "Toda la documentación principal ya vive en Markdown dentro del repositorio y se renderiza desde Flowly Docs.",
    icon: FileText,
  },
  {
    title: "2. Crear buscador inteligente",
    text: "Indexar libros, capítulos, Business Objects y Capabilities para preguntar a Flowly Docs en lenguaje natural.",
    icon: Search,
  },
  {
    title: "3. Conectar con código",
    text: "Relacionar documentación con archivos, contratos, APIs, Supabase y componentes reales del proyecto.",
    icon: Sparkles,
  },
  {
    title: "4. Convertirlo en producto",
    text: "Reutilizar Flowly Docs para que clientes documenten procesos, SOPs, políticas y conocimiento interno.",
    icon: Building2,
  },
];
