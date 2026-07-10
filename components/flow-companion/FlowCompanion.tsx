"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mic, Navigation, Send, Sparkles, X } from "lucide-react";
import { Vector2 } from "three";
import FlowCharacter3D, { FlowCharacterFacing, FlowCharacterMode, FlowEmotionSnapshot } from "./FlowCharacter3D";

const GATEWAY_HTTP = (process.env.NEXT_PUBLIC_FLOW_COMPANION_GATEWAY_URL || "https://flowly-companion-gateway.onrender.com").replace(/\/$/, "");
const GATEWAY_WS = GATEWAY_HTTP.replace(/^http:/, "ws:").replace(/^https:/, "wss:") + "/flow-companion";
const CHARACTER_WIDTH = 230;
const CHARACTER_HEIGHT = 330;
const EDGE = 14;

type Message = { id: string; role: "user" | "flow" | "system"; text: string };
type Position = { left: number; top: number };
type PanelTarget = { key: string; label: string; aliases?: string[] };
type PanelApi = {
  targets: PanelTarget[];
  findTarget: (target: string) => PanelTarget | null;
  findElement: (target: string) => HTMLElement | null;
  navigate: (target: string) => Promise<{ ok: boolean; message: string; label?: string; rect?: { centerX: number; centerY: number } }>;
};


