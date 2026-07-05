import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { callFlowlyOpenAI } from "@/lib/flowlyOpenAI";
import { buildFlowlyProjectSnapshot, summarizeFlowlyProjectSnapshot } from "@/lib/flowlyProjectReader";

export type DeveloperChatMessage = {
  role: "user" | "brain" | "assistant" | "system";
  text: string;
};

export type DeveloperIntelligenceDecision = {
  ok: true;
  engine: "developer_intelligence_v1";
  model: string;
  intent: "new_task" | "question" | "refinement" | "approval" | "correction" | "continue";
  shouldPlan: boolean;
  refinedInstruction: string;
  directReply: string;
  currentObjective: string;
  productChangePlan: Array<{
    title: string;
    description: string;
    userImpact: string;
    safetyNote: string;
  }>;
  thinkingTrace: string[];
  constraints: string[];
  confidence: number;
  usedAI: boolean;
};

type IntelligenceInput = {
  instruction: string;
  conversationId?: string;
  history?: DeveloperChatMessage[];
  currentPlan?: unknown;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getRecentHistory(history?: DeveloperChatMessage[]) {
  return (history || [])
    .filter((item) => item && typeof item.text === "string" && item.text.trim())
    .slice(-12)
    .map((item) => ({ role: item.role, text: item.text.slice(0, 1800) }));
}

function summarizeApprovedPlan(currentPlan: unknown) {
  if (!currentPlan || typeof currentPlan !== "object") return null;
  const plan = currentPlan as Record<string, unknown>;
  return {
    instruction: typeof plan.instruction === "string" ? plan.instruction : "",
    summary: typeof plan.summary === "string" ? plan.summary : "",
    risk: typeof plan.risk === "string" ? plan.risk : "",
    humanChangePlan: Array.isArray(plan.humanChangePlan) ? plan.humanChangePlan.slice(0, 8) : [],
    proposedFiles: Array.isArray(plan.proposedFiles)
      ? plan.proposedFiles.slice(0, 12).map((file) => {
          if (!file || typeof file !== "object") return file;
          const item = file as Record<string, unknown>;
          return { path: item.path, message: item.message };
        })
      : [],
  };
}

function fallbackDecision(input: IntelligenceInput): DeveloperIntelligenceDecision {
  const text = normalize(input.instruction);
  const current = summarizeApprovedPlan(input.currentPlan);
  const hasPlan = Boolean(current?.summary || current?.instruction);
  const isQuestion = /^(que|qué|como|cómo|por que|por qué|dime|explica|cual|cu[aá]l|y\b)/.test(text) || text.includes("?");
  const isApproval = /^(ok|vale|adelante|hazlo|aplica|ejecuta|si|sí)\b/.test(text);
  const isRefinement = /(mejor|cambia|quita|pon|anade|añade|no toques|no cambies|en vez)/.test(text);
  const shouldPlan = !hasPlan || (!isQuestion && !isApproval);
  const intent: DeveloperIntelligenceDecision["intent"] = isApproval ? "approval" : isQuestion && hasPlan ? "question" : isRefinement && hasPlan ? "refinement" : "new_task";

  const currentObjective = hasPlan ? current?.instruction || input.instruction : input.instruction;
  const planItems = Array.isArray(current?.humanChangePlan) && current.humanChangePlan.length ? current.humanChangePlan : [];
  const directReply = hasPlan && isQuestion
    ? `Sobre el plan actual: ${current?.summary || current?.instruction}. En lenguaje normal, mi objetivo es aplicar estos cambios: ${planItems.map((item: any) => item?.title).filter(Boolean).slice(0, 4).join("; ") || "ajustar la parte indicada sin tocar módulos no relacionados"}. No ejecutaré nada hasta que me des aprobación clara.`
    : "Voy a tratar esto como una sesión de ingeniería: primero entenderé el objetivo, reutilizaré la arquitectura existente, prepararé una propuesta en lenguaje normal y solo después pediré aprobación.";

  return {
    ok: true,
    engine: "developer_intelligence_v1",
    model: "fallback-rules",
    intent,
    shouldPlan,
    refinedInstruction: input.instruction,
    directReply,
    currentObjective,
    productChangePlan: [],
    thinkingTrace: [
      hasPlan ? "Hay un plan activo en la sesión." : "No hay plan activo; se tratará como nueva tarea.",
      isQuestion ? "El mensaje parece una pregunta; responderé sin regenerar código si existe contexto suficiente." : "El mensaje parece una tarea o ajuste.",
      "Mantendré Brain, Memory, Executor y QA como fuentes únicas de verdad.",
    ],
    constraints: ["No tocar main directamente", "No duplicar motores", "No crear PR sin aprobación"],
    confidence: hasPlan ? 0.78 : 0.66,
    usedAI: false,
  };
}

export async function thinkWithDeveloperIntelligence(input: IntelligenceInput): Promise<DeveloperIntelligenceDecision> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.FLOWLY_DEVELOPER_MODEL || process.env.FLOWLY_AI_MODEL || "gpt-4o-mini";
  const fallback = fallbackDecision(input);
  if (!apiKey) return fallback;

  const currentPlan = summarizeApprovedPlan(input.currentPlan);
  const history = getRecentHistory(input.history);
  const snapshot = await buildFlowlyProjectSnapshot().catch(() => null);

  const system = [
    "Eres Flowly Developer Intelligence Engine, el CTO digital de Flowly OS.",
    "No eres un chatbot genérico. Eres una capa cognitiva que decide si hay que responder, preguntar, refinar un plan o lanzar planificación técnica.",
    "Debes hablar en español, con tono de ingeniero senior: claro, directo y natural.",
    "Nunca prometas tocar producción. Siempre rama + Pull Request + revisión.",
    "No dupliques Brain, Memory, Heart, Executor, QA ni runtimes. Reutiliza la arquitectura existente.",
    "Grounding obligatorio: usa el Project Snapshot. Si indica Next.js App Router, no menciones index.html, about.html, blog.html, header.php ni archivos genéricos.",
    "Para SEO/metadata/Open Graph en Flowly menciona únicamente rutas reales del snapshot como app/layout.tsx, app/page.tsx, app/sitemap.ts, app/robots.ts, app/manifest.ts, app/opengraph-image.tsx, app/twitter-image.tsx, app/icon.png o public/favicon.ico cuando existan.",
    "Cuando el usuario pregunte algo sobre el plan actual, responde la pregunta directamente. No digas solo 'voy a investigar'.",
    "Cuando propongas cambios, explícalos en lenguaje de producto: qué verá el usuario, cómo cambiará el flujo, qué no tocarás.",
    "Devuelve SOLO JSON válido con este esquema exacto: {\"intent\":\"new_task|question|refinement|approval|correction|continue\",\"shouldPlan\":boolean,\"refinedInstruction\":string,\"directReply\":string,\"currentObjective\":string,\"productChangePlan\":[{\"title\":string,\"description\":string,\"userImpact\":string,\"safetyNote\":string}],\"thinkingTrace\":[string],\"constraints\":[string],\"confidence\":number}",
  ].join("\n");

  const ai = await callFlowlyOpenAI({
    purpose: "developer",
    system,
    user: JSON.stringify({
      instruction: input.instruction,
      conversationId: input.conversationId || null,
      history,
      currentPlan,
      projectSnapshot: snapshot
        ? {
            framework: snapshot.framework,
            packageInfo: snapshot.packageInfo,
            counts: snapshot.counts,
            keyPaths: snapshot.keyPaths,
            publicRoutes: snapshot.publicRoutes.slice(0, 80),
            privateRoutes: snapshot.privateRoutes.slice(0, 80),
            apiRoutes: snapshot.apiRoutes.slice(0, 80),
            seoRelevantPaths: snapshot.seoRelevantPaths,
            notes: snapshot.notes,
            warnings: snapshot.warnings,
            summary: summarizeFlowlyProjectSnapshot(snapshot),
          }
        : null,
      requiredBehavior: [
        "Distinguir estado de trabajo y respuesta final.",
        "Si es pregunta, responder con contenido útil sin regenerar plan salvo que sea necesario.",
        "Si es nueva tarea o refinamiento, construir instrucción refinada para el Pipeline.",
      ],
    }),
    temperature: 0.15,
    maxOutputTokens: 1800,
    expectJson: true,
  });

  if (!ai.ok || !ai.text.trim()) return fallback;
  const content = ai.text;

  const parsed = safeJsonParse<Partial<DeveloperIntelligenceDecision>>(content);
  if (!parsed) return fallback;

  return {
    ok: true,
    engine: "developer_intelligence_v1",
    model,
    intent: parsed.intent || fallback.intent,
    shouldPlan: typeof parsed.shouldPlan === "boolean" ? parsed.shouldPlan : fallback.shouldPlan,
    refinedInstruction: typeof parsed.refinedInstruction === "string" && parsed.refinedInstruction.trim() ? parsed.refinedInstruction.trim() : input.instruction,
    directReply: typeof parsed.directReply === "string" && parsed.directReply.trim() ? parsed.directReply.trim() : fallback.directReply,
    currentObjective: typeof parsed.currentObjective === "string" && parsed.currentObjective.trim() ? parsed.currentObjective.trim() : fallback.currentObjective,
    productChangePlan: Array.isArray(parsed.productChangePlan)
      ? parsed.productChangePlan
          .filter((item) => item && typeof item.title === "string" && typeof item.description === "string")
          .slice(0, 6)
          .map((item) => ({
            title: String(item.title),
            description: String(item.description),
            userImpact: String(item.userImpact || "El cambio será visible y revisable antes del merge."),
            safetyNote: String(item.safetyNote || "Se ejecutará en rama segura y Pull Request."),
          }))
      : fallback.productChangePlan,
    thinkingTrace: Array.isArray(parsed.thinkingTrace) ? parsed.thinkingTrace.map(String).slice(0, 8) : fallback.thinkingTrace,
    constraints: Array.isArray(parsed.constraints) ? parsed.constraints.map(String).slice(0, 8) : fallback.constraints,
    confidence: typeof parsed.confidence === "number" ? Math.max(0, Math.min(1, parsed.confidence)) : fallback.confidence,
    usedAI: true,
  };
}

export async function logDeveloperConversationEvent(params: {
  conversationId?: string;
  role: "user" | "assistant" | "system";
  content: string;
  intent?: string;
  details?: unknown;
}) {
  if (!params.conversationId) return;
  try {
    await supabaseAdmin.from("flowly_developer_conversation_messages").insert({
      conversation_id: params.conversationId,
      role: params.role,
      content: params.content,
      intent: params.intent || null,
      details: params.details || null,
    });
  } catch {
    // La memoria conversacional nunca debe bloquear Developer.
  }
}
