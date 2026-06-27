import { generateStudioArtifacts, slugifyStudio, type FlowlyStudioDefinition } from "@/lib/flowlyStudio";
import { buildSeedModuleSuggestion } from "@/lib/flowlyStudioHeart";

export type FlowlyProjectType = "erp" | "crm" | "rrhh" | "hotel" | "clinica" | "logistica" | "taller" | "vehiculos" | "libre" | "ia_assistant";

export type FlowlyStudioProjectInput = {
  name: string;
  description?: string;
  type: FlowlyProjectType;
  modules: string[];
  prompt?: string;
  createArtifacts?: boolean;
};

export type FlowlyStudioProjectBlueprint = {
  name: string;
  slug: string;
  type: FlowlyProjectType;
  description: string;
  modules: string[];
  businessObjects: string[];
  capabilities: string[];
  workflows: string[];
  policies: string[];
  apps: string[];
  risks: string[];
  nextSteps: string[];
};

type Preset = Omit<FlowlyStudioProjectBlueprint, "name" | "slug" | "description" | "type" | "modules">;

const projectPresets: Record<FlowlyProjectType, Preset> = {
  ia_assistant: {
    businessObjects: ["CompanionProfile", "CompanionAvatar", "CompanionGoal", "CompanionMission", "CompanionReward", "CompanionAchievement", "CompanionLevel", "CompanionExperience", "CompanionMood", "CompanionActivity", "CompanionMemoryLink"],
    capabilities: ["CreateCompanionGoal", "UpdateCompanionGoalProgress", "CompleteCompanionGoal", "GenerateDailyMissions", "GenerateWeeklyMission", "UnlockCompanionReward", "ClaimCompanionReward", "CalculateCompanionExperience", "LevelUpCompanion", "UpdateCompanionMood", "RegisterCompanionActivity", "RenderCompanionSummary"],
    workflows: ["Objetivo completado suma experiencia", "Experiencia suficiente sube nivel", "Misión completada desbloquea recompensa", "Generar misiones diarias", "Generar misión semanal", "Baja actividad sugiere objetivo", "Logro desbloqueado notifica usuario"],
    policies: ["Solo administradores editan recompensas globales", "Solo se reclaman recompensas desbloqueadas", "Misiones completadas no se editan", "Objetivos críticos requieren aprobación humana", "Recompensas no conceden permisos reales automáticamente", "Datos del Companion pertenecen a la organización"],
    apps: ["IA Assistant"],
    risks: ["El Companion no debe ejecutar acciones críticas sin autorización humana.", "Las recompensas deben ser motivacionales y nunca alterar permisos reales.", "La memoria del Companion debe respetar privacidad y organización."],
    nextSteps: ["Revisar el árbol generado", "Exportar ZIP instalable", "Ejecutar migración SQL", "Probar /generated/ia-assistant", "Conectar avatar real y misiones con eventos del sistema"],
  },
  erp: {
    businessObjects: ["Company", "Customer", "Supplier", "Product", "Invoice", "Expense", "Payment", "Employee", "Project", "Task"],
    capabilities: ["CreateCustomer", "CreateInvoice", "RegisterExpense", "CreateProject", "AssignTask", "GenerateReport"],
    workflows: ["Customer Onboarding", "Invoice Approval", "Monthly Closing", "Project Delivery"],
    policies: ["OrganizationIsolation", "HighValueApproval", "FinanceAccess", "HumanApprovalRequired"],
    apps: ["Panel ERP", "Finanzas", "Clientes", "Proyectos"],
    risks: ["Modelo amplio: conviene generar por fases.", "Revisar permisos financieros antes de producción."],
    nextSteps: ["Crear objetos base", "Generar migración Supabase", "Revisar políticas", "Exportar módulo instalable"],
  },
  crm: {
    businessObjects: ["Lead", "Customer", "Contact", "Opportunity", "CommercialActivity", "Proposal", "Campaign"],
    capabilities: ["CreateLead", "QualifyLead", "CreateOpportunity", "GenerateProposal", "ScheduleFollowUp"],
    workflows: ["Lead Qualification", "Opportunity Follow Up", "Proposal Approval"],
    policies: ["SalesAccess", "CustomerPrivacy", "DiscountApprovalRequired"],
    apps: ["CRM Comercial", "Pipeline", "Campañas"],
    risks: ["Evitar duplicar Customer si ya existe.", "Definir reglas de descuentos."],
    nextSteps: ["Conectar Leads con Customer", "Añadir actividades", "Probar pipeline"],
  },
  rrhh: {
    businessObjects: ["Employee", "Contract", "Absence", "Payroll", "Team", "PerformanceReview", "Document"],
    capabilities: ["CreateEmployee", "ApproveAbsence", "GeneratePayroll", "UploadContract", "ScheduleReview"],
    workflows: ["Employee Onboarding", "Absence Approval", "Payroll Closing", "Contract Renewal"],
    policies: ["EmployeeDataPrivacy", "ManagerApprovalRequired", "PayrollRestrictedAccess", "DocumentRetention"],
    apps: ["Recursos Humanos", "Nóminas", "Ausencias"],
    risks: ["Datos personales sensibles.", "Requiere políticas de retención y acceso estrictas."],
    nextSteps: ["Ejecutar SQL", "Revisar RLS", "Probar alta de empleado", "Validar privacidad"],
  },
  hotel: {
    businessObjects: ["Guest", "Room", "Reservation", "Stay", "Invoice", "HousekeepingTask", "RatePlan"],
    capabilities: ["CreateReservation", "CheckInGuest", "CheckOutGuest", "AssignRoom", "GenerateStayInvoice"],
    workflows: ["Guest Check In", "Room Cleaning", "Check Out", "Reservation Cancellation"],
    policies: ["GuestPrivacy", "PaymentRequired", "RoomAvailability"],
    apps: ["Recepción", "Reservas", "Habitaciones"],
    risks: ["Sincronización con disponibilidad.", "Pagos y cancelaciones requieren revisión."],
    nextSteps: ["Definir habitaciones", "Generar reservas", "Probar check-in"],
  },
  clinica: {
    businessObjects: ["Patient", "Doctor", "Appointment", "Treatment", "MedicalRecord", "Consent", "Invoice"],
    capabilities: ["CreatePatient", "ScheduleAppointment", "RegisterTreatment", "UploadConsent", "GenerateMedicalInvoice"],
    workflows: ["Patient Intake", "Appointment Reminder", "Consent Approval", "Treatment Follow Up"],
    policies: ["MedicalDataPrivacy", "DoctorOnlyAccess", "ConsentRequired", "DataRetention"],
    apps: ["Clínica", "Agenda médica", "Pacientes"],
    risks: ["Información médica sensible.", "Necesita políticas estrictas antes de producción."],
    nextSteps: ["Configurar políticas", "Crear pacientes de prueba", "Validar consentimiento"],
  },
  logistica: {
    businessObjects: ["Shipment", "Warehouse", "Carrier", "Route", "Package", "Delivery", "Vehicle"],
    capabilities: ["CreateShipment", "AssignCarrier", "TrackPackage", "ScheduleDelivery", "OptimizeRoute"],
    workflows: ["Shipment Dispatch", "Delivery Tracking", "Incident Resolution"],
    policies: ["WarehouseAccess", "CarrierValidation", "DeliveryProofRequired"],
    apps: ["Logística", "Almacén", "Rutas"],
    risks: ["Integración futura con mapas o GPS.", "Trazabilidad obligatoria."],
    nextSteps: ["Definir almacenes", "Crear envíos", "Probar tracking"],
  },
  taller: {
    businessObjects: ["Vehicle", "Customer", "WorkOrder", "Mechanic", "SparePart", "Inspection", "Invoice"],
    capabilities: ["CreateWorkOrder", "AssignMechanic", "RegisterInspection", "AddSparePart", "GenerateRepairInvoice"],
    workflows: ["Vehicle Reception", "Repair Approval", "Work Order Closing"],
    policies: ["RepairApprovalRequired", "CustomerAuthorization", "SparePartStockControl"],
    apps: ["Taller", "Órdenes de trabajo", "Recambios"],
    risks: ["Control de inventario de piezas.", "Aprobaciones del cliente."],
    nextSteps: ["Crear órdenes", "Asignar mecánicos", "Cerrar reparación"],
  },
  vehiculos: {
    businessObjects: ["Vehicle", "Driver", "Rental", "Insurance", "Maintenance", "Fine", "Invoice"],
    capabilities: ["CreateVehicle", "AssignDriver", "CreateRental", "ScheduleMaintenance", "GenerateRentalInvoice"],
    workflows: ["Rental Opening", "Vehicle Maintenance", "Rental Closing", "Insurance Renewal"],
    policies: ["DriverLicenseRequired", "DepositRequired", "MaintenanceBeforeRental", "HighValueRentalApproval"],
    apps: ["Flota", "Alquileres", "Mantenimiento"],
    risks: ["No duplicar Invoice si Finance ya existe.", "Revisar permisos de conductores."],
    nextSteps: ["Crear flota", "Registrar conductores", "Probar alquiler"],
  },
  libre: {
    businessObjects: ["BusinessEntity", "Activity", "Document", "Approval", "Invoice"],
    capabilities: ["CreateBusinessEntity", "UpdateBusinessEntity", "GenerateDocument", "RequestApproval", "RunWorkflow"],
    workflows: ["Default Onboarding", "Document Approval", "Operational Review"],
    policies: ["OrganizationIsolation", "HumanApprovalRequired", "DocumentRetention"],
    apps: ["Workspace personalizado"],
    risks: ["Blueprint genérico: revisar dominio antes de producción."],
    nextSteps: ["Ajustar objetos", "Definir campos reales", "Generar módulo"],
  },
};

