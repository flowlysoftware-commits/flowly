"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bot,
  Check,
  CreditCard,
  Megaphone,
  MessageCircle,
  PhoneCall,
  Receipt,
  SlidersHorizontal,
  Store,
  TrendingUp,
} from "lucide-react";

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
type ModuleId = "whatsapp" | "billing" | "pos" | "crm" | "marketing" | "ai" | "analytics" | "booking_premium" | "voice";
type Module = { id: ModuleId; name: string; price: number; description: string; Icon: React.ComponentType<{ size?: number; className?: string }> };

type Plan = { id: string; name: string; price: number; description: string; highlighted: boolean; features: string[] };

const markets: MarketConfig[] = [
  { code: "VE", label: "Venezuela", flag: "🇻🇪", currency: "USD", locale: "es-VE", rate: 1.08, badge: "Planes para Venezuela · USD" },
  { code: "ES", label: "España", flag: "🇪🇸", currency: "EUR", locale: "es-ES", rate: 1, badge: "30 días gratis · Sin permanencia" },
  { code: "CO", label: "Colombia", flag: "🇨🇴", currency: "COP", locale: "es-CO", rate: 4300, badge: "Planes para Colombia · COP" },
  { code: "EC", label: "Ecuador", flag: "🇪🇨", currency: "USD", locale: "es-EC", rate: 1.08, badge: "Planes para Ecuador · USD" },
  { code: "PR", label: "Puerto Rico", flag: "🇵🇷", currency: "USD", locale: "es-PR", rate: 1.08, badge: "Planes para Puerto Rico · USD" },
];

function isCountry(value: string | null): value is Country {
  return markets.some((market) => market.code === value);
}

function getMarket(country: Country) {
  return markets.find((market) => market.code === country) ?? markets[1];
}
const fixedPlans: Plan[] = [
  { id: "basic", name: "Basic", price: 29.99, description: "Para negocios pequeños o que están empezando.", highlighted: false, features: ["Agenda y reservas online", "CRM de clientes", "Gestión de servicios", "Historial de citas", "Dashboard básico", "Recordatorios automáticos", "Acceso desde móvil y ordenador", "Soporte por email"] },
  { id: "premium", name: "Premium", price: 59.99, description: "Para negocios que quieren crecer y automatizar.", highlighted: true, features: ["Todo lo incluido en Basic", "Módulo de contabilidad", "Control de ingresos y gastos", "Informes avanzados", "WhatsApp automático", "Automatizaciones inteligentes", "Clientes inactivos", "Gestión de bonos y membresías", "Soporte prioritario"] },
];

const modules: Module[] = [
  { id: "whatsapp", name: "WhatsApp automático", price: 9.99, description: "Confirmaciones, recordatorios y avisos automáticos.", Icon: MessageCircle },
  { id: "billing", name: "Facturación", price: 9.99, description: "Facturas, presupuestos, gastos e ingresos.", Icon: Receipt },
  { id: "pos", name: "TPV", price: 14.99, description: "Cobros, caja, tickets y ventas presenciales.", Icon: Store },
  { id: "crm", name: "CRM avanzado", price: 9.99, description: "Segmentación, seguimiento y clientes inactivos.", Icon: CreditCard },
  { id: "marketing", name: "Marketing", price: 9.99, description: "Campañas, promociones y recuperación de clientes.", Icon: Megaphone },
  { id: "ai", name: "IA Assistant", price: 14.99, description: "Resúmenes, sugerencias y automatizaciones inteligentes.", Icon: Bot },
  { id: "analytics", name: "Estadísticas avanzadas", price: 4.99, description: "KPIs, evolución, previsión y rendimiento.", Icon: TrendingUp },
  { id: "booking_premium", name: "Reservas Premium", price: 4.99, description: "Página de reservas más avanzada y personalizable.", Icon: SlidersHorizontal },
  { id: "voice", name: "Flowly Voice", price: 29.99, description: "Centralita, recepción y agendado por voz con IA.", Icon: PhoneCall },
];

