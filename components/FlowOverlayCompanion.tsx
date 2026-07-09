"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, ChevronUp, Mic, Minimize2, Navigation, Send, Sparkles, X } from "lucide-react";
import FlowRealAssistant3D from "@/components/FlowRealAssistant3D";

const GATEWAY_URL = process.env.NEXT_PUBLIC_FLOW_COMPANION_GATEWAY_URL || "https://flowly-companion-gateway.onrender.com";

type FlowStatus = "idle" | "connecting" | "ready" | "thinking" | "speaking" | "error";
type OverlayPosition = "bottom-right" | "bottom-left" | "center-right" | "custom";
type AvatarMode = "idle" | "walk" | "wave" | "talk" | "point" | "thinking";

type ChatMessage = {
  id: string;
  role: "user" | "flow" | "system";
  text: string;
};

type NavigationTarget = {
  key: string;
  label: string;
  aliases: string[];
  selector: string;
};

type CustomPosition = {
  left: number;
  top: number;
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

type FlowPanelTarget = {
  key: string;
  label: string;
  aliases: string[];
  selector: string;
  route?: string;
};

type FlowPanelIntegrationApi = {
  targets: FlowPanelTarget[];
  findTarget: (target: string) => FlowPanelTarget | null;
  findElement: (target: string) => HTMLElement | null;
  navigate: (target: string) => Promise<FlowPanelNavigateResult>;
  click: (target: string) => Promise<FlowPanelNavigateResult>;
  context: () => unknown;
};

declare global {
  interface Window {
    FlowPanelIntegration?: FlowPanelIntegrationApi;
  }
}

const NAVIGATION_TARGETS: NavigationTarget[] = [
  { key: "flow", label: "Flow Companion", aliases: ["flow", "companion", "asistente"], selector: '[data-flow-target="flow"]' },
  { key: "area", label: "Área personal", aliases: ["dashboard", "area", "área", "inicio", "panel", "home"], selector: '[data-flow-target="area"]' },
  { key: "crm", label: "CRM", aliases: ["crm", "cliente", "clientes", "contacto", "contactos"], selector: '[data-flow-module="crm"], [data-flow-target="clientes"], [data-flow-target="crm"]' },
  { key: "facturacion", label: "Facturación", aliases: ["facturacion", "facturación", "factura", "facturas", "presupuesto", "presupuestos", "billing"], selector: '[data-flow-module="facturacion"], [data-flow-module="billing"], [data-flow-target="facturacion"]' },
  { key: "whatsapp", label: "WhatsApp", aliases: ["whatsapp", "wasap", "wsp", "mensajes"], selector: '[data-flow-module="whatsapp"], [data-flow-target="whatsapp"]' },
  { key: "agenda", label: "Agenda", aliases: ["agenda", "calendario", "citas", "cita"], selector: '[data-flow-target="agenda"], [data-flow-module="agenda-pro"]' },
  { key: "servicios", label: "Servicios", aliases: ["servicio", "servicios"], selector: '[data-flow-target="servicios"]' },
  { key: "empleados", label: "Empleados", aliases: ["empleado", "empleados", "equipo"], selector: '[data-flow-target="empleados"]' },
  { key: "recordatorios", label: "Recordatorios", aliases: ["recordatorio", "recordatorios", "alarma", "alarmas"], selector: '[data-flow-target="recordatorios"]' },
  { key: "ajustes", label: "Ajustes", aliases: ["ajuste", "ajustes", "configuracion", "configuración"], selector: '[data-flow-target="ajustes"]' },
  { key: "automatizaciones", label: "Automatizaciones", aliases: ["automatizacion", "automatización", "automatizaciones", "flujos"], selector: '[data-flow-module="automatizaciones"], [data-flow-module="automations"]' },
  { key: "marketing", label: "Marketing", aliases: ["marketing", "campañas", "campanas", "ads"], selector: '[data-flow-module="marketing"]' },
  { key: "estadisticas", label: "Estadísticas", aliases: ["estadisticas", "estadísticas", "metricas", "métricas", "analytics"], selector: '[data-flow-module="estadisticas"], [data-flow-module="analytics"]' },
];

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
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

function detectNavigationTarget(text: string) {
  const normalized = normalizeText(text);
  const hasNavigationIntent = /\b(llevame|llevarme|abre|abrir|ve|ir|vamos|entra|entrar|muestrame|mostrar|navega|navegar|pulsa|click|clic)\b/.test(normalized);
  if (!hasNavigationIntent) return null;
  return NAVIGATION_TARGETS.find((target) => target.aliases.some((alias) => normalized.includes(normalizeText(alias)))) || null;
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
  if (position === "custom") return "";
  return "bottom-5 right-5 md:bottom-7 md:right-7";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function findTargetElement(target: NavigationTarget) {
  const direct = document.querySelector<HTMLElement>(target.selector);
  if (direct) return direct;

  const candidates = Array.from(document.querySelectorAll<HTMLElement>("button, a, [role='button']"));
  const targetAliases = target.aliases.map(normalizeText);

  return candidates.find((element) => {
    const text = normalizeText(element.innerText || element.textContent || element.getAttribute("aria-label") || "");
    return targetAliases.some((alias) => text.includes(alias));
  }) || null;
}

function computeOverlayPosition(element: HTMLElement, panelWidth = 220, estimatedHeight = 240): CustomPosition {
  const rect = element.getBoundingClientRect();
  const margin = 16;
  const rightCandidate = rect.right + margin;
  const leftCandidate = rect.left - panelWidth - margin;
  const left = rightCandidate + panelWidth < window.innerWidth ? rightCandidate : Math.max(margin, leftCandidate);
  const top = clamp(rect.top + rect.height / 2 - estimatedHeight / 2, margin, Math.max(margin, window.innerHeight - estimatedHeight - margin));
  return { left, top };
}

export default function FlowOverlayCompanion() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState<OverlayPosition>("bottom-right");
  const [customPosition, setCustomPosition] = useState<CustomPosition | null>(null);
  const [status, setStatus] = useState<FlowStatus>("connecting");
  const [input, setInput] = useState("");
  const [activeNavigation, setActiveNavigation] = useState<string | null>(null);
  const [avatarMode, setAvatarMode] = useState<AvatarMode>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "flow",
      text: "Soy el nuevo Flow. Estoy flotando sobre el panel sin bloquearlo. Pídeme: llévame al CRM.",
    },
  ]);
  const mountedRef = useRef(true);

  const positionClasses = useMemo(() => getPositionClasses(position), [position]);
  const customStyle = position === "custom" && customPosition ? { left: customPosition.left, top: customPosition.top } : undefined;

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
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ target?: string }>).detail;
      const targetValue = String(detail?.target || "");
      const target = NAVIGATION_TARGETS.find((item) => item.key === targetValue || item.aliases.includes(targetValue));
      if (target) void navigateToTarget(target);
    };

    window.addEventListener("flow:navigate-to", handler as EventListener);
    (window as unknown as { FlowOverlay?: { navigateTo: (target: string) => void } }).FlowOverlay = {
      navigateTo: (targetKey: string) => {
        const target = NAVIGATION_TARGETS.find((item) => item.key === targetKey || item.aliases.includes(targetKey));
        if (target) void navigateToTarget(target);
      },
    };

    return () => window.removeEventListener("flow:navigate-to", handler as EventListener);
  }, []);

  async function navigateToTarget(target: NavigationTarget, options?: { silent?: boolean }) {
    setMinimized(false);
    setOpen(false);
    setStatus("thinking");
    setAvatarMode("walk");
    setActiveNavigation(target.key);

    if (!options?.silent) {
      setMessages((current) => [...current, { id: createId("flow"), role: "flow", text: `Voy contigo a ${target.label}.` }]);
    }

    if (window.FlowPanelIntegration) {
      const result = await window.FlowPanelIntegration.navigate(target.key);

      if (!result.ok) {
        setOpen(true);
        setStatus("error");
        setAvatarMode("idle");
        setMessages((current) => [...current, { id: createId("system"), role: "system", text: result.message }]);
        setActiveNavigation(null);
        return;
      }

      if (result.rect) {
        setCustomPosition({
          left: clamp(result.rect.centerX + 18, 16, window.innerWidth - 260),
          top: clamp(result.rect.centerY - 140, 16, window.innerHeight - 270),
        });
        setPosition("custom");
      }

      setStatus("speaking");
      setAvatarMode("point");
      setMessages((current) => [...current, { id: createId("flow"), role: "flow", text: `Ya he abierto ${target.label}.` }]);
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      setStatus("ready");
      setAvatarMode("idle");
      setOpen(true);
      setActiveNavigation(null);
      return;
    }

    if (!window.location.pathname.startsWith("/dashboard")) {
      window.localStorage.setItem("flow_pending_navigation_target", target.key);
      window.location.href = "/dashboard";
      return;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 50));
    let element = findTargetElement(target);

    if (!element) {
      setOpen(true);
      setStatus("error");
      setAvatarMode("idle");
      setMessages((current) => [...current, { id: createId("system"), role: "system", text: `No encuentro el acceso a ${target.label} en esta pantalla.` }]);
      setActiveNavigation(null);
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    await new Promise((resolve) => window.setTimeout(resolve, 450));

    element = findTargetElement(target) || element;
    setCustomPosition(computeOverlayPosition(element));
    setPosition("custom");

    element.classList.add("flow-overlay-target-highlight");
    await new Promise((resolve) => window.setTimeout(resolve, 900));

    element.click();
    setStatus("speaking");
    setAvatarMode("point");
    setMessages((current) => [...current, { id: createId("flow"), role: "flow", text: `Ya he abierto ${target.label}.` }]);

    await new Promise((resolve) => window.setTimeout(resolve, 700));
    element.classList.remove("flow-overlay-target-highlight");
    setStatus("ready");
    setAvatarMode("idle");
    setOpen(true);
    setActiveNavigation(null);
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;

    setInput("");
    setOpen(true);
    setMessages((current) => [...current, { id: createId("user"), role: "user", text }]);

    const target = detectNavigationTarget(text);
    if (target) {
      await navigateToTarget(target);
      return;
    }

    setStatus("thinking");
    setAvatarMode("thinking");

    try {
      const response = await fetch(`${GATEWAY_URL.replace(/\/$/, "")}/health`, { cache: "no-store" });
      setStatus(response.ok ? "speaking" : "error");
      setAvatarMode(response.ok ? "talk" : "idle");
      setMessages((current) => [
        ...current,
        {
          id: createId("flow"),
          role: "flow",
          text: response.ok
            ? "Estoy conectado al Gateway. El siguiente paso será conectar este overlay al chat completo del Companion."
            : "Estoy visible, pero ahora mismo no puedo comprobar el Gateway.",
        },
      ]);
      window.setTimeout(() => {
        setStatus(response.ok ? "ready" : "error");
        setAvatarMode("idle");
      }, 900);
    } catch {
      setStatus("error");
      setAvatarMode("idle");
      setMessages((current) => [...current, { id: createId("system"), role: "system", text: "No he podido contactar con el Companion ahora mismo." }]);
    }
  }

  const cyclePosition = () => {
    setCustomPosition(null);
    setPosition((current) => {
      if (current === "bottom-right") return "center-right";
      if (current === "center-right") return "bottom-left";
      return "bottom-right";
    });
  };

  const waveFlow = () => {
    setAvatarMode("wave");
    window.setTimeout(() => setAvatarMode("idle"), 1400);
  };

  if (minimized) {
    return (
      <div className="flow-overlay-root pointer-events-none fixed inset-0 z-[70]">
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
    <div className="flow-overlay-root pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-live="polite">
      <div
        className={`flow-overlay-companion flow-overlay-free-character pointer-events-none fixed ${positionClasses} ${activeNavigation ? "is-navigating" : ""}`}
        style={customStyle}
      >
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flow-overlay-avatar flow-overlay-free-avatar pointer-events-auto"
          aria-label="Hablar con Flow"
        >
          <div className="flow-overlay-avatar-3d">
            <FlowRealAssistant3D mode={avatarMode} facing="front" compact />
          </div>
          <span className={`flow-overlay-free-status is-${status}`} />
        </button>

        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flow-overlay-free-bubble flow-overlay-free-bubble-closed pointer-events-auto"
            aria-label="Abrir conversación con Flow"
          >
            <strong>Flow</strong>
            <span>{activeNavigation ? `yendo a ${activeNavigation}` : statusLabel(status)}</span>
          </button>
        )}

        {open && (
          <div className="flow-overlay-panel flow-overlay-free-bubble pointer-events-auto">
            <div className="flow-overlay-panel-head">
              <div>
                <p>Flow</p>
                <span>{activeNavigation ? `Yendo a ${activeNavigation}` : statusLabel(status)}</span>
              </div>
              <div className="flow-overlay-actions">
                <button type="button" onClick={cyclePosition} aria-label="Mover Flow"><Navigation size={14} /></button>
                <button type="button" onClick={waveFlow} aria-label="Saludar"><Sparkles size={14} /></button>
                <button type="button" onClick={() => setMinimized(true)} aria-label="Minimizar Flow"><Minimize2 size={14} /></button>
                <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar panel"><X size={14} /></button>
              </div>
            </div>

            <div className="flow-overlay-messages">
              {messages.slice(-7).map((message) => (
                <div key={message.id} className={`flow-overlay-message is-${message.role}`}>{message.text}</div>
              ))}
            </div>

            <div className="flow-overlay-quick-actions">
              <button type="button" onClick={() => void navigateToTarget(NAVIGATION_TARGETS.find((item) => item.key === "crm")!)}>Ir al CRM</button>
              <button type="button" onClick={() => void navigateToTarget(NAVIGATION_TARGETS.find((item) => item.key === "facturacion")!)}>Facturación</button>
              <button type="button" onClick={() => void navigateToTarget(NAVIGATION_TARGETS.find((item) => item.key === "whatsapp")!)}>WhatsApp</button>
            </div>

            <form onSubmit={sendMessage} className="flow-overlay-input-row">
              <button type="button" className="flow-overlay-icon-button" aria-label="Voz próximamente"><Mic size={15} /></button>
              <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ej: Flow, llévame al CRM" />
              <button type="submit" className="flow-overlay-send" aria-label="Enviar"><Send size={15} /></button>
            </form>

            <div className="flow-overlay-hint">Prueba: “Flow, llévame al CRM”, “abre facturación” o “ve a WhatsApp”.</div>
          </div>
        )}
      </div>
    </div>
  );
}
