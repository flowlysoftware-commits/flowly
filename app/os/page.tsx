import Link from "next/link";
import { Bot, BookOpen, Code2, Cpu, GitBranch, Hammer, Layers3, Plus, ShieldCheck, Sparkles } from "lucide-react";

const tools = [
  { href: "/asistente", title: "Asistente Arquitecto", description: "Habla con el Companion técnico para crear, analizar o modificar Flowly.", icon: Bot },
  { href: "/crear", title: "Crear simple", description: "Asistente sencillo para convertir una idea en un blueprint.", icon: Plus },
  { href: "/studio/v2", title: "Flowly Studio", description: "Modo arquitecto: blueprints, piezas, relaciones, generator e inspector.", icon: Sparkles },
  { href: "/studio/generator", title: "Builder / Generator", description: "Fabricación de módulos desde blueprints y artefactos.", icon: Hammer },
  { href: "/kernel", title: "Kernel", description: "Registro interno, runtimes, event bus y estado operativo.", icon: Cpu },
  { href: "/docs", title: "Flowly Docs", description: "Documentación viva de arquitectura, ingeniería y producto.", icon: BookOpen },
  { href: "/os/migration", title: "Migration Blueprint", description: "Auditoría del panel actual, registro Kernel y plan de migración a Flowly OS.", icon: GitBranch },
];

export default function FlowlyOsPage() {
  return (
    <main className="min-h-screen bg-[#050710] px-6 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <Link href="/dashboard" className="text-sm font-bold text-cyan-200/80">← Volver al panel cliente</Link>
        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-black/30">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-purple-100">
            <ShieldCheck size={15} /> Flowly OS privado
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">Herramientas internas de desarrollo</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/62">
            Esta zona es solo para administradores y desarrollo de Flowly. Los clientes no deben ver Studio, Kernel, Builder ni el Asistente Arquitecto dentro de su panel normal.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.href} href={tool.href} className="rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-5 transition hover:-translate-y-1 hover:border-cyan-200/35 hover:bg-white/[0.08]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-200/12 text-cyan-100"><Icon size={20} /></div>
                <h2 className="mt-4 text-xl font-black">{tool.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/55">{tool.description}</p>
              </Link>
            );
          })}
        </div>

        <section className="mt-6 rounded-[1.6rem] border border-amber-300/20 bg-amber-300/10 p-5 text-sm leading-6 text-amber-50/80">
          <strong className="text-amber-100">Separación oficial:</strong> el Companion del cliente ayuda a usar el negocio. El Companion Arquitecto crea o modifica Flowly desde esta zona privada.
        </section>
      </section>
    </main>
  );
}
