import Link from "next/link";
import { Bot, Gift, Goal, Sparkles, Star, Trophy, Zap } from "lucide-react";
import { IaAssistantModule } from "@/lib/generated/ia-assistant";

function Card({ title, value, text }: { title: string; value: string; text: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.055] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">{title}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/50">{text}</p>
    </article>
  );
}

function Progress({ value }: { value: number }) {
  return <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-200" style={{ width: `${value}%` }} /></div>;
}

export default function IaAssistantPage() {
  return (
    <main className="min-h-screen bg-[#06040d] px-5 py-8 text-white lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/dashboard" className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/60 hover:text-white">← Volver al panel</Link>
          <Link href="/studio/v2" className="rounded-xl border border-cyan-200/30 bg-cyan-200 px-4 py-2 text-sm font-semibold text-slate-950">Abrir en Studio</Link>
        </div>

        <header className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-300/15 via-white/[0.06] to-fuchsia-400/10 p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">Módulo generado por Flowly Studio</p>
              <h1 className="mt-4 text-4xl font-semibold md:text-5xl">IA Assistant</h1>
              <p className="mt-4 max-w-3xl text-white/65">Companion de Flowly con objetivos, misiones, recompensas, experiencia, niveles, estado de ánimo y avatar. Esta es la primera versión instalable para probar el módulo y conectarlo después al runtime real.</p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-black/25 p-6 text-center">
              <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border border-cyan-200/25 bg-cyan-200/10 text-cyan-100"><Bot size={52} /></div>
              <h2 className="mt-4 text-2xl font-semibold">Companion Nivel 7</h2>
              <p className="mt-2 text-sm text-white/55">Estado: motivado · Energía: 82%</p>
              <Progress value={82} />
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Card title="Experiencia" value="2.840 XP" text="Progreso acumulado por objetivos, misiones y actividad." />
          <Card title="Objetivos" value="3 activos" text="Metas que el Companion está ayudando a cumplir." />
          <Card title="Recompensas" value="1 lista" text="Premios desbloqueables sin afectar permisos reales." />
          <Card title="Arquitectura" value={`${IaAssistantModule.artifacts.length}`} text="Artefactos creados desde el Project Generator." />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6">
            <div className="mb-5 flex items-center gap-3"><Goal className="text-cyan-100" /><h2 className="text-2xl font-semibold">Objetivos activos</h2></div>
            <div className="space-y-4">
              {IaAssistantModule.goals.map((goal) => (
                <article key={goal.name} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center justify-between gap-4"><h3 className="font-semibold">{goal.name}</h3><span className="text-sm text-white/45">{goal.status}</span></div>
                  <Progress value={goal.progress} />
                  <p className="mt-2 text-xs text-white/45">{goal.progress}% de {goal.target}%</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6">
            <div className="mb-5 flex items-center gap-3"><Zap className="text-cyan-100" /><h2 className="text-2xl font-semibold">Misiones</h2></div>
            <div className="space-y-3">
              {IaAssistantModule.missions.map((mission) => (
                <article key={mission.name} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center justify-between"><h3 className="font-semibold">{mission.name}</h3><span className="text-xs text-cyan-100">+{mission.xp} XP</span></div>
                  <p className="mt-2 text-sm text-white/45">{mission.status}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6">
            <div className="mb-5 flex items-center gap-3"><Trophy className="text-cyan-100" /><h2 className="text-2xl font-semibold">Recompensas</h2></div>
            <div className="grid gap-3 md:grid-cols-3">
              {IaAssistantModule.rewards.map((reward) => (
                <article key={reward.name} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <Gift className="text-cyan-100" size={20} />
                  <h3 className="mt-3 font-semibold">{reward.name}</h3>
                  <p className="mt-2 text-sm text-white/45">{reward.points} puntos · {reward.status}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6">
            <div className="mb-5 flex items-center gap-3"><Sparkles className="text-cyan-100" /><h2 className="text-2xl font-semibold">Artefactos generados</h2></div>
            <div className="grid gap-2">
              {IaAssistantModule.artifacts.slice(0, 10).map((artifact) => (
                <div key={`${artifact.kind}-${artifact.slug}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                  <span>{artifact.name}</span>
                  <span className="text-white/35">{artifact.kind}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.055] p-6">
          <div className="flex items-center gap-3"><Star className="text-cyan-100" /><h2 className="text-2xl font-semibold">Siguiente conexión</h2></div>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-white/55">El módulo ya está preparado como primera versión generada. El siguiente paso será conectar estas piezas al Companion real, registrar eventos del sistema y hacer que las misiones se actualicen automáticamente cuando el usuario complete acciones dentro de CRM, Facturación, Docs o Studio.</p>
        </section>
      </section>
    </main>
  );
}
