import {
  ArrowRight,
  CalendarDays,
  Users,
  MessageCircle,
  BarChart3,
  Sparkles,
  Settings2,
} from "lucide-react";

const sectors = [
  {
    name: "Flowly Hair",
    subtitle: "Software premium para peluquerías",
    stats: ["38 citas hoy", "12.450€ este mes", "842 clientes", "94% ocupación"],
  },
  {
    name: "Flowly Beauty",
    subtitle: "Estética, uñas y tratamientos",
    stats: ["124 bonos activos", "67 reservas", "312 recurrentes", "+28% ventas"],
  },
];

const features: {
  Icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  text: string;
}[] = [
  {
    Icon: CalendarDays,
    title: "Reservas online",
    text: "Permite que tus clientes reserven servicios desde cualquier lugar.",
  },
  {
    Icon: Users,
    title: "CRM clientes",
    text: "Guarda historial, preferencias, visitas y datos importantes.",
  },
  {
    Icon: MessageCircle,
    title: "WhatsApp automático",
    text: "Envía confirmaciones, recordatorios y avisos automáticamente.",
  },
  {
    Icon: BarChart3,
    title: "Estadísticas",
    text: "Controla ingresos, citas, servicios más vendidos y rendimiento.",
  },
  {
    Icon: Sparkles,
    title: "Automatización",
    text: "Reduce tareas repetitivas y mejora la experiencia del cliente.",
  },
  {
    Icon: Settings2,
    title: "Gestión interna",
    text: "Organiza empleados, servicios, horarios y operaciones diarias.",
  },
];
function DashboardPreview() {
  return (
    <div className="relative mx-auto mt-14 w-full max-w-5xl rounded-[2rem] border border-white/70 bg-white/70 p-4 shadow-premium backdrop-blur-xl">
      <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-950 p-5 text-white">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/50">Dashboard</p>
            <h3 className="text-xl font-semibold">Flowly Hair Studio</h3>
          </div>
          <div className="rounded-full bg-white/10 px-4 py-2 text-sm">Hoy · 38 citas</div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {["Ingresos", "Clientes", "Reservas", "Ocupación"].map((item, index) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-sm text-white/45">{item}</p>
              <p className="mt-2 text-2xl font-semibold">{["12.4k€", "842", "312", "94%"][index]}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <div className="flex h-40 items-end gap-2">
              {[35, 52, 44, 80, 62, 94, 72, 88].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-xl bg-gradient-to-t from-violet-500 to-pink-300" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            {['Corte + peinado · 10:30', 'Color completo · 12:00', 'Barba premium · 13:45'].map((text) => (
              <div key={text} className="rounded-xl bg-white/10 p-3 text-sm text-white/80">{text}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#f3e8ff_0%,#ffffff_35%,#f8fafc_100%)] text-neutral-950">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="text-xl font-semibold tracking-tight">Flowly IA</div>
        <div className="hidden items-center gap-8 text-sm text-neutral-600 md:flex">
          <a href="#demos">Demos</a><a href="#features">Funciones</a><a href="#contacto">Contacto</a>
        </div>
        <a href="#contacto" className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm text-white">Solicitar demo</a>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-16 text-center">
        <div className="mx-auto mb-6 inline-flex rounded-full border border-violet-200 bg-white/70 px-4 py-2 text-sm text-neutral-600 shadow-sm backdrop-blur">
          SaaS premium para negocios modernos
        </div>
        <h1 className="mx-auto max-w-5xl text-5xl font-semibold tracking-tight md:text-7xl">
          Automatiza tu negocio con <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">Flowly IA</span>
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-neutral-600">
          Reservas, clientes, pagos, automatizaciones y dashboards premium para peluquerías, centros estéticos, spas, coaches y academias.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <a href="#demos" className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-7 py-4 text-white shadow-lg">Ver demos <ArrowRight size={18}/></a>
          <a href="#contacto" className="rounded-full border border-neutral-300 bg-white/70 px-7 py-4 text-neutral-800">Solicitar propuesta</a>
        </div>
        <DashboardPreview />
      </section>

      <section id="demos" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 max-w-2xl"><p className="text-sm font-medium text-violet-600">Demos por sector</p><h2 className="mt-3 text-4xl font-semibold tracking-tight">Paneles que parecen software real desde el primer día.</h2></div>
        <div className="grid gap-6 md:grid-cols-2">
          {sectors.map((sector) => (
            <div key={sector.name} className="rounded-[2rem] border border-neutral-200 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-premium">
              <h3 className="text-2xl font-semibold">{sector.name}</h3><p className="mt-2 text-neutral-600">{sector.subtitle}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {sector.stats.map((stat) => <div key={stat} className="rounded-2xl bg-neutral-50 p-4 text-sm font-medium text-neutral-700">{stat}</div>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 text-center"><p className="text-sm font-medium text-violet-600">Funciones</p><h2 className="mt-3 text-4xl font-semibold tracking-tight">Todo lo necesario para gestionar y automatizar.</h2></div>
        <div className="grid gap-5 md:grid-cols-3">
          {features.map(({ Icon, title, text }) => (
            <div key={String(title)} className="rounded-[1.5rem] border border-neutral-200 bg-white/75 p-6 shadow-sm backdrop-blur">
              <Icon className="mb-5 text-violet-600" size={28}/><h3 className="text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-neutral-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contacto" className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-[2.5rem] bg-neutral-950 px-8 py-16 text-center text-white shadow-premium">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">¿Quieres automatizar tu negocio?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-white/60">Solicita una demo personalizada y descubre cómo Flowly IA puede convertirse en el sistema central de tu negocio.</p>
          <a href="mailto:hola@flowlyia.com" className="mt-8 inline-flex rounded-full bg-white px-7 py-4 font-medium text-neutral-950">Solicitar demo personalizada</a>
        </div>
      </section>
    </main>
  );
}
