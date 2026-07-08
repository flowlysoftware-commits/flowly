import { experimental_upgradeWebSocket } from "@vercel/functions";
import {
  createGatewayEventResponse,
  createGatewayMessageResponse,
  type FlowCompanionGatewayEventType,
} from "@/lib/flowlyCompanionGateway";

export const runtime = "nodejs";
export const maxDuration = 300;

type IncomingRealtimeMessage = {
  type?: string;
  companionId?: string;
  userId?: string;
  sessionId?: string;
  companionName?: string;
  text?: string;
  message?: string;
  pathname?: string;
  payload?: Record<string, unknown>;
};

const EVENT_TYPES = new Set<FlowCompanionGatewayEventType>([
  "ping",
  "session.started",
  "session.ended",
  "mouse.move",
  "mouse.click",
  "user.speaking",
  "user.silence",
  "assistant.thinking",
  "assistant.response.started",
  "assistant.response.finished",
  "assistant.response.interrupted",
  "text.message",
]);

function safeJsonParse(value: unknown): IncomingRealtimeMessage {
  if (typeof value !== "string") {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed as IncomingRealtimeMessage : {};
  } catch {
    return { type: "message", text: value };
  }
}

function normalizeEventType(type: string | undefined): FlowCompanionGatewayEventType {
  switch (type) {
    case "hello":
      return "session.started";
    case "message":
      return "text.message";
    case "thinking":
      return "assistant.thinking";
    case "speaking":
      return "assistant.response.started";
    case "finished":
      return "assistant.response.finished";
    case "ping":
      return "ping";
    default:
      return EVENT_TYPES.has(type as FlowCompanionGatewayEventType)
        ? type as FlowCompanionGatewayEventType
        : "ping";
  }
}

function sendJson(ws: { send: (data: string) => void }, data: unknown) {
  ws.send(JSON.stringify(data));
}

function getMessageText(message: IncomingRealtimeMessage) {
  return (message.text || message.message || "").trim();
}

export async function GET() {
  return experimental_upgradeWebSocket((ws) => {
    sendJson(ws, {
      ok: true,
      type: "gateway.ready",
      generatedAt: new Date().toISOString(),
      service: "flow-companion-realtime",
      message: "Flow Companion Realtime Gateway conectado.",
    });

    ws.on("message", async (data: unknown) => {
      const raw = typeof data === "string" ? data : data?.toString?.() || "";
      const message = safeJsonParse(raw);
      const eventType = normalizeEventType(message.type);
      const text = getMessageText(message);

      try {
        if (eventType === "text.message" && text) {
          sendJson(ws, createGatewayEventResponse({
            type: "assistant.thinking",
            companionId: message.companionId,
            userId: message.userId,
            sessionId: message.sessionId,
            pathname: message.pathname,
          }));

          const response = await createGatewayMessageResponse({
            message: text,
            companionId: message.companionId,
            userId: message.userId,
            sessionId: message.sessionId,
            pathname: message.pathname || "/dashboard",
            extraContext: {
              source: "flow_companion_realtime_websocket",
              companionName: message.companionName,
              ...(message.payload || {}),
            },
          });

          sendJson(ws, {
            ...response,
            type: "assistant.message",
          });

          return;
        }

        sendJson(ws, {
          ...createGatewayEventResponse({
            type: eventType,
            companionId: message.companionId,
            userId: message.userId,
            sessionId: message.sessionId,
            pathname: message.pathname,
            text,
            payload: message.payload,
          }),
          type: "gateway.event",
        });
      } catch (error) {
        console.error("Flow Companion Realtime error", error);
        sendJson(ws, {
          ok: false,
          type: "gateway.error",
          error: "No se pudo procesar el evento realtime del Companion.",
        });
      }
    });

    ws.on("close", () => {
      console.log("Flow Companion Realtime socket closed");
    });
  });
}
