"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Users,
  MessageCircle,
  BarChart3,
  Sparkles,
  Settings2,
} from "lucide-react";

type Country = "VE" | "ES" | "CO" | "EC" | "PR";

type MarketConfig = {
  code: Country;
  label: string;
  flag: string;
  currency: string;
  headline: string;
  pricesLabel: string;
  dashboardMoney: string;
};

const markets: MarketConfig[] = [
  { code: "VE", label: "Venezuela", flag: "🇻🇪", currency: "USD", headline: "Flowly IA Venezuela · precios en USD", pricesLabel: "en dólares", dashboardMoney: "$13.5k" },
  { code: "ES", label: "España", flag: "🇪🇸", currency: "EUR", headline: "SaaS premium para negocios modernos", pricesLabel: "y módulos", dashboardMoney: "12.4k€" },
  { code: "CO", label: "Colombia", flag: "🇨🇴", currency: "COP", headline: "Flowly IA Colombia · precios en COP", pricesLabel: "en pesos colombianos", dashboardMoney: "$54.0M" },
  { code: "EC", label: "Ecuador", flag: "🇪🇨", currency: "USD", headline: "Flowly IA Ecuador · precios en USD", pricesLabel: "en dólares", dashboardMoney: "$13.5k" },
  { code: "PR", label: "Puerto Rico", flag: "🇵🇷", currency: "USD", headline: "Flowly IA Puerto Rico · precios en USD", pricesLabel: "en dólares", dashboardMoney: "$13.5k" },
];

function isCountry(value: string | null): value is Country {
  return markets.some((market) => market.code === value);
}

function getMarket(country: Country) {
  return markets.find((market) => market.code === country) ?? markets[1];
}

const sectorsBase = [
  {
    name: "Flowly Hair",
    subtitle: "Software premium para peluquerías",
    stats: {
      ES: ["38 citas hoy", "12.450€ este mes", "842 clientes", "94% ocupación"],
      CO: ["38 citas hoy", "$54.000.000 COP mes", "842 clientes", "94% ocupación"],
      VE: ["38 citas hoy", "$13.500 USD mes", "842 clientes", "94% ocupación"],
      EC: ["38 citas hoy", "$13.500 USD mes", "842 clientes", "94% ocupación"],
      PR: ["38 citas hoy", "$13.500 USD mes", "842 clientes", "94% ocupación"],
    },
  },
  {
    name: "Flowly Beauty",
    subtitle: "Estética, uñas y tratamientos",
    stats: {
      ES: ["124 bonos activos", "67 reservas", "312 recurrentes", "+28% ventas"],
      CO: ["124 bonos activos", "67 reservas", "312 recurrentes", "+28% ventas"],
      VE: ["124 bonos activos", "67 reservas", "312 recurrentes", "+28% ventas"],
      EC: ["124 bonos activos", "67 reservas", "312 recurrentes", "+28% ventas"],
      PR: ["124 bonos activos", "67 reservas", "312 recurrentes", "+28% ventas"],
    },
  },
  {
    name: "Flowly POS",
    subtitle: "TPV inteligente para bares y restaurantes",
    stats: {
      ES: ["87 tickets", "2.450€ hoy", "14 mesas", "28€ ticket medio"],
      CO: ["87 tickets", "$10.600.000 COP hoy", "14 mesas", "$121.000 ticket medio"],
      VE: ["87 tickets", "$2.660 USD hoy", "14 mesas", "$30 ticket medio"],
      EC: ["87 tickets", "$2.660 USD hoy", "14 mesas", "$30 ticket medio"],
      PR: ["87 tickets", "$2.660 USD hoy", "14 mesas", "$30 ticket medio"],
    },
  },
  {
    name: "Flowly Clinic",
    subtitle: "Gestión para clínicas y fisioterapia",
    stats: {
      ES: ["22 citas hoy", "486 pacientes", "9.200€ mes", "134 tratamientos"],
      CO: ["22 citas hoy", "486 pacientes", "$39.800.000 COP mes", "134 tratamientos"],
      VE: ["22 citas hoy", "486 pacientes", "$10.000 USD mes", "134 tratamientos"],
      EC: ["22 citas hoy", "486 pacientes", "$10.000 USD mes", "134 tratamientos"],
      PR: ["22 citas hoy", "486 pacientes", "$10.000 USD mes", "134 tratamientos"],
    },
  },
];

