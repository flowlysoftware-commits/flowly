"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Bot, BrainCircuit, CheckCircle2, ChevronRight, Code2, FileText, MessageCircle, Rocket, Send, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import type { FlowlyCopilotResponse } from "@/lib/flowlyPanelCopilot";

type ChatMessage = { role: "user" | "assistant"; content: string; result?: FlowlyCopilotResponse; applied?: ApplyResult };

type ApplyResult = {
  ok: boolean;
  mode?: "project" | "change_request";
  studioRoute?: string;
  blueprint?: { name: string; slug: string };
  artifacts?: unknown[];
  error?: string;
};

const examples = [
  "Quiero crear el Companion oficial de Flowly con avatar, objetivos, misiones, recompensas, XP, memoria y recomendaciones.",
  "El CRM no me gusta. Quiero que la ficha del cliente sea más grande y que no aparezca todo tan apretado.",
  "Quiero automatizar que cuando un presupuesto se apruebe se cree una factura.",
  "Revisa el módulo de facturación y dime cómo lo mejorarías.",
];

export default function AsistentePage() {
  const [input, setInput] = useState("Quiero crear el Companion oficial de Flowly con avatar, objetivos, misiones, recompensas, XP, memoria y recomendaciones.");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hola 👋 Soy tu IA de Flowly. Dime lo que quieres cambiar, crear o mejorar con palabras normales. Yo lo convierto en un plan técnico y, si lo apruebas, lo preparo en Studio." },
  ]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  const lastResult = useMemo(() => [...messages].reverse().find((message) => message.result)?.result, [messages]);

  async function sendMessage(text = input) {
    const value = text.trim();
    if (!value || loading) return;
    setLoading(true);
    setInput("");
    setMessages((current) => [...current, { role: "user", content: value }]);
    try {
      const response = await fetch("/api/copilot/panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value }),
      });
      const data = await response.json();
      const result = data.result as FlowlyCopilotResponse;
      setMessages((current) => [...current, { role: "assistant", content: result.simpleAnswer, result }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "No he podido analizarlo ahora mismo. Pruébalo otra vez." }]);
    } finally {
      setLoading(false);
    }
  }

  async function approveResult(result: FlowlyCopilotResponse) {
    if (applying) return;
    setApplying(true);
    try {
      const response = await fetch("/api/copilot/panel/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: result.summary }),
      });
      const data = (await response.json()) as ApplyResult;
      setMessages((current) => [...current, {
        role: "assistant",
        content: data.ok
          ? data.mode === "project"
            ? `Listo. He creado el proyecto en Studio y he preparado ${data.artifacts?.length || 0} piezas iniciales.`
            : "Listo. He guardado el plan de cambio para revisarlo antes de aplicar."
          : `No he podido aplicarlo: ${data.error || "error desconocido"}`,
        applied: data,
      }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "No he podido aprobar el plan ahora mismo. Revisa Supabase y vuelve a intentarlo." }]);
    } finally {
      setApplying(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07040d] px-5 py-6 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link href="/dashboard" className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/70 hover:bg-white/[0.08]"><ArrowLeft size={16} /> Panel</Link>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-100/70">Flowly Orchestrator</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight">Pide cambios hablando normal</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">El asistente ya no usa plantillas simples. Primero entiende, luego diseña, revisa y solo después te deja aprobar la creación o modificación.</p>
            </div>
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-cyan-50">
              <Bot className="mb-3" />
              <p className="text-sm font-bold">Modo simple</p>
              <p className="mt-1 text-xs text-cyan-100/60">Sin lenguaje técnico</p>
            </div>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1fr_390px]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-4">
            <div className="mb-4 flex items-center gap-3 rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-100"><MessageCircle size={22} /></div>
              <div>
                <p className="font-bold">Conversación de trabajo</p>
                <p className="text-xs text-white/50">Ejemplo: “crea el Companion oficial de Flowly con avatar, misiones y recompensas”.</p>
              </div>
            </div>
            <div className="flex h-[650px] flex-col gap-3 overflow-y-auto rounded-3xl border border-white/10 bg-black/20 p-4">
              {messages.map((message, index) => (
                <div key={index} className={`max-w-[92%] rounded-3xl border p-4 ${message.role === "user" ? "ml-auto border-cyan-300/25 bg-cyan-400/15" : "border-white/10 bg-white/[0.055]"}`}>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-white/80">{message.content}</p>
                  {message.result && <ResultCard result={message.result} applying={applying} onApprove={() => approveResult(message.result!)} />}
                  {message.applied && <AppliedCard result={message.applied} />}
                </div>
              ))}
              {loading && <div className="w-fit rounded-3xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/60">Pensando como equipo: analista, arquitecto, revisor y constructor...</div>}
              {applying && <div className="w-fit rounded-3xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50">Aplicando plan en Studio...</div>}
            </div>
            <div className="mt-4 flex gap-3">
              <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder="Escribe lo que quieres cambiar o crear..." className="min-h-16 flex-1 rounded-3xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40" />
              <button onClick={() => sendMessage()} disabled={loading} className="inline-flex items-center gap-2 rounded-3xl bg-cyan-200 px-5 font-black text-slate-950 disabled:opacity-50"><Send size={17} /> Enviar</button>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/35">Accesos rápidos</p>
              <div className="mt-4 grid gap-2">
                {examples.map((example) => <button key={example} onClick={() => sendMessage(example)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left text-xs leading-5 text-white/60 hover:bg-white/[0.08]">{example}</button>)}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/35">Equipo interno</p>
              <div className="mt-4 space-y-3 text-sm text-white/65">
                <Step icon={<BrainCircuit size={16} />} text="Analista entiende intención" />
                <Step icon={<Wand2 size={16} />} text="Arquitecto diseña blueprint" />
                <Step icon={<ShieldCheck size={16} />} text="Revisor detecta riesgos" />
                <Step icon={<Code2 size={16} />} text="Constructor prepara Studio" />
                <Step icon={<FileText size={16} />} text="Documentador actualiza Docs" />
              </div>
            </div>

            {lastResult && (
              <div className="rounded-[2rem] border border-cyan-300/20 bg-cyan-400/10 p-5">
                <p className="text-sm font-black">Último plan</p>
                <p className="mt-2 text-2xl font-black">{lastResult.title}</p>
                <p className="mt-2 text-xs leading-5 text-cyan-50/65">Riesgo: {lastResult.risk}</p>
                <Link href={lastResult.studioRoute} className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-200 px-4 py-2 text-sm font-black text-slate-950">Abrir herramienta <ChevronRight size={16} /></Link>
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}

function Step({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3"><span className="text-cyan-100">{icon}</span><span>{text}</span></div>;
}

function ResultCard({ result, applying, onApprove }: { result: FlowlyCopilotResponse; applying: boolean; onApprove: () => void }) {
  const plan = result.technicalPlan;
  return (
    <div className="mt-4 space-y-4 rounded-3xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/60">Plan preparado</p>
          <p className="mt-1 text-lg font-black">{result.title}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/60">Riesgo {result.risk}</span>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {result.agents.map((agent) => (
          <div key={agent.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center gap-2"><Sparkles size={14} className="text-cyan-100" /><p className="text-sm font-black">{agent.name}</p></div>
            <p className="mt-1 text-xs text-white/40">{agent.role}</p>
            <p className="mt-2 text-xs leading-5 text-white/60">{agent.output}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <PlanList title="Objetos" items={plan.businessObjects} />
        <PlanList title="Capacidades" items={plan.capabilities} />
        <PlanList title="Flujos" items={plan.workflows} />
        <PlanList title="Políticas" items={plan.policies} />
      </div>

      <div className="grid gap-2">
        {result.actions.map((action) => (
          <div key={action.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-cyan-100" /><p className="text-sm font-bold">{action.title}</p></div>
            <p className="mt-1 text-xs leading-5 text-white/50">{action.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <p className="text-xs font-bold text-white/60">Preguntas antes de aplicar:</p>
        <ul className="mt-2 space-y-1 text-xs text-white/50">
          {result.questions.map((question) => <li key={question}>• {question}</li>)}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={onApprove} disabled={applying || !result.canGenerate} className="inline-flex items-center gap-2 rounded-full bg-cyan-200 px-4 py-2 text-sm font-black text-slate-950 disabled:opacity-50"><Rocket size={16} /> {result.approvalLabel}</button>
        <Link href={result.studioRoute} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white/75">Abrir Studio <ChevronRight size={16} /></Link>
      </div>
    </div>
  );
}

function PlanList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length ? items.slice(0, 10).map((item) => <span key={item} className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-white/60">{item}</span>) : <span className="text-xs text-white/35">Se definirá en Studio</span>}
        {items.length > 10 && <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/40">+{items.length - 10}</span>}
      </div>
    </div>
  );
}

function AppliedCard({ result }: { result: ApplyResult }) {
  return (
    <div className="mt-4 rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-4">
      <p className="text-sm font-black text-emerald-50">{result.ok ? "Plan aplicado" : "No se pudo aplicar"}</p>
      {result.ok ? <p className="mt-2 text-xs text-emerald-50/70">Modo: {result.mode}. {result.artifacts ? `${result.artifacts.length} piezas preparadas.` : "Plan guardado."}</p> : <p className="mt-2 text-xs text-emerald-50/70">{result.error}</p>}
      {result.studioRoute && <Link href={result.studioRoute} className="mt-3 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-slate-950">Abrir resultado</Link>}
    </div>
  );
}
