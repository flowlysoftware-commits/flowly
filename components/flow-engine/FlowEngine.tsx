"use client";

import { FormEvent, PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Mic, Navigation, Send, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import FlowCharacter from "./FlowCharacter";
import { FlowBehaviourEngine } from "./behaviourEngine";
import { detectNavigationTarget, getTargetDestination, highlightTarget } from "./domNavigator";
import { FlowGatewayClient } from "./gatewayClient";
import { walkFlowTo } from "./movementController";
import { createInitialFlowState, flowReducer } from "./stateMachine";
import { FlowMode, FlowPanelTarget } from "./types";

const HTTP = (
  process.env.NEXT_PUBLIC_FLOW_COMPANION_GATEWAY_URL ||
  "https://flowly-companion-gateway.onrender.com"
).replace(/\/$/, "");
const WS = HTTP.replace(/^http:/, "ws:").replace(/^https:/, "wss:") + "/flow-companion";
const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
const uid = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

type IntroPhase = "hidden" | "welcome" | "walking-home" | "ready";

type DragState = {
  active: boolean;
  offsetX: number;
  offsetY: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getCompactSize() {
  return window.innerWidth <= 640
    ? { width: 238, height: 360 }
    : { width: 318, height: 470 };
}

function getHomePosition() {
  const size = getCompactSize();
  return {
    left: Math.max(12, window.innerWidth - size.width - 24),
    top: Math.max(12, window.innerHeight - size.height - 36),
  };
}

function getWelcomePosition() {
  const width = Math.min(window.innerWidth * 0.72, 680);
  const height = Math.min(window.innerHeight * 0.84, 760);
  return {
    left: Math.max(8, (window.innerWidth - width) / 2),
    top: Math.max(8, (window.innerHeight - height) / 2),
  };
}

function actionTarget(name: string, payload?: unknown) {
  const normalized = name.toLowerCase().replace(/[_\s]/g, ".");
  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    const value = data.target ?? data.module ?? data.destination ?? data.route;
    if (typeof value === "string" && value.trim()) return value;
  }

  const direct = normalized.match(/(?:navigate|open|go|visit)\.(?:to\.)?([a-z0-9-]+)/);
  return direct?.[1] || null;
}

export default function FlowEngine() {
  const pathname = usePathname();
  const enabled = pathname.startsWith("/dashboard");
  const [state, dispatch] = useReducer(flowReducer, undefined, createInitialFlowState);
  const [input, setInput] = useState("");
  const [introPhase, setIntroPhase] = useState<IntroPhase>("hidden");
  const [isThroned, setIsThroned] = useState(false);
  const [throneHover, setThroneHover] = useState(false);
  const stateRef = useRef(state);
  const introRef = useRef<IntroPhase>(introPhase);
  const clientRef = useRef<FlowGatewayClient | null>(null);
  const navigationLock = useRef(false);
  const behaviourRef = useRef<FlowBehaviourEngine | null>(null);
  const dragRef = useRef<DragState>({ active: false, offsetX: 0, offsetY: 0 });
  const throneRef = useRef<HTMLDivElement | null>(null);
  const thronedRef = useRef(false);
  stateRef.current = state;
  introRef.current = introPhase;
  thronedRef.current = isThroned;

  useEffect(() => {
    if (!enabled) {
      setIntroPhase("hidden");
      return;
    }

    const pending = window.sessionStorage.getItem("flow_companion_welcome_pending") === "1";

    if (!pending) {
      dispatch({ type: "position", ...getHomePosition() });
      setIntroPhase("ready");
      return;
    }

    window.sessionStorage.removeItem("flow_companion_welcome_pending");
    dispatch({ type: "position", ...getWelcomePosition() });
    dispatch({ type: "open", open: false });
    dispatch({ type: "mode", mode: "waving" });
    dispatch({
      type: "bubble",
      text: "¡Hola! Bienvenid@ a tu panel. Soy Flow y estoy aquí para ayudarte en lo que necesites.",
    });
    setIntroPhase("welcome");

    const speakTimer = window.setTimeout(() => {
      dispatch({ type: "mode", mode: "talking" });
    }, 1350);

    const walkTimer = window.setTimeout(() => {
      setIntroPhase("walking-home");
      dispatch({ type: "mode", mode: "walking" });
      dispatch({ type: "facing", facing: "right" });
      dispatch({ type: "position", ...getHomePosition() });
    }, 4600);

    const finishTimer = window.setTimeout(() => {
      dispatch({ type: "mode", mode: "idle" });
      dispatch({ type: "facing", facing: "front" });
      dispatch({ type: "bubble", text: "Estoy aquí. Pídeme lo que necesites." });
      setIntroPhase("ready");
    }, 7350);

    return () => {
      window.clearTimeout(speakTimer);
      window.clearTimeout(walkTimer);
      window.clearTimeout(finishTimer);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || introPhase !== "ready") return;
    const handleResize = () => {
      if (dragRef.current.active) return;
      const current = stateRef.current.position;
      const size = getCompactSize();
      dispatch({
        type: "position",
        left: clamp(current.left, 0, Math.max(0, window.innerWidth - size.width)),
        top: clamp(current.top, 0, Math.max(0, window.innerHeight - size.height)),
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [enabled, introPhase]);

  const navigate = useCallback(async (targetText: string) => {
    if (navigationLock.current) return;
    const api = window.FlowPanelIntegration;
    const target = api?.findTarget(targetText);

    if (!api || !target) {
      dispatch({ type: "bubble", text: `No encuentro ${targetText} en esta pantalla.` });
      dispatch({ type: "open", open: true });
      return;
    }

    navigationLock.current = true;
    behaviourRef.current?.noteActivity();

    try {
      let element = api.findElement(target.key);

      if (!element) {
        const result = await api.navigate(target.key);
        dispatch({ type: "bubble", text: result.message });
        dispatch({ type: "open", open: true });
        return;
      }

      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      await sleep(450);
      element = api.findElement(target.key) || element;

      dispatch({ type: "bubble", text: `Claro. Te acompaño a ${target.label}.` });
      dispatch({ type: "open", open: false });

      await walkFlowTo(stateRef.current.position, getTargetDestination(element), {
        onPosition: (position) => dispatch({ type: "position", ...position }),
        onFacing: (facing) => dispatch({ type: "facing", facing }),
        onWalking: (walking) =>
          dispatch({ type: "mode", mode: walking ? "walking" : "idle" }),
      });

      highlightTarget(element, true);
      dispatch({ type: "mode", mode: "pointing" });
      dispatch({ type: "bubble", text: `Aquí tienes ${target.label}.` });
      await sleep(900);
      element.click();
      await sleep(180);
      highlightTarget(element, false);
      dispatch({ type: "mode", mode: "idle" });
      dispatch({ type: "open", open: true });
    } finally {
      navigationLock.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const client = new FlowGatewayClient(WS, {
      onConnected: (connected) => dispatch({ type: "connected", connected }),
      onMode: (mode) => dispatch({ type: "mode", mode }),
      onEmotion: (emotion) => dispatch({ type: "emotion", emotion }),
      onMessage: (text) => {
        dispatch({ type: "bubble", text });
        dispatch({
          type: "message",
          message: { id: uid("flow"), role: "flow", text },
        });
        dispatch({ type: "open", open: true });
      },
      onAction: (name, payload) => {
        const target = actionTarget(name, payload);
        if (target) void navigate(target);
      },
    });

    clientRef.current = client;
    client.connect();
    return () => client.disconnect();
  }, [enabled, navigate]);


  useEffect(() => {
    if (!enabled) return;
    const behaviour = new FlowBehaviourEngine({
      getMode: () => stateRef.current.mode,
      getEmotion: () => stateRef.current.emotion,
      isBlocked: () => navigationLock.current || introRef.current !== "ready" || dragRef.current.active || thronedRef.current,
      onDecision: (decision) => {
        dispatch({ type: "behaviour", pulse: decision.pulse, id: decision.id });
        dispatch({ type: "mode", mode: decision.mode });
      },
      onReturnToIdle: (decision) => {
        dispatch({ type: "mode", mode: "idle" });
        dispatch({ type: "behaviour", pulse: decision.pulse + 1, id: null });
      },
    });

    behaviourRef.current = behaviour;
    behaviour.start();

    const markActivity = () => behaviour.noteActivity();
    window.addEventListener("pointerdown", markActivity, { passive: true });
    window.addEventListener("keydown", markActivity);
    window.addEventListener("scroll", markActivity, { passive: true });

    return () => {
      behaviour.stop();
      behaviourRef.current = null;
      window.removeEventListener("pointerdown", markActivity);
      window.removeEventListener("keydown", markActivity);
      window.removeEventListener("scroll", markActivity);
    };
  }, [enabled]);

  function beginDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (introRef.current !== "ready") return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const position = stateRef.current.position;
    dragRef.current = {
      active: true,
      offsetX: event.clientX - position.left,
      offsetY: event.clientY - position.top,
    };
    behaviourRef.current?.noteActivity();
    if (thronedRef.current) {
      setIsThroned(false);
      thronedRef.current = false;
    }
    dispatch({ type: "open", open: false });
    dispatch({ type: "mode", mode: "dragging" });
    dispatch({ type: "bubble", text: "¡Eh! Sujétame con cuidado 😄" });
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    event.preventDefault();
    const size = getCompactSize();
    dispatch({
      type: "position",
      left: clamp(event.clientX - dragRef.current.offsetX, 0, Math.max(0, window.innerWidth - size.width)),
      top: clamp(event.clientY - dragRef.current.offsetY, 0, Math.max(0, window.innerHeight - size.height)),
    });

    const throne = throneRef.current?.getBoundingClientRect();
    if (throne) {
      const margin = 42;
      setThroneHover(
        event.clientX >= throne.left - margin &&
        event.clientX <= throne.right + margin &&
        event.clientY >= throne.top - margin &&
        event.clientY <= throne.bottom + margin,
      );
    }
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    event.preventDefault();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current.active = false;

    const throne = throneRef.current?.getBoundingClientRect();
    const droppedOnThrone = Boolean(
      throne &&
      event.clientX >= throne.left - 52 &&
      event.clientX <= throne.right + 52 &&
      event.clientY >= throne.top - 52 &&
      event.clientY <= throne.bottom + 52
    );

    setThroneHover(false);

    if (throne && droppedOnThrone) {
      const size = getCompactSize();
      const left = clamp(
        throne.left + throne.width / 2 - size.width / 2,
        0,
        Math.max(0, window.innerWidth - size.width),
      );
      const top = clamp(
        throne.top + 26,
        0,
        Math.max(0, window.innerHeight - size.height),
      );

      setIsThroned(true);
      thronedRef.current = true;
      dispatch({ type: "position", left, top });
      dispatch({ type: "mode", mode: "seated" });
      dispatch({ type: "facing", facing: "front" });
      dispatch({ type: "open", open: false });
      dispatch({ type: "bubble", text: "Voy a descansar aquí un momento." });
      return;
    }

    setIsThroned(false);
    thronedRef.current = false;
    dispatch({ type: "mode", mode: "idle" });
    dispatch({ type: "facing", facing: "front" });
    dispatch({ type: "bubble", text: "Puedes colocarme donde te resulte más cómodo." });
  }

  async function setTemporaryMode(mode: FlowMode, duration: number) {
    dispatch({ type: "mode", mode });
    await sleep(duration);
    if (stateRef.current.mode === mode) dispatch({ type: "mode", mode: "idle" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;

    setInput("");
    behaviourRef.current?.noteActivity();
    dispatch({
      type: "message",
      message: { id: uid("user"), role: "user", text },
    });

    const targets: FlowPanelTarget[] = window.FlowPanelIntegration?.targets || [];
    const target = detectNavigationTarget(text, targets);

    if (target) {
      await navigate(target.key);
      return;
    }

    dispatch({ type: "mode", mode: "thinking" });
    dispatch({ type: "bubble", text: "Déjame pensarlo..." });

    const sentNow = clientRef.current?.sendText(text) ?? false;
    if (!sentNow) {
      dispatch({ type: "bubble", text: "Estoy reconectando con mi cerebro. Enviaré tu mensaje en cuanto vuelva." });
      clientRef.current?.connect();
    }
  }

  const status = useMemo(
    () =>
      state.connected
        ? state.mode === "walking"
          ? "caminando"
          : state.mode === "dragging"
            ? "en tus manos"
          : state.mode === "seated"
            ? "descansando"
          : state.mode === "talking"
            ? "hablando"
            : state.mode === "thinking"
              ? "pensando"
              : state.mode === "listening"
                ? "escuchando"
                : "listo"
        : "conectando",
    [state.connected, state.mode],
  );

  if (!enabled) return null;

  return (
    <div className={`flow-engine-root is-intro-${introPhase} ${isThroned ? "has-throned-flow" : ""}`} data-flow-runtime="engine-v2">
      {introPhase === "ready" && (
        <div
          ref={throneRef}
          className={`flow-engine-throne ${throneHover ? "is-drop-hover" : ""} ${isThroned ? "is-occupied" : ""}`}
          aria-label="Trono de Flow"
        >
          <div className="flow-engine-throne-aura" />
          <div className="flow-engine-throne-blades" aria-hidden="true">
            {Array.from({ length: 17 }, (_, index) => <i key={index} />)}
          </div>
          <div className="flow-engine-throne-crest"><span>F</span></div>
          <div className="flow-engine-throne-back">
            <span>FLOW</span>
          </div>
          <div className="flow-engine-throne-seat" />
          <div className="flow-engine-throne-arm is-left" />
          <div className="flow-engine-throne-arm is-right" />
          <div className="flow-engine-throne-base" />
          {!isThroned && <small>Arrastra a Flow aquí para descansar</small>}
        </div>
      )}
      <div
        className={`flow-engine-character is-${state.mode} is-intro-${introPhase} ${isThroned ? "is-throned" : ""}`}
        style={{ left: state.position.left, top: state.position.top }}
      >
        {introPhase === "ready" && (
          <div
            className="flow-engine-grab-handle"
            onPointerDown={beginDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            title="Arrastra a Flow por la cabeza"
            aria-label="Mover a Flow"
          />
        )}
        <FlowCharacter
          mode={state.mode}
          facing={state.facing}
          emotion={state.emotion}
          behaviourPulse={state.behaviourPulse}
          behaviourId={state.behaviourId}
          onClick={() => {
            if (introRef.current === "ready" && !dragRef.current.active && !thronedRef.current) {
              dispatch({ type: "open", open: !state.open });
            }
          }}
        />

        {introPhase === "welcome" && (
          <div className="flow-engine-welcome-card">
            <strong>¡Hola! Bienvenid@ a tu panel</strong>
            <span>Flow aquí para ayudarte en lo que necesites.</span>
          </div>
        )}

        {introPhase === "walking-home" && (
          <div className="flow-engine-welcome-card is-moving">Voy a colocarme aquí abajo para acompañarte.</div>
        )}

        {introPhase === "ready" && !isThroned && (
          <span className={`flow-engine-status is-${state.connected ? "online" : "offline"}`}>
            {status}
          </span>
        )}

        {introPhase === "ready" && !isThroned && !state.open && (
          <button
            className="flow-engine-bubble"
            type="button"
            onClick={() => dispatch({ type: "open", open: true })}
          >
            {state.bubble}
          </button>
        )}

        {introPhase === "ready" && !isThroned && <div className="flow-engine-actions">
          <button type="button" onClick={() => void setTemporaryMode("waving", 2200)}>
            <Sparkles size={14} /> Saludar
          </button>
          <button type="button" onClick={() => void navigate("crm")}>
            <Navigation size={14} /> CRM
          </button>
        </div>}
      </div>

      {introPhase === "ready" && state.open && (
        <section className="flow-engine-panel">
          <header>
            <div>
              <strong>Flow</strong>
              <span>{status} · OpenAI, memoria, emociones y Gateway activos</span>
            </div>
            <button type="button" onClick={() => dispatch({ type: "open", open: false })}>
              <X size={16} />
            </button>
          </header>

          <div className="flow-engine-messages">
            {state.messages.slice(-10).map((message) => (
              <div key={message.id} className={`is-${message.role}`}>
                {message.text}
              </div>
            ))}
          </div>

          <form onSubmit={submit}>
            <button type="button" aria-label="Micrófono próximamente">
              <Mic size={15} />
            </button>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Pregúntame algo o dime: llévame al CRM"
            />
            <button type="submit" aria-label="Enviar mensaje">
              <Send size={15} />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
