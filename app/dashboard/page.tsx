"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageCircle,
  PhoneCall,
  Plus,
  Receipt,
  Scissors,
  Search,
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
  logo_url?: string | null;
  panel_theme?: string | null;
};

type UserProfile = { account_type: "client" | "sales" | "admin"; role: string };
type Service = { id: string; name: string; duration: number | null; duration_minutes?: number | null; price: number; active: boolean | null };
type Employee = { id: string; name: string; email: string | null; phone: string | null; active: boolean | null };
type Customer = { id: string; name?: string; full_name?: string; phone: string | null; email: string | null; notes: string | null };
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
type BusinessModule = { id?: string; business_id: string; module_key: string; status: string };
type ModuleRecord = { id: string; business_id: string; module_key: string; title: string; amount: number | null; status: string; notes: string | null; created_at: string };

type CoreTab = "area" | "agenda" | "servicios" | "empleados" | "clientes" | "historial" | "ajustes";
type ActiveTab = CoreTab | `module:${string}`;

type ModuleItem = {
  key: string;
  slug: string;
  name: string;
  short: string;
  price: string;
  description: string;
  badge: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  amountEnabled?: boolean;
  proFeatures: string[];
};

const moduleCatalog: ModuleItem[] = [
  { key: "crm", slug: "crm", name: "CRM avanzado", short: "CRM", price: "+9,99€", badge: "Producto estrella", description: "Pipeline, filtros, notas, segmentos, historial y acciones comerciales por cliente.", Icon: UserCog, proFeatures: ["Ficha 360º de cliente", "Filtros por estado y contacto", "Notas y próximos pasos"] },
  { key: "whatsapp", slug: "whatsapp", name: "WhatsApp automático", short: "WhatsApp", price: "+9,99€", badge: "Automatización", description: "Conecta tu número, crea plantillas y prepara bots de confirmación, recordatorio y recuperación.", Icon: MessageCircle, proFeatures: ["Plantillas con variables", "Bot de recordatorio", "Conexión preparada para proveedor"] },
  { key: "billing", slug: "facturacion", name: "Facturación", short: "Facturación", price: "+9,99€", badge: "Finanzas", description: "Control de ingresos, gastos, proveedores, caja prevista y movimientos manuales.", Icon: Receipt, amountEnabled: true, proFeatures: ["Gastos e ingresos", "Proveedores", "Suma automática de reservas"] },
  { key: "pos", slug: "tpv", name: "TPV", short: "TPV", price: "+14,99€", badge: "Caja", description: "TPV operativo para tickets, métodos de pago, caja diaria, artículos rápidos y ventas presenciales.", Icon: Store, amountEnabled: true, proFeatures: ["Tickets rápidos", "Métodos de pago", "Resumen de caja"] },
  { key: "marketing", slug: "marketing", name: "Marketing", short: "Marketing", price: "+9,99€", badge: "Crecimiento", description: "Campañas, presupuestos, canales publicitarios y preparación para Meta Ads, Google Ads y TikTok Ads.", Icon: Megaphone, amountEnabled: true, proFeatures: ["Meta / Google / TikTok", "Calendario de campañas", "Presupuesto y objetivo"] },
  { key: "ai", slug: "ia", name: "IA Assistant", short: "IA", price: "+14,99€", badge: "IA", description: "Convierte el panel en un centro inteligente con insights, prompts, acciones recomendadas y análisis del negocio.", Icon: Bot, proFeatures: ["Resumen del negocio", "Recomendaciones IA", "Panel asistido"] },
  { key: "analytics", slug: "estadisticas", name: "Estadísticas avanzadas", short: "Estadísticas", price: "+4,99€", badge: "KPIs", description: "KPIs, ingresos previstos, ranking de servicios, ocupación y evolución del negocio.", Icon: TrendingUp, amountEnabled: true, proFeatures: ["KPIs operativos", "Ingresos previstos", "Evolución mensual"] },
  { key: "booking_premium", slug: "reservas-premium", name: "Reservas Premium", short: "Reservas Pro", price: "+4,99€", badge: "Booking PRO", description: "Reglas avanzadas, bloqueos, políticas y personalización de la experiencia de reservas.", Icon: SlidersHorizontal, proFeatures: ["Reglas avanzadas", "Bloqueos especiales", "Experiencia personalizada"] },
  { key: "voice", slug: "voice", name: "Flowly Voice", short: "Voice", price: "+29,99€", badge: "Voz IA", description: "Registro de llamadas y solicitudes telefónicas, preparado para centralita con IA.", Icon: PhoneCall, proFeatures: ["Registro de llamadas", "Intención detectada", "Preparado para centralita IA"] },
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
  const [patientProfiles, setPatientProfiles] = useState<PatientProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [modules, setModules] = useState<BusinessModule[]>([]);
  const [moduleRecords, setModuleRecords] = useState<ModuleRecord[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("area");
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

  const [recordTitle, setRecordTitle] = useState("");
  const [recordNotes, setRecordNotes] = useState("");
  const [recordAmount, setRecordAmount] = useState("");
  const [recordStatus, setRecordStatus] = useState("active");
  const [crmSearch, setCrmSearch] = useState("");

  const [patientCustomerId, setPatientCustomerId] = useState("");
  const [patientBirthDate, setPatientBirthDate] = useState("");
  const [patientDocumentId, setPatientDocumentId] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("");
  const [initialDiagnosis, setInitialDiagnosis] = useState("");
  const [therapeuticProcess, setTherapeuticProcess] = useState("");
  const [patientObservations, setPatientObservations] = useState("");
  const [nextReviewDate, setNextReviewDate] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  const loadData = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profileData } = await supabase.from("user_profiles").select("account_type, role").eq("user_id", user.id).maybeSingle();
    if (profileData) {
      setProfile(profileData as UserProfile);
      if (profileData.account_type === "sales") return router.push("/comercial");
      if (profileData.account_type === "admin") return router.push("/admin");
    }

    const { data: businessData } = await supabase.from("businesses").select("*").eq("owner_id", user.id).maybeSingle();
    if (!businessData) {
      setLoading(false);
      return;
    }

    const businessId = businessData.id as string;
    setBusiness(businessData as Business);

    const [servicesRes, employeesRes, customersRes, patientProfilesRes, appointmentsRes, settingsRes, modulesRes, recordsRes] = await Promise.all([
      supabase.from("services").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("employees").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("customers").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("patient_profiles").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("appointments").select("*, customers(name, full_name), employees(name), services(name, price)").eq("business_id", businessId).order("appointment_date", { ascending: true }),
      supabase.from("booking_settings").select("*").eq("business_id", businessId).maybeSingle(),
      supabase.from("business_modules").select("*").eq("business_id", businessId).eq("status", "active"),
      supabase.from("module_records").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
    ]);

    setServices((servicesRes.data || []) as unknown as Service[]);
    setEmployees((employeesRes.data || []) as Employee[]);
    setCustomers((customersRes.data || []) as unknown as Customer[]);
    setPatientProfiles((patientProfilesRes.data || []) as PatientProfile[]);
    setAppointments((appointmentsRes.data || []) as unknown as Appointment[]);
    setSettings((settingsRes.data as BookingSettings) || defaultSettings(businessId));
    setModules((modulesRes.data || []) as BusinessModule[]);
    setModuleRecords((recordsRes.data || []) as ModuleRecord[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const activeModuleKeys = useMemo(() => {
    if (business?.plan === "premium") return moduleCatalog.map((item) => item.key);
    return modules.map((item) => item.module_key);
  }, [business?.plan, modules]);

  const activeModules = moduleCatalog.filter((item) => activeModuleKeys.includes(item.key));
  const inactiveModules = moduleCatalog.filter((item) => !activeModuleKeys.includes(item.key));
  const activeModule = activeTab.startsWith("module:") ? moduleCatalog.find((item) => `module:${item.slug}` === activeTab) : null;

  const bookingUrl = useMemo(() => (!origin || !business?.id ? "" : `${origin}/reservas/${business.id}`), [origin, business?.id]);
  const revenue = appointments.filter((item) => item.status !== "cancelled").reduce((sum, item) => sum + Number(firstRelation(item.services)?.price || 0), 0);
  const expenses = moduleRecords.filter((r) => r.module_key === "billing" && r.status === "expense").reduce((sum, r) => sum + Math.abs(Number(r.amount || 0)), 0);
  const manualIncome = moduleRecords.filter((r) => r.module_key === "billing" && r.status === "income").reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const pendingAppointments = appointments.filter((item) => item.status === "pending").length;
  const nextAppointments = appointments.slice(0, 6);

  const resetRecordForm = () => { setRecordTitle(""); setRecordNotes(""); setRecordAmount(""); setRecordStatus("active"); };
  const resetPatientForm = () => {
    setPatientCustomerId("");
    setPatientBirthDate("");
    setPatientDocumentId("");
    setPatientGender("");
    setGuardianName("");
    setGuardianPhone("");
    setGuardianEmail("");
    setGuardianRelationship("");
    setInitialDiagnosis("");
    setTherapeuticProcess("");
    setPatientObservations("");
    setNextReviewDate("");
  };

  const logout = async () => { await supabase.auth.signOut(); router.push("/"); };
  const openBillingPortal = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return router.push("/login");
    const res = await fetch("/api/stripe/portal", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const result = await res.json();
    if (result.url) window.location.href = result.url;
    else alert(result.error || "No se pudo abrir la facturación");
  };

  const createService = async () => {
    if (!business || !serviceName || !servicePrice) return alert("Faltan datos");
    const { error } = await supabase.from("services").insert({ business_id: business.id, name: serviceName, duration: Number(serviceDuration), duration_minutes: Number(serviceDuration), price: Number(servicePrice), active: true });
    if (error) return alert(error.message);
    setServiceName(""); setServicePrice(""); await loadData();
  };
  const createEmployee = async () => {
    if (!business || !employeeName) return alert("Faltan datos");
    const { error } = await supabase.from("employees").insert({ business_id: business.id, name: employeeName, phone: employeePhone, active: true });
    if (error) return alert(error.message);
    setEmployeeName(""); setEmployeePhone(""); await loadData();
  };
  const createCustomer = async () => {
    if (!business || !customerFormName) return alert("Faltan datos");
    const { error } = await supabase.from("customers").insert({ business_id: business.id, name: customerFormName, full_name: customerFormName, phone: customerPhone });
    if (error) return alert(error.message);
    setCustomerFormName(""); setCustomerPhone(""); await loadData();
  };
  const savePatientProfile = async () => {
    if (!business || !patientCustomerId) return alert("Selecciona un paciente");

    const selectedCustomer = customers.find((item) => item.id === patientCustomerId);
    const { error } = await supabase.from("patient_profiles").upsert({
      business_id: business.id,
      customer_id: patientCustomerId,
      child_full_name: selectedCustomer ? customerName(selectedCustomer) : null,
      birth_date: patientBirthDate || null,
      document_id: patientDocumentId || null,
      gender: patientGender || null,
      guardian_name: guardianName || null,
      guardian_phone: guardianPhone || null,
      guardian_email: guardianEmail || null,
      guardian_relationship: guardianRelationship || null,
      initial_diagnosis: initialDiagnosis || null,
      therapeutic_process: therapeuticProcess || null,
      observations: patientObservations || null,
      next_review_date: nextReviewDate || null,
    }, { onConflict: "customer_id" });

    if (error) return alert(error.message);
    alert("Historial clínico guardado");
    resetPatientForm();
    await loadData();
  };

  const createAppointment = async () => {
    if (!business || !appointmentCustomer || !appointmentEmployee || !appointmentService || !appointmentDateValue) return alert("Faltan datos");
    const { error } = await supabase.from("appointments").insert({ business_id: business.id, customer_id: appointmentCustomer, employee_id: appointmentEmployee, service_id: appointmentService, appointment_date: appointmentDateValue, starts_at: appointmentDateValue, status: "confirmed" });
    if (error) return alert(error.message);
    setAppointmentCustomer(""); setAppointmentEmployee(""); setAppointmentService(""); setAppointmentDateValue(""); await loadData();
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
    else { alert("Ajustes guardados"); await loadData(); }
  };
  const createModuleRecord = async (moduleKey: string, defaultStatus = "active") => {
    if (!business || !recordTitle) return alert("Añade un título");
    const { error } = await supabase.from("module_records").insert({ business_id: business.id, module_key: moduleKey, title: recordTitle, notes: recordNotes, amount: recordAmount ? Number(recordAmount) : null, status: recordStatus || defaultStatus });
    if (error) return alert(error.message);
    resetRecordForm();
    await loadData();
  };
  const deleteModuleRecord = async (id: string) => {
    const { error } = await supabase.from("module_records").delete().eq("id", id);
    if (error) return alert(error.message);
    await loadData();
  };

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#070711] text-white">Cargando panel...</main>;
  if (!business || !settings) {
    return <Shell><div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 text-center shadow-2xl shadow-black/25 backdrop-blur-xl"><h1 className="text-3xl font-semibold">Tu cuenta todavía no tiene un negocio asociado</h1><p className="mt-3 text-white/60">Completa el registro después de contratar un plan o contacta con soporte si ya has pagado.</p><Link href="/precios" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-medium text-neutral-950">Ver planes</Link></div></Shell>;
  }

  const navItems: { id: CoreTab; label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: "area", label: "Área personal", Icon: LayoutDashboard },
    { id: "agenda", label: "Agenda", Icon: CalendarDays },
    { id: "servicios", label: "Servicios", Icon: Scissors },
    { id: "empleados", label: "Empleados", Icon: UserRound },
    { id: "clientes", label: "Clientes", Icon: Users },
    { id: "ajustes", label: "Ajustes", Icon: Settings },
  ];

  return (
    <Shell theme={business.panel_theme || "dark"}>
      <div className="mx-auto flex max-w-[1540px] flex-col gap-6 px-5 py-6 lg:flex-row">
        <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/30 backdrop-blur-xl lg:sticky lg:top-6 lg:w-80">
          <div className="mb-5 rounded-[1.5rem] bg-neutral-950/70 p-5">
            <Image src="/logo.png" alt="Flowly IA" width={156} height={42} className="h-auto w-36 object-contain" priority />
            <p className="mt-3 text-sm text-violet-200">Panel cliente</p>
          </div>

          <nav className="grid gap-2">
            {navItems.map(({ id, label, Icon }) => <button key={id} onClick={() => setActiveTab(id)} className={activeTab === id ? "menu-active" : "menu-item"}><Icon size={17} /> {label}</button>)}
          </nav>

          {activeModules.length > 0 && <div className="mt-6"><p className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Módulos contratados</p><div className="grid gap-2">{activeModules.map((item) => { const Icon = item.Icon; const id = `module:${item.slug}` as ActiveTab; return <button key={item.key} onClick={() => { resetRecordForm(); setActiveTab(id); }} className={activeTab === id ? "menu-active" : "menu-item"}><Icon size={17} /> {item.short}</button>; })}</div></div>}

          <div className="mt-6 grid gap-2 border-t border-white/10 pt-4">
            <button onClick={openBillingPortal} className="menu-item"><CreditCard size={17} /> Facturación Stripe</button>
            <button onClick={logout} className="menu-item"><LogOut size={17} /> Salir</button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-7 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div className="flex items-start gap-4">
                {business.logo_url ? <img src={business.logo_url} alt={business.name} className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/15" /> : <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/20 text-xl font-semibold text-violet-100">{business.name.slice(0, 1)}</div>}
                <div>
                  <p className="text-sm font-medium text-violet-300">{business.business_type || "Negocio"} · Plan {business.plan || "basic"}</p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{business.name}</h1>
                  <p className="mt-3 max-w-2xl text-white/60">Centro operativo de reservas, clientes, servicios, módulos y suscripción.</p>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-violet-300/20 bg-violet-500/15 px-5 py-4 text-violet-100"><p className="text-sm text-violet-200">Estado suscripción</p><p className="mt-1 text-2xl font-semibold capitalize">{business.subscription_status || "trialing"}</p></div>
            </div>
          </header>

          <section className="mb-6 grid gap-4 md:grid-cols-4">
            <Metric icon={<CalendarDays />} label="Reservas" value={appointments.length} helper="Agenda total" />
            <Metric icon={<Clock />} label="Pendientes" value={pendingAppointments} helper="Por confirmar" />
            <Metric icon={<Users />} label="Clientes" value={customers.length} helper="Base activa" />
            <Metric icon={<TrendingUp />} label="Ingresos previstos" value={`${revenue.toFixed(2)}€`} helper="No canceladas" />
          </section>

          {activeTab === "area" && <AreaSection business={business} activeModules={activeModules} inactiveModules={inactiveModules} bookingUrl={bookingUrl} openBillingPortal={openBillingPortal} setActiveTab={setActiveTab} />}
          {activeTab === "agenda" && <AgendaSection appointments={nextAppointments} customers={customers} employees={employees} services={services} appointmentCustomer={appointmentCustomer} setAppointmentCustomer={setAppointmentCustomer} appointmentEmployee={appointmentEmployee} setAppointmentEmployee={setAppointmentEmployee} appointmentService={appointmentService} setAppointmentService={setAppointmentService} appointmentDateValue={appointmentDateValue} setAppointmentDateValue={setAppointmentDateValue} createAppointment={createAppointment} updateAppointmentStatus={updateAppointmentStatus} />}
          {activeTab === "servicios" && <ServicesSection services={services} serviceName={serviceName} setServiceName={setServiceName} serviceDuration={serviceDuration} setServiceDuration={setServiceDuration} servicePrice={servicePrice} setServicePrice={setServicePrice} createService={createService} />}
          {activeTab === "empleados" && <EmployeesSection employees={employees} employeeName={employeeName} setEmployeeName={setEmployeeName} employeePhone={employeePhone} setEmployeePhone={setEmployeePhone} createEmployee={createEmployee} />}
          {activeTab === "clientes" && <CustomersSection customers={customers} customerFormName={customerFormName} setCustomerFormName={setCustomerFormName} customerPhone={customerPhone} setCustomerPhone={setCustomerPhone} createCustomer={createCustomer} />}
          {activeTab === "historial" && customization?.clinic_mode && <PatientHistorySection customers={customers} patientProfiles={patientProfiles} patientCustomerId={patientCustomerId} setPatientCustomerId={setPatientCustomerId} patientBirthDate={patientBirthDate} setPatientBirthDate={setPatientBirthDate} patientDocumentId={patientDocumentId} setPatientDocumentId={setPatientDocumentId} patientGender={patientGender} setPatientGender={setPatientGender} guardianName={guardianName} setGuardianName={setGuardianName} guardianPhone={guardianPhone} setGuardianPhone={setGuardianPhone} guardianEmail={guardianEmail} setGuardianEmail={setGuardianEmail} guardianRelationship={guardianRelationship} setGuardianRelationship={setGuardianRelationship} initialDiagnosis={initialDiagnosis} setInitialDiagnosis={setInitialDiagnosis} therapeuticProcess={therapeuticProcess} setTherapeuticProcess={setTherapeuticProcess} patientObservations={patientObservations} setPatientObservations={setPatientObservations} nextReviewDate={nextReviewDate} setNextReviewDate={setNextReviewDate} savePatientProfile={savePatientProfile} />}
          {activeTab === "ajustes" && <SettingsSection settings={settings} setSettings={setSettings} saveSettings={saveSettings} />}
          {activeModule && <ModuleSection module={activeModule} records={moduleRecords.filter((r) => r.module_key === activeModule.key)} allRecords={moduleRecords} customers={customers} appointments={appointments} services={services} revenue={revenue} expenses={expenses} manualIncome={manualIncome} title={recordTitle} setTitle={setRecordTitle} notes={recordNotes} setNotes={setRecordNotes} amount={recordAmount} setAmount={setRecordAmount} status={recordStatus} setStatus={setRecordStatus} crmSearch={crmSearch} setCrmSearch={setCrmSearch} createRecord={createModuleRecord} deleteRecord={deleteModuleRecord} />}
        </section>
      </div>
    </Shell>
  );
}

function AreaSection({ business, activeModules, inactiveModules, bookingUrl, openBillingPortal, setActiveTab }: { business: Business; activeModules: ModuleItem[]; inactiveModules: ModuleItem[]; bookingUrl: string; openBillingPortal: () => void; setActiveTab: (tab: ActiveTab) => void }) {
  return <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]"><GlassCard><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><p className="text-sm font-medium text-violet-300">Área personal</p><h2 className="mt-2 text-3xl font-semibold">Suscripción, módulos y personalización</h2><p className="mt-2 text-sm leading-6 text-white/55">Gestiona tu plan, abre Stripe, consulta módulos activos y contrata nuevas funcionalidades desde el plan Modular.</p></div><CreditCard className="text-violet-200" size={44} /></div><div className="mt-6 grid gap-4 md:grid-cols-3"><InfoBox label="Plan actual" value={business.plan || "basic"} /><InfoBox label="Estado" value={business.subscription_status || "trialing"} /><InfoBox label="Módulos" value={activeModules.length} /></div><div className="mt-6 flex flex-wrap gap-3"><button onClick={openBillingPortal} className="btn-primary"><CreditCard size={17} /> Gestionar suscripción</button><Link href="/precios#modular" className="btn-secondary">Contratar módulos nuevos</Link></div></GlassCard><GlassCard title="Reservas online"><p className="text-sm text-white/55">Comparte este enlace con tus clientes para que puedan reservar.</p><div className="mt-5 rounded-2xl bg-black/30 p-4"><code className="break-all text-sm text-white/75">{bookingUrl}</code></div><button onClick={() => { if (!bookingUrl) return; navigator.clipboard.writeText(bookingUrl); alert("Enlace copiado"); }} className="mt-4 rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950">Copiar enlace</button></GlassCard><GlassCard title="Módulos activos"><div className="grid gap-3 md:grid-cols-2">{activeModules.length ? activeModules.map((item) => <ModuleAccessCard key={item.key} module={item} active onOpen={() => setActiveTab(`module:${item.slug}`)} />) : <p className="text-sm text-white/50">No tienes módulos extra activos. Tu plan incluye el núcleo de reservas, servicios y clientes.</p>}</div></GlassCard><GlassCard title="Añadir módulos PRO"><div className="grid gap-3 md:grid-cols-2">{inactiveModules.map((item) => <ModuleAccessCard key={item.key} module={item} />)}</div></GlassCard></section>;
}

