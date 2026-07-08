"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, ChevronDown, ChevronUp, Maximize2, Mic, Minimize2, Navigation, Send, Sparkles, X } from "lucide-react";

const UNITY_URL = "/flow-companion-webgl/index.html";
const GATEWAY_URL = process.env.NEXT_PUBLIC_FLOW_COMPANION_GATEWAY_URL || "https://flowly-companion-gateway.onrender.com";

type OverlayPosition = "bottom-right" | "bottom-left" | "center-right";
type FlowStatus = "idle" | "connecting" | "ready" | "thinking" | "speaking" | "error";

type ChatMessage = {
  id: string;
  role: "user" | "flow" | "system";
  text: string;
};

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function statusLabel(status: FlowStatus) {
  if (status === "connecting") return "conectando";
  if (status === "ready") return "listo";
  if (status === "thinking") return "pensando";
  if (status === "speaking") return "hablando";
  if (status === "error") return "revisar";
  return "esperando";
}

function getPositionClasses(position: OverlayPosition) {
  if (position === "bottom-left") return "bottom-5 left-5 md:bottom-7 md:left-7";
  if (position === "center-right") return "right-5 top-1/2 -translate-y-1/2 md:right-7";
  return "bottom-5 right-5 md:bottom-7 md:right-7";
}

export default function FlowOverlayCompanion() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState<OverlayPosition>("bottom-right");
  const [status, setStatus] = useState<FlowStatus>("connecting");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "flow",
      text: "Estoy aquí. Esta es la primera fase del nuevo Flow Overlay dentro de Flowly.",
    },
  ]);
  const [frameKey, setFrameKey] = useState(0);
  const mountedRef = useRef(true);

  const positionClasses = useMemo(() => getPositionClasses(position), [position]);

  useEffect(() => {
    mountedRef.current = true;

    const checkGateway = async () => {
      try {
        const response = await fetch(`${GATEWAY_URL}/health`, { cache: "no-store" });
        if (!mountedRef.current) return;
        setStatus(response.ok ? "ready" : "error");
      } catch {
        if (!mountedRef.current) return;
        setStatus("error");
      }
    };

    void checkGateway();
    const interval = window.setInterval(checkGateway, 30000);

    return () => {
      mountedRef.current = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;
      if (event.data.type === "flow-unity-ready") setStatus("ready");
      if (event.data.type === "flow-unity-error") setStatus("error");
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;

    setInput("");
    setOpen(true);
    setMessages((current) => [...current, { id: createId("user"), role: "user", text }]);
    setStatus("thinking");

    try {
      const response = await fetch("/api/companion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, source: "flow-overlay" }),
      });

      const data = await response.json().catch(() => null);
      const reply = data?.reply || data?.message || data?.text || "He recibido tu mensaje. La siguiente fase conectará navegación visual y acciones del panel.";

      setStatus("speaking");
      setMessages((current) => [...current, { id: createId("flow"), role: "flow", text: reply }]);
      window.setTimeout(() => setStatus("ready"), 1200);
    } catch {
      setStatus("error");
      setMessages((current) => [...current, { id: createId("system"), role: "system", text: "No he podido contactar con el Companion ahora mismo." }]);
    }
  };

  const cyclePosition = () => {
    setPosition((current) => {
      if (current === "bottom-right") return "center-right";
      if (current === "center-right") return "bottom-left";
      return "bottom-right";
    });
  };

  const reloadUnity = () => setFrameKey((value) => value + 1);

  if (minimized) {
    return (
      <div className="flow-overlay-root pointer-events-none fixed inset-0 z-[90]">
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="flow-overlay-mini pointer-events-auto fixed bottom-5 right-5 flex items-center gap-3 rounded-full border border-cyan-200/25 bg-slate-950/92 px-4 py-3 text-sm font-black text-white shadow-2xl shadow-cyan-950/45 backdrop-blur-2xl md:bottom-7 md:right-7"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-cyan-300 text-slate-950"><Bot size={19} /></span>
          Flow
          <ChevronUp size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flow-overlay-root pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      <div className={`flow-overlay-companion pointer-events-auto fixed ${positionClasses}`}>
        <div className="flow-overlay-shell">
          <div className="flow-overlay-header">
            <button type="button" onClick={() => setOpen((value) => !value)} className="flow-overlay-title" aria-label="Abrir Flow">
              <span className={`flow-overlay-status-dot is-${status}`} />
              <span>
                <strong>Flow</strong>
                <small>{statusLabel(status)}</small>
              </span>
            </button>

            <div className="flow-overlay-actions">
              <button type="button" onClick={cyclePosition} aria-label="Mover Flow"><Navigation size={14} /></button>
              <button type="button" onClick={reloadUnity} aria-label="Recargar avatar"><Sparkles size={14} /></button>
              <button type="button" onClick={() => setMinimized(true)} aria-label="Minimizar Flow"><Minimize2 size={14} /></button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar panel"><X size={14} /></button>
            </div>
          </div>

          <button type="button" onClick={() => setOpen((value) => !value)} className="flow-overlay-avatar" aria-label="Hablar con Flow">
            <iframe
              key={frameKey}
              title="Flow Unity Companion Overlay"
              src={UNITY_URL}
              className="flow-overlay-unity-frame"
              allow="autoplay; microphone; fullscreen; clipboard-read; clipboard-write"
            />
            <span className="flow-overlay-avatar-glow" />
          </button>

          {open && (
            <div className="flow-overlay-panel">
              <div className="flow-overlay-panel-head">
                <div>
                  <p>Nuevo Flow Overlay</p>
                  <span>Fase 1: presencia global activa</span>
                </div>
                <button type="button" onClick={() => setOpen(false)}><ChevronDown size={16} /></button>
              </div>

              <div className="flow-overlay-messages">
                {messages.slice(-5).map((message) => (
                  <div key={message.id} className={`flow-overlay-message is-${message.role}`}>
                    {message.text}
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="flow-overlay-input-row">
                <button type="button" className="flow-overlay-icon-button" aria-label="Voz próximamente"><Mic size={15} /></button>
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Pídele algo a Flow..."
                />
                <button type="submit" className="flow-overlay-send" aria-label="Enviar"><Send size={15} /></button>
              </form>

              <div className="flow-overlay-hint">
                Próxima fase: “Flow, llévame al CRM” → caminar, señalar y abrir el módulo.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
