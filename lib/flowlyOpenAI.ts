export type FlowlyOpenAIPurpose = "developer" | "brain" | "companion";

export type FlowlyOpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type FlowlyOpenAIRequest = {
  purpose: FlowlyOpenAIPurpose;
  system: string;
  user: string;
  history?: FlowlyOpenAIMessage[];
  temperature?: number;
  maxOutputTokens?: number;
  expectJson?: boolean;
};

export type FlowlyOpenAIResult = {
  ok: boolean;
  usedAI: boolean;
  provider: "openai_responses" | "openai_chat_completions" | "none";
  model: string;
  text: string;
  raw?: unknown;
  error?: string;
};

function modelForPurpose(purpose: FlowlyOpenAIPurpose) {
  if (purpose === "developer") return process.env.FLOWLY_DEVELOPER_MODEL || process.env.FLOWLY_AI_MODEL || "gpt-4o-mini";
  if (purpose === "companion") return process.env.FLOWLY_COMPANION_MODEL || process.env.FLOWLY_AI_MODEL || "gpt-4o-mini";
  return process.env.FLOWLY_AI_MODEL || "gpt-4o-mini";
}

function compactText(value: string, limit = 12000) {
  const clean = value.replace(/\u0000/g, "").trim();
  return clean.length > limit ? `${clean.slice(0, limit)}\n\n[Contexto recortado por seguridad]` : clean;
}

function extractResponsesText(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const record = data as Record<string, unknown>;
  if (typeof record.output_text === "string") return record.output_text;

  const output = Array.isArray(record.output) ? record.output : [];
  const parts: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const itemRecord = item as Record<string, unknown>;
    const content = Array.isArray(itemRecord.content) ? itemRecord.content : [];
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const partRecord = part as Record<string, unknown>;
      if (typeof partRecord.text === "string") parts.push(partRecord.text);
      if (typeof partRecord.output_text === "string") parts.push(partRecord.output_text);
    }
  }

  return parts.join("\n").trim();
}

function extractChatText(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const choices = (data as Record<string, unknown>).choices;
  if (!Array.isArray(choices)) return "";
  const first = choices[0];
  if (!first || typeof first !== "object") return "";
  const message = (first as Record<string, unknown>).message;
  if (!message || typeof message !== "object") return "";
  const content = (message as Record<string, unknown>).content;
  return typeof content === "string" ? content : "";
}

function buildResponsesInput(request: FlowlyOpenAIRequest) {
  const history = (request.history || []).slice(-10).map((item) => ({
    role: item.role === "system" ? "assistant" : item.role,
    content: compactText(item.content, 5000),
  }));

  return [
    { role: "system", content: compactText(request.system, 18000) },
    ...history,
    { role: "user", content: compactText(request.user, 30000) },
  ];
}

async function callResponsesAPI(apiKey: string, model: string, request: FlowlyOpenAIRequest): Promise<FlowlyOpenAIResult> {
  const body: Record<string, unknown> = {
    model,
    input: buildResponsesInput(request),
    temperature: typeof request.temperature === "number" ? request.temperature : 0.2,
    max_output_tokens: request.maxOutputTokens || 1800,
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      ok: false,
      usedAI: false,
      provider: "openai_responses",
      model,
      text: "",
      raw: data,
      error: typeof (data as Record<string, unknown> | null)?.error === "object"
        ? String(((data as Record<string, unknown>).error as Record<string, unknown>).message || response.statusText)
        : response.statusText,
    };
  }

  return {
    ok: true,
    usedAI: true,
    provider: "openai_responses",
    model,
    text: extractResponsesText(data),
    raw: data,
  };
}

async function callChatCompletionsAPI(apiKey: string, model: string, request: FlowlyOpenAIRequest): Promise<FlowlyOpenAIResult> {
  const messages = [
    { role: "system", content: compactText(request.system, 18000) },
    ...(request.history || []).slice(-10).map((item) => ({ role: item.role, content: compactText(item.content, 5000) })),
    { role: "user", content: compactText(request.user, 30000) },
  ];

  const body: Record<string, unknown> = {
    model,
    temperature: typeof request.temperature === "number" ? request.temperature : 0.2,
    max_tokens: request.maxOutputTokens || 1800,
    messages,
  };

  if (request.expectJson) body.response_format = { type: "json_object" };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      ok: false,
      usedAI: false,
      provider: "openai_chat_completions",
      model,
      text: "",
      raw: data,
      error: typeof (data as Record<string, unknown> | null)?.error === "object"
        ? String(((data as Record<string, unknown>).error as Record<string, unknown>).message || response.statusText)
        : response.statusText,
    };
  }

  return {
    ok: true,
    usedAI: true,
    provider: "openai_chat_completions",
    model,
    text: extractChatText(data),
    raw: data,
  };
}

export async function callFlowlyOpenAI(request: FlowlyOpenAIRequest): Promise<FlowlyOpenAIResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = modelForPurpose(request.purpose);

  if (!apiKey) {
    return {
      ok: false,
      usedAI: false,
      provider: "none",
      model,
      text: "",
      error: "OPENAI_API_KEY no está configurada.",
    };
  }

  try {
    const responses = await callResponsesAPI(apiKey, model, request);
    if (responses.ok && responses.text.trim()) return responses;

    // Fallback temporal para compatibilidad con modelos/cuentas que todavía no acepten /v1/responses.
    const chat = await callChatCompletionsAPI(apiKey, model, request);
    if (chat.ok && chat.text.trim()) return chat;

    return responses.ok ? chat : responses;
  } catch (error) {
    return {
      ok: false,
      usedAI: false,
      provider: "none",
      model,
      text: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
