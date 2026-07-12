import { FlowEmotion, FlowMessage, FlowMode } from "./types";
import type { FlowLogger } from "./core/logger";
import type { FlowMemoryContext } from "./memory/types";

export type GatewayHandlers = {
  onConnected: (connected: boolean) => void;
  onMode: (mode: FlowMode) => void;
  onEmotion: (emotion: Partial<FlowEmotion>) => void;
  onMessage: (text: string) => void;
  onAction: (name: string, payload?: unknown) => void;
  getContext?: () => { pathname?: string; conversation?: FlowMessage[]; panel?: unknown; memory?: FlowMemoryContext };
};

export class FlowGatewayClient {
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private stopped = false;
  private readonly wsUrl: string | null;
  private readonly httpUrl: string;
  private readonly handlers: GatewayHandlers;
  private requestSerial = 0;
  private readonly reconnectDelayMs: number;
  private readonly logger?: FlowLogger;
  private readonly getAccessToken?: () => Promise<string | null>;
  private readonly identity?: { userId: string; businessId: string };

  constructor(options: { wsUrl?: string | null; httpUrl?: string; reconnectDelayMs?: number; logger?: FlowLogger; getAccessToken?: () => Promise<string | null>; identity?: { userId: string; businessId: string }; handlers: GatewayHandlers }) {
    this.wsUrl = options.wsUrl || null;
    this.httpUrl = options.httpUrl || "/api/companion/chat";
    this.handlers = options.handlers;
    this.reconnectDelayMs = options.reconnectDelayMs ?? 4000;
    this.logger = options.logger;
    this.getAccessToken = options.getAccessToken;
    this.identity = options.identity;
  }

  connect() {
    if (!this.wsUrl) {
      this.handlers.onConnected(true);
      return;
    }
    if (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) return;

    this.stopped = false;
    try {
      const socket = new WebSocket(this.wsUrl);
      this.socket = socket;
      socket.onopen = () => {
        this.handlers.onConnected(true);
        socket.send(JSON.stringify({ type: "hello", companionId: "flow-web", source: "flowly-web" }));
      };
      socket.onclose = () => {
        this.handlers.onConnected(false);
        if (!this.stopped) this.reconnectTimer = window.setTimeout(() => this.connect(), this.reconnectDelayMs);
      };
      socket.onerror = () => this.handlers.onConnected(false);
      socket.onmessage = (event) => this.handleMessage(String(event.data || ""));
    } catch (error) {
      this.logger?.warn("WebSocket unavailable; using HTTP transport.", error);
      this.handlers.onConnected(true); // HTTP transport remains available.
    }
  }

  disconnect() {
    this.stopped = true;
    if (this.reconnectTimer !== null) window.clearTimeout(this.reconnectTimer);
    this.socket?.close();
    this.socket = null;
  }

  async sendText(text: string) {
    const clean = text.trim();
    if (!clean) return false;

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "message", companionId: "flow-web", text: clean, source: "flowly-web" }));
      return true;
    }

    const serial = ++this.requestSerial;
    this.handlers.onConnected(true);
    this.handlers.onMode("thinking");
    try {
      const context = this.handlers.getContext?.() || {};
      const accessToken = await this.getAccessToken?.();
      if (!accessToken) throw new Error("La sesión del Companion no es válida. Vuelve a iniciar sesión.");
      const response = await fetch(this.httpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          message: clean,
          pathname: context.pathname || window.location.pathname,
          conversation: (context.conversation || []).map(({ role, text: content }) => ({
            role: role === "flow" ? "assistant" : role,
            content,
          })),
          extraContext: { source: "flow_companion_web", panel: context.panel, memory: context.memory },
          identity: this.identity,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(data?.error || "Flow no ha podido responder."));
      if (serial !== this.requestSerial) return true;

      const answer = String(data.answer || data.message || "He terminado.");
      this.handlers.onMode("talking");
      this.handlers.onMessage(answer);
      if (data.emotion && typeof data.emotion === "object") this.handlers.onEmotion(data.emotion);
      if (Array.isArray(data.actions)) data.actions.forEach((action: unknown) => this.emitAction(action));
      if (Array.isArray(data.tools)) data.tools.forEach((tool: unknown) => this.emitAction(tool));
      window.setTimeout(() => this.handlers.onMode("idle"), Math.min(6500, Math.max(1500, answer.length * 24)));
      return true;
    } catch (error) {
      this.logger?.error("Chat request failed.", error);
      this.handlers.onMode("error");
      this.handlers.onMessage(error instanceof Error ? error.message : "He perdido la conexión con mi cerebro.");
      return false;
    }
  }

  private emitAction(value: unknown) {
    if (!value || typeof value !== "object") return;
    const action = value as Record<string, unknown>;
    const name = String(action.name || action.id || action.type || action.action || "");
    if (name) this.handlers.onAction(name, action.payload ?? action.arguments ?? action);
  }

  private handleMessage(raw: string) {
    try {
      const data = JSON.parse(raw) as Record<string, any>;
      const type = String(data.type || "");
      if (type.includes("thinking")) this.handlers.onMode("thinking");
      if (type.includes("response.started")) this.handlers.onMode("talking");
      if (type.includes("response.finished")) this.handlers.onMode("idle");
      if (data.text) this.handlers.onMessage(String(data.text));
      if (data.emotion) this.handlers.onEmotion(data.emotion);
      if (Array.isArray(data.actions)) data.actions.forEach((action: unknown) => this.emitAction(action));
      if (/tool|action/.test(type)) this.emitAction(data);
    } catch (error) {
      this.logger?.warn("Malformed gateway event ignored.", error);
      // HTTP remains the reliable fallback.
    }
  }
}