function cleanName(name: string) {
  return name.replace(/[^a-zA-Z0-9]/g, "");
}

function domainForProject(type: FlowlyProjectType) {
  if (type === "ia_assistant") return "companion";
  if (type === "rrhh") return "people";
  if (["vehiculos", "logistica", "taller", "hotel"].includes(type)) return "operations";
  if (type === "clinica") return "support";
  if (type === "crm") return "sales";
  if (type === "erp") return "organization";
  return "custom";
}

function companionFields(name: string, slug: string) {
  const common = [
    { id: `field_${slug}_name`, name: "name", label: "Nombre", type: "text", required: true },
    { id: `field_${slug}_description`, name: "description", label: "Descripción", type: "long_text", required: false },
  ];
  if (name.includes("Goal")) return [...common, { id: `field_${slug}_progress`, name: "progress", label: "Progreso", type: "number", required: true }, { id: `field_${slug}_target`, name: "target_value", label: "Meta", type: "number", required: false }, { id: `field_${slug}_deadline`, name: "deadline", label: "Fecha límite", type: "date", required: false }];
  if (name.includes("Mission")) return [...common, { id: `field_${slug}_frequency`, name: "frequency", label: "Frecuencia", type: "text", required: true }, { id: `field_${slug}_reward`, name: "reward_points", label: "Puntos", type: "number", required: true }];
  if (name.includes("Reward")) return [...common, { id: `field_${slug}_cost`, name: "cost_points", label: "Coste en puntos", type: "number", required: true }, { id: `field_${slug}_reward_type`, name: "reward_type", label: "Tipo de recompensa", type: "text", required: true }];
  if (name.includes("Level")) return [...common, { id: `field_${slug}_level`, name: "level_number", label: "Nivel", type: "number", required: true }, { id: `field_${slug}_threshold`, name: "xp_required", label: "XP requerida", type: "number", required: true }];
  if (name.includes("Experience")) return [...common, { id: `field_${slug}_points`, name: "points", label: "Puntos de experiencia", type: "number", required: true }, { id: `field_${slug}_source`, name: "source", label: "Origen", type: "text", required: true }];
  if (name.includes("Mood")) return [...common, { id: `field_${slug}_mood`, name: "mood", label: "Estado", type: "text", required: true }, { id: `field_${slug}_energy`, name: "energy", label: "Energía", type: "number", required: true }];
  if (name.includes("Avatar")) return [...common, { id: `field_${slug}_model`, name: "model_url", label: "Modelo 3D", type: "file", required: false }, { id: `field_${slug}_style`, name: "style", label: "Estilo", type: "text", required: false }];
  if (name.includes("Activity")) return [...common, { id: `field_${slug}_activity_type`, name: "activity_type", label: "Tipo", type: "text", required: true }, { id: `field_${slug}_points`, name: "points_delta", label: "Puntos", type: "number", required: false }];
  return [...common, { id: `field_${slug}_metadata`, name: "extra_data", label: "Datos adicionales", type: "json", required: false }];
}

