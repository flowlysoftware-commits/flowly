import { FlowEmotion, FlowMode } from "./types";

export type GatewayHandlers = {
  onConnected: (connected: boolean) => void;
  onMode: (mode: FlowMode) => void;
  onEmotion: (emotion: Partial<FlowEmotion>) => void;
  onMessage: (text: string) => void;
  onAction: (name: string, payload?: unknown) => void;
};

export class FlowGatewayClient {
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private stopped = false;
  private readonly url: string;
  private readonly handlers: GatewayHandlers;

  constructor(url: string, handlers: GatewayHandlers) { this.url = url; this.handlers = handlers; }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) return;
    this.stopped = false;
    const socket = new WebSocket(this.url);
    this.socket = socket;
    socket.onopen = () => {
      this.handlers.onConnected(true);
      socket.send(JSON.stringify({ type: "hello", companionId: "flow-web", userId: "flowly-user", companionName: "Flow" }));
    };
    socket.onclose = () => {
      this.handlers.onConnected(false);
      if (!this.stopped) this.reconnectTimer = window.setTimeout(() => this.connect(), 3500);
    };
    socket.onerror = () => this.handlers.onConnected(false);
    socket.onmessage = (event) => this.handleMessage(String(event.data || ""));
  }

  disconnect() {
    this.stopped = true;
    if (this.reconnectTimer) window.clearTimeout(this.reconnectTimer);
    this.socket?.close();
    this.socket = null;
  }

  sendText(text: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return false;
    this.socket.send(JSON.stringify({ type: "message", companionId: "flow-web", userId: "flowly-user", text }));
    return true;
  }

  private handleMessage(raw: string) {
    try {
      const data = JSON.parse(raw) as Record<string, any>;
      const type = String(data.type || "");
      if (type === "companion.thinking") this.handlers.onMode("thinking");
      if (type === "companion.response.started") this.handlers.onMode("talking");
      if (type === "companion.response.finished") this.handlers.onMode("idle");
      if (type === "companion.message" && data.text) this.handlers.onMessage(String(data.text));
      if (type === "companion.emotion.changed" && data.emotion) this.handlers.onEmotion(data.emotion as Partial<FlowEmotion>);
      if ((type === "tool.result" || type === "companion.action") && data.name) this.handlers.onAction(String(data.name), data.payload);
    } catch { /* Ignore malformed gateway events. */ }
  }
}
