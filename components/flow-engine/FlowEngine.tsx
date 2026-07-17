"use client";

import { FormEvent, PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Mic, Navigation, Send, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import FlowCharacter from "./FlowCharacter";
import { FlowBehaviourEngine } from "./behaviourEngine";
import { detectNavigationTarget, getTargetApproach, highlightTarget, isElementActionable } from "./domNavigator";
import { FlowGatewayClient } from "./gatewayClient";
import { FlowEmotionEngine } from "./emotionEngine";
import { FlowAutonomyEngine } from "./autonomy/autonomyEngine";
import type { FlowInitiative } from "./autonomy/types";
import { FlowMemoryEngine } from "./memory/memoryEngine";
import { FlowToolExecutor } from "./tools/executor";
import { walkFlowTo } from "./movementController";
import { createInitialFlowState, flowReducer } from "./stateMachine";
import { detectFlowChatCommand, type FlowChatCommand } from "./chatCommands";
import { FlowMode, FlowPanelTarget } from "./types";
import { FLOW_COMPANION_CONFIG } from "./core/config";
import { claimFlowRuntime, releaseFlowRuntime } from "./core/runtimeRegistry";
import { createFlowCoreServices } from "./core/services";
import { readFlowState, writeFlowState } from "./core/storage";
import { useFlowlyVoiceRuntime } from "@/hooks/useFlowlyVoiceRuntime";
import { resolveFlowCompanionIdentity, scopedFlowStorageKey, type FlowCompanionIdentity } from "./core/identity";

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


function getThronedSize() {
  return window.innerWidth <= 900
    ? { width: 176, height: 262 }
    : { width: 202, height: 300 };
}

function getThronePosition(rect: DOMRect) {
  const size = getThronedSize();
  // The visible cushion sits near 64% of the throne artwork. In the seated canvas
  // the pelvis is near 55% of the frame after the real Sit clip reaches its end.
  const seatCenterX = rect.left + rect.width * 0.5;
  const seatCenterY = rect.top + rect.height * 0.64;
  const pelvisRatioX = 0.5;
  const pelvisRatioY = 0.55;
  return {
    left: clamp(seatCenterX - size.width * pelvisRatioX, 8, Math.max(8, window.innerWidth - size.width - 8)),
    top: clamp(seatCenterY - size.height * pelvisRatioY, 8, Math.max(8, window.innerHeight - size.height - 8)),
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
  const enabled = pathname.startsWith(FLOW_COMPANION_CONFIG.dashboardPrefix);
  const services = useMemo(() => createFlowCoreServices(), []);
  const [runtimeClaimed, setRuntimeClaimed] = useState(false);
  const [identity, setIdentity] = useState<FlowCompanionIdentity | null>(null);
  const [identityReady, setIdentityReady] = useState(false);
  const [state, dispatch] = useReducer(flowReducer, undefined, createInitialFlowState);
  const [input, setInput] = useState("");
  const [introPhase, setIntroPhase] = useState<IntroPhase>("hidden");
  const [isThroned, setIsThroned] = useState(false);
  const [throneHover, setThroneHover] = useState(false);
  const [initiative, setInitiative] = useState<FlowInitiative | null>(null);
  const stateRef = useRef(state);
  const introRef = useRef<IntroPhase>(introPhase);
  const clientRef = useRef<FlowGatewayClient | null>(null);
  const navigationLock = useRef(false);
  const movementAbortRef = useRef<AbortController | null>(null);
  const behaviourRef = useRef<FlowBehaviourEngine | null>(null);
  const emotionRef = useRef<FlowEmotionEngine | null>(null);
  const autonomyRef = useRef<FlowAutonomyEngine | null>(null);
  const memoryRef = useRef<FlowMemoryEngine | null>(null);
  const toolExecutorRef = useRef(new FlowToolExecutor(services.logger));
  const voiceSpeakRef = useRef<(text: string) => void>(() => undefined);
  const voiceActiveRef = useRef(false);
  const dragRef = useRef<DragState>({ active: false, offsetX: 0, offsetY: 0 });
  const throneRef = useRef<HTMLDivElement | null>(null);
  const thronedRef = useRef(false);
  stateRef.current = state;
  introRef.current = introPhase;
  thronedRef.current = isThroned;

  const scopedKeys = useMemo(() => identity ? {
    runtime: scopedFlowStorageKey(FLOW_COMPANION_CONFIG.storageKey, identity),
    memory: scopedFlowStorageKey(FLOW_COMPANION_CONFIG.memoryStorageKey, identity),
    autonomy: scopedFlowStorageKey(FLOW_COMPANION_CONFIG.autonomyStorageKey, identity),
  } : null, [identity]);

  useEffect(() => {
    let cancelled = false;
    if (!enabled) {
      setIdentity(null);
      setIdentityReady(false);
      return;
    }

    setIdentityReady(false);
    void resolveFlowCompanionIdentity().then((nextIdentity) => {
      if (cancelled) return;
      dispatch({ type: "reset" });
      setIdentity(nextIdentity);
      setIdentityReady(true);
      if (nextIdentity) {
        // Purge the legacy global stores that caused cross-account conversation leakage.
        window.localStorage.removeItem(FLOW_COMPANION_CONFIG.storageKey);
        window.localStorage.removeItem(FLOW_COMPANION_CONFIG.memoryStorageKey);
        window.localStorage.removeItem(FLOW_COMPANION_CONFIG.autonomyStorageKey);
      }
      if (!nextIdentity) {
        services.logger.warn("Companion disabled: authenticated user/business scope unavailable.");
      }
    });

    return () => { cancelled = true; };
  }, [enabled, services]);

  useEffect(() => {
    if (!enabled) {
      setRuntimeClaimed(false);
      return;
    }

    const claimed = claimFlowRuntime(FLOW_COMPANION_CONFIG.runtimeId);
    setRuntimeClaimed(claimed);
    if (claimed) {
      services.events.emit("runtime:mounted", { runtimeId: FLOW_COMPANION_CONFIG.runtimeId });
      services.logger.info("Runtime mounted.");
    }

    return () => {
      if (!claimed) return;
      services.events.emit("runtime:unmounted", { runtimeId: FLOW_COMPANION_CONFIG.runtimeId });
      services.events.clear();
      releaseFlowRuntime(FLOW_COMPANION_CONFIG.runtimeId);
      services.logger.info("Runtime unmounted.");
    };
  }, [enabled, services]);

  useEffect(() => {
    if (!enabled || !identityReady || !scopedKeys) return;
    const persisted = readFlowState(scopedKeys.runtime);
    if (!persisted) return;
    if (persisted.position && Number.isFinite(persisted.position.left) && Number.isFinite(persisted.position.top)) {
      dispatch({ type: "position", left: persisted.position.left, top: persisted.position.top });
    }
    (persisted.messages || [])
      .slice(-FLOW_COMPANION_CONFIG.maxPersistedMessages)
      .forEach((message) => dispatch({ type: "message", message }));
  }, [enabled, identityReady, scopedKeys]);

  useEffect(() => {
    if (!enabled || !identityReady || !scopedKeys || introPhase !== "ready") return;
    const timer = window.setTimeout(() => {
      writeFlowState(scopedKeys.runtime, {
        position: state.position,
        messages: state.messages.slice(-FLOW_COMPANION_CONFIG.maxPersistedMessages),
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [enabled, identityReady, scopedKeys, introPhase, state.position, state.messages]);

  useEffect(() => {
    if (!enabled || !identityReady || !identity) {
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
  }, [enabled, identityReady, identity]);

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
    behaviourRef.current?.signalActivity("navigation");

    try {
      let element = api.findElement(target.key);

      if (!element) {
        const result = await api.navigate(target.key);
        dispatch({ type: "bubble", text: result.message });
        dispatch({ type: "open", open: true });
        emotionRef.current?.stimulate({ type: "navigation-failure" });
        return;
      }

      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      await sleep(450);
      element = api.findElement(target.key) || element;

      dispatch({ type: "bubble", text: `Claro. Te acompaño a ${target.label}.` });
      dispatch({ type: "open", open: false });

      movementAbortRef.current?.abort();
      const movement = new AbortController();
      movementAbortRef.current = movement;
      const approach = getTargetApproach(element);

      await walkFlowTo(stateRef.current.position, approach.destination, {
        onPosition: (position) => dispatch({ type: "position", ...position }),
        onFacing: (facing) => dispatch({ type: "facing", facing }),
        onWalking: (walking) => dispatch({ type: "mode", mode: walking ? "walking" : "idle" }),
        onGait: (gait) => dispatch({ type: "gait", gait }),
      }, { signal: movement.signal });

      if (movement.signal.aborted) return;
      element = api.findElement(target.key) || element;
      if (!isElementActionable(element)) {
        dispatch({ type: "bubble", text: `${target.label} ya no está disponible en esta vista.` });
        dispatch({ type: "open", open: true });
        return;
      }

      dispatch({ type: "facing", facing: approach.facing });
      highlightTarget(element, true);
      dispatch({ type: "mode", mode: "pointing" });
      dispatch({ type: "bubble", text: `Aquí tienes ${target.label}.` });
      await sleep(430);

      // Make the interaction visible: Flow reaches the control, performs a short
      // press and triggers the DOM click at the peak of the hand movement.
      dispatch({ type: "mode", mode: "pressing" });
      await sleep(210);
      element.focus({ preventScroll: true });
      element.click();
      await sleep(260);
      highlightTarget(element, false);
      dispatch({ type: "mode", mode: "idle" });
      dispatch({ type: "facing", facing: "front" });
      dispatch({ type: "open", open: true });
      emotionRef.current?.stimulate({ type: "navigation-success" });
    } finally {
      movementAbortRef.current = null;
      navigationLock.current = false;
    }
  }, []);

  const addFlowReply = useCallback((text: string) => {
    const flowMessage = { id: uid("flow"), role: "flow" as const, text };
    dispatch({ type: "message", message: flowMessage });
    dispatch({ type: "bubble", text });
    memoryRef.current?.recordMessage(flowMessage);
  }, []);

  const executeChatCommand = useCallback(async (command: FlowChatCommand) => {
    behaviourRef.current?.signalActivity("chat");
    movementAbortRef.current?.abort();

    if (command.type === "walk") {
      if (navigationLock.current) {
        addFlowReply("Espera un segundo, ahora mismo estoy terminando otro movimiento.");
        return;
      }

      navigationLock.current = true;
      dispatch({ type: "open", open: false });
      addFlowReply("Claro. Voy a caminar un poco.");

      const size = getCompactSize();
      const current = stateRef.current.position;
      const maxLeft = Math.max(0, window.innerWidth - size.width);
      const step = Math.min(220, Math.max(110, window.innerWidth * 0.16));
      const autoDirection = current.left + step <= maxLeft ? "right" : "left";
      const direction = command.direction === "auto" ? autoDirection : command.direction;
      const destination = {
        left: clamp(current.left + (direction === "right" ? step : -step), 8, Math.max(8, maxLeft - 8)),
        top: current.top,
      };

      const movement = new AbortController();
      movementAbortRef.current = movement;
      try {
        await walkFlowTo(current, destination, {
          onPosition: (position) => dispatch({ type: "position", ...position }),
          onFacing: (facing) => dispatch({ type: "facing", facing }),
          onWalking: (walking) => dispatch({ type: "mode", mode: walking ? "walking" : "idle" }),
          onGait: (gait) => dispatch({ type: "gait", gait }),
        }, { signal: movement.signal });
      } finally {
        movementAbortRef.current = null;
        navigationLock.current = false;
        dispatch({ type: "mode", mode: "idle" });
        dispatch({ type: "facing", facing: "front" });
        dispatch({ type: "open", open: true });
      }
      return;
    }

    if (command.type === "wave") {
      addFlowReply("¡Hola! Encantado de saludarte.");
      dispatch({ type: "mode", mode: "waving" });
      await sleep(2900);
      if (stateRef.current.mode === "waving") dispatch({ type: "mode", mode: "idle" });
      return;
    }

    if (command.type === "turn") {
      addFlowReply("Claro. Mira.");
      dispatch({ type: "mode", mode: "turning" });
      await sleep(1800);
      if (stateRef.current.mode === "turning") dispatch({ type: "mode", mode: "idle" });
      return;
    }

    if (command.type === "idle") {
      addFlowReply("De acuerdo. Me quedo aquí.");
      dispatch({ type: "mode", mode: "idle" });
      dispatch({ type: "facing", facing: "front" });
      return;
    }

    if (command.type === "think") {
      addFlowReply("Déjame pensar...");
      dispatch({ type: "mode", mode: "thinking" });
      await sleep(2400);
      if (stateRef.current.mode === "thinking") dispatch({ type: "mode", mode: "idle" });
      return;
    }

    addFlowReply("Te escucho.");
    dispatch({ type: "mode", mode: "listening" });
    await sleep(2400);
    if (stateRef.current.mode === "listening") dispatch({ type: "mode", mode: "idle" });
  }, [addFlowReply]);

  const processUserText = useCallback(async (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    behaviourRef.current?.signalActivity("chat");
    autonomyRef.current?.signalUserActivity();
    emotionRef.current?.stimulate({ type: "message-sent" });
    services.events.emit("activity:user", { source: "chat" });
    const userMessage = { id: uid("user"), role: "user" as const, text };
    dispatch({ type: "message", message: userMessage });
    memoryRef.current?.recordMessage(userMessage);
    services.events.emit("chat:message", { message: userMessage });

    const directCommand = detectFlowChatCommand(text);
    if (directCommand) {
      await executeChatCommand(directCommand);
      return;
    }

    const memoryConfirmation = memoryRef.current?.confirmationFor(text);
    if (memoryConfirmation) {
      const flowMessage = { id: uid("flow"), role: "flow" as const, text: memoryConfirmation };
      dispatch({ type: "message", message: flowMessage });
      dispatch({ type: "bubble", text: memoryConfirmation });
      dispatch({ type: "open", open: true });
      dispatch({ type: "mode", mode: "talking" });
      memoryRef.current?.recordMessage(flowMessage);
      if (voiceActiveRef.current) voiceSpeakRef.current(memoryConfirmation);
      window.setTimeout(() => dispatch({ type: "mode", mode: thronedRef.current ? "seated" : "idle" }), 1800);
      return;
    }

    const memoryAnswer = memoryRef.current?.answerQuestion(text);
    if (memoryAnswer) {
      const flowMessage = { id: uid("flow"), role: "flow" as const, text: memoryAnswer };
      dispatch({ type: "message", message: flowMessage });
      dispatch({ type: "bubble", text: memoryAnswer });
      dispatch({ type: "open", open: true });
      dispatch({ type: "mode", mode: "talking" });
      memoryRef.current?.recordMessage(flowMessage);
      if (voiceActiveRef.current) voiceSpeakRef.current(memoryAnswer);
      window.setTimeout(() => dispatch({ type: "mode", mode: thronedRef.current ? "seated" : "idle" }), Math.min(4200, 900 + memoryAnswer.length * 22));
      return;
    }

    const targets: FlowPanelTarget[] = window.FlowPanelIntegration?.targets || [];
    const target = detectNavigationTarget(text, targets);
    if (target) {
      await navigate(target.key);
      return;
    }

    dispatch({ type: "mode", mode: "thinking" });
    emotionRef.current?.stimulate({ type: "mode", mode: "thinking" });
    dispatch({ type: "bubble", text: "Déjame pensarlo..." });

    const sentNow = await (clientRef.current?.sendText(text) ?? Promise.resolve(false));
    if (!sentNow && stateRef.current.mode !== "error") {
      dispatch({ type: "bubble", text: "No he podido conectar con mi cerebro. Revisa OPENAI_API_KEY y vuelve a intentarlo." });
      dispatch({ type: "mode", mode: "error" });
    }
  }, [executeChatCommand, navigate, services]);

  const voice = useFlowlyVoiceRuntime({
    enabled: enabled && runtimeClaimed,
    wakeWord: "flow",
    onWake: () => {
      behaviourRef.current?.signalActivity("chat");
      emotionRef.current?.stimulate({ type: "user-activity", source: "chat" });
      dispatch({ type: "open", open: true });
      dispatch({ type: "bubble", text: "Te escucho." });
    },
    onCommand: processUserText,
    onPhase: (phase) => {
      if (phase === "listening" || phase === "permission" || phase === "waking") {
        dispatch({ type: "mode", mode: "listening" });
      } else if (phase === "thinking") {
        dispatch({ type: "mode", mode: "thinking" });
      } else if (phase === "speaking") {
        dispatch({ type: "mode", mode: "talking" });
      } else if (phase === "error") {
        dispatch({ type: "mode", mode: "error" });
      } else if (["passive", "disabled"].includes(phase) && ["listening", "talking"].includes(stateRef.current.mode)) {
        dispatch({ type: "mode", mode: "idle" });
      }
    },
  });
  voiceSpeakRef.current = voice.speak;
  voiceActiveRef.current = voice.active;

  const goToThrone = useCallback(async () => {
    if (navigationLock.current || thronedRef.current || dragRef.current.active) return;
    const throne = throneRef.current?.getBoundingClientRect();
    if (!throne) return;

    navigationLock.current = true;
    dispatch({ type: "bubble", text: "Voy a descansar un momento. Sigo pendiente de ti." });
    dispatch({ type: "open", open: false });
    movementAbortRef.current?.abort();
    const movement = new AbortController();
    movementAbortRef.current = movement;

    try {
      const destination = getThronePosition(throne);
      await walkFlowTo(stateRef.current.position, destination, {
        onPosition: (position) => dispatch({ type: "position", ...position }),
        onFacing: (facing) => dispatch({ type: "facing", facing }),
        onWalking: (walking) => dispatch({ type: "mode", mode: walking ? "walking" : "idle" }),
        onGait: (gait) => dispatch({ type: "gait", gait }),
      }, { signal: movement.signal });
      if (movement.signal.aborted) return;
      setIsThroned(true);
      thronedRef.current = true;
      dispatch({ type: "mode", mode: "seated" });
      dispatch({ type: "facing", facing: "front" });
    } finally {
      movementAbortRef.current = null;
      navigationLock.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !identityReady || !scopedKeys) return;
    const memory = new FlowMemoryEngine({
      storageKey: scopedKeys.memory,
      maxFacts: FLOW_COMPANION_CONFIG.maxMemoryFacts,
      logger: services.logger,
      onChange: (snapshot) => services.events.emit("memory:changed", { snapshot }),
    });
    memoryRef.current = memory;
    memory.start();
    memory.observePath(window.location.pathname);
    return () => {
      memory.stop();
      memoryRef.current = null;
    };
  }, [enabled, identityReady, scopedKeys, services]);

  useEffect(() => {
    if (!enabled || !memoryRef.current) return;
    memoryRef.current.observePath(pathname);
  }, [enabled, pathname]);

  useEffect(() => {
    if (!enabled) return;
    const emotion = new FlowEmotionEngine({
      initial: stateRef.current.emotion,
      onChange: (snapshot) => {
        dispatch({ type: "emotion", emotion: snapshot });
        services.events.emit("state:emotion", { emotion: snapshot });
      },
    });
    emotionRef.current = emotion;
    emotion.start();
    return () => {
      emotion.stop();
      emotionRef.current = null;
    };
  }, [enabled, services]);

  useEffect(() => {
    if (!enabled || !identityReady || !identity) return;
    const client = new FlowGatewayClient({
      wsUrl: FLOW_COMPANION_CONFIG.gatewayWsUrl,
      httpUrl: FLOW_COMPANION_CONFIG.gatewayHttpUrl,
      reconnectDelayMs: FLOW_COMPANION_CONFIG.reconnectDelayMs,
      logger: services.logger,
      identity: { userId: identity.userId, businessId: identity.businessId },
      getAccessToken: async () => (await resolveFlowCompanionIdentity())?.accessToken || null,
      handlers: {
      onConnected: (connected) => dispatch({ type: "connected", connected }),
      onMode: (mode) => { dispatch({ type: "mode", mode }); emotionRef.current?.stimulate({ type: "mode", mode }); },
      onEmotion: (emotion) => emotionRef.current?.stimulate({ type: "external", emotion }),
      onMessage: (text) => {
        const flowMessage = { id: uid("flow"), role: "flow" as const, text };
        dispatch({ type: "bubble", text });
        dispatch({
          type: "message",
          message: flowMessage,
        });
        memoryRef.current?.recordMessage(flowMessage);
        dispatch({ type: "open", open: true });
        emotionRef.current?.stimulate({ type: "message-received" });
        if (voiceActiveRef.current) voiceSpeakRef.current(text);
      },
      onAction: (name, payload) => {
        const target = actionTarget(name, payload);
        if (target && ["navigate", "open", "go", "visit"].some((prefix) => name.toLowerCase().includes(prefix))) {
          void navigate(target);
          return;
        }

        const argumentsPayload = payload && typeof payload === "object"
          ? payload as Record<string, unknown>
          : target
            ? { target }
            : {};

        void toolExecutorRef.current.execute(
          { id: name, arguments: argumentsPayload, source: "brain" },
          { pathname: window.location.pathname, panel: window.FlowPanelIntegration },
        ).then((result) => {
          dispatch({ type: "bubble", text: result.message });
          dispatch({ type: "open", open: true });
          emotionRef.current?.stimulate({ type: result.ok ? "navigation-success" : "navigation-failure" });
        });
      },
      getContext: () => ({
        pathname: window.location.pathname,
        conversation: stateRef.current.messages,
        panel: window.FlowPanelIntegration?.context?.(),
        memory: memoryRef.current?.buildContext(),
      }),
    },
    });

    clientRef.current = client;
    client.connect();
    return () => client.disconnect();
  }, [enabled, identityReady, identity, navigate, services]);


  useEffect(() => {
    if (!enabled || !identityReady || !scopedKeys || introPhase !== "ready") return;

    const autonomy = new FlowAutonomyEngine({
      storageKey: scopedKeys.autonomy,
      evaluateEveryMs: FLOW_COMPANION_CONFIG.autonomyEvaluateEveryMs,
      getObservation: () => ({
        pathname: window.location.pathname,
        conversation: stateRef.current.messages,
        memory: memoryRef.current?.buildContext(),
        panel: window.FlowPanelIntegration?.context?.(),
        emotion: stateRef.current.emotion,
        connected: stateRef.current.connected,
        isBusy:
          navigationLock.current ||
          dragRef.current.active ||
          !["idle", "seated"].includes(stateRef.current.mode),
        now: Date.now(),
      }),
      onInitiative: (nextInitiative) => {
        setInitiative(nextInitiative);
        dispatch({ type: "bubble", text: nextInitiative.message });
        dispatch({ type: "open", open: false });
        dispatch({ type: "mode", mode: nextInitiative.priority === "high" ? "thinking" : "listening" });
        emotionRef.current?.stimulate({ type: "message-received" });
        services.events.emit("initiative:created", { initiative: nextInitiative });
      },
      onDismiss: (dismissed, reason) => {
        if (initiative?.id === dismissed.id) setInitiative(null);
        services.events.emit("initiative:dismissed", { initiative: dismissed, reason });
      },
    });

    autonomyRef.current = autonomy;
    autonomy.start();
    return () => {
      autonomy.stop();
      autonomyRef.current = null;
      setInitiative(null);
    };
  }, [enabled, identityReady, scopedKeys, introPhase, services]);


  useEffect(() => {
    if (!enabled) return;
    const behaviour = new FlowBehaviourEngine({
      getMode: () => stateRef.current.mode,
      getEmotion: () => stateRef.current.emotion,
      isBlocked: () => navigationLock.current || introRef.current !== "ready" || dragRef.current.active,
      isThroned: () => thronedRef.current,
      onDecision: (decision) => {
        services.events.emit("behaviour:goal", {
          goal: decision.goal,
          routine: decision.routine,
          behaviour: decision.id,
          priority: decision.priority,
        });
        dispatch({ type: "behaviour", pulse: decision.pulse, id: decision.id });
        if (decision.command === "wake") {
          setIsThroned(false);
          thronedRef.current = false;
          dispatch({ type: "position", ...getHomePosition() });
          dispatch({ type: "bubble", text: "Aquí estoy. ¿Qué necesitas?" });
          emotionRef.current?.stimulate({ type: "wake" });
        }
        if (decision.command === "rest") {
          emotionRef.current?.stimulate({ type: "rest-start" });
          void goToThrone();
          return;
        }
        dispatch({ type: "mode", mode: decision.mode });
      },
      onReturnToIdle: (decision) => {
        dispatch({ type: "mode", mode: thronedRef.current ? "seated" : "idle" });
        dispatch({ type: "behaviour", pulse: decision.pulse + 1, id: null });
      },
    });

    behaviourRef.current = behaviour;
    behaviour.start();

    const markPointerActivity = () => { behaviour.signalActivity("pointer"); autonomyRef.current?.signalUserActivity(); emotionRef.current?.stimulate({ type: "user-activity", source: "pointer" }); services.events.emit("activity:user", { source: "pointer" }); };
    const markKeyboardActivity = () => { behaviour.signalActivity("keyboard"); autonomyRef.current?.signalUserActivity(); emotionRef.current?.stimulate({ type: "user-activity", source: "keyboard" }); services.events.emit("activity:user", { source: "keyboard" }); };
    const markScrollActivity = () => { behaviour.signalActivity("scroll"); autonomyRef.current?.signalUserActivity(); services.events.emit("activity:user", { source: "scroll" }); };
    window.addEventListener("pointerdown", markPointerActivity, { passive: true });
    window.addEventListener("keydown", markKeyboardActivity);
    window.addEventListener("scroll", markScrollActivity, { passive: true });

    return () => {
      behaviour.stop();
      behaviourRef.current = null;
      window.removeEventListener("pointerdown", markPointerActivity);
      window.removeEventListener("keydown", markKeyboardActivity);
      window.removeEventListener("scroll", markScrollActivity);
    };
  }, [enabled, goToThrone, services]);

  function beginDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (introRef.current !== "ready") return;
    movementAbortRef.current?.abort();
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const position = stateRef.current.position;
    dragRef.current = {
      active: true,
      offsetX: event.clientX - position.left,
      offsetY: event.clientY - position.top,
    };
    behaviourRef.current?.signalActivity("drag");
    emotionRef.current?.stimulate({ type: "user-activity", source: "drag" });
    services.events.emit("activity:user", { source: "drag" });
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
      const { left, top } = getThronePosition(throne);

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

  async function acceptInitiative(current: FlowInitiative) {
    autonomyRef.current?.acknowledge(current.id);
    setInitiative(null);
    services.events.emit("initiative:accepted", { initiative: current });
    dispatch({ type: "mode", mode: "thinking" });

    if (current.action?.target) {
      const target = current.action.target.replace(/^\/dashboard\/?/, "") || current.action.target;
      await navigate(target);
      return;
    }

    if (current.action?.toolId) {
      const result = await toolExecutorRef.current.execute(
        {
          id: current.action.toolId,
          arguments: current.action.arguments || {},
          source: "system",
        },
        { pathname: window.location.pathname, panel: window.FlowPanelIntegration },
      );
      dispatch({ type: "bubble", text: result.message });
      dispatch({ type: "open", open: true });
      dispatch({ type: "mode", mode: result.ok ? "idle" : "error" });
      return;
    }

    dispatch({ type: "bubble", text: "Perfecto. Lo tendré en cuenta y seguiré pendiente." });
    dispatch({ type: "mode", mode: "idle" });
  }

  function dismissInitiative() {
    autonomyRef.current?.dismiss("user-dismissed");
    setInitiative(null);
    dispatch({ type: "mode", mode: thronedRef.current ? "seated" : "idle" });
    dispatch({ type: "bubble", text: "Entendido. No te molesto con esto." });
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
    await processUserText(text);
  }

  const status = useMemo(
    () =>
      state.connected
        ? state.mode === "walking"
          ? "caminando"
          : state.mode === "turning"
            ? "girando"
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

  if (!enabled || !runtimeClaimed || !identityReady || !identity) return null;

  return (
    <div className={`flow-engine-root is-intro-${introPhase} ${isThroned ? "has-throned-flow" : ""}`} data-flow-runtime="engine-v2">
      {introPhase === "ready" && (
        <div
          ref={throneRef}
          className={`flow-engine-throne ${throneHover ? "is-drop-hover" : ""} ${isThroned ? "is-occupied" : ""}`}
          aria-label="Trono de Flow"
        >
          <div className="flow-engine-throne-aura" aria-hidden="true" />
          <img
            className="flow-engine-throne-art"
            src="/flow/flow-throne.png"
            alt={isThroned ? "Flow descansando en su trono" : ""}
            draggable={false}
            aria-hidden={!isThroned}
          />
          <div className="flow-engine-throne-seat-anchor" aria-hidden="true" />
          {isThroned && (
            <div
              className="flow-engine-throne-grab-handle"
              onPointerDown={beginDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              title="Coge a Flow por la cabeza"
              aria-label="Levantar a Flow del trono"
            />
          )}
          {!isThroned && <small>Arrastra a Flow al trono para descansar</small>}
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
          gaitSpeed={state.gait.normalizedSpeed}
          speechLevel={voice.speechLevel}
          onClick={() => {
            if (introRef.current === "ready" && !dragRef.current.active) {
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

      {introPhase === "ready" && initiative && !state.open && !isThroned && (
        <aside className={`flow-engine-initiative is-${initiative.priority}`} role="status">
          <button
            type="button"
            className="flow-engine-initiative-close"
            aria-label="Descartar propuesta"
            onClick={dismissInitiative}
          >
            <X size={14} />
          </button>
          <small>{initiative.kind === "warning" ? "He detectado algo" : "Una idea de Flow"}</small>
          <strong>{initiative.title}</strong>
          <p>{initiative.message}</p>
          <div>
            {initiative.action && (
              <button type="button" onClick={() => void acceptInitiative(initiative)}>
                {initiative.action.label}
              </button>
            )}
            <button type="button" className="is-secondary" onClick={dismissInitiative}>Ahora no</button>
          </div>
        </aside>
      )}

      {introPhase === "ready" && state.open && (
        <section className="flow-engine-panel">
          <header>
            <div>
              <strong>Flow</strong>
              <span>{status} · {voice.active ? `voz activa (${voice.state})` : "voz desactivada"} · Brain, memoria y herramientas activos</span>
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
            <button
              type="button"
              className={voice.active ? "is-voice-active" : ""}
              aria-label={voice.active ? "Desactivar micrófono" : "Activar micrófono"}
              title={voice.supported ? (voice.active ? "Desactivar voz" : "Activar voz") : "Voz no compatible"}
              disabled={!voice.supported}
              onClick={() => void (voice.active ? voice.deactivate() : voice.activate())}
            >
              <Mic size={15} />
            </button>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Dime: camina, saluda, gira o llévame al CRM"
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
