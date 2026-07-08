import Link from "next/link";
import { Bot, Brain, Database, HeartPulse, Radio, Server, Sparkles, Workflow, Zap } from "lucide-react";

const modules = [
  { icon: Server, title: "Gateway propio", text: "Flow Companion Gateway en Render con WebSocket persistente, sesiones y runtime." },
  { icon: Brain, title: "Conversation Engine", text: "OpenAI responde desde el Gateway usando contexto, personalidad, memoria y emoción." },
  { icon: Database, title: "Memoria", text: "Flow recuerda información útil durante la sesión y la usa para responder mejor." },
  { icon: HeartPulse, title: "Emotion Engine", text: "El estado emocional se calcula y se envía al avatar para mover cuerpo, respiración y postura." },
  { icon: Workflow, title: "Tool Engine", text: "Base preparada para conectar CRM, agenda, WhatsApp, facturación y automatizaciones." },
  { icon: Radio, title: "Realtime-ready", text: "La arquitectura ya está lista para la siguiente fase de voz en tiempo real." },
];

export default function CompanionRuntimePage() {
  return (
    <main className="min-h-screen bg-[#05030a] px-6 py-8 text-white">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-cyan-300/20 bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,.25),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(167,139,250,.22),transparent_34%),linear-gradient(135deg,rgba(2,6,23,.98),rgba(15,23,42,.94))] p-8 shadow-2xl shadow-cyan-950/30">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.45em] text-cyan-200">Nuevo Flow Companion Engine</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight">Flow ya no es el Companion antiguo</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
              Esta pantalla muestra la nueva base del Companion: Gateway, OpenAI, memoria, emoción, personalidad, runtime y herramientas. El antiguo avatar flotante del panel queda desactivado para que solo veas el nuevo Flow.
            </p>
          </div>
          <Link href="/dashboard" className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
            Abrir Flow en el panel
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {modules.map((block) => {
            const Icon = block.icon;
            return (
              <article key={block.title} className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200"><Icon size={20} /></span>
                <h2 className="mt-4 text-lg font-black">{block.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/60">{block.text}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <article className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6">
            <div className="flex items-center gap-3 text-cyan-100"><Sparkles size={20} /><strong>Qué verás ahora</strong></div>
            <p className="mt-3 text-sm leading-7 text-white/70">
              En el dashboard, entra en <strong>Flow Companion</strong>. Ahí verás el nuevo Flow con estado del Gateway, perfil activo, Tool Engine y métricas reales de Flowly. Esa será la puerta de entrada al Companion nuevo.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-black/25 p-6">
            <div className="flex items-center gap-3 text-white"><Zap size={20} /><strong>Siguiente fase</strong></div>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Conectar herramientas reales: CRM, agenda, facturación, WhatsApp y automatizaciones para que Flow no solo converse, sino que actúe dentro de Flowly.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
