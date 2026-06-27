"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, BrainCircuit, Code2, FileSearch, GitBranch, Layers3, Package, RefreshCw, Repeat2, Rocket, Search, ShieldCheck, Sparkles, Store } from "lucide-react";

type Snapshot = {
  generadoEn: string;
  runtime: Array<{ id: string; nombre: string; tipo: string; estado: string; descripcion: string }>;
  templates: Array<{ id: string; nombre: string; categoria: string; descripcion: string; salida: string }>;
  registry: { resumen: { totalArtefactos: number; puntuacionArquitectonica: number; riesgo: string; nodos: number; relaciones: number }; avisos: string[]; recomendaciones: string[] };
  dependency: { issues: Array<{ tipo: string; mensaje: string; artefactos: string[] }> };
  estado: Record<string, string>;
};

type ReverseResult = { nombre: string; resumen: string; businessObjects: string[]; capabilities: string[]; routes: string[]; tables: string[]; recommendations: string[] };
type RefactorPlan = { resumen: string; riesgo: string; afectados: Array<{ path: string; accion: string; detalle: string }> };
type ArchitectBlueprint = { moduleName: string; domain: string; businessObjects: string[]; capabilities: string[]; workflows: string[]; policies: string[]; apps: string[] };

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Error inesperado");
  return data as T;
}

