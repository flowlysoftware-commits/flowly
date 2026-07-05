import { callFlowlyOpenAI } from "@/lib/flowlyOpenAI";
import { buildCertificationFailureReply, buildFlowCertificationPrompt, certifyFlowReasoningResponse, type FlowCertificationResult } from "@/lib/flowlyCertificationEngine";
import type { FlowlyIntelligenceContext } from "@/lib/flowlyIntelligenceContext";
import type { FlowOrchestratorIntent, FlowOrchestratorMode, FlowOrchestratorEngineName } from "@/lib/flowlyOrchestrator";

export type FlowReasoningStage = {
  id: "intent" | "context" | "architect" | "critic" | "final" | "certification";
  label: string;
  status: "done" | "fallback";
  summary: string;
};

export type FlowReasoningPipelineInput = {
  instruction: string;
  conversationId?: string;
  history?: Array<{ role?: string; text?: string }>;
  currentPlan?: unknown;
  mode: FlowOrchestratorMode;
  intent: FlowOrchestratorIntent;
  guardrails: string[];
  activeEngines: FlowOrchestratorEngineName[];
  blockedEngines: FlowOrchestratorEngineName[];
  context: FlowlyIntelligenceContext;
};

export type FlowReasoningPipelineResult = {
  ok: true;
  engine: "flow_reasoning_pipeline_v1";
  usedAI: boolean;
  model: string;
  reply: string;
  draft: string;
  critique: string;
  stages: FlowReasoningStage[];
  certification?: FlowCertificationResult;
};

function trimText(value: string, limit: number) {
  const clean = value.replace(/\u0000/g, "").trim();
  return clean.length > limit ? `${clean.slice(0, limit)}\n\n[Contenido recortado por Flow Reasoning Pipeline]` : clean;
}

function recentHistory(history?: Array<{ role?: string; text?: string }>) {
  return (history || [])
    .filter((item) => item && typeof item.text === "string" && item.text.trim())
    .slice(-12)
    .map((item) => ({ role: item.role || "user", text: trimText(item.text || "", 1200) }));
}

function contextPayload(input: FlowReasoningPipelineInput) {
  return {
    instruction: input.instruction,
    conversationId: input.conversationId || null,
    mode: input.mode,
    intent: input.intent,
    activeEngines: input.activeEngines,
    blockedEngines: input.blockedEngines,
    guardrails: input.guardrails,
    currentPlan: input.currentPlan || null,
    recentHistory: recentHistory(input.history),
    contextSummary: input.context.contextSummary,
    projectSummary: input.context.projectSummary
      ? {
          totalFiles: input.context.projectSummary.totalFiles,
          routes: input.context.projectSummary.routes,
          apiRoutes: input.context.projectSummary.apiRoutes,
          components: input.context.projectSummary.components,
          modules: input.context.projectSummary.modules?.slice(0, 14),
        }
      : null,
    projectSnapshot: input.context.projectSnapshot
      ? {
          framework: input.context.projectSnapshot.framework,
          packageInfo: input.context.projectSnapshot.packageInfo,
          counts: input.context.projectSnapshot.counts,
          keyPaths: input.context.projectSnapshot.keyPaths,
          publicRoutes: input.context.projectSnapshot.publicRoutes.slice(0, 80),
          privateRoutes: input.context.projectSnapshot.privateRoutes.slice(0, 80),
          apiRoutes: input.context.projectSnapshot.apiRoutes.slice(0, 80),
          seoRelevantPaths: input.context.projectSnapshot.seoRelevantPaths,
          notes: input.context.projectSnapshot.notes,
          warnings: input.context.projectSnapshot.warnings,
        }
      : null,
    projectSnapshotText: trimText(input.context.projectSnapshotText || "", 9000),
    docsSources: input.context.sources.slice(0, 18),
    docsContext: trimText(input.context.docsContext, 26000),
    certificationContract: buildFlowCertificationPrompt(input),
    warnings: input.context.warnings,
  };
}

function modeInstructions(mode: FlowOrchestratorMode) {
  if (mode === "audit") {
    return [
      "El usuario ha pedido auditoría. Debes entregar una auditoría real, amplia y crítica.",
      "No conviertas la auditoría en plan de PR. No propongas ejecutar ahora.",
      "Cubre solo las áreas que puedas justificar con evidencias reales del contexto; si un área no tiene evidencia, márcala como no certificada.",
      "No uses una plantilla genérica. La auditoría debe citar archivos/docs/rutas reales y terminar con veredicto Flow Certification.",
    ].join("\n");
  }

  if (mode === "planning") {
    return [
      "El usuario ha pedido planificación. No hagas auditoría completa.",
      "Entrega un plan pequeño y accionable, con cambios en lenguaje de producto, archivos candidatos, riesgos y qué NO tocarás.",
      "Si el usuario prohibió código/PR/ejecución, no digas que vas a crear rama todavía.",
    ].join("\n");
  }

  if (mode === "diagnostic") {
    return [
      "El usuario ha pedido diagnóstico interno del sistema Developer/Orchestrator.",
      "No hagas auditoría CTO de Flowly entero.",
      "Explica causa probable, regla que falló, diseño correcto y siguiente corrección pequeña.",
    ].join("\n");
  }

  if (mode === "conversation") {
    return "Continúa la misión o conversación activa sin reiniciar contexto ni auditar de nuevo.";
  }

  return "Responde como CTO de Flowly: claro, directo, contextual y sin proponer ejecución si no se ha pedido.";
}

