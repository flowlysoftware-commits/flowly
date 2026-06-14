"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  HeartPulse,
  MessageCircle,
  PhoneCall,
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
  { code: "VE", label: "Venezuela", flag: "🇻🇪", currency: "USD", headline: "Flowly IA Venezuela · precios en USD", dashboardMoney: "$13.5k" },
  { code: "ES", label: "España", flag: "🇪🇸", currency: "EUR", headline: "SaaS premium para negocios modernos", dashboardMoney: "12.4k€" },
  { code: "CO", label: "Colombia", flag: "🇨🇴", currency: "COP", headline: "Flowly IA Colombia · precios en COP", dashboardMoney: "$54.0M" },
  { code: "EC", label: "Ecuador", flag: "🇪🇨", currency: "USD", headline: "Flowly IA Ecuador · precios en USD", dashboardMoney: "$13.5k" },
  { code: "PR", label: "Puerto Rico", flag: "🇵🇷", currency: "USD", headline: "Flowly IA Puerto Rico · precios en USD", dashboardMoney: "$13.5k" },
];

const modules = [
  { icon: CalendarDays, title: "Agenda inteligente", text: "Reservas, cambios, disponibilidad y recordatorios conectados al CRM." },
  { icon: Users, title: "CRM profesional", text: "Clientes, pacientes, historial, notas, tareas, documentos y próximas acciones." },
  { icon: MessageCircle, title: "WhatsApp manual + plantillas", text: "Mensajes listos, historial por cliente y enlaces rápidos sin perder contexto." },
  { icon: PhoneCall, title: "Voice conectado", text: "La llamada abre ficha, detecta teléfono y registra actividad automáticamente." },
  { icon: Bot, title: "Automatizaciones IA", text: "Seguimientos, alertas, recordatorios y flujos para que nada se escape." },
  { icon: BarChart3, title: "Control de negocio", text: "Ingresos, ocupación, clientes, ventas y rendimiento en paneles visuales." },
];

const sectorsBase = [
  { name: "Flowly Clinic", icon: HeartPulse, tag: "Clínicas, centros médicos y fisioterapia", href: "/demo/clinic", stats: { ES: ["486 pacientes", "22 citas hoy", "9.200€ mes"], CO: ["486 pacientes", "22 citas hoy", "$39.8M COP"], VE: ["486 pacientes", "22 citas hoy", "$10k USD"], EC: ["486 pacientes", "22 citas hoy", "$10k USD"], PR: ["486 pacientes", "22 citas hoy", "$10k USD"] } },
  { name: "Flowly Hair", icon: Scissors, tag: "Peluquerías, barberías y beauty", href: "/demo/hair", stats: { ES: ["38 citas hoy", "842 clientes", "94% ocupación"], CO: ["38 citas hoy", "842 clientes", "94% ocupación"], VE: ["38 citas hoy", "842 clientes", "94% ocupación"], EC: ["38 citas hoy", "842 clientes", "94% ocupación"], PR: ["38 citas hoy", "842 clientes", "94% ocupación"] } },
  { name: "Flowly POS", icon: Store, tag: "Restaurantes, mesas, pedidos y caja", href: "/demo/restaurant", stats: { ES: ["87 tickets", "14 mesas", "2.450€ hoy"], CO: ["87 tickets", "14 mesas", "$10.6M COP"], VE: ["87 tickets", "14 mesas", "$2.6k USD"], EC: ["87 tickets", "14 mesas", "$2.6k USD"], PR: ["87 tickets", "14 mesas", "$2.6k USD"] } },
];

const liveEvents = [
  { time: "09:12", title: "Cliente llama", detail: "Flowly Voice detecta el teléfono" },
  { time: "09:12", title: "CRM abierto", detail: "Ficha, historial y última cita visibles" },
  { time: "09:13", title: "Cita creada", detail: "Agenda sincronizada con disponibilidad" },
  { time: "09:14", title: "WhatsApp enviado", detail: "Confirmación con plantilla personalizada" },
  { time: "09:15", title: "Recordatorio programado", detail: "Alerta interna para seguimiento" },
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
      <div className="hidden items-center gap-6 text-sm text-white/68 lg:flex">
        <Link href={pricesHref} className="transition hover:text-white">Software</Link>
        <Link href="/marketing" className="transition hover:text-white">Marketing</Link>
        <a href="#producto" className="transition hover:text-white">Producto</a>
        <a href="#demos" className="transition hover:text-white">Demos</a>
        <Link href="/contacto" className="transition hover:text-white">Contacto</Link>
        <Link href="/login" className="transition hover:text-white">Área cliente</Link>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <label className="flowly-chip hidden items-center gap-2 rounded-full px-3 py-2 md:inline-flex">
          <span className="text-lg">{market.flag}</span>
          <select value={country} onChange={(event) => setMarket(event.target.value as Country)} className="bg-transparent text-xs font-medium outline-none sm:text-sm" aria-label="Seleccionar país">
            {markets.map((item) => <option key={item.code} value={item.code}>{item.label} · {item.currency}</option>)}
          </select>
        </label>
        <Link href="/login" className="flowly-secondary rounded-full px-3 py-2.5 text-xs font-semibold sm:px-4 md:hidden">Área cliente</Link>
        <Link href={pricesHref} className="flowly-primary rounded-full px-4 py-2.5 text-xs font-semibold transition sm:px-5 sm:text-sm">Solicitar demo</Link>
      </div>
    </nav>
  );
}

