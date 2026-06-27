"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Bot, CheckCircle2, ChevronRight, Code2, MessageCircle, Rocket, Send, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import type { FlowlyCopilotResponse } from "@/lib/flowlyPanelCopilot";

type ChatMessage = { role: "user" | "assistant"; content: string; result?: FlowlyCopilotResponse };

const examples = [
  "El CRM no me gusta. Quiero que la ficha del cliente sea más grande y que no aparezca todo tan apretado.",
  "Necesito una IA para comerciales con objetivos diarios, recompensas y avatar.",
  "Quiero automatizar que cuando un presupuesto se apruebe se cree una factura.",
  "Revisa el módulo de facturación y dime cómo lo mejorarías.",
];

export default function AsistentePage() {
  const [input, setInput] = useState("El CRM no me gusta porque la ficha del cliente queda muy pequeña. Quiero que se vea más limpio y fácil.");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hola 👋 Soy tu IA de Flowly. Dime lo que quieres cambiar, crear o mejorar con palabras normales. Yo lo convierto en un plan técnico sin que tengas que entender la parte complicada." },
  ]);
  const [loading, setLoading] = useState(false);

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

  return (
    <main className="min-h-screen bg-[#07040d] px-5 py-6 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link href="/dashboard" className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/70 hover:bg-white/[0.08]"><ArrowLeft size={16} /> Panel</Link>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-100/70">Flowly Copilot</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight">Pide cambios hablando normal</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">Dile a Flowly qué quieres crear, cambiar o automatizar. El Copilot lo traduce en blueprint, tareas, revisión e instrucciones para Studio y Kernel.</p>
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
                <p className="text-xs text-white/50">Ejemplo: “el CRM no me gusta, quiero cambiar la ficha del cliente”.</p>
              </div>
            </div>
            <div className="flex h-[560px] flex-col gap-3 overflow-y-auto rounded-3xl border border-white/10 bg-black/20 p-4">
              {messages.map((message, index) => (
                <div key={index} className={`max-w-[86%] rounded-3xl border p-4 ${message.role === "user" ? "ml-auto border-cyan-300/25 bg-cyan-400/15" : "border-white/10 bg-white/[0.055]"}`}>
                  <p className="text-sm leading-6 text-white/80">{message.content}</p>
                  {message.result && <ResultCard result={message.result} />}
                </div>
              ))}
              {loading && <div className="w-fit rounded-3xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/60">Pensando y preparando plan...</div>}
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
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/35">Qué hace por detrás</p>
              <div className="mt-4 space-y-3 text-sm text-white/65">
                <Step icon={<Sparkles size={16} />} text="Entiende tu petición" />
                <Step icon={<Wand2 size={16} />} text="La convierte en blueprint" />
                <Step icon={<ShieldCheck size={16} />} text="Detecta riesgos" />
                <Step icon={<Code2 size={16} />} text="Prepara cambios para Studio" />
                <Step icon={<Rocket size={16} />} text="Deja listo para generar" />
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

function ResultCard({ result }: { result: FlowlyCopilotResponse }) {
  return (
    <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/60">Plan preparado</p>
          <p className="mt-1 text-lg font-black">{result.title}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/60">Riesgo {result.risk}</span>
      </div>
      <div className="mt-4 grid gap-2">
        {result.actions.map((action) => (
          <div key={action.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-cyan-100" /><p className="text-sm font-bold">{action.title}</p></div>
            <p className="mt-1 text-xs leading-5 text-white/50">{action.description}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <p className="text-xs font-bold text-white/60">Preguntas antes de aplicar:</p>
        <ul className="mt-2 space-y-1 text-xs text-white/50">
          {result.questions.map((question) => <li key={question}>• {question}</li>)}
        </ul>
      </div>
    </div>
  );
}
