"use client";

import Link from "next/link";
import { Children, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  LogOut,
  Megaphone,
  MessageCircle,
  PhoneCall,
  Plus,
  Receipt,
  Scissors,
  Settings,
  SlidersHorizontal,
  Store,
  TrendingUp,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

type Business = {
  id: string;
  name: string;
  business_type: string;
  plan: string;
  subscription_status: string;
};

type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
  active: boolean;
};

type Employee = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  active: boolean;
};

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
};

type Appointment = {
  id: string;
  appointment_date: string;
  status: string;
  customers: { name: string } | null;
  employees: { name: string } | null;
  services: { name: string; price: number } | null;
};

type BookingSettings = {
  id?: string;
  business_id: string;
  start_time: string;
  end_time: string;
  interval_minutes: number;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
};

type BusinessModule = {
  id?: string;
  business_id: string;
  module_key: string;
  status: string;
};

type Tab = "Agenda" | "Servicios" | "Empleados" | "Clientes" | "Módulos" | "Ajustes";

const moduleCatalog = [
  { id: "whatsapp", name: "WhatsApp automático", price: "9,99€", description: "Recordatorios, confirmaciones y mensajes preparados.", Icon: MessageCircle, href: "/dashboard/modulos/whatsapp" },
  { id: "billing", name: "Facturación", price: "9,99€", description: "Facturas, gastos, presupuestos y control mensual.", Icon: Receipt, href: "/dashboard/modulos/facturacion" },
  { id: "pos", name: "TPV", price: "14,99€", description: "Caja, tickets, cobros y ventas presenciales.", Icon: Store, href: "/dashboard/modulos/tpv" },
  { id: "crm", name: "CRM avanzado", price: "9,99€", description: "Segmentación, clientes inactivos y seguimiento.", Icon: CreditCard, href: "/dashboard/modulos/crm" },
  { id: "marketing", name: "Marketing", price: "9,99€", description: "Campañas, promociones y recuperación de clientes.", Icon: Megaphone, href: "/dashboard/modulos/marketing" },
  { id: "ai", name: "IA Assistant", price: "14,99€", description: "Resumen del día, sugerencias y automatización inteligente.", Icon: Bot, href: "/dashboard/modulos/ia" },
  { id: "analytics", name: "Estadísticas avanzadas", price: "4,99€", description: "KPIs, previsión, servicios top y evolución.", Icon: TrendingUp, href: "/dashboard/modulos/estadisticas" },
  { id: "booking_premium", name: "Reservas Premium", price: "4,99€", description: "Personalización avanzada de reservas online.", Icon: SlidersHorizontal, href: "/dashboard/modulos/reservas-premium" },
  { id: "voice", name: "Flowly Voice", price: "29,99€", description: "Centralita, recepción y agendado por voz con IA.", Icon: PhoneCall, href: "/dashboard/modulos/voice" },
];

const defaultSettings = (businessId: string): BookingSettings => ({
  business_id: businessId,
  start_time: "09:00",
  end_time: "19:00",
  interval_minutes: 30,
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
});

