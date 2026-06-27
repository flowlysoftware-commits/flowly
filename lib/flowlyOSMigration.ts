export type FlowlyOsLayer = "os" | "business" | "shared";
export type FlowlyModuleStatus = "legacy" | "registered" | "migrating" | "flowly_os_ready";

export type FlowlyExistingModule = {
  id: string;
  name: string;
  description: string;
  layer: FlowlyOsLayer;
  currentRoutes: string[];
  targetRoute: string;
  targetDomain: string;
  owner: "cliente" | "arquitecto" | "interno";
  status: FlowlyModuleStatus;
  kernelKind: "module" | "tool" | "runtime" | "app";
  capabilities: string[];
  businessObjects: string[];
  suggestedActions: string[];
  risk: "bajo" | "medio" | "alto";
};

export const flowlyMigrationModules: FlowlyExistingModule[] = [
  {
    id: "crm",
    name: "CRM",
    description: "Gestión comercial, contactos, oportunidades y seguimiento de clientes.",
    layer: "business",
    currentRoutes: ["/dashboard", "/admin/clientes"],
    targetRoute: "/dashboard/crm",
    targetDomain: "sales",
    owner: "cliente",
    status: "migrating",
    kernelKind: "module",
    businessObjects: ["Customer", "Contact", "Lead", "Opportunity", "CommercialActivity"],
    capabilities: ["CreateCustomer", "UpdateCustomer", "SearchCustomers", "CreateOpportunity", "RegisterCommercialActivity"],
    suggestedActions: ["Registrar CRM en Kernel", "Extraer componentes de cliente", "Conectar Companion cliente con contexto CRM", "Preparar Analyzer para mejoras visuales"],
    risk: "medio",
  },
  {
    id: "finance",
    name: "Facturación",
    description: "Ingresos, gastos, presupuestos, facturas y configuración fiscal.",
    layer: "business",
    currentRoutes: ["/dashboard", "/admin/presupuestos"],
    targetRoute: "/dashboard/facturacion",
    targetDomain: "finance",
    owner: "cliente",
    status: "migrating",
    kernelKind: "module",
    businessObjects: ["Invoice", "Quote", "Expense", "Income", "FiscalProfile"],
    capabilities: ["CreateInvoice", "GenerateQuotePdf", "RegisterExpense", "RegisterIncome", "ConfigureFiscalProfile"],
    suggestedActions: ["Registrar dominio Finance", "Normalizar PDFs", "Separar configuración fiscal", "Conectar con Companion cliente"],
    risk: "medio",
  },
  {
    id: "commercial-panel",
    name: "Panel comercial",
    description: "Zona para comerciales, embajadores, comisiones, fichajes y seguimiento.",
    layer: "business",
    currentRoutes: ["/comercial", "/comercial/equipo"],
    targetRoute: "/dashboard/comercial",
    targetDomain: "sales-partners",
    owner: "cliente",
    status: "migrating",
    kernelKind: "module",
    businessObjects: ["SalesPartner", "Commission", "Shift", "LeadAssignment"],
    capabilities: ["RegisterShift", "CalculateCommission", "AssignLead", "TrackPartnerPerformance"],
    suggestedActions: ["Registrar como módulo Sales Partners", "Conectar con objetivos y recompensas", "Separar administración interna de vista comercial"],
    risk: "medio",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Integración y herramientas de comunicación por WhatsApp.",
    layer: "shared",
    currentRoutes: ["/dashboard"],
    targetRoute: "/dashboard/whatsapp",
    targetDomain: "communication",
    owner: "cliente",
    status: "legacy",
    kernelKind: "tool",
    businessObjects: ["Conversation", "MessageTemplate", "ContactChannel"],
    capabilities: ["SendWhatsApp", "CreateMessageTemplate", "SyncConversation", "ScheduleFollowUp"],
    suggestedActions: ["Convertir en Tool oficial", "Añadir permisos por organización", "Conectar con CRM y Companion"],
    risk: "alto",
  },
  {
    id: "flowly-docs",
    name: "Flowly Docs",
    description: "Documentación viva, libros, arquitectura, catálogos y base de conocimiento.",
    layer: "os",
    currentRoutes: ["/docs", "/docs/studio"],
    targetRoute: "/os/docs",
    targetDomain: "knowledge",
    owner: "arquitecto",
    status: "registered",
    kernelKind: "module",
    businessObjects: ["Book", "Chapter", "Document", "ArchitectureDecision"],
    capabilities: ["SearchDocs", "ImportMarkdown", "ExportDocs", "AskDocs"],
    suggestedActions: ["Mover acceso principal a /os", "Mantener versión pública solo si se habilita", "Conectar con Architect Companion"],
    risk: "bajo",
  },
  {
    id: "studio",
    name: "Flowly Studio",
    description: "Entorno arquitecto para blueprints, generator, analyzer y creación de módulos.",
    layer: "os",
    currentRoutes: ["/studio", "/studio/v2", "/studio/generator", "/studio/projects", "/studio/core"],
    targetRoute: "/os/studio",
    targetDomain: "platform-engineering",
    owner: "arquitecto",
    status: "registered",
    kernelKind: "runtime",
    businessObjects: ["Blueprint", "Artifact", "GeneratedModule", "StudioProject"],
    capabilities: ["DesignBlueprint", "GenerateModule", "ReviewImpact", "ExportModule"],
    suggestedActions: ["Ocultar completamente al cliente", "Conectar Analyzer", "Usarlo solo por Architect Companion"],
    risk: "bajo",
  },
  {
    id: "kernel",
    name: "Kernel",
    description: "Runtime central, registro, eventos, business objects, capabilities, workflows y plugins.",
    layer: "os",
    currentRoutes: ["/kernel"],
    targetRoute: "/os/kernel",
    targetDomain: "kernel",
    owner: "interno",
    status: "registered",
    kernelKind: "runtime",
    businessObjects: ["KernelRegistryItem", "KernelEvent", "RuntimeExecution"],
    capabilities: ["RegisterModule", "PublishEvent", "ExecuteCapability", "RunWorkflow"],
    suggestedActions: ["Usarlo como fuente oficial de registro", "Registrar módulos heredados", "Añadir auditoría"],
    risk: "bajo",
  },
  {
    id: "companion-runtime",
    name: "Companion Runtime",
    description: "Avatar global, conversación, contexto, memoria, misiones y recomendaciones.",
    layer: "shared",
    currentRoutes: ["/companion"],
    targetRoute: "/companion",
    targetDomain: "ai-companion",
    owner: "cliente",
    status: "migrating",
    kernelKind: "runtime",
    businessObjects: ["CompanionProfile", "CompanionMemory", "CompanionGoal", "CompanionMission", "CompanionReward"],
    capabilities: ["AnswerWithContext", "CreateGoal", "RecommendAction", "RememberPreference", "NotifyUser"],
    suggestedActions: ["Separar Companion cliente y arquitecto", "Conectar AI Engine", "Evitar acceso cliente a Studio"],
    risk: "alto",
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Landing, campañas, onboarding, formularios y captación.",
    layer: "business",
    currentRoutes: ["/marketing", "/marketing/onboarding"],
    targetRoute: "/dashboard/marketing",
    targetDomain: "marketing",
    owner: "cliente",
    status: "legacy",
    kernelKind: "module",
    businessObjects: ["Campaign", "LandingPage", "Audience", "LeadSource", "Content"],
    capabilities: ["CreateCampaign", "PublishLanding", "CaptureLead", "AnalyzeCampaign"],
    suggestedActions: ["Registrar módulo Marketing", "Conectar formularios con CRM", "Añadir recomendaciones del Companion"],
    risk: "medio",
  },
];