function EstadoPill({ estado }: { estado: string }) {
  const color = estado === "activo" || estado === "completado" ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100" : estado === "experimental" || estado === "pendiente" ? "border-amber-300/20 bg-amber-400/10 text-amber-100" : "border-white/10 bg-white/[0.06] text-white/60";
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${color}`}>{estado}</span>;
}

function Card({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl"><div className="mb-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-200/15 bg-cyan-300/10 text-cyan-100">{icon}</span><h2 className="text-xl font-semibold">{title}</h2></div>{children}</section>;
}

export default function FlowlyStudioCorePage() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [source, setSource] = useState("create table public.vehicles (id uuid primary key, name text);\napp/api/vehicles/route.ts\ntype Vehicle = { id: string; name: string }\nCreateVehicle\nUpdateVehicle");
  const [reverse, setReverse] = useState<ReverseResult | null>(null);
  const [fromName, setFromName] = useState("Customer");
  const [toName, setToName] = useState("Client");
  const [refactor, setRefactor] = useState<RefactorPlan | null>(null);
  const [architectPrompt, setArchitectPrompt] = useState("Quiero un módulo para una clínica veterinaria");
  const [blueprint, setBlueprint] = useState<ArchitectBlueprint | null>(null);

  useEffect(() => { void loadCore(); }, []);

  async function loadCore() {
    setError("");
    try {
      const response = await fetch("/api/studio/core");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo cargar el Core de Studio.");
      setSnapshot(data.snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el Core de Studio.");
    }
  }

  async function runReverse() {
    setError(""); setMessage("");
    try {
      const data = await postJson<{ result: ReverseResult }>("/api/studio/reverse-engineer", { source, name: "Análisis rápido" });
      setReverse(data.result);
      setMessage("Análisis inverso preparado.");
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo analizar."); }
  }

  async function runRefactor() {
    setError(""); setMessage("");
    try {
      const data = await postJson<{ plan: RefactorPlan }>("/api/studio/refactor", { from: fromName, to: toName });
      setRefactor(data.plan);
      setMessage("Plan de refactorización creado.");
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo crear el plan."); }
  }

  async function runArchitect() {
    setError(""); setMessage("");
    try {
      const data = await postJson<{ blueprint: ArchitectBlueprint }>("/api/studio/architect/full", { prompt: architectPrompt });
      setBlueprint(data.blueprint);
      setMessage("Architect ha creado un blueprint completo.");
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo generar el blueprint."); }
  }

  const estadoEntries = useMemo(() => Object.entries(snapshot?.estado || {}), [snapshot]);

  return (
    <main className="min-h-screen bg-[#080611] px-5 py-8 text-white lg:px-8">
      <section className="mx-auto max-w-7xl">
        <Link href="/studio" className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ArrowLeft size={16} /> Volver a Studio</Link>
        <header className="mt-6 rounded-[2.2rem] border border-white/10 bg-white/[0.06] p-8 backdrop-blur-2xl md:p-10">
          <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">Core de Flowly Studio</span>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-end">
            <div><h1 className="text-4xl font-semibold tracking-tight md:text-6xl">El corazón operativo de Studio</h1><p className="mt-5 max-w-3xl text-base leading-8 text-white/62">Aquí viven los 10 bloques avanzados: Generator Engine, plantillas, registro global, ingeniería inversa, dependencias, refactorización, runtime, Architect AI, Reviewer AI y Marketplace.</p></div>
            <div className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-400/10 p-5 text-emerald-50"><p className="text-xs uppercase tracking-[0.22em] opacity-65">Puntuación arquitectónica</p><p className="mt-2 text-5xl font-semibold">{snapshot?.registry.resumen.puntuacionArquitectonica ?? "--"}</p><p className="mt-2 text-sm opacity-75">Riesgo: {snapshot?.registry.resumen.riesgo || "pendiente"}</p></div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2"><button onClick={loadCore} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold hover:bg-white/10"><RefreshCw size={16} /> Actualizar Core</button><Link href="/studio/generator" className="inline-flex items-center gap-2 rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950"><Rocket size={16} /> Abrir Generator</Link></div>
          {message ? <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}
          {error ? <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        </header>

        <section className="mt-6 grid gap-3 md:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4"><p className="text-xs uppercase tracking-[0.2em] text-white/35">Artefactos</p><p className="mt-1 text-3xl font-semibold">{snapshot?.registry.resumen.totalArtefactos ?? 0}</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4"><p className="text-xs uppercase tracking-[0.2em] text-white/35">Nodos</p><p className="mt-1 text-3xl font-semibold">{snapshot?.registry.resumen.nodos ?? 0}</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4"><p className="text-xs uppercase tracking-[0.2em] text-white/35">Relaciones</p><p className="mt-1 text-3xl font-semibold">{snapshot?.registry.resumen.relaciones ?? 0}</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4"><p className="text-xs uppercase tracking-[0.2em] text-white/35">Plantillas</p><p className="mt-1 text-3xl font-semibold">{snapshot?.templates.length ?? 0}</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4"><p className="text-xs uppercase tracking-[0.2em] text-white/35">Runtime</p><p className="mt-1 text-3xl font-semibold">{snapshot?.runtime.length ?? 0}</p></div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <Card title="1-3 · Generator Engine, plantillas y registro global" icon={<Code2 size={20} />}>
            <div className="grid gap-3 md:grid-cols-2">{snapshot?.templates.map((template) => <article key={template.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-start justify-between gap-3"><h3 className="font-semibold">{template.nombre}</h3><span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/55">{template.categoria}</span></div><p className="mt-2 text-sm leading-6 text-white/55">{template.descripcion}</p><p className="mt-2 text-xs text-cyan-100/55">{template.salida}</p></article>)}</div>
          </Card>

          <Card title="7 · Studio Runtime" icon={<Layers3 size={20} />}>
            <div className="space-y-3">{snapshot?.runtime.map((item) => <article key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{item.nombre}</h3><p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/35">{item.tipo}</p></div><EstadoPill estado={item.estado} /></div><p className="mt-2 text-sm leading-6 text-white/55">{item.descripcion}</p></article>)}</div>
          </Card>

          <Card title="4 · Ingeniería inversa" icon={<FileSearch size={20} />}>
            <textarea value={source} onChange={(event) => setSource(event.target.value)} rows={7} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white outline-none" />
            <button onClick={runReverse} className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950"><Search size={16} /> Analizar código o SQL</button>
            {reverse ? <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50/80"><strong>{reverse.resumen}</strong><p className="mt-2">Objetos: {reverse.businessObjects.join(", ") || "ninguno"}</p><p>Capacidades: {reverse.capabilities.join(", ") || "ninguna"}</p><p>Tablas: {reverse.tables.join(", ") || "ninguna"}</p><p>Rutas: {reverse.routes.join(", ") || "ninguna"}</p></div> : null}
          </Card>

          <Card title="5 · Dependency Engine" icon={<GitBranch size={20} />}>
            <div className="space-y-3">{snapshot?.dependency.issues.map((issue, index) => <article key={`${issue.tipo}-${index}`} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold capitalize">{issue.tipo}</h3><span className="text-xs text-white/35">{issue.artefactos.length} afectados</span></div><p className="mt-2 text-sm leading-6 text-white/55">{issue.mensaje}</p></article>)}{!snapshot?.dependency.issues.length ? <p className="text-sm text-white/55">Sin problemas de dependencias detectados.</p> : null}</div>
          </Card>

          <Card title="6 · Refactoring Engine" icon={<Repeat2 size={20} />}>
            <div className="grid gap-3 md:grid-cols-2"><input value={fromName} onChange={(event) => setFromName(event.target.value)} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none" placeholder="Nombre actual" /><input value={toName} onChange={(event) => setToName(event.target.value)} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none" placeholder="Nuevo nombre" /></div>
            <button onClick={runRefactor} className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100"><Repeat2 size={16} /> Preparar plan</button>
            {refactor ? <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4"><p className="font-semibold">{refactor.resumen}</p><p className="mt-2 text-sm text-white/55">Riesgo: {refactor.riesgo}</p><div className="mt-3 max-h-40 overflow-auto text-xs text-white/45">{refactor.afectados.slice(0, 30).map((item) => <p key={`${item.path}-${item.detalle}`}>• {item.accion}: {item.path} · {item.detalle}</p>)}</div></div> : null}
          </Card>

          <Card title="8-9 · Architect AI y Reviewer AI" icon={<BrainCircuit size={20} />}>
            <textarea value={architectPrompt} onChange={(event) => setArchitectPrompt(event.target.value)} rows={4} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white outline-none" />
            <button onClick={runArchitect} className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950"><Sparkles size={16} /> Generar blueprint</button>
            {blueprint ? <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50/80"><strong>{blueprint.moduleName}</strong><p className="mt-2">Dominio: {blueprint.domain}</p><p>Objetos: {blueprint.businessObjects.join(", ")}</p><p>Capacidades: {blueprint.capabilities.join(", ")}</p><p>Apps: {blueprint.apps.join(", ")}</p></div> : null}
            <p className="mt-4 text-sm text-white/45">La revisión automática avanzada está conectada en <Link href="/studio/generator" className="text-cyan-100 hover:underline">Generator</Link> mediante Reviewer AI.</p>
          </Card>

          <Card title="10 · Marketplace Integration" icon={<Store size={20} />}>
            <p className="text-sm leading-6 text-white/55">El paquete Marketplace se genera automáticamente dentro del ZIP instalable. Incluye manifiesto, permisos, versión, estado, checklist de publicación y artefactos.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-black/20 p-4"><Package className="text-cyan-100" size={20} /><h3 className="mt-2 font-semibold">Privado</h3><p className="mt-1 text-sm text-white/45">Para uso interno y pruebas.</p></div><div className="rounded-2xl border border-white/10 bg-black/20 p-4"><ShieldCheck className="text-emerald-100" size={20} /><h3 className="mt-2 font-semibold">Marketplace</h3><p className="mt-1 text-sm text-white/45">Preparado para publicar cuando supere revisión.</p></div></div>
          </Card>
        </section>
      </section>
    </main>
  );
}
