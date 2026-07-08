import Link from "next/link";
import { Bot, Brain, Database, HeartPulse, Radio, Server, Sparkles, Workflow } from "lucide-react";
import FlowUnityWebGL from "@/components/FlowUnityWebGL";

const modules = [
  { icon: Server, title: "Gateway propio", text: "Flow Companion Gateway en Render con WebSocket persistente, sesiones y runtime." },
  { icon: Brain, title: "Conversation Engine", text: "OpenAI responde desde el Gateway usando contexto, personalidad, memoria y emoción." },
  { icon: Database, title: "Memoria", text: "Flow recuerda información útil durante la sesión y la usa para responder mejor." },
  { icon: HeartPulse, title: "Emotion Engine", text: "El estado emocional se calcula y se envía al avatar para mover cuerpo, respiración y postura." },
  { icon: Workflow, title: "Tool Engine", text: "Base preparada para conectar CRM, agenda, WhatsApp, facturación y automatizaciones." },
  { icon: Radio, title: "Realtime-ready", text: "Arquitectura lista para la siguiente fase de voz en tiempo real." },
];

export default function CompanionRuntimePage() {
  return (
    <main className="min-h-screen bg-[#05030a] px-4 py-6 text-white md:px-6 md:py-8">
      <section className="mx-auto grid max-w-7xl gap-6">
        <div className="rounded-[2rem] border border-cyan-300/20 bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,.25),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(167,139,250,.22),transparent_34%),linear-gradient(135deg,rgba(2,6,23,.98),rgba(15,23,42,.94))] p-6 shadow-2xl shadow-cyan-950/30 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.45em] text-cyan-200">Nuevo Flow Companion Engine</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight">Flow real de Unity dentro de Flowly</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
                Esta pantalla carga el build WebGL real generado desde Unity. El avatar usa el motor gráfico de Unity y sigue conectado al Gateway IA, memoria, emociones y Tool Engine.
              </p>
            </div>
            <Link href="/dashboard" className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
              Abrir en dashboard
            </Link>
          </div>
        </div>

        <FlowUnityWebGL />

        <div className="grid gap-4 md:grid-cols-3">
          {modules.map((block) => {
            const Icon = block.icon;
            return (
              <article key={block.title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200"><Icon size={20} /></span>
                <h2 className="mt-4 text-lg font-black">{block.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/60">{block.text}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
