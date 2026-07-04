"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, BarChart3, Brain, Eye, LockKeyhole, MousePointerClick, RefreshCw, ShoppingCart, Users } from "lucide-react";

const ACCESS_PASSWORD = "Nosotrostarot1.";

type Summary = {
  onlineNow?: number;
  visitsToday?: number;
  visitorsToday?: number;
  visitors30Days?: number;
  sessions30Days?: number;
  reachedCheckout?: number;
  completedPurchase?: number;
  checkoutConversion?: number;
};

type FunnelStep = { step: string; count: number; dropRate: number };
type SimpleRow = { path: string; count?: number; views?: number };
type RecentEvent = { event_name: string; path: string; funnel_step: string; created_at: string; viewport?: string; language?: string };

type AnalyticsPayload = {
  dbReady?: boolean;
  generatedAt?: string;
  summary?: Summary;
  funnel?: FunnelStep[];
  abandonments?: SimpleRow[];
  pages?: SimpleRow[];
  recentEvents?: RecentEvent[];
  recommendations?: string[];
  error?: string;
};

const funnelLabels: Record<string, string> = {
  landing: "Landing",
  pricing: "Precios",
  signup: "Registro",
  onboarding: "Onboarding",
  checkout: "Carrito / checkout",
  purchase: "Compra completada",
  dashboard: "Dashboard",
  other: "Otras páginas",
};

function formatNumber(value?: number) {
  return new Intl.NumberFormat("es-ES").format(value || 0);
}

function formatDate(value?: string) {
  if (!value) return "Sin datos";
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "medium" }).format(new Date(value));
}

