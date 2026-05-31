"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Bot,
  CalendarDays,
  CheckCircle2,
  Megaphone,
  MessageCircle,
  PhoneCall,
  Plus,
  Receipt,
  SlidersHorizontal,
  Store,
  TrendingUp,
  UserCog,
} from "lucide-react";

type Relation<T> = T | T[] | null;
type Business = { id: string; name: string; plan: string | null };
type BusinessModule = { module_key: string; status: string };
type ModuleRecord = { id: string; business_id: string; module_key: string; title: string; amount: number | null; status: string; notes: string | null; created_at: string };
type Customer = { id: string; name?: string; full_name?: string; phone: string | null; email: string | null; notes?: string | null };
type Appointment = { id: string; appointment_date?: string; starts_at?: string; status: string; customers: Relation<{ name?: string; full_name?: string }>; services: Relation<{ name: string; price: number }> };

type ModuleConfig = {
  key: string;
  title: string;
  badge: string;
  description: string;
  recordLabel: string;
  titlePlaceholder: string;
  notesPlaceholder: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  cta: string;
  amountEnabled?: boolean;
  proFeatures: string[];
};

type ModuleSlug = keyof typeof modules;

const modules = {
  whatsapp: {
    key: "whatsapp",
    title: "WhatsApp automático",
    badge: "Mensajería",
    description: "Gestiona plantillas, recordatorios y confirmaciones para que tus clientes nunca olviden una cita.",
    recordLabel: "Nueva plantilla",
    titlePlaceholder: "Ej: Recordatorio 24h antes",
    notesPlaceholder: "Hola {cliente}, te recordamos tu cita en {negocio} mañana a las {hora}.",
    Icon: MessageCircle,
    cta: "Guardar plantilla",
    proFeatures: ["Recordatorios de cita", "Confirmaciones preparadas", "Recuperación de clientes inactivos"],
  },
  facturacion: {
    key: "billing",
    title: "Facturación",
    badge: "Finanzas",
    description: "Controla facturas, presupuestos, gastos y movimientos sencillos desde el panel.",
    recordLabel: "Nuevo movimiento",
    titlePlaceholder: "Ej: Factura corte y color",
    notesPlaceholder: "Cliente, forma de pago, concepto o notas internas.",
    Icon: Receipt,
    cta: "Guardar movimiento",
    amountEnabled: true,
    proFeatures: ["Facturas y movimientos", "Control de importes", "Historial financiero del negocio"],
  },
  tpv: {
    key: "pos",
    title: "TPV",
    badge: "Caja",
    description: "Crea tickets rápidos, registra ventas presenciales y controla caja sin salir de Flowly.",
    recordLabel: "Nuevo ticket",
    titlePlaceholder: "Ej: Ticket mostrador #001",
    notesPlaceholder: "Productos, servicio, método de pago o empleado que cobra.",
    Icon: Store,
    cta: "Guardar ticket",
    amountEnabled: true,
    proFeatures: ["Tickets rápidos", "Caja diaria", "Ventas presenciales"],
  },
  crm: {
    key: "crm",
    title: "CRM avanzado",
    badge: "Clientes",
    description: "Crea seguimientos, segmenta clientes y detecta oportunidades para reactivar ventas.",
    recordLabel: "Nuevo seguimiento",
    titlePlaceholder: "Ej: Reactivar cliente inactivo",
    notesPlaceholder: "Cliente, acción recomendada, próxima fecha de contacto y estado.",
    Icon: UserCog,
    cta: "Guardar seguimiento",
    proFeatures: ["Seguimientos por cliente", "Clientes inactivos", "Acciones comerciales"],
  },
  marketing: {
    key: "marketing",
    title: "Marketing",
    badge: "Crecimiento",
    description: "Planifica campañas, promociones y acciones de recuperación para aumentar reservas.",
    recordLabel: "Nueva campaña",
    titlePlaceholder: "Ej: Promo color viernes",
    notesPlaceholder: "Oferta, público objetivo, canal, fecha y objetivo de la campaña.",
    Icon: Megaphone,
    cta: "Guardar campaña",
    proFeatures: ["Campañas promocionales", "Planificación comercial", "Recuperación de clientes"],
  },
  ia: {
    key: "ai",
    title: "IA Assistant",
    badge: "Inteligencia",
    description: "Centraliza instrucciones IA, resúmenes del negocio y oportunidades detectadas.",
    recordLabel: "Nueva instrucción IA",
    titlePlaceholder: "Ej: Resumen semanal",
    notesPlaceholder: "Qué quieres que analice Flowly IA con tus datos.",
    Icon: Bot,
    cta: "Guardar instrucción",
    proFeatures: ["Resúmenes inteligentes", "Sugerencias de negocio", "Notas operativas"],
  },
  estadisticas: {
    key: "analytics",
    title: "Estadísticas avanzadas",
    badge: "KPIs",
    description: "Visualiza rendimiento, ingresos previstos, ocupación y evolución de reservas.",
    recordLabel: "Nueva nota KPI",
    titlePlaceholder: "Ej: Objetivo mensual",
    notesPlaceholder: "Anota objetivos, conclusiones o decisiones basadas en datos.",
    Icon: TrendingUp,
    cta: "Guardar nota",
    amountEnabled: true,
    proFeatures: ["KPIs operativos", "Ingresos previstos", "Objetivos y evolución"],
  },
  "reservas-premium": {
    key: "booking_premium",
    title: "Reservas Premium",
    badge: "Booking PRO",
    description: "Define reglas avanzadas, bloqueos y mejoras de experiencia para reservas online.",
    recordLabel: "Nueva regla",
    titlePlaceholder: "Ej: Bloquear domingos",
    notesPlaceholder: "Describe la regla, bloqueo o condición especial de reservas.",
    Icon: SlidersHorizontal,
    cta: "Guardar regla",
    proFeatures: ["Reglas avanzadas", "Bloqueos especiales", "Experiencia de reserva mejorada"],
  },
  voice: {
    key: "voice",
    title: "Flowly Voice",
    badge: "Voz IA",
    description: "Registra llamadas, solicitudes telefónicas y casos para la futura centralita con IA.",
    recordLabel: "Nuevo registro de llamada",
    titlePlaceholder: "Ej: Llamada para cita nueva",
    notesPlaceholder: "Resumen de llamada, teléfono, intención y estado.",
    Icon: PhoneCall,
    cta: "Guardar llamada",
    proFeatures: ["Registro de llamadas", "Solicitudes telefónicas", "Preparado para centralita IA"],
  },
} satisfies Record<string, ModuleConfig>;

