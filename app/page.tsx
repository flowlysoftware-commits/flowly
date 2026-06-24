"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileText,
  HeartPulse,
  MessageCircle,
  Play,
  Scissors,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Zap,
} from "lucide-react";

type Country = "VE" | "ES" | "CO" | "EC" | "PR";

type MarketConfig = {
  code: Country;
  label: string;
  flag: string;
  currency: string;
  headline: string;
  dashboardMoney: string;
};

const markets: MarketConfig[] = [
  { code: "VE", label: "Venezuela", flag: "🇻🇪", currency: "USD", headline: "Flowly IA Venezuela · gestión comercial en USD", dashboardMoney: "$13.5k" },
  { code: "ES", label: "España", flag: "🇪🇸", currency: "EUR", headline: "SaaS premium para negocios modernos", dashboardMoney: "12.4k€" },
  { code: "CO", label: "Colombia", flag: "🇨🇴", currency: "COP", headline: "Flowly IA Colombia · operación comercial conectada", dashboardMoney: "$54.0M" },
  { code: "EC", label: "Ecuador", flag: "🇪🇨", currency: "USD", headline: "Flowly IA Ecuador · gestión comercial en USD", dashboardMoney: "$13.5k" },
  { code: "PR", label: "Puerto Rico", flag: "🇵🇷", currency: "USD", headline: "Flowly IA Puerto Rico · negocio conectado", dashboardMoney: "$13.5k" },
];

const productModules = [
  { icon: Users, title: "CRM", text: "Clientes, contactos, historial, etiquetas y seguimiento comercial en una sola ficha." },
  { icon: MessageCircle, title: "WhatsApp", text: "Conversaciones conectadas al cliente para responder, vender y hacer seguimiento." },
  { icon: CalendarDays, title: "Agenda", text: "Citas, reservas y recordatorios para organizar mejor cada día de trabajo." },
  { icon: FileText, title: "Facturación", text: "Cotizaciones, facturas sencillas, PDFs y registro de cobros desde Flowly Basic." },
  { icon: Bot, title: "Automatizaciones", text: "Mensajes, tareas y recordatorios automáticos para reducir trabajo repetitivo." },
  { icon: BrainCircuit, title: "IA", text: "Resumen de clientes, próximos pasos y asistencia para tomar mejores decisiones." },
];

const workflow = [
  { title: "Cliente escribe", text: "Llega por WhatsApp, formulario, reserva o contacto manual.", icon: MessageCircle },
  { title: "Flowly lo guarda", text: "Se crea o actualiza su ficha con historial, origen y estado.", icon: Users },
  { title: "Agenda la cita", text: "Organiza disponibilidad, servicios, recordatorios y tareas.", icon: CalendarDays },
  { title: "Cotiza y factura", text: "Convierte presupuestos en facturas y registra el cobro.", icon: FileText },
  { title: "Haz seguimiento", text: "Automatiza mensajes y próximos pasos para no perder oportunidades.", icon: Zap },
];

const sectors = [
  {
    name: "Clínicas y estética",
    icon: HeartPulse,
    href: "/demo/clinic",
    result: "Pacientes organizados, citas visibles y seguimiento desde una ficha 360.",
    tags: ["Pacientes", "Agenda", "Documentos"],
  },
  {
    name: "Peluquerías y barberías",
    icon: Scissors,
    href: "/demo/hair",
    result: "Reservas, preferencias, recordatorios y campañas por WhatsApp en un solo lugar.",
    tags: ["Reservas", "Preferencias", "WhatsApp"],
  },
  {
    name: "Comercios y servicios",
    icon: Store,
    href: "/demo/restaurant",
    result: "Clientes, presupuestos, facturas y cobros conectados al proceso comercial.",
    tags: ["Clientes", "Ventas", "Cobros"],
  },
];

