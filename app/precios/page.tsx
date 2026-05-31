"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  CreditCard,
  FileText,
  Megaphone,
  MessageCircle,
  PhoneCall,
  Receipt,
  SlidersHorizontal,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";

type ModuleId =
  | "whatsapp"
  | "billing"
  | "pos"
  | "crm"
  | "marketing"
  | "ai"
  | "analytics"
  | "booking_premium"
  | "voice";

type Module = {
  id: ModuleId;
  name: string;
  price: number;
  description: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

const fixedPlans = [
  {
    id: "basic",
    name: "Basic",
    price: "29,99€",
    description: "Para negocios pequeños o que están empezando.",
    highlighted: false,
    features: [
      "Agenda y reservas online",
      "CRM de clientes",
      "Gestión de servicios",
      "Historial de citas",
      "Dashboard básico",
      "Recordatorios automáticos",
      "Acceso desde móvil y ordenador",
      "Soporte por email",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "59,99€",
    description: "Para negocios que quieren crecer y automatizar.",
    highlighted: true,
    features: [
      "Todo lo incluido en Basic",
      "Módulo de contabilidad",
      "Control de ingresos y gastos",
      "Informes avanzados",
      "WhatsApp automático",
      "Automatizaciones inteligentes",
      "Clientes inactivos",
      "Gestión de bonos y membresías",
      "Soporte prioritario",
    ],
  },
];

const modules: Module[] = [
  {
    id: "whatsapp",
    name: "WhatsApp automático",
    price: 9.99,
    description: "Confirmaciones, recordatorios y avisos automáticos.",
    Icon: MessageCircle,
  },
  {
    id: "billing",
    name: "Facturación",
    price: 9.99,
    description: "Facturas, presupuestos, gastos e ingresos.",
    Icon: Receipt,
  },
  {
    id: "pos",
    name: "TPV",
    price: 14.99,
    description: "Cobros, caja, tickets y ventas presenciales.",
    Icon: Store,
  },
  {
    id: "crm",
    name: "CRM avanzado",
    price: 9.99,
    description: "Segmentación, seguimiento y clientes inactivos.",
    Icon: CreditCard,
  },
  {
    id: "marketing",
    name: "Marketing",
    price: 9.99,
    description: "Campañas, promociones y recuperación de clientes.",
    Icon: Megaphone,
  },
  {
    id: "ai",
    name: "IA Assistant",
    price: 14.99,
    description: "Resúmenes, sugerencias y automatizaciones inteligentes.",
    Icon: Bot,
  },
  {
    id: "analytics",
    name: "Estadísticas avanzadas",
    price: 4.99,
    description: "KPIs, evolución, previsión y rendimiento.",
    Icon: TrendingUp,
  },
  {
    id: "booking_premium",
    name: "Reservas Premium",
    price: 4.99,
    description: "Página de reservas más avanzada y personalizable.",
    Icon: SlidersHorizontal,
  },
  {
    id: "voice",
    name: "Flowly Voice",
    price: 29.99,
    description: "Centralita, recepción y agendado por voz con IA.",
    Icon: PhoneCall,
  },
];

const formatPrice = (value: number) =>
  value.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PreciosPage() {
  const [selectedModules, setSelectedModules] = useState<ModuleId[]>([
    "whatsapp",
    "analytics",
  ]);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const modularTotal = useMemo(() => {
    const base = 19.99;
    const modulesTotal = modules
      .filter((item) => selectedModules.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);

    return base + modulesTotal;
  }, [selectedModules]);

  const toggleModule = (id: ModuleId) => {
    setSelectedModules((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const startCheckout = async (plan: string, moduleIds: ModuleId[] = []) => {
    try {
      setLoadingPlan(plan);

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan, modules: moduleIds }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Error iniciando el pago");
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#ede9fe_0%,#ffffff_30%,#f8fafc_100%)] px-6 py-8 text-neutral-950">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(124,58,237,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(124,58,237,.08)_1px,transparent_1px)] bg-[size:56px_56px]" />

      <div className="mx-auto max-w-7xl">
        <nav className="mb-16 flex items-center justify-between rounded-full border border-white/70 bg-white/70 px-5 py-3 shadow-sm backdrop-blur-xl">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Flowly IA
          </Link>

          <div className="hidden items-center gap-6 text-sm text-neutral-600 md:flex">
            <Link href="/demo/login">Demos</Link>
            <Link href="/login">Área cliente</Link>
            <Link href="/contacto">Contacto</Link>
          </div>

          <Link
            href="/contacto"
            className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm text-white"
          >
            Hablar con ventas
          </Link>
        </nav>

        <section className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-sm text-violet-700 shadow-sm backdrop-blur">
            <Sparkles size={16} /> 30 días gratis · Sin permanencia
          </div>

          <h1 className="mx-auto mt-6 max-w-5xl text-5xl font-semibold tracking-tight md:text-7xl">
            Elige tu plan o construye tu Flowly por módulos
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
            Planes cerrados para empezar rápido o una configuración modular para pagar solo por las funciones que realmente necesitas.
          </p>
        </section>

        <section className="mt-14 grid gap-8 lg:grid-cols-3">
          {fixedPlans.map((plan) => (
            <div
              key={plan.id}
              className={
                plan.highlighted
                  ? "relative rounded-[2rem] border-2 border-violet-500 bg-neutral-950 p-8 text-white shadow-2xl shadow-violet-950/20"
                  : "rounded-[2rem] border border-neutral-200 bg-white/85 p-8 shadow-sm backdrop-blur"
              }
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-2 text-xs font-semibold text-white shadow-lg">
                  ⭐ MÁS POPULAR
                </div>
              )}

              <h2 className="text-2xl font-semibold">{plan.name}</h2>
              <p className={plan.highlighted ? "mt-3 text-white/60" : "mt-3 text-neutral-600"}>
                {plan.description}
              </p>

              <div className="mt-8">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className={plan.highlighted ? "ml-2 text-white/50" : "ml-2 text-neutral-500"}>
                  / mes
                </span>
              </div>

              <p className={plan.highlighted ? "mt-3 text-sm text-violet-200" : "mt-3 text-sm text-violet-600"}>
                Primer mes gratis · Tarjeta requerida
              </p>

              <ul className="mt-8 space-y-4 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <Check size={18} className={plan.highlighted ? "text-violet-300" : "text-violet-600"} />
                    <span className={plan.highlighted ? "text-white/80" : "text-neutral-700"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => startCheckout(plan.id)}
                disabled={loadingPlan === plan.id}
                className={
                  plan.highlighted
                    ? "mt-10 w-full rounded-full bg-white px-6 py-4 font-medium text-neutral-950 disabled:opacity-60"
                    : "mt-10 w-full rounded-full bg-neutral-950 px-6 py-4 font-medium text-white disabled:opacity-60"
                }
              >
                {loadingPlan === plan.id ? "Abriendo Stripe..." : "Empezar prueba gratis"}
              </button>
            </div>
          ))}

          <div className="rounded-[2rem] border border-neutral-200 bg-white/85 p-8 shadow-sm backdrop-blur">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <Sparkles />
            </div>

            <h2 className="text-2xl font-semibold">Enterprise</h2>
            <p className="mt-3 text-neutral-600">
              Para empresas que necesitan un sistema personalizado, varios centros o funcionalidades a medida.
            </p>

            <div className="mt-8">
              <span className="text-5xl font-bold">A medida</span>
            </div>

            <ul className="mt-8 space-y-4 text-sm text-neutral-700">
              <li>✓ Todo lo incluido en Premium</li>
              <li>✓ Desarrollo personalizado</li>
              <li>✓ Multiempresa y multisede</li>
              <li>✓ Integraciones externas</li>
              <li>✓ Formación del equipo</li>
              <li>✓ Soporte prioritario dedicado</li>
            </ul>

            <Link
              href="/contacto"
              className="mt-10 block w-full rounded-full border border-neutral-300 px-6 py-4 text-center font-medium"
            >
              Solicitar presupuesto
            </Link>
          </div>
        </section>

        <section id="modular" className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2.5rem] bg-neutral-950 p-8 text-white shadow-2xl shadow-violet-950/20">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-violet-200">
              <SlidersHorizontal />
            </div>
            <p className="text-sm font-medium text-violet-300">Nuevo plan</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">Flowly Modular</h2>
            <p className="mt-4 text-white/60">
              Empieza con la base de Flowly y añade solo los módulos que necesita tu negocio. No cobramos por tener varios usuarios.
            </p>

            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
              <p className="text-sm text-white/50">Total mensual</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-6xl font-bold">{formatPrice(modularTotal)}€</span>
                <span className="pb-2 text-white/50">/ mes</span>
              </div>
              <p className="mt-3 text-sm text-violet-200">Base 19,99€ + módulos seleccionados</p>
            </div>

            <button
              onClick={() => startCheckout("modular", selectedModules)}
              disabled={loadingPlan === "modular"}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 font-medium text-neutral-950 disabled:opacity-60"
            >
              {loadingPlan === "modular" ? "Abriendo Stripe..." : "Contratar modular"} <ArrowRight size={18} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {modules.map((item) => {
              const Icon = item.Icon;
              const checked = selectedModules.includes(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => toggleModule(item.id)}
                  className={
                    checked
                      ? "rounded-[1.75rem] border-2 border-violet-500 bg-white p-5 text-left shadow-xl shadow-violet-100 transition"
                      : "rounded-[1.75rem] border border-neutral-200 bg-white/80 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                      <Icon size={21} />
                    </div>
                    <div className={checked ? "rounded-full bg-violet-600 px-3 py-1 text-xs text-white" : "rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-500"}>
                      {checked ? "Activo" : "+ Añadir"}
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{item.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{item.description}</p>
                  <p className="mt-4 text-xl font-semibold">+{formatPrice(item.price)}€</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-12 rounded-[2.5rem] border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur">
          <div className="grid gap-6 md:grid-cols-3">
            <Info icon={<FileText />} title="Sin usuarios de pago" text="Puedes tener varios usuarios internos sin pagar un extra por cada persona." />
            <Info icon={<Sparkles />} title="30 días gratis" text="El cliente prueba Flowly con tarjeta guardada y cobro automático al terminar." />
            <Info icon={<Check />} title="Escalable" text="Puedes empezar básico, activar módulos y evolucionar hacia Premium o Enterprise." />
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] bg-neutral-50 p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{text}</p>
    </div>
  );
}