function formatMoney(value: number, country: Country) {
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

export default function PreciosPage() {
  const [country, setCountry] = useState<Country>("ES");
  const [selectedModules, setSelectedModules] = useState<ModuleId[]>(["whatsapp", "analytics"]);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

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
    window.history.replaceState({}, "", `/precios?country=${value}`);
  };

  const market = getMarket(country);

  const modularTotal = useMemo(() => {
    const base = 19.99;
    return base + modules.filter((item) => selectedModules.includes(item.id)).reduce((sum, item) => sum + item.price, 0);
  }, [selectedModules]);

  const toggleModule = (id: ModuleId) => {
    setSelectedModules((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const startCheckout = async (plan: string, moduleIds: ModuleId[] = []) => {
    try {
      setLoadingPlan(plan);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, modules: moduleIds, country, currency: getMarket(country).currency }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Error iniciando el pago");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#ede9fe_0%,#ffffff_30%,#f8fafc_100%)] px-6 py-8 text-neutral-950">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(124,58,237,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(124,58,237,.08)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="mx-auto max-w-7xl">
        <nav className="mb-16 flex items-center justify-between rounded-full border border-white/70 bg-white/70 px-5 py-3 shadow-sm backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3"><Image src="/logo.png" alt="Flowly IA" width={140} height={40} className="h-auto w-32 object-contain" /></Link>
          <div className="hidden items-center gap-6 text-sm text-neutral-600 md:flex">
            <Link href="/demo/login">Demos</Link>
            <Link href="/login">Área cliente</Link>
            <Link href="/contacto">Contacto</Link>
            <label className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-2 shadow-sm">
              <span className="text-lg">{market.flag}</span>
              <select
                value={country}
                onChange={(event) => changeCountry(event.target.value as Country)}
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
          <Link href="/contacto" className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm text-white">Hablar con ventas</Link>
        </nav>

        <section className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-sm text-violet-700 shadow-sm backdrop-blur">{market.badge}</div>
          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">Planes para lanzar y escalar tu negocio</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-600">Elige un pack cerrado o crea tu propio Flowly con módulos. Los precios cambian automáticamente según el mercado seleccionado.</p>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-3">
          {fixedPlans.map((plan) => (
            <div key={plan.id} className={plan.highlighted ? "rounded-[2rem] border border-violet-300 bg-neutral-950 p-7 text-white shadow-2xl shadow-violet-200" : "rounded-[2rem] border border-neutral-200 bg-white/85 p-7 shadow-sm backdrop-blur"}>
              <p className={plan.highlighted ? "text-sm font-medium text-violet-200" : "text-sm font-medium text-violet-600"}>{plan.highlighted ? "Más recomendado" : "Plan"}</p>
              <h2 className="mt-3 text-3xl font-semibold">{plan.name}</h2>
              <p className={plan.highlighted ? "mt-3 text-white/60" : "mt-3 text-neutral-600"}>{plan.description}</p>
              <div className="mt-7"><span className="text-5xl font-semibold">{formatMoney(plan.price, country)}</span><span className={plan.highlighted ? "text-white/45" : "text-neutral-500"}> / mes</span></div>
              <button onClick={() => startCheckout(plan.id)} disabled={loadingPlan === plan.id} className={plan.highlighted ? "mt-7 w-full rounded-full bg-white px-5 py-4 font-medium text-neutral-950" : "mt-7 w-full rounded-full bg-neutral-950 px-5 py-4 font-medium text-white"}>{loadingPlan === plan.id ? "Abriendo..." : "Empezar 30 días gratis"}</button>
              <div className="mt-7 space-y-3">{plan.features.map((feature) => <div key={feature} className="flex gap-3 text-sm"><Check size={18} className={plan.highlighted ? "text-violet-200" : "text-violet-600"} /><span>{feature}</span></div>)}</div>
            </div>
          ))}

          <div id="modular" className="rounded-[2rem] border border-violet-200 bg-white/90 p-7 shadow-xl shadow-violet-100 backdrop-blur">
            <p className="text-sm font-medium text-violet-600">Configurable</p>
            <h2 className="mt-3 text-3xl font-semibold">Flowly Modular</h2>
            <p className="mt-3 text-neutral-600">Empieza desde una base ligera y añade solo los módulos que necesitas.</p>
            <div className="mt-7"><span className="text-5xl font-semibold">{formatMoney(modularTotal, country)}</span><span className="text-neutral-500"> / mes</span></div>
            <div className="mt-6 rounded-3xl bg-violet-50 p-4 text-sm text-violet-900">Base incluida: dashboard, clientes, reservas, calendario y servicios.</div>
            <div className="mt-6 grid gap-3">
              {modules.map((module) => {
                const Icon = module.Icon;
                const active = selectedModules.includes(module.id);
                return <button key={module.id} onClick={() => toggleModule(module.id)} className={active ? "rounded-2xl border border-violet-300 bg-violet-50 p-4 text-left" : "rounded-2xl border border-neutral-200 bg-white p-4 text-left hover:bg-neutral-50"}>
                  <div className="flex items-start gap-3"><Icon className="mt-0.5 text-violet-600" size={21} /><div className="flex-1"><div className="flex justify-between gap-3"><p className="font-medium">{module.name}</p><p className="text-sm text-neutral-500">+{formatMoney(module.price, country)}</p></div><p className="mt-1 text-sm text-neutral-500">{module.description}</p></div></div>
                </button>;
              })}
            </div>
            <button onClick={() => startCheckout("modular", selectedModules)} disabled={loadingPlan === "modular"} className="mt-7 w-full rounded-full bg-violet-600 px-5 py-4 font-medium text-white shadow-lg shadow-violet-200">{loadingPlan === "modular" ? "Abriendo..." : "Contratar Modular"}</button>
          </div>
        </section>
      </div>
    </main>
  );
}
