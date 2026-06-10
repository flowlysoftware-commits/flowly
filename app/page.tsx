"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  MessageCircle,
  PhoneCall,
  Sparkles,
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
  { icon: CalendarDays, title: "Agenda viva", text: "Reservas, cambios, recordatorios y disponibilidad desde un solo lugar." },
  { icon: Users, title: "CRM inteligente", text: "Clientes, pacientes, historial, notas, tareas y seguimiento comercial." },
  { icon: MessageCircle, title: "WhatsApp conectado", text: "Plantillas, enlaces rápidos, historial y mensajes manuales o automáticos." },
  { icon: PhoneCall, title: "Voice + llamadas", text: "Recibe llamadas, detecta clientes y vincula cada conversación al CRM." },
  { icon: Bot, title: "Automatización IA", text: "Flujos para ahorrar tiempo y convertir operaciones repetitivas en procesos." },
  { icon: BarChart3, title: "Métricas premium", text: "Ingresos, ocupación, ventas, clientes y rendimiento en dashboards claros." },
];

const sectorsBase = [
  { name: "Flowly Clinic", tag: "Clínicas y centros", stats: { ES: ["486 pacientes", "22 citas hoy", "9.200€ mes"], CO: ["486 pacientes", "22 citas hoy", "$39.8M COP"], VE: ["486 pacientes", "22 citas hoy", "$10k USD"], EC: ["486 pacientes", "22 citas hoy", "$10k USD"], PR: ["486 pacientes", "22 citas hoy", "$10k USD"] } },
  { name: "Flowly Hair", tag: "Peluquerías y barberías", stats: { ES: ["38 citas hoy", "842 clientes", "94% ocupación"], CO: ["38 citas hoy", "842 clientes", "94% ocupación"], VE: ["38 citas hoy", "842 clientes", "94% ocupación"], EC: ["38 citas hoy", "842 clientes", "94% ocupación"], PR: ["38 citas hoy", "842 clientes", "94% ocupación"] } },
  { name: "Flowly POS", tag: "Restaurantes y TPV", stats: { ES: ["87 tickets", "14 mesas", "2.450€ hoy"], CO: ["87 tickets", "14 mesas", "$10.6M COP"], VE: ["87 tickets", "14 mesas", "$2.6k USD"], EC: ["87 tickets", "14 mesas", "$2.6k USD"], PR: ["87 tickets", "14 mesas", "$2.6k USD"] } },
];

function isCountry(value: string | null): value is Country {
  return markets.some((market) => market.code === value);
}

function getMarket(country: Country) {
  return markets.find((market) => market.code === country) ?? markets[1];
}