const outcomes = [
  { title: "Menos herramientas abiertas", text: "Sustituye hojas, apps sueltas y conversaciones perdidas por un panel centralizado." },
  { title: "Más control comercial", text: "Cada cliente tiene historial, próxima acción, citas, documentos y facturación." },
  { title: "Seguimiento más rápido", text: "WhatsApp, tareas y automatizaciones ayudan a responder antes y vender mejor." },
];

const comparisonRows: Array<[string, string, string]> = [
  ["Clientes y CRM", "Integrado", "Separado o manual"],
  ["Agenda y reservas", "Incluido", "Otra aplicación"],
  ["WhatsApp con historial", "Conectado", "Sin contexto"],
  ["Cotizaciones y facturas", "Desde el cliente", "Herramienta aparte"],
  ["Automatizaciones e IA", "En el flujo", "No conectado"],
  ["Visión del negocio", "Unificada", "Fragmentada"],
];

function isCountry(value: string | null): value is Country {
  return markets.some((market) => market.code === value);
}

function getMarket(country: Country) {
  return markets.find((market) => market.code === country) ?? markets[1];
}

function Header({ country, setMarket, pricesHref }: { country: Country; setMarket: (value: Country) => void; pricesHref: string }) {
  const market = getMarket(country);

  return (
    <nav className="flowly-nav relative z-20 mx-auto mt-4 flex max-w-7xl items-center justify-between gap-3 rounded-full px-4 py-3 sm:px-5">
      <Link href="/" className="flex min-w-0 items-center gap-3">
        <Image src="/logo.png" alt="Flowly IA" width={150} height={42} className="h-auto w-28 object-contain drop-shadow-[0_0_24px_rgba(34,211,238,.25)] sm:w-36" priority />
      </Link>

      <div className="hidden items-center gap-7 text-sm text-white/68 lg:flex">
        <a href="#producto" className="transition hover:text-white">Producto</a>
        <a href="#sectores" className="transition hover:text-white">Sectores</a>
        <a href="#comparativa" className="transition hover:text-white">Comparativa</a>
        <Link href={pricesHref} className="transition hover:text-white">Precios</Link>
        <Link href="/contacto" className="transition hover:text-white">Contacto</Link>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <label className="flowly-chip hidden items-center gap-2 rounded-full px-3 py-2 md:inline-flex">
          <span className="text-lg">{market.flag}</span>
          <select value={country} onChange={(event) => setMarket(event.target.value as Country)} className="bg-transparent text-xs font-medium outline-none sm:text-sm" aria-label="Seleccionar país">
            {markets.map((item) => (
              <option key={item.code} value={item.code}>{item.label} · {item.currency}</option>
            ))}
          </select>
        </label>
        <Link href="/login" className="flowly-secondary rounded-full px-4 py-2.5 text-xs font-semibold sm:text-sm">Área cliente</Link>
        <Link href="/demo/login" className="flowly-primary hidden rounded-full px-5 py-2.5 text-sm font-semibold transition sm:inline-flex">Ver demo</Link>
      </div>
    </nav>
  );
}

