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

type CompanyProfile = {
  id?: string;
  business_id: string;
  company_name: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  tax_id: string | null;
  website: string | null;
  public_description: string | null;
  schedule_text?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type UserProfile = { account_type: "client" | "sales" | "admin"; role: string };
type Service = { id: string; name: string; duration: number | null; duration_minutes?: number | null; price: number; active: boolean | null };
type Employee = { id: string; name: string; email: string | null; phone: string | null; active: boolean | null };
type Customer = {
  id: string;
  name?: string;
  full_name?: string;
  phone: string | null;
  email: string | null;
  address?: string | null;
  responsible_name?: string | null;
  notes: string | null;
  crm_status?: string | null;
  eps?: string | null;
  document_type?: string | null;
  document_number?: string | null;
  last_contact_at?: string | null;
  next_follow_up_at?: string | null;
};

type WhatsappMessage = {
  id: string;
  business_id: string;
  customer_id: string | null;
  phone: string;
  template_key: string | null;
  message: string;
  status: string | null;
  created_at: string;
};

type WhatsappTemplate = {
  id?: string;
  business_id?: string;
  key: string;
  label: string;
  message: string;
  category?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type CrmReminder = {
  id: string;
  business_id: string;
  customer_id: string;
  title: string;
  notes: string | null;
  remind_at: string;
  status: string | null;
  created_at: string;
  customers?: Relation<{ name?: string; full_name?: string; phone?: string | null }>;
};
type Appointment = {
  id: string;
  business_id?: string;
  customer_id?: string | null;
  employee_id?: string | null;
  service_id?: string | null;
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
type ModuleRecord = {
  id: string;
  business_id: string;
  module_key: string;
  title: string;
  amount: number | null;
  status: string;
  notes: string | null;
  customer_id?: string | null;
  due_date?: string | null;
  created_at: string;
};

type VoiceCall = {
  id: string;
  business_id: string;
  caller_name: string | null;
  caller_phone: string;
  reason: string | null;
  transcript: string | null;
  intent: string | null;
  status: string | null;
  priority: string | null;
  source: string | null;
  call_id?: string | null;
  eps?: string | null;
  document_type?: string | null;
  document_number?: string | null;
  customer_id?: string | null;
  appointment_id?: string | null;
  created_at: string;
};


type ClinicalDocument = {
  id: string;
  business_id: string;
  customer_id: string;
  title: string;
  file_name: string | null;
  file_path: string;
  file_url: string | null;
  document_type: string | null;
  notes: string | null;
  created_at: string;
};

type CoreTab = "area" | "agenda" | "servicios" | "empleados" | "clientes" | "recordatorios" | "ajustes";
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

function normalizePhone(value: string | null | undefined) {
  return String(value || "").replace(/\D/g, "");
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [modules, setModules] = useState<BusinessModule[]>([]);
  const [moduleRecords, setModuleRecords] = useState<ModuleRecord[]>([]);
  const [voiceCalls, setVoiceCalls] = useState<VoiceCall[]>([]);
  const [clinicalDocuments, setClinicalDocuments] = useState<ClinicalDocument[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsappMessage[]>([]);
  const [whatsappTemplatesData, setWhatsappTemplatesData] = useState<WhatsappTemplate[]>([]);
  const [crmReminders, setCrmReminders] = useState<CrmReminder[]>([]);
  const [dueReminder, setDueReminder] = useState<CrmReminder | null>(null);
  const [incomingVoiceCall, setIncomingVoiceCall] = useState<VoiceCall | null>(null);
  const [selectedCrmCustomerId, setSelectedCrmCustomerId] = useState("");
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
  const [voiceCallerName, setVoiceCallerName] = useState("");
  const [voiceCallerPhone, setVoiceCallerPhone] = useState("");
  const [voiceReason, setVoiceReason] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceIntent, setVoiceIntent] = useState("informacion");
  const [voiceStatus, setVoiceStatus] = useState("nueva");
  const [voicePriority, setVoicePriority] = useState("normal");
  const [voiceScheduleCallId, setVoiceScheduleCallId] = useState("");
  const [voiceScheduleEmployee, setVoiceScheduleEmployee] = useState("");
  const [voiceScheduleService, setVoiceScheduleService] = useState("");
  const [voiceScheduleDate, setVoiceScheduleDate] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyTaxId, setCompanyTaxId] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [companySchedule, setCompanySchedule] = useState("");
  const [companyPrimaryColor, setCompanyPrimaryColor] = useState("#7c3aed");
  const [companySecondaryColor, setCompanySecondaryColor] = useState("#ec4899");
  const [logoUploading, setLogoUploading] = useState(false);

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

    const [companyRes, servicesRes, employeesRes, customersRes, appointmentsRes, settingsRes, modulesRes, recordsRes, voiceCallsRes, clinicalDocumentsRes, whatsappMessagesRes, whatsappTemplatesRes, crmRemindersRes] = await Promise.all([
      supabase.from("company_profiles").select("*").eq("business_id", businessId).maybeSingle(),
      supabase.from("services").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("employees").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("customers").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("appointments").select("*, customers(name, full_name), employees(name), services(name, price)").eq("business_id", businessId).order("appointment_date", { ascending: true }),
      supabase.from("booking_settings").select("*").eq("business_id", businessId).maybeSingle(),
      supabase.from("business_modules").select("*").eq("business_id", businessId).eq("status", "active"),
      supabase.from("module_records").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("voice_calls").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("clinical_documents").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("whatsapp_messages").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("whatsapp_templates").select("*").eq("business_id", businessId).eq("is_active", true).order("label", { ascending: true }),
      supabase.from("crm_reminders").select("*, customers(name, full_name, phone)").eq("business_id", businessId).order("remind_at", { ascending: true }),
    ]);

    const loadedCompanyProfile = (companyRes.data as CompanyProfile | null) || null;
    setCompanyProfile(loadedCompanyProfile);
    setCompanyName(loadedCompanyProfile?.company_name || businessData.name || "");
    setCompanyPhone(loadedCompanyProfile?.phone || "");
    setCompanyEmail(loadedCompanyProfile?.email || "");
    setCompanyAddress(loadedCompanyProfile?.address || "");
    setCompanyTaxId(loadedCompanyProfile?.tax_id || "");
    setCompanyWebsite(loadedCompanyProfile?.website || "");
    setCompanyDescription(loadedCompanyProfile?.public_description || "");
    setCompanySchedule(loadedCompanyProfile?.schedule_text || "");
    setCompanyPrimaryColor(loadedCompanyProfile?.primary_color || "#7c3aed");
    setCompanySecondaryColor(loadedCompanyProfile?.secondary_color || "#ec4899");

    setServices((servicesRes.data || []) as unknown as Service[]);
    setEmployees((employeesRes.data || []) as Employee[]);
    setCustomers((customersRes.data || []) as unknown as Customer[]);
    setAppointments((appointmentsRes.data || []) as unknown as Appointment[]);
    setSettings((settingsRes.data as BookingSettings) || defaultSettings(businessId));
    setModules((modulesRes.data || []) as BusinessModule[]);
    setModuleRecords((recordsRes.data || []) as ModuleRecord[]);
    setVoiceCalls((voiceCallsRes.data || []) as VoiceCall[]);
    setClinicalDocuments((clinicalDocumentsRes.data || []) as ClinicalDocument[]);
    setWhatsappMessages((whatsappMessagesRes.data || []) as WhatsappMessage[]);
    setWhatsappTemplatesData((whatsappTemplatesRes.data || []) as WhatsappTemplate[]);
    setCrmReminders((crmRemindersRes.data || []) as unknown as CrmReminder[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!business?.id) return;

    const channel = supabase
      .channel(`flowly-voice-${business.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "voice_calls",
          filter: `business_id=eq.${business.id}`,
        },
        (payload) => {
          const call = payload.new as VoiceCall;
          setVoiceCalls((current) => [call, ...current.filter((item) => item.id !== call.id)]);
          setIncomingVoiceCall(call);
          if (call.customer_id) setSelectedCrmCustomerId(call.customer_id);
          setActiveTab("module:crm");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [business?.id]);

  useEffect(() => {
    if (!incomingVoiceCall) return;

    const matched = customers.find((customer) => {
      const callPhone = normalizePhone(incomingVoiceCall.caller_phone);
      const customerPhone = normalizePhone(customer.phone);
      const documentMatches =
        incomingVoiceCall.document_number &&
        customer.document_number &&
        String(customer.document_number) === String(incomingVoiceCall.document_number);

      return (
        (incomingVoiceCall.customer_id && customer.id === incomingVoiceCall.customer_id) ||
        Boolean(documentMatches) ||
        (!!callPhone && !!customerPhone && customerPhone.endsWith(callPhone.slice(-9)))
      );
    });

    if (matched) {
      setSelectedCrmCustomerId(matched.id);
      setActiveTab("module:crm");
    }
  }, [incomingVoiceCall, customers]);

  useEffect(() => {
    const checkDueReminders = () => {
      const now = Date.now();
      const nextDue = crmReminders.find((reminder) => {
        if ((reminder.status || "pending") !== "pending") return false;
        return new Date(reminder.remind_at).getTime() <= now;
      });
      if (nextDue) setDueReminder(nextDue);
    };

    checkDueReminders();
    const timer = window.setInterval(checkDueReminders, 30000);
    return () => window.clearInterval(timer);
  }, [crmReminders]);

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
  const whatsappTemplatesEffective = useMemo(() => mergeWhatsappTemplates(whatsappTemplates, whatsappTemplatesData), [whatsappTemplatesData]);
  const upcomingReminders = useMemo(() => getUpcomingReminders(crmReminders, 7), [crmReminders]);

  const resetRecordForm = () => { setRecordTitle(""); setRecordNotes(""); setRecordAmount(""); setRecordStatus("active"); };
  const resetVoiceForm = () => {
    setVoiceCallerName("");
    setVoiceCallerPhone("");
    setVoiceReason("");
    setVoiceTranscript("");
    setVoiceIntent("informacion");
    setVoiceStatus("nueva");
    setVoicePriority("normal");
  };

  const resetVoiceScheduleForm = () => {
    setVoiceScheduleCallId("");
    setVoiceScheduleEmployee("");
    setVoiceScheduleService("");
    setVoiceScheduleDate("");
  };

  const normalizePhone = (value?: string | null) =>
    String(value || "").replace(/\D/g, "");

  const findCustomerForVoiceCall = (call: VoiceCall) => {
    const callPhone = normalizePhone(call.caller_phone);
    return customers.find((customer) => {
      const customerPhone = normalizePhone(customer.phone);
      return (
        (call.customer_id && customer.id === call.customer_id) ||
        (!!callPhone && !!customerPhone && customerPhone.endsWith(callPhone.slice(-9)))
      );
    }) || null;
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
    const { error } = await supabase.from("customers").insert({ business_id: business.id, name: customerFormName, full_name: customerFormName, phone: customerPhone, crm_status: "nuevo" });
    if (error) return alert(error.message);
    setCustomerFormName(""); setCustomerPhone(""); await loadData();
  };
  const createAppointment = async () => {
    if (!business || !appointmentCustomer || !appointmentEmployee || !appointmentService || !appointmentDateValue) return alert("Faltan datos");
    const { error } = await supabase.from("appointments").insert({ business_id: business.id, customer_id: appointmentCustomer, employee_id: appointmentEmployee, service_id: appointmentService, appointment_date: appointmentDateValue, starts_at: appointmentDateValue, status: "pending" });
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

  const saveCompanyProfile = async () => {
    if (!business) return;

    const payload = {
      business_id: business.id,
      company_name: companyName || business.name,
      logo_url: companyProfile?.logo_url || business.logo_url || null,
      phone: companyPhone || null,
      email: companyEmail || null,
      address: companyAddress || null,
      tax_id: companyTaxId || null,
      website: companyWebsite || null,
      public_description: companyDescription || null,
      schedule_text: companySchedule || null,
      primary_color: companyPrimaryColor || null,
      secondary_color: companySecondaryColor || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("company_profiles")
      .upsert(payload, { onConflict: "business_id" });

    if (error) return alert(error.message);

    const { error: businessError } = await supabase
      .from("businesses")
      .update({
        name: payload.company_name,
        logo_url: payload.logo_url,
      })
      .eq("id", business.id);

    if (businessError) return alert(businessError.message);

    alert("Perfil de empresa guardado");
    await loadData();
  };

  const uploadCompanyLogo = async (file: File) => {
    if (!business) return;
    setLogoUploading(true);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "png";
      const filePath = `${business.id}/logo-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("business-logos")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("business-logos")
        .getPublicUrl(filePath);

      const logoUrl = publicUrlData.publicUrl;

      const { error: profileError } = await supabase
        .from("company_profiles")
        .upsert({
          business_id: business.id,
          company_name: companyName || business.name,
          logo_url: logoUrl,
          phone: companyPhone || null,
          email: companyEmail || null,
          address: companyAddress || null,
          tax_id: companyTaxId || null,
          website: companyWebsite || null,
          public_description: companyDescription || null,
          schedule_text: companySchedule || null,
          primary_color: companyPrimaryColor || null,
          secondary_color: companySecondaryColor || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "business_id" });

      if (profileError) {
        alert(profileError.message);
        return;
      }

      const { error: businessError } = await supabase
        .from("businesses")
        .update({ logo_url: logoUrl })
        .eq("id", business.id);

      if (businessError) {
        alert(businessError.message);
        return;
      }

      setCompanyProfile((current) => ({
        ...(current || { business_id: business.id }),
        company_name: companyName || business.name,
        logo_url: logoUrl,
        phone: companyPhone || null,
        email: companyEmail || null,
        address: companyAddress || null,
        tax_id: companyTaxId || null,
        website: companyWebsite || null,
        public_description: companyDescription || null,
        schedule_text: companySchedule || null,
        primary_color: companyPrimaryColor || null,
        secondary_color: companySecondaryColor || null,
      } as CompanyProfile));
      setBusiness({ ...business, logo_url: logoUrl });
      alert("Logo subido correctamente");
    } finally {
      setLogoUploading(false);
    }
  };

  const createAppointmentForCustomer = async (customerId: string, employeeId: string, serviceId: string, dateValue: string) => {
    if (!business || !customerId || !employeeId || !serviceId || !dateValue) return alert("Faltan datos para agendar la cita");
    const { error } = await supabase.from("appointments").insert({
      business_id: business.id,
      customer_id: customerId,
      employee_id: employeeId,
      service_id: serviceId,
      appointment_date: dateValue,
      starts_at: dateValue,
      status: "pending",
    });
    if (error) return alert(error.message);

    await supabase
      .from("customers")
      .update({ crm_status: "cita_agendada", next_follow_up_at: null })
      .eq("id", customerId);

    await loadData();
    alert("Cita agendada desde CRM");
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

  const createVoiceCall = async () => {
    if (!business || !voiceCallerPhone) return alert("Añade al menos el teléfono de la llamada");

    const { error } = await supabase.from("voice_calls").insert({
      business_id: business.id,
      caller_name: voiceCallerName || null,
      caller_phone: voiceCallerPhone,
      reason: voiceReason || null,
      transcript: voiceTranscript || null,
      intent: voiceIntent,
      status: voiceStatus,
      priority: voicePriority,
      source: "manual",
    });

    if (error) return alert(error.message);
    resetVoiceForm();
    await loadData();
  };

  const updateVoiceCallStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("voice_calls").update({ status }).eq("id", id);
    if (error) return alert(error.message);
    await loadData();
  };

  const updateCustomerCrm = async (
    customerId: string,
    updates: Partial<Customer>
  ) => {
    const { error } = await supabase
      .from("customers")
      .update({ ...updates, last_contact_at: new Date().toISOString() })
      .eq("id", customerId);

    if (error) return alert(error.message);
    await loadData();
  };

  const createCrmAction = async (customerId: string, title: string, notes: string, status = "followup", dueDate?: string) => {
    if (!business || !title.trim()) return alert("Añade un título para la acción CRM");

    const { error } = await supabase.from("module_records").insert({
      business_id: business.id,
      module_key: "crm",
      customer_id: customerId,
      title,
      notes: notes || null,
      status,
      due_date: dueDate || null,
    });

    if (error) return alert(error.message);
    await loadData();
  };

  const saveCrmReminder = async (customerId: string, title: string, remindAt: string, notes = "") => {
    if (!business || !customerId || !title.trim() || !remindAt) return alert("Selecciona paciente, título, fecha y hora del recordatorio");
    const { error } = await supabase.from("crm_reminders").insert({
      business_id: business.id,
      customer_id: customerId,
      title: title.trim(),
      notes: notes || null,
      remind_at: remindAt,
      status: "pending",
    });
    if (error) return alert(error.message);
    await loadData();
  };

  const completeCrmReminder = async (id: string) => {
    const { error } = await supabase.from("crm_reminders").update({ status: "completed" }).eq("id", id);
    if (error) return alert(error.message);
    setDueReminder((current) => (current?.id === id ? null : current));
    await loadData();
  };

  const deleteCrmReminder = async (id: string) => {
    const { error } = await supabase.from("crm_reminders").delete().eq("id", id);
    if (error) return alert(error.message);
    setDueReminder((current) => (current?.id === id ? null : current));
    await loadData();
  };

  const saveWhatsappTemplate = async (template: WhatsappTemplate) => {
    if (!business || !template.label.trim() || !template.message.trim()) return alert("Añade nombre y mensaje de plantilla");
    const templateKey = template.key || `custom_${Date.now()}`;
    const payload = {
      business_id: business.id,
      key: templateKey,
      label: template.label.trim(),
      message: template.message.trim(),
      category: template.category || "custom",
      is_active: true,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("whatsapp_templates").upsert(payload, { onConflict: "business_id,key" });
    if (error) return alert(error.message);

    const savedTemplate = payload as WhatsappTemplate;
    setWhatsappTemplatesData((current) => {
      const withoutCurrent = current.filter((item) => item.key !== templateKey);
      return [...withoutCurrent, savedTemplate].sort((a, b) => a.label.localeCompare(b.label));
    });
    await loadData();
  };

  const deleteWhatsappTemplate = async (template: WhatsappTemplate) => {
    if (!business) return;
    const { error } = await supabase
      .from("whatsapp_templates")
      .upsert({ business_id: business.id, key: template.key, label: template.label, message: template.message, category: template.category || "custom", is_active: false, updated_at: new Date().toISOString() }, { onConflict: "business_id,key" });
    if (error) return alert(error.message);
    await loadData();
  };


  const uploadClinicalDocument = async (customerId: string, file: File, title?: string, documentType = "clinico", notes = "") => {
    if (!business || !customerId || !file) return alert("Selecciona un paciente y un archivo");

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${business.id}/${customerId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("clinical_documents")
      .upload(path, file, { upsert: false });

    if (uploadError) return alert(uploadError.message);

    const { data: publicData } = supabase.storage
      .from("clinical_documents")
      .getPublicUrl(path);

    const { error: insertError } = await supabase.from("clinical_documents").insert({
      business_id: business.id,
      customer_id: customerId,
      title: title || file.name,
      file_name: file.name,
      file_path: path,
      file_url: publicData.publicUrl,
      document_type: documentType || "clinico",
      notes: notes || null,
    });

    if (insertError) return alert(insertError.message);

    await createCrmAction(customerId, `Documento subido: ${title || file.name}`, notes || "Documento clínico cargado en la ficha", "documento");
    await loadData();
  };

  const convertVoiceCallToCustomer = async (call: VoiceCall) => {
    if (!business) return null;

    const cleanPhone = call.caller_phone.trim();
    if (!cleanPhone) {
      alert("Esta llamada no tiene teléfono");
      return null;
    }

    const existingCustomer = findCustomerForVoiceCall(call);

    if (existingCustomer) {
      const { error: updateCallError } = await supabase
        .from("voice_calls")
        .update({ status: "contactado", customer_id: existingCustomer.id })
        .eq("id", call.id);

      if (updateCallError) {
        alert(updateCallError.message);
        return null;
      }

      setSelectedCrmCustomerId(existingCustomer.id);
      setActiveTab("module:crm");
      await loadData();
      return existingCustomer.id;
    }

    const customerNameFromCall = call.caller_name?.trim() || "Paciente desde llamada";
    const notes = [
      call.reason || call.transcript || "Creado desde Flowly Voice",
      call.eps ? `EPS: ${call.eps}` : "",
      call.document_type ? `Tipo documento: ${call.document_type}` : "",
      call.document_number ? `Documento: ${call.document_number}` : "",
    ].filter(Boolean).join("\n");

    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({
        business_id: business.id,
        name: customerNameFromCall,
        full_name: customerNameFromCall,
        phone: cleanPhone,
        notes,
        crm_status: "nuevo",
        eps: call.eps || call.intent || null,
        document_type: call.document_type || null,
        document_number: call.document_number || null,
        last_contact_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (customerError) {
      alert(customerError.message);
      return null;
    }

    const { error: updateCallError } = await supabase
      .from("voice_calls")
      .update({ status: "contactado", customer_id: newCustomer.id })
      .eq("id", call.id);

    if (updateCallError) {
      alert(updateCallError.message);
      return null;
    }

    setSelectedCrmCustomerId(newCustomer.id as string);
    setActiveTab("module:crm");
    await loadData();
    return newCustomer.id as string;
  };

  const createAppointmentFromVoiceCall = async (call: VoiceCall) => {
    if (!business) return;
    if (!voiceScheduleEmployee || !voiceScheduleService || !voiceScheduleDate) {
      return alert("Selecciona profesional, servicio y fecha/hora para agendar.");
    }

    let customerId = findCustomerForVoiceCall(call)?.id || call.customer_id || null;

    if (!customerId) {
      customerId = await convertVoiceCallToCustomer(call);
    }

    if (!customerId) return;

    const { data: appointmentData, error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        business_id: business.id,
        customer_id: customerId,
        employee_id: voiceScheduleEmployee,
        service_id: voiceScheduleService,
        appointment_date: voiceScheduleDate,
        starts_at: voiceScheduleDate,
        status: "confirmed",
      })
      .select("id")
      .single();

    if (appointmentError) return alert(appointmentError.message);

    const { error: updateCallError } = await supabase
      .from("voice_calls")
      .update({
        status: "cita_creada",
        customer_id: customerId,
        appointment_id: appointmentData.id,
      })
      .eq("id", call.id);

    if (updateCallError) return alert(updateCallError.message);

    resetVoiceScheduleForm();
    alert("Cita creada desde la llamada");
    await loadData();
  };


  const saveWhatsappMessage = async (customerId: string | null, phone: string, templateKey: string | null, message: string) => {
    if (!business || !phone || !message) return;
    const { error } = await supabase.from("whatsapp_messages").insert({
      business_id: business.id,
      customer_id: customerId,
      phone,
      template_key: templateKey,
      message,
      status: "opened",
    });
    if (error) console.error("WHATSAPP HISTORY ERROR", error.message);
    await loadData();
  };

  const deleteVoiceCall = async (id: string) => {
    const { error } = await supabase.from("voice_calls").delete().eq("id", id);
    if (error) return alert(error.message);
    await loadData();
  };

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#070711] text-white">Cargando panel...</main>;
  if (!business || !settings) {
    return <Shell><div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 text-center shadow-2xl shadow-black/25 backdrop-blur-xl"><h1 className="text-3xl font-semibold">Tu cuenta todavía no tiene un negocio asociado</h1><p className="mt-3 text-white/60">Completa el registro después de contratar un plan o contacta con soporte si ya has pagado.</p><Link href="/precios" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-medium text-neutral-950">Ver planes</Link></div></Shell>;
  }

  const matchedIncomingCustomer = incomingVoiceCall
    ? customers.find((customer) => {
        const callPhone = normalizePhone(incomingVoiceCall.caller_phone);
        return Boolean(callPhone) && normalizePhone(customer.phone).endsWith(callPhone.slice(-9));
      })
    : null;

  const navItems: { id: CoreTab; label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: "area", label: "Área personal", Icon: LayoutDashboard },
    { id: "agenda", label: "Agenda", Icon: CalendarDays },
    { id: "servicios", label: "Servicios", Icon: Scissors },
    { id: "empleados", label: "Empleados", Icon: UserRound },
    { id: "clientes", label: "Clientes", Icon: Users },
    { id: "recordatorios", label: "Recordatorios", Icon: Clock },
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

          {dueReminder && (
            <ReminderAlarm reminder={dueReminder} completeReminder={completeCrmReminder} dismiss={() => setDueReminder(null)} />
          )}

          {incomingVoiceCall && (
            <div className="mb-6 rounded-[2rem] border border-green-300/25 bg-green-500/15 p-5 shadow-2xl shadow-green-950/20 backdrop-blur-xl">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-400/20 text-green-100">
                    <PhoneCall size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-200">Llamada entrante</p>
                    <h2 className="mt-1 text-2xl font-semibold">{incomingVoiceCall.caller_phone}</h2>
                    <p className="mt-1 text-sm text-white/60">
                      {matchedIncomingCustomer ? `Paciente encontrado: ${customerName(matchedIncomingCustomer)}` : "Número nuevo. Puedes crearlo como paciente desde Flowly Voice."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (matchedIncomingCustomer) setSelectedCrmCustomerId(matchedIncomingCustomer.id);
                      setActiveTab("module:crm");
                    }}
                    className="rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950"
                  >
                    Abrir ficha CRM
                  </button>
                  <button onClick={() => setActiveTab("module:voice")} className="rounded-full border border-green-300/25 px-5 py-3 text-sm text-green-100">Abrir Voice</button>
                  <button onClick={() => setIncomingVoiceCall(null)} className="rounded-full border border-white/15 px-5 py-3 text-sm text-white/75">Cerrar</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "area" && <AreaSection business={business} activeModules={activeModules} inactiveModules={inactiveModules} bookingUrl={bookingUrl} openBillingPortal={openBillingPortal} setActiveTab={setActiveTab} />}
          {activeTab === "agenda" && <AgendaSection appointments={appointments} customers={customers} employees={employees} services={services} appointmentCustomer={appointmentCustomer} setAppointmentCustomer={setAppointmentCustomer} appointmentEmployee={appointmentEmployee} setAppointmentEmployee={setAppointmentEmployee} appointmentService={appointmentService} setAppointmentService={setAppointmentService} appointmentDateValue={appointmentDateValue} setAppointmentDateValue={setAppointmentDateValue} createAppointment={createAppointment} updateAppointmentStatus={updateAppointmentStatus} />}
          {activeTab === "servicios" && <ServicesSection services={services} serviceName={serviceName} setServiceName={setServiceName} serviceDuration={serviceDuration} setServiceDuration={setServiceDuration} servicePrice={servicePrice} setServicePrice={setServicePrice} createService={createService} />}
          {activeTab === "empleados" && <EmployeesSection employees={employees} employeeName={employeeName} setEmployeeName={setEmployeeName} employeePhone={employeePhone} setEmployeePhone={setEmployeePhone} createEmployee={createEmployee} />}
          {activeTab === "clientes" && <CustomersSection customers={customers} customerFormName={customerFormName} setCustomerFormName={setCustomerFormName} customerPhone={customerPhone} setCustomerPhone={setCustomerPhone} createCustomer={createCustomer} />}
          {activeTab === "recordatorios" && <RemindersSection reminders={upcomingReminders} customers={customers} completeReminder={completeCrmReminder} deleteReminder={deleteCrmReminder} />}
          {activeTab === "ajustes" && <SettingsSection
            business={business}
            settings={settings}
            setSettings={setSettings}
            saveSettings={saveSettings}
            companyProfile={companyProfile}
            companyName={companyName}
            setCompanyName={setCompanyName}
            companyPhone={companyPhone}
            setCompanyPhone={setCompanyPhone}
            companyEmail={companyEmail}
            setCompanyEmail={setCompanyEmail}
            companyAddress={companyAddress}
            setCompanyAddress={setCompanyAddress}
            companyTaxId={companyTaxId}
            setCompanyTaxId={setCompanyTaxId}
            companyWebsite={companyWebsite}
            setCompanyWebsite={setCompanyWebsite}
            companyDescription={companyDescription}
            setCompanyDescription={setCompanyDescription}
            companySchedule={companySchedule}
            setCompanySchedule={setCompanySchedule}
            companyPrimaryColor={companyPrimaryColor}
            setCompanyPrimaryColor={setCompanyPrimaryColor}
            companySecondaryColor={companySecondaryColor}
            setCompanySecondaryColor={setCompanySecondaryColor}
            logoUploading={logoUploading}
            uploadCompanyLogo={uploadCompanyLogo}
            saveCompanyProfile={saveCompanyProfile}
          />}
          {activeModule && <ModuleSection module={activeModule} records={moduleRecords.filter((r) => r.module_key === activeModule.key)} allRecords={moduleRecords} customers={customers} employees={employees} appointments={appointments} services={services} revenue={revenue} expenses={expenses} manualIncome={manualIncome} title={recordTitle} setTitle={setRecordTitle} notes={recordNotes} setNotes={setRecordNotes} amount={recordAmount} setAmount={setRecordAmount} status={recordStatus} setStatus={setRecordStatus} crmSearch={crmSearch} setCrmSearch={setCrmSearch} clinicalDocuments={clinicalDocuments} whatsappMessages={whatsappMessages} whatsappTemplatesEffective={whatsappTemplatesEffective} saveWhatsappTemplate={saveWhatsappTemplate} deleteWhatsappTemplate={deleteWhatsappTemplate} saveWhatsappMessage={saveWhatsappMessage} uploadClinicalDocument={uploadClinicalDocument} voiceCalls={voiceCalls} voiceCallerName={voiceCallerName} setVoiceCallerName={setVoiceCallerName} voiceCallerPhone={voiceCallerPhone} setVoiceCallerPhone={setVoiceCallerPhone} voiceReason={voiceReason} setVoiceReason={setVoiceReason} voiceTranscript={voiceTranscript} setVoiceTranscript={setVoiceTranscript} voiceIntent={voiceIntent} setVoiceIntent={setVoiceIntent} voiceStatus={voiceStatus} setVoiceStatus={setVoiceStatus} voicePriority={voicePriority} setVoicePriority={setVoicePriority} createVoiceCall={createVoiceCall} updateVoiceCallStatus={updateVoiceCallStatus} deleteVoiceCall={deleteVoiceCall} convertVoiceCallToCustomer={convertVoiceCallToCustomer} voiceScheduleCallId={voiceScheduleCallId} setVoiceScheduleCallId={setVoiceScheduleCallId} voiceScheduleEmployee={voiceScheduleEmployee} setVoiceScheduleEmployee={setVoiceScheduleEmployee} voiceScheduleService={voiceScheduleService} setVoiceScheduleService={setVoiceScheduleService} voiceScheduleDate={voiceScheduleDate} setVoiceScheduleDate={setVoiceScheduleDate} createAppointmentFromVoiceCall={createAppointmentFromVoiceCall} selectedCrmCustomerId={selectedCrmCustomerId} setSelectedCrmCustomerId={setSelectedCrmCustomerId} incomingVoiceCall={incomingVoiceCall} updateCustomerCrm={updateCustomerCrm} createCrmAction={createCrmAction} createAppointmentForCustomer={createAppointmentForCustomer} crmReminders={crmReminders} saveCrmReminder={saveCrmReminder} completeCrmReminder={completeCrmReminder} deleteCrmReminder={deleteCrmReminder} createRecord={createModuleRecord} deleteRecord={deleteModuleRecord} />}
        </section>
      </div>
    </Shell>
  );
}

function AreaSection({ business, activeModules, inactiveModules, bookingUrl, openBillingPortal, setActiveTab }: { business: Business; activeModules: ModuleItem[]; inactiveModules: ModuleItem[]; bookingUrl: string; openBillingPortal: () => void; setActiveTab: (tab: ActiveTab) => void }) {
  return <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]"><GlassCard><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><p className="text-sm font-medium text-violet-300">Área personal</p><h2 className="mt-2 text-3xl font-semibold">Suscripción, módulos y personalización</h2><p className="mt-2 text-sm leading-6 text-white/55">Gestiona tu plan, abre Stripe, consulta módulos activos y contrata nuevas funcionalidades desde el plan Modular.</p></div><CreditCard className="text-violet-200" size={44} /></div><div className="mt-6 grid gap-4 md:grid-cols-3"><InfoBox label="Plan actual" value={business.plan || "basic"} /><InfoBox label="Estado" value={business.subscription_status || "trialing"} /><InfoBox label="Módulos" value={activeModules.length} /></div><div className="mt-6 flex flex-wrap gap-3"><button onClick={openBillingPortal} className="btn-primary"><CreditCard size={17} /> Gestionar suscripción</button><Link href="/precios#modular" className="btn-secondary">Contratar módulos nuevos</Link></div></GlassCard><GlassCard title="Reservas online"><p className="text-sm text-white/55">Comparte este enlace con tus clientes para que puedan reservar.</p><div className="mt-5 rounded-2xl bg-black/30 p-4"><code className="break-all text-sm text-white/75">{bookingUrl}</code></div><button onClick={() => { if (!bookingUrl) return; navigator.clipboard.writeText(bookingUrl); alert("Enlace copiado"); }} className="mt-4 rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950">Copiar enlace</button></GlassCard><GlassCard title="Módulos activos"><div className="grid gap-3 md:grid-cols-2">{activeModules.length ? activeModules.map((item) => <ModuleAccessCard key={item.key} module={item} active onOpen={() => setActiveTab(`module:${item.slug}`)} />) : <p className="text-sm text-white/50">No tienes módulos extra activos. Tu plan incluye el núcleo de reservas, servicios y clientes.</p>}</div></GlassCard><GlassCard title="Añadir módulos PRO"><div className="grid gap-3 md:grid-cols-2">{inactiveModules.map((item) => <ModuleAccessCard key={item.key} module={item} />)}</div></GlassCard></section>;
}

function ModuleSection(props: { module: ModuleItem; records: ModuleRecord[]; allRecords: ModuleRecord[]; customers: Customer[]; employees: Employee[]; appointments: Appointment[]; services: Service[]; revenue: number; expenses: number; manualIncome: number; title: string; setTitle: (v: string) => void; notes: string; setNotes: (v: string) => void; amount: string; setAmount: (v: string) => void; status: string; setStatus: (v: string) => void; crmSearch: string; setCrmSearch: (v: string) => void; clinicalDocuments: ClinicalDocument[]; whatsappMessages: WhatsappMessage[]; whatsappTemplatesEffective: WhatsappTemplate[]; saveWhatsappTemplate: (template: WhatsappTemplate) => void; deleteWhatsappTemplate: (template: WhatsappTemplate) => void; saveWhatsappMessage: (customerId: string | null, phone: string, templateKey: string | null, message: string) => void; uploadClinicalDocument: (customerId: string, file: File, title?: string, documentType?: string, notes?: string) => void; voiceCalls: VoiceCall[]; voiceCallerName: string; setVoiceCallerName: (v: string) => void; voiceCallerPhone: string; setVoiceCallerPhone: (v: string) => void; voiceReason: string; setVoiceReason: (v: string) => void; voiceTranscript: string; setVoiceTranscript: (v: string) => void; voiceIntent: string; setVoiceIntent: (v: string) => void; voiceStatus: string; setVoiceStatus: (v: string) => void; voicePriority: string; setVoicePriority: (v: string) => void; createVoiceCall: () => void; updateVoiceCallStatus: (id: string, status: string) => void; deleteVoiceCall: (id: string) => void; convertVoiceCallToCustomer: (call: VoiceCall) => void; voiceScheduleCallId: string; setVoiceScheduleCallId: (v: string) => void; voiceScheduleEmployee: string; setVoiceScheduleEmployee: (v: string) => void; voiceScheduleService: string; setVoiceScheduleService: (v: string) => void; voiceScheduleDate: string; setVoiceScheduleDate: (v: string) => void; createAppointmentFromVoiceCall: (call: VoiceCall) => void; selectedCrmCustomerId: string; setSelectedCrmCustomerId: (v: string) => void; incomingVoiceCall: VoiceCall | null; updateCustomerCrm: (customerId: string, updates: Partial<Customer>) => void; createCrmAction: (customerId: string, title: string, notes: string, status?: string, dueDate?: string) => void; createAppointmentForCustomer: (customerId: string, employeeId: string, serviceId: string, dateValue: string) => void; crmReminders: CrmReminder[]; saveCrmReminder: (customerId: string, title: string, remindAt: string, notes?: string) => void; completeCrmReminder: (id: string) => void; deleteCrmReminder: (id: string) => void; createRecord: (moduleKey: string, defaultStatus?: string) => void; deleteRecord: (id: string) => void }) {
  const { module, records, customers, employees, appointments, services, revenue, expenses, manualIncome } = props;
  if (module.key === "billing") return <BillingModule {...props} />;
  if (module.key === "pos") return <PosModule {...props} />;
  if (module.key === "crm") return <CrmModule {...props} />;
  if (module.key === "marketing") return <MarketingModule {...props} />;
  if (module.key === "ai") return <AiModule {...props} />;
  if (module.key === "whatsapp") return <WhatsappModule {...props} />;
  if (module.key === "voice") return <VoiceModule {...props} />;
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

function CrmModule({
  records,
  customers,
  employees,
  appointments,
  services,
  crmSearch,
  setCrmSearch,
  selectedCrmCustomerId,
  setSelectedCrmCustomerId,
  incomingVoiceCall,
  updateCustomerCrm,
  createCrmAction,
  createAppointmentForCustomer,
  clinicalDocuments,
  uploadClinicalDocument,
  whatsappMessages,
  whatsappTemplatesEffective,
  saveWhatsappMessage,
  crmReminders,
  saveCrmReminder,
  completeCrmReminder,
  deleteCrmReminder,
}: Parameters<typeof ModuleSection>[0]) {
  const [crmActionTitle, setCrmActionTitle] = useState("");
  const [crmActionNotes, setCrmActionNotes] = useState("");
  const [crmActionDueDate, setCrmActionDueDate] = useState("");
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderNotes, setReminderNotes] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [crmAppointmentEmployee, setCrmAppointmentEmployee] = useState("");
  const [crmAppointmentService, setCrmAppointmentService] = useState("");
  const [crmAppointmentDate, setCrmAppointmentDate] = useState("");
  const [crmStatusFilter, setCrmStatusFilter] = useState("all");
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentType, setDocumentType] = useState("clinico");
  const [documentNotes, setDocumentNotes] = useState("");
  const [detailName, setDetailName] = useState("");
  const [detailPhone, setDetailPhone] = useState("");
  const [detailEmail, setDetailEmail] = useState("");
  const [detailDocumentType, setDetailDocumentType] = useState("");
  const [detailDocumentNumber, setDetailDocumentNumber] = useState("");
  const [detailEps, setDetailEps] = useState("");
  const [detailNotes, setDetailNotes] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [detailResponsible, setDetailResponsible] = useState("");
  const [detailCrmStatus, setDetailCrmStatus] = useState("nuevo");
  const [detailNextFollowUp, setDetailNextFollowUp] = useState("");

  const filtered = customers.filter((c) => {
    const searchable = `${customerName(c)} ${c.phone || ""} ${c.email || ""} ${c.document_number || ""} ${c.document_type || ""} ${c.eps || ""} ${c.crm_status || ""} ${c.notes || ""}`.toLowerCase();
    const search = crmSearch.toLowerCase().trim();
    const matchesSearch = !search || searchable.includes(search);
    const matchesStatus = crmStatusFilter === "all" || (c.crm_status || "nuevo") === crmStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCrmCustomerId) ||
    filtered[0] ||
    null;

  useEffect(() => {
    if (!selectedCustomer) return;
    setDetailName(customerName(selectedCustomer));
    setDetailPhone(selectedCustomer.phone || "");
    setDetailEmail(selectedCustomer.email || "");
    setDetailDocumentType(selectedCustomer.document_type || "");
    setDetailDocumentNumber(selectedCustomer.document_number || "");
    setDetailEps(selectedCustomer.eps || "");
    setDetailNotes(selectedCustomer.notes || "");
    setDetailAddress(selectedCustomer.address || "");
    setDetailResponsible(selectedCustomer.responsible_name || "");
    setDetailCrmStatus(selectedCustomer.crm_status || "nuevo");
    setDetailNextFollowUp(selectedCustomer.next_follow_up_at ? selectedCustomer.next_follow_up_at.slice(0,16) : "");
  }, [selectedCustomer?.id]);

  const customerAppointments = selectedCustomer
    ? appointments.filter((appointment) => {
        const related = firstRelation(appointment.customers);
        return (
          appointment.customer_id === selectedCustomer.id ||
          customerName(related).toLowerCase() === customerName(selectedCustomer).toLowerCase()
        );
      })
    : [];

  const customerRecords = selectedCustomer
    ? records.filter((record) => record.customer_id === selectedCustomer.id || (record.notes || "").includes(selectedCustomer.id))
    : [];

  const customerDocs = selectedCustomer
    ? clinicalDocuments.filter((document) => document.customer_id === selectedCustomer.id)
    : [];

  const customerReminders = selectedCustomer
    ? crmReminders.filter((reminder) => reminder.customer_id === selectedCustomer.id).sort((a, b) => new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime())
    : [];

  const activeCustomers = customers.filter((customer) => (customer.crm_status || "nuevo") !== "cerrado").length;
  const pendingFollowups = records.filter((record) => ["followup", "pendiente", "opportunity"].includes(record.status || "")).length;
  const scheduled = appointments.filter((appointment) => appointment.status !== "cancelled").length;

  const saveAction = async () => {
    if (!selectedCustomer) return alert("Selecciona un paciente");
    await createCrmAction(
      selectedCustomer.id,
      crmActionTitle || `Seguimiento · ${customerName(selectedCustomer)}`,
      [
        crmActionNotes,
        `Paciente: ${customerName(selectedCustomer)}`,
        `Teléfono: ${selectedCustomer.phone || "Sin teléfono"}`,
        selectedCustomer.eps ? `EPS: ${selectedCustomer.eps}` : "",
        selectedCustomer.document_number ? `Documento: ${selectedCustomer.document_number}` : "",
      ].filter(Boolean).join("\n"),
      "followup",
      crmActionDueDate || undefined
    );
    setCrmActionTitle("");
    setCrmActionNotes("");
    setCrmActionDueDate("");
  };

  const saveCustomerDetails = async () => {
    if (!selectedCustomer) return;
    await updateCustomerCrm(selectedCustomer.id, {
      name: detailName,
      full_name: detailName,
      phone: detailPhone,
      email: detailEmail,
      eps: detailEps,
      document_type: detailDocumentType,
      document_number: detailDocumentNumber,
      notes: detailNotes,
      address: detailAddress,
      responsible_name: detailResponsible,
      crm_status: detailCrmStatus,
      next_follow_up_at: detailNextFollowUp || null,
    } as any);
  };

  const scheduleFromCrm = async () => {
    if (!selectedCustomer) return alert("Selecciona un paciente");
    await createAppointmentForCustomer(
      selectedCustomer.id,
      crmAppointmentEmployee,
      crmAppointmentService,
      crmAppointmentDate
    );
    setCrmAppointmentEmployee("");
    setCrmAppointmentService("");
    setCrmAppointmentDate("");
  };

  const saveReminder = async () => {
    if (!selectedCustomer) return alert("Selecciona un paciente");
    await saveCrmReminder(
      selectedCustomer.id,
      reminderTitle || `Recordatorio · ${customerName(selectedCustomer)}`,
      reminderAt,
      reminderNotes
    );
    setReminderTitle("");
    setReminderNotes("");
    setReminderAt("");
  };

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={<Users />} label="Pacientes CRM" value={customers.length} helper="Base total" />
        <Metric icon={<UserCog />} label="Activos" value={activeCustomers} helper="En gestión" />
        <Metric icon={<CheckCircle2 />} label="Seguimientos" value={pendingFollowups} helper="Acciones abiertas" />
        <Metric icon={<CalendarDays />} label="Citas" value={scheduled} helper="Agenda conectada" />
      </div>

      {incomingVoiceCall && (
        <div className="rounded-[2rem] border border-green-300/25 bg-green-500/15 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-200">Llamada activa detectada</p>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <InfoBox label="Teléfono" value={incomingVoiceCall.caller_phone} />
            <InfoBox label="EPS" value={translateIntent(incomingVoiceCall.eps || incomingVoiceCall.intent || "informacion")} />
            <InfoBox label="Documento" value={translateDocumentType(incomingVoiceCall.document_type || "") || "No indicado"} />
            <InfoBox label="ID" value={incomingVoiceCall.document_number || "No indicado"} />
          </div>
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[.65fr_1.35fr]">
        <GlassCard title="Pacientes / Leads">
          <div className="grid gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-white/35" size={18} />
              <input
                value={crmSearch}
                onChange={(e) => setCrmSearch(e.target.value)}
                placeholder="Buscar por nombre, teléfono, identificación, EPS, notas o estado"
                className="input-dark pl-11"
              />
            </div>
            <select value={crmStatusFilter} onChange={(e) => setCrmStatusFilter(e.target.value)} className="input-dark">
              <option value="all">Todos los estados</option>
              {crmStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>

          <div className="mt-4 max-h-[760px] space-y-3 overflow-y-auto pr-1">
            {filtered.slice(0, 80).map((customer) => (
              <button
                key={customer.id}
                onClick={() => setSelectedCrmCustomerId(customer.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedCustomer?.id === customer.id
                    ? "border-violet-300/40 bg-violet-500/20"
                    : "border-white/10 bg-white/[0.05] hover:bg-white/[0.08]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{customerName(customer)}</p>
                    <p className="mt-1 text-sm text-white/45">{customer.phone || customer.email || "Sin contacto"}</p>
                    <p className="mt-2 text-xs text-violet-200">
                      {translateCrmStatus(customer.crm_status || "nuevo")} · {translateIntent(customer.eps || "informacion")}
                    </p>
                  </div>
                  {customer.document_number && (
                    <span className="rounded-full bg-black/25 px-3 py-1 text-xs text-white/60">
                      ID {customer.document_number}
                    </span>
                  )}
                </div>
              </button>
            ))}
            {!filtered.length && <Empty text="No hay pacientes que coincidan con la búsqueda." />}
          </div>
        </GlassCard>

        <GlassCard title={selectedCustomer ? `Ficha CRM · ${customerName(selectedCustomer)}` : "Ficha CRM"}>
          {!selectedCustomer ? (
            <Empty text="Selecciona un paciente para abrir su ficha CRM." />
          ) : (
            <div className="grid gap-5">
              <div className="grid gap-3 md:grid-cols-4">
                <InfoBox label="Teléfono" value={selectedCustomer.phone || "Sin teléfono"} />
                <InfoBox label="Estado CRM" value={translateCrmStatus(selectedCustomer.crm_status || "nuevo")} />
                <InfoBox label="EPS" value={translateIntent(selectedCustomer.eps || "informacion")} />
                <InfoBox label="Documento" value={selectedCustomer.document_number || "No indicado"} />
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="mb-3 font-semibold">Datos del paciente</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <input value={detailName} onChange={(e) => setDetailName(e.target.value)} placeholder="Nombre completo" className="input-dark" />
                  <input value={detailPhone} onChange={(e) => setDetailPhone(e.target.value)} placeholder="Teléfono" className="input-dark" />
                  <input value={detailEmail} onChange={(e) => setDetailEmail(e.target.value)} placeholder="Email" className="input-dark" />
                  <select value={detailEps} onChange={(e) => setDetailEps(e.target.value)} className="input-dark">
                    <option value="">EPS / tipo paciente</option>
                    <option value="particular">Particular</option>
                    <option value="nueva_eps">Nueva EPS</option>
                    <option value="salud_total">Salud Total</option>
                    <option value="otra_eps">Otra EPS</option>
                  </select>
                  <select value={detailDocumentType} onChange={(e) => setDetailDocumentType(e.target.value)} className="input-dark">
                    <option value="">Tipo documento</option>
                    <option value="tarjeta_identidad">Tarjeta de identidad</option>
                    <option value="cedula_ciudadania">Cédula de ciudadanía</option>
                    <option value="registro_civil">Registro civil</option>
                    <option value="pasaporte">Pasaporte</option>
                  </select>
                  <input value={detailDocumentNumber} onChange={(e) => setDetailDocumentNumber(e.target.value)} placeholder="Número de identificación" className="input-dark" />
                  <input value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} placeholder="Dirección" className="input-dark" />
                  <input value={detailResponsible} onChange={(e) => setDetailResponsible(e.target.value)} placeholder="Responsable / acudiente" className="input-dark" />
                  <select value={detailCrmStatus} onChange={(e) => setDetailCrmStatus(e.target.value)} className="input-dark">
                    {crmStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                  <input type="datetime-local" value={detailNextFollowUp} onChange={(e) => setDetailNextFollowUp(e.target.value)} className="input-dark" title="Próxima llamada" />
                </div>
                <textarea value={detailNotes} onChange={(e) => setDetailNotes(e.target.value)} placeholder="Notas clínicas, familiares, autorizaciones, observaciones y próximos pasos" className="input-dark mt-3 min-h-28" />
                <button onClick={saveCustomerDetails} className="btn-primary mt-3"><CheckCircle2 size={17} /> Guardar ficha</button>
              </div>

              <div className="rounded-2xl border border-green-300/20 bg-green-500/10 p-4">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <h3 className="font-semibold">WhatsApp del paciente</h3>
                    <p className="mt-1 text-sm text-white/50">Abre WhatsApp con mensajes rápidos usando los datos de esta ficha.</p>
                  </div>
                  <button
                    onClick={() => { const msg = whatsappMessageForCustomer(whatsappTemplatesEffective[0]?.message || "Hola {nombre}", selectedCustomer); saveWhatsappMessage(selectedCustomer.id, selectedCustomer.phone || "", whatsappTemplatesEffective[0]?.key || "manual", msg); openWhatsappForCustomer(selectedCustomer, whatsappTemplatesEffective[0]?.message || "Hola {nombre}"); }}
                    className="btn-primary"
                  >
                    <MessageCircle size={17} /> WhatsApp
                  </button>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-3">
                  {whatsappTemplatesEffective.slice(0, 5).map((template) => (
                    <button
                      key={template.key}
                      onClick={() => openWhatsappForCustomer(selectedCustomer, template.message)}
                      className="rounded-full border border-white/15 px-4 py-2 text-left text-xs text-white/75 hover:bg-white/10"
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <select
                  value={selectedCustomer.crm_status || "nuevo"}
                  onChange={(e) => updateCustomerCrm(selectedCustomer.id, { crm_status: e.target.value })}
                  className="input-dark"
                >
                  <option value="nuevo">Nuevo lead</option>
                  <option value="en_llamada">En llamada</option>
                  <option value="seguimiento">En seguimiento</option>
                  <option value="cita_pendiente">Cita pendiente</option>
                  <option value="cita_agendada">Cita agendada</option>
                  <option value="pendiente_documentacion">Pendiente documentación</option>
                  <option value="en_tratamiento">En tratamiento</option>
                  <option value="cerrado">Cerrado</option>
                </select>

                <input
                  type="datetime-local"
                  value={selectedCustomer.next_follow_up_at ? selectedCustomer.next_follow_up_at.slice(0, 16) : ""}
                  onChange={(e) => updateCustomerCrm(selectedCustomer.id, { next_follow_up_at: e.target.value || null })}
                  className="input-dark"
                />

                <button onClick={() => updateCustomerCrm(selectedCustomer.id, { crm_status: "cita_pendiente" })} className="btn-secondary">
                  Dejar pendiente
                </button>
              </div>

              <section className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-violet-300/20 bg-violet-500/10 p-4">
                  <h3 className="font-semibold">Agendar desde CRM</h3>
                  <p className="mt-1 text-sm text-white/45">Crea una cita sin salir de la ficha del paciente.</p>
                  <div className="mt-4 grid gap-3">
                    <Select value={crmAppointmentEmployee} onChange={setCrmAppointmentEmployee} placeholder="Profesional" options={employees.map((e: Employee) => ({ value: e.id, label: e.name }))} />
                    <Select value={crmAppointmentService} onChange={setCrmAppointmentService} placeholder="Servicio / terapia" options={services.map((s: Service) => ({ value: s.id, label: `${s.name} · ${s.price}€` }))} />
                    <input type="datetime-local" value={crmAppointmentDate} onChange={(e) => setCrmAppointmentDate(e.target.value)} className="input-dark" />
                    <button onClick={scheduleFromCrm} className="btn-primary"><CalendarDays size={17} /> Agendar cita</button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="font-semibold">Proceso pendiente / tarea</h3>
                  <div className="mt-4 grid gap-3">
                    <input value={crmActionTitle} onChange={(e) => setCrmActionTitle(e.target.value)} placeholder="Título: validar autorización, llamar acudiente..." className="input-dark" />
                    <input type="datetime-local" value={crmActionDueDate} onChange={(e) => setCrmActionDueDate(e.target.value)} className="input-dark" />
                    <textarea value={crmActionNotes} onChange={(e) => setCrmActionNotes(e.target.value)} placeholder="Detalle del seguimiento o resultado de la llamada" className="input-dark min-h-24" />
                    <button onClick={saveAction} className="btn-primary"><Plus size={17} /> Guardar proceso</button>
                  </div>
                </div>
              </section>

              <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4">
                <h3 className="font-semibold">Recordatorio con alarma</h3>
                <p className="mt-1 text-sm text-white/45">Configura una alerta para este paciente. Cuando llegue la fecha y hora aparecerá una notificación en el centro del panel.</p>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px]">
                  <input value={reminderTitle} onChange={(e) => setReminderTitle(e.target.value)} placeholder="Título del recordatorio" className="input-dark" />
                  <input type="datetime-local" value={reminderAt} onChange={(e) => setReminderAt(e.target.value)} className="input-dark" />
                </div>
                <textarea value={reminderNotes} onChange={(e) => setReminderNotes(e.target.value)} placeholder="Notas internas del recordatorio" className="input-dark mt-3 min-h-20" />
                <button onClick={saveReminder} className="btn-primary mt-3"><Clock size={17} /> Guardar recordatorio</button>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {customerReminders.slice(0, 6).map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} completeReminder={completeCrmReminder} deleteReminder={deleteCrmReminder} compact />
                  ))}
                  {!customerReminders.length && <Empty text="Sin recordatorios para este paciente." />}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="font-semibold">Documentos clínicos</h3>
                <p className="mt-1 text-sm text-white/45">Sube consentimientos, remisiones, autorizaciones, informes, PDFs o imágenes.</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <input value={documentTitle} onChange={(e) => setDocumentTitle(e.target.value)} placeholder="Título del documento" className="input-dark" />
                  <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="input-dark">
                    <option value="clinico">Documento clínico</option>
                    <option value="consentimiento">Consentimiento</option>
                    <option value="autorizacion">Autorización EPS</option>
                    <option value="remision">Remisión</option>
                    <option value="informe">Informe</option>
                    <option value="imagen">Imagen</option>
                  </select>
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950">
                    Subir archivo
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && selectedCustomer) {
                          uploadClinicalDocument(selectedCustomer.id, file, documentTitle || file.name, documentType, documentNotes);
                          setDocumentTitle("");
                          setDocumentNotes("");
                        }
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
                <textarea value={documentNotes} onChange={(e) => setDocumentNotes(e.target.value)} placeholder="Notas del documento" className="input-dark mt-3 min-h-20" />
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {customerDocs.map((document) => (
                    <a key={document.id} href={document.file_url || "#"} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 hover:bg-white/[0.09]">
                      <p className="font-semibold">{document.title}</p>
                      <p className="mt-1 text-xs text-white/45">{document.document_type || "Documento"} · {new Date(document.created_at).toLocaleString("es-ES")}</p>
                      {document.notes && <p className="mt-2 text-xs leading-5 text-white/50">{document.notes}</p>}
                    </a>
                  ))}
                  {!customerDocs.length && <Empty text="Sin documentos clínicos cargados." />}
                </div>
              </div>

              <section className="grid gap-4 xl:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="font-semibold">Historial de agenda</h3>
                  <div className="mt-3 space-y-3">
                    {customerAppointments.slice(0, 10).map((appointment) => {
                      const service = firstRelation(appointment.services);
                      const employee = firstRelation(appointment.employees);
                      return (
                        <div key={appointment.id} className="rounded-xl bg-white/[0.06] p-3">
                          <p className="text-sm font-medium">{new Date(appointmentDate(appointment)).toLocaleString("es-ES")}</p>
                          <p className="mt-1 text-xs text-white/45">{service?.name || "Servicio"} · {employee?.name || "Sin profesional"} · {translateStatus(appointment.status)}</p>
                        </div>
                      );
                    })}
                    {!customerAppointments.length && <Empty text="Sin citas registradas todavía." />}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="font-semibold">Procesos y seguimientos</h3>
                  <div className="mt-3 space-y-3">
                    {customerRecords.slice(0, 10).map((record) => (
                      <div key={record.id} className="rounded-xl bg-white/[0.06] p-3">
                        <p className="text-sm font-medium">{record.title}</p>
                        {record.notes && <p className="mt-1 text-xs leading-5 text-white/45">{record.notes}</p>}
                        <p className="mt-2 text-xs text-violet-200">{record.status} · {new Date(record.created_at).toLocaleString("es-ES")}</p>
                      </div>
                    ))}
                    {!customerRecords.length && <Empty text="Sin acciones CRM registradas." />}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="font-semibold">Resumen operativo</h3>
                  <div className="mt-3 grid gap-3">
                    <InfoBox label="Citas" value={customerAppointments.length} />
                    <InfoBox label="Documentos" value={customerDocs.length} />
                    <InfoBox label="Procesos" value={customerRecords.length} />
                  </div>
                </div>
              </section>
            </div>
          )}
        </GlassCard>
      </section>
    </section>
  );
}


const crmStatusOptions = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "pendiente_documentacion", label: "Pendiente documentación" },
  { value: "pendiente_cita", label: "Pendiente cita" },
  { value: "en_tratamiento", label: "En tratamiento" },
  { value: "alta", label: "Alta" },
  { value: "perdido", label: "Perdido" },
  { value: "en_llamada", label: "En llamada" },
];
function translateCrmStatus(status: string) {
  return crmStatusOptions.find((option) => option.value === status)?.label || status;
}

function RemindersSection({ reminders, customers, completeReminder, deleteReminder }: { reminders: CrmReminder[]; customers: Customer[]; completeReminder: (id: string) => void; deleteReminder: (id: string) => void }) {
  const dueNow = reminders.filter((reminder) => new Date(reminder.remind_at).getTime() <= Date.now()).length;
  return (
    <section className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={<Clock />} label="Próximos 7 días" value={reminders.length} helper="Recordatorios activos" />
        <Metric icon={<XCircle />} label="Vencidos" value={dueNow} helper="Requieren atención" />
        <Metric icon={<Users />} label="Pacientes" value={new Set(reminders.map((item) => item.customer_id)).size} helper="Con alarma" />
      </div>
      <GlassCard title="Recordatorios de los próximos 7 días">
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} customers={customers} completeReminder={completeReminder} deleteReminder={deleteReminder} />
          ))}
          {!reminders.length && <Empty text="No hay recordatorios activos para los próximos 7 días." />}
        </div>
      </GlassCard>
    </section>
  );
}

