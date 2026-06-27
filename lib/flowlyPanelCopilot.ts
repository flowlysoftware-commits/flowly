import { buildProjectBlueprint, type FlowlyProjectType, type FlowlyStudioProjectBlueprint, type FlowlyStudioProjectInput } from "@/lib/flowlyStudioProjects";

export type FlowlyCopilotIntent = "crear" | "modificar" | "automatizar" | "analizar" | "desconocido";
export type FlowlyCopilotTarget = "crm" | "facturacion" | "rrhh" | "marketing" | "whatsapp" | "docs" | "ia_assistant" | "studio" | "kernel" | "general";
export type FlowlyCopilotAgentId = "analista" | "arquitecto" | "reutilizador" | "revisor" | "constructor" | "documentador";

export type FlowlyCopilotAction = {
  title: string;
  description: string;
  type: "blueprint" | "ui" | "database" | "api" | "workflow" | "policy" | "test" | "docs" | "kernel" | "review";
  status: "pendiente" | "listo" | "requiere_revision";
};

export type FlowlyCopilotAgentStep = {
  id: FlowlyCopilotAgentId;
  name: string;
  role: string;
  status: "completado" | "pendiente" | "bloqueado";
  output: string;
};

export type FlowlyCopilotTechnicalPlan = {
  businessObjects: string[];
  capabilities: string[];
  workflows: string[];
  policies: string[];
  apps: string[];
  integrations: string[];
  files: string[];
  events: string[];
};

export type FlowlyCopilotChangeRequest = {
  module: string;
  requestedChange: string;
  affectedAreas: string[];
  proposedSteps: string[];
  needsApproval: boolean;
};

export type FlowlyCopilotResponse = {
  intent: FlowlyCopilotIntent;
  target: FlowlyCopilotTarget;
  title: string;
  summary: string;
  simpleAnswer: string;
  questions: string[];
  actions: FlowlyCopilotAction[];
  agents: FlowlyCopilotAgentStep[];
  technicalPlan: FlowlyCopilotTechnicalPlan;
  suggestedPrompt: string;
  studioRoute: string;
  risk: "bajo" | "medio" | "alto";
  canGenerate: boolean;
  requiresApproval: boolean;
  approvalLabel: string;
  projectInput?: FlowlyStudioProjectInput;
  blueprint?: FlowlyStudioProjectBlueprint;
  changeRequest?: FlowlyCopilotChangeRequest;
};

type TargetConfig = {
  target: FlowlyCopilotTarget;
  label: string;
  projectType?: FlowlyProjectType;
  positive: string[];
  negative?: string[];
  weight: number;
};

const targetConfigs: TargetConfig[] = [
  {
    target: "ia_assistant",
    label: "Companion / IA Assistant",
    projectType: "ia_assistant",
    weight: 10,
    positive: [
      "companion", "ia assistant", "assistant", "asistente", "mascota", "avatar", "recompensa", "recompensas", "mision", "misiones",
      "xp", "experiencia", "nivel", "niveles", "logro", "logros", "estado de animo", "memoria", "conversaciones", "objetivos",
      "companion oficial", "asistente principal", "avatar animado", "gamificacion", "gamificación"
    ],
  },
  { target: "crm", label: "CRM", projectType: "crm", weight: 4, positive: ["crm", "cliente", "clientes", "lead", "leads", "comercial", "ventas", "pipeline", "oportunidad", "oportunidades"] },
  { target: "facturacion", label: "Facturación", projectType: "erp", weight: 4, positive: ["factura", "facturacion", "facturación", "presupuesto", "cobro", "gasto", "ingreso", "pago"] },
  { target: "rrhh", label: "Recursos Humanos", projectType: "rrhh", weight: 4, positive: ["rrhh", "recursos humanos", "empleado", "empleados", "contrato", "nomina", "nómina", "vacaciones", "ausencias"] },
  { target: "marketing", label: "Marketing", projectType: "libre", weight: 4, positive: ["marketing", "campana", "campaña", "anuncio", "landing", "facebook", "meta", "contenido"] },
  { target: "whatsapp", label: "WhatsApp", projectType: "libre", weight: 4, positive: ["whatsapp", "mensaje", "mensajes", "plantilla", "conversacion", "chat"] },
  { target: "docs", label: "Flowly Docs", projectType: "libre", weight: 4, positive: ["docs", "documentacion", "documentación", "manual", "wiki", "gitbook"] },
  { target: "studio", label: "Flowly Studio", projectType: "libre", weight: 5, positive: ["studio", "generator", "blueprint", "crear proyecto", "generador"] },
  { target: "kernel", label: "Flowly Kernel", projectType: "libre", weight: 5, positive: ["kernel", "runtime", "event bus", "business object runtime", "capability runtime"] },
];

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function countMatches(text: string, words: string[]) {
  return words.reduce((total, word) => total + (text.includes(normalize(word)) ? 1 : 0), 0);
}

