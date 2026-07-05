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
  Clock3,
  CreditCard,
  FileText,
  Menu,
  MessageCircle,
  Play,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  Wand2,
  X,
  Zap,
} from "lucide-react";

type Country = "VE" | "ES" | "CO" | "EC" | "PR";

type MarketConfig = {
  code: Country;
  label: string;
  flag: string;
  currency: string;
  price: string;
  headline: string;
};

const markets: MarketConfig[] = [
  { code: "VE", label: "Venezuela", flag: "🇻🇪", currency: "USD", price: "$29.99", headline: "Flowly IA para negocios de Venezuela" },
  { code: "ES", label: "España", flag: "🇪🇸", currency: "EUR", price: "29,99 €", headline: "Flowly IA para negocios modernos" },
  { code: "CO", label: "Colombia", flag: "🇨🇴", currency: "COP", price: "$119.000", headline: "Flowly IA para negocios de Colombia" },
  { code: "EC", label: "Ecuador", flag: "🇪🇨", currency: "USD", price: "$29.99", headline: "Flowly IA para negocios de Ecuador" },
  { code: "PR", label: "Puerto Rico", flag: "🇵🇷", currency: "USD", price: "$29.99", headline: "Flowly IA para negocios de Puerto Rico" },
];

const pains = [
  "Respondes WhatsApps todo el día y aun así se pierden clientes.",
  "No sabes quién pidió información, quién está pendiente y quién ya pagó.",
  "Agenda, clientes, presupuestos y cobros están repartidos en demasiadas herramientas.",
  "El seguimiento depende de la memoria del equipo y no de un sistema.",
];

const benefits = [
  ["Más ventas sin perseguir clientes", "Flowly guarda cada oportunidad, asigna una próxima acción y te recuerda a quién responder."],
  ["Menos caos operativo", "Clientes, WhatsApp, agenda, presupuestos, facturas y tareas viven en un único panel."],
  ["Imagen más profesional", "Tu negocio trabaja con procesos claros, respuestas rápidas y documentos ordenados."],
];

const steps = [
  { icon: MessageCircle, title: "1. Entra un cliente", text: "Por anuncio, WhatsApp, llamada, formulario o carga manual." },
  { icon: BrainCircuit, title: "2. Flow lo organiza", text: "Crea la ficha, guarda contexto, estado, próxima acción y origen." },
  { icon: CalendarDays, title: "3. Tu equipo actúa", text: "Agenda, responde, cotiza, factura y hace seguimiento sin perder nada." },
];

const sectors = [
  ["Peluquerías y estética", "Reservas, preferencias, campañas y recordatorios por WhatsApp."],
  ["Clínicas y servicios", "Pacientes/clientes, citas, documentos y seguimiento desde una ficha."],
  ["Comercio y ventas", "Prospectos, presupuestos, cobros y oportunidades en un solo flujo."],
  ["Tarot y atención online", "Clientes, recargas, turnos, promociones y seguimiento comercial."],
];

const faqs = [
  ["¿Necesito saber de tecnología?", "No. Flowly está pensado para usarlo como un panel sencillo. Primero configuras lo básico y después puedes activar módulos."],
  ["¿Puedo empezar gratis?", "Sí. La idea es que puedas entrar, ver el panel y comprobar si encaja antes de pagar."],
  ["¿Sirve para mi sector?", "Flowly es modular. Se adapta a negocios de citas, servicios, atención por WhatsApp, ventas y equipos comerciales."],
  ["¿Tengo que usar todos los módulos?", "No. Puedes empezar con CRM, agenda y facturación básica, y añadir WhatsApp, automatizaciones o módulos avanzados cuando lo necesites."],
];

function isCountry(value: string | null): value is Country {
  return markets.some((market) => market.code === value);
}

function getMarket(country: Country) {
  return markets.find((market) => market.code === country) ?? markets[1];
}

