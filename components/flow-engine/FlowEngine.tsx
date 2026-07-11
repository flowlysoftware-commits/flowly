"use client";

import { FormEvent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Mic, Navigation, Send, Sparkles, X } from "lucide-react";
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
  const [state, dispatch] = useReducer(flowReducer, undefined, createInitialFlowState);
  const [input, setInput] = useState("");
  const stateRef = useRef(state);
  const clientRef = useRef<FlowGatewayClient | null>(null);
  const navigationLock = useRef(false);
  const behaviourRef = useRef<FlowBehaviourEngine | null>(null);
  stateRef.current = state;

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
  }, [navigate]);


  useEffect(() => {
    const behaviour = new FlowBehaviourEngine({
      getMode: () => stateRef.current.mode,
      getEmotion: () => stateRef.current.emotion,
      isBlocked: () => navigationLock.current,
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
  }, []);

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

  return (
    <div className="flow-engine-root" data-flow-runtime="engine-v2">
      <div
        className={`flow-engine-character is-${state.mode}`}
        style={{ left: state.position.left, top: state.position.top }}
      >
        <FlowCharacter
          mode={state.mode}
          facing={state.facing}
          emotion={state.emotion}
          behaviourPulse={state.behaviourPulse}
          behaviourId={state.behaviourId}
          onClick={() => dispatch({ type: "open", open: !state.open })}
        />

        <span className={`flow-engine-status is-${state.connected ? "online" : "offline"}`}>
          {status}
        </span>

        {!state.open && (
          <button
            className="flow-engine-bubble"
            type="button"
            onClick={() => dispatch({ type: "open", open: true })}
          >
            {state.bubble}
          </button>
        )}

        <div className="flow-engine-actions">
          <button type="button" onClick={() => void setTemporaryMode("waving", 2200)}>
            <Sparkles size={14} /> Saludar
          </button>
          <button type="button" onClick={() => void navigate("crm")}>
            <Navigation size={14} /> CRM
          </button>
        </div>
      </div>

      {state.open && (
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