function ProductMockup({ country }: { country: Country }) {
  const money = getMarket(country).dashboardMoney;

  return (
    <div id="producto" className="flowly-product-stage relative mx-auto mt-14 max-w-6xl rounded-[2.6rem] p-3 sm:p-4">
      <div className="flowly-scanline" />
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/88 p-4 shadow-2xl shadow-cyan-950/30 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm text-cyan-200/80"><span className="flowly-live-dot" /> Panel operativo en tiempo real</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Flowly Business Center</h3>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-white/70">
            {["CRM", "Agenda", "WhatsApp", "Facturación", "IA"].map((item) => (
              <span key={item} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2">{item}</span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[["Ingresos", money, "+28%"], ["Clientes activos", "842", "+64"], ["Reservas", "312", "+19%"], ["Seguimientos", "94%", "online"]].map(([label, value, meta]) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.055] p-5">
              <p className="text-sm text-white/45">{label}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-3xl font-semibold">{value}</p>
                <span className="rounded-full bg-emerald-300/12 px-2 py-1 text-xs text-emerald-200">{meta}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
            <div className="mb-4 flex items-center justify-between text-sm text-white/55">
              <span>Rendimiento semanal</span>
              <span className="text-emerald-300">+28%</span>
            </div>
            <div className="flex h-52 items-end gap-2 sm:gap-3">
              {[36, 68, 48, 78, 60, 94, 72, 88, 80, 96].map((h, i) => (
                <div key={i} className="flowly-chart-bar flex-1 rounded-t-2xl" style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.045] p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-white/55">Flujo conectado</p>
              <BrainCircuit className="text-cyan-200" size={18} />
            </div>
            {[
              ["WhatsApp recibido", "Cliente nuevo detectado"],
              ["Ficha CRM actualizada", "Origen, teléfono e historial listos"],
              ["Cita agendada", "Recordatorio automático preparado"],
              ["Factura enviada", "PDF y cobro registrados"],
            ].map(([title, detail]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.075] p-4 text-sm">
                <p className="font-medium text-white/88">{title}</p>
                <p className="mt-1 text-white/48">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustBar() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6">
      <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/[0.05] p-3 text-sm text-white/70 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl md:grid-cols-5">
        {["Datos aislados por empresa", "Infraestructura cloud", "WhatsApp integrado", "Soporte humano", "Actualizaciones continuas"].map((item) => (
          <div key={item} className="flex items-center gap-2 rounded-2xl bg-slate-950/45 px-4 py-3">
            <CheckCircle2 size={16} className="shrink-0 text-cyan-200" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[.35em] text-cyan-200/80">Así funciona</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">De primer mensaje a cobro, sin cambiar de herramienta.</h2>
        <p className="mt-5 text-lg leading-8 text-white/62">Flowly une el recorrido completo del negocio: captación, atención, agenda, presupuesto, factura y seguimiento.</p>
      </div>

      <div className="mt-14 grid gap-4 lg:grid-cols-5">
        {workflow.map(({ title, text, icon: Icon }, index) => (
          <div key={title} className="group relative rounded-[1.8rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/10 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.075]">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-100"><Icon size={22} /></div>
              <span className="text-sm text-white/35">0{index + 1}</span>
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-white/52">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function OutcomesSection() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.35em] text-fuchsia-200/80">Por qué Flowly</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">Más orden, menos tareas manuales y mejor seguimiento.</h2>
          <p className="mt-5 text-lg leading-8 text-white/62">El cliente no compra módulos: compra control, rapidez y una forma más profesional de trabajar cada día.</p>
        </div>
        <div className="grid gap-4">
          {outcomes.map((item) => (
            <div key={item.title} className="rounded-[1.8rem] border border-white/10 bg-white/[0.055] p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-300/12 text-emerald-200"><CheckCircle2 size={20} /></div>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/56">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModulesSection() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[.35em] text-cyan-200/80">Producto</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">Todo lo importante conectado en un mismo panel.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {productModules.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-[1.8rem] border border-white/10 bg-white/[0.055] p-6 transition hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/[0.075]">
            <Icon className="mb-6 text-cyan-200" size={28} />
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-white/55">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectorsSection() {
  return (
    <section id="sectores" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.35em] text-fuchsia-200/80">Sectores</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">Una plataforma adaptable a negocios reales.</h2>
        </div>
        <Link href="/demo/login" className="flowly-chip inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm">Ver demos <ChevronRight size={16} /></Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {sectors.map(({ name, icon: Icon, href, result, tags }) => (
          <Link key={name} href={href} className="group overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/15 transition hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/[0.075]">
            <div className="relative mb-7 h-48 overflow-hidden rounded-[1.7rem] border border-white/10 bg-slate-950/60 p-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(34,211,238,.22),transparent_34%),radial-gradient(circle_at_80%_30%,rgba(236,72,153,.16),transparent_36%)]" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-500 text-slate-950"><Icon size={23} /></div>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/60">Demo</span>
              </div>
              <div className="relative z-10 mt-8 grid gap-2">
                {tags.map((tag) => <span key={tag} className="rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2 text-xs text-white/66">{tag}</span>)}
              </div>
            </div>
            <h3 className="text-2xl font-semibold">{name}</h3>
            <p className="mt-3 text-sm leading-7 text-white/55">{result}</p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">Abrir demo <ArrowRight size={16} /></div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TrustSection() {
  const items = [
    ["Multiempresa", "Cada negocio trabaja con sus propios datos, clientes, mensajes y configuraciones."],
    ["Implementación acompañada", "Soporte para configurar módulos, procesos, agenda, WhatsApp y facturación."],
    ["Preparado para crecer", "Empieza con Basic y activa módulos cuando el negocio los necesite."],
    ["Experiencia profesional", "Un panel moderno para que tu equipo trabaje mejor y el cliente perciba más confianza."],
  ];

  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
      <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,.10),rgba(255,255,255,.035))] p-6 shadow-2xl shadow-cyan-950/20 md:p-8">
        <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <div className="flowly-chip mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"><ShieldCheck size={16} /> Confianza y control</div>
            <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">Gestiona clientes, citas, mensajes y cobros con una imagen profesional.</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/62">Flowly ayuda a que tu negocio funcione con más orden, mejor seguimiento y menos dependencia de herramientas sueltas.</p>
          </div>
          <div className="grid gap-3">
            {items.map(([title, text]) => (
              <div key={title} className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5">
                <p className="font-semibold">{title}</p>
                <p className="mt-2 text-sm leading-6 text-white/50">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonSection({ pricesHref }: { pricesHref: string }) {
  return (
    <section id="comparativa" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[.35em] text-cyan-200/80">Comparativa</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">Flowly sustituye el caos de herramientas separadas.</h2>
        <p className="mt-5 text-lg leading-8 text-white/62">Todo el contexto del cliente queda conectado: mensajes, citas, tareas, presupuestos, facturas y seguimiento.</p>
      </div>

      <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055]">
        <div className="grid grid-cols-[1.1fr_.65fr_.8fr] border-b border-white/10 bg-white/[0.06] px-5 py-4 text-sm font-semibold text-white/75">
          <span>Necesidad</span><span className="text-center">Flowly</span><span className="text-center">Sin Flowly</span>
        </div>
        {comparisonRows.map(([label, flowly, separate]) => (
          <div key={label} className="grid grid-cols-[1.1fr_.65fr_.8fr] items-center border-b border-white/10 px-5 py-4 text-sm last:border-b-0">
            <span className="font-medium text-white/82">{label}</span>
            <span className="flex justify-center"><span className="rounded-full bg-emerald-300/12 px-3 py-1 text-xs text-emerald-200">{flowly}</span></span>
            <span className="text-center text-white/45">{separate}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link href={pricesHref} className="flowly-primary inline-flex items-center gap-2 rounded-full px-7 py-4 font-semibold">Ver planes <ArrowRight size={18} /></Link>
      </div>
    </section>
  );
}

function PricingPreview({ pricesHref }: { pricesHref: string }) {
  const plans = [
    { name: "Basic", text: "Agenda, CRM esencial y facturación básica para empezar con orden desde el primer día.", badge: "Para empezar" },
    { name: "Modular", text: "Activa WhatsApp, marketing, automatizaciones, facturación PRO y módulos avanzados.", badge: "Más elegido" },
    { name: "Enterprise", text: "Solución a medida para empresas con equipos, procesos o integraciones específicas.", badge: "A medida" },
  ];

  return (
    <section id="precios" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.35em] text-fuchsia-200/80">Planes</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">Empieza simple. Crece por módulos.</h2>
        </div>
        <Link href={pricesHref} className="flowly-secondary inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold">Ver precios completos <ArrowRight size={18} /></Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <div key={plan.name} className={`rounded-[2rem] border p-6 shadow-2xl shadow-black/15 ${index === 1 ? "border-cyan-300/35 bg-cyan-300/[0.08]" : "border-white/10 bg-white/[0.055]"}`}>
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-2xl font-semibold">{plan.name}</h3>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/65">{plan.badge}</span>
            </div>
            <p className="min-h-20 text-sm leading-7 text-white/58">{plan.text}</p>
            <Link href={pricesHref} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">Ver plan <ArrowRight size={16} /></Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA({ pricesHref }: { pricesHref: string }) {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
      <div className="flowly-glass rounded-[2.5rem] px-8 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-300 to-fuchsia-400 text-slate-950"><Sparkles /></div>
        <h2 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">Organiza tu negocio y ofrece una experiencia más profesional a tus clientes.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-white/60">Prueba Flowly, revisa las demos y elige el plan que mejor encaje con tu negocio.</p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href={pricesHref} className="flowly-primary inline-flex justify-center rounded-full px-7 py-4 font-semibold transition">Ver planes</Link>
          <Link href="/contacto" className="flowly-secondary inline-flex justify-center rounded-full px-7 py-4 font-semibold">Solicitar propuesta</Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 mx-auto max-w-7xl border-t border-white/10 px-6 py-8 text-sm text-white/55">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-5">
          <Link href="/#producto" className="hover:text-cyan-200">Producto</Link>
          <Link href="/contacto" className="hover:text-cyan-200">Contacto</Link>
          <Link href="/privacy" className="hover:text-cyan-200">Política privacidad</Link>
          <Link href="/legal/condiciones" className="hover:text-cyan-200">Términos</Link>
          <Link href="/contacto" className="hover:text-cyan-200">Soporte</Link>
          <Link href="/trabaja-con-nosotros" className="hover:text-cyan-200">Trabaja con nosotros</Link>
        </div>
        <div className="text-white/45">Copyright 2026 Flowly IA · Version 2.0</div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [country, setCountry] = useState<Country>("ES");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryCountry = params.get("country");
    const saved = window.localStorage.getItem("flowly_country");
    if (isCountry(queryCountry)) setCountry(queryCountry);
    else if (isCountry(saved)) setCountry(saved);
  }, []);

  const setMarket = (value: Country) => {
    setCountry(value);
    window.localStorage.setItem("flowly_country", value);
  };

  const market = getMarket(country);
  const pricesHref = useMemo(() => `/precios?country=${country}`, [country]);

  return (
    <main className="flowly-public min-h-screen">
      <span className="flowly-orb left-8 top-24 h-44 w-44 bg-cyan-400/30" />
      <span className="flowly-orb right-16 top-40 h-52 w-52 bg-fuchsia-500/25" />
      <span className="flowly-orb bottom-80 left-1/3 h-64 w-64 bg-violet-500/18" />

      <Header country={country} setMarket={setMarket} pricesHref={pricesHref} />

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-16 text-center sm:pt-24">
        <div className="flowly-chip mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"><Sparkles size={16} /> {market.headline}</div>
        <h1 className="mx-auto max-w-6xl text-5xl font-semibold tracking-tight md:text-7xl lg:text-8xl">
          Todo tu negocio. <span className="flowly-gradient-text">Una sola plataforma.</span>
        </h1>
        <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-white/68">
          CRM, Agenda, WhatsApp, Facturación, Automatizaciones e IA conectados para captar clientes, responder mejor, organizar citas y cobrar con más control.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/demo/login" className="flowly-primary inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-semibold transition"><Play size={18} /> Ver demostración</Link>
          <Link href={pricesHref} className="flowly-secondary inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-semibold">Ver planes <ArrowRight size={18} /></Link>
        </div>
        <ProductMockup country={country} />
      </section>

      <TrustBar />
      <WorkflowSection />
      <OutcomesSection />
      <ModulesSection />
      <SectorsSection />
      <TrustSection />
      <ComparisonSection pricesHref={pricesHref} />
      <PricingPreview pricesHref={pricesHref} />
      <FinalCTA pricesHref={pricesHref} />
      <Footer />
    </main>
  );
}
