"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, ChevronDown, Mic, Navigation, Send, Sparkles, X } from "lucide-react";
import FlowRealAssistant3D from "@/components/FlowRealAssistant3D";

type FlowMode = "idle" | "walk" | "wave" | "talk" | "point" | "thinking";
type FlowStatus = "ready" | "thinking" | "walking" | "speaking" | "error";
type FlowFacing = "front" | "left" | "right";

type FlowPanelTarget = {
  key: string;
  label: string;
  aliases: string[];
  selector: string;
  route?: string;
};

type FlowPanelNavigateResult = {
  ok: boolean;
  target?: string;
  label?: string;
  message: string;
  rect?: {
    left: number;
    top: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  };
};

type FlowPanelIntegrationApi = {
  targets: FlowPanelTarget[];
  findTarget: (target: string) => FlowPanelTarget | null;
  findElement: (target: string) => HTMLElement | null;
  navigate: (target: string) => Promise<FlowPanelNavigateResult>;
  click: (target: string) => Promise<FlowPanelNavigateResult>;
  context: () => unknown;
};

type RuntimeWindow = Window & {
  FlowPanelIntegration?: FlowPanelIntegrationApi;
  FlowRuntimeV2?: {
    navigateTo: (target: string) => void;
    say: (text: string) => void;
    wave: () => void;
  };
};

type ChatMessage = {
  id: string;
  role: "user" | "flow" | "system";
  text: string;
};

const DEFAULT_POSITION = { left: 88, top: 68 };
const CHARACTER_WIDTH = 175;
const CHARACTER_HEIGHT = 245;
const EDGE_MARGIN = 18;

const FALLBACK_TARGETS = [
  { key: "crm", label: "CRM", aliases: ["crm", "clientes", "cliente", "contactos"] },
  { key: "facturacion", label: "Facturación", aliases: ["facturacion", "facturación", "factura", "facturas", "presupuesto", "presupuestos"] },
  { key: "whatsapp", label: "WhatsApp", aliases: ["whatsapp", "wasap", "wsp", "mensajes"] },
  { key: "agenda", label: "Agenda", aliases: ["agenda", "calendario", "citas"] },
  { key: "area", label: "Área personal", aliases: ["area", "área", "inicio", "dashboard", "panel"] },
];

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getRuntimeWindow() {
  return window as RuntimeWindow;
}

function detectTarget(text: string, panelTargets: FlowPanelTarget[]) {
  const normalized = normalizeText(text);
  const hasIntent = /\b(llevame|llevarme|abre|abrir|ve|ir|vamos|entra|entrar|muestrame|mostrar|navega|navegar|pulsa|click|clic)\b/.test(normalized);
  if (!hasIntent) return null;

  const targets = panelTargets.length
    ? panelTargets.map((target) => ({ key: target.key, label: target.label, aliases: [target.key, target.label, ...target.aliases] }))
    : FALLBACK_TARGETS;

  return targets.find((target) => target.aliases.some((alias) => normalized.includes(normalizeText(alias)))) || null;
}

function getTargetPosition(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const placeOnRight = rect.left + rect.width / 2 < window.innerWidth * 0.66;
  const left = placeOnRight
    ? rect.right + 22
    : rect.left - CHARACTER_WIDTH - 22;

  return {
    left: clamp(left, EDGE_MARGIN, window.innerWidth - CHARACTER_WIDTH - EDGE_MARGIN),
    top: clamp(rect.top + rect.height / 2 - CHARACTER_HEIGHT * 0.5, EDGE_MARGIN, window.innerHeight - CHARACTER_HEIGHT - EDGE_MARGIN),
    facing: placeOnRight ? "left" as FlowFacing : "right" as FlowFacing,
  };
}

function getStatusText(status: FlowStatus) {
  if (status === "thinking") return "pensando";
  if (status === "walking") return "caminando";
  if (status === "speaking") return "hablando";
  if (status === "error") return "revisar";
  return "listo";
}