function ProductMockup({ country }: { country: Country }) {
  const money = getMarket(country).dashboardMoney;
  return (
    <div id="producto" className="flowly-product-stage relative mx-auto mt-14 max-w-6xl rounded-[2.2rem] p-3 sm:p-4">
      <div className="flowly-scanline" />
      <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/82 p-4 shadow-2xl shadow-cyan-950/30 sm:p-5">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm text-cyan-200/80"><span className="flowly-live-dot" /> Live Command Center</p>
            <h3 className="mt-1 text-2xl font-semibold sm:text-3xl">Flowly Neural Dashboard</h3>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-white/70">
            {["CRM activo", "WhatsApp online", "Voice conectado", "Agenda sincronizada"].map((item) => <span key={item} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2">{item}</span>)}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[["Ingresos", money, "+28%"], ["Clientes", "842", "+64"], ["Reservas", "312", "+19%"], ["Automatización", "94%", "IA"]].map(([label, value, meta]) => (
            <div key={label} className="flowly-mini-card rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-sm text-white/45">{label}</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-3xl font-semibold">{value}</p>
                <span className="rounded-full bg-emerald-300/12 px-2 py-1 text-xs text-emerald-200">{meta}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.18fr_.82fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <div className="mb-3 flex items-center justify-between text-sm text-white/55"><span>Rendimiento semanal</span><span className="text-emerald-300">+28%</span></div>
            <div className="flex h-48 items-end gap-2 sm:gap-3">
              {[34, 62, 44, 79, 58, 95, 70, 88, 76, 92].map((h, i) => <div key={i} className="flowly-chart-bar flex-1 rounded-t-2xl" style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }} />)}
            </div>
          </div>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <div className="mb-2 flex items-center justify-between"><p className="text-sm text-white/55">Actividad IA</p><BrainCircuit className="text-cyan-200" size={18} /></div>
            {liveEvents.slice(0, 4).map((event) => (
              <div key={event.time} className="rounded-xl border border-white/10 bg-white/10 p-3 text-sm">
                <div className="flex items-center justify-between gap-3"><span className="font-medium text-white/88">{event.title}</span><span className="text-cyan-200/80">{event.time}</span></div>
                <p className="mt-1 text-white/48">{event.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
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
  const sectors = sectorsBase.map((sector) => ({ ...sector, stats: sector.stats[country] }));

  return (
    <main className="flowly-public min-h-screen">
      <span className="flowly-orb left-8 top-24 h-44 w-44 bg-cyan-400/30" />
      <span className="flowly-orb right-16 top-40 h-52 w-52 bg-fuchsia-500/25" />
      <span className="flowly-orb bottom-80 left-1/3 h-64 w-64 bg-violet-500/18" />
      <Header country={country} setMarket={setMarket} pricesHref={pricesHref} />

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-16 text-center sm:pt-20">
        <div className="flowly-chip mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"><Sparkles size={16} /> {market.headline}</div>
        <h1 className="mx-auto max-w-6xl text-5xl font-semibold tracking-tight md:text-7xl lg:text-8xl">
          Software, marketing e IA para que tu negocio <span className="flowly-gradient-text">venda más y trabaje mejor</span>.
        </h1>
        <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-white/68">
          Flowly une el software que gestiona tu negocio con campañas de marketing asistidas por IA: CRM, agenda, WhatsApp, llamadas, métricas, contenido y captación conectados en una sola plataforma.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/demo/login" className="flowly-primary inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-semibold transition"><Play size={18} /> Probar demo</Link>
          <Link href={pricesHref} className="flowly-secondary inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-semibold">Software <ArrowRight size={18} /></Link>
          <Link href="/marketing" className="flowly-secondary inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-semibold">Marketing IA <Sparkles size={18} /></Link>
        </div>
        <div className="mt-8 grid gap-3 text-sm text-white/65 sm:grid-cols-3">
          {["Implementación rápida", "Diseño premium", "Escalable por módulos"].map((item) => <div key={item} className="flowly-chip rounded-2xl px-4 py-3"><CheckCircle2 className="mr-2 inline text-cyan-200" size={16} />{item}</div>)}
        </div>
        <ProductMockup country={country} />
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-4 md:grid-cols-4">
          {[["+50k", "citas gestionadas"], ["+300k", "mensajes enviados"], ["+15k", "clientes registrados"], ["24/7", "operación conectada"]].map(([value, label]) => (
            <div key={label} className="flowly-card rounded-[1.6rem] p-6 text-center">
              <p className="flowly-gradient-text text-4xl font-semibold">{value}</p>
              <p className="mt-2 text-sm text-white/55">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="flujo" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.35em] text-cyan-200/80">IA en acción</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">¿Qué pasa cuando un cliente llama?</h2>
            <p className="mt-5 text-lg leading-8 text-white/62">Flowly no solo registra datos: conecta cada interacción con el CRM, la agenda y WhatsApp para que el negocio responda con precisión.</p>
            <Link href="/demo/login" className="flowly-primary mt-8 inline-flex items-center gap-2 rounded-full px-6 py-4 font-semibold">Verlo en demo <ArrowRight size={18} /></Link>
          </div>
          <div className="flowly-glass rounded-[2rem] p-5">
            <div className="space-y-4">
              {liveEvents.map((event, index) => (
                <div key={event.time} className="flowly-timeline-card flex gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-200">{index + 1}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{event.title}</h3><span className="text-sm text-cyan-200/80">{event.time}</span></div>
                    <p className="mt-1 text-sm text-white/55">{event.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      <section id="marketing" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="flowly-glass overflow-hidden rounded-[2.5rem] p-8 md:p-10">
          <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[.35em] text-fuchsia-200/80">Software + Marketing</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">Campañas mejores porque nacen desde los datos reales del negocio.</h2>
              <p className="mt-5 text-lg leading-8 text-white/62">Flowly no solo organiza clientes: también te ayuda a crear publicaciones, campañas y seguimientos usando CRM, WhatsApp, agenda e IA para convertir más oportunidades.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/marketing" className="flowly-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold">Ver planes de marketing <ArrowRight size={18} /></Link>
                <Link href={pricesHref} className="flowly-secondary inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold">Ver software</Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {["Contenido semanal para redes", "IA para ideas y copies", "Calendario editorial", "Campañas conectadas al CRM"].map((item, index) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-300/15 text-fuchsia-200">{index + 1}</div>
                  <p className="font-semibold">{item}</p>
                  <p className="mt-2 text-sm leading-6 text-white/50">Pensado para negocios que quieren vender más sin contratar un equipo interno de marketing.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="demos" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.35em] text-fuchsia-200/80">Demos por sector</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">Paneles con estética premium y flujos reales.</h2>
          </div>
          <Link href="/demo/login" className="flowly-chip inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm">Entrar al selector <ChevronRight size={16} /></Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {sectors.map((sector) => {
            const Icon = sector.icon;
            return (
              <Link key={sector.name} href={sector.href} className="flowly-card flowly-demo-card group rounded-[2rem] p-6 transition hover:-translate-y-1 hover:border-cyan-300/40">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-500 text-slate-950"><Icon size={22} /></div>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/60">Live demo</span>
                </div>
                <h3 className="text-2xl font-semibold">{sector.name}</h3>
                <p className="mt-2 text-white/55">{sector.tag}</p>
                <div className="mt-6 grid gap-3">
                  {sector.stats.map((stat) => <div key={stat} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm font-medium text-white/78">{stat}</div>)}
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">Abrir demo <ArrowRight size={16} /></div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[.35em] text-cyan-200/80">Todo incluido</p>
          <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">Un núcleo tecnológico que une todos los módulos.</h2>
        </div>
        <div className="flowly-core mx-auto mb-8 flex max-w-2xl items-center justify-center rounded-[2rem] p-8 text-center">
          <div>
            <BrainCircuit className="mx-auto text-cyan-200" size={42} />
            <h3 className="mt-4 text-3xl font-semibold">Flowly IA Core</h3>
            <p className="mt-2 text-white/55">CRM + Agenda + WhatsApp + Voice + Pagos + Automatizaciones</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {modules.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flowly-card rounded-[1.6rem] p-6 transition hover:-translate-y-1 hover:border-cyan-300/35">
              <Icon className="mb-5 text-cyan-200" size={28} />
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/58">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="flowly-glass rounded-[2.5rem] px-8 py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-300 to-fuchsia-400 text-slate-950"><ShieldCheck /></div>
          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">Haz que tu negocio parezca más grande, más rápido y más tecnológico.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-white/60">Activa Flowly, prueba las demos y muestra una experiencia SaaS moderna a tus clientes desde hoy.</p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href={pricesHref} className="flowly-primary inline-flex rounded-full px-7 py-4 font-semibold transition">Ver planes</Link>
            <Link href="/contacto" className="flowly-secondary inline-flex rounded-full px-7 py-4 font-semibold">Solicitar propuesta</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
