"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, FileCode2, GitPullRequest, Loader2, Play, Radar, Search, ShieldCheck, Sparkles, Wand2, XCircle } from "lucide-react";

type Candidate = { path: string; reason: string; score: number; role: string; size?: number };
type ProposedFile = { path: string; content: string; message?: string };
type ExecutorV3Result = {
  ok?: boolean;
  version?: "v3";
  status?: "planned" | "pull_request_created";
  instruction?: string;
  summary?: string;
  risk?: "bajo" | "medio" | "alto";
  projectMap?: {
    totalFiles: number;
    analyzedFiles: number;
    relatedFiles: number;
    editableFiles: number;
    modules: string[];
    dependencies: Array<{ source: string; target: string; type: string }>;
    candidates: Candidate[];
  };
  reasoning?: string[];
  proposedSteps?: string[];
  proposedFiles?: ProposedFile[];
  pullRequestUrl?: string;
  pullRequestNumber?: number;
  branch?: string;
  error?: string;
};

const examples = [
  "Haz el Companion más vivo y modifica el avatar existente sin crear componentes duplicados.",
  "Analiza el CRM actual y propón mejoras visuales sin crear un CRM nuevo.",
  "Mejora el panel comercial para que sea más claro y moderno.",
  "Revisa la separación entre panel cliente y Flowly OS y prepara correcciones seguras.",
];

export default function FlowlyExecutorV3Page() {
  const [instruction, setInstruction] = useState(examples[0]);
  const [planning, setPlanning] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecutorV3Result | null>(null);

  async function plan(event?: FormEvent) {
    event?.preventDefault();
    const clean = instruction.trim();
    if (!clean || planning) return;
    setPlanning(true);
    setResult(null);
    try {
      const response = await fetch("/api/executor/v3/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: clean }),
      });
      setResult((await response.json()) as ExecutorV3Result);
    } catch {
      setResult({ ok: false, error: "No se pudo preparar el plan de Executor V3." });
    } finally {
      setPlanning(false);
    }
  }

  async function run() {
    const clean = instruction.trim();
    if (!clean || running) return;
    setRunning(true);
    try {
      const response = await fetch("/api/executor/v3/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: clean, approved: true }),
      });
      setResult((await response.json()) as ExecutorV3Result);
    } catch {
      setResult({ ok: false, error: "No se pudo crear el Pull Request con Executor V3." });
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#03050d] px-6 py-8 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,.23),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,.03),transparent_45%)]" />
      <section className="relative mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/developer" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/[0.08]"><ArrowLeft size={16} /> Volver a Developer</Link>
          <Link href="/os/github" className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-50"><GitPullRequest size={16} /> GitHub Executor</Link>
        </div>

        <header className="mt-6 rounded-[2rem] border border-cyan-300/15 bg-white/[0.055] p-7 shadow-2xl shadow-cyan-950/25 backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-300/25 bg-purple-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-purple-100"><Radar size={15} /> Executor V3</div>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">Agente de ingeniería inteligente</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/62">Executor V3 analiza el repositorio completo, construye un mapa de dependencias, prioriza editar archivos existentes y abre Pull Requests seguros.</p>
        </header>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_390px]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur">
            <form onSubmit={plan}>
              <label className="text-sm font-black uppercase tracking-[0.18em] text-cyan-100/70">¿Qué quieres que modifique Flowly?</label>
              <textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} rows={5} className="mt-3 w-full rounded-3xl border border-white/10 bg-black/35 p-4 text-sm leading-6 text-white outline-none focus:border-cyan-200/50" />
              <div className="mt-4 flex flex-wrap gap-3">
                <button disabled={planning || running} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-200 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-50">{planning ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />} Analizar mapa completo</button>
                <button type="button" disabled={!result?.ok || running} onClick={run} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-300/15 px-5 py-3 text-sm font-black text-emerald-50 disabled:opacity-40">{running ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />} Aprobar y crear Pull Request</button>
              </div>
            </form>

            {result ? (
              <div className="mt-5 space-y-4">
                <div className={`rounded-3xl border p-4 ${result.error ? "border-rose-300/25 bg-rose-300/10" : "border-cyan-300/25 bg-cyan-300/10"}`}>
                  <div className="flex items-center gap-2 font-black">{result.error ? <XCircle size={18} /> : <CheckCircle2 size={18} />} {result.error ? "Executor necesita revisión" : result.status === "pull_request_created" ? "Pull Request creado" : "Plan inteligente preparado"}</div>
                  {result.summary && <p className="mt-2 text-sm leading-6 text-white/68">{result.summary}</p>}
                  {result.error && <p className="mt-2 text-sm leading-6 text-rose-100">{result.error}</p>}
                  {result.pullRequestUrl && <a href={result.pullRequestUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-cyan-50"><ExternalLink size={15} /> Ver Pull Request #{result.pullRequestNumber}</a>}
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Metric label="Riesgo" value={result.risk || "-"} />
                  <Metric label="Analizados" value={String(result.projectMap?.analyzedFiles || 0)} />
                  <Metric label="Relacionados" value={String(result.projectMap?.relatedFiles || 0)} />
                  <Metric label="Editables" value={String(result.projectMap?.editableFiles || 0)} />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Panel title="Archivos principales" icon={<FileCode2 size={17} />}>
                    {(result.projectMap?.candidates || []).slice(0, 18).map((file) => <div key={file.path} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3"><p className="text-xs font-bold text-white/86">{file.path}</p><p className="mt-1 text-[11px] leading-4 text-white/45">{file.reason} · {file.role} · score {file.score}</p></div>)}
                  </Panel>
                  <Panel title="Cambios propuestos" icon={<Wand2 size={17} />}>
                    {(result.proposedFiles || []).map((file) => <div key={file.path} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3"><p className="text-xs font-bold text-cyan-100">{file.path}</p><p className="mt-1 text-[11px] leading-4 text-white/45">{file.message || "Cambio preparado por Executor V3"}</p></div>)}
                  </Panel>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <h3 className="font-black text-white">Razonamiento</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-white/62">
                    {(result.reasoning || []).map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-5">
              <h3 className="flex items-center gap-2 text-lg font-black text-emerald-50"><ShieldCheck size={18} /> Modo seguro</h3>
              <p className="mt-2 text-sm leading-6 text-white/66">Executor V3 nunca toca producción. Crea ramas y Pull Requests con cambios pequeños y revisables.</p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5">
              <h3 className="flex items-center gap-2 text-lg font-black"><Sparkles size={18} /> Pruebas recomendadas</h3>
              <div className="mt-3 space-y-2">
                {examples.map((example) => <button key={example} onClick={() => setInstruction(example)} className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-left text-xs leading-5 text-white/60 hover:border-cyan-200/35 hover:text-white">{example}</button>)}
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-3xl border border-white/10 bg-black/25 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{label}</p><p className="mt-2 text-2xl font-black capitalize">{value}</p></div>;
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <div className="rounded-3xl border border-white/10 bg-black/20 p-4"><h3 className="flex items-center gap-2 font-black">{icon} {title}</h3><div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">{children}</div></div>;
}
