"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Database,
  FileCode2,
  GitPullRequest,
  Github,
  HeartPulse,
  Loader2,
  MemoryStick,
  Network,
  Rocket,
  Search,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Wand2,
  XCircle,
} from "lucide-react";

type CandidateFile = {
  path: string;
  reason?: string;
  score?: number;
  role?: string;
};

type ProposedFile = {
  path: string;
  message?: string;
};

type DeveloperPlan = {
  ok?: boolean;
  error?: string;
  instruction?: string;
  summary?: string;
  risk?: string;
  reasoning?: string[];
  proposedSteps?: string[];
  proposedFiles?: ProposedFile[];
  projectMap?: {
    analyzedFiles?: number;
    relatedFiles?: number;
    editableFiles?: number;
    modules?: string[];
    candidates?: CandidateFile[];
    dependencies?: Array<{ source: string; target: string; type: string }>;
    projectGraph?: {
      totalFiles?: number;
      modules?: Array<{ name: string; files?: number }>;
      apiRoutes?: number;
      components?: number;
      edges?: number;
      routes?: number;
    };
  };
};

type DeveloperRun = DeveloperPlan & {
  status?: string;
  pullRequestUrl?: string;
  pullRequestNumber?: number;
  branch?: string;
};

const quickPrompts = [
  "Analiza el Companion y propón cómo hacerlo más vivo, evolutivo y expresivo sin crear archivos duplicados.",
  "El CRM no me gusta. Analízalo y dime cómo podríamos hacerlo más limpio, visual y fácil de usar.",
  "Revisa el panel del cliente y dime qué partes están mezcladas con herramientas internas de desarrollo.",
  "Quiero mejorar el rendimiento general del panel sin romper ninguna ruta actual.",
  "El último Pull Request no compila. Revisa el error de build y prepara una corrección sobre la misma rama.",
];

const commandCenterLinks = [
  { label: "Cerebro", desc: "Brain: piensa, consulta contexto y decide planes.", href: "/os/brain", icon: BrainCircuit },
  { label: "Corazón", desc: "Kernel: registro central, eventos y gobierno.", href: "/kernel", icon: HeartPulse },
  { label: "Memoria", desc: "Knowledge: documentación viva y contexto técnico.", href: "/docs", icon: MemoryStick },
  { label: "Project Graph", desc: "Mapa técnico del proyecto, rutas y dependencias.", href: "/os/project-graph", icon: Network },
  { label: "Executor V3", desc: "Motor que crea ramas y Pull Requests seguros.", href: "/os/executor-v3", icon: Rocket },
  { label: "QA Agent", desc: "Revisa PRs fallidos y corrige builds en la misma rama.", href: "/os/qa", icon: ShieldCheck },
  { label: "GitHub", desc: "Conexión segura con repositorio y PRs.", href: "/os/github", icon: Github },
  { label: "Studio", desc: "Editor visual de blueprints y módulos.", href: "/studio/v2", icon: Boxes },
  { label: "Crear módulos", desc: "Asistente simple para diseñar proyectos nuevos.", href: "/crear", icon: Wand2 },
];

const systemHealth = [
  ["Brain", "Activo", "100%"],
  ["Kernel", "Estable", "100%"],
  ["Knowledge", "Sincronizada", "98%"],
  ["Executor", "Listo", "100%"],
];

function normalizeRisk(risk?: string) {
  if (!risk) return "Pendiente";
  if (risk === "bajo") return "Bajo";
  if (risk === "medio") return "Medio";
  if (risk === "alto") return "Alto";
  return risk;
}

function explainPlan(plan: DeveloperPlan | null) {
  if (!plan?.ok) return null;
  const modules = plan.projectMap?.modules || [];
  const candidates = plan.projectMap?.candidates || [];
  const proposedFiles = plan.proposedFiles || [];
  return {
    title: "Perfecto, he investigado el proyecto.",
    intro: `He analizado ${plan.projectMap?.analyzedFiles || plan.projectMap?.projectGraph?.totalFiles || 0} archivos y he encontrado ${plan.projectMap?.relatedFiles || candidates.length} piezas relacionadas con lo que pides.`,
    modules: modules.length ? modules : ["Flowly OS"],
    candidates: candidates.slice(0, 8),
    proposedFiles: proposedFiles.slice(0, 8),
    next: proposedFiles.length
      ? "Si me das el OK, crearé una rama nueva, aplicaré los cambios y abriré un Pull Request para que puedas revisarlo antes de tocar producción."
      : "Todavía no voy a tocar archivos. Primero necesito una propuesta segura sobre archivos reales existentes; no crearé documentos falsos ni planes dentro del repositorio.",
  };
}

