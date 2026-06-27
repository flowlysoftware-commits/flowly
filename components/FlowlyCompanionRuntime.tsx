"use client";

import { FormEvent, useMemo, useState } from "react";
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

function looksLikeBuilderRequest(message: string) {
  const text = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return ["crea", "crear", "modifica", "modificar", "programa", "codigo", "studio", "builder", "kernel", "api", "sql", "modulo", "módulo"].some((word) => text.includes(word));
}

function buildCustomerReply(message: string, area: string) {
  if (looksLikeBuilderRequest(message)) {
    return "Eso pertenece al Flowly OS de desarrollo. En este panel de cliente puedo ayudarte a usar el negocio: tareas, clientes, facturas, objetivos, WhatsApp, recordatorios y recomendaciones. No crearé ni modificaré módulos desde aquí.";
  }

  if (message.trim().length < 3) {
    return "Dime qué necesitas hacer en el panel y te ayudo paso a paso.";
  }

  return `Estoy en modo cliente y te ayudaré con ${area}. Puedo convertirlo en una tarea, un objetivo o una recomendación dentro del panel sin tocar la arquitectura interna.`;
}

export default function FlowlyCompanionRuntime() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const context = useMemo(() => getCompanionContext(pathname), [pathname]);
  const mode = getFlowlyRuntimeMode(pathname);
  const isArchitect = mode === "arquitecto";
  const xpPercent = Math.round((companionStats.xp / companionStats.nextLevelXp) * 100);
  const [conversation, setConversation] = useState<{ role: "assistant" | "user"; content: string }[]>([
    { role: "assistant", content: "Hola. Soy el Companion del panel. Te ayudaré sin mostrarte herramientas técnicas." },
  ]);

  if (shouldHide(pathname)) return null;

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const clean = message.trim();
    if (!clean) return;
    setMessage("");

    if (isArchitect) {
      setConversation((current) => [
        ...current,
        { role: "user", content: clean },
        { role: "assistant", content: "Esta petición es de arquitectura. Ábrela en el Asistente Arquitecto para analizarla con Analyzer, Studio y Builder." },
      ]);
      return;
    }

    setConversation((current) => [
      ...current,
      { role: "user", content: clean },
      { role: "assistant", content: buildCustomerReply(clean, context.area) },
    ]);
  };

  return (
    <div className="flowly-companion-runtime" data-open={open} data-minimized={minimized} data-mode={mode}>
      {!minimized && (
        <div className="flowly-companion-bubble" role="status">
          <span className="flowly-companion-bubble-kicker">{isArchitect ? "Companion Arquitecto" : context.area}</span>
          <strong>{isArchitect ? "Estoy en modo desarrollo" : context.title}</strong>
          <p>{isArchitect ? "Aquí sí puedo ayudarte con Studio, Builder, Kernel y cambios internos." : context.message}</p>
        </div>
      )}

      <div className="flowly-companion-avatar-shell">
        <EvolutionaryCompanionAvatar name={companionStats.name} level={companionStats.level} xpPercent={xpPercent} mood={isArchitect ? "thinking" : context.mode} onClick={() => setOpen((value) => !value)} />
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
            <div className="flowly-companion-status-avatar"><EvolutionaryCompanionAvatar name={companionStats.name} level={companionStats.level} xpPercent={xpPercent} mood={isArchitect ? "thinking" : context.mode} compact /></div>
            <div>
              <strong>{isArchitect ? "Modo arquitecto" : `Nivel ${companionStats.level}`}</strong>
              <p>{isArchitect ? "Puede abrir herramientas internas. No aparece en paneles de clientes." : `Ánimo: ${context.mood} · Energía ${companionStats.energy}%`}</p>
              <div className="flowly-companion-progress"><span style={{ width: `${xpPercent}%` }} /></div>
            </div>
          </section>

          <section className="flowly-companion-chat-card">
            <span className="flowly-companion-section-title"><Sparkles size={14} /> {isArchitect ? "Asistente técnico" : "Ayuda del panel"}</span>
            <div className="flowly-companion-conversation">
              {conversation.slice(-4).map((item, index) => <p key={`${item.role}-${index}`} data-role={item.role}>{item.content}</p>)}
            </div>
            <form className="flowly-companion-chat-input" onSubmit={sendMessage}>
              <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={isArchitect ? "Describe el cambio técnico..." : "Pídeme ayuda sobre tu negocio..."} />
              <button type="submit"><Send size={14} /></button>
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