function fallbackReply(input: FlowReasoningPipelineInput) {
  if (input.mode === "planning") {
    return [
      "He entendido que esto es PLANIFICACIÓN, no ejecución.",
      "No voy a modificar código, crear rama ni abrir PR todavía.",
      "Prepararía el plan así:",
      "1. Definir el resultado visible que queremos conseguir.",
      "2. Revisar los archivos públicos relacionados y la metadata actual.",
      "3. Proponer cambios pequeños y verificables.",
      "4. Indicar riesgos y qué no se tocará.",
      "5. Esperar aprobación explícita antes de ejecutar.",
    ].join("\n");
  }

  if (input.mode === "diagnostic") {
    return [
      "He entendido que esto es DIAGNÓSTICO INTERNO.",
      "No repetiré auditorías ni activaré Executor.",
      "El fallo suele venir de clasificar por palabras sueltas en lugar de respetar negaciones, contexto y objetivo anterior.",
      "La corrección debe pasar por Intent Engine + guardrails: primero se clasifica la intención y después se decide qué motores se activan.",
    ].join("\n");
  }

  if (input.mode === "audit") {
    return [
      "He entendido que esto es AUDITORÍA completa.",
      "Executor, GitHub y PR quedan bloqueados.",
      "La auditoría debe revisar arquitectura, diseño, UX, conversión, SEO, performance, código, Developer, Companion y roadmap antes de cualquier cambio.",
    ].join("\n");
  }

  return "He entendido la petición y responderé sin activar ejecución. Si quieres que lo convierta en plan, dime la fase exacta.";
}

async function runArchitectPass(input: FlowReasoningPipelineInput) {
  const system = [
    "Eres Flow, CTO digital y arquitecto principal de Flowly OS.",
    "No eres un asistente de programación. Piensas como responsable del producto, arquitectura, negocio y mantenimiento a 10 años.",
    "Usas el contexto aportado por Flowly: Docs, Brain, Project Graph, Project Snapshot, historial y guardrails.",
    "GROUNDING OBLIGATORIO: este proyecto es Next.js App Router si el Project Snapshot lo indica. No menciones index.html, about.html, blog.html, header.php ni rutas genéricas de otros frameworks.",
    "Solo puedes mencionar archivos que aparezcan en projectSnapshot.keyPaths, projectSnapshot.seoRelevantPaths, projectSnapshot.publicRoutes, projectSnapshot.privateRoutes, projectSnapshot.apiRoutes, docsSources o Project Graph.",
    "Si no tienes archivos verificados para una propuesta técnica, dilo claramente y pide confirmación. No rellenes huecos con ejemplos genéricos.",
    "Para SEO/metadata/Open Graph en Flowly, prioriza archivos reales como app/layout.tsx, app/page.tsx, app/sitemap.ts, app/robots.ts, app/manifest.ts, app/opengraph-image.tsx, app/twitter-image.tsx, app/icon.png o public/favicon.ico cuando existan en el snapshot.",
    "Nunca inventes que has ejecutado código. Nunca propongas PR si el modo no lo permite.",
    modeInstructions(input.mode),
    buildFlowCertificationPrompt(input),
    "Responde en español profesional, con detalle útil y sin relleno.",
  ].join("\n\n");

  const ai = await callFlowlyOpenAI({
    purpose: "developer",
    system,
    user: JSON.stringify(contextPayload(input)),
    temperature: input.mode === "audit" ? 0.25 : 0.16,
    maxOutputTokens: input.mode === "audit" ? 4200 : 2600,
  });

  return ai.ok && ai.text.trim() ? { text: ai.text.trim(), model: ai.model, usedAI: true } : { text: fallbackReply(input), model: ai.model, usedAI: false };
}

