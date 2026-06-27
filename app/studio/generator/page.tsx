"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Database,
  Download,
  GitBranch,
  Network,
  PackageCheck,
  RefreshCw,
  Rocket,
  Search,
  ShieldAlert,
  Sparkles,
  Workflow,
} from "lucide-react";
import type { FlowlyStudioArtifactKind } from "@/lib/flowlyStudio";
import type { FlowlyArchitectureAnalysis, FlowlyModuleGeneration } from "@/lib/flowlyStudioHeart";

type StudioArtifactRow = {
  id: string;
  kind: FlowlyStudioArtifactKind;
  name: string;
  slug: string;
  domain: string;
  description: string;
  status: string;
};

type Suggestion = {
  moduleName: string;
  businessObjects: string[];
  capabilities: string[];
  workflows: string[];
  policies: string[];
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Error inesperado");
  return data as T;
}

function downloadText(filename: string, value: string, type = "text/plain") {
  const blob = new Blob([value], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function ArtifactBlock({ title, value, filename }: { title: string; value: string; filename: string }) {
  return (
    <details className="rounded-2xl border border-white/10 bg-black/25 p-4" open>
      <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-cyan-100">
        {title}
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            downloadText(filename, value || "");
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-white/70 hover:bg-white/10"
        >
          <Download size={12} /> descargar
        </button>
      </summary>
      <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-black/35 p-4 text-xs leading-5 text-white/70">{value || "Pendiente de generar."}</pre>
    </details>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-200/15 bg-cyan-300/10 text-cyan-100">{icon}</span>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/35">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </article>
  );
}

export default function FlowlyGeneratorPage() {
  const [library, setLibrary] = useState<StudioArtifactRow[]>([]);
  const [analysis, setAnalysis] = useState<FlowlyArchitectureAnalysis | null>(null);
  const [generation, setGeneration] = useState<FlowlyModuleGeneration | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [moduleName, setModuleName] = useState("Flowly Generated Module");
  const [architectPrompt, setArchitectPrompt] = useState("Quiero crear un módulo de alquiler de vehículos");
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return library;
    return library.filter((item) => [item.name, item.slug, item.kind, item.domain, item.description].join(" ").toLowerCase().includes(query));
  }, [library, search]);

  useEffect(() => {
    void loadEverything();
  }, []);

  async function loadEverything() {
    setError("");
    setIsLoading(true);
    try {
      const [libraryResponse, architectureResponse] = await Promise.all([
        fetch("/api/studio/artifacts"),
        fetch("/api/studio/architecture"),
      ]);
      const libraryData = await libraryResponse.json();
      const architectureData = await architectureResponse.json();
      if (!libraryResponse.ok) throw new Error(libraryData.error || "No se pudo cargar Studio.");
      if (!architectureResponse.ok) throw new Error(architectureData.error || "No se pudo analizar la arquitectura.");
      setLibrary(libraryData.artifacts || []);
      setAnalysis(architectureData.analysis);
      setSelected((current) => current.length ? current : (libraryData.artifacts || []).slice(0, 12).map((item: StudioArtifactRow) => item.slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el corazón de Flowly.");
    } finally {
      setIsLoading(false);
    }
  }

  async function generateModule() {
    setError("");
    setMessage("");
    setIsLoading(true);
    try {
      const data = await postJson<{ generation: FlowlyModuleGeneration }>("/api/studio/generate/module", { moduleName, slugs: selected });
      setGeneration(data.generation);
      setMessage("Módulo generado y registrado en Flowly Studio.");
      await loadEverything();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el módulo.");
    } finally {
      setIsLoading(false);
    }
  }

  async function askArchitect() {
    setError("");
    setMessage("");
    try {
      const data = await postJson<{ suggestion: Suggestion }>("/api/studio/architect/suggest", { prompt: architectPrompt });
      setSuggestion(data.suggestion);
      setModuleName(data.suggestion.moduleName);
      setMessage("Architect ha preparado una propuesta inicial. Crea esos artefactos en Builder o genera con los existentes.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo consultar Architect.");
    }
  }

  function toggle(slug: string) {
    setSelected((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]);
  }

  function selectKind(kind: FlowlyStudioArtifactKind) {
    const slugs = library.filter((item) => item.kind === kind).map((item) => item.slug);
    setSelected((current) => Array.from(new Set([...current, ...slugs])));
  }

  const totals = analysis?.totals || {};
  const riskClasses = analysis?.riskLevel === "high" ? "border-red-300/25 bg-red-400/10 text-red-100" : analysis?.riskLevel === "medium" ? "border-amber-300/25 bg-amber-400/10 text-amber-100" : "border-emerald-300/25 bg-emerald-400/10 text-emerald-100";

  return (
    <main className="min-h-screen bg-[#080611] px-5 py-8 text-white lg:px-8">
      <section className="mx-auto max-w-7xl">
        <Link href="/studio" className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ArrowLeft size={16} /> Volver a Studio</Link>

        <header className="mt-6 overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.06] p-8 backdrop-blur-2xl md:p-10">
          <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">Flowly Generator</span>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">El corazón de Flowly Studio</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/62">Convierte diseños de Studio en módulos revisables: SQL, TypeScript, SDK, documentación, tests, impacto y grafo de dependencias.</p>
            </div>
            <div className={`rounded-[1.5rem] border p-5 ${riskClasses}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] opacity-65">Architecture Score</p>
                  <p className="mt-2 text-5xl font-semibold">{analysis?.architectureScore ?? "--"}</p>
                </div>
                <ShieldAlert size={44} className="opacity-70" />
              </div>
              <p className="mt-3 text-sm opacity-75">Riesgo: {analysis?.riskLevel || "pendiente"}. Este score mide duplicidades, dependencias no registradas y piezas faltantes.</p>
            </div>
          </div>
          {message ? <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}
          {error ? <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        </header>

        <section className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Business Objects" value={totals.business_object || 0} icon={<Boxes size={18} />} />
          <StatCard label="Capabilities" value={totals.capability || 0} icon={<Code2 size={18} />} />
          <StatCard label="Workflows" value={totals.workflow || 0} icon={<Workflow size={18} />} />
          <StatCard label="Policies" value={totals.policy || 0} icon={<ShieldAlert size={18} />} />
          <StatCard label="Apps" value={totals.app || 0} icon={<PackageCheck size={18} />} />
          <StatCard label="Edges" value={analysis?.edges.length || 0} icon={<Network size={18} />} />
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[0.95fr,1.05fr]">
          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Module Composer</h2>
                <p className="mt-1 text-sm text-white/50">Selecciona artefactos y genera un módulo completo revisable.</p>
              </div>
              <button onClick={loadEverything} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-white hover:bg-white/10"><RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /></button>
            </div>

            <div className="mt-5 grid gap-3">
              <label className="grid gap-2 text-sm text-white/65">
                <span>Nombre del módulo</span>
                <input value={moduleName} onChange={(event) => setModuleName(event.target.value)} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-cyan-200/45" />
              </label>
              <div className="flex flex-wrap gap-2">
                {(["business_object", "capability", "workflow", "policy", "app"] as FlowlyStudioArtifactKind[]).map((kind) => (
                  <button key={kind} onClick={() => selectKind(kind)} className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">Añadir {kind}</button>
                ))}
                <button onClick={() => setSelected(library.map((item) => item.slug))} className="rounded-xl border border-cyan-200/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100">Todo</button>
                <button onClick={() => setSelected([])} className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/70">Limpiar</button>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3.5 text-white/35" size={16} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar artefactos..." className="w-full rounded-2xl border border-white/10 bg-black/25 py-3 pl-9 pr-4 text-sm text-white outline-none" />
              </div>
            </div>

            <div className="mt-5 max-h-[28rem] space-y-3 overflow-auto pr-1">
              {filtered.map((artifact) => (
                <label key={artifact.id} className={`block cursor-pointer rounded-2xl border p-4 transition ${selected.includes(artifact.slug) ? "border-cyan-200/40 bg-cyan-300/10" : "border-white/10 bg-black/20 hover:bg-white/[0.05]"}`}>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={selected.includes(artifact.slug)} onChange={() => toggle(artifact.slug)} className="mt-1" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{artifact.name}</h3><span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white/40">{artifact.kind}</span></div>
                      <p className="mt-1 text-xs text-cyan-100/55">{artifact.domain} · {artifact.status} · {artifact.slug}</p>
                      <p className="mt-2 text-sm leading-6 text-white/50">{artifact.description}</p>
                    </div>
                  </div>
                </label>
              ))}
              {!filtered.length ? <p className="text-sm text-white/45">No hay artefactos guardados todavía.</p> : null}
            </div>

            <button onClick={generateModule} disabled={isLoading || !selected.length} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-100 px-5 py-4 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-45">
              <Rocket size={17} /> Generar módulo completo
            </button>
          </div>

          <div className="grid gap-5">
            <section className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl">
              <div className="mb-4 flex items-center gap-3"><BrainCircuit className="text-cyan-100" size={20} /><h2 className="text-xl font-semibold">Architect AI seed</h2></div>
              <textarea value={architectPrompt} onChange={(event) => setArchitectPrompt(event.target.value)} rows={4} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-200/45" />
              <button onClick={askArchitect} className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"><Sparkles size={16} /> Proponer arquitectura</button>
              {suggestion ? (
                <div className="mt-4 rounded-2xl border border-cyan-200/15 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50/80">
                  <strong>{suggestion.moduleName}</strong>
                  <p className="mt-2">Business Objects: {suggestion.businessObjects.join(", ")}</p>
                  <p>Capabilities: {suggestion.capabilities.join(", ")}</p>
                  <p>Workflows: {suggestion.workflows.join(", ")}</p>
                  <p>Policies: {suggestion.policies.join(", ")}</p>
                </div>
              ) : null}
            </section>

            <section className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl">
              <div className="mb-4 flex items-center gap-3"><GitBranch className="text-cyan-100" size={20} /><h2 className="text-xl font-semibold">Dependency Graph</h2></div>
              <div className="max-h-80 overflow-auto rounded-2xl border border-white/10 bg-black/25 p-4">
                {(analysis?.edges || []).slice(0, 80).map((edge) => (
                  <div key={edge.id} className="grid grid-cols-[1fr,auto,1fr] gap-2 border-b border-white/5 py-2 text-xs text-white/55 last:border-b-0">
                    <span className="truncate">{edge.source}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-cyan-100/70">{edge.type}</span>
                    <span className="truncate text-right">{edge.target}</span>
                  </div>
                ))}
                {!analysis?.edges.length ? <p className="text-sm text-white/45">Guarda artefactos para construir el grafo.</p> : null}
              </div>
            </section>

            <section className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl">
              <div className="mb-4 flex items-center gap-3"><ShieldAlert className="text-cyan-100" size={20} /><h2 className="text-xl font-semibold">Impact Analyzer</h2></div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><h3 className="font-semibold text-amber-100">Avisos</h3><ul className="mt-3 space-y-2 text-sm text-white/55">{(analysis?.warnings || []).map((item) => <li key={item}>• {item}</li>)}{!analysis?.warnings.length ? <li>• Sin avisos críticos.</li> : null}</ul></div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><h3 className="font-semibold text-cyan-100">Recomendaciones</h3><ul className="mt-3 space-y-2 text-sm text-white/55">{(analysis?.recommendations || []).map((item) => <li key={item}>• {item}</li>)}{!analysis?.recommendations.length ? <li>• Listo para revisar generación.</li> : null}</ul></div>
              </div>
            </section>
          </div>
        </section>

        {generation ? (
          <section className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2 rounded-[1.7rem] border border-emerald-300/20 bg-emerald-400/10 p-5 text-emerald-50">
              <div className="flex items-center gap-3"><CheckCircle2 size={22} /><div><h2 className="text-xl font-semibold">{generation.moduleName}</h2><p className="mt-1 text-sm opacity-75">{generation.summary}</p></div></div>
            </div>
            <ArtifactBlock title="Migration SQL" value={generation.migrationSql} filename={`${generation.slug}.migration.sql`} />
            <ArtifactBlock title="TypeScript Index" value={generation.typeScriptIndex} filename={`${generation.slug}.ts`} />
            <ArtifactBlock title="API Manifest" value={generation.apiManifest} filename={`${generation.slug}.api.json`} />
            <ArtifactBlock title="SDK Index" value={generation.sdkIndex} filename={`${generation.slug}.sdk.ts`} />
            <ArtifactBlock title="Docs Index" value={generation.docsIndex} filename={`${generation.slug}.md`} />
            <ArtifactBlock title="Test Plan" value={generation.testPlan} filename={`${generation.slug}.tests.md`} />
            <div className="lg:col-span-2"><ArtifactBlock title="Impact Report" value={generation.impactReport} filename={`${generation.slug}.impact.md`} /></div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
