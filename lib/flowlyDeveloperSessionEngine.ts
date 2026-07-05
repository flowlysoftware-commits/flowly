import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type DeveloperSessionMessage = {
  id?: string;
  conversation_id: string;
  role: "user" | "assistant" | "system" | "brain";
  content: string;
  intent?: string | null;
  details?: unknown;
  created_at?: string;
};

export type DeveloperSessionPlan = {
  id?: string;
  conversation_id: string;
  instruction: string;
  status: "planned" | "approved" | "running" | "completed" | "error";
  summary?: string | null;
  risk?: string | null;
  plan: unknown;
  created_at?: string;
  updated_at?: string;
};

function safeConversationId(conversationId?: string) {
  return typeof conversationId === "string" && conversationId.trim().length > 0 ? conversationId.trim().slice(0, 160) : null;
}

export async function getRecentDeveloperSessionMessages(conversationId?: string, limit = 18): Promise<DeveloperSessionMessage[]> {
  const id = safeConversationId(conversationId);
  if (!id) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from("flowly_developer_conversation_messages")
      .select("id, conversation_id, role, content, intent, details, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !Array.isArray(data)) return [];
    return data.reverse().map((item) => ({
      id: String(item.id || ""),
      conversation_id: String(item.conversation_id || id),
      role: String(item.role || "assistant") as DeveloperSessionMessage["role"],
      content: String(item.content || ""),
      intent: typeof item.intent === "string" ? item.intent : null,
      details: item.details,
      created_at: typeof item.created_at === "string" ? item.created_at : undefined,
    }));
  } catch {
    return [];
  }
}

export async function rememberDeveloperSessionMessage(params: {
  conversationId?: string;
  role: DeveloperSessionMessage["role"];
  content: string;
  intent?: string;
  details?: unknown;
}) {
  const id = safeConversationId(params.conversationId);
  const content = params.content.trim();
  if (!id || !content) return;

  try {
    await supabaseAdmin.from("flowly_developer_conversation_messages").insert({
      conversation_id: id,
      role: params.role,
      content,
      intent: params.intent || null,
      details: params.details || null,
    });
  } catch {
    // La memoria de sesión no debe bloquear Developer.
  }
}

export async function rememberDeveloperSessionPlan(params: {
  conversationId?: string;
  instruction: string;
  plan: unknown;
  summary?: string;
  risk?: string;
}) {
  const id = safeConversationId(params.conversationId);
  if (!id || !params.plan) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from("flowly_developer_session_plans")
      .insert({
        conversation_id: id,
        instruction: params.instruction,
        status: "planned",
        summary: params.summary || null,
        risk: params.risk || null,
        plan: params.plan,
      })
      .select("id")
      .single();

    if (error) return null;
    return typeof data?.id === "string" ? data.id : null;
  } catch {
    return null;
  }
}

export async function getLatestDeveloperSessionPlan(conversationId?: string): Promise<DeveloperSessionPlan | null> {
  const id = safeConversationId(conversationId);
  if (!id) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from("flowly_developer_session_plans")
      .select("id, conversation_id, instruction, status, summary, risk, plan, created_at, updated_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: String(data.id || ""),
      conversation_id: String(data.conversation_id || id),
      instruction: String(data.instruction || ""),
      status: String(data.status || "planned") as DeveloperSessionPlan["status"],
      summary: typeof data.summary === "string" ? data.summary : null,
      risk: typeof data.risk === "string" ? data.risk : null,
      plan: data.plan,
      created_at: typeof data.created_at === "string" ? data.created_at : undefined,
      updated_at: typeof data.updated_at === "string" ? data.updated_at : undefined,
    };
  } catch {
    return null;
  }
}

export async function updateLatestDeveloperSessionPlanStatus(conversationId: string | undefined, status: DeveloperSessionPlan["status"], details?: unknown) {
  const latest = await getLatestDeveloperSessionPlan(conversationId);
  if (!latest?.id) return;

  try {
    await supabaseAdmin
      .from("flowly_developer_session_plans")
      .update({ status, updated_at: new Date().toISOString(), execution_details: details || null })
      .eq("id", latest.id);
  } catch {
    // No bloquear ejecución.
  }
}