export function detectCopilotTarget(message: string): FlowlyCopilotTarget {
  const text = normalize(message);
  let best: { target: FlowlyCopilotTarget; score: number } = { target: "general", score: 0 };

  for (const config of targetConfigs) {
    const positives = countMatches(text, config.positive);
    const negatives = config.negative ? countMatches(text, config.negative) : 0;
    const score = positives * config.weight - negatives * 2;
    if (score > best.score) best = { target: config.target, score };
  }

  return best.score > 0 ? best.target : "general";
}

export function detectCopilotIntent(message: string): FlowlyCopilotIntent {
  const text = normalize(message);
  const createScore = countMatches(text, ["crear", "crea", "haz", "monta", "nuevo", "nueva", "generar", "construir", "módulo", "modulo"]);
  const modifyScore = countMatches(text, ["modifica", "modificar", "cambia", "cambiar", "arregla", "arreglar", "no me gusta", "quita", "añade", "anade", "mejora esta parte"]);
  const automationScore = countMatches(text, ["automatiza", "automatizar", "cuando", "cada vez", "programa", "disparador"]);
  const analyzeScore = countMatches(text, ["analiza", "revisa", "dime", "diagnostica", "audita"]);

  const scores: Array<[FlowlyCopilotIntent, number]> = [
    ["crear", createScore],
    ["modificar", modifyScore],
    ["automatizar", automationScore],
    ["analizar", analyzeScore],
  ];
  scores.sort((a, b) => b[1] - a[1]);
  return scores[0][1] > 0 ? scores[0][0] : "desconocido";
}

function configForTarget(target: FlowlyCopilotTarget) {
  return targetConfigs.find((config) => config.target === target);
}

function targetLabel(target: FlowlyCopilotTarget) {
  if (target === "general") return "Flowly";
  return configForTarget(target)?.label || "Flowly";
}

function projectTypeForTarget(target: FlowlyCopilotTarget): FlowlyProjectType {
  return configForTarget(target)?.projectType || "libre";
}

function buildCreateProjectInput(target: FlowlyCopilotTarget, message: string): FlowlyStudioProjectInput | undefined {
  if (!["ia_assistant", "crm", "rrhh", "facturacion", "marketing", "whatsapp", "docs", "studio", "kernel", "general"].includes(target)) return undefined;
  const type = projectTypeForTarget(target);
  const label = target === "ia_assistant" ? "IA Assistant" : targetLabel(target);
  return {
    name: target === "general" ? "Nuevo proyecto Flowly" : label,
    type,
    description: target === "ia_assistant"
      ? "Companion oficial de Flowly con avatar, objetivos, misiones, recompensas, memoria, niveles, experiencia y recomendaciones."
      : `Proyecto ${label} creado desde el asistente IA del panel.`,
    prompt: message,
    modules: target === "ia_assistant"
      ? ["Companion", "Objetivos", "Misiones", "Recompensas", "Gamificación", "Avatar", "Memoria", "Notificaciones"]
      : [label],
    createArtifacts: true,
  };
}

function filesForBlueprint(blueprint?: FlowlyStudioProjectBlueprint) {
  if (!blueprint) return [];
  const slug = blueprint.slug;
  return [
    `app/${slug}/page.tsx`,
    `app/api/${slug}/route.ts`,
    `lib/generated/${slug}.ts`,
    `supabase/migrations/${slug}.sql`,
    `docs/generated/${slug}.md`,
    `tests/${slug}.test.ts`,
  ];
}

function eventsForBlueprint(blueprint?: FlowlyStudioProjectBlueprint) {
  if (!blueprint) return [];
  return [
    ...blueprint.businessObjects.slice(0, 6).map((object) => `${object}Created`),
    ...blueprint.capabilities.slice(0, 6).map((capability) => `${capability}Executed`),
  ];
}

function buildTechnicalPlan(intent: FlowlyCopilotIntent, target: FlowlyCopilotTarget, blueprint?: FlowlyStudioProjectBlueprint): FlowlyCopilotTechnicalPlan {
  if (intent === "crear" && blueprint) {
    return {
      businessObjects: blueprint.businessObjects,
      capabilities: blueprint.capabilities,
      workflows: blueprint.workflows,
      policies: blueprint.policies,
      apps: blueprint.apps,
      integrations: blueprint.type === "ia_assistant" ? ["CRM", "Facturación", "RRHH", "Marketing", "WhatsApp", "Documentos", "Flowly Docs", "Studio", "Kernel"] : blueprint.modules,
      files: filesForBlueprint(blueprint),
      events: eventsForBlueprint(blueprint),
    };
  }

  const label = targetLabel(target);
  return {
    businessObjects: [],
    capabilities: [`Modificar ${label}`, `Revisar ${label}`, `Validar cambios de ${label}`],
    workflows: ["Revisión de impacto", "Aprobación antes de aplicar", "Registro de cambio"],
    policies: ["HumanApprovalRequired", "ArchitectureReviewRequired"],
    apps: [label],
    integrations: ["Studio", "Kernel", "Docs"],
    files: ["Plan de cambios", "Blueprint de modificación", "Checklist de revisión"],
    events: ["CopilotChangeRequested", "CopilotPlanReviewed", "CopilotChangeApproved"],
  };
}

