import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, CalendarDays, CheckCircle2, MessageCircle, Receipt, Store, Users } from "lucide-react";

const copPlans = [
  { name: "Flowly Basic", price: "$119.900 COP", text: "Reservas, clientes, servicios y panel base para negocios que empiezan." },
  { name: "Flowly Premium", price: "$239.900 COP", text: "La solución más completa con automatización, CRM, estadísticas y módulos PRO." },
  { name: "Flowly Modular", price: "Desde $79.900 COP", text: "Construye tu panel con módulos según lo que necesite tu negocio." },
  { name: "Enterprise", price: "A medida", text: "Para cadenas, equipos grandes y proyectos personalizados." },
];

const modules = [
  { name: "WhatsApp automático", price: "$39.900 COP", Icon: MessageCircle },
  { name: "Facturación PRO", price: "$39.900 COP", Icon: Receipt },
  { name: "TPV", price: "$59.900 COP", Icon: Store },
  { name: "CRM avanzado", price: "$39.900 COP", Icon: Users },
  { name: "IA Assistant", price: "$59.900 COP", Icon: Bot },
  { name: "Reservas Premium", price: "$19.900 COP", Icon: CalendarDays },
];

export default function ColombiaPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#5b21b6_0%,#0b1020_34%,#020617_100%)] px-6 py-8 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3"><Image src="/logo.png" alt="Flowly IA" width={150} height={42} className="h-auto w-36 object-contain" priority /></Link>
        <div className="flex gap-3"><Link href="/precios" className="rounded-full border border-white/15 px-5 py-3 text-sm text-white/70">España / EUR</Link><Link href="/contacto" className="rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950">Hablar con ventas</Link></div>
      </nav>

      <section className="mx-auto max-w-7xl py-20 text-center">
        <div className="mx-auto mb-6 inline-flex rounded-full border border-violet-300/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-100">Flowly IA Colombia · Precios en pesos colombianos</div>
        <h1 className="mx-auto max-w-5xl text-5xl font-semibold tracking-tight md:text-7xl">Automatiza tu negocio en <span className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">COP</span></h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">Reservas, CRM, WhatsApp, TPV, facturación e IA para peluquerías, clínicas, centros estéticos, academias y restaurantes en Colombia.</p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 md:grid-cols-4">
        {copPlans.map((plan) => <div key={plan.name} className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"><h2 className="text-2xl font-semibold">{plan.name}</h2><p className="mt-3 text-3xl font-semibold text-violet-100">{plan.price}</p><p className="mt-4 text-sm leading-6 text-white/55">{plan.text}</p><Link href="/contacto" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950">Solicitar propuesta <ArrowRight size={16} /></Link></div>)}
      </section>

      <section className="mx-auto max-w-7xl py-20">
        <h2 className="text-3xl font-semibold">Módulos disponibles en Colombia</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {modules.map(({ name, price, Icon }) => <div key={name} className="rounded-[1.7rem] border border-white/10 bg-white/[0.07] p-5"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-100"><Icon size={22} /></div><p className="font-semibold">{name}</p><p className="mt-2 text-violet-100">{price}/mes</p><p className="mt-3 flex items-center gap-2 text-sm text-white/45"><CheckCircle2 size={15} /> Preparado para contratación modular</p></div>)}
        </div>
      </section>
    </main>
  );
}
