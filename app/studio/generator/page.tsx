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
  FileArchive,
  GitBranch,
  Network,
  PackageCheck,
  RefreshCw,
  Rocket,
  Search,
  ShieldAlert,
  Sparkles,
  Store,
  Layers3,
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

type ModuleReview = {
  approved: boolean;
  blockers: string[];
  warnings: string[];
  actions: string[];
  score: number;
};

type ReviewerAIReport = {
  aprobado: boolean;
  puntuacion: number;
  criterios: Array<{ nombre: string; estado: string; detalle: string }>;
  bloqueos: string[];
  avisos: string[];
  acciones: string[];
};

type MarketplacePackage = {
  nombre: string;
  slug: string;
  estado: string;
  version: string;
  descripcion: string;
  permisos: string[];
  checklist: string[];
};

const kindLabels: Record<string, string> = {
  business_object: "Objeto de negocio",
  capability: "Capacidad",
  workflow: "Flujo de trabajo",
  policy: "Política",
  app: "Aplicación",
  architect_blueprint: "Plano de Architect",
};

const riskLabels: Record<string, string> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
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

async function downloadZipFromPost(url: string, body: unknown, filename: string) {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "No se pudo descargar el ZIP.");
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
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
  const [review, setReview] = useState<ModuleReview | null>(null);
  const [reviewerReport, setReviewerReport] = useState<ReviewerAIReport | null>(null);
  const [marketplacePackage, setMarketplacePackage] = useState<MarketplacePackage | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [moduleName, setModuleName] = useState("Módulo generado por Flowly");
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
      const [libraryResponse, architectureResponse] = await Promise.all([fetch("/api/studio/artifacts"), fetch("/api/studio/architecture")]);
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
      setReview(null);
      setReviewerReport(null);
      setMarketplacePackage(null);
      setMessage("Módulo generado y guardado como generación revisable.");
      await loadEverything();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el módulo.");
    } finally {
      setIsLoading(false);
    }
  }

  async function reviewModule() {
    setError("");
    setMessage("");
    setIsLoading(true);
    try {
      const data = await postJson<{ review: ModuleReview; generation: FlowlyModuleGeneration }>("/api/studio/review/module", { moduleName, slugs: selected });
      setReview(data.review);
      setGeneration(data.generation);
      setMessage(data.review.approved ? "Revisión superada. El módulo puede exportarse." : "Revisión completada con bloqueos. Corrige antes de instalar.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo revisar el módulo.");
    } finally {
      setIsLoading(false);
    }
  }

  async function exportInstallableZip() {
    setError("");
    setMessage("");
    try {
      await downloadZipFromPost("/api/studio/export/module", { moduleName, slugs: selected, force: true }, `${moduleName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-flowly-module.zip`);
      setMessage("ZIP instalable generado. Descomprímelo encima del proyecto y ejecuta su migración SQL.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo exportar el ZIP.");
    }
  }

  async function installLocally() {
    setError("");
    setMessage("");
    try {
      const data = await postJson<{ ok: boolean; written: string[]; review: ModuleReview }>("/api/studio/install/module", { moduleName, slugs: selected });
      setReview(data.review);
      setMessage(`Instalación local completada. Archivos escritos: ${data.written.length}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo instalar directamente. Usa la exportación ZIP.");
    }
  }


  async function reviewerAI() {
    setError("");
    setMessage("");
    setIsLoading(true);
    try {
      const data = await postJson<{ report: ReviewerAIReport }>("/api/studio/reviewer", { moduleName, slugs: selected });
      setReviewerReport(data.report);
      setMessage(data.report.aprobado ? "Reviewer AI aprueba el módulo para revisión final." : "Reviewer AI ha encontrado puntos que revisar.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo ejecutar Reviewer AI.");
    } finally {
      setIsLoading(false);
    }
  }

  async function buildMarketplace() {
    setError("");
    setMessage("");
    setIsLoading(true);
    try {
      const data = await postJson<{ package: MarketplacePackage }>("/api/studio/marketplace/package", { moduleName, slugs: selected, estado: "privado" });
      setMarketplacePackage(data.package);
      setMessage("Paquete Marketplace preparado como privado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el paquete Marketplace.");
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
      setMessage("Architect ha preparado una propuesta inicial.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo consultar Architect.");
    }
  }

  async function createFromArchitect() {
    setError("");
    setMessage("");
    setIsLoading(true);
    try {
      const data = await postJson<{ suggestion: Suggestion; created: StudioArtifactRow[] }>("/api/studio/architect/create", { prompt: architectPrompt });
      setSuggestion(data.suggestion);
      setModuleName(data.suggestion.moduleName);
      setSelected(data.created.map((item) => item.slug));
      setMessage(`Architect ha creado ${data.created.length} diseños en Builder. Ya puedes revisarlos y generar el módulo.`);
      await loadEverything();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron crear los diseños desde Architect.");
    } finally {
      setIsLoading(false);
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
        <div className="flex flex-wrap items-center gap-3"><Link href="/studio" className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ArrowLeft size={16} /> Volver a Studio</Link><Link href="/studio/core" className="inline-flex items-center gap-2 text-sm text-cyan-100/80 transition hover:text-cyan-100"><Layers3 size={16} /> Core avanzado</Link></div>

        <header className="mt-6 overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.06] p-8 backdrop-blur-2xl md:p-10">
          <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">Generador de Flowly</span>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">El corazón de Flowly Studio</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/62">Convierte diseños en módulos instalables: migraciones Supabase, rutas, API, SDK, documentación, pruebas, revisión automática y ZIP listo para aplicar.</p>
            </div>
            <div className={`rounded-[1.5rem] border p-5 ${riskClasses}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] opacity-65">Puntuación arquitectónica</p>
                  <p className="mt-2 text-5xl font-semibold">{analysis?.architectureScore ?? "--"}</p>
                </div>
                <ShieldAlert size={44} className="opacity-70" />
              </div>
              <p className="mt-3 text-sm opacity-75">Riesgo: {riskLabels[analysis?.riskLevel || ""] || "pendiente"}. Mide duplicidades, dependencias no registradas y piezas faltantes.</p>
            </div>
          </div>
          {message ? <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}
          {error ? <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        </header>

        <section className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Objetos" value={totals.business_object || 0} icon={<Boxes size={18} />} />
          <StatCard label="Capacidades" value={totals.capability || 0} icon={<Code2 size={18} />} />
          <StatCard label="Flujos" value={totals.workflow || 0} icon={<Workflow size={18} />} />
          <StatCard label="Políticas" value={totals.policy || 0} icon={<ShieldAlert size={18} />} />
          <StatCard label="Apps" value={totals.app || 0} icon={<PackageCheck size={18} />} />
          <StatCard label="Relaciones" value={analysis?.edges.length || 0} icon={<Network size={18} />} />
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[0.95fr,1.05fr]">
          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Compositor de módulos</h2>
                <p className="mt-1 text-sm text-white/50">Selecciona piezas de Studio y genera un módulo completo instalable.</p>
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
                  <button key={kind} onClick={() => selectKind(kind)} className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">Añadir {kindLabels[kind]}</button>
                ))}
                <button onClick={() => setSelected(library.map((item) => item.slug))} className="rounded-xl border border-cyan-200/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100">Seleccionar todo</button>
                <button onClick={() => setSelected([])} className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/70">Limpiar</button>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3.5 text-white/35" size={16} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar piezas..." className="w-full rounded-2xl border border-white/10 bg-black/25 py-3 pl-9 pr-4 text-sm text-white outline-none" />
              </div>
            </div>

            <div className="mt-5 max-h-[28rem] space-y-3 overflow-auto pr-1">
              {filtered.map((artifact) => (
                <label key={artifact.id} className={`block cursor-pointer rounded-2xl border p-4 transition ${selected.includes(artifact.slug) ? "border-cyan-200/40 bg-cyan-300/10" : "border-white/10 bg-black/20 hover:bg-white/[0.05]"}`}>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={selected.includes(artifact.slug)} onChange={() => toggle(artifact.slug)} className="mt-1" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{artifact.name}</h3><span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white/40">{kindLabels[artifact.kind] || artifact.kind}</span></div>
                      <p className="mt-1 text-xs text-cyan-100/55">{artifact.domain} · {artifact.status} · {artifact.slug}</p>
                      <p className="mt-2 text-sm leading-6 text-white/50">{artifact.description}</p>
                    </div>
                  </div>
                </label>
              ))}
              {!filtered.length ? <p className="text-sm text-white/45">No hay piezas guardadas todavía.</p> : null}
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button onClick={reviewModule} disabled={isLoading || !selected.length} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"><ShieldAlert size={17} /> Revisar antes</button>
              <button onClick={generateModule} disabled={isLoading || !selected.length} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-100 px-5 py-4 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"><Rocket size={17} /> Generar</button>
              <button onClick={exportInstallableZip} disabled={!selected.length} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-5 py-4 text-sm font-semibold text-emerald-100 disabled:cursor-not-allowed disabled:opacity-45"><FileArchive size={17} /> Exportar ZIP</button>
              <button onClick={installLocally} disabled={!selected.length} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-5 py-4 text-sm font-semibold text-amber-100 disabled:cursor-not-allowed disabled:opacity-45"><Database size={17} /> Instalar local</button>
              <button onClick={reviewerAI} disabled={isLoading || !selected.length} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-300/20 bg-violet-400/10 px-5 py-4 text-sm font-semibold text-violet-100 disabled:cursor-not-allowed disabled:opacity-45"><BrainCircuit size={17} /> Reviewer AI</button>
              <button onClick={buildMarketplace} disabled={isLoading || !selected.length} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-5 py-4 text-sm font-semibold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-45"><Store size={17} /> Marketplace</button>
            </div>
            <p className="mt-3 text-xs leading-5 text-white/40">Instalar local solo funciona en desarrollo si activas <code>FLOWLY_STUDIO_ALLOW_FILE_WRITE=true</code>. En producción usa el ZIP instalable.</p>
          </div>

          <div className="grid gap-5">
            <section className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl">
              <div className="mb-4 flex items-center gap-3"><BrainCircuit className="text-cyan-100" size={20} /><h2 className="text-xl font-semibold">Architect AI</h2></div>
              <textarea value={architectPrompt} onChange={(event) => setArchitectPrompt(event.target.value)} rows={4} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-200/45" />
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={askArchitect} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"><Sparkles size={16} /> Proponer</button>
                <button onClick={createFromArchitect} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-200/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15"><CheckCircle2 size={16} /> Crear diseños</button>
              </div>
              {suggestion ? (
                <div className="mt-4 rounded-2xl border border-cyan-200/15 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50/80">
                  <strong>{suggestion.moduleName}</strong>
                  <p className="mt-2">Objetos: {suggestion.businessObjects.join(", ")}</p>
                  <p>Capacidades: {suggestion.capabilities.join(", ")}</p>
                  <p>Flujos: {suggestion.workflows.join(", ")}</p>
                  <p>Políticas: {suggestion.policies.join(", ")}</p>
                </div>
              ) : null}
            </section>

            {review ? (
              <section className={`rounded-[1.7rem] border p-5 backdrop-blur-2xl ${review.approved ? "border-emerald-300/20 bg-emerald-400/10" : "border-red-300/20 bg-red-400/10"}`}>
                <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Revisión automática</h2><span className="rounded-full bg-white/10 px-3 py-1 text-sm">{review.score}/100</span></div>
                <p className="text-sm text-white/70">{review.approved ? "Aprobado para exportar." : "Bloqueado hasta corregir los puntos críticos."}</p>
                {review.blockers.length ? <div className="mt-4"><h3 className="font-semibold text-red-100">Bloqueos</h3><ul className="mt-2 space-y-1 text-sm text-white/70">{review.blockers.map((item) => <li key={item}>• {item}</li>)}</ul></div> : null}
                {review.warnings.length ? <div className="mt-4"><h3 className="font-semibold text-amber-100">Avisos</h3><ul className="mt-2 space-y-1 text-sm text-white/70">{review.warnings.map((item) => <li key={item}>• {item}</li>)}</ul></div> : null}
                <div className="mt-4"><h3 className="font-semibold text-cyan-100">Siguientes acciones</h3><ul className="mt-2 space-y-1 text-sm text-white/70">{review.actions.map((item) => <li key={item}>• {item}</li>)}</ul></div>
              </section>
            ) : null}


            {reviewerReport ? (
              <section className={`rounded-[1.7rem] border p-5 backdrop-blur-2xl ${reviewerReport.aprobado ? "border-emerald-300/20 bg-emerald-400/10" : "border-amber-300/20 bg-amber-400/10"}`}>
                <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Reviewer AI</h2><span className="rounded-full bg-white/10 px-3 py-1 text-sm">{reviewerReport.puntuacion}/100</span></div>
                <div className="space-y-2 text-sm text-white/70">{reviewerReport.criterios.map((item) => <p key={item.nombre}>• <strong>{item.nombre}</strong>: {item.estado} · {item.detalle}</p>)}</div>
                {reviewerReport.avisos.length ? <div className="mt-4 text-sm text-amber-50/80"><strong>Avisos:</strong> {reviewerReport.avisos.join(" · ")}</div> : null}
              </section>
            ) : null}

            {marketplacePackage ? (
              <section className="rounded-[1.7rem] border border-cyan-300/20 bg-cyan-400/10 p-5 text-cyan-50 backdrop-blur-2xl">
                <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Paquete Marketplace</h2><span className="rounded-full bg-white/10 px-3 py-1 text-sm">{marketplacePackage.estado}</span></div>
                <p className="text-sm opacity-75">{marketplacePackage.nombre} · versión {marketplacePackage.version}</p>
                <p className="mt-3 text-sm opacity-75">Permisos: {marketplacePackage.permisos.slice(0, 6).join(", ") || "pendiente"}</p>
                <ul className="mt-3 space-y-1 text-sm opacity-75">{marketplacePackage.checklist.map((item) => <li key={item}>• {item}</li>)}</ul>
              </section>
            ) : null}
            <section className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl">
              <div className="mb-4 flex items-center gap-3"><GitBranch className="text-cyan-100" size={20} /><h2 className="text-xl font-semibold">Grafo de dependencias</h2></div>
              <div className="max-h-80 overflow-auto rounded-2xl border border-white/10 bg-black/25 p-4">
                {(analysis?.edges || []).slice(0, 80).map((edge) => (
                  <div key={edge.id} className="grid grid-cols-[1fr,auto,1fr] gap-2 border-b border-white/5 py-2 text-xs text-white/55 last:border-b-0">
                    <span className="truncate">{edge.source}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-cyan-100/70">{edge.type}</span>
                    <span className="truncate text-right">{edge.target}</span>
                  </div>
                ))}
                {!analysis?.edges.length ? <p className="text-sm text-white/45">Guarda piezas para construir el grafo.</p> : null}
              </div>
            </section>

            <section className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl">
              <div className="mb-4 flex items-center gap-3"><ShieldAlert className="text-cyan-100" size={20} /><h2 className="text-xl font-semibold">Analizador de impacto</h2></div>
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
            <ArtifactBlock title="Migración Supabase" value={generation.migrationSql} filename={`${generation.slug}.migration.sql`} />
            <ArtifactBlock title="Índice TypeScript" value={generation.typeScriptIndex} filename={`${generation.slug}.ts`} />
            <ArtifactBlock title="Manifiesto API" value={generation.apiManifest} filename={`${generation.slug}.api.json`} />
            <ArtifactBlock title="SDK" value={generation.sdkIndex} filename={`${generation.slug}.sdk.ts`} />
            <ArtifactBlock title="Documentación" value={generation.docsIndex} filename={`${generation.slug}.md`} />
            <ArtifactBlock title="Plan de pruebas" value={generation.testPlan} filename={`${generation.slug}.tests.md`} />
            <div className="lg:col-span-2"><ArtifactBlock title="Informe de impacto" value={generation.impactReport} filename={`${generation.slug}.impact.md`} /></div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
