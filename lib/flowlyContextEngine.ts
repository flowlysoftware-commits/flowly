import { getCompanionContext } from "@/lib/flowlyCompanionRuntime";
import { getFlowlyRuntimeMode, type FlowlyRuntimeMode } from "@/lib/flowlyProductModes";

export type FlowlyCompanionIntent =
  | "saludo"
  | "ayuda"
  | "ventas"
  | "clientes"
  | "facturacion"
  | "whatsapp"
  | "tareas"
  | "objetivos"
  | "documentos"
  | "automatizacion_cliente"
  | "arquitectura"
  | "desconocido";

export type FlowlyContextSnapshot = {
  mode: FlowlyRuntimeMode;
  area: string;
  pathname: string;
  title: string;
  moduleSummary: string;
  allowedActions: string[];
  forbiddenActions: string[];
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function hasAny(text: string, words: string[]) {
  return words.some((word) => text.includes(normalize(word)));
}

export function getFlowlyContextSnapshot(pathname: string): FlowlyContextSnapshot {
  const mode = getFlowlyRuntimeMode(pathname);
  const context = getCompanionContext(pathname);
  const isArchitect = mode === "arquitecto";

  return {
    mode,
    area: context.area,
    pathname,
    title: context.title,
    moduleSummary: isArchitect
      ? "Estás en una zona interna de Flowly OS. Aquí se pueden analizar, diseñar y preparar cambios técnicos."
      : `Estás en el panel del cliente, dentro del área ${context.area}. El Companion debe ayudar al negocio sin mostrar Studio ni herramientas técnicas.`,
    allowedActions: isArchitect
      ? [
          "Analizar módulos existentes",
          "Preparar blueprints",
          "Abrir Asistente Arquitecto",
          "Revisar impacto técnico",
          "Proponer cambios de código bajo aprobación",
        ]
      : [
          "Explicar el panel con palabras simples",
          "Crear tareas y recordatorios de negocio",
          "Sugerir objetivos y misiones",
          "Ayudar con clientes, facturas, WhatsApp, documentos y marketing",
          "Convertir dudas en recomendaciones accionables",
        ],
    forbiddenActions: isArchitect
      ? []
      : [
          "Crear módulos",
          "Modificar código",
          "Abrir Studio, Builder, Kernel o Generator",
          "Mostrar lenguaje técnico interno",
        ],
  };
}

export function detectCompanionIntent(message: string): FlowlyCompanionIntent {
  const text = normalize(message);

  if (hasAny(text, ["hola", "buenas", "hey", "buenos dias", "buenas tardes"])) return "saludo";
  if (hasAny(text, ["ayuda", "como", "explicame", "que hago", "dime donde", "no entiendo"])) return "ayuda";
  if (hasAny(text, ["cliente", "clientes", "lead", "leads", "crm", "seguimiento", "contacto"])) return "clientes";
  if (hasAny(text, ["venta", "ventas", "vender", "comercial", "presupuesto", "oportunidad"])) return "ventas";
  if (hasAny(text, ["factura", "facturacion", "cobro", "ingreso", "gasto", "pago", "deuda"])) return "facturacion";
  if (hasAny(text, ["whatsapp", "mensaje", "responder", "plantilla", "chat" ])) return "whatsapp";
  if (hasAny(text, ["tarea", "recordatorio", "agenda", "calendario", "llamame", "avisame"])) return "tareas";
  if (hasAny(text, ["objetivo", "mision", "misiones", "xp", "nivel", "recompensa", "logro"])) return "objetivos";
  if (hasAny(text, ["documento", "pdf", "contrato", "archivo", "subir", "firma"])) return "documentos";
  if (hasAny(text, ["automatiza", "automatizacion", "cuando pase", "cada vez que", "si ocurre"])) return "automatizacion_cliente";
  if (hasAny(text, ["studio", "builder", "kernel", "codigo", "api", "sql", "programa", "programar", "modulo", "modificar modulo", "crear modulo", "componente", "ruta"])) return "arquitectura";

  return "desconocido";
}

function customerArchitectureBoundary() {
  return [
    "Eso pertenece a Flowly OS, la zona interna de desarrollo.",
    "En el panel de cliente no puedo crear módulos, tocar código, abrir Studio ni modificar la arquitectura.",
    "Lo que sí puedo hacer aquí es convertir tu necesidad en una acción de negocio: una tarea, un objetivo, una recomendación o una solicitud para el equipo técnico.",
    "Por ejemplo: puedo crear un objetivo para revisar el CRM, preparar una lista de mejoras o ayudarte a explicar el cambio que necesitas.",
  ].join("\n\n");
}

export function buildCustomerCompanionReply(message: string, snapshot: FlowlyContextSnapshot) {
  const intent = detectCompanionIntent(message);
  const area = snapshot.area;

  if (intent === "arquitectura") return customerArchitectureBoundary();

  if (intent === "saludo") {
    return `¡Hola! Estoy contigo en ${area}. Puedo ayudarte a decidir qué hacer ahora, crear objetivos, revisar clientes, preparar tareas o explicarte cualquier parte del panel sin entrar en configuraciones técnicas.`;
  }

  if (intent === "ayuda") {
    return [
      `Te ayudo paso a paso en ${area}.`,
      "Puedes pedirme cosas como:",
      "• ¿Qué debería hacer hoy?",
      "• Recuérdame llamar a este cliente.",
      "• Ayúdame a vender más esta semana.",
      "• Explícame qué significa esta pantalla.",
      "• Convierte esto en una tarea.",
    ].join("\n");
  }

  if (intent === "clientes") {
    return [
      "He entendido que quieres trabajar sobre clientes o CRM.",
      "Te propongo hacerlo así:",
      "1. Revisar clientes sin seguimiento.",
      "2. Priorizar los más importantes.",
      "3. Crear tareas de llamada o WhatsApp.",
      "4. Marcar objetivo diario de seguimiento.",
      "Puedo ayudarte a convertirlo en una misión para hoy.",
    ].join("\n");
  }

  if (intent === "ventas") {
    return [
      "Vamos a enfocarlo como una mejora comercial.",
      "Mi recomendación:",
      "• Revisar oportunidades abiertas.",
      "• Detectar presupuestos sin respuesta.",
      "• Preparar mensajes de seguimiento.",
      "• Crear un objetivo de ventas para hoy.",
      "Si quieres, lo convierto en una misión con XP y recompensa.",
    ].join("\n");
  }

  if (intent === "facturacion") {
    return [
      "He entendido que quieres revisar facturación o cobros.",
      "Podemos trabajar con tres acciones simples:",
      "1. Ver facturas pendientes.",
      "2. Priorizar vencidas o de mayor importe.",
      "3. Crear recordatorios de cobro.",
      "No tocaré configuración técnica; solo te ayudo a gestionar el negocio.",
    ].join("\n");
  }

  if (intent === "whatsapp") {
    return [
      "Perfecto, lo tratamos como comunicación con clientes.",
      "Puedo ayudarte a preparar un mensaje, definir a quién enviarlo y convertirlo en una tarea de seguimiento.",
      "También puedo sugerirte una plantilla amable y profesional según el objetivo: vender, cobrar, recordar cita o reactivar un cliente.",
    ].join("\n");
  }

  if (intent === "tareas") {
    return [
      "Perfecto. Lo convierto en una acción concreta.",
      "Para dejarlo bien necesito tres datos:",
      "• ¿Qué hay que hacer?",
      "• ¿Para cuándo?",
      "• ¿Es urgente o normal?",
      "Después puedo tratarlo como tarea, objetivo o misión del Companion.",
    ].join("\n");
  }

  if (intent === "objetivos") {
    return [
      "Esto encaja con objetivos, misiones y recompensas.",
      "Puedo ayudarte a convertirlo en:",
      "• Objetivo diario.",
      "• Misión semanal.",
      "• Logro desbloqueable.",
      "• Recompensa motivacional.",
      "La idea es que el panel no solo informe, sino que empuje al usuario a avanzar.",
    ].join("\n");
  }

  if (intent === "documentos") {
    return [
      "He entendido que hablamos de documentos o archivos.",
      "Puedo ayudarte a organizarlo como:",
      "1. Documento pendiente de revisar.",
      "2. Documento pendiente de enviar.",
      "3. Documento pendiente de firma.",
      "4. Recordatorio o tarea asociada.",
    ].join("\n");
  }

  if (intent === "automatizacion_cliente") {
    return [
      "Puedo ayudarte a pensar la automatización en lenguaje sencillo.",
      "Dímela con esta estructura:",
      "Cuando pase [situación], quiero que Flowly haga [acción].",
      "Ejemplo: cuando una factura venza, crear un recordatorio de cobro.",
      "Si afecta a configuración avanzada, la enviaré como solicitud técnica, no la ejecutaré desde el panel cliente.",
    ].join("\n");
  }

  return [
    `He entendido tu mensaje dentro de ${area}.`,
    "Para ayudarte mejor puedo convertirlo en una de estas acciones:",
    "• Tarea.",
    "• Objetivo.",
    "• Recomendación.",
    "• Recordatorio.",
    "• Mensaje para cliente.",
    "Dime cuál prefieres o explícame un poco más qué quieres conseguir.",
  ].join("\n");
}

export function buildArchitectCompanionReply(message: string, snapshot: FlowlyContextSnapshot) {
  const intent = detectCompanionIntent(message);

  if (intent === "arquitectura" || intent === "desconocido") {
    return [
      "Estoy en modo arquitecto. Esta petición sí puede analizarse con Flowly OS.",
      "Flujo recomendado:",
      "1. Analyzer: localizar módulo, rutas y dependencias.",
      "2. Architect: proponer blueprint o refactor.",
      "3. Reviewer: revisar riesgo e impacto.",
      "4. Builder: preparar cambios bajo aprobación.",
      "Abre el Asistente Arquitecto para convertir esta petición en un plan aplicable.",
    ].join("\n");
  }

  return [
    `Estoy en modo arquitecto y he entendido una intención de tipo ${intent}.`,
    "Puedo llevarla al Asistente Arquitecto para analizar código, módulos, Studio, Kernel y Builder sin mezclarlo con el panel de clientes.",
  ].join("\n");
}

export function buildCompanionReply(message: string, pathname: string) {
  const snapshot = getFlowlyContextSnapshot(pathname);
  return snapshot.mode === "arquitecto"
    ? buildArchitectCompanionReply(message, snapshot)
    : buildCustomerCompanionReply(message, snapshot);
}
