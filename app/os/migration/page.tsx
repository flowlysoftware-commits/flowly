"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Database, GitBranch, Layers3, Loader2, RadioTower, ShieldAlert, Sparkles } from "lucide-react";
import { analyzeCurrentFlowlyProject } from "@/lib/flowlyAnalyzer";

const report = analyzeCurrentFlowlyProject();

export default function FlowlyMigrationPage() {
  const [selected, setSelected] = useState(report.modules[0]?.id || "crm");
  const [registering, setRegistering] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const module = useMemo(() => report.modules.find((item) => item.id === selected) || report.modules[0], [selected]);

  const registerModules = async () => {
    setRegistering(true);
    setResult(null);
    try {
      const response = await fetch("/api/os/register-modules", { method: "POST" });
      const data = await response.json();
      setResult(data.ok ? `Registrados ${data.registered} módulos en Kernel.` : data.warning || "Seed preparado.");
    } catch (error) {
      setResult(error instanceof Error ? error.message : "No se pudo registrar.");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050710] px-6 py-8 text-white">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/os" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10"><ArrowLeft size={16} /> Volver a OS</Link>
          <button onClick={registerModules} disabled={registering} className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-2 text-sm font-black text-slate-950 disabled:opacity-60">
            {registering ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />} Registrar módulos en Kernel
          </button>
        </div>

        <header className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 shadow-2xl shadow-black/30">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-100"><GitBranch size={15} /> Migration Blueprint</div>
          <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">Migración a Flowly OS</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62">Inventario vivo del panel actual, separación entre Flowly OS y panel cliente, registro Kernel y preparación para Analyzer + Builder.</p>
          {result && <p className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">{result}</p>}
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric title="Módulos detectados" value={String(report.summary.totalModules)} icon={<Layers3 size={18} />} />
          <Metric title="Progreso OS" value={`${report.summary.progress}%`} icon={<CheckCircle2 size={18} />} />
          <Metric title="Riesgo alto" value={String(report.summary.highRisk)} icon={<ShieldAlert size={18} />} />
          <Metric title="Sprints" value={String(report.sprints.length)} icon={<RadioTower size={18} />} />
        </section>

        <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-4">
            <h2 className="mb-3 text-lg font-black">Módulos actuales</h2>
            <div className="space-y-2">
              {report.modules.map((item) => (
                <button key={item.id} onClick={() => setSelected(item.id)} className={`w-full rounded-2xl border px-4 py-3 text-left transition ${selected === item.id ? "border-cyan-200/40 bg-cyan-300/10" : "border-white/10 bg-black/15 hover:bg-white/5"}`}>
                  <div className="flex items-center justify-between gap-3"><strong>{item.name}</strong><span className="text-xs text-white/40">{item.layer}</span></div>
                  <p className="mt-1 text-xs text-white/50">{item.status} · riesgo {item.risk}</p>
                </button>
              ))}
            </div>
          </aside>

          {module && (
            <article className="rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/60">{module.targetDomain}</p>
                  <h2 className="mt-2 text-3xl font-black">{module.name}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">{module.description}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/60">{module.owner}</span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Box title="Rutas actuales" items={module.currentRoutes} />
                <Box title="Ruta objetivo" items={[module.targetRoute]} />
                <Box title="Business Objects" items={module.businessObjects} />
                <Box title="Capabilities" items={module.capabilities} />
              </div>

              <section className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                <h3 className="font-bold text-amber-100">Acciones de migración</h3>
                <ul className="mt-3 space-y-2 text-sm text-amber-50/75">
                  {module.suggestedActions.map((action) => <li key={action}>• {action}</li>)}
                </ul>
              </section>
            </article>
          )}
        </section>

        <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-6">
          <h2 className="text-2xl font-black">Sprints aplicados/preparados</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {report.sprints.map((sprint) => (
              <article key={sprint.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-cyan-100"><Sparkles size={15} /><strong>{sprint.title}</strong></div>
                <p className="mt-2 text-sm leading-6 text-white/58">{sprint.goal}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/35">{sprint.status}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5"><div className="text-cyan-100">{icon}</div><p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/40">{title}</p><p className="mt-2 text-3xl font-black">{value}</p></div>;
}

function Box({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><h3 className="font-bold">{title}</h3><div className="mt-3 flex flex-wrap gap-2">{items.map((item) => <span key={item} className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/65">{item}</span>)}</div></div>;
}
