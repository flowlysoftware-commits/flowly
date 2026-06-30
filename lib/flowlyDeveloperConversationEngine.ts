export type DeveloperConversationMessage = {
  role: "user" | "brain" | "assistant" | "system";
  text?: string;
  content?: string;
};

export type DeveloperConversationDecision = {
  conversationOnly: boolean;
  intent:
    | "new_task"
    | "ask_current_plan"
    | "refine_current_plan"
    | "approve_current_plan"
    | "cancel_current_plan"
    | "status_question"
    | "small_talk";
  reply?: string;
  mergedInstruction?: string;
  shouldRun?: boolean;
};

type MinimalPlan = {
  ok?: boolean;
  instruction?: string;
  risk?: string;
  humanChangePlan?: Array<{
    title?: string;
    description?: string;
    userImpact?: string;
    safetyNote?: string;
  }>;
  proposedFiles?: Array<{ path?: string; message?: string }>;
  projectMap?: {
    modules?: string[];
    candidates?: Array<{ path?: string; reason?: string; role?: string }>;
  };
  preflight?: { ok?: boolean; blockedReason?: string };
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function textOf(message: DeveloperConversationMessage) {
  return String(message.text || message.content || "").trim();
}

function hasAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function describeHumanChanges(plan: MinimalPlan) {
  const changes = (plan.humanChangePlan || []).filter((item) => item.title || item.description);
  if (!changes.length) return "Todavía no tengo una modificación de código suficientemente segura. Prefiero decirte eso antes que inventarme un cambio o crear archivos duplicados.";

  return changes
    .slice(0, 5)
    .map((item, index) => {
      const title = item.title || `Cambio ${index + 1}`;
      const description = item.description || "Aplicaré un ajuste pequeño y revisable sobre la pieza existente.";
      const impact = item.userImpact ? `\n   Impacto para el usuario: ${item.userImpact}` : "";
      const safety = item.safetyNote ? `\n   Seguridad: ${item.safetyNote}` : "";
      return `${index + 1}. ${title}\n   ${description}${impact}${safety}`;
    })
    .join("\n\n");
}

function describeFiles(plan: MinimalPlan) {
  const files = (plan.proposedFiles || []).filter((file) => file.path);
  if (!files.length) return "No hay archivos aprobables todavía.";
  return files
    .slice(0, 6)
    .map((file) => `- ${file.path}${file.message ? `: ${file.message}` : ""}`)
    .join("\n");
}

function describeCandidates(plan: MinimalPlan) {
  const candidates = (plan.projectMap?.candidates || []).filter((file) => file.path);
  if (!candidates.length) return "No tengo candidatos técnicos claros todavía.";
  return candidates
    .slice(0, 5)
    .map((file) => `- ${file.path}${file.role ? ` (${file.role})` : ""}`)
    .join("\n");
}

function buildCurrentPlanAnswer(question: string, plan: MinimalPlan) {
  const moduleName = plan.projectMap?.modules?.[0] || "Flowly";
  const lowered = normalize(question);

  if (hasAny(lowered, ["que le vas", "que vas", "que vas a crear", "que le vas a crear", "modificaciones", "cambios", "hacer exactamente", "explicame", "explica"])) {
    return [
      `Te lo concreto. No voy a “crear por crear”; voy a trabajar sobre ${moduleName} reutilizando lo que ya existe.`,
      "",
      describeHumanChanges(plan),
      "",
      "Archivos técnicos candidatos:",
      describeFiles(plan),
      "",
      plan.preflight?.ok === false
        ? `Ahora mismo NO ejecutaría todavía porque el preflight está bloqueado: ${plan.preflight.blockedReason || "falta seguridad en el cambio"}.`
        : "Si lo apruebas, lo haré en una rama nueva y abriré un Pull Request. No tocaré main directamente.",
    ].join("\n");
  }

  if (hasAny(lowered, ["por que", "porque", "riesgo", "seguro", "romper", "produccion"])) {
    return [
      `El riesgo estimado es ${plan.risk || "pendiente"}.`,
      "",
      "Lo mantengo seguro por tres motivos:",
      "1. Reutilizo archivos existentes antes de crear nada nuevo.",
      "2. El plan aprobado queda congelado: al ejecutar no debería inventar otro plan distinto.",
      "3. La ejecución va a rama y Pull Request, no a producción directa.",
      "",
      "Candidatos principales que he detectado:",
      describeCandidates(plan),
    ].join("\n");
  }

  return [
    "Sigo dentro del mismo plan, no estoy empezando de cero.",
    "",
    `Objetivo actual: ${plan.instruction || "mejorar Flowly"}`,
    "",
    "Propuesta resumida:",
    describeHumanChanges(plan),
    "",
    "Puedes pedirme que lo simplifique, que no toque una parte concreta, o aprobarlo para crear el Pull Request.",
  ].join("\n");
}

export function decideDeveloperConversation(params: {
  instruction: string;
  currentPlan?: MinimalPlan | null;
  history?: DeveloperConversationMessage[];
}): DeveloperConversationDecision {
  const instruction = params.instruction.trim();
  const text = normalize(instruction);
  const currentPlan = params.currentPlan && params.currentPlan.ok ? params.currentPlan : null;
  const recentHistory = (params.history || []).slice(-8).map(textOf).filter(Boolean).join("\n");
  const hasSession = Boolean(currentPlan || recentHistory);

  if (!instruction) {
    return { conversationOnly: true, intent: "small_talk", reply: "Dime qué quieres mejorar y lo tratamos como una sesión de trabajo, no como un prompt aislado." };
  }

  if (hasAny(text, ["cancelar", "cancela", "olvida", "empezar de cero", "empecemos de cero", "limpia", "reset"])) {
    return {
      conversationOnly: true,
      intent: "cancel_current_plan",
      reply: "De acuerdo. Cancelo mentalmente el plan actual. Escribe la nueva petición y la investigaré desde cero antes de proponer cambios.",
    };
  }

  if (currentPlan && hasAny(text, ["adelante", "ok", "vale", "aprobado", "apruebo", "hazlo", "ejecuta", "crea el pr", "crear el pr"])) {
    return {
      conversationOnly: true,
      intent: "approve_current_plan",
      shouldRun: true,
      reply: "Perfecto. El plan actual está aprobado. Pulsa “Aplicar cambios” y ejecutaré exactamente ese plan congelado en una rama segura.",
    };
  }

  if (currentPlan && hasAny(text, ["que", "cual", "como", "donde", "por que", "porque", "explica", "exactamente", "modificaciones", "cambios", "crear", "tocar", "hacer"])) {
    return {
      conversationOnly: true,
      intent: "ask_current_plan",
      reply: buildCurrentPlanAnswer(instruction, currentPlan),
    };
  }

  if (currentPlan && hasAny(text, ["no toques", "sin tocar", "mejor", "cambia", "añade", "quita", "hazlo mas", "hazlo más", "prefiero", "quiero que"])) {
    const mergedInstruction = [
      currentPlan.instruction || "",
      "",
      "Corrección del usuario sobre el plan actual:",
      instruction,
    ].filter(Boolean).join("\n");

    return {
      conversationOnly: false,
      intent: "refine_current_plan",
      mergedInstruction,
      reply: "Entendido. No voy a ejecutar el plan anterior tal cual. Voy a rehacer la propuesta incorporando esta corrección y volveré a explicarte exactamente qué cambiaría antes de aprobar.",
    };
  }

  if (hasSession && hasAny(text, ["continua", "continúa", "sigue", "retoma", "lo de antes", "eso", "este cambio"])) {
    if (currentPlan) {
      return {
        conversationOnly: true,
        intent: "status_question",
        reply: buildCurrentPlanAnswer("explícame el plan actual", currentPlan),
      };
    }
  }

  return { conversationOnly: false, intent: "new_task" };
}
