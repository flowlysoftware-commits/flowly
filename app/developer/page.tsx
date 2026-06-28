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
  ChevronDown,
  ChevronRight,
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
    impact?: {
      avoidCreating?: string[];
      targetModule?: string;
    };
  };
};

type DeveloperRun = DeveloperPlan & {
  status?: string;
  pullRequestUrl?: string;
  pullRequestNumber?: number;
  branch?: string;
};

type WorkStepStatus = "done" | "active" | "waiting" | "error";

type WorkStep = {
  label: string;
  status: WorkStepStatus;
};

const quickPrompts = [
  "Oye, ayúdame a mejorar el Companion. Quiero que sea más vivo, evolutivo y expresivo, pero sin crear archivos duplicados.",
  "El CRM no me gusta. Investígalo y dime cómo podríamos hacerlo más limpio, visual y fácil de usar.",
  "Revisa el panel del cliente y dime qué partes siguen mezcladas con herramientas internas de desarrollo.",
  "Quiero mejorar el rendimiento general del panel sin romper ninguna ruta actual.",
  "El último Pull Request no compila. Revisa el error de build y prepara una corrección sobre la misma rama.",
];

const commandCenterLinks = [
  { label: "Cerebro", desc: "Brain: entiende, razona y coordina cambios.", href: "/os/brain", icon: BrainCircuit },
  { label: "Corazón", desc: "Kernel: registro central, eventos y gobierno.", href: "/kernel", icon: HeartPulse },
  { label: "Memoria", desc: "Knowledge: documentación viva y contexto técnico.", href: "/docs", icon: MemoryStick },
  { label: "Mapa del proyecto", desc: "Project Graph: rutas, APIs, componentes y dependencias.", href: "/os/project-graph", icon: Network },
  { label: "Executor V3", desc: "Agente que crea ramas y Pull Requests seguros.", href: "/os/executor-v3", icon: Rocket },
  { label: "Avatar Runtime", desc: "Sistema de avatares 3D del Companion global.", href: "/os/avatars", icon: Bot },
  { label: "QA Agent", desc: "Revisa PRs fallidos y corrige builds.", href: "/os/qa", icon: ShieldCheck },
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

function moduleLabel(module?: string) {
  if (!module) return "Flowly OS";
  if (module.toLowerCase().includes("companion")) return "Companion";
  if (module.toLowerCase().includes("crm")) return "CRM";
  if (module.toLowerCase().includes("fact")) return "Facturación";
  return module;
}

function capabilityNameFromFile(file: CandidateFile) {
  const path = file.path.toLowerCase();
  if (path.includes("avatar")) return "Avatar";
  if (path.includes("chat") || path.includes("assistant")) return "Conversación";
  if (path.includes("memory") || path.includes("docs") || path.includes("knowledge")) return "Memoria";
  if (path.includes("api")) return "API";
  if (path.includes("crm") || path.includes("cliente")) return "CRM";
  if (path.includes("page.tsx")) return "Pantalla";
  if (path.includes("runtime")) return "Runtime";
  if (path.includes("style") || path.includes("css")) return "Estilos";
  return "Pieza existente";
}

function uniqueCapabilityItems(candidates: CandidateFile[]) {
  const seen = new Set<string>();
  const items: Array<{ label: string; file: CandidateFile }> = [];
  for (const file of candidates) {
    const label = capabilityNameFromFile(file);
    if (seen.has(label)) continue;
    seen.add(label);
    items.push({ label, file });
  }
  return items;
}

function explainPlan(plan: DeveloperPlan | null) {
  if (!plan?.ok) return null;
  const modules = plan.projectMap?.modules || [];
  const candidates = plan.projectMap?.candidates || [];
  const proposedFiles = plan.proposedFiles || [];
  const target = moduleLabel(modules[0] || plan.projectMap?.impact?.targetModule);
  const meaningfulAreas = Array.from(new Set(candidates.slice(0, 12).map(capabilityNameFromFile))).slice(0, 6);

  const hasChanges = proposedFiles.length > 0;
  return {
    title: "Perfecto, ya he investigado Flowly.",
    naturalIntro: `He entendido que quieres trabajar sobre ${target}. He revisado el mapa del proyecto, he localizado las piezas relacionadas y he preparado una propuesta segura antes de tocar nada.`,
    target,
    areas: meaningfulAreas.length ? meaningfulAreas : ["Arquitectura", "Interfaz", "Runtime"],
    candidates: candidates.slice(0, 10),
    proposedFiles: proposedFiles.slice(0, 8),
    uniqueCapabilities: uniqueCapabilityItems(candidates).slice(0, 8),
    hasChanges,
    next: hasChanges
      ? "Si me das el OK, crearé una rama nueva, aplicaré los cambios y abriré un Pull Request para que puedas revisarlo antes de tocar producción."
      : "Aún no he encontrado un cambio de código suficientemente seguro. No crearé archivos falsos ni duplicados; puedo seguir investigando o puedes concretar un poco más qué parte quieres mejorar.",
  };
}

function buildTimeline(mode: string, plan: DeveloperPlan | null, run: DeveloperRun | null, error: string | null): WorkStep[] {
  return [
    { label: "Entender lo que quieres", status: mode === "idle" ? "waiting" : "done" },
    { label: "Investigar Flowly", status: mode === "planning" ? "active" : plan?.ok || run ? "done" : "waiting" },
    { label: "Preparar propuesta clara", status: mode === "planned" || mode === "running" || mode === "done" ? "done" : mode === "planning" ? "waiting" : "waiting" },
    { label: "Esperar tu aprobación", status: mode === "planned" ? "active" : mode === "running" || mode === "done" ? "done" : "waiting" },
    { label: "Aplicar cambios en rama segura", status: mode === "running" ? "active" : mode === "done" ? "done" : "waiting" },
    { label: "Crear Pull Request", status: mode === "done" && run?.pullRequestUrl ? "done" : mode === "running" ? "waiting" : "waiting" },
    { label: error ? "Revisar error" : "Esperar revisión humana", status: error ? "error" : mode === "done" ? "active" : "waiting" },
  ];
}

export default function DeveloperControlCenterPage() {
  const [instruction, setInstruction] = useState("");
  const [plan, setPlan] = useState<DeveloperPlan | null>(null);
  const [run, setRun] = useState<DeveloperRun | null>(null);
  const [mode, setMode] = useState<"idle" | "planning" | "planned" | "running" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [showTech, setShowTech] = useState(false);
  const [history, setHistory] = useState<Array<{ role: "user" | "brain"; text: string }>>([
    {
      role: "brain",
      text:
        "Hola Ricky. Dime qué quieres mejorar con palabras normales. Primero investigaré el proyecto, después te explicaré qué he encontrado y solo si me das permiso crearé un Pull Request seguro.",
    },
  ]);

  const explanation = useMemo(() => explainPlan(plan), [plan]);
  const timeline = useMemo(() => buildTimeline(mode, plan, run, error), [mode, plan, run, error]);
  const isBusy = mode === "planning" || mode === "running";

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
      { role: "brain", text: "Perfecto. Voy a investigar Flowly antes de tocar nada. Buscaré qué parte existe ya, qué conviene reutilizar y qué riesgos hay." },
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
      const explained = explainPlan(data);
      setHistory((items) => [
        ...items,
        {
          role: "brain",
          text:
            explained?.hasChanges
              ? `He terminado. ${explained.naturalIntro} Veo una forma segura de hacerlo. Revisa la propuesta y, si te parece bien, pulsa “Aplicar cambios”.`
              : `He terminado. ${explained?.naturalIntro || "He revisado el proyecto."} De momento no haré cambios automáticos porque no quiero crear archivos duplicados ni tocar código sin seguridad.`,
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
      { role: "brain", text: "OK recibido. Voy a trabajar en una rama segura. Si algo falla, no tocaré producción." },
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
            : "He preparado el trabajo, pero no he recibido URL del Pull Request.",
        },
      ]);
    } catch (err) {
      setMode("error");
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setHistory((items) => [...items, { role: "brain", text: `No he podido terminar la ejecución: ${message}` }]);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#02040b] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,.24),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(34,211,238,.2),transparent_26%),radial-gradient(circle_at_50%_90%,rgba(236,72,153,.12),transparent_28%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative mx-auto flex min-h-screen max-w-[1760px] gap-5 px-5 py-5">
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
              <MenuItem href="/os/qa" icon={<ShieldCheck size={17} />} label="QA Agent" />
              <MenuItem href="/os/github" icon={<Github size={17} />} label="GitHub" />
            </MenuGroup>
            <MenuGroup title="Creación">
              <MenuItem href="/crear" icon={<Wand2 size={17} />} label="Crear módulos" />
              <MenuItem href="/studio/v2" icon={<Boxes size={17} />} label="Studio" />
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
                <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">Desarrolla Flowly hablando</h1>
                <p className="mt-2 max-w-4xl text-sm leading-6 text-white/58">
                  Escribe lo que quieres mejorar. Brain investiga, te explica la propuesta en lenguaje normal y solo si apruebas crea una rama y un Pull Request seguro.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <Badge label="Modo" value="Arquitecto" />
                <Badge label="Executor" value="V3" />
                <Badge label="GitHub" value="PR seguro" />
                <Badge label="QA" value="Preparado" />
              </div>
            </div>
          </header>

          <section className="grid gap-5 2xl:grid-cols-[1fr_430px]">
            <div className="space-y-5">
              <div className="rounded-[2rem] border border-cyan-300/15 bg-gradient-to-br from-cyan-300/10 via-white/[0.045] to-purple-500/10 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/55">Arquitecto conversacional</p>
                    <h2 className="mt-2 text-2xl font-black">¿Qué quieres mejorar?</h2>
                    <p className="mt-1 text-sm text-white/55">No necesitas hablar en técnico. Dímelo como se lo dirías a una persona.</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-black text-emerald-100">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" /> Listo para investigar
                  </div>
                </div>

                <div className="mt-5 min-h-[360px] rounded-[1.5rem] border border-white/10 bg-black/30 p-4">
                  <div className="space-y-3">
                    {history.map((message, index) => (
                      <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[88%] rounded-2xl border px-4 py-3 text-sm leading-6 ${message.role === "user" ? "border-cyan-300/30 bg-cyan-300/15 text-cyan-50" : "border-white/10 bg-white/[0.06] text-white/80"}`}>
                          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/35">{message.role === "user" ? "Tú" : "Flowly Brain"}</p>
                          {message.text}
                        </div>
                      </div>
                    ))}
                    {isBusy && (
                      <div className="flex justify-start">
                        <div className="max-w-[86%] rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-50">
                          <div className="flex items-center gap-2 font-bold"><Loader2 className="animate-spin" size={16} /> {mode === "planning" ? "Estoy investigando Flowly..." : "Estoy aplicando cambios en una rama segura..."}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={analyze} className="mt-4">
                  <div className="relative">
                    <textarea
                      value={instruction}
                      onChange={(event) => setInstruction(event.target.value)}
                      placeholder="Ejemplo: Oye, ayúdame a mejorar el Companion. Quiero que sea más vivo, con avatar evolutivo, emociones y sin duplicar archivos."
                      className="min-h-[120px] w-full rounded-3xl border border-white/10 bg-black/35 p-5 pr-28 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-200/50"
                    />
                    <button
                      disabled={isBusy || !instruction.trim()}
                      className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-2xl bg-cyan-200 px-4 py-2.5 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {mode === "planning" ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                      Enviar
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="submit" disabled={isBusy || !instruction.trim()} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-200/30 bg-cyan-200/10 px-5 py-3 text-sm font-black text-cyan-50 disabled:cursor-not-allowed disabled:opacity-50">
                      {mode === "planning" ? <Loader2 className="animate-spin" size={17} /> : <Search size={17} />}
                      Investigar y preparar plan
                    </button>
                    <button type="button" onClick={approveAndRun} disabled={isBusy || !plan?.ok || !explanation?.hasChanges} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/30 bg-emerald-300/15 px-5 py-3 text-sm font-black text-emerald-50 disabled:cursor-not-allowed disabled:opacity-40">
                      {mode === "running" ? <Loader2 className="animate-spin" size={17} /> : <Rocket size={17} />}
                      Aplicar cambios
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
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/55">Propuesta de Brain</p>
                      <h2 className="mt-2 text-3xl font-black">{explanation.title}</h2>
                      <p className="mt-3 max-w-4xl text-sm leading-7 text-white/68">{explanation.naturalIntro}</p>
                    </div>
                    <RiskBadge risk={plan.risk} />
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
                    <PlanBox title="Lo que he encontrado" icon={<BrainCircuit size={18} />}>
                      <div className="space-y-3 text-sm leading-6 text-white/70">
                        <p>El área principal es <b className="text-white">{explanation.target}</b>.</p>
                        <p>He localizado piezas existentes que conviene reutilizar antes de crear nada nuevo:</p>
                        <div className="flex flex-wrap gap-2">
                          {explanation.areas.map((area) => <span key={area} className="rounded-full border border-cyan-200/15 bg-cyan-200/10 px-3 py-1 text-xs font-bold text-cyan-100">{area}</span>)}
                        </div>
                      </div>
                    </PlanBox>

                    <PlanBox title="Lo que haré si apruebas" icon={<Rocket size={18} />}>
                      <ul className="space-y-2 text-sm leading-6 text-white/70">
                        <li>• Crearé una rama segura.</li>
                        <li>• Modificaré solo archivos necesarios.</li>
                        <li>• Evitaré duplicados y versiones paralelas.</li>
                        <li>• Abriré un Pull Request para revisión.</li>
                      </ul>
                    </PlanBox>
                  </div>

                  <div className="mt-5 grid gap-5 xl:grid-cols-2">
                    <PlanBox title="Funcionalidades sobre las que trabajaría" icon={<Sparkles size={18} />}>
                      <div className="space-y-2">
                        {explanation.uniqueCapabilities.map(({ label, file }) => (
                          <div key={file.path} className="rounded-xl border border-white/10 bg-black/25 p-3">
                            <p className="text-sm font-black text-white">{label}</p>
                            <p className="mt-1 text-xs text-white/45">Ya existe en el proyecto. La revisaré antes de crear nada nuevo.</p>
                          </div>
                        ))}
                      </div>
                    </PlanBox>

                    <PlanBox title="Cambios concretos" icon={<GitPullRequest size={18} />}>
                      {explanation.hasChanges ? (
                        <div className="space-y-2">
                          {explanation.proposedFiles.map((file) => (
                            <div key={file.path} className="rounded-xl border border-white/10 bg-black/25 p-3">
                              <p className="break-all text-xs font-black text-cyan-100">{file.path}</p>
                              <p className="mt-1 text-[11px] text-white/45">{file.message || "Cambio propuesto por Executor."}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">
                          Todavía no tengo un cambio de código suficientemente seguro. Puedes responder arriba concretando qué quieres cambiar, o revisar los detalles técnicos. No crearé PR falso ni documentación innecesaria.
                        </div>
                      )}
                    </PlanBox>
                  </div>

                  <div className="mt-5 rounded-3xl border border-cyan-200/15 bg-cyan-200/10 p-4">
                    <p className="text-sm leading-7 text-cyan-50">{explanation.next}</p>
                  </div>

                  <button type="button" onClick={() => setShowTech((value) => !value)} className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black text-white/70">
                    {showTech ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    {showTech ? "Ocultar detalles técnicos" : "Ver detalles técnicos"}
                  </button>

                  {showTech && (
                    <div className="mt-4 grid gap-4 md:grid-cols-4">
                      <Metric label="Archivos analizados" value={String(plan.projectMap?.analyzedFiles || 0)} />
                      <Metric label="Relacionados" value={String(plan.projectMap?.relatedFiles || 0)} />
                      <Metric label="Editables" value={String(plan.projectMap?.editableFiles || 0)} />
                      <Metric label="Cambios PR" value={String(plan.proposedFiles?.length || 0)} />
                    </div>
                  )}
                </section>
              )}

              {run?.pullRequestUrl && (
                <section className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-5 backdrop-blur-xl">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100/70">Trabajo terminado</p>
                      <h2 className="mt-2 text-3xl font-black">Hecho. Pull Request creado.</h2>
                      <p className="mt-2 text-sm text-emerald-50/75">Rama: {run.branch || "rama segura"}. Revísalo antes de hacer merge.</p>
                    </div>
                    <Link href={run.pullRequestUrl} target="_blank" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-200 px-5 py-3 text-sm font-black text-slate-950">
                      Ver Pull Request <ArrowRight size={17} />
                    </Link>
                  </div>
                </section>
              )}

              {error && (
                <section className="rounded-[2rem] border border-rose-300/20 bg-rose-300/10 p-5 text-rose-50">
                  <div className="flex items-center gap-2 font-black"><XCircle size={18} /> Error</div>
                  <p className="mt-2 text-sm leading-6">{error}</p>
                </section>
              )}
            </div>

            <aside className="space-y-5">
              <Panel title="Línea de trabajo" icon={<Activity size={18} />}>
                <div className="space-y-3">
                  {timeline.map((step, index) => <TimelineStep key={step.label} index={index + 1} step={step} />)}
                </div>
              </Panel>

              <Panel title="Centro de mando" icon={<Cpu size={18} />}>
                <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
                  {commandCenterLinks.map((link) => <CommandCard key={link.href} {...link} />)}
                </div>
              </Panel>

              <Panel title="Estado del sistema" icon={<Database size={18} />}>
                <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
                  {systemHealth.map(([name, status, pct]) => <HealthCard key={name} name={name} status={status} pct={pct} />)}
                </div>
              </Panel>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}

function MenuGroup({ title, children }: { title: string; children: ReactNode }) {
  return <div><p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{title}</p><div className="space-y-1">{children}</div></div>;
}

function MenuItem({ href, icon, label, active, highlight }: { href: string; icon: ReactNode; label: string; active?: boolean; highlight?: boolean }) {
  return <Link href={href} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition ${active ? "bg-violet-500/25 text-white" : highlight ? "text-cyan-100 hover:bg-cyan-300/10" : "text-white/65 hover:bg-white/8 hover:text-white"}`}>{icon}<span>{label}</span></Link>;
}

function Badge({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{label}</p><p className="mt-1 font-black">{value}</p></div>;
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl"><div className="mb-4 flex items-center gap-2 text-cyan-100">{icon}<h3 className="font-black text-white">{title}</h3></div>{children}</div>;
}

function CommandCard({ label, desc, href, icon: Icon }: { label: string; desc: string; href: string; icon: typeof BrainCircuit }) {
  return <Link href={href} className="group rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-cyan-200/40 hover:bg-cyan-200/10"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-100"><Icon size={18} /></div><div><p className="font-black">{label}</p><p className="mt-1 text-xs leading-5 text-white/45">{desc}</p></div></div><ArrowRight className="opacity-0 transition group-hover:opacity-100" size={16} /></div></Link>;
}

function HealthCard({ name, status, pct }: { name: string; status: string; pct: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{name}</p><p className="mt-2 text-lg font-black">{status}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: pct }} /></div><p className="mt-2 text-right text-xs font-black text-emerald-300">{pct}</p></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>;
}

function PlanBox({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4"><div className="mb-4 flex items-center gap-2 text-cyan-100">{icon}<h3 className="font-black text-white">{title}</h3></div>{children}</div>;
}

function RiskBadge({ risk }: { risk?: string }) {
  const value = normalizeRisk(risk);
  const color = risk === "alto" ? "border-rose-300/25 bg-rose-300/10 text-rose-100" : risk === "medio" ? "border-amber-300/25 bg-amber-300/10 text-amber-100" : "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
  return <div className={`rounded-2xl border px-4 py-3 ${color}`}><p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-70">Riesgo</p><p className="text-xl font-black">{value}</p></div>;
}

function TimelineStep({ index, step }: { index: number; step: WorkStep }) {
  const statusClasses: Record<WorkStepStatus, string> = {
    done: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
    active: "border-cyan-300/30 bg-cyan-300/10 text-cyan-50",
    waiting: "border-white/10 bg-black/20 text-white/45",
    error: "border-rose-300/25 bg-rose-300/10 text-rose-100",
  };
  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-3 ${statusClasses[step.status]}`}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-black">
        {step.status === "done" ? <CheckCircle2 size={16} /> : step.status === "active" ? <Loader2 className="animate-spin" size={16} /> : index}
      </div>
      <p className="text-sm font-bold">{step.label}</p>
    </div>
  );
}
