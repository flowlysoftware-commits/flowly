export type FlowlyCopilotIntent = "crear" | "modificar" | "automatizar" | "analizar" | "desconocido";
export type FlowlyCopilotTarget = "crm" | "facturacion" | "rrhh" | "marketing" | "whatsapp" | "docs" | "ia_assistant" | "studio" | "general";

export type FlowlyCopilotAction = {
  title: string;
  description: string;
  type: "blueprint" | "ui" | "database" | "api" | "workflow" | "policy" | "test" | "docs";
  status: "pendiente" | "listo" | "requiere_revision";
};

export type FlowlyCopilotResponse = {
  intent: FlowlyCopilotIntent;
  target: FlowlyCopilotTarget;
  title: string;
  summary: string;
  simpleAnswer: string;
  questions: string[];
  actions: FlowlyCopilotAction[];
  suggestedPrompt: string;
  studioRoute: string;
  risk: "bajo" | "medio" | "alto";
  canGenerate: boolean;
};

const targetWords: Array<[FlowlyCopilotTarget, string[]]> = [
  ["crm", ["crm", "cliente", "clientes", "lead", "leads", "comercial", "ventas", "pipeline"]],
  ["facturacion", ["factura", "facturación", "facturacion", "presupuesto", "cobro", "gasto", "ingreso"]],
  ["rrhh", ["rrhh", "recursos humanos", "empleado", "empleados", "contrato", "nómina", "nomina", "vacaciones"]],
  ["marketing", ["marketing", "campaña", "campana", "anuncio", "landing", "facebook", "meta"]],
  ["whatsapp", ["whatsapp", "mensaje", "chat", "plantilla"]],
  ["docs", ["docs", "documentación", "documentacion", "manual", "wiki"]],
  ["ia_assistant", ["companion", "ia assistant", "mascota", "avatar", "recompensa", "misión", "mision"]],
  ["studio", ["studio", "generator", "blueprint", "crear proyecto"]],
];

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function detectCopilotTarget(message: string): FlowlyCopilotTarget {
  const text = normalize(message);
  for (const [target, words] of targetWords) {
    if (words.some((word) => text.includes(normalize(word)))) return target;
  }
  return "general";
}

export function detectCopilotIntent(message: string): FlowlyCopilotIntent {
  const text = normalize(message);
  if (["crear", "haz", "monta", "nuevo", "nueva", "generar", "construir"].some((word) => text.includes(word))) return "crear";
  if (["modifica", "modificar", "cambia", "cambiar", "arregla", "arreglar", "no me gusta", "quita", "añade", "anade"].some((word) => text.includes(word))) return "modificar";
  if (["automatiza", "automatizar", "cuando", "cada", "programa"].some((word) => text.includes(word))) return "automatizar";
  if (["analiza", "revisa", "dime", "mejora", "diagnostica"].some((word) => text.includes(word))) return "analizar";
  return "desconocido";
}

function targetLabel(target: FlowlyCopilotTarget) {
  const labels: Record<FlowlyCopilotTarget, string> = {
    crm: "CRM",
    facturacion: "Facturación",
    rrhh: "Recursos Humanos",
    marketing: "Marketing",
    whatsapp: "WhatsApp",
    docs: "Flowly Docs",
    ia_assistant: "IA Assistant",
    studio: "Flowly Studio",
    general: "Flowly",
  };
  return labels[target];
}

function buildActions(intent: FlowlyCopilotIntent, target: FlowlyCopilotTarget, message: string): FlowlyCopilotAction[] {
  const label = targetLabel(target);
  if (intent === "crear") {
    return [
      { title: `Diseñar ${label}`, description: "Convertir tu idea en un blueprint con apartados, datos, permisos y pantallas.", type: "blueprint", status: "listo" },
      { title: "Crear estructura inicial", description: "Preparar objetos, capacidades, flujos y políticas sin mostrarte lenguaje técnico.", type: "database", status: "pendiente" },
      { title: "Generar aplicación", description: "Crear una primera pantalla navegable para probar el módulo.", type: "ui", status: "pendiente" },
      { title: "Crear documentación", description: "Guardar una explicación simple de qué se ha construido y cómo seguir.", type: "docs", status: "pendiente" },
    ];
  }
  if (intent === "modificar") {
    return [
      { title: `Entender el cambio en ${label}`, description: "Traducir tu petición en una lista clara de cambios antes de tocar nada.", type: "blueprint", status: "listo" },
      { title: "Detectar zonas afectadas", description: "Localizar pantallas, datos, rutas, permisos y automatizaciones que podrían cambiar.", type: "test", status: "requiere_revision" },
      { title: "Preparar propuesta visual", description: "Mostrar cómo quedaría antes de aplicar los cambios.", type: "ui", status: "pendiente" },
      { title: "Generar paquete de cambios", description: "Crear un plan instalable/revisable para que puedas aprobarlo.", type: "api", status: "pendiente" },
    ];
  }
  if (intent === "automatizar") {
    return [
      { title: `Crear automatización en ${label}`, description: "Definir el disparador, las condiciones y la acción final.", type: "workflow", status: "listo" },
      { title: "Añadir seguridad", description: "Evitar que una automatización ejecute acciones críticas sin confirmación.", type: "policy", status: "pendiente" },
      { title: "Probar flujo", description: "Simular la automatización antes de activarla.", type: "test", status: "pendiente" },
    ];
  }
  return [
    { title: `Analizar ${label}`, description: "Revisar la petición y convertirla en una propuesta accionable.", type: "blueprint", status: "listo" },
    { title: "Recomendar siguiente paso", description: "Decidir si conviene crear, modificar, automatizar o revisar.", type: "docs", status: "listo" },
  ];
}

function buildQuestions(intent: FlowlyCopilotIntent, target: FlowlyCopilotTarget) {
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

export function analyzeCopilotRequest(message: string): FlowlyCopilotResponse {
  const cleanMessage = message.trim() || "Quiero mejorar Flowly.";
  const intent = detectCopilotIntent(cleanMessage);
  const target = detectCopilotTarget(cleanMessage);
  const label = targetLabel(target);
  const actions = buildActions(intent, target, cleanMessage);
  const risk = intent === "modificar" && target !== "general" ? "medio" : "bajo";
  const title = intent === "crear" ? `Crear ${label}` : intent === "modificar" ? `Modificar ${label}` : intent === "automatizar" ? `Automatizar ${label}` : `Analizar ${label}`;
  const simpleAnswer = intent === "modificar"
    ? `Perfecto. He entendido que quieres cambiar ${label}. Antes de tocar nada, te preparo un plan claro con lo que se modificaría y lo que podría verse afectado.`
    : intent === "crear"
      ? `Perfecto. Voy a convertir tu idea en un proyecto sencillo, con pantallas, datos y automatizaciones preparadas por detrás.`
      : `Perfecto. Voy a analizarlo y convertirlo en pasos claros para que no tengas que entender la parte técnica.`;

  return {
    intent,
    target,
    title,
    summary: cleanMessage,
    simpleAnswer,
    questions: buildQuestions(intent, target),
    actions,
    suggestedPrompt: `Quiero ${intent === "modificar" ? "modificar" : intent === "crear" ? "crear" : "mejorar"} ${label}. Petición original: ${cleanMessage}`,
    studioRoute: target === "ia_assistant" ? "/studio/v2" : target === "studio" ? "/studio/v2" : "/crear",
    risk,
    canGenerate: true,
  };
}