function ModuleSection(props: { module: ModuleItem; records: ModuleRecord[]; allRecords: ModuleRecord[]; customers: Customer[]; appointments: Appointment[]; services: Service[]; revenue: number; expenses: number; manualIncome: number; title: string; setTitle: (v: string) => void; notes: string; setNotes: (v: string) => void; amount: string; setAmount: (v: string) => void; status: string; setStatus: (v: string) => void; crmSearch: string; setCrmSearch: (v: string) => void; createRecord: (moduleKey: string, defaultStatus?: string) => void; deleteRecord: (id: string) => void }) {
  const { module, records, customers, appointments, services, revenue, expenses, manualIncome } = props;
  if (module.key === "billing") return <BillingModule {...props} />;
  if (module.key === "pos") return <PosModule {...props} />;
  if (module.key === "crm") return <CrmModule {...props} />;
  if (module.key === "marketing") return <MarketingModule {...props} />;
  if (module.key === "ai") return <AiModule {...props} />;
  if (module.key === "whatsapp") return <WhatsappModule {...props} />;
  const Icon = module.Icon;
  return <section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]"><GlassCard><div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/20 text-violet-100"><Icon /></div><h2 className="text-2xl font-semibold">{module.name}</h2><p className="mt-2 text-sm text-white/55">{module.description}</p><div className="mt-6 grid gap-3"><input value={props.title} onChange={(e) => props.setTitle(e.target.value)} placeholder="Título del registro" className="input-dark" />{module.amountEnabled && <input value={props.amount} onChange={(e) => props.setAmount(e.target.value)} placeholder="Importe" type="number" className="input-dark" />}<textarea value={props.notes} onChange={(e) => props.setNotes(e.target.value)} placeholder="Notas" className="input-dark min-h-32" /><button onClick={() => props.createRecord(module.key)} className="btn-primary"><Plus size={17} /> Guardar</button></div></GlassCard><RecordsCard title="Actividad" records={records} deleteRecord={props.deleteRecord} /></section>;
}