export const flowlyMigrationSprints = [
  {
    id: "sprint-1-architecture",
    title: "Sprint 1 · Separación Flowly OS / Panel cliente",
    status: "preparado",
    goal: "Separar herramientas internas de desarrollo de módulos visibles para clientes.",
    deliverables: ["Zona /os", "Módulos cliente catalogados", "Reglas de permisos del Companion", "Menú cliente limpio"],
  },
  {
    id: "sprint-2-analyzer",
    title: "Sprint 2 · Analyzer",
    status: "preparado",
    goal: "Entender el proyecto actual y convertir módulos heredados en blueprints.",
    deliverables: ["Catálogo de rutas", "Inventario de módulos", "Blueprints sugeridos", "Impacto por módulo"],
  },
  {
    id: "sprint-3-builder",
    title: "Sprint 3 · Builder",
    status: "preparado",
    goal: "Preparar fabricación y modificación real de módulos desde blueprints.",
    deliverables: ["Plan de archivos", "Migraciones por módulo", "Registro Kernel", "Builder API"],
  },
  {
    id: "sprint-4-companion-runtime",
    title: "Sprint 4 · Companion Runtime",
    status: "en marcha",
    goal: "Separar Companion cliente y arquitecto usando cerebro compartido y permisos distintos.",
    deliverables: ["Context Engine", "AI Engine", "Companion cliente", "Companion arquitecto", "Bloqueos de seguridad"],
  },
  {
    id: "sprint-5-ai-engine",
    title: "Sprint 5 · AI Engine",
    status: "en marcha",
    goal: "Hacer que el Companion razone con contexto real y pueda planificar acciones.",
    deliverables: ["Prompt Builder", "Action Planner", "Action Executor", "Tools internas", "Fallback inteligente"],
  },
  {
    id: "sprint-6-refactor-final",
    title: "Sprint 6 · Refactor final dirigido por IA",
    status: "pendiente",
    goal: "Usar el Architect Companion para proponer y aplicar mejoras sobre módulos existentes.",
    deliverables: ["Diffs", "Revisión IA", "Aplicación bajo aprobación", "Registro Docs", "Auditoría"],
  },
];

