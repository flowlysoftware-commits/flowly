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
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryCountry = params.get("country");
    const saved = window.localStorage.getItem("flowly_country");
    const ref = params.get("ref") || params.get("comercial") || "";
    if (ref) setReferralCode(ref);
    if (isCountry(queryCountry)) setCountry(queryCountry);
    else if (isCountry(saved)) setCountry(saved);
  }, []);

  const changeCountry = (value: Country) => {
    setCountry(value);
    window.localStorage.setItem("flowly_country", value);
    const refParam = referralCode ? `&ref=${encodeURIComponent(referralCode)}` : "";
    window.history.replaceState({}, "", `/precios?country=${value}${refParam}`);
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
        body: JSON.stringify({ plan, modules: moduleIds, country, currency: getMarket(country).currency, referralCode }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Error iniciando el pago");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <main className="flowly-public min-h-screen overflow-hidden px-6 py-8 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10" />
      <div className="mx-auto max-w-7xl">
        <nav className="mb-16 flex items-center justify-between flowly-glass rounded-full px-5 py-3">
          <Link href="/" className="flex items-center gap-3"><Image src="/logo.png" alt="Flowly IA" width={140} height={40} className="h-auto w-32 object-contain" /></Link>
          <div className="hidden items-center gap-6 text-sm text-white/65 md:flex">
            <Link href="/demo/login">Demos</Link>
            <Link href="/login">Área cliente</Link>
            <Link href="/contacto">Contacto</Link>
            <label className="inline-flex items-center gap-2 flowly-chip rounded-full px-3 py-2">
              <span className="text-lg">{market.flag}</span>
              <select
                value={country}
                onChange={(event) => changeCountry(event.target.value as Country)}
                className="bg-transparent text-sm font-medium text-white outline-none"
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
          <Link href="/contacto" className="flowly-primary rounded-full px-5 py-2.5 text-sm font-semibold">Hablar con ventas</Link>
        </nav>

        <section className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 flowly-chip px-4 py-2 text-sm">{referralCode ? `Enlace comercial ${referralCode}` : market.badge}</div>
          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl flowly-gradient-text">Planes para lanzar y escalar tu negocio</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/68">Elige un pack cerrado o crea tu propio Flowly con módulos. Los precios cambian automáticamente según el mercado seleccionado.</p>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-3">
          {fixedPlans.map((plan) => (
            <div key={plan.id} className={plan.highlighted ? "flowly-glass rounded-[2rem] p-7 text-white" : "flowly-card rounded-[2rem] p-7"}>
              <p className={plan.highlighted ? "text-sm font-medium text-violet-200" : "text-sm font-medium text-cyan-200"}>{plan.highlighted ? "Más recomendado" : "Plan"}</p>
              <h2 className="mt-3 text-3xl font-semibold">{plan.name}</h2>
              <p className={plan.highlighted ? "mt-3 text-white/60" : "mt-3 text-white/60"}>{plan.description}</p>
              <div className="mt-7"><span className="text-5xl font-semibold">{formatMoney(plan.price, country)}</span><span className={plan.highlighted ? "text-white/45" : "text-white/50"}> / mes</span></div>
              <button onClick={() => startCheckout(plan.id)} disabled={loadingPlan === plan.id} className={plan.highlighted ? "mt-7 w-full rounded-full bg-white px-5 py-4 font-medium text-neutral-950" : "mt-7 w-full flowly-primary rounded-full px-5 py-4 font-medium"}>{loadingPlan === plan.id ? "Abriendo..." : "Empezar 30 días gratis"}</button>
              <div className="mt-7 space-y-3">{plan.features.map((feature) => <div key={feature} className="flex gap-3 text-sm"><Check size={18} className={plan.highlighted ? "text-violet-200" : "text-cyan-200"} /><span>{feature}</span></div>)}</div>
            </div>
          ))}

          <div id="modular" className="flowly-card rounded-[2rem] p-7">
            <p className="text-sm font-medium text-cyan-200">Configurable</p>
            <h2 className="mt-3 text-3xl font-semibold">Flowly Modular</h2>
            <p className="mt-3 text-white/60">Empieza desde una base ligera y añade solo los módulos que necesitas.</p>
            <div className="mt-7"><span className="text-5xl font-semibold">{formatMoney(modularTotal, country)}</span><span className="text-white/50"> / mes</span></div>
            <div className="mt-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-100">Base incluida: dashboard, clientes, reservas, calendario y servicios.</div>
            <div className="mt-6 grid gap-3">
              {modules.map((module) => {
                const Icon = module.Icon;
                const active = selectedModules.includes(module.id);
                return <button key={module.id} onClick={() => toggleModule(module.id)} className={active ? "rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4 text-left text-white" : "rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-left text-white hover:bg-white/[0.1]"}>
                  <div className="flex items-start gap-3"><Icon className="mt-0.5 text-cyan-200" size={21} /><div className="flex-1"><div className="flex justify-between gap-3"><p className="font-medium">{module.name}</p><p className="text-sm text-white/50">+{formatMoney(module.price, country)}</p></div><p className="mt-1 text-sm text-white/50">{module.description}</p></div></div>
                </button>;
              })}
            </div>
            <button onClick={() => startCheckout("modular", selectedModules)} disabled={loadingPlan === "modular"} className="mt-7 w-full flowly-primary rounded-full px-5 py-4 font-medium">{loadingPlan === "modular" ? "Abriendo..." : "Contratar Modular"}</button>
          </div>
        </section>
      </div>
    </main>
  );
}
