"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bot, CalendarDays, Check, Megaphone, PenTool, Rocket, Sparkles, Target, TrendingUp } from "lucide-react";


type Country = "VE" | "ES" | "CO" | "EC" | "PR";
type Currency = "EUR" | "COP" | "USD";

type MarketConfig = {
  code: Country;
  label: string;
  flag: string;
  currency: Currency;
  locale: string;
  rate: number;
  badge: string;
};

const markets: MarketConfig[] = [
  { code: "VE", label: "Venezuela", flag: "🇻🇪", currency: "USD", locale: "es-VE", rate: 1.08, badge: "Marketing para Venezuela · USD" },
  { code: "ES", label: "España", flag: "🇪🇸", currency: "EUR", locale: "es-ES", rate: 1, badge: "Marketing para España · EUR" },
  { code: "CO", label: "Colombia", flag: "🇨🇴", currency: "COP", locale: "es-CO", rate: 4300, badge: "Marketing para Colombia · COP" },
  { code: "EC", label: "Ecuador", flag: "🇪🇨", currency: "USD", locale: "es-EC", rate: 1.08, badge: "Marketing para Ecuador · USD" },
  { code: "PR", label: "Puerto Rico", flag: "🇵🇷", currency: "USD", locale: "es-PR", rate: 1.08, badge: "Marketing para Puerto Rico · USD" },
];

function isCountry(value: string | null): value is Country {
  return markets.some((market) => market.code === value);
}

function getMarket(country: Country) {
  return markets.find((market) => market.code === country) ?? markets[1];
}

type MarketingPlan = {
  id: string;
  name: string;
  price: number;
  posts: string;
  subtitle: string;
  highlight?: boolean;
  features: string[];
};

const strategicPlans: MarketingPlan[] = [
  {
    id: "marketing_bronze",
    name: "Plan Bronze",
    price: 19.9,
    posts: "1 publicación / semana",
    subtitle: "Para empezar a tener presencia profesional y constante.",
    features: [
      "1 publicación semanal para redes",
      "IA para mejorar ideas y textos de campaña",
      "Calendario mensual básico",
      "Optimización de llamada a la acción",
      "Revisión de tono de marca",
    ],
  },
  {
    id: "marketing_plata",
    name: "Plan Plata",
    price: 34.9,
    posts: "2 publicaciones / semana",
    subtitle: "Para negocios que quieren moverse cada semana con contenido y estrategia.",
    highlight: true,
    features: [
      "2 publicaciones semanales",
      "Ideas creativas asistidas por IA",
      "Calendario editorial mensual",
      "Copies para anuncios y redes",
      "Recomendaciones de campañas Meta Ads",
      "Análisis mensual de oportunidades",
    ],
  },
  {
    id: "marketing_oro",
    name: "Plan Oro",
    price: 44.9,
    posts: "4 publicaciones / semana",
    subtitle: "Para negocios que quieren presencia fuerte, recurrente y orientada a ventas.",
    features: [
      "4 publicaciones semanales",
      "Calendario editorial completo",
      "IA para campañas, copies y promociones",
      "Propuestas de anuncios para Meta Ads",
      "Ideas de reels, historias y carruseles",
      "Informe mensual de acciones recomendadas",
      "Prioridad en planificación de campañas",
    ],
  },
];

const publicationPlans: MarketingPlan[] = [
  { id: "posts_1_week", name: "Pack Publicaciones 1", price: 15, posts: "1 publi / semana", subtitle: "Solo contenido básico recurrente.", features: ["1 publicación semanal", "Texto + idea visual", "Entrega mensual organizada"] },
  { id: "posts_2_week", name: "Pack Publicaciones 2", price: 25, posts: "2 publis / semana", subtitle: "Más presencia sin estrategia avanzada.", features: ["2 publicaciones semanales", "Textos optimizados", "Calendario simple"] },
  { id: "posts_4_week", name: "Pack Publicaciones 4", price: 40, posts: "4 publis / semana", subtitle: "Constancia semanal intensiva.", features: ["4 publicaciones semanales", "Ideas por temporada", "Organización mensual"] },
];