export default function FlowRuntime() {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [mode, setMode] = useState<FlowMode>("idle");
  const [status, setStatus] = useState<FlowStatus>("ready");
  const [facing, setFacing] = useState<FlowFacing>("front");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [bubble, setBubble] = useState("Soy el nuevo Flow. Puedo moverme por el panel.");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "flow", text: "Nuevo Flow Runtime v2 activo. Pídeme: llévame al CRM." },
  ]);
  const mouseRef = useRef({ x: 0, y: 0 });

  const panelTargets = useMemo(() => {
    if (typeof window === "undefined") return [] as FlowPanelTarget[];
    return getRuntimeWindow().FlowPanelIntegration?.targets || [];
  }, [open, status]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current = { x: event.clientX, y: event.clientY };
      if (mode === "walk" || mode === "point") return;

      const characterCenterX = position.left + CHARACTER_WIDTH / 2;
      const distance = event.clientX - characterCenterX;
      if (Math.abs(distance) < 160) setFacing("front");
      else setFacing(distance > 0 ? "right" : "left");
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mode, position.left]);

  useEffect(() => {
    const runtime = getRuntimeWindow();
    runtime.FlowRuntimeV2 = {
      navigateTo: (target: string) => void navigateTo(target),
      say: (text: string) => speak(text),
      wave: () => wave(),
    };

    const handleCommand = (event: Event) => {
      const detail = (event as CustomEvent<{ target?: string; text?: string }>).detail;
      const target = detail?.target || detail?.text;
      if (target) void navigateTo(target);
    };

    window.addEventListener("flow:navigate-to", handleCommand as EventListener);
    window.addEventListener("flow:panel-navigate", handleCommand as EventListener);

    return () => {
      delete runtime.FlowRuntimeV2;
      window.removeEventListener("flow:navigate-to", handleCommand as EventListener);
      window.removeEventListener("flow:panel-navigate", handleCommand as EventListener);
    };
  }, [position.left, position.top]);

  async function speak(text: string) {
    setBubble(text);
    setStatus("speaking");
    setMode("talk");
    setMessages((current) => [...current, { id: createId("flow"), role: "flow", text }]);
    await sleep(1200);
    setMode("idle");
    setStatus("ready");
  }

  function wave() {
    setBubble("¡Hola! Estoy aquí.");
    setOpen(true);
    setMode("wave");
    setStatus("speaking");
    window.setTimeout(() => {
      setMode("idle");
      setStatus("ready");
    }, 1550);
  }

  async function navigateTo(rawTarget: string) {
    const runtime = getRuntimeWindow();
    const integration = runtime.FlowPanelIntegration;
    const target = integration?.findTarget(rawTarget) || null;
    const targetKey = target?.key || rawTarget;
    const targetLabel = target?.label || rawTarget;

    setOpen(false);
    setStatus("walking");
    setMode("walk");
    setBubble(`Voy a ${targetLabel}.`);

    let element = integration?.findElement(targetKey) || null;

    if (!element && integration) {
      const result = await integration.navigate(targetKey);
      if (result.rect) {
        const next = {
          left: clamp(result.rect.centerX + 22, EDGE_MARGIN, window.innerWidth - CHARACTER_WIDTH - EDGE_MARGIN),
          top: clamp(result.rect.centerY - CHARACTER_HEIGHT / 2, EDGE_MARGIN, window.innerHeight - CHARACTER_HEIGHT - EDGE_MARGIN),
        };
        setPosition(next);
      }

      if (!result.ok) {
        setStatus("error");
        setMode("idle");
        setOpen(true);
        setBubble(result.message);
        setMessages((current) => [...current, { id: createId("system"), role: "system", text: result.message }]);
        return;
      }

      await sleep(700);
      setMode("point");
      setStatus("speaking");
      setBubble(result.message || `${targetLabel} abierto.`);
      setMessages((current) => [...current, { id: createId("flow"), role: "flow", text: result.message || `${targetLabel} abierto.` }]);
      await sleep(900);
      setMode("idle");
      setStatus("ready");
      setOpen(true);
      return;
    }

    if (!element) {
      setStatus("error");
      setMode("idle");
      setOpen(true);
      setBubble(`No encuentro ${targetLabel}.`);
      setMessages((current) => [...current, { id: createId("system"), role: "system", text: `No encuentro ${targetLabel} en esta pantalla.` }]);
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    await sleep(420);

    element = integration?.findElement(targetKey) || element;
    const next = getTargetPosition(element);
    setFacing(next.facing);
    setPosition({ left: next.left, top: next.top });

    await sleep(950);
    element.classList.add("flow-panel-target-highlight");
    setMode("point");
    setStatus("speaking");
    setBubble(`Aquí está ${targetLabel}.`);

    await sleep(800);
    element.click();
    element.classList.remove("flow-panel-target-highlight");

    setMessages((current) => [...current, { id: createId("flow"), role: "flow", text: `Ya he abierto ${targetLabel}.` }]);
    setBubble(`Ya he abierto ${targetLabel}.`);
    setMode("idle");
    setStatus("ready");
    setFacing("front");
    setOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;

    setInput("");
    setOpen(true);
    setMessages((current) => [...current, { id: createId("user"), role: "user", text }]);

    const target = detectTarget(text, panelTargets);
    if (target) {
      await navigateTo(target.key);
      return;
    }

    setStatus("thinking");
    setMode("thinking");
    setBubble("Estoy pensando...");
    await sleep(500);
    await speak("Estoy preparado para ayudarte dentro del panel. De momento puedo navegar por módulos como CRM, Facturación o WhatsApp.");
  }

  return (
    <div className="flow-runtime-v2-root" data-flow-runtime-v2="active">
      <div
        className={`flow-runtime-v2-character is-${status}`}
        style={{ left: position.left, top: position.top }}
      >
        <div className="flow-runtime-v2-marker">FLOW NUEVO ACTIVO</div>

        <button
          type="button"
          className="flow-runtime-v2-avatar"
          onClick={() => setOpen((value) => !value)}
          aria-label="Abrir Flow"
        >
          <FlowRealAssistant3D mode={mode} facing={facing} compact />
        </button>

        <div className={`flow-runtime-v2-status is-${status}`}>{getStatusText(status)}</div>

        {!open && <button type="button" className="flow-runtime-v2-bubble" onClick={() => setOpen(true)}>{bubble}</button>}

        <div className="flow-runtime-v2-actions">
          <button type="button" onClick={wave}><Sparkles size={14} /> Saludar</button>
          <button type="button" onClick={() => void navigateTo("crm")}><Navigation size={14} /> CRM</button>
        </div>
      </div>

      {open && (
        <section className="flow-runtime-v2-panel" aria-label="Flow Runtime v2">
          <header>
            <div>
              <strong>Flow Runtime v2</strong>
              <span>{getStatusText(status)} · IA y panel preparados</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar Flow"><X size={16} /></button>
          </header>

          <div className="flow-runtime-v2-messages">
            {messages.slice(-6).map((message) => (
              <div key={message.id} className={`flow-runtime-v2-message is-${message.role}`}>{message.text}</div>
            ))}
          </div>

          <div className="flow-runtime-v2-shortcuts">
            <button type="button" onClick={() => void navigateTo("crm")}>Ir al CRM</button>
            <button type="button" onClick={() => void navigateTo("facturacion")}>Facturación</button>
            <button type="button" onClick={() => void navigateTo("whatsapp")}>WhatsApp</button>
          </div>

          <form onSubmit={handleSubmit}>
            <button type="button" aria-label="Voz próximamente"><Mic size={15} /></button>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Flow, llévame al CRM" />
            <button type="submit" aria-label="Enviar"><Send size={15} /></button>
          </form>

          <small>Este es el único Flow activo. El anterior queda desactivado.</small>
        </section>
      )}
    </div>
  );
}