export default function DeveloperControlCenterPage() {
  const [instruction, setInstruction] = useState("");
  const [plan, setPlan] = useState<DeveloperPlan | null>(null);
  const [run, setRun] = useState<DeveloperRun | null>(null);
  const [mode, setMode] = useState<"idle" | "planning" | "planned" | "running" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ role: "user" | "brain"; text: string }>>([
    {
      role: "brain",
      text:
        "Hola Ricky. Soy el centro de desarrollo de Flowly. Escríbeme normal: “quiero mejorar el CRM”, “haz el Companion más vivo” o “revisa este módulo”. Primero investigaré, luego te enseñaré el plan y solo si me das el OK crearé un Pull Request.",
    },
  ]);

  const explanation = useMemo(() => explainPlan(plan), [plan]);

  async function analyze(event?: FormEvent) {
    event?.preventDefault();
    const clean = instruction.trim();
    if (!clean) return;

    setMode("planning");
    setError(null);
    setRun(null);
    setPlan(null);
    setHistory((items) => [
      ...items,
      { role: "user", text: clean },
      { role: "brain", text: "Perfecto. Voy a investigar el proyecto antes de tocar nada. Buscaré módulos, archivos relacionados, dependencias y posibles riesgos." },
    ]);

    try {
      const response = await fetch("/api/executor/v3/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: clean }),
      });
      const data = (await response.json()) as DeveloperPlan;
      if (!response.ok || !data.ok) throw new Error(data.error || "No he podido preparar el plan.");

      setPlan(data);
      setMode("planned");
      setHistory((items) => [
        ...items,
        {
          role: "brain",
          text:
            `He terminado de investigar. Riesgo ${normalizeRisk(data.risk)}. ` +
            `He encontrado ${data.projectMap?.relatedFiles || 0} archivos relacionados y prepararé ${data.proposedFiles?.length || 0} cambio(s) iniciales. Revisa el plan y pulsa “OK, hazlo” si estás de acuerdo.`,
        },
      ]);
    } catch (err) {
      setMode("error");
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setHistory((items) => [...items, { role: "brain", text: `No he podido preparar el plan: ${message}` }]);
    }
  }

  async function approveAndRun() {
    const clean = instruction.trim();
    if (!clean) return;
    setMode("running");
    setError(null);
    setHistory((items) => [
      ...items,
      { role: "brain", text: "OK recibido. Ahora voy a crear una rama segura, aplicar los cambios y abrir un Pull Request. No tocaré la rama principal." },
    ]);

    try {
      const response = await fetch("/api/executor/v3/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: clean, approved: true }),
      });
      const data = (await response.json()) as DeveloperRun;
      if (!response.ok || data.error) throw new Error(data.error || "No he podido ejecutar los cambios.");

      setRun(data);
      setMode("done");
      setHistory((items) => [
        ...items,
        {
          role: "brain",
          text: data.pullRequestUrl
            ? `Hecho. He creado la rama ${data.branch || "nueva"} y el Pull Request #${data.pullRequestNumber || ""}. Revísalo antes de hacer merge.`
            : "He preparado el plan, pero no se ha recibido URL del Pull Request.",
        },
      ]);
    } catch (err) {
      setMode("error");
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setHistory((items) => [...items, { role: "brain", text: `No he podido terminar la ejecución: ${message}` }]);
    }
  }

  const isBusy = mode === "planning" || mode === "running";

  return (
    <main className="min-h-screen overflow-hidden bg-[#02040b] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,.24),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(34,211,238,.2),transparent_26%),radial-gradient(circle_at_50%_90%,rgba(236,72,153,.12),transparent_28%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative mx-auto flex min-h-screen max-w-[1720px] gap-5 px-5 py-5">
        <aside className="hidden w-72 shrink-0 rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl xl:block">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-300 text-xl font-black shadow-lg shadow-violet-500/25">F</div>
            <div>
              <p className="text-xl font-black">Flowly IA</p>
              <p className="text-xs text-cyan-100/50">Developer OS</p>
            </div>
          </div>

          <nav className="mt-6 space-y-6 text-sm">
            <MenuGroup title="Centro">
              <MenuItem href="/developer" icon={<Activity size={17} />} label="Panel Developer" active />
              <MenuItem href="/os/brain" icon={<BrainCircuit size={17} />} label="Cerebro" />
              <MenuItem href="/kernel" icon={<HeartPulse size={17} />} label="Corazón" />
              <MenuItem href="/docs" icon={<MemoryStick size={17} />} label="Memoria" />
            </MenuGroup>
            <MenuGroup title="Trabajo IA">
              <MenuItem href="/os/project-graph" icon={<Network size={17} />} label="Project Graph" highlight />
              <MenuItem href="/os/executor-v3" icon={<Rocket size={17} />} label="Executor V3" />
              <MenuItem href="/os/github" icon={<Github size={17} />} label="GitHub" />
              <MenuItem href="/studio/v2" icon={<Boxes size={17} />} label="Studio" />
            </MenuGroup>
            <MenuGroup title="Creación">
              <MenuItem href="/crear" icon={<Wand2 size={17} />} label="Crear módulos" />
              <MenuItem href="/studio/generator" icon={<FileCode2 size={17} />} label="Generador" />
              <MenuItem href="/os/migration" icon={<Network size={17} />} label="Migración OS" />
            </MenuGroup>
          </nav>

          <div className="mt-8 rounded-3xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Modo actual</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500 font-black">R</div>
              <div>
                <p className="font-black">Ricky</p>
                <p className="text-xs text-emerald-300">Arquitecto conectado</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-5">
          <header className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-100/55">Flowly IA Developer</p>
                <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">Habla con Flowly para desarrollarlo</h1>
                <p className="mt-2 max-w-4xl text-sm leading-6 text-white/58">
                  Escribe lo que quieres mejorar con palabras normales. Brain investiga, Project Graph encuentra archivos, Executor prepara cambios y GitHub abre un Pull Request seguro. Nada toca producción sin tu aprobación.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <Badge label="Modo" value="Arquitecto" />
                <Badge label="Executor" value="V3" />
                <Badge label="GitHub" value="PR seguro" />
                <Badge label="Rama" value="main" />
              </div>
            </div>
          </header>

          <section className="grid gap-5 2xl:grid-cols-[1fr_430px]">
            <div className="space-y-5">
              <div className="rounded-[2rem] border border-cyan-300/15 bg-gradient-to-br from-cyan-300/10 via-white/[0.045] to-purple-500/10 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/55">Chat de desarrollo</p>
                    <h2 className="mt-2 text-2xl font-black">Dime qué quieres cambiar</h2>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-black text-emerald-100">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" /> Listo para investigar
                  </div>
                </div>

                <div className="mt-5 min-h-[360px] rounded-[1.5rem] border border-white/10 bg-black/30 p-4">
                  <div className="space-y-3">
                    {history.map((message, index) => (
                      <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[86%] rounded-2xl border px-4 py-3 text-sm leading-6 ${message.role === "user" ? "border-cyan-300/30 bg-cyan-300/15 text-cyan-50" : "border-white/10 bg-white/[0.06] text-white/80"}`}>
                          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/35">{message.role === "user" ? "Tú" : "Flowly Brain"}</p>
                          {message.text}
                        </div>
                      </div>
                    ))}
                    {isBusy && (
                      <div className="flex justify-start">
                        <div className="max-w-[86%] rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-50">
                          <div className="flex items-center gap-2 font-bold"><Loader2 className="animate-spin" size={16} /> {mode === "planning" ? "Investigando proyecto..." : "Ejecutando cambios y creando PR..."}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={analyze} className="mt-4">
                  <textarea
                    value={instruction}
                    onChange={(event) => setInstruction(event.target.value)}
                    placeholder="Ejemplo: Oye, ayúdame a mejorar el Companion. Quiero que sea más vivo, con avatar evolutivo, emociones y sin duplicar archivos."
                    className="min-h-[120px] w-full rounded-3xl border border-white/10 bg-black/35 p-5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-200/50"
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button disabled={isBusy || !instruction.trim()} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-200 px-5 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
                      {mode === "planning" ? <Loader2 className="animate-spin" size={17} /> : <Search size={17} />}
                      Investigar y preparar plan
                    </button>
                    <button type="button" onClick={approveAndRun} disabled={isBusy || !plan?.ok} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/30 bg-emerald-300/15 px-5 py-3 text-sm font-black text-emerald-50 disabled:cursor-not-allowed disabled:opacity-40">
                      {mode === "running" ? <Loader2 className="animate-spin" size={17} /> : <Rocket size={17} />}
                      OK, hazlo y crea Pull Request
                    </button>
                    <button type="button" onClick={() => { setInstruction(""); setPlan(null); setRun(null); setMode("idle"); setError(null); }} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/70">
                      Limpiar
                    </button>
                  </div>
                </form>

                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {quickPrompts.map((prompt) => (
                    <button key={prompt} type="button" onClick={() => setInstruction(prompt)} className="rounded-2xl border border-white/10 bg-black/25 p-3 text-left text-xs leading-5 text-white/60 transition hover:border-cyan-200/40 hover:bg-cyan-200/10 hover:text-white">
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {plan?.ok && explanation && (
                <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/55">Plan entendible</p>
                      <h2 className="mt-2 text-3xl font-black">{explanation.title}</h2>
                      <p className="mt-2 max-w-4xl text-sm leading-6 text-white/60">{explanation.intro}</p>
                    </div>
                    <RiskBadge risk={plan.risk} />
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-4">
                    <Metric label="Archivos analizados" value={String(plan.projectMap?.analyzedFiles || 0)} />
                    <Metric label="Relacionados" value={String(plan.projectMap?.relatedFiles || 0)} />
                    <Metric label="Editables" value={String(plan.projectMap?.editableFiles || 0)} />
                    <Metric label="Cambios PR" value={String(plan.proposedFiles?.length || 0)} />
                  </div>

                  <div className="mt-5 grid gap-5 xl:grid-cols-2">
                    <PlanBox title="Lo que he detectado" icon={<BrainCircuit size={18} />}>
                      <ul className="space-y-2 text-sm text-white/65">
                        {explanation.modules.map((module) => <li key={module}>• Módulo relacionado: <b className="text-white">{module}</b></li>)}
                        {(plan.reasoning || []).slice(0, 4).map((item) => <li key={item}>• {item}</li>)}
                      </ul>
                    </PlanBox>

                    <PlanBox title="Lo que haré si apruebas" icon={<Rocket size={18} />}>
                      <ul className="space-y-2 text-sm text-white/65">
                        {(plan.proposedSteps || []).slice(0, 6).map((item) => <li key={item}>• {item}</li>)}
                      </ul>
                    </PlanBox>

                    <PlanBox title="Archivos que revisaré" icon={<FileCode2 size={18} />}>
                      <div className="space-y-2">
                        {explanation.candidates.map((file) => (
                          <div key={file.path} className="rounded-xl border border-white/10 bg-black/25 p-3">
                            <p className="break-all text-xs font-black text-white">{file.path}</p>
                            <p className="mt-1 text-[11px] text-white/45">{file.reason || "Relacionado con la petición."}</p>
                          </div>
                        ))}
                      </div>
                    </PlanBox>

                    <PlanBox title="Cambios reales que prepararía" icon={<GitPullRequest size={18} />}>
                      <div className="space-y-2">
                        {explanation.proposedFiles.map((file) => (
                          <div key={file.path} className="rounded-xl border border-white/10 bg-black/25 p-3">
                            <p className="break-all text-xs font-black text-cyan-100">{file.path}</p>
                            <p className="mt-1 text-[11px] text-white/45">{file.message || "Cambio propuesto por Executor."}</p>
                          </div>
                        ))}
                        {!explanation.proposedFiles.length && <p className="text-sm leading-6 text-white/50">Aún no hay cambios seguros para crear Pull Request. El plan se guardará en la memoria del Brain, no como archivo dentro de <code className="rounded bg-black/30 px-1 text-cyan-100">docs/executor</code>.</p>}
                      </div>
                    </PlanBox>
                  </div>

                  <div className="mt-5 rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                    <p className="text-sm font-black text-emerald-100">Siguiente paso</p>
                    <p className="mt-1 text-sm leading-6 text-white/65">{explanation.next}</p>
                  </div>
                </section>
              )}

              {run && (
                <section className="rounded-[2rem] border border-emerald-300/25 bg-emerald-300/10 p-5 backdrop-blur-xl">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100/65">Resultado</p>
                      <h2 className="mt-2 text-3xl font-black">Hecho</h2>
                      <p className="mt-2 text-sm text-white/60">He preparado los cambios en una rama segura. Revisa el Pull Request antes de fusionarlo.</p>
                    </div>
                    <CheckCircle2 className="text-emerald-300" size={42} />
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <Metric label="Rama" value={run.branch || "Creada"} small />
                    <Metric label="Pull Request" value={run.pullRequestNumber ? `#${run.pullRequestNumber}` : "Creado"} small />
                    <Metric label="Estado" value={run.status || "Listo"} small />
                  </div>
                  {run.pullRequestUrl && (
                    <a href={run.pullRequestUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-300 px-5 py-3 text-sm font-black text-slate-950">
                      Ver Pull Request <ArrowRight size={16} />
                    </a>
                  )}
                </section>
              )}

              {error && (
                <section className="rounded-[2rem] border border-rose-300/25 bg-rose-300/10 p-5 text-rose-50 backdrop-blur-xl">
                  <div className="flex items-center gap-3"><XCircle /> <b>Algo ha fallado</b></div>
                  <p className="mt-2 text-sm">{error}</p>
                </section>
              )}
            </div>

            <aside className="space-y-5">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">Sistema</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
                  {systemHealth.map(([name, status, pct]) => <SystemCard key={name} name={name} status={status} pct={pct} />)}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">Centro de mando</p>
                <div className="mt-4 grid gap-3">
                  {commandCenterLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href} className="group rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-cyan-200/40 hover:bg-cyan-200/10">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100"><Icon size={18} /></div>
                          <div>
                            <p className="font-black">{item.label}</p>
                            <p className="mt-1 text-xs leading-5 text-white/45">{item.desc}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[2rem] border border-purple-300/20 bg-purple-300/10 p-5 backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-100/65">Cómo funciona</p>
                <div className="mt-4 space-y-3 text-sm text-white/65">
                  <Step n="1" text="Tú escribes lo que quieres mejorar." />
                  <Step n="2" text="Brain investiga el proyecto y prepara un plan." />
                  <Step n="3" text="Tú apruebas antes de tocar nada." />
                  <Step n="4" text="Executor crea rama, cambios y Pull Request." />
                  <Step n="5" text="Revisas el PR y decides si hacer merge." />
                </div>
              </div>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}

function MenuGroup({ title, children }: { title: string; children: ReactNode }) {
  return <div><p className="mb-2 px-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/30">{title}</p><div className="space-y-1">{children}</div></div>;
}

function MenuItem({ href, icon, label, active, highlight }: { href: string; icon: ReactNode; label: string; active?: boolean; highlight?: boolean }) {
  return <Link href={href} className={`flex items-center gap-3 rounded-2xl px-3 py-2 font-bold transition ${active ? "bg-cyan-300/15 text-cyan-50" : highlight ? "bg-purple-400/15 text-purple-50" : "text-white/62 hover:bg-white/10 hover:text-white"}`}>{icon}<span>{label}</span></Link>;
}

function Badge({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{label}</p><p className="mt-1 font-black text-white">{value}</p></div>;
}

function SystemCard({ name, status, pct }: { name: string; status: string; pct: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">{name}</p><p className="mt-2 text-lg font-black">{status}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: pct }} /></div><p className="mt-2 text-right text-xs font-black text-emerald-300">{pct}</p></div>;
}

function Metric({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return <div className="rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{label}</p><p className={`mt-2 font-black ${small ? "break-all text-sm" : "text-3xl"}`}>{value}</p></div>;
}

function PlanBox({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4"><div className="mb-4 flex items-center gap-2 text-cyan-100">{icon}<h3 className="font-black text-white">{title}</h3></div>{children}</div>;
}

function RiskBadge({ risk }: { risk?: string }) {
  const value = normalizeRisk(risk);
  const color = risk === "alto" ? "border-rose-300/25 bg-rose-300/10 text-rose-100" : risk === "medio" ? "border-amber-300/25 bg-amber-300/10 text-amber-100" : "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  return <div className={`rounded-2xl border px-4 py-3 ${color}`}><p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-70">Riesgo</p><p className="text-xl font-black">{value}</p></div>;
}

function Step({ n, text }: { n: string; text: string }) {
  return <div className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-200 text-xs font-black text-slate-950">{n}</div><p>{text}</p></div>;
}
