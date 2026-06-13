"use client";

import Link from "next/link";
import Image from "next/image";
import FlowlyAssistant3D from "@/components/FlowlyAssistant3D";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Bot,
  ChevronRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Package,
  ShieldCheck,
  Workflow,
  Star,
  Briefcase,
  FileSignature,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageCircle,
  PhoneCall,
  Plus,
  Receipt,
  Scissors,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Store,
  TrendingUp,
  UserCog,
  UserRound,
  Users,
  X,
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

type BusinessAvatar = {
  id?: string;
  business_id: string;
  avatar_name: string | null;
  avatar_style: string | null;
  avatar_personality: string | null;
  logo_url: string | null;
  avatar_url: string | null;
  prompt: string | null;
  brand_colors?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
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
  name?: string | null;
  content?: string | null;
  category?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type CrmReminder = {
  id: string;
  business_id: string;
  customer_id?: string | null;
  patient_id?: string | null;
  customer_name?: string | null;
  title: string;
  notes?: string | null;
  description?: string | null;
  remind_at?: string | null;
  reminder_at?: string | null;
  status: string | null;
  notified_at?: string | null;
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

type BusinessIntegration = {
  id?: string;
  business_id: string;
  provider_key: string;
  provider_name: string;
  category?: string | null;
  status: "pending" | "connected" | "error" | "disabled" | string;
  config?: Record<string, unknown> | null;
  notes?: string | null;
  last_checked_at?: string | null;
  connected_at?: string | null;
  updated_at?: string | null;
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
type AssistantMessage = { role: "assistant" | "user"; content: string };
type AssistantTourStep = { title: string; body: string; target: ActiveTab; cta: string };

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

const DASHBOARD_TIME_ZONE = "America/Bogota";
const DASHBOARD_TIME_ZONE_LABEL = "hora Colombia";
const BOGOTA_UTC_OFFSET = "-05:00";

const moduleCatalog: ModuleItem[] = [
  { key: "agenda", slug: "agenda-pro", name: "Agenda PRO", short: "Agenda PRO", price: "+9,99€", badge: "Calendario", description: "Calendario visual por cuadrados con citas, huecos libres, agenda diaria/semanal y creación rápida de citas.", Icon: CalendarDays, proFeatures: ["Calendario visual", "Huecos libres", "Crear citas rápidas"] },
  { key: "crm", slug: "crm", name: "CRM avanzado", short: "CRM", price: "+9,99€", badge: "Producto estrella", description: "Pipeline, filtros, notas, segmentos, historial y acciones comerciales por cliente.", Icon: UserCog, proFeatures: ["Ficha 360º de cliente", "Filtros por estado y contacto", "Notas y próximos pasos"] },
  { key: "whatsapp", slug: "whatsapp", name: "WhatsApp automático", short: "WhatsApp", price: "+9,99€", badge: "Automatización", description: "Conecta tu número, crea plantillas y prepara bots de confirmación, recordatorio y recuperación.", Icon: MessageCircle, proFeatures: ["Plantillas con variables", "Bot de recordatorio", "Conexión preparada para proveedor"] },
  { key: "billing", slug: "facturacion", name: "Facturación", short: "Facturación", price: "+9,99€", badge: "Finanzas", description: "Control de ingresos, gastos, proveedores, caja prevista y movimientos manuales.", Icon: Receipt, amountEnabled: true, proFeatures: ["Gastos e ingresos", "Proveedores", "Suma automática de reservas"] },
  { key: "pos", slug: "tpv", name: "TPV", short: "TPV", price: "+14,99€", badge: "Caja", description: "TPV operativo para tickets, métodos de pago, caja diaria, artículos rápidos y ventas presenciales.", Icon: Store, amountEnabled: true, proFeatures: ["Tickets rápidos", "Métodos de pago", "Resumen de caja"] },
  { key: "marketing", slug: "marketing", name: "Marketing", short: "Marketing", price: "+9,99€", badge: "Crecimiento", description: "Campañas, presupuestos, canales publicitarios y preparación para Meta Ads, Google Ads y TikTok Ads.", Icon: Megaphone, amountEnabled: true, proFeatures: ["Meta / Google / TikTok", "Calendario de campañas", "Presupuesto y objetivo"] },
  { key: "ai", slug: "ia", name: "IA Assistant", short: "IA", price: "+14,99€", badge: "IA", description: "Convierte el panel en un centro inteligente con insights, prompts, acciones recomendadas y análisis del negocio.", Icon: Bot, proFeatures: ["Resumen del negocio", "Recomendaciones IA", "Panel asistido"] },
  { key: "analytics", slug: "estadisticas", name: "Estadísticas avanzadas", short: "Estadísticas", price: "+4,99€", badge: "KPIs", description: "KPIs, ingresos previstos, ranking de servicios, ocupación y evolución del negocio.", Icon: TrendingUp, amountEnabled: true, proFeatures: ["KPIs operativos", "Ingresos previstos", "Evolución mensual"] },
  { key: "booking_premium", slug: "reservas-premium", name: "Reservas Premium", short: "Reservas Pro", price: "+4,99€", badge: "Booking PRO", description: "Reglas avanzadas, bloqueos, políticas y personalización de la experiencia de reservas.", Icon: SlidersHorizontal, proFeatures: ["Reglas avanzadas", "Bloqueos especiales", "Experiencia personalizada"] },
  { key: "voice", slug: "voice", name: "Flowly Voice", short: "Voice", price: "+29,99€", badge: "Voz IA", description: "Registro de llamadas y solicitudes telefónicas, preparado para centralita con IA.", Icon: PhoneCall, proFeatures: ["Registro de llamadas", "Intención detectada", "Preparado para centralita IA"] },
  { key: "inventory", slug: "inventario", name: "Inventario", short: "Inventario", price: "+14,99€", badge: "Stock", description: "Control de productos, stock mínimo, entradas, salidas y alertas de reposición.", Icon: Package, amountEnabled: true, proFeatures: ["Productos y stock", "Alertas de mínimo", "Movimientos de inventario"] },
  { key: "client_portal", slug: "portal-cliente", name: "Portal Cliente", short: "Portal", price: "+19,99€", badge: "Experiencia cliente", description: "Espacio privado para que los clientes vean citas, documentos, pagos y solicitudes.", Icon: ShieldCheck, proFeatures: ["Acceso privado", "Documentos y citas", "Solicitudes online"] },
  { key: "surveys", slug: "encuestas", name: "Encuestas", short: "Encuestas", price: "+7,99€", badge: "Satisfacción", description: "Encuestas postservicio, NPS, valoraciones y seguimiento de experiencia.", Icon: Star, proFeatures: ["NPS", "Valoraciones", "Clientes en riesgo"] },
  { key: "hr", slug: "rrhh", name: "RRHH", short: "RRHH", price: "+19,99€", badge: "Equipo", description: "Gestión de personal, vacaciones, incidencias, documentos internos y solicitudes.", Icon: Briefcase, proFeatures: ["Vacaciones", "Incidencias", "Expediente del equipo"] },
  { key: "automations", slug: "automatizaciones", name: "Automatizaciones", short: "Automatizaciones", price: "+24,99€", badge: "No-code", description: "Flujos tipo si ocurre esto, haz esto: WhatsApp, tareas, recordatorios, CRM y agenda.", Icon: Workflow, proFeatures: ["Reglas visuales", "Acciones automáticas", "Flujos entre módulos"] },
  { key: "digital_signature", slug: "firma-digital", name: "Firma digital", short: "Firma", price: "+12,99€", badge: "Documentos", description: "Firma de presupuestos, contratos, consentimientos y documentos desde el panel.", Icon: FileSignature, proFeatures: ["Firma online", "PDF firmado", "Trazabilidad"] },
  { key: "time_tracking", slug: "fichaje", name: "Módulo Fichaje", short: "Fichaje", price: "+11,99€", badge: "Control horario", description: "Registro de entrada, salida, pausas, jornada diaria y actividad del equipo.", Icon: Clock, proFeatures: ["Entrada y salida", "Pausas", "Resumen horario"] },
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


const EPS_OPTIONS = [
  { value: "nueva_eps", label: "Nueva EPS" },
  { value: "salud_total", label: "Salud Total" },
  { value: "fomag", label: "FOMAG" },
  { value: "sura", label: "SURA" },
  { value: "colsanitas", label: "Colsanitas" },
  { value: "coomeva_medicina_prepagada", label: "Coomeva Medicina Prepagada" },
  { value: "axa_colpatria", label: "AXA Colpatria" },
  { value: "particular", label: "Particular" },
  { value: "otra_eps", label: "Otra EPS" },
];

const DOCUMENT_TYPE_OPTIONS = [
  { value: "registro_civil", label: "Registro civil" },
  { value: "tarjeta_identidad", label: "Tarjeta de identidad" },
  { value: "cedula_ciudadania", label: "Cédula de ciudadanía" },
  { value: "pt", label: "PT" },
];

const epsLabel = (value?: string | null) =>
  EPS_OPTIONS.find((item) => item.value === value)?.label || value || "Sin EPS";

const documentTypeLabel = (value?: string | null) =>
  DOCUMENT_TYPE_OPTIONS.find((item) => item.value === value)?.label || value || "Sin documento";


export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [businessAvatar, setBusinessAvatar] = useState<BusinessAvatar | null>(null);
  const [avatarName, setAvatarName] = useState("Nia");
  const [avatarStyle, setAvatarStyle] = useState("robot-premium");
  const [avatarPersonality, setAvatarPersonality] = useState("cercana, estratégica y muy orientada a ventas");
  const [avatarGenerating, setAvatarGenerating] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [modules, setModules] = useState<BusinessModule[]>([]);
  const [moduleRecords, setModuleRecords] = useState<ModuleRecord[]>([]);
  const [businessIntegrations, setBusinessIntegrations] = useState<BusinessIntegration[]>([]);
  const [voiceCalls, setVoiceCalls] = useState<VoiceCall[]>([]);
  const [clinicalDocuments, setClinicalDocuments] = useState<ClinicalDocument[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsappMessage[]>([]);
  const [whatsappTemplatesData, setWhatsappTemplatesData] = useState<WhatsappTemplate[]>([]);
  const [crmReminders, setCrmReminders] = useState<CrmReminder[]>([]);
  const [dueReminder, setDueReminder] = useState<CrmReminder | null>(null);
  const [dismissedReminderIds, setDismissedReminderIds] = useState<string[]>([]);
  const [incomingVoiceCall, setIncomingVoiceCall] = useState<VoiceCall | null>(null);
  const [selectedCrmCustomerId, setSelectedCrmCustomerId] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("area");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantTourOpen, setAssistantTourOpen] = useState(false);
  const [assistantTourStep, setAssistantTourStep] = useState(0);
  const [assistantQuestion, setAssistantQuestion] = useState("");
  const [assistantThinking, setAssistantThinking] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([]);
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

    const [companyRes, servicesRes, employeesRes, customersRes, appointmentsRes, settingsRes, modulesRes, recordsRes, integrationsRes, voiceCallsRes, clinicalDocumentsRes, whatsappMessagesRes, whatsappTemplatesRes, crmRemindersRes, avatarRes] = await Promise.all([
      supabase.from("company_profiles").select("*").eq("business_id", businessId).maybeSingle(),
      supabase.from("services").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("employees").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("customers").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("appointments").select("*, customers(name, full_name), employees(name), services(name, price)").eq("business_id", businessId).order("appointment_date", { ascending: true }),
      supabase.from("booking_settings").select("*").eq("business_id", businessId).maybeSingle(),
      supabase.from("business_modules").select("*").eq("business_id", businessId).eq("status", "active"),
      supabase.from("module_records").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("business_integrations").select("*").eq("business_id", businessId).order("provider_name", { ascending: true }),
      supabase.from("voice_calls").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("clinical_documents").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("whatsapp_messages").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("whatsapp_templates").select("*").eq("business_id", businessId).eq("is_active", true).order("label", { ascending: true }),
      supabase.from("crm_reminders").select("*").eq("business_id", businessId).order("reminder_at", { ascending: true }),
      supabase
        .from("business_avatars")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
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
    setBusinessIntegrations(((integrationsRes.data || []) as BusinessIntegration[]) || []);
    if (integrationsRes.error) console.warn("No se pudieron cargar integraciones", integrationsRes.error.message);
    setVoiceCalls((voiceCallsRes.data || []) as VoiceCall[]);
    setClinicalDocuments((clinicalDocumentsRes.data || []) as ClinicalDocument[]);
    setWhatsappMessages((whatsappMessagesRes.data || []) as WhatsappMessage[]);
    setWhatsappTemplatesData(((whatsappTemplatesRes.data || []) as WhatsappTemplate[]).map(normalizeWhatsappTemplate));
    setCrmReminders(((crmRemindersRes.data || []) as unknown as CrmReminder[]).map(normalizeCrmReminder));
    setBusinessAvatar((avatarRes.data as BusinessAvatar | null) || null);
    if (avatarRes.error) console.warn("No se pudo cargar la Mascota IA", avatarRes.error.message);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!business?.id) return;
    const key = `flowly-avatar-tour-${business.id}`;
    if (!window.localStorage.getItem(key)) {
      const timer = window.setTimeout(() => {
        setAssistantTourStep(0);
        setAssistantTourOpen(true);
        setAssistantOpen(false);
      }, 900);
      return () => window.clearTimeout(timer);
    }
  }, [business?.id]);

  useEffect(() => {
    if (!businessAvatar?.avatar_name) return;
    setAssistantMessages((current) => current.length ? current : [{ role: "assistant", content: `Hola, soy ${businessAvatar.avatar_name}. Estoy aquí para ayudarte a moverte por Flowly, explicarte cada módulo y recomendarte acciones dentro del panel.` }]);
  }, [businessAvatar?.avatar_name]);

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
        if (dismissedReminderIds.includes(reminder.id)) return false;
        return reminderTime(reminder) <= now;
      });
      if (nextDue) setDueReminder(nextDue);
    };

    checkDueReminders();
    const timer = window.setInterval(checkDueReminders, 30000);
    return () => window.clearInterval(timer);
  }, [crmReminders, dismissedReminderIds]);

  const activeModuleKeys = useMemo(() => {
    if (business?.plan === "premium") return moduleCatalog.map((item) => item.key);
    return modules.map((item) => item.module_key);
  }, [business?.plan, modules]);

  const activeModules = moduleCatalog.filter((item) => activeModuleKeys.includes(item.key));
  const inactiveModules = moduleCatalog.filter((item) => !activeModuleKeys.includes(item.key));
  const activeModule = activeTab.startsWith("module:") ? moduleCatalog.find((item) => activeTab === `module:${item.slug}` || activeTab.startsWith(`module:${item.slug}:`)) : null;

  const bookingUrl = useMemo(() => (!origin || !business?.id ? "" : `${origin}/reservas/${business.id}`), [origin, business?.id]);
  const revenue = appointments.filter((item) => item.status !== "cancelled").reduce((sum, item) => sum + Number(firstRelation(item.services)?.price || 0), 0);
  const expenses = moduleRecords.filter((r) => r.module_key === "billing" && r.status === "expense").reduce((sum, r) => sum + Math.abs(Number(r.amount || 0)), 0);
  const manualIncome = moduleRecords.filter((r) => r.module_key === "billing" && r.status === "income").reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const pendingAppointments = appointments.filter((item) => item.status === "pending").length;
  const nextAppointments = appointments.slice(0, 6);
  const whatsappTemplatesEffective = useMemo(() => mergeWhatsappTemplates(whatsappTemplates, whatsappTemplatesData), [whatsappTemplatesData]);
  const upcomingReminders = useMemo(() => getUpcomingReminders(crmReminders, 7), [crmReminders]);
  const assistantTourSteps = useMemo<AssistantTourStep[]>(() => [
    { title: "Bienvenido al centro operativo", body: "Este panel reúne agenda, clientes, servicios, recordatorios y módulos contratados. Yo te acompaño desde aquí sin que tengas que buscar cada opción.", target: "area", cta: "Ver dashboard" },
    { title: "Agenda y reservas", body: "Aquí puedes crear citas, confirmar reservas, ver próximos huecos y preparar el calendario del negocio.", target: "agenda", cta: "Abrir agenda" },
    { title: "CRM de clientes", body: "En clientes y CRM puedes guardar datos, seguimiento, historial, recordatorios y acciones comerciales.", target: activeModules.some((item) => item.key === "crm") ? "module:crm" : "clientes", cta: "Ver clientes" },
    { title: "Módulos premium", body: "Los módulos contratados se sincronizan con este panel: WhatsApp, Voice, IA, TPV, facturación, marketing y estadísticas.", target: activeModules[0] ? (`module:${activeModules[0].slug}` as ActiveTab) : "area", cta: "Ver módulos" },
    { title: "Pregúntame cualquier cosa", body: "Puedes preguntarme cómo enviar un WhatsApp, crear un servicio, revisar clientes sin seguimiento o entender una métrica del panel.", target: "area", cta: "Hablar con asistente" },
  ], [activeModules]);

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

  const completeAssistantTour = () => {
    if (business?.id) window.localStorage.setItem(`flowly-avatar-tour-${business.id}`, "completed");
    setAssistantTourOpen(false);
    setAssistantOpen(true);
  };

  const nextAssistantTourStep = () => {
    const step = assistantTourSteps[assistantTourStep];
    if (step?.target) setActiveTab(step.target);
    if (assistantTourStep >= assistantTourSteps.length - 1) return completeAssistantTour();
    setAssistantTourStep((value) => value + 1);
  };

  const restartAssistantTour = () => {
    setAssistantTourStep(0);
    setAssistantTourOpen(true);
    setAssistantOpen(false);
  };

  const sendAssistantMessage = async () => {
    const question = assistantQuestion.trim();
    if (!question || assistantThinking || !business) return;

    const nextMessages: AssistantMessage[] = [...assistantMessages, { role: "user", content: question }];
    setAssistantMessages(nextMessages);
    setAssistantQuestion("");
    setAssistantThinking(true);

    try {
      const res = await fetch("/api/brand-avatar/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          messages: nextMessages.slice(-8),
          context: {
            business: { name: business.name, type: business.business_type, plan: business.plan },
            avatar: { name: businessAvatar?.avatar_name || "Mascota IA", personality: businessAvatar?.avatar_personality || "cercana y útil" },
            activeTab,
            metrics: { customers: customers.length, appointments: appointments.length, pendingAppointments, upcomingReminders: upcomingReminders.length, services: services.length, employees: employees.length, revenue },
            modules: activeModules.map((item) => ({ key: item.key, name: item.name, slug: item.slug })),
          },
        }),
      });
      const data = await res.json();
      const answer = res.ok ? data.answer : data.error;
      setAssistantMessages((current) => [...current, { role: "assistant", content: answer || "No he podido responder ahora mismo. Revisa la configuración de OPENAI_API_KEY." }]);
    } catch (error) {
      console.error(error);
      setAssistantMessages((current) => [...current, { role: "assistant", content: "No he podido conectar con la IA ahora mismo. Inténtalo de nuevo en unos segundos." }]);
    } finally {
      setAssistantThinking(false);
    }
  };

  const findCustomerForVoiceCall = (call: VoiceCall) => {
    const callPhone = normalizePhone(call.caller_phone);
    const callDocument = String(call.document_number || "").replace(/\D/g, "");
    return customers.find((customer) => {
      const customerPhone = normalizePhone(customer.phone);
      const customerDocument = String(customer.document_number || "").replace(/\D/g, "");
      return (
        (call.customer_id && customer.id === call.customer_id) ||
        (!!callDocument && !!customerDocument && customerDocument === callDocument) ||
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
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id).eq("business_id", business?.id || "");
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
      .eq("id", customerId)
      .eq("business_id", business.id);

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
    const { error } = await supabase.from("module_records").delete().eq("id", id).eq("business_id", business?.id || "");
    if (error) return alert(error.message);
    await loadData();
  };

  const activateModule = async (moduleKey: string) => {
    if (!business) return;
    const existing = modules.find((item) => item.module_key === moduleKey && item.status !== "cancelled");
    if (existing) return alert("Este módulo ya está activo en tu panel.");

    const { error } = await supabase.from("business_modules").insert({
      business_id: business.id,
      module_key: moduleKey,
      status: "active",
    });

    if (error) {
      const retry = await supabase
        .from("business_modules")
        .upsert({ business_id: business.id, module_key: moduleKey, status: "active" }, { onConflict: "business_id,module_key" });
      if (retry.error) return alert(retry.error.message);
    }

    await loadData();
    alert("Módulo añadido correctamente a tu panel.");
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
    const { error } = await supabase.from("voice_calls").update({ status }).eq("id", id).eq("business_id", business?.id || "");
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
      .eq("id", customerId)
      .eq("business_id", business?.id || "");

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
      patient_id: customerId,
      title: title.trim(),
      description: notes || null,
      notes: notes || null,
      remind_at: localDateTimeToBogotaIso(remindAt),
      reminder_at: localDateTimeToBogotaIso(remindAt),
      status: "pending",
    });
    if (error) return alert(error.message);
    await loadData();
  };

  const completeCrmReminder = async (id: string) => {
    const { error } = await supabase.from("crm_reminders").update({ status: "completed" }).eq("id", id).eq("business_id", business?.id || "");
    if (error) return alert(error.message);
    setDueReminder((current) => (current?.id === id ? null : current));
    setDismissedReminderIds((ids) => ids.filter((item) => item !== id));
    await loadData();
  };

  const deleteCrmReminder = async (id: string) => {
    const { error } = await supabase.from("crm_reminders").delete().eq("id", id).eq("business_id", business?.id || "");
    if (error) return alert(error.message);
    setDueReminder((current) => (current?.id === id ? null : current));
    setDismissedReminderIds((ids) => ids.filter((item) => item !== id));
    await loadData();
  };

  const saveWhatsappTemplate = async (template: WhatsappTemplate) => {
    if (!business || !template.label.trim() || !template.message.trim()) return alert("Añade nombre y mensaje de plantilla");
    const templateKey = template.key || `custom_${Date.now()}`;
    const label = template.label.trim();
    const message = template.message.trim();
    const payload = {
      business_id: business.id,
      key: templateKey,
      label,
      message,
      name: label,
      content: message,
      category: template.category || "custom",
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const existingId = template.id || whatsappTemplatesData.find((item) => item.key === templateKey)?.id;
    const query = existingId
      ? supabase.from("whatsapp_templates").update(payload).eq("id", existingId).eq("business_id", business.id)
      : supabase.from("whatsapp_templates").insert(payload);

    const { data, error } = await query.select("*").maybeSingle();
    if (error) return alert(error.message);

    const savedTemplate = normalizeWhatsappTemplate((data || { ...payload, id: existingId }) as WhatsappTemplate);
    setWhatsappTemplatesData((current) => {
      const withoutCurrent = current.filter((item) => item.key !== templateKey && item.id !== savedTemplate.id);
      return [...withoutCurrent, savedTemplate].sort((a, b) => a.label.localeCompare(b.label));
    });
    await loadData();
  };

  const deleteWhatsappTemplate = async (template: WhatsappTemplate) => {
    if (!business) return;
    const existingId = template.id || whatsappTemplatesData.find((item) => item.key === template.key)?.id;
    if (!existingId) {
      setWhatsappTemplatesData((current) => current.filter((item) => item.key !== template.key));
      return;
    }
    const { error } = await supabase
      .from("whatsapp_templates")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", existingId)
      .eq("business_id", business.id);
    if (error) return alert(error.message);
    setWhatsappTemplatesData((current) => current.filter((item) => item.id !== existingId));
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
      const { error: updateCustomerError } = await supabase
        .from("customers")
        .update({
          eps: call.eps || call.intent || existingCustomer.eps || null,
          document_type: call.document_type || existingCustomer.document_type || null,
          document_number: call.document_number || existingCustomer.document_number || null,
          crm_status: "en_llamada",
          last_contact_at: new Date().toISOString(),
        } as any)
        .eq("id", existingCustomer.id)
        .eq("business_id", business.id);

      if (updateCustomerError) {
        alert(updateCustomerError.message);
        return null;
      }

      await createCrmAction(
        existingCustomer.id,
        "Llamada vinculada desde Flowly Voice",
        [
          `Teléfono: ${call.caller_phone}`,
          call.eps ? `EPS: ${epsLabel(call.eps)}` : "",
          call.document_type ? `Documento: ${documentTypeLabel(call.document_type)}` : "",
          call.document_number ? `ID: ${call.document_number}` : "",
          call.reason || call.transcript || "",
        ].filter(Boolean).join("\n"),
        "llamada"
      );

      const { error: updateCallError } = await supabase
        .from("voice_calls")
        .update({ status: "contactado", customer_id: existingCustomer.id })
        .eq("id", call.id)
        .eq("business_id", business.id);

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
      call.eps ? `EPS: ${epsLabel(call.eps)}` : "",
      call.document_type ? `Tipo documento: ${documentTypeLabel(call.document_type)}` : "",
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
      .eq("id", call.id)
      .eq("business_id", business.id);

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
      .eq("id", call.id)
      .eq("business_id", business.id);

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

  const generateBusinessAvatar = async () => {
    if (!business?.id) return alert("No se encontró el negocio");
    setAvatarGenerating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch("/api/brand-avatar/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          businessId: business.id,
          businessName: companyName || business.name,
          businessType: business.business_type || "negocio local",
          logoUrl: companyProfile?.logo_url || business.logo_url || null,
          avatarName,
          avatarStyle,
          avatarPersonality,
          brandColors: [companyPrimaryColor, companySecondaryColor].filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) return alert(data.error || "No se pudo generar la mascota IA");
      setBusinessAvatar(data.avatar as BusinessAvatar);
      alert("Mascota IA generada y guardada en el panel.");
    } catch (error) {
      console.error(error);
      alert("Error generando la mascota IA");
    } finally {
      setAvatarGenerating(false);
    }
  };

  const deleteVoiceCall = async (id: string) => {
    const { error } = await supabase.from("voice_calls").delete().eq("id", id).eq("business_id", business?.id || "");
    if (error) return alert(error.message);
    await loadData();
  };

  if (loading) return <main className="flowly-app-shell flex items-center justify-center"><div className="flowly-app-content text-white">Cargando panel...</div></main>;
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
        <aside className="flowly-app-panel h-fit rounded-[2rem] p-4 lg:sticky lg:top-6 lg:w-80">
          <div className="mb-5 rounded-[1.5rem] bg-neutral-950/70 p-5">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Flowly IA" width={136} height={38} className="h-auto w-32 object-contain" priority />
            </div>
            <p className="mt-3 text-sm text-violet-200">Panel cliente</p>
            {businessAvatar?.avatar_name && <p className="mt-1 text-xs text-white/40">Mascota IA: {businessAvatar.avatar_name}</p>}
          </div>

          <nav className="grid gap-2">
            {navItems.map(({ id, label, Icon }) => <button key={id} onClick={() => setActiveTab(id)} className={activeTab === id ? "menu-active" : "menu-item"}><Icon size={17} /> {label}</button>)}
          </nav>

          {activeModules.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Módulos contratados</p>
              <div className="grid gap-2">
                {activeModules.map((item) => {
                  const Icon = item.Icon;
                  const id = `module:${item.slug}` as ActiveTab;
                  const isActive = activeTab === id || activeTab.startsWith(`${id}:`);

                  const submenus: Record<string, { label: string; tab: ActiveTab }[]> = {
                    agenda: [
                      { label: "Calendario", tab: "module:agenda-pro:calendario" as ActiveTab },
                      { label: "Huecos libres", tab: "module:agenda-pro:huecos" as ActiveTab },
                      { label: "Crear cita", tab: "module:agenda-pro:nueva" as ActiveTab },
                      { label: "Configuración", tab: "module:agenda-pro:configuracion" as ActiveTab },
                    ],
                    whatsapp: [
                      { label: "Enviar", tab: "module:whatsapp:enviar" as ActiveTab },
                      { label: "Plantillas", tab: "module:whatsapp:plantillas" as ActiveTab },
                    ],
                    crm: [
                      { label: "Ficha 360", tab: "module:crm:ficha" as ActiveTab },
                      { label: "Agenda CRM", tab: "module:crm:agenda" as ActiveTab },
                      { label: "Pipeline", tab: "module:crm:pipeline" as ActiveTab },
                      { label: "Hoy", tab: "module:crm:hoy" as ActiveTab },
                      { label: "Automatizaciones", tab: "module:crm:automatizaciones" as ActiveTab },
                    ],
                    billing: [
                      { label: "Ingresos", tab: "module:facturacion:ingresos" as ActiveTab },
                      { label: "Gastos", tab: "module:facturacion:gastos" as ActiveTab },
                      { label: "Proveedores", tab: "module:facturacion:proveedores" as ActiveTab },
                      { label: "Presupuestos", tab: "module:facturacion:presupuestos" as ActiveTab },
                    ],
                    pos: [
                      { label: "Nuevo ticket", tab: "module:tpv:ticket" as ActiveTab },
                      { label: "Caja", tab: "module:tpv:caja" as ActiveTab },
                      { label: "Historial", tab: "module:tpv:historial" as ActiveTab },
                    ],
                    marketing: [
                      { label: "Campañas", tab: "module:marketing:campanas" as ActiveTab },
                      { label: "Canales", tab: "module:marketing:canales" as ActiveTab },
                      { label: "Audiencias", tab: "module:marketing:audiencias" as ActiveTab },
                      { label: "Calendario", tab: "module:marketing:calendario" as ActiveTab },
                    ],
                    ai: [
                      { label: "Copiloto", tab: "module:ia:copiloto" as ActiveTab },
                      { label: "Automatizaciones", tab: "module:ia:automatizaciones" as ActiveTab },
                      { label: "Prompts", tab: "module:ia:prompts" as ActiveTab },
                      { label: "Conectores", tab: "module:ia:conectores" as ActiveTab },
                    ],
                    analytics: [
                      { label: "Dirección", tab: "module:estadisticas:direccion" as ActiveTab },
                      { label: "Agenda", tab: "module:estadisticas:agenda" as ActiveTab },
                      { label: "Finanzas", tab: "module:estadisticas:finanzas" as ActiveTab },
                      { label: "Servicios", tab: "module:estadisticas:servicios" as ActiveTab },
                    ],
                    booking_premium: [
                      { label: "Reglas", tab: "module:reservas-premium:reglas" as ActiveTab },
                      { label: "Bloqueos", tab: "module:reservas-premium:bloqueos" as ActiveTab },
                      { label: "Experiencia", tab: "module:reservas-premium:experiencia" as ActiveTab },
                      { label: "Conexiones", tab: "module:reservas-premium:conexiones" as ActiveTab },
                    ],
                    voice: [
                      { label: "Llamadas", tab: "module:voice:llamadas" as ActiveTab },
                      { label: "Agenda desde llamada", tab: "module:voice:agenda" as ActiveTab },
                    ],
                    time_tracking: [
                      { label: "Fichar", tab: "module:fichaje:fichar" as ActiveTab },
                      { label: "Jornada", tab: "module:fichaje:jornada" as ActiveTab },
                      { label: "Incidencias", tab: "module:fichaje:incidencias" as ActiveTab },
                    ],
                    inventory: [
                      { label: "Productos", tab: "module:inventario:productos" as ActiveTab },
                      { label: "Movimientos", tab: "module:inventario:movimientos" as ActiveTab },
                      { label: "Alertas", tab: "module:inventario:alertas" as ActiveTab },
                    ],
                    client_portal: [
                      { label: "Inicio", tab: "module:portal-cliente:inicio" as ActiveTab },
                      { label: "Solicitudes", tab: "module:portal-cliente:solicitudes" as ActiveTab },
                      { label: "Accesos", tab: "module:portal-cliente:accesos" as ActiveTab },
                    ],
                    surveys: [
                      { label: "Encuestas", tab: "module:encuestas:encuestas" as ActiveTab },
                      { label: "Respuestas", tab: "module:encuestas:respuestas" as ActiveTab },
                      { label: "NPS", tab: "module:encuestas:nps" as ActiveTab },
                    ],
                    hr: [
                      { label: "Equipo", tab: "module:rrhh:equipo" as ActiveTab },
                      { label: "Vacaciones", tab: "module:rrhh:vacaciones" as ActiveTab },
                      { label: "Documentos", tab: "module:rrhh:documentos" as ActiveTab },
                    ],
                    automations: [
                      { label: "Flujos", tab: "module:automatizaciones:flujos" as ActiveTab },
                      { label: "Reglas", tab: "module:automatizaciones:reglas" as ActiveTab },
                      { label: "Historial", tab: "module:automatizaciones:historial" as ActiveTab },
                    ],
                    digital_signature: [
                      { label: "Pendientes", tab: "module:firma-digital:pendientes" as ActiveTab },
                      { label: "Firmados", tab: "module:firma-digital:firmados" as ActiveTab },
                      { label: "Plantillas", tab: "module:firma-digital:plantillas" as ActiveTab },
                    ],
                  };
                  const children = submenus[item.key] || [];
                  const defaultTab = children[0]?.tab || id;
                  return (
                    <div key={item.key} className="grid gap-2">
                      <button onClick={() => { resetRecordForm(); setActiveTab(defaultTab); }} className={isActive ? "menu-active" : "menu-item"}>
                        <Icon size={17} /> {item.short}
                      </button>
                      {isActive && children.length > 0 && (
                        <div className="ml-4 grid gap-2 border-l border-white/10 pl-3">
                          {children.map((child) => (
                            <button key={child.label} onClick={() => setActiveTab(child.tab)} className={activeTab === child.tab || (child.tab === defaultTab && activeTab === id) ? "menu-active" : "menu-item"}>{child.label}</button>
                          ))}
                        </div>
                      )}
                    </div>
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
              <div className="flex items-start gap-4">
                {business.logo_url ? <img src={business.logo_url} alt={business.name} className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/15" /> : <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/20 text-xl font-semibold text-violet-100">{business.name.slice(0, 1)}</div>}
                <div>
                  <p className="text-sm font-medium text-violet-300">{business.business_type || "Negocio"} · Plan {business.plan || "basic"}</p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{business.name}</h1>
                  <p className="mt-3 max-w-2xl text-white/60">Centro operativo de reservas, clientes, servicios, módulos y suscripción.</p>
                </div>
              </div>
              <div className="grid gap-3 sm:min-w-[260px]">
                {businessAvatar?.avatar_name && (
                  <div className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-500/10 p-4 text-cyan-50 shadow-xl shadow-cyan-950/20">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/70">Asistente 3D activo</p>
                    <p className="mt-1 text-lg font-semibold">{businessAvatar.avatar_name || "Mascota IA"} camina por el panel</p>
                  </div>
                )}
                <div className="rounded-[1.5rem] border border-violet-300/20 bg-violet-500/15 px-5 py-4 text-violet-100"><p className="text-sm text-violet-200">Estado suscripción</p><p className="mt-1 text-2xl font-semibold capitalize">{business.subscription_status || "trialing"}</p></div>
              </div>
            </div>
          </header>

          <section className="mb-6 grid gap-4 md:grid-cols-4">
            <Metric icon={<CalendarDays />} label="Reservas" value={appointments.length} helper="Agenda total" />
            <Metric icon={<Clock />} label="Pendientes" value={pendingAppointments} helper="Por confirmar" />
            <Metric icon={<Users />} label="Clientes" value={customers.length} helper="Base activa" />
            <Metric icon={<TrendingUp />} label="Ingresos previstos" value={`${revenue.toFixed(2)}€`} helper="No canceladas" />
          </section>

          {dueReminder && (
            <ReminderAlarm reminder={dueReminder} customers={customers} completeReminder={completeCrmReminder} dismiss={() => { setDismissedReminderIds((ids) => dueReminder ? [...new Set([...ids, dueReminder.id])] : ids); setDueReminder(null); }} viewCustomer={(customerId) => { setSelectedCrmCustomerId(customerId); setActiveTab("module:crm"); setDueReminder(null); }} />
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

          {activeTab === "area" && <AreaSection business={business} businessAvatar={businessAvatar} activeModules={activeModules} inactiveModules={inactiveModules} bookingUrl={bookingUrl} openBillingPortal={openBillingPortal} setActiveTab={setActiveTab} activateModule={activateModule} integrations={businessIntegrations} reloadData={loadData} />}
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
            businessAvatar={businessAvatar}
            avatarName={avatarName}
            setAvatarName={setAvatarName}
            avatarStyle={avatarStyle}
            setAvatarStyle={setAvatarStyle}
            avatarPersonality={avatarPersonality}
            setAvatarPersonality={setAvatarPersonality}
            avatarGenerating={avatarGenerating}
            generateBusinessAvatar={generateBusinessAvatar}
          />}
          {activeModule && <ModuleSection business={business} integrations={businessIntegrations} reloadData={loadData} module={activeModule} records={moduleRecords.filter((r) => r.module_key === activeModule.key)} allRecords={moduleRecords} customers={customers} employees={employees} appointments={appointments} services={services} revenue={revenue} expenses={expenses} manualIncome={manualIncome} title={recordTitle} setTitle={setRecordTitle} notes={recordNotes} setNotes={setRecordNotes} amount={recordAmount} setAmount={setRecordAmount} status={recordStatus} setStatus={setRecordStatus} crmSearch={crmSearch} setCrmSearch={setCrmSearch} clinicalDocuments={clinicalDocuments} whatsappMessages={whatsappMessages} whatsappTemplatesEffective={whatsappTemplatesEffective} saveWhatsappTemplate={saveWhatsappTemplate} deleteWhatsappTemplate={deleteWhatsappTemplate} saveWhatsappMessage={saveWhatsappMessage} uploadClinicalDocument={uploadClinicalDocument} voiceCalls={voiceCalls} voiceCallerName={voiceCallerName} setVoiceCallerName={setVoiceCallerName} voiceCallerPhone={voiceCallerPhone} setVoiceCallerPhone={setVoiceCallerPhone} voiceReason={voiceReason} setVoiceReason={setVoiceReason} voiceTranscript={voiceTranscript} setVoiceTranscript={setVoiceTranscript} voiceIntent={voiceIntent} setVoiceIntent={setVoiceIntent} voiceStatus={voiceStatus} setVoiceStatus={setVoiceStatus} voicePriority={voicePriority} setVoicePriority={setVoicePriority} createVoiceCall={createVoiceCall} updateVoiceCallStatus={updateVoiceCallStatus} deleteVoiceCall={deleteVoiceCall} convertVoiceCallToCustomer={convertVoiceCallToCustomer} voiceScheduleCallId={voiceScheduleCallId} setVoiceScheduleCallId={setVoiceScheduleCallId} voiceScheduleEmployee={voiceScheduleEmployee} setVoiceScheduleEmployee={setVoiceScheduleEmployee} voiceScheduleService={voiceScheduleService} setVoiceScheduleService={setVoiceScheduleService} voiceScheduleDate={voiceScheduleDate} setVoiceScheduleDate={setVoiceScheduleDate} createAppointmentFromVoiceCall={createAppointmentFromVoiceCall} selectedCrmCustomerId={selectedCrmCustomerId} setSelectedCrmCustomerId={setSelectedCrmCustomerId} incomingVoiceCall={incomingVoiceCall} updateCustomerCrm={updateCustomerCrm} createCrmAction={createCrmAction} createAppointmentForCustomer={createAppointmentForCustomer} crmReminders={crmReminders} saveCrmReminder={saveCrmReminder} completeCrmReminder={completeCrmReminder} deleteCrmReminder={deleteCrmReminder} activeTab={activeTab} setActiveTab={setActiveTab} createRecord={createModuleRecord} deleteRecord={deleteModuleRecord} businessAvatar={businessAvatar} settings={settings} />}

          <FloatingAvatarAssistant
            businessAvatar={businessAvatar}
            businessName={business.name}
            open={assistantOpen}
            setOpen={setAssistantOpen}
            messages={assistantMessages}
            question={assistantQuestion}
            setQuestion={setAssistantQuestion}
            thinking={assistantThinking}
            sendMessage={sendAssistantMessage}
            tourOpen={assistantTourOpen}
            tourStep={assistantTourStep}
            tourSteps={assistantTourSteps}
            nextTourStep={nextAssistantTourStep}
            closeTour={completeAssistantTour}
            restartTour={restartAssistantTour}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </section>
      </div>
    </Shell>
  );
}


function FloatingAvatarAssistant({
  businessAvatar,
  businessName,
  open,
  setOpen,
  messages,
  question,
  setQuestion,
  thinking,
  sendMessage,
  tourOpen,
  tourStep,
  tourSteps,
  nextTourStep,
  closeTour,
  restartTour,
  activeTab,
  setActiveTab,
}: {
  businessAvatar: BusinessAvatar | null;
  businessName: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  messages: AssistantMessage[];
  question: string;
  setQuestion: (value: string) => void;
  thinking: boolean;
  sendMessage: () => void;
  tourOpen: boolean;
  tourStep: number;
  tourSteps: AssistantTourStep[];
  nextTourStep: () => void;
  closeTour: () => void;
  restartTour: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}) {
  const avatarUrl = businessAvatar?.avatar_url;
  const avatarName = businessAvatar?.avatar_name || "Flowly";
  const currentStep = tourSteps[tourStep];
  const [positionIndex, setPositionIndex] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGreeting, setIsGreeting] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [bubbleText, setBubbleText] = useState("Hola 👋");
  const [travelFacing, setTravelFacing] = useState<"left" | "right">("left");
  const autonomousTimerRef = useRef<number | null>(null);
  const spokenMessageRef = useRef("");

  const characterPositions = [
    { x: 82, y: 74, facing: "left" as const, label: "zona derecha", phrase: "Estoy por aquí si necesitas ayuda." },
    { x: 68, y: 74, facing: "left" as const, label: "resumen principal", phrase: "Este panel resume reservas, clientes e ingresos." },
    { x: 54, y: 74, facing: "right" as const, label: "centro del panel", phrase: "Puedo explicarte cualquier módulo del negocio." },
    { x: 38, y: 74, facing: "right" as const, label: "módulos", phrase: "A la izquierda tienes CRM, WhatsApp, TPV y más." },
  ];

  const currentPosition = characterPositions[positionIndex % characterPositions.length];
  const modelUrl = "/avatars/flowly-grandma.glb";
  const assistantFacing = isWalking ? travelFacing : currentPosition.facing;
  const characterMode = isWalking ? "walk" : isSpeaking ? "talk" : isGreeting ? "wave" : tourOpen ? "point" : thinking ? "thinking" : "idle";

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const cleaned = text.replace(/\s+/g, " ").trim().slice(0, 260);
    if (!cleaned) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = "es-ES";
    utterance.rate = 1.02;
    utterance.pitch = 1.06;
    utterance.volume = 0.85;
    setBubbleText(cleaned);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const walkTo = (index: number, after?: () => void) => {
    const next = index % characterPositions.length;
    const origin = characterPositions[positionIndex % characterPositions.length];
    const destination = characterPositions[next];
    setTravelFacing(destination.x >= origin.x ? "right" : "left");
    setIsWalking(true);
    setBubbleText("Voy a revisar esa zona del panel...");
    window.setTimeout(() => setPositionIndex(next), 180);
    window.setTimeout(() => {
      setIsWalking(false);
      const destination = characterPositions[next];
      setBubbleText(destination.phrase);
      after?.();
    }, 3200);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsHidden(window.localStorage.getItem("flowly-assistant-3d-hidden") === "1");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || isHidden || open || tourOpen) return;

    const autonomousPhrases = [
      "Estoy vigilando que todo esté en orden.",
      "Puedes preguntarme por CRM, agenda o WhatsApp.",
      "Si quieres, te hago un tour rápido del panel.",
      "Me moveré solo por zonas importantes para no molestar."
    ];

    if (autonomousTimerRef.current) window.clearInterval(autonomousTimerRef.current);
    autonomousTimerRef.current = window.setInterval(() => {
      if (document.hidden) return;
      setPositionIndex((current) => {
        const next = (current + 1) % characterPositions.length;
        const origin = characterPositions[current % characterPositions.length];
        const destination = characterPositions[next];
        setTravelFacing(destination.x >= origin.x ? "right" : "left");
        setIsWalking(true);
        setIsGreeting(false);
        setBubbleText("Voy a colocarme mejor...");
        window.setTimeout(() => {
          setIsWalking(false);
          setBubbleText(autonomousPhrases[Math.floor(Math.random() * autonomousPhrases.length)] || destination.phrase);
          if (Math.random() > 0.7) {
            setIsGreeting(true);
            window.setTimeout(() => setIsGreeting(false), 1400);
          }
        }, 3200);
        return next;
      });
    }, 18000);

    return () => {
      if (autonomousTimerRef.current) window.clearInterval(autonomousTimerRef.current);
    };
  }, [isHidden, open, tourOpen]);

  useEffect(() => {
    if (hasGreeted || isHidden) return;
    const helloTimer = window.setTimeout(() => openAndGreet(), 900);
    return () => {
      window.clearTimeout(helloTimer);
    };
  }, [hasGreeted, isHidden]);

  useEffect(() => {
    if (!tourOpen || !currentStep) return;
    setIsWalking(false);
    speak(`${currentStep.title}. ${currentStep.body}`);
  }, [tourOpen, tourStep]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    const key = `${messages.length}-${last.content}`;
    if (spokenMessageRef.current === key) return;
    spokenMessageRef.current = key;
    speak(last.content);
  }, [messages]);

  const openAndGreet = () => {
    setIsHidden(false);
    if (typeof window !== "undefined") window.localStorage.removeItem("flowly-assistant-3d-hidden");
    setOpen(true);
    setIsWalking(false);
    setPositionIndex(0);
    setBubbleText(`Hola, soy ${avatarName}.`);
    setIsGreeting(true);
    window.setTimeout(() => setIsGreeting(false), 2200);
    if (!hasGreeted) {
      setHasGreeted(true);
      window.setTimeout(() => speak(`Hola, soy ${avatarName}. Estoy aquí para explicarte los módulos y responder dudas de ${businessName}.`), 220);
    }
  };

  const hideAssistant = () => {
    window.speechSynthesis?.cancel();
    setOpen(false);
    closeTour();
    setIsWalking(false);
    setIsGreeting(false);
    setIsSpeaking(false);
    setBubbleText("Hola 👋");
    setIsHidden(true);
    if (typeof window !== "undefined") window.localStorage.setItem("flowly-assistant-3d-hidden", "1");
  };

  const moveCharacter = () => {
    setOpen(false);
    const nextIndex = (positionIndex + 1) % characterPositions.length;
    walkTo(nextIndex, () => {
      if (nextIndex === 1) return;
      setBubbleText(characterPositions[nextIndex].phrase);
      setIsGreeting(true);
      window.setTimeout(() => setIsGreeting(false), 1700);
    });
  };

  const startTourWithVoice = () => {
    restartTour();
    setOpen(false);
    walkTo(2);
  };

  if (isHidden) {
    return (
      <button type="button" onClick={openAndGreet} className="flowly-3d-restore-button">
        Mostrar asistente 3D
      </button>
    );
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
        <div
          className={`flowly-3d-character-wrap pointer-events-auto ${isWalking ? "is-walking" : ""} ${isSpeaking ? "is-speaking" : ""} ${tourOpen ? "is-tour" : ""}`}
          style={{ left: `${currentPosition.x}%`, top: `${currentPosition.y}%`, transform: "translate(-50%, -50%)" }}
        >
          <button type="button" onClick={hideAssistant} className="flowly-3d-close-button" aria-label="Ocultar asistente 3D">
            <X size={14} />
          </button>

          {!open && !tourOpen && (
            <button onClick={openAndGreet} className="flowly-character-hotspot" aria-label={`Hablar con ${avatarName}`}>
              <div className="flowly-character-speech">
                <p>{isSpeaking ? "Te escucho" : isWalking ? "Voy para allá" : isGreeting ? "Hola 👋" : avatarName}</p>
                <span>{bubbleText}</span>
              </div>
            </button>
          )}

          <div className="flowly-3d-light-rim" />
          <FlowlyAssistant3D modelUrl={modelUrl} mode={characterMode} facing={assistantFacing} onClick={openAndGreet} />
          <div className="flowly-3d-ground-shadow" />

          <div className="flowly-character-status">
            <span className="flowly-character-dot" />
            {isSpeaking ? "hablando" : isWalking ? "caminando" : tourOpen ? "tour activo" : thinking ? "pensando" : "lista"}
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3 md:bottom-8 md:right-8">
        {tourOpen && currentStep && (
          <div className="pointer-events-auto w-[min(92vw,460px)] overflow-hidden rounded-[2rem] border border-cyan-300/25 bg-neutral-950/90 p-5 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl">
            <div className="flex items-start gap-4">
              <div className="flowly-avatar-stage-small shrink-0">
                <Bot size={34} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/65">Tour guiado · paso {tourStep + 1}/{tourSteps.length}</p>
                    <h3 className="mt-1 text-xl font-semibold text-white">{currentStep.title}</h3>
                  </div>
                  <button onClick={closeTour} className="rounded-full border border-white/10 p-2 text-white/55 hover:bg-white/10"><X size={16} /></button>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/62">{currentStep.body}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={nextTourStep} className="btn-primary py-2 text-sm">{currentStep.cta} <ChevronRight size={16} /></button>
                  <button onClick={() => { setActiveTab(currentStep.target); moveCharacter(); }} className="btn-secondary py-2 text-sm">Ir ahora</button>
                  <button onClick={() => { setOpen(true); closeTour(); }} className="btn-secondary py-2 text-sm">Preguntar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {open && (
          <div className="pointer-events-auto w-[min(94vw,440px)] overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-950/92 shadow-2xl shadow-black/50 backdrop-blur-2xl">
            <div className="border-b border-white/10 bg-gradient-to-r from-cyan-500/15 via-violet-500/15 to-fuchsia-500/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flowly-avatar-stage-mini"><Bot size={24} /></div>
                  <div>
                    <p className="text-sm font-semibold text-white">{avatarName}, asistente 3D de {businessName}</p>
                    <p className="text-xs text-cyan-100/55">Voz del navegador, tour guiado y consultas del panel.</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-full border border-white/10 p-2 text-white/55 hover:bg-white/10"><X size={16} /></button>
              </div>
            </div>

            <div className="max-h-[44vh] space-y-3 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-auto max-w-[86%] rounded-2xl bg-white px-4 py-3 text-sm text-neutral-950" : "max-w-[90%] rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm leading-6 text-white/78"}>
                  {message.content}
                </div>
              ))}
              {thinking && <div className="max-w-[80%] rounded-2xl border border-cyan-300/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">{avatarName} está pensando...</div>}
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {["Hazme un tour", "¿Cómo envío WhatsApp?", "¿Qué clientes debo revisar?", "Camina por el panel"].map((quick) => (
                  <button key={quick} onClick={() => quick === "Hazme un tour" ? startTourWithVoice() : quick === "Camina por el panel" ? moveCharacter() : setQuestion(quick)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/65 hover:bg-white/10">{quick}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                  placeholder={`Pregunta a ${avatarName} sobre el panel...`}
                  className="input-dark h-12 flex-1"
                />
                <button onClick={sendMessage} disabled={thinking || !question.trim()} className="btn-primary h-12 px-4 disabled:opacity-50"><Send size={17} /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function AreaSection({ business, businessAvatar, activeModules, inactiveModules, bookingUrl, openBillingPortal, setActiveTab, activateModule, integrations, reloadData }: { business: Business; businessAvatar: BusinessAvatar | null; activeModules: ModuleItem[]; inactiveModules: ModuleItem[]; bookingUrl: string; openBillingPortal: () => void; setActiveTab: (tab: ActiveTab) => void; activateModule: (moduleKey: string) => void; integrations: BusinessIntegration[]; reloadData: () => Promise<void> }) {
  const coreModules = ["Agenda", "CRM", "WhatsApp", "Voice", "Facturación", "TPV", "Marketing", "IA"];
  return (
    <section className="grid gap-6">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.12] via-violet-500/[0.10] to-cyan-500/[0.08] p-7 shadow-2xl shadow-violet-950/30">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-20 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">Flowly Command Center</p>
            <h2 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">Panel principal sincronizado con todos los módulos</h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62">Vista ejecutiva para dirigir el negocio: suscripción, reservas, CRM, automatizaciones, redes, pagos y módulos premium desde un único sistema operativo.</p>
          </div>
          <div className="grid min-w-[280px] gap-3 rounded-[2rem] border border-white/10 bg-black/25 p-4 backdrop-blur-xl">
            {businessAvatar?.avatar_name && (
              <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Asistente 3D</p>
                <p className="text-lg font-semibold">{businessAvatar.avatar_name || "Mascota IA"}</p>
                <p className="mt-1 text-xs text-white/45">Personaje interactivo activo en pantalla.</p>
              </div>
            )}
            <InfoBox label="Negocio" value={business.name} />
            <InfoBox label="Plan" value={business.plan || "basic"} />
            <InfoBox label="Estado" value={business.subscription_status || "trialing"} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={<LayoutDashboard />} label="Módulos activos" value={activeModules.length} helper="Operativos" />
        <Metric icon={<Store />} label="Sistema base" value="Core" helper="Agenda · CRM · Ajustes" />
        <Metric icon={<MessageCircle />} label="Canales" value="Listos" helper="WhatsApp · Redes · Voz" />
        <Metric icon={<CreditCard />} label="Pagos" value="Stripe" helper="Portal conectado" />
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_.9fr]">
        <GlassCard title="Accesos rápidos SaaS">
          <div className="grid gap-3 md:grid-cols-2">
            {activeModules.map((item) => <ModuleAccessCard key={item.key} module={item} active onOpen={() => setActiveTab(`module:${item.slug}`)} />)}
            {!activeModules.length && <Empty text="No hay módulos extra activos. El núcleo sigue funcionando con agenda, servicios, clientes, recordatorios y ajustes." />}
          </div>
        </GlassCard>
        <GlassCard title="Reservas online y suscripción">
          <p className="text-sm text-white/55">Enlace público para reservas, preparado para Google, Instagram, web del cliente y WhatsApp.</p>
          <div className="mt-5 rounded-2xl bg-black/30 p-4"><code className="break-all text-sm text-white/75">{bookingUrl}</code></div>
          <div className="mt-5 flex flex-wrap gap-3"><button onClick={() => { if (!bookingUrl) return; navigator.clipboard.writeText(bookingUrl); alert("Enlace copiado"); }} className="btn-primary">Copiar enlace</button><button onClick={openBillingPortal} className="btn-secondary"><CreditCard size={17} /> Gestionar suscripción</button></div>
        </GlassCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <GlassCard title="Conexiones del cliente">
          <IntegrationPanel business={business} integrations={integrations} reloadData={reloadData} items={[{ name: "Google Business Profile", detail: "Reservas, reseñas y presencia local" }, { name: "Instagram / Facebook", detail: "Botones, mensajes, campañas y píxel" }, { name: "WhatsApp Business", detail: "Plantillas, historial y campañas CRM" }, { name: "Stripe / pagos", detail: "Portal, facturación y señales" }, { name: "Web del cliente", detail: "Widget de reservas y tracking" }, { name: "Centralita / Voice", detail: "Llamadas, locuciones y IA de voz" }]} />
        </GlassCard>
        <GlassCard title="Mapa de producto">
          <div className="grid gap-3 md:grid-cols-2">{coreModules.map((x) => <div key={x} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5"><p className="font-semibold">{x}</p><p className="mt-2 text-sm text-white/45">Sincronizado con el panel principal y preparado para datos por negocio.</p></div>)}</div>
        </GlassCard>
      </section>

      <GlassCard title="Añadir módulos PRO"><div className="mb-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm text-cyan-50">Activa módulos directamente desde tu panel. El cargo se regularizará en tu suscripción o con el equipo comercial según tu contrato.</div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{inactiveModules.map((item) => <ModuleAccessCard key={item.key} module={item} onActivate={() => activateModule(item.key)} />)}</div></GlassCard>
    </section>
  );
}

function ModuleSection(props: { business: Business | null; integrations: BusinessIntegration[]; reloadData: () => Promise<void>; module: ModuleItem; records: ModuleRecord[]; allRecords: ModuleRecord[]; customers: Customer[]; employees: Employee[]; appointments: Appointment[]; services: Service[]; revenue: number; expenses: number; manualIncome: number; title: string; setTitle: (v: string) => void; notes: string; setNotes: (v: string) => void; amount: string; setAmount: (v: string) => void; status: string; setStatus: (v: string) => void; crmSearch: string; setCrmSearch: (v: string) => void; clinicalDocuments: ClinicalDocument[]; whatsappMessages: WhatsappMessage[]; whatsappTemplatesEffective: WhatsappTemplate[]; saveWhatsappTemplate: (template: WhatsappTemplate) => void; deleteWhatsappTemplate: (template: WhatsappTemplate) => void; saveWhatsappMessage: (customerId: string | null, phone: string, templateKey: string | null, message: string) => void; uploadClinicalDocument: (customerId: string, file: File, title?: string, documentType?: string, notes?: string) => void; voiceCalls: VoiceCall[]; voiceCallerName: string; setVoiceCallerName: (v: string) => void; voiceCallerPhone: string; setVoiceCallerPhone: (v: string) => void; voiceReason: string; setVoiceReason: (v: string) => void; voiceTranscript: string; setVoiceTranscript: (v: string) => void; voiceIntent: string; setVoiceIntent: (v: string) => void; voiceStatus: string; setVoiceStatus: (v: string) => void; voicePriority: string; setVoicePriority: (v: string) => void; createVoiceCall: () => void; updateVoiceCallStatus: (id: string, status: string) => void; deleteVoiceCall: (id: string) => void; convertVoiceCallToCustomer: (call: VoiceCall) => void; voiceScheduleCallId: string; setVoiceScheduleCallId: (v: string) => void; voiceScheduleEmployee: string; setVoiceScheduleEmployee: (v: string) => void; voiceScheduleService: string; setVoiceScheduleService: (v: string) => void; voiceScheduleDate: string; setVoiceScheduleDate: (v: string) => void; createAppointmentFromVoiceCall: (call: VoiceCall) => void; selectedCrmCustomerId: string; setSelectedCrmCustomerId: (v: string) => void; incomingVoiceCall: VoiceCall | null; updateCustomerCrm: (customerId: string, updates: Partial<Customer>) => void; createCrmAction: (customerId: string, title: string, notes: string, status?: string, dueDate?: string) => void; createAppointmentForCustomer: (customerId: string, employeeId: string, serviceId: string, dateValue: string) => void; crmReminders: CrmReminder[]; saveCrmReminder: (customerId: string, title: string, remindAt: string, notes?: string) => void; completeCrmReminder: (id: string) => void; deleteCrmReminder: (id: string) => void; activeTab: ActiveTab; setActiveTab: (tab: ActiveTab) => void; createRecord: (moduleKey: string, defaultStatus?: string) => void; deleteRecord: (id: string) => void; businessAvatar?: BusinessAvatar | null; settings?: BookingSettings | null }) {
  const { module, records, customers, employees, appointments, services, revenue, expenses, manualIncome } = props;
  if (module.key === "billing") return <BillingModule {...props} />;
  if (module.key === "pos") return <PosModule {...props} />;
  if (module.key === "agenda") return <AgendaProModule {...props} />;
  if (module.key === "crm") return <CrmModule {...props} />;
  if (module.key === "marketing") return <MarketingModule {...props} />;
  if (module.key === "ai") return <AiModule {...props} />;
  if (module.key === "whatsapp") return <WhatsappModule {...props} />;
  if (module.key === "voice") return <VoiceModule {...props} />;
  if (module.key === "analytics") return <AnalyticsModule {...props} />;
  if (module.key === "booking_premium") return <BookingPremiumModule {...props} />;
  if (module.key === "time_tracking") return <TimeTrackingModule {...props} />;
  if (["inventory", "client_portal", "surveys", "hr", "automations", "digital_signature"].includes(module.key)) return <BusinessOpsModule {...props} />;
  const Icon = module.Icon;
  return <section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]"><GlassCard><div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/20 text-violet-100"><Icon /></div><h2 className="text-2xl font-semibold">{module.name}</h2><p className="mt-2 text-sm text-white/55">{module.description}</p><div className="mt-6 grid gap-3"><input value={props.title} onChange={(e) => props.setTitle(e.target.value)} placeholder="Título del registro" className="input-dark" />{module.amountEnabled && <input value={props.amount} onChange={(e) => props.setAmount(e.target.value)} placeholder="Importe" type="number" className="input-dark" />}<textarea value={props.notes} onChange={(e) => props.setNotes(e.target.value)} placeholder="Notas" className="input-dark min-h-32" /><button onClick={() => props.createRecord(module.key)} className="btn-primary"><Plus size={17} /> Guardar</button></div></GlassCard><RecordsCard title="Actividad" records={records} deleteRecord={props.deleteRecord} /></section>;
}


function BusinessOpsModule({ module, records, customers, employees, title, setTitle, notes, setNotes, amount, setAmount, status, setStatus, createRecord, deleteRecord, activeTab, setActiveTab }: Parameters<typeof ModuleSection>[0]) {
  const map: Record<string, { prefix: string; tabs: string[]; statuses: { label: string; value: string }[]; placeholder: string; metric: string; }> = {
    inventory: { prefix: "module:inventario:", tabs: ["Productos", "Movimientos", "Alertas"], statuses: [{ label: "Producto", value: "product" }, { label: "Entrada", value: "stock_in" }, { label: "Salida", value: "stock_out" }, { label: "Stock bajo", value: "low_stock" }], placeholder: "Producto, referencia o movimiento", metric: "Stock y reposición" },
    client_portal: { prefix: "module:portal-cliente:", tabs: ["Inicio", "Solicitudes", "Accesos"], statuses: [{ label: "Publicado", value: "published" }, { label: "Solicitud", value: "request" }, { label: "Acceso", value: "access" }], placeholder: "Página, solicitud o acceso del portal", metric: "Experiencia cliente" },
    surveys: { prefix: "module:encuestas:", tabs: ["Encuestas", "Respuestas", "NPS"], statuses: [{ label: "Encuesta", value: "survey" }, { label: "Respuesta", value: "response" }, { label: "NPS positivo", value: "nps_positive" }, { label: "NPS riesgo", value: "nps_risk" }], placeholder: "Nombre de encuesta o respuesta", metric: "Satisfacción" },
    hr: { prefix: "module:rrhh:", tabs: ["Equipo", "Vacaciones", "Documentos"], statuses: [{ label: "Empleado", value: "employee" }, { label: "Vacaciones", value: "vacation" }, { label: "Incidencia", value: "incident" }, { label: "Documento", value: "document" }], placeholder: "Empleado, solicitud o documento", metric: "Gestión interna" },
    automations: { prefix: "module:automatizaciones:", tabs: ["Flujos", "Reglas", "Historial"], statuses: [{ label: "Flujo activo", value: "flow_active" }, { label: "Regla", value: "rule" }, { label: "Ejecución", value: "run" }, { label: "Pausada", value: "paused" }], placeholder: "Ej: Cliente nuevo → enviar WhatsApp", metric: "Procesos automáticos" },
    digital_signature: { prefix: "module:firma-digital:", tabs: ["Pendientes", "Firmados", "Plantillas"], statuses: [{ label: "Pendiente firma", value: "pending_signature" }, { label: "Firmado", value: "signed" }, { label: "Plantilla", value: "template" }, { label: "Caducado", value: "expired" }], placeholder: "Contrato, presupuesto o consentimiento", metric: "Firma documental" },
  };
  const cfg = map[module.key] || map.inventory;
  const [tab, setTab] = useState(cfg.tabs[0]);
  useEffect(() => {
    const mapping = Object.fromEntries(cfg.tabs.map((tabName) => [tabName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-"), tabName]));
    syncModuleSubmenu(activeTab, cfg.prefix, mapping, setTab);
  }, [activeTab, cfg.prefix]);
  const statusGroups: Record<string, string[]> = {
    Productos: ["product"],
    Movimientos: ["stock_in", "stock_out", "movement"],
    Alertas: ["low_stock"],
    Inicio: ["published"],
    Solicitudes: ["request"],
    Accesos: ["access"],
    Encuestas: ["survey"],
    Respuestas: ["response"],
    NPS: ["nps_positive", "nps_risk"],
    Equipo: ["employee"],
    Vacaciones: ["vacation"],
    Documentos: ["document"],
    Flujos: ["flow_active"],
    Reglas: ["rule"],
    Historial: ["run", "paused"],
    Pendientes: ["pending_signature"],
    Firmados: ["signed"],
    Plantillas: ["template"],
  };
  const visibleRecords = records.filter((record) => {
    const accepted = statusGroups[tab];
    return !accepted || accepted.includes(String(record.status || ""));
  });
  useEffect(() => {
    const accepted = statusGroups[tab];
    const nextStatus = accepted?.[0] || cfg.statuses[0]?.value || "active";
    setStatus(nextStatus);
  }, [tab]);
  const Icon = module.Icon;
  return (
    <section className="grid gap-6">
      <ModuleHero eyebrow={module.badge} title={module.name} description={module.description} actions={<ModulePillTabs tabs={cfg.tabs} active={tab} setActive={(next) => { const key = next.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-"); selectModuleSubmenu(setActiveTab, `${cfg.prefix}${key}` as ActiveTab, setTab, next); }} />} />
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Registros" value={records.length} />
        <MetricCard label="Clientes" value={customers.length} />
        <MetricCard label="Equipo" value={employees.length} />
        <MetricCard label="Estado" value={cfg.metric} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <GlassCard title={`Nuevo registro · ${tab}`}>
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-100"><Icon /></div>
          <div className="grid gap-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={cfg.placeholder} className="input-dark" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-dark">
              {cfg.statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            {(module.amountEnabled || module.key === "inventory") && <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={module.key === "inventory" ? "Cantidad / importe / stock" : "Importe"} type="number" className="input-dark" />}
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas internas, instrucciones, URL o detalle operativo" className="input-dark min-h-32" />
            <button onClick={() => createRecord(module.key, status || statusGroups[tab]?.[0] || cfg.statuses[0].value)} className="btn-primary"><Plus size={17} /> Guardar en {module.short}</button>
          </div>
        </GlassCard>
        <GlassCard title={`${tab} registrados`}>
          <RecordsList records={visibleRecords} deleteRecord={deleteRecord} />
        </GlassCard>
      </div>
    </section>
  );
}

function BillingModule({ records, appointments, revenue, expenses, manualIncome, title, setTitle, notes, setNotes, amount, setAmount, status, setStatus, createRecord, deleteRecord, activeTab, setActiveTab }: Parameters<typeof ModuleSection>[0]) {
  const [view, setView] = useState("Ingresos");
  useEffect(() => {
    syncModuleSubmenu(activeTab, "module:facturacion:", { ingresos: "Ingresos", gastos: "Gastos", proveedores: "Proveedores", presupuestos: "Presupuestos" }, setView);
  }, [activeTab]);
  useEffect(() => {
    const nextStatus = view === "Gastos" ? "expense" : view === "Proveedores" ? "supplier" : view === "Presupuestos" ? "budget" : "income";
    setStatus(nextStatus);
  }, [view, setStatus]);
  const profit = revenue + manualIncome - expenses;
  const viewStatus = view === "Gastos" ? "expense" : view === "Proveedores" ? "supplier" : view === "Presupuestos" ? "budget" : "income";
  const viewRecords = records.filter((record) => view === "Ingresos" ? record.status === "income" : record.status === viewStatus);
  const suppliers = records.filter((r) => r.status === "supplier");
  return <section className="grid gap-6"><ModuleHero eyebrow="Finance OS" title="Facturación y control económico" description="Gestiona ingresos, gastos, proveedores y presupuestos desde el submenú lateral. Cada sección filtra y prepara el formulario correcto automáticamente." actions={<ModulePillTabs tabs={["Ingresos", "Gastos", "Proveedores", "Presupuestos"]} active={view} setActive={(next) => selectModuleSubmenu(setActiveTab, ({ Ingresos: "module:facturacion:ingresos", Gastos: "module:facturacion:gastos", Proveedores: "module:facturacion:proveedores", Presupuestos: "module:facturacion:presupuestos" } as Record<string, ActiveTab>)[next] || "module:facturacion:ingresos", setView, next)} />} /><div className="grid gap-4 md:grid-cols-4"><Metric icon={<Receipt />} label="Reservas cobradas" value={`${revenue.toFixed(2)}€`} helper="Automático" /><Metric icon={<TrendingUp />} label="Ingresos manuales" value={`${manualIncome.toFixed(2)}€`} helper="Añadidos" /><Metric icon={<CreditCard />} label="Gastos" value={`${expenses.toFixed(2)}€`} helper="Manuales" /><Metric icon={<FileText />} label="Resultado" value={`${profit.toFixed(2)}€`} helper="Estimado" /></div><section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]"><GlassCard title={`Nuevo registro · ${view}`}><div className="grid gap-3"><select value={status} onChange={(e) => setStatus(e.target.value)} className="input-dark"><option value="income">Ingreso manual</option><option value="expense">Gasto</option><option value="supplier">Proveedor</option><option value="budget">Presupuesto</option></select><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={view === "Proveedores" ? "Proveedor / factura" : view === "Presupuestos" ? "Presupuesto para cliente" : view === "Gastos" ? "Concepto de gasto" : "Concepto de ingreso"} className="input-dark" /><input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Importe" type="number" className="input-dark" /><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas, vencimiento, cliente, método de pago o responsable" className="input-dark min-h-32" /><button onClick={() => createRecord("billing", status || viewStatus)} className="btn-primary"><Plus size={17} /> Guardar {view.toLowerCase()}</button></div></GlassCard><GlassCard title={`${view} registrados`}><div className="grid gap-3 md:grid-cols-3"><InfoBox label="Mostrados" value={viewRecords.length} /><InfoBox label="Proveedores" value={suppliers.length} /><InfoBox label="Total módulo" value={records.length} /></div><div className="mt-5"><RecordsList records={viewRecords} deleteRecord={deleteRecord} /></div></GlassCard></section></section>;
}

function PosModule({ records, services, title, setTitle, notes, setNotes, amount, setAmount, status, setStatus, createRecord, deleteRecord, activeTab, setActiveTab }: Parameters<typeof ModuleSection>[0]) {
  const [view, setView] = useState("Nuevo ticket");
  useEffect(() => {
    syncModuleSubmenu(activeTab, "module:tpv:", { ticket: "Nuevo ticket", caja: "Caja", historial: "Historial" }, setView);
  }, [activeTab]);
  const total = records.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const cash = records.filter((r) => r.status === "cash").reduce((s, r) => s + Number(r.amount || 0), 0);
  const card = records.filter((r) => r.status === "card").reduce((s, r) => s + Number(r.amount || 0), 0);
  return <section className="grid gap-6"><ModuleHero eyebrow="Retail OS" title="TPV y caja operativa" description="El submenú lateral cambia entre creación de ticket, lectura de caja e historial para que el TPV tenga navegación real." actions={<ModulePillTabs tabs={["Nuevo ticket", "Caja", "Historial"]} active={view} setActive={(next) => selectModuleSubmenu(setActiveTab, ({ "Nuevo ticket": "module:tpv:ticket", Caja: "module:tpv:caja", Historial: "module:tpv:historial" } as Record<string, ActiveTab>)[next] || "module:tpv:ticket", setView, next)} />} /><div className="grid gap-4 md:grid-cols-4"><Metric icon={<Store />} label="Caja total" value={`${total.toFixed(2)}€`} helper="Tickets" /><Metric icon={<CreditCard />} label="Tarjeta" value={`${card.toFixed(2)}€`} helper="TPV" /><Metric icon={<Receipt />} label="Efectivo" value={`${cash.toFixed(2)}€`} helper="Caja" /><Metric icon={<Scissors />} label="Servicios" value={services.length} helper="Catálogo" /></div>{view === "Nuevo ticket" && <section className="grid gap-6 xl:grid-cols-[.75fr_1.25fr]"><GlassCard title="Nuevo ticket TPV"><div className="grid gap-3"><select value={status} onChange={(e) => setStatus(e.target.value)} className="input-dark"><option value="card">Tarjeta</option><option value="cash">Efectivo</option><option value="bizum">Bizum</option><option value="mixed">Mixto</option></select><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ticket: Corte + producto" className="input-dark" /><input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Total ticket" type="number" className="input-dark" /><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Productos, descuentos, empleado o notas de caja" className="input-dark min-h-32" /><button onClick={() => createRecord("pos", status)} className="btn-primary"><Plus size={17} /> Cobrar y guardar ticket</button></div></GlassCard><GlassCard title="Artículos rápidos"><div className="grid gap-3 md:grid-cols-3">{services.slice(0, 6).map((s) => <div key={s.id} className="rounded-2xl bg-black/25 p-4"><p className="font-medium">{s.name}</p><p className="text-sm text-white/45">{Number(s.price).toFixed(2)}€</p></div>)}</div></GlassCard></section>}{view === "Caja" && <GlassCard title="Resumen de caja"><div className="grid gap-3 md:grid-cols-3"><InfoBox label="Total" value={`${total.toFixed(2)}€`} /><InfoBox label="Efectivo" value={`${cash.toFixed(2)}€`} /><InfoBox label="Tarjeta" value={`${card.toFixed(2)}€`} /></div><div className="mt-5"><RecordsList records={records.slice(0, 12)} deleteRecord={deleteRecord} /></div></GlassCard>}{view === "Historial" && <GlassCard title="Historial de tickets"><RecordsList records={records} deleteRecord={deleteRecord} /></GlassCard>}</section>;
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
  activeTab,
  setActiveTab,
}: Parameters<typeof ModuleSection>[0]) {
  const [crmView, setCrmView] = useState("Ficha 360");

  useEffect(() => {
    syncModuleSubmenu(activeTab, "module:crm:", {
      ficha: "Ficha 360",
      agenda: "Agenda CRM",
      pipeline: "Pipeline",
      hoy: "Hoy",
      automatizaciones: "Automatizaciones",
    }, setCrmView);
  }, [activeTab]);
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
  const [documentType, setDocumentType] = useState("general");
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
    const searchable = `${customerName(c)} ${c.phone || ""} ${c.email || ""} ${c.document_number || ""} ${c.document_type || ""} ${c.eps || ""} ${c.crm_status || ""} ${c.notes || ""} ${c.address || ""} ${c.responsible_name || ""}`.toLowerCase();
    const search = crmSearch.toLowerCase().trim();
    const matchesSearch = !search || searchable.includes(search);
    const matchesStatus = crmStatusFilter === "all" || (c.crm_status || "nuevo") === crmStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedCustomer = customers.find((customer) => customer.id === selectedCrmCustomerId) || filtered[0] || null;

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
    setDetailNextFollowUp(selectedCustomer.next_follow_up_at ? selectedCustomer.next_follow_up_at.slice(0, 16) : "");
  }, [selectedCustomer?.id]);

  const customerAppointments = selectedCustomer
    ? appointments.filter((appointment) => {
        const related = firstRelation(appointment.customers);
        return appointment.customer_id === selectedCustomer.id || customerName(related).toLowerCase() === customerName(selectedCustomer).toLowerCase();
      })
    : [];

  const customerRecords = selectedCustomer
    ? records.filter((record) => record.customer_id === selectedCustomer.id || (record.notes || "").includes(selectedCustomer.id))
    : [];

  const customerDocs = selectedCustomer ? clinicalDocuments.filter((document) => document.customer_id === selectedCustomer.id) : [];
  const customerMessages = selectedCustomer ? whatsappMessages.filter((message) => message.customer_id === selectedCustomer.id || normalizePhone(message.phone).endsWith(normalizePhone(selectedCustomer.phone).slice(-9))) : [];
  const customerReminders = selectedCustomer ? crmReminders.filter((reminder) => reminderCustomerId(reminder) === selectedCustomer.id).sort((a, b) => reminderTime(a) - reminderTime(b)) : [];

  const activeCustomers = customers.filter((customer) => !["cerrado", "perdido", "alta"].includes(customer.crm_status || "nuevo")).length;
  const pendingFollowups = records.filter((record) => ["followup", "pendiente", "opportunity"].includes(record.status || "")).length;
  const scheduled = appointments.filter((appointment) => appointment.status !== "cancelled").length;
  const dueReminders = crmReminders.filter((reminder) => (reminder.status || "pending") === "pending" && reminderTime(reminder) <= Date.now()).length;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const todayAppointments = appointments.filter((appointment) => {
    const time = new Date(appointmentDate(appointment)).getTime();
    return time >= todayStart.getTime() && time < todayEnd.getTime();
  });
  const todayReminders = crmReminders.filter((reminder) => {
    const time = reminderTime(reminder);
    return (reminder.status || "pending") === "pending" && time >= todayStart.getTime() && time < todayEnd.getTime();
  });
  const noFollowUpCustomers = customers.filter((customer) => !customer.next_follow_up_at && !["alta", "perdido", "cerrado"].includes(customer.crm_status || "nuevo"));

  const statusCounts = crmStatusOptions.map((option) => ({
    ...option,
    count: customers.filter((customer) => (customer.crm_status || "nuevo") === option.value).length,
  }));

  const saveAction = async () => {
    if (!selectedCustomer) return alert("Selecciona un cliente");
    await createCrmAction(
      selectedCustomer.id,
      crmActionTitle || `Seguimiento · ${customerName(selectedCustomer)}`,
      [
        crmActionNotes,
        `Cliente: ${customerName(selectedCustomer)}`,
        `Teléfono: ${selectedCustomer.phone || "Sin teléfono"}`,
        selectedCustomer.eps ? `Segmento/EPS: ${epsLabel(selectedCustomer.eps)}` : "",
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
    if (!selectedCustomer) return alert("Selecciona un cliente");
    await createAppointmentForCustomer(selectedCustomer.id, crmAppointmentEmployee, crmAppointmentService, crmAppointmentDate);
    setCrmAppointmentEmployee("");
    setCrmAppointmentService("");
    setCrmAppointmentDate("");
  };

  const saveReminder = async () => {
    if (!selectedCustomer) return alert("Selecciona un cliente");
    await saveCrmReminder(selectedCustomer.id, reminderTitle || `Recordatorio · ${customerName(selectedCustomer)}`, reminderAt, reminderNotes);
    setReminderTitle("");
    setReminderNotes("");
    setReminderAt("");
  };

  const primaryTemplate = whatsappTemplatesEffective[0];
  const selectedLastAppointment = customerAppointments.slice().sort((a, b) => new Date(appointmentDate(b)).getTime() - new Date(appointmentDate(a)).getTime())[0];
  const selectedNextAppointment = customerAppointments.slice().sort((a, b) => new Date(appointmentDate(a)).getTime() - new Date(appointmentDate(b)).getTime()).find((appointment) => new Date(appointmentDate(appointment)).getTime() >= Date.now());
  const selectedNextReminder = customerReminders.find((reminder) => (reminder.status || "pending") === "pending");
  const crmWeekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(todayStart);
    date.setDate(todayStart.getDate() + index);
    const end = new Date(date);
    end.setDate(date.getDate() + 1);
    return {
      date,
      appointments: appointments.filter((appointment) => {
        const time = new Date(appointmentDate(appointment)).getTime();
        return time >= date.getTime() && time < end.getTime();
      }),
      reminders: crmReminders.filter((reminder) => {
        const time = reminderTime(reminder);
        return (reminder.status || "pending") === "pending" && time >= date.getTime() && time < end.getTime();
      }),
    };
  });
  const next7Appointments = crmWeekDays.flatMap((day) => day.appointments).length;
  const urgentCustomers = customers.filter((customer) => {
    const status = customer.crm_status || "nuevo";
    return ["nuevo", "contactado", "pendiente_documentacion", "pendiente_cita", "en_llamada"].includes(status) || !customer.next_follow_up_at;
  });
  const selectedHealthScore = selectedCustomer
    ? Math.min(100,
        18 +
        (selectedCustomer.phone ? 12 : 0) +
        (selectedCustomer.email ? 10 : 0) +
        (selectedCustomer.document_number ? 12 : 0) +
        (selectedCustomer.crm_status && selectedCustomer.crm_status !== "nuevo" ? 12 : 0) +
        (selectedNextAppointment ? 14 : 0) +
        (selectedNextReminder || selectedCustomer.next_follow_up_at ? 12 : 0) +
        (customerMessages.length ? 5 : 0) +
        (customerDocs.length ? 5 : 0))
    : 0;
  const crmPlaybook = selectedCustomer ? [
    { label: "Datos de contacto", done: Boolean(selectedCustomer.phone || selectedCustomer.email) },
    { label: "Documento o identificación", done: Boolean(selectedCustomer.document_number) },
    { label: "Estado CRM definido", done: Boolean(selectedCustomer.crm_status && selectedCustomer.crm_status !== "nuevo") },
    { label: "Próximo seguimiento", done: Boolean(selectedNextReminder || selectedCustomer.next_follow_up_at) },
    { label: "Cita o acción agendada", done: Boolean(selectedNextAppointment || customerRecords.length) },
  ] : [];
  const suggestedActions = selectedCustomer ? [
    { title: "Llamar y clasificar necesidad", notes: `Llamar a ${customerName(selectedCustomer)} para validar interés, urgencia y siguiente paso.`, status: "followup" },
    { title: "Enviar WhatsApp de seguimiento", notes: `Enviar plantilla personalizada a ${customerName(selectedCustomer)} y registrar respuesta.`, status: "pendiente" },
    { title: "Agendar cita / demo", notes: `Buscar disponibilidad y dejar cita confirmada para ${customerName(selectedCustomer)}.`, status: "opportunity" },
    { title: "Solicitar documentación pendiente", notes: `Pedir documento, autorización o información pendiente a ${customerName(selectedCustomer)}.`, status: "pendiente_documentacion" },
  ] : [];

  return (
    <section className="grid gap-6">
      <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(124,58,237,.22),transparent_36%),linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.025))] p-6 shadow-2xl shadow-black/30">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">Flowly CRM Command Center</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Clientes, agenda, WhatsApp y seguimiento en una ficha 360º.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62">Un CRM operativo para negocios modernos: pipeline, tareas, recordatorios, documentos, llamadas, WhatsApp y decisiones rápidas desde una sola pantalla.</p>
          </div>
          <ModulePillTabs tabs={["Ficha 360", "Agenda CRM", "Pipeline", "Hoy", "Automatizaciones"]} active={crmView} setActive={(tab) => selectModuleSubmenu(setActiveTab, ({ "Ficha 360": "module:crm:ficha", "Agenda CRM": "module:crm:agenda", Pipeline: "module:crm:pipeline", Hoy: "module:crm:hoy", Automatizaciones: "module:crm:automatizaciones" } as Record<string, ActiveTab>)[tab] || "module:crm:ficha", setCrmView, tab)} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Metric icon={<Users />} label="Clientes CRM" value={customers.length} helper="Base total" />
        <Metric icon={<UserCog />} label="Activos" value={activeCustomers} helper="En gestión" />
        <Metric icon={<CheckCircle2 />} label="Seguimientos" value={pendingFollowups} helper="Acciones abiertas" />
        <Metric icon={<CalendarDays />} label="Citas" value={scheduled} helper={`${next7Appointments} próximos 7 días`} />
        <Metric icon={<Clock />} label="Alertas" value={dueReminders} helper="Vencidas ahora" />
      </div>

      {incomingVoiceCall && (
        <div className="rounded-[2rem] border border-green-300/25 bg-green-500/15 p-5 shadow-xl shadow-green-950/20">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-200">Llamada activa detectada</p>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <InfoBox label="Teléfono" value={incomingVoiceCall.caller_phone} />
            <InfoBox label="Motivo" value={translateIntent(incomingVoiceCall.eps || incomingVoiceCall.intent || "informacion")} />
            <InfoBox label="Documento" value={translateDocumentType(incomingVoiceCall.document_type || "") || "No indicado"} />
            <InfoBox label="ID" value={incomingVoiceCall.document_number || "No indicado"} />
          </div>
        </div>
      )}

      {crmView === "Agenda CRM" && (
        <section className="grid gap-6 xl:grid-cols-[1.45fr_.55fr]">
          <GlassCard title="Agenda CRM · próximos 7 días">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
              {crmWeekDays.map((day) => (
                <div key={day.date.toISOString()} className="min-h-56 rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">{day.date.toLocaleDateString("es-ES", { weekday: "short" })}</p>
                  <p className="mt-1 text-2xl font-semibold">{day.date.getDate()}</p>
                  <div className="mt-4 space-y-2">
                    {day.appointments.slice(0, 4).map((appointment) => {
                      const customer = firstRelation(appointment.customers);
                      const service = firstRelation(appointment.services);
                      return (
                        <button key={appointment.id} onClick={() => { if (appointment.customer_id) { setSelectedCrmCustomerId(appointment.customer_id); setCrmView("Ficha 360"); } }} className="w-full rounded-2xl bg-cyan-400/10 p-3 text-left hover:bg-cyan-400/15">
                          <p className="truncate text-xs font-semibold text-cyan-100">{new Date(appointmentDate(appointment)).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} · {customerName(customer)}</p>
                          <p className="mt-1 truncate text-[11px] text-white/45">{service?.name || "Cita CRM"}</p>
                        </button>
                      );
                    })}
                    {day.reminders.slice(0, 3).map((reminder) => (
                      <button key={reminder.id} onClick={() => { const id = reminderCustomerId(reminder); if (id) { setSelectedCrmCustomerId(id); setCrmView("Ficha 360"); } }} className="w-full rounded-2xl bg-amber-400/10 p-3 text-left hover:bg-amber-400/15">
                        <p className="truncate text-xs font-semibold text-amber-100">{new Date(reminderTime(reminder)).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} · {reminder.title}</p>
                        <p className="mt-1 truncate text-[11px] text-white/45">{reminderCustomerName(reminder, customers)}</p>
                      </button>
                    ))}
                    {!day.appointments.length && !day.reminders.length && <p className="rounded-2xl border border-dashed border-white/10 p-3 text-center text-[11px] text-white/35">Libre</p>}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
          <div className="grid gap-6">
            <GlassCard title="Agenda inteligente">
              <div className="space-y-3">
                <InfoBox label="Citas 7 días" value={next7Appointments} />
                <InfoBox label="Alertas abiertas" value={crmWeekDays.flatMap((day) => day.reminders).length} />
                <InfoBox label="Clientes urgentes" value={urgentCustomers.length} />
              </div>
            </GlassCard>
            <GlassCard title="Prioridad comercial">
              <div className="space-y-3">
                {urgentCustomers.slice(0, 8).map((customer) => (
                  <button key={customer.id} onClick={() => { setSelectedCrmCustomerId(customer.id); setCrmView("Ficha 360"); }} className="w-full rounded-2xl border border-white/10 bg-white/[0.055] p-3 text-left hover:bg-white/[0.09]">
                    <p className="truncate font-semibold">{customerName(customer)}</p>
                    <p className="mt-1 truncate text-xs text-white/45">{translateCrmStatus(customer.crm_status || "nuevo")} · {customer.phone || "Sin teléfono"}</p>
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>
        </section>
      )}

      {crmView === "Automatizaciones" && (
        <section className="grid gap-6 xl:grid-cols-[.7fr_1.3fr]">
          <GlassCard title="Motor CRM">
            <p className="text-sm leading-6 text-white/55">Playbooks operativos para que ningún lead se quede sin seguimiento. Estas reglas convierten el CRM en agenda de trabajo diaria.</p>
            <div className="mt-5 grid gap-3">
              {[
                { title: "Nuevo lead sin teléfono", body: "Solicitar contacto válido antes de avanzar de etapa." },
                { title: "Pendiente documentación", body: "Crear alarma y WhatsApp automático de solicitud." },
                { title: "Cita creada", body: "Registrar confirmación y seguimiento post-cita." },
                { title: "Lead sin próximo paso", body: "Enviar a la cola de prioridad del día." },
              ].map((rule) => (
                <div key={rule.title} className="rounded-3xl border border-white/10 bg-white/[0.055] p-4">
                  <p className="font-semibold">{rule.title}</p>
                  <p className="mt-1 text-sm leading-6 text-white/48">{rule.body}</p>
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard title="Centro de mando de seguimiento">
            <div className="grid gap-4 md:grid-cols-2">
              {crmStatusOptions.filter((status) => status.value !== "en_llamada").map((status) => {
                const list = customers.filter((customer) => (customer.crm_status || "nuevo") === status.value);
                return (
                  <div key={status.value} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{status.label}</p>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/65">{list.length}</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {list.slice(0, 4).map((customer) => (
                        <button key={customer.id} onClick={() => { setSelectedCrmCustomerId(customer.id); setCrmView("Ficha 360"); }} className="w-full rounded-2xl bg-white/[0.055] p-3 text-left hover:bg-white/[0.09]">
                          <p className="truncate text-sm font-semibold">{customerName(customer)}</p>
                          <p className="mt-1 truncate text-xs text-white/42">{customer.next_follow_up_at ? `Próximo paso ${new Date(customer.next_follow_up_at).toLocaleDateString("es-ES")}` : "Sin próximo paso"}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </section>
      )}

      {crmView === "Pipeline" && (
        <section className="grid gap-4 xl:grid-cols-4">
          {statusCounts.filter((status) => status.value !== "en_llamada" || status.count > 0).map((status) => {
            const items = customers.filter((customer) => (customer.crm_status || "nuevo") === status.value).slice(0, 8);
            return (
              <div key={status.value} className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-black/20">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{status.label}</p>
                    <p className="text-xs text-white/45">{status.count} clientes</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">{status.count}</span>
                </div>
                <div className="space-y-3">
                  {items.map((customer) => (
                    <button key={customer.id} onClick={() => { setSelectedCrmCustomerId(customer.id); setCrmView("Ficha 360"); }} className="w-full rounded-2xl border border-white/10 bg-black/25 p-3 text-left hover:bg-white/[0.08]">
                      <p className="truncate font-semibold">{customerName(customer)}</p>
                      <p className="mt-1 truncate text-xs text-white/45">{customer.phone || customer.email || "Sin contacto"}</p>
                      <p className="mt-2 text-xs text-cyan-200">{customer.next_follow_up_at ? `Próx. seguimiento ${new Date(customer.next_follow_up_at).toLocaleDateString("es-ES")}` : "Sin seguimiento"}</p>
                    </button>
                  ))}
                  {!items.length && <p className="rounded-2xl border border-dashed border-white/10 p-4 text-center text-xs text-white/35">Sin clientes en esta etapa.</p>}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {crmView === "Hoy" && (
        <section className="grid gap-6 xl:grid-cols-3">
          <GlassCard title="Agenda de hoy">
            <div className="space-y-3">
              {todayAppointments.map((appointment) => {
                const customer = firstRelation(appointment.customers);
                const service = firstRelation(appointment.services);
                return <div key={appointment.id} className="rounded-2xl bg-white/[0.06] p-4"><p className="font-semibold">{customerName(customer)}</p><p className="mt-1 text-sm text-white/50">{new Date(appointmentDate(appointment)).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} · {service?.name || "Servicio"}</p></div>;
              })}
              {!todayAppointments.length && <Empty text="No hay citas para hoy." />}
            </div>
          </GlassCard>
          <GlassCard title="Recordatorios de hoy">
            <div className="space-y-3">
              {todayReminders.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} customers={customers} completeReminder={completeCrmReminder} deleteReminder={deleteCrmReminder} compact />)}
              {!todayReminders.length && <Empty text="No hay recordatorios pendientes hoy." />}
            </div>
          </GlassCard>
          <GlassCard title="Clientes sin seguimiento">
            <div className="space-y-3">
              {noFollowUpCustomers.slice(0, 8).map((customer) => <button key={customer.id} onClick={() => { setSelectedCrmCustomerId(customer.id); setCrmView("Ficha 360"); }} className="w-full rounded-2xl bg-white/[0.06] p-4 text-left hover:bg-white/[0.09]"><p className="font-semibold">{customerName(customer)}</p><p className="mt-1 text-sm text-white/45">{translateCrmStatus(customer.crm_status || "nuevo")}</p></button>)}
              {!noFollowUpCustomers.length && <Empty text="Todos los clientes activos tienen próximo paso." />}
            </div>
          </GlassCard>
        </section>
      )}

      {crmView === "Ficha 360" && (
        <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <GlassCard title="Base de clientes">
            <div className="grid gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-white/35" size={18} />
                <input value={crmSearch} onChange={(e) => setCrmSearch(e.target.value)} placeholder="Buscar por nombre, teléfono, documento, estado, responsable o notas" className="input-dark pl-11" />
              </div>
              <select value={crmStatusFilter} onChange={(e) => setCrmStatusFilter(e.target.value)} className="input-dark">
                <option value="all">Todos los estados</option>
                {crmStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className="mt-4 max-h-[820px] space-y-3 overflow-y-auto pr-1">
              {filtered.slice(0, 90).map((customer) => {
                const isSelected = selectedCustomer?.id === customer.id;
                const nextReminder = crmReminders.find((reminder) => reminderCustomerId(reminder) === customer.id && (reminder.status || "pending") === "pending");
                return (
                  <button key={customer.id} onClick={() => setSelectedCrmCustomerId(customer.id)} className={`w-full rounded-3xl border p-4 text-left transition ${isSelected ? "border-cyan-300/45 bg-cyan-500/15 shadow-lg shadow-cyan-950/20" : "border-white/10 bg-white/[0.045] hover:bg-white/[0.075]"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{customerName(customer)}</p>
                        <p className="mt-1 truncate text-sm text-white/48">{customer.phone || customer.email || "Sin contacto"}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-violet-400/15 px-3 py-1 text-[11px] text-violet-100">{translateCrmStatus(customer.crm_status || "nuevo")}</span>
                          {customer.eps && <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-[11px] text-cyan-100">{epsLabel(customer.eps)}</span>}
                          {nextReminder && <span className="rounded-full bg-amber-400/15 px-3 py-1 text-[11px] text-amber-100">Alarma</span>}
                        </div>
                      </div>
                      {customer.document_number && <span className="shrink-0 rounded-full bg-black/25 px-3 py-1 text-xs text-white/60">ID</span>}
                    </div>
                  </button>
                );
              })}
              {!filtered.length && <Empty text="No hay clientes que coincidan con la búsqueda." />}
            </div>
          </GlassCard>

          <div className="grid gap-6">
            {!selectedCustomer ? (
              <GlassCard title="Ficha CRM"><Empty text="Selecciona un cliente para abrir su ficha 360º." /></GlassCard>
            ) : (
              <>
                <GlassCard>
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Ficha 360º</p>
                      <h3 className="mt-2 break-words text-3xl font-semibold">{customerName(selectedCustomer)}</h3>
                      <p className="mt-2 break-words text-sm text-white/55">{selectedCustomer.phone || "Sin teléfono"} · {selectedCustomer.email || "Sin email"}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs text-violet-100">{translateCrmStatus(selectedCustomer.crm_status || "nuevo")}</span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/65">{selectedCustomer.document_number || "Sin documento"}</span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/65">Responsable: {selectedCustomer.responsible_name || "Sin asignar"}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openWhatsappForCustomer(selectedCustomer, primaryTemplate?.message || "Hola {nombre}")} className="btn-primary"><MessageCircle size={17} /> WhatsApp</button>
                      <button onClick={() => setReminderTitle(`Llamar a ${customerName(selectedCustomer)}`)} className="btn-secondary"><Clock size={17} /> Recordatorio</button>
                      <button onClick={() => setCrmActionTitle(`Seguimiento · ${customerName(selectedCustomer)}`)} className="btn-secondary"><Plus size={17} /> Tarea</button>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-5">
                    <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">Score CRM</p>
                      <div className="mt-3 flex items-end gap-2">
                        <span className="text-3xl font-semibold text-cyan-50">{selectedHealthScore}</span>
                        <span className="pb-1 text-sm text-white/45">/100</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-300" style={{ width: `${selectedHealthScore}%` }} /></div>
                    </div>
                    <InfoBox label="Próxima cita" value={selectedNextAppointment ? new Date(appointmentDate(selectedNextAppointment)).toLocaleString("es-ES") : "Sin cita"} />
                    <InfoBox label="Próximo recordatorio" value={selectedNextReminder ? formatReminderDate(selectedNextReminder) : "Sin alarma"} />
                    <InfoBox label="Última cita" value={selectedLastAppointment ? new Date(appointmentDate(selectedLastAppointment)).toLocaleDateString("es-ES") : "Sin historial"} />
                    <InfoBox label="Actividad" value={`${customerRecords.length + customerMessages.length + customerDocs.length} eventos`} />
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-5">
                    {crmPlaybook.map((step) => (
                      <div key={step.label} className={`rounded-2xl border p-3 ${step.done ? "border-green-300/20 bg-green-400/10" : "border-white/10 bg-white/[0.045]"}`}>
                        <div className="flex items-center gap-2">
                          <span className={`flex h-6 w-6 items-center justify-center rounded-full ${step.done ? "bg-green-300 text-neutral-950" : "bg-white/10 text-white/45"}`}>{step.done ? <CheckCircle2 size={14} /> : <Clock size={14} />}</span>
                          <p className="text-xs font-semibold text-white/70">{step.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <section className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
                  <div className="grid gap-6">
                    <GlassCard title="Datos comerciales y personales">
                      <div className="grid gap-3 md:grid-cols-2">
                        <input value={detailName} onChange={(e) => setDetailName(e.target.value)} placeholder="Nombre completo" className="input-dark" />
                        <input value={detailPhone} onChange={(e) => setDetailPhone(e.target.value)} placeholder="Teléfono" className="input-dark" />
                        <input value={detailEmail} onChange={(e) => setDetailEmail(e.target.value)} placeholder="Email" className="input-dark" />
                        <select value={detailEps} onChange={(e) => setDetailEps(e.target.value)} className="input-dark"><option value="">Segmento / EPS / tipo cliente</option>{EPS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                        <select value={detailDocumentType} onChange={(e) => setDetailDocumentType(e.target.value)} className="input-dark"><option value="">Tipo documento</option>{DOCUMENT_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                        <input value={detailDocumentNumber} onChange={(e) => setDetailDocumentNumber(e.target.value)} placeholder="Número de identificación" className="input-dark" />
                        <input value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} placeholder="Dirección" className="input-dark" />
                        <input value={detailResponsible} onChange={(e) => setDetailResponsible(e.target.value)} placeholder="Responsable / propietario / acudiente" className="input-dark" />
                        <select value={detailCrmStatus} onChange={(e) => setDetailCrmStatus(e.target.value)} className="input-dark">{crmStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                        <input type="datetime-local" value={detailNextFollowUp} onChange={(e) => setDetailNextFollowUp(e.target.value)} className="input-dark" title="Próximo seguimiento" />
                      </div>
                      <textarea value={detailNotes} onChange={(e) => setDetailNotes(e.target.value)} placeholder="Notas internas, objeciones, contexto, necesidades, autorizaciones y próximos pasos" className="input-dark mt-3 min-h-28" />
                      <button onClick={saveCustomerDetails} className="btn-primary mt-3"><CheckCircle2 size={17} /> Guardar ficha</button>
                    </GlassCard>

                    <GlassCard title="Timeline inteligente">
                      <div className="space-y-3">
                        {[
                          ...customerRecords.map((record) => ({ id: `r-${record.id}`, title: record.title, meta: `${record.status} · ${new Date(record.created_at).toLocaleString("es-ES")}`, body: record.notes, tone: "violet" })),
                          ...customerMessages.map((message) => ({ id: `w-${message.id}`, title: "WhatsApp enviado", meta: `${message.template_key || "manual"} · ${new Date(message.created_at).toLocaleString("es-ES")}`, body: message.message, tone: "green" })),
                          ...customerDocs.map((document) => ({ id: `d-${document.id}`, title: `Documento: ${document.title}`, meta: `${document.document_type || "archivo"} · ${new Date(document.created_at).toLocaleString("es-ES")}`, body: document.notes, tone: "cyan" })),
                          ...customerReminders.map((reminder) => ({ id: `m-${reminder.id}`, title: reminder.title, meta: `Recordatorio · ${formatReminderDate(reminder)}`, body: reminder.notes || reminder.description, tone: reminderTime(reminder) <= Date.now() ? "amber" : "white" })),
                        ].slice(0, 16).map((event) => (
                          <div key={event.id} className="relative rounded-2xl border border-white/10 bg-white/[0.055] p-4 pl-5">
                            <span className={`absolute left-0 top-5 h-8 w-1 rounded-r-full ${event.tone === "green" ? "bg-green-300" : event.tone === "cyan" ? "bg-cyan-300" : event.tone === "amber" ? "bg-amber-300" : "bg-violet-300"}`} />
                            <p className="font-semibold">{event.title}</p>
                            <p className="mt-1 text-xs text-white/45">{event.meta}</p>
                            {event.body && <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-white/55">{event.body}</p>}
                          </div>
                        ))}
                        {!customerRecords.length && !customerMessages.length && !customerDocs.length && !customerReminders.length && <Empty text="La actividad aparecerá aquí en cuanto haya citas, notas, documentos, recordatorios o WhatsApp." />}
                      </div>
                    </GlassCard>
                  </div>

                  <div className="grid gap-6">
                    <GlassCard title="Playbook recomendado">
                      <div className="space-y-3">
                        {suggestedActions.map((action) => (
                          <button key={action.title} onClick={() => { setCrmActionTitle(action.title); setCrmActionNotes(action.notes); }} className="w-full rounded-2xl border border-white/10 bg-white/[0.055] p-4 text-left hover:bg-white/[0.09]">
                            <p className="font-semibold">{action.title}</p>
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-white/48">{action.notes}</p>
                          </button>
                        ))}
                      </div>
                    </GlassCard>

                    <GlassCard title="Acciones rápidas">
                      <div className="grid gap-3">
                        <input value={crmActionTitle} onChange={(e) => setCrmActionTitle(e.target.value)} placeholder="Tarea: llamar, enviar propuesta, confirmar cita..." className="input-dark" />
                        <input type="datetime-local" value={crmActionDueDate} onChange={(e) => setCrmActionDueDate(e.target.value)} className="input-dark" />
                        <textarea value={crmActionNotes} onChange={(e) => setCrmActionNotes(e.target.value)} placeholder="Notas de la tarea" className="input-dark min-h-24" />
                        <button onClick={saveAction} className="btn-primary"><Plus size={17} /> Crear tarea CRM</button>
                      </div>
                    </GlassCard>

                    <GlassCard title="Recordatorio con alarma">
                      <div className="grid gap-3">
                        <input value={reminderTitle} onChange={(e) => setReminderTitle(e.target.value)} placeholder="Título del recordatorio" className="input-dark" />
                        <input type="datetime-local" value={reminderAt} onChange={(e) => setReminderAt(e.target.value)} className="input-dark" />
                        <textarea value={reminderNotes} onChange={(e) => setReminderNotes(e.target.value)} placeholder="Notas del recordatorio" className="input-dark min-h-20" />
                        <button onClick={saveReminder} className="btn-primary"><Clock size={17} /> Guardar alarma</button>
                      </div>
                    </GlassCard>

                    <GlassCard title="Agendar desde CRM">
                      <div className="grid gap-3">
                        <select value={crmAppointmentEmployee} onChange={(e) => setCrmAppointmentEmployee(e.target.value)} className="input-dark"><option value="">Profesional / responsable</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</select>
                        <select value={crmAppointmentService} onChange={(e) => setCrmAppointmentService(e.target.value)} className="input-dark"><option value="">Servicio / producto</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select>
                        <input type="datetime-local" value={crmAppointmentDate} onChange={(e) => setCrmAppointmentDate(e.target.value)} className="input-dark" />
                        <button onClick={scheduleFromCrm} className="btn-primary"><CalendarDays size={17} /> Crear cita</button>
                      </div>
                    </GlassCard>

                    <GlassCard title="WhatsApp CRM">
                      <div className="grid gap-2">
                        {whatsappTemplatesEffective.slice(0, 6).map((template) => <button key={template.key} onClick={() => { const msg = whatsappMessageForCustomer(template.message, selectedCustomer); saveWhatsappMessage(selectedCustomer.id, selectedCustomer.phone || "", template.key, msg); openWhatsappForCustomer(selectedCustomer, template.message); }} className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 text-left text-sm hover:bg-white/[0.09]"><span className="font-semibold">{template.label}</span><span className="mt-1 block line-clamp-2 text-xs text-white/45">{template.message}</span></button>)}
                        {!whatsappTemplatesEffective.length && <Empty text="Crea plantillas de WhatsApp para usarlas desde el CRM." />}
                      </div>
                    </GlassCard>

                    <GlassCard title="Documentos del cliente">
                      <div className="grid gap-3">
                        <input value={documentTitle} onChange={(e) => setDocumentTitle(e.target.value)} placeholder="Título del documento" className="input-dark" />
                        <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="input-dark"><option value="general">General</option><option value="contrato">Contrato</option><option value="imagen">Imagen</option><option value="pdf">PDF</option><option value="consentimiento">Consentimiento</option></select>
                        <textarea value={documentNotes} onChange={(e) => setDocumentNotes(e.target.value)} placeholder="Notas del documento" className="input-dark min-h-20" />
                        <label className="btn-secondary cursor-pointer justify-center"><FileText size={17} /> Subir archivo<input type="file" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (file) { await uploadClinicalDocument(selectedCustomer.id, file, documentTitle || file.name, documentType, documentNotes); setDocumentTitle(""); setDocumentType("general"); setDocumentNotes(""); } e.currentTarget.value = ""; }} /></label>
                      </div>
                      <div className="mt-4 space-y-2">
                        {customerDocs.slice(0, 5).map((document) => <a key={document.id} href={document.file_url || "#"} target="_blank" rel="noreferrer" className="block rounded-2xl border border-white/10 bg-white/[0.055] p-3 hover:bg-white/[0.09]"><p className="font-semibold">{document.title}</p><p className="mt-1 text-xs text-white/45">{document.document_type || "Documento"} · {new Date(document.created_at).toLocaleString("es-ES")}</p></a>)}
                        {!customerDocs.length && <Empty text="Sin documentos cargados." />}
                      </div>
                    </GlassCard>
                  </div>
                </section>
              </>
            )}
          </div>
        </section>
      )}
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
  const dueNow = reminders.filter((reminder) => reminderTime(reminder) <= Date.now()).length;
  return (
    <section className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={<Clock />} label="Próximos 7 días" value={reminders.length} helper="Recordatorios activos" />
        <Metric icon={<XCircle />} label="Vencidos" value={dueNow} helper="Requieren atención" />
        <Metric icon={<Users />} label="Pacientes" value={new Set(reminders.map((item) => reminderCustomerId(item)).filter(Boolean)).size} helper="Con alarma" />
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
  const isDue = reminderTime(reminder) <= Date.now();
  return (
    <div className={`rounded-2xl border ${isDue ? "border-amber-300/35 bg-amber-500/15" : "border-white/10 bg-white/[0.06]"} p-4`}>
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div className="min-w-0">
          <p className="break-words font-semibold">{reminder.title}</p>
          <p className="mt-1 text-sm text-white/55">{reminderCustomerName(reminder, customers)} · {formatReminderDate(reminder)}</p>
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

function ReminderAlarm({ reminder, customers, completeReminder, dismiss, viewCustomer }: { reminder: CrmReminder; customers: Customer[]; completeReminder: (id: string) => void; dismiss: () => void; viewCustomer: (customerId: string) => void }) {
  const customerId = reminderCustomerId(reminder);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-amber-300/30 bg-[#11111c] p-7 text-center shadow-2xl shadow-amber-950/40">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-100">
          <Clock size={30} />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">Recordatorio CRM</p>
        <h2 className="mt-3 break-words text-3xl font-semibold">{reminder.title}</h2>
        <p className="mt-2 text-white/60">{reminderCustomerName(reminder, customers)} · {formatReminderDate(reminder)}</p>
        {reminder.notes && <p className="mt-4 break-words rounded-2xl bg-white/[0.06] p-4 text-sm leading-6 text-white/65">{reminder.notes}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={() => completeReminder(reminder.id)} className="btn-primary">Marcar como hecho</button>
          {customerId && <button onClick={() => viewCustomer(customerId)} className="btn-secondary">Ver ficha</button>}
          <button onClick={dismiss} className="btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>
  );
}


function ModuleHero({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: React.ReactNode }) {
  return (
    <GlassCard>
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">{eyebrow}</p>
          <h2 className="mt-2 text-3xl font-semibold">{title}</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/55">{description}</p>
        </div>
        {actions}
      </div>
    </GlassCard>
  );
}

function ModulePillTabs({ tabs, active, setActive }: { tabs: string[]; active: string; setActive: (tab: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-[1.5rem] border border-white/10 bg-black/25 p-2">
      {tabs.map((tab) => (
        <button key={tab} onClick={() => setActive(tab)} className={active === tab ? "rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-950" : "rounded-full px-4 py-2 text-sm text-white/58 hover:bg-white/10 hover:text-white"}>{tab}</button>
      ))}
    </div>
  );
}

function syncModuleSubmenu(activeTab: ActiveTab, prefix: string, mapping: Record<string, string>, setTab: (tab: string) => void) {
  if (!activeTab.startsWith(prefix)) return;
  const key = activeTab.slice(prefix.length);
  const next = mapping[key];
  if (next) setTab(next);
}

function selectModuleSubmenu(setActiveTab: (tab: ActiveTab) => void, tab: ActiveTab, setLocalTab: (tab: string) => void, localTab: string) {
  setLocalTab(localTab);
  setActiveTab(tab);
}


const integrationBlueprints: Record<string, { key: string; category: string; oauth?: boolean; fields: { name: string; label: string; placeholder: string; secret?: boolean; required?: boolean }[] }> = {
  "Meta Ads": { key: "meta_ads", category: "marketing", oauth: true, fields: [{ name: "access_token", label: "Access token", placeholder: "Token de Meta Graph API", secret: true }, { name: "ad_account_id", label: "Ad Account ID", placeholder: "act_123456789" }, { name: "pixel_id", label: "Pixel ID", placeholder: "123456789" }, { name: "page_id", label: "Página Facebook", placeholder: "ID de página" }, { name: "instagram_id", label: "Instagram Business ID", placeholder: "ID de Instagram" }] },
  "Instagram / Facebook": { key: "meta_ads", category: "marketing", oauth: true, fields: [{ name: "access_token", label: "Access token", placeholder: "Token de Meta Graph API", secret: true }, { name: "ad_account_id", label: "Ad Account ID", placeholder: "act_123456789" }, { name: "pixel_id", label: "Pixel ID", placeholder: "123456789" }, { name: "page_id", label: "Página Facebook", placeholder: "ID de página" }, { name: "instagram_id", label: "Instagram Business ID", placeholder: "ID de Instagram" }] },
  "Google Ads": { key: "google_ads", category: "marketing", oauth: true, fields: [{ name: "access_token", label: "OAuth access token", placeholder: "Token OAuth Google", secret: true }, { name: "customer_id", label: "Customer ID", placeholder: "123-456-7890" }, { name: "developer_token", label: "Developer token", placeholder: "Google Ads developer token", secret: true }] },
  "Google Business Profile": { key: "google_business", category: "marketing", oauth: true, fields: [{ name: "access_token", label: "OAuth access token", placeholder: "Token OAuth Google", secret: true }, { name: "account_id", label: "Account ID", placeholder: "accounts/123" }, { name: "location_id", label: "Location ID", placeholder: "locations/456" }] },
  "Google Calendar": { key: "google_calendar", category: "agenda", oauth: true, fields: [{ name: "access_token", label: "OAuth access token", placeholder: "Token OAuth Google", secret: true }, { name: "calendar_id", label: "Calendar ID", placeholder: "primary o email del calendario" }] },
  "TikTok Ads": { key: "tiktok_ads", category: "marketing", fields: [{ name: "access_token", label: "Access token", placeholder: "Token TikTok Business", secret: true }, { name: "advertiser_id", label: "Advertiser ID", placeholder: "ID de anunciante" }, { name: "pixel_id", label: "Pixel ID", placeholder: "ID de pixel" }] },
  "WhatsApp": { key: "whatsapp_cloud", category: "whatsapp", fields: [{ name: "access_token", label: "Access token", placeholder: "Token permanente de Meta", secret: true, required: true }, { name: "phone_number_id", label: "Phone Number ID", placeholder: "ID del número de WhatsApp", required: true }, { name: "business_account_id", label: "Business Account ID", placeholder: "WABA ID" }, { name: "verify_token", label: "Verify token webhook", placeholder: "Token propio para webhook", secret: true }] },
  "WhatsApp Business": { key: "whatsapp_cloud", category: "whatsapp", fields: [{ name: "access_token", label: "Access token", placeholder: "Token permanente de Meta", secret: true, required: true }, { name: "phone_number_id", label: "Phone Number ID", placeholder: "ID del número de WhatsApp", required: true }, { name: "business_account_id", label: "Business Account ID", placeholder: "WABA ID" }, { name: "verify_token", label: "Verify token webhook", placeholder: "Token propio para webhook", secret: true }] },
  "Email": { key: "email_smtp", category: "email", fields: [{ name: "smtp_host", label: "SMTP host", placeholder: "smtp.tudominio.com", required: true }, { name: "smtp_port", label: "Puerto", placeholder: "587" }, { name: "smtp_user", label: "Usuario", placeholder: "usuario@dominio.com" }, { name: "smtp_password", label: "Contraseña", placeholder: "Contraseña SMTP", secret: true }, { name: "from_email", label: "Email emisor", placeholder: "hola@dominio.com" }] },
  "Gmail": { key: "gmail", category: "email", oauth: true, fields: [{ name: "access_token", label: "OAuth access token", placeholder: "Token OAuth Google", secret: true }, { name: "sender_email", label: "Email emisor", placeholder: "cuenta@gmail.com" }] },
  "Stripe / pagos": { key: "stripe", category: "payments", fields: [{ name: "secret_key", label: "Secret key", placeholder: "sk_live_...", secret: true, required: true }, { name: "webhook_secret", label: "Webhook secret", placeholder: "whsec_...", secret: true }, { name: "price_id", label: "Price ID por defecto", placeholder: "price_..." }] },
  "Stripe": { key: "stripe", category: "payments", fields: [{ name: "secret_key", label: "Secret key", placeholder: "sk_live_...", secret: true, required: true }, { name: "webhook_secret", label: "Webhook secret", placeholder: "whsec_...", secret: true }, { name: "price_id", label: "Price ID por defecto", placeholder: "price_..." }] },
  "OpenAI / proveedor IA": { key: "openai", category: "ai", fields: [{ name: "api_key", label: "API key", placeholder: "sk-...", secret: true, required: true }, { name: "model", label: "Modelo", placeholder: "gpt-4o-mini" }, { name: "monthly_limit", label: "Límite mensual", placeholder: "100000" }] },
  "Web del cliente": { key: "website_tracking", category: "web", fields: [{ name: "website_url", label: "URL web", placeholder: "https://tudominio.com", required: true }, { name: "tracking_id", label: "Tracking ID", placeholder: "GTM / pixel / Flowly ID" }, { name: "webhook_url", label: "Webhook destino", placeholder: "https://..." }] },
  "Landing / Pixel": { key: "website_tracking", category: "web", fields: [{ name: "website_url", label: "URL landing", placeholder: "https://..." }, { name: "tracking_id", label: "Pixel / GTM", placeholder: "ID de tracking" }, { name: "conversion_event", label: "Evento conversión", placeholder: "Lead, Purchase..." }] },
  "Centralita / Voice": { key: "voice", category: "voice", fields: [{ name: "provider", label: "Proveedor", placeholder: "Twilio, Vapi, Asterisk..." }, { name: "account_sid", label: "Account SID / ID", placeholder: "ID de cuenta" }, { name: "auth_token", label: "Auth token", placeholder: "Token secreto", secret: true }, { name: "phone_number", label: "Número conectado", placeholder: "+57..." }] },
  "Permisos CRM": { key: "ai_crm_permissions", category: "ai", fields: [{ name: "allowed_tables", label: "Tablas permitidas", placeholder: "customers, appointments, whatsapp_messages" }, { name: "max_history_days", label: "Días de histórico", placeholder: "90" }] },
  "Acciones seguras": { key: "ai_safe_actions", category: "ai", fields: [{ name: "require_confirmation", label: "Requiere confirmación", placeholder: "true" }, { name: "allowed_actions", label: "Acciones permitidas", placeholder: "send_whatsapp, create_task" }] },
  "Base de conocimiento": { key: "ai_knowledge_base", category: "ai", fields: [{ name: "storage_path", label: "Ruta documentos", placeholder: "knowledge/base" }, { name: "tone", label: "Tono", placeholder: "Profesional, cercano..." }] },
};

function integrationBlueprintFor(item: { name: string; detail: string; status?: string }) {
  return integrationBlueprints[item.name] || { key: item.name.toLowerCase().replace(/[^a-z0-9]+/g, "_"), category: "custom", fields: [{ name: "identifier", label: "Identificador", placeholder: "Usuario, URL, API key o identificador" }, { name: "webhook_url", label: "Webhook/API URL", placeholder: "https://..." }] };
}

function maskSecret(value: unknown) {
  const text = String(value || "");
  if (!text) return "";
  if (text.length <= 8) return "••••";
  return `${text.slice(0, 4)}••••${text.slice(-4)}`;
}

function IntegrationPanel({ items, business, integrations = [], reloadData }: { items: { name: string; status?: string; detail: string }[]; business?: Business | null; integrations?: BusinessIntegration[]; reloadData?: () => Promise<void> }) {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [formState, setFormState] = useState<Record<string, Record<string, string>>>({});
  const [notesState, setNotesState] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  const getIntegration = (providerKey: string) => integrations.find((item) => item.provider_key === providerKey);

  const saveConnection = async (item: { name: string; detail: string; status?: string }) => {
    const blueprint = integrationBlueprintFor(item);
    if (!business) return alert("No se ha cargado el negocio");
    const current = getIntegration(blueprint.key);
    const values = formState[blueprint.key] || {};
    const mergedConfig = { ...((current?.config as Record<string, unknown>) || {}), ...values };
    const missing = blueprint.fields.filter((field) => field.required && !String(mergedConfig[field.name] || "").trim());
    if (missing.length) return alert(`Faltan campos obligatorios: ${missing.map((field) => field.label).join(", ")}`);

    setSaving(blueprint.key);
    const payload = {
      business_id: business.id,
      provider_key: blueprint.key,
      provider_name: item.name,
      category: blueprint.category,
      status: "pending",
      config: mergedConfig,
      notes: notesState[blueprint.key] ?? current?.notes ?? null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("business_integrations").upsert(payload, { onConflict: "business_id,provider_key" });
    setSaving(null);
    if (error) return alert(error.message);
    await reloadData?.();
    setOpenItem(null);
    alert("Configuración guardada. Ahora pulsa Probar conexión para validarla con el proveedor.");
  };

  const testConnection = async (item: { name: string; detail: string; status?: string }) => {
    const blueprint = integrationBlueprintFor(item);
    const current = getIntegration(blueprint.key);
    if (!current) return alert("Guarda primero la configuración.");
    setTesting(blueprint.key);
    const res = await fetch("/api/integrations/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerKey: blueprint.key, config: current.config || {} }),
    });
    const result = await res.json().catch(() => ({ ok: false, error: "Respuesta no válida" }));
    await supabase.from("business_integrations").update({ status: result.ok ? "connected" : "error", last_checked_at: new Date().toISOString(), connected_at: result.ok ? new Date().toISOString() : current.connected_at || null }).eq("business_id", business?.id || "").eq("provider_key", blueprint.key);
    setTesting(null);
    await reloadData?.();
    alert(result.ok ? `Conexión validada: ${result.message || "OK"}` : `No se pudo validar: ${result.error || result.message || "Revisa credenciales"}`);
  };

  const disconnect = async (providerKey: string) => {
    if (!business) return;
    if (!confirm("¿Desconectar esta integración? Se conservará el registro pero quedará desactivado.")) return;
    const { error } = await supabase.from("business_integrations").update({ status: "disabled", updated_at: new Date().toISOString() }).eq("business_id", business.id).eq("provider_key", providerKey);
    if (error) return alert(error.message);
    await reloadData?.();
  };

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const blueprint = integrationBlueprintFor(item);
        const current = getIntegration(blueprint.key);
        const open = openItem === item.name;
        const status = current?.status || item.status || "pending";
        const isConnected = status === "connected";
        const config = (current?.config || {}) as Record<string, unknown>;
        return (
          <div key={item.name} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="mt-1 text-sm text-white/45">{item.detail}</p>
              </div>
              <span className={isConnected ? "rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100" : status === "error" ? "rounded-full border border-red-300/20 bg-red-400/10 px-3 py-1 text-xs text-red-100" : "rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100"}>{isConnected ? "Conectado" : status === "error" ? "Error" : "Pendiente"}</span>
            </div>
            {current?.last_checked_at && <p className="mt-3 text-xs text-white/38">Última validación: {new Date(current.last_checked_at).toLocaleString("es-ES")}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {blueprint.oauth && business && <a href={`/api/integrations/connect/${blueprint.key}?businessId=${business.id}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-950">Conectar OAuth</a>}
              <button onClick={() => setOpenItem(open ? null : item.name)} className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-white/70 hover:bg-white/10">{open ? "Cerrar" : current ? "Editar" : "Configurar"}</button>
              {current && <button onClick={() => testConnection(item)} disabled={testing === blueprint.key} className="rounded-full border border-cyan-300/20 px-4 py-2 text-sm text-cyan-100 disabled:opacity-50">{testing === blueprint.key ? "Probando..." : "Probar"}</button>}
            </div>
            {open && (
              <div className="mt-4 grid gap-3 rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-4">
                {blueprint.fields.map((field) => (
                  <label key={field.name} className="grid gap-1 text-xs font-medium text-white/65">
                    {field.label}{field.required ? " *" : ""}
                    <input
                      className="input-dark"
                      type={field.secret ? "password" : "text"}
                      placeholder={field.secret && config[field.name] ? maskSecret(config[field.name]) : field.placeholder}
                      defaultValue={field.secret ? "" : String(config[field.name] || "")}
                      onChange={(e) => setFormState((state) => ({ ...state, [blueprint.key]: { ...(state[blueprint.key] || {}), [field.name]: e.target.value } }))}
                    />
                  </label>
                ))}
                <textarea defaultValue={current?.notes || ""} onChange={(e) => setNotesState((state) => ({ ...state, [blueprint.key]: e.target.value }))} className="input-dark min-h-24" placeholder="Notas internas, permisos, instrucciones del proveedor o uso previsto" />
                <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-xs leading-5 text-white/52">
                  Esta integración guarda credenciales por negocio y puede validarse con el proveedor. Para OAuth real añade las variables de entorno indicadas en el README del ZIP.
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => saveConnection(item)} disabled={saving === blueprint.key} className="btn-primary py-2 text-sm disabled:opacity-50"><CheckCircle2 size={16} /> {saving === blueprint.key ? "Guardando..." : "Guardar configuración"}</button>
                  {current && <button onClick={() => disconnect(blueprint.key)} className="btn-secondary py-2 text-sm">Desconectar</button>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MarketingModule({ business, integrations, reloadData, records, customers, title, setTitle, notes, setNotes, amount, setAmount, status, setStatus, createRecord, deleteRecord, activeTab, setActiveTab }: Parameters<typeof ModuleSection>[0]) {
  const [tab, setTab] = useState("Campañas");

  useEffect(() => {
    syncModuleSubmenu(activeTab, "module:marketing:", { campanas: "Campañas", canales: "Canales", audiencias: "Audiencias", calendario: "Calendario" }, setTab);
  }, [activeTab]);
  const budget = records.reduce((s, r) => s + Number(r.amount || 0), 0);
  const activeCampaigns = records.filter((r) => !["done", "paused"].includes(r.status)).length;
  const channels = ["Meta Ads", "Google Ads", "TikTok Ads", "WhatsApp", "Email", "Landing / Pixel"];
  return (
    <section className="grid gap-6">
      <ModuleHero eyebrow="Growth OS" title="Marketing conectado al negocio" description="Planifica campañas, controla presupuesto, define canales, prepara creatividades y deja listas las conexiones de redes para cada cliente." actions={<ModulePillTabs tabs={["Campañas", "Canales", "Audiencias", "Calendario"]} active={tab} setActive={(next) => selectModuleSubmenu(setActiveTab, ({ Campañas: "module:marketing:campanas", Canales: "module:marketing:canales", Audiencias: "module:marketing:audiencias", Calendario: "module:marketing:calendario" } as Record<string, ActiveTab>)[next] || "module:marketing:campanas", setTab, next)} />} />
      <div className="grid gap-4 md:grid-cols-4"><Metric icon={<Megaphone />} label="Campañas" value={records.length} helper="Totales" /><Metric icon={<CreditCard />} label="Presupuesto" value={`${budget.toFixed(2)}€`} helper="Planificado" /><Metric icon={<Users />} label="Audiencia CRM" value={customers.length} helper="Clientes" /><Metric icon={<CheckCircle2 />} label="Activas" value={activeCampaigns} helper="En marcha" /></div>
      {tab === "Campañas" && <section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]"><GlassCard title="Nueva campaña profesional"><div className="grid gap-3"><select value={status} onChange={(e) => setStatus(e.target.value)} className="input-dark"><option value="meta">Facebook / Instagram Ads</option><option value="google">Google Ads</option><option value="tiktok">TikTok Ads</option><option value="email">Email Marketing</option><option value="whatsapp">WhatsApp Campaign</option><option value="organic">Contenido orgánico</option></select><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Campaña: Reactivación clientes VIP" className="input-dark" /><input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Presupuesto estimado" type="number" className="input-dark" /><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Objetivo, público, oferta, fechas, creatividad, KPI principal y responsable" className="input-dark min-h-40" /><button onClick={() => createRecord("marketing", status)} className="btn-primary"><Plus size={17} /> Guardar campaña</button></div></GlassCard><GlassCard title="Pipeline de campañas"><RecordsList records={records} deleteRecord={deleteRecord} /></GlassCard></section>}
      {tab === "Canales" && <GlassCard title="Conexiones del cliente"><IntegrationPanel business={business} integrations={integrations} reloadData={reloadData} items={channels.map((name) => ({ name, detail: name.includes("Meta") ? "Página, Instagram, pixel y cuenta publicitaria" : name.includes("Google") ? "Google Business Profile, Ads y Analytics" : name.includes("TikTok") ? "Cuenta publicitaria, pixel y eventos" : name.includes("WhatsApp") ? "Plantillas, listas y campañas desde CRM" : name.includes("Email") ? "Dominio, listas y automatizaciones" : "UTMs, eventos y conversiones" }))} /></GlassCard>}
      {tab === "Audiencias" && <GlassCard title="Audiencias inteligentes"><div className="grid gap-3 md:grid-cols-3">{["Clientes nuevos", "Clientes sin cita 60 días", "VIP / mayor ticket", "Cumpleaños", "No asistieron", "Leads sin convertir"].map((x) => <div key={x} className="rounded-3xl bg-black/25 p-5"><p className="font-semibold">{x}</p><p className="mt-2 text-sm text-white/45">Segmento preparado desde CRM para campañas y WhatsApp.</p></div>)}</div></GlassCard>}
      {tab === "Calendario" && <GlassCard title="Calendario editorial"><div className="grid gap-3 md:grid-cols-4">{["Lunes: oferta", "Miércoles: contenido", "Viernes: remarketing", "Domingo: reporte"].map((x) => <div key={x} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5"><p className="font-semibold">{x}</p><p className="mt-2 text-sm text-white/45">Bloque operativo listo para automatizar.</p></div>)}</div></GlassCard>}
    </section>
  );
}

function AiModule({ business, integrations, reloadData, records, customers, appointments, revenue, title, setTitle, notes, setNotes, createRecord, deleteRecord, businessAvatar, activeTab, setActiveTab }: Parameters<typeof ModuleSection>[0]) {
  const [tab, setTab] = useState("Copiloto");

  useEffect(() => {
    syncModuleSubmenu(activeTab, "module:ia:", { copiloto: "Copiloto", asistente: "Copiloto", insights: "Copiloto", automatizaciones: "Automatizaciones", prompts: "Prompts", conectores: "Conectores" }, setTab);
  }, [activeTab]);
  const occupancySignal = appointments.length ? "Datos suficientes" : "Necesita agenda";
  return (
    <section className="grid gap-6">
      <ModuleHero eyebrow="Flowly Intelligence" title="IA operativa para dirección" description={businessAvatar?.avatar_name ? `${businessAvatar.avatar_name} es la mascota IA del negocio: analiza CRM, agenda, ventas y campañas para dar notas ejecutivas dentro del panel.` : "Centro de inteligencia preparado para analizar CRM, agenda, ventas, campañas y voz. Guarda instrucciones reutilizables y conecta más adelante el proveedor IA."} actions={<ModulePillTabs tabs={["Copiloto", "Automatizaciones", "Prompts", "Conectores"]} active={tab} setActive={(next) => selectModuleSubmenu(setActiveTab, ({ Copiloto: "module:ia:copiloto", Automatizaciones: "module:ia:automatizaciones", Prompts: "module:ia:prompts", Conectores: "module:ia:conectores" } as Record<string, ActiveTab>)[next] || "module:ia:copiloto", setTab, next)} />} />
      {businessAvatar?.avatar_name && (
        <div className="rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-500/15 via-violet-500/10 to-black/20 p-5 shadow-2xl shadow-cyan-950/20">
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-100/70">Asistente 3D activo</p>
          <h3 className="mt-1 text-2xl font-semibold">{businessAvatar.avatar_name || "Mascota IA"}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">El personaje 3D flotante puede hacer tours, hablar con voz del navegador y guiar al usuario por CRM, Agenda, WhatsApp, Voice, IA, pagos y estadísticas.</p>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-4"><Metric icon={<Bot />} label="Prompts" value={records.length} helper="Guardados" /><Metric icon={<Users />} label="Clientes" value={customers.length} helper="Contexto CRM" /><Metric icon={<CalendarDays />} label="Agenda" value={appointments.length} helper={occupancySignal} /><Metric icon={<TrendingUp />} label="Ingresos" value={`${revenue.toFixed(2)}€`} helper="Lectura financiera" /></div>
      {tab === "Copiloto" && <GlassCard title="Insights ejecutivos"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{["Resumen diario del negocio", "Huecos libres a cubrir", "Clientes con riesgo de fuga", "Servicios con más demanda", "Campaña recomendada", "Seguimiento de llamadas", "Caja prevista", "Tareas para el equipo"].map((x) => <div key={x} className="rounded-3xl bg-black/25 p-5"><p className="font-semibold">{x}</p><p className="mt-2 text-sm text-white/45">Tarjeta preparada para respuesta IA real.</p></div>)}</div></GlassCard>}
      {tab === "Automatizaciones" && <GlassCard title="Automatizaciones IA listas"><div className="grid gap-3 md:grid-cols-3">{["Responder leads", "Crear recordatorios", "Reactivar clientes", "Sugerir campañas", "Clasificar llamadas", "Resumen semanal"].map((x) => <div key={x} className="rounded-3xl border border-violet-300/20 bg-violet-500/10 p-5"><p className="font-semibold">{x}</p><p className="mt-2 text-sm text-white/45">Estado: preparado para conectar API y reglas.</p></div>)}</div></GlassCard>}
      {tab === "Prompts" && <section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]"><GlassCard title="Nueva instrucción IA"><div className="grid gap-3"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Resumen semanal de dirección" className="input-dark" /><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Define objetivo, datos que debe mirar, formato de respuesta y acciones que debe recomendar" className="input-dark min-h-40" /><button onClick={() => createRecord("ai", "prompt")} className="btn-primary"><Bot size={17} /> Guardar instrucción IA</button></div></GlassCard><GlassCard title="Biblioteca de prompts"><RecordsList records={records} deleteRecord={deleteRecord} /></GlassCard></section>}
      {tab === "Conectores" && <GlassCard title="Proveedor IA y permisos"><IntegrationPanel business={business} integrations={integrations} reloadData={reloadData} items={[{ name: "OpenAI / proveedor IA", detail: "API key, modelo y límites por negocio" }, { name: "Permisos CRM", detail: "Datos que la IA puede leer y resumir" }, { name: "Acciones seguras", detail: "Confirmación antes de enviar mensajes o modificar datos" }, { name: "Base de conocimiento", detail: "Documentos, FAQs y tono del negocio" }]} /></GlassCard>}
    </section>
  );
}

function AnalyticsModule({ records, customers, appointments, services, revenue, expenses, manualIncome, deleteRecord, activeTab, setActiveTab }: Parameters<typeof ModuleSection>[0]) {
  const [tab, setTab] = useState("Dirección");

  useEffect(() => {
    syncModuleSubmenu(activeTab, "module:estadisticas:", { direccion: "Dirección", kpis: "Dirección", agenda: "Agenda", finanzas: "Finanzas", informes: "Finanzas", servicios: "Servicios" }, setTab);
  }, [activeTab]);
  const total = revenue + manualIncome;
  const profit = total - expenses;
  const conversion = customers.length ? Math.round((appointments.length / customers.length) * 100) : 0;
  const byStatus = ["pending", "confirmed", "completed", "cancelled"].map((status) => ({ status, count: appointments.filter((a) => a.status === status).length }));
  return (
    <section className="grid gap-6">
      <ModuleHero eyebrow="Business Analytics" title="Panel de métricas sincronizado" description="KPIs del panel principal, agenda, CRM, facturación, TPV y servicios en una capa ejecutiva para dirección." actions={<ModulePillTabs tabs={["Dirección", "Agenda", "Finanzas", "Servicios"]} active={tab} setActive={(next) => selectModuleSubmenu(setActiveTab, ({ Dirección: "module:estadisticas:direccion", Agenda: "module:estadisticas:agenda", Finanzas: "module:estadisticas:finanzas", Servicios: "module:estadisticas:servicios" } as Record<string, ActiveTab>)[next] || "module:estadisticas:direccion", setTab, next)} />} />
      <div className="grid gap-4 md:grid-cols-4"><Metric icon={<TrendingUp />} label="Ingresos" value={`${total.toFixed(2)}€`} helper="Reservas + manual" /><Metric icon={<CreditCard />} label="Resultado" value={`${profit.toFixed(2)}€`} helper="Estimado" /><Metric icon={<Users />} label="Conversión" value={`${conversion}%`} helper="Citas / clientes" /><Metric icon={<FileText />} label="Registros" value={records.length} helper="Análisis guardados" /></div>
      {tab === "Dirección" && <GlassCard title="Scorecard ejecutivo"><div className="grid gap-3 md:grid-cols-3">{["Crecimiento mensual", "Clientes activos", "Ocupación estimada", "Ticket medio", "Retención", "Alertas operativas"].map((x) => <div key={x} className="rounded-3xl bg-black/25 p-5"><p className="font-semibold">{x}</p><p className="mt-2 text-sm text-white/45">Indicador preparado para histórico avanzado.</p></div>)}</div></GlassCard>}
      {tab === "Agenda" && <GlassCard title="Embudo de citas"><div className="grid gap-3 md:grid-cols-4">{byStatus.map((item) => <InfoBox key={item.status} label={translateStatus(item.status)} value={item.count} />)}</div></GlassCard>}
      {tab === "Finanzas" && <GlassCard title="Lectura financiera"><div className="grid gap-3 md:grid-cols-4"><InfoBox label="Reservas" value={`${revenue.toFixed(2)}€`} /><InfoBox label="Manual" value={`${manualIncome.toFixed(2)}€`} /><InfoBox label="Gastos" value={`${expenses.toFixed(2)}€`} /><InfoBox label="Margen" value={`${profit.toFixed(2)}€`} /></div><div className="mt-5"><RecordsList records={records} deleteRecord={deleteRecord} /></div></GlassCard>}
      {tab === "Servicios" && <GlassCard title="Ranking de servicios"><div className="grid gap-3 md:grid-cols-2">{services.map((service) => <div key={service.id} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5"><p className="font-semibold">{service.name}</p><p className="mt-1 text-sm text-white/45">{service.duration || service.duration_minutes || 30} min · {Number(service.price).toFixed(2)}€</p></div>)}{!services.length && <Empty text="Crea servicios para activar el ranking." />}</div></GlassCard>}
    </section>
  );
}


function AgendaProModule({ business, integrations, reloadData, appointments, customers, employees, services, settings, selectedCrmCustomerId, setSelectedCrmCustomerId, createAppointmentForCustomer, activeTab, setActiveTab }: Parameters<typeof ModuleSection>[0] & { settings?: BookingSettings | null }) {
  const [view, setView] = useState("Calendario");
  const [newCustomerId, setNewCustomerId] = useState(selectedCrmCustomerId || "");
  const [newEmployeeId, setNewEmployeeId] = useState("");
  const [newServiceId, setNewServiceId] = useState("");
  const [newDate, setNewDate] = useState("");

  useEffect(() => {
    syncModuleSubmenu(activeTab, "module:agenda-pro:", { calendario: "Calendario", huecos: "Huecos libres", nueva: "Crear cita", configuracion: "Configuración" }, setView);
  }, [activeTab]);

  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return date;
  });
  const startHour = Number((settings?.start_time || "09:00").slice(0, 2));
  const endHour = Number((settings?.end_time || "19:00").slice(0, 2));
  const hours = Array.from({ length: Math.max(1, endHour - startHour) }, (_, index) => startHour + index);
  const futureAppointments = appointments
    .filter((item) => new Date(appointmentDate(item)).getTime() >= new Date(today.toDateString()).getTime())
    .sort((a, b) => new Date(appointmentDate(a)).getTime() - new Date(appointmentDate(b)).getTime());

  const appointmentForSlot = (day: Date, hour: number) => appointments.find((item) => {
    const date = new Date(appointmentDate(item));
    return date.toDateString() === day.toDateString() && date.getHours() === hour && item.status !== "cancelled";
  });

  const calendarCells = [
    <div key="corner" />,
    ...weekDays.map((day) => (
      <div key={`head-${day.toISOString()}`} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-center">
        <p className="text-xs uppercase text-cyan-100/60">{day.toLocaleDateString("es-ES", { weekday: "short" })}</p>
        <p className="text-lg font-semibold">{day.getDate()}</p>
      </div>
    )),
    ...hours.flatMap((hour) => [
      <div key={`h-${hour}`} className="rounded-2xl bg-black/25 p-3 text-sm text-white/50">{String(hour).padStart(2, "0")}:00</div>,
      ...weekDays.map((day) => {
        const item = appointmentForSlot(day, hour);
        return (
          <div key={`${day.toISOString()}-${hour}`} className={item ? "min-h-20 rounded-2xl border border-violet-300/25 bg-violet-500/20 p-3" : "min-h-20 rounded-2xl border border-emerald-300/15 bg-emerald-400/10 p-3"}>
            {item ? <><p className="text-sm font-semibold">{customerName(item.customers)}</p><p className="mt-1 text-xs text-white/45">{firstRelation(item.services)?.name || "Cita"}</p><p className="mt-2 rounded-full bg-black/25 px-2 py-1 text-xs capitalize text-white/60">{item.status}</p></> : <p className="text-xs text-emerald-100/70">Hueco libre</p>}
          </div>
        );
      }),
    ]),
  ];

  const createFromAgenda = () => {
    if (!newCustomerId || !newEmployeeId || !newServiceId || !newDate) return alert("Selecciona cliente, empleado, servicio y fecha");
    setSelectedCrmCustomerId(newCustomerId);
    createAppointmentForCustomer(newCustomerId, newEmployeeId, newServiceId, newDate);
    setNewDate("");
  };

  return (
    <section className="grid gap-6">
      <ModuleHero eyebrow="Agenda inteligente" title="Calendario operativo con huecos libres" description="Vista de agenda visual por cuadrados, próximas citas, disponibilidad y creación rápida conectada a clientes, empleados y servicios." actions={<ModulePillTabs tabs={["Calendario", "Huecos libres", "Crear cita", "Configuración"]} active={view} setActive={(next) => selectModuleSubmenu(setActiveTab, ({ Calendario: "module:agenda-pro:calendario", "Huecos libres": "module:agenda-pro:huecos", "Crear cita": "module:agenda-pro:nueva", Configuración: "module:agenda-pro:configuracion" } as Record<string, ActiveTab>)[next] || "module:agenda-pro:calendario", setView, next)} />} />
      <div className="grid gap-4 md:grid-cols-4"><Metric icon={<CalendarDays />} label="Citas próximas" value={futureAppointments.length} helper="Agenda activa" /><Metric icon={<Clock />} label="Horario" value={`${settings?.start_time || "09:00"} - ${settings?.end_time || "19:00"}`} helper="Configurado" /><Metric icon={<Users />} label="Clientes" value={customers.length} helper="Disponibles" /><Metric icon={<UserRound />} label="Equipo" value={employees.length} helper="Asignables" /></div>
      {view === "Calendario" && <GlassCard title="Calendario semanal por huecos"><div className="overflow-x-auto"><div className="grid min-w-[880px] grid-cols-[90px_repeat(7,1fr)] gap-2">{calendarCells}</div></div></GlassCard>}
      {view === "Huecos libres" && <GlassCard title="Próximos huecos libres"><div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">{weekDays.flatMap((day) => hours.map((hour) => ({ day, hour }))).filter(({ day, hour }) => !appointmentForSlot(day, hour)).slice(0, 24).map(({ day, hour }) => <button key={`${day.toISOString()}-${hour}`} onClick={() => { const iso = new Date(day); iso.setHours(hour, 0, 0, 0); setNewDate(iso.toISOString().slice(0, 16)); setView("Crear cita"); setActiveTab("module:agenda-pro:nueva"); }} className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-left hover:bg-emerald-400/15"><p className="font-semibold">{day.toLocaleDateString("es-ES", { weekday: "long", day: "2-digit", month: "short" })}</p><p className="mt-1 text-sm text-emerald-100/70">{String(hour).padStart(2, "0")}:00 disponible</p></button>)}</div></GlassCard>}
      {view === "Crear cita" && <section className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]"><GlassCard title="Crear cita rápida"><div className="grid gap-3"><select value={newCustomerId} onChange={(e) => setNewCustomerId(e.target.value)} className="input-dark"><option value="">Cliente</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customerName(customer)}</option>)}</select><select value={newEmployeeId} onChange={(e) => setNewEmployeeId(e.target.value)} className="input-dark"><option value="">Empleado</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</select><select value={newServiceId} onChange={(e) => setNewServiceId(e.target.value)} className="input-dark"><option value="">Servicio</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name} · {Number(service.price || 0).toFixed(2)}€</option>)}</select><input type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="input-dark" /><button onClick={createFromAgenda} className="btn-primary"><Plus size={17} /> Crear cita</button></div></GlassCard><GlassCard title="Próximas citas"><div className="grid gap-3">{futureAppointments.slice(0, 8).map((item) => <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><p className="font-semibold">{customerName(item.customers)}</p><p className="mt-1 text-sm text-white/45">{new Date(appointmentDate(item)).toLocaleString("es-ES")} · {firstRelation(item.services)?.name || "Servicio"}</p></div>)}{!futureAppointments.length && <Empty text="No hay próximas citas." />}</div></GlassCard></section>}
      {view === "Configuración" && <GlassCard title="Configuración de agenda"><IntegrationPanel business={business} integrations={integrations} reloadData={reloadData} items={[{ name: "Google Calendar", detail: "Sincronización real de citas con calendario externo" }, { name: "WhatsApp", detail: "Recordatorios automáticos previos a citas" }, { name: "Web del cliente", detail: "Widget público de reservas y tracking" }]} /></GlassCard>}
    </section>
  );
}

function TimeTrackingModule({ records, employees, title, setTitle, notes, setNotes, status, setStatus, createRecord, deleteRecord, activeTab, setActiveTab }: Parameters<typeof ModuleSection>[0]) {
  const [view, setView] = useState("Fichar");
  useEffect(() => {
    syncModuleSubmenu(activeTab, "module:fichaje:", { fichar: "Fichar", jornada: "Jornada", incidencias: "Incidencias" }, setView);
  }, [activeTab]);
  const today = new Date().toLocaleDateString("es-ES");
  const todayRecords = records.filter((record) => new Date(record.created_at).toLocaleDateString("es-ES") === today);
  const incidentRecords = records.filter((record) => record.status === "incidencia");
  return <section className="grid gap-6">
    <ModuleHero eyebrow="Flowly Fichaje" title="Control horario operativo para tu equipo" description="El submenú lateral permite fichar, revisar la jornada o auditar incidencias sin quedarse en una pantalla estática." actions={<ModulePillTabs tabs={["Fichar", "Jornada", "Incidencias"]} active={view} setActive={(next) => selectModuleSubmenu(setActiveTab, ({ Fichar: "module:fichaje:fichar", Jornada: "module:fichaje:jornada", Incidencias: "module:fichaje:incidencias" } as Record<string, ActiveTab>)[next] || "module:fichaje:fichar", setView, next)} />} />
    <div className="grid gap-4 md:grid-cols-4">
      <Metric icon={<Clock />} label="Registros hoy" value={todayRecords.length} helper="Jornada activa" />
      <Metric icon={<Users />} label="Equipo" value={employees.length} helper="Empleados" />
      <Metric icon={<CheckCircle2 />} label="Entradas" value={records.filter((r) => r.status === "entrada").length} helper="Histórico" />
      <Metric icon={<XCircle />} label="Incidencias" value={incidentRecords.length} helper="Revisar" />
    </div>
    {view === "Fichar" && <section className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
      <GlassCard title="Nuevo fichaje">
        <div className="grid gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-dark"><option value="entrada">Entrada</option><option value="salida">Salida</option><option value="pausa">Pausa</option><option value="vuelta_pausa">Vuelta de pausa</option><option value="incidencia">Incidencia</option></select>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Empleado o jornada" className="input-dark" />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas: ubicación, turno, incidencia o comentario" className="input-dark min-h-28" />
          <button onClick={() => createRecord("time_tracking", status || "entrada")} className="btn-primary"><Clock size={17} /> Guardar fichaje</button>
        </div>
      </GlassCard>
      <RecordsCard title="Últimos fichajes" records={records.slice(0, 8)} deleteRecord={deleteRecord} />
    </section>}
    {view === "Jornada" && <GlassCard title="Jornada de hoy"><RecordsList records={todayRecords} deleteRecord={deleteRecord} /></GlassCard>}
    {view === "Incidencias" && <GlassCard title="Incidencias pendientes"><RecordsList records={incidentRecords} deleteRecord={deleteRecord} /></GlassCard>}
  </section>;
}

function BookingPremiumModule({ business, integrations, reloadData, records, employees, services, appointments, title, setTitle, notes, setNotes, status, setStatus, createRecord, deleteRecord, activeTab, setActiveTab }: Parameters<typeof ModuleSection>[0]) {
  const [tab, setTab] = useState("Reglas");

  useEffect(() => {
    syncModuleSubmenu(activeTab, "module:reservas-premium:", { reglas: "Reglas", bloqueos: "Bloqueos", experiencia: "Experiencia", conexiones: "Conexiones" }, setTab);
  }, [activeTab]);
  const activeRules = records.filter((r) => r.status !== "inactive").length;
  return (
    <section className="grid gap-6">
      <ModuleHero eyebrow="Booking PRO" title="Reservas premium multinegocio" description="Reglas, políticas, bloqueos, experiencia de reserva y enlaces preparados para que cada cliente adapte el sistema a su negocio." actions={<ModulePillTabs tabs={["Reglas", "Bloqueos", "Experiencia", "Conexiones"]} active={tab} setActive={(next) => selectModuleSubmenu(setActiveTab, ({ Reglas: "module:reservas-premium:reglas", Bloqueos: "module:reservas-premium:bloqueos", Experiencia: "module:reservas-premium:experiencia", Conexiones: "module:reservas-premium:conexiones" } as Record<string, ActiveTab>)[next] || "module:reservas-premium:reglas", setTab, next)} />} />
      <div className="grid gap-4 md:grid-cols-4"><Metric icon={<SlidersHorizontal />} label="Reglas" value={records.length} helper="Configuradas" /><Metric icon={<CheckCircle2 />} label="Activas" value={activeRules} helper="Operativas" /><Metric icon={<UserRound />} label="Equipo" value={employees.length} helper="Profesionales" /><Metric icon={<CalendarDays />} label="Reservas" value={appointments.length} helper="Sincronizadas" /></div>
      {tab === "Reglas" && <section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]"><GlassCard title="Nueva regla premium"><div className="grid gap-3"><select value={status} onChange={(e) => setStatus(e.target.value)} className="input-dark"><option value="active">Activa</option><option value="draft">Borrador</option><option value="inactive">Inactiva</option></select><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Antelación mínima 24h" className="input-dark" /><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe condición, horarios, servicios afectados, penalización o mensaje visible al cliente" className="input-dark min-h-40" /><button onClick={() => createRecord("booking_premium", status)} className="btn-primary"><Plus size={17} /> Guardar regla</button></div></GlassCard><GlassCard title="Reglas existentes"><RecordsList records={records} deleteRecord={deleteRecord} /></GlassCard></section>}
      {tab === "Bloqueos" && <GlassCard title="Bloqueos y disponibilidad"><div className="grid gap-3 md:grid-cols-3">{["Vacaciones", "Mantenimiento", "Formación interna", "Festivos", "Sobrecupo controlado", "Lista de espera"].map((x) => <div key={x} className="rounded-3xl bg-black/25 p-5"><p className="font-semibold">{x}</p><p className="mt-2 text-sm text-white/45">Configuración preparada para calendario avanzado.</p></div>)}</div></GlassCard>}
      {tab === "Experiencia" && <GlassCard title="Portal de reserva del cliente"><div className="grid gap-3 md:grid-cols-2">{["Campos personalizados", "Política de cancelación", "Mensaje post-reserva", "Confirmación WhatsApp", "Pago o señal", "Servicios destacados"].map((x) => <div key={x} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5"><p className="font-semibold">{x}</p><p className="mt-2 text-sm text-white/45">Listo para personalizar por negocio.</p></div>)}</div></GlassCard>}
      {tab === "Conexiones" && <GlassCard title="Canales de reserva"><IntegrationPanel business={business} integrations={integrations} reloadData={reloadData} items={[{ name: "Google Business Profile", detail: "Enlace de reservas público y reseñas" }, { name: "Instagram / Facebook", detail: "Botón reservar y link en bio" }, { name: "WhatsApp", detail: "Confirmaciones y recordatorios" }, { name: "Web del cliente", detail: "Widget embebible" }, { name: "Google Calendar", detail: "Sincronización externa de agenda" }, { name: "Stripe / pagos", detail: "Señales y reservas premium" }]} /></GlassCard>}
    </section>
  );
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

function normalizeWhatsappTemplate(template: WhatsappTemplate): WhatsappTemplate {
  const label = String(template.label || template.name || template.key || "Plantilla").trim() || "Plantilla";
  const message = String(template.message || template.content || "").trim();
  const key = String(template.key || label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || `custom_${Date.now()}`);
  return { ...template, key, label, message, name: template.name || label, content: template.content || message };
}

function mergeWhatsappTemplates(defaults: WhatsappTemplate[], custom: WhatsappTemplate[]) {
  const activeCustom = custom.map(normalizeWhatsappTemplate).filter((template) => template.is_active !== false);
  const map = new Map<string, WhatsappTemplate>();
  defaults.map(normalizeWhatsappTemplate).forEach((template) => map.set(template.key, template));
  activeCustom.forEach((template) => map.set(template.key, { ...map.get(template.key), ...template }));
  return Array.from(map.values()).filter((template) => template.message);
}

function localDateTimeToBogotaIso(value: string) {
  if (!value) return null;
  const normalized = value.length === 16 ? `${value}:00` : value;
  return new Date(`${normalized}${BOGOTA_UTC_OFFSET}`).toISOString();
}

function formatInDashboardTimeZone(raw: string) {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: DASHBOARD_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(raw));
}

function getUpcomingReminders(reminders: CrmReminder[], days = 7) {
  const now = Date.now();
  const limit = now + days * 24 * 60 * 60 * 1000;
  return reminders
    .filter((reminder) => {
      const time = reminderTime(reminder);
      return (reminder.status || "pending") === "pending" && time >= now - 60 * 60 * 1000 && time <= limit;
    })
    .sort((a, b) => reminderTime(a) - reminderTime(b));
}

function normalizeCrmReminder(reminder: CrmReminder): CrmReminder {
  const time = reminder.reminder_at || reminder.remind_at || null;
  const customerId = reminder.customer_id || reminder.patient_id || null;
  return {
    ...reminder,
    customer_id: customerId,
    patient_id: reminder.patient_id || customerId,
    notes: reminder.notes || reminder.description || null,
    description: reminder.description || reminder.notes || null,
    remind_at: time,
    reminder_at: time,
    status: reminder.status || "pending",
  };
}

function reminderCustomerId(reminder: CrmReminder) {
  return reminder.customer_id || reminder.patient_id || "";
}

function reminderTime(reminder: CrmReminder) {
  const raw = reminder.reminder_at || reminder.remind_at;
  const time = raw ? new Date(raw).getTime() : Number.POSITIVE_INFINITY;
  return Number.isFinite(time) ? time : Number.POSITIVE_INFINITY;
}

function formatReminderDate(reminder: CrmReminder) {
  const raw = reminder.reminder_at || reminder.remind_at;
  if (!raw) return "Sin fecha";
  return `${formatInDashboardTimeZone(raw)} (${DASHBOARD_TIME_ZONE_LABEL})`;
}

function reminderCustomerName(reminder: CrmReminder, customers?: Customer[]) {
  const related = firstRelation(reminder.customers);
  const fallback = customers?.find((customer) => customer.id === reminderCustomerId(reminder));
  return reminder.customer_name || customerName(related || fallback || null);
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
  customers,
  whatsappTemplatesEffective,
  saveWhatsappTemplate,
  deleteWhatsappTemplate,
  saveWhatsappMessage,
  activeTab,
  setActiveTab,
}: Parameters<typeof ModuleSection>[0]) {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateMessage, setTemplateMessage] = useState("");
  const [editingTemplateKey, setEditingTemplateKey] = useState<string | null>(null);
  const [editingTemplateLabel, setEditingTemplateLabel] = useState("");
  const [editingTemplateMessage, setEditingTemplateMessage] = useState("");
  const [localTemplates, setLocalTemplates] = useState<WhatsappTemplate[]>([]);

  useEffect(() => {
    setLocalTemplates(whatsappTemplatesEffective);
  }, [whatsappTemplatesEffective]);

  const templates = localTemplates.length ? localTemplates : whatsappTemplatesEffective;
  const currentView = activeTab === "module:whatsapp:plantillas" ? "plantillas" : "enviar";
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) || null;
  const selectedTemplate = templates.find((template) => template.key === selectedTemplateKey) || null;
  const finalMessage = customMessage || (selectedTemplate && selectedCustomer ? whatsappMessageForCustomer(selectedTemplate.message, selectedCustomer) : selectedTemplate?.message || "");

  const handleSelectTemplate = (key: string) => {
    setSelectedTemplateKey(key);
    const template = templates.find((item) => item.key === key);
    if (template) setCustomMessage(selectedCustomer ? whatsappMessageForCustomer(template.message, selectedCustomer) : template.message);
  };

  const sendMessage = () => {
    if (!selectedCustomer) return alert("Selecciona un cliente");
    if (!finalMessage.trim()) return alert("Escribe un mensaje o selecciona una plantilla");
    if (!openWhatsapp(selectedCustomer.phone, finalMessage)) return alert("Este cliente no tiene teléfono válido para WhatsApp");
    saveWhatsappMessage(selectedCustomer.id, selectedCustomer.phone || "", selectedTemplate?.key || "manual", finalMessage);
  };

  const createTemplate = async () => {
    if (!templateTitle.trim() || !templateMessage.trim()) return alert("Añade nombre y mensaje de la plantilla");
    const newTemplate: WhatsappTemplate = {
      key: `custom_${Date.now()}`,
      label: templateTitle.trim(),
      message: templateMessage.trim(),
      name: templateTitle.trim(),
      content: templateMessage.trim(),
      category: "custom",
      is_active: true,
    };
    setLocalTemplates((current) => mergeWhatsappTemplates(current, [newTemplate]));
    await saveWhatsappTemplate(newTemplate);
    setTemplateTitle("");
    setTemplateMessage("");
  };

  const startEditTemplate = (template: WhatsappTemplate) => {
    setEditingTemplateKey(template.key);
    setEditingTemplateLabel(template.label);
    setEditingTemplateMessage(template.message);
  };

  const saveEditingTemplate = async () => {
    if (!editingTemplateKey) return;
    const currentTemplate = templates.find((item) => item.key === editingTemplateKey);
    const updatedTemplate: WhatsappTemplate = {
      id: currentTemplate?.id,
      key: editingTemplateKey,
      label: editingTemplateLabel.trim(),
      message: editingTemplateMessage.trim(),
      name: editingTemplateLabel.trim(),
      content: editingTemplateMessage.trim(),
      category: currentTemplate?.category || "custom",
      is_active: true,
    };
    setLocalTemplates((current) => mergeWhatsappTemplates(current, [updatedTemplate]));
    await saveWhatsappTemplate(updatedTemplate);
    setEditingTemplateKey(null);
    setEditingTemplateLabel("");
    setEditingTemplateMessage("");
  };

  const removeTemplate = async (template: WhatsappTemplate) => {
    setLocalTemplates((current) => current.filter((item) => item.key !== template.key));
    if (selectedTemplateKey === template.key) {
      setSelectedTemplateKey("");
      setCustomMessage("");
    }
    await deleteWhatsappTemplate(template);
  };

  return (
    <section className="grid gap-6">
      <GlassCard>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-200">WhatsApp conectado al CRM</p>
            <h2 className="mt-2 text-3xl font-semibold">Mensajes rápidos y plantillas</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              Un módulo limpio: selecciona un cliente del CRM, aplica una plantilla si quieres y termina el mensaje manualmente antes de abrir WhatsApp.
            </p>
          </div>
          <div className="flex rounded-full border border-white/10 bg-black/25 p-1">
            <button onClick={() => setActiveTab("module:whatsapp:enviar")} className={currentView === "enviar" ? "rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-950" : "rounded-full px-5 py-2 text-sm text-white/60 hover:text-white"}>Enviar</button>
            <button onClick={() => setActiveTab("module:whatsapp:plantillas")} className={currentView === "plantillas" ? "rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-950" : "rounded-full px-5 py-2 text-sm text-white/60 hover:text-white"}>Plantillas</button>
          </div>
        </div>
      </GlassCard>

      {currentView === "enviar" ? (
        <GlassCard title="Enviar WhatsApp">
          <div className="mx-auto grid max-w-3xl gap-4">
            <label className="grid gap-2 text-sm font-medium text-white/70">
              Cliente
              <Select
                value={selectedCustomerId}
                onChange={(value) => {
                  setSelectedCustomerId(value);
                  const customer = customers.find((item) => item.id === value);
                  if (selectedTemplate && customer) setCustomMessage(whatsappMessageForCustomer(selectedTemplate.message, customer));
                }}
                placeholder="Seleccionar cliente del CRM"
                options={customers.map((customer) => ({
                  value: customer.id,
                  label: `${customerName(customer)} · ${customer.phone || "Sin teléfono"}`,
                }))}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-white/70">
              Plantilla
              <select value={selectedTemplateKey} onChange={(e) => handleSelectTemplate(e.target.value)} className="input-dark">
                <option value="">Sin plantilla</option>
                {templates.map((template) => (
                  <option key={template.key} value={template.key}>{template.label}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-white/70">
              Mensaje
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Escribe aquí el mensaje o edita la plantilla seleccionada..."
                className="input-dark min-h-48"
              />
            </label>

            {selectedCustomer && (
              <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.05] p-4 md:grid-cols-2">
                <InfoBox label="Cliente" value={customerName(selectedCustomer)} />
                <InfoBox label="Teléfono" value={selectedCustomer.phone || "Sin teléfono"} />
              </div>
            )}

            <button onClick={sendMessage} className="btn-primary justify-center">
              <MessageCircle size={17} /> Abrir WhatsApp
            </button>
          </div>
        </GlassCard>
      ) : (
        <GlassCard title="Plantillas WhatsApp">
          <div className="mx-auto grid max-w-4xl gap-6">
            <div className="rounded-[2rem] border border-white/10 bg-black/25 p-5">
              <h3 className="text-lg font-semibold">Crear plantilla</h3>
              <p className="mt-1 text-sm text-white/45">Puedes usar variables: {"{nombre}"}, {"{telefono}"}, {"{eps}"}, {"{documento}"}.</p>
              <div className="mt-4 grid gap-3">
                <input value={templateTitle} onChange={(e) => setTemplateTitle(e.target.value)} placeholder="Nombre de plantilla" className="input-dark" />
                <textarea value={templateMessage} onChange={(e) => setTemplateMessage(e.target.value)} placeholder="Hola {nombre}, te escribimos para..." className="input-dark min-h-36" />
                <button onClick={createTemplate} className="btn-secondary justify-center"><Plus size={17} /> Guardar plantilla</button>
              </div>
            </div>

            <div className="grid gap-3">
              {templates.map((template) => (
                <div key={template.key} className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5">
                  {editingTemplateKey === template.key ? (
                    <div className="grid gap-3">
                      <input value={editingTemplateLabel} onChange={(e) => setEditingTemplateLabel(e.target.value)} className="input-dark" />
                      <textarea value={editingTemplateMessage} onChange={(e) => setEditingTemplateMessage(e.target.value)} className="input-dark min-h-32" />
                      <div className="flex flex-wrap gap-2">
                        <button onClick={saveEditingTemplate} className="btn-primary">Guardar cambios</button>
                        <button onClick={() => setEditingTemplateKey(null)} className="btn-secondary">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <p className="font-semibold">{template.label}</p>
                        <p className="mt-2 text-sm leading-6 text-white/50">{template.message}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button onClick={() => startEditTemplate(template)} className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/75 hover:bg-white/10">Editar</button>
                        <button onClick={() => removeTemplate(template)} className="rounded-full border border-red-300/20 px-4 py-2 text-xs text-red-200/80 hover:bg-red-500/10">Eliminar</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {!templates.length && <Empty text="Todavía no hay plantillas creadas." />}
            </div>
          </div>
        </GlassCard>
      )}
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
              {EPS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
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
  const eps = EPS_OPTIONS.find((option) => option.value === intent);
  if (eps) return eps.label;
  if (intent === "reprogramar") return "Reprogramar";
  if (intent === "incidencia") return "Incidencia";
  if (intent === "seguimiento") return "Seguimiento";
  return intent;
}

function translateDocumentType(type: string) {
  return documentTypeLabel(type);
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
  businessAvatar,
  avatarName,
  setAvatarName,
  avatarStyle,
  setAvatarStyle,
  avatarPersonality,
  setAvatarPersonality,
  avatarGenerating,
  generateBusinessAvatar,
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
  businessAvatar: BusinessAvatar | null;
  avatarName: string;
  setAvatarName: (v: string) => void;
  avatarStyle: string;
  setAvatarStyle: (v: string) => void;
  avatarPersonality: string;
  setAvatarPersonality: (v: string) => void;
  avatarGenerating: boolean;
  generateBusinessAvatar: () => void;
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

        <GlassCard title="Mascota IA de marca">
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-cyan-300/20 bg-cyan-400/10">
                {businessAvatar?.avatar_url ? <img src={businessAvatar.avatar_url} alt={businessAvatar.avatar_name || "Mascota IA"} className="h-full w-full object-cover" /> : <Bot className="text-cyan-100" size={34} />}
              </div>
              <div>
                <p className="text-sm text-white/55">Crea un avatar fusionado con el estilo visual del negocio.</p>
                <p className="mt-1 text-xs leading-5 text-white/35">Se guarda en Supabase Storage y aparece en el header, dashboard y módulo IA.</p>
              </div>
            </div>
            <input value={avatarName} onChange={(e) => setAvatarName(e.target.value)} placeholder="Nombre de la mascota. Ej: Nia" className="input-dark" />
            <select value={avatarStyle} onChange={(e) => setAvatarStyle(e.target.value)} className="input-dark">
              <option value="robot-premium">Robot premium SaaS</option>
              <option value="humanoide-corporativo">Asistente humanoide corporativo</option>
              <option value="animal-futurista">Mascota animal futurista</option>
              <option value="minimalista-branding">Minimalista de marca</option>
              <option value="cyberpunk-elegante">Cyberpunk elegante</option>
            </select>
            <textarea value={avatarPersonality} onChange={(e) => setAvatarPersonality(e.target.value)} placeholder="Personalidad: cercana, profesional, comercial..." className="input-dark min-h-24" />
            <button onClick={generateBusinessAvatar} disabled={avatarGenerating} className="btn-primary disabled:opacity-60"><Bot size={17} /> {avatarGenerating ? "Generando mascota IA..." : businessAvatar?.avatar_url ? "Regenerar mascota IA" : "Crear mi mascota IA"}</button>
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
function Shell({ children }: { children: React.ReactNode; theme?: string }) { return <main className="flowly-app-shell text-white"><div className="flowly-app-content">{children}</div></main>; }
function Metric({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string | number; helper: string }) { return <div className="flowly-app-metric rounded-[1.7rem] p-5"><div className="flowly-app-icon mb-4 flex h-11 w-11 items-center justify-center rounded-2xl">{icon}</div><p className="text-sm text-white/50">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p><p className="mt-1 text-xs text-cyan-100/60">{helper}</p></div>; }
function MetricCard({ label, value }: { label: string; value: string | number }) { return <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/50">{label}</p><p className="mt-3 text-2xl font-semibold text-white">{value}</p></div>; }
function GlassCard({ title, children }: { title?: string; children: React.ReactNode }) { return <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">{title && <h2 className="mb-5 text-2xl font-semibold">{title}</h2>}{children}</div>; }
function InfoBox({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-sm text-white/45">{label}</p><p className="mt-2 text-2xl font-semibold capitalize">{value}</p></div>; }
function ModuleAccessCard({ module, active = false, onOpen, onActivate }: { module: ModuleItem; active?: boolean; onOpen?: () => void; onActivate?: () => void }) { const Icon = module.Icon; return <div className={active ? "rounded-2xl border border-violet-400/30 bg-violet-500/15 p-4" : "rounded-2xl border border-white/10 bg-white/[0.05] p-4"}><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-violet-100"><Icon size={18} /></div><div><p className="font-semibold">{module.name}</p><p className="mt-1 text-xs leading-5 text-white/45">{module.description}</p><div className="mt-3 flex flex-wrap gap-2">{active ? <button onClick={onOpen} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-950">Abrir</button> : <button onClick={onActivate} className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">Añadir {module.price}</button>}</div></div></div></div>; }
function Select({ value, onChange, placeholder, options }: { value: string; onChange: (value: string) => void; placeholder: string; options: { value: string; label: string }[] }) { return <select value={value} onChange={(e) => onChange(e.target.value)} className="input-dark"><option value="">{placeholder}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>; }
function DayToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] p-4"><span className="font-medium">{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5" /></label>; }
function StatusButton({ children, onClick, tone }: { children: React.ReactNode; onClick: () => void; tone: "green" | "red" | "violet" }) { const className = tone === "green" ? "border-green-300/25 text-green-200" : tone === "red" ? "border-red-300/25 text-red-200" : "border-violet-300/25 text-violet-200"; return <button onClick={onClick} className={`rounded-full border px-3 py-2 text-xs ${className}`}>{children}</button>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/45">{text}</div>; }
function Feature({ text }: { text: string }) { return <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5"><CheckCircle2 className="mb-3 text-violet-200" size={22} /><p className="font-medium">{text}</p></div>; }
function translateStatus(status: string) { if (status === "pending") return "Pendiente"; if (status === "confirmed") return "Confirmada"; if (status === "completed") return "Completada"; if (status === "cancelled") return "Cancelada"; return status; }