function BillingModule({ records, appointments, revenue, expenses, manualIncome, title, setTitle, notes, setNotes, amount, setAmount, status, setStatus, createRecord, deleteRecord }: Parameters<typeof ModuleSection>[0]) {
  const profit = revenue + manualIncome - expenses;
  const suppliers = records.filter((r) => r.status === "supplier");
  return <section className="grid gap-6"><div className="grid gap-4 md:grid-cols-4"><Metric icon={<Receipt />} label="Reservas cobradas" value={`${revenue.toFixed(2)}€`} helper="Automático" /><Metric icon={<TrendingUp />} label="Ingresos manuales" value={`${manualIncome.toFixed(2)}€`} helper="Añadidos" /><Metric icon={<CreditCard />} label="Gastos" value={`${expenses.toFixed(2)}€`} helper="Manuales" /><Metric icon={<FileText />} label="Resultado" value={`${profit.toFixed(2)}€`} helper="Estimado" /></div><section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]"><GlassCard title="Nuevo movimiento financiero"><div className="grid gap-3"><select value={status} onChange={(e) => setStatus(e.target.value)} className="input-dark"><option value="income">Ingreso manual</option><option value="expense">Gasto</option><option value="supplier">Proveedor</option><option value="budget">Presupuesto</option></select><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Concepto: proveedor, factura, gasto, presupuesto..." className="input-dark" /><input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Importe" type="number" className="input-dark" /><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas, proveedor, forma de pago, vencimiento o cliente relacionado" className="input-dark min-h-32" /><button onClick={() => createRecord("billing", status)} className="btn-primary"><Plus size={17} /> Guardar movimiento</button></div></GlassCard><GlassCard title="Control financiero"><div className="grid gap-3 md:grid-cols-2"><InfoBox label="Movimientos" value={records.length} /><InfoBox label="Proveedores" value={suppliers.length} /><InfoBox label="Reservas" value={appointments.length} /><InfoBox label="Beneficio estimado" value={`${profit.toFixed(2)}€`} /></div><div className="mt-5"><RecordsList records={records} deleteRecord={deleteRecord} /></div></GlassCard></section></section>;
}

