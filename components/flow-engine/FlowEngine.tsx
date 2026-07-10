"use client";

import { FormEvent, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Mic, Navigation, Send, Sparkles, X } from "lucide-react";
import FlowCharacter from "./FlowCharacter";
import { detectNavigationTarget, getTargetDestination, highlightTarget } from "./domNavigator";
import { FlowGatewayClient } from "./gatewayClient";
import { walkFlowTo } from "./movementController";
import { createInitialFlowState, flowReducer } from "./stateMachine";
import { FlowMode, FlowPanelTarget } from "./types";

const HTTP = (process.env.NEXT_PUBLIC_FLOW_COMPANION_GATEWAY_URL || "https://flowly-companion-gateway.onrender.com").replace(/\/$/, "");
const WS = HTTP.replace(/^http:/, "ws:").replace(/^https:/, "wss:") + "/flow-companion";
const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
const uid = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

export default function FlowEngine() {
  const [state, dispatch] = useReducer(flowReducer, undefined, createInitialFlowState);
  const [input, setInput] = useState("");
  const stateRef = useRef(state); stateRef.current = state;
  const clientRef = useRef<FlowGatewayClient | null>(null);

  useEffect(() => {
    const client = new FlowGatewayClient(WS, {
      onConnected: (connected) => dispatch({ type: "connected", connected }),
      onMode: (mode) => dispatch({ type: "mode", mode }),
      onEmotion: (emotion) => dispatch({ type: "emotion", emotion }),
      onMessage: (text) => { dispatch({ type: "bubble", text }); dispatch({ type: "message", message: { id: uid("flow"), role: "flow", text } }); dispatch({ type: "open", open: true }); },
      onAction: (name, payload) => { if (name === "navigate.to" && payload && typeof payload === "object" && "target" in payload) void navigate(String((payload as { target: unknown }).target)); },
    });
    clientRef.current = client; client.connect(); return () => client.disconnect();
  }, []);

  async function setTemporaryMode(mode: FlowMode, duration: number) { dispatch({ type: "mode", mode }); await sleep(duration); dispatch({ type: "mode", mode: "idle" }); }

  async function navigate(targetText: string) {
    const api = window.FlowPanelIntegration;
    const target = api?.findTarget(targetText);
    if (!api || !target) { dispatch({ type: "bubble", text: `No encuentro ${targetText}.` }); dispatch({ type: "open", open: true }); return; }
    let element = api.findElement(target.key);
    if (!element) { const result = await api.navigate(target.key); dispatch({ type: "bubble", text: result.message }); return; }
    element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" }); await sleep(400); element = api.findElement(target.key) || element;
    dispatch({ type: "bubble", text: `Voy a ${target.label}.` }); dispatch({ type: "open", open: false });
    await walkFlowTo(stateRef.current.position, getTargetDestination(element), {
      onPosition: (position) => dispatch({ type: "position", ...position }), onFacing: (facing) => dispatch({ type: "facing", facing }), onWalking: (walking) => dispatch({ type: "mode", mode: walking ? "walking" : "idle" }),
    });
    highlightTarget(element, true); dispatch({ type: "mode", mode: "pointing" }); dispatch({ type: "bubble", text: `Aquí está ${target.label}.` }); await sleep(950); element.click(); highlightTarget(element, false); dispatch({ type: "mode", mode: "idle" }); dispatch({ type: "open", open: true });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const text = input.trim(); if (!text) return; setInput(""); dispatch({ type: "message", message: { id: uid("user"), role: "user", text } });
    const targets: FlowPanelTarget[] = window.FlowPanelIntegration?.targets || []; const target = detectNavigationTarget(text, targets); if (target) { await navigate(target.key); return; }
    dispatch({ type: "mode", mode: "thinking" }); dispatch({ type: "bubble", text: "Estoy pensando..." });
    if (!clientRef.current?.sendText(text)) { dispatch({ type: "mode", mode: "error" }); dispatch({ type: "bubble", text: "Estoy reconectando con mi cerebro." }); clientRef.current?.connect(); }
  }

  const status = useMemo(() => state.connected ? (state.mode === "walking" ? "caminando" : state.mode === "talking" ? "hablando" : state.mode === "thinking" ? "pensando" : "listo") : "conectando", [state.connected, state.mode]);

  return <div className="flow-engine-root" data-flow-runtime="engine-v1">
    <div className="flow-engine-character" style={{ left: state.position.left, top: state.position.top }}>
      <FlowCharacter mode={state.mode} facing={state.facing} emotion={state.emotion} onClick={() => dispatch({ type: "open", open: !state.open })} />
      <span className={`flow-engine-status is-${state.connected ? "online" : "offline"}`}>{status}</span>
      {!state.open && <button className="flow-engine-bubble" type="button" onClick={() => dispatch({ type: "open", open: true })}>{state.bubble}</button>}
      <div className="flow-engine-actions"><button type="button" onClick={() => void setTemporaryMode("waving", 1600)}><Sparkles size={14}/> Saludar</button><button type="button" onClick={() => void navigate("crm")}><Navigation size={14}/> CRM</button></div>
    </div>
    {state.open && <section className="flow-engine-panel"><header><div><strong>Flow</strong><span>{status} · corazón, cerebro y Gateway activos</span></div><button type="button" onClick={() => dispatch({ type: "open", open: false })}><X size={16}/></button></header><div className="flow-engine-messages">{state.messages.slice(-8).map((m) => <div key={m.id} className={`is-${m.role}`}>{m.text}</div>)}</div><form onSubmit={submit}><button type="button"><Mic size={15}/></button><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Flow, llévame al CRM"/><button type="submit"><Send size={15}/></button></form></section>}
  </div>;
}
