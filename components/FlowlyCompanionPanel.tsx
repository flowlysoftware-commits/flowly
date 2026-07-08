"use client";

import Link from "next/link";
import { Bot, Brain, MessageCircle, Radio, Sparkles, Workflow } from "lucide-react";

type FlowlyCompanionPanelProps = {
  business?: {
    id?: string;
    name?: string | null;
    business_type?: string | null;
    plan?: string | null;
    subscription_status?: string | null;
  } | null;
  businessAvatar?: {
    avatar_name?: string | null;
    avatar_personality?: string | null;
    avatar_style?: string | null;
  } | null;
  customersCount?: number;
  appointmentsCount?: number;
  activeModulesCount?: number;
  integrationsCount?: number;
  voiceCallsCount?: number;
  onNavigate?: (tab: string) => void;
};

export default function FlowlyCompanionPanel({
  business,
  businessAvatar,
  customersCount = 0,
  appointmentsCount = 0,
  activeModulesCount = 0,
  integrationsCount = 0,
  voiceCallsCount = 0,
  onNavigate,
}: FlowlyCompanionPanelProps) {
  const companionName = businessAvatar?.avatar_name || "Flow";
  const personality =
    businessAvatar?.avatar_personality ||
    "Empático, natural, atento y orientado a ayudarte dentro de Flowly.";

  const contextCards = [
    { label: "Clientes visibles", value: customersCount },
    { label: "Citas cargadas", value: appointmentsCount },
    { label: "Módulos activos", value: activeModulesCount },
    { label: "Integraciones", value: integrationsCount },
  ];

  return (
    <section className="grid gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-300/12 via-violet-400/10 to-black/20 p-6 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-200">Flow Companion</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white">{companionName} ya está dentro de Flowly</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
              Este panel es el centro de control web del Companion. Desde aquí Flow podrá leer contexto del negocio,
              consultar herramientas, cargar personalidad, usar memoria y preparar acciones dentro de Flowly.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-100">
            <Radio size={16} /> Runtime preparado
          </span>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {contextCards.map((card) => (
            <article key={card.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">{card.label}</p>
              <strong className="mt-2 block text-2xl text-white">{card.value}</strong>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200">
            <Brain size={20} />
          </span>
          <h2 className="mt-4 text-lg font-black text-white">Personalidad</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">{personality}</p>
        </article>

        <article className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-300/10 text-violet-200">
            <Workflow size={20} />
          </span>
          <h2 className="mt-4 text-lg font-black text-white">Herramientas</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            La primera herramienta interna es <strong>flowly.status</strong>. Después conectaremos CRM, WhatsApp,
            calendario, facturación y automatizaciones reales.
          </p>
        </article>

        <article className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-300/10 text-emerald-200">
            <MessageCircle size={20} />
          </span>
          <h2 className="mt-4 text-lg font-black text-white">Contexto actual</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Negocio: <strong>{business?.name || "Sin negocio"}</strong>. Plan: <strong>{business?.plan || "basic"}</strong>.
            Llamadas Voice registradas: <strong>{voiceCallsCount}</strong>.
          </p>
        </article>
      </div>

      <div className="rounded-[1.7rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black text-cyan-50">
              <Sparkles size={18} /> Próximo paso
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Conectar el Gateway con las APIs internas de Flowly para que Flow pueda consultar clientes,
              citas, módulos e integraciones de forma segura.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onNavigate?.("clientes")} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-neutral-950">
              Ver clientes
            </button>
            <button type="button" onClick={() => onNavigate?.("agenda")} className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white">
              Ver agenda
            </button>
            <Link href="/companion" className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
              Runtime
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-[1.7rem] border border-white/10 bg-black/25 p-5 text-sm leading-7 text-white/60">
        <div className="flex items-center gap-2 font-black text-white"><Bot size={18} /> Estado de integración</div>
        <p className="mt-2">
          Flow ya está montado visualmente dentro del panel. El avatar flotante global sigue apareciendo mediante
          <code className="mx-1 rounded bg-white/10 px-1 py-0.5">FlowlyCompanionRuntime</code>; este apartado añade
          el centro de control que faltaba para que el cliente pueda ver y gestionar Flow desde Flowly.
        </p>
      </div>
    </section>
  );
}