function PosModule({ records, services, title, setTitle, notes, setNotes, amount, setAmount, status, setStatus, createRecord, deleteRecord }: Parameters<typeof ModuleSection>[0]) {
  const total = records.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const cash = records.filter((r) => r.status === "cash").reduce((s, r) => s + Number(r.amount || 0), 0);
  const card = records.filter((r) => r.status === "card").reduce((s, r) => s + Number(r.amount || 0), 0);
  return <section className="grid gap-6"><div className="grid gap-4 md:grid-cols-4"><Metric icon={<Store />} label="Caja total" value={`${total.toFixed(2)}€`} helper="Tickets" /><Metric icon={<CreditCard />} label="Tarjeta" value={`${card.toFixed(2)}€`} helper="TPV" /><Metric icon={<Receipt />} label="Efectivo" value={`${cash.toFixed(2)}€`} helper="Caja" /><Metric icon={<Scissors />} label="Servicios" value={services.length} helper="Catálogo" /></div><section className="grid gap-6 xl:grid-cols-[.75fr_1.25fr]"><GlassCard title="Nuevo ticket TPV"><div className="grid gap-3"><select value={status} onChange={(e) => setStatus(e.target.value)} className="input-dark"><option value="card">Tarjeta</option><option value="cash">Efectivo</option><option value="bizum">Bizum</option><option value="mixed">Mixto</option></select><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ticket: Corte + producto" className="input-dark" /><input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Total ticket" type="number" className="input-dark" /><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Productos, descuentos, empleado o notas de caja" className="input-dark min-h-32" /><button onClick={() => createRecord("pos", status)} className="btn-primary"><Plus size={17} /> Cobrar y guardar ticket</button></div></GlassCard><GlassCard title="TPV operativo"><div className="grid gap-3 md:grid-cols-3">{services.slice(0, 6).map((s) => <div key={s.id} className="rounded-2xl bg-black/25 p-4"><p className="font-medium">{s.name}</p><p className="text-sm text-white/45">{Number(s.price).toFixed(2)}€</p></div>)}</div><div className="mt-5"><RecordsList records={records} deleteRecord={deleteRecord} /></div></GlassCard></section></section>;
}