function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function detectTarget(text: string, targets: PanelTarget[]) {
  const input = normalize(text);
  const intent = /\b(llevame|abre|abrir|ve|ir|vamos|entra|muestra|navega|pulsa|clic|click)\b/.test(input);
  if (!intent) return null;
  return targets.find((target) => [target.key, target.label, ...(target.aliases || [])].some((alias) => input.includes(normalize(alias)))) || null;
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function extractGatewayEvent(raw: string) {
  try { return JSON.parse(raw) as Record<string, unknown>; } catch { return null; }
}

export default function FlowCompanion() {
  const [mode, setMode] = useState<FlowCharacterMode>("idle");
  const [facing, setFacing] = useState<FlowCharacterFacing>("front");
  const [emotion, setEmotion] = useState<FlowEmotionSnapshot>({ calm: 0.75, energy: 0.55, attention: 0.8, stress: 0.05 });
  const [pointer, setPointer] = useState(() => new Vector2());
  const [position, setPosition] = useState<Position>({ left: 24, top: 260 });
  const positionRef = useRef(position);
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [input, setInput] = useState("");
  const [bubble, setBubble] = useState("Hola, soy Flow. Estoy aquí para ayudarte.");
  const [messages, setMessages] = useState<Message[]>([{ id: "welcome", role: "flow", text: "Hola, soy Flow. Puedo acompañarte y navegar por el panel." }]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);

  useEffect(() => { positionRef.current = position; }, [position]);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      setPointer(new Vector2(
        clamp((event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1, -1, 1),
        clamp(-((event.clientY / Math.max(window.innerHeight, 1)) * 2 - 1), -1, 1),
      ));
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => window.removeEventListener("pointermove", onPointer);
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState <= WebSocket.OPEN) return;
    const socket = new WebSocket(GATEWAY_WS);
    socketRef.current = socket;
    socket.onopen = () => {
      setConnected(true);
      socket.send(JSON.stringify({ type: "hello", companionId: "flow-web", userId: "flowly-user", companionName: "Flow" }));
    };
    socket.onclose = () => {
      setConnected(false);
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = window.setTimeout(connect, 4000);
    };
    socket.onerror = () => setConnected(false);
    socket.onmessage = (event) => {
      const payload = extractGatewayEvent(String(event.data));
      if (!payload) return;
      const type = String(payload.type || "");
      if (type === "companion.thinking" || type === "conversation.context.building") setMode("thinking");
      if (type === "companion.response.started") setMode("talk");
      if (type === "companion.response.finished") setMode("idle");
      if (type === "companion.emotion.changed" && payload.emotion && typeof payload.emotion === "object") {
        setEmotion(payload.emotion as FlowEmotionSnapshot);
      }
      if (type === "companion.message") {
        const text = String(payload.text || "");
        if (text) {
          setBubble(text);
          setMessages((current) => [...current, { id: id("flow"), role: "flow", text }]);
          setOpen(true);
        }
      }
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      const socket = socketRef.current;
      socketRef.current = null;
      socket?.close();
    };
  }, [connect]);

  async function animateTo(destination: Position) {
    const start = positionRef.current;
    const dx = destination.left - start.left;
    const dy = destination.top - start.top;
    const distance = Math.hypot(dx, dy);
    const duration = clamp(distance * 3.2, 650, 2400);
    setFacing(dx < -8 ? "left" : dx > 8 ? "right" : "front");
    setMode("walk");
    const started = performance.now();

    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        const t = clamp((now - started) / duration, 0, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        setPosition({ left: start.left + dx * eased, top: start.top + dy * eased });
        if (t < 1) requestAnimationFrame(step); else resolve();
      };
      requestAnimationFrame(step);
    });
    setFacing("front");
    setMode("idle");
  }

  async function navigate(targetText: string) {
    const api = (window as unknown as { FlowPanelIntegration?: PanelApi }).FlowPanelIntegration;
    const target = api?.findTarget(targetText);
    if (!api || !target) {
      setBubble(`No encuentro ${targetText}.`);
      setOpen(true);
      return;
    }

    let element = api.findElement(target.key);
    if (!element) {
      const result = await api.navigate(target.key);
      setBubble(result.message);
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    await sleep(450);
    element = api.findElement(target.key) || element;
    const rect = element.getBoundingClientRect();
    const destination = {
      left: clamp(rect.right + 10, EDGE, window.innerWidth - CHARACTER_WIDTH - EDGE),
      top: clamp(rect.top + rect.height / 2 - CHARACTER_HEIGHT / 2, EDGE, window.innerHeight - CHARACTER_HEIGHT - EDGE),
    };

    setBubble(`Voy a ${target.label}.`);
    setOpen(false);
    await animateTo(destination);
    element.classList.add("flow-panel-target-highlight");
    setMode("point");
    setBubble(`Aquí está ${target.label}.`);
    await sleep(1100);
    element.click();
    element.classList.remove("flow-panel-target-highlight");
    setMode("idle");
    setOpen(true);
  }

  async function wave() {
    setMode("wave");
    setBubble("¡Hola! Estoy aquí contigo.");
    setOpen(true);
    await sleep(1700);
    setMode("idle");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((current) => [...current, { id: id("user"), role: "user", text }]);
    const targets = (window as unknown as { FlowPanelIntegration?: PanelApi }).FlowPanelIntegration?.targets || [];
    const target = detectTarget(text, targets);
    if (target) {
      await navigate(target.key);
      return;
    }

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setBubble("Estoy reconectando con mi cerebro.");
      setOpen(true);
      connect();
      return;
    }
    setMode("thinking");
    setBubble("Estoy pensando...");
    socketRef.current.send(JSON.stringify({ type: "message", companionId: "flow-web", userId: "flowly-user", text }));
  }

  const statusText = useMemo(() => connected ? (mode === "walk" ? "caminando" : mode === "talk" ? "hablando" : mode === "thinking" ? "pensando" : "listo") : "conectando", [connected, mode]);

  return (
    <div className="flow-companion-root" data-flow-companion="final">
      <div className="flow-companion-character" style={{ left: position.left, top: position.top }}>
        <FlowCharacter3D mode={mode} facing={facing} pointer={pointer} emotion={emotion} onClick={() => setOpen((value) => !value)} />
        <span className={`flow-companion-status is-${connected ? "online" : "offline"}`}>{statusText}</span>
        {!open && <button type="button" className="flow-companion-bubble" onClick={() => setOpen(true)}>{bubble}</button>}
        <div className="flow-companion-quick-actions">
          <button type="button" onClick={() => void wave()}><Sparkles size={14} /> Saludar</button>
          <button type="button" onClick={() => void navigate("crm")}><Navigation size={14} /> CRM</button>
        </div>
      </div>

      {open && (
        <section className="flow-companion-panel">
          <header>
            <div><strong>Flow</strong><span>{statusText} · conectado al Gateway</span></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar"><X size={16} /></button>
          </header>
          <div className="flow-companion-messages">
            {messages.slice(-8).map((message) => <div key={message.id} className={`is-${message.role}`}>{message.text}</div>)}
          </div>
          <form onSubmit={submit}>
            <button type="button" aria-label="Voz próximamente"><Mic size={15} /></button>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Flow, llévame al CRM" />
            <button type="submit" aria-label="Enviar"><Send size={15} /></button>
          </form>
        </section>
      )}
    </div>
  );
}