export default function PanelAdminPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const summary = data?.summary || {};
  const maxFunnel = useMemo(() => Math.max(...(data?.funnel || []).map((item) => item.count), 1), [data?.funnel]);

  async function loadAnalytics() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/paneladmin/analytics", {
        headers: { "x-paneladmin-password": ACCESS_PASSWORD },
        cache: "no-store",
      });
      const payload = (await response.json()) as AnalyticsPayload;
      if (!response.ok) throw new Error(payload.error || "No se pudieron cargar las métricas.");
      setData(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudieron cargar las métricas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!unlocked) return;
    loadAnalytics();
    const interval = window.setInterval(loadAnalytics, 45000);
    return () => window.clearInterval(interval);
  }, [unlocked]);

  const handleAccess = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.trim() === ACCESS_PASSWORD) {
      setUnlocked(true);
      setAccessError("");
      return;
    }
    setAccessError("Contraseña incorrecta.");
  };

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-[#070913] px-6 py-10 text-white">
        <section className="mx-auto flex min-h-[78vh] max-w-xl items-center justify-center">
          <form onSubmit={handleAccess} className="w-full rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-purple-950/30 backdrop-blur">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200">
              <LockKeyhole size={26} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-200/70">Área privada</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight">Panel Admin</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">Métricas privadas de visitas, embudo, abandono y carrito de Flowly.</p>
            <div className="mt-8 space-y-3">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Contraseña</label>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none transition focus:border-cyan-300/70" placeholder="••••••••••••" />
              {accessError ? <p className="text-sm font-semibold text-rose-300">{accessError}</p> : null}
            </div>
            <button type="submit" className="mt-6 w-full rounded-2xl bg-cyan-300 px-5 py-4 font-black text-slate-950 transition hover:bg-cyan-200">Entrar</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#060816] px-5 py-8 text-white sm:px-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-400/12 via-purple-500/10 to-black p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.32em] text-cyan-200/75"><BarChart3 size={16} /> Inteligencia comercial</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Panel Admin</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Visitas reales, usuarios conectados, embudo comercial y páginas donde abandonan.</p>
              <p className="mt-2 text-xs text-slate-500">Última actualización: {formatDate(data?.generatedAt)}</p>
            </div>
            <button onClick={loadAnalytics} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-4 font-black text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60">
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} /> Actualizar
            </button>
          </div>
        </header>

        {error ? <Warning text={error} /> : null}
        {data?.dbReady === false ? <Warning text="Supabase no está configurado o falta ejecutar el SQL de analítica." /> : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={<Activity size={22} />} label="Usuarios ahora" value={formatNumber(summary.onlineNow)} hint="Activos en los últimos 5 minutos" tone="emerald" />
          <MetricCard icon={<Eye size={22} />} label="Visitas hoy" value={formatNumber(summary.visitsToday)} hint={`${formatNumber(summary.visitorsToday)} visitantes únicos hoy`} tone="cyan" />
          <MetricCard icon={<Users size={22} />} label="Visitantes 30 días" value={formatNumber(summary.visitors30Days)} hint={`${formatNumber(summary.sessions30Days)} sesiones detectadas`} tone="purple" />
          <MetricCard icon={<ShoppingCart size={22} />} label="Llegaron al carrito" value={formatNumber(summary.reachedCheckout)} hint={`${formatNumber(summary.checkoutConversion)}% conversión desde checkout`} tone="amber" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <Panel title="Embudo comercial" subtitle="Mide cuántas sesiones llegan a cada fase.">
            <div className="space-y-4">
              {(data?.funnel || []).map((step) => (
                <div key={step.step}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-bold text-slate-200">{funnelLabels[step.step] || step.step}</span>
                    <span className="text-slate-400">{formatNumber(step.count)} sesiones · abandono {step.dropRate}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-cyan-300" style={{ width: `${Math.max(4, Math.round((step.count / maxFunnel) * 100))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="IA de análisis" subtitle="Lectura rápida de los datos actuales.">
            <div className="space-y-3">
              {(data?.recommendations || []).map((item) => (
                <div key={item} className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50">
                  <div className="mb-2 flex items-center gap-2 font-black"><Brain size={16} /> Recomendación</div>
                  {item}
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <Panel title="Dónde abandonan" subtitle="Última página conocida por sesión.">
            <SimpleTable rows={data?.abandonments || []} valueKey="count" valueLabel="Sesiones" />
          </Panel>
          <Panel title="Páginas más vistas" subtitle="Ranking de page views de los últimos 30 días.">
            <SimpleTable rows={data?.pages || []} valueKey="views" valueLabel="Vistas" />
          </Panel>
        </section>

        <Panel title="Actividad reciente" subtitle="Últimos eventos recibidos por Flowly Analytics.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3">Evento</th>
                  <th className="px-4 py-3">Página</th>
                  <th className="px-4 py-3">Fase</th>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Dispositivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {(data?.recentEvents || []).map((event, index) => (
                  <tr key={`${event.created_at}-${index}`} className="text-slate-300">
                    <td className="px-4 py-3 font-bold text-white">{event.event_name}</td>
                    <td className="px-4 py-3">{event.path}</td>
                    <td className="px-4 py-3">{funnelLabels[event.funnel_step] || event.funnel_step}</td>
                    <td className="px-4 py-3">{formatDate(event.created_at)}</td>
                    <td className="px-4 py-3">{event.viewport || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data?.recentEvents?.length ? <Empty text="Todavía no hay eventos. Navega la web unos minutos y vuelve a actualizar." /> : null}
          </div>
        </Panel>
      </section>
    </main>
  );
}

function Warning({ text }: { text: string }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100"><AlertTriangle size={18} /> {text}</div>;
}

function MetricCard({ icon, label, value, hint, tone }: { icon: React.ReactNode; label: string; value: string; hint: string; tone: "emerald" | "cyan" | "purple" | "amber" }) {
  const classes = {
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
    purple: "border-purple-300/20 bg-purple-300/10 text-purple-100",
    amber: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  }[tone];
  return <div className={`rounded-[1.6rem] border p-5 ${classes}`}><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-black/20">{icon}</div><p className="text-xs font-black uppercase tracking-[0.18em] opacity-75">{label}</p><p className="mt-2 text-3xl font-black">{value}</p><p className="mt-2 text-xs opacity-75">{hint}</p></div>;
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-purple-950/10 backdrop-blur"><div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-xl font-black">{title}</h2><p className="mt-1 text-xs text-slate-400">{subtitle}</p></div><MousePointerClick size={18} className="text-cyan-200/60" /></div>{children}</section>;
}

function SimpleTable({ rows, valueKey, valueLabel }: { rows: SimpleRow[]; valueKey: "count" | "views"; valueLabel: string }) {
  if (!rows.length) return <Empty text="Todavía no hay datos suficientes." />;
  return <div className="space-y-2">{rows.map((row) => <div key={row.path} className="flex items-center justify-between gap-4 rounded-2xl bg-black/20 px-4 py-3 text-sm"><span className="truncate font-semibold text-slate-200">{row.path}</span><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-cyan-100">{formatNumber(row[valueKey])} {valueLabel}</span></div>)}</div>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-8 text-center text-sm text-slate-400">{text}</div>;
}