function CrmModule({ records, customers, appointments, crmSearch, setCrmSearch, title, setTitle, notes, setNotes, status, setStatus, createRecord, deleteRecord }: Parameters<typeof ModuleSection>[0]) {
  const filtered = customers.filter((c) => `${customerName(c)} ${c.phone || ""} ${c.email || ""}`.toLowerCase().includes(crmSearch.toLowerCase()));
  return <section className="grid gap-6"><div className="grid gap-4 md:grid-cols-4"><Metric icon={<Users />} label="Clientes" value={customers.length} helper="Base total" /><Metric icon={<CalendarDays />} label="Reservas" value={appointments.length} helper="Historial" /><Metric icon={<CheckCircle2 />} label="Seguimientos" value={records.length} helper="CRM" /><Metric icon={<TrendingUp />} label="Oportunidades" value={records.filter(r => r.status === "opportunity").length} helper="Abiertas" /></div><section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]"><GlassCard title="Ficha CRM / seguimiento"><div className="grid gap-3"><select value={status} onChange={(e) => setStatus(e.target.value)} className="input-dark"><option value="followup">Seguimiento</option><option value="opportunity">Oportunidad</option><option value="inactive">Cliente inactivo</option><option value="vip">Cliente VIP</option></select><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Laura García · Reactivar color" className="input-dark" /><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas, historial, próxima acción, intereses, preferencias y recordatorios" className="input-dark min-h-32" /><button onClick={() => createRecord("crm", status)} className="btn-primary"><Plus size={17} /> Guardar seguimiento CRM</button></div></GlassCard><GlassCard title="CRM de clientes"><div className="relative mb-4"><Search className="absolute left-4 top-3.5 text-white/35" size={18} /><input value={crmSearch} onChange={(e) => setCrmSearch(e.target.value)} placeholder="Buscar cliente, teléfono o email" className="input-dark pl-11" /></div><div className="grid gap-3 md:grid-cols-2">{filtered.slice(0, 12).map((c) => <div key={c.id} className="rounded-2xl border border-white/10 bg-black/25 p-4"><p className="font-semibold">{customerName(c)}</p><p className="mt-1 text-sm text-white/45">{c.phone || c.email || "Sin contacto"}</p><p className="mt-3 text-xs text-violet-200">Historial · Notas · Segmentos · Próxima acción</p></div>)}</div></GlassCard></section><RecordsCard title="Acciones CRM" records={records} deleteRecord={deleteRecord} /></section>;
}

function MarketingModule({ records, title, setTitle, notes, setNotes, amount, setAmount, status, setStatus, createRecord, deleteRecord }: Parameters<typeof ModuleSection>[0]) {
  const budget = records.reduce((s, r) => s + Number(r.amount || 0), 0);
  return <section className="grid gap-6"><div className="grid gap-4 md:grid-cols-4"><Metric icon={<Megaphone />} label="Campañas" value={records.length} helper="Planificadas" /><Metric icon={<CreditCard />} label="Presupuesto" value={`${budget.toFixed(2)}€`} helper="Total" /><Metric icon={<TrendingUp />} label="Canales" value="Meta · Google" helper="Preparados" /><Metric icon={<CheckCircle2 />} label="Estado" value="Ready" helper="Integraciones" /></div><section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]"><GlassCard title="Nueva campaña"><div className="grid gap-3"><select value={status} onChange={(e) => setStatus(e.target.value)} className="input-dark"><option value="meta">Facebook / Instagram Ads</option><option value="google">Google Ads</option><option value="tiktok">TikTok Ads</option><option value="email">Email Marketing</option><option value="whatsapp">WhatsApp Campaign</option></select><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Campaña: Promo verano / Reactivación" className="input-dark" /><input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Presupuesto estimado" type="number" className="input-dark" /><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Público, oferta, canal, objetivo, fechas y creatividad" className="input-dark min-h-32" /><button onClick={() => createRecord("marketing", status)} className="btn-primary"><Plus size={17} /> Guardar campaña</button></div></GlassCard><GlassCard title="Conectores publicitarios"><div className="grid gap-3 md:grid-cols-2">{["Meta Ads", "Google Ads", "TikTok Ads", "Email", "WhatsApp", "Landing"].map((x) => <div key={x} className="rounded-2xl bg-black/25 p-4"><p className="font-semibold">{x}</p><p className="mt-1 text-sm text-white/45">Preparado para conexión API</p></div>)}</div><div className="mt-5"><RecordsList records={records} deleteRecord={deleteRecord} /></div></GlassCard></section></section>;
}

