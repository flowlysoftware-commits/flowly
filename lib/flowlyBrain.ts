import { analyzeCurrentFlowlyProject, analyzeModule } from "@/lib/flowlyAnalyzer";
import { detectCompanionIntent, getFlowlyContextSnapshot, type FlowlyCompanionIntent, type FlowlyContextSnapshot } from "@/lib/flowlyContextEngine";
import { flowlyDocBooks } from "@/lib/flowlyDocsContent";
import { flowlyMigrationModules, buildModuleBlueprint } from "@/lib/flowlyOSMigration";
import { analyzeFlowlyImpact } from "@/lib/flowlyProjectGraph";

export type FlowlyBrainMode = "cliente" | "arquitecto";
export type FlowlyBrainStage = "contexto" | "conocimiento" | "analisis" | "plan" | "respuesta" | "bloqueado";

export type FlowlyBrainMessage = {
  role: "assistant" | "user";
  content: string;
};

export type FlowlyBrainRequest = {
  message: string;
  pathname: string;
  conversation?: FlowlyBrainMessage[];
  extraContext?: Record<string, unknown>;
};

export type FlowlyBrainToolId =
  | "context_engine"
  | "knowledge_search"
  | "project_analyzer"
  | "project_graph"
  | "kernel_registry"
  | "business_context"
  | "permission_guard"
  | "action_planner";

export type FlowlyBrainToolResult = {
  id: FlowlyBrainToolId;
  label: string;
  summary: string;
  data: Record<string, unknown>;
};

export type FlowlyBrainAction = {
  type: "recommendation" | "task" | "goal" | "message" | "technical_plan" | "blocked";
  label: string;
  description: string;
  requiresApproval: boolean;
};

