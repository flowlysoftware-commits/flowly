"use client";

import Image from "next/image";
import HeroFlowExperience from "@/components/HeroFlowExperience";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Bot, BrainCircuit, CalendarDays, Check, CheckCircle2, ChevronRight,
  Clock3, FileText, Menu, MessageCircle, Play, ShieldCheck, Sparkles, Store,
  TrendingUp, Users, Wand2, X, Zap
} from "lucide-react";

type Country = "VE" | "ES" | "CO" | "EC" | "PR";
type MarketConfig = { code: Country; label: string; flag: string; price: string; headline: string };

const markets: MarketConfig[] = [
  { code: "VE", label: "Venezuela", flag: "🇻🇪", price: "$29.99", headline: "Flowly IA para negocios de Venezuela" },
  { code: "ES", label: "España", flag: "🇪🇸", price: "29,99 €", headline: "Flowly IA para negocios modernos" },
  { code: "CO", label: "Colombia", flag: "🇨🇴", price: "$119.000", headline: "Flowly IA para negocios de Colombia" },
  { code: "EC", label: "Ecuador", flag: "🇪🇨", price: "$29.99", headline: "Flowly IA para negocios de Ecuador" },
  { code: "PR", label: "Puerto Rico", flag: "🇵🇷", price: "$29.99", headline: "Flowly IA para negocios de Puerto Rico" },
];

const pains = [
  "Respondes mensajes todo el día, pero algunos clientes se enfrían.",
  "El equipo no sabe qué está pendiente ni cuál es la próxima acción.",
  "Agenda, clientes, presupuestos y cobros viven en herramientas distintas.",
  "El seguimiento depende de acordarse, no de un sistema.",
];

const modules = [
  { icon: Users, title: "CRM vivo", text: "Cada cliente con contexto, estado, historial y próxima acción." },
  { icon: MessageCircle, title: "WhatsApp conectado", text: "Conversaciones organizadas para responder con rapidez y contexto." },
  { icon: CalendarDays, title: "Agenda inteligente", text: "Citas, tareas y recordatorios unidos al cliente correcto." },
  { icon: FileText, title: "Ventas y cobros", text: "Presupuestos, facturas y oportunidades sin saltar entre herramientas." },
  { icon: BrainCircuit, title: "IA operativa", text: "Flow detecta prioridades, propone acciones y reduce tareas repetitivas." },
  { icon: Zap, title: "Automatizaciones", text: "Procesos que se ejecutan solos para que el negocio siga avanzando." },
];

const sectors = [
  ["Peluquerías y estética", "Reservas, preferencias, campañas y recordatorios."],
  ["Clínicas y servicios", "Clientes, citas, documentos y seguimiento."],
  ["Comercio y ventas", "Prospectos, presupuestos, cobros y oportunidades."],
  ["Atención online", "Turnos, promociones, recargas y seguimiento comercial."],
];