function Header({ country, setMarket, pricesHref }: { country: Country; setMarket: (value: Country) => void; pricesHref: string }) {
  const market = getMarket(country);
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);

  return (
    <header className="sticky top-3 z-40 mx-auto max-w-7xl px-4">
      <nav className="flowly-nav relative flex items-center justify-between gap-3 rounded-[1.6rem] px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-2xl md:rounded-full md:px-5">
        <Link href="/" className="flex items-center gap-3" onClick={close}>
          <Image src="/logo.png" alt="Flowly IA" width={150} height={42} className="h-auto w-28 object-contain md:w-36" priority />
        </Link>

        <div className="hidden items-center gap-7 text-sm text-white/70 lg:flex">
          <a href="#problema" className="transition hover:text-white">Problema</a>
          <a href="#demo" className="transition hover:text-white">Demo</a>
          <a href="#sectores" className="transition hover:text-white">Sectores</a>
          <a href="#planes" className="transition hover:text-white">Planes</a>
          <Link href="/contacto" data-track-label="Header · Contacto" className="transition hover:text-white">Contacto</Link>
        </div>

        <div className="flex items-center gap-2">
          <label className="flowly-chip hidden items-center gap-2 rounded-full px-3 py-2 md:inline-flex">
            <span className="text-lg">{market.flag}</span>
            <select value={country} onChange={(event) => setMarket(event.target.value as Country)} className="bg-transparent text-xs font-medium outline-none" aria-label="Seleccionar país">
              {markets.map((item) => (
                <option key={item.code} value={item.code}>{item.label}</option>
              ))}
            </select>
          </label>
          <Link href="/login" data-track-label="Header · Login" className="flowly-secondary hidden rounded-full px-4 py-2.5 text-sm font-semibold sm:inline-flex">Entrar</Link>
          <Link href="/precios" data-track-label="Header · Ver planes" className="flowly-primary hidden rounded-full px-5 py-2.5 text-sm font-semibold sm:inline-flex">Empieza gratis</Link>
          <button
            type="button"
            className="flowly-secondary inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="flowly-nav absolute left-4 right-4 top-[calc(100%+.6rem)] rounded-[1.6rem] border border-white/10 p-3 shadow-2xl shadow-black/30 backdrop-blur-2xl lg:hidden">
          <div className="grid gap-2 text-sm text-white/80">
            <a onClick={close} href="#problema" className="rounded-2xl px-4 py-3 hover:bg-white/10">Problema</a>
            <a onClick={close} href="#demo" className="rounded-2xl px-4 py-3 hover:bg-white/10">Demo</a>
            <a onClick={close} href="#sectores" className="rounded-2xl px-4 py-3 hover:bg-white/10">Sectores</a>
            <Link onClick={close} href={pricesHref} data-track-label="Menú móvil · Planes" className="rounded-2xl px-4 py-3 hover:bg-white/10">Planes</Link>
            <Link onClick={close} href="/login" data-track-label="Menú móvil · Login" className="rounded-2xl px-4 py-3 hover:bg-white/10">Entrar</Link>
            <Link onClick={close} href="/precios" data-track-label="Menú móvil · Ver planes" className="flowly-primary mt-2 inline-flex justify-center rounded-full px-5 py-3 font-semibold">Empieza gratis</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero({ country, pricesHref }: { country: Country; pricesHref: string }) {
  const market = getMarket(country);

  return (
    <section data-analytics-section="hero" className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pt-24">
      <div>
        <div className="flowly-chip mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm">
          <Sparkles size={16} /> {market.headline}
        </div>

        <h1 className="max-w-5xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
          Tu empresa funcionando con orden mientras la IA hace el seguimiento.
        </h1>

        <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72">
          Flowly convierte WhatsApps, clientes, citas, presupuestos y cobros en un sistema claro para que vendas más sin vivir apagando fuegos.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link href="/precios" data-track-label="Hero · Ver planes" className="flowly-primary inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold">
            Empieza gratis <ArrowRight size={19} />
          </Link>
          <a href="#demo" data-track-label="Hero · Ver demo 2 minutos" className="flowly-secondary inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold">
            <Play size={18} /> Ver demo de 2 minutos
          </a>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/55">
          <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-200" /> Sin tarjeta</span>
          <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-200" /> Configuración en minutos</span>
          <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-200" /> Desde {market.price}/mes</span>
        </div>

        <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
          {[
            ["CRM", "Clientes y seguimiento"],
            ["WhatsApp", "Conversaciones con contexto"],
            ["Facturas", "Presupuestos y cobros"],
          ].map(([title, text]) => (
            <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.055] p-4">
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-2 text-xs leading-5 text-white/50">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-10 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="relative overflow-hidden rounded-[2.4rem] border border-cyan-300/20 bg-slate-950/80 p-5 shadow-2xl shadow-cyan-950/30">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-cyan-200">Flow trabajando ahora</p>
              <h2 className="mt-1 text-2xl font-semibold">Centro operativo</h2>
            </div>
            <span className="rounded-full bg-emerald-300/12 px-3 py-1 text-xs font-semibold text-emerald-200">online</span>
          </div>

          <div className="grid gap-3">
            {[
              ["Nuevo lead de Meta", "Guardado en CRM · requiere respuesta", "Ahora"],
              ["Cliente sin seguimiento", "Flow propone escribirle hoy", "12 min"],
              ["Presupuesto pendiente", "Listo para convertir a factura", "1 h"],
            ].map(([title, detail, time]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.065] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold">{title}</p>
                  <span className="text-xs text-white/40">{time}</span>
                </div>
                <p className="mt-2 text-sm text-white/55">{detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-3xl border border-fuchsia-300/20 bg-fuchsia-300/[0.075] p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-fuchsia-400 text-slate-950">
                <Bot size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-fuchsia-100">Flow</p>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  "He detectado 3 clientes calientes. Te preparo el seguimiento para convertirlos antes de que se enfríen."
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {[
              ["24", "leads"],
              ["7", "pendientes"],
              ["3", "urgentes"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                <p className="text-3xl font-semibold">{value}</p>
                <p className="mt-1 text-xs text-white/45">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section id="problema" data-analytics-section="problema" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[.35em] text-fuchsia-200/80">El problema real</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">No pierdes ventas por falta de clientes. Las pierdes por falta de sistema.</h2>
        <p className="mt-5 text-lg leading-8 text-white/62">
          Cuando todo depende del móvil, de Excel o de acordarse, las oportunidades se escapan.
        </p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {pains.map((pain) => (
          <div key={pain} className="rounded-[1.8rem] border border-red-300/15 bg-red-300/[0.055] p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-red-300/10 text-red-100"><X size={19} /></div>
            <p className="text-lg font-semibold leading-7">{pain}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DemoSection() {
  return (
    <section id="demo" data-analytics-section="demo" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-10 rounded-[2.5rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/20 lg:grid-cols-[.9fr_1.1fr] lg:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.35em] text-cyan-200/80">Demo express</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">Mira en 30 segundos qué cambia con Flowly.</h2>
          <p className="mt-5 text-lg leading-8 text-white/62">
            La landing debe enseñar el resultado rápido: menos caos, más seguimiento y una IA dentro del panel ayudando al negocio.
          </p>
          <Link href="/demo/login" data-track-label="Demo section · Abrir demo" className="flowly-primary mt-8 inline-flex items-center gap-2 rounded-full px-7 py-4 font-semibold">
            Abrir demo <ArrowRight size={18} />
          </Link>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-slate-950/80 p-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-300" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs text-white/40">flowly demo</span>
          </div>
          <div className="grid gap-4 pt-5 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
              <p className="mb-4 text-sm font-semibold text-red-100">Antes</p>
              {["WhatsApp suelto", "Excel", "Agenda aparte", "Facturas manuales"].map((item) => (
                <div key={item} className="mb-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/58">{item}</div>
              ))}
            </div>
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.07] p-5">
              <p className="mb-4 text-sm font-semibold text-cyan-100">Con Flowly</p>
              {["Cliente registrado", "Siguiente acción", "Cita agendada", "Cobro controlado"].map((item) => (
                <div key={item} className="mb-3 flex items-center gap-2 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.08] px-4 py-3 text-sm text-white/75">
                  <CheckCircle2 size={16} className="text-cyan-200" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section data-analytics-section="beneficios" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[.35em] text-fuchsia-200/80">Qué ganas</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">Flowly vende orden, tiempo y seguimiento. No solo software.</h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {benefits.map(([title, text]) => (
          <div key={title} className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-7">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/12 text-emerald-200"><TrendingUp size={22} /></div>
            <h3 className="text-2xl font-semibold">{title}</h3>
            <p className="mt-4 text-sm leading-7 text-white/55">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StepsSection() {
  return (
    <section data-analytics-section="como-funciona" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[.35em] text-cyan-200/80">Cómo funciona</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">Tres pasos para dejar de improvisar.</h2>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-7">
            <Icon className="mb-6 text-cyan-200" size={30} />
            <h3 className="text-2xl font-semibold">{title}</h3>
            <p className="mt-4 text-sm leading-7 text-white/55">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectorsSection() {
  return (
    <section id="sectores" data-analytics-section="sectores" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.35em] text-fuchsia-200/80">Sectores</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">Pensado para negocios que atienden, venden y hacen seguimiento.</h2>
        </div>
        <Link href="/demo/login" data-track-label="Sectores · Ver demos" className="flowly-secondary inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold">
          Ver demos <ChevronRight size={18} />
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {sectors.map(([title, text]) => (
          <div key={title} className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-7">
            <Store className="mb-6 text-cyan-200" size={28} />
            <h3 className="text-2xl font-semibold">{title}</h3>
            <p className="mt-4 text-sm leading-7 text-white/55">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PricingSection({ country, pricesHref }: { country: Country; pricesHref: string }) {
  const market = getMarket(country);

  return (
    <section id="planes" data-analytics-section="planes" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
      <div className="overflow-hidden rounded-[2.5rem] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,.13),rgba(168,85,247,.08))] p-6 shadow-2xl shadow-cyan-950/20 lg:p-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.35em] text-cyan-200/80">Empieza simple</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">Prueba gratis. Si encaja, activa tu plan.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/62">
              La barrera debe ser baja: primero entra, ve el panel, entiende el valor y luego decide.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/precios" data-track-label="Planes · Ver planes" className="flowly-primary inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-semibold">
                Empieza gratis <ArrowRight size={18} />
              </Link>
              <Link href={pricesHref} data-track-label="Planes · Ver precios" className="flowly-secondary inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-semibold">
                Ver precios completos
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
            <p className="text-sm text-white/45">Plan inicial</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-5xl font-semibold">{market.price}</span>
              <span className="pb-2 text-white/45">/mes</span>
            </div>
            <div className="mt-6 grid gap-3">
              {["CRM y clientes", "Agenda y seguimiento", "Facturación básica", "Soporte inicial"].map((item) => (
                <p key={item} className="flex items-center gap-2 text-sm text-white/70"><CheckCircle2 size={16} className="text-cyan-200" /> {item}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section data-analytics-section="faq" className="relative z-10 mx-auto max-w-5xl px-6 py-20">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[.35em] text-fuchsia-200/80">Dudas rápidas</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Preguntas antes de empezar.</h2>
      </div>

      <div className="grid gap-4">
        {faqs.map(([question, answer]) => (
          <div key={question} className="rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-6">
            <h3 className="text-lg font-semibold">{question}</h3>
            <p className="mt-3 text-sm leading-7 text-white/55">{answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section data-analytics-section="cta-final" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
      <div className="flowly-glass rounded-[2.5rem] px-8 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-300 to-fuchsia-400 text-slate-950"><Wand2 /></div>
        <h2 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">Deja de perder clientes por falta de seguimiento.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-white/60">Entra gratis, mira el panel y decide si Flowly encaja con tu negocio.</p>
        <Link href="/precios" data-track-label="CTA final · Ver planes" className="flowly-primary mt-8 inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-semibold">
          Empieza gratis <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 mx-auto max-w-7xl border-t border-white/10 px-6 py-8 text-sm text-white/55">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-5">
          <Link href="/#demo" className="hover:text-cyan-200">Demo</Link>
          <Link href="/contacto" className="hover:text-cyan-200">Contacto</Link>
          <Link href="/privacy" className="hover:text-cyan-200">Privacidad</Link>
          <Link href="/legal/condiciones" className="hover:text-cyan-200">Términos</Link>
          <Link href="/trabaja-con-nosotros" className="hover:text-cyan-200">Trabaja con nosotros</Link>
        </div>
        <div className="text-white/45">Copyright 2026 Flowly IA · Version 2.0</div>
      </div>
    </footer>
  );
}

function StickyMobileCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/88 p-3 backdrop-blur-2xl sm:hidden">
      <Link href="/precios" data-track-label="Sticky móvil · Ver planes" className="flowly-primary flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">
        Empieza gratis <ArrowRight size={16} />
      </Link>
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

  const pricesHref = useMemo(() => `/precios?country=${country}`, [country]);

  return (
    <main className="flowly-public min-h-screen overflow-hidden pb-20 sm:pb-0">
      <span className="flowly-orb left-8 top-24 h-44 w-44 bg-cyan-400/30" />
      <span className="flowly-orb right-16 top-40 h-52 w-52 bg-fuchsia-500/25" />
      <span className="flowly-orb bottom-80 left-1/3 h-64 w-64 bg-violet-500/18" />

      <Header country={country} setMarket={setMarket} pricesHref={pricesHref} />
      <Hero country={country} pricesHref={pricesHref} />
      <ProblemSection />
      <DemoSection />
      <BenefitsSection />
      <StepsSection />
      <SectorsSection />
      <PricingSection country={country} pricesHref={pricesHref} />
      <FAQSection />
      <FinalCTA />
      <Footer />
      <StickyMobileCTA />
    </main>
  );
}