export type FlowlyBrainResponse = {
  answer: string;
  mode: FlowlyBrainMode;
  intent: FlowlyCompanionIntent | "mejorar_modulo" | "crear_modulo" | "hoy";
  usedAI: boolean;
  blockedInternalAction: boolean;
  stage: FlowlyBrainStage;
  tools: FlowlyBrainToolResult[];
  plan: FlowlyBrainAction[];
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
  "archivo",
  "archivos",
  "deploy",
  "compilar",
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

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function isCustomerForbiddenRequest(message: string) {
  return includesAny(message, CUSTOMER_FORBIDDEN_TERMS);
}

function detectBrainIntent(message: string): FlowlyBrainResponse["intent"] {
  const text = normalize(message);
  if (includesAny(text, ["que tengo que hacer hoy", "que debo hacer hoy", "que hago hoy", "hoy", "prioridad", "prioridades"])) return "hoy";
  if (includesAny(text, ["mejora", "mejorar", "no me gusta", "cambia", "modifica", "rediseña", "arregla"])) return "mejorar_modulo";
  if (includesAny(text, ["crea", "crear", "nuevo modulo", "nuevo módulo", "construye", "hazme"])) return "crear_modulo";
  return detectCompanionIntent(message);
}

function detectMentionedModules(message: string) {
  const text = normalize(message);
  return flowlyMigrationModules.filter((module) => {
    const terms = [module.id, module.name, module.targetDomain, ...module.currentRoutes, ...module.businessObjects, ...module.capabilities];
    return terms.some((term) => text.includes(normalize(term)));
  });
}

function searchKnowledge(message: string, limit = 5) {
  const normalized = normalize(message);
  const tokens = unique(normalized.split(/\s+/).filter((token) => token.length >= 4));
  const results: Array<{ book: string; chapter: string; title: string; summary: string; score: number }> = [];

  for (const book of flowlyDocBooks) {
    for (const chapter of book.chapters) {
      const haystack = normalize(`${book.title} ${book.description} ${chapter.title} ${chapter.summary} ${chapter.content}`);
      const score = tokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);
      if (score > 0) {
        results.push({ book: book.title, chapter: chapter.slug, title: chapter.title, summary: chapter.summary, score });
      }
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

function buildBusinessContext(snapshot: FlowlyContextSnapshot, intent: FlowlyBrainResponse["intent"]) {
  const area = snapshot.area;
  const base = {
    area,
    pathname: snapshot.pathname,
    note: "Contexto de negocio inicial. Cuando conectemos tablas reales, este bloque leerá CRM, facturación, WhatsApp, agenda, tareas y objetivos desde Supabase.",
  };

  if (intent === "hoy") {
    return {
      ...base,
      priorities: [
        "Revisar clientes o leads sin seguimiento.",
        "Comprobar presupuestos/facturas pendientes.",
        "Crear una acción comercial sencilla para hoy.",
      ],
      missingData: ["tareas reales", "agenda real", "facturas reales", "leads reales"],
    };
  }

  if (intent === "ventas" || intent === "clientes") {
    return {
      ...base,
      priorities: ["Ordenar clientes por seguimiento", "Recuperar oportunidades abiertas", "Preparar mensajes de WhatsApp"],
      suggestedMission: "Contactar 5 clientes importantes hoy.",
    };
  }

  if (intent === "facturacion") {
    return {
      ...base,
      priorities: ["Revisar facturas vencidas", "Preparar recordatorios de cobro", "Priorizar importes altos"],
    };
  }

  return base;
}

function toolContext(snapshot: FlowlyContextSnapshot): FlowlyBrainToolResult {
  return {
    id: "context_engine",
    label: "Context Engine",
    summary: `Modo ${snapshot.mode} en ${snapshot.area}.`,
    data: { snapshot },
  };
}

function toolKnowledge(message: string): FlowlyBrainToolResult {
  const results = searchKnowledge(message);
  return {
    id: "knowledge_search",
    label: "Flowly Knowledge",
    summary: results.length ? `${results.length} fragmentos relevantes encontrados en Docs.` : "No hay fragmentos claros en Docs para esta consulta.",
    data: { results },
  };
}

function toolAnalyzer(message: string): FlowlyBrainToolResult {
  const mentioned = detectMentionedModules(message);
  const report = analyzeCurrentFlowlyProject();
  const moduleAnalyses = mentioned.map((module) => analyzeModule(module.id)).filter(Boolean);
  return {
    id: "project_analyzer",
    label: "Analyzer",
    summary: mentioned.length ? `Módulos detectados: ${mentioned.map((module) => module.name).join(", ")}.` : `${report.summary.totalModules} módulos conocidos en la migración.`,
    data: { summary: report.summary, mentionedModules: mentioned, moduleAnalyses },
  };
}

async function toolProjectGraph(message: string): Promise<FlowlyBrainToolResult> {
  try {
    const impact = await analyzeFlowlyImpact(message);
    return {
      id: "project_graph",
      label: "Project Graph",
      summary: `${impact.detectedModules.length} módulo(s), ${impact.primaryFiles.length} archivo(s) principales y ${impact.secondaryFiles.length} secundarios detectados.`,
      data: { impact },
    };
  } catch (error) {
    return {
      id: "project_graph",
      label: "Project Graph",
      summary: "Project Graph no pudo completarse, pero Brain seguirá con Analyzer/Knowledge.",
      data: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

function toolKernel(message: string): FlowlyBrainToolResult {
  const mentioned = detectMentionedModules(message);
  const blueprints = mentioned.map((module) => buildModuleBlueprint(module.id)).filter(Boolean);
  return {
    id: "kernel_registry",
    label: "Kernel Registry",
    summary: blueprints.length ? `${blueprints.length} blueprint(s) de módulo listos para consultar.` : "Kernel preparado para registrar módulos, capacidades y eventos.",
    data: { blueprints },
  };
}

function toolBusinessContext(snapshot: FlowlyContextSnapshot, intent: FlowlyBrainResponse["intent"]): FlowlyBrainToolResult {
  const context = buildBusinessContext(snapshot, intent);
  return {
    id: "business_context",
    label: "Business Context",
    summary: `Contexto operativo preparado para ${snapshot.area}.`,
    data: context,
  };
}

function toolPermissionGuard(mode: FlowlyBrainMode, blocked: boolean): FlowlyBrainToolResult {
  return {
    id: "permission_guard",
    label: "Permission Guard",
    summary: blocked ? "Acción interna bloqueada en panel cliente." : `Permisos válidos para modo ${mode}.`,
    data: { blocked, mode },
  };
}

function suggestedActions(intent: FlowlyBrainResponse["intent"], mode: FlowlyBrainMode) {
  if (mode === "arquitecto") {
    if (intent === "mejorar_modulo") return ["Analizar módulo", "Proponer diff", "Revisar impacto", "Enviar al Builder"];
    if (intent === "crear_modulo") return ["Crear blueprint", "Revisar arquitectura", "Generar módulo", "Actualizar Docs"];
    return ["Analizar", "Planificar", "Revisar", "Construir"];
  }

  if (intent === "hoy") return ["Crear misión diaria", "Crear tarea", "Ver recomendaciones", "Preparar WhatsApp"];
  if (intent === "ventas" || intent === "clientes") return ["Priorizar clientes", "Crear seguimiento", "Preparar mensaje", "Crear objetivo comercial"];
  if (intent === "facturacion") return ["Revisar pendientes", "Crear recordatorio", "Preparar mensaje de cobro", "Priorizar facturas"];
  return ["Crear tarea", "Crear objetivo", "Dar recomendación", "Preparar recordatorio"];
}

function buildPlan(intent: FlowlyBrainResponse["intent"], mode: FlowlyBrainMode, blocked: boolean): FlowlyBrainAction[] {
  if (blocked) {
    return [
      { type: "blocked", label: "Bloquear acción técnica", description: "Esta petición pertenece a Flowly OS y no debe ejecutarse desde el panel cliente.", requiresApproval: false },
      { type: "task", label: "Crear solicitud técnica", description: "Convertir la necesidad en una tarea para el equipo interno.", requiresApproval: true },
    ];
  }

  if (mode === "arquitecto") {
    if (intent === "mejorar_modulo") {
      return [
        { type: "technical_plan", label: "Analizar módulo existente", description: "Leer blueprint, rutas, componentes y dependencias conocidas.", requiresApproval: false },
        { type: "technical_plan", label: "Proponer cambios", description: "Preparar una propuesta antes de modificar archivos.", requiresApproval: true },
        { type: "technical_plan", label: "Enviar al Builder", description: "Aplicar los cambios solo cuando estén aprobados.", requiresApproval: true },
      ];
    }
    return [
      { type: "technical_plan", label: "Diseñar blueprint", description: "Convertir la idea en arquitectura de módulo.", requiresApproval: false },
      { type: "technical_plan", label: "Revisar riesgos", description: "Validar permisos, dependencias y duplicidades.", requiresApproval: false },
      { type: "technical_plan", label: "Construir", description: "Generar o modificar el módulo bajo aprobación.", requiresApproval: true },
    ];
  }

  if (intent === "hoy") {
    return [
      { type: "recommendation", label: "Prioridad 1", description: "Revisar clientes/leads sin seguimiento.", requiresApproval: false },
      { type: "recommendation", label: "Prioridad 2", description: "Comprobar presupuestos o facturas pendientes.", requiresApproval: false },
      { type: "goal", label: "Misión diaria", description: "Crear una misión con XP para completar el foco del día.", requiresApproval: true },
    ];
  }

  return [
    { type: "recommendation", label: "Recomendar siguiente paso", description: "Dar una acción concreta de negocio.", requiresApproval: false },
    { type: "task", label: "Convertir en tarea", description: "Crear una tarea o recordatorio si el usuario lo aprueba.", requiresApproval: true },
  ];
}

function toolActionPlanner(intent: FlowlyBrainResponse["intent"], mode: FlowlyBrainMode, blocked: boolean): FlowlyBrainToolResult {
  const plan = buildPlan(intent, mode, blocked);
  return {
    id: "action_planner",
    label: "Action Planner",
    summary: `${plan.length} acción(es) propuestas por el Brain.`,
    data: { plan },
  };
}

function customerBoundaryAnswer() {
  return [
    "Eso pertenece a la zona interna de Flowly OS.",
    "En el panel de cliente no puedo crear módulos, tocar código, abrir Studio, Kernel ni Builder.",
    "Sí puedo convertir lo que necesitas en una solicitud clara para el equipo técnico o en una tarea de negocio.",
  ].join("\n\n");
}

function deterministicCustomerAnswer(message: string, snapshot: FlowlyContextSnapshot, intent: FlowlyBrainResponse["intent"]) {
  if (intent === "hoy") {
    return [
      "Para hoy empezaría por 3 prioridades:",
      "1. Revisa clientes o leads sin seguimiento y crea una tarea de contacto.",
      "2. Comprueba presupuestos o facturas pendientes para no dejar dinero parado.",
      "3. Haz una acción comercial rápida: WhatsApp, llamada o recordatorio.",
      "Cuando conectemos datos reales de CRM/facturación/agenda, te lo ordenaré con nombres, importes y horas exactas.",
    ].join("\n");
  }

  if (intent === "ventas" || intent === "clientes") {
    return [
      "Mi recomendación comercial es sencilla:",
      "1. Prioriza clientes sin seguimiento reciente.",
      "2. Recupera presupuestos abiertos.",
      "3. Prepara un WhatsApp breve para leads calientes.",
      "Puedo convertirlo en una misión diaria con XP si quieres.",
    ].join("\n");
  }

  if (intent === "facturacion") {
    return [
      "En facturación revisaría primero vencidas e importes altos.",
      "Después prepararía recordatorios de cobro y una tarea para revisar ingresos/gastos del día.",
    ].join("\n");
  }

  return [
    `Estoy contigo en ${snapshot.area}.`,
    "He preparado contexto, conocimiento y un plan de acción antes de responder.",
    "Puedo ayudarte con tareas, objetivos, recomendaciones, clientes, ventas, facturas, WhatsApp o documentos.",
  ].join("\n");
}

function deterministicArchitectAnswer(message: string, tools: FlowlyBrainToolResult[], intent: FlowlyBrainResponse["intent"]) {
  const analyzer = tools.find((tool) => tool.id === "project_analyzer");
  const summary = analyzer?.summary || "Analyzer preparado.";

  if (intent === "mejorar_modulo") {
    return [
      "He entendido que quieres mejorar un módulo existente, no crear uno nuevo.",
      summary,
      "El siguiente paso correcto es generar una propuesta de cambios con impacto antes de tocar archivos.",
      "Puedo preparar el plan para Builder cuando lo apruebes.",
    ].join("\n");
  }

  if (intent === "crear_modulo") {
    return [
      "He entendido que quieres crear un módulo nuevo.",
      "Primero diseñaré el blueprint, revisaré duplicidades con Kernel/Docs y después lo enviaré al Builder bajo aprobación.",
    ].join("\n");
  }

  return [
    "Estoy en modo Brain Arquitecto.",
    summary,
    `Petición: ${message.slice(0, 220)}${message.length > 220 ? "..." : ""}`,
  ].join("\n");
}

function buildSystemPrompt(params: {
  mode: FlowlyBrainMode;
  snapshot: FlowlyContextSnapshot;
  intent: FlowlyBrainResponse["intent"];
  tools: FlowlyBrainToolResult[];
  extraContext?: Record<string, unknown>;
}) {
  const { mode, snapshot, intent, tools, extraContext } = params;
  return [
    mode === "arquitecto"
      ? "Eres Flowly Brain en modo Arquitecto. Ayudas al fundador/desarrollador a analizar, diseñar, modificar y construir Flowly con aprobación."
      : "Eres Flowly Brain en modo Cliente. Ayudas a usuarios de negocio dentro del panel, sin exponer herramientas internas.",
    "Responde siempre en español claro, concreto y útil.",
    "No uses respuestas genéricas si puedes dar una recomendación práctica.",
    "Primero razona con el contexto y herramientas, luego responde.",
    mode === "cliente"
      ? "PROHIBIDO mencionar Studio, Kernel, Builder, Generator, código, APIs, SQL o arquitectura interna. Si el usuario pide crear/modificar el sistema, redirígelo a una solicitud para el equipo técnico."
      : "Puedes hablar de Studio, Kernel, Builder, Analyzer, código, rutas y arquitectura, pero no apliques cambios sin aprobación.",
    "Máximo 10 líneas salvo que el usuario pida detalle.",
    `Intención detectada: ${intent}`,
    "Contexto:",
    JSON.stringify(snapshot),
    "Herramientas ejecutadas:",
    JSON.stringify(tools.map((tool) => ({ id: tool.id, label: tool.label, summary: tool.summary, data: tool.data })).slice(0, 7)),
    "Estado vivo del Companion / voz / memoria:",
    JSON.stringify(extraContext || {}),
  ].join("\n");
}

async function callLLM(params: {
  message: string;
  mode: FlowlyBrainMode;
  snapshot: FlowlyContextSnapshot;
  intent: FlowlyBrainResponse["intent"];
  tools: FlowlyBrainToolResult[];
  conversation: FlowlyBrainMessage[];
  extraContext?: Record<string, unknown>;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.FLOWLY_AI_MODEL || "gpt-4o-mini",
      temperature: 0.25,
      max_tokens: 650,
      messages: [
        { role: "system", content: buildSystemPrompt(params) },
        ...params.conversation.slice(-8).map((item) => ({ role: item.role, content: item.content })),
        { role: "user", content: params.message },
      ],
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    console.warn("Flowly Brain LLM warning:", data?.error?.message || data);
    return null;
  }

  const content = data?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : null;
}

export async function runFlowlyBrain(request: FlowlyBrainRequest): Promise<FlowlyBrainResponse> {
  const snapshot = getFlowlyContextSnapshot(request.pathname);
  const mode: FlowlyBrainMode = snapshot.mode === "arquitecto" ? "arquitecto" : "cliente";
  const intent = detectBrainIntent(request.message);
  const blockedInternalAction = mode === "cliente" && isCustomerForbiddenRequest(request.message);

  const tools: FlowlyBrainToolResult[] = [
    toolContext(snapshot),
    toolPermissionGuard(mode, blockedInternalAction),
    toolBusinessContext(snapshot, intent),
    toolKnowledge(request.message),
  ];

  if (mode === "arquitecto" || intent === "mejorar_modulo" || intent === "crear_modulo") {
    tools.push(toolAnalyzer(request.message));
    tools.push(await toolProjectGraph(request.message));
    tools.push(toolKernel(request.message));
  }

  tools.push(toolActionPlanner(intent, mode, blockedInternalAction));
  const plan = buildPlan(intent, mode, blockedInternalAction);

  if (blockedInternalAction) {
    return {
      answer: customerBoundaryAnswer(),
      mode,
      intent,
      usedAI: false,
      blockedInternalAction,
      stage: "bloqueado",
      tools,
      plan,
      suggestedActions: suggestedActions(intent, mode),
    };
  }

  const aiAnswer = await callLLM({
    message: request.message,
    mode,
    snapshot,
    intent,
    tools,
    conversation: request.conversation || [],
    extraContext: request.extraContext,
  });

  const answer = aiAnswer || (mode === "arquitecto"
    ? deterministicArchitectAnswer(request.message, tools, intent)
    : deterministicCustomerAnswer(request.message, snapshot, intent));

  return {
    answer,
    mode,
    intent,
    usedAI: Boolean(aiAnswer),
    blockedInternalAction,
    stage: "respuesta",
    tools,
    plan,
    suggestedActions: suggestedActions(intent, mode),
  };
}