function firstRelation<T>(value: Relation<T>): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] || null : value;
}

function customerName(value: Relation<{ name?: string; full_name?: string }>) {
  const item = firstRelation(value);
  return item?.name || item?.full_name || "Cliente";
}

function dateValue(item: Appointment) {
  return item.appointment_date || item.starts_at || new Date().toISOString();
}

export default function ModulePage() {
  const router = useRouter();
  const params = useParams();
  const moduleSlug = params.module as ModuleSlug;
  const config = modules[moduleSlug] as ModuleConfig | undefined;

  const [business, setBusiness] = useState<Business | null>(null);
  const [activeModules, setActiveModules] = useState<BusinessModule[]>([]);
  const [records, setRecords] = useState<ModuleRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [amount, setAmount] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push("/login");
      return;
    }

    const { data: businessData } = await supabase
      .from("businesses")
      .select("id, name, plan")
      .eq("owner_id", userData.user.id)
      .maybeSingle();

    if (!businessData) {
      setLoading(false);
      return;
    }

    setBusiness(businessData as Business);
    const businessId = businessData.id as string;

    const [modulesRes, recordsRes, customersRes, appointmentsRes] = await Promise.all([
      supabase.from("business_modules").select("module_key, status").eq("business_id", businessId).eq("status", "active"),
      config ? supabase.from("module_records").select("*").eq("business_id", businessId).eq("module_key", config.key).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
      supabase.from("customers").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("appointments").select("id, appointment_date, starts_at, status, customers(name, full_name), services(name, price)").eq("business_id", businessId).order("appointment_date", { ascending: false }),
    ]);

    setActiveModules((modulesRes.data || []) as BusinessModule[]);
    setRecords((recordsRes.data || []) as ModuleRecord[]);
    setCustomers((customersRes.data || []) as unknown as Customer[]);
    setAppointments((appointmentsRes.data || []) as unknown as Appointment[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [moduleSlug]);

  const hasAccess = useMemo(() => {
    if (!config || !business) return false;
    if (business.plan === "premium") return true;
    return activeModules.some((item) => item.module_key === config.key);
  }, [activeModules, business, config]);

  const totalAmount = records.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const upcoming = appointments.filter((item) => item.status !== "cancelled").slice(0, 6);

  const createRecord = async () => {
    if (!business || !config || !title) return alert("Añade un título");
    const { error } = await supabase.from("module_records").insert({
      business_id: business.id,
      module_key: config.key,
      title,
      notes,
      amount: amount ? Number(amount) : null,
      status: "active",
    });

    if (error) return alert(error.message);
    setTitle("");
    setNotes("");
    setAmount("");
    await load();
  };

  const deleteRecord = async (id: string) => {
    const { error } = await supabase.from("module_records").delete().eq("id", id);
    if (error) return alert(error.message);
    await load();
  };

  if (!config) {
    return <Shell><Blocked title="Módulo no encontrado" text="El módulo solicitado no existe en Flowly IA." /></Shell>;
  }

  if (loading) return <Shell><div className="text-center text-white/70">Cargando módulo...</div></Shell>;

  const Icon = config.Icon;

  if (!hasAccess) {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl">
          <Link href="/dashboard" className="mb-6 inline-flex rounded-full border border-white/15 px-5 py-3 text-sm text-white/70">← Volver al panel</Link>
          <Blocked title="Este módulo no está activo" text="Puedes activarlo desde el área personal o contratarlo dentro del plan Modular." icon={<Icon size={30} />} />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-violet-300">Flowly IA · {config.badge}</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{config.title}</h1>
            <p className="mt-3 max-w-2xl text-white/60">{config.description}</p>
          </div>
          <Link href="/dashboard" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm">Volver al panel</Link>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <Metric icon={<CheckCircle2 />} label="Registros" value={records.length} />
          <Metric icon={<TrendingUp />} label="Importe" value={`${totalAmount.toFixed(2)}€`} />
          <Metric icon={<CalendarDays />} label="Reservas" value={appointments.length} />
          <Metric icon={<Icon />} label="Estado" value="Activo" />
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          {config.proFeatures.map((feature) => <Feature key={feature} text={feature} />)}
        </section>

        <section className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
          <GlassCard>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/20 text-violet-100"><Icon /></div>
            <h2 className="text-2xl font-semibold">{config.recordLabel}</h2>
            <p className="mt-2 text-sm text-white/55">Guarda información operativa de este módulo. Todo queda asociado al negocio.</p>
            <div className="mt-6 grid gap-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={config.titlePlaceholder} className="input-dark" />
             {(config as ModuleConfig).amountEnabled && (
  <input
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
    placeholder="Importe"
    type="number"
    className="input-dark"
  />
)}
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={config.notesPlaceholder} className="input-dark min-h-32" />
              <button onClick={createRecord} className="btn-primary"><Plus size={17} /> {config.cta}</button>
            </div>
          </GlassCard>

          <GlassCard title="Actividad del módulo">
            <div className="space-y-3">
              {records.map((record) => (
                <div key={record.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{record.title}</p>
                      {record.notes && <p className="mt-2 text-sm leading-6 text-white/55">{record.notes}</p>}
                      <p className="mt-2 text-xs text-white/35">{new Date(record.created_at).toLocaleString("es-ES")}</p>
                    </div>
                    {record.amount !== null && <p className="rounded-full bg-violet-500/20 px-3 py-1 text-sm text-violet-100">{Number(record.amount).toFixed(2)}€</p>}
                  </div>
                  <button onClick={() => deleteRecord(record.id)} className="mt-3 text-xs text-red-200/80">Eliminar</button>
                </div>
              ))}
              {!records.length && <Empty text="Aún no hay registros en este módulo." />}
            </div>
          </GlassCard>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <GlassCard title="Próximas reservas">
            <div className="space-y-3">
              {upcoming.map((item) => {
                const service = firstRelation(item.services);
                return <div key={item.id} className="rounded-2xl bg-black/25 p-4"><p className="font-medium">{customerName(item.customers)} · {service?.name || "Servicio"}</p><p className="mt-1 text-sm text-white/45">{new Date(dateValue(item)).toLocaleString("es-ES")}</p></div>;
              })}
              {!upcoming.length && <p className="text-sm text-white/45">Sin reservas próximas.</p>}
            </div>
          </GlassCard>

          <GlassCard title="Clientes recientes">
            <div className="space-y-3">
              {customers.slice(0, 6).map((customer) => <div key={customer.id} className="rounded-2xl bg-black/25 p-4"><p className="font-medium">{customer.name || customer.full_name}</p><p className="mt-1 text-sm text-white/45">{customer.phone || customer.email || "Sin contacto"}</p></div>)}
              {!customers.length && <p className="text-sm text-white/45">Sin clientes todavía.</p>}
            </div>
          </GlassCard>
        </section>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen overflow-hidden bg-[#070711] px-6 py-8 text-white"><div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,.55),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,.18),transparent_30%)]" /><div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:64px_64px]" /><div className="relative">{children}</div></main>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-100">{icon}</div><p className="text-sm text-white/50">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>;
}

function GlassCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">{title && <h2 className="mb-5 text-2xl font-semibold">{title}</h2>}{children}</div>;
}

function Feature({ text }: { text: string }) {
  return <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5"><CheckCircle2 className="mb-3 text-violet-200" size={22} /><p className="font-medium">{text}</p></div>;
}

function Blocked({ title, text, icon }: { title: string; text: string; icon?: React.ReactNode }) {
  return <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 text-center shadow-2xl shadow-black/20 backdrop-blur-xl">{icon && <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-100">{icon}</div>}<h1 className="text-3xl font-semibold">{title}</h1><p className="mt-3 text-white/60">{text}</p><Link href="/precios#modular" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 font-medium text-neutral-950">Ver módulos</Link></div>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/45">{text}</div>;
}
