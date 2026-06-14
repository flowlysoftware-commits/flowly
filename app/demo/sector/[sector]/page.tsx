import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  MessageCircle,
  MoreHorizontal,
  PhoneCall,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { demoSectorMap, demoSectors, type DemoSectorKey } from "@/lib/demoSectors";

export function generateStaticParams() {
  return demoSectors.map((sector) => ({ sector: sector.key }));
}

const moduleDescriptions: Record<string, string> = {
  CRM: "Clientes, historial, estados y tareas",
  Agenda: "Citas, huecos libres y reservas",
  WhatsApp: "Bandeja, plantillas y bots",
  Voice: "Llamadas conectadas al CRM",
  Marketing: "Campañas, calendario y leads",
  Inventario: "Stock, productos y alertas",
  RRHH: "Equipo, turnos y rendimiento",
  TPV: "Caja, tickets y cobros",
  Documentos: "PDFs, adjuntos y expedientes",
  Portal: "Acceso cliente y recursos",
  Encuestas: "NPS, reseñas y calidad",
  Firma: "Contratos y consentimientos",
  Automatizaciones: "Flujos IA entre módulos",
};

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const slots = ["09:00", "10:30", "12:00", "16:00", "18:30"];

export default async function SectorDemoPage({ params }: { params: Promise<{ sector: string }> }) {
  const { sector } = await params;
  const demo = demoSectorMap[sector as DemoSectorKey];

  if (!demo) notFound();

  const Icon = demo.icon;
  const hasMarketing = demo.modules.includes("Marketing");
  const hasInventory = demo.modules.includes("Inventario");
  const hasHR = demo.modules.includes("RRHH") || demo.modules.includes("TPV");
  const hasDocuments = demo.modules.includes("Documentos") || demo.modules.includes("Firma");

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(34,211,238,.20),transparent_28%),radial-gradient(circle_at_85%_8%,rgba(168,85,247,.22),transparent_30%),linear-gradient(135deg,#020617,#111827_55%,#170f2f)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:58px_58px]" />
      <div className="pointer-events-none fixed inset-y-0 left-0 w-20 border-r border-white/10 bg-white/[0.03] backdrop-blur-xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1720px]">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-white/[0.035] p-5 backdrop-blur-2xl lg:block">
          <Link href="/demo" className="mb-7 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white/70 transition hover:text-white">
            <ArrowLeft size={16} /> Volver a demos
          </Link>
          <Link href="/" className="mb-8 flex items-center gap-3">
            <Image src="/logo.png" alt="Flowly IA" width={140} height={42} className="h-auto w-32 object-contain" />
          </Link>

          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.06] p-5">
            <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${demo.accent} text-slate-950`}>
              <Icon size={25} />
            </div>
            <p className="text-sm text-white/45">Demo sectorial</p>
            <h1 className="mt-1 text-2xl font-semibold">{demo.title}</h1>
            <div className="mt-4 flex gap-2 text-3xl opacity-70">
              {demo.decor.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {["Resumen", "Agenda", "CRM", "WhatsApp", "Operaciones", "Automatizaciones"].map((item, index) => (
              <a key={item} href={`#${item.toLowerCase()}`} className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${index === 0 ? "bg-white text-slate-950" : "text-white/62 hover:bg-white/10 hover:text-white"}`}>
                <span>{item}</span>
                {index === 0 ? <CheckCircle2 size={15} /> : <ChevronRight size={15} />}
              </a>
            ))}
          </nav>

          <div className="mt-6 rounded-[1.5rem] border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-cyan-100"><ShieldCheck size={16} /> Demo segura</p>
            <p className="mt-2 text-xs leading-5 text-white/50">Datos ficticios, aislados y preparados para enseñar el producto sin acceso a información real.</p>
          </div>
        </aside>

        <section className="flex-1 px-4 py-5 md:px-8 lg:px-10">
          <header className="mb-7 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Link href="/demo" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 lg:hidden"><ArrowLeft size={18} /></Link>
              <div>
                <p className="text-xs uppercase tracking-[.25em] text-cyan-200/70">{demo.badge}</p>
                <h2 className="mt-1 text-2xl font-semibold md:text-3xl">{demo.shortName} Control Center</h2>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" size={17} />
                <input className="input-dark w-full pl-10 md:w-72" placeholder="Buscar cliente, cita o tarea..." />
              </div>
              <button className="btn-secondary"><Settings size={16} /> Configurar demo</button>
              <button className="btn-primary"><Plus size={16} /> Nueva acción</button>
            </div>
          </header>

          <section id="resumen" className="grid gap-5 xl:grid-cols-[1.6fr_.9fr]">
            <div className="relative overflow-hidden rounded-[2.3rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur-xl md:p-8">
              <div className="absolute right-8 top-6 text-8xl opacity-10">{demo.decor[0]}</div>
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
                  <div className="flowly-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"><Sparkles size={16} /> Panel basado en producto real</div>
                  <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">{demo.title}</h1>
                  <p className="mt-5 max-w-3xl text-base leading-8 text-white/62 md:text-lg">{demo.subtitle}</p>
                </div>
                <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.7rem] bg-gradient-to-br ${demo.accent} text-slate-950 shadow-xl`}>
                  <Icon size={34} />
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {demo.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
                    <p className="text-sm text-white/45">{metric.label}</p>
                    <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
                    <p className="mt-2 text-xs text-cyan-200">{metric.trend}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2.3rem] border border-white/10 bg-white/[0.055] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/45">Módulos activados</p>
                  <h3 className="mt-1 text-2xl font-semibold">Stack recomendado</h3>
                </div>
                <Zap className="text-cyan-300" />
              </div>
              <div className="mt-5 space-y-3">
                {demo.modules.map((module) => (
                  <div key={module} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{module}</p>
                        <p className="mt-1 text-xs text-white/45">{moduleDescriptions[module] ?? "Operación conectada"}</p>
                      </div>
                      <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200">Activo</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr_.8fr]">
            <div id="agenda" className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/45">Agenda operativa</p>
                  <h3 className="text-2xl font-semibold">Citas y huecos</h3>
                </div>
                <CalendarDays className="text-cyan-300" />
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-xs text-white/45">
                {weekDays.map((day) => <span key={day}>{day}</span>)}
              </div>
              <div className="mt-3 grid grid-cols-7 gap-2">
                {Array.from({ length: 28 }).map((_, index) => {
                  const active = [2, 4, 8, 10, 15, 18, 22].includes(index);
                  return <div key={index} className={`aspect-square rounded-2xl border p-2 text-xs ${active ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-white/[0.04] text-white/45"}`}>{index + 1}</div>;
                })}
              </div>
              <div className="mt-5 space-y-3">
                {demo.agenda.map((item) => (
                  <div key={`${item.time}-${item.title}`} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <span className="rounded-xl bg-white text-slate-950 px-3 py-2 text-sm font-semibold">{item.time}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm text-white/45">{item.detail}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/65">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div id="crm" className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/45">CRM vivo</p>
                  <h3 className="text-2xl font-semibold">Clientes y oportunidades</h3>
                </div>
                <Users className="text-violet-300" />
              </div>
              <div className="space-y-3">
                {demo.customers.map((customer) => (
                  <div key={customer.name} className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{customer.name}</p>
                        <p className="mt-1 text-sm text-white/45">{customer.meta}</p>
                      </div>
                      <p className="text-right text-sm font-semibold text-cyan-200">{customer.value}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/65">{customer.status}</span>
                      <button className="inline-flex items-center gap-1 text-xs text-cyan-200">Abrir ficha <ArrowRight size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {slots.slice(0, 3).map((slot, index) => <div key={slot} className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-center"><Clock3 className="mx-auto mb-2 text-white/45" size={16} /><p className="text-sm font-semibold">{slot}</p><p className="text-[11px] text-white/40">{index === 1 ? "Ocupado" : "Libre"}</p></div>)}
              </div>
            </div>

            <div id="whatsapp" className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/45">WhatsApp + IA</p>
                  <h3 className="text-2xl font-semibold">Bandeja rápida</h3>
                </div>
                <MessageCircle className="text-emerald-300" />
              </div>
              <div className="space-y-3">
                <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-md bg-cyan-300 p-3 text-sm text-slate-950">Hola, te confirmamos tu cita de hoy. Responde 1 para confirmar.</div>
                <div className="max-w-[82%] rounded-2xl rounded-tl-md bg-white/10 p-3 text-sm text-white/76">1</div>
                <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-md bg-violet-300 p-3 text-sm text-slate-950">Perfecto. Te esperamos. También hemos guardado el seguimiento en tu ficha.</div>
              </div>
              <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.08] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-100"><Bot size={16} /> Bot activo</p>
                <p className="mt-2 text-xs leading-5 text-white/50">Responde automáticamente, crea tareas y actualiza el CRM.</p>
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
            <div id="operaciones" className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/45">Operación del sector</p>
                  <h3 className="text-2xl font-semibold">Panel de control</h3>
                </div>
                <MoreHorizontal className="text-white/45" />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {demo.operations.map((operation) => (
                  <div key={operation.title} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">{operation.state}</span>
                    <h4 className="mt-4 text-lg font-semibold">{operation.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-white/50">{operation.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {hasMarketing && <FeaturePanel icon={<TrendingUp size={18} />} title="Marketing" text="Calendario de contenidos, campañas y leads sincronizados con CRM." />}
                {hasInventory && <FeaturePanel icon={<FileText size={18} />} title="Inventario" text="Alertas de stock, reposición y control de productos críticos." />}
                {hasHR && <FeaturePanel icon={<Users size={18} />} title="Equipo" text="Turnos, fichaje, caja o rendimiento por trabajador según el sector." />}
                {hasDocuments && <FeaturePanel icon={<ShieldCheck size={18} />} title="Documentos" text="PDFs, consentimientos, contratos, adjuntos y firma digital." />}
                {!hasMarketing && !hasInventory && !hasHR && !hasDocuments && <FeaturePanel icon={<PhoneCall size={18} />} title="Operativa conectada" text="Todo el flujo del negocio conectado por CRM, agenda y WhatsApp." />}
              </div>
            </div>

            <div id="automatizaciones" className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/45">Automatización realista</p>
                  <h3 className="text-2xl font-semibold">Flujo IA recomendado</h3>
                </div>
                <Bot className="text-cyan-300" />
              </div>
              <div className="relative space-y-4">
                {demo.automation.map((step, index) => (
                  <div key={step} className="relative flex items-center gap-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${index === demo.automation.length - 1 ? "bg-emerald-300 text-slate-950" : "bg-white/10 text-white"}`}>{index + 1}</div>
                    <div>
                      <p className="font-semibold">{step}</p>
                      <p className="mt-1 text-xs text-white/45">Acción automática conectada al panel demo.</p>
                    </div>
                    {index < demo.automation.length - 1 && <ChevronRight className="ml-auto text-white/30" size={18} />}
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/[0.08] p-5">
                <p className="text-sm font-semibold text-cyan-100">Demo lista para vender</p>
                <p className="mt-2 text-sm leading-6 text-white/55">Los datos son ficticios, pero la estructura enseña el valor real de Flowly: menos trabajo manual, más seguimiento y más control.</p>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function FeaturePanel({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-950">{icon}</div>
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-white/50">{text}</p>
    </div>
  );
}
