import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type FlowlyMissionStatus =
  | "planning"
  | "approved"
  | "executing"
  | "failed"
  | "completed"
  | "cancelled";

export type FlowlyMission = {
  id: string;
  conversation_id: string;
  title: string;
  objective: string;
  status: FlowlyMissionStatus;
  current_step?: string | null;
  current_plan?: unknown;
  approved_plan?: unknown;
  branch?: string | null;
  pull_request_url?: string | null;
  pull_request_number?: number | null;
  last_build_log?: string | null;
  last_error?: string | null;
  details?: unknown;
  created_at?: string;
  updated_at?: string;
};

export type FlowlyMissionDirective = {
  hasActiveMission: boolean;
  shouldBypassPlanning: boolean;
  kind:
    | "none"
    | "continue_mission"
    | "fix_active_pr"
    | "explain_active_mission"
    | "block_replan";
  reason: string;
  mission?: FlowlyMission | null;
};

const ACTIVE_STATUSES: FlowlyMissionStatus[] = ["planning", "approved", "executing", "failed"];

function safeConversationId(conversationId?: string) {
  return typeof conversationId === "string" && conversationId.trim().length > 0
    ? conversationId.trim().slice(0, 160)
    : null;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function makeMissionTitle(objective: string) {
  const clean = objective.replace(/\s+/g, " ").trim();
  if (!clean) return "Misión Developer";
  return clean.length > 90 ? `${clean.slice(0, 87)}...` : clean;
}

function parseMission(row: Record<string, unknown>, fallbackConversationId: string): FlowlyMission {
  return {
    id: String(row.id || ""),
    conversation_id: String(row.conversation_id || fallbackConversationId),
    title: String(row.title || "Misión Developer"),
    objective: String(row.objective || ""),
    status: String(row.status || "planning") as FlowlyMissionStatus,
    current_step: typeof row.current_step === "string" ? row.current_step : null,
    current_plan: row.current_plan ?? null,
    approved_plan: row.approved_plan ?? null,
    branch: typeof row.branch === "string" ? row.branch : null,
    pull_request_url: typeof row.pull_request_url === "string" ? row.pull_request_url : null,
    pull_request_number: typeof row.pull_request_number === "number" ? row.pull_request_number : null,
    last_build_log: typeof row.last_build_log === "string" ? row.last_build_log : null,
    last_error: typeof row.last_error === "string" ? row.last_error : null,
    details: row.details ?? null,
    created_at: typeof row.created_at === "string" ? row.created_at : undefined,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

export async function getActiveDeveloperMission(conversationId?: string): Promise<FlowlyMission | null> {
  const id = safeConversationId(conversationId);
  if (!id) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from("flowly_developer_missions")
      .select("*")
      .eq("conversation_id", id)
      .in("status", ACTIVE_STATUSES)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return parseMission(data as Record<string, unknown>, id);
  } catch {
    return null;
  }
}

export async function rememberDeveloperMission(params: {
  conversationId?: string;
  objective: string;
  status?: FlowlyMissionStatus;
  currentStep?: string;
  currentPlan?: unknown;
  approvedPlan?: unknown;
  branch?: string | null;
  pullRequestUrl?: string | null;
  pullRequestNumber?: number | null;
  lastBuildLog?: string | null;
  lastError?: string | null;
  details?: unknown;
}): Promise<FlowlyMission | null> {
  const id = safeConversationId(params.conversationId);
  const objective = params.objective.trim();
  if (!id || !objective) return null;

  const existing = await getActiveDeveloperMission(id);
  const payload = {
    conversation_id: id,
    title: existing?.title || makeMissionTitle(objective),
    objective,
    status: params.status || existing?.status || "planning",
    current_step: params.currentStep || existing?.current_step || "planning",
    current_plan: params.currentPlan ?? existing?.current_plan ?? null,
    approved_plan: params.approvedPlan ?? existing?.approved_plan ?? null,
    branch: params.branch ?? existing?.branch ?? null,
    pull_request_url: params.pullRequestUrl ?? existing?.pull_request_url ?? null,
    pull_request_number: params.pullRequestNumber ?? existing?.pull_request_number ?? null,
    last_build_log: params.lastBuildLog ?? existing?.last_build_log ?? null,
    last_error: params.lastError ?? existing?.last_error ?? null,
    details: params.details ?? existing?.details ?? null,
    updated_at: new Date().toISOString(),
  };

  try {
    const query = existing?.id
      ? supabaseAdmin.from("flowly_developer_missions").update(payload).eq("id", existing.id).select("*").single()
      : supabaseAdmin.from("flowly_developer_missions").insert(payload).select("*").single();

    const { data, error } = await query;
    if (error || !data) return existing || null;
    return parseMission(data as Record<string, unknown>, id);
  } catch {
    return existing || null;
  }
}

export async function updateDeveloperMission(params: {
  conversationId?: string;
  status?: FlowlyMissionStatus;
  currentStep?: string;
  currentPlan?: unknown;
  approvedPlan?: unknown;
  branch?: string | null;
  pullRequestUrl?: string | null;
  pullRequestNumber?: number | null;
  lastBuildLog?: string | null;
  lastError?: string | null;
  details?: unknown;
}) {
  const mission = await getActiveDeveloperMission(params.conversationId);
  if (!mission) return null;

  return rememberDeveloperMission({
    conversationId: mission.conversation_id,
    objective: mission.objective,
    status: params.status || mission.status,
    currentStep: params.currentStep || mission.current_step || undefined,
    currentPlan: params.currentPlan ?? mission.current_plan,
    approvedPlan: params.approvedPlan ?? mission.approved_plan,
    branch: params.branch ?? mission.branch,
    pullRequestUrl: params.pullRequestUrl ?? mission.pull_request_url,
    pullRequestNumber: params.pullRequestNumber ?? mission.pull_request_number,
    lastBuildLog: params.lastBuildLog ?? mission.last_build_log,
    lastError: params.lastError ?? mission.last_error,
    details: params.details ?? mission.details,
  });
}

export async function completeDeveloperMission(conversationId?: string, details?: unknown) {
  return updateDeveloperMission({
    conversationId,
    status: "completed",
    currentStep: "completed",
    details,
  });
}

export function interpretDeveloperMissionInstruction(params: {
  mission?: FlowlyMission | null;
  instruction: string;
}): FlowlyMissionDirective {
  const mission = params.mission || null;
  if (!mission) {
    return {
      hasActiveMission: false,
      shouldBypassPlanning: false,
      kind: "none",
      reason: "No hay misión activa para esta conversación.",
      mission: null,
    };
  }

  const text = normalizeText(params.instruction);
  const asksStatus = /(estado|que\s+queda|donde\s+estamos|resumen|continua|continúa|sigue)/.test(text);
  const asksFix = /(error|build|deploy|vercel|fallo|falla|rojo|corrige|arregla|fix|typescript|type\s+error)/.test(text);
  const asksNewPlan = /(nuevo\s+plan|otra\s+tarea|empezar\s+otra|cambia\s+de\s+tema)/.test(text);
  const hasPr = Boolean(mission.pull_request_url || mission.pull_request_number || mission.branch);

  if (asksNewPlan && mission.status !== "executing") {
    return {
      hasActiveMission: true,
      shouldBypassPlanning: false,
      kind: "continue_mission",
      reason: "El usuario parece pedir una nueva tarea; la misión activa no bloquea planificación si no está ejecutándose.",
      mission,
    };
  }

  if (asksFix && hasPr) {
    return {
      hasActiveMission: true,
      shouldBypassPlanning: true,
      kind: "fix_active_pr",
      reason: "Existe una misión con PR/rama activa y el usuario pide corregir un error de build/deploy. No se debe volver a planificar.",
      mission,
    };
  }

  if (mission.status === "executing" || mission.status === "failed") {
    return {
      hasActiveMission: true,
      shouldBypassPlanning: true,
      kind: asksStatus ? "explain_active_mission" : "block_replan",
      reason: "La misión está en ejecución o fallida. Developer debe continuar/corregir esa misión, no generar un plan nuevo.",
      mission,
    };
  }

  return {
    hasActiveMission: true,
    shouldBypassPlanning: false,
    kind: asksStatus ? "explain_active_mission" : "continue_mission",
    reason: "Hay una misión activa que debe mantenerse en contexto.",
    mission,
  };
}

export function buildMissionStatusReply(mission: FlowlyMission) {
  const lines = [
    `Misión activa: ${mission.title}`,
    `Estado: ${mission.status}`,
    `Objetivo: ${mission.objective}`,
  ];

  if (mission.current_step) lines.push(`Paso actual: ${mission.current_step}`);
  if (mission.branch) lines.push(`Rama: ${mission.branch}`);
  if (mission.pull_request_url) lines.push(`Pull Request: ${mission.pull_request_url}`);
  if (mission.pull_request_number) lines.push(`PR #: ${mission.pull_request_number}`);
  if (mission.last_error) lines.push(`Último error: ${mission.last_error}`);

  return lines.join("\n");
}
