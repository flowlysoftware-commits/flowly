"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Copy, ExternalLink, GitBranch, Github, KeyRound, Lock, Play, ShieldCheck, Terminal, XCircle } from "lucide-react";

type GitHubStatus = {
  ok: boolean;
  configured?: boolean;
  message?: string;
  error?: string;
  config?: {
    owner?: string;
    repo?: string;
    defaultBranch?: string;
    authMode?: "github_app" | "token" | "missing";
    hasCredentials?: boolean;
    missing?: string[];
  };
  repository?: {
    full_name: string;
    default_branch: string;
    html_url: string;
    private: boolean;
    pushed_at: string;
  } | null;
};

type PullRequestResult = {
  ok: boolean;
  branch?: string;
  pullRequestUrl?: string;
  pullRequestNumber?: number;
  files?: string[];
  error?: string;
};

const envVars = [
  { name: "GITHUB_REPOSITORY_OWNER", value: "tu_usuario_o_organizacion" },
  { name: "GITHUB_REPOSITORY_NAME", value: "flowly-main" },
  { name: "GITHUB_DEFAULT_BRANCH", value: "main" },
  { name: "GITHUB_TOKEN", value: "ghp_... o github_pat_..." },
];

const githubAppVars = [
  { name: "GITHUB_APP_ID", value: "123456" },
  { name: "GITHUB_APP_INSTALLATION_ID", value: "12345678" },
  { name: "GITHUB_APP_PRIVATE_KEY", value: "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----" },
];

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${ok ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100" : "border-amber-300/25 bg-amber-300/10 text-amber-100"}`}>
      {ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {label}
    </span>
  );
}

