"use client";

import {
  type CSSProperties,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, MessageCircle, Mic, MicOff, Send, ShieldCheck, Sparkles, X, Shirt } from "lucide-react";
import FlowlyAssistant3D from "@/components/FlowlyAssistant3D";
import { FLOWLY_COMPANION_SKINS, getCompanionSkin } from "@/lib/flowlyCompanionSkins";
import { companionStats, getCompanionContext } from "@/lib/flowlyCompanionRuntime";
import { decideCompanionLife, lifeStateToAvatarMode } from "@/lib/flowlyCompanionLifeEngine";
import { getFlowlyRuntimeMode } from "@/lib/flowlyProductModes";
import { useFlowlyVoiceRuntime } from "@/hooks/useFlowlyVoiceRuntime";

const HIDDEN_PREFIXES = ["/login", "/registro", "/reservas", "/demo/login"];

type StageTarget = "habitable" | "center" | "left" | "right" | "manual";
type StagePosition = { x: number; y: number; ready: boolean; moving: boolean; target: StageTarget };

function shouldHide(pathname: string) {
  if (pathname === "/") return true;
  return HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function normalizeText(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function mapAvatarMoodToAssistantMode(mood: string) {
  switch (mood) {
    case "walking":
      return "walk";
    case "talking":
      return "talk";
    case "thinking":
      return "thinking";
    case "wave":
      return "wave";
    case "point":
      return "point";
    case "attention":
      return "attention";
    case "celebrating":
      return "celebrating";
    default:
      return "idle";
  }
}

function getCharacterSize() {
  if (typeof window === "undefined") return { width: 230, height: 330 };
  const mobile = window.innerWidth <= 820;
  return {
    width: mobile ? Math.min(170, Math.max(136, window.innerWidth * 0.36)) : Math.min(230, Math.max(190, window.innerWidth * 0.125)),
    height: mobile ? Math.min(240, Math.max(196, window.innerHeight * 0.30)) : Math.min(340, Math.max(280, window.innerHeight * 0.38)),
  };
}

function clampToViewport(x: number, y: number) {
  const { width, height } = getCharacterSize();
  const margin = 18;
  const maxX = Math.max(margin, window.innerWidth - width - margin);
  const maxY = Math.max(margin, window.innerHeight - height - margin);
  return {
    x: Math.min(Math.max(margin, x), maxX),
    y: Math.min(Math.max(margin, y), maxY),
  };
}

function findHabitablePosition(panelOpen: boolean) {
  const { width, height } = getCharacterSize();
  const margin = 28;
  const reservedRight = panelOpen && window.innerWidth > 980 ? 360 : 0;
  const maxX = Math.max(margin, window.innerWidth - reservedRight - width - margin);
  const floorY = Math.max(margin, window.innerHeight - height - 34);

  const interactive = Array.from(
    document.querySelectorAll<HTMLElement>("form, main, [data-flowly-stage-anchor], button, input, textarea"),
  ).find((element) => {
    const rect = element.getBoundingClientRect();
    return rect.width > 120 && rect.height > 36 && rect.top > 80 && rect.left > 60;
  });

  if (interactive) {
    const rect = interactive.getBoundingClientRect();
    const rightCandidate = rect.right + 30;
    const leftCandidate = rect.left - width - 30;
    const hasSpaceRight = rightCandidate + width < maxX;
    const x = hasSpaceRight ? rightCandidate : leftCandidate;
    const y = Math.min(floorY, Math.max(margin, rect.bottom - height + 10));
    return clampToViewport(x, y);
  }

  return clampToViewport(Math.min(maxX, window.innerWidth * 0.62), floorY);
}

export default function FlowlyCompanionRuntime() {
  const pathname = usePathname() || "/";
  const mode = getFlowlyRuntimeMode(pathname);
  const isArchitect = mode === "arquitecto";
  const context = useMemo(() => getCompanionContext(pathname), [pathname]);
  const companionSkins = FLOWLY_COMPANION_SKINS;
  const [selectedSkin, setSelectedSkin] = useState("flowly");
  const activeSkin = getCompanionSkin(selectedSkin);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [docked, setDocked] = useState(false);
  const [message, setMessage] = useState("");
  const [thinking, setThinking] = useState(false);
  const [lifeMode, setLifeMode] = useState<string | null>(null);
  const [lifeLabel, setLifeLabel] = useState("Presente en Flowly");
  const [position, setPosition] = useState<StagePosition>({ x: 0, y: 0, ready: false, moving: false, target: "habitable" });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ active: false, moved: false, offsetX: 0, offsetY: 0 });
  const userPlacedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const voiceSpeakRef = useRef<(text: string) => void>(() => undefined);
  const companionLiveContextRef = useRef<Record<string, unknown>>({});
  const xpPercent = Math.round((companionStats.xp / companionStats.nextLevelXp) * 100);

  const [conversation, setConversation] = useState<{ role: "assistant" | "user"; content: string }[]>([
    { role: "assistant", content: isArchitect ? "Estoy contigo dentro de Flowly OS." : "Estoy contigo. Veo tu panel, tus objetivos y tu progreso." },
  ]);

  const speakCleanly = useCallback((text: string) => text.replace(/[#*_`>\[\]]/g, " ").replace(/\s+/g, " ").trim(), []);

  const moveFlowTo = useCallback((target: StageTarget) => {
    if (typeof window === "undefined" || userPlacedRef.current) return;
    const next = target === "center"
      ? clampToViewport((window.innerWidth - getCharacterSize().width) / 2, (window.innerHeight - getCharacterSize().height) / 2)
      : target === "left"
        ? clampToViewport(28, window.innerHeight - getCharacterSize().height - 34)
        : target === "right"
          ? clampToViewport(window.innerWidth - getCharacterSize().width - 28, window.innerHeight - getCharacterSize().height - 34)
          : findHabitablePosition(open);

    setPosition((current) => {
      const distance = current.ready ? Math.hypot(current.x - next.x, current.y - next.y) : 999;
      return { ...next, ready: true, moving: distance > 26, target };
    });
    window.setTimeout(() => {
      setPosition((current) => current.target === target ? { ...current, moving: false } : current);
    }, 900);
  }, [open]);

  const handleVoiceWake = useCallback(() => {
    setOpen(true);
    setLifeMode("attention");
    setLifeLabel("Flow te está escuchando");
  }, []);

  const handleVoiceStatus = useCallback((status: string) => setLifeLabel(status), []);
  const handleVoicePhase = useCallback((phase: "unsupported" | "disabled" | "permission" | "passive" | "waking" | "listening" | "thinking" | "speaking" | "error") => {
    if (phase === "listening" || phase === "waking") setLifeMode("attention");
    if (phase === "thinking") setLifeMode("thinking");
    if (phase === "speaking") setLifeMode("talking");
    if (phase === "passive") setLifeMode("idle");
  }, []);

  const askCompanion = useCallback(async (clean: string, source: "text" | "voice" = "text") => {
    if (!clean || thinking) return;
    const text = normalizeText(clean);
    const requestedSkin = text.includes("skin") || text.includes("cambia") || text.includes("ponte")
      ? companionSkins.find((skin) => text.includes(skin.id) || text.includes(normalizeText(skin.label)))
      : null;

    if (requestedSkin) {
      setSelectedSkin(requestedSkin.id);
      window.localStorage.setItem("flowly_companion_skin", requestedSkin.id);
      const answer = `Listo, cambio mi skin a ${requestedSkin.label}.`;
      setConversation((current) => [...current, { role: "user", content: clean }, { role: "assistant", content: answer }]);
      setLifeMode("wave");
      setLifeLabel(`Skin activo: ${requestedSkin.label}`);
      voiceSpeakRef.current(answer);
      return;
    }

    setThinking(true);
    setLifeMode(source === "voice" ? "attention" : "talking");
    setLifeLabel(source === "voice" ? "Escuchando tu voz" : "Pensando con Flowly Brain");
    const nextConversation = [...conversation, { role: "user" as const, content: clean }];
    if (source === "text") setConversation(nextConversation);

    try {
      const response = await fetch("/api/companion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, pathname, conversation: nextConversation, extraContext: { source, companion: companionLiveContextRef.current } }),
      });
      const data = await response.json();
      const answer = typeof data?.answer === "string" ? data.answer : "No he podido pensar bien la respuesta. Inténtalo otra vez en unos segundos.";
      if (source === "text") setConversation((current) => [...current, { role: "assistant", content: answer }]);
      voiceSpeakRef.current(speakCleanly(answer));
    } catch (error) {
      console.error("Companion chat error", error);
      const fallback = "Ahora mismo no puedo conectar con mi motor de IA. Puedo seguir ayudándote si lo intentas de nuevo.";
      if (source === "text") setConversation((current) => [...current, { role: "assistant", content: fallback }]);
      voiceSpeakRef.current(fallback);
    } finally {
      setThinking(false);
    }
  }, [companionSkins, conversation, pathname, speakCleanly, thinking]);

  const voice = useFlowlyVoiceRuntime({
    wakeWord: "flow",
    enabled: true,
    onWake: handleVoiceWake,
    onCommand: async (text) => askCompanion(text, "voice"),
    onStatus: handleVoiceStatus,
    onPhase: handleVoicePhase,
  });

  const voiceNeedsActivation = false;
  const lifeDecision = useMemo(() => decideCompanionLife(pathname, {
    thinking,
    speaking: lifeMode === "talking",
    listening: voice.isAwake,
    moving: position.moving,
    open,
    minimized,
    energy: companionStats.energy,
    level: companionStats.level,
  }), [lifeMode, minimized, open, pathname, position.moving, thinking, voice.isAwake]);

  const avatarMood = lifeStateToAvatarMode(lifeDecision.state);
  const effectiveAvatarMood = dragging ? "attention" : position.moving ? "walking" : lifeMode || avatarMood;

  useEffect(() => { voiceSpeakRef.current = voice.speak; }, [voice.speak]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedSkin = window.localStorage.getItem("flowly_companion_skin");
    const savedDock = window.localStorage.getItem("flowly_companion_docked") === "true";
    if (savedSkin) setSelectedSkin(getCompanionSkin(savedSkin).id);
    setDocked(savedDock);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || docked) return;
    moveFlowTo("habitable");
    const onResize = () => moveFlowTo("habitable");
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [docked, moveFlowTo]);

  useEffect(() => {
    if (userPlacedRef.current || docked) return;
    const id = window.setInterval(() => moveFlowTo("habitable"), 14000);
    return () => window.clearInterval(id);
  }, [docked, moveFlowTo]);

  useEffect(() => {
    if (thinking) {
      setLifeMode("talking");
      setLifeLabel("Respondiendo con el Brain");
      return;
    }
    const behaviours = isArchitect
      ? ["Presente en Flowly OS", "Leyendo el contexto", "Esperando contigo"]
      : [context.mission, "Mirando el panel contigo", context.message];
    let index = 0;
    const apply = () => {
      setLifeMode(index % 3 === 1 ? "thinking" : "idle");
      setLifeLabel(behaviours[index % behaviours.length]);
      index += 1;
    };
    apply();
    const timer = window.setInterval(apply, open ? 9000 : 5600);
    return () => window.clearInterval(timer);
  }, [context.message, context.mission, isArchitect, open, thinking]);

  useEffect(() => {
    companionLiveContextRef.current = {
      mood: effectiveAvatarMood,
      lifeLabel,
      xp: companionStats.xp,
      level: companionStats.level,
      energy: companionStats.energy,
      contextArea: context.area,
      contextMission: context.mission,
      lifeState: lifeDecision.state,
      voiceState: voice.state,
      voiceActive: voice.active,
      runtimeMode: mode,
    };
  }, [context.area, context.mission, effectiveAvatarMood, lifeDecision.state, lifeLabel, mode, voice.active, voice.state]);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("button, input, textarea, a, .flowly-v6-panel")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    dragRef.current = { active: true, moved: false, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
    setLifeMode("attention");
    setLifeLabel("Puedes colocarme donde te vaya mejor");
  }, []);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    event.preventDefault();
    const next = clampToViewport(event.clientX - drag.offsetX, event.clientY - drag.offsetY);
    drag.moved = true;
    userPlacedRef.current = true;
    setPosition({ ...next, ready: true, moving: false, target: "manual" });
  }, []);

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const moved = dragRef.current.moved;
    dragRef.current.active = false;
    setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => { suppressClickRef.current = false; }, 120);
    }
  }, []);

  const toggleFromCharacter = useCallback(() => {
    if (suppressClickRef.current) return;
    setOpen((value) => !value);
  }, []);

  const changeSkin = useCallback((skinId: string) => {
    setSelectedSkin(skinId);
    window.localStorage.setItem("flowly_companion_skin", skinId);
    setLifeMode("wave");
    setLifeLabel(`Skin activo: ${getCompanionSkin(skinId).label}`);
  }, []);

  const toggleVoice = useCallback(async () => {
    if (voice.active) {
      voice.deactivate();
      window.localStorage.removeItem("flowly_voice_enabled");
      return;
    }
    const activated = await voice.activate();
    if (activated) window.localStorage.setItem("flowly_voice_enabled", "true");
  }, [voice]);

  const hideCompanionToDock = useCallback(() => {
    setOpen(false);
    setMinimized(false);
    setDocked(true);
    window.localStorage.setItem("flowly_companion_docked", "true");
  }, []);

  const restoreCompanionFromDock = useCallback(() => {
    setDocked(false);
    setOpen(true);
    userPlacedRef.current = false;
    window.localStorage.removeItem("flowly_companion_docked");
    window.setTimeout(() => moveFlowTo("habitable"), 40);
  }, [moveFlowTo]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const clean = message.trim();
    if (!clean || thinking) return;
    setMessage("");
    await askCompanion(clean, "text");
  };

  if (shouldHide(pathname)) return null;

  if (docked) {
    return (
      <button type="button" className="flowly-v6-launcher" onClick={restoreCompanionFromDock} aria-label="Abrir Flow Companion">
        <Sparkles size={18} />
        <span><strong>Flow</strong><small>{voice.active ? "Voz activa" : "Abrir companion"}</small></span>
      </button>
    );
  }

  const runtimeStyle = position.ready ? ({ "--flow-x": `${position.x}px`, "--flow-y": `${position.y}px` } as CSSProperties) : undefined;

  return (
    <div className="flowly-v6-runtime" data-ready={position.ready} data-open={open} data-dragging={dragging} data-moving={position.moving} style={runtimeStyle}>
      <div className="flowly-v6-world" aria-hidden="true" />
      <section
        className="flowly-v6-actor"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label="Flow Companion"
      >
        {!minimized && (
          <div className="flowly-v6-bubble" role="status">
            <span>{isArchitect ? "Flowly OS" : context.area}</span>
            <strong>{isArchitect ? "Presente en Flowly OS" : lifeDecision.label}</strong>
            <p>{lifeDecision.initiative || context.message}</p>
          </div>
        )}
        <button type="button" className="flowly-v6-close" onClick={(event) => { event.stopPropagation(); hideCompanionToDock(); }} aria-label="Ocultar Flow Companion">
          <X size={14} />
        </button>
        <div className="flowly-v6-character" onClick={toggleFromCharacter}>
          <FlowlyAssistant3D modelUrl={activeSkin.modelUrl} mode={mapAvatarMoodToAssistantMode(effectiveAvatarMood)} facing="front" skinTone={activeSkin.tone} />
        </div>
        <span className="flowly-v6-shadow" aria-hidden="true" />
        <div className="flowly-v6-hud" aria-hidden="true">
          <strong>{lifeLabel}</strong>
          <i><span style={{ width: `${xpPercent}%` }} /></i>
        </div>
        <button type="button" className="flowly-v6-talk" onClick={() => setOpen((value) => !value)}>
          <MessageCircle size={14} /> Hablar
        </button>
      </section>

      {open && (
        <aside className="flowly-v6-panel" aria-label={isArchitect ? "Flowly Architect Companion" : "Flowly Customer Companion"}>
          <header>
            <div><span>{isArchitect ? "Flowly OS" : "Panel cliente"}</span><h3>{isArchitect ? "Companion Arquitecto" : "Companion del cliente"}</h3></div>
            <nav>
              <button type="button" onClick={() => setMinimized((value) => !value)} aria-label="Minimizar Companion"><ChevronDown size={16} /></button>
              <button type="button" onClick={hideCompanionToDock} aria-label="Ocultar Companion"><X size={16} /></button>
            </nav>
          </header>

          <section className="flowly-v6-card flowly-v6-level">
            <strong>{isArchitect ? "Modo arquitecto" : `Nivel ${companionStats.level}`}</strong>
            <p>{isArchitect ? "Companion técnico de Flowly OS." : `Energía ${companionStats.energy}% · ${context.mood}`}</p>
            <i><span style={{ width: `${xpPercent}%` }} /></i>
          </section>

          <section className="flowly-v6-card">
            <b><Shirt size={14} /> Skin del Companion</b>
            <div className="flowly-v6-skins">
              {companionSkins.map((skin) => (
                <button key={skin.id} type="button" data-active={selectedSkin === skin.id} onClick={() => changeSkin(skin.id)}>
                  <strong>{skin.label}</strong><small>{skin.hint}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="flowly-v6-card flowly-v6-chat">
            <b><Sparkles size={14} /> {isArchitect ? "Flowly OS" : "Subida de nivel"}</b>
            <div className="flowly-v6-focus"><strong>{lifeDecision.label}</strong><p>{lifeDecision.initiative || context.message}</p><small>{context.mission}</small></div>
            <div className="flowly-v6-conversation">
              {conversation.slice(-3).map((item, index) => <p key={`${item.role}-${index}`} data-role={item.role}>{item.content}</p>)}
              {thinking && <p data-role="assistant">Estoy pensándolo...</p>}
            </div>
            <button type="button" className="flowly-v6-voice" onClick={toggleVoice}>{voice.active ? <Mic size={14} /> : <MicOff size={14} />}{voice.active ? "Voz activa" : "Activar voz"}</button>
            <form onSubmit={sendMessage}>
              <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={isArchitect ? "¿Qué revisamos?" : "Pídeme ayuda..."} disabled={thinking} />
              <button type="submit" disabled={thinking}><Send size={14} /></button>
            </form>
            <small><ShieldCheck size={13} /> Companion conectado al Brain de Flowly.</small>
          </section>
        </aside>
      )}
    </div>
  );
}