function buildActions(intent: FlowlyCopilotIntent, target: FlowlyCopilotTarget, blueprint?: FlowlyStudioProjectBlueprint): FlowlyCopilotAction[] {
  const label = targetLabel(target);
  if (intent === "crear") {
    return [
      { title: "Analizar intención", description: `He detectado que quieres crear ${label}, no un CRM ni una plantilla genérica.`, type: "review", status: "listo" },
      { title: "Diseñar blueprint", description: blueprint ? `Preparado con ${blueprint.businessObjects.length} objetos, ${blueprint.capabilities.length} capacidades y ${blueprint.workflows.length} flujos.` : "Preparar arquitectura del proyecto.", type: "blueprint", status: "listo" },
      { title: "Registrar en Studio", description: "Crear el proyecto y sus piezas para poder editarlo en modo arquitecto.", type: "kernel", status: "pendiente" },
      { title: "Generar aplicación", description: "Crear primera app navegable, rutas, documentación, SQL y pruebas base.", type: "ui", status: "pendiente" },
      { title: "Actualizar Docs", description: "Guardar explicación del módulo y blueprint generado.", type: "docs", status: "pendiente" },
    ];
  }
  if (intent === "modificar") {
    return [
      { title: `Entender cambio en ${label}`, description: "Separar lo que quieres cambiar de lo que debe mantenerse estable.", type: "review", status: "listo" },
      { title: "Revisar impacto", description: "Detectar pantallas, datos, rutas, permisos y dependencias afectadas.", type: "test", status: "requiere_revision" },
      { title: "Proponer modificación", description: "Crear una propuesta clara antes de tocar código o datos reales.", type: "blueprint", status: "pendiente" },
      { title: "Preparar paquete aplicable", description: "Dejar los cambios listos para Studio/Generator tras aprobación.", type: "api", status: "pendiente" },
    ];
  }
  if (intent === "automatizar") {
    return [
      { title: `Diseñar automatización en ${label}`, description: "Definir disparador, condiciones y acciones.", type: "workflow", status: "listo" },
      { title: "Añadir seguridad", description: "Evitar acciones críticas sin confirmación.", type: "policy", status: "pendiente" },
      { title: "Simular flujo", description: "Probar la automatización antes de activarla.", type: "test", status: "pendiente" },
    ];
  }
  return [
    { title: `Analizar ${label}`, description: "Convertir la petición en una propuesta accionable.", type: "blueprint", status: "listo" },
    { title: "Recomendar siguiente paso", description: "Decidir si conviene crear, modificar, automatizar o revisar.", type: "docs", status: "listo" },
  ];
}

function buildQuestions(intent: FlowlyCopilotIntent, target: FlowlyCopilotTarget) {
  if (target === "ia_assistant" && intent === "crear") {
    return [
      "¿Quieres que el Companion pueda actuar solo o siempre con confirmación humana?",
      "¿El avatar será 2D, 3D o empezamos con una versión simple?",
      "¿Las recompensas serán solo motivacionales o tendrán premios reales dentro de la empresa?",
    ];
  }
  if (intent === "modificar") {
    return [
      `¿Qué parte exacta de ${targetLabel(target)} quieres cambiar?`,
      "¿Quieres que lo cambie solo para ti o para todos los usuarios?",
      "¿Prefieres que primero te enseñe una propuesta antes de aplicarlo?",
    ];
  }
  if (intent === "crear") {
    return [
      "¿Quién va a usarlo principalmente?",
      "¿Qué apartados debería tener en el menú?",
      "¿Debe conectarse con algún módulo existente?",
    ];
  }
  return ["¿Quieres que lo convierta en una tarea concreta?", "¿Lo revisamos antes de aplicar cambios?"];
}