function companionStates(name: string, slug: string) {
  if (name.includes("Goal")) return [
    { id: `state_${slug}_draft`, name: "draft", label: "Borrador", isInitial: true },
    { id: `state_${slug}_active`, name: "active", label: "Activo" },
    { id: `state_${slug}_completed`, name: "completed", label: "Completado" },
    { id: `state_${slug}_failed`, name: "failed", label: "Fallido" },
    { id: `state_${slug}_archived`, name: "archived", label: "Archivado" },
  ];
  if (name.includes("Mission")) return [
    { id: `state_${slug}_pending`, name: "pending", label: "Pendiente", isInitial: true },
    { id: `state_${slug}_in_progress`, name: "in_progress", label: "En progreso" },
    { id: `state_${slug}_completed`, name: "completed", label: "Completada" },
    { id: `state_${slug}_claimed`, name: "claimed", label: "Reclamada" },
    { id: `state_${slug}_archived`, name: "archived", label: "Archivada" },
  ];
  if (name.includes("Reward")) return [
    { id: `state_${slug}_locked`, name: "locked", label: "Bloqueada", isInitial: true },
    { id: `state_${slug}_available`, name: "available", label: "Disponible" },
    { id: `state_${slug}_claimed`, name: "claimed", label: "Reclamada" },
    { id: `state_${slug}_expired`, name: "expired", label: "Caducada" },
  ];
  return [
    { id: `state_${slug}_draft`, name: "draft", label: "Borrador", isInitial: true },
    { id: `state_${slug}_active`, name: "active", label: "Activo" },
    { id: `state_${slug}_archived`, name: "archived", label: "Archivado" },
  ];
}