export default function FlowlyGitHubExecutorPage() {
  const [status, setStatus] = useState<GitHubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<PullRequestResult | null>(null);
  const [instruction, setInstruction] = useState("Prueba de conexión del Flowly Executor. Crear un archivo de test sin tocar producción.");

  async function loadStatus() {
    setLoading(true);
    try {
      const response = await fetch("/api/os/github/status");
      const data = (await response.json()) as GitHubStatus;
      setStatus(data);
    } catch (error) {
      setStatus({ ok: false, error: "No se pudo consultar el estado de GitHub Executor." });
    } finally {
      setLoading(false);
    }
  }

  async function createTestPr() {
    setRunning(true);
    setResult(null);
    try {
      const response = await fetch("/api/os/github/test-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction }),
      });
      const data = (await response.json()) as PullRequestResult;
      setResult(data);
    } catch {
      setResult({ ok: false, error: "No se pudo crear el Pull Request de prueba." });
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <main className="min-h-screen bg-[#050710] px-6 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/os" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/[0.08]"><ArrowLeft size={16} /> Volver a OS</Link>
          <button onClick={loadStatus} className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-50">Actualizar estado</button>
        </div>

        <header className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 shadow-2xl shadow-black/35">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100"><Github size={15} /> Flowly GitHub Executor</div>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">Conexión segura con GitHub</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/62">
            Esta pantalla prepara el Executor para que Brain pueda crear ramas, modificar archivos, ejecutar revisiones y abrir Pull Requests. Nunca debe modificar producción directamente.
          </p>
        </header>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-4"><p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">Estado</p><p className="mt-2 text-2xl font-black">{loading ? "Comprobando" : status?.configured ? "Conectado" : "Pendiente"}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-4"><p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">Modo</p><p className="mt-2 text-2xl font-black">{status?.config?.authMode || "-"}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-4"><p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">Repo</p><p className="mt-2 truncate text-2xl font-black">{status?.repository?.full_name || `${status?.config?.owner || "?"}/${status?.config?.repo || "?"}`}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-4"><p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">Rama base</p><p className="mt-2 text-2xl font-black">{status?.repository?.default_branch || status?.config?.defaultBranch || "main"}</p></div>
        </div>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-100"><ShieldCheck size={20} /></div>
              <div>
                <h2 className="text-xl font-black">Prueba segura del Executor</h2>
                <p className="text-sm text-white/55">Crea una rama nueva y un Pull Request con un archivo de prueba. No toca la rama principal.</p>
              </div>
            </div>

            <textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} className="mt-5 min-h-28 w-full rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white outline-none focus:border-cyan-200/50" />

            <div className="mt-4 flex flex-wrap gap-3">
              <button disabled={!status?.configured || running} onClick={createTestPr} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-200 px-5 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"><Play size={16} /> {running ? "Creando PR..." : "Crear Pull Request de prueba"}</button>
              {status?.repository?.html_url && <a href={status.repository.html_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-3 text-sm font-bold text-white/75"><ExternalLink size={16} /> Abrir repositorio</a>}
            </div>

            {result && (
              <div className={`mt-5 rounded-3xl border p-4 ${result.ok ? "border-emerald-300/25 bg-emerald-300/10" : "border-rose-300/25 bg-rose-300/10"}`}>
                <div className="flex items-center gap-2 font-black">{result.ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />} {result.ok ? "Pull Request creado" : "No se pudo crear el Pull Request"}</div>
                {result.error && <p className="mt-2 text-sm text-white/70">{result.error}</p>}
                {result.branch && <p className="mt-2 text-sm text-white/70">Rama: <strong>{result.branch}</strong></p>}
                {result.pullRequestUrl && <a href={result.pullRequestUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-cyan-50"><ExternalLink size={15} /> Ver Pull Request #{result.pullRequestNumber}</a>}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5">
              <h3 className="flex items-center gap-2 text-lg font-black"><Lock size={18} /> Estado de conexión</h3>
              <div className="mt-4 space-y-2 text-sm text-white/62">
                <StatusPill ok={Boolean(status?.configured)} label={status?.configured ? "configurado" : "faltan variables"} />
                {status?.message && <p>{status.message}</p>}
                {status?.error && <p className="text-rose-100">{status.error}</p>}
                {status?.config?.missing?.length ? <ul className="list-disc space-y-1 pl-5">{status.config.missing.map((item) => <li key={item}>{item}</li>)}</ul> : null}
              </div>
            </div>

            <div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
              <h3 className="flex items-center gap-2 text-lg font-black text-cyan-50"><KeyRound size={18} /> Variables en Vercel</h3>
              <p className="mt-2 text-sm leading-6 text-white/62">Usa GitHub App si puedes. Para empezar rápido puedes usar token fino de GitHub.</p>
              <div className="mt-4 space-y-2">
                {envVars.map((item) => (
                  <div key={item.name} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                    <div className="flex items-center justify-between gap-2"><code className="text-xs font-black text-cyan-100">{item.name}</code><Copy size={13} className="text-white/35" /></div>
                    <p className="mt-1 text-[11px] text-white/40">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-5">
          <h2 className="flex items-center gap-2 text-xl font-black"><GitBranch size={20} /> Flujo que seguirá Brain</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {["Analizar petición", "Crear rama", "Modificar archivos", "Abrir Pull Request", "Esperar aprobación"].map((step, index) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Paso {index + 1}</p>
                <p className="mt-2 text-sm font-bold text-white/80">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[2rem] border border-amber-300/20 bg-amber-300/10 p-5 text-sm leading-6 text-amber-50/85">
          <strong>GitHub App recomendada:</strong> cuando vayas a producción, crea una GitHub App con permisos mínimos: Contents Read/Write, Pull Requests Read/Write, Metadata Read y Actions Read. Si quieres empezar rápido, usa <code>GITHUB_TOKEN</code> con un token fino limitado solo a este repositorio.
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {githubAppVars.map((item) => <div key={item.name} className="rounded-2xl border border-white/10 bg-black/20 p-3"><code className="text-xs font-black text-amber-100">{item.name}</code><p className="mt-1 text-[11px] text-white/45">{item.value}</p></div>)}
          </div>
        </section>
      </section>
    </main>
  );
}
