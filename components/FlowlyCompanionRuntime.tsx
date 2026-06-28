"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Code2, MessageCircle, Minimize2, Send, ShieldCheck, Sparkles, Target, Trophy, X, Zap } from "lucide-react";
import EvolutionaryCompanionAvatar from "@/components/EvolutionaryCompanionAvatar";
import { companionMissions, companionRewards, companionStats, getCompanionContext } from "@/lib/flowlyCompanionRuntime";
import { getFlowlyRuntimeMode } from "@/lib/flowlyProductModes";

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
  const context = useMemo(() => getCompanionContext(pathname), [pathname]);
  const mode = getFlowlyRuntimeMode(pathname);
  const isArchitect = mode === "arquitecto";
  const xpPercent = Math.round((companionStats.xp / companionStats.nextLevelXp) * 100);
  const avatarMood = thinking ? "talking" : lifeMode || (isArchitect ? "thinking" : context.mode);
  const [conversation, setConversation] = useState<{ role: "assistant" | "user"; content: string }[]>([
    { role: "assistant", content: isArchitect ? "Hola. Soy el Companion Arquitecto. Puedo ayudarte a analizar Flowly OS sin mezclarlo con el panel de clientes." : "Hola. Soy el Companion del panel. Puedo ayudarte con clientes, tareas, objetivos, facturas, WhatsApp y recomendaciones sin mostrarte herramientas técnicas." },
  ]);



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
  }, [context.message, context.mission, context.mode, isArchitect, open, thinking]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/avatar/config", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        const url = typeof data?.avatar?.modelUrl === "string" ? data.avatar.modelUrl : null;
        if (mounted && url) setAvatarUrl(url);
      })
      .catch(() => undefined);
    return () => { mounted = false; };
  }, []);

  if (shouldHide(pathname)) return null;

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const clean = message.trim();
    if (!clean || thinking) return;
    setMessage("");
    setThinking(true);

    const nextConversation = [...conversation, { role: "user" as const, content: clean }];
    setConversation(nextConversation);

    try {
      const response = await fetch("/api/companion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, pathname, conversation }),
      });
      const data = await response.json();
      const answer = typeof data?.answer === "string"
        ? data.answer
        : "No he podido pensar bien la respuesta. Inténtalo otra vez en unos segundos.";
      setConversation((current) => [...current, { role: "assistant", content: answer }]);
    } catch (error) {
      console.error("Companion chat error", error);
      setConversation((current) => [
        ...current,
        { role: "assistant", content: "Ahora mismo no puedo conectar con mi motor de IA. Puedo seguir ayudándote si lo intentas de nuevo." },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="flowly-companion-runtime" data-open={open} data-minimized={minimized} data-mode={mode} data-life-mode={avatarMood}>
      {!minimized && (
        <div className="flowly-companion-bubble" role="status">
          <span className="flowly-companion-bubble-kicker">{isArchitect ? "Companion Arquitecto" : context.area}</span>
          <strong>{isArchitect ? "Estoy en modo desarrollo" : context.title}</strong>
          <p>{isArchitect ? "Aquí sí puedo ayudarte con Studio, Builder, Kernel y cambios internos." : context.message}</p>
        </div>
      )}

      <div className="flowly-companion-avatar-shell">
        <EvolutionaryCompanionAvatar name={companionStats.name} level={companionStats.level} xpPercent={xpPercent} mood={avatarMood} memory={lifeLabel} modelUrl={avatarUrl} onClick={() => setOpen((value) => !value)} />
        <div className="flowly-companion-life-hud" aria-hidden="true">
          <span className="flowly-life-dot" />
          <strong>{isArchitect ? "OS vivo" : "Misión activa"}</strong>
          <small>{lifeLabel}</small>
          <i><span style={{ width: `${xpPercent}%` }} /></i>
        </div>
        <button type="button" className="flowly-companion-avatar-cta" onClick={() => setOpen((value) => !value)}>
          <MessageCircle size={15} />
          Hablar
        </button>
      </div>

      {open && (
        <aside className="flowly-companion-panel" aria-label={isArchitect ? "Flowly Architect Companion" : "Flowly Customer Companion"}>
          <header className="flowly-companion-panel-header">
            <div>
              <span>{isArchitect ? "Flowly OS" : "Panel cliente"}</span>
              <h3>{isArchitect ? "Companion Arquitecto" : "Companion del cliente"}</h3>
            </div>
            <div className="flowly-companion-panel-actions">
              <button type="button" onClick={() => setMinimized((value) => !value)} aria-label="Minimizar Companion">
                {minimized ? <ChevronDown size={16} /> : <Minimize2 size={16} />}
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar Companion">
                <X size={16} />
              </button>
            </div>
          </header>

          <section className="flowly-companion-status-card">
            <div className="flowly-companion-status-avatar"><EvolutionaryCompanionAvatar name={companionStats.name} level={companionStats.level} xpPercent={xpPercent} mood={avatarMood} memory={context.mission} modelUrl={avatarUrl} compact /></div>
            <div>
              <strong>{isArchitect ? "Modo arquitecto" : `Nivel ${companionStats.level}`}</strong>
              <p>{isArchitect ? "Puede abrir herramientas internas. No aparece en paneles de clientes." : `Ánimo: ${context.mood} · Energía ${companionStats.energy}%`}</p>
              <div className="flowly-companion-progress"><span style={{ width: `${xpPercent}%` }} /></div>
            </div>
          </section>

          <section className="flowly-companion-chat-card">
            <span className="flowly-companion-section-title"><Sparkles size={14} /> {isArchitect ? "Asistente técnico" : "Ayuda del panel"}</span>
            <div className="flowly-companion-conversation">
              {conversation.slice(-5).map((item, index) => <p key={`${item.role}-${index}`} data-role={item.role}>{item.content}</p>)}
              {thinking && <p data-role="assistant">Estoy pensando con el contexto de Flowly...</p>}
            </div>
            <form className="flowly-companion-chat-input" onSubmit={sendMessage}>
              <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={isArchitect ? "Describe el cambio técnico..." : "Pídeme ayuda sobre tu negocio..."} disabled={thinking} />
              <button type="submit" disabled={thinking}><Send size={14} /></button>
            </form>
            {isArchitect ? (
              <Link href="/asistente" className="flowly-companion-architect-link"><Code2 size={14} /> Abrir Asistente Arquitecto</Link>
            ) : (
              <small className="flowly-companion-safe-note"><ShieldCheck size={13} /> Este Companion no puede programar ni abrir Studio. Solo ayuda al cliente con su panel.</small>
            )}
          </section>

          {!isArchitect && (
            <>
              <section className="flowly-companion-grid">
                <div>
                  <span className="flowly-companion-section-title"><Target size={14} /> Misión activa</span>
                  <p>{context.mission}</p>
                </div>
                <div>
                  <span className="flowly-companion-section-title"><Zap size={14} /> XP</span>
                  <strong>{companionStats.xp}/{companionStats.nextLevelXp}</strong>
                </div>
              </section>

              <section className="flowly-companion-list">
                <span className="flowly-companion-section-title"><Target size={14} /> Misiones</span>
                {companionMissions.map((mission) => (
                  <div key={mission.id} className="flowly-companion-list-item">
                    <div>
                      <strong>{mission.label}</strong>
                      <small>+{mission.xp} XP</small>
                    </div>
                    <div className="flowly-companion-mini-progress"><span style={{ width: `${mission.progress}%` }} /></div>
                  </div>
                ))}
              </section>

              <section className="flowly-companion-rewards">
                <span className="flowly-companion-section-title"><Trophy size={14} /> Recompensas</span>
                <div>
                  {companionRewards.map((reward) => (
                    <article key={reward.id} data-unlocked={reward.unlocked}>
                      <strong>{reward.label}</strong>
                      <small>{reward.description}</small>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </aside>
      )}
    </div>
  );
}
