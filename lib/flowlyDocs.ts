import {
  BookOpen,
  BrainCircuit,
  Boxes,
  Building2,
  Code2,
  FileText,
  GitBranch,
  Landmark,
  Layers3,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export type FlowlyDocChapter = {
  title: string;
  summary: string;
  status: "draft" | "ready" | "next";
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

export const flowlyDocSections: FlowlyDocSection[] = [
  {
    slug: "constitution",
    title: "Flowly Constitution",
    badge: "Identidad",
    description: "Resumen ejecutivo de la visión, principios y reglas que no debe romper Flowly OS.",
    icon: Landmark,
    color: "from-amber-300/25 to-orange-500/10",
    chapters: [
      { title: "Propósito", summary: "Por qué existe Flowly y qué problema quiere resolver.", status: "ready" },
      { title: "Principios innegociables", summary: "Dominio, confianza, control humano, observabilidad y evolución.", status: "ready" },
      { title: "Manifiesto", summary: "La promesa de construir tecnología que trabaja con personas.", status: "ready" },
    ],
  },
  {
    slug: "architecture-bible",
    title: "Architecture Bible",
    badge: "Visión completa",
    description: "Los 50 capítulos conceptuales que definen Flowly OS como Living Business Operating System.",
    icon: BookOpen,
    color: "from-violet-400/25 to-fuchsia-500/10",
    chapters: [
      { title: "Business Objects", summary: "El dominio como fuente de verdad y entidad viva.", status: "ready" },
      { title: "Companion OS", summary: "El compañero operativo: identidad, conversación, voz, avatar y presencia.", status: "ready" },
      { title: "Cognitive Loop", summary: "Observación, memoria, razonamiento, decisión, planificación y ejecución.", status: "ready" },
      { title: "Flowly Constitution", summary: "La declaración fundacional del sistema operativo empresarial.", status: "ready" },
    ],
  },
  {
    slug: "reference-architecture",
    title: "Reference Architecture",
    badge: "Plano técnico",
    description: "Mapa técnico del Kernel, Engines, Capabilities, Organizations, Identity, Context y Governance.",
    icon: Layers3,
    color: "from-cyan-300/25 to-blue-500/10",
    chapters: [
      { title: "System Flow", summary: "Cómo viaja una operación desde la interfaz hasta los Events.", status: "ready" },
      { title: "Kernel Architecture", summary: "Servicios permanentes que sostienen Flowly OS.", status: "ready" },
      { title: "Capability Runtime", summary: "Cómo se resuelven, seleccionan y ejecutan capacidades.", status: "ready" },
      { title: "AI Runtime", summary: "Abstracción completa sobre proveedores y modelos de IA.", status: "ready" },
    ],
  },
  {
    slug: "engineering-handbook",
    title: "Engineering Handbook",
    badge: "Desarrollo",
    description: "Normas para programar Flowly: estructura, código, testing, CI/CD, Apps, Plugins y desarrollo con IA.",
    icon: Code2,
    color: "from-emerald-300/25 to-teal-500/10",
    chapters: [
      { title: "Project Structure", summary: "Organización del monorepo y responsabilidades por carpeta.", status: "ready" },
      { title: "Coding Standards", summary: "TypeScript estricto, nombres claros, tests y observabilidad.", status: "ready" },
      { title: "AI-Assisted Development", summary: "Cómo usar IA sin romper la arquitectura.", status: "ready" },
      { title: "Engineering Culture", summary: "La cultura técnica para construir software durante décadas.", status: "ready" },
    ],
  },
  {
    slug: "implementation-blueprint",
    title: "Implementation Blueprint",
    badge: "Siguiente fase",
    description: "El plano de construcción: qué programar primero, Supabase, APIs, módulos y roadmap técnico.",
    icon: Rocket,
    color: "from-rose-300/25 to-red-500/10",
    chapters: [
      { title: "Foundation Sprint", summary: "Monorepo, configuración, Auth, Organizations y Kernel mínimo.", status: "next" },
      { title: "Supabase Schema", summary: "Tablas base, RLS, Storage, Edge Functions y migraciones.", status: "next" },
      { title: "MVP Roadmap", summary: "Orden real para construir Flowly OS encima del proyecto actual.", status: "next" },
    ],
  },
  {
    slug: "domain-catalog",
    title: "Domain Catalog",
    badge: "Dominio",
    description: "Catálogo oficial de Business Objects, estados, relaciones, Commands, Queries, Events y Policies.",
    icon: Boxes,
    color: "from-indigo-300/25 to-violet-500/10",
    chapters: [
      { title: "Customer", summary: "Cliente como entidad viva con relaciones, historial y capacidades.", status: "draft" },
      { title: "Invoice", summary: "Factura, estados fiscales, documentos y pagos relacionados.", status: "draft" },
      { title: "Collaboration", summary: "Relaciones de trabajo persistentes entre usuarios y Companion.", status: "draft" },
    ],
  },
  {
    slug: "capability-catalog",
    title: "Capability Catalog",
    badge: "Capacidades",
    description: "Todas las acciones reutilizables que Flowly sabe ejecutar, organizadas por dominio.",
    icon: BrainCircuit,
    color: "from-purple-300/25 to-pink-500/10",
    chapters: [
      { title: "Create Customer", summary: "Crear un cliente mediante contrato, validación, evento y observabilidad.", status: "draft" },
      { title: "Generate Proposal", summary: "Generar propuesta comercial desde datos del cliente y plantillas.", status: "draft" },
      { title: "Send WhatsApp", summary: "Enviar mensajes mediante Tool oficial y trazabilidad completa.", status: "draft" },
    ],
  },
  {
    slug: "api-sdk-marketplace",
    title: "API · SDK · Marketplace",
    badge: "Ecosistema",
    description: "Especificaciones para integradores, desarrolladores externos, plugins y partners.",
    icon: GitBranch,
    color: "from-sky-300/25 to-cyan-500/10",
    chapters: [
      { title: "API Specification", summary: "APIs públicas como exposición de Capabilities oficiales.", status: "draft" },
      { title: "SDK Specification", summary: "SDKs generados desde contratos y ejemplos prácticos.", status: "draft" },
      { title: "Marketplace Specification", summary: "Apps, Plugins, Tools y Trust Score.", status: "draft" },
    ],
  },
  {
    slug: "security-governance",
    title: "Security & Governance",
    badge: "Confianza",
    description: "Identidad, autorización, políticas, auditoría, privacidad, compliance y seguridad por diseño.",
    icon: ShieldCheck,
    color: "from-lime-300/25 to-emerald-500/10",
    chapters: [
      { title: "Identity Architecture", summary: "Usuarios, Companion, agentes, Apps, Plugins y Workflows como identidades.", status: "ready" },
      { title: "Authorization Architecture", summary: "Permisos dinámicos, políticas, contexto y Risk Score.", status: "ready" },
      { title: "Governance Architecture", summary: "Policy Registry, cumplimiento, IA responsable y retención.", status: "ready" },
    ],
  },
];

export const flowlyDocsStats = [
  { label: "Libros disponibles", value: "13" },
  { label: "Capítulos base", value: "250+" },
  { label: "Áreas documentales", value: "13" },
  { label: "Modo", value: "Nativo" },
];

export const flowlyDocsRoadmap = [
  {
    title: "1. Consolidar documentación",
    text: "Convertir los capítulos ya escritos en Markdown limpio, enlazado y versionado dentro del repositorio.",
    icon: FileText,
  },
  {
    title: "2. Crear buscador inteligente",
    text: "Indexar capítulos, Business Objects y Capabilities para preguntar a Flowly Docs en lenguaje natural.",
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