function AiModule({ records, customers, appointments, revenue, title, setTitle, notes, setNotes, createRecord, deleteRecord }: Parameters<typeof ModuleSection>[0]) {
  return <section className="grid gap-6"><div className="rounded-[2rem] border border-violet-300/20 bg-violet-500/15 p-7"><p className="text-sm font-medium text-violet-200">IA Assistant activo</p><h2 className="mt-2 text-3xl font-semibold">Tu panel ahora funciona como centro de inteligencia</h2><p className="mt-2 text-white/60">Este módulo prepara prompts, análisis e insights. Cuando conectemos el proveedor IA, estas instrucciones se convertirán en respuestas automáticas reales.</p></div><div className="grid gap-4 md:grid-cols-4"><Metric icon={<Bot />} label="Prompts" value={records.length} helper="Guardados" /><Metric icon={<Users />} label="Clientes" value={customers.length} helper="Analizables" /><Metric icon={<CalendarDays />} label="Reservas" value={appointments.length} helper="Dataset" /><Metric icon={<TrendingUp />} label="Ingresos" value={`${revenue.toFixed(2)}€`} helper="Contexto" /></div><section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]"><GlassCard title="Nueva instrucción IA"><div className="grid gap-3"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Resumen semanal del negocio" className="input-dark" /><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Pide a Flowly IA que analice clientes inactivos, servicios más rentables, huecos libres o campañas recomendadas" className="input-dark min-h-32" /><button onClick={() => createRecord("ai", "prompt")} className="btn-primary"><Bot size={17} /> Guardar instrucción IA</button></div></GlassCard><GlassCard title="Insights sugeridos"><div className="grid gap-3">{["Clientes sin reservar en 60 días", "Servicios con más margen", "Horas con menor ocupación", "Campaña recomendada esta semana"].map((x) => <div key={x} className="rounded-2xl bg-black/25 p-4"><p className="font-semibold">{x}</p><p className="mt-1 text-sm text-white/45">Listo para automatizar con IA</p></div>)}</div><div className="mt-5"><RecordsList records={records} deleteRecord={deleteRecord} /></div></GlassCard></section></section>;
}

function WhatsappModule({ records, title, setTitle, notes, setNotes, status, setStatus, createRecord, deleteRecord }: Parameters<typeof ModuleSection>[0]) {
  return <section className="grid gap-6"><div className="grid gap-4 md:grid-cols-4"><Metric icon={<MessageCircle />} label="Plantillas" value={records.length} helper="Guardadas" /><Metric icon={<CheckCircle2 />} label="Conexión" value="Pendiente" helper="Proveedor" /><Metric icon={<Clock />} label="Bots" value="3" helper="Preparados" /><Metric icon={<Users />} label="Uso" value="Reservas" helper="Automático" /></div><section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]"><GlassCard title="Configurar bot / plantilla"><div className="grid gap-3"><select value={status} onChange={(e) => setStatus(e.target.value)} className="input-dark"><option value="confirmation">Confirmación de cita</option><option value="reminder">Recordatorio 24h</option><option value="recovery">Recuperación cliente inactivo</option><option value="custom">Mensaje personalizado</option></select><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nombre de plantilla" className="input-dark" /><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Hola {cliente}, te recordamos tu cita en {negocio} el {fecha} a las {hora}." className="input-dark min-h-32" /><button onClick={() => createRecord("whatsapp", status)} className="btn-primary"><Plus size={17} /> Guardar plantilla</button></div></GlassCard><GlassCard title="Conexión WhatsApp"><div className="rounded-2xl bg-black/25 p-5"><p className="font-semibold">Conecta el número del negocio</p><p className="mt-2 text-sm text-white/55">Preparado para integrar WhatsApp Business API, Twilio, 360dialog o proveedor oficial.</p><button className="btn-secondary mt-4" onClick={() => alert("Conexión pendiente de proveedor WhatsApp")}>Conectar número</button></div><div className="mt-5"><RecordsList records={records} deleteRecord={deleteRecord} /></div></GlassCard></section></section>;
}