function buildAgents(intent: FlowlyCopilotIntent, target: FlowlyCopilotTarget, blueprint?: FlowlyStudioProjectBlueprint): FlowlyCopilotAgentStep[] {
  const label = targetLabel(target);
  return [
    {
      id: "analista",
      name: "Analista",
      role: "Entiende la petición real",
      status: "completado",
      output: intent === "crear" ? `El usuario quiere crear ${label}. Objetivo detectado correctamente.` : `El usuario quiere ${intent} ${label}.`,
    },
    {
      id: "arquitecto",
      name: "Arquitecto",
      role: "Diseña el blueprint",
      status: blueprint ? "completado" : "pendiente",
      output: blueprint ? `Blueprint preparado: ${blueprint.businessObjects.length} objetos, ${blueprint.capabilities.length} capacidades, ${blueprint.workflows.length} flujos.` : "Necesita más información para crear blueprint.",
    },
    {
      id: "reutilizador",
      name: "Reutilizador",
      role: "Evita duplicidades",
      status: "completado",
      output: "Usará Studio, Kernel, Docs y los runtimes existentes antes de crear piezas nuevas.",
    },
    {
      id: "revisor",
      name: "Revisor",
      role: "Valida riesgos y permisos",
      status: "completado",
      output: target === "ia_assistant" ? "Riesgo medio: memoria, acciones autónomas y recompensas requieren políticas claras." : "Revisión preparada antes de aplicar cambios.",
    },
    {
      id: "constructor",
      name: "Constructor",
      role: "Crea o prepara cambios",
      status: "pendiente",
      output: "Esperando aprobación del usuario antes de registrar/generar.",
    },
    {
      id: "documentador",
      name: "Documentador",
      role: "Actualiza Flowly Docs",
      status: "pendiente",
      output: "Se ejecutará después de aprobar el plan.",
    },
  ];
}

function buildChangeRequest(target: FlowlyCopilotTarget, message: string): FlowlyCopilotChangeRequest | undefined {
  return {
    module: targetLabel(target),
    requestedChange: message,
    affectedAreas: ["Interfaz", "Datos", "Permisos", "Documentación", "Pruebas"],
    proposedSteps: [
      "Crear una propuesta de cambio en Studio.",
      "Revisar dependencias afectadas.",
      "Generar versión previa antes de aplicar.",
      "Actualizar documentación y pruebas.",
    ],
    needsApproval: true,
  };
}

function titleFor(intent: FlowlyCopilotIntent, label: string) {
  if (intent === "crear") return `Crear ${label}`;
  if (intent === "modificar") return `Modificar ${label}`;
  if (intent === "automatizar") return `Automatizar ${label}`;
  if (intent === "analizar") return `Analizar ${label}`;
  return `Preparar ${label}`;
}

export function analyzeCopilotRequest(message: string): FlowlyCopilotResponse {
  const cleanMessage = message.trim() || "Quiero mejorar Flowly.";
  const intent = detectCopilotIntent(cleanMessage);
  const target = detectCopilotTarget(cleanMessage);
  const label = targetLabel(target);
  const projectInput = intent === "crear" ? buildCreateProjectInput(target, cleanMessage) : undefined;
  const blueprint = projectInput ? buildProjectBlueprint(projectInput) : undefined;
  const actions = buildActions(intent, target, blueprint);
  const risk = target === "ia_assistant" ? "medio" : intent === "modificar" && target !== "general" ? "medio" : "bajo";

  const simpleAnswer = intent === "crear"
    ? `Perfecto. He entendido que quieres crear ${label}. No usaré la plantilla de CRM: he preparado un plan específico con arquitectura, piezas, revisión y generación bajo aprobación.`
    : intent === "modificar"
      ? `Perfecto. He entendido que quieres modificar ${label}. No tocaré nada directamente: primero preparo impacto, propuesta y paquete de cambio.`
      : intent === "automatizar"
        ? `Perfecto. He entendido que quieres automatizar ${label}. Voy a separar disparador, condiciones, permisos y acciones antes de activarlo.`
        : `Perfecto. Voy a analizarlo y convertirlo en un plan claro.`;

  return {
    intent,
    target,
    title: titleFor(intent, label),
    summary: cleanMessage,
    simpleAnswer,
    questions: buildQuestions(intent, target),
    actions,
    agents: buildAgents(intent, target, blueprint),
    technicalPlan: buildTechnicalPlan(intent, target, blueprint),
    suggestedPrompt: `Petición original: ${cleanMessage}`,
    studioRoute: blueprint ? `/studio/v2?project=${blueprint.slug}` : target === "studio" ? "/studio/v2" : "/crear",
    risk,
    canGenerate: intent === "crear" || intent === "modificar" || intent === "automatizar",
    requiresApproval: true,
    approvalLabel: intent === "crear" ? "Aprobar y crear en Studio" : "Guardar plan de cambio",
    projectInput,
    blueprint,
    changeRequest: intent === "modificar" ? buildChangeRequest(target, cleanMessage) : undefined,
  };
}
