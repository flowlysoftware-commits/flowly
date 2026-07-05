"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Database,
  FileSearch,
  GitPullRequest,
  Github,
  Layers3,
  Loader2,
  MessageSquareText,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Wand2,
  XCircle,
} from "lucide-react";

type ChatMessage = {
  role: "user" | "brain" | "system";
  text: string;
};

type HumanChange = {
  title?: string;
  description?: string;
  userImpact?: string;
  safetyNote?: string;
};

type ProposedFile = {
  path?: string;
  message?: string;
};

type CandidateFile = {
  path?: string;
  reason?: string;
  score?: number;
  role?: string;
};

type StageStatus = "done" | "active" | "waiting" | "blocked" | "error";

type Stage = {
  id?: string;
  label: string;
  description?: string;
  status: StageStatus;
  details?: string[];
};

type DeveloperPlan = {
  ok?: boolean;
  sessionPlanId?: string | null;
  error?: string;
  instruction?: string;
  summary?: string;
  risk?: string;
  conversationOnly?: boolean;
  conversationReply?: string;
  humanChangePlan?: HumanChange[];
  proposedFiles?: ProposedFile[];
  stages?: Stage[];
  preflight?: {
    ok: boolean;
    status?: string;
    blockedReason?: string;
    checks?: Array<{ label: string; ok: boolean; detail: string }>;
  };
  contextEngine?: {
    target?: string;
    action?: string;
    loaded?: number;
    warnings?: string[];
    sources?: Array<{ path: string; title?: string; kind?: string }>;
  };
  intelligence?: {
    intent?: string;
    currentObjective?: string;
    directReply?: string;
    thinkingTrace?: string[];
    confidence?: number;
    usedAI?: boolean;
    model?: string;
  };
  projectMap?: {
    analyzedFiles?: number;
    relatedFiles?: number;
    editableFiles?: number;
    modules?: string[];
    candidates?: CandidateFile[];
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
  branch?: string;
  pullRequestUrl?: string;
  pullRequestNumber?: number;
  nextAction?: string;
  qaStatus?: { status?: string; summary?: string };
};

const defaultStages: Stage[] = [
  { id: "intent", label: "Entender intención", description: "Separar pregunta, idea, aprobación o ejecución.", status: "waiting" },
  { id: "memory", label: "Memoria y docs", description: "Leer Brain, /docs y decisiones previas.", status: "waiting" },
  { id: "graph", label: "Project Graph", description: "Detectar módulos, rutas, APIs y archivos candidatos.", status: "waiting" },
  { id: "strategy", label: "Estrategia CTO", description: "Convertir la petición en un plan de producto claro.", status: "waiting" },
  { id: "approval", label: "Aprobación humana", description: "No ejecutar nada sin tu OK.", status: "waiting" },
  { id: "execution", label: "Rama + PR + QA", description: "Aplicar cambios seguros, validar y abrir Pull Request.", status: "waiting" },
];

const engineCards = [
  {
    title: "Brain",
    description: "Razona como arquitecto principal antes de tocar código.",
    icon: BrainCircuit,
  },
  {
    title: "Memory",
    description: "Mantiene el objetivo de sesión y las decisiones aprobadas.",
    icon: Database,
  },
  {
    title: "Project Graph",
    description: "Mapea rutas, módulos, APIs y dependencias afectadas.",
    icon: Network,
  },
  {
    title: "Planning",
    description: "Explica cambios como producto, no como lista de archivos.",
    icon: Layers3,
  },
  {
    title: "Executor",
    description: "Trabaja en rama segura y nunca modifica main directamente.",
    icon: Rocket,
  },
  {
    title: "QA",
    description: "Bloquea cambios inseguros y revisa fallos antes del PR.",
    icon: ShieldCheck,
  },
];

const starterPrompts = [
  "Revisa la home como CTO y dime qué cambiarías para convertir más sin tocar código todavía.",
  "Quiero mejorar el Companion, pero primero explícame una propuesta de producto clara.",
  "Haz una auditoría del CRM y dime qué partes visuales no están al nivel de las demos.",
  "Revisa el SEO de Flowly y prepara un plan por fases antes de modificar archivos.",
];

function statusFor(mode: string, index: number, plan: DeveloperPlan | null, run: DeveloperRun | null, error: string | null): StageStatus {
  if (error) return index === 0 ? "error" : "waiting";
  if (run?.pullRequestUrl) return "done";
  if (mode === "running") return index < 5 ? "done" : index === 5 ? "active" : "waiting";
  if (mode === "planned") return index < 4 ? "done" : index === 4 ? "active" : "waiting";
  if (mode === "planning") return index === 0 ? "done" : index >= 1 && index <= 3 ? "active" : "waiting";
  if (plan?.ok) return index < 4 ? "done" : index === 4 ? "active" : "waiting";
  return "waiting";
}

function buildStages(mode: string, plan: DeveloperPlan | null, run: DeveloperRun | null, error: string | null): Stage[] {
  const incoming = run?.stages?.length ? run.stages : plan?.stages?.length ? plan.stages : null;
  if (incoming) return incoming.map((stage, index) => ({ ...stage, status: stage.status || statusFor(mode, index, plan, run, error) }));
  return defaultStages.map((stage, index) => ({ ...stage, status: statusFor(mode, index, plan, run, error) }));
}

function riskLabel(risk?: string) {
  if (!risk) return "Pendiente";
  if (risk.toLowerCase() === "bajo") return "Bajo";
  if (risk.toLowerCase() === "medio") return "Medio";
  if (risk.toLowerCase() === "alto") return "Alto";
  return risk;
}

function naturalChangePlan(plan: DeveloperPlan | null) {
  const changes = (plan?.humanChangePlan || []).filter((item) => item.title || item.description);
  if (changes.length) return changes.slice(0, 8);

  const files = (plan?.proposedFiles || []).filter((item) => item.path);
  if (!files.length) return [];

  return files.slice(0, 6).map((file) => ({
    title: file.message || "Cambio técnico propuesto",
    description: `Trabajaré sobre ${file.path} porque el Project Graph lo ha marcado como parte relacionada con la petición.`,
    userImpact: "El cambio será revisable en un Pull Request antes de tocar producción.",
    safetyNote: "No crearé arquitectura paralela ni duplicaré motores.",
  }));
}

function latestThinking(plan: DeveloperPlan | null, mode: string) {
  if (mode === "planning") return "Estoy leyendo contexto, detectando intención y construyendo una propuesta segura.";
  if (mode === "running") return "Estoy ejecutando el plan aprobado en una rama segura.";
  if (plan?.intelligence?.thinkingTrace?.length) return plan.intelligence.thinkingTrace[0];
  if (plan?.conversationReply) return plan.conversationReply;
  return "Esperando una petición. Cuando escribas, analizaré primero y ejecutaré solo si lo apruebas.";
}

export default function FlowStudioPage() {
  const [instruction, setInstruction] = useState("");
  const [conversationId, setConversationId] = useState(() => `flow-studio-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "brain",
      text: "Hola Ricky. Esto es Flow Studio: un entorno de ingeniería para Flowly OS. Primero pienso, leo contexto y te explico exactamente qué haría. Solo ejecuto cuando apruebas.",
    },
  ]);
  const [plan, setPlan] = useState<DeveloperPlan | null>(null);
  const [run, setRun] = useState<DeveloperRun | null>(null);
  const [mode, setMode] = useState<"idle" | "planning" | "planned" | "running" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("flowly-flow-studio-session");
      if (!saved) return;
      const parsed = JSON.parse(saved) as {
        conversationId?: string;
        messages?: ChatMessage[];
        plan?: DeveloperPlan | null;
        mode?: typeof mode;
      };
      if (parsed.conversationId) setConversationId(parsed.conversationId);
      if (Array.isArray(parsed.messages) && parsed.messages.length) setMessages(parsed.messages.slice(-20));
      if (parsed.plan) {
        setPlan(parsed.plan);
        setMode(parsed.mode === "planned" || parsed.mode === "done" ? parsed.mode : "planned");
      }
    } catch {
      // La sesión local nunca debe bloquear la pantalla.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "flowly-flow-studio-session",
        JSON.stringify({ conversationId, messages: messages.slice(-20), plan, mode })
      );
    } catch {
      // No bloquear si el navegador no permite localStorage.
    }
  }, [conversationId, messages, mode, plan]);

  const stages = useMemo(() => buildStages(mode, plan, run, error), [mode, plan, run, error]);
  const changes = useMemo(() => naturalChangePlan(plan), [plan]);
  const isBusy = mode === "planning" || mode === "running";

  async function ask(event?: FormEvent) {
    event?.preventDefault();
    const clean = instruction.trim();
    if (!clean || isBusy) return;

    setMode("planning");
    setError(null);
    setRun(null);
    setInstruction("");

    const optimistic: ChatMessage[] = [
      ...messages,
      { role: "user", text: clean },
      { role: "system", text: "Estoy interpretando la petición y consultando el sistema antes de responder." },
    ];

    setMessages(optimistic);

    try {
      const response = await fetch("/api/developer/pipeline/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: clean,
          conversationId,
          history: optimistic,
          currentPlan: plan,
        }),
      });

      const data = (await response.json()) as DeveloperPlan;
      if (!response.ok || !data.ok) throw new Error(data.error || "No he podido preparar la propuesta.");

      if (data.conversationOnly) {
        setMode(plan?.ok ? "planned" : "idle");
        setMessages((items) => [
          ...items,
          { role: "brain", text: data.conversationReply || "Estoy en la misma sesión. Dime si quieres que ajuste el plan." },
        ]);
        return;
      }

      setPlan(data);
      setMode("planned");
      const readable = data.conversationReply || "He terminado la investigación. Abajo tienes una propuesta clara de producto, riesgo y ejecución segura.";
      setMessages((items) => [...items, { role: "brain", text: readable }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setMode("error");
      setMessages((items) => [...items, { role: "brain", text: `No he podido preparar la propuesta: ${message}` }]);
    }
  }

  async function approve() {
    if (!plan?.ok || isBusy) return;

    setMode("running");
    setError(null);
    setMessages((items) => [
      ...items,
      { role: "user", text: "Aprobado. Ejecuta el plan." },
      { role: "system", text: "OK recibido. Ejecuto exactamente el plan aprobado en rama segura." },
    ]);

    try {
      const response = await fetch("/api/developer/pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: plan.instruction || instruction,
          approved: true,
          approvedPlan: plan,
          sessionPlanId: plan.sessionPlanId || null,
          conversationId,
        }),
      });

      const data = (await response.json()) as DeveloperRun;
      if (!response.ok || data.error) throw new Error(data.error || "No he podido crear el Pull Request.");

      setRun(data);
      setMode("done");
      setMessages((items) => [
        ...items,
        {
          role: "brain",
          text: data.pullRequestUrl
            ? `Pull Request creado correctamente. Rama: ${data.branch || "rama segura"}. Revísalo antes de hacer merge.`
            : "Ejecución terminada, pero no he recibido URL de Pull Request.",
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setMode("error");
      setMessages((items) => [...items, { role: "brain", text: `No he podido ejecutar el plan: ${message}` }]);
    }
  }

  function resetSession() {
    setInstruction("");
    setConversationId(`flow-studio-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    setMessages([
      {
        role: "brain",
        text: "Sesión nueva. Dime qué quieres construir, mejorar o revisar. Primero pensaré y luego propondré.",
      },
    ]);
    setPlan(null);
    setRun(null);
    setMode("idle");
    setError(null);
    try {
      window.localStorage.removeItem("flowly-flow-studio-session");
    } catch {
      // noop
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#02030a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_8%,rgba(124,58,237,.28),transparent_28%),radial-gradient(circle_at_80%_12%,rgba(34,211,238,.22),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(236,72,153,.14),transparent_28%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:46px_46px]" />

      <section className="relative mx-auto flex min-h-screen max-w-[1800px] gap-5 p-5">
        <aside className="hidden w-80 shrink-0 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/40 backdrop-blur-2xl xl:block">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-300 text-2xl font-black shadow-lg shadow-violet-500/30">F</div>
            <div>
              <p className="text-2xl font-black">Flow Studio</p>
              <p className="text-xs text-cyan-100/55">Developer OS 2.0</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-cyan-200/15 bg-cyan-200/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/65">Pensamiento actual</p>
            <p className="mt-3 text-sm leading-6 text-cyan-50/85">{latestThinking(plan, mode)}</p>
          </div>

          <div className="mt-5 space-y-3">
            {engineCards.map((engine) => {
              const Icon = engine.icon;
              return <EngineCard key={engine.title} icon={<Icon size={17} />} title={engine.title} description={engine.description} />;
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link href="/developer" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-black text-white/75 transition hover:border-cyan-200/30 hover:text-white">
              Developer clásico
            </Link>
            <Link href="/os/project-graph" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-black text-white/75 transition hover:border-cyan-200/30 hover:text-white">
              Project Graph
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-5">
          <header className="rounded-[2.25rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-5xl">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-100/55">Flowly OS · Engineering Environment</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-7xl">No es un chat. Es tu estudio de ingeniería.</h1>
                <p className="mt-4 max-w-4xl text-base leading-7 text-white/60">
                  Flow Studio convierte una idea normal en investigación, arquitectura, propuesta de producto, ejecución segura, QA y Pull Request. Mantiene contexto y no toca producción sin aprobación.
                </p>
              </div>
              <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-4">
                <Kpi label="Modo" value={plan?.intelligence?.usedAI ? "GPT CTO" : "Seguro"} />
                <Kpi label="Riesgo" value={riskLabel(plan?.risk)} />
                <Kpi label="Docs" value={String(plan?.contextEngine?.loaded || 0)} />
                <Kpi label="PR" value={run?.pullRequestUrl ? "Creado" : "Pendiente"} />
              </div>
            </div>
          </header>

          <section className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_460px]">
            <div className="space-y-5">
              <section className="rounded-[2rem] border border-cyan-200/15 bg-gradient-to-br from-cyan-300/10 via-white/[0.045] to-violet-500/10 p-5 backdrop-blur-2xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/55">Conversación con contexto</p>
                    <h2 className="mt-2 text-2xl font-black">Dime qué quieres construir</h2>
                    <p className="mt-1 text-sm text-white/55">Puedes preguntar, ajustar, rechazar o aprobar. No se reinicia la sesión en cada mensaje.</p>
                  </div>
                  <button type="button" onClick={resetSession} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white/60 transition hover:text-white">
                    Nueva sesión
                  </button>
                </div>

                <div className="mt-5 min-h-[390px] rounded-[1.6rem] border border-white/10 bg-black/35 p-4">
                  <div className="space-y-3">
                    {messages.map((message, index) => (
                      <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[88%] rounded-2xl border px-4 py-3 text-sm leading-6 ${
                          message.role === "user"
                            ? "border-cyan-300/30 bg-cyan-300/15 text-cyan-50"
                            : message.role === "system"
                              ? "border-violet-300/20 bg-violet-300/10 text-violet-50/80"
                              : "border-white/10 bg-white/[0.06] text-white/82"
                        }`}>
                          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                            {message.role === "user" ? "Tú" : message.role === "system" ? "Sistema" : "Flow Studio"}
                          </p>
                          {message.text}
                        </div>
                      </div>
                    ))}
                    {isBusy && (
                      <div className="flex justify-start">
                        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-black text-cyan-50">
                          <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> {mode === "planning" ? "Investigando arquitectura..." : "Ejecutando plan aprobado..."}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={ask} className="mt-4">
                  <div className="relative">
                    <textarea
                      value={instruction}
                      onChange={(event) => setInstruction(event.target.value)}
                      placeholder="Ejemplo: Quiero optimizar el SEO profesionalmente, pero primero dime qué harías y qué riesgo tiene."
                      className="min-h-[125px] w-full rounded-3xl border border-white/10 bg-black/35 p-5 pr-32 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-200/45"
                    />
                    <button disabled={!instruction.trim() || isBusy} className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-2xl bg-cyan-200 px-4 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-45">
                      {mode === "planning" ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                      Pensar
                    </button>
                  </div>
                </form>

                <div className="mt-4 grid gap-2 lg:grid-cols-2">
                  {starterPrompts.map((prompt) => (
                    <button key={prompt} type="button" onClick={() => setInstruction(prompt)} className="rounded-2xl border border-white/10 bg-black/25 p-3 text-left text-xs leading-5 text-white/58 transition hover:border-cyan-200/35 hover:bg-cyan-200/10 hover:text-white">
                      {prompt}
                    </button>
                  ))}
                </div>
              </section>

              {plan?.ok && (
                <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/55">Propuesta de producto</p>
                      <h2 className="mt-2 text-3xl font-black">Esto es lo que haría</h2>
                      <p className="mt-3 max-w-4xl text-sm leading-7 text-white/64">
                        {plan.summary || plan.conversationReply || "He preparado una propuesta basada en el contexto del proyecto. Revisa el impacto antes de aprobar."}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Riesgo</p>
                      <p className="mt-1 text-xl font-black">{riskLabel(plan.risk)}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
                    <StudioPanel title="Cambios en lenguaje claro" icon={<Sparkles size={18} />}>
                      {changes.length ? (
                        <div className="grid gap-3">
                          {changes.map((change, index) => (
                            <div key={`${change.title}-${index}`} className="rounded-2xl border border-cyan-200/15 bg-cyan-200/10 p-4">
                              <p className="font-black text-cyan-50">{index + 1}. {change.title || "Cambio propuesto"}</p>
                              <p className="mt-2 text-sm leading-6 text-white/72">{change.description || "Aplicaré un cambio pequeño, revisable y alineado con la arquitectura existente."}</p>
                              {change.userImpact && <p className="mt-3 text-xs leading-5 text-emerald-100/75"><b>Impacto:</b> {change.userImpact}</p>}
                              {change.safetyNote && <p className="mt-2 text-[11px] leading-5 text-white/42">{change.safetyNote}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyNote text="Todavía no hay cambios ejecutables. Puedes seguir preguntando o pedir una propuesta más concreta." />
                      )}
                    </StudioPanel>

                    <StudioPanel title="Seguridad antes del PR" icon={<ShieldCheck size={18} />}>
                      <div className="space-y-3">
                        {(plan.preflight?.checks || [
                          { label: "Plan congelado", ok: true, detail: "Se ejecutará exactamente lo aprobado." },
                          { label: "Rama segura", ok: true, detail: "No se modifica main directamente." },
                          { label: "Revisión humana", ok: true, detail: "El cambio termina en Pull Request." },
                        ]).map((check) => (
                          <div key={check.label} className={`rounded-2xl border p-3 ${check.ok ? "border-emerald-300/20 bg-emerald-300/10" : "border-rose-300/20 bg-rose-300/10"}`}>
                            <p className="font-black text-white">{check.ok ? "✓" : "✕"} {check.label}</p>
                            <p className="mt-1 text-xs leading-5 text-white/55">{check.detail}</p>
                          </div>
                        ))}
                        {plan.preflight?.blockedReason && <p className="text-sm text-rose-100">{plan.preflight.blockedReason}</p>}
                      </div>
                    </StudioPanel>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={approve}
                      disabled={isBusy || !plan.ok || plan.preflight?.ok === false || !changes.length}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-200 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-emerald-950/20 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {mode === "running" ? <Loader2 className="animate-spin" size={17} /> : <Rocket size={17} />}
                      Aprobar y crear PR
                    </button>
                    <button type="button" onClick={() => setShowTechnical((value) => !value)} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/70">
                      <Code2 size={17} />
                      {showTechnical ? "Ocultar técnica" : "Ver técnica"}
                    </button>
                  </div>

                  {showTechnical && (
                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                      <StudioPanel title="Archivos candidatos" icon={<FileSearch size={18} />}>
                        <div className="space-y-2">
                          {(plan.projectMap?.candidates || []).slice(0, 8).map((file) => (
                            <div key={file.path} className="rounded-xl border border-white/10 bg-black/25 p-3">
                              <p className="break-all font-mono text-xs font-black text-cyan-100">{file.path}</p>
                              <p className="mt-1 text-[11px] text-white/45">{file.reason || file.role || "Relacionado con la petición."}</p>
                            </div>
                          ))}
                          {!(plan.projectMap?.candidates || []).length && <EmptyNote text="Aún no hay candidatos técnicos visibles." />}
                        </div>
                      </StudioPanel>
                      <StudioPanel title="Archivos que tocaría" icon={<TerminalSquare size={18} />}>
                        <div className="space-y-2">
                          {(plan.proposedFiles || []).slice(0, 8).map((file) => (
                            <div key={file.path} className="rounded-xl border border-white/10 bg-black/25 p-3">
                              <p className="break-all font-mono text-xs font-black text-cyan-100">{file.path}</p>
                              <p className="mt-1 text-[11px] text-white/45">{file.message || "Cambio propuesto."}</p>
                            </div>
                          ))}
                          {!(plan.proposedFiles || []).length && <EmptyNote text="El plan aún no propone modificaciones de archivo." />}
                        </div>
                      </StudioPanel>
                    </div>
                  )}
                </section>
              )}

              {run?.pullRequestUrl && (
                <section className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-5 backdrop-blur-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100/70">PR creado</p>
                      <h2 className="mt-2 text-3xl font-black">Trabajo listo para revisión</h2>
                      <p className="mt-2 text-sm text-emerald-50/75">Rama: {run.branch || "rama segura"} · QA: {run.qaStatus?.summary || run.qaStatus?.status || "pendiente"}</p>
                    </div>
                    <Link href={run.pullRequestUrl} target="_blank" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-200 px-5 py-3 text-sm font-black text-slate-950">
                      Abrir Pull Request <ArrowRight size={17} />
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
              <StudioPanel title="Pipeline vivo" icon={<Activity size={18} />}>
                <div className="space-y-3">
                  {stages.map((stage, index) => (
                    <StageRow key={`${stage.label}-${index}`} index={index + 1} stage={stage} />
                  ))}
                </div>
              </StudioPanel>

              <StudioPanel title="Mapa de impacto" icon={<Network size={18} />}>
                <div className="grid grid-cols-2 gap-3">
                  <Kpi label="Analizados" value={String(plan?.projectMap?.analyzedFiles || plan?.projectMap?.projectGraph?.totalFiles || 0)} />
                  <Kpi label="Relacionados" value={String(plan?.projectMap?.relatedFiles || 0)} />
                  <Kpi label="Editables" value={String(plan?.projectMap?.editableFiles || 0)} />
                  <Kpi label="Cambios" value={String(plan?.proposedFiles?.length || 0)} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(plan?.projectMap?.modules || ["Flowly OS", "Brain", "Executor"]).slice(0, 8).map((module) => (
                    <span key={module} className="rounded-full border border-cyan-200/15 bg-cyan-200/10 px-3 py-1 text-xs font-black text-cyan-100">{module}</span>
                  ))}
                </div>
              </StudioPanel>

              <StudioPanel title="Memoria consultada" icon={<Database size={18} />}>
                <div className="space-y-2">
                  {(plan?.contextEngine?.sources || []).slice(0, 6).map((source) => (
                    <div key={source.path} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                      <p className="break-all font-mono text-[11px] font-black text-white/80">{source.path}</p>
                      <p className="mt-1 text-[11px] text-white/40">{source.title || source.kind || "Documento de contexto"}</p>
                    </div>
                  ))}
                  {!(plan?.contextEngine?.sources || []).length && <EmptyNote text="Cuando pidas algo, aquí verás qué memoria y documentos ha usado." />}
                </div>
              </StudioPanel>

              <StudioPanel title="Conexiones" icon={<Github size={18} />}>
                <div className="grid gap-3">
                  <Connection label="GitHub Executor" active />
                  <Connection label="QA Agent" active />
                  <Connection label="OpenAI Intelligence" active={Boolean(plan?.intelligence?.usedAI)} />
                  <Connection label="Supabase Memory" active />
                </div>
              </StudioPanel>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}

function EngineCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
      <div className="flex items-center gap-2 font-black text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/8 text-cyan-100">{icon}</span>
        {title}
      </div>
      <p className="mt-2 text-xs leading-5 text-white/45">{description}</p>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function StudioPanel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-cyan-100">{icon}</span>
        <h3 className="text-lg font-black">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function EmptyNote({ text }: { text: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white/45">{text}</div>;
}

function StageRow({ index, stage }: { index: number; stage: Stage }) {
  const styles: Record<StageStatus, string> = {
    done: "border-emerald-300/20 bg-emerald-300/10 text-emerald-50",
    active: "border-cyan-300/30 bg-cyan-300/15 text-cyan-50",
    waiting: "border-white/10 bg-black/25 text-white/45",
    blocked: "border-amber-300/25 bg-amber-300/10 text-amber-50",
    error: "border-rose-300/25 bg-rose-300/10 text-rose-50",
  };

  return (
    <div className={`rounded-2xl border p-4 ${styles[stage.status] || styles.waiting}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/30 text-sm font-black">
          {stage.status === "done" ? <CheckCircle2 size={16} /> : stage.status === "active" ? <Loader2 className="animate-spin" size={16} /> : index}
        </div>
        <div>
          <p className="font-black">{stage.label}</p>
          {stage.description && <p className="mt-1 text-xs leading-5 opacity-65">{stage.description}</p>}
          {stage.details?.length ? (
            <ul className="mt-2 space-y-1 text-[11px] opacity-60">
              {stage.details.slice(0, 3).map((detail) => <li key={detail}>• {detail}</li>)}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Connection({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl border p-3 ${active ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-50" : "border-white/10 bg-black/25 text-white/45"}`}>
      <span className="text-sm font-black">{label}</span>
      <span className="text-xs font-black">{active ? "Activo" : "Pendiente"}</span>
    </div>
  );
}
