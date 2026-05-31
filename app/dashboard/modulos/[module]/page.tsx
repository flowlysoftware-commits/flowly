"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Bot,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Megaphone,
  MessageCircle,
  PhoneCall,
  Plus,
  Receipt,
  SlidersHorizontal,
  Store,
  TrendingUp,
} from "lucide-react";

type Business = { id: string; name: string; plan: string };
type BusinessModule = { module_key: string; status: string };
type ModuleRecord = {
  id: string;
  business_id: string;
  module_key: string;
  title: string;
  amount: number | null;
  status: string;
  notes: string | null;
  created_at: string;
};
type Customer = { id: string; name: string; phone: string | null; email: string | null };
type Appointment = {
  id: string;
  appointment_date: string;
  status: string;
  customers: { name: string } | null;
  services: { name: string; price: number } | null;
};

type ModuleSlug = keyof typeof modules;

const modules = {
  whatsapp: {
    key: "whatsapp",
    title: "WhatsApp automático",
    description: "Prepara confirmaciones, recordatorios y mensajes de recuperación para tus clientes.",
    recordLabel: "Nueva plantilla",
    titlePlaceholder: "Ej: Recordatorio 24h antes",
    notesPlaceholder: "Hola {cliente}, te recordamos tu cita en {negocio} mañana a las {hora}.",
    Icon: MessageCircle,
    cta: "Guardar plantilla",
    stats: ["Plantillas", "Reservas próximas", "Clientes"],
  },
  facturacion: {
    key: "billing",
    title: "Facturación",
    description: "Registra facturas, gastos, presupuestos y movimientos sencillos del negocio.",
    recordLabel: "Nuevo movimiento",
    titlePlaceholder: "Ej: Factura corte y color",
    notesPlaceholder: "Notas del movimiento, cliente, forma de pago o concepto.",
    Icon: Receipt,
    cta: "Guardar movimiento",
    stats: ["Movimientos", "Importe total", "Reservas"],
  },
  tpv: {
    key: "pos",
    title: "TPV",
    description: "Crea tickets rápidos de caja y controla ventas presenciales desde el panel.",
    recordLabel: "Nuevo ticket",
    titlePlaceholder: "Ej: Ticket mostrador #001",
    notesPlaceholder: "Productos, método de pago o empleado que cobra.",
    Icon: Store,
    cta: "Guardar ticket",
    stats: ["Tickets", "Caja registrada", "Clientes"],
  },
  crm: {
    key: "crm",
    title: "CRM avanzado",
    description: "Crea seguimientos, segmenta clientes y detecta oportunidades de reactivación.",
    recordLabel: "Nuevo seguimiento",
    titlePlaceholder: "Ej: Reactivar cliente inactivo",
    notesPlaceholder: "Cliente, acción recomendada y próxima fecha de contacto.",
    Icon: CreditCard,
    cta: "Guardar seguimiento",
    stats: ["Seguimientos", "Clientes", "Acciones"],
  },
  marketing: {
    key: "marketing",
    title: "Marketing",
    description: "Planifica campañas, promociones y acciones para recuperar clientes.",
    recordLabel: "Nueva campaña",
    titlePlaceholder: "Ej: Promo color viernes",
    notesPlaceholder: "Oferta, público objetivo, canal y fecha prevista.",
    Icon: Megaphone,
    cta: "Guardar campaña",
    stats: ["Campañas", "Clientes", "Reservas"],
  },
  ia: {
    key: "ai",
    title: "IA Assistant",
    description: "Genera notas inteligentes, resúmenes operativos y sugerencias para mejorar el negocio.",
    recordLabel: "Nueva instrucción IA",
    titlePlaceholder: "Ej: Resumen semanal",
    notesPlaceholder: "Qué quieres que analice Flowly IA con tus datos.",
    Icon: Bot,
    cta: "Guardar instrucción",
    stats: ["Instrucciones", "Clientes", "Reservas"],
  },
  estadisticas: {
    key: "analytics",
    title: "Estadísticas avanzadas",
    description: "KPIs de actividad, ingresos previstos, ocupación y evolución de reservas.",
    recordLabel: "Nueva nota KPI",
    titlePlaceholder: "Ej: Objetivo mensual",
    notesPlaceholder: "Anota objetivos, conclusiones o decisiones basadas en datos.",
    Icon: TrendingUp,
    cta: "Guardar nota",
    stats: ["Notas", "Ingresos", "Reservas"],
  },
  "reservas-premium": {
    key: "booking_premium",
    title: "Reservas Premium",
    description: "Define reglas avanzadas, bloqueos y mejoras de experiencia para reservas online.",
    recordLabel: "Nueva regla",
    titlePlaceholder: "Ej: Bloquear domingos",
    notesPlaceholder: "Describe la regla, bloqueo o condición especial de reservas.",
    Icon: SlidersHorizontal,
    cta: "Guardar regla",
    stats: ["Reglas", "Reservas", "Clientes"],
  },
  voice: {
    key: "voice",
    title: "Flowly Voice",
    description: "Registra llamadas, solicitudes telefónicas y casos para la futura centralita IA.",
    recordLabel: "Nuevo registro de llamada",
    titlePlaceholder: "Ej: Llamada para cita nueva",
    notesPlaceholder: "Resumen de llamada, teléfono, intención y estado.",
    Icon: PhoneCall,
    cta: "Guardar llamada",
    stats: ["Registros", "Clientes", "Reservas"],
  },
};

