"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, BrainCircuit, CheckCircle2, Cpu, Database, GitBranch, Lock, MessageCircle, Play, Search, Send, ShieldCheck, Sparkles, Wrench } from "lucide-react";

type BrainTool = {
  id: string;
  label: string;
  summary: string;
  data?: Record<string, unknown>;
};

type BrainAction = {
  type: string;
  label: string;
  description: string;
  requiresApproval: boolean;
};

type BrainResult = {
  answer: string;
  mode: "cliente" | "arquitecto";
  intent: string;
  usedAI: boolean;
  blockedInternalAction: boolean;
  stage: string;
  tools: BrainTool[];
  plan: BrainAction[];
  suggestedActions: string[];
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  result?: BrainResult;
};

const examples = [
  "No me gusta el CRM. Quiero que analices cómo mejorarlo sin crear un CRM nuevo.",
  "Quiero crear un módulo para gestionar vehículos y mantenimientos.",
  "¿Qué tengo que hacer hoy desde el panel cliente?",
  "Revisa la migración a Flowly OS y dime qué falta.",
];

const toolIcons: Record<string, typeof BrainCircuit> = {
  context_engine: Cpu,
  knowledge_search: Search,
  project_analyzer: GitBranch,
  kernel_registry: Database,
  business_context: MessageCircle,
  permission_guard: ShieldCheck,
  action_planner: Wrench,
};

function ResultPanel({ result }: { result: BrainResult }) {
  return (
    <div className="mt-4 grid gap-3 lg:grid-cols-2">
      <section className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-4">
        <div className="flex items-center gap-2 text-cyan-100">
          <BrainCircuit size={18} />
          <h3 className="font-black">Herramientas usadas</h3>
        </div>
        <div className="mt-3 space-y-2">
          {result.tools.map((tool) => {
            const Icon = toolIcons[tool.id] || Sparkles;
            return (
              <div key={tool.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white/85"><Icon size={15} /> {tool.label}</div>
                <p className="mt-1 text-xs leading-5 text-white/55">{tool.summary}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-purple-300/20 bg-purple-400/10 p-4">
        <div className="flex items-center gap-2 text-purple-100">
          <Play size={18} />
          <h3 className="font-black">Plan propuesto</h3>
        </div>
        <div className="mt-3 space-y-2">
          {result.plan.map((action) => (
            <div key={`${action.type}-${action.label}`} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-white/85">{action.label}</p>
                {action.requiresApproval ? <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-100">requiere aprobación</span> : <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100">informativo</span>}
              </div>
              <p className="mt-1 text-xs leading-5 text-white/55">{action.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function FlowlyBrainPage() {
  const [input, setInput] = useState(examples[0]);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Soy Flowly Brain. Yo no soy el chat visual: soy el cerebro que consulta contexto, Knowledge, Analyzer, Kernel y Planner antes de responder o preparar cambios.",
    },
  ]);

  const lastResult = useMemo(() => [...messages].reverse().find((message) => message.result)?.result, [messages]);

  async function askBrain(text = input) {
    const clean = text.trim();
    if (!clean || loading) return;
    setLoading(true);
    setInput("");
    const nextMessages = [...messages, { role: "user" as const, content: clean }];
    setMessages(nextMessages);

    try {
      const response = await fetch("/api/brain/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, pathname: "/os/brain", conversation: messages.map(({ role, content }) => ({ role, content })) }),
      });
      const data = (await response.json()) as BrainResult;
      setMessages((current) => [...current, { role: "assistant", content: data.answer || "Brain no pudo responder.", result: data }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "No he podido conectar con Flowly Brain ahora mismo." }]);
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await askBrain();
  }

  return (
    <main className="min-h-screen bg-[#050710] px-5 py-7 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/os" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/[0.08]"><ArrowLeft size={16} /> Volver a OS</Link>
          <Link href="/asistente" className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-50"><Sparkles size={16} /> Abrir Asistente Arquitecto</Link>
        </div>

        <header className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 shadow-2xl shadow-black/35">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-300/25 bg-purple-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-purple-100"><BrainCircuit size={15} /> Flowly Brain</div>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">Cerebro operativo de Flowly</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/62">Brain usa contexto, conocimiento, Analyzer, Kernel y un planificador de acciones antes de responder. El Companion es la voz; Brain es quien piensa.</p>
        </header>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-4"><p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">Modo</p><p className="mt-2 text-2xl font-black">Arquitecto</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-4"><p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">Herramientas</p><p className="mt-2 text-2xl font-black">7</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-4"><p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">Permisos</p><p className="mt-2 text-2xl font-black">Guard</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-4"><p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">IA</p><p className="mt-2 text-2xl font-black">{lastResult?.usedAI ? "OpenAI" : "Fallback"}</p></div>
        </div>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-4">
            <div className="h-[620px] overflow-y-auto rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div key={index} className={`rounded-3xl border p-4 ${message.role === "user" ? "ml-auto max-w-[85%] border-cyan-300/25 bg-cyan-400/15" : "max-w-[92%] border-white/10 bg-white/[0.055]"}`}>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-white/78">{message.content}</p>
                    {message.result ? <ResultPanel result={message.result} /> : null}
                  </div>
                ))}
                {loading ? <div className="w-fit rounded-3xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-white/55">Brain consultando contexto, Knowledge, Analyzer y Kernel...</div> : null}
              </div>
            </div>
            <form onSubmit={submit} className="mt-4 flex gap-3">
              <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={3} className="min-h-[72px] flex-1 rounded-3xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none focus:border-cyan-200/50" placeholder="Pide algo a Flowly Brain..." />
              <button disabled={loading} className="rounded-3xl bg-cyan-200 px-5 font-black text-slate-950 disabled:opacity-50"><Send size={18} /></button>
            </form>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-4">
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
              <div className="flex items-center gap-2 text-cyan-100"><Lock size={17} /><p className="font-black">Separación oficial</p></div>
              <p className="mt-2 text-xs leading-6 text-cyan-50/65">Brain en cliente ayuda al negocio. Brain en OS puede analizar Studio, Kernel, Builder y cambios internos.</p>
            </div>
            <div className="mt-4 space-y-2">
              {examples.map((example) => (
                <button key={example} onClick={() => askBrain(example)} className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-left text-xs leading-5 text-white/60 hover:border-cyan-200/35 hover:text-white">
                  {example}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-4">
              <div className="flex items-center gap-2 text-emerald-100"><CheckCircle2 size={17} /><p className="font-black">Qué hace</p></div>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-emerald-50/65">
                <li>• Reúne contexto.</li>
                <li>• Busca en Flowly Knowledge.</li>
                <li>• Consulta Analyzer y Kernel.</li>
                <li>• Planifica acciones.</li>
                <li>• Responde con IA o fallback.</li>
              </ul>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