function money(value: number, country: Country) {
  const market = getMarket(country);
  const converted = value * market.rate;

  if (market.currency === "EUR") {
    return `${converted.toLocaleString(market.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`;
  }

  if (market.currency === "COP") {
    return `$${Math.round(converted).toLocaleString(market.locale)} COP`;
  }

  return `$${converted.toLocaleString(market.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
}

export default function MarketingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [country, setCountry] = useState<Country>("ES");
  const allPlans = useMemo(() => [...strategicPlans, ...publicationPlans], []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryCountry = params.get("country");
    const saved = window.localStorage.getItem("flowly_country");
    if (isCountry(queryCountry)) setCountry(queryCountry);
    else if (isCountry(saved)) setCountry(saved);
  }, []);

  const changeCountry = (value: Country) => {
    setCountry(value);
    window.localStorage.setItem("flowly_country", value);
    window.history.replaceState({}, "", `/marketing?country=${value}`);
  };

  const market = getMarket(country);

  const startCheckout = async (planId: string) => {
    try {
      setLoadingPlan(planId);
      const response = await fetch("/api/marketing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, country }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "No se pudo iniciar el pago");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <main className="flowly-public min-h-screen overflow-hidden px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-14 flex items-center justify-between rounded-full flowly-glass px-5 py-3">
          <Link href="/" className="flex items-center gap-3"><Image src="/logo.png" alt="Flowly IA" width={140} height={40} className="h-auto w-32 object-contain" /></Link>
          <div className="hidden items-center gap-6 text-sm text-white/65 md:flex">
            <Link href={`/precios?country=${country}`} className="hover:text-white">Software</Link>
            <Link href={`/marketing?country=${country}`} className="text-cyan-200">Marketing</Link>
            <Link href="/contacto" className="hover:text-white">Contacto</Link>
            <Link href="/login" className="hover:text-white">Área cliente</Link>
          </div>
          <div className="flex items-center gap-2">
            <label className="flowly-chip hidden items-center gap-2 rounded-full px-3 py-2 md:inline-flex">
              <span className="text-lg">{market.flag}</span>
              <select value={country} onChange={(event) => changeCountry(event.target.value as Country)} className="bg-transparent text-xs font-medium outline-none sm:text-sm" aria-label="Seleccionar país">
                {markets.map((item) => <option key={item.code} value={item.code}>{item.label} · {item.currency}</option>)}
              </select>
            </label>
            <Link href={`/precios?country=${country}`} className="flowly-secondary rounded-full px-5 py-2.5 text-sm font-semibold">Ver software</Link>
          </div>
        </nav>

        <section className="grid gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div>
            <div className="flowly-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"><Sparkles size={16} /> {market.badge}</div>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight md:text-7xl">Campañas más inteligentes porque nacen desde <span className="flowly-gradient-text">Flowly IA</span>.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">El software organiza clientes, citas, WhatsApp y datos. El servicio de marketing convierte esa información en publicaciones, ideas, campañas y seguimiento para vender más.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Contenido constante", "IA aplicada", "Datos del negocio"].map((item) => <div key={item} className="flowly-card rounded-2xl p-4 text-sm text-white/75"><Check className="mb-2 text-cyan-200" size={18} />{item}</div>)}
            </div>
          </div>
          <div className="flowly-glass rounded-[2.2rem] p-6">
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
              <Megaphone className="text-cyan-200" size={34} />
              <h2 className="mt-4 text-2xl font-semibold">Sistema Flowly Marketing</h2>
              <p className="mt-2 text-white/60">Planificación, publicaciones, IA, campañas y seguimiento desde un mismo flujo comercial.</p>
            </div>
            <div className="mt-4 grid gap-3">
              {["CRM detecta oportunidades", "IA propone campañas", "Contenido mensual", "WhatsApp y leads conectados"].map((step, i) => <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm"><span className="mr-3 text-cyan-200">0{i + 1}</span>{step}</div>)}
            </div>
          </div>
        </section>

        <section className="mt-18 pt-16">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[.35em] text-cyan-200/80">Planes principales</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Marketing con estrategia, IA y constancia.</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {strategicPlans.map((plan) => (
              <div key={plan.id} className={plan.highlight ? "flowly-glass rounded-[2rem] p-7 ring-1 ring-cyan-300/30" : "flowly-card rounded-[2rem] p-7"}>
                <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-cyan-200">{plan.posts}</p>{plan.highlight && <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-bold text-slate-950">Recomendado</span>}</div>
                <h3 className="mt-4 text-3xl font-semibold">{plan.name}</h3>
                <p className="mt-3 text-white/60">{plan.subtitle}</p>
                <div className="mt-7"><span className="text-5xl font-semibold">{money(plan.price, country)}</span><span className="text-white/50"> / mes</span></div>
                <button onClick={() => startCheckout(plan.id)} disabled={loadingPlan === plan.id} className={plan.highlight ? "mt-7 w-full rounded-full bg-white px-5 py-4 font-semibold text-slate-950" : "flowly-primary mt-7 w-full rounded-full px-5 py-4 font-semibold"}>{loadingPlan === plan.id ? "Abriendo..." : "Contratar"}</button>
                <div className="mt-7 space-y-3 text-sm text-white/78">{plan.features.map((feature) => <div key={feature} className="flex gap-3"><Check size={18} className="shrink-0 text-cyan-200" /><span>{feature}</span></div>)}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[.35em] text-fuchsia-200/80">Solo publicaciones</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Packs simples para publicar cada semana.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {publicationPlans.map((plan) => (
              <div key={plan.id} className="flowly-card rounded-[1.8rem] p-6">
                <PenTool className="text-fuchsia-200" size={26} />
                <h3 className="mt-4 text-2xl font-semibold">{plan.name}</h3>
                <p className="mt-2 text-cyan-200">{plan.posts}</p>
                <p className="mt-3 text-sm text-white/55">{plan.subtitle}</p>
                <div className="mt-6 text-4xl font-semibold">{money(plan.price, country)}<span className="text-base font-normal text-white/45"> / mes</span></div>
                <button onClick={() => startCheckout(plan.id)} disabled={loadingPlan === plan.id} className="flowly-secondary mt-6 w-full rounded-full px-5 py-3 font-semibold">{loadingPlan === plan.id ? "Abriendo..." : "Contratar pack"}</button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[2.3rem] flowly-glass p-8 text-center md:p-12">
          <Target className="mx-auto text-cyan-200" size={40} />
          <h2 className="mt-4 text-4xl font-semibold">Después del pago te pediremos todo lo necesario.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/60">Formulario de marca, redes sociales, sector, objetivos, tono, promociones y material disponible para que el equipo de Flowly pueda empezar sin llamadas innecesarias.</p>
        </section>
      </div>
    </main>
  );
}