const features: {
  Icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  text: string;
}[] = [
  { Icon: CalendarDays, title: "Reservas online", text: "Permite que tus clientes reserven servicios desde cualquier lugar." },
  { Icon: Users, title: "CRM clientes", text: "Guarda historial, preferencias, visitas y datos importantes." },
  { Icon: MessageCircle, title: "WhatsApp automático", text: "Envía confirmaciones, recordatorios y avisos automáticamente." },
  { Icon: BarChart3, title: "Estadísticas", text: "Controla ingresos, citas, servicios más vendidos y rendimiento." },
  { Icon: Sparkles, title: "Automatización", text: "Reduce tareas repetitivas y mejora la experiencia del cliente." },
  { Icon: Settings2, title: "Gestión interna", text: "Organiza empleados, servicios, horarios y operaciones diarias." },
];

function DashboardPreview({ country }: { country: Country }) {
  const money = getMarket(country).dashboardMoney;
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
          {[
            ["Ingresos", money],
            ["Clientes", "842"],
            ["Reservas", "312"],
            ["Ocupación", "94%"],
          ].map(([item, value]) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-sm text-white/45">{item}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
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
            {["Corte + peinado · 10:30", "Color completo · 12:00", "Barba premium · 13:45"].map((text) => (
              <div key={text} className="rounded-xl bg-white/10 p-3 text-sm text-white/80">{text}</div>
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
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#f3e8ff_0%,#ffffff_35%,#f8fafc_100%)] text-neutral-950">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Flowly IA" width={150} height={42} className="h-auto w-36 object-contain" priority />
        </Link>

        <div className="hidden items-center gap-8 text-sm text-neutral-600 md:flex">
          <a href="#demos">Demos</a>
          <a href="#features">Funciones</a>
          <Link href={pricesHref}>Precios</Link>
          <Link href="/contacto">Contacto</Link>
          <Link href="/login">Área cliente</Link>
          <label className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/75 px-3 py-2 text-sm shadow-sm transition hover:bg-violet-50">
            <span className="text-lg">{market.flag}</span>
            <select
              value={country}
              onChange={(event) => setMarket(event.target.value as Country)}
              className="bg-transparent text-sm font-medium text-neutral-700 outline-none"
              aria-label="Seleccionar país"
            >
              {markets.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label} · {item.currency}
                </option>
              ))}
            </select>
          </label>
        </div>

        <Link href={pricesHref} className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm text-white">
          Empezar gratis
        </Link>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-16 text-center">
        <div className="mx-auto mb-6 inline-flex rounded-full border border-violet-200 bg-white/70 px-4 py-2 text-sm text-neutral-600 shadow-sm backdrop-blur">
          {market.headline}
        </div>
        <h1 className="mx-auto max-w-5xl text-5xl font-semibold tracking-tight md:text-7xl">
          Automatiza tu negocio con <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">Flowly IA</span>
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-neutral-600">
          Reservas, clientes, pagos, automatizaciones y dashboards premium para peluquerías, centros estéticos, restaurantes, clínicas, spas, coaches y academias.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/demo/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-7 py-4 text-white shadow-lg">
            Entrar en demo <ArrowRight size={18} />
          </Link>
          <Link href={pricesHref} className="rounded-full border border-neutral-300 bg-white/70 px-7 py-4 text-neutral-800">
            Ver planes {market.pricesLabel}
          </Link>
        </div>
        <DashboardPreview country={country} />
      </section>

      <section id="demos" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-medium text-violet-600">Demos por sector</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Prueba paneles reales antes de solicitar una propuesta.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {sectors.map((sector) => (
            <div key={sector.name} className="rounded-[2rem] border border-neutral-200 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-premium">
              <h3 className="text-2xl font-semibold">{sector.name}</h3>
              <p className="mt-2 text-neutral-600">{sector.subtitle}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {sector.stats.map((stat) => <div key={stat} className="rounded-2xl bg-neutral-50 p-4 text-sm font-medium text-neutral-700">{stat}</div>)}
              </div>
              <Link href="/demo/login" className="mt-6 inline-flex rounded-full bg-neutral-950 px-5 py-3 text-sm text-white">Entrar en demo</Link>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 text-center">
          <p className="text-sm font-medium text-violet-600">Funciones</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Todo lo necesario para gestionar y automatizar.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {features.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-[1.5rem] border border-neutral-200 bg-white/75 p-6 shadow-sm backdrop-blur">
              <Icon className="mb-5 text-violet-600" size={28} />
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-[2.5rem] bg-neutral-950 px-8 py-16 text-center text-white shadow-premium">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Empieza con 30 días gratis</h2>
          <p className="mx-auto mt-5 max-w-2xl text-white/60">Elige tu plan, prueba Flowly IA durante el primer mes y automatiza tu negocio desde el primer día.</p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href={pricesHref} className="inline-flex rounded-full bg-white px-7 py-4 font-medium text-neutral-950">Ver planes</Link>
            <Link href="/demo/login" className="inline-flex rounded-full border border-white/20 px-7 py-4 font-medium text-white">Probar demo</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