export default function DashboardPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [modules, setModules] = useState<BusinessModule[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("Agenda");
  const [origin, setOrigin] = useState("");
  const [loading, setLoading] = useState(true);

  const [serviceName, setServiceName] = useState("");
  const [serviceDuration, setServiceDuration] = useState("30");
  const [servicePrice, setServicePrice] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeePhone, setEmployeePhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [appointmentCustomer, setAppointmentCustomer] = useState("");
  const [appointmentEmployee, setAppointmentEmployee] = useState("");
  const [appointmentService, setAppointmentService] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      router.push("/login");
      return;
    }

    const { data: businessData } = await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", userData.user.id)
      .single();

    if (!businessData) {
      setLoading(false);
      return;
    }

    const businessId = businessData.id as string;
    setBusiness(businessData as Business);

    const [servicesRes, employeesRes, customersRes, appointmentsRes, settingsRes, modulesRes] = await Promise.all([
      supabase.from("services").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("employees").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("customers").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase
        .from("appointments")
        .select("*, customers(name), employees(name), services(name, price)")
        .eq("business_id", businessId)
        .order("appointment_date", { ascending: true }),
      supabase.from("booking_settings").select("*").eq("business_id", businessId).maybeSingle(),
      supabase.from("business_modules").select("*").eq("business_id", businessId).eq("status", "active"),
    ]);

    setServices((servicesRes.data || []) as Service[]);
    setEmployees((employeesRes.data || []) as Employee[]);
    setCustomers((customersRes.data || []) as Customer[]);
    setAppointments((appointmentsRes.data || []) as Appointment[]);
    setSettings((settingsRes.data as BookingSettings) || defaultSettings(businessId));
    setModules((modulesRes.data || []) as BusinessModule[]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeModuleKeys = useMemo(() => {
    if (business?.plan === "premium") return moduleCatalog.map((item) => item.id);
    return modules.map((item) => item.module_key);
  }, [business?.plan, modules]);

  const activeModules = moduleCatalog.filter((item) => activeModuleKeys.includes(item.id));
  const inactiveModules = moduleCatalog.filter((item) => !activeModuleKeys.includes(item.id));

  const bookingUrl = useMemo(() => {
    if (!origin || !business?.id) return "";
    return `${origin}/reservas/${business.id}`;
  }, [origin, business?.id]);

  const revenue = appointments
    .filter((item) => item.status !== "cancelled")
    .reduce((sum, item) => sum + Number(item.services?.price || 0), 0);

  const pendingAppointments = appointments.filter((item) => item.status === "pending").length;
  const nextAppointments = appointments.slice(0, 5);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const openBillingPortal = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      router.push("/login");
      return;
    }

    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await res.json();
    if (result.url) window.location.href = result.url;
    else alert(result.error || "No se pudo abrir la facturación");
  };

  const createService = async () => {
    if (!business || !serviceName || !servicePrice) return alert("Faltan datos");
    const { error } = await supabase.from("services").insert({
      business_id: business.id,
      name: serviceName,
      duration: Number(serviceDuration),
      price: Number(servicePrice),
    });
    if (error) return alert(error.message);
    setServiceName("");
    setServicePrice("");
    await loadData();
  };

  const createEmployee = async () => {
    if (!business || !employeeName) return alert("Faltan datos");
    const { error } = await supabase.from("employees").insert({
      business_id: business.id,
      name: employeeName,
      phone: employeePhone,
    });
    if (error) return alert(error.message);
    setEmployeeName("");
    setEmployeePhone("");
    await loadData();
  };

  const createCustomer = async () => {
    if (!business || !customerName) return alert("Faltan datos");
    const { error } = await supabase.from("customers").insert({
      business_id: business.id,
      name: customerName,
      phone: customerPhone,
    });
    if (error) return alert(error.message);
    setCustomerName("");
    setCustomerPhone("");
    await loadData();
  };

  const createAppointment = async () => {
    if (!business || !appointmentCustomer || !appointmentEmployee || !appointmentService || !appointmentDate) {
      return alert("Faltan datos");
    }

    const { error } = await supabase.from("appointments").insert({
      business_id: business.id,
      customer_id: appointmentCustomer,
      employee_id: appointmentEmployee,
      service_id: appointmentService,
      appointment_date: appointmentDate,
      status: "confirmed",
    });
    if (error) return alert(error.message);

    setAppointmentCustomer("");
    setAppointmentEmployee("");
    setAppointmentService("");
    setAppointmentDate("");
    await loadData();
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) return alert(error.message);
    await loadData();
  };

  const saveSettings = async () => {
    if (!business || !settings) return;
    const { error } = await supabase.from("booking_settings").upsert({ ...settings, business_id: business.id });
    if (error) alert(error.message);
    else {
      alert("Ajustes guardados");
      await loadData();
    }
  };

  if (loading || !business || !settings) {
    return <main className="flex min-h-screen items-center justify-center bg-[#070711] text-white">Cargando panel...</main>;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#070711] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,.55),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,.18),transparent_30%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative mx-auto flex max-w-[1500px] flex-col gap-6 px-5 py-6 lg:flex-row">
        <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/30 backdrop-blur-xl lg:sticky lg:top-6 lg:w-72">
          <div className="mb-6 rounded-[1.5rem] bg-neutral-950/70 p-5">
            <p className="text-xl font-semibold tracking-tight">Flowly IA</p>
            <p className="mt-1 text-sm text-violet-200">Panel cliente</p>
          </div>

          <nav className="grid gap-2">
            {(["Agenda", "Servicios", "Empleados", "Clientes", "Módulos", "Ajustes"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={
                  activeTab === tab
                    ? "rounded-2xl bg-white px-4 py-3 text-left text-sm font-medium text-neutral-950"
                    : "rounded-2xl px-4 py-3 text-left text-sm text-white/65 hover:bg-white/10 hover:text-white"
                }
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="mt-6 grid gap-2">
            <button onClick={openBillingPortal} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left text-sm text-white/80">
              <CreditCard size={17} className="mr-2 inline" /> Facturación
            </button>
            <button onClick={logout} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left text-sm text-white/80">
              <LogOut size={17} className="mr-2 inline" /> Salir
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-7 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-medium text-violet-300">{business.business_type} · Plan {business.plan}</p>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{business.name}</h1>
                <p className="mt-3 max-w-2xl text-white/60">
                  Gestiona reservas, clientes, servicios y módulos desde un único centro operativo.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-violet-300/20 bg-violet-500/15 px-5 py-4 text-violet-100">
                <p className="text-sm text-violet-200">Estado suscripción</p>
                <p className="mt-1 text-2xl font-semibold capitalize">{business.subscription_status}</p>
              </div>
            </div>
          </header>

          <section className="mb-6 grid gap-4 md:grid-cols-4">
            <Metric icon={<CalendarDays />} label="Reservas" value={appointments.length} helper="Agenda total" />
            <Metric icon={<Clock />} label="Pendientes" value={pendingAppointments} helper="Por confirmar" />
            <Metric icon={<Users />} label="Clientes" value={customers.length} helper="Base activa" />
            <Metric icon={<TrendingUp />} label="Ingresos previstos" value={`${revenue.toFixed(2)}€`} helper="No canceladas" />
          </section>

          <section className="mb-6 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
            <GlassCard>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-sm font-medium text-violet-300">Enlace público de reservas</p>
                  <h2 className="mt-2 text-2xl font-semibold">Comparte tu agenda online</h2>
                  <p className="mt-2 text-sm text-white/55">Tus clientes eligen servicio, profesional, día y hora.</p>
                </div>
                <CalendarDays className="text-violet-200" size={38} />
              </div>
              <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-black/30 p-4 md:flex-row md:items-center md:justify-between">
                <code className="break-all text-sm text-white/75">{bookingUrl}</code>
                <button
                  onClick={() => {
                    if (!bookingUrl) return;
                    navigator.clipboard.writeText(bookingUrl);
                    alert("Enlace copiado");
                  }}
                  className="rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950"
                >
                  Copiar
                </button>
              </div>
            </GlassCard>

            <GlassCard>
              <p className="text-sm font-medium text-violet-300">Módulos activos</p>
              <h2 className="mt-2 text-2xl font-semibold">{activeModules.length} módulos habilitados</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {activeModules.length ? activeModules.slice(0, 7).map((item) => <Pill key={item.id}>{item.name}</Pill>) : <p className="text-sm text-white/50">Solo núcleo Flowly activo.</p>}
              </div>
            </GlassCard>
          </section>

          {activeTab === "Agenda" && (
            <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
              <GlassCard title="Nueva reserva">
                <div className="grid gap-3">
                  <Select value={appointmentCustomer} onChange={setAppointmentCustomer} placeholder="Seleccionar cliente" options={customers.map((c) => ({ value: c.id, label: c.name }))} />
                  <Select value={appointmentEmployee} onChange={setAppointmentEmployee} placeholder="Seleccionar empleado" options={employees.map((e) => ({ value: e.id, label: e.name }))} />
                  <Select value={appointmentService} onChange={setAppointmentService} placeholder="Seleccionar servicio" options={services.map((s) => ({ value: s.id, label: `${s.name} · ${s.price}€` }))} />
                  <input type="datetime-local" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} className="input-dark" />
                  <button onClick={createAppointment} className="btn-primary"><Plus size={17} /> Crear reserva</button>
                </div>
              </GlassCard>

              <GlassCard title="Calendario operativo">
                <div className="space-y-3">
                  {nextAppointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                        <div>
                          <p className="font-semibold">{new Date(appointment.appointment_date).toLocaleString("es-ES")}</p>
                          <p className="mt-1 text-sm text-white/58">
                            {appointment.customers?.name || "Cliente"} · {appointment.services?.name || "Servicio"} · {appointment.employees?.name || "Sin empleado"}
                          </p>
                          <p className="mt-2 text-sm font-medium text-violet-200">{appointment.services?.price || 0}€ · {translateStatus(appointment.status)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <StatusButton onClick={() => updateAppointmentStatus(appointment.id, "confirmed")} tone="green"><CheckCircle2 size={14} /> Confirmar</StatusButton>
                          <StatusButton onClick={() => updateAppointmentStatus(appointment.id, "completed")} tone="violet">Completada</StatusButton>
                          <StatusButton onClick={() => updateAppointmentStatus(appointment.id, "cancelled")} tone="red"><XCircle size={14} /> Cancelar</StatusButton>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!appointments.length && <EmptyState text="Todavía no hay reservas." />}
                </div>
              </GlassCard>
            </section>
          )}

          {activeTab === "Servicios" && (
            <TwoColumns leftTitle="Nuevo servicio" rightTitle="Servicios creados">
              <div className="grid gap-3">
                <input value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="Nombre del servicio" className="input-dark" />
                <input value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)} placeholder="Duración en minutos" type="number" className="input-dark" />
                <input value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} placeholder="Precio" type="number" className="input-dark" />
                <button onClick={createService} className="btn-primary">Crear servicio</button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {services.map((service) => <MiniCard key={service.id} title={service.name} text={`${service.duration} min`} value={`${Number(service.price).toFixed(2)}€`} />)}
                {!services.length && <EmptyState text="Crea tu primer servicio." />}
              </div>
            </TwoColumns>
          )}

          {activeTab === "Empleados" && (
            <TwoColumns leftTitle="Nuevo empleado" rightTitle="Equipo">
              <div className="grid gap-3">
                <input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="Nombre" className="input-dark" />
                <input value={employeePhone} onChange={(e) => setEmployeePhone(e.target.value)} placeholder="Teléfono" className="input-dark" />
                <button onClick={createEmployee} className="btn-primary">Crear empleado</button>
              </div>
              <div className="space-y-3">
                {employees.map((employee) => <ListItem key={employee.id} title={employee.name} subtitle={employee.phone || "Sin teléfono"} />)}
                {!employees.length && <EmptyState text="Crea tu primer empleado." />}
              </div>
            </TwoColumns>
          )}

          {activeTab === "Clientes" && (
            <TwoColumns leftTitle="Nuevo cliente" rightTitle="Clientes">
              <div className="grid gap-3">
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nombre" className="input-dark" />
                <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Teléfono" className="input-dark" />
                <button onClick={createCustomer} className="btn-primary">Crear cliente</button>
              </div>
              <div className="space-y-3">
                {customers.map((customer) => <ListItem key={customer.id} title={customer.name} subtitle={customer.phone || "Sin teléfono"} />)}
                {!customers.length && <EmptyState text="Crea tu primer cliente." />}
              </div>
            </TwoColumns>
          )}

          {activeTab === "Módulos" && (
            <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {activeModules.map((item) => {
                const Icon = item.Icon;
                return (
                  <Link key={item.id} href={item.href} className="group rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.1]">
                    <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-100"><Icon size={24} /></div>
                    <p className="text-sm text-violet-300">Activo</p>
                    <h3 className="mt-2 text-2xl font-semibold">{item.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/58">{item.description}</p>
                    <p className="mt-5 text-sm font-medium text-white">Abrir módulo →</p>
                  </Link>
                );
              })}
              {inactiveModules.map((item) => {
                const Icon = item.Icon;
                return (
                  <div key={item.id} className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 opacity-80">
                    <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-2xl bg-white/10 text-white/60"><Icon size={24} /></div>
                    <p className="text-sm text-white/40">No contratado · {item.price}/mes</p>
                    <h3 className="mt-2 text-xl font-semibold text-white/80">{item.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/45">{item.description}</p>
                    <button onClick={openBillingPortal} className="mt-5 rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-950">Activar</button>
                  </div>
                );
              })}
            </section>
          )}

          {activeTab === "Ajustes" && (
            <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
              <GlassCard title="Horario de reservas">
                <div className="grid gap-3">
                  <Label>Hora apertura</Label>
                  <input type="time" value={settings.start_time} onChange={(e) => setSettings({ ...settings, start_time: e.target.value })} className="input-dark" />
                  <Label>Hora cierre</Label>
                  <input type="time" value={settings.end_time} onChange={(e) => setSettings({ ...settings, end_time: e.target.value })} className="input-dark" />
                  <Label>Intervalo entre citas</Label>
                  <select value={settings.interval_minutes} onChange={(e) => setSettings({ ...settings, interval_minutes: Number(e.target.value) })} className="input-dark">
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos</option>
                  </select>
                  <button onClick={saveSettings} className="btn-primary"><Settings size={17} /> Guardar ajustes</button>
                </div>
              </GlassCard>
              <GlassCard title="Días activos">
                <div className="grid gap-3 md:grid-cols-2">
                  <DayToggle label="Lunes" checked={settings.monday} onChange={(v) => setSettings({ ...settings, monday: v })} />
                  <DayToggle label="Martes" checked={settings.tuesday} onChange={(v) => setSettings({ ...settings, tuesday: v })} />
                  <DayToggle label="Miércoles" checked={settings.wednesday} onChange={(v) => setSettings({ ...settings, wednesday: v })} />
                  <DayToggle label="Jueves" checked={settings.thursday} onChange={(v) => setSettings({ ...settings, thursday: v })} />
                  <DayToggle label="Viernes" checked={settings.friday} onChange={(v) => setSettings({ ...settings, friday: v })} />
                  <DayToggle label="Sábado" checked={settings.saturday} onChange={(v) => setSettings({ ...settings, saturday: v })} />
                  <DayToggle label="Domingo" checked={settings.sunday} onChange={(v) => setSettings({ ...settings, sunday: v })} />
                </div>
              </GlassCard>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string | number; helper: string }) {
  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-100">{icon}</div>
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-white/40">{helper}</p>
    </div>
  );
}

function GlassCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
      {title && <h2 className="mb-5 text-xl font-semibold">{title}</h2>}
      {children}
    </div>
  );
}

