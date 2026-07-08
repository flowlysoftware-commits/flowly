import { runFlowlyBrain, type FlowlyBrainMessage } from "@/lib/flowlyBrain";

export type FlowCompanionGatewayEventType =
  | "session.started"
  | "session.ended"
  | "mouse.move"
  | "mouse.click"
  | "user.speaking"
  | "user.silence"
  | "assistant.thinking"
  | "assistant.response.started"
  | "assistant.response.finished"
  | "assistant.response.interrupted"
  | "text.message";

export type FlowCompanionGatewayEvent = {
  type: FlowCompanionGatewayEventType;
  companionId?: string;
  userId?: string;
  sessionId?: string;
  pathname?: string;
  text?: string;
  x?: number;
  y?: number;
  payload?: Record<string, unknown>;
};

export type FlowCompanionRuntimeCommand = {
  type: "state" | "attention" | "reaction" | "speech" | "debug";
  name: string;
  payload?: Record<string, unknown>;
};

export type FlowCompanionGatewayResponse = {
  ok: boolean;
  generatedAt: string;
  sessionId: string;
  companionId: string;
  userId: string;
  commands: FlowCompanionRuntimeCommand[];
  meta?: Record<string, unknown>;
};

export const FLOW_COMPANION_GATEWAY_VERSION = "0.1.0";

function cleanId(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const clean = value.trim().replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80);
  return clean || fallback;
}

function nowIso() {
  return new Date().toISOString();
}

export function createCompanionSession(input?: {
  companionId?: string;
  userId?: string;
  sessionId?: string;
}) {
  const companionId = cleanId(input?.companionId, "flow-companion-dev");
  const userId = cleanId(input?.userId, "local-user");
  const sessionId = cleanId(input?.sessionId, `flow-session-${Date.now()}`);
  const httpBaseUrl = process.env.NEXT_PUBLIC_FLOWLY_URL || process.env.FLOWLY_PUBLIC_URL || "http://localhost:3000";
  const websocketUrl = process.env.FLOW_COMPANION_WS_URL || null;

  return {
    ok: true,
    version: FLOW_COMPANION_GATEWAY_VERSION,
    generatedAt: nowIso(),
    backendManaged: true,
    companionId,
    userId,
    sessionId,
    endpoints: {
      event: `${httpBaseUrl}/api/companion/gateway/event`,
      message: `${httpBaseUrl}/api/companion/gateway/message`,
      realtimeSession: `${httpBaseUrl}/api/companion/gateway/realtime-session`,
      websocket: websocketUrl,
    },
    unity: {
      websocketUrl: websocketUrl || `${httpBaseUrl.replace(/^http/, "ws")}/api/companion/gateway/event`,
      companionId,
      userId,
      debugLogs: process.env.NODE_ENV !== "production",
    },
  };
}

export function buildRuntimeCommands(event: FlowCompanionGatewayEvent): FlowCompanionRuntimeCommand[] {
  switch (event.type) {
    case "session.started":
      return [
        { type: "state", name: "Idle" },
        { type: "attention", name: "LookAtUser" },
        { type: "debug", name: "SessionStarted" },
      ];

    case "session.ended":
      return [{ type: "state", name: "Idle" }];

    case "mouse.move":
      return [{ type: "attention", name: "LookAtScreenPoint", payload: { x: event.x || 0, y: event.y || 0 } }];

    case "mouse.click":
      return [{ type: "reaction", name: "MouseClick" }];

    case "user.speaking":
      return [
        { type: "state", name: "Listening" },
        { type: "reaction", name: "UserSpeaking" },
        { type: "attention", name: "LookAtUser" },
      ];

    case "user.silence":
      return [{ type: "state", name: "Thinking" }];

    case "assistant.thinking":
      return [
        { type: "state", name: "Thinking" },
        { type: "reaction", name: "Thinking" },
        { type: "attention", name: "LookAround" },
      ];

    case "assistant.response.started":
      return [
        { type: "state", name: "Speaking" },
        { type: "reaction", name: "ResponseStarted" },
        { type: "attention", name: "LookAtUser" },
      ];

    case "assistant.response.finished":
      return [
        { type: "reaction", name: "ResponseFinished" },
        { type: "state", name: "Idle" },
      ];

    case "assistant.response.interrupted":
      return [
        { type: "state", name: "Listening" },
        { type: "attention", name: "LookAtUser" },
      ];

    case "text.message":
      return [
        { type: "state", name: "Thinking" },
        { type: "reaction", name: "Thinking" },
      ];

    default:
      return [{ type: "debug", name: "UnknownEvent", payload: { eventType: event.type } }];
  }
}

export function createGatewayEventResponse(event: FlowCompanionGatewayEvent): FlowCompanionGatewayResponse {
  const session = createCompanionSession({
    companionId: event.companionId,
    userId: event.userId,
    sessionId: event.sessionId,
  });

  return {
    ok: true,
    generatedAt: nowIso(),
    sessionId: session.sessionId,
    companionId: session.companionId,
    userId: session.userId,
    commands: buildRuntimeCommands(event),
    meta: {
      eventType: event.type,
      pathname: event.pathname || "/",
    },
  };
}

export async function createGatewayMessageResponse(input: {
  message: string;
  pathname?: string;
  conversation?: FlowlyBrainMessage[];
  companionId?: string;
  userId?: string;
  sessionId?: string;
  extraContext?: Record<string, unknown>;
}) {
  const session = createCompanionSession(input);
  const message = input.message.trim();

  const thinking = createGatewayEventResponse({
    type: "assistant.thinking",
    companionId: session.companionId,
    userId: session.userId,
    sessionId: session.sessionId,
    pathname: input.pathname,
  });

  const brain = await runFlowlyBrain({
    message,
    pathname: input.pathname || "/dashboard",
    conversation: input.conversation || [],
    extraContext: {
      ...(input.extraContext || {}),
      source: "flow_companion_gateway",
      companionId: session.companionId,
      sessionId: session.sessionId,
    },
  });

  return {
    ok: true,
    generatedAt: nowIso(),
    sessionId: session.sessionId,
    companionId: session.companionId,
    userId: session.userId,
    answer: brain.answer,
    brain,
    commands: [
      ...thinking.commands,
      { type: "state", name: "Speaking" },
      { type: "reaction", name: "ResponseStarted" },
      { type: "speech", name: "Say", payload: { text: brain.answer } },
      { type: "reaction", name: "ResponseFinished" },
      { type: "state", name: "Idle" },
    ] satisfies FlowCompanionRuntimeCommand[],
  };
}

export async function createOpenAIRealtimeSession(input?: {
  voice?: string;
  instructions?: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      error: "Falta OPENAI_API_KEY en variables de entorno.",
    };
  }

  const model = process.env.OPENAI_REALTIME_MODEL || "gpt-4o-realtime-preview";
  const voice = input?.voice || process.env.OPENAI_REALTIME_VOICE || "alloy";
  const instructions = input?.instructions || [
    "Eres Flow Companion, el asistente vivo de Flowly.",
    "Responde en español claro, con tono cercano, útil y breve.",
    "Cuando estés pensando o hablando, emite respuestas que permitan al runtime activar estados físicos: listening, thinking, speaking e idle.",
  ].join(" ");

  const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      voice,
      instructions,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      error: typeof data === "object" && data && "error" in data ? data : response.statusText,
    };
  }

  return {
    ok: true,
    model,
    voice,
    session: data,
  };
}
