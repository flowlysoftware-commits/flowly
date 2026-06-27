import Link from "next/link";
import { Bot, Brain, Sparkles, Target, Trophy, Wand2 } from "lucide-react";

const blocks = [
  { icon: Bot, title: "Avatar global", text: "Companion aparece como personaje flotante en los paneles internos de Flowly." },
  { icon: Target, title: "Objetivos y misiones", text: "Puede mostrar objetivos diarios, misiones activas y progreso de trabajo." },
  { icon: Trophy, title: "Recompensas", text: "XP, niveles, logros e insignias para motivar acciones dentro de la empresa." },
  { icon: Brain, title: "Contexto", text: "Adapta el mensaje según el módulo abierto: CRM, facturación, Studio, Docs o marketing." },
];

export default function CompanionRuntimePage() {
  return (
    <main className="min-h-screen bg-[#05030a] px-6 py-8 text-white">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.45em] text-cyan-200">Flowly Companion Runtime</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight">Companion virtual global</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
              Esta es la primera versión del Companion como capa permanente de Flowly: un avatar flotante, contextual y preparado para objetivos, misiones, recompensas, memoria y recomendaciones.
            </p>
          </div>
          <Link href="/dashboard" className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
            Volver al panel
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {blocks.map((block) => {
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

        <div className="mt-8 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6">
          <div className="flex items-center gap-3 text-cyan-100"><Wand2 size={20} /><strong>Cómo probarlo ahora</strong></div>
          <p className="mt-3 text-sm leading-7 text-white/70">
            Entra en cualquier pantalla interna del panel. El avatar aparece abajo a la derecha. Pulsa sobre él para abrir el panel del Companion. Más adelante conectaremos este runtime con Supabase, IA real, memoria por organización y acciones automáticas.
          </p>
        </div>
      </section>
    </main>
  );
}
