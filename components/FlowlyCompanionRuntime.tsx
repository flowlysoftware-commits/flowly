"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, MessageCircle, Minimize2, Sparkles, Target, Trophy, X, Zap } from "lucide-react";
import EvolutionaryCompanionAvatar from "@/components/EvolutionaryCompanionAvatar";
import { companionMissions, companionRewards, companionStats, getCompanionContext } from "@/lib/flowlyCompanionRuntime";

const HIDDEN_PREFIXES = ["/login", "/registro", "/reservas", "/demo/login"];

function shouldHide(pathname: string) {
  if (pathname === "/") return true;
  return HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default function FlowlyCompanionRuntime() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const context = useMemo(() => getCompanionContext(pathname), [pathname]);
  const xpPercent = Math.round((companionStats.xp / companionStats.nextLevelXp) * 100);

  if (shouldHide(pathname)) return null;

  return (
    <div className="flowly-companion-runtime" data-open={open} data-minimized={minimized}>
      {!minimized && (
        <div className="flowly-companion-bubble" role="status">
          <span className="flowly-companion-bubble-kicker">{context.area}</span>
          <strong>{context.title}</strong>
          <p>{context.message}</p>
        </div>
      )}

      <div className="flowly-companion-avatar-shell">
        <EvolutionaryCompanionAvatar name={companionStats.name} level={companionStats.level} xpPercent={xpPercent} mood={context.mode} onClick={() => setOpen((value) => !value)} />
        <button type="button" className="flowly-companion-avatar-cta" onClick={() => setOpen((value) => !value)}>
          <MessageCircle size={15} />
          Hablar
        </button>
      </div>

      {open && (
        <aside className="flowly-companion-panel" aria-label="Flowly Companion">
          <header className="flowly-companion-panel-header">
            <div>
              <span>Companion Runtime</span>
              <h3>{companionStats.name}</h3>
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
            <div className="flowly-companion-status-avatar"><EvolutionaryCompanionAvatar name={companionStats.name} level={companionStats.level} xpPercent={xpPercent} mood={context.mode} compact /></div>
            <div>
              <strong>Nivel {companionStats.level}</strong>
              <p>Ánimo: {context.mood} · Energía {companionStats.energy}%</p>
              <div className="flowly-companion-progress"><span style={{ width: `${xpPercent}%` }} /></div>
            </div>
          </section>

          <section className="flowly-companion-chat-card">
            <span className="flowly-companion-section-title"><Sparkles size={14} /> Sugerencia contextual</span>
            <p>{context.suggestion}</p>
            <div className="flowly-companion-chat-input">
              <input placeholder="Pídeme algo con palabras normales..." />
              <Link href="/asistente">Enviar</Link>
            </div>
          </section>

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
        </aside>
      )}
    </div>
  );
}