export default function ModulePage() {
  const router = useRouter();
  const params = useParams();
  const moduleSlug = params.module as ModuleSlug;
  const config = modules[moduleSlug];

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
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push("/login");
      return;
    }

    const { data: businessData } = await supabase
      .from("businesses")
      .select("id, name, plan")
      .eq("owner_id", userData.user.id)
      .single();

    if (!businessData) {
      setLoading(false);
      return;
    }

    setBusiness(businessData as Business);
    const businessId = businessData.id as string;

    const [modulesRes, recordsRes, customersRes, appointmentsRes] = await Promise.all([
      supabase.from("business_modules").select("module_key, status").eq("business_id", businessId).eq("status", "active"),
      config ? supabase.from("module_records").select("*").eq("business_id", businessId).eq("module_key", config.key).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
      supabase.from("customers").select("id, name, phone, email").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase
        .from("appointments")
        .select("id, appointment_date, status, customers(name), services(name, price)")
        .eq("business_id", businessId)
        .order("appointment_date", { ascending: false }),
    ]);

    setActiveModules((modulesRes.data || []) as BusinessModule[]);
    setRecords((recordsRes.data || []) as ModuleRecord[]);
    setCustomers((customersRes.data || []) as Customer[]);
    setAppointments((appointmentsRes.data || []) as Appointment[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router, moduleSlug]);

  const hasAccess = useMemo(() => {
    if (!config || !business) return false;
    if (business.plan === "premium") return true;
    return activeModules.some((item) => item.module_key === config.key);
  }, [activeModules, business, config]);

  const totalAmount = records.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const upcoming = appointments.filter((item) => item.status !== "cancelled").slice(0, 5);

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
    return (
      <Shell>
        <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 text-center">
          <h1 className="text-3xl font-semibold">Módulo no encontrado</h1>
          <Link href="/dashboard" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-neutral-950">Volver al panel</Link>
        </div>
      </Shell>
    );
  }

  if (loading) return <Shell><div className="text-center text-white/70">Cargando módulo...</div></Shell>;

  const Icon = config.Icon;

  return (
    <Shell>
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-violet-300">Flowly IA · Módulo operativo</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{config.title}</h1>
            <p className="mt-3 max-w-2xl text-white/60">{config.description}</p>
          </div>
          <Link href="/dashboard" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm">Volver al panel</Link>
        </header>

        {!hasAccess ? (
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/20 text-violet-100"><Icon /></div>
            <h2 className="text-2xl font-semibold">Este módulo no está activo</h2>
            <p className="mt-3 text-white/60">Este negocio no tiene contratado este módulo. Puedes activarlo desde Facturación o cambiando de plan.</p>
            <Link href="/precios#modular" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 font-medium text-neutral-950">Ver módulos</Link>
          </section>
        ) : (
          <>
            <section className="mb-6 grid gap-4 md:grid-cols-3">
              <Metric icon={<CheckCircle2 />} label={config.stats[0]} value={records.length} />
              <Metric icon={<TrendingUp />} label={config.stats[1]} value={config.key === "billing" || config.key === "pos" ? `${totalAmount.toFixed(2)}€` : customers.length} />
              <Metric icon={<CalendarDays />} label={config.stats[2]} value={appointments.length} />
            </section>

            <section className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/20 text-violet-100"><Icon /></div>
                <h2 className="text-2xl font-semibold">{config.recordLabel}</h2>
                <p className="mt-2 text-sm text-white/55">Guarda información operativa de este módulo. Queda asociada a este negocio.</p>
                <div className="mt-6 grid gap-3">
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={config.titlePlaceholder} className="input-dark" />
                  {(config.key === "billing" || config.key === "pos") && (
                    <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Importe" type="number" className="input-dark" />
                  )}
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={config.notesPlaceholder} className="input-dark min-h-32" />
                  <button onClick={createRecord} className="btn-primary"><Plus size={17} /> {config.cta}</button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <h2 className="text-2xl font-semibold">Actividad del módulo</h2>
                <div className="mt-6 space-y-3">
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
                  {!records.length && <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/45">Aún no hay registros en este módulo.</div>}
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <h2 className="text-xl font-semibold">Próximas reservas</h2>
                <div className="mt-5 space-y-3">
                  {upcoming.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-black/25 p-4">
                      <p className="font-medium">{item.customers?.name || "Cliente"} · {item.services?.name || "Servicio"}</p>
                      <p className="mt-1 text-sm text-white/45">{new Date(item.appointment_date).toLocaleString("es-ES")}</p>
                    </div>
                  ))}
                  {!upcoming.length && <p className="text-sm text-white/45">Sin reservas próximas.</p>}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <h2 className="text-xl font-semibold">Clientes recientes</h2>
                <div className="mt-5 space-y-3">
                  {customers.slice(0, 5).map((customer) => (
                    <div key={customer.id} className="rounded-2xl bg-black/25 p-4">
                      <p className="font-medium">{customer.name}</p>
                      <p className="mt-1 text-sm text-white/45">{customer.phone || customer.email || "Sin contacto"}</p>
                    </div>
                  ))}
                  {!customers.length && <p className="text-sm text-white/45">Sin clientes todavía.</p>}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070711] px-6 py-8 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,.55),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,.18),transparent_30%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="relative">{children}</div>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-100">{icon}</div>
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