function companionRelationships(name: string) {
  if (name === "CompanionProfile") return [
    { target: "CompanionAvatar", type: "ownership" },
    { target: "CompanionGoal", type: "association" },
    { target: "CompanionMission", type: "association" },
    { target: "CompanionReward", type: "dependency" },
    { target: "CompanionLevel", type: "dependency" },
  ];
  if (name === "CompanionGoal") return [{ target: "CompanionMission", type: "dependency" }, { target: "CompanionReward", type: "dependency" }];
  if (name === "CompanionMission") return [{ target: "CompanionExperience", type: "dependency" }, { target: "CompanionReward", type: "dependency" }];
  if (name === "CompanionActivity") return [{ target: "CompanionExperience", type: "dependency" }, { target: "CompanionMood", type: "association" }];
  return [];
}

function businessObjectDefinition(name: string, domain: string, projectType?: FlowlyProjectType): FlowlyStudioDefinition {
  const slug = slugifyStudio(name);
  const pascal = cleanName(name);
  const isCompanion = projectType === "ia_assistant" || name.startsWith("Companion");
  return {
    kind: "business_object",
    name,
    slug,
    domain,
    description: isCompanion ? `Entidad del módulo IA Assistant para gestionar ${name.replace("Companion", "").toLowerCase()} del Companion.` : `Representa ${name} dentro del proyecto generado desde Flowly Studio.`,
    status: "draft",
    fields: isCompanion ? companionFields(name, slug) : [
      { id: `field_${slug}_name`, name: "name", label: "Nombre", type: "text", required: true },
      { id: `field_${slug}_description`, name: "description", label: "Descripción", type: "long_text", required: false },
      { id: `field_${slug}_metadata`, name: "extra_data", label: "Datos adicionales", type: "json", required: false },
    ],
    states: isCompanion ? companionStates(name, slug) : [
      { id: `state_${slug}_draft`, name: "draft", label: "Borrador", isInitial: true },
      { id: `state_${slug}_active`, name: "active", label: "Activo" },
      { id: `state_${slug}_archived`, name: "archived", label: "Archivado" },
    ],
    commands: [
      { id: `cmd_create_${slug}`, name: `Create${pascal}`, description: `Crea ${name}.` },
      { id: `cmd_update_${slug}`, name: `Update${pascal}`, description: `Actualiza ${name}.` },
      { id: `cmd_archive_${slug}`, name: `Archive${pascal}`, description: `Archiva ${name}.` },
    ],
    queries: [
      { id: `qry_get_${slug}`, name: `Get${pascal}` },
      { id: `qry_search_${slug}`, name: `Search${pascal}s` },
    ],
    events: [
      { id: `evt_created_${slug}`, name: `${pascal}Created` },
      { id: `evt_updated_${slug}`, name: `${pascal}Updated` },
      ...(isCompanion ? [{ id: `evt_progress_${slug}`, name: `${pascal}ProgressChanged` }] : []),
    ],
    policies: [{ id: `pol_org_${slug}`, name: "OrganizationIsolation", description: "Aislamiento por organización." }],
    capabilities: [{ id: `cap_create_${slug}`, name: `Create${pascal}` }],
    relationships: isCompanion ? companionRelationships(name) : [],
  } as FlowlyStudioDefinition;
}