function ReminderCard({ reminder, customers, completeReminder, deleteReminder, compact = false }: { reminder: CrmReminder; customers?: Customer[]; completeReminder: (id: string) => void; deleteReminder: (id: string) => void; compact?: boolean }) {
  const isDue = new Date(reminder.remind_at).getTime() <= Date.now();
  return (
    <div className={`rounded-2xl border ${isDue ? "border-amber-300/35 bg-amber-500/15" : "border-white/10 bg-white/[0.06]"} p-4`}>
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div className="min-w-0">
          <p className="break-words font-semibold">{reminder.title}</p>
          <p className="mt-1 text-sm text-white/55">{reminderCustomerName(reminder, customers)} · {new Date(reminder.remind_at).toLocaleString("es-ES")}</p>
          {reminder.notes && <p className="mt-2 break-words text-sm leading-6 text-white/50">{reminder.notes}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button onClick={() => completeReminder(reminder.id)} className="rounded-full bg-white px-3 py-2 text-xs font-medium text-neutral-950">Completar</button>
          {!compact && <button onClick={() => deleteReminder(reminder.id)} className="rounded-full border border-red-300/25 px-3 py-2 text-xs text-red-100">Eliminar</button>}
        </div>
      </div>
    </div>
  );
}

function ReminderAlarm({ reminder, completeReminder, dismiss }: { reminder: CrmReminder; completeReminder: (id: string) => void; dismiss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-amber-300/30 bg-[#11111c] p-7 text-center shadow-2xl shadow-amber-950/40">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-100">
          <Clock size={30} />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">Recordatorio CRM</p>
        <h2 className="mt-3 break-words text-3xl font-semibold">{reminder.title}</h2>
        <p className="mt-2 text-white/60">{reminderCustomerName(reminder)} · {new Date(reminder.remind_at).toLocaleString("es-ES")}</p>
        {reminder.notes && <p className="mt-4 break-words rounded-2xl bg-white/[0.06] p-4 text-sm leading-6 text-white/65">{reminder.notes}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={() => completeReminder(reminder.id)} className="btn-primary">Marcar como hecho</button>
          <button onClick={dismiss} className="btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function MarketingModule({ records, title, setTitle, notes, setNotes, amount, setAmount, status, setStatus, createRecord, deleteRecord }: Parameters<typeof ModuleSection>[0]) {
  const budget = records.reduce((s, r) => s + Number(r.amount || 0), 0);
  return <section className="grid gap-6"><div className="grid gap-4 md:grid-cols-4"><Metric icon={<Megaphone />} label="Campañas" value={records.length} helper="Planificadas" /><Metric icon={<CreditCard />} label="Presupuesto" value={`${budget.toFixed(2)}€`} helper="Total" /><Metric icon={<TrendingUp />} label="Canales" value="Meta · Google" helper="Preparados" /><Metric icon={<CheckCircle2 />} label="Estado" value="Ready" helper="Integraciones" /></div><section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]"><GlassCard title="Nueva campaña"><div className="grid gap-3"><select value={status} onChange={(e) => setStatus(e.target.value)} className="input-dark"><option value="meta">Facebook / Instagram Ads</option><option value="google">Google Ads</option><option value="tiktok">TikTok Ads</option><option value="email">Email Marketing</option><option value="whatsapp">WhatsApp Campaign</option></select><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Campaña: Promo verano / Reactivación" className="input-dark" /><input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Presupuesto estimado" type="number" className="input-dark" /><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Público, oferta, canal, objetivo, fechas y creatividad" className="input-dark min-h-32" /><button onClick={() => createRecord("marketing", status)} className="btn-primary"><Plus size={17} /> Guardar campaña</button></div></GlassCard><GlassCard title="Conectores publicitarios"><div className="grid gap-3 md:grid-cols-2">{["Meta Ads", "Google Ads", "TikTok Ads", "Email", "WhatsApp", "Landing"].map((x) => <div key={x} className="rounded-2xl bg-black/25 p-4"><p className="font-semibold">{x}</p><p className="mt-1 text-sm text-white/45">Preparado para conexión API</p></div>)}</div><div className="mt-5"><RecordsList records={records} deleteRecord={deleteRecord} /></div></GlassCard></section></section>;
}

function AiModule({ records, customers, appointments, revenue, title, setTitle, notes, setNotes, createRecord, deleteRecord }: Parameters<typeof ModuleSection>[0]) {
  return <section className="grid gap-6"><div className="rounded-[2rem] border border-violet-300/20 bg-violet-500/15 p-7"><p className="text-sm font-medium text-violet-200">IA Assistant activo</p><h2 className="mt-2 text-3xl font-semibold">Tu panel ahora funciona como centro de inteligencia</h2><p className="mt-2 text-white/60">Este módulo prepara prompts, análisis e insights. Cuando conectemos el proveedor IA, estas instrucciones se convertirán en respuestas automáticas reales.</p></div><div className="grid gap-4 md:grid-cols-4"><Metric icon={<Bot />} label="Prompts" value={records.length} helper="Guardados" /><Metric icon={<Users />} label="Clientes" value={customers.length} helper="Analizables" /><Metric icon={<CalendarDays />} label="Reservas" value={appointments.length} helper="Dataset" /><Metric icon={<TrendingUp />} label="Ingresos" value={`${revenue.toFixed(2)}€`} helper="Contexto" /></div><section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]"><GlassCard title="Nueva instrucción IA"><div className="grid gap-3"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Resumen semanal del negocio" className="input-dark" /><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Pide a Flowly IA que analice clientes inactivos, servicios más rentables, huecos libres o campañas recomendadas" className="input-dark min-h-32" /><button onClick={() => createRecord("ai", "prompt")} className="btn-primary"><Bot size={17} /> Guardar instrucción IA</button></div></GlassCard><GlassCard title="Insights sugeridos"><div className="grid gap-3">{["Clientes sin reservar en 60 días", "Servicios con más margen", "Horas con menor ocupación", "Campaña recomendada esta semana"].map((x) => <div key={x} className="rounded-2xl bg-black/25 p-4"><p className="font-semibold">{x}</p><p className="mt-1 text-sm text-white/45">Listo para automatizar con IA</p></div>)}</div><div className="mt-5"><RecordsList records={records} deleteRecord={deleteRecord} /></div></GlassCard></section></section>;
}


const whatsappTemplates = [
  {
    key: "llamada_perdida",
    label: "Llamada perdida",
    message: "Hola {nombre}, somos Neuronas IPS. Intentamos comunicarnos contigo al teléfono {telefono}. Por favor respóndenos este mensaje para continuar con tu proceso de atención.",
  },
  {
    key: "confirmar_cita",
    label: "Confirmar cita",
    message: "Hola {nombre}, somos Neuronas IPS. Te escribimos para confirmar tu cita. Por favor respóndenos confirmando tu disponibilidad.",
  },
  {
    key: "documentacion",
    label: "Solicitar documentación",
    message: "Hola {nombre}, somos Neuronas IPS. Para continuar con tu proceso necesitamos que nos envíes la documentación pendiente. Muchas gracias.",
  },
  {
    key: "seguimiento_eps",
    label: "Seguimiento EPS",
    message: "Hola {nombre}, somos Neuronas IPS. Te contactamos para hacer seguimiento a tu proceso con {eps}. Quedamos atentos a tu respuesta.",
  },
  {
    key: "recordatorio",
    label: "Recordatorio",
    message: "Hola {nombre}, te recordamos que tienes un proceso pendiente con Neuronas IPS. Por favor comunícate con nosotros para continuar.",
  },
];

function mergeWhatsappTemplates(defaults: WhatsappTemplate[], custom: WhatsappTemplate[]) {
  const activeCustom = custom.filter((template) => template.is_active !== false);
  const map = new Map<string, WhatsappTemplate>();
  defaults.forEach((template) => map.set(template.key, template));
  activeCustom.forEach((template) => map.set(template.key, { ...map.get(template.key), ...template }));
  return Array.from(map.values());
}

function getUpcomingReminders(reminders: CrmReminder[], days = 7) {
  const now = Date.now();
  const limit = now + days * 24 * 60 * 60 * 1000;
  return reminders
    .filter((reminder) => {
      const time = new Date(reminder.remind_at).getTime();
      return (reminder.status || "pending") === "pending" && time >= now - 60 * 60 * 1000 && time <= limit;
    })
    .sort((a, b) => new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime());
}

function reminderCustomerName(reminder: CrmReminder, customers?: Customer[]) {
  const related = firstRelation(reminder.customers);
  const fallback = customers?.find((customer) => customer.id === reminder.customer_id);
  return customerName(related || fallback || null);
}

function normalizeWhatsappPhone(phone?: string | null) {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("00")) return digits.slice(2);

  // Ya viene con prefijo internacional. WhatsApp necesita el número sin + ni espacios.
  if (digits.startsWith("34") && digits.length === 11) return digits; // España
  if (digits.startsWith("57") && digits.length === 12) return digits; // Colombia
  if (digits.startsWith("58") && digits.length >= 12) return digits; // Venezuela
  if (digits.startsWith("593") && digits.length >= 12) return digits; // Ecuador
  if ((digits.startsWith("1787") || digits.startsWith("1939")) && digits.length === 11) return digits; // Puerto Rico

  // Inferencia segura para números locales frecuentes en los países soportados.
  if (digits.length === 9 && /^[6789]/.test(digits)) return `34${digits}`;
  if (digits.length === 10 && digits.startsWith("3")) return `57${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) {
    const withoutZero = digits.slice(1);
    if (withoutZero.startsWith("4")) return `58${withoutZero}`;
    if (withoutZero.startsWith("9")) return `593${withoutZero}`;
  }
  if (digits.length === 10 && (digits.startsWith("787") || digits.startsWith("939"))) return `1${digits}`;

  return digits;
}

function whatsappMessageForCustomer(template: string, customer: Customer) {
  return template
    .replaceAll("{nombre}", customerName(customer))
    .replaceAll("{telefono}", customer.phone || "")
    .replaceAll("{eps}", translateIntent(customer.eps || ""))
    .replaceAll("{documento}", customer.document_number || "");
}

function whatsappUrl(phone?: string | null, message = "", mode: "web" | "app" = "web") {
  const normalized = normalizeWhatsappPhone(phone);
  if (!normalized) return "";
  const text = encodeURIComponent(message);

  // Abrimos directamente el destino final para evitar la pantalla intermedia de wa.me,
  // que en algunos navegadores bloquea el contacto o pierde el texto prellenado.
  if (mode === "app") return `whatsapp://send?phone=${normalized}&text=${text}`;
  return `https://web.whatsapp.com/send?phone=${normalized}&text=${text}`;
}

function openWhatsapp(phone?: string | null, message = "") {
  const url = whatsappUrl(phone, message, "web");
  if (!url) return false;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

function openWhatsappForCustomer(customer: Customer, template: string) {
  const message = whatsappMessageForCustomer(template, customer);
  if (!openWhatsapp(customer.phone, message)) return alert("Este paciente no tiene teléfono para WhatsApp");
}

function WhatsappModule({
  records,
  customers,
  title,
  setTitle,
  notes,
  setNotes,
  status,
  setStatus,
  createRecord,
  deleteRecord,
  whatsappMessages,
  whatsappTemplatesEffective,
  saveWhatsappTemplate,
  deleteWhatsappTemplate,
  saveWhatsappMessage,
}: Parameters<typeof ModuleSection>[0]) {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState("llamada_perdida");
  const [manualPhone, setManualPhone] = useState("");
  const [manualMessage, setManualMessage] = useState("Hola, somos Neuronas IPS. Te contactamos sobre tu proceso de atención. Quedamos atentos a tu respuesta.");
  const [manualTemplateKey, setManualTemplateKey] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [editingTemplateKey, setEditingTemplateKey] = useState<string | null>(null);
  const [editingTemplateLabel, setEditingTemplateLabel] = useState("");
  const [editingTemplateMessage, setEditingTemplateMessage] = useState("");
  const [localTemplates, setLocalTemplates] = useState<WhatsappTemplate[]>([]);

  useEffect(() => {
    setLocalTemplates(whatsappTemplatesEffective);
  }, [whatsappTemplatesEffective]);

  const quickTemplates = localTemplates.length ? localTemplates : whatsappTemplatesEffective;
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) || null;
  const selectedTemplate = quickTemplates.find((template) => template.key === selectedTemplateKey) || quickTemplates[0] || whatsappTemplates[0];
  const selectedManualTemplate = quickTemplates.find((template) => template.key === manualTemplateKey) || null;

  const filteredCustomers = customers.filter((customer) => {
    const searchable = `${customerName(customer)} ${customer.phone || ""} ${customer.email || ""} ${customer.document_number || ""} ${customer.eps || ""}`.toLowerCase();
    return searchable.includes(customerSearch.toLowerCase().trim());
  });

  const sendSelectedTemplate = () => {
    if (!selectedCustomer) return alert("Selecciona un paciente");
    const message = whatsappMessageForCustomer(selectedTemplate.message, selectedCustomer);
    saveWhatsappMessage(selectedCustomer.id, selectedCustomer.phone || "", selectedTemplate.key, message);
    openWhatsappForCustomer(selectedCustomer, selectedTemplate.message);
  };

  const sendManualMessage = () => {
    if (!openWhatsapp(manualPhone, manualMessage)) return alert("Añade un teléfono válido");
    saveWhatsappMessage(null, manualPhone, "manual", manualMessage);
  };

  const applyTemplateToManual = (template: WhatsappTemplate) => {
    setManualTemplateKey(template.key);
    setManualMessage(template.message);
  };

  const applyTemplateToCrm = (template: WhatsappTemplate) => {
    setSelectedTemplateKey(template.key);
  };

  const saveTemplate = async () => {
    if (!title.trim() || !notes.trim()) return alert("Añade nombre y mensaje de la plantilla");
    const newTemplate = { key: `custom_${Date.now()}`, label: title.trim(), message: notes.trim(), category: status || "template", is_active: true };
    setLocalTemplates((current) => mergeWhatsappTemplates(current, [newTemplate]));
    setSelectedTemplateKey(newTemplate.key);
    applyTemplateToManual(newTemplate);
    await saveWhatsappTemplate(newTemplate);
    setTitle("");
    setNotes("");
  };

  const startEditTemplate = (template: WhatsappTemplate) => {
    setEditingTemplateKey(template.key);
    setEditingTemplateLabel(template.label);
    setEditingTemplateMessage(template.message);
  };

  const saveEditingTemplate = async () => {
    if (!editingTemplateKey) return;
    const updatedTemplate = { key: editingTemplateKey, label: editingTemplateLabel.trim(), message: editingTemplateMessage.trim(), category: "quick", is_active: true };
    setLocalTemplates((current) => mergeWhatsappTemplates(current, [updatedTemplate]));
    if (manualTemplateKey === editingTemplateKey) setManualMessage(updatedTemplate.message);
    await saveWhatsappTemplate(updatedTemplate);
    setEditingTemplateKey(null);
    setEditingTemplateLabel("");
    setEditingTemplateMessage("");
  };

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric icon={<MessageCircle />} label="Modo" value="Manual" helper="Sin coste API" />
        <Metric icon={<Users />} label="Pacientes" value={customers.length} helper="CRM conectado" />
        <Metric icon={<FileText />} label="Plantillas" value={quickTemplates.length} helper="Rápidas" />
        <Metric icon={<CheckCircle2 />} label="Coste" value="0€" helper="Abre WhatsApp" />
        <Metric icon={<Clock />} label="Historial" value={whatsappMessages.length} helper="Mensajes abiertos" />
      </div>

      <div className="rounded-[2rem] border border-green-300/25 bg-green-500/15 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-200">WhatsApp Manual activo</p>
        <p className="mt-2 text-sm leading-6 text-white/65">
          Este módulo no usa API de pago. Genera conversaciones con mensajes preparados usando WhatsApp Web o WhatsApp Desktop.
          Ideal para empezar sin costes fijos por número.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <GlassCard title="Enviar WhatsApp desde CRM">
          <div className="grid gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-white/35" size={18} />
              <input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Buscar paciente por nombre, teléfono, EPS o documento"
                className="input-dark pl-11"
              />
            </div>

            <Select
              value={selectedCustomerId}
              onChange={setSelectedCustomerId}
              placeholder="Seleccionar paciente"
              options={filteredCustomers.slice(0, 80).map((customer) => ({
                value: customer.id,
                label: `${customerName(customer)} · ${customer.phone || "Sin teléfono"}${customer.document_number ? ` · ID ${customer.document_number}` : ""}`,
              }))}
            />

            <select value={selectedTemplateKey} onChange={(e) => setSelectedTemplateKey(e.target.value)} className="input-dark">
              {quickTemplates.map((template) => (
                <option key={template.key} value={template.key}>{template.label}</option>
              ))}
            </select>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">Vista previa</p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                {selectedCustomer
                  ? whatsappMessageForCustomer(selectedTemplate.message, selectedCustomer)
                  : selectedTemplate.message}
              </p>
            </div>

            {selectedCustomer && (
              <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 md:grid-cols-2">
                <InfoBox label="Paciente" value={customerName(selectedCustomer)} />
                <InfoBox label="Teléfono" value={selectedCustomer.phone || "Sin teléfono"} />
                <InfoBox label="EPS" value={translateIntent(selectedCustomer.eps || "informacion")} />
                <InfoBox label="Documento" value={selectedCustomer.document_number || "No indicado"} />
              </div>
            )}

            <button onClick={sendSelectedTemplate} className="btn-primary">
              <MessageCircle size={17} /> Abrir WhatsApp con plantilla
            </button>
          </div>
        </GlassCard>

        <GlassCard title="Mensaje libre">
          <div className="grid gap-3">
            <input
              value={manualPhone}
              onChange={(e) => setManualPhone(e.target.value)}
              placeholder="Teléfono. Ej: 3001234567"
              className="input-dark"
            />
            <select
              value={manualTemplateKey}
              onChange={(e) => {
                const key = e.target.value;
                setManualTemplateKey(key);
                const template = quickTemplates.find((item) => item.key === key);
                if (template) setManualMessage(template.message);
              }}
              className="input-dark"
            >
              <option value="">Usar plantilla guardada</option>
              {quickTemplates.map((template) => (
                <option key={template.key} value={template.key}>{template.label}</option>
              ))}
            </select>
            {selectedManualTemplate && (
              <p className="text-xs leading-5 text-white/45">
                Plantilla seleccionada: <span className="text-white/70">{selectedManualTemplate.label}</span>. Puedes modificar el texto antes de abrir WhatsApp.
              </p>
            )}
            <textarea
              value={manualMessage}
              onChange={(e) => setManualMessage(e.target.value)}
              placeholder="Mensaje"
              className="input-dark min-h-32"
            />
            <button onClick={sendManualMessage} className="btn-primary">
              <MessageCircle size={17} /> Abrir WhatsApp
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
            <h3 className="font-semibold">Crear plantilla personalizada</h3>
            <p className="mt-1 text-sm text-white/45">
              Puedes usar variables: {"{nombre}"}, {"{telefono}"}, {"{eps}"}, {"{documento}"}.
            </p>
            <div className="mt-4 grid gap-3">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-dark">
                <option value="template">Plantilla general</option>
                <option value="followup">Seguimiento</option>
                <option value="appointment">Citas</option>
                <option value="documents">Documentación</option>
              </select>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nombre de plantilla" className="input-dark" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Hola {nombre}, somos Neuronas IPS..."
                className="input-dark min-h-28"
              />
              <button onClick={saveTemplate} className="btn-secondary">
                <Plus size={17} /> Guardar plantilla
              </button>
            </div>
          </div>

          <div className="mt-6">
            <RecordsList records={records} deleteRecord={deleteRecord} />
          </div>
        </GlassCard>
      </section>

      <GlassCard title="Historial WhatsApp">
        <div className="space-y-3">
          {whatsappMessages.slice(0, 20).map((message) => (
            <div key={message.id} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
              <p className="text-sm font-semibold">{message.phone} · {message.template_key || "manual"}</p>
              <p className="mt-2 text-sm leading-6 text-white/55">{message.message}</p>
              <p className="mt-2 text-xs text-white/35">{new Date(message.created_at).toLocaleString("es-ES")}</p>
            </div>
          ))}
          {!whatsappMessages.length && <Empty text="Todavía no hay mensajes WhatsApp registrados." />}
        </div>
      </GlassCard>

      <GlassCard title="Plantillas rápidas">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {quickTemplates.map((template) => (
            <div key={template.key} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
              {editingTemplateKey === template.key ? (
                <div className="grid gap-3">
                  <input value={editingTemplateLabel} onChange={(e) => setEditingTemplateLabel(e.target.value)} className="input-dark" />
                  <textarea value={editingTemplateMessage} onChange={(e) => setEditingTemplateMessage(e.target.value)} className="input-dark min-h-28" />
                  <div className="flex flex-wrap gap-2">
                    <button onClick={saveEditingTemplate} className="btn-primary">Guardar cambios</button>
                    <button onClick={() => setEditingTemplateKey(null)} className="btn-secondary">Cancelar</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{template.label}</p>
                    <button onClick={() => startEditTemplate(template)} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/75 hover:bg-white/10">Editar</button>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/50">{template.message}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => applyTemplateToCrm(template)} className="rounded-full border border-green-300/25 bg-green-500/10 px-3 py-1 text-xs text-green-100 hover:bg-green-500/20">Usar en CRM</button>
                    <button onClick={() => applyTemplateToManual(template)} className="rounded-full border border-sky-300/25 bg-sky-500/10 px-3 py-1 text-xs text-sky-100 hover:bg-sky-500/20">Usar en mensaje libre</button>
                    {template.key.startsWith("custom_") && <button onClick={async () => { setLocalTemplates((current) => current.filter((item) => item.key !== template.key)); await deleteWhatsappTemplate(template); }} className="rounded-full border border-red-300/20 px-3 py-1 text-xs text-red-200/80 hover:bg-red-500/10">Eliminar</button>}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </section>
  );
}

function VoiceModule({
  voiceCalls,
  customers,
  employees,
  services,
  voiceCallerName,
  setVoiceCallerName,
  voiceCallerPhone,
  setVoiceCallerPhone,
  voiceReason,
  setVoiceReason,
  voiceTranscript,
  setVoiceTranscript,
  voiceIntent,
  setVoiceIntent,
  voiceStatus,
  setVoiceStatus,
  voicePriority,
  setVoicePriority,
  voiceScheduleCallId,
  setVoiceScheduleCallId,
  voiceScheduleEmployee,
  setVoiceScheduleEmployee,
  voiceScheduleService,
  setVoiceScheduleService,
  voiceScheduleDate,
  setVoiceScheduleDate,
  createVoiceCall,
  updateVoiceCallStatus,
  deleteVoiceCall,
  convertVoiceCallToCustomer,
  createAppointmentFromVoiceCall,
}: Parameters<typeof ModuleSection>[0]) {
  const total = voiceCalls.length;
  const pending = voiceCalls.filter((call) => ["nueva", "pendiente"].includes(call.status || "")).length;
  const appointmentsCreated = voiceCalls.filter((call) => call.status === "cita_creada").length;
  const discarded = voiceCalls.filter((call) => call.status === "descartada").length;

  const cleanPhone = (value?: string | null) => String(value || "").replace(/\D/g, "");
  const findCustomerForCall = (call: VoiceCall) => {
    const phone = cleanPhone(call.caller_phone);
    return customers.find((customer) => {
      const customerPhone = cleanPhone(customer.phone);
      return (
        (call.customer_id && customer.id === call.customer_id) ||
        (!!phone && !!customerPhone && customerPhone.endsWith(phone.slice(-9)))
      );
    }) || null;
  };


  return (
    <section className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={<PhoneCall />} label="Llamadas" value={total} helper="Total recibidas" />
        <Metric icon={<Clock />} label="Pendientes" value={pending} helper="Por gestionar" />
        <Metric icon={<CalendarDays />} label="Citas creadas" value={appointmentsCreated} helper="Convertidas" />
        <Metric icon={<XCircle />} label="Descartadas" value={discarded} helper="No interesadas" />
      </div>

      <div className="rounded-[2rem] border border-green-300/20 bg-green-500/10 p-5 text-sm text-green-100">
        <p className="font-semibold">Flowly Voice conectado al CRM</p>
        <p className="mt-1 text-green-100/70">Las llamadas entrantes guardan EPS, tipo de documento e identificación. Desde esta bandeja puedes crear el paciente, marcar seguimiento o agendar directamente en la agenda.</p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <GlassCard title="Registrar llamada manual">
          <div className="grid gap-3">
            <input value={voiceCallerName} onChange={(e) => setVoiceCallerName(e.target.value)} placeholder="Nombre de quien llama" className="input-dark" />
            <input value={voiceCallerPhone} onChange={(e) => setVoiceCallerPhone(e.target.value)} placeholder="Teléfono" className="input-dark" />

            <select value={voiceIntent} onChange={(e) => setVoiceIntent(e.target.value)} className="input-dark">
              <option value="informacion">Información</option>
              <option value="particular">Paciente particular</option>
              <option value="nueva_eps">Nueva EPS</option>
              <option value="salud_total">Salud Total</option>
              <option value="otra_eps">Otra EPS</option>
              <option value="reprogramar">Reprogramar cita</option>
              <option value="incidencia">Incidencia</option>
              <option value="seguimiento">Seguimiento</option>
            </select>

            <select value={voiceStatus} onChange={(e) => setVoiceStatus(e.target.value)} className="input-dark">
              <option value="nueva">Nueva</option>
              <option value="pendiente">Pendiente</option>
              <option value="contactado">Contactado</option>
              <option value="cita_creada">Cita creada</option>
              <option value="descartada">Descartada</option>
            </select>

            <select value={voicePriority} onChange={(e) => setVoicePriority(e.target.value)} className="input-dark">
              <option value="baja">Prioridad baja</option>
              <option value="normal">Prioridad normal</option>
              <option value="alta">Prioridad alta</option>
              <option value="urgente">Urgente</option>
            </select>

            <textarea value={voiceReason} onChange={(e) => setVoiceReason(e.target.value)} placeholder="Motivo de la llamada" className="input-dark min-h-24" />
            <textarea value={voiceTranscript} onChange={(e) => setVoiceTranscript(e.target.value)} placeholder="Notas o transcripción manual" className="input-dark min-h-32" />

            <button onClick={createVoiceCall} className="btn-primary">
              <Plus size={17} /> Registrar llamada
            </button>
          </div>
        </GlassCard>

        <GlassCard title="Bandeja CRM de llamadas">
          <div className="space-y-3">
            {voiceCalls.map((call) => {
              const linkedCustomer = findCustomerForCall(call);
              const isScheduling = voiceScheduleCallId === call.id;

              return (
                <div key={call.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{linkedCustomer ? customerName(linkedCustomer) : call.caller_name || "Llamada sin nombre"}</p>
                        <span className={priorityBadge(call.priority || "normal")}>{translatePriority(call.priority || "normal")}</span>
                        {linkedCustomer && <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-100">Paciente encontrado</span>}
                      </div>
                      <p className="mt-1 text-sm text-white/55">{call.caller_phone}</p>

                      <div className="mt-3 grid gap-2 text-xs text-white/60 md:grid-cols-3">
                        <div className="rounded-xl bg-black/20 p-3">
                          <p className="text-white/35">EPS</p>
                          <p className="mt-1 font-medium text-white">{translateIntent(call.eps || call.intent || "informacion")}</p>
                        </div>
                        <div className="rounded-xl bg-black/20 p-3">
                          <p className="text-white/35">Documento</p>
                          <p className="mt-1 font-medium text-white">{translateDocumentType(call.document_type || "") || "No indicado"}</p>
                        </div>
                        <div className="rounded-xl bg-black/20 p-3">
                          <p className="text-white/35">Número ID</p>
                          <p className="mt-1 font-medium text-white">{call.document_number || "No indicado"}</p>
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-white/75">{call.reason || "Sin motivo registrado"}</p>
                      {call.transcript && <p className="mt-2 text-xs leading-5 text-white/45">{call.transcript}</p>}
                      <p className="mt-3 text-xs text-violet-200">
                        Estado: {translateVoiceStatus(call.status || "nueva")} · Fuente: {call.source || "manual"} · {new Date(call.created_at).toLocaleString("es-ES")}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                      <StatusButton onClick={() => updateVoiceCallStatus(call.id, "pendiente")} tone="violet">Pendiente</StatusButton>
                      <button onClick={() => convertVoiceCallToCustomer(call)} className="rounded-full border border-green-300/25 px-3 py-2 text-xs text-green-200">{linkedCustomer ? "Vincular CRM" : "Crear paciente"}</button>
                      <button onClick={() => setVoiceScheduleCallId(isScheduling ? "" : call.id)} className="rounded-full border border-violet-300/25 px-3 py-2 text-xs text-violet-200">Agendar cita</button>
                      <StatusButton onClick={() => updateVoiceCallStatus(call.id, "contactado")} tone="green">Contactado</StatusButton>
                      <StatusButton onClick={() => updateVoiceCallStatus(call.id, "descartada")} tone="red">Descartar</StatusButton>
                      <button onClick={() => deleteVoiceCall(call.id)} className="rounded-full border border-red-300/25 px-3 py-2 text-xs text-red-200">Eliminar</button>
                    </div>
                  </div>

                  {isScheduling && (
                    <div className="mt-4 rounded-2xl border border-violet-300/20 bg-violet-500/10 p-4">
                      <p className="mb-3 text-sm font-semibold text-violet-100">Agendar desde esta llamada</p>
                      <div className="grid gap-3 md:grid-cols-4">
                        <Select value={voiceScheduleEmployee} onChange={setVoiceScheduleEmployee} placeholder="Profesional" options={employees.map((employee) => ({ value: employee.id, label: employee.name }))} />
                        <Select value={voiceScheduleService} onChange={setVoiceScheduleService} placeholder="Servicio / terapia" options={services.map((service) => ({ value: service.id, label: `${service.name} · ${Number(service.price).toFixed(2)}€` }))} />
                        <input type="datetime-local" value={voiceScheduleDate} onChange={(e) => setVoiceScheduleDate(e.target.value)} className="input-dark" />
                        <button onClick={() => createAppointmentFromVoiceCall(call)} className="btn-primary">
                          <CalendarDays size={17} /> Crear cita
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {!voiceCalls.length && <Empty text="Todavía no hay llamadas registradas." />}
          </div>
        </GlassCard>
      </section>
    </section>
  );
}

function translateVoiceStatus(status: string) {
  if (status === "nueva") return "Nueva";
  if (status === "pendiente") return "Pendiente";
  if (status === "contactado") return "Contactado";
  if (status === "cita_creada") return "Cita creada";
  if (status === "descartada") return "Descartada";
  return status;
}

function translateIntent(intent: string) {
  if (intent === "informacion") return "Información";
  if (intent === "nueva_cita") return "Nueva cita";
  if (intent === "particular") return "Particular";
  if (intent === "nueva_eps") return "Nueva EPS";
  if (intent === "salud_total") return "Salud Total";
  if (intent === "otra_eps") return "Otra EPS";
  if (intent === "reprogramar") return "Reprogramar";
  if (intent === "incidencia") return "Incidencia";
  if (intent === "seguimiento") return "Seguimiento";
  return intent;
}

function translateDocumentType(type: string) {
  if (type === "tarjeta_identidad") return "Tarjeta de identidad";
  if (type === "cedula_ciudadania") return "Cédula de ciudadanía";
  return type;
}

function translatePriority(priority: string) {
  if (priority === "baja") return "Baja";
  if (priority === "normal") return "Normal";
  if (priority === "alta") return "Alta";
  if (priority === "urgente") return "Urgente";
  return priority;
}

function priorityBadge(priority: string) {
  if (priority === "urgente") return "rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-100";
  if (priority === "alta") return "rounded-full bg-orange-500/20 px-3 py-1 text-xs text-orange-100";
  if (priority === "baja") return "rounded-full bg-white/10 px-3 py-1 text-xs text-white/55";
  return "rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-100";
}


function AgendaSection({
  appointments,
  customers,
  employees,
  services,
  appointmentCustomer,
  setAppointmentCustomer,
  appointmentEmployee,
  setAppointmentEmployee,
  appointmentService,
  setAppointmentService,
  appointmentDateValue,
  setAppointmentDateValue,
  createAppointment,
  updateAppointmentStatus,
}: any) {
  const [agendaSearch, setAgendaSearch] = useState("");
  const [agendaStatus, setAgendaStatus] = useState("all");
  const [agendaView, setAgendaView] = useState<"today" | "week" | "month" | "all">("week");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const endOfWeek = new Date(startOfToday);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  const endOfMonth = new Date(startOfToday);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);

  const filteredAppointments = appointments.filter((appointment: Appointment) => {
    const service = firstRelation(appointment.services);
    const employee = firstRelation(appointment.employees);
    const date = new Date(appointmentDate(appointment));
    const text = `${customerName(appointment.customers)} ${service?.name || ""} ${employee?.name || ""} ${appointment.status}`.toLowerCase();
    const matchesSearch = text.includes(agendaSearch.toLowerCase());
    const matchesStatus = agendaStatus === "all" || appointment.status === agendaStatus;

    const matchesView =
      agendaView === "all" ||
      (agendaView === "today" && date >= startOfToday && date < endOfToday) ||
      (agendaView === "week" && date >= startOfToday && date < endOfWeek) ||
      (agendaView === "month" && date >= startOfToday && date < endOfMonth);

    return matchesSearch && matchesStatus && matchesView;
  });

  const todayCount = appointments.filter((appointment: Appointment) => {
    const date = new Date(appointmentDate(appointment));
    return date >= startOfToday && date < endOfToday && appointment.status !== "cancelled";
  }).length;

  const confirmedCount = appointments.filter((appointment: Appointment) => appointment.status === "confirmed").length;
  const completedCount = appointments.filter((appointment: Appointment) => appointment.status === "completed").length;
  const cancelledCount = appointments.filter((appointment: Appointment) => appointment.status === "cancelled").length;

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={<CalendarDays />} label="Citas hoy" value={todayCount} helper="Agenda diaria" />
        <Metric icon={<CheckCircle2 />} label="Confirmadas" value={confirmedCount} helper="Pendientes de atención" />
        <Metric icon={<Clock />} label="Completadas" value={completedCount} helper="Finalizadas" />
        <Metric icon={<XCircle />} label="Canceladas" value={cancelledCount} helper="No asistidas" />
      </div>

      <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
        <GlassCard title="Nueva cita">
          <div className="grid gap-3">
            <Select value={appointmentCustomer} onChange={setAppointmentCustomer} placeholder="Seleccionar cliente / paciente" options={customers.map((c: Customer) => ({ value: c.id, label: customerName(c) }))} />
            <Select value={appointmentEmployee} onChange={setAppointmentEmployee} placeholder="Seleccionar profesional" options={employees.map((e: Employee) => ({ value: e.id, label: e.name }))} />
            <Select value={appointmentService} onChange={setAppointmentService} placeholder="Seleccionar servicio / terapia" options={services.map((s: Service) => ({ value: s.id, label: `${s.name} · ${s.price}€` }))} />
            <input type="datetime-local" value={appointmentDateValue} onChange={(e) => setAppointmentDateValue(e.target.value)} className="input-dark" />
            <button onClick={createAppointment} className="btn-primary"><Plus size={17} /> Crear cita</button>
          </div>
        </GlassCard>

        <GlassCard title="Agenda operativa">
          <div className="mb-5 grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-white/35" size={18} />
              <input value={agendaSearch} onChange={(e) => setAgendaSearch(e.target.value)} placeholder="Buscar paciente, servicio o profesional" className="input-dark pl-11" />
            </div>
            <select value={agendaView} onChange={(e) => setAgendaView(e.target.value as any)} className="input-dark">
              <option value="today">Hoy</option>
              <option value="week">Próximos 7 días</option>
              <option value="month">Próximo mes</option>
              <option value="all">Todas</option>
            </select>
            <select value={agendaStatus} onChange={(e) => setAgendaStatus(e.target.value)} className="input-dark">
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredAppointments.map((appointment: Appointment) => {
              const service = firstRelation(appointment.services);
              const employee = firstRelation(appointment.employees);
              return (
                <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <p className="font-semibold">{new Date(appointmentDate(appointment)).toLocaleString("es-ES")}</p>
                      <p className="mt-1 text-sm text-white/58">{customerName(appointment.customers)} · {service?.name || "Servicio"} · {employee?.name || "Sin profesional"}</p>
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
            {!filteredAppointments.length && <Empty text="No hay citas con los filtros actuales." />}
          </div>
        </GlassCard>
      </section>
    </section>
  );
}

function ServicesSection({ services, serviceName, setServiceName, serviceDuration, setServiceDuration, servicePrice, setServicePrice, createService }: any) { return <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><GlassCard title="Nuevo servicio"><div className="grid gap-3"><input value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="Nombre del servicio" className="input-dark" /><input value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)} placeholder="Duración en minutos" type="number" className="input-dark" /><input value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} placeholder="Precio" type="number" className="input-dark" /><button onClick={createService} className="btn-primary"><Plus size={17} /> Crear servicio</button></div></GlassCard><GlassCard title="Servicios creados"><div className="grid gap-3 md:grid-cols-2">{services.map((service: Service) => <div key={service.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5"><h3 className="font-semibold">{service.name}</h3><p className="mt-2 text-sm text-white/50">{service.duration || service.duration_minutes || 30} min</p><p className="mt-4 text-2xl font-semibold">{Number(service.price).toFixed(2)}€</p></div>)}{!services.length && <Empty text="Crea tu primer servicio para empezar a recibir reservas." />}</div></GlassCard></section>; }
function EmployeesSection({ employees, employeeName, setEmployeeName, employeePhone, setEmployeePhone, createEmployee }: any) { return <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><GlassCard title="Nuevo empleado"><div className="grid gap-3"><input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="Nombre" className="input-dark" /><input value={employeePhone} onChange={(e) => setEmployeePhone(e.target.value)} placeholder="Teléfono" className="input-dark" /><button onClick={createEmployee} className="btn-primary"><Plus size={17} /> Crear empleado</button></div></GlassCard><GlassCard title="Equipo"><div className="space-y-3">{employees.map((employee: Employee) => <div key={employee.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="font-semibold">{employee.name}</p><p className="text-sm text-white/45">{employee.phone || "Sin teléfono"}</p></div>)}{!employees.length && <Empty text="Añade al primer profesional del negocio." />}</div></GlassCard></section>; }
function CustomersSection({ customers, customerFormName, setCustomerFormName, customerPhone, setCustomerPhone, createCustomer }: any) {
  const [search, setSearch] = useState("");
  const filteredCustomers = customers.filter((customer: Customer) => {
    const text = `${customerName(customer)} ${customer.phone || ""} ${customer.email || ""} ${customer.document_number || ""} ${customer.eps || ""} ${customer.crm_status || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
      <GlassCard title="Nuevo paciente / cliente">
        <div className="grid gap-3">
          <input value={customerFormName} onChange={(e) => setCustomerFormName(e.target.value)} placeholder="Nombre" className="input-dark" />
          <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Teléfono" className="input-dark" />
          <button onClick={createCustomer} className="btn-primary"><Plus size={17} /> Crear paciente</button>
        </div>
      </GlassCard>

      <GlassCard title="Clientes / pacientes">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-3.5 text-white/35" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, teléfono, identificación, EPS o estado" className="input-dark pl-11" />
        </div>
        <div className="space-y-3">
          {filteredCustomers.map((customer: Customer) => (
            <div key={customer.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <p className="font-semibold">{customerName(customer)}</p>
                  <p className="text-sm text-white/45">{customer.phone || customer.email || "Sin contacto"}</p>
                  <p className="mt-2 text-xs text-violet-200">
                    {translateCrmStatus(customer.crm_status || "nuevo")} · {translateIntent(customer.eps || "informacion")}
                    {customer.document_number ? ` · ID ${customer.document_number}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">Gestionar en CRM</span>
              </div>
            </div>
          ))}
          {!filteredCustomers.length && <Empty text="No hay pacientes que coincidan con la búsqueda." />}
        </div>
      </GlassCard>
    </section>
  );
}
function SettingsSection({
  business,
  settings,
  setSettings,
  saveSettings,
  companyProfile,
  companyName,
  setCompanyName,
  companyPhone,
  setCompanyPhone,
  companyEmail,
  setCompanyEmail,
  companyAddress,
  setCompanyAddress,
  companyTaxId,
  setCompanyTaxId,
  companyWebsite,
  setCompanyWebsite,
  companyDescription,
  setCompanyDescription,
  companySchedule,
  setCompanySchedule,
  companyPrimaryColor,
  setCompanyPrimaryColor,
  companySecondaryColor,
  setCompanySecondaryColor,
  logoUploading,
  uploadCompanyLogo,
  saveCompanyProfile,
}: {
  business: Business;
  settings: BookingSettings;
  setSettings: (s: BookingSettings) => void;
  saveSettings: () => void;
  companyProfile: CompanyProfile | null;
  companyName: string;
  setCompanyName: (v: string) => void;
  companyPhone: string;
  setCompanyPhone: (v: string) => void;
  companyEmail: string;
  setCompanyEmail: (v: string) => void;
  companyAddress: string;
  setCompanyAddress: (v: string) => void;
  companyTaxId: string;
  setCompanyTaxId: (v: string) => void;
  companyWebsite: string;
  setCompanyWebsite: (v: string) => void;
  companyDescription: string;
  setCompanyDescription: (v: string) => void;
  companySchedule: string;
  setCompanySchedule: (v: string) => void;
  companyPrimaryColor: string;
  setCompanyPrimaryColor: (v: string) => void;
  companySecondaryColor: string;
  setCompanySecondaryColor: (v: string) => void;
  logoUploading: boolean;
  uploadCompanyLogo: (file: File) => void;
  saveCompanyProfile: () => void;
}) {
  return (
    <section className="grid gap-6">
      <section className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <GlassCard title="Perfil de empresa">
          <div className="grid gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/25">
                {companyProfile?.logo_url || business.logo_url ? (
                  <img src={companyProfile?.logo_url || business.logo_url || ""} alt={companyName || business.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-semibold text-violet-100">{(companyName || business.name).slice(0, 1)}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/55">Logo de la web y del panel</p>
                <p className="mt-1 text-xs leading-5 text-white/35">Sube un PNG, JPG o WEBP. Se guardará en Supabase Storage y se usará como logo público del negocio.</p>
                <label className="mt-3 inline-flex cursor-pointer rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950">
                  {logoUploading ? "Subiendo..." : "Subir logo"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    disabled={logoUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadCompanyLogo(file);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Nombre comercial" className="input-dark" />
              <input value={companyTaxId} onChange={(e) => setCompanyTaxId(e.target.value)} placeholder="NIT / CIF / identificación fiscal" className="input-dark" />
              <input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} placeholder="Teléfono público" className="input-dark" />
              <input value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} placeholder="Email público" type="email" className="input-dark" />
              <input value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder="Web pública" className="input-dark md:col-span-2" />
              <input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Dirección" className="input-dark md:col-span-2" />
              <input value={companySchedule} onChange={(e) => setCompanySchedule(e.target.value)} placeholder="Horario público. Ej: Lun-Vie 8:00-18:00" className="input-dark md:col-span-2" />
              <label className="grid gap-2 text-sm text-white/60">Color principal<input type="color" value={companyPrimaryColor} onChange={(e) => setCompanyPrimaryColor(e.target.value)} className="h-12 w-full rounded-xl border border-white/10 bg-black/30 p-1" /></label>
              <label className="grid gap-2 text-sm text-white/60">Color secundario<input type="color" value={companySecondaryColor} onChange={(e) => setCompanySecondaryColor(e.target.value)} className="h-12 w-full rounded-xl border border-white/10 bg-black/30 p-1" /></label>
            </div>

            <textarea
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="Descripción pública de la empresa, especialidades, horarios de atención o mensaje para clientes."
              className="input-dark min-h-28"
            />

            <button onClick={saveCompanyProfile} className="btn-primary">
              <Settings size={17} /> Guardar perfil de empresa
            </button>
          </div>
        </GlassCard>

        <GlassCard title="Horarios de reservas">
          <div className="grid gap-3">
            <label className="text-sm text-white/70">Hora apertura</label>
            <input type="time" value={settings.start_time} onChange={(e) => setSettings({ ...settings, start_time: e.target.value })} className="input-dark" />
            <label className="text-sm text-white/70">Hora cierre</label>
            <input type="time" value={settings.end_time} onChange={(e) => setSettings({ ...settings, end_time: e.target.value })} className="input-dark" />
            <label className="text-sm text-white/70">Intervalo</label>
            <select value={settings.interval_minutes} onChange={(e) => setSettings({ ...settings, interval_minutes: Number(e.target.value) })} className="input-dark">
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>60 minutos</option>
            </select>
            <button onClick={saveSettings} className="btn-primary"><Settings size={17} /> Guardar horarios</button>
          </div>
        </GlassCard>
      </section>

      <GlassCard title="Días activos para reservas">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
