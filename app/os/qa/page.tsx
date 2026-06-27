"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck, Sparkles, Wrench, XCircle } from "lucide-react";

type QAInspection = {
  ok?: boolean;
  error?: string;
  prNumber?: number;
  branch?: string;
  title?: string;
  status?: "pending" | "green" | "failed" | "unknown";
  risk?: string;
  summary?: string;
  checks?: Array<{ name: string; status?: string; conclusion?: string; url?: string }>;
  files?: Array<{ filename: string; status?: string; additions?: number; deletions?: number }>;
  recommendations?: string[];
  needsFix?: boolean;
  fixed?: boolean;
  committedFiles?: string[];
  message?: string;
};

function statusLabel(status?: string) {
  if (status === "green") return "En verde";
  if (status === "failed") return "Fallando";
  if (status === "pending") return "Pendiente";
  return "Sin datos";
}

export default function FlowlyQAAgentPage() {
  const [pr, setPr] = useState("");
  const [buildLog, setBuildLog] = useState("");
  const [result, setResult] = useState<QAInspection | null>(null);
  const [loading, setLoading] = useState<"idle" | "inspect" | "fix">("idle");
  const [error, setError] = useState<string | null>(null);

  async function inspect(event?: FormEvent) {
    event?.preventDefault();
    setLoading("inspect");
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/qa/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pr }),
      });
      const data = (await response.json()) as QAInspection;
      if (!response.ok || !data.ok) throw new Error(data.error || "No he podido revisar el Pull Request.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading("idle");
    }
  }

  async function fix() {
    setLoading("fix");
    setError(null);
    try {
      const response = await fetch("/api/qa/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pr, buildLog }),
      });
      const data = (await response.json()) as QAInspection;
      if (!response.ok || !data.ok) throw new Error(data.error || "No he podido corregir el Pull Request.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading("idle");
    }
  }

  return (
    <main className="min-h-screen bg-[#030712] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/developer" className="inline-flex items-center gap-2 text-sm text-cyan-200/80 hover:text-cyan-100">
          <ArrowLeft size={16} /> Volver a Developer
        </Link>

        <section className="mt-8 rounded-[2rem] border border-cyan-400/20 bg-white/[0.04] p-8 shadow-2xl shadow-cyan-500/10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100">
                <ShieldCheck size={16} /> Flowly QA Agent
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">Autocorrección de builds</h1>
              <p className="mt-4 max-w-3xl text-white/60">
                Pega la URL o número de un Pull Request. QA Agent revisa checks, archivos cambiados y, si le das el log del error, prepara un commit correctivo sobre la misma rama.
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm text-emerald-100">
              <p className="font-bold">Regla de seguridad</p>
              <p className="mt-1 text-emerald-100/70">Nunca toca main. Corrige en la rama del Pull Request.</p>
            </div>
          </div>

          <form onSubmit={inspect} className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto]">
            <input
              value={pr}
              onChange={(event) => setPr(event.target.value)}
              placeholder="Ejemplo: https://github.com/flowlysoftware-commits/flowly/pull/12 o 12"
              className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm outline-none ring-cyan-400/30 placeholder:text-white/30 focus:ring-4"
            />
            <button
              type="submit"
              disabled={loading !== "idle" || !pr.trim()}
              className="rounded-2xl bg-cyan-300 px-6 py-4 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50"
            >
              {loading === "inspect" ? <Loader2 className="animate-spin" /> : "Revisar PR"}
            </button>
          </form>

          <div className="mt-5">
            <label className="text-sm font-semibold text-white/70">Log del error de Vercel/GitHub Actions (opcional, pero recomendado)</label>
            <textarea
              value={buildLog}
              onChange={(event) => setBuildLog(event.target.value)}
              placeholder="Pega aquí el error completo del build si está fallando..."
              rows={8}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm outline-none ring-cyan-400/30 placeholder:text-white/30 focus:ring-4"
            />
          </div>
        </section>

        {error && (
          <section className="mt-6 rounded-3xl border border-red-400/30 bg-red-500/10 p-5 text-red-100">
            <div className="flex items-center gap-2 font-bold"><XCircle size={18} /> Error</div>
            <p className="mt-2 text-sm text-red-100/80">{error}</p>
          </section>
        )}

        {result && (
          <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">PR #{result.prNumber} · {statusLabel(result.status)}</h2>
                  <p className="mt-1 text-sm text-white/55">{result.summary || result.message}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-bold text-white/70">Riesgo {result.risk || "-"}</span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">Rama</p>
                  <p className="mt-2 break-all text-sm font-bold text-cyan-100">{result.branch || "-"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">Checks</p>
                  <p className="mt-2 text-2xl font-black">{result.checks?.length || 0}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">Archivos</p>
                  <p className="mt-2 text-2xl font-black">{result.files?.length || result.committedFiles?.length || 0}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <h3 className="font-black">Checks detectados</h3>
                {(result.checks || []).length ? result.checks?.map((check) => (
                  <div key={`${check.name}-${check.url || ""}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-4 text-sm">
                    <span>{check.name}</span>
                    <span className={check.conclusion === "success" ? "text-emerald-300" : check.conclusion === "failure" ? "text-red-300" : "text-amber-200"}>{check.conclusion || check.status || "pendiente"}</span>
                  </div>
                )) : <p className="text-sm text-white/45">No hay checks disponibles todavía.</p>}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {result.status === "green" ? (
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400/15 px-5 py-3 text-sm font-bold text-emerald-100">
                    <CheckCircle2 size={18} /> Está en verde. Puedes revisar y hacer merge.
                  </div>
                ) : (
                  <button
                    onClick={fix}
                    disabled={loading !== "idle"}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-200 disabled:opacity-50"
                  >
                    {loading === "fix" ? <Loader2 size={18} className="animate-spin" /> : <Wrench size={18} />}
                    Corregir en la misma rama
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center gap-2 text-lg font-black"><Sparkles size={20} /> Recomendaciones</div>
              <div className="mt-4 space-y-3">
                {(result.recommendations || []).map((item) => (
                  <div key={item} className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-4 text-sm text-cyan-50/80">{item}</div>
                ))}
              </div>

              <h3 className="mt-6 font-black">Archivos</h3>
              <div className="mt-3 max-h-80 space-y-2 overflow-auto pr-1">
                {(result.files || []).map((file) => (
                  <div key={file.filename} className="rounded-xl border border-white/10 bg-black/25 p-3 text-xs text-white/65">
                    <p className="break-all font-mono text-cyan-100">{file.filename}</p>
                    <p className="mt-1">+{file.additions || 0} / -{file.deletions || 0}</p>
                  </div>
                ))}
                {(result.committedFiles || []).map((file) => (
                  <div key={file} className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs text-emerald-100">
                    Commit: {file}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
