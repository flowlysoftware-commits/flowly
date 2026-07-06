export type FlowlyAuditTarget =
  | "companion"
  | "crm"
  | "developer"
  | "seo"
  | "billing"
  | "marketing"
  | "flowly_os";

export type FlowlyAuditDimension =
  | "architecture"
  | "implementation"
  | "ux"
  | "visual_qa"
  | "responsive"
  | "conversation"
  | "voice"
  | "performance"
  | "state"
  | "data_model"
  | "security"
  | "integrations"
  | "documentation"
  | "seo";

export type FlowlyAuditScope = {
  target: FlowlyAuditTarget;
  label: string;
  allowedDimensions: FlowlyAuditDimension[];
  blockedDimensions: FlowlyAuditDimension[];
  relevantPathPatterns: string[];
  forbiddenTopics: string[];
  instruction: string;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

export function resolveFlowlyAuditScope(instruction: string): FlowlyAuditScope {
  const text = normalize(instruction);

  if (/\bseo\b|sitemap|robots|metadata|metadatos|indexacion|indexar|open\s*graph|opengraph|twitter\s*card/.test(text)) {
    return {
      target: "seo",
      label: "SEO/metadata",
      allowedDimensions: ["architecture", "implementation", "seo", "performance", "documentation"],
      blockedDimensions: ["conversation", "voice", "visual_qa"],
      relevantPathPatterns: ["layout", "page", "robots", "sitemap", "manifest", "opengraph", "twitter", "icon", "favicon", "public/"],
      forbiddenTopics: [],
      instruction: "La auditoría es SEO/metadata: aquí sí es relevante revisar robots, sitemap, metadata, Open Graph, manifest e indexación.",
    };
  }

  if (/companion|avatar|voice|voz|asistente|mascota|runtime/.test(text)) {
    return {
      target: "companion",
      label: "Companion",
      allowedDimensions: ["architecture", "implementation", "ux", "visual_qa", "responsive", "conversation", "voice", "performance", "state", "integrations", "documentation"],
      blockedDimensions: ["seo"],
      relevantPathPatterns: ["companion", "avatar", "voice", "runtime", "FlowlyCompanion", "FlowlyAssistant", "EvolutionaryCompanion", "useVoice", "brandAvatar"],
      forbiddenTopics: ["seo", "robots.ts", "sitemap.ts", "metadata", "indexación", "indexacion", "open graph", "opengraph"],
      instruction: "La auditoría es del Companion: prioriza arquitectura, UX, avatar, conversación, voz, estado, performance, responsive y Visual QA. SEO/robots/sitemap/metadata queda fuera de alcance salvo que el usuario pida explícitamente auditoría SEO.",
    };
  }

  if (/crm|cliente|clientes|lead|contacto|oportunidad|pipeline comercial/.test(text)) {
    return {
      target: "crm",
      label: "CRM",
      allowedDimensions: ["architecture", "implementation", "ux", "data_model", "security", "integrations", "performance", "documentation"],
      blockedDimensions: ["seo"],
      relevantPathPatterns: ["crm", "cliente", "clientes", "customer", "contact", "lead", "opportunit", "admin/clientes", "listas/leads"],
      forbiddenTopics: ["seo", "robots.ts", "sitemap.ts", "metadata", "indexación", "indexacion", "open graph", "opengraph"],
      instruction: "La auditoría es del CRM: prioriza datos, clientes, leads, UX interna, APIs, permisos, trazabilidad e integraciones. SEO/robots/sitemap/metadata queda fuera de alcance salvo petición explícita.",
    };
  }

  if (/developer|pipeline|executor|mission|intent|planner|qa|build guard|grounding|certification/.test(text)) {
    return {
      target: "developer",
      label: "Developer",
      allowedDimensions: ["architecture", "implementation", "performance", "state", "security", "documentation", "integrations"],
      blockedDimensions: ["seo"],
      relevantPathPatterns: ["developer", "pipeline", "executor", "mission", "intent", "planner", "guard", "qa", "certification", "reasoning"],
      forbiddenTopics: ["robots.ts", "sitemap.ts", "indexación", "indexacion"],
      instruction: "La auditoría es de Developer: prioriza intent, misión, planner, executor, guards, QA, PR y trazabilidad. No introduzcas SEO salvo petición explícita.",
    };
  }

  if (/factur|presupuesto|contabilidad|ingreso|gasto/.test(text)) {
    return {
      target: "billing",
      label: "Facturación/presupuestos",
      allowedDimensions: ["architecture", "implementation", "ux", "data_model", "security", "integrations", "performance", "documentation"],
      blockedDimensions: ["seo"],
      relevantPathPatterns: ["factur", "presupuesto", "contabilidad", "invoice", "billing", "payment"],
      forbiddenTopics: ["seo", "robots.ts", "sitemap.ts", "metadata", "indexación", "indexacion"],
      instruction: "La auditoría es de facturación/presupuestos: prioriza datos, PDFs, estados, impuestos, integraciones y UX interna. SEO queda fuera de alcance.",
    };
  }

  if (/marketing|landing|publica|pública|conversion|anuncio|lead magnet/.test(text)) {
    return {
      target: "marketing",
      label: "Marketing/landing",
      allowedDimensions: ["architecture", "implementation", "ux", "seo", "performance", "documentation", "integrations"],
      blockedDimensions: ["voice"],
      relevantPathPatterns: ["page", "layout", "marketing", "landing", "lead", "contacto", "robots", "sitemap", "opengraph", "manifest"],
      forbiddenTopics: [],
      instruction: "La auditoría es de marketing/landing: SEO, conversión, metadata y performance sí son dimensiones relevantes.",
    };
  }

  return {
    target: "flowly_os",
    label: "Flowly OS",
    allowedDimensions: ["architecture", "implementation", "ux", "security", "performance", "integrations", "documentation"],
    blockedDimensions: [],
    relevantPathPatterns: [],
    forbiddenTopics: [],
    instruction: "La auditoría es general de Flowly OS: cubre solo dimensiones respaldadas por evidencia real y evita insertar checklists irrelevantes.",
  };
}

export function isForbiddenAuditTopic(reply: string, scope: FlowlyAuditScope) {
  const text = normalize(reply);
  return scope.forbiddenTopics.find((topic) => text.includes(normalize(topic)));
}

export function filterAuditPathsForScope(paths: string[], scope: FlowlyAuditScope, limit = 24) {
  if (!scope.relevantPathPatterns.length) return unique(paths).slice(0, limit);
  const patterns = scope.relevantPathPatterns.map((item) => normalize(item));
  return unique(paths)
    .filter((path) => {
      const normalizedPath = normalize(path);
      return patterns.some((pattern) => normalizedPath.includes(pattern));
    })
    .slice(0, limit);
}

export function buildAuditScopeInstructions(scope: FlowlyAuditScope) {
  return [
    "AUDIT SCOPE RESOLVER",
    `Target: ${scope.label}.`,
    `Dimensiones permitidas: ${scope.allowedDimensions.join(", ")}.`,
    `Dimensiones bloqueadas: ${scope.blockedDimensions.join(", ") || "ninguna"}.`,
    scope.instruction,
    scope.forbiddenTopics.length
      ? `Temas fuera de alcance en esta auditoría: ${scope.forbiddenTopics.join(", ")}. Si aparecen, la respuesta no certifica.`
      : "No hay temas bloqueados específicos para este target.",
  ].join("\n");
}
