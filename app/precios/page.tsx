"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

const plans = [
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

export default function PreciosPage() {
  const startCheckout = async (plan: string) => {
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan }),
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Error iniciando el pago");
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f3e8ff_0%,#ffffff_35%,#f8fafc_100%)] px-6 py-8 text-neutral-950">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold">
            Flowly IA
          </Link>

          <Link
            href="/contacto"
            className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm text-white"
          >
            Contacto
          </Link>
        </nav>

        <section className="text-center">
          <p className="text-sm font-medium text-violet-600">
            Planes y precios
          </p>

          <h1 className="mx-auto mt-4 max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
            Empieza gratis durante 30 días
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
            Elige tu plan, añade tu tarjeta y empieza a probar Flowly IA. El
            cobro se realizará automáticamente al terminar el periodo de prueba.
          </p>
        </section>

        <section className="mt-14 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={
                plan.highlighted
                  ? "relative rounded-[2rem] border-2 border-violet-500 bg-neutral-950 p-8 text-white shadow-2xl"
                  : "rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm"
              }
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-2 text-xs font-semibold text-white">
                  ⭐ MÁS POPULAR
                </div>
              )}

              <h2 className="text-2xl font-semibold">{plan.name}</h2>

              <p
                className={
                  plan.highlighted
                    ? "mt-3 text-white/60"
                    : "mt-3 text-neutral-600"
                }
              >
                {plan.description}
              </p>

              <div className="mt-8">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span
                  className={
                    plan.highlighted ? "ml-2 text-white/50" : "ml-2 text-neutral-500"
                  }
                >
                  / mes
                </span>
              </div>

              <p
                className={
                  plan.highlighted
                    ? "mt-3 text-sm text-violet-200"
                    : "mt-3 text-sm text-violet-600"
                }
              >
                Primer mes gratis · Tarjeta requerida
              </p>

              <ul className="mt-8 space-y-4 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <Check
                      size={18}
                      className={
                        plan.highlighted ? "text-violet-300" : "text-violet-600"
                      }
                    />
                    <span
                      className={
                        plan.highlighted ? "text-white/80" : "text-neutral-700"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => startCheckout(plan.id)}
                className={
                  plan.highlighted
                    ? "mt-10 w-full rounded-full bg-white px-6 py-4 font-medium text-neutral-950"
                    : "mt-10 w-full rounded-full bg-neutral-950 px-6 py-4 font-medium text-white"
                }
              >
                Empezar prueba gratis
              </button>
            </div>
          ))}

          <div className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <Sparkles />
            </div>

            <h2 className="text-2xl font-semibold">Enterprise</h2>

            <p className="mt-3 text-neutral-600">
              Para empresas que necesitan un sistema personalizado, varios
              centros o funcionalidades a medida.
            </p>

            <div className="mt-8">
              <span className="text-5xl font-bold">A medida</span>
            </div>

            <ul className="mt-8 space-y-4 text-sm text-neutral-700">
              <li>✓ Todo lo incluido en Premium</li>
              <li>✓ Desarrollo personalizado</li>
              <li>✓ Multiempresa y multisede</li>
              <li>✓ Módulos a medida</li>
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
      </div>
    </main>
  );
}