function TwoColumns({ leftTitle, rightTitle, children }: { leftTitle: string; rightTitle: string; children: React.ReactNode }) {
  const items = Children.toArray(children);

  return (
    <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
      <GlassCard title={leftTitle}>{items[0]}</GlassCard>
      <GlassCard title={rightTitle}>{items[1]}</GlassCard>
    </section>
  );
}

function Select({ value, onChange, placeholder, options }: { value: string; onChange: (value: string) => void; placeholder: string; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input-dark">
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );
}

function MiniCard({ title, text, value }: { title: string; text: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-white/50">{text}</p>
      <p className="mt-3 text-2xl font-semibold text-violet-100">{value}</p>
    </div>
  );
}

function ListItem({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-white/50">{subtitle}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/45">{text}</div>;
}

function StatusButton({ children, onClick, tone }: { children: React.ReactNode; onClick: () => void; tone: "green" | "violet" | "red" }) {
  const styles = {
    green: "border-green-300/25 bg-green-400/10 text-green-200",
    violet: "border-violet-300/25 bg-violet-400/10 text-violet-200",
    red: "border-red-300/25 bg-red-400/10 text-red-200",
  };
  return <button onClick={onClick} className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-xs ${styles[tone]}`}>{children}</button>;
}

function DayToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <span className="font-medium">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-violet-500" />
    </label>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-white/70">{children}</label>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-violet-300/20 bg-violet-500/15 px-3 py-1 text-xs text-violet-100">{children}</span>;
}

function translateStatus(status: string) {
  if (status === "pending") return "Pendiente";
  if (status === "confirmed") return "Confirmada";
  if (status === "completed") return "Completada";
  if (status === "cancelled") return "Cancelada";
  return status;
}