function TechDashboard({ country }: { country: Country }) {
  const money = getMarket(country).dashboardMoney;
  return (
    <div className="flowly-glass relative mx-auto mt-14 max-w-6xl rounded-[2rem] p-4">
      <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-cyan-950/30">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-cyan-200/70">Live Command Center</p>
            <h3 className="text-2xl font-semibold">Flowly Neural Dashboard</h3>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-white/70">
            {['CRM activo', 'WhatsApp online', 'Voice conectado'].map((item) => <span key={item} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2">{item}</span>)}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[["Ingresos", money], ["Clientes", "842"], ["Reservas", "312"], ["Automatización", "94%"]].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-sm text-white/45">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <div className="mb-3 flex items-center justify-between text-sm text-white/55"><span>Rendimiento semanal</span><span className="text-emerald-300">+28%</span></div>
            <div className="flex h-48 items-end gap-3">
              {[34, 62, 44, 79, 58, 95, 70, 88, 76].map((h, i) => <div key={i} className="flex-1 rounded-t-2xl bg-gradient-to-t from-violet-600 via-fuchsia-400 to-cyan-300" style={{ height: `${h}%` }} />)}
            </div>
          </div>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            {['10:30 · Nueva cita confirmada', '12:00 · WhatsApp enviado', '13:45 · Llamada vinculada al CRM', '16:15 · Recordatorio pendiente'].map((text) => (
              <div key={text} className="rounded-xl border border-white/10 bg-white/10 p-3 text-sm text-white/75">{text}</div>
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
      <span className="flowly-orb left-10 top-24 h-44 w-44 bg-cyan-400/30" />
      <span className="flowly-orb right-16 top-40 h-52 w-52 bg-fuchsia-500/25" />
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Flowly IA" width={150} height={42} className="h-auto w-36 object-contain drop-shadow-[0_0_24px_rgba(34,211,238,.25)]" priority />
        </Link>
        <div className="hidden items-center gap-6 text-sm text-white/68 md:flex">
          <a href="#demos" className="transition hover:text-white">Demos</a>
          <a href="#features" className="transition hover:text-white">Funciones</a>
          <Link href={pricesHref} className="transition hover:text-white">Precios</Link>
          <Link href="/contacto" className="transition hover:text-white">Contacto</Link>
          <Link href="/login" className="transition hover:text-white">Área cliente</Link>
          <label className="flowly-chip inline-flex items-center gap-2 rounded-full px-3 py-2">
            <span className="text-lg">{market.flag}</span>
            <select value={country} onChange={(event) => setMarket(event.target.value as Country)} className="bg-transparent text-sm font-medium outline-none">
              {markets.map((item) => <option key={item.code} value={item.code}>{item.label} · {item.currency}</option>)}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="flowly-secondary inline-flex rounded-full px-4 py-2.5 text-xs font-semibold md:hidden sm:text-sm"
          >
            Área cliente
          </Link>
          <Link href={pricesHref} className="flowly-primary rounded-full px-4 py-2.5 text-xs font-semibold transition sm:px-5 sm:text-sm">Empezar</Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-14 text-center">
        <div className="flowly-chip mx-auto mb-6 inline-flex rounded-full px-4 py-2 text-sm">{market.headline}</div>
        <h1 className="mx-auto max-w-6xl text-5xl font-semibold tracking-tight md:text-7xl lg:text-8xl">
          El sistema operativo <span className="flowly-gradient-text">más inteligente</span> para negocios modernos
        </h1>
        <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-white/68">
          CRM, agenda, WhatsApp, Voice, pagos, automatizaciones y métricas en una experiencia SaaS visual, rápida y preparada para vender.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/demo/login" className="flowly-primary inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-semibold transition">Probar demo <ArrowRight size={18} /></Link>
          <Link href={pricesHref} className="flowly-secondary rounded-full px-7 py-4 font-semibold">Ver planes</Link>
        </div>
        <TechDashboard country={country} />
      </section>

      <section id="demos" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.35em] text-cyan-200/80">Demos por sector</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">Paneles con estética premium y flujos reales.</h2>
          </div>
          <Link href="/demo/login" className="flowly-chip rounded-full px-5 py-3 text-sm">Entrar al selector</Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {sectors.map((sector) => (
            <Link key={sector.name} href="/demo/login" className="flowly-card group rounded-[2rem] p-6 transition hover:-translate-y-1 hover:border-cyan-300/40">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-500 text-slate-950"><Zap size={22} /></div>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/60">Live demo</span>
              </div>
              <h3 className="text-2xl font-semibold">{sector.name}</h3>
              <p className="mt-2 text-white/55">{sector.tag}</p>
              <div className="mt-6 grid gap-3">
                {sector.stats.map((stat) => <div key={stat} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm font-medium text-white/78">{stat}</div>)}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[.35em] text-fuchsia-200/80">Funciones</p>
          <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">Tecnología modular para operar, captar y fidelizar.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {modules.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flowly-card rounded-[1.6rem] p-6">
              <Icon className="mb-5 text-cyan-200" size={28} />
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/58">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="flowly-glass rounded-[2.5rem] px-8 py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-300 to-fuchsia-400 text-slate-950"><CheckCircle2 /></div>
          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">Flowly se siente como producto grande desde el primer clic.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-white/60">Activa tu panel, prueba demos y enseña una experiencia moderna a tus clientes desde hoy.</p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href={pricesHref} className="flowly-primary inline-flex rounded-full px-7 py-4 font-semibold transition">Ver planes</Link>
            <Link href="/contacto" className="flowly-secondary inline-flex rounded-full px-7 py-4 font-semibold">Solicitar propuesta</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
