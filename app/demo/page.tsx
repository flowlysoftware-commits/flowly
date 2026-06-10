import Link from "next/link";
import { ArrowRight, HeartPulse, Scissors, Sparkles, Store, Zap } from "lucide-react";

const demos = [
  { name: "Flowly Hair", description: "Panel para peluquerías, barberías y salones con agenda, clientes y automatizaciones.", href: "/demo/hair", icon: Scissors, accent: "from-fuchsia-400 to-violet-500" },
  { name: "Flowly Beauty", description: "Experiencia beauty para centros de estética, uñas, cabinas y bonos.", href: "/demo/hair", icon: Sparkles, accent: "from-pink-400 to-cyan-300" },
  { name: "Flowly POS", description: "TPV interactivo para restaurantes, bares, mesas, comandas y caja.", href: "/demo/restaurant", icon: Store, accent: "from-emerald-300 to-cyan-400" },
  { name: "Flowly Clinic", description: "Gestión para clínicas, fisios, pacientes, agenda y tratamientos.", href: "/demo/clinic", icon: HeartPulse, accent: "from-cyan-300 to-violet-500" },
];

export default function DemoSelectorPage() {
  return (
    <main className="flowly-public min-h-screen px-6 py-10">
      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="mb-12 flex items-center justify-between rounded-full flowly-glass px-5 py-3">
          <Link href="/" className="text-xl font-semibold tracking-tight">Flowly IA</Link>
          <Link href="/" className="flowly-chip rounded-full px-5 py-2 text-sm">Volver</Link>
        </header>

        <section className="text-center">
          <div className="flowly-chip mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"><Zap size={16} /> Demos interactivas</div>
          <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">Elige tu <span className="flowly-gradient-text">universo Flowly</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/65">Paneles demo con datos ficticios y una estética tecnológica para probar cómo se siente Flowly en distintos negocios.</p>
        </section>

        <section className="mt-14 grid gap-6 md:grid-cols-2">
          {demos.map((demo) => {
            const Icon = demo.icon;
            return (
              <Link key={demo.name} href={demo.href} className="flowly-card group overflow-hidden rounded-[2rem] p-7 transition hover:-translate-y-1 hover:border-cyan-300/40">
                <div className="mb-8 flex items-start justify-between">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${demo.accent} text-slate-950 shadow-lg`}><Icon size={28} /></div>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/60">Demo live</span>
                </div>
                <h2 className="text-3xl font-semibold">{demo.name}</h2>
                <p className="mt-3 max-w-lg text-white/58">{demo.description}</p>
                <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950">Entrar <ArrowRight size={16} /></div>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
