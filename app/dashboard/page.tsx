"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  LayoutDashboard,
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
  UserCog,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

type Relation<T> = T | T[] | null;

type Business = {
  id: string;
  name: string;
  business_type: string | null;
  plan: string | null;
  subscription_status: string | null;
};

type UserProfile = {
  account_type: "client" | "sales" | "admin";
  role: string;
};

type Service = {
  id: string;
  name: string;
  duration: number | null;
  duration_minutes?: number | null;
  price: number;
  active: boolean | null;
};

type Employee = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  active: boolean | null;
};

type Customer = {
  id: string;
  name?: string;
  full_name?: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
};

type Appointment = {
  id: string;
  appointment_date?: string;
  starts_at?: string;
  status: string;
  customers: Relation<{ name?: string; full_name?: string }>;
  employees: Relation<{ name: string }>;
  services: Relation<{ name: string; price: number }>;
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

type Tab = "area" | "agenda" | "servicios" | "empleados" | "clientes" | "ajustes";

type ModuleItem = {
  key: string;
  slug: string;
  name: string;
  short: string;
  price: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

const moduleCatalog: ModuleItem[] = [
  { key: "crm", slug: "crm", name: "CRM avanzado", short: "CRM", price: "+9,99€", description: "Seguimientos, oportunidades, clientes inactivos y acciones comerciales.", Icon: UserCog },
  { key: "whatsapp", slug: "whatsapp", name: "WhatsApp automático", short: "WhatsApp", price: "+9,99€", description: "Plantillas, recordatorios y confirmaciones listas para automatizar.", Icon: MessageCircle },
  { key: "billing", slug: "facturacion", name: "Facturación", short: "Facturación", price: "+9,99€", description: "Movimientos, presupuestos, gastos, importes y control básico financiero.", Icon: Receipt },
  { key: "pos", slug: "tpv", name: "TPV", short: "TPV", price: "+14,99€", description: "Tickets, caja, ventas presenciales y control de mostrador.", Icon: Store },
  { key: "marketing", slug: "marketing", name: "Marketing", short: "Marketing", price: "+9,99€", description: "Campañas, promociones, acciones de recuperación y calendario comercial.", Icon: Megaphone },
  { key: "ai", slug: "ia", name: "IA Assistant", short: "IA", price: "+14,99€", description: "Instrucciones inteligentes, resúmenes y sugerencias de crecimiento.", Icon: Bot },
  { key: "analytics", slug: "estadisticas", name: "Estadísticas avanzadas", short: "Estadísticas", price: "+4,99€", description: "KPIs, ingresos previstos, ranking de servicios y evolución del negocio.", Icon: TrendingUp },
  { key: "booking_premium", slug: "reservas-premium", name: "Reservas Premium", short: "Reservas Pro", price: "+4,99€", description: "Reglas avanzadas, bloqueos y personalización de la experiencia de reservas.", Icon: SlidersHorizontal },
  { key: "voice", slug: "voice", name: "Flowly Voice", short: "Voice", price: "+29,99€", description: "Registro de llamadas, solicitudes y preparación para centralita con IA.", Icon: PhoneCall },
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

function firstRelation<T>(value: Relation<T>): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] || null : value;
}

function customerName(customer: Customer | Relation<{ name?: string; full_name?: string }> | null) {
  const item = Array.isArray(customer) ? customer[0] : customer;
  return item?.name || item?.full_name || "Cliente";
}

function appointmentDate(item: Appointment) {
  return item.appointment_date || item.starts_at || new Date().toISOString();
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [modules, setModules] = useState<BusinessModule[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("area");
  const [origin, setOrigin] = useState("");
  const [loading, setLoading] = useState(true);

  const [serviceName, setServiceName] = useState("");
  const [serviceDuration, setServiceDuration] = useState("30");
  const [servicePrice, setServicePrice] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeePhone, setEmployeePhone] = useState("");
  const [customerFormName, setCustomerFormName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [appointmentCustomer, setAppointmentCustomer] = useState("");
  const [appointmentEmployee, setAppointmentEmployee] = useState("");
  const [appointmentService, setAppointmentService] = useState("");
  const [appointmentDateValue, setAppointmentDateValue] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  const loadData = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("account_type, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData as UserProfile);
      if (profileData.account_type === "sales") {
        router.push("/comercial");
        return;
      }
      if (profileData.account_type === "admin") {
        router.push("/admin");
        return;
      }
    }

    const { data: businessData } = await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle();

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
        .select("*, customers(name, full_name), employees(name), services(name, price)")
        .eq("business_id", businessId)
        .order("appointment_date", { ascending: true }),
      supabase.from("booking_settings").select("*").eq("business_id", businessId).maybeSingle(),
      supabase.from("business_modules").select("*").eq("business_id", businessId).eq("status", "active"),
    ]);

    setServices((servicesRes.data || []) as unknown as Service[]);
    setEmployees((employeesRes.data || []) as Employee[]);
    setCustomers((customersRes.data || []) as unknown as Customer[]);
    setAppointments((appointmentsRes.data || []) as unknown as Appointment[]);
    setSettings((settingsRes.data as BookingSettings) || defaultSettings(businessId));
    setModules((modulesRes.data || []) as BusinessModule[]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeModuleKeys = useMemo(() => {
    if (business?.plan === "premium") return moduleCatalog.map((item) => item.key);
    return modules.map((item) => item.module_key);
  }, [business?.plan, modules]);

  const activeModules = moduleCatalog.filter((item) => activeModuleKeys.includes(item.key));
  const inactiveModules = moduleCatalog.filter((item) => !activeModuleKeys.includes(item.key));

  const bookingUrl = useMemo(() => {
    if (!origin || !business?.id) return "";
    return `${origin}/reservas/${business.id}`;
  }, [origin, business?.id]);

  const revenue = appointments
    .filter((item) => item.status !== "cancelled")
    .reduce((sum, item) => sum + Number(firstRelation(item.services)?.price || 0), 0);
  const pendingAppointments = appointments.filter((item) => item.status === "pending").length;
  const nextAppointments = appointments.slice(0, 6);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const openBillingPortal = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return router.push("/login");

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
      duration_minutes: Number(serviceDuration),
      price: Number(servicePrice),
      active: true,
    });
    if (error) return alert(error.message);
    setServiceName("");
    setServicePrice("");
    await loadData();
  };

  const createEmployee = async () => {
    if (!business || !employeeName) return alert("Faltan datos");
    const { error } = await supabase.from("employees").insert({ business_id: business.id, name: employeeName, phone: employeePhone, active: true });
    if (error) return alert(error.message);
    setEmployeeName("");
    setEmployeePhone("");
    await loadData();
  };

  const createCustomer = async () => {
    if (!business || !customerFormName) return alert("Faltan datos");
    const { error } = await supabase.from("customers").insert({
      business_id: business.id,
      name: customerFormName,
      full_name: customerFormName,
      phone: customerPhone,
    });
    if (error) return alert(error.message);
    setCustomerFormName("");
    setCustomerPhone("");
    await loadData();
  };

  const createAppointment = async () => {
    if (!business || !appointmentCustomer || !appointmentEmployee || !appointmentService || !appointmentDateValue) return alert("Faltan datos");
    const { error } = await supabase.from("appointments").insert({
      business_id: business.id,
      customer_id: appointmentCustomer,
      employee_id: appointmentEmployee,
      service_id: appointmentService,
      appointment_date: appointmentDateValue,
      starts_at: appointmentDateValue,
      status: "confirmed",
    });
    if (error) return alert(error.message);
    setAppointmentCustomer("");
    setAppointmentEmployee("");
    setAppointmentService("");
    setAppointmentDateValue("");
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

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#070711] text-white">Cargando panel...</main>;

  if (!business || !settings) {
    return (
      <Shell>
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 text-center shadow-2xl shadow-black/25 backdrop-blur-xl">
          <h1 className="text-3xl font-semibold">Tu cuenta todavía no tiene un negocio asociado</h1>
          <p className="mt-3 text-white/60">Completa el registro después de contratar un plan o contacta con soporte si ya has pagado.</p>
          <Link href="/precios" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-medium text-neutral-950">Ver planes</Link>
        </div>
      </Shell>
    );
  }

  const navItems: { id: Tab; label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: "area", label: "Área personal", Icon: LayoutDashboard },
    { id: "agenda", label: "Agenda", Icon: CalendarDays },
    { id: "servicios", label: "Servicios", Icon: Scissors },
    { id: "empleados", label: "Empleados", Icon: UserRound },
    { id: "clientes", label: "Clientes", Icon: Users },
    { id: "ajustes", label: "Ajustes", Icon: Settings },
  ];

  return (
    <Shell>
      <div className="mx-auto flex max-w-[1540px] flex-col gap-6 px-5 py-6 lg:flex-row">
        <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/30 backdrop-blur-xl lg:sticky lg:top-6 lg:w-80">
          <div className="mb-5 rounded-[1.5rem] bg-neutral-950/70 p-5">
            <p className="text-xl font-semibold tracking-tight">Flowly IA</p>
            <p className="mt-1 text-sm text-violet-200">Panel cliente</p>
          </div>

          <nav className="grid gap-2">
            {navItems.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} className={activeTab === id ? "menu-active" : "menu-item"}>
                <Icon size={17} /> {label}
              </button>
            ))}
          </nav>

          {activeModules.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Módulos contratados</p>
              <div className="grid gap-2">
                {activeModules.map((item) => {
                  const Icon = item.Icon;
                  return (
                    <Link key={item.key} href={`/dashboard/modulos/${item.slug}`} className="menu-item">
                      <Icon size={17} /> {item.short}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-2 border-t border-white/10 pt-4">
            <button onClick={openBillingPortal} className="menu-item"><CreditCard size={17} /> Facturación Stripe</button>
            <button onClick={logout} className="menu-item"><LogOut size={17} /> Salir</button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-7 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-medium text-violet-300">{business.business_type || "Negocio"} · Plan {business.plan || "basic"}</p>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{business.name}</h1>
                <p className="mt-3 max-w-2xl text-white/60">Centro operativo de reservas, clientes, servicios, módulos y suscripción.</p>
              </div>
              <div className="rounded-[1.5rem] border border-violet-300/20 bg-violet-500/15 px-5 py-4 text-violet-100">
                <p className="text-sm text-violet-200">Estado suscripción</p>
                <p className="mt-1 text-2xl font-semibold capitalize">{business.subscription_status || "trialing"}</p>
              </div>
            </div>
          </header>

          <section className="mb-6 grid gap-4 md:grid-cols-4">
            <Metric icon={<CalendarDays />} label="Reservas" value={appointments.length} helper="Agenda total" />
            <Metric icon={<Clock />} label="Pendientes" value={pendingAppointments} helper="Por confirmar" />
            <Metric icon={<Users />} label="Clientes" value={customers.length} helper="Base activa" />
            <Metric icon={<TrendingUp />} label="Ingresos previstos" value={`${revenue.toFixed(2)}€`} helper="No canceladas" />
          </section>

          {activeTab === "area" && (
            <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
              <GlassCard>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm font-medium text-violet-300">Área personal</p>
                    <h2 className="mt-2 text-3xl font-semibold">Suscripción, módulos y facturación</h2>
                    <p className="mt-2 text-sm leading-6 text-white/55">Gestiona tu plan, entra al portal de Stripe, consulta módulos activos y contrata nuevas funcionalidades cuando las necesites.</p>
                  </div>
                  <CreditCard className="text-violet-200" size={44} />
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <InfoBox label="Plan actual" value={business.plan || "basic"} />
                  <InfoBox label="Estado" value={business.subscription_status || "trialing"} />
                  <InfoBox label="Módulos" value={activeModules.length} />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={openBillingPortal} className="btn-primary"><CreditCard size={17} /> Gestionar suscripción</button>
                  <Link href="/precios#modular" className="btn-secondary">Contratar módulos nuevos</Link>
                </div>
              </GlassCard>

              <GlassCard title="Reservas online">
                <p className="text-sm text-white/55">Comparte este enlace con tus clientes para que puedan reservar.</p>
                <div className="mt-5 rounded-2xl bg-black/30 p-4">
                  <code className="break-all text-sm text-white/75">{bookingUrl}</code>
                </div>
                <button
                  onClick={() => {
                    if (!bookingUrl) return;
                    navigator.clipboard.writeText(bookingUrl);
                    alert("Enlace copiado");
                  }}
                  className="mt-4 rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950"
                >
                  Copiar enlace
                </button>
              </GlassCard>

              <GlassCard title="Módulos activos">
                <div className="grid gap-3 md:grid-cols-2">
                  {activeModules.length ? activeModules.map((item) => <ModuleAccessCard key={item.key} module={item} active />) : <p className="text-sm text-white/50">No tienes módulos extra activos. Tu plan incluye el núcleo de reservas, servicios y clientes.</p>}
                </div>
              </GlassCard>

              <GlassCard title="Añadir módulos PRO">
                <div className="grid gap-3 md:grid-cols-2">
                  {inactiveModules.map((item) => <ModuleAccessCard key={item.key} module={item} />)}
                </div>
              </GlassCard>
            </section>
          )}

          {activeTab === "agenda" && (
            <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
              <GlassCard title="Nueva reserva">
                <div className="grid gap-3">
                  <Select value={appointmentCustomer} onChange={setAppointmentCustomer} placeholder="Seleccionar cliente" options={customers.map((c) => ({ value: c.id, label: customerName(c) }))} />
                  <Select value={appointmentEmployee} onChange={setAppointmentEmployee} placeholder="Seleccionar empleado" options={employees.map((e) => ({ value: e.id, label: e.name }))} />
                  <Select value={appointmentService} onChange={setAppointmentService} placeholder="Seleccionar servicio" options={services.map((s) => ({ value: s.id, label: `${s.name} · ${s.price}€` }))} />
                  <input type="datetime-local" value={appointmentDateValue} onChange={(e) => setAppointmentDateValue(e.target.value)} className="input-dark" />
                  <button onClick={createAppointment} className="btn-primary"><Plus size={17} /> Crear reserva</button>
                </div>
              </GlassCard>

              <GlassCard title="Calendario operativo">
                <div className="space-y-3">
                  {nextAppointments.map((appointment) => {
                    const service = firstRelation(appointment.services);
                    const employee = firstRelation(appointment.employees);
                    return (
                      <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                          <div>
                            <p className="font-semibold">{new Date(appointmentDate(appointment)).toLocaleString("es-ES")}</p>
                            <p className="mt-1 text-sm text-white/58">{customerName(appointment.customers)} · {service?.name || "Servicio"} · {employee?.name || "Sin empleado"}</p>
                            <p className="mt-2 text-sm font-medium text-violet-200">{service?.price || 0}€ · {translateStatus(appointment.status)}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <StatusButton onClick={() => updateAppointmentStatus(appointment.id, "confirmed")} tone="green">Confirmar</StatusButton>
                            <StatusButton onClick={() => updateAppointmentStatus(appointment.id, "completed")} tone="violet">Completada</StatusButton>
                            <StatusButton onClick={() => updateAppointmentStatus(appointment.id, "cancelled")} tone="red">Cancelar</StatusButton>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {!nextAppointments.length && <Empty text="Todavía no hay reservas." />}
                </div>
              </GlassCard>
            </section>
          )}

          {activeTab === "servicios" && (
            <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
              <GlassCard title="Nuevo servicio">
                <div className="grid gap-3">
                  <input value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="Nombre del servicio" className="input-dark" />
                  <input value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)} placeholder="Duración en minutos" type="number" className="input-dark" />
                  <input value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} placeholder="Precio" type="number" className="input-dark" />
                  <button onClick={createService} className="btn-primary"><Plus size={17} /> Crear servicio</button>
                </div>
              </GlassCard>
              <GlassCard title="Servicios creados">
                <div className="grid gap-3 md:grid-cols-2">
                  {services.map((service) => <div key={service.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5"><h3 className="font-semibold">{service.name}</h3><p className="mt-2 text-sm text-white/50">{service.duration || service.duration_minutes || 30} min</p><p className="mt-4 text-2xl font-semibold">{Number(service.price).toFixed(2)}€</p></div>)}
                  {!services.length && <Empty text="Crea tu primer servicio para empezar a recibir reservas." />}
                </div>
              </GlassCard>
            </section>
          )}

          {activeTab === "empleados" && (
            <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
              <GlassCard title="Nuevo empleado">
                <div className="grid gap-3">
                  <input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="Nombre" className="input-dark" />
                  <input value={employeePhone} onChange={(e) => setEmployeePhone(e.target.value)} placeholder="Teléfono" className="input-dark" />
                  <button onClick={createEmployee} className="btn-primary"><Plus size={17} /> Crear empleado</button>
                </div>
              </GlassCard>
              <GlassCard title="Equipo">
                <div className="space-y-3">
                  {employees.map((employee) => <div key={employee.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="font-semibold">{employee.name}</p><p className="text-sm text-white/45">{employee.phone || "Sin teléfono"}</p></div>)}
                  {!employees.length && <Empty text="Añade al primer profesional del negocio." />}
                </div>
              </GlassCard>
            </section>
          )}

          {activeTab === "clientes" && (
            <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
              <GlassCard title="Nuevo cliente">
                <div className="grid gap-3">
                  <input value={customerFormName} onChange={(e) => setCustomerFormName(e.target.value)} placeholder="Nombre" className="input-dark" />
                  <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Teléfono" className="input-dark" />
                  <button onClick={createCustomer} className="btn-primary"><Plus size={17} /> Crear cliente</button>
                </div>
              </GlassCard>
              <GlassCard title="Clientes">
                <div className="space-y-3">
                  {customers.map((customer) => <div key={customer.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="font-semibold">{customerName(customer)}</p><p className="text-sm text-white/45">{customer.phone || customer.email || "Sin contacto"}</p></div>)}
                  {!customers.length && <Empty text="Aún no hay clientes." />}
                </div>
              </GlassCard>
            </section>
          )}

          {activeTab === "ajustes" && (
            <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
              <GlassCard title="Horarios de reservas">
                <div className="grid gap-3">
                  <label className="text-sm text-white/70">Hora apertura</label>
                  <input type="time" value={settings.start_time} onChange={(e) => setSettings({ ...settings, start_time: e.target.value })} className="input-dark" />
                  <label className="text-sm text-white/70">Hora cierre</label>
                  <input type="time" value={settings.end_time} onChange={(e) => setSettings({ ...settings, end_time: e.target.value })} className="input-dark" />
                  <label className="text-sm text-white/70">Intervalo</label>
                  <select value={settings.interval_minutes} onChange={(e) => setSettings({ ...settings, interval_minutes: Number(e.target.value) })} className="input-dark">
                    <option value={15}>15 minutos</option><option value={30}>30 minutos</option><option value={45}>45 minutos</option><option value={60}>60 minutos</option>
                  </select>
                  <button onClick={saveSettings} className="btn-primary"><Settings size={17} /> Guardar ajustes</button>
                </div>
              </GlassCard>
              <GlassCard title="Días activos">
                <div className="grid gap-3">
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
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070711] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,.55),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,.18),transparent_30%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="relative">{children}</div>
    </main>
  );
}

function Metric({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string | number; helper: string }) {
  return <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-100">{icon}</div><p className="text-sm text-white/50">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p><p className="mt-1 text-xs text-white/35">{helper}</p></div>;
}

function GlassCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">{title && <h2 className="mb-5 text-2xl font-semibold">{title}</h2>}{children}</div>;
}

function InfoBox({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-sm text-white/45">{label}</p><p className="mt-2 text-2xl font-semibold capitalize">{value}</p></div>;
}

function ModuleAccessCard({ module, active = false }: { module: ModuleItem; active?: boolean }) {
  const Icon = module.Icon;
  return (
    <div className={active ? "rounded-2xl border border-violet-400/30 bg-violet-500/15 p-4" : "rounded-2xl border border-white/10 bg-white/[0.05] p-4"}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-violet-100"><Icon size={18} /></div>
        <div>
          <p className="font-semibold">{module.name}</p>
          <p className="mt-1 text-xs leading-5 text-white/45">{module.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {active ? <Link href={`/dashboard/modulos/${module.slug}`} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-950">Abrir</Link> : <Link href="/precios#modular" className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/75">Añadir {module.price}</Link>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Select({ value, onChange, placeholder, options }: { value: string; onChange: (value: string) => void; placeholder: string; options: { value: string; label: string }[] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="input-dark"><option value="">{placeholder}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
}

function DayToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] p-4"><span className="font-medium">{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5" /></label>;
}

function StatusButton({ children, onClick, tone }: { children: React.ReactNode; onClick: () => void; tone: "green" | "red" | "violet" }) {
  const className = tone === "green" ? "border-green-300/25 text-green-200" : tone === "red" ? "border-red-300/25 text-red-200" : "border-violet-300/25 text-violet-200";
  return <button onClick={onClick} className={`rounded-full border px-3 py-2 text-xs ${className}`}>{children}</button>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/45">{text}</div>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">{children}</span>;
}

function translateStatus(status: string) {
  if (status === "pending") return "Pendiente";
  if (status === "confirmed") return "Confirmada";
  if (status === "completed") return "Completada";
  if (status === "cancelled") return "Cancelada";
  return status;
}
