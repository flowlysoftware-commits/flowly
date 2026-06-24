"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileText,
  HeartPulse,
  MessageCircle,
  Play,
  Scissors,
  Send,
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
  { code: "VE", label: "Venezuela", flag: "🇻🇪", currency: "USD", headline: "Todo tu negocio en una sola plataforma", dashboardMoney: "$13.5k" },
  { code: "ES", label: "España", flag: "🇪🇸", currency: "EUR", headline: "Gestiona clientes, citas y facturas desde un único lugar", dashboardMoney: "12.4k€" },
  { code: "CO", label: "Colombia", flag: "🇨🇴", currency: "COP", headline: "Más control. Menos herramientas.", dashboardMoney: "$54.0M" },
  { code: "EC", label: "Ecuador", flag: "🇪🇨", currency: "USD", headline: "CRM, Agenda, WhatsApp y Facturación conectados", dashboardMoney: "$13.5k" },
  { code: "PR", label: "Puerto Rico", flag: "🇵🇷", currency: "USD", headline: "Organiza y haz crecer tu negocio", dashboardMoney: "$13.5k" },
];

const productPillars = [
  {
    icon: Users,
    title: "CRM",
    text: "Clientes, contactos, historial, etiquetas, tareas y oportunidades sin hojas sueltas.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    text: "Conversaciones conectadas al cliente, plantillas, seguimiento y contexto comercial.",
  },
  {
    icon: CalendarDays,
    title: "Agenda",
    text: "Reservas, citas, disponibilidad y recordatorios desde el mismo panel.",
  },
  {
    icon: FileText,
    title: "Facturación",
    text: "Cotizaciones, facturas sencillas, PDF, cobros y estado de pago en Flowly Basic.",
  },
  {
    icon: Bot,
    title: "Automatizaciones",
    text: "Recordatorios, cambios de estado y acciones repetitivas ejecutadas por reglas.",
  },
  {
    icon: BrainCircuit,
    title: "IA",
    text: "Resumen operativo, próximos pasos, asistencia comercial y flujos inteligentes.",
  },
];

const sectorsBase = [
  {
    name: "Flowly Clinic",
    icon: HeartPulse,
    tag: "Clínicas, estética, fisioterapia y centros médicos",
    href: "/demo/clinic",
    highlights: ["Pacientes 360", "Citas y recordatorios", "Documentos y seguimiento"],
  },
  {
    name: "Flowly Hair",
    icon: Scissors,
    tag: "Peluquerías, barberías, beauty y estética",
    href: "/demo/hair",
    highlights: ["Reservas rápidas", "Preferencias de cliente", "Campañas por WhatsApp"],
  },
  {
    name: "Flowly POS",
    icon: Store,
    tag: "Restaurantes, comercios, talleres y servicios",
    href: "/demo/restaurant",
    highlights: ["Clientes y ventas", "Cotización a factura", "Cobros y métricas"],
  },
];

const workflow = [
  { title: "Entra un cliente", text: "WhatsApp, llamada, formulario, reserva o contacto manual.", icon: MessageCircle },
  { title: "Flowly lo organiza", text: "Se crea o actualiza su ficha con historial, estado y próxima acción.", icon: Users },
  { title: "Agenda el servicio", text: "Cita, disponibilidad, recordatorio y seguimiento sin salir del panel.", icon: CalendarDays },
  { title: "Cotiza y factura", text: "Presupuesto, factura PDF, registro de cobro y estado de pago.", icon: FileText },
  { title: "Automatiza el seguimiento", text: "Mensajes, recordatorios, tareas e IA para que nada se pierda.", icon: Zap },
];