async function runCriticPass(input: FlowReasoningPipelineInput, draft: string) {
  const system = [
    "Eres el Critic Engine de Flowly OS.",
    "Tu tarea es revisar la respuesta del arquitecto antes de entregarla al usuario.",
    "Detecta si incumple intención, si es demasiado genérica, si propone ejecución prohibida, si repite auditorías cuando se pidió plan, o si le falta concreción.",
    "Detecta grounding débil: menciones a index.html, about.html, blog.html, header.php o archivos no verificados por Project Snapshot/Project Graph.",
    "En modo audit, rechaza respuestas tipo checklist si no citan fuentes reales, si hablan de SEO sin relación con el target, o si no terminan con veredicto de certificación.",
    "Devuelve una crítica breve y accionable en español. No reescribas toda la respuesta.",
  ].join("\n");

  const ai = await callFlowlyOpenAI({
    purpose: "developer",
    system,
    user: JSON.stringify({
      instruction: input.instruction,
      mode: input.mode,
      intent: input.intent,
      guardrails: input.guardrails,
      blockedEngines: input.blockedEngines,
      certificationContract: buildFlowCertificationPrompt(input),
      draft: trimText(draft, 10000),
    }),
    temperature: 0.05,
    maxOutputTokens: 900,
  });

  return ai.ok && ai.text.trim() ? ai.text.trim() : "Crítica fallback: comprobar que la respuesta respeta el modo, no activa motores bloqueados y aporta un siguiente paso claro.";
}

async function runFinalPass(input: FlowReasoningPipelineInput, draft: string, critique: string) {
  const system = [
    "Eres Flow, CTO digital de Flowly OS, en la pasada final de respuesta.",
    "Reescribe la respuesta final usando el borrador, la crítica y el contexto.",
    "Reglas estrictas:",
    "- Respeta exactamente el modo clasificado.",
    "- Si mode=audit, entrega auditoría certificable basada en evidencias; no PR.",
    "- Si mode=planning, entrega plan pequeño; no auditoría completa.",
    "- Si mode=diagnostic, diagnostica el fallo; no audites Flowly entero.",
    "- Si hay motores bloqueados, no digas que se usarán.",
    "- Grounding obligatorio: no menciones index.html, about.html, blog.html, header.php ni archivos genéricos si el Project Snapshot indica Next.js App Router.",
    "- Para SEO/metadata/Open Graph, usa únicamente rutas reales del Project Snapshot/Project Graph; si no existen, dilo.",
    "- Cumple el Flow Certification Contract: fuentes reales, hallazgos con evidencia, límites y veredicto.",
    "- Mantén tono de ingeniero senior, claro y directo.",
  ].join("\n");

  const ai = await callFlowlyOpenAI({
    purpose: "developer",
    system,
    user: JSON.stringify({
      payload: contextPayload(input),
      draft: trimText(draft, 14000),
      critique: trimText(critique, 4000),
      certificationContract: buildFlowCertificationPrompt(input),
    }),
    temperature: 0.08,
    maxOutputTokens: input.mode === "audit" ? 4600 : 2800,
  });

  return ai.ok && ai.text.trim() ? ai.text.trim() : draft;
}

export async function runFlowReasoningPipeline(input: FlowReasoningPipelineInput): Promise<FlowReasoningPipelineResult> {
  const stages: FlowReasoningStage[] = [
    { id: "intent", label: "Intent Engine", status: "done", summary: `Modo ${input.mode} · intención ${input.intent}` },
    { id: "context", label: "Context Builder", status: "done", summary: `${input.context.sources.length} fuentes · ${input.context.projectSummary?.totalFiles || 0} archivos mapeados` },
  ];

  const architect = await runArchitectPass(input);
  stages.push({ id: "architect", label: "Architect Pass", status: architect.usedAI ? "done" : "fallback", summary: architect.usedAI ? "OpenAI generó el primer razonamiento." : "Fallback local por falta de respuesta OpenAI." });

  let critique = "";
  let reply = architect.text;

  if (architect.usedAI) {
    critique = await runCriticPass(input, architect.text);
    stages.push({ id: "critic", label: "Critic Pass", status: "done", summary: "Respuesta revisada antes de entregarse." });
    reply = await runFinalPass(input, architect.text, critique);
    stages.push({ id: "final", label: "Final Pass", status: "done", summary: "Respuesta final ajustada a intención y guardrails." });
  } else {
    critique = "Sin Critic Pass porque OpenAI no devolvió borrador útil.";
    stages.push({ id: "critic", label: "Critic Pass", status: "fallback", summary: critique });
    stages.push({ id: "final", label: "Final Pass", status: "fallback", summary: "Se entrega respuesta fallback segura." });
  }

  const certification = certifyFlowReasoningResponse({ ...input, reply });
  stages.push({
    id: "certification",
    label: "Flow Certification",
    status: certification.certified ? "done" : "fallback",
    summary: certification.summary,
  });

  if (!certification.certified && input.mode === "audit") {
    reply = buildCertificationFailureReply({ ...input, reply }, certification);
  }

  return {
    ok: true,
    engine: "flow_reasoning_pipeline_v1",
    usedAI: architect.usedAI,
    model: architect.model,
    reply,
    draft: architect.text,
    critique,
    stages,
    certification,
  };
}
