"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Bot, CheckCircle2, ExternalLink, FileCode2, GitPullRequest, Loader2, Play, Search, ShieldCheck, Sparkles, Wand2, XCircle } from "lucide-react";

type TargetFile = { path: string; reason: string; size?: number };
type ProposedFile = { path: string; content: string; message?: string };
type ExecutorResult = {
  ok?: boolean;
  status?: "planned" | "pull_request_created";
  instruction?: string;
  summary?: string;
  risk?: "bajo" | "medio" | "alto";
  targetModules?: string[];
  candidateFiles?: TargetFile[];
  proposedSteps?: string[];
  proposedFiles?: ProposedFile[];
  requiresApproval?: boolean;
  pullRequestUrl?: string;
  pullRequestNumber?: number;
  branch?: string;
  error?: string;
};

const examples = [
  "Haz el Companion más vivo y prepara una base de avatar evolutivo sin romper el runtime actual.",
  "Analiza el CRM y prepara una propuesta para hacerlo más moderno tipo kanban visual.",
  "Prepara mejoras para el panel comercial sin crear un módulo nuevo.",
  "Crea una base segura para que el Brain documente cambios en Knowledge.",
];

export default function FlowlyExecutorV2Page() {
  const [instruction, setInstruction] = useState(examples[0]);
  const [planning, setPlanning] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecutorResult | null>(null);

  async function plan(event?: FormEvent) {
    event?.preventDefault();
    const clean = instruction.trim();
    if (!clean || planning) return;
    setPlanning(true);
    setResult(null);
    try {
      const response = await fetch("/api/executor/v2/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: clean }),
      });
      const data = (await response.json()) as ExecutorResult;
      setResult(data);
    } catch {
      setResult({ ok: false, error: "No se pudo preparar el plan de Executor V2." });
    } finally {
      setPlanning(false);
    }
  }

  async function run() {
    const clean = instruction.trim();
    if (!clean || running) return;
    setRunning(true);
    try {
      const response = await fetch("/api/executor/v2/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: clean, approved: true }),
      });
      const data = (await response.json()) as ExecutorResult;
      setResult(data);
    } catch {
      setResult({ ok: false, error: "No se pudo crear el Pull Request con Executor V2." });
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050710] px-6 py-8 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/os" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/[0.08]"><ArrowLeft size={16} /> Volver a OS</Link>
          <Link href="/os/github" className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-50"><GitPullRequest size={16} /> GitHub conectado</Link>
        </div>

        <header className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 shadow-2xl shadow-black/35">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100"><Bot size={15} /> Flowly Executor V2</div>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">Desarrollador autónomo por Pull Request</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/62">Executor V2 convierte una petición normal en análisis de repositorio, archivos candidatos, plan de cambios y Pull Request seguro. Nunca toca la rama principal directamente.</p>
        </header>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5">
            <form onSubmit={plan}>
              <label className="text-sm font-black uppercase tracking-[0.18em] text-white/45">¿Qué quieres que modifique Flowly?</label>
              <textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} rows={5} className="mt-3 w-full rounded-3xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white outline-none focus:border-cyan-200/50" />
              <div className="mt-4 flex flex-wrap gap-3">
                <button disabled={planning || running} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-200 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-50">{planning ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />} Analizar y proponer</button>
                <button type="button" disabled={!result?.ok || running} onClick={run} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-300/15 px-5 py-3 text-sm font-black text-emerald-50 disabled:opacity-40">{running ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />} Aprobar y crear Pull Request</button>
              </div>
            </form>

            {result ? (
              <div className="mt-5 space-y-4">
                <div className={`rounded-3xl border p-4 ${result.error ? "border-rose-300/25 bg-rose-300/10" : "border-cyan-300/25 bg-cyan-300/10"}`}>
                  <div className="flex items-center gap-2 font-black">{result.error ? <XCircle size={18} /> : <CheckCircle2 size={18} />} {result.error ? "Executor necesita revisión" : result.status === "pull_request_created" ? "Pull Request creado" : "Plan preparado"}</div>
                  {result.summary && <p className="mt-2 text-sm leading-6 text-white/68">{result.summary}</p>}
                  {result.error && <p className="mt-2 text-sm leading-6 text-rose-100">{result.error}</p>}
                  {result.pullRequestUrl && <a href={result.pullRequestUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-cyan-50"><ExternalLink size={15} /> Ver Pull Request #{result.pullRequestNumber}</a>}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Riesgo</p><p className="mt-2 text-2xl font-black capitalize">{result.risk || "-"}</p></div>
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Módulos</p><p className="mt-2 text-2xl font-black">{result.targetModules?.length || 0}</p></div>
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Archivos PR</p><p className="mt-2 text-2xl font-black">{result.proposedFiles?.length || 0}</p></div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <h3 className="flex items-center gap-2 font-black"><FileCode2 size={17} /> Archivos candidatos</h3>
                    <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
                      {(result.candidateFiles || []).map((file) => <div key={file.path} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3"><p className="text-xs font-bold text-white/82">{file.path}</p><p className="mt-1 text-[11px] leading-4 text-white/45">{file.reason}</p></div>)}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <h3 className="flex items-center gap-2 font-black"><Wand2 size={17} /> Archivos que se crearán/modificarán</h3>
                    <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
                      {(result.proposedFiles || []).map((file) => <div key={file.path} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3"><p className="text-xs font-bold text-cyan-100">{file.path}</p><p className="mt-1 text-[11px] leading-4 text-white/45">{file.message || "Cambio preparado por Executor V2"}</p></div>)}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-5">
              <h3 className="flex items-center gap-2 text-lg font-black text-emerald-50"><ShieldCheck size={18} /> Regla de seguridad</h3>
              <p className="mt-2 text-sm leading-6 text-white/66">Executor V2 siempre crea una rama y un Pull Request. Tú revisas antes de fusionar. No se toca producción directamente.</p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5">
              <h3 className="flex items-center gap-2 text-lg font-black"><Sparkles size={18} /> Ejemplos</h3>
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
