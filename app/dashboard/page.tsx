"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
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
  Sparkles,
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
  id: string;
  business_id: string;
  module_key: string;
  status: string;
};

type Tab =
  | "Agenda"
  | "Servicios"
  | "Empleados"
  | "Clientes"
  | "Módulos"
  | "Ajustes";

const moduleCatalog = [
  {
    id: "whatsapp",
    name: "WhatsApp automático",
    price: "9,99€",
    description: "Confirmaciones, recordatorios y avisos automáticos.",
    Icon: MessageCircle,
    href: "/dashboard/modulos/whatsapp",
  },
  {
    id: "billing",
    name: "Facturación",
    price: "9,99€",
    description: "Facturas, presupuestos, gastos e ingresos.",
    Icon: Receipt,
    href: "/dashboard/modulos/facturacion",
  },
  {
    id: "pos",
    name: "TPV",
    price: "14,99€",
    description: "Cobros, caja, tickets y ventas presenciales.",
    Icon: Store,
    href: "/dashboard/modulos/tpv",
  },
  {
    id: "crm",
    name: "CRM avanzado",
    price: "9,99€",
    description: "Segmentación, seguimiento y clientes inactivos.",
    Icon: CreditCard,
    href: "/dashboard/modulos/crm",
  },
  {
    id: "marketing",
    name: "Marketing",
    price: "9,99€",
    description: "Campañas, promociones y recuperación de clientes.",
    Icon: Megaphone,
    href: "/dashboard/modulos/marketing",
  },
  {
    id: "ai",
    name: "IA Assistant",
    price: "14,99€",
    description: "Resúmenes, sugerencias y automatizaciones inteligentes.",
    Icon: Bot,
    href: "/dashboard/modulos/ia",
  },
  {
    id: "analytics",
    name: "Estadísticas avanzadas",
    price: "4,99€",
    description: "KPIs, evolución, previsión y rendimiento.",
    Icon: TrendingUp,
    href: "/dashboard/modulos/estadisticas",
  },
  {
    id: "booking_premium",
    name: "Reservas Premium",
    price: "4,99€",
    description: "Página de reservas avanzada y personalizable.",
    Icon: SlidersHorizontal,
    href: "/dashboard/modulos/reservas-premium",
  },
  {
    id: "voice",
    name: "Flowly Voice",
    price: "29,99€",
    description: "Centralita, recepción y agendado por voz con IA.",
    Icon: PhoneCall,
    href: "/dashboard/modulos/voice",
  },
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

    if (!businessData) return;

    setBusiness(businessData as Business);

    const businessId = businessData.id;

    const [
      { data: servicesData },
      { data: employeesData },
      { data: customersData },
      { data: appointmentsData },
      { data: settingsData },
      { data: modulesData },
    ] = await Promise.all([
      supabase.from("services").select("*").eq("business_id", businessId).order("created_at"),
      supabase.from("employees").select("*").eq("business_id", businessId).order("created_at"),
      supabase.from("customers").select("*").eq("business_id", businessId).order("created_at"),
      supabase
        .from("appointments")
        .select("*, customers(name), employees(name), services(name, price)")
        .eq("business_id", businessId)
        .order("appointment_date"),
      supabase.from("booking_settings").select("*").eq("business_id", businessId).maybeSingle(),
      supabase.from("business_modules").select("*").eq("business_id", businessId).eq("status", "active"),
    ]);

    setServices((servicesData || []) as Service[]);
    setEmployees((employeesData || []) as Employee[]);
    setCustomers((customersData || []) as Customer[]);
    setAppointments((appointmentsData || []) as Appointment[]);
    setSettings((settingsData as BookingSettings) || defaultSettings(businessId));
    setModules((modulesData || []) as BusinessModule[]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeModuleKeys = useMemo(() => {
    const keys = modules.map((item) => item.module_key);
    if (business?.plan === "premium") return moduleCatalog.map((item) => item.id);
    return keys;
  }, [modules, business?.plan]);

  const activeModules = moduleCatalog.filter((item) => activeModuleKeys.includes(item.id));
  const inactiveModules = moduleCatalog.filter((item) => !activeModuleKeys.includes(item.id));

  const bookingUrl = useMemo(() => {
    if (!origin || !business?.id) return "";
    return `${origin}/reservas/${business.id}`;
  }, [origin, business?.id]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const openBillingPortal = async () => {
    try {
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

      if (result.url) {
        window.location.href = result.url;
      } else {
        alert(result.error || "No se pudo abrir la facturación");
      }
    } catch (error) {
      console.error(error);
      alert("Error abriendo la facturación");
    }
  };

  const createService = async () => {
    if (!business || !serviceName || !servicePrice) return alert("Faltan datos");

    await supabase.from("services").insert({
      business_id: business.id,
      name: serviceName,
      duration: Number(serviceDuration),
      price: Number(servicePrice),
    });

    setServiceName("");
    setServicePrice("");
    await loadData();
  };

  const createEmployee = async () => {
    if (!business || !employeeName) return alert("Faltan datos");

    await supabase.from("employees").insert({
      business_id: business.id,
      name: employeeName,
      phone: employeePhone,
    });

    setEmployeeName("");
    setEmployeePhone("");
    await loadData();
  };

  const createCustomer = async () => {
    if (!business || !customerName) return alert("Faltan datos");

    await supabase.from("customers").insert({
      business_id: business.id,
      name: customerName,
      phone: customerPhone,
    });

    setCustomerName("");
    setCustomerPhone("");
    await loadData();
  };

  const createAppointment = async () => {
    if (!business || !appointmentCustomer || !appointmentEmployee || !appointmentService || !appointmentDate) {
      return alert("Faltan datos");
    }

    await supabase.from("appointments").insert({
      business_id: business.id,
      customer_id: appointmentCustomer,
      employee_id: appointmentEmployee,
      service_id: appointmentService,
      appointment_date: appointmentDate,
      status: "confirmed",
    });

    setAppointmentCustomer("");
    setAppointmentEmployee("");
    setAppointmentService("");
    setAppointmentDate("");
    await loadData();
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    await supabase.from("appointments").update({ status }).eq("id", id);
    await loadData();
  };

  const saveSettings = async () => {
    if (!business || !settings) return;

    const { error } = await supabase.from("booking_settings").upsert({
      ...settings,
      business_id: business.id,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Ajustes guardados");
      await loadData();
    }
  };

  const revenue = appointments
    .filter((item) => item.status !== "cancelled")
    .reduce((sum, item) => sum + Number(item.services?.price || 0), 0);

  const pendingAppointments = appointments.filter((item) => item.status === "pending").length;

  if (!business || !settings) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070711] text-white">
        Cargando panel...
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#6d28d9_0%,#111827_34%,#020617_100%)] px-6 py-8 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="relative mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-violet-300">Flowly IA · Panel cliente</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{business.name}</h1>
            <p className="mt-2 text-white/60">
              {business.business_type} · Plan {business.plan} · Estado {business.subscription_status}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={openBillingPortal} className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm shadow-lg backdrop-blur">
              <CreditCard size={18} className="inline" /> Facturación
            </button>
            <button onClick={logout} className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm shadow-lg backdrop-blur">
              <LogOut size={18} className="inline" /> Salir
            </button>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <Metric icon={<CalendarDays />} label="Reservas" value={appointments.length} helper="Total agenda" />
          <Metric icon={<Clock />} label="Pendientes" value={pendingAppointments} helper="Por confirmar" />
          <Metric icon={<Users />} label="Clientes" value={customers.length} helper="Base activa" />
          <Metric icon={<UserRound />} label="Ingresos previstos" value={`${revenue.toFixed(2)}€`} helper="Reservas no canceladas" />
        </section>

        <section className="mb-8 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium text-violet-300">Enlace público de reservas</p>
                <h2 className="mt-2 text-2xl font-semibold">Comparte este enlace con tus clientes</h2>
                <p className="mt-3 text-sm text-white/55">
                  Tus clientes podrán elegir servicio, profesional, día y hora desde esta página.
                </p>
              </div>
              <div className="rounded-3xl bg-violet-500/20 p-4 text-violet-100">
                <CalendarDays size={34} />
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-black/25 p-4 md:flex-row md:items-center md:justify-between">
              <code className="break-all text-sm text-white/80">{bookingUrl}</code>
              <button
                onClick={() => {
                  if (!bookingUrl) return;
                  navigator.clipboard.writeText(bookingUrl);
                  alert("Enlace copiado");
                }}
                className="rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950"
              >
                Copiar enlace
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="text-sm font-medium text-violet-300">Módulos activos</p>
            <h2 className="mt-2 text-2xl font-semibold">{activeModules.length} funcionalidades premium</h2>
            <p className="mt-3 text-sm text-white/55">Gestiona los módulos contratados desde la pestaña Módulos.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {activeModules.length > 0 ? (
                activeModules.slice(0, 5).map((item) => (
                  <span key={item.id} className="rounded-full bg-white/10 px-3 py-2 text-xs text-white/80">{item.name}</span>
                ))
              ) : (
                <span className="rounded-full bg-white/10 px-3 py-2 text-xs text-white/60">Sin módulos extra</span>
              )}
            </div>
          </div>
        </section>

        <section className="mb-6 flex flex-wrap gap-3">
          {["Agenda", "Servicios", "Empleados", "Clientes", "Módulos", "Ajustes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={
                activeTab === tab
                  ? "rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950"
                  : "rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm text-white/70 backdrop-blur hover:bg-white/15"
              }
            >
              {tab}
            </button>
          ))}
        </section>

        {activeTab === "Agenda" && (
          <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Nueva reserva">
              <div className="grid gap-4">
                <select value={appointmentCustomer} onChange={(e) => setAppointmentCustomer(e.target.value)} className="input-dark">
                  <option value="">Seleccionar cliente</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
                <select value={appointmentEmployee} onChange={(e) => setAppointmentEmployee(e.target.value)} className="input-dark">
                  <option value="">Seleccionar empleado</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
                <select value={appointmentService} onChange={(e) => setAppointmentService(e.target.value)} className="input-dark">
                  <option value="">Seleccionar servicio</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>{service.name} · {service.price}€</option>
                  ))}
                </select>
                <input type="datetime-local" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} className="input-dark" />
                <button onClick={createAppointment} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white shadow-lg shadow-violet-950/40">
                  <Plus size={18} className="inline" /> Crear reserva
                </button>
              </div>
            </Panel>

            <Panel title="Calendario visual">
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <p className="font-semibold">{new Date(appointment.appointment_date).toLocaleString("es-ES")}</p>
                    <p className="mt-1 text-sm text-white/60">
                      {appointment.customers?.name || "Cliente"} · {appointment.services?.name || "Servicio"} · {appointment.employees?.name || "Sin empleado"}
                    </p>
                    <p className="mt-1 text-sm font-medium text-violet-300">{appointment.services?.price || 0}€</p>
                    <p className="mt-2 text-xs text-white/45">Estado: {translateStatus(appointment.status)}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => updateAppointmentStatus(appointment.id, "confirmed")} className="rounded-full border border-green-300/30 px-3 py-2 text-xs text-green-200">
                        <CheckCircle2 size={14} className="inline" /> Confirmar
                      </button>
                      <button onClick={() => updateAppointmentStatus(appointment.id, "completed")} className="rounded-full border border-violet-300/30 px-3 py-2 text-xs text-violet-200">
                        Completada
                      </button>
                      <button onClick={() => updateAppointmentStatus(appointment.id, "cancelled")} className="rounded-full border border-red-300/30 px-3 py-2 text-xs text-red-200">
                        <XCircle size={14} className="inline" /> Cancelar
                      </button>
                    </div>
                  </div>
                ))}
                {appointments.length === 0 && <Empty text="Todavía no hay reservas." />}
              </div>
            </Panel>
          </section>
        )}

        {activeTab === "Servicios" && (
          <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Nuevo servicio">
              <div className="grid gap-4">
                <input value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="Nombre del servicio" className="input-dark" />
                <input value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)} placeholder="Duración en minutos" type="number" className="input-dark" />
                <input value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} placeholder="Precio" type="number" className="input-dark" />
                <button onClick={createService} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white shadow-lg shadow-violet-950/40">Crear servicio</button>
              </div>
            </Panel>
            <Panel title="Servicios creados">
              <div className="grid gap-4 md:grid-cols-2">
                {services.map((service) => (
                  <div key={service.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                    <h3 className="text-lg font-semibold">{service.name}</h3>
                    <p className="mt-2 text-sm text-white/50">{service.duration} min</p>
                    <p className="mt-4 text-2xl font-semibold">{Number(service.price).toFixed(2)}€</p>
                  </div>
                ))}
                {services.length === 0 && <Empty text="Aún no hay servicios." />}
              </div>
            </Panel>
          </section>
        )}

        {activeTab === "Empleados" && (
          <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Nuevo empleado">
              <div className="grid gap-4">
                <input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="Nombre" className="input-dark" />
                <input value={employeePhone} onChange={(e) => setEmployeePhone(e.target.value)} placeholder="Teléfono" className="input-dark" />
                <button onClick={createEmployee} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white shadow-lg shadow-violet-950/40">Crear empleado</button>
              </div>
            </Panel>
            <Panel title="Empleados">
              <div className="space-y-3">
                {employees.map((employee) => (
                  <div key={employee.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <p className="font-semibold">{employee.name}</p>
                    <p className="text-sm text-white/50">{employee.phone || "Sin teléfono"}</p>
                  </div>
                ))}
                {employees.length === 0 && <Empty text="Aún no hay empleados." />}
              </div>
            </Panel>
          </section>
        )}

        {activeTab === "Clientes" && (
          <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Nuevo cliente">
              <div className="grid gap-4">
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nombre" className="input-dark" />
                <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Teléfono" className="input-dark" />
                <button onClick={createCustomer} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white shadow-lg shadow-violet-950/40">Crear cliente</button>
              </div>
            </Panel>
            <Panel title="Clientes">
              <div className="space-y-3">
                {customers.map((customer) => (
                  <div key={customer.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-sm text-white/50">{customer.phone || "Sin teléfono"}</p>
                  </div>
                ))}
                {customers.length === 0 && <Empty text="Aún no hay clientes." />}
              </div>
            </Panel>
          </section>
        )}

        {activeTab === "Módulos" && (
          <section className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
            <Panel title="Módulos activos en tu panel">
              <div className="grid gap-4 md:grid-cols-2">
                {activeModules.map((item) => {
                  const Icon = item.Icon;
                  return (
                    <div key={item.id} className="rounded-3xl border border-violet-300/20 bg-violet-500/10 p-5">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-400/20 text-violet-100"><Icon size={22} /></div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/55">{item.description}</p>
                      <Link href={item.href} className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-950">Abrir módulo</Link>
                    </div>
                  );
                })}
                {activeModules.length === 0 && <Empty text="Tu plan actual no tiene módulos extra activos." />}
              </div>
            </Panel>
            <Panel title="Añadir más módulos">
              <div className="space-y-3">
                {inactiveModules.map((item) => {
                  const Icon = item.Icon;
                  return (
                    <div key={item.id} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-violet-200"><Icon size={18} /></div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-white/45">+{item.price}/mes · Actívalo desde Facturación o contacta con Flowly.</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </section>
        )}

        {activeTab === "Ajustes" && (
          <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Horarios de reservas">
              <div className="grid gap-4">
                <label className="text-sm font-medium text-white/70">Hora apertura</label>
                <input type="time" value={settings.start_time} onChange={(e) => setSettings({ ...settings, start_time: e.target.value })} className="input-dark" />
                <label className="text-sm font-medium text-white/70">Hora cierre</label>
                <input type="time" value={settings.end_time} onChange={(e) => setSettings({ ...settings, end_time: e.target.value })} className="input-dark" />
                <label className="text-sm font-medium text-white/70">Intervalo entre citas</label>
                <select value={settings.interval_minutes} onChange={(e) => setSettings({ ...settings, interval_minutes: Number(e.target.value) })} className="input-dark">
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos</option>
                </select>
                <button onClick={saveSettings} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white shadow-lg shadow-violet-950/40">
                  <Settings size={18} className="inline" /> Guardar ajustes
                </button>
              </div>
            </Panel>
            <Panel title="Días activos">
              <div className="grid gap-3">
                <DayToggle label="Lunes" checked={settings.monday} onChange={(v) => setSettings({ ...settings, monday: v })} />
                <DayToggle label="Martes" checked={settings.tuesday} onChange={(v) => setSettings({ ...settings, tuesday: v })} />
                <DayToggle label="Miércoles" checked={settings.wednesday} onChange={(v) => setSettings({ ...settings, wednesday: v })} />
                <DayToggle label="Jueves" checked={settings.thursday} onChange={(v) => setSettings({ ...settings, thursday: v })} />
                <DayToggle label="Viernes" checked={settings.friday} onChange={(v) => setSettings({ ...settings, friday: v })} />
                <DayToggle label="Sábado" checked={settings.saturday} onChange={(v) => setSettings({ ...settings, saturday: v })} />
                <DayToggle label="Domingo" checked={settings.sunday} onChange={(v) => setSettings({ ...settings, sunday: v })} />
              </div>
            </Panel>
          </section>
        )}
      </div>
    </main>
  );
}

function DayToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <span className="font-medium">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-violet-500" />
    </label>
  );
}

function translateStatus(status: string) {
  if (status === "pending") return "Pendiente";
  if (status === "confirmed") return "Confirmada";
  if (status === "completed") return "Completada";
  if (status === "cancelled") return "Cancelada";
  return status;
}

function Metric({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string | number; helper: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-400/20 text-violet-100">{icon}</div>
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-white/35">{helper}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <h2 className="mb-5 text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-white/45">
      {text}
    </div>
  );
}