const comparisonRows: Array<[string, boolean, boolean]> = [
  ["CRM + clientes", true, true],
  ["Agenda y reservas", true, false],
  ["WhatsApp conectado al historial", true, false],
  ["Cotizaciones y facturas básicas", true, false],
  ["Automatizaciones e IA", true, false],
  ["Todo en un mismo flujo", true, false],
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

      <div className="hidden items-center gap-7 text-sm text-white/68 lg:flex">
        <a href="#producto" className="transition hover:text-white">Producto</a>
        <a href="#sectores" className="transition hover:text-white">Sectores</a>
        <a href="#comparativa" className="transition hover:text-white">Comparativa</a>
        <Link href={pricesHref} className="transition hover:text-white">Precios</Link>
        <Link href="/contacto" className="transition hover:text-white">Contacto</Link>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <label className="flowly-chip hidden items-center gap-2 rounded-full px-3 py-2 md:inline-flex">
          <span className="text-lg">{market.flag}</span>
          <select value={country} onChange={(event) => setMarket(event.target.value as Country)} className="bg-transparent text-xs font-medium outline-none sm:text-sm" aria-label="Seleccionar país">
            {markets.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label} · {item.currency}
              </option>
            ))}
          </select>
        </label>
        <Link href="/login" className="flowly-secondary rounded-full px-4 py-2.5 text-xs font-semibold sm:text-sm">Área cliente</Link>
        <Link href="/demo/login" className="flowly-primary hidden rounded-full px-5 py-2.5 text-sm font-semibold transition sm:inline-flex">Ver demo</Link>
      </div>
    </nav>
  );
}

