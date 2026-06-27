import { generateStudioArtifacts, slugifyStudio, type FlowlyStudioDefinition } from "@/lib/flowlyStudio";
import { buildSeedModuleSuggestion } from "@/lib/flowlyStudioHeart";

export type FlowlyProjectType = "erp" | "crm" | "rrhh" | "hotel" | "clinica" | "logistica" | "taller" | "vehiculos" | "libre";

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

const projectPresets: Record<FlowlyProjectType, Omit<FlowlyStudioProjectBlueprint, "name" | "slug" | "description" | "type" | "modules">> = {
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
  if (type === "rrhh") return "people";
  if (["vehiculos", "logistica", "taller", "hotel"].includes(type)) return "operations";
  if (type === "clinica") return "support";
  if (type === "crm") return "sales";
  if (type === "erp") return "organization";
  return "custom";
}

function businessObjectDefinition(name: string, domain: string): FlowlyStudioDefinition {
  const slug = slugifyStudio(name);
  const pascal = cleanName(name);
  return {
    kind: "business_object",
    name,
    slug,
    domain,
    description: `Representa ${name} dentro del proyecto generado desde Flowly Studio.`,
    status: "draft",
    fields: [
      { id: `field_${slug}_name`, name: "name", label: "Nombre", type: "text", required: true },
      { id: `field_${slug}_description`, name: "description", label: "Descripción", type: "long_text", required: false },
      { id: `field_${slug}_metadata`, name: "extra_data", label: "Datos adicionales", type: "json", required: false },
    ],
    states: [
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
    ],
    policies: [{ id: `pol_org_${slug}`, name: "OrganizationIsolation", description: "Aislamiento por organización." }],
    capabilities: [{ id: `cap_create_${slug}`, name: `Create${pascal}` }],
    relationships: [],
  } as FlowlyStudioDefinition;
}

function capabilityDefinition(name: string, domain: string, businessObject: string): FlowlyStudioDefinition {
  const slug = slugifyStudio(name);
  return {
    kind: "capability",
    name,
    slug,
    domain,
    description: `Capacidad ${name} generada dentro de un proyecto de Flowly Studio.`,
    status: "draft",
    businessObjects: businessObject ? [businessObject] : [],
    inputs: [{ id: `input_${slug}`, name: "payload", type: "json", required: true, description: "Datos de entrada." }],
    outputs: [{ id: `output_${slug}`, name: "result", type: "json", required: true, description: "Resultado estructurado." }],
    commands: [{ id: `cmd_${slug}`, name: cleanName(name) }],
    queries: [],
    policies: [{ id: `pol_${slug}`, name: "RequiresAuthorization" }],
    events: [{ id: `evt_${slug}`, name: `${cleanName(name)}Executed` }],
    usesAI: false,
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
    trigger: "ManualStart",
    steps: [
      { id: `step_${slug}_start`, name: "Inicio", type: "trigger", description: "Inicio del proceso." },
      { id: `step_${slug}_review`, name: "Revisión", type: "approval", description: "Revisión antes de ejecutar." },
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
    rules: [{ id: `rule_${slug}`, subject: "Organization", condition: "always", effect: "require_approval", description: "Requiere revisión hasta definir reglas finales." }],
  } as FlowlyStudioDefinition;
}

function appDefinition(name: string, domain: string, businessObjects: string[], capabilities: string[]): FlowlyStudioDefinition {
  const slug = slugifyStudio(name);
  return {
    kind: "app",
    name,
    slug,
    domain,
    description: `Aplicación ${name} generada por el modo Proyecto.`,
    status: "draft",
    businessObjects,
    capabilities,
    navigation: businessObjects.slice(0, 6).map((item) => ({ id: `nav_${slugifyStudio(item)}`, name: item, description: `Vista de ${item}.` })),
    widgets: [
      { id: `widget_${slug}_overview`, name: "Resumen", description: "Métricas principales del módulo." },
      { id: `widget_${slug}_activity`, name: "Actividad reciente", description: "Últimos eventos del módulo." },
    ],
  } as FlowlyStudioDefinition;
}

export function buildProjectBlueprint(input: FlowlyStudioProjectInput): FlowlyStudioProjectBlueprint {
  const type = input.type || "libre";
  const preset = projectPresets[type] || projectPresets.libre;
  const suggestion = input.prompt ? buildSeedModuleSuggestion(input.prompt) : null;
  const name = input.name?.trim() || suggestion?.moduleName || "Nuevo proyecto Flowly";
  const slug = slugifyStudio(name);
  const selectedModules = input.modules?.length ? input.modules : [type];
  return {
    name,
    slug,
    type,
    description: input.description?.trim() || `Proyecto ${name} diseñado desde Flowly Studio.`,
    modules: selectedModules,
    businessObjects: Array.from(new Set([...(suggestion?.businessObjects || []), ...preset.businessObjects])),
    capabilities: Array.from(new Set([...(suggestion?.capabilities || []), ...preset.capabilities])),
    workflows: Array.from(new Set([...(suggestion?.workflows || []), ...preset.workflows])),
    policies: Array.from(new Set([...(suggestion?.policies || []), ...preset.policies])),
    apps: preset.apps,
    risks: preset.risks,
    nextSteps: preset.nextSteps,
  };
}

export function buildProjectDefinitions(blueprint: FlowlyStudioProjectBlueprint): FlowlyStudioDefinition[] {
  const domain = domainForProject(blueprint.type);
  const firstObject = blueprint.businessObjects[0] || "BusinessEntity";
  return [
    ...blueprint.businessObjects.map((name) => businessObjectDefinition(name, domain)),
    ...blueprint.capabilities.map((name) => capabilityDefinition(name, domain, firstObject)),
    ...blueprint.workflows.map((name) => workflowDefinition(name, domain)),
    ...blueprint.policies.map((name) => policyDefinition(name, domain)),
    ...blueprint.apps.map((name) => appDefinition(name, domain, blueprint.businessObjects, blueprint.capabilities)),
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