const faqs = [
  ["¿Necesito saber de tecnología?", "No. Flowly está diseñado para empezar con un panel sencillo y activar más funciones cuando las necesites."],
  ["¿Puedo probarlo antes de pagar?", "Sí. Puedes entrar, ver el entorno y comprobar cómo encaja en tu negocio."],
  ["¿Sirve para cualquier sector?", "Está pensado para negocios que atienden clientes, gestionan citas, venden servicios o hacen seguimiento comercial."],
  ["¿Tengo que usar todos los módulos?", "No. Puedes empezar con CRM y agenda y ampliar después con WhatsApp, facturación o automatizaciones."],
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
  return (
    <header className="sticky top-3 z-50 mx-auto max-w-7xl px-4">
      <nav className="flowly-nav flex items-center justify-between gap-3 rounded-[1.5rem] px-4 py-3 md:rounded-full md:px-5">
        <Link href="/" className="flex items-center gap-3"><Image src="/logo.png" alt="Flowly IA" width={150} height={42} className="h-auto w-28 md:w-36" priority /></Link>
        <div className="hidden items-center gap-7 text-sm text-white/65 lg:flex">
          <a href="#sistema" className="hover:text-white">El sistema</a><a href="#demo" className="hover:text-white">Demo</a><a href="#sectores" className="hover:text-white">Sectores</a><a href="#planes" className="hover:text-white">Planes</a>
        </div>
        <div className="flex items-center gap-2">
          <label className="flowly-chip hidden items-center gap-2 rounded-full px-3 py-2 md:inline-flex"><span>{market.flag}</span><select value={country} onChange={(e) => setMarket(e.target.value as Country)} className="bg-transparent text-xs outline-none" aria-label="Seleccionar país">{markets.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></label>
          <Link href="/login" className="flowly-secondary hidden rounded-full px-4 py-2.5 text-sm font-semibold sm:inline-flex">Entrar</Link>
          <Link href={pricesHref} className="flowly-primary hidden rounded-full px-5 py-2.5 text-sm font-semibold sm:inline-flex">Empieza gratis</Link>
          <button className="flowly-secondary inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Abrir menú">{mobileOpen ? <X size={20}/> : <Menu size={20}/>}</button>
        </div>
      </nav>
      {mobileOpen && <div className="flowly-nav absolute left-4 right-4 top-[calc(100%+.6rem)] rounded-3xl p-3 lg:hidden"><div className="grid gap-2 text-sm text-white/80">{[["#sistema","El sistema"],["#demo","Demo"],["#sectores","Sectores"],["#planes","Planes"]].map(([href,label]) => <a key={href} href={href} onClick={()=>setMobileOpen(false)} className="rounded-2xl px-4 py-3 hover:bg-white/10">{label}</a>)}<Link href={pricesHref} className="flowly-primary mt-2 inline-flex justify-center rounded-full px-5 py-3 font-semibold">Empieza gratis</Link></div></div>}
    </header>
  );
}

function Hero({ market, pricesHref }: { market: MarketConfig; pricesHref: string }) {
  return (
    <section className="relative z-10 mx-auto grid min-h-[820px] max-w-7xl gap-10 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pt-20">
      <div className="relative z-10">
        <div className="flowly-chip mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"><span className="flowly-live-dot"/> {market.headline}</div>
        <h1 className="max-w-4xl text-5xl font-semibold leading-[.94] tracking-[-.055em] sm:text-6xl md:text-7xl lg:text-[5.4rem]">Tu negocio no necesita más herramientas. Necesita un <span className="flowly-gradient-text">sistema que trabaje.</span></h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-white/67 md:text-xl">Flowly reúne clientes, WhatsApp, agenda, ventas y automatizaciones en un solo lugar, con una IA que te dice qué hacer después.</p>
        <div className="mt-9 flex flex-col gap-4 sm:flex-row"><Link href={pricesHref} className="flowly-primary inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold">Quiero ordenar mi negocio <ArrowRight size={19}/></Link><a href="#demo" className="flowly-secondary inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold"><Play size={18}/> Ver cómo funciona</a></div>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/50"><span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-200"/> Sin tarjeta</span><span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-200"/> Configuración guiada</span><span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-cyan-200"/> Desde {market.price}/mes</span></div>
      </div>

      <div className="relative min-h-[610px] lg:min-h-[680px]">
        <HeroFlowExperience />
      </div>
    </section>
  );
}

function TrustStrip() {
  return <section className="relative z-10 mx-auto max-w-7xl px-6 pb-12"><div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[.045] p-4 text-center sm:grid-cols-4">{[["24/7","seguimiento activo"],["1 panel","para todo el negocio"],["6 módulos","conectados entre sí"],["1 IA","que prioriza contigo"]].map(([v,l])=><div key={l} className="rounded-2xl px-4 py-5"><p className="text-2xl font-semibold">{v}</p><p className="mt-1 text-xs text-white/45">{l}</p></div>)}</div></section>;
}

function StorySection() {
  return <section id="sistema" className="relative z-10 mx-auto max-w-7xl px-6 py-24"><div className="mx-auto max-w-3xl text-center"><p className="eyebrow">El problema real</p><h2 className="section-title">No pierdes ventas por falta de interés. Las pierdes entre mensajes, tareas y olvidos.</h2><p className="section-copy">Flowly transforma ese caos en una secuencia clara: entra un cliente, el sistema lo entiende y tu equipo sabe qué hacer.</p></div><div className="mt-14 grid gap-5 md:grid-cols-2">{pains.map((pain,i)=><div key={pain} className="flowly-story-card rounded-[2rem] p-7"><span className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-400/10 text-red-200">0{i+1}</span><p className="text-xl font-semibold leading-8">{pain}</p></div>)}</div></section>;
}

function DemoSection() {
  return <section id="demo" className="relative z-10 mx-auto max-w-7xl px-6 py-24"><div className="grid gap-10 rounded-[2.7rem] border border-white/10 bg-white/[.05] p-6 lg:grid-cols-[.78fr_1.22fr] lg:p-10"><div className="flex flex-col justify-center"><p className="eyebrow">Producto en movimiento</p><h2 className="section-title text-left">Mira cómo un cliente pasa de “nuevo mensaje” a “venta seguida”.</h2><p className="section-copy text-left">No enseñamos una lista de funciones. Enseñamos el resultado: menos caos, decisiones más rápidas y un negocio que no se detiene.</p><Link href="/demo/login" className="flowly-primary mt-8 inline-flex w-fit items-center gap-2 rounded-full px-7 py-4 font-semibold">Abrir demo real <ArrowRight size={18}/></Link></div><div className="flowly-product-stage relative rounded-[2.2rem] p-4 md:p-6"><div className="flowly-scanline"/><div className="flex items-center justify-between border-b border-white/10 pb-4"><div className="flex gap-2"><i className="h-3 w-3 rounded-full bg-red-400"/><i className="h-3 w-3 rounded-full bg-yellow-300"/><i className="h-3 w-3 rounded-full bg-emerald-400"/></div><span className="text-xs text-white/40">Centro operativo · en directo</span></div><div className="mt-5 grid gap-4 md:grid-cols-[1fr_.75fr]"><div className="space-y-3">{[["Nuevo lead de Meta","Creado en CRM","Ahora"],["WhatsApp recibido","Contexto añadido","2 min"],["Presupuesto enviado","Seguimiento programado","18 min"]].map(([a,b,c],i)=><div key={a} className="flowly-mini-card rounded-2xl border border-white/10 bg-white/[.055] p-4"><div className="flex items-center justify-between"><p className="font-semibold">{a}</p><span className="text-xs text-white/35">{c}</span></div><p className="mt-2 text-sm text-white/50">{b}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400" style={{width:`${68+i*12}%`}}/></div></div>)}</div><div className="rounded-3xl border border-fuchsia-300/20 bg-fuchsia-300/[.07] p-5"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-fuchsia-400 text-slate-950"><Bot/></div><p className="mt-5 text-sm font-semibold text-fuchsia-100">Flow recomienda</p><p className="mt-3 text-sm leading-6 text-white/65">“Laura está lista para decidir. Escríbele ahora y recuerda el presupuesto que dejó pendiente.”</p><button className="mt-5 w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950">Preparar respuesta</button></div></div></div></div></section>;
}

function ModulesSection() {
  return <section className="relative z-10 mx-auto max-w-7xl px-6 py-24"><div className="max-w-4xl"><p className="eyebrow">Un sistema operativo para tu empresa</p><h2 className="section-title text-left">Todo conectado. Nada aislado.</h2><p className="section-copy text-left">Flowly no es otro CRM con añadidos. Es la capa que conecta la operación diaria de tu negocio.</p></div><div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{modules.map(({icon:Icon,title,text})=><div key={title} className="flowly-module-card rounded-[2rem] p-7"><div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200"><Icon size={23}/></div><h3 className="text-2xl font-semibold">{title}</h3><p className="mt-4 text-sm leading-7 text-white/52">{text}</p></div>)}</div></section>;
}

function SectorsSection() {
  return <section id="sectores" className="relative z-10 mx-auto max-w-7xl px-6 py-24"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="eyebrow">Hecho para negocios reales</p><h2 className="section-title max-w-4xl text-left">Se adapta a cómo trabajas. No al revés.</h2></div><Link href="/demo/login" className="flowly-secondary inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold">Ver demos <ChevronRight size={18}/></Link></div><div className="mt-12 grid gap-5 md:grid-cols-2">{sectors.map(([title,text])=><div key={title} className="flowly-sector-card group rounded-[2rem] p-7"><Store className="mb-6 text-fuchsia-200" size={28}/><h3 className="text-2xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-white/52">{text}</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">Ver aplicación <ArrowRight size={16} className="transition group-hover:translate-x-1"/></span></div>)}</div></section>;
}

function PricingSection({ market, pricesHref }: { market: MarketConfig; pricesHref: string }) {
  return <section id="planes" className="relative z-10 mx-auto max-w-7xl px-6 py-24"><div className="flowly-pricing-shell overflow-hidden rounded-[2.8rem] p-7 lg:p-10"><div className="grid gap-10 lg:grid-cols-[1fr_.72fr] lg:items-center"><div><p className="eyebrow">Empieza sin complicarte</p><h2 className="section-title max-w-4xl text-left">Pruébalo. Mira tu negocio dentro. Decide después.</h2><p className="section-copy max-w-2xl text-left">La mejor forma de entender Flowly es verlo trabajando con un negocio de verdad.</p><div className="mt-8 flex flex-col gap-4 sm:flex-row"><Link href={pricesHref} className="flowly-primary inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-semibold">Empezar gratis <ArrowRight size={18}/></Link><Link href="/contacto" className="flowly-secondary inline-flex items-center justify-center rounded-full px-7 py-4 font-semibold">Hablar con una persona</Link></div></div><div className="rounded-[2rem] border border-white/10 bg-slate-950/65 p-7"><p className="text-sm text-white/45">Plan inicial</p><div className="mt-3 flex items-end gap-2"><span className="text-5xl font-semibold">{market.price}</span><span className="pb-2 text-white/40">/mes</span></div><div className="mt-7 grid gap-3">{["CRM y clientes","Agenda y seguimiento","Facturación básica","Configuración guiada"].map(item=><p key={item} className="flex items-center gap-2 text-sm text-white/68"><Check size={17} className="text-cyan-200"/>{item}</p>)}</div></div></div></div></section>;
}

function FAQSection() { return <section className="relative z-10 mx-auto max-w-5xl px-6 py-24"><div className="text-center"><p className="eyebrow">Preguntas frecuentes</p><h2 className="section-title">Lo importante antes de empezar.</h2></div><div className="mt-10 grid gap-4">{faqs.map(([q,a])=><details key={q} className="flowly-faq rounded-3xl p-6"><summary className="cursor-pointer list-none text-lg font-semibold">{q}</summary><p className="mt-4 max-w-3xl text-sm leading-7 text-white/55">{a}</p></details>)}</div></section>; }

function FinalCTA({ pricesHref }: { pricesHref: string }) { return <section className="relative z-10 mx-auto max-w-7xl px-6 py-24"><div className="flowly-final-cta rounded-[3rem] px-7 py-20 text-center"><div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-950"><Wand2/></div><p className="eyebrow">La pregunta no es cuánto cuesta Flowly</p><h2 className="mx-auto max-w-5xl text-4xl font-semibold tracking-[-.045em] md:text-7xl">¿Cuánto te cuesta seguir perdiendo oportunidades por falta de seguimiento?</h2><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">Empieza gratis y descubre qué cambia cuando tu negocio deja de depender de la memoria.</p><Link href={pricesHref} className="flowly-primary mt-9 inline-flex items-center justify-center gap-2 rounded-full px-9 py-4 font-semibold">Quiero ver Flowly en mi negocio <ArrowRight size={18}/></Link></div></section>; }

function FlowGuide() {
  const messages = ["Hola. Soy Flow. Voy a enseñarte cómo puedo ordenar tu negocio.","Aquí empieza el problema: demasiadas tareas dependen de acordarse.","Ahora mira cómo conecto cliente, conversación y siguiente acción.","Todo termina en una prioridad clara para tu equipo."];
  const [index,setIndex] = useState(0);
  useEffect(()=>{ const onScroll=()=>{const p=window.scrollY/Math.max(1,document.documentElement.scrollHeight-window.innerHeight);setIndex(Math.min(3,Math.floor(p*4)));};onScroll();window.addEventListener("scroll",onScroll,{passive:true});return()=>window.removeEventListener("scroll",onScroll);},[]);
  return <div className="flowly-guide fixed bottom-24 right-5 z-40 hidden max-w-xs items-end gap-3 xl:flex"><div className="rounded-2xl border border-white/10 bg-slate-950/88 p-4 text-sm leading-6 text-white/70 shadow-2xl backdrop-blur-xl"><p className="font-semibold text-cyan-200">Flow</p><p className="mt-1">{messages[index]}</p></div><div className="relative h-20 w-20 overflow-hidden rounded-full border border-violet-300/30 bg-violet-500/10"><Image src="/flow/flow-throne-seated.png" alt="Flow" fill className="scale-[1.75] object-contain object-top"/></div></div>;
}

function Footer(){return <footer className="relative z-10 mx-auto max-w-7xl border-t border-white/10 px-6 py-9 text-sm text-white/45"><div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div className="flex flex-wrap gap-5"><Link href="#demo">Demo</Link><Link href="/contacto">Contacto</Link><Link href="/privacy">Privacidad</Link><Link href="/legal/condiciones">Términos</Link></div><div>© 2026 Flowly IA · Sistema operativo para negocios</div></div></footer>}

export default function Home(){
  const [country,setCountry]=useState<Country>("ES");
  useEffect(()=>{const params=new URLSearchParams(window.location.search);const q=params.get("country");const saved=window.localStorage.getItem("flowly_country");if(isCountry(q))setCountry(q);else if(isCountry(saved))setCountry(saved);},[]);
  const setMarket=(value:Country)=>{setCountry(value);window.localStorage.setItem("flowly_country",value)};
  const pricesHref=useMemo(()=>`/precios?country=${country}`,[country]);
  const market=getMarket(country);
  return <main className="flowly-public min-h-screen overflow-hidden pb-20 sm:pb-0"><span className="flowly-orb left-8 top-24 h-44 w-44 bg-cyan-400/30"/><span className="flowly-orb right-16 top-40 h-52 w-52 bg-fuchsia-500/25"/><span className="flowly-orb bottom-80 left-1/3 h-64 w-64 bg-violet-500/18"/><Header country={country} setMarket={setMarket} pricesHref={pricesHref}/><Hero market={market} pricesHref={pricesHref}/><TrustStrip/><StorySection/><DemoSection/><ModulesSection/><SectorsSection/><PricingSection market={market} pricesHref={pricesHref}/><FAQSection/><FinalCTA pricesHref={pricesHref}/><Footer/><FlowGuide/><div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/90 p-3 backdrop-blur-xl sm:hidden"><Link href={pricesHref} className="flowly-primary flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">Empieza gratis <ArrowRight size={16}/></Link></div></main>;
}