function capabilityDefinition(name: string, domain: string, firstBusinessObject: string): FlowlyStudioDefinition {
  const slug = slugifyStudio(name);
  const usesAI = /generate|calculate|render|suggest|mood|mission/i.test(name);
  return {
    kind: "capability",
    name,
    slug,
    domain,
    description: `Capacidad reutilizable ${name} generada por el modo Proyecto.`,
    status: "draft",
    businessObjects: firstBusinessObject ? [firstBusinessObject] : [],
    inputs: [{ id: `input_${slug}`, name: "payload", type: "json", required: true, description: "Datos de entrada." }],
    outputs: [{ id: `output_${slug}`, name: "result", type: "json", required: true, description: "Resultado estructurado." }],
    commands: [{ id: `cmd_${slug}`, name: cleanName(name) }],
    queries: [],
    policies: [{ id: `pol_${slug}`, name: "RequiresAuthorization" }],
    events: [{ id: `evt_${slug}`, name: `${cleanName(name)}Executed` }],
    usesAI,
    observability: ["trace", "duration", "success", "events"],
  } as FlowlyStudioDefinition;
}

function workflowDefinition(name: string, domain: string): FlowlyStudioDefinition {
  const slug = slugifyStudio(name);
  return {
    kind: "workflow",
    name,
    slug,
    domain,
    description: `Workflow ${name} generado por el modo Proyecto.`,
    status: "draft",
    trigger: name.toLowerCase().includes("diaria") ? "DailySchedule" : name.toLowerCase().includes("semanal") ? "WeeklySchedule" : "DomainEvent",
    steps: [
      { id: `step_${slug}_start`, name: "Inicio", type: "trigger", description: "Inicio del proceso." },
      { id: `step_${slug}_evaluate`, name: "Evaluar condiciones", type: "condition", description: "Comprueba estado, permisos y contexto." },
      { id: `step_${slug}_execute`, name: "Ejecutar capacidad", type: "capability", description: "Ejecuta la capacidad asociada." },
      { id: `step_${slug}_event`, name: "Evento final", type: "event", description: "Publica evento del proceso." },
    ],
    events: [{ id: `evt_${slug}`, name: `${cleanName(name)}Started` }],
    policies: [{ id: `pol_${slug}`, name: "HumanApprovalRequired" }],
  } as FlowlyStudioDefinition;
}

function policyDefinition(name: string, domain: string): FlowlyStudioDefinition {
  const slug = slugifyStudio(name);
  return {
    kind: "policy",
    name,
    slug,
    domain,
    description: `Política ${name} generada por el modo Proyecto.`,
    status: "draft",
    scope: "organization",
    rules: [{ id: `rule_${slug}`, subject: "Organization", condition: "always", effect: "require_approval", description: name }],
  } as FlowlyStudioDefinition;
}

function appDefinition(name: string, domain: string, businessObjects: string[], capabilities: string[], projectType?: FlowlyProjectType): FlowlyStudioDefinition {
  const slug = slugifyStudio(name);
  const isCompanion = projectType === "ia_assistant" || slug === "ia-assistant";
  return {
    kind: "app",
    name,
    slug,
    domain,
    description: isCompanion ? "Aplicación visual del Companion con panel, objetivos, misiones, recompensas, logros, avatar, actividad y configuración." : `Aplicación ${name} generada por el modo Proyecto.`,
    status: "draft",
    route: isCompanion ? "/ia-assistant" : `/generated/${slug}`,
    menuLabel: name,
    businessObjects,
    capabilities,
    navigation: isCompanion
      ? ["Panel", "Objetivos", "Misiones", "Recompensas", "Logros", "Avatar", "Actividad", "Configuración"].map((item) => ({ id: `nav_${slugifyStudio(item)}`, name: item, description: `Vista ${item} del IA Assistant.` }))
      : businessObjects.slice(0, 6).map((item) => ({ id: `nav_${slugifyStudio(item)}`, name: item, description: `Vista de ${item}.` })),
    widgets: isCompanion
      ? [
          { id: `widget_${slug}_level`, name: "Nivel y experiencia", description: "Muestra progreso, nivel actual y energía del Companion." },
          { id: `widget_${slug}_missions`, name: "Misiones activas", description: "Misiones diarias y semanales." },
          { id: `widget_${slug}_rewards`, name: "Recompensas", description: "Recompensas desbloqueadas y pendientes." },
          { id: `widget_${slug}_mood`, name: "Estado del Companion", description: "Ánimo, actividad y recomendaciones." },
        ]
      : [
          { id: `widget_${slug}_overview`, name: "Resumen", description: "Métricas principales del módulo." },
          { id: `widget_${slug}_activity`, name: "Actividad reciente", description: "Últimos eventos del módulo." },
        ],
  } as FlowlyStudioDefinition;
}

