"use client";

import {
  type CSSProperties,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Code2,
  MessageCircle,
  Mic,
  MicOff,
  Minimize2,
  Send,
  ShieldCheck,
  Sparkles,
  X,
  Shirt,
} from "lucide-react";
import EvolutionaryCompanionAvatar from "@/components/EvolutionaryCompanionAvatar";
import {
  companionStats,
  getCompanionContext,
} from "@/lib/flowlyCompanionRuntime";
import {
  decideCompanionLife,
  lifeStateToAvatarMode,
} from "@/lib/flowlyCompanionLifeEngine";
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
  const [docked, setDocked] = useState(false);
  const [message, setMessage] = useState("");
  const [thinking, setThinking] = useState(false);
  const [lifeMode, setLifeMode] = useState<string | null>(null);
  const [lifeLabel, setLifeLabel] = useState("Observando Flowly");
  const companionSkins = useMemo(
    () => [
      { id: "flowly", label: "Flowly", modelUrl: "/avatars/flowly.glb" },
      { id: "grandma", label: "Experta", modelUrl: "/avatars/flowly-grandma.glb" },
      { id: "chef", label: "Chef Flow", modelUrl: "/avatars/chef-flow/chef-flow.fbx" },
    ],
    [],
  );
  const [selectedSkin, setSelectedSkin] = useState("flowly");
  const avatarUrl =
    companionSkins.find((skin) => skin.id === selectedSkin)?.modelUrl ||
    "/avatars/flowly.glb";
  const [entranceState, setEntranceState] = useState<"intro" | "settled">(
    "intro",
  );
  const [voiceIntroResolved, setVoiceIntroResolved] = useState(false);
  const [travel, setTravel] = useState({
    x: 0,
    y: 0,
    moving: false,
    label: "dock",
  });
  const [lastBrainRequest, setLastBrainRequest] = useState("");
  const [lastBrainResponse, setLastBrainResponse] = useState("");
  const lastTravelTargetRef = useRef("dock");
  const hasAutoVoiceStartedRef = useRef(false);
  const context = useMemo(() => getCompanionContext(pathname), [pathname]);
  const mode = getFlowlyRuntimeMode(pathname);
  const isArchitect = mode === "arquitecto";
  const xpPercent = Math.round(
    (companionStats.xp / companionStats.nextLevelXp) * 100,
  );
  const [conversation, setConversation] = useState<
    { role: "assistant" | "user"; content: string }[]
  >([
    {
      role: "assistant",
      content: isArchitect
        ? "Estoy contigo dentro de Flowly OS. Dime qué quieres revisar."
        : "Estoy contigo. Veo tu panel, tus objetivos y tu progreso.",
    },
  ]);
  const voiceSpeakRef = useRef<(text: string) => void>(() => undefined);
  const companionLiveContextRef = useRef<Record<string, unknown>>({});

  const speakCleanly = useCallback(
    (text: string) =>
      text
        .replace(/[#*_`>\[\]]/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    [],
  );

  const askCompanion = useCallback(
    async (clean: string, source: "text" | "voice" = "text") => {
      if (!clean || thinking) return;
      setThinking(true);
      setLastBrainRequest(clean);
      setLastBrainResponse("");
      setLifeMode(source === "voice" ? "attention" : "talking");
      setLifeLabel(
        source === "voice" ? "Escuchando tu voz" : "Pensando con Flowly Brain",
      );

      const nextConversation = [
        ...conversation,
        { role: "user" as const, content: clean },
      ];
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
        const answer =
          typeof data?.answer === "string"
            ? data.answer
            : "No he podido pensar bien la respuesta. Inténtalo otra vez en unos segundos.";
        setLastBrainResponse(answer);
        if (source === "text") {
          setConversation((current) => [
            ...current,
            { role: "assistant", content: answer },
          ]);
        }
        voiceSpeakRef.current(speakCleanly(answer));
      } catch (error) {
        console.error("Companion chat error", error);
        const fallback =
          "Ahora mismo no puedo conectar con mi motor de IA. Puedo seguir ayudándote si lo intentas de nuevo.";
        setLastBrainResponse(fallback);
        if (source === "text") {
          setConversation((current) => [
            ...current,
            { role: "assistant", content: fallback },
          ]);
        }
        voiceSpeakRef.current(fallback);
      } finally {
        setThinking(false);
      }
    },
    [conversation, pathname, speakCleanly, thinking],
  );

  const handleVoiceWake = useCallback(() => {
    setOpen(true);
    setLifeMode("attention");
    setLifeLabel("Flow te está escuchando");
  }, []);

  const handleVoiceStatus = useCallback((status: string) => {
    setLifeLabel(status);
  }, []);

  const handleVoicePhase = useCallback(
    (
      phase:
        | "unsupported"
        | "disabled"
        | "permission"
        | "passive"
        | "waking"
        | "listening"
        | "thinking"
        | "speaking"
        | "error",
    ) => {
      if (phase === "listening" || phase === "waking") setLifeMode("attention");
      if (phase === "thinking") setLifeMode("thinking");
      if (phase === "speaking") setLifeMode("talking");
      if (phase === "passive") setLifeMode("idle");
    },
    [],
  );

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

  const moveFlowTo = useCallback(
    (target: "dock" | "center" | "left" | "right" | "lowerCenter") => {
      if (typeof window === "undefined") return;
      const isMobileViewport = window.innerWidth <= 820;
      const avatarWidth = Math.min(
        window.innerWidth - 28,
        isMobileViewport
          ? Math.min(176, Math.max(140, window.innerWidth * 0.42))
          : Math.min(240, Math.max(192, window.innerWidth * 0.15)),
      );
      const avatarHeight = Math.min(
        window.innerHeight - 36,
        isMobileViewport
          ? Math.min(224, Math.max(170, window.innerHeight * 0.28))
          : Math.min(304, Math.max(243, window.innerHeight * 0.34)),
      );
      const margin = isMobileViewport ? 14 : 22;
      const maxX = Math.max(margin, window.innerWidth - avatarWidth - margin);
      const maxY = Math.max(margin, window.innerHeight - avatarHeight - margin);
      const positions: Record<typeof target, { x: number; y: number }> = {
        dock: { x: maxX, y: maxY },
        center: {
          x: Math.max(margin, (window.innerWidth - avatarWidth) / 2),
          y: Math.max(margin, (window.innerHeight - avatarHeight) / 2),
        },
        lowerCenter: {
          x: Math.max(margin, (window.innerWidth - avatarWidth) / 2),
          y: Math.min(maxY, window.innerHeight - avatarHeight - 36),
        },
        left: {
          x: margin,
          y: Math.min(maxY, Math.max(margin, window.innerHeight * 0.58)),
        },
        right: {
          x: maxX,
          y: Math.min(maxY, Math.max(margin, window.innerHeight * 0.38)),
        },
      };
      const next = positions[target];
      lastTravelTargetRef.current = target;
      setTravel({ ...next, moving: true, label: target });
      window.setTimeout(() => {
        setTravel((current) =>
          current.label === target ? { ...current, moving: false } : current,
        );
      }, 1700);
    },
    [],
  );

  const voiceNeedsActivation =
    !voiceIntroResolved && !voice.active && voice.state !== "unsupported";
  const lifeDecision = useMemo(
    () =>
      decideCompanionLife(pathname, {
        thinking,
        speaking: lifeMode === "talking",
        listening: voice.isAwake || voiceNeedsActivation,
        moving: travel.moving,
        open,
      }),
    [lifeMode, open, pathname, thinking, travel.moving, voice.isAwake, voiceNeedsActivation],
  );
  const avatarMood = lifeStateToAvatarMode(lifeDecision.state);
  const companionRuntimeStyle = {
    "--flow-x": `${travel.x}px`,
    "--flow-y": `${travel.y}px`,
  } as CSSProperties;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const initial =
      window.localStorage.getItem("flowly_voice_intro_resolved") === "true"
        ? "dock"
        : "center";
    moveFlowTo(initial);
    const onResize = () =>
      moveFlowTo(
        lastTravelTargetRef.current as
          "dock" | "center" | "left" | "right" | "lowerCenter",
      );
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [moveFlowTo]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      voice.state === "unsupported" ||
      hasAutoVoiceStartedRef.current
    )
      return;
    const shouldAutoStart =
      window.localStorage.getItem("flowly_voice_enabled") === "true" ||
      window.localStorage.getItem("flowly_voice_intro_resolved") === "true";
    const tryStart = async () => {
      const permissionsApi = navigator.permissions?.query;
      try {
        const status = permissionsApi
          ? await permissionsApi.call(navigator.permissions, {
              name: "microphone" as PermissionName,
            })
          : null;
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
      if (typeof window !== "undefined")
        window.localStorage.removeItem("flowly_voice_enabled");
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

  const hideCompanionToDock = useCallback(() => {
    setOpen(false);
    setMinimized(false);
    setDocked(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("flowly_companion_docked", "true");
    }
  }, []);

  const restoreCompanionFromDock = useCallback(() => {
    setDocked(false);
    setOpen(true);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("flowly_companion_docked");
    }
    moveFlowTo("lowerCenter");
  }, [moveFlowTo]);

  useEffect(() => {
    if (voiceNeedsActivation) {
      moveFlowTo("center");
      return;
    }
    if (voice.isAwake || thinking || open) {
      moveFlowTo("lowerCenter");
      return;
    }
    moveFlowTo(lifeDecision.spatialTarget);
  }, [lifeDecision.spatialTarget, moveFlowTo, open, thinking, voice.isAwake, voiceNeedsActivation]);

  useEffect(() => {
    if (voiceNeedsActivation || open || thinking || voice.isAwake) return;
    const path: Array<"dock" | "left" | "center" | "right" | "lowerCenter"> = [
      "dock",
      "left",
      "lowerCenter",
      "right",
      "dock",
    ];
    let index = 0;
    const interval = window.setInterval(() => {
      index = (index + 1) % path.length;
      moveFlowTo(path[index]);
    }, 12000);
    return () => window.clearInterval(interval);
  }, [moveFlowTo, open, thinking, voice.isAwake, voiceNeedsActivation]);

  useEffect(() => {
    voiceSpeakRef.current = voice.speak;
  }, [voice.speak]);

  useEffect(() => {
    companionLiveContextRef.current = {
      mood: avatarMood,
      lifeLabel,
      xp: companionStats.xp,
      level: companionStats.level,
      energy: companionStats.energy,
      contextArea: context.area,
      contextMission: context.mission,
      lifeState: lifeDecision.state,
      lifePhase: lifeDecision.phase,
      voiceStyle: lifeDecision.voiceStyle,
      voiceState: voice.state,
      voiceActive: voice.active,
      voiceAwake: voice.isAwake,
      runtimeMode: mode,
    };
  }, [
    avatarMood,
    context.area,
    context.mission,
    lifeLabel,
    lifeDecision,
    mode,
    voice.active,
    voice.isAwake,
    voice.state,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setVoiceIntroResolved(
      window.localStorage.getItem("flowly_voice_intro_resolved") === "true",
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDocked(
      window.localStorage.getItem("flowly_companion_docked") === "true",
    );
  }, []);

  useEffect(() => {
    if (!voice.active || typeof window === "undefined") return;
    window.localStorage.setItem("flowly_voice_intro_resolved", "true");
    setVoiceIntroResolved(true);
  }, [voice.active]);

  const activateVoiceFromIntro = useCallback(async () => {
    const activated = await voice.activate();
    if (typeof window !== "undefined") {
      window.localStorage.setItem("flowly_voice_intro_resolved", "true");
      if (activated)
        window.localStorage.setItem("flowly_voice_enabled", "true");
    }
    setVoiceIntroResolved(true);
    if (activated) moveFlowTo("dock");
    setLifeMode(activated ? "wave" : "idle");
    setLifeLabel(
      activated
        ? "Voz activada. Di Flow cuando quieras hablar."
        : "Puedes seguir escribiendo. La voz se puede activar luego.",
    );
    if (activated) {
      voiceSpeakRef.current(
        "Perfecto. Ya podemos hablar cuando quieras. Solo di Flow y te escucharé.",
      );
    }
  }, [moveFlowTo, voice]);

  useEffect(() => {
    const intro = window.setTimeout(() => {
      setEntranceState("settled");
      setLifeMode("wave");
      setLifeLabel("Hola, estoy vivo dentro de Flowly");
    }, 2600);
    return () => window.clearTimeout(intro);
  }, []);

  useEffect(() => {
    if (thinking) {
      setLifeMode("talking");
      setLifeLabel("Respondiendo con el Brain");
      return;
    }

    const behaviours = isArchitect
      ? [
          { mode: "thinking", label: "Conectado a Brain" },
          { mode: "walking", label: "Explorando el OS" },
          { mode: "point", label: "Listo para ejecutar" },
          { mode: "wave", label: "Esperando instrucciones" },
        ]
      : [
          { mode: "idle", label: context.mission },
          { mode: "walking", label: "Buscando oportunidades" },
          { mode: "wave", label: "Saludando al equipo" },
          { mode: "thinking", label: "Pensando objetivos" },
          { mode: context.mode, label: context.message },
        ];

    let index = 0;
    const applyBehaviour = () => {
      const behaviour = behaviours[index % behaviours.length];
      setLifeMode(behaviour.mode);
      setLifeLabel(behaviour.label);
      index += 1;
    };

    applyBehaviour();
    const interval = window.setInterval(applyBehaviour, open ? 9000 : 5200);
    return () => window.clearInterval(interval);
  }, [
    context.message,
    context.mission,
    context.mode,
    isArchitect,
    open,
    thinking,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedSkin = window.localStorage.getItem("flowly_companion_skin");
    if (savedSkin && companionSkins.some((skin) => skin.id === savedSkin)) {
      setSelectedSkin(savedSkin);
    }
  }, [companionSkins]);

  const changeSkin = useCallback((skinId: string) => {
    setSelectedSkin(skinId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("flowly_companion_skin", skinId);
    }
  }, []);

  if (shouldHide(pathname)) return null;

  if (docked) {
    return (
      <button
        type="button"
        className="flowly-companion-copilot-launcher"
        onClick={restoreCompanionFromDock}
        aria-label="Abrir Flow Companion"
        data-voice={voice.active ? "active" : "inactive"}
        data-awake={voice.isAwake}
      >
        <span className="flowly-companion-copilot-orb">
          <Sparkles size={18} />
        </span>
        <span className="flowly-companion-copilot-copy">
          <strong>Flow</strong>
          <small>
            {voice.isAwake
              ? "Te escucho"
              : voice.active
                ? "Voz activa"
                : "Abrir companion"}
          </small>
        </span>
      </button>
    );
  }

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const clean = message.trim();
    if (!clean || thinking) return;
    setMessage("");
    await askCompanion(clean, "text");
  };

  return (
    <div
      className="flowly-companion-runtime"
      style={companionRuntimeStyle}
      data-open={open}
      data-minimized={minimized}
      data-mode={mode}
      data-life-mode={avatarMood}
      data-entrance={entranceState}
      data-voice={voice.state}
      data-voice-awake={voice.isAwake}
      data-voice-prompt={voiceNeedsActivation}
      data-travel={travel.moving ? "moving" : travel.label}
    >
      {!minimized && (
        <div className="flowly-companion-bubble" role="status">
          <span className="flowly-companion-bubble-kicker">
            {voiceNeedsActivation
              ? "Flow por voz"
              : isArchitect
                ? "Companion Arquitecto"
                : context.area}
          </span>
          <strong>
            {voiceNeedsActivation
              ? "Activa los permisos de voz para poder hablar conmigo"
              : isArchitect
                ? "Estoy en modo desarrollo"
                : lifeDecision.label}
          </strong>
          <p>
            {voiceNeedsActivation
              ? "Pulsa el botón y acepta el micrófono. Después solo tendrás que decir Flow y te escucharé."
              : isArchitect
                ? "Aquí sí puedo ayudarte con Studio, Builder, Kernel y cambios internos."
                : lifeDecision.initiative || context.message}
          </p>
          {voiceNeedsActivation && (
            <button
              type="button"
              className="flowly-companion-voice-primary"
              onClick={activateVoiceFromIntro}
            >
              <Mic size={15} /> Activar voz
            </button>
          )}
        </div>
      )}

      <div className="flowly-companion-avatar-shell">
        <button
          type="button"
          className="flowly-companion-dock-toggle"
          onClick={hideCompanionToDock}
          aria-label="Ocultar Flow Companion"
        >
          <X size={14} />
        </button>
        <EvolutionaryCompanionAvatar
          name={companionStats.name}
          level={companionStats.level}
          xpPercent={xpPercent}
          mood={avatarMood}
          memory={lifeLabel}
          modelUrl={avatarUrl}
          onClick={() => setOpen((value) => !value)}
        />
        <div className="flowly-companion-life-hud" aria-hidden="true">
          <span className="flowly-life-dot" />
          <strong>{isArchitect ? "OS vivo" : "Misión activa"}</strong>
          <small>{lifeLabel}</small>
          <i>
            <span style={{ width: `${xpPercent}%` }} />
          </i>
        </div>
        <button
          type="button"
          className="flowly-companion-avatar-cta"
          onClick={() => setOpen((value) => !value)}
        >
          <MessageCircle size={15} />
          Hablar
        </button>
        <button
          type="button"
          className="flowly-companion-voice-cta"
          onClick={toggleVoice}
          aria-label={
            voice.active ? "Desactivar voz de Flow" : "Activar voz de Flow"
          }
        >
          {voice.active ? <Mic size={14} /> : <MicOff size={14} />}
          {voice.active ? "Escucha Flow" : "Activar voz"}
        </button>
      </div>

      {open && (
        <aside
          className="flowly-companion-panel"
          aria-label={
            isArchitect
              ? "Flowly Architect Companion"
              : "Flowly Customer Companion"
          }
        >
          <header className="flowly-companion-panel-header">
            <div>
              <span>{isArchitect ? "Flowly OS" : "Panel cliente"}</span>
              <h3>
                {isArchitect ? "Companion Arquitecto" : "Companion del cliente"}
              </h3>
            </div>
            <div className="flowly-companion-panel-actions">
              <button
                type="button"
                onClick={() => setMinimized((value) => !value)}
                aria-label="Minimizar Companion"
              >
                {minimized ? (
                  <ChevronDown size={16} />
                ) : (
                  <Minimize2 size={16} />
                )}
              </button>
              <button
                type="button"
                onClick={hideCompanionToDock}
                aria-label="Ocultar Companion en burbuja"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          <section className="flowly-companion-status-card">
            <div className="flowly-companion-status-avatar">
              <EvolutionaryCompanionAvatar
                name={companionStats.name}
                level={companionStats.level}
                xpPercent={xpPercent}
                mood={avatarMood}
                memory={context.mission}
                modelUrl={avatarUrl}
                compact
              />
            </div>
            <div>
              <strong>{isArchitect ? "Modo arquitecto" : `Nivel ${companionStats.level}`}</strong>
              <p>{isArchitect ? "Companion técnico de Flowly OS." : `Energía ${companionStats.energy}% · ${context.mood}`}</p>
              <div className="flowly-companion-progress">
                <span style={{ width: `${xpPercent}%` }} />
              </div>
            </div>
          </section>

          <section className="flowly-companion-skin-card">
            <span className="flowly-companion-section-title">
              <Shirt size={14} /> Skin del Companion
            </span>
            <div className="flowly-companion-skin-grid">
              {companionSkins.map((skin) => (
                <button
                  key={skin.id}
                  type="button"
                  data-active={selectedSkin === skin.id}
                  onClick={() => changeSkin(skin.id)}
                >
                  {skin.label}
                </button>
              ))}
            </div>
          </section>

          <section className="flowly-companion-chat-card">
            <span className="flowly-companion-section-title">
              <Sparkles size={14} /> {isArchitect ? "Flowly OS" : "Subida de nivel"}
            </span>
            <div className="flowly-companion-level-focus">
              <strong>{lifeDecision.label}</strong>
              <p>{lifeDecision.initiative || context.message}</p>
              <small>{context.mission}</small>
            </div>
            <div className="flowly-companion-conversation">
              {conversation.slice(-3).map((item, index) => (
                <p key={`${item.role}-${index}`} data-role={item.role}>
                  {item.content}
                </p>
              ))}
              {thinking && <p data-role="assistant">Estoy pensándolo...</p>}
            </div>

            {!voice.active && voice.state !== "unsupported" && (
              <button
                type="button"
                className="flowly-companion-voice-primary"
                onClick={toggleVoice}
              >
                <Mic size={14} /> Activar voz
              </button>
            )}
            {voice.active && (
              <small className="flowly-companion-safe-note">
                {voice.isAwake ? "Te escucho ahora." : 'Di "Flow" para llamarme.'}
              </small>
            )}

            <form className="flowly-companion-chat-input" onSubmit={sendMessage}>
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={isArchitect ? "¿Qué revisamos?" : "Pídeme ayuda..."}
                disabled={thinking}
              />
              <button type="submit" disabled={thinking}>
                <Send size={14} />
              </button>
            </form>

            {isArchitect ? (
              <Link href="/asistente" className="flowly-companion-architect-link">
                <Code2 size={14} /> Abrir Asistente Arquitecto
              </Link>
            ) : (
              <small className="flowly-companion-safe-note">
                <ShieldCheck size={13} /> Companion conectado al Brain de Flowly.
              </small>
            )}
          </section>
        </aside>
      )}
    </div>
  );
}
