"use client";

import { type CSSProperties, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Code2, MessageCircle, Mic, MicOff, Minimize2, Send, ShieldCheck, Sparkles, Target, Trophy, X, Zap } from "lucide-react";
import EvolutionaryCompanionAvatar from "@/components/EvolutionaryCompanionAvatar";
import { companionMissions, companionRewards, companionStats, getCompanionContext } from "@/lib/flowlyCompanionRuntime";
import { getFlowlyRuntimeMode } from "@/lib/flowlyProductModes";
import { useFlowlyVoiceRuntime } from "@/hooks/useFlowlyVoiceRuntime";

const HIDDEN_PREFIXES = ["/login", "/registro", "/reservas", "/demo/login"];

function shouldHide(pathname: string) {
  if (pathname === "/") return true;
  return HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}


export default function FlowlyCompanionRuntime() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [thinking, setThinking] = useState(false);
  const [lifeMode, setLifeMode] = useState<string | null>(null);
  const [lifeLabel, setLifeLabel] = useState("Observando Flowly");
  const [avatarUrl, setAvatarUrl] = useState("/avatars/flowly.glb");
  const [entranceState, setEntranceState] = useState<"intro" | "settled">("intro");
  const [voiceIntroResolved, setVoiceIntroResolved] = useState(false);
  const [travel, setTravel] = useState({ x: 0, y: 0, moving: false, label: "dock" });
  const [lastBrainRequest, setLastBrainRequest] = useState("");
  const [lastBrainResponse, setLastBrainResponse] = useState("");
  const lastTravelTargetRef = useRef("dock");
  const hasAutoVoiceStartedRef = useRef(false);
  const context = useMemo(() => getCompanionContext(pathname), [pathname]);
  const mode = getFlowlyRuntimeMode(pathname);
  const isArchitect = mode === "arquitecto";
  const xpPercent = Math.round((companionStats.xp / companionStats.nextLevelXp) * 100);
  const [conversation, setConversation] = useState<{ role: "assistant" | "user"; content: string }[]>([
    { role: "assistant", content: isArchitect ? "Hola. Soy el Companion Arquitecto. Puedo ayudarte a analizar Flowly OS sin mezclarlo con el panel de clientes." : "Hola. Soy el Companion del panel. Puedo ayudarte con clientes, tareas, objetivos, facturas, WhatsApp y recomendaciones sin mostrarte herramientas técnicas." },
  ]);
  const voiceSpeakRef = useRef<(text: string) => void>(() => undefined);
  const companionLiveContextRef = useRef<Record<string, unknown>>({});


  const speakCleanly = useCallback((text: string) => text.replace(/[#*_`>\[\]]/g, " ").replace(/\s+/g, " ").trim(), []);

  const askCompanion = useCallback(async (clean: string, source: "text" | "voice" = "text") => {
    if (!clean || thinking) return;
    setThinking(true);
    setLastBrainRequest(clean);
    setLastBrainResponse("");
    setLifeMode(source === "voice" ? "attention" : "talking");
    setLifeLabel(source === "voice" ? "Escuchando tu voz" : "Pensando con Flowly");

    const nextConversation = [...conversation, { role: "user" as const, content: clean }];
    if (source === "text") {
      setConversation(nextConversation);
    }

    try {
      const response = await fetch("/api/companion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: clean,
          pathname,
          conversation: nextConversation,
          extraContext: {
            source,
            companion: companionLiveContextRef.current,
          },
        }),
      });
      const data = await response.json();
      const answer = typeof data?.answer === "string"
        ? data.answer
        : "No he podido pensar bien la respuesta. Inténtalo otra vez en unos segundos.";
      setLastBrainResponse(answer);
      if (source === "text") {
        setConversation((current) => [...current, { role: "assistant", content: answer }]);
      }
      voiceSpeakRef.current(speakCleanly(answer));
    } catch (error) {
      console.error("Companion chat error", error);
      const fallback = "Ahora mismo no puedo conectar con mi motor de IA. Puedo seguir ayudándote si lo intentas de nuevo.";
      setLastBrainResponse(fallback);
      if (source === "text") {
        setConversation((current) => [...current, { role: "assistant", content: fallback }]);
      }
      voiceSpeakRef.current(fallback);
    } finally {
      setThinking(false);
    }
  }, [conversation, pathname, speakCleanly, thinking]);

  const handleVoiceWake = useCallback(() => {
    setOpen(true);
    setLifeMode("attention");
    setLifeLabel("Flow te está escuchando");
  }, []);

  const handleVoiceStatus = useCallback((status: string) => {
    setLifeLabel(status);
  }, []);

  const handleVoicePhase = useCallback((phase: "unsupported" | "disabled" | "permission" | "passive" | "waking" | "listening" | "thinking" | "speaking" | "error") => {
    if (phase === "listening" || phase === "waking") setLifeMode("attention");
    if (phase === "thinking") setLifeMode("thinking");
    if (phase === "speaking") setLifeMode("talking");
    if (phase === "passive") setLifeMode("idle");
  }, []);

  const voice = useFlowlyVoiceRuntime({
    wakeWord: "flow",
    enabled: true,
    onWake: handleVoiceWake,
    onCommand: async (text) => {
      await askCompanion(text, "voice");
    },
    onStatus: handleVoiceStatus,
    onPhase: handleVoicePhase,
  });


  const moveFlowTo = useCallback((target: "dock" | "center" | "left" | "right" | "lowerCenter") => {
    if (typeof window === "undefined") return;
    const avatarWidth = Math.min(220, Math.max(150, window.innerWidth * 0.14));
    const avatarHeight = Math.min(290, Math.max(190, window.innerHeight * 0.26));
    const margin = 22;
    const maxX = Math.max(margin, window.innerWidth - avatarWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - avatarHeight - margin);
    const positions: Record<typeof target, { x: number; y: number }> = {
      dock: { x: maxX, y: maxY },
      center: { x: Math.max(margin, (window.innerWidth - avatarWidth) / 2), y: Math.max(margin, (window.innerHeight - avatarHeight) / 2) },
      lowerCenter: { x: Math.max(margin, (window.innerWidth - avatarWidth) / 2), y: Math.min(maxY, window.innerHeight - avatarHeight - 36) },
      left: { x: margin, y: Math.min(maxY, Math.max(margin, window.innerHeight * 0.58)) },
      right: { x: maxX, y: Math.min(maxY, Math.max(margin, window.innerHeight * 0.38)) },
    };
    const next = positions[target];
    lastTravelTargetRef.current = target;
    setTravel({ ...next, moving: true, label: target });
    window.setTimeout(() => {
      setTravel((current) => current.label === target ? { ...current, moving: false } : current);
    }, 1700);
  }, []);

  const voiceNeedsActivation = !voiceIntroResolved && !voice.active && voice.state !== "unsupported";
  const avatarMood = travel.moving ? "walking" : voiceNeedsActivation ? "attention" : voice.isAwake ? "attention" : thinking ? "talking" : lifeMode || (isArchitect ? "thinking" : context.mode);
  const companionRuntimeStyle = { "--flow-x": `${travel.x}px`, "--flow-y": `${travel.y}px` } as CSSProperties;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const initial = window.localStorage.getItem("flowly_voice_intro_resolved") === "true" ? "dock" : "center";
    moveFlowTo(initial);
    const onResize = () => moveFlowTo(lastTravelTargetRef.current as "dock" | "center" | "left" | "right" | "lowerCenter");
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [moveFlowTo]);

  useEffect(() => {
    if (typeof window === "undefined" || voice.state === "unsupported" || hasAutoVoiceStartedRef.current) return;
    const shouldAutoStart = window.localStorage.getItem("flowly_voice_enabled") === "true" || window.localStorage.getItem("flowly_voice_intro_resolved") === "true";
    const tryStart = async () => {
      const permissionsApi = navigator.permissions?.query;
      try {
        const status = permissionsApi ? await permissionsApi.call(navigator.permissions, { name: "microphone" as PermissionName }) : null;
        if (status?.state === "granted" || shouldAutoStart) {
          hasAutoVoiceStartedRef.current = true;
          const activated = await voice.activate();
          if (activated) {
            window.localStorage.setItem("flowly_voice_enabled", "true");
            window.localStorage.setItem("flowly_voice_intro_resolved", "true");
            setVoiceIntroResolved(true);
          } else {
            hasAutoVoiceStartedRef.current = false;
          }
        }
      } catch {
        if (shouldAutoStart) {
          hasAutoVoiceStartedRef.current = true;
          const activated = await voice.activate();
          if (activated) {
            window.localStorage.setItem("flowly_voice_enabled", "true");
            window.localStorage.setItem("flowly_voice_intro_resolved", "true");
            setVoiceIntroResolved(true);
          } else {
            hasAutoVoiceStartedRef.current = false;
          }
        }
      }
    };
    void tryStart();
  }, [voice, voice.state]);

  const toggleVoice = useCallback(async () => {
    if (voice.active) {
      voice.deactivate();
      if (typeof window !== "undefined") window.localStorage.removeItem("flowly_voice_enabled");
      return;
    }

    const activated = await voice.activate();
    if (activated && typeof window !== "undefined") {
      window.localStorage.setItem("flowly_voice_intro_resolved", "true");
      window.localStorage.setItem("flowly_voice_enabled", "true");
      setVoiceIntroResolved(true);
      moveFlowTo("dock");
    }
  }, [moveFlowTo, voice]);

  useEffect(() => {
    if (voiceNeed

  return (
    <div style={companionRuntimeStyle} className={`flowly-companion-runtime ${minimized ? "minimized" : ""} ${open ? "open" : ""}`}> 
      <button onClick={() => setOpen(!open)} className="toggle-button">
        {open ? <X size={24} /> : <Sparkles size={24} />}
      </button>
      <button onClick={() => setMinimized(!minimized)} className="minimize-button">
        <Minimize2 size={24} />
      </button>
      <EvolutionaryCompanionAvatar mood={avatarMood} onClick={() => setOpen(true)} />
      {open && <div className="companion-chat"> {/* Aquí va el contenido del chat */} </div>}
    </div>
  );
}