function inferProjectType(input: FlowlyStudioProjectInput): FlowlyProjectType {
  const text = `${input.type || ""} ${input.name || ""} ${input.description || ""} ${input.prompt || ""}`.toLowerCase();
  if (text.includes("assistant") || text.includes("companion") || text.includes("mascota") || text.includes("recompensa") || text.includes("misiones")) return "ia_assistant";
  return input.type || "libre";
}

export function buildProjectBlueprint(input: FlowlyStudioProjectInput): FlowlyStudioProjectBlueprint {
  const type = inferProjectType(input);
  const preset = projectPresets[type] || projectPresets.libre;
  const suggestion = input.prompt ? buildSeedModuleSuggestion(input.prompt) : null;
  const name = input.name?.trim() || suggestion?.moduleName || (type === "ia_assistant" ? "IA Assistant" : "Nuevo proyecto Flowly");
  const slug = slugifyStudio(name);
  const selectedModules = input.modules?.length ? input.modules : type === "ia_assistant" ? ["Companion", "Objetivos", "Misiones", "Recompensas", "Gamificación", "Avatar"] : [type];
  const useSuggestion = Boolean(suggestion && type !== "ia_assistant" && suggestion.moduleName !== "Custom Business Module");
  return {
    name,
    slug,
    type,
    description: input.description?.trim() || (type === "ia_assistant" ? "Módulo del Companion con objetivos, misiones, recompensas, niveles, experiencia, avatar y gamificación." : `Proyecto ${name} diseñado desde Flowly Studio.`),
    modules: selectedModules,
    businessObjects: Array.from(new Set([...(useSuggestion ? suggestion?.businessObjects || [] : []), ...preset.businessObjects])),
    capabilities: Array.from(new Set([...(useSuggestion ? suggestion?.capabilities || [] : []), ...preset.capabilities])),
    workflows: Array.from(new Set([...(useSuggestion ? suggestion?.workflows || [] : []), ...preset.workflows])),
    policies: Array.from(new Set([...(useSuggestion ? suggestion?.policies || [] : []), ...preset.policies])),
    apps: preset.apps,
    risks: preset.risks,
    nextSteps: preset.nextSteps,
  };
}

export function buildProjectDefinitions(blueprint: FlowlyStudioProjectBlueprint): FlowlyStudioDefinition[] {
  const domain = domainForProject(blueprint.type);
  const firstObject = blueprint.businessObjects[0] || "BusinessEntity";
  return [
    ...blueprint.businessObjects.map((name) => businessObjectDefinition(name, domain, blueprint.type)),
    ...blueprint.capabilities.map((name) => capabilityDefinition(name, domain, firstObject)),
    ...blueprint.workflows.map((name) => workflowDefinition(name, domain)),
    ...blueprint.policies.map((name) => policyDefinition(name, domain)),
    ...blueprint.apps.map((name) => appDefinition(name, domain, blueprint.businessObjects, blueprint.capabilities, blueprint.type)),
  ];
}

export function buildProjectRows(input: FlowlyStudioProjectInput) {
  const blueprint = buildProjectBlueprint(input);
  const definitions = buildProjectDefinitions(blueprint);
  const rows = definitions.map((definition) => {
    const artifacts = generateStudioArtifacts(definition);
    return {
      kind: definition.kind || "business_object",
      name: definition.name,
      slug: definition.slug,
      domain: definition.domain,
      description: definition.description,
      status: definition.status,
      definition,
      generated_sql: artifacts.sql,
      generated_typescript: artifacts.typescript,
      generated_api: artifacts.apiRoute,
      generated_markdown: artifacts.markdown,
      generated_tests: artifacts.testPlan,
      generated_sdk: artifacts.sdk,
      updated_at: new Date().toISOString(),
    };
  });
  return { blueprint, definitions, rows };
}

export function getIaAssistantProjectInput(): FlowlyStudioProjectInput {
  return {
    name: "IA Assistant",
    type: "ia_assistant",
    description: "Módulo del Companion de Flowly con mascota, objetivos, misiones, recompensas, niveles, experiencia, estado de ánimo y avatar.",
    prompt: "Crear IA Assistant Companion con mascota, objetivos, misiones diarias, recompensas, logros, experiencia, niveles, avatar y estado de ánimo.",
    modules: ["Companion", "Objetivos", "Misiones", "Recompensas", "Gamificación", "Avatar"],
    createArtifacts: true,
  };
}