function AgendaSection({ appointments, customers, employees, services, appointmentCustomer, setAppointmentCustomer, appointmentEmployee, setAppointmentEmployee, appointmentService, setAppointmentService, appointmentDateValue, setAppointmentDateValue, createAppointment, updateAppointmentStatus }: any) { return <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><GlassCard title="Nueva reserva"><div className="grid gap-3"><Select value={appointmentCustomer} onChange={setAppointmentCustomer} placeholder="Seleccionar cliente" options={customers.map((c: Customer) => ({ value: c.id, label: customerName(c) }))} /><Select value={appointmentEmployee} onChange={setAppointmentEmployee} placeholder="Seleccionar empleado" options={employees.map((e: Employee) => ({ value: e.id, label: e.name }))} /><Select value={appointmentService} onChange={setAppointmentService} placeholder="Seleccionar servicio" options={services.map((s: Service) => ({ value: s.id, label: `${s.name} · ${s.price}€` }))} /><input type="datetime-local" value={appointmentDateValue} onChange={(e) => setAppointmentDateValue(e.target.value)} className="input-dark" /><button onClick={createAppointment} className="btn-primary"><Plus size={17} /> Crear reserva</button></div></GlassCard><GlassCard title="Calendario operativo"><div className="space-y-3">{appointments.map((appointment: Appointment) => { const service = firstRelation(appointment.services); const employee = firstRelation(appointment.employees); return <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div className="flex flex-col justify-between gap-3 md:flex-row md:items-start"><div><p className="font-semibold">{new Date(appointmentDate(appointment)).toLocaleString("es-ES")}</p><p className="mt-1 text-sm text-white/58">{customerName(appointment.customers)} · {service?.name || "Servicio"} · {employee?.name || "Sin empleado"}</p><p className="mt-2 text-sm font-medium text-violet-200">{service?.price || 0}€ · {translateStatus(appointment.status)}</p></div><div className="flex flex-wrap gap-2"><StatusButton onClick={() => updateAppointmentStatus(appointment.id, "confirmed")} tone="green">Confirmar</StatusButton><StatusButton onClick={() => updateAppointmentStatus(appointment.id, "completed")} tone="violet">Completada</StatusButton><StatusButton onClick={() => updateAppointmentStatus(appointment.id, "cancelled")} tone="red">Cancelar</StatusButton></div></div></div>; })}{!appointments.length && <Empty text="Todavía no hay reservas." />}</div></GlassCard></section>; }
function ServicesSection({ services, serviceName, setServiceName, serviceDuration, setServiceDuration, servicePrice, setServicePrice, createService }: any) { return <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><GlassCard title="Nuevo servicio"><div className="grid gap-3"><input value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="Nombre del servicio" className="input-dark" /><input value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)} placeholder="Duración en minutos" type="number" className="input-dark" /><input value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} placeholder="Precio" type="number" className="input-dark" /><button onClick={createService} className="btn-primary"><Plus size={17} /> Crear servicio</button></div></GlassCard><GlassCard title="Servicios creados"><div className="grid gap-3 md:grid-cols-2">{services.map((service: Service) => <div key={service.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5"><h3 className="font-semibold">{service.name}</h3><p className="mt-2 text-sm text-white/50">{service.duration || service.duration_minutes || 30} min</p><p className="mt-4 text-2xl font-semibold">{Number(service.price).toFixed(2)}€</p></div>)}{!services.length && <Empty text="Crea tu primer servicio para empezar a recibir reservas." />}</div></GlassCard></section>; }
function EmployeesSection({ employees, employeeName, setEmployeeName, employeePhone, setEmployeePhone, createEmployee }: any) { return <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><GlassCard title="Nuevo empleado"><div className="grid gap-3"><input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="Nombre" className="input-dark" /><input value={employeePhone} onChange={(e) => setEmployeePhone(e.target.value)} placeholder="Teléfono" className="input-dark" /><button onClick={createEmployee} className="btn-primary"><Plus size={17} /> Crear empleado</button></div></GlassCard><GlassCard title="Equipo"><div className="space-y-3">{employees.map((employee: Employee) => <div key={employee.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="font-semibold">{employee.name}</p><p className="text-sm text-white/45">{employee.phone || "Sin teléfono"}</p></div>)}{!employees.length && <Empty text="Añade al primer profesional del negocio." />}</div></GlassCard></section>; }
function CustomersSection({ customers, customerFormName, setCustomerFormName, customerPhone, setCustomerPhone, createCustomer }: any) { return <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><GlassCard title="Nuevo cliente"><div className="grid gap-3"><input value={customerFormName} onChange={(e) => setCustomerFormName(e.target.value)} placeholder="Nombre" className="input-dark" /><input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Teléfono" className="input-dark" /><button onClick={createCustomer} className="btn-primary"><Plus size={17} /> Crear cliente</button></div></GlassCard><GlassCard title="Clientes"><div className="space-y-3">{customers.map((customer: Customer) => <div key={customer.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="font-semibold">{customerName(customer)}</p><p className="text-sm text-white/45">{customer.phone || customer.email || "Sin contacto"}</p></div>)}{!customers.length && <Empty text="Aún no hay clientes." />}</div></GlassCard></section>; }
function SettingsSection({ settings, setSettings, saveSettings }: { settings: BookingSettings; setSettings: (s: BookingSettings) => void; saveSettings: () => void }) { return <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><GlassCard title="Horarios de reservas"><div className="grid gap-3"><label className="text-sm text-white/70">Hora apertura</label><input type="time" value={settings.start_time} onChange={(e) => setSettings({ ...settings, start_time: e.target.value })} className="input-dark" /><label className="text-sm text-white/70">Hora cierre</label><input type="time" value={settings.end_time} onChange={(e) => setSettings({ ...settings, end_time: e.target.value })} className="input-dark" /><label className="text-sm text-white/70">Intervalo</label><select value={settings.interval_minutes} onChange={(e) => setSettings({ ...settings, interval_minutes: Number(e.target.value) })} className="input-dark"><option value={15}>15 minutos</option><option value={30}>30 minutos</option><option value={45}>45 minutos</option><option value={60}>60 minutos</option></select><button onClick={saveSettings} className="btn-primary"><Settings size={17} /> Guardar ajustes</button></div></GlassCard><GlassCard title="Días activos"><div className="grid gap-3"><DayToggle label="Lunes" checked={settings.monday} onChange={(v) => setSettings({ ...settings, monday: v })} /><DayToggle label="Martes" checked={settings.tuesday} onChange={(v) => setSettings({ ...settings, tuesday: v })} /><DayToggle label="Miércoles" checked={settings.wednesday} onChange={(v) => setSettings({ ...settings, wednesday: v })} /><DayToggle label="Jueves" checked={settings.thursday} onChange={(v) => setSettings({ ...settings, thursday: v })} /><DayToggle label="Viernes" checked={settings.friday} onChange={(v) => setSettings({ ...settings, friday: v })} /><DayToggle label="Sábado" checked={settings.saturday} onChange={(v) => setSettings({ ...settings, saturday: v })} /><DayToggle label="Domingo" checked={settings.sunday} onChange={(v) => setSettings({ ...settings, sunday: v })} /></div></GlassCard></section>; }


function PatientHistorySection({
  customers,
  patientProfiles,
  patientCustomerId,
  setPatientCustomerId,
  patientBirthDate,
  setPatientBirthDate,
  patientDocumentId,
  setPatientDocumentId,
  patientGender,
  setPatientGender,
  guardianName,
  setGuardianName,
  guardianPhone,
  setGuardianPhone,
  guardianEmail,
  setGuardianEmail,
  guardianRelationship,
  setGuardianRelationship,
  initialDiagnosis,
  setInitialDiagnosis,
  therapeuticProcess,
  setTherapeuticProcess,
  patientObservations,
  setPatientObservations,
  nextReviewDate,
  setNextReviewDate,
  savePatientProfile,
}: {
  customers: Customer[];
  patientProfiles: PatientProfile[];
  patientCustomerId: string;
  setPatientCustomerId: (v: string) => void;
  patientBirthDate: string;
  setPatientBirthDate: (v: string) => void;
  patientDocumentId: string;
  setPatientDocumentId: (v: string) => void;
  patientGender: string;
  setPatientGender: (v: string) => void;
  guardianName: string;
  setGuardianName: (v: string) => void;
  guardianPhone: string;
  setGuardianPhone: (v: string) => void;
  guardianEmail: string;
  setGuardianEmail: (v: string) => void;
  guardianRelationship: string;
  setGuardianRelationship: (v: string) => void;
  initialDiagnosis: string;
  setInitialDiagnosis: (v: string) => void;
  therapeuticProcess: string;
  setTherapeuticProcess: (v: string) => void;
  patientObservations: string;
  setPatientObservations: (v: string) => void;
  nextReviewDate: string;
  setNextReviewDate: (v: string) => void;
  savePatientProfile: () => void;
}) {
  const selectedProfile = patientProfiles.find((item) => item.customer_id === patientCustomerId);

  useEffect(() => {
    if (!selectedProfile) return;
    setPatientBirthDate(selectedProfile.birth_date || "");
    setPatientDocumentId(selectedProfile.document_id || "");
    setPatientGender(selectedProfile.gender || "");
    setGuardianName(selectedProfile.guardian_name || "");
    setGuardianPhone(selectedProfile.guardian_phone || "");
    setGuardianEmail(selectedProfile.guardian_email || "");
    setGuardianRelationship(selectedProfile.guardian_relationship || "");
    setInitialDiagnosis(selectedProfile.initial_diagnosis || "");
    setTherapeuticProcess(selectedProfile.therapeutic_process || "");
    setPatientObservations(selectedProfile.observations || "");
    setNextReviewDate(selectedProfile.next_review_date || "");
  }, [selectedProfile]);

  const withProfile = patientProfiles.length;
  const nextReviews = patientProfiles.filter((item) => item.next_review_date).length;

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={<Users />} label="Pacientes" value={customers.length} helper="Base total" />
        <Metric icon={<FileText />} label="Historias clínicas" value={withProfile} helper="Creadas" />
        <Metric icon={<CalendarDays />} label="Revisiones" value={nextReviews} helper="Programadas" />
        <Metric icon={<UserRound />} label="Acudientes" value={withProfile} helper="Registrados" />
      </div>

      <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <GlassCard title="Historia clínica infantil">
          <div className="grid gap-3">
            <Select
              value={patientCustomerId}
              onChange={setPatientCustomerId}
              placeholder="Seleccionar paciente"
              options={customers.map((c) => ({ value: c.id, label: customerName(c) }))}
            />

            <div className="grid gap-3 md:grid-cols-2">
              <input type="date" value={patientBirthDate} onChange={(e) => setPatientBirthDate(e.target.value)} className="input-dark" />
              <input value={patientDocumentId} onChange={(e) => setPatientDocumentId(e.target.value)} placeholder="Documento / ID" className="input-dark" />
            </div>

            <select value={patientGender} onChange={(e) => setPatientGender(e.target.value)} className="input-dark">
              <option value="">Género</option>
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
              <option value="otro">Otro / No especificado</option>
            </select>

            <div className="grid gap-3 md:grid-cols-2">
              <input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} placeholder="Nombre del acudiente" className="input-dark" />
              <input value={guardianRelationship} onChange={(e) => setGuardianRelationship(e.target.value)} placeholder="Parentesco" className="input-dark" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <input value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} placeholder="Teléfono acudiente" className="input-dark" />
              <input value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} placeholder="Email acudiente" type="email" className="input-dark" />
            </div>

            <textarea value={initialDiagnosis} onChange={(e) => setInitialDiagnosis(e.target.value)} placeholder="Diagnóstico inicial" className="input-dark min-h-24" />
            <textarea value={therapeuticProcess} onChange={(e) => setTherapeuticProcess(e.target.value)} placeholder="Proceso terapéutico / tratamiento" className="input-dark min-h-24" />
            <textarea value={patientObservations} onChange={(e) => setPatientObservations(e.target.value)} placeholder="Observaciones clínicas" className="input-dark min-h-24" />

            <label className="text-sm text-white/70">Próxima revisión</label>
            <input type="date" value={nextReviewDate} onChange={(e) => setNextReviewDate(e.target.value)} className="input-dark" />

            <button onClick={savePatientProfile} className="btn-primary">
              <FileText size={17} /> Guardar historial clínico
            </button>
          </div>
        </GlassCard>

        <GlassCard title="Pacientes con historial">
          <div className="space-y-3">
            {patientProfiles.map((profile) => {
              const customer = customers.find((c) => c.id === profile.customer_id);
              return (
                <div key={profile.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <p className="font-semibold">{profile.child_full_name || (customer ? customerName(customer) : "Paciente")}</p>
                      <p className="mt-1 text-sm text-white/50">
                        Acudiente: {profile.guardian_name || "Sin acudiente"} · {profile.guardian_phone || "Sin teléfono"}
                      </p>
                      <p className="mt-2 text-sm text-violet-200">
                        {profile.initial_diagnosis || "Sin diagnóstico inicial"}
                      </p>
                      {profile.next_review_date && (
                        <p className="mt-2 text-xs text-white/35">Próxima revisión: {new Date(profile.next_review_date).toLocaleDateString("es-ES")}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setPatientCustomerId(profile.customer_id)}
                      className="rounded-full bg-white px-4 py-2 text-xs font-medium text-neutral-950"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              );
            })}
            {!patientProfiles.length && <Empty text="Aún no hay historiales clínicos creados." />}
          </div>
        </GlassCard>
      </section>
    </section>
  );
}

function RecordsCard({ title, records, deleteRecord }: { title: string; records: ModuleRecord[]; deleteRecord: (id: string) => void }) { return <GlassCard title={title}><RecordsList records={records} deleteRecord={deleteRecord} /></GlassCard>; }
function RecordsList({ records, deleteRecord }: { records: ModuleRecord[]; deleteRecord: (id: string) => void }) { return <div className="space-y-3">{records.map((record) => <div key={record.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{record.title}</p>{record.notes && <p className="mt-2 text-sm leading-6 text-white/55">{record.notes}</p>}<p className="mt-2 text-xs text-white/35">{record.status} · {new Date(record.created_at).toLocaleString("es-ES")}</p></div>{record.amount !== null && <p className="rounded-full bg-violet-500/20 px-3 py-1 text-sm text-violet-100">{Number(record.amount).toFixed(2)}€</p>}</div><button onClick={() => deleteRecord(record.id)} className="mt-3 text-xs text-red-200/80">Eliminar</button></div>)}{!records.length && <Empty text="Aún no hay registros." />}</div>; }
function Shell({ children }: { children: React.ReactNode; theme?: string }) { return <main className="min-h-screen overflow-hidden bg-[#070711] text-white"><div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,.55),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,.18),transparent_30%)]" /><div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:64px_64px]" /><div className="relative">{children}</div></main>; }
function Metric({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string | number; helper: string }) { return <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-100">{icon}</div><p className="text-sm text-white/50">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p><p className="mt-1 text-xs text-white/35">{helper}</p></div>; }
function GlassCard({ title, children }: { title?: string; children: React.ReactNode }) { return <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">{title && <h2 className="mb-5 text-2xl font-semibold">{title}</h2>}{children}</div>; }
function InfoBox({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-sm text-white/45">{label}</p><p className="mt-2 text-2xl font-semibold capitalize">{value}</p></div>; }
function ModuleAccessCard({ module, active = false, onOpen }: { module: ModuleItem; active?: boolean; onOpen?: () => void }) { const Icon = module.Icon; return <div className={active ? "rounded-2xl border border-violet-400/30 bg-violet-500/15 p-4" : "rounded-2xl border border-white/10 bg-white/[0.05] p-4"}><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-violet-100"><Icon size={18} /></div><div><p className="font-semibold">{module.name}</p><p className="mt-1 text-xs leading-5 text-white/45">{module.description}</p><div className="mt-3 flex flex-wrap gap-2">{active ? <button onClick={onOpen} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-950">Abrir</button> : <Link href="/precios#modular" className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/75">Añadir {module.price}</Link>}</div></div></div></div>; }
function Select({ value, onChange, placeholder, options }: { value: string; onChange: (value: string) => void; placeholder: string; options: { value: string; label: string }[] }) { return <select value={value} onChange={(e) => onChange(e.target.value)} className="input-dark"><option value="">{placeholder}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>; }
function DayToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] p-4"><span className="font-medium">{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5" /></label>; }
function StatusButton({ children, onClick, tone }: { children: React.ReactNode; onClick: () => void; tone: "green" | "red" | "violet" }) { const className = tone === "green" ? "border-green-300/25 text-green-200" : tone === "red" ? "border-red-300/25 text-red-200" : "border-violet-300/25 text-violet-200"; return <button onClick={onClick} className={`rounded-full border px-3 py-2 text-xs ${className}`}>{children}</button>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/45">{text}</div>; }
function Feature({ text }: { text: string }) { return <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5"><CheckCircle2 className="mb-3 text-violet-200" size={22} /><p className="font-medium">{text}</p></div>; }
function translateStatus(status: string) { if (status === "pending") return "Pendiente"; if (status === "confirmed") return "Confirmada"; if (status === "completed") return "Completada"; if (status === "cancelled") return "Cancelada"; return status; }
