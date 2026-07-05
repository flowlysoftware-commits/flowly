import { detectCompanionIntent, getFlowlyContextSnapshot, type FlowlyContextSnapshot } from "@/lib/flowlyContextEngine";
import { callFlowlyOpenAI } from "@/lib/flowlyOpenAI";

export type FlowlyAICompanionRole = "cliente" | "arquitecto";

export type FlowlyAIMessage = {
  role: "assistant" | "user";
  content: string;
};

export type FlowlyAIRequest = {
  message: string;
  pathname: string;
  conversation?: FlowlyAIMessage[];
  extraContext?: Record<string, unknown>;
};

export type FlowlyAIResponse = {
  answer: string;
  mode: FlowlyAICompanionRole;
  intent: string;
  usedAI: boolean;
  blockedInternalAction?: boolean;
  suggestedActions: string[];
};

const CUSTOMER_FORBIDDEN_TERMS = [
  "studio",
  "builder",
  "kernel",
  "generator",
  "generador",
  "codigo",
  "código",
  "api",
  "sql",
  "programa",
  "programar",
  "crear modulo",
  "crear módulo",
  "modificar modulo",
  "modificar módulo",
  "ruta",
  "componente",
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function includesAny(text: string, words: string[]) {
  const normalized = normalize(text);
  return words.some((word) => normalized.includes(normalize(word)));
}

function isCustomerForbiddenRequest(message: string) {
  return includesAny(message, CUSTOMER_FORBIDDEN_TERMS);
}

function suggestedActionsForIntent(intent: string, snapshot: FlowlyContextSnapshot) {
  if (snapshot.mode === "arquitecto") {
    return ["Analizar módulo", "Preparar plan técnico", "Revisar impacto", "Abrir Asistente Arquitecto"];
  }

  if (intent === "ventas" || intent === "clientes") {
    return ["Crear misión comercial", "Preparar seguimiento", "Priorizar clientes", "Crear tarea"];
  }

  if (intent === "facturacion") {
    return ["Revisar pendientes", "Crear recordatorio de cobro", "Preparar mensaje", "Priorizar facturas"];
  }

  if (intent === "whatsapp") {
    return ["Preparar mensaje", "Crear plantilla", "Crear seguimiento", "Enviar recordatorio"];
  }

  if (intent === "tareas") {
    return ["Crear tarea", "Crear recordatorio", "Convertir en objetivo", "Añadir fecha"];
  }

  if (intent === "objetivos") {
    return ["Crear objetivo", "Crear misión", "Añadir recompensa", "Actualizar progreso"];
  }

  return ["Crear tarea", "Crear objetivo", "Dar recomendación", "Preparar recordatorio"];
}

function customerBoundaryAnswer() {
  return [
    "Eso pertenece a la zona interna de Flowly OS, no al panel del cliente.",
    "Aquí no puedo crear módulos, tocar código, abrir Studio ni modificar la arquitectura.",
    "Sí puedo ayudarte a convertir esa necesidad en una solicitud clara para el equipo técnico o en una tarea de negocio.",
    "Por ejemplo: puedo preparar una lista de mejoras para el CRM o crear un objetivo para revisar el proceso comercial.",
  ].join("\n\n");
}

function buildDeterministicCustomerAnswer(message: string, snapshot: FlowlyContextSnapshot) {
  const intent = detectCompanionIntent(message);
  const text = normalize(message);

  if (isCustomerForbiddenRequest(message)) return customerBoundaryAnswer();

  if (text.includes("que tengo que hacer hoy") || text.includes("que debo hacer hoy") || text.includes("que hago hoy") || text.includes("recomendacion") || text.includes("recomendación")) {
    return [
      "Para hoy te propongo empezar por 3 prioridades claras:",
      "1. Revisar clientes o leads sin seguimiento y crear una tarea de contacto.",
      "2. Comprobar presupuestos o facturas pendientes para no dejar dinero parado.",
      "3. Preparar una acción comercial rápida: WhatsApp, llamada o recordatorio.",
      "Si quieres, te lo convierto en una misión diaria con XP y recompensa.",
    ].join("\n");
  }

  if (intent === "clientes") {
    return [
      "En CRM empezaría por ordenar los clientes por prioridad.",
      "Mi recomendación es revisar primero los que no tienen seguimiento reciente, luego los presupuestos abiertos y finalmente los leads nuevos.",
      "Puedo ayudarte a crear una misión: contactar 5 clientes importantes hoy.",
    ].join("\n");
  }

  if (intent === "ventas") {
    return [
      "Para vender más esta semana haría tres acciones:",
      "1. Recuperar presupuestos sin respuesta.",
      "2. Enviar un WhatsApp breve a leads calientes.",
      "3. Crear un objetivo diario de seguimiento comercial.",
      "Puedo prepararte el mensaje si me dices el tipo de cliente.",
    ].join("\n");
  }

  if (intent === "facturacion") {
    return [
      "En facturación revisaría primero los importes pendientes y las fechas vencidas.",
      "Después crearía recordatorios de cobro y mensajes amables para los clientes pendientes.",
      "Así evitamos que la gestión se quede olvidada.",
    ].join("\n");
  }

  if (intent === "whatsapp") {
    return [
      "Puedo ayudarte con WhatsApp de forma práctica.",
      "Dime si el mensaje es para vender, cobrar, recordar una cita o recuperar un cliente y te preparo un texto listo para enviar.",
    ].join("\n");
  }

  if (intent === "tareas") {
    return [
      "Perfecto, lo convertimos en una tarea.",
      "Dime qué hay que hacer, para cuándo y si es urgente. Con eso puedo dejarlo como tarea, recordatorio u objetivo.",
    ].join("\n");
  }

  if (intent === "objetivos") {
    return [
      "Esto encaja muy bien como objetivo o misión.",
      "Podemos definir una meta, medir progreso, asignar XP y desbloquear una recompensa cuando se complete.",
      "Dime el objetivo y te ayudo a estructurarlo.",
    ].join("\n");
  }

  return [
    `Estoy contigo en ${snapshot.area}.`,
    "Puedo ayudarte a decidir la siguiente acción, preparar recomendaciones, convertir ideas en tareas o crear objetivos de negocio.",
    "Por ejemplo, puedes decirme: “qué hago hoy”, “ayúdame a vender más” o “prepárame un mensaje para un cliente”.",
  ].join("\n");
}

function buildDeterministicArchitectAnswer(message: string) {
  return [
    "Estoy en modo arquitecto.",
    "Puedo analizar esta petición como cambio técnico, preparar un blueprint, revisar impacto y enviarlo al Builder bajo aprobación.",
    "Para aplicar cambios reales usa el Asistente Arquitecto, donde puedo separar análisis, arquitectura, revisión y construcción.",
    `Petición recibida: “${message.slice(0, 180)}${message.length > 180 ? "..." : "”"}`,
  ].join("\n");
}

function buildSystemPrompt(snapshot: FlowlyContextSnapshot) {
  const isArchitect = snapshot.mode === "arquitecto";
  return [
    isArchitect
      ? "Eres el Companion Arquitecto de Flowly OS. Ayudas al fundador/desarrollador a analizar y mejorar la plataforma."
      : "Eres el Companion Cliente de Flowly. Ayudas a un usuario de negocio dentro de su panel empresarial.",
    "Habla siempre en español claro, cercano y útil.",
    "No respondas con plantillas genéricas. Da una recomendación concreta aunque el contexto sea limitado.",
    "Si faltan datos reales, dilo con naturalidad y propone el siguiente paso práctico.",
    isArchitect
      ? "Puedes hablar de Studio, Kernel, Builder, Analyzer, rutas, código y arquitectura."
      : "No puedes hablar de Studio, Kernel, Builder, Generator, código, APIs, SQL ni modificar arquitectura. Si el usuario pide eso, reconduce a una solicitud técnica o tarea de negocio.",
    "Máximo 8 líneas salvo que el usuario pida detalle.",
    "Contexto actual:",
    JSON.stringify(snapshot),
  ].join("\n");
}

async function callOpenAI(message: string, snapshot: FlowlyContextSnapshot, conversation: FlowlyAIMessage[]) {
  const ai = await callFlowlyOpenAI({
    purpose: snapshot.mode === "arquitecto" ? "developer" : "companion",
    system: buildSystemPrompt(snapshot),
    user: message,
    history: conversation.slice(-8).map((item) => ({ role: item.role, content: item.content })),
    temperature: snapshot.mode === "arquitecto" ? 0.2 : 0.35,
    maxOutputTokens: 560,
  });

  if (!ai.ok || !ai.text.trim()) {
    if (ai.error) console.warn("Flowly AI Engine OpenAI warning:", ai.error);
    return null;
  }

  return ai.text.trim();
}

export async function runFlowlyAIEngine(request: FlowlyAIRequest): Promise<FlowlyAIResponse> {
  const snapshot = getFlowlyContextSnapshot(request.pathname);
  const intent = detectCompanionIntent(request.message);
  const mode: FlowlyAICompanionRole = snapshot.mode === "arquitecto" ? "arquitecto" : "cliente";
  const blockedInternalAction = mode === "cliente" && isCustomerForbiddenRequest(request.message);

  if (blockedInternalAction) {
    return {
      answer: customerBoundaryAnswer(),
      mode,
      intent,
      usedAI: false,
      blockedInternalAction: true,
      suggestedActions: suggestedActionsForIntent(intent, snapshot),
    };
  }

  const aiAnswer = await callOpenAI(request.message, snapshot, request.conversation || []);
  const answer = aiAnswer || (mode === "arquitecto"
    ? buildDeterministicArchitectAnswer(request.message)
    : buildDeterministicCustomerAnswer(request.message, snapshot));

  return {
    answer,
    mode,
    intent,
    usedAI: Boolean(aiAnswer),
    blockedInternalAction: false,
    suggestedActions: suggestedActionsForIntent(intent, snapshot),
  };
}
