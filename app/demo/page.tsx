import Link from "next/link";
import Image from "next/image";
import { ArrowRight, HeartPulse, Scissors, Sparkles, Store, Zap } from "lucide-react";

const demos = [
  { name: "Flowly Clinic", description: "CRM clínico, agenda, pacientes, tratamientos, documentación y control diario.", href: "/demo/clinic", icon: HeartPulse, accent: "from-cyan-300 to-violet-500", metrics: ["22 citas hoy", "486 pacientes", "Voice + CRM"] },
  { name: "Flowly Hair", description: "Agenda, clientes, servicios, automatizaciones y seguimiento para salones.", href: "/demo/hair", icon: Scissors, accent: "from-fuchsia-400 to-violet-500", metrics: ["38 citas", "94% ocupación", "WhatsApp"] },
  { name: "Flowly Beauty", description: "Experiencia beauty para centros de estética, uñas, cabinas, bonos y fidelización.", href: "/demo/hair", icon: Sparkles, accent: "from-pink-400 to-cyan-300", metrics: ["Bonos", "Clientes VIP", "Campañas"] },
  { name: "Flowly POS", description: "TPV interactivo para restaurantes, bares, mesas, comandas, tickets y caja.", href: "/demo/restaurant", icon: Store, accent: "from-emerald-300 to-cyan-400", metrics: ["87 tickets", "14 mesas", "Caja live"] },
];

export default function DemoSelectorPage() {
  return (
    <main className="flowly-public min-h-screen px-6 py-8">
      <span className="flowly-orb left-8 top-24 h-44 w-44 bg-cyan-400/30" />
      <span className="flowly-orb right-16 top-40 h-52 w-52 bg-fuchsia-500/25" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="flowly-nav mb-14 flex items-center justify-between rounded-full px-5 py-3">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Flowly IA" width={145} height={42} className="h-auto w-32 object-contain" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="flowly-secondary rounded-full px-4 py-2 text-sm font-semibold">Área cliente</Link>
            <Link href="/" className="flowly-chip rounded-full px-5 py-2 text-sm">Volver</Link>
          </div>
        </header>

        <section className="text-center">
          <div className="flowly-chip mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"><Zap size={16} /> Demos interactivas</div>
          <h1 className="mx-auto mt-5 max-w-5xl text-5xl font-semibold tracking-tight md:text-7xl">Elige tu <span className="flowly-gradient-text">universo Flowly</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/65">Paneles demo con datos ficticios, estética tecnológica y flujos reales para entender cómo se siente Flowly en cada tipo de negocio.</p>
        </section>

        <section className="mt-14 grid gap-6 md:grid-cols-2">
          {demos.map((demo) => {
            const Icon = demo.icon;
            return (
              <Link key={demo.name} href={demo.href} className="flowly-card flowly-demo-card group overflow-hidden rounded-[2rem] p-7 transition hover:-translate-y-1 hover:border-cyan-300/40">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${demo.accent} text-slate-950 shadow-lg`}><Icon size={28} /></div>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/60">Demo live</span>
                </div>
                <h2 className="text-3xl font-semibold">{demo.name}</h2>
                <p className="mt-3 max-w-lg text-white/58">{demo.description}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {demo.metrics.map((metric) => <span key={metric} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white/72">{metric}</span>)}
                </div>
                <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950">Entrar <ArrowRight size={16} /></div>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