export function getMigrationSummary() {
  const byLayer = flowlyMigrationModules.reduce<Record<FlowlyOsLayer, number>>((acc, item) => {
    acc[item.layer] = (acc[item.layer] || 0) + 1;
    return acc;
  }, { os: 0, business: 0, shared: 0 });

  const highRisk = flowlyMigrationModules.filter((item) => item.risk === "alto");
  const ready = flowlyMigrationModules.filter((item) => item.status === "registered" || item.status === "flowly_os_ready");

  return {
    totalModules: flowlyMigrationModules.length,
    byLayer,
    highRisk: highRisk.length,
    registered: ready.length,
    progress: Math.round((ready.length / flowlyMigrationModules.length) * 100),
  };
}

export function buildKernelSeedFromMigration() {
  return flowlyMigrationModules.map((module) => ({
    id: `module:${module.id}`,
    kind: module.kernelKind,
    name: module.name,
    slug: module.id,
    domain: module.targetDomain,
    description: module.description,
    status: module.status === "legacy" ? "draft" : "active",
    version: "1.0.0",
    definition: {
      layer: module.layer,
      owner: module.owner,
      currentRoutes: module.currentRoutes,
      targetRoute: module.targetRoute,
      businessObjects: module.businessObjects,
      capabilities: module.capabilities,
      suggestedActions: module.suggestedActions,
      migrationStatus: module.status,
      risk: module.risk,
    },
    dependencies: module.currentRoutes,
    capabilities: module.capabilities,
    events: [`${module.id}.registered`, `${module.id}.migrated`],
    policies: module.owner === "cliente" ? ["customer-visible", "no-studio-access"] : ["architect-only"],
  }));
}

export function buildModuleBlueprint(moduleId: string) {
  const module = flowlyMigrationModules.find((item) => item.id === moduleId);
  if (!module) return null;
  return {
    id: module.id,
    name: module.name,
    type: module.kernelKind,
    layer: module.layer,
    domain: module.targetDomain,
    description: module.description,
    routes: {
      current: module.currentRoutes,
      target: module.targetRoute,
    },
    businessObjects: module.businessObjects.map((name) => ({ name, description: `${name} dentro del dominio ${module.targetDomain}.`, states: ["draft", "active", "archived"] })),
    capabilities: module.capabilities.map((name) => ({ name, description: `Capacidad ${name} del módulo ${module.name}.` })),
    policies: module.owner === "cliente" ? ["Cliente no accede a Studio", "Acciones críticas requieren confirmación"] : ["Solo administradores internos"],
    suggestedActions: module.suggestedActions,
    risk: module.risk,
    generatedAt: new Date().toISOString(),
  };
}