function ProductMockup({ country }: { country: Country }) {
  const money = getMarket(country).dashboardMoney;

  return (
    <div id="producto" className="flowly-product-stage relative mx-auto mt-14 max-w-6xl rounded-[2.4rem] p-3 sm:p-4">
      <div className="flowly-scanline" />
      <div className="rounded-[1.9rem] border border-white/10 bg-slate-950/86 p-4 shadow-2xl shadow-cyan-950/30 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm text-cyan-200/80"><span className="flowly-live-dot" /> Centro operativo en vivo</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Flowly Command Center</h3>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-white/70">
            {["CRM", "Agenda", "WhatsApp", "Facturación", "IA"].map((item) => (
              <span key={item} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2">{item}</span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[["Ingresos", money, "+28%"], ["Clientes activos", "842", "+64"], ["Reservas", "312", "+19%"], ["Tareas IA", "94%", "online"]].map(([label, value, meta]) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.055] p-5">
              <p className="text-sm text-white/45">{label}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-3xl font-semibold">{value}</p>
                <span className="rounded-full bg-emerald-300/12 px-2 py-1 text-xs text-emerald-200">{meta}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
            <div className="mb-4 flex items-center justify-between text-sm text-white/55">
              <span>Rendimiento semanal</span>
              <span className="text-emerald-300">+28%</span>
            </div>
            <div className="flex h-52 items-end gap-2 sm:gap-3">
              {[36, 68, 48, 78, 60, 94, 72, 88, 80, 96].map((h, i) => (
                <div key={i} className="flowly-chart-bar flex-1 rounded-t-2xl" style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.045] p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-white/55">Actividad conectada</p>
              <BrainCircuit className="text-cyan-200" size={18} />
            </div>
            {[
              ["WhatsApp recibido", "Se detecta cliente nuevo"],
              ["Ficha CRM creada", "Origen, teléfono y seguimiento listos"],
              ["Cita agendada", "Recordatorio automático preparado"],
              ["Factura enviada", "PDF y cobro registrados"],
            ].map(([title, detail]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.075] p-4 text-sm">
                <p className="font-medium text-white/88">{title}</p>
                <p className="mt-1 text-white/48">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustBar() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6">
      <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/[0.05] p-3 text-sm text-white/70 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl md:grid-cols-5">
        {[
          "Datos aislados por empresa",
          "Infraestructura cloud",
          "WhatsApp integrado",
          "Pagos y módulos preparados",
          "Soporte humano",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 rounded-2xl bg-slate-950/45 px-4 py-3">
            <CheckCircle2 size={16} className="shrink-0 text-cyan-200" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[.35em] text-cyan-200/80">Así funciona</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">De conversación a cobro, sin cambiar de herramienta.</h2>
        <p className="mt-5 text-lg leading-8 text-white/62">La ventaja de Flowly no es tener muchos módulos. Es que todos trabajan en el mismo recorrido comercial.</p>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-5">
        {workflow.map(({ title, text, icon: Icon }, index) => (
          <div key={title} className="group relative rounded-[1.8rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/10 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.075]">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-100">
                <Icon size={22} />
              </div>
              <span className="text-sm text-white/35">0{index + 1}</span>
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-white/52">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PillarsSection() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
        <div className="lg:sticky lg:top-10">
          <p className="text-sm font-semibold uppercase tracking-[.35em] text-cyan-200/80">Producto</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">Todo conectado, pero sin saturar al usuario.</h2>
          <p className="mt-5 text-lg leading-8 text-white/62">Flowly se adapta al tamaño de cada negocio: empieza con lo básico y activa módulos cuando realmente los necesita.</p>
          <Link href="/demo/login" className="flowly-primary mt-8 inline-flex items-center gap-2 rounded-full px-6 py-4 font-semibold">Probar demo <ArrowRight size={18} /></Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {productPillars.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-[1.8rem] border border-white/10 bg-white/[0.055] p-6 transition hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/[0.075]">
              <Icon className="mb-6 text-cyan-200" size={28} />
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/55">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectorsSection() {
  return (
    <section id="sectores" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.35em] text-fuchsia-200/80">Sectores</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">Una base común, experiencias adaptadas por negocio.</h2>
        </div>
        <Link href="/demo/login" className="flowly-chip inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm">Ver demos <ChevronRight size={16} /></Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {sectorsBase.map(({ name, icon: Icon, tag, href, highlights }) => (
          <Link key={name} href={href} className="group overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/15 transition hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/[0.075]">
            <div className="relative mb-7 h-44 overflow-hidden rounded-[1.7rem] border border-white/10 bg-slate-950/60 p-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(34,211,238,.22),transparent_34%),radial-gradient(circle_at_80%_30%,rgba(236,72,153,.16),transparent_36%)]" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-500 text-slate-950">
                  <Icon size={23} />
                </div>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/60">Demo</span>
              </div>
              <div className="relative z-10 mt-8 space-y-2">
                {highlights.map((item) => (
                  <div key={item} className="h-8 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2 text-xs text-white/60">{item}</div>
                ))}
              </div>
            </div>
            <h3 className="text-2xl font-semibold">{name}</h3>
            <p className="mt-2 text-white/55">{tag}</p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">Abrir demo <ArrowRight size={16} /></div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProofSection() {
  const stories = [
    {
      title: "Clínicas",
      text: "Menos llamadas perdidas, citas mejor organizadas y pacientes con historial visible antes de atender.",
    },
    {
      title: "Estética y peluquería",
      text: "Reservas, preferencias, recordatorios y campañas en un solo recorrido comercial.",
    },
    {
      title: "Servicios y talleres",
      text: "Del primer mensaje al presupuesto, factura y cobro sin depender de hojas externas.",
    },
  ];

  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-20">
      <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,.10),rgba(255,255,255,.035))] p-6 shadow-2xl shadow-cyan-950/20 md:p-8">
        <div className="grid gap-10 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <div className="flowly-chip mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"><ShieldCheck size={16} /> Confianza operativa</div>
            <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">Un producto que debe sentirse serio antes de vender una sola función.</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/62">Por eso Flowly comunica seguridad, orden, soporte y una experiencia de producto integrada, no una colección de herramientas sueltas.</p>
          </div>

          <div className="grid gap-3">
            {[
              ["Multiempresa", "Datos separados por negocio y arquitectura preparada para miles de clientes."],
              ["Escalable", "Módulos independientes para contratar solo lo necesario y crecer después."],
              ["Comercial", "Pensado para captar, atender, agendar, cotizar, facturar y hacer seguimiento."],
              ["Soporte", "Acompañamiento humano para implementación, configuración y evolución del negocio."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5">
                <p className="font-semibold">{title}</p>
                <p className="mt-2 text-sm leading-6 text-white/50">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {stories.map((item) => (
            <div key={item.title} className="rounded-[1.8rem] border border-white/10 bg-white/[0.055] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200/75">Caso de uso</p>
              <p className="mt-4 text-xl font-semibold">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-white/56">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonSection({ pricesHref }: { pricesHref: string }) {
  return (
    <section id="comparativa" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[.35em] text-cyan-200/80">Comparativa</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">Flowly sustituye el caos de herramientas separadas.</h2>
        <p className="mt-5 text-lg leading-8 text-white/62">La diferencia está en que cada módulo entiende el contexto del cliente y trabaja con el resto.</p>
      </div>

      <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055]">
        <div className="grid grid-cols-[1.2fr_.55fr_.75fr] border-b border-white/10 bg-white/[0.06] px-5 py-4 text-sm font-semibold text-white/75">
          <span>Función</span>
          <span className="text-center">Flowly</span>
          <span className="text-center">Herramientas sueltas</span>
        </div>
        {comparisonRows.map(([label, flowly, separate]) => (
          <div key={String(label)} className="grid grid-cols-[1.2fr_.55fr_.75fr] items-center border-b border-white/10 px-5 py-4 text-sm last:border-b-0">
            <span className="font-medium text-white/82">{label}</span>
            <span className="flex justify-center">{flowly ? <CheckCircle2 size={19} className="text-emerald-300" /> : "—"}</span>
            <span className="text-center text-white/45">{separate ? "Sí, separado" : "No integrado"}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link href={pricesHref} className="flowly-primary inline-flex items-center gap-2 rounded-full px-7 py-4 font-semibold">Ver planes <ArrowRight size={18} /></Link>
      </div>
    </section>
  );
}

function PricingPreview({ pricesHref }: { pricesHref: string }) {
  const plans = [
    {
      name: "Basic",
      text: "Agenda, CRM esencial y facturación básica para negocios que quieren empezar ordenados.",
      badge: "Incluye facturación básica",
    },
    {
      name: "Modular",
      text: "Activa WhatsApp, marketing, automatizaciones, facturación PRO y otros módulos según necesidad.",
      badge: "Escalable",
    },
    {
      name: "Enterprise",
      text: "Solución personalizada para empresas con procesos, equipos o integraciones especiales.",
      badge: "A medida",
    },
  ];

  return (
    <section id="precios" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.35em] text-fuchsia-200/80">Planes</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">Empieza simple. Crece por módulos.</h2>
        </div>
        <Link href={pricesHref} className="flowly-secondary inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold">Ver precios completos <ArrowRight size={18} /></Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <div key={plan.name} className={`rounded-[2rem] border p-6 shadow-2xl shadow-black/15 ${index === 1 ? "border-cyan-300/35 bg-cyan-300/[0.08]" : "border-white/10 bg-white/[0.055]"}`}>
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-2xl font-semibold">{plan.name}</h3>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/65">{plan.badge}</span>
            </div>
            <p className="min-h-20 text-sm leading-7 text-white/58">{plan.text}</p>
            <Link href={pricesHref} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">Ver plan <ArrowRight size={16} /></Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function AmbassadorSection() {
  const [ambassadorLoading, setAmbassadorLoading] = useState(false);
  const [ambassadorSent, setAmbassadorSent] = useState(false);
  const [ambassadorName, setAmbassadorName] = useState("");
  const [ambassadorEmail, setAmbassadorEmail] = useState("");
  const [ambassadorPhone, setAmbassadorPhone] = useState("");
  const [ambassadorCity, setAmbassadorCity] = useState("");
  const [ambassadorExperience, setAmbassadorExperience] = useState("");

  const submitAmbassador = async () => {
    if (!ambassadorName || !ambassadorEmail || !ambassadorPhone) {
      alert("Rellena nombre, email y teléfono");
      return;
    }

    setAmbassadorLoading(true);

    const message = [
      "Solicitud para trabajar como Embajador de Flowly",
      `Ciudad / zona: ${ambassadorCity || "No indicado"}`,
      `Experiencia: ${ambassadorExperience || "No indicado"}`,
    ].join("\n\n");

    const { error } = await supabase.from("contacts").insert({
      name: ambassadorName,
      email: ambassadorEmail,
      phone: ambassadorPhone,
      company: ambassadorCity,
      type: "Empezar ahora",
      message,
      status: "Nuevo",
    });

    if (error) {
      alert(`Error enviando solicitud: ${error.message}`);
    } else {
      setAmbassadorSent(true);
      setAmbassadorName("");
      setAmbassadorEmail("");
      setAmbassadorPhone("");
      setAmbassadorCity("");
      setAmbassadorExperience("");
    }

    setAmbassadorLoading(false);
  };

  return (
    <section id="trabaja-con-nosotros" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-6 rounded-[2.4rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/15 md:p-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
        <div>
          <div className="flowly-chip mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"><Sparkles size={16} /> Empezar ahora</div>
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Embajadores para llevar Flowly a negocios de LATAM.</h2>
          <p className="mt-5 text-base leading-8 text-white/62">Una propuesta comercial clara: software, automatización, WhatsApp, agenda, CRM, facturación y marketing en una única plataforma.</p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
          {ambassadorSent ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-300 text-slate-950"><CheckCircle2 /></div>
              <h3 className="text-2xl font-semibold">Solicitud enviada</h3>
              <p className="mt-3 text-white/60">Hemos recibido tu candidatura como embajador de Flowly.</p>
              <button onClick={() => setAmbassadorSent(false)} className="flowly-primary mt-8 rounded-full px-6 py-3 font-semibold">Enviar otra solicitud</button>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-semibold">Quiero ser embajador</h3>
              <div className="mt-6 grid gap-4">
                <input value={ambassadorName} onChange={(e) => setAmbassadorName(e.target.value)} placeholder="Nombre completo" className="flowly-input-light rounded-2xl px-4 py-3" />
                <input value={ambassadorEmail} onChange={(e) => setAmbassadorEmail(e.target.value)} placeholder="Email" type="email" className="flowly-input-light rounded-2xl px-4 py-3" />
                <input value={ambassadorPhone} onChange={(e) => setAmbassadorPhone(e.target.value)} placeholder="Teléfono / WhatsApp" className="flowly-input-light rounded-2xl px-4 py-3" />
                <input value={ambassadorCity} onChange={(e) => setAmbassadorCity(e.target.value)} placeholder="Ciudad o zona donde venderías" className="flowly-input-light rounded-2xl px-4 py-3" />
                <textarea value={ambassadorExperience} onChange={(e) => setAmbassadorExperience(e.target.value)} placeholder="Experiencia comercial o contactos" className="flowly-input-light min-h-28 rounded-2xl px-4 py-3" />
              </div>
              <button onClick={submitAmbassador} disabled={ambassadorLoading} className="flowly-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold">
                <Send size={16} /> {ambassadorLoading ? "Enviando..." : "Enviar candidatura"}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
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

  return (
    <main className="flowly-public min-h-screen">
      <span className="flowly-orb left-8 top-24 h-44 w-44 bg-cyan-400/30" />
      <span className="flowly-orb right-16 top-40 h-52 w-52 bg-fuchsia-500/25" />
      <span className="flowly-orb bottom-80 left-1/3 h-64 w-64 bg-violet-500/18" />

      <Header country={country} setMarket={setMarket} pricesHref={pricesHref} />

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-16 text-center sm:pt-20">
        <div className="flowly-chip mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"><Sparkles size={16} /> {market.headline}</div>
        <h1 className="mx-auto max-w-6xl text-5xl font-semibold tracking-tight md:text-7xl lg:text-8xl">
          Todo tu negocio. <span className="flowly-gradient-text">Una sola plataforma.</span>
        </h1>
        <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-white/68">
          CRM, WhatsApp, Agenda, Facturación, Automatizaciones e IA conectados para captar clientes, atender mejor y cobrar sin perder el control.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/demo/login" className="flowly-primary inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-semibold transition"><Play size={18} /> Ver demostración</Link>
          <Link href={pricesHref} className="flowly-secondary inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-semibold">Ver planes <ArrowRight size={18} /></Link>
        </div>

        <ProductMockup country={country} />
      </section>

      <TrustBar />
      <WorkflowSection />
      <PillarsSection />
      <SectorsSection />
      <ProofSection />
      <ComparisonSection pricesHref={pricesHref} />
      <PricingPreview pricesHref={pricesHref} />
      <AmbassadorSection />

      <section id="quienes-somos" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="flowly-glass rounded-[2.5rem] px-8 py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-300 to-fuchsia-400 text-slate-950"><ShieldCheck /></div>
          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">Haz que tu negocio parezca más grande, más ordenado y más tecnológico.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-white/60">Activa Flowly, prueba las demos y muestra una experiencia SaaS moderna a tus clientes desde hoy.</p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href={pricesHref} className="flowly-primary inline-flex rounded-full px-7 py-4 font-semibold transition">Ver planes</Link>
            <Link href="/contacto" className="flowly-secondary inline-flex rounded-full px-7 py-4 font-semibold">Solicitar propuesta</Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 mx-auto max-w-7xl border-t border-white/10 px-6 py-8 text-sm text-white/55">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-5">
            <Link href="/#quienes-somos" className="hover:text-cyan-200">Quiénes somos</Link>
            <Link href="/contacto" className="hover:text-cyan-200">Contacto</Link>
            <Link href="/privacy" className="hover:text-cyan-200">Política privacidad</Link>
            <Link href="/legal/condiciones" className="hover:text-cyan-200">Términos</Link>
            <Link href="/contacto" className="hover:text-cyan-200">Soporte</Link>
          </div>
          <div className="text-white/45">Copyright 2026 Flowly IA · Version 2.0</div>
        </div>
      </footer>
    </main>
  );
}
