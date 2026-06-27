"use client";

import Link from "next/link";
import Image from "next/image";
import FlowlyAssistant3D from "@/components/FlowlyAssistant3D";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { marketingPlans } from "@/lib/marketingPlans";
import {
  Bot,
  BookOpen,
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
  direction?: "inbound" | "outbound" | string | null;
  provider_message_id?: string | null;
  contact_name?: string | null;
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

type WhatsappBotRule = {
  id?: string;
  business_id?: string;
  name: string;
  trigger_text: string;
  response_message: string;
  match_mode?: "contains" | "exact" | string | null;
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
  { key: "billing", slug: "facturacion", name: "Facturación Básica", short: "Facturación", price: "Incluido", badge: "Incluido en Basic", description: "Presupuestos, facturas PDF, ingresos, gastos, configuración de logo/datos y conexión con clientes, agenda y WhatsApp.", Icon: Receipt, amountEnabled: true, proFeatures: ["Presupuestos y presupuestos", "Facturas PDF", "Registro de cobros", "Configuración de logo y datos", "Conexión con Agenda"] },
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
  const [whatsappBotRules, setWhatsappBotRules] = useState<WhatsappBotRule[]>([]);
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

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const whatsappMessagesRequest = fetch(`/api/whatsapp/messages?businessId=${encodeURIComponent(businessId)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    }).then(async (response) => {
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || "No se pudieron cargar los WhatsApps");
      return result.messages || [];
    });

    const [companyRes, servicesRes, employeesRes, customersRes, appointmentsRes, settingsRes, modulesRes, recordsRes, integrationsRes, voiceCallsRes, clinicalDocumentsRes, whatsappMessagesData, whatsappTemplatesRes, whatsappBotRulesRes, crmRemindersRes, avatarRes] = await Promise.all([
      supabase.from("company_profiles").select("*").eq("business_id", businessId).maybeSingle(),
      supabase.from("services").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("employees").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("customers").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("appointments").select("*, customers(name, full_name), employees(name), services(name, price)").eq("business_id", businessId).order("appointment_date", { ascending: true }),
      supabase.from("booking_settings").select("*").eq("business_id", businessId).maybeSingle(),
      supabase.from("business_modules").select("*").eq("business_id", businessId),
      supabase.from("module_records").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("business_integrations").select("*").eq("business_id", businessId).order("provider_name", { ascending: true }),
      supabase.from("voice_calls").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("clinical_documents").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      whatsappMessagesRequest,
      supabase.from("whatsapp_templates").select("*").eq("business_id", businessId).eq("is_active", true).order("label", { ascending: true }),
      supabase.from("whatsapp_bot_rules").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
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
    setWhatsappMessages((whatsappMessagesData || []) as WhatsappMessage[]);
    setWhatsappTemplatesData(((whatsappTemplatesRes.data || []) as WhatsappTemplate[]).map(normalizeWhatsappTemplate));
    setWhatsappBotRules((whatsappBotRulesRes.data || []) as WhatsappBotRule[]);
    if (whatsappBotRulesRes.error) console.warn("No se pudieron cargar bots WhatsApp", whatsappBotRulesRes.error.message);
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
    const cancelledKeys = new Set(modules.filter((item) => item.status === "cancelled").map((item) => item.module_key));
    if (business?.plan === "premium") return moduleCatalog.map((item) => item.key).filter((key) => !cancelledKeys.has(key));
    const contractedKeys = modules.filter((item) => item.status === "active").map((item) => item.module_key);
    if ((business?.plan === "basic" || !business?.plan) && !cancelledKeys.has("billing")) return Array.from(new Set([...contractedKeys, "billing"]));
    return contractedKeys;
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

    let selectedMarketingPlan = null as null | typeof marketingPlans.marketing_bronze;
    if (moduleKey === "marketing") {
      const choice = window.prompt("Elige el plan de marketing para activar en tu panel: bronze, plata u oro", "bronze");
      const normalized = String(choice || "bronze").toLowerCase().trim();
      const planId = normalized.includes("oro") ? "marketing_oro" : normalized.includes("plata") ? "marketing_plata" : "marketing_bronze";
      selectedMarketingPlan = marketingPlans[planId];
      const ok = window.confirm(`Vas a activar Marketing con el plan ${selectedMarketingPlan.name.replace("Flowly Marketing ", "")} por ${selectedMarketingPlan.price.toFixed(2)}€/mes. ¿Continuar?`);
      if (!ok) return;
    }

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

    if (moduleKey === "marketing" && selectedMarketingPlan) {
      await supabase.from("module_records").insert({
        business_id: business.id,
        module_key: "marketing",
        title: `Plan activo · ${selectedMarketingPlan.name.replace("Flowly Marketing ", "")}`,
        amount: selectedMarketingPlan.price,
        status: "plan_active",
        notes: [selectedMarketingPlan.description, "", "Incluye:", ...selectedMarketingPlan.features.map((feature) => `- ${feature}`)].join("\n"),
      });
    }

    await loadData();
    alert(moduleKey === "marketing" ? "Marketing añadido con plan operativo." : "Módulo añadido correctamente a tu panel.");
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


  const openClinicalDocument = async (document: ClinicalDocument) => {
    if (!business) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const response = await fetch("/api/documents/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ documentId: document.id, businessId: business.id }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok || !result.url) {
      alert(result.error || "No se pudo abrir el documento de forma segura");
      return;
    }

    window.open(result.url, "_blank", "noopener,noreferrer");
  };

  const uploadClinicalDocument = async (customerId: string, file: File, title?: string, documentType = "clinico", notes = "") => {
    if (!business || !customerId || !file) return alert("Selecciona un paciente y un archivo");

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${business.id}/${customerId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("clinical_documents")
      .upload(path, file, { upsert: false });

    if (uploadError) return alert(uploadError.message);

    const { error: insertError } = await supabase.from("clinical_documents").insert({
      business_id: business.id,
      customer_id: customerId,
      title: title || file.name,
      file_name: file.name,
      file_path: path,
      file_url: null,
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
      direction: "outbound",
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
      if (typeof window !== "undefined") window.localStorage.removeItem("flowly-assistant-3d-hidden");
      setBusinessAvatar(data.avatar as BusinessAvatar);
      alert("Mascota IA generada y guardada en el panel.");
    } catch (error) {
      console.error(error);
      alert("Error generando la mascota IA");
    } finally {
      setAvatarGenerating(false);
    }
  };

  const removeBusinessAvatar = async () => {
    if (!business?.id) return;
    const ok = window.confirm("¿Quieres quitar la mascota IA de este panel? Podrás crear una nueva cuando quieras.");
    if (!ok) return;

    const { error } = await supabase
      .from("business_avatars")
      .delete()
      .eq("business_id", business.id);

    if (error) return alert(error.message);
    if (typeof window !== "undefined") window.localStorage.setItem("flowly-assistant-3d-hidden", "1");
    setBusinessAvatar(null);
    alert("Mascota IA quitada del panel.");
  };

  const deactivateModule = async (moduleKey: string) => {
    if (!business?.id) return;
    const module = moduleCatalog.find((item) => item.key === moduleKey);
    const ok = window.confirm(`¿Quieres eliminar el módulo ${module?.name || moduleKey} de tu panel? Dejará de aparecer en el menú y podrás volver a añadirlo más adelante.`);
    if (!ok) return;

    const existing = modules.find((item) => item.module_key === moduleKey);
    const payload = { business_id: business.id, module_key: moduleKey, status: "cancelled" };
    const result = existing?.id
      ? await supabase.from("business_modules").update({ status: "cancelled" }).eq("id", existing.id).eq("business_id", business.id)
      : await supabase.from("business_modules").upsert(payload, { onConflict: "business_id,module_key" });

    if (result.error) return alert(result.error.message);
    if (activeTab.startsWith(`module:${module?.slug || ""}`)) setActiveTab("area");
    await loadData();
    alert("Módulo eliminado del panel.");
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
      <SectorDecorations businessType={business.business_type} />
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
            <Link href="/docs" className="menu-item"><BookOpen size={17} /> Flowly Docs</Link>
            <Link href="/studio" className="menu-item"><Sparkles size={17} /> Flowly Studio</Link>
            <Link href="/ia-assistant" className="menu-item"><Bot size={17} /> IA Assistant</Link>
            <Link href="/studio/projects" className="menu-item"><Sparkles size={17} /> Nuevo proyecto</Link>
            <Link href="/studio/generator" className="menu-item"><Workflow size={17} /> Flowly Generator</Link>
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
                      { label: "Bandeja", tab: "module:whatsapp:bandeja" as ActiveTab },
                      { label: "Enviar", tab: "module:whatsapp:enviar" as ActiveTab },
                      { label: "Plantillas", tab: "module:whatsapp:plantillas" as ActiveTab },
                      { label: "Bots", tab: "module:whatsapp:bots" as ActiveTab },
                    ],
                    crm: [
                      { label: "Ficha 360", tab: "module:crm:ficha" as ActiveTab },
                      { label: "Contactos", tab: "module:crm:contactos" as ActiveTab },
                      { label: "Agenda CRM", tab: "module:crm:agenda" as ActiveTab },
                      { label: "Pipeline", tab: "module:crm:pipeline" as ActiveTab },
                      { label: "Hoy", tab: "module:crm:hoy" as ActiveTab },
                      { label: "Automatizaciones", tab: "module:crm:automatizaciones" as ActiveTab },
                    ],
                    billing: [
                      { label: "Ingresos", tab: "module:facturacion:ingresos" as ActiveTab },
                      { label: "Gastos", tab: "module:facturacion:gastos" as ActiveTab },
                      { label: "Presupuestos", tab: "module:facturacion:presupuestos" as ActiveTab },
                      { label: "Factura", tab: "module:facturacion:factura" as ActiveTab },
                      { label: "Configuración", tab: "module:facturacion:configuracion" as ActiveTab },
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
                  <span className="mt-2 inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">Panel tematizado · {sectorVisuals(business.business_type).label}</span>
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
            removeBusinessAvatar={removeBusinessAvatar}
            activeModules={activeModules}
            inactiveModules={inactiveModules}
            activateModule={activateModule}
            deactivateModule={deactivateModule}
          />}
          {activeModule && <ModuleSection business={business} integrations={businessIntegrations} reloadData={loadData} module={activeModule} records={moduleRecords.filter((r) => r.module_key === activeModule.key)} allRecords={moduleRecords} customers={customers} employees={employees} appointments={appointments} services={services} revenue={revenue} expenses={expenses} manualIncome={manualIncome} title={recordTitle} setTitle={setRecordTitle} notes={recordNotes} setNotes={setRecordNotes} amount={recordAmount} setAmount={setRecordAmount} status={recordStatus} setStatus={setRecordStatus} crmSearch={crmSearch} setCrmSearch={setCrmSearch} clinicalDocuments={clinicalDocuments} whatsappMessages={whatsappMessages} whatsappTemplatesEffective={whatsappTemplatesEffective} whatsappBotRules={whatsappBotRules} saveWhatsappTemplate={saveWhatsappTemplate} deleteWhatsappTemplate={deleteWhatsappTemplate} saveWhatsappMessage={saveWhatsappMessage} uploadClinicalDocument={uploadClinicalDocument} openClinicalDocument={openClinicalDocument} voiceCalls={voiceCalls} voiceCallerName={voiceCallerName} setVoiceCallerName={setVoiceCallerName} voiceCallerPhone={voiceCallerPhone} setVoiceCallerPhone={setVoiceCallerPhone} voiceReason={voiceReason} setVoiceReason={setVoiceReason} voiceTranscript={voiceTranscript} setVoiceTranscript={setVoiceTranscript} voiceIntent={voiceIntent} setVoiceIntent={setVoiceIntent} voiceStatus={voiceStatus} setVoiceStatus={setVoiceStatus} voicePriority={voicePriority} setVoicePriority={setVoicePriority} createVoiceCall={createVoiceCall} updateVoiceCallStatus={updateVoiceCallStatus} deleteVoiceCall={deleteVoiceCall} convertVoiceCallToCustomer={convertVoiceCallToCustomer} voiceScheduleCallId={voiceScheduleCallId} setVoiceScheduleCallId={setVoiceScheduleCallId} voiceScheduleEmployee={voiceScheduleEmployee} setVoiceScheduleEmployee={setVoiceScheduleEmployee} voiceScheduleService={voiceScheduleService} setVoiceScheduleService={setVoiceScheduleService} voiceScheduleDate={voiceScheduleDate} setVoiceScheduleDate={setVoiceScheduleDate} createAppointmentFromVoiceCall={createAppointmentFromVoiceCall} selectedCrmCustomerId={selectedCrmCustomerId} setSelectedCrmCustomerId={setSelectedCrmCustomerId} incomingVoiceCall={incomingVoiceCall} updateCustomerCrm={updateCustomerCrm} createCrmAction={createCrmAction} createAppointmentForCustomer={createAppointmentForCustomer} crmReminders={crmReminders} saveCrmReminder={saveCrmReminder} completeCrmReminder={completeCrmReminder} deleteCrmReminder={deleteCrmReminder} activeTab={activeTab} setActiveTab={setActiveTab} createRecord={createModuleRecord} deleteRecord={deleteModuleRecord} businessAvatar={businessAvatar} settings={settings} />}

          <DashboardFooter />

          {businessAvatar && <FloatingAvatarAssistant
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
          />}
        </section>
      </div>
    </Shell>
  );
}


function normalizeBusinessType(value?: string | null) {
  return (value || "otros").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_");
}

function sectorVisuals(value?: string | null) {
  const type = normalizeBusinessType(value);
  if (/(barber|barberia)/.test(type)) return { label: "Barbería", icons: ["💈", "✂️", "🪒", "🧴"], className: "sector-beauty" };
  if (/(pelu|hair)/.test(type)) return { label: "Peluquería", icons: ["✂️", "💇", "🪮", "🧴"], className: "sector-beauty" };
  if (/(estetica|spa|beauty|unas|nails)/.test(type)) return { label: "Estética", icons: ["💅", "✨", "🧴", "🌸"], className: "sector-beauty" };
  if (/(dental|odont)/.test(type)) return { label: "Dental", icons: ["🦷", "✚", "🩺", "💙"], className: "sector-health" };
  if (/(veterinaria|veterinario|vet)/.test(type)) return { label: "Veterinaria", icons: ["🐾", "🩺", "💙", "✚"], className: "sector-health" };
  if (/(clinic|clinica|salud|fisio|medic)/.test(type)) return { label: "Salud", icons: ["✚", "🩺", "💙", "🧬"], className: "sector-health" };
  if (/(restaurante|restaurant|food)/.test(type)) return { label: "Restaurante", icons: ["🍽️", "👨‍🍳", "🧾", "⭐"], className: "sector-food" };
  if (/(cafe|cafeteria|bar)/.test(type)) return { label: "Cafetería", icons: ["☕", "🥐", "🧾", "⭐"], className: "sector-food" };
  if (/(hotel|hostel|alojamiento)/.test(type)) return { label: "Hotel", icons: ["🏨", "🛎️", "🗓️", "⭐"], className: "sector-food" };
  if (/(taller|auto|mecan)/.test(type)) return { label: "Taller", icons: ["🔧", "⚙️", "🚗", "✅"], className: "sector-services" };
  if (/(instal|reforma|limpieza|servicio)/.test(type)) return { label: "Servicios", icons: ["⚙️", "🧰", "📍", "✅"], className: "sector-services" };
  if (/(gim|fitness|deporte)/.test(type)) return { label: "Fitness", icons: ["🏋️", "🏆", "⚡", "🎯"], className: "sector-training" };
  if (/(academia|school|autoescuela|formacion)/.test(type)) return { label: "Academia", icons: ["📚", "🎓", "⚡", "🎯"], className: "sector-training" };
  if (/(tienda|retail|comercio|ecommerce|ropa|tech|pos)/.test(type)) return { label: "Retail", icons: ["🛍️", "📦", "💳", "✨"], className: "sector-retail" };
  if (/(legal|abogado|asesoria|inmobiliaria)/.test(type)) return { label: "Profesional", icons: ["💼", "📄", "✍️", "✅"], className: "sector-services" };
  return { label: "Business", icons: ["✦", "⚡", "◈", "✺"], className: "sector-default" };
}

function SectorDecorations({ businessType }: { businessType?: string | null }) {
  const sector = sectorVisuals(businessType);
  return (
    <div className={`flowly-sector-decor ${sector.className}`} aria-hidden="true">
      <span className="sector-symbol sector-symbol-a">{sector.icons[0]}</span>
      <span className="sector-symbol sector-symbol-b">{sector.icons[1]}</span>
      <span className="sector-symbol sector-symbol-c">{sector.icons[2]}</span>
      <span className="sector-symbol sector-symbol-d">{sector.icons[3]}</span>
      <span className="sector-orb sector-orb-a" />
      <span className="sector-orb sector-orb-b" />
    </div>
  );
}

function DashboardFooter() {
  return (
    <footer className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 text-sm text-white/55 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-base font-semibold text-white">Flowly IA</p>
          <p className="mt-1 max-w-2xl">Sistema operativo modular para negocios modernos: clientes, agenda, WhatsApp, automatizaciones, marketing y operaciones en un solo panel.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-white/65">
          <Link href="/" className="hover:text-white">Quiénes somos</Link>
          <Link href="/privacy" className="hover:text-white">Política de privacidad</Link>
          <Link href="/legal/condiciones" className="hover:text-white">Condiciones</Link>
          <Link href="/contacto" className="hover:text-white">Soporte</Link>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <span>Protección de datos, confidencialidad empresarial y aislamiento por negocio.</span>
        <span className="sm:text-right">© Copyright 2026 Flowly · Versión 2.0</span>
      </div>
    </footer>
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
  const entrancePosition = { x: -12, y: 74, facing: "right" as const, label: "entrada", phrase: "Hola. Bienvenido de nuevo a tu panel de control." };
  const entrancePositionIndex = 99;

  const currentPosition = positionIndex === entrancePositionIndex ? entrancePosition : characterPositions[positionIndex % characterPositions.length];
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
    const origin = positionIndex === entrancePositionIndex ? entrancePosition : characterPositions[positionIndex % characterPositions.length];
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

  const runPanelWelcome = () => {
    setIsHidden(false);
    setOpen(false);
    setTravelFacing("right");
    setPositionIndex(entrancePositionIndex);
    setBubbleText("Voy entrando a tu panel...");
    setIsWalking(true);
    window.setTimeout(() => setPositionIndex(2), 220);
    window.setTimeout(() => {
      const greeting = "Hola. Bienvenido de nuevo a tu panel de control.";
      setIsWalking(false);
      setIsGreeting(true);
      setBubbleText(greeting);
      speak(greeting);
      window.setTimeout(() => setIsGreeting(false), 2600);
    }, 3300);
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
        const currentVisible = current === entrancePositionIndex ? 1 : current % characterPositions.length;
        const next = (currentVisible + 1) % characterPositions.length;
        const origin = characterPositions[currentVisible];
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
    const helloTimer = window.setTimeout(() => {
      setHasGreeted(true);
      runPanelWelcome();
    }, 900);
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
    setTravelFacing("right");
    setPositionIndex(entrancePositionIndex);
    setIsWalking(true);
    setBubbleText("Voy al centro del panel...");
    window.setTimeout(() => setPositionIndex(2), 180);
    window.setTimeout(() => {
      const greeting = `Hola. Bienvenido de nuevo a tu panel de control. Soy ${avatarName}.`;
      setIsWalking(false);
      setIsGreeting(true);
      setBubbleText(greeting);
      speak(greeting);
      window.setTimeout(() => setIsGreeting(false), 2600);
    }, 3200);
    if (!hasGreeted) setHasGreeted(true);
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
            {!activeModules.length && <Empty text="No hay módulos extra activos. El núcleo sigue funcionando con agenda, clientes, servicios, recordatorios, ajustes y facturación básica." />}
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

      <GlassCard title="Añadir módulos PRO"><div className="mb-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm text-cyan-50">Activa módulos PRO directamente desde tu panel. La facturación básica ya está incluida en Basic; los módulos extra se regularizarán en tu suscripción o con el equipo comercial según tu contrato.</div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{inactiveModules.map((item) => <ModuleAccessCard key={item.key} module={item} onActivate={() => activateModule(item.key)} />)}</div></GlassCard>
    </section>
  );
}

function ModuleSection(props: { business: Business | null; integrations: BusinessIntegration[]; reloadData: () => Promise<void>; module: ModuleItem; records: ModuleRecord[]; allRecords: ModuleRecord[]; customers: Customer[]; employees: Employee[]; appointments: Appointment[]; services: Service[]; revenue: number; expenses: number; manualIncome: number; title: string; setTitle: (v: string) => void; notes: string; setNotes: (v: string) => void; amount: string; setAmount: (v: string) => void; status: string; setStatus: (v: string) => void; crmSearch: string; setCrmSearch: (v: string) => void; clinicalDocuments: ClinicalDocument[]; whatsappMessages: WhatsappMessage[]; whatsappTemplatesEffective: WhatsappTemplate[]; whatsappBotRules: WhatsappBotRule[]; saveWhatsappTemplate: (template: WhatsappTemplate) => void; deleteWhatsappTemplate: (template: WhatsappTemplate) => void; saveWhatsappMessage: (customerId: string | null, phone: string, templateKey: string | null, message: string) => void; uploadClinicalDocument: (customerId: string, file: File, title?: string, documentType?: string, notes?: string) => void; openClinicalDocument: (document: ClinicalDocument) => Promise<void>; voiceCalls: VoiceCall[]; voiceCallerName: string; setVoiceCallerName: (v: string) => void; voiceCallerPhone: string; setVoiceCallerPhone: (v: string) => void; voiceReason: string; setVoiceReason: (v: string) => void; voiceTranscript: string; setVoiceTranscript: (v: string) => void; voiceIntent: string; setVoiceIntent: (v: string) => void; voiceStatus: string; setVoiceStatus: (v: string) => void; voicePriority: string; setVoicePriority: (v: string) => void; createVoiceCall: () => void; updateVoiceCallStatus: (id: string, status: string) => void; deleteVoiceCall: (id: string) => void; convertVoiceCallToCustomer: (call: VoiceCall) => void; voiceScheduleCallId: string; setVoiceScheduleCallId: (v: string) => void; voiceScheduleEmployee: string; setVoiceScheduleEmployee: (v: string) => void; voiceScheduleService: string; setVoiceScheduleService: (v: string) => void; voiceScheduleDate: string; setVoiceScheduleDate: (v: string) => void; createAppointmentFromVoiceCall: (call: VoiceCall) => void; selectedCrmCustomerId: string; setSelectedCrmCustomerId: (v: string) => void; incomingVoiceCall: VoiceCall | null; updateCustomerCrm: (customerId: string, updates: Partial<Customer>) => void; createCrmAction: (customerId: string, title: string, notes: string, status?: string, dueDate?: string) => void; createAppointmentForCustomer: (customerId: string, employeeId: string, serviceId: string, dateValue: string) => void; crmReminders: CrmReminder[]; saveCrmReminder: (customerId: string, title: string, remindAt: string, notes?: string) => void; completeCrmReminder: (id: string) => void; deleteCrmReminder: (id: string) => void; activeTab: ActiveTab; setActiveTab: (tab: ActiveTab) => void; createRecord: (moduleKey: string, defaultStatus?: string) => void; deleteRecord: (id: string) => void; businessAvatar?: BusinessAvatar | null; settings?: BookingSettings | null }) {
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
  if (module.key === "client_portal") {
    const portalFeatures = [
      { title: "Citas y reservas", body: "El cliente ve sus próximas citas, horarios y confirmaciones sin llamar al negocio.", Icon: CalendarDays },
      { title: "Documentos", body: "Presupuestos, facturas, consentimientos o archivos importantes en un espacio privado.", Icon: FileText },
      { title: "Pagos y cobros", body: "Estado de facturas, importes pendientes y acceso directo a métodos de pago.", Icon: CreditCard },
      { title: "Solicitudes", body: "Formulario ordenado para pedir cambios, soporte, citas o información adicional.", Icon: MessageCircle },
    ];
    const portalSteps = ["Invitación por WhatsApp o email", "Acceso privado del cliente", "Consulta de citas/documentos", "Solicitud o pago enviado"];
    return (
      <section className="grid gap-6">
        <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-[radial-gradient(circle_at_12%_20%,rgba(34,211,238,.24),transparent_30%),radial-gradient(circle_at_88%_10%,rgba(167,139,250,.22),transparent_32%),linear-gradient(135deg,rgba(2,6,23,.98),rgba(15,23,42,.94))] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="grid gap-8 xl:grid-cols-[1fr_.8fr] xl:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100"><ShieldCheck size={15} /> Área Cliente PRO</div>
              <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">Un portal privado que hace que el negocio parezca más grande, más serio y más fácil de comprar.</h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60">Centraliza citas, documentos, facturas, solicitudes y pagos en una experiencia limpia para el cliente final. No es una lista de registros: es una zona premium para aumentar confianza y reducir mensajes repetidos.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => selectModuleSubmenu(setActiveTab, "module:portal-cliente:inicio" as ActiveTab, setTab, "Inicio")} className="btn-primary"><Sparkles size={17} /> Diseñar portal</button>
                <button onClick={() => selectModuleSubmenu(setActiveTab, "module:portal-cliente:accesos" as ActiveTab, setTab, "Accesos")} className="btn-secondary"><ShieldCheck size={17} /> Gestionar accesos</button>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-xl shadow-black/20">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/65 p-4">
                <div className="flex items-center justify-between"><p className="font-semibold">Vista del cliente</p><span className="rounded-full bg-green-400/15 px-3 py-1 text-xs text-green-100">Activo</span></div>
                <div className="mt-5 grid gap-3">
                  {["Próxima cita confirmada", "Factura pendiente", "Documento listo para descargar", "Solicitud enviada"].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4"><p className="text-sm font-semibold">{item}</p><p className="mt-1 text-xs text-white/42">Visible en el portal privado</p></div>)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Clientes" value={customers.length} />
          <MetricCard label="Solicitudes" value={records.filter((record) => record.status === "request").length} />
          <MetricCard label="Accesos" value={records.filter((record) => record.status === "access").length} />
          <MetricCard label="Estado" value="Premium" />
        </div>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <GlassCard title="Qué verá tu cliente">
            <div className="grid gap-4 md:grid-cols-2">
              {portalFeatures.map(({ title: featureTitle, body, Icon: FeatureIcon }) => (
                <div key={featureTitle} className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 transition hover:border-cyan-300/25 hover:bg-white/[0.08]">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100"><FeatureIcon size={19} /></div>
                  <p className="font-semibold">{featureTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-white/50">{body}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="Configurar acceso">
            <div className="mb-5 space-y-3">
              {portalSteps.map((step, index) => <div key={step} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-950">{index + 1}</span><p className="text-sm leading-6 text-white/65">{step}</p></div>)}
            </div>
            <div className="grid gap-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nombre del acceso, página o solicitud" className="input-dark" />
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-dark">
                {cfg.statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Descripción, URL privada, instrucciones de acceso o mensaje para el cliente" className="input-dark min-h-28" />
              <button onClick={() => createRecord(module.key, status || "published")} className="btn-primary"><Plus size={17} /> Crear elemento del portal</button>
            </div>
          </GlassCard>
        </section>

        <GlassCard title="Elementos del Área Cliente">
          <div className="grid gap-3 md:grid-cols-3">
            {records.slice(0, 9).map((record) => <div key={record.id} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4"><p className="font-semibold">{record.title}</p><p className="mt-1 text-xs text-white/45">{record.status} · {new Date(record.created_at).toLocaleDateString("es-ES")}</p>{record.notes && <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/48">{record.notes}</p>}</div>)}
            {!records.length && <div className="md:col-span-3"><Empty text="Crea el primer acceso, solicitud o contenido del portal." /></div>}
          </div>
        </GlassCard>
      </section>
    );
  }
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

function BillingModule({ business, reloadData, records, appointments, customers, revenue, expenses, manualIncome, title, setTitle, notes, setNotes, amount, setAmount, status, setStatus, createRecord, deleteRecord, activeTab, setActiveTab }: Parameters<typeof ModuleSection>[0]) {
  const [view, setView] = useState("Ingresos");
  const configRecord = records.find((record) => record.status === "billing_config");
  const config = useMemo(() => {
    try {
      return configRecord?.notes ? JSON.parse(configRecord.notes) as Record<string, string> : {};
    } catch {
      return {} as Record<string, string>;
    }
  }, [configRecord?.notes]);

  const [invoiceCompanyName, setInvoiceCompanyName] = useState(config.companyName || business?.name || "");
  const [invoiceTaxId, setInvoiceTaxId] = useState(config.taxId || "");
  const [invoiceAddress, setInvoiceAddress] = useState(config.address || "");
  const [invoiceEmail, setInvoiceEmail] = useState(config.email || "");
  const [invoicePhone, setInvoicePhone] = useState(config.phone || "");
  const [invoiceLogoUrl, setInvoiceLogoUrl] = useState(config.logoUrl || business?.logo_url || "");
  const [invoiceLogoFile, setInvoiceLogoFile] = useState<File | null>(null);
  const [isSavingBillingConfig, setIsSavingBillingConfig] = useState(false);
  const [invoicePrefix, setInvoicePrefix] = useState(config.invoicePrefix || "F-2026-");
  const [quotePrefix, setQuotePrefix] = useState(config.quotePrefix || "PRES-2026-");
  const [defaultTax, setDefaultTax] = useState(config.defaultTax || "16");
  const [paymentMethods, setPaymentMethods] = useState(config.paymentMethods || "Efectivo, transferencia, pago móvil, tarjeta y divisas");
  const [agendaMode, setAgendaMode] = useState(config.agendaMode || "Crear factura desde cita completada");
  const [accountantEmail, setAccountantEmail] = useState(config.accountantEmail || "");

  const nextInvoiceNumber = `${invoicePrefix}${String(records.filter((record) => ["income", "paid", "pending", "overdue"].includes(record.status)).length + 1).padStart(4, "0")}`;
  const [documentType, setDocumentType] = useState<"invoice" | "quote">("invoice");
  const [invoiceNumber, setInvoiceNumber] = useState(nextInvoiceNumber);
  const [invoiceCustomerId, setInvoiceCustomerId] = useState("");
  const [invoiceCustomerName, setInvoiceCustomerName] = useState("");
  const [invoiceCustomerTaxId, setInvoiceCustomerTaxId] = useState("");
  const [invoiceCustomerEmail, setInvoiceCustomerEmail] = useState("");
  const [invoiceCustomerAddress, setInvoiceCustomerAddress] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [invoiceDueDate, setInvoiceDueDate] = useState("");
  const [invoiceLineConcept, setInvoiceLineConcept] = useState("");
  const [invoiceLineQuantity, setInvoiceLineQuantity] = useState("1");
  const [invoiceLinePrice, setInvoiceLinePrice] = useState("");
  const [invoiceLineTax, setInvoiceLineTax] = useState(defaultTax || "0");
  const [invoicePaymentStatus, setInvoicePaymentStatus] = useState("pending");
  const [invoiceExtraNotes, setInvoiceExtraNotes] = useState("");

  const [billingFile, setBillingFile] = useState<File | null>(null);
  const [billingFileType, setBillingFileType] = useState<"income" | "expense">("income");
  const [billingFileTitle, setBillingFileTitle] = useState("");
  const [billingFileAmount, setBillingFileAmount] = useState("");
  const [billingFileCounterparty, setBillingFileCounterparty] = useState("");
  const [billingFileDate, setBillingFileDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [billingFileNotes, setBillingFileNotes] = useState("");
  const [isUploadingBillingFile, setIsUploadingBillingFile] = useState(false);

  useEffect(() => {
    setInvoiceCompanyName(config.companyName || business?.name || "");
    setInvoiceTaxId(config.taxId || "");
    setInvoiceAddress(config.address || "");
    setInvoiceEmail(config.email || "");
    setInvoicePhone(config.phone || "");
    setInvoiceLogoUrl(config.logoUrl || business?.logo_url || "");
    setInvoicePrefix(config.invoicePrefix || "F-2026-");
    setQuotePrefix(config.quotePrefix || "PRES-2026-");
    setDefaultTax(config.defaultTax || "16");
    setPaymentMethods(config.paymentMethods || "Efectivo, transferencia, pago móvil, tarjeta y divisas");
    setAgendaMode(config.agendaMode || "Crear factura desde cita completada");
    setAccountantEmail(config.accountantEmail || "");
  }, [config, business?.name, business?.logo_url]);

  useEffect(() => {
    syncModuleSubmenu(activeTab, "module:facturacion:", { ingresos: "Ingresos", gastos: "Gastos", presupuestos: "Presupuestos", factura: "Factura", configuracion: "Configuración" }, setView);
  }, [activeTab]);
  useEffect(() => {
    const nextStatus = view === "Gastos" ? "expense" : view === "Presupuestos" ? "budget" : view === "Configuración" ? "billing_config" : view === "Factura" ? "pending" : "income";
    setStatus(nextStatus);
    if (view === "Gastos") setBillingFileType("expense");
    if (view === "Ingresos") setBillingFileType("income");
    if (view === "Presupuestos") {
      setDocumentType("quote");
      setInvoiceNumber(`${quotePrefix}${String(records.filter((record) => record.status === "budget").length + 1).padStart(4, "0")}`);
      setInvoicePaymentStatus("pending");
    }
    if (view === "Factura") {
      setDocumentType("invoice");
      setInvoiceNumber(nextInvoiceNumber);
    }
  }, [view, setStatus, quotePrefix, records, nextInvoiceNumber]);

  const parseBillingMetadata = (record: ModuleRecord) => {
    try {
      const parsed = record.notes ? JSON.parse(record.notes) as Record<string, unknown> : null;
      return parsed && typeof parsed === "object" && parsed.flowly_billing ? parsed : null;
    } catch {
      return null;
    }
  };

  const saveBillingConfig = async () => {
    if (!business) return alert("No se ha encontrado el negocio.");
    setIsSavingBillingConfig(true);
    try {
      let finalLogoUrl = invoiceLogoUrl;
      if (invoiceLogoFile) {
        const safeName = invoiceLogoFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${business.id}/config/logo-${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from("billing_documents").upload(path, invoiceLogoFile, { upsert: false, contentType: invoiceLogoFile.type });
        if (uploadError) throw new Error(uploadError.message);
        const { data } = await supabase.storage.from("billing_documents").createSignedUrl(path, 60 * 60 * 24 * 365);
        finalLogoUrl = data?.signedUrl || finalLogoUrl;
        setInvoiceLogoUrl(finalLogoUrl);
      }
      const payload = { companyName: invoiceCompanyName, taxId: invoiceTaxId, address: invoiceAddress, email: invoiceEmail, phone: invoicePhone, logoUrl: finalLogoUrl, invoicePrefix, quotePrefix, defaultTax, paymentMethods, agendaMode, accountantEmail };
      const row = { business_id: business.id, module_key: "billing", title: "Configuración de facturación básica", amount: null, status: "billing_config", notes: JSON.stringify(payload, null, 2) };
      const result = configRecord?.id
        ? await supabase.from("module_records").update(row).eq("id", configRecord.id).eq("business_id", business.id)
        : await supabase.from("module_records").insert(row);
      if (result.error) throw new Error(result.error.message);
      setInvoiceLogoFile(null);
      await reloadData();
      alert("Configuración de facturación guardada.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo guardar la configuración.");
    } finally {
      setIsSavingBillingConfig(false);
    }
  };

  const relationOne = <T,>(value: Relation<T>) => Array.isArray(value) ? value[0] : value;
  const fillCustomerFromCrm = (customerId: string) => {
    setInvoiceCustomerId(customerId);
    const customer = customers.find((item) => item.id === customerId);
    if (!customer) return;
    setInvoiceCustomerName(customer.name || customer.full_name || "");
    setInvoiceCustomerEmail(customer.email || "");
    setInvoiceCustomerTaxId(customer.document_number || "");
    setInvoiceCustomerAddress(customer.address || "");
  };

  const prepareInvoiceFromAppointment = (appointment: Appointment) => {
    const customer = relationOne(appointment.customers);
    const service = relationOne(appointment.services);
    const customerName = customer?.name || customer?.full_name || "Cliente";
    const serviceName = service?.name || "Servicio de agenda";
    const price = Number(service?.price || 0);
    setView("Ingresos");
    setActiveTab("module:facturacion:ingresos");
    setStatus("income");
    setDocumentType("invoice");
    setInvoiceNumber(nextInvoiceNumber);
    setInvoiceCustomerName(customerName);
    setInvoiceLineConcept(serviceName);
    setInvoiceLinePrice(price ? String(price) : "");
    setInvoicePaymentStatus("pending");
    setInvoiceExtraNotes(`Origen: Agenda\nFecha de cita: ${appointment.appointment_date || appointment.starts_at || "Sin fecha"}`);
    setTitle(`Factura · ${customerName} · ${serviceName}`);
    setAmount(price ? String(price) : "");
    setNotes([
      `Origen: Agenda`,
      `Cliente: ${customerName}`,
      `Servicio: ${serviceName}`,
      `Fecha de cita: ${appointment.appointment_date || appointment.starts_at || "Sin fecha"}`,
      `Métodos de pago: ${paymentMethods}`,
      `IVA/Impuesto por defecto: ${defaultTax}%`,
    ].join("\n"));
  };

  const quantity = Number(invoiceLineQuantity || 0);
  const unitPrice = Number(invoiceLinePrice || 0);
  const taxRate = Number(invoiceLineTax || 0);
  const subtotal = quantity * unitPrice;
  const taxTotal = subtotal * (taxRate / 100);
  const invoiceTotal = subtotal + taxTotal;

  const uploadedDocuments = records.filter((record) => Boolean(parseBillingMetadata(record)?.file_path));
  const incomeRecords = records.filter((record) => ["income", "paid", "pending", "overdue"].includes(record.status));
  const expenseRecords = records.filter((record) => record.status === "expense");
  const pendingAmount = incomeRecords.filter((record) => ["pending", "overdue", "income"].includes(record.status)).reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const paidAmount = incomeRecords.filter((record) => record.status === "paid").reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const expensesTotal = expenseRecords.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const incomeTotal = incomeRecords.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const profit = incomeTotal + revenue - expensesTotal;
  const maxChartValue = Math.max(incomeTotal + revenue, expensesTotal, paidAmount, pendingAmount, 1);

  const buildInvoicePayload = () => ({
    flowly_billing: true,
    kind: documentType,
    number: invoiceNumber || (documentType === "invoice" ? nextInvoiceNumber : `${quotePrefix}${String(records.filter((record) => record.status === "budget").length + 1).padStart(4, "0")}`),
    date: invoiceDate,
    due_date: invoiceDueDate,
    customer_id: invoiceCustomerId || null,
    customer_name: invoiceCustomerName,
    customer_tax_id: invoiceCustomerTaxId,
    customer_email: invoiceCustomerEmail,
    customer_address: invoiceCustomerAddress,
    concept: invoiceLineConcept,
    quantity,
    unit_price: unitPrice,
    tax_rate: taxRate,
    subtotal,
    tax_total: taxTotal,
    total: invoiceTotal,
    status: invoicePaymentStatus,
    notes: invoiceExtraNotes,
  });

  const documentStatus = documentType === "quote" ? "budget" : invoicePaymentStatus === "paid" ? "paid" : invoicePaymentStatus === "overdue" ? "overdue" : "pending";
  const saveGeneratedInvoice = async (openPdf = true) => {
    if (!business) return alert("No se ha encontrado el negocio.");
    if (!invoiceCustomerName.trim()) return alert("Añade el cliente de la factura.");
    if (!invoiceLineConcept.trim()) return alert("Añade al menos un concepto.");
    const payload = buildInvoicePayload();
    const row = {
      business_id: business.id,
      module_key: "billing",
      title: `${documentType === "invoice" ? "Factura" : "Presupuesto"} ${payload.number} · ${invoiceCustomerName}`,
      amount: invoiceTotal,
      status: documentStatus,
      notes: JSON.stringify(payload, null, 2),
    };
    const { error } = await supabase.from("module_records").insert(row);
    if (error) return alert(error.message);
    if (openPdf) openInvoicePdf(payload);
    await reloadData();
    setInvoiceNumber(`${invoicePrefix}${String(records.length + 2).padStart(4, "0")}`);
    setInvoiceLineConcept("");
    setInvoiceLinePrice("");
    setInvoiceExtraNotes("");
  };

  const openInvoicePdf = (payload = buildInvoicePayload()) => {
    const htmlEntities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" };
    const escape = (value: unknown) => String(value ?? "").replace(/[&<>"]/g, (char) => htmlEntities[char] || char);
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) return alert("El navegador ha bloqueado la ventana del PDF.");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escape(payload.number)}</title><style>
      *{box-sizing:border-box} body{font-family:Inter,Arial,sans-serif;margin:0;background:#f3f6fb;color:#101828}.page{width:210mm;min-height:297mm;margin:0 auto;background:#fff;padding:34px}.top{display:flex;justify-content:space-between;gap:28px;border-bottom:1px solid #e5e7eb;padding-bottom:24px}.brand{display:flex;gap:14px;align-items:center}.logo{width:58px;height:58px;border-radius:18px;object-fit:cover;border:1px solid #e5e7eb}.logoFallback{width:58px;height:58px;border-radius:18px;background:#0f172a;color:white;display:flex;align-items:center;justify-content:center;font-weight:800}.muted{color:#667085}.title{text-align:right}.title h1{margin:0;font-size:34px;letter-spacing:-.04em}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:28px}.box{border:1px solid #e5e7eb;border-radius:20px;padding:18px;background:#fbfcff}.box h3{margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#667085}table{width:100%;border-collapse:collapse;margin-top:30px}th{text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#667085;border-bottom:1px solid #e5e7eb;padding:12px}td{padding:16px 12px;border-bottom:1px solid #eef2f7}.right{text-align:right}.totals{margin-left:auto;margin-top:24px;width:310px}.totals div{display:flex;justify-content:space-between;padding:10px 0}.grand{font-size:24px;font-weight:800;border-top:1px solid #e5e7eb}.notes{margin-top:30px;border-radius:20px;background:#f8fafc;padding:18px;white-space:pre-wrap}.footer{margin-top:34px;color:#98a2b3;font-size:12px}@media print{body{background:white}.page{width:auto;min-height:auto;margin:0;padding:24px}.noPrint{display:none}}
    </style></head><body><main class="page"><section class="top"><div class="brand">${invoiceLogoUrl ? `<img class="logo" src="${escape(invoiceLogoUrl)}" />` : `<div class="logoFallback">F</div>`}<div><h2>${escape(invoiceCompanyName || business?.name || "Tu empresa")}</h2><p class="muted">${escape(invoiceTaxId || "ID fiscal")}</p><p class="muted">${escape(invoiceAddress || "Dirección")}</p><p class="muted">${escape(invoiceEmail || "")} ${escape(invoicePhone || "")}</p></div></div><div class="title"><h1>${payload.kind === "quote" ? "Presupuesto" : "Factura"}</h1><p><strong>${escape(payload.number)}</strong></p><p class="muted">Fecha: ${escape(payload.date)}</p><p class="muted">Vencimiento: ${escape(payload.due_date || "—")}</p></div></section><section class="grid"><div class="box"><h3>Cliente</h3><p><strong>${escape(payload.customer_name)}</strong></p><p class="muted">${escape(payload.customer_tax_id || "")}</p><p class="muted">${escape(payload.customer_email || "")}</p><p class="muted">${escape(payload.customer_address || "")}</p></div><div class="box"><h3>Pago</h3><p>${escape(paymentMethods)}</p><p class="muted">Estado: ${escape(payload.status)}</p></div></section><table><thead><tr><th>Concepto</th><th class="right">Cantidad</th><th class="right">Precio</th><th class="right">Impuesto</th><th class="right">Total</th></tr></thead><tbody><tr><td>${escape(payload.concept)}</td><td class="right">${escape(payload.quantity)}</td><td class="right">${Number(payload.unit_price).toFixed(2)}</td><td class="right">${Number(payload.tax_rate).toFixed(2)}%</td><td class="right">${Number(payload.total).toFixed(2)}</td></tr></tbody></table><section class="totals"><div><span>Subtotal</span><strong>${Number(payload.subtotal).toFixed(2)}</strong></div><div><span>Impuestos</span><strong>${Number(payload.tax_total).toFixed(2)}</strong></div><div class="grand"><span>Total</span><span>${Number(payload.total).toFixed(2)}</span></div></section>${payload.notes ? `<section class="notes">${escape(payload.notes)}</section>` : ""}<p class="footer">Documento generado desde Flowly IA. Puedes imprimir o guardar como PDF desde esta ventana.</p><button class="noPrint" onclick="window.print()" style="margin-top:18px;padding:12px 18px;border:0;border-radius:999px;background:#0f172a;color:white;font-weight:700">Guardar / imprimir PDF</button></main></body></html>`;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 450);
  };

  const uploadBillingDocument = async () => {
    if (!business) return alert("No se ha encontrado el negocio.");
    if (!billingFileTitle.trim() && !billingFile) return alert("Añade un concepto o adjunta una factura.");
    setIsUploadingBillingFile(true);
    try {
      let path = "";
      if (billingFile) {
        const safeName = billingFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        path = `${business.id}/${billingFileType}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from("billing_documents").upload(path, billingFile, { upsert: false, contentType: billingFile.type });
        if (uploadError) throw new Error(uploadError.message);
      }
      const metadata = { flowly_billing: true, file_path: path || null, file_name: billingFile?.name || null, file_type: billingFile?.type || null, file_size: billingFile?.size || null, kind: billingFileType, counterparty: billingFileCounterparty, document_date: billingFileDate, notes: billingFileNotes, manual_entry: !billingFile };
      const { error } = await supabase.from("module_records").insert({ business_id: business.id, module_key: "billing", title: billingFileTitle || `${billingFileType === "income" ? "Ingreso" : "Gasto"} manual`, amount: billingFileAmount ? Number(billingFileAmount) : null, status: billingFileType === "income" ? "income" : "expense", notes: JSON.stringify(metadata, null, 2) });
      if (error) throw new Error(error.message);
      setBillingFile(null);
      setBillingFileTitle("");
      setBillingFileAmount("");
      setBillingFileCounterparty("");
      setBillingFileNotes("");
      await reloadData();
      alert(billingFile ? "Documento subido a facturación." : "Registro manual guardado.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo guardar el registro");
    } finally {
      setIsUploadingBillingFile(false);
    }
  };

  const openBillingDocument = async (record: ModuleRecord) => {
    const metadata = parseBillingMetadata(record);
    const filePath = typeof metadata?.file_path === "string" ? metadata.file_path : "";
    if (!filePath) return alert("Este registro no tiene archivo adjunto.");
    const { data, error } = await supabase.storage.from("billing_documents").createSignedUrl(filePath, 60 * 5);
    if (error || !data?.signedUrl) return alert(error?.message || "No se pudo abrir el documento.");
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const sendToAccountant = () => {
    if (!accountantEmail) return alert("Añade el correo del gestor en Configuración.");
    const subject = encodeURIComponent(`Facturación ${invoiceCompanyName || business?.name || "Flowly"}`);
    const body = encodeURIComponent(`Hola,\n\nTe envío el resumen de facturación desde Flowly.\n\nIngresos: ${(incomeTotal + revenue).toFixed(2)}\nGastos: ${expensesTotal.toFixed(2)}\nResultado: ${profit.toFixed(2)}\nDocumentos subidos: ${uploadedDocuments.length}\n\nPuedes revisar los PDFs y facturas adjuntos desde el panel de Flowly.\n\nGracias.`);
    window.location.href = `mailto:${accountantEmail}?subject=${subject}&body=${body}`;
  };

  const viewStatus = view === "Gastos" ? "expense" : view === "Presupuestos" ? "budget" : view === "Configuración" ? "billing_config" : view === "Factura" ? "pending" : "income";
  const viewRecords = records.filter((record) => {
    if (view === "Ingresos") return record.status === "income" || record.status === "paid";
    if (view === "Factura") return ["pending", "paid", "overdue"].includes(record.status);
    return record.status === viewStatus;
  });

  return <section className="grid gap-6">
    <ModuleHero eyebrow="Incluido en Basic" title="Facturación" description="Gestiona ingresos, gastos, presupuestos, facturas PDF y la configuración básica de tus documentos desde un único panel claro y conectado con Flowly." actions={<ModulePillTabs tabs={["Ingresos", "Gastos", "Presupuestos", "Factura", "Configuración"]} active={view} setActive={(next) => selectModuleSubmenu(setActiveTab, ({ Ingresos: "module:facturacion:ingresos", Gastos: "module:facturacion:gastos", Presupuestos: "module:facturacion:presupuestos", Factura: "module:facturacion:factura", Configuración: "module:facturacion:configuracion" } as Record<string, ActiveTab>)[next] || "module:facturacion:ingresos", setView, next)} />} />

    <div className="grid gap-4 md:grid-cols-4"><Metric icon={<Receipt />} label="Ingresos" value={`${(incomeTotal + revenue).toFixed(2)}€`} helper="Manuales y facturas" /><Metric icon={<CreditCard />} label="Gastos" value={`${expensesTotal.toFixed(2)}€`} helper="Manuales y facturas" /><Metric icon={<TrendingUp />} label="Resultado" value={`${profit.toFixed(2)}€`} helper="Ingresos - gastos" /><Metric icon={<FileText />} label="Archivos" value={uploadedDocuments.length} helper="Adjuntos privados" /></div>

    <GlassCard title="Estadísticas automáticas"><div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><div className="space-y-4">{[{ label: "Ingresos", value: incomeTotal + revenue }, { label: "Gastos", value: expensesTotal }, { label: "Pagado", value: paidAmount }, { label: "Pendiente", value: pendingAmount }].map((item) => <div key={item.label}><div className="mb-2 flex justify-between text-sm"><span className="text-white/65">{item.label}</span><strong>{item.value.toFixed(2)}€</strong></div><div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-200" style={{ width: `${Math.max(4, (item.value / maxChartValue) * 100)}%` }} /></div></div>)}</div><div className="grid gap-3"><InfoBox label="Presupuestos" value={records.filter((record) => record.status === "budget").length} /><InfoBox label="Facturas" value={records.filter((record) => ["pending", "paid", "overdue"].includes(record.status)).length} /><InfoBox label="Resultado" value={`${profit.toFixed(2)}€`} /></div></div></GlassCard>

    {view === "Configuración" && <section className="grid gap-6 xl:grid-cols-[1fr_.85fr]">
      <GlassCard title="Configuración de facturación básica">
        <div className="grid gap-3 md:grid-cols-2">
          <input value={invoiceCompanyName} onChange={(e) => setInvoiceCompanyName(e.target.value)} placeholder="Nombre comercial / razón social" className="input-dark" />
          <input value={invoiceTaxId} onChange={(e) => setInvoiceTaxId(e.target.value)} placeholder="RIF / cédula / identificación fiscal" className="input-dark" />
          <input value={invoiceEmail} onChange={(e) => setInvoiceEmail(e.target.value)} placeholder="Correo de facturación" className="input-dark" />
          <input value={invoicePhone} onChange={(e) => setInvoicePhone(e.target.value)} placeholder="Teléfono / WhatsApp" className="input-dark" />
          <input value={invoiceAddress} onChange={(e) => setInvoiceAddress(e.target.value)} placeholder="Dirección fiscal o comercial" className="input-dark md:col-span-2" />
          <input value={invoiceLogoUrl} onChange={(e) => setInvoiceLogoUrl(e.target.value)} placeholder="URL del logo para PDFs o sube una imagen debajo" className="input-dark md:col-span-2" />
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setInvoiceLogoFile(e.target.files?.[0] || null)} className="input-dark md:col-span-2" />
          <input value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} placeholder="Prefijo facturas, ej. F-2026-" className="input-dark" />
          <input value={quotePrefix} onChange={(e) => setQuotePrefix(e.target.value)} placeholder="Prefijo presupuestos, ej. PRES-2026-" className="input-dark" />
          <input value={defaultTax} onChange={(e) => setDefaultTax(e.target.value)} placeholder="Impuesto/IVA por defecto" type="number" className="input-dark" />
          <input value={agendaMode} onChange={(e) => setAgendaMode(e.target.value)} placeholder="Conexión con Agenda, ej. facturar cita completada" className="input-dark" />
          <input value={accountantEmail} onChange={(e) => setAccountantEmail(e.target.value)} placeholder="Email del gestor / contador" type="email" className="input-dark md:col-span-2" />
          <textarea value={paymentMethods} onChange={(e) => setPaymentMethods(e.target.value)} placeholder="Métodos de pago visibles en factura" className="input-dark min-h-28 md:col-span-2" />
          <button onClick={saveBillingConfig} disabled={isSavingBillingConfig} className="btn-primary md:col-span-2 disabled:cursor-not-allowed disabled:opacity-60"><CheckCircle2 size={17} /> {isSavingBillingConfig ? "Guardando..." : "Guardar configuración"}</button>
          <button type="button" onClick={() => alert("Preparado para futuras conexiones de facturación electrónica.")} className="btn-secondary md:col-span-2"><Workflow size={17} /> Conectar</button>
        </div>
      </GlassCard>
      <GlassCard title="Vista previa del documento">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-sm text-white/75">
          <div className="mb-5 flex items-center gap-3">{invoiceLogoUrl ? <img src={invoiceLogoUrl} alt="Logo facturación" className="h-12 w-12 rounded-2xl object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15"><Receipt size={20} /></div>}<div><p className="font-semibold text-white">{invoiceCompanyName || business?.name || "Tu empresa"}</p><p className="text-xs text-white/45">{invoiceTaxId || "RIF / ID fiscal"}</p></div></div>
          <p>Factura: {invoicePrefix}0001</p><p>Presupuesto: {quotePrefix}0001</p><p>Impuesto por defecto: {defaultTax || "0"}%</p><p>Gestor: {accountantEmail || "Pendiente"}</p><p className="mt-3 whitespace-pre-wrap">Pagos: {paymentMethods}</p>
        </div>
      </GlassCard>
    </section>}


    {view === "Ingresos" && <section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
      <GlassCard title="Ingresos: anotar manualmente o adjuntar factura"><BillingUploadForm billingFileType={billingFileType} setBillingFileType={setBillingFileType} billingFileTitle={billingFileTitle} setBillingFileTitle={setBillingFileTitle} billingFileAmount={billingFileAmount} setBillingFileAmount={setBillingFileAmount} billingFileCounterparty={billingFileCounterparty} setBillingFileCounterparty={setBillingFileCounterparty} billingFileDate={billingFileDate} setBillingFileDate={setBillingFileDate} billingFileNotes={billingFileNotes} setBillingFileNotes={setBillingFileNotes} setBillingFile={setBillingFile} uploadBillingDocument={uploadBillingDocument} isUploadingBillingFile={isUploadingBillingFile} forcedType="income" /></GlassCard>
      <GlassCard title="Ingresos registrados"><BillingRecordsList records={viewRecords} deleteRecord={deleteRecord} openBillingDocument={openBillingDocument} openInvoicePdf={openInvoicePdf} parseBillingMetadata={parseBillingMetadata} /></GlassCard>
    </section>}

    {(view === "Presupuestos" || view === "Factura") && <section className="grid gap-6 xl:grid-cols-[1fr_.9fr]">
      <GlassCard title={view === "Presupuestos" ? "Generar presupuesto en PDF" : "Generar factura en PDF"}>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white">{view === "Presupuestos" ? "Presupuesto" : "Factura"}</div>
          <input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="Número" className="input-dark" />
          <select value={invoiceCustomerId} onChange={(e) => fillCustomerFromCrm(e.target.value)} className="input-dark md:col-span-2"><option value="">Seleccionar cliente del CRM (opcional)</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name || customer.full_name || customer.phone || "Cliente"}</option>)}</select>
          <input value={invoiceCustomerName} onChange={(e) => setInvoiceCustomerName(e.target.value)} placeholder="Cliente / razón social" className="input-dark" />
          <input value={invoiceCustomerTaxId} onChange={(e) => setInvoiceCustomerTaxId(e.target.value)} placeholder="RIF / cédula cliente" className="input-dark" />
          <input value={invoiceCustomerEmail} onChange={(e) => setInvoiceCustomerEmail(e.target.value)} placeholder="Email cliente" className="input-dark" />
          <input value={invoiceCustomerAddress} onChange={(e) => setInvoiceCustomerAddress(e.target.value)} placeholder="Dirección cliente" className="input-dark" />
          <input value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} type="date" className="input-dark" />
          <input value={invoiceDueDate} onChange={(e) => setInvoiceDueDate(e.target.value)} type="date" className="input-dark" />
          <input value={invoiceLineConcept} onChange={(e) => setInvoiceLineConcept(e.target.value)} placeholder="Concepto / servicio" className="input-dark md:col-span-2" />
          <input value={invoiceLineQuantity} onChange={(e) => setInvoiceLineQuantity(e.target.value)} placeholder="Cantidad" type="number" className="input-dark" />
          <input value={invoiceLinePrice} onChange={(e) => setInvoiceLinePrice(e.target.value)} placeholder="Precio unitario" type="number" className="input-dark" />
          <input value={invoiceLineTax} onChange={(e) => setInvoiceLineTax(e.target.value)} placeholder="Impuesto %" type="number" className="input-dark" />
          <select value={invoicePaymentStatus} onChange={(e) => setInvoicePaymentStatus(e.target.value)} className="input-dark"><option value="pending">Pendiente</option><option value="paid">Pagada</option><option value="overdue">Vencida</option></select>
          <textarea value={invoiceExtraNotes} onChange={(e) => setInvoiceExtraNotes(e.target.value)} placeholder="Notas visibles o internas" className="input-dark min-h-24 md:col-span-2" />
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm text-cyan-50 md:col-span-2"><p className="font-semibold">Total: {invoiceTotal.toFixed(2)}€</p><p className="mt-1 text-cyan-50/70">Subtotal {subtotal.toFixed(2)} · Impuesto {taxTotal.toFixed(2)}</p></div>
          <button onClick={() => saveGeneratedInvoice(true)} className="btn-primary md:col-span-2"><FileText size={17} /> Guardar y generar PDF</button>
        </div>
      </GlassCard>
      <GlassCard title={view === "Presupuestos" ? "Presupuestos registrados" : "Facturas registradas"}><BillingRecordsList records={viewRecords} deleteRecord={deleteRecord} openBillingDocument={openBillingDocument} openInvoicePdf={openInvoicePdf} parseBillingMetadata={parseBillingMetadata} /></GlassCard>
    </section>}

    {view === "Gastos" && <section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
      <GlassCard title="Gastos: anotar manualmente o adjuntar factura"><BillingUploadForm billingFileType={billingFileType} setBillingFileType={setBillingFileType} billingFileTitle={billingFileTitle} setBillingFileTitle={setBillingFileTitle} billingFileAmount={billingFileAmount} setBillingFileAmount={setBillingFileAmount} billingFileCounterparty={billingFileCounterparty} setBillingFileCounterparty={setBillingFileCounterparty} billingFileDate={billingFileDate} setBillingFileDate={setBillingFileDate} billingFileNotes={billingFileNotes} setBillingFileNotes={setBillingFileNotes} setBillingFile={setBillingFile} uploadBillingDocument={uploadBillingDocument} isUploadingBillingFile={isUploadingBillingFile} forcedType="expense" /></GlassCard>
      <GlassCard title="Gastos registrados"><BillingRecordsList records={viewRecords} deleteRecord={deleteRecord} openBillingDocument={openBillingDocument} openInvoicePdf={openInvoicePdf} parseBillingMetadata={parseBillingMetadata} /></GlassCard>
    </section>}
  </section>;
}

function BillingUploadForm({ billingFileType, setBillingFileType, billingFileTitle, setBillingFileTitle, billingFileAmount, setBillingFileAmount, billingFileCounterparty, setBillingFileCounterparty, billingFileDate, setBillingFileDate, billingFileNotes, setBillingFileNotes, setBillingFile, uploadBillingDocument, isUploadingBillingFile, forcedType }: { billingFileType: "income" | "expense"; setBillingFileType: (value: "income" | "expense") => void; billingFileTitle: string; setBillingFileTitle: (value: string) => void; billingFileAmount: string; setBillingFileAmount: (value: string) => void; billingFileCounterparty: string; setBillingFileCounterparty: (value: string) => void; billingFileDate: string; setBillingFileDate: (value: string) => void; billingFileNotes: string; setBillingFileNotes: (value: string) => void; setBillingFile: (file: File | null) => void; uploadBillingDocument: () => void; isUploadingBillingFile: boolean; forcedType?: "income" | "expense" }) {
  useEffect(() => { if (forcedType) setBillingFileType(forcedType); }, [forcedType, setBillingFileType]);
  return <div className="grid gap-3">
    {!forcedType && <select value={billingFileType} onChange={(e) => setBillingFileType(e.target.value as "income" | "expense")} className="input-dark"><option value="income">Ingreso / factura emitida</option><option value="expense">Gasto / factura recibida</option></select>}
    <input value={billingFileTitle} onChange={(e) => setBillingFileTitle(e.target.value)} placeholder="Concepto" className="input-dark" />
    <input value={billingFileCounterparty} onChange={(e) => setBillingFileCounterparty(e.target.value)} placeholder="Cliente o proveedor" className="input-dark" />
    <div className="grid gap-3 md:grid-cols-2"><input value={billingFileAmount} onChange={(e) => setBillingFileAmount(e.target.value)} placeholder="Importe" type="number" className="input-dark" /><input value={billingFileDate} onChange={(e) => setBillingFileDate(e.target.value)} type="date" className="input-dark" /></div>
    <input type="file" accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx" onChange={(e) => setBillingFile(e.target.files?.[0] || null)} className="input-dark" />
    <p className="text-xs text-white/42">Puedes guardar un ingreso/gasto manual y, opcionalmente, adjuntar la factura real subida desde tu equipo.</p>
    <textarea value={billingFileNotes} onChange={(e) => setBillingFileNotes(e.target.value)} placeholder="Notas para control interno o gestor" className="input-dark min-h-24" />
    <button onClick={uploadBillingDocument} disabled={isUploadingBillingFile} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"><FileText size={17} /> {isUploadingBillingFile ? "Guardando..." : forcedType === "income" ? "Guardar ingreso" : forcedType === "expense" ? "Guardar gasto" : "Guardar registro"}</button>
  </div>;
}

function BillingRecordsList({ records, deleteRecord, openBillingDocument, openInvoicePdf, parseBillingMetadata }: { records: ModuleRecord[]; deleteRecord: (id: string) => void; openBillingDocument: (record: ModuleRecord) => void; openInvoicePdf: (payload?: any) => void; parseBillingMetadata: (record: ModuleRecord) => Record<string, unknown> | null }) {
  return <div className="space-y-3">{records.map((record) => {
    const metadata = parseBillingMetadata(record);
    const hasFile = Boolean(metadata?.file_path);
    const isGenerated = Boolean(metadata?.number && metadata?.concept);
    return <div key={record.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{record.title}</p>{metadata ? <div className="mt-2 grid gap-1 text-sm text-white/55"><p>{String(metadata.customer_name || metadata.counterparty || metadata.file_name || "Documento de facturación")}</p>{metadata.document_date || metadata.date ? <p>Fecha: {String(metadata.document_date || metadata.date)}</p> : null}{metadata.due_date ? <p>Vence: {String(metadata.due_date)}</p> : null}</div> : record.notes && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/55">{record.notes}</p>}<p className="mt-2 text-xs text-white/35">{record.status} · {new Date(record.created_at).toLocaleString("es-ES")}</p></div>{record.amount !== null && <p className="rounded-full bg-violet-500/20 px-3 py-1 text-sm text-violet-100">{Number(record.amount).toFixed(2)}€</p>}</div><div className="mt-3 flex flex-wrap gap-2">{hasFile && <button onClick={() => openBillingDocument(record)} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/75 hover:bg-white/10">Abrir archivo</button>}{isGenerated && <button onClick={() => openInvoicePdf(metadata)} className="rounded-full border border-cyan-300/20 px-3 py-1.5 text-xs text-cyan-100 hover:bg-cyan-400/10">PDF</button>}<button onClick={() => deleteRecord(record.id)} className="rounded-full border border-red-300/20 px-3 py-1.5 text-xs text-red-200/80 hover:bg-red-500/10">Eliminar</button></div></div>;
  })}{!records.length && <Empty text="Aún no hay registros." />}</div>;
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
  business,
  reloadData,
  records,
  allRecords,
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
  openClinicalDocument,
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
  const [crmStatusFilter, setCrmStatusFilter] = useState("all");
  const [detailTab, setDetailTab] = useState("Vista ejecutiva");
  const [timelineFilter, setTimelineFilter] = useState("Todo");
  const [crmActionTitle, setCrmActionTitle] = useState("");
  const [crmActionNotes, setCrmActionNotes] = useState("");
  const [crmActionDueDate, setCrmActionDueDate] = useState("");
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderNotes, setReminderNotes] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [crmAppointmentEmployee, setCrmAppointmentEmployee] = useState("");
  const [crmAppointmentService, setCrmAppointmentService] = useState("");
  const [crmAppointmentDate, setCrmAppointmentDate] = useState("");
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
  const [bulkContactsText, setBulkContactsText] = useState("");
  const [selectedWorkContactId, setSelectedWorkContactId] = useState("");
  const [workName, setWorkName] = useState("");
  const [workPhone, setWorkPhone] = useState("");
  const [workDocumentNumber, setWorkDocumentNumber] = useState("");
  const [workDocumentType, setWorkDocumentType] = useState("CC");
  const [workEps, setWorkEps] = useState("");
  const [workNotes, setWorkNotes] = useState("");
  const [workResult, setWorkResult] = useState("contactado");
  const [workReminderTitle, setWorkReminderTitle] = useState("");
  const [workReminderAt, setWorkReminderAt] = useState("");
  const [workReminderNotes, setWorkReminderNotes] = useState("");

  useEffect(() => {
    syncModuleSubmenu(activeTab, "module:crm:", {
      ficha: "Ficha 360",
      contactos: "Contactos",
      agenda: "Agenda CRM",
      pipeline: "Pipeline",
      hoy: "Hoy",
      automatizaciones: "Automatizaciones",
    }, setCrmView);
  }, [activeTab]);

  const filteredCustomers = customers.filter((customer) => {
    if ((customer.crm_status || "nuevo") === "contacto_pendiente") return false;
    const search = crmSearch.toLowerCase().trim();
    const searchable = `${customerName(customer)} ${customer.phone || ""} ${customer.email || ""} ${customer.document_number || ""} ${customer.eps || ""} ${customer.crm_status || ""} ${customer.notes || ""}`.toLowerCase();
    const matchesSearch = !search || searchable.includes(search);
    const matchesStatus = crmStatusFilter === "all" || (customer.crm_status || "nuevo") === crmStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const workQueueContacts = customers.filter((customer) => (customer.crm_status || "nuevo") === "contacto_pendiente");
  const activeWorkContact = workQueueContacts.find((customer) => customer.id === selectedWorkContactId) || workQueueContacts[0] || null;
  const selectedCustomer = customers.find((customer) => customer.id === selectedCrmCustomerId) || filteredCustomers[0] || null;

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

  useEffect(() => {
    if (!activeWorkContact) {
      setSelectedWorkContactId("");
      setWorkName("");
      setWorkPhone("");
      setWorkDocumentNumber("");
      setWorkDocumentType("CC");
      setWorkEps("");
      setWorkNotes("");
      setWorkResult("contactado");
      setWorkReminderTitle("");
      setWorkReminderAt("");
      setWorkReminderNotes("");
      return;
    }
    if (selectedWorkContactId !== activeWorkContact.id) setSelectedWorkContactId(activeWorkContact.id);
    setWorkName(customerName(activeWorkContact));
    setWorkPhone(activeWorkContact.phone || "");
    setWorkDocumentNumber(activeWorkContact.document_number || "");
    setWorkDocumentType(activeWorkContact.document_type || "CC");
    setWorkEps(activeWorkContact.eps || "");
    setWorkNotes(activeWorkContact.notes || "");
    setWorkResult("contactado");
    setWorkReminderTitle(`Seguimiento · ${customerName(activeWorkContact)}`);
    setWorkReminderAt(activeWorkContact.next_follow_up_at ? activeWorkContact.next_follow_up_at.slice(0, 16) : "");
    setWorkReminderNotes("");
  }, [activeWorkContact?.id]);

  const customerAppointments = selectedCustomer ? appointments.filter((appointment) => {
    const related = firstRelation(appointment.customers);
    return appointment.customer_id === selectedCustomer.id || customerName(related).toLowerCase() === customerName(selectedCustomer).toLowerCase();
  }) : [];
  const customerRecords = selectedCustomer ? records.filter((record) => record.customer_id === selectedCustomer.id || (record.notes || "").includes(selectedCustomer.id)) : [];
  const customerDocs = selectedCustomer ? clinicalDocuments.filter((document) => document.customer_id === selectedCustomer.id) : [];
  const customerMessages = selectedCustomer ? whatsappMessages.filter((message) => message.customer_id === selectedCustomer.id || normalizePhone(message.phone).endsWith(normalizePhone(selectedCustomer.phone).slice(-9))) : [];
  const customerReminders = selectedCustomer ? crmReminders.filter((reminder) => reminderCustomerId(reminder) === selectedCustomer.id).sort((a, b) => reminderTime(a) - reminderTime(b)) : [];
  const customerBillingRecords = selectedCustomer ? allRecords.filter((record) => record.module_key === "billing" && (record.customer_id === selectedCustomer.id || (record.notes || "").includes(selectedCustomer.id) || (record.notes || "").toLowerCase().includes(customerName(selectedCustomer).toLowerCase()))) : [];
  const customerBillingTotal = customerBillingRecords.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const customerPendingBilling = customerBillingRecords.filter((record) => ["pending", "pendiente", "vencida", "overdue"].includes(String(record.status || "").toLowerCase())).length;

  const activeCustomers = customers.filter((customer) => !["cerrado", "perdido", "alta"].includes(customer.crm_status || "nuevo")).length;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const todayAppointments = appointments.filter((appointment) => {
    const time = new Date(appointmentDate(appointment)).getTime();
    return time >= todayStart.getTime() && time < todayEnd.getTime();
  });
  const dueReminders = crmReminders.filter((reminder) => (reminder.status || "pending") === "pending" && reminderTime(reminder) <= Date.now()).length;
  const noFollowUpCustomers = customers.filter((customer) => !customer.next_follow_up_at && !["alta", "perdido", "cerrado"].includes(customer.crm_status || "nuevo"));
  const statusCounts = crmStatusOptions.map((option) => ({ ...option, count: customers.filter((customer) => (customer.crm_status || "nuevo") === option.value).length }));
  const sectorPreset = crmSectorPreset(business?.business_type || business?.panel_theme || "general");

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

  const saveAction = async () => {
    if (!selectedCustomer) return alert("Selecciona un cliente");
    await createCrmAction(selectedCustomer.id, crmActionTitle || `Seguimiento · ${customerName(selectedCustomer)}`, crmActionNotes || `Próximo paso con ${customerName(selectedCustomer)}`, "followup", crmActionDueDate || undefined);
    setCrmActionTitle("");
    setCrmActionNotes("");
    setCrmActionDueDate("");
  };

  const saveReminder = async () => {
    if (!selectedCustomer) return alert("Selecciona un cliente");
    await saveCrmReminder(selectedCustomer.id, reminderTitle || `Recordatorio · ${customerName(selectedCustomer)}`, reminderAt, reminderNotes);
    setReminderTitle("");
    setReminderNotes("");
    setReminderAt("");
  };


  const importWorkContacts = async () => {
    if (!business) return alert("No se ha cargado el negocio");
    const existingDocuments = new Set(customers.map((customer) => String(customer.document_number || "").replace(/\D/g, "")).filter(Boolean));
    const existingPhones = new Set(customers.map((customer) => normalizePhone(customer.phone)).filter(Boolean));
    const seenDocuments = new Set<string>();
    const seenPhones = new Set<string>();
    let skipped = 0;

    const rows = bulkContactsText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/[;|\t,]+/).map((part) => part.trim()).filter(Boolean);
        let name = "";
        let documentNumber = "";
        let phone = "";
        let documentType = "CC";
        let eps = "";

        if (parts.length >= 2) {
          name = parts[0];
          documentNumber = parts[1]?.replace(/\D/g, "") || "";
          phone = parts[2]?.replace(/[^\d+]/g, "") || "";
          const possibleType = String(parts[3] || "").trim().toUpperCase();
          if (["RC", "TI", "CC", "PT"].includes(possibleType)) documentType = possibleType;
          eps = ["RC", "TI", "CC", "PT"].includes(possibleType) ? (parts[4] || "") : (parts[3] || "");
        } else {
          const documentMatch = line.match(/\b\d{5,15}\b/g)?.at(-1) || "";
          documentNumber = documentMatch.replace(/\D/g, "");
          name = documentMatch ? line.replace(documentMatch, "") : line;
          name = name.replace(/[;,|·•-]+/g, " ").replace(/\s+/g, " ").trim();
        }

        name = name.replace(/\s+/g, " ").trim() || `Contacto ${documentNumber || "sin identificar"}`;
        const normalizedDocument = documentNumber.replace(/\D/g, "");
        const normalizedPhone = normalizePhone(phone);

        if (!name || !normalizedDocument) {
          skipped += 1;
          return null;
        }
        if (existingDocuments.has(normalizedDocument) || seenDocuments.has(normalizedDocument) || (normalizedPhone && (existingPhones.has(normalizedPhone) || seenPhones.has(normalizedPhone)))) {
          skipped += 1;
          return null;
        }

        seenDocuments.add(normalizedDocument);
        if (normalizedPhone) seenPhones.add(normalizedPhone);

        return {
          business_id: business.id,
          name,
          full_name: name,
          phone: phone || null,
          email: null,
          document_type: documentType,
          document_number: normalizedDocument,
          eps: eps || null,
          notes: "Importado manualmente para trabajar desde CRM Contactos.",
          crm_status: "contacto_pendiente",
          last_contact_at: null,
          next_follow_up_at: null,
        };
      })
      .filter(Boolean);

    if (!rows.length) return alert(skipped ? "No se importó ningún contacto: todos estaban duplicados o no tenían número de identidad." : "Pega al menos un contacto con nombre y número de identidad");
    const { error } = await supabase.from("customers").insert(rows as any);
    if (error) return alert(error.message);
    setBulkContactsText("");
    await reloadData();
    alert(`Contactos importados: ${rows.length}${skipped ? ` · Duplicados/no válidos omitidos: ${skipped}` : ""}`);
  };

  const finishWorkContact = async () => {
    if (!business || !activeWorkContact) return alert("Selecciona un contacto pendiente");
    if (!workName.trim()) return alert("El contacto necesita nombre");
    const { error } = await supabase
      .from("customers")
      .update({
        name: workName.trim(),
        full_name: workName.trim(),
        phone: workPhone.trim() || null,
        email: null,
        document_number: workDocumentNumber.trim() || null,
        document_type: workDocumentType || null,
        eps: workEps.trim() || null,
        notes: workNotes || null,
        crm_status: workResult || "contactado",
        next_follow_up_at: workReminderAt ? localDateTimeToBogotaIso(workReminderAt) : null,
        last_contact_at: new Date().toISOString(),
      } as any)
      .eq("id", activeWorkContact.id)
      .eq("business_id", business.id);
    if (error) return alert(error.message);

    if (workReminderAt && workReminderTitle.trim()) {
      const { error: reminderError } = await supabase.from("crm_reminders").insert({
        business_id: business.id,
        patient_id: activeWorkContact.id,
        title: workReminderTitle.trim(),
        description: workReminderNotes || null,
        notes: workReminderNotes || null,
        remind_at: localDateTimeToBogotaIso(workReminderAt),
        reminder_at: localDateTimeToBogotaIso(workReminderAt),
        status: "pending",
      });
      if (reminderError) return alert(reminderError.message);
    }

    setSelectedCrmCustomerId(activeWorkContact.id);
    setSelectedWorkContactId("");
    await reloadData();
    setCrmView("Ficha 360");
    setDetailTab("Vista ejecutiva");
  };

  const scheduleFromCrm = async () => {
    if (!selectedCustomer) return alert("Selecciona un cliente");
    await createAppointmentForCustomer(selectedCustomer.id, crmAppointmentEmployee, crmAppointmentService, crmAppointmentDate);
    setCrmAppointmentEmployee("");
    setCrmAppointmentService("");
    setCrmAppointmentDate("");
  };

  const selectedInitials = selectedCustomer ? customerName(selectedCustomer).split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "CL" : "CL";
  const selectedOrigin = selectedCustomer?.crm_status === "nuevo_whatsapp" || customerMessages.length ? "WhatsApp" : selectedCustomer?.phone ? "CRM" : "Manual";
  const nextAppointment = customerAppointments.slice().sort((a, b) => new Date(appointmentDate(a)).getTime() - new Date(appointmentDate(b)).getTime()).find((appointment) => new Date(appointmentDate(appointment)).getTime() >= Date.now());
  const nextReminder = customerReminders.find((reminder) => (reminder.status || "pending") === "pending");
  const clientScore = Math.min(98, 38 + customerAppointments.length * 8 + customerMessages.length * 4 + customerBillingRecords.length * 10 + (selectedCustomer?.next_follow_up_at ? 8 : 0));
  const customerTags: string[] = selectedCustomer ? [selectedOrigin, translateCrmStatus(selectedCustomer.crm_status || "nuevo"), selectedCustomer.eps ? epsLabel(selectedCustomer.eps) : sectorPreset.label, customerPendingBilling ? "Pago pendiente" : "Al día"].filter(Boolean) : [];
  const suggestedActions = selectedCustomer ? [
    { title: "Enviar seguimiento premium", notes: `Contactar a ${customerName(selectedCustomer)} con un mensaje breve, claro y orientado a cerrar el próximo paso.` },
    { title: "Agendar próxima acción", notes: nextAppointment ? "Ya existe una cita próxima. Confirmar asistencia y preparar la atención." : "No hay cita próxima. Proponer disponibilidad y reservar desde Agenda." },
    { title: "Revisar oportunidad", notes: customerBillingRecords.length ? "Tiene historial de facturación. Revisar recurrencia y opciones de venta adicional." : "Sin facturación vinculada. Crear presupuesto o factura desde el módulo de facturación." },
  ] : [];

  const timelineEvents = selectedCustomer ? [
    ...customerAppointments.map((appointment) => ({ id: `a-${appointment.id}`, type: "Agenda", title: `Cita · ${firstRelation(appointment.services)?.name || "Servicio"}`, meta: appointmentDate(appointment), body: appointment.status || "programada", tone: "cyan" })),
    ...customerRecords.map((record) => ({ id: `r-${record.id}`, type: "CRM", title: record.title, meta: record.status || "actividad", body: record.notes, tone: "violet" })),
    ...customerMessages.slice(-6).map((message) => ({ id: `w-${message.id}`, type: "WhatsApp", title: message.direction === "inbound" ? "WhatsApp recibido" : "WhatsApp enviado", meta: new Date(message.created_at).toLocaleString("es-ES"), body: message.message, tone: "green" })),
    ...customerDocs.map((document) => ({ id: `d-${document.id}`, type: "Documentos", title: document.title, meta: document.document_type || "documento", body: document.notes, tone: "white" })),
    ...customerReminders.map((reminder) => ({ id: `m-${reminder.id}`, type: "Recordatorios", title: reminder.title, meta: formatReminderDate(reminder), body: reminder.notes || reminder.description, tone: reminderTime(reminder) <= Date.now() ? "amber" : "white" })),
    ...customerBillingRecords.map((record) => ({ id: `b-${record.id}`, type: "Facturación", title: record.title, meta: `${record.status || "documento"} · ${Number(record.amount || 0).toFixed(2)}`, body: record.notes, tone: "cyan" })),
  ].filter((event) => timelineFilter === "Todo" || event.type === timelineFilter).slice(0, 24) : [];

  const crmViews = ["Ficha 360", "Contactos", "Agenda CRM", "Pipeline", "Hoy", "Automatizaciones"];

  return (
    <section className="space-y-8 text-white">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,.24),transparent_34%),linear-gradient(135deg,rgba(15,23,42,.98),rgba(2,6,23,.95))] p-6 shadow-2xl shadow-cyan-950/20 md:p-8">
        <div className="absolute right-8 top-8 hidden h-28 w-28 rounded-full border border-cyan-300/20 bg-cyan-300/10 blur-2xl lg:block" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100"><Sparkles size={15} /> CRM premium</div>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">Panel de clientes limpio, visual y preparado para vender.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/62">Una vista 360º con clientes, agenda, WhatsApp, documentos, facturación y próximos pasos en una interfaz más minimalista y sofisticada.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[430px]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4"><p className="text-xs uppercase tracking-[0.18em] text-white/38">Clientes</p><p className="mt-2 text-3xl font-semibold">{customers.length}</p></div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4"><p className="text-xs uppercase tracking-[0.18em] text-white/38">Activos</p><p className="mt-2 text-3xl font-semibold">{activeCustomers}</p></div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4"><p className="text-xs uppercase tracking-[0.18em] text-white/38">Alertas</p><p className="mt-2 text-3xl font-semibold">{dueReminders}</p></div>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap gap-2">
          {crmViews.map((view) => <button key={view} onClick={() => { setCrmView(view); selectModuleSubmenu(setActiveTab, ({ "Ficha 360": "module:crm:ficha", Contactos: "module:crm:contactos", "Agenda CRM": "module:crm:agenda", Pipeline: "module:crm:pipeline", Hoy: "module:crm:hoy", Automatizaciones: "module:crm:automatizaciones" } as Record<string, ActiveTab>)[view] || "module:crm:ficha", setCrmView, view); }} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${crmView === view ? "bg-white text-slate-950" : "border border-white/10 bg-white/[0.06] text-white/65 hover:bg-white/[0.1]"}`}>{view}</button>)}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={<Users />} label="Base CRM" value={customers.length} helper="Clientes registrados" />
        <Metric icon={<CalendarDays />} label="Citas hoy" value={todayAppointments.length} helper="Agenda conectada" />
        <Metric icon={<MessageCircle />} label="WhatsApp" value={whatsappMessages.length} helper="Mensajes guardados" />
        <Metric icon={<Receipt />} label="Sin seguimiento" value={noFollowUpCustomers.length} helper="Oportunidad inmediata" />
      </div>

      {crmView === "Pipeline" && (
        <section className="grid gap-4 xl:grid-cols-4">
          {statusCounts.map((status) => {
            const items = customers.filter((customer) => (customer.crm_status || "nuevo") === status.value).slice(0, 10);
            return <div key={status.value} className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-4"><div className="mb-4 flex items-center justify-between"><p className="font-semibold">{status.label}</p><span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/55">{status.count}</span></div><div className="space-y-3">{items.map((customer) => <button key={customer.id} onClick={() => { setSelectedCrmCustomerId(customer.id); setCrmView("Ficha 360"); }} className="w-full rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.08]"><p className="font-semibold">{customerName(customer)}</p><p className="mt-1 text-xs text-white/45">{customer.phone || customer.email || "Sin contacto"}</p></button>)}{!items.length && <Empty text="Sin clientes en esta fase." />}</div></div>;
          })}
        </section>
      )}

      {crmView === "Agenda CRM" && (
        <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <GlassCard title="Agenda vinculada a clientes"><div className="space-y-3">{appointments.slice(0, 14).map((appointment) => { const customer = firstRelation(appointment.customers); const service = firstRelation(appointment.services); return <button key={appointment.id} onClick={() => { if (appointment.customer_id) setSelectedCrmCustomerId(appointment.customer_id); setCrmView("Ficha 360"); }} className="w-full rounded-2xl border border-white/10 bg-white/[0.055] p-4 text-left hover:bg-white/[0.09]"><p className="font-semibold">{customerName(customer)}</p><p className="mt-1 text-sm text-white/48">{service?.name || "Servicio"} · {appointmentDate(appointment)}</p></button>; })}{!appointments.length && <Empty text="Aún no hay citas conectadas al CRM." />}</div></GlassCard>
          <GlassCard title="Crear cita desde cliente"><div className="grid gap-3"><select value={crmAppointmentEmployee} onChange={(e) => setCrmAppointmentEmployee(e.target.value)} className="input-dark"><option value="">Profesional / responsable</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</select><select value={crmAppointmentService} onChange={(e) => setCrmAppointmentService(e.target.value)} className="input-dark"><option value="">Servicio</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select><input type="datetime-local" value={crmAppointmentDate} onChange={(e) => setCrmAppointmentDate(e.target.value)} className="input-dark" /><button onClick={scheduleFromCrm} className="btn-primary"><CalendarDays size={17} /> Crear cita</button></div></GlassCard>
        </section>
      )}

      {crmView === "Hoy" && (
        <section className="grid gap-6 lg:grid-cols-2"><GlassCard title="Prioridad de hoy"><div className="space-y-3">{crmReminders.filter((r) => (r.status || "pending") === "pending").slice(0, 10).map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} customers={customers} completeReminder={completeCrmReminder} deleteReminder={deleteCrmReminder} compact />)}{!crmReminders.length && <Empty text="No tienes recordatorios activos." />}</div></GlassCard><GlassCard title="Clientes a recuperar"><div className="space-y-3">{noFollowUpCustomers.slice(0, 10).map((customer) => <button key={customer.id} onClick={() => { setSelectedCrmCustomerId(customer.id); setCrmView("Ficha 360"); }} className="w-full rounded-2xl bg-white/[0.06] p-4 text-left hover:bg-white/[0.09]"><p className="font-semibold">{customerName(customer)}</p><p className="mt-1 text-sm text-white/45">Sin próxima acción · {translateCrmStatus(customer.crm_status || "nuevo")}</p></button>)}</div></GlassCard></section>
      )}

      {crmView === "Automatizaciones" && (
        <section className="grid gap-6 lg:grid-cols-3">{["Nuevo WhatsApp → crear cliente y etiqueta", "Factura vencida → recordatorio por WhatsApp", "Cita próxima → confirmación automática", "Cliente sin seguimiento → tarea CRM", "Presupuesto aceptado → factura", "Documento subido → aviso interno"].map((automation) => <div key={automation} className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-100"><Workflow size={20} /></div><p className="font-semibold">{automation}</p><p className="mt-2 text-sm leading-6 text-white/48">Automatización recomendada para reducir tareas manuales y mejorar el seguimiento.</p></div>)}</section>
      )}

      {crmView === "Contactos" && (
        <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20">
            <div className="rounded-[1.6rem] border border-cyan-300/15 bg-cyan-300/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">Lista de trabajo</p>
              <h3 className="mt-2 text-2xl font-semibold">Contactos pendientes</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">Pega una lista con nombre y número de identidad. Flowly omitirá duplicados por documento o teléfono y los dejará aquí hasta trabajarlos.</p>
            </div>
            <textarea
              value={bulkContactsText}
              onChange={(e) => setBulkContactsText(e.target.value)}
              placeholder={`Ejemplo:
María Pérez, 1020304050
Juan Gómez; 99887766
Ana López | 123456789 | +573001112233 | CC | Nueva EPS`}
              className="input-dark mt-4 min-h-44 resize-none"
            />
            <button onClick={importWorkContacts} className="btn-primary mt-3 w-full justify-center"><Plus size={17} /> Importar contactos</button>
            <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
              {workQueueContacts.map((customer) => {
                const isActive = activeWorkContact?.id === customer.id;
                return <button key={customer.id} onClick={() => setSelectedWorkContactId(customer.id)} className={`w-full rounded-2xl border p-3 text-left transition ${isActive ? "border-cyan-300/45 bg-cyan-300/12" : "border-white/10 bg-white/[0.045] hover:bg-white/[0.08]"}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xs font-bold">{customerName(customer).split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "C"}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{customerName(customer)}</p>
                      <p className="truncate text-xs text-white/45">ID {customer.document_number || "sin identidad"}{customer.phone ? ` · ${customer.phone}` : ""}</p>
                    </div>
                  </div>
                </button>;
              })}
              {!workQueueContacts.length && <Empty text="No hay contactos pendientes. Importa una lista con nombre e identidad para empezar." />}
            </div>
          </aside>

          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,.1),rgba(255,255,255,.035))] p-5 shadow-2xl shadow-black/20 md:p-7">
            {!activeWorkContact ? <Empty text="Selecciona o importa un contacto para trabajarlo." /> : (
              <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <div className="space-y-5">
                  <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/45 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Contacto en cola</p>
                    <h3 className="mt-2 text-3xl font-semibold">{customerName(activeWorkContact)}</h3>
                    <p className="mt-2 text-sm text-white/50">Rellena la información útil, crea un recordatorio y al guardar pasará automáticamente al CRM.</p>
                  </div>
                  <GlassCard title="Datos del contacto">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input value={workName} onChange={(e) => setWorkName(e.target.value)} placeholder="Nombre completo" className="input-dark" />
                      <input value={workPhone} onChange={(e) => setWorkPhone(e.target.value)} placeholder="Teléfono" className="input-dark" />
                      <input value={workDocumentNumber} onChange={(e) => setWorkDocumentNumber(e.target.value)} placeholder="Número de identidad" className="input-dark" />
                      <select value={workDocumentType} onChange={(e) => setWorkDocumentType(e.target.value)} className="input-dark">
                        <option value="RC">RC · Registro Civil</option>
                        <option value="TI">TI · Tarjeta de Identidad</option>
                        <option value="CC">CC · Cédula de Ciudadanía</option>
                        <option value="PT">PT · Permiso Temporal</option>
                      </select>
                      <input value={workEps} onChange={(e) => setWorkEps(e.target.value)} placeholder="EPS" className="input-dark" />
                      <select value={workResult} onChange={(e) => setWorkResult(e.target.value)} className="input-dark">
                        <option value="contactado">Contactado</option>
                        <option value="nuevo">Nuevo</option>
                        <option value="pendiente_cita">Pendiente cita</option>
                        <option value="pendiente_documentacion">Pendiente documentación</option>
                        <option value="perdido">Descartado / perdido</option>
                      </select>
                    </div>
                    <textarea value={workNotes} onChange={(e) => setWorkNotes(e.target.value)} placeholder="Notas de la llamada, interés, origen, objeciones o información importante" className="input-dark mt-3 min-h-36" />
                  </GlassCard>
                </div>
                <aside className="space-y-5">
                  <GlassCard title="Recordatorio">
                    <div className="grid gap-3">
                      <input value={workReminderTitle} onChange={(e) => setWorkReminderTitle(e.target.value)} placeholder="Título del recordatorio" className="input-dark" />
                      <input type="datetime-local" value={workReminderAt} onChange={(e) => setWorkReminderAt(e.target.value)} className="input-dark" />
                      <textarea value={workReminderNotes} onChange={(e) => setWorkReminderNotes(e.target.value)} placeholder="Notas del recordatorio" className="input-dark min-h-24" />
                    </div>
                  </GlassCard>
                  <button onClick={finishWorkContact} className="btn-primary w-full justify-center"><CheckCircle2 size={17} /> Guardar en CRM y quitar de Contactos</button>
                  <div className="rounded-3xl border border-emerald-300/15 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-50/75">Al guardar, el contacto desaparecerá de esta cola y quedará en la Ficha 360 con su estado, notas y recordatorio.</div>
                </aside>
              </div>
            )}
          </div>
        </section>
      )}

      {crmView === "Ficha 360" && (
        <section className="grid gap-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-3"><Search size={17} className="text-white/35" /><input value={crmSearch} onChange={(e) => setCrmSearch(e.target.value)} placeholder="Buscar cliente, teléfono, RIF, estado..." className="w-full bg-transparent text-sm outline-none placeholder:text-white/35" /></div>
              <div className="mt-3 grid grid-cols-2 gap-2"><select value={crmStatusFilter} onChange={(e) => setCrmStatusFilter(e.target.value)} className="input-dark"><option value="all">Todos</option>{crmStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><button onClick={() => { setCrmSearch(""); setCrmStatusFilter("all"); }} className="rounded-2xl border border-white/10 bg-white/[0.06] text-sm text-white/65">Limpiar</button></div>
            </div>
            <div className="mt-4 grid max-h-72 gap-3 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredCustomers.map((customer) => {
                const isActive = selectedCustomer?.id === customer.id;
                const messages = whatsappMessages.filter((message) => message.customer_id === customer.id || normalizePhone(message.phone).endsWith(normalizePhone(customer.phone).slice(-9))).length;
                const reminders = crmReminders.filter((reminder) => reminderCustomerId(reminder) === customer.id && (reminder.status || "pending") === "pending").length;
                return <button key={customer.id} onClick={() => setSelectedCrmCustomerId(customer.id)} className={`w-full rounded-2xl border p-3 text-left transition ${isActive ? "border-cyan-300/45 bg-cyan-300/12 shadow-lg shadow-cyan-950/20" : "border-white/10 bg-white/[0.045] hover:bg-white/[0.08]"}`}><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300/25 to-violet-300/20 text-xs font-bold text-white">{customerName(customer).split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "CL"}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="min-w-0 flex-1 truncate text-sm font-semibold">{customerName(customer)}</p><span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[10px] text-white/50">{translateCrmStatus(customer.crm_status || "nuevo")}</span></div><p className="mt-1 truncate text-xs text-white/45">{customer.phone || customer.email || customer.document_number || "Sin contacto"}</p><div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-white/50"><span className="rounded-full bg-white/10 px-2 py-0.5">{messages} WA</span><span className="rounded-full bg-white/10 px-2 py-0.5">{reminders} tareas</span></div></div></div></button>;
              })}
              {!filteredCustomers.length && <Empty text="No hay clientes con estos filtros." />}
            </div>
          </div>

          <div className="space-y-6">
            {!selectedCustomer ? <GlassCard title="Ficha CRM"><Empty text="Selecciona un cliente para abrir su ficha premium." /></GlassCard> : (
              <>
                <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,.11),rgba(255,255,255,.035))] shadow-2xl shadow-black/20">
                  <div className="border-b border-white/10 bg-slate-950/35 p-6 md:p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-5"><div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.7rem] border border-cyan-300/20 bg-cyan-300/12 text-2xl font-bold text-cyan-50">{selectedInitials}</div><div><div className="flex flex-wrap items-center gap-2">{customerTags.map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1 text-xs text-white/62">{tag}</span>)}</div><h3 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{customerName(selectedCustomer)}</h3><p className="mt-2 text-sm text-white/52">{selectedCustomer.phone || "Sin teléfono"} · {selectedCustomer.email || "Sin email"} · {selectedCustomer.document_number || "Sin documento"}</p></div></div>
                      <div className="grid gap-3 sm:grid-cols-3 lg:w-[410px]"><InfoBox label="Score" value={`${clientScore}%`} /><InfoBox label="Facturado" value={customerBillingTotal.toFixed(2)} /><InfoBox label="Pendiente" value={customerPendingBilling} /></div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2"><button onClick={() => openWhatsappForCustomer(selectedCustomer, whatsappTemplatesEffective[0]?.message || "Hola {{nombre}}, te contactamos desde Flowly.")} className="btn-primary"><MessageCircle size={17} /> WhatsApp</button><button onClick={() => setActiveTab("module:agenda")} className="btn-secondary"><CalendarDays size={17} /> Agenda</button><button onClick={() => setActiveTab("module:facturacion")} className="btn-secondary"><Receipt size={17} /> Facturar</button><button onClick={() => { setCrmActionTitle("Seguimiento comercial"); setCrmActionNotes(`Contactar a ${customerName(selectedCustomer)} y definir próximo paso.`); }} className="btn-secondary"><Plus size={17} /> Tarea</button></div>
                  </div>
                  <div className="flex flex-wrap gap-2 p-4">{["Vista ejecutiva", "Datos", "Actividad", "Agenda", "Facturación", "Documentos", "IA"].map((tab) => <button key={tab} onClick={() => setDetailTab(tab)} className={`rounded-full px-4 py-2 text-sm font-semibold ${detailTab === tab ? "bg-white text-slate-950" : "bg-white/[0.06] text-white/58 hover:bg-white/[0.1]"}`}>{tab}</button>)}</div>
                </div>

                <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
                  <div className="space-y-6">
                    {detailTab === "Vista ejecutiva" && <div className="grid gap-4 md:grid-cols-3"><div className="rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-5"><p className="text-sm text-white/45">Próxima cita</p><p className="mt-2 font-semibold">{nextAppointment ? appointmentDate(nextAppointment) : "Sin cita"}</p></div><div className="rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-5"><p className="text-sm text-white/45">Próximo seguimiento</p><p className="mt-2 font-semibold">{nextReminder ? formatReminderDate(nextReminder) : selectedCustomer.next_follow_up_at || "Sin alarma"}</p></div><div className="rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-5"><p className="text-sm text-white/45">Valor cliente</p><p className="mt-2 font-semibold">{customerBillingTotal.toFixed(2)}</p></div></div>}

                    {(detailTab === "Datos" || detailTab === "Vista ejecutiva") && <GlassCard title="Datos del cliente"><div className="grid gap-3 md:grid-cols-2"><input value={detailName} onChange={(e) => setDetailName(e.target.value)} placeholder="Nombre" className="input-dark" /><input value={detailPhone} onChange={(e) => setDetailPhone(e.target.value)} placeholder="Teléfono" className="input-dark" /><input value={detailEmail} onChange={(e) => setDetailEmail(e.target.value)} placeholder="Email" className="input-dark" /><input value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} placeholder="Dirección" className="input-dark" /><input value={detailDocumentType} onChange={(e) => setDetailDocumentType(e.target.value)} placeholder="Tipo documento" className="input-dark" /><input value={detailDocumentNumber} onChange={(e) => setDetailDocumentNumber(e.target.value)} placeholder="Documento / RIF" className="input-dark" /><input value={detailEps} onChange={(e) => setDetailEps(e.target.value)} placeholder="Segmento / EPS / categoría" className="input-dark" /><input value={detailResponsible} onChange={(e) => setDetailResponsible(e.target.value)} placeholder="Responsable" className="input-dark" /><select value={detailCrmStatus} onChange={(e) => setDetailCrmStatus(e.target.value)} className="input-dark">{crmStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><input type="datetime-local" value={detailNextFollowUp} onChange={(e) => setDetailNextFollowUp(e.target.value)} className="input-dark" /></div><textarea value={detailNotes} onChange={(e) => setDetailNotes(e.target.value)} placeholder="Notas internas" className="input-dark mt-3 min-h-28" /><button onClick={saveCustomerDetails} className="btn-primary mt-4"><CheckCircle2 size={17} /> Guardar cambios</button></GlassCard>}

                    {(detailTab === "Actividad" || detailTab === "Vista ejecutiva") && <GlassCard title="Timeline premium"><div className="mb-4 flex flex-wrap gap-2">{["Todo", "Agenda", "CRM", "WhatsApp", "Facturación", "Documentos", "Recordatorios"].map((filter) => <button key={filter} onClick={() => setTimelineFilter(filter)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${timelineFilter === filter ? "bg-white text-slate-950" : "bg-white/[0.06] text-white/52"}`}>{filter}</button>)}</div><div className="space-y-3">{timelineEvents.map((event) => <div key={event.id} className="relative rounded-2xl border border-white/10 bg-white/[0.055] p-4 pl-5"><span className={`absolute left-0 top-5 h-8 w-1 rounded-r-full ${event.tone === "green" ? "bg-green-300" : event.tone === "cyan" ? "bg-cyan-300" : event.tone === "amber" ? "bg-amber-300" : "bg-violet-300"}`} /><p className="font-semibold">{event.title}</p><p className="mt-1 text-xs text-white/42">{event.meta}</p>{event.body && <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-white/55">{event.body}</p>}</div>)}{!timelineEvents.length && <Empty text="Sin actividad todavía." />}</div></GlassCard>}

                    {detailTab === "Agenda" && <GlassCard title="Citas del cliente"><div className="space-y-3">{customerAppointments.map((appointment) => <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4"><p className="font-semibold">{firstRelation(appointment.services)?.name || "Servicio"}</p><p className="mt-1 text-sm text-white/45">{appointmentDate(appointment)} · {appointment.status || "programada"}</p></div>)}{!customerAppointments.length && <Empty text="Sin citas registradas." />}</div></GlassCard>}

                    {detailTab === "Facturación" && <GlassCard title="Facturación del cliente"><div className="grid gap-3 md:grid-cols-3"><InfoBox label="Total" value={customerBillingTotal.toFixed(2)} /><InfoBox label="Documentos" value={customerBillingRecords.length} /><InfoBox label="Pendientes" value={customerPendingBilling} /></div><div className="mt-4 space-y-2">{customerBillingRecords.map((record) => <div key={record.id} className="rounded-2xl border border-white/10 bg-white/[0.055] p-3"><p className="font-semibold">{record.title}</p><p className="mt-1 text-xs text-white/45">{record.status} · {Number(record.amount || 0).toFixed(2)}</p></div>)}{!customerBillingRecords.length && <Empty text="Sin presupuestos o facturas vinculadas todavía." />}</div><button onClick={() => setActiveTab("module:facturacion")} className="btn-primary mt-4"><Receipt size={17} /> Abrir facturación</button></GlassCard>}

                    {detailTab === "Documentos" && <GlassCard title="Documentos"><div className="grid gap-3"><input value={documentTitle} onChange={(e) => setDocumentTitle(e.target.value)} placeholder="Concepto" className="input-dark" /><select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="input-dark"><option value="general">General</option><option value="contrato">Contrato</option><option value="imagen">Imagen</option><option value="pdf">PDF</option><option value="consentimiento">Consentimiento</option></select><textarea value={documentNotes} onChange={(e) => setDocumentNotes(e.target.value)} placeholder="Notas" className="input-dark min-h-20" /><label className="btn-secondary cursor-pointer justify-center"><FileText size={17} /> Subir archivo<input type="file" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (file) { await uploadClinicalDocument(selectedCustomer.id, file, documentTitle || file.name, documentType, documentNotes); setDocumentTitle(""); setDocumentType("general"); setDocumentNotes(""); } e.currentTarget.value = ""; }} /></label></div><div className="mt-4 space-y-2">{customerDocs.map((document) => <button key={document.id} type="button" onClick={() => openClinicalDocument(document)} className="block w-full rounded-2xl border border-white/10 bg-white/[0.055] p-3 text-left hover:bg-white/[0.09]"><p className="font-semibold">{document.title}</p><p className="mt-1 text-xs text-white/45">{document.document_type || "Documento"} · enlace privado de 5 min</p></button>)}{!customerDocs.length && <Empty text="Sin documentos cargados." />}</div></GlassCard>}

                    {detailTab === "IA" && <GlassCard title="Resumen IA operativo"><p className="text-sm leading-7 text-white/60">Cliente procedente de {selectedOrigin}. Tiene {customerAppointments.length} citas, {customerMessages.length} mensajes, {customerBillingRecords.length} documentos de facturación y {customerReminders.length} recordatorios. Próximo paso recomendado: {nextAppointment ? "confirmar la cita y preparar seguimiento posterior" : "crear una cita o enviar propuesta por WhatsApp"}.</p><div className="mt-4 grid gap-3 md:grid-cols-2">{sectorPreset.fields.map((field) => <div key={field} className="rounded-2xl bg-white/[0.055] p-3 text-sm text-white/58">{field}</div>)}</div></GlassCard>}
                  </div>

                  <aside className="space-y-6">
                    <GlassCard title="Playbook de ventas"><div className="space-y-3">{suggestedActions.map((action) => <button key={action.title} onClick={() => { setCrmActionTitle(action.title); setCrmActionNotes(action.notes); }} className="w-full rounded-2xl border border-white/10 bg-white/[0.055] p-4 text-left hover:bg-white/[0.09]"><p className="font-semibold">{action.title}</p><p className="mt-1 line-clamp-2 text-sm leading-6 text-white/48">{action.notes}</p></button>)}</div></GlassCard>
                    <GlassCard title="Nueva tarea"><div className="grid gap-3"><input value={crmActionTitle} onChange={(e) => setCrmActionTitle(e.target.value)} placeholder="Título" className="input-dark" /><input type="datetime-local" value={crmActionDueDate} onChange={(e) => setCrmActionDueDate(e.target.value)} className="input-dark" /><textarea value={crmActionNotes} onChange={(e) => setCrmActionNotes(e.target.value)} placeholder="Notas" className="input-dark min-h-24" /><button onClick={saveAction} className="btn-primary"><Plus size={17} /> Crear tarea</button></div></GlassCard>
                    <GlassCard title="Recordatorio"><div className="grid gap-3"><input value={reminderTitle} onChange={(e) => setReminderTitle(e.target.value)} placeholder="Título" className="input-dark" /><input type="datetime-local" value={reminderAt} onChange={(e) => setReminderAt(e.target.value)} className="input-dark" /><textarea value={reminderNotes} onChange={(e) => setReminderNotes(e.target.value)} placeholder="Notas" className="input-dark min-h-20" /><button onClick={saveReminder} className="btn-primary"><Clock size={17} /> Guardar alarma</button></div></GlassCard>
                    <GlassCard title="Últimos WhatsApp"><div className="max-h-72 space-y-2 overflow-y-auto pr-1">{customerMessages.slice(-8).map((message) => <div key={message.id} className={`rounded-2xl px-3 py-2 text-sm leading-6 ${message.direction === "outbound" ? "ml-8 bg-cyan-300/15 text-cyan-50" : "mr-8 bg-white/[0.07] text-white/70"}`}><p className="whitespace-pre-wrap break-words">{message.message}</p><p className="mt-1 text-[10px] text-white/35">{new Date(message.created_at).toLocaleString("es-ES")}</p></div>)}{!customerMessages.length && <Empty text="Sin WhatsApps vinculados a esta ficha." />}</div></GlassCard>
                    <GlassCard title="WhatsApp rápido"><div className="grid gap-2">{whatsappTemplatesEffective.slice(0, 5).map((template) => <button key={template.key} onClick={() => { const msg = whatsappMessageForCustomer(template.message, selectedCustomer); saveWhatsappMessage(selectedCustomer.id, selectedCustomer.phone || "", template.key, msg); openWhatsappForCustomer(selectedCustomer, template.message); }} className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 text-left text-sm hover:bg-white/[0.09]"><span className="font-semibold">{template.label}</span><span className="mt-1 block line-clamp-2 text-xs text-white/45">{template.message}</span></button>)}{!whatsappTemplatesEffective.length && <Empty text="Crea plantillas para usarlas aquí." />}</div></GlassCard>
                  </aside>
                </section>
              </>
            )}
          </div>
        </section>
      )}
    </section>
  );
}

function crmSectorPreset(sector: string) {
  const normalized = String(sector || "").toLowerCase();
  if (normalized.includes("clinic") || normalized.includes("clín") || normalized.includes("salud")) return { label: "Clínica / salud", fields: ["EPS / seguro", "Especialidad", "Régimen", "Médico responsable", "Alergias", "Última consulta"] };
  if (normalized.includes("pelu") || normalized.includes("beauty") || normalized.includes("estética")) return { label: "Peluquería / estética", fields: ["Servicio favorito", "Color / fórmula", "Preferencias", "Frecuencia de visita", "Cumpleaños", "Productos usados"] };
  if (normalized.includes("taller") || normalized.includes("auto") || normalized.includes("veh")) return { label: "Taller / automoción", fields: ["Vehículo", "Matrícula", "Kilometraje", "Última reparación", "Presupuesto pendiente", "Garantía"] };
  if (normalized.includes("restaurant") || normalized.includes("restaurante") || normalized.includes("food")) return { label: "Restaurante", fields: ["Preferencias", "Alergias", "Última reserva", "Ticket medio", "Mesa favorita", "Celebraciones"] };
  return { label: "Negocio general", fields: ["Tipo de cliente", "Prioridad", "Necesidad principal", "Objeción", "Valor estimado", "Fuente de captación"] };
}

const crmStatusOptions = [
  { value: "contacto_pendiente", label: "Por trabajar" },
  { value: "nuevo_whatsapp", label: "Nuevo WhatsApp" },
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "pendiente_documentacion", label: "Pendiente documentación" },
  { value: "pendiente_cita", label: "Pendiente cita" },
  { value: "en_tratamiento", label: "En tratamiento" },
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
  const [tab, setTab] = useState("Plan");

  useEffect(() => {
    syncModuleSubmenu(activeTab, "module:marketing:", { plan: "Plan", campanas: "Campañas", canales: "Canales", audiencias: "Audiencias", calendario: "Calendario" }, setTab);
  }, [activeTab]);

  const planRecord = records.find((r) => r.status === "plan_active");
  const selectedPlan = planRecord?.title?.toLowerCase().includes("oro")
    ? marketingPlans.marketing_oro
    : planRecord?.title?.toLowerCase().includes("plata")
      ? marketingPlans.marketing_plata
      : marketingPlans.marketing_bronze;
  const campaignRecords = records.filter((r) => r.status !== "plan_active");
  const contentItems = campaignRecords.filter((r) => ["idea", "draft", "scheduled", "published", "organic"].includes(String(r.status || "")));
  const budget = campaignRecords.reduce((s, r) => s + Number(r.amount || 0), 0);
  const activeCampaigns = campaignRecords.filter((r) => !["done", "paused", "published"].includes(String(r.status))).length;
  const monthlyPosts = selectedPlan.postsPerWeek * 4;
  const channels = ["Meta Ads", "Google Ads", "TikTok Ads", "WhatsApp", "Email", "Landing / Pixel"];
  const calendarTemplate = Array.from({ length: monthlyPosts }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() + index * Math.max(1, Math.floor(28 / Math.max(monthlyPosts, 1))));
    return `${day.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}: Publicación ${index + 1}`;
  });

  return (
    <section className="grid gap-6">
      <ModuleHero eyebrow="Flowly Growth OS" title="Marketing operativo con plan contratado" description="El módulo Marketing ya no es solo una nota: muestra el plan contratado, campañas, calendario editorial, audiencias CRM y conexiones necesarias para ejecutar acciones reales." actions={<ModulePillTabs tabs={["Plan", "Campañas", "Canales", "Audiencias", "Calendario"]} active={tab} setActive={(next) => selectModuleSubmenu(setActiveTab, ({ Plan: "module:marketing:plan", Campañas: "module:marketing:campanas", Canales: "module:marketing:canales", Audiencias: "module:marketing:audiencias", Calendario: "module:marketing:calendario" } as Record<string, ActiveTab>)[next] || "module:marketing:plan", setTab, next)} />} />
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={<Megaphone />} label="Plan" value={selectedPlan.name.replace("Flowly Marketing ", "")} helper={planRecord ? "Contratado" : "Predeterminado"} />
        <Metric icon={<CalendarDays />} label="Publicaciones" value={`${selectedPlan.postsPerWeek}/sem`} helper={`${monthlyPosts} al mes`} />
        <Metric icon={<CreditCard />} label="Cuota" value={`${Number(planRecord?.amount || selectedPlan.price).toFixed(2)}€`} helper="Marketing mensual" />
        <Metric icon={<Users />} label="Audiencia CRM" value={customers.length} helper="Clientes disponibles" />
      </div>

      {tab === "Plan" && <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <GlassCard title="Plan de marketing contratado">
          <div className="rounded-[2rem] border border-fuchsia-300/20 bg-gradient-to-br from-fuchsia-500/15 via-violet-500/10 to-black/30 p-6">
            <p className="text-sm uppercase tracking-[0.18em] text-fuchsia-100/70">{selectedPlan.tier}</p>
            <h3 className="mt-2 text-3xl font-semibold">{selectedPlan.name}</h3>
            <p className="mt-3 text-sm leading-6 text-white/60">{selectedPlan.description}</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <InfoBox label="Publicaciones" value={`${selectedPlan.postsPerWeek}/semana`} />
              <InfoBox label="Entrega mensual" value={`${monthlyPosts} piezas`} />
              <InfoBox label="Precio" value={`${Number(planRecord?.amount || selectedPlan.price).toFixed(2)}€`} />
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {selectedPlan.features.map((feature) => <div key={feature} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-white/72"><CheckCircle2 className="mb-2 text-cyan-200" size={18} />{feature}</div>)}
          </div>
        </GlassCard>
        <GlassCard title="Sistema automatizado del plan">
          <div className="grid gap-3">
            {selectedPlan.automationSteps.map((step, index) => <div key={step} className="flex items-start gap-3 rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300/20 text-xs font-bold text-cyan-100">{index + 1}</span><div><p className="font-semibold">{step}</p><p className="mt-1 text-xs text-white/45">Se convierte en tarea operativa para el equipo de marketing.</p></div></div>)}
          </div>
        </GlassCard>
      </section>}

      {tab === "Campañas" && <section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <GlassCard title="Nueva campaña profesional">
          <div className="grid gap-3">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-dark"><option value="meta">Facebook / Instagram Ads</option><option value="google">Google Ads</option><option value="tiktok">TikTok Ads</option><option value="email">Email Marketing</option><option value="whatsapp">WhatsApp Campaign</option><option value="organic">Contenido orgánico</option></select>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Campaña: Reactivación clientes VIP" className="input-dark" />
            <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Presupuesto estimado" type="number" className="input-dark" />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Objetivo, público, oferta, fechas, creatividad, KPI principal y responsable" className="input-dark min-h-40" />
            <button onClick={() => createRecord("marketing", status)} className="btn-primary"><Plus size={17} /> Guardar campaña</button>
          </div>
        </GlassCard>
        <GlassCard title="Pipeline de campañas">
          <div className="mb-4 grid gap-3 md:grid-cols-3"><InfoBox label="Campañas" value={campaignRecords.length} /><InfoBox label="Activas" value={activeCampaigns} /><InfoBox label="Presupuesto" value={`${budget.toFixed(2)}€`} /></div>
          <RecordsList records={campaignRecords} deleteRecord={deleteRecord} />
        </GlassCard>
      </section>}

      {tab === "Canales" && <GlassCard title="Conexiones del cliente"><IntegrationPanel business={business} integrations={integrations} reloadData={reloadData} items={channels.map((name) => ({ name, detail: name.includes("Meta") ? "Página, Instagram, pixel y cuenta publicitaria" : name.includes("Google") ? "Google Business Profile, Ads y Analytics" : name.includes("TikTok") ? "Cuenta publicitaria, pixel y eventos" : name.includes("WhatsApp") ? "Plantillas, listas y campañas desde CRM" : name.includes("Email") ? "Dominio, listas y automatizaciones" : "UTMs, eventos y conversiones" }))} /></GlassCard>}
      {tab === "Audiencias" && <GlassCard title="Audiencias inteligentes"><div className="grid gap-3 md:grid-cols-3">{["Clientes nuevos", "Clientes sin cita 60 días", "VIP / mayor ticket", "Cumpleaños", "No asistieron", "Leads sin convertir"].map((x) => <div key={x} className="rounded-3xl bg-black/25 p-5"><p className="font-semibold">{x}</p><p className="mt-2 text-sm text-white/45">Segmento preparado desde CRM para campañas y WhatsApp.</p></div>)}</div></GlassCard>}
      {tab === "Calendario" && <GlassCard title="Calendario editorial del plan"><div className="grid gap-3 md:grid-cols-4">{(contentItems.length ? contentItems.map((r) => r.title) : calendarTemplate).map((x) => <div key={x} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5"><p className="font-semibold">{x}</p><p className="mt-2 text-sm text-white/45">Bloque operativo del plan {selectedPlan.name.replace("Flowly Marketing ", "")}.</p></div>)}</div></GlassCard>}
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

function AnalyticsModule({ business, records, customers, appointments, services, revenue, expenses, manualIncome, deleteRecord, activeTab, setActiveTab, voiceCalls, whatsappMessages }: Parameters<typeof ModuleSection>[0]) {
  const [tab, setTab] = useState("Dirección");

  useEffect(() => {
    syncModuleSubmenu(activeTab, "module:estadisticas:", { direccion: "Dirección", kpis: "Dirección", agenda: "Agenda", finanzas: "Finanzas", informes: "Finanzas", servicios: "Servicios" }, setTab);
  }, [activeTab]);

  const total = revenue + manualIncome;
  const profit = total - expenses;
  const isNeuronasPanel = [business?.name, business?.business_type, business?.panel_theme]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes("neuronas"));
  const normalizeStatus = (value?: string | null) => String(value || "").trim().toLowerCase();
  const voiceHandledStatuses = ["atendida", "atendido", "contactado", "cita_creada", "completed", "completed_call", "answered", "resuelta", "resolved"];
  const voiceLostStatuses = ["perdida", "perdido", "missed", "no_atendida", "no_atendido", "sin_respuesta", "no_answer", "failed", "descartada", "cancelled", "canceled"];
  const callsIncoming = voiceCalls.length;
  const callsHandled = voiceCalls.filter((call) => voiceHandledStatuses.includes(normalizeStatus(call.status)) || Boolean(call.appointment_id)).length;
  const callsLost = voiceCalls.filter((call) => voiceLostStatuses.includes(normalizeStatus(call.status))).length;

  const whatsappInbound = whatsappMessages.filter((message) => message.direction === "inbound");
  const whatsappOutbound = whatsappMessages.filter((message) => message.direction === "outbound");
  const whatsappOutboundPhones = new Set(whatsappOutbound.map((message) => normalizePhone(message.phone)).filter(Boolean));
  const whatsappIncoming = whatsappInbound.length;
  const whatsappHandled = whatsappInbound.filter((message) => whatsappOutboundPhones.has(normalizePhone(message.phone))).length;
  const whatsappLost = Math.max(0, whatsappIncoming - whatsappHandled);

  const appointmentCustomerIds = new Set(appointments.map((item) => item.customer_id).filter(Boolean));
  const voiceAppointmentCustomerIds = new Set(voiceCalls.map((call) => call.customer_id).filter(Boolean));
  const whatsappCustomerIds = new Set(whatsappMessages.map((message) => message.customer_id).filter(Boolean));
  const customersTransformedToAppointment = appointments.filter((appointment) => {
    const customerId = appointment.customer_id;
    if (!customerId) return false;
    return appointmentCustomerIds.has(customerId) && (voiceAppointmentCustomerIds.has(customerId) || whatsappCustomerIds.has(customerId));
  }).length || appointments.filter((appointment) => ["confirmed", "completed", "cita_creada"].includes(normalizeStatus(appointment.status))).length;

  const conversion = customers.length ? Math.round((customersTransformedToAppointment / customers.length) * 100) : 0;
  const byStatus = ["pending", "confirmed", "completed", "cancelled"].map((status) => ({ status, count: appointments.filter((a) => a.status === status).length }));

  return (
    <section className="grid gap-6">
      <ModuleHero eyebrow="Business Analytics" title="Panel de métricas sincronizado" description="KPIs del panel principal, agenda, CRM, facturación, TPV, llamadas y WhatsApp en una capa ejecutiva para dirección." actions={<ModulePillTabs tabs={["Dirección", "Agenda", "Finanzas", "Servicios"]} active={tab} setActive={(next) => selectModuleSubmenu(setActiveTab, ({ Dirección: "module:estadisticas:direccion", Agenda: "module:estadisticas:agenda", Finanzas: "module:estadisticas:finanzas", Servicios: "module:estadisticas:servicios" } as Record<string, ActiveTab>)[next] || "module:estadisticas:direccion", setTab, next)} />} />
      <div className="grid gap-4 md:grid-cols-4"><Metric icon={<TrendingUp />} label="Ingresos" value={`${total.toFixed(2)}€`} helper="Reservas + manual" /><Metric icon={<CreditCard />} label="Resultado" value={`${profit.toFixed(2)}€`} helper="Estimado" /><Metric icon={<Users />} label="Conversión a cita" value={`${conversion}%`} helper={`${customersTransformedToAppointment} clientes`} /><Metric icon={<FileText />} label="Registros" value={records.length} helper="Análisis guardados" /></div>

      {isNeuronasPanel && (
        <GlassCard title="Estadísticas operativas Neuronas">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Metric icon={<PhoneCall />} label="Llamadas entrantes" value={callsIncoming} helper="Total recibidas" />
            <Metric icon={<CheckCircle2 />} label="Llamadas atendidas" value={callsHandled} helper="Contactadas o convertidas" />
            <Metric icon={<XCircle />} label="Llamadas perdidas" value={callsLost} helper="Sin respuesta o descartadas" />
            <Metric icon={<MessageCircle />} label="WhatsApp entrantes" value={whatsappIncoming} helper="Mensajes recibidos" />
            <Metric icon={<CheckCircle2 />} label="WhatsApp atendidos" value={whatsappHandled} helper="Con respuesta enviada" />
            <Metric icon={<XCircle />} label="WhatsApp perdidos" value={whatsappLost} helper="Pendientes sin respuesta" />
          </div>
          <div className="mt-4 rounded-[1.75rem] border border-cyan-300/20 bg-cyan-400/10 p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100/65">Resultado comercial</p>
                <h3 className="mt-1 text-2xl font-semibold">Clientes transformados en cita</h3>
                <p className="mt-1 text-sm text-white/50">Pacientes o leads que han terminado con cita creada desde llamadas, WhatsApp o agenda.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-6 py-4 text-right">
                <p className="text-4xl font-semibold text-cyan-100">{customersTransformedToAppointment}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">citas generadas</p>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

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


type FlowlyMenuOption = { digit: string; label: string; crm_status?: string; response?: string };
type FlowlyMenuPayload = { type: "flowly_menu_v1"; intro: string; options: FlowlyMenuOption[] };

function encodeFlowlyMenu(menu: FlowlyMenuPayload) {
  return `FLOWLY_MENU_V1:${JSON.stringify(menu)}`;
}

function parseFlowlyMenuMessage(value?: string | null): FlowlyMenuPayload | null {
  const text = String(value || "").trim();
  if (!text.startsWith("FLOWLY_MENU_V1:")) return null;
  try {
    const parsed = JSON.parse(text.slice("FLOWLY_MENU_V1:".length));
    if (parsed?.type === "flowly_menu_v1" && Array.isArray(parsed.options)) return parsed as FlowlyMenuPayload;
  } catch {}
  return null;
}

function previewFlowlyMenu(menu: FlowlyMenuPayload) {
  return [menu.intro || "Elige una opción:", ...menu.options.filter((item) => item.digit && item.label).map((item) => `${item.digit}. ${item.label}`)].join("\n");
}

function WhatsappModule({
  business,
  integrations,
  reloadData,
  customers,
  whatsappMessages,
  whatsappTemplatesEffective,
  whatsappBotRules,
  saveWhatsappTemplate,
  deleteWhatsappTemplate,
  saveWhatsappMessage,
  activeTab,
  setActiveTab,
  setSelectedCrmCustomerId,
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
  const [manualAccessToken, setManualAccessToken] = useState("");
  const [manualPhoneNumberId, setManualPhoneNumberId] = useState("");
  const [manualWabaId, setManualWabaId] = useState("");
  const [manualDisplayPhone, setManualDisplayPhone] = useState("");
  const [savingManualConnection, setSavingManualConnection] = useState(false);

  useEffect(() => {
    setLocalTemplates(whatsappTemplatesEffective);
  }, [whatsappTemplatesEffective]);

  const templates = localTemplates.length ? localTemplates : whatsappTemplatesEffective;
  const currentView = activeTab === "module:whatsapp:plantillas" ? "plantillas" : activeTab === "module:whatsapp:bots" ? "bots" : activeTab === "module:whatsapp:enviar" ? "enviar" : "bandeja";
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) || null;
  const selectedTemplate = templates.find((template) => template.key === selectedTemplateKey) || null;
  const finalMessage = customMessage || (selectedTemplate && selectedCustomer ? whatsappMessageForCustomer(selectedTemplate.message, selectedCustomer) : selectedTemplate?.message || "");
  const whatsappConnection = integrations.find((integration) => integration.provider_key === "whatsapp_cloud" && integration.status === "connected");
  const whatsappConfig = (whatsappConnection?.config || {}) as Record<string, unknown>;
  const displayPhone = String(whatsappConfig.display_phone_number || whatsappConfig.verified_name || whatsappConfig.phone_number_id || "");
  const [liveWhatsappMessages, setLiveWhatsappMessages] = useState<WhatsappMessage[]>(whatsappMessages || []);
  const [whatsappInboxLoading, setWhatsappInboxLoading] = useState(false);
  const [whatsappInboxError, setWhatsappInboxError] = useState("");
  const [lastInboxSync, setLastInboxSync] = useState<Date | null>(null);
  const [sending, setSending] = useState(false);
  const [selectedConversationPhone, setSelectedConversationPhone] = useState("");
  const [closedConversationPhones, setClosedConversationPhones] = useState<string[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [botName, setBotName] = useState("");
  const [botTrigger, setBotTrigger] = useState("");
  const [botResponse, setBotResponse] = useState("");
  const [botMatchMode, setBotMatchMode] = useState("contains");
  const [botType, setBotType] = useState<"reply" | "menu">("reply");
  const [menuIntro, setMenuIntro] = useState("Gracias por escribir. Marca una opción para poder ayudarte:");
  const [menuOptions, setMenuOptions] = useState<FlowlyMenuOption[]>([
    { digit: "1", label: "Quiero información", crm_status: "interesado", response: "Perfecto, hemos registrado que quieres información. Un asesor te contactará." },
    { digit: "2", label: "Quiero agendar una cita", crm_status: "cita_solicitada", response: "Genial, hemos registrado tu solicitud de cita. Te escribiremos para confirmar disponibilidad." },
    { digit: "3", label: "Necesito soporte", crm_status: "soporte", response: "Hemos registrado tu solicitud de soporte. Nuestro equipo la revisará." },
  ]);
  const [localBotRules, setLocalBotRules] = useState<WhatsappBotRule[]>([]);
  const whatsappChatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLocalBotRules(whatsappBotRules || []);
  }, [whatsappBotRules]);

  useEffect(() => {
    setLiveWhatsappMessages(whatsappMessages || []);
  }, [whatsappMessages]);

  const fetchWhatsappInbox = useCallback(async (silent = true) => {
    if (!business?.id) return;
    if (!silent) setWhatsappInboxLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const response = await fetch(`/api/whatsapp/messages?businessId=${encodeURIComponent(business.id)}`, {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo sincronizar la bandeja");
      setLiveWhatsappMessages((result.messages || []) as WhatsappMessage[]);
      setWhatsappInboxError("");
      setLastInboxSync(new Date());
    } catch (error) {
      setWhatsappInboxError(error instanceof Error ? error.message : "No se pudo sincronizar la bandeja");
    } finally {
      if (!silent) setWhatsappInboxLoading(false);
    }
  }, [business?.id]);

  useEffect(() => {
    if (!business?.id || currentView !== "bandeja") return;
    fetchWhatsappInbox(true);
    const interval = window.setInterval(() => fetchWhatsappInbox(true), 4000);
    return () => window.clearInterval(interval);
  }, [business?.id, currentView, fetchWhatsappInbox]);

  const conversationGroups = useMemo(() => {
    const map = new Map<string, { phone: string; customer: Customer | null; contactName: string; lastMessage: WhatsappMessage; messages: WhatsappMessage[]; unread: number }>();
    const sorted = [...liveWhatsappMessages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    for (const message of sorted) {
      const phoneKey = normalizePhone(message.phone);
      if (!phoneKey) continue;
      const customer = customers.find((item) => normalizePhone(item.phone) === phoneKey) || null;
      const current = map.get(phoneKey) || { phone: phoneKey, customer, contactName: message.contact_name || customerName(customer), lastMessage: message, messages: [], unread: 0 };
      current.customer = current.customer || customer;
      current.contactName = message.contact_name || customerName(current.customer) || current.contactName || phoneKey;
      current.messages.push(message);
      current.lastMessage = message;
      if (message.direction === "inbound" && message.status === "received") current.unread += 1;
      map.set(phoneKey, current);
    }
    return Array.from(map.values()).sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());
  }, [liveWhatsappMessages, customers]);

  const visibleConversationGroups = useMemo(() => {
    const closed = new Set(closedConversationPhones.map((phone) => normalizePhone(phone)));
    return conversationGroups.filter((conversation) => !closed.has(normalizePhone(conversation.phone)));
  }, [conversationGroups, closedConversationPhones]);

  useEffect(() => {
    if (!selectedConversationPhone && visibleConversationGroups[0]?.phone) setSelectedConversationPhone(visibleConversationGroups[0].phone);
    if (selectedConversationPhone && !visibleConversationGroups.some((conversation) => conversation.phone === selectedConversationPhone)) {
      setSelectedConversationPhone(visibleConversationGroups[0]?.phone || "");
    }
  }, [visibleConversationGroups, selectedConversationPhone]);

  const selectedConversation = visibleConversationGroups.find((item) => item.phone === selectedConversationPhone) || visibleConversationGroups[0] || null;

  const closeConversation = (phone: string) => {
    const normalized = normalizePhone(phone);
    if (!normalized) return;
    setClosedConversationPhones((current) => current.includes(normalized) ? current : [...current, normalized]);
    if (normalizePhone(selectedConversationPhone) === normalized) {
      const nextConversation = visibleConversationGroups.find((conversation) => normalizePhone(conversation.phone) !== normalized);
      setSelectedConversationPhone(nextConversation?.phone || "");
    }
  };

  useEffect(() => {
    whatsappChatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [selectedConversation?.phone, selectedConversation?.messages.length]);

  const markConversationAsOpened = useCallback(async (phone: string) => {
    if (!business?.id || !phone) return;
    setLiveWhatsappMessages((current) => current.map((message) => (normalizePhone(message.phone) === normalizePhone(phone) && message.direction === "inbound" && message.status === "received" ? { ...message, status: "opened" } : message)));
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      await fetch("/api/whatsapp/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ businessId: business.id, phone }),
      });
    } catch (error) {
      console.warn("No se pudo marcar la conversación como leída", error);
    }
  }, [business?.id]);

  useEffect(() => {
    if (selectedConversation?.phone) markConversationAsOpened(selectedConversation.phone);
  }, [selectedConversation?.phone, markConversationAsOpened]);

  const openConversationCrm = async () => {
    if (!business || !selectedConversation) return;
    let customerId = selectedConversation.customer?.id || selectedConversation.messages.find((message) => message.customer_id)?.customer_id || null;

    if (!customerId) {
      const normalizedPhone = normalizePhone(selectedConversation.phone);
      const name = selectedConversation.contactName && selectedConversation.contactName !== selectedConversation.phone ? selectedConversation.contactName : `WhatsApp +${normalizedPhone}`;
      const { data, error } = await supabase
        .from("customers")
        .insert({
          business_id: business.id,
          name,
          full_name: name,
          phone: `+${normalizedPhone}`,
          notes: `Creado desde la bandeja WhatsApp de Flowly.\nÚltimo mensaje: ${selectedConversation.lastMessage?.message || ""}`,
          crm_status: "nuevo_whatsapp",
          last_contact_at: new Date().toISOString(),
        })
        .select("id")
        .maybeSingle();
      if (error) return alert(error.message);
      customerId = data?.id || null;
      if (customerId) {
        await supabase
          .from("whatsapp_messages")
          .update({ customer_id: customerId, updated_at: new Date().toISOString() })
          .eq("business_id", business.id)
          .eq("phone", selectedConversation.phone);
      }
      await reloadData();
    }

    if (!customerId) return alert("No se pudo abrir o crear la ficha CRM");
    setSelectedCrmCustomerId(customerId);
    setActiveTab("module:crm:ficha");
  };

  const handleSelectTemplate = (key: string) => {
    setSelectedTemplateKey(key);
    const template = templates.find((item) => item.key === key);
    if (template) setCustomMessage(selectedCustomer ? whatsappMessageForCustomer(template.message, selectedCustomer) : template.message);
  };

  const saveManualWhatsappConnection = async () => {
    if (!business) return alert("No se ha cargado el negocio");
    if (!manualAccessToken.trim() || !manualPhoneNumberId.trim()) return alert("Añade el Access Token y el Phone Number ID de WhatsApp Cloud API");
    setSavingManualConnection(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const response = await fetch("/api/neuronas/whatsapp/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          businessId: business.id,
          accessToken: manualAccessToken.trim(),
          phoneNumberId: manualPhoneNumberId.trim(),
          wabaId: manualWabaId.trim(),
          displayPhoneNumber: manualDisplayPhone.trim(),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo guardar WhatsApp");
      setManualAccessToken("");
      setManualPhoneNumberId("");
      setManualWabaId("");
      setManualDisplayPhone("");
      await reloadData();
      alert("WhatsApp conectado manualmente para Neuronas.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error conectando WhatsApp");
    } finally {
      setSavingManualConnection(false);
    }
  };

  const sendMessage = async () => {
    if (!business) return alert("No se ha cargado el negocio");
    if (!selectedCustomer) return alert("Selecciona un cliente");
    if (!finalMessage.trim()) return alert("Escribe un mensaje o selecciona una plantilla");
    if (!selectedCustomer.phone) return alert("Este cliente no tiene teléfono válido para WhatsApp");

    if (!whatsappConnection) {
      const fallback = confirm("WhatsApp Cloud todavía no está conectado. ¿Quieres abrir WhatsApp Web como alternativa manual?");
      if (fallback && openWhatsapp(selectedCustomer.phone, finalMessage)) {
        await saveWhatsappMessage(selectedCustomer.id, selectedCustomer.phone || "", selectedTemplate?.key || "manual", finalMessage);
      }
      return;
    }

    setSending(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          businessId: business.id,
          customerId: selectedCustomer.id,
          phone: selectedCustomer.phone,
          templateKey: selectedTemplate?.key || "manual",
          message: finalMessage,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo enviar el WhatsApp");
      setCustomMessage("");
      await fetchWhatsappInbox(false);
      await reloadData();
      alert("WhatsApp enviado desde Flowly");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error enviando WhatsApp");
    } finally {
      setSending(false);
    }
  };


  const sendConversationReply = async () => {
    if (!business) return alert("No se ha cargado el negocio");
    if (!selectedConversation) return alert("Selecciona una conversación");
    if (!replyMessage.trim()) return alert("Escribe una respuesta");
    if (!whatsappConnection) return alert("Conecta WhatsApp Cloud antes de responder desde Flowly");
    setSending(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          businessId: business.id,
          customerId: selectedConversation.customer?.id || null,
          phone: selectedConversation.phone,
          templateKey: "reply",
          message: replyMessage,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo enviar la respuesta");
      setReplyMessage("");
      await fetchWhatsappInbox(false);
      await reloadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error respondiendo WhatsApp");
    } finally {
      setSending(false);
    }
  };

  const createBotRule = async () => {
    if (!business) return alert("No se ha cargado el negocio");
    const cleanOptions = menuOptions
      .map((option) => ({
        digit: option.digit.replace(/\D/g, ""),
        label: option.label.trim(),
        crm_status: option.crm_status?.trim() || "interesado",
        response: option.response?.trim() || "Perfecto, hemos registrado tu selección. Un asesor revisará tu ficha.",
      }))
      .filter((option) => option.digit && option.label);
    const responseMessage = botType === "menu"
      ? encodeFlowlyMenu({ type: "flowly_menu_v1", intro: menuIntro.trim() || "Elige una opción:", options: cleanOptions })
      : botResponse.trim();

    if (!botName.trim() || !botTrigger.trim() || !responseMessage.trim()) return alert("Completa nombre, palabra clave y respuesta del bot");
    if (botType === "menu" && !cleanOptions.length) return alert("Añade al menos una opción numerada para el menú");

    const payload = {
      business_id: business.id,
      name: botName.trim(),
      trigger_text: botTrigger.trim().toLowerCase(),
      response_message: responseMessage,
      match_mode: botMatchMode,
      is_active: true,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from("whatsapp_bot_rules").insert(payload).select("*").maybeSingle();
    if (error) return alert(error.message);
    setLocalBotRules((current) => [data as WhatsappBotRule, ...current]);
    setBotName("");
    setBotTrigger("");
    setBotResponse("");
    await reloadData();
  };

  const toggleBotRule = async (rule: WhatsappBotRule) => {
    if (!business || !rule.id) return;
    const { error } = await supabase
      .from("whatsapp_bot_rules")
      .update({ is_active: !rule.is_active, updated_at: new Date().toISOString() })
      .eq("id", rule.id)
      .eq("business_id", business.id);
    if (error) return alert(error.message);
    setLocalBotRules((current) => current.map((item) => item.id === rule.id ? { ...item, is_active: !rule.is_active } : item));
    await reloadData();
  };

  const deleteBotRule = async (rule: WhatsappBotRule) => {
    if (!business || !rule.id) return;
    if (!confirm("¿Eliminar esta regla de bot?")) return;
    const { error } = await supabase.from("whatsapp_bot_rules").delete().eq("id", rule.id).eq("business_id", business.id);
    if (error) return alert(error.message);
    setLocalBotRules((current) => current.filter((item) => item.id !== rule.id));
    await reloadData();
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
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-200">WhatsApp Cloud API oficial</p>
            <h2 className="mt-2 text-3xl font-semibold">WhatsApp operativo conectado al CRM</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              Gestiona la bandeja como WhatsApp Web: conversaciones en vivo, respuestas desde Cloud API, leads vinculados al CRM y bots automáticos por palabra clave.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className={whatsappConnection ? "rounded-full border border-emerald-300/25 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-100" : "rounded-full border border-amber-300/25 bg-amber-400/10 px-4 py-2 text-xs font-semibold text-amber-100"}>
                {whatsappConnection ? `Conectado${displayPhone ? ` · ${displayPhone}` : ""}` : "No conectado"}
              </span>
              {business && (
                <Link href={`/api/neuronas/whatsapp/connect?businessId=${business.id}`} className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-400/20">
                  {whatsappConnection ? "Reconectar WhatsApp" : "Conectar WhatsApp"}
                </Link>
              )}
            </div>
          </div>
          <div className="flex flex-wrap rounded-[1.5rem] border border-white/10 bg-black/25 p-1">
            <button onClick={() => setActiveTab("module:whatsapp:bandeja")} className={currentView === "bandeja" ? "rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-950" : "rounded-full px-5 py-2 text-sm text-white/60 hover:text-white"}>Bandeja</button>
            <button onClick={() => setActiveTab("module:whatsapp:enviar")} className={currentView === "enviar" ? "rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-950" : "rounded-full px-5 py-2 text-sm text-white/60 hover:text-white"}>Enviar</button>
            <button onClick={() => setActiveTab("module:whatsapp:plantillas")} className={currentView === "plantillas" ? "rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-950" : "rounded-full px-5 py-2 text-sm text-white/60 hover:text-white"}>Plantillas</button>
            <button onClick={() => setActiveTab("module:whatsapp:bots")} className={currentView === "bots" ? "rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-950" : "rounded-full px-5 py-2 text-sm text-white/60 hover:text-white"}>Bots</button>
          </div>
        </div>
      </GlassCard>

      {!whatsappConnection && (
        <GlassCard title="Conexión manual WhatsApp Cloud API">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="text-sm font-semibold text-white/70">
              Access Token permanente
              <input type="password" value={manualAccessToken} onChange={(event) => setManualAccessToken(event.target.value)} placeholder="EAAB..." className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50" />
            </label>
            <label className="text-sm font-semibold text-white/70">
              Phone Number ID
              <input value={manualPhoneNumberId} onChange={(event) => setManualPhoneNumberId(event.target.value)} placeholder="1200..." className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50" />
            </label>
            <label className="text-sm font-semibold text-white/70">
              WABA ID / Business Account ID
              <input value={manualWabaId} onChange={(event) => setManualWabaId(event.target.value)} placeholder="1310..." className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50" />
            </label>
            <label className="text-sm font-semibold text-white/70">
              Número visible
              <input value={manualDisplayPhone} onChange={(event) => setManualDisplayPhone(event.target.value)} placeholder="+34 600 000 000" className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50" />
            </label>
          </div>
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-50/80">
            <p>Mientras Meta no desbloquee el Embedded Signup, conecta Neuronas con los datos manuales de WhatsApp Cloud API. Este número debe estar migrado a Cloud API, por lo que dejará de usarse en la app móvil normal.</p>
            <button type="button" onClick={saveManualWhatsappConnection} disabled={savingManualConnection} className="w-fit rounded-full bg-white px-5 py-2 text-xs font-semibold text-neutral-950 disabled:opacity-60">
              {savingManualConnection ? "Guardando..." : "Guardar conexión manual"}
            </button>
          </div>
        </GlassCard>
      )}

      {currentView === "bandeja" ? (
        <section className="grid h-[min(72vh,48rem)] min-h-[38rem] max-w-full min-w-0 overflow-hidden rounded-[2.25rem] border border-white/10 bg-black/30 shadow-2xl shadow-black/20 xl:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)]">
          <aside className="min-w-0 overflow-hidden border-b border-white/10 bg-white/[0.035] xl:border-b-0 xl:border-r">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Bandeja en vivo</p>
                <p className="mt-1 text-xs text-white/45">{lastInboxSync ? `Actualizado ${lastInboxSync.toLocaleTimeString()}` : "Sincronizando..."}</p>
              </div>
              <button type="button" onClick={() => fetchWhatsappInbox(false)} disabled={whatsappInboxLoading} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/[0.1] disabled:opacity-50">
                {whatsappInboxLoading ? "..." : "Actualizar"}
              </button>
            </div>
            {whatsappInboxError && <div className="m-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-3 text-xs text-rose-100">{whatsappInboxError}</div>}
            <div className="h-[calc(100%-4.5rem)] overflow-y-auto p-3">
              {visibleConversationGroups.length ? visibleConversationGroups.map((conversation) => (
                <div key={conversation.phone} className="relative mb-2">
                  <button type="button" onClick={() => setSelectedConversationPhone(conversation.phone)} className={selectedConversation?.phone === conversation.phone ? "w-full rounded-[1.5rem] border border-emerald-300/35 bg-emerald-400/10 p-4 pr-10 text-left shadow-[0_18px_50px_rgba(16,185,129,0.08)]" : "w-full rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-4 pr-10 text-left hover:bg-white/[0.08]"}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{conversation.contactName || conversation.phone}</p>
                        <p className="mt-1 truncate text-xs text-white/45">+{conversation.phone}</p>
                      </div>
                      {conversation.unread > 0 && <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[11px] font-bold text-neutral-950">{conversation.unread}</span>}
                    </div>
                    <p className="mt-3 line-clamp-2 break-words text-sm text-white/65">{conversation.lastMessage.direction === "outbound" ? "Tú: " : ""}{conversation.lastMessage.message}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-white/30">{new Date(conversation.lastMessage.created_at).toLocaleString()}</p>
                  </button>
                  <button type="button" onClick={(event) => { event.stopPropagation(); closeConversation(conversation.phone); }} title="Cerrar chat" aria-label="Cerrar chat" className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/35 text-sm text-white/45 hover:border-rose-300/30 hover:bg-rose-500/15 hover:text-rose-100">
                    ×
                  </button>
                </div>
              )) : <Empty text={conversationGroups.length ? "Has cerrado todos los chats de esta vista. Actualiza o espera nuevos mensajes para volver a ver conversaciones." : "Aún no hay conversaciones. Cuando alguien escriba a tu WhatsApp conectado aparecerá aquí automáticamente."} />}
            </div>
          </aside>

          <main className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.035] p-4">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">{selectedConversation ? selectedConversation.contactName || `+${selectedConversation.phone}` : "Selecciona una conversación"}</p>
                <p className="mt-1 text-xs text-white/45">{selectedConversation ? `+${selectedConversation.phone} · ${selectedConversation.messages.length} mensajes · ${selectedConversation.customer ? "vinculado al CRM" : "lead sin ficha"}` : "Bandeja estilo WhatsApp conectada a Cloud API"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedConversation && (
                  <button type="button" onClick={openConversationCrm} className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-400/20">
                    {selectedConversation.customer ? "Abrir ficha CRM" : "Crear ficha CRM"}
                  </button>
                )}
                <span className={whatsappConnection ? "rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100" : "rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-100"}>
                  {whatsappConnection ? "Cloud API conectado" : "Sin conexión"}
                </span>
              </div>
            </div>

            <div className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.1),transparent_35%)] p-4">
              {selectedConversation ? (
                <div className="mx-auto grid w-full max-w-5xl gap-3">
                  {selectedConversation.messages.map((message) => (
                    <div key={message.id} className={message.direction === "inbound" ? "mr-auto max-w-[min(75%,42rem)] min-w-0 overflow-hidden rounded-[1.15rem] rounded-bl-sm border border-white/10 bg-white/[0.08] px-4 py-3 shadow-lg shadow-black/10" : "ml-auto max-w-[min(75%,42rem)] min-w-0 overflow-hidden rounded-[1.15rem] rounded-br-sm border border-emerald-300/20 bg-emerald-400/15 px-4 py-3 shadow-lg shadow-emerald-950/10"}>
                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-white/90 [overflow-wrap:anywhere]">{message.message || "Mensaje sin texto"}</p>
                      <div className="mt-2 flex items-center justify-end gap-2 text-[10px] uppercase tracking-[0.14em] text-white/35">
                        <span>{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        <span>{message.direction === "inbound" ? "Recibido" : message.status || "Enviado"}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={whatsappChatEndRef} />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Empty text="Selecciona un chat de la izquierda para responder como en WhatsApp." />
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-white/10 bg-black/50 p-4 backdrop-blur-xl">
              <form onSubmit={(event) => { event.preventDefault(); sendConversationReply(); }} className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row md:items-end">
                <textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder={selectedConversation ? "Escribe un mensaje..." : "Selecciona una conversación"} className="input-dark min-h-14 max-h-28 min-w-0 flex-1 resize-none" />
                <button type="submit" disabled={sending || !whatsappConnection || !selectedConversation} className="btn-primary h-12 shrink-0 disabled:cursor-not-allowed disabled:opacity-50"><Send size={16} /> {sending ? "Enviando..." : "Enviar"}</button>
              </form>
              <p className="mt-2 text-xs text-white/40">La bandeja se actualiza automáticamente cada 4 segundos mediante el webhook y la API interna de Flowly.</p>
            </div>
          </main>
        </section>
      ) : currentView === "enviar" ? (
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

            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold">Últimas conversaciones</p>
              <div className="mt-3 grid gap-2">
                {liveWhatsappMessages.slice(0, 12).length ? liveWhatsappMessages.slice(0, 12).map((message) => (
                  <div key={message.id} className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-white/65">{message.contact_name || message.phone || "WhatsApp"}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-white/80">{message.message}</p>
                    </div>
                    <span className={message.direction === "inbound" ? "shrink-0 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-100" : "shrink-0 rounded-full bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-100"}>
                      {message.direction === "inbound" ? "Recibido" : message.status || "Enviado"}
                    </span>
                  </div>
                )) : <Empty text="Aún no hay conversaciones guardadas." />}
              </div>
            </div>

            <button onClick={sendMessage} disabled={sending} className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-50">
              <MessageCircle size={17} /> {sending ? "Enviando..." : whatsappConnection ? "Enviar desde Flowly" : "Abrir WhatsApp manual"}
            </button>
          </div>
        </GlassCard>
      ) : currentView === "plantillas" ? (
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
      ) : (
        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <GlassCard title="Crear bot automático real">
            <p className="mb-4 text-sm leading-6 text-white/55">Crea respuestas simples o menús numerados tipo centralita: “marca 1 para citas, 2 para información…”. Flowly recuerda el último menú enviado a ese número, interpreta la respuesta numérica y crea/actualiza la ficha CRM automáticamente.</p>
            <div className="grid gap-3">
              <input value={botName} onChange={(e) => setBotName(e.target.value)} placeholder="Nombre de la regla: Menú inicial, Citas, Horario..." className="input-dark" />
              <select value={botType} onChange={(e) => setBotType(e.target.value as "reply" | "menu")} className="input-dark">
                <option value="reply">Respuesta automática simple</option>
                <option value="menu">Marcaje de números + CRM</option>
              </select>
              <select value={botMatchMode} onChange={(e) => setBotMatchMode(e.target.value)} className="input-dark">
                <option value="contains">Si el mensaje contiene</option>
                <option value="exact">Si el mensaje es exactamente</option>
              </select>
              <input value={botTrigger} onChange={(e) => setBotTrigger(e.target.value)} placeholder="Palabra clave que inicia el bot: hola, cita, información..." className="input-dark" />

              {botType === "menu" ? (
                <div className="grid gap-3 rounded-[1.5rem] border border-cyan-300/15 bg-cyan-400/10 p-4">
                  <textarea value={menuIntro} onChange={(e) => setMenuIntro(e.target.value)} placeholder="Texto inicial del menú" className="input-dark min-h-24" />
                  <div className="grid gap-3">
                    {menuOptions.map((option, index) => (
                      <div key={`${option.digit}-${index}`} className="grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-3">
                        <div className="grid gap-2 md:grid-cols-[5rem_1fr]">
                          <input value={option.digit} onChange={(e) => setMenuOptions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, digit: e.target.value.replace(/\D/g, "").slice(0, 2) } : item))} placeholder="1" className="input-dark" />
                          <input value={option.label} onChange={(e) => setMenuOptions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, label: e.target.value } : item))} placeholder="Quiero agendar una cita" className="input-dark" />
                        </div>
                        <div className="grid gap-2 md:grid-cols-[0.8fr_1.2fr]">
                          <select value={option.crm_status || "interesado"} onChange={(e) => setMenuOptions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, crm_status: e.target.value } : item))} className="input-dark">
                            <option value="nuevo">CRM: Nuevo lead</option>
                            <option value="interesado">CRM: Interesado</option>
                            <option value="cita_solicitada">CRM: Cita solicitada</option>
                            <option value="contactar">CRM: Contactar</option>
                            <option value="soporte">CRM: Soporte</option>
                            <option value="descartado">CRM: Descartado</option>
                          </select>
                          <input value={option.response || ""} onChange={(e) => setMenuOptions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, response: e.target.value } : item))} placeholder="Respuesta al elegir esta opción" className="input-dark" />
                        </div>
                        <button type="button" onClick={() => setMenuOptions((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="w-fit rounded-full border border-red-300/20 px-3 py-1.5 text-xs text-red-100/80 hover:bg-red-500/10">Eliminar opción</button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setMenuOptions((current) => [...current, { digit: String(current.length + 1), label: "Nueva opción", crm_status: "interesado", response: "Hemos registrado tu selección." }])} className="btn-secondary justify-center"><Plus size={16} /> Añadir opción</button>
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/70">Vista previa WhatsApp</p>
                    <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/75">{previewFlowlyMenu({ type: "flowly_menu_v1", intro: menuIntro, options: menuOptions })}</pre>
                  </div>
                </div>
              ) : (
                <textarea value={botResponse} onChange={(e) => setBotResponse(e.target.value)} placeholder="Respuesta automática que enviará Flowly" className="input-dark min-h-40" />
              )}

              <button onClick={createBotRule} className="btn-primary justify-center"><Bot size={17} /> Crear bot</button>
            </div>
          </GlassCard>
          <GlassCard title="Bots activos en el webhook">
            <div className="grid gap-3">
              {localBotRules.length ? localBotRules.map((rule) => (
                <div key={rule.id || rule.trigger_text} className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{rule.name}</p>
                        <span className={rule.is_active ? "rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-100" : "rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/45"}>{rule.is_active ? "Activo" : "Pausado"}</span>
                      </div>
                      <p className="mt-2 text-xs text-white/45">{rule.match_mode === "exact" ? "Coincide exactamente" : "Contiene"}: <span className="text-cyan-100">{rule.trigger_text}</span></p>
                      {(() => {
                        const menu = parseFlowlyMenuMessage(rule.response_message);
                        if (!menu) return <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/65">{rule.response_message}</p>;
                        return (
                          <div className="mt-3 rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/70">Menú numerado conectado al CRM</p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/75">{previewFlowlyMenu(menu)}</p>
                            <div className="mt-3 grid gap-2">
                              {menu.options.map((option) => (
                                <div key={`${option.digit}-${option.label}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/20 px-3 py-2 text-xs text-white/60">
                                  <span>{option.digit}. {option.label}</span>
                                  <span className="rounded-full bg-white/10 px-2 py-1 text-white/50">CRM: {option.crm_status || "interesado"}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button onClick={() => toggleBotRule(rule)} className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/75 hover:bg-white/10">{rule.is_active ? "Pausar" : "Activar"}</button>
                      <button onClick={() => deleteBotRule(rule)} className="rounded-full border border-red-300/20 px-4 py-2 text-xs text-red-200/80 hover:bg-red-500/10">Eliminar</button>
                    </div>
                  </div>
                </div>
              )) : <Empty text="Crea reglas para responder automáticamente a palabras clave como precio, cita u horario." />}
            </div>
          </GlassCard>
        </section>
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
    const text = `${customerName(customer)} ${customer.phone || ""} ${customer.email || ""} ${customer.document_number || ""} ${customer.eps || ""} ${customer.crm_status || ""} ${customer.notes || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });
  const withPhone = customers.filter((customer: Customer) => customer.phone).length;
  const whatsappLeads = customers.filter((customer: Customer) => (customer.crm_status || "").includes("whatsapp") || (customer.notes || "").toLowerCase().includes("whatsapp")).length;
  const needsFollowUp = customers.filter((customer: Customer) => !customer.next_follow_up_at && !["cerrado", "perdido", "alta"].includes(customer.crm_status || "nuevo")).length;
  const vipCustomers = Math.max(0, customers.filter((customer: Customer) => (customer.crm_status || "").includes("vip") || (customer.notes || "").toLowerCase().includes("vip")).length);
  const featured = filteredCustomers.slice(0, 8);
  const newest = filteredCustomers[0];
  const segments: { label: string; value: number | string; helper: string; icon: any }[] = [
    { label: "Base total", value: customers.length, helper: "clientes en CRM", icon: Users },
    { label: "WhatsApp", value: whatsappLeads, helper: "origen conversacional", icon: MessageCircle },
    { label: "Con contacto", value: withPhone, helper: "listos para campaña", icon: PhoneCall },
    { label: "A revisar", value: needsFollowUp, helper: "sin próxima acción", icon: Clock },
  ];
  const kanban = [
    { title: "Nuevo", count: customers.filter((c: Customer) => ["nuevo", "nuevo_whatsapp", undefined, null, ""].includes(c.crm_status as any)).length, tone: "cyan" },
    { title: "Contactado", count: customers.filter((c: Customer) => ["contactar", "interesado", "cita_solicitada"].includes(c.crm_status || "")).length, tone: "violet" },
    { title: "Cita / propuesta", count: customers.filter((c: Customer) => ["cita_agendada", "presupuesto", "seguimiento"].includes(c.crm_status || "")).length, tone: "emerald" },
    { title: "Ganado", count: customers.filter((c: Customer) => ["cliente", "alta", "cerrado"].includes(c.crm_status || "")).length, tone: "amber" },
  ];

  return (
    <section className="space-y-7">
      <div className="relative overflow-hidden rounded-[2.7rem] border border-white/10 bg-[radial-gradient(circle_at_15%_0%,rgba(34,211,238,.30),transparent_34%),radial-gradient(circle_at_85%_10%,rgba(168,85,247,.28),transparent_32%),linear-gradient(135deg,#020617,#0f172a_48%,#111827)] p-6 shadow-2xl shadow-black/40 md:p-8">
        <div className="absolute right-8 top-8 hidden h-40 w-40 rounded-full border border-cyan-200/10 bg-cyan-300/10 blur-2xl lg:block" />
        <div className="relative grid gap-8 xl:grid-cols-[1.15fr_.85fr] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
              <Sparkles size={15} /> Client OS Premium
            </div>
            <h2 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
              Clientes, seguimiento y ventas en una interfaz mucho más limpia.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              Vista rediseñada para que el negocio vea rápido quién es el cliente, de dónde viene, qué necesita y cuál es la siguiente acción comercial.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {["CRM 360", "WhatsApp", "Agenda", "Facturación", "Notas", "Documentos"].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-sm text-white/72">{item}</span>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {segments.map(({ label, value, helper, icon: Icon }) => (
              <div key={label} className="rounded-[1.55rem] border border-white/10 bg-white/[0.075] p-5 backdrop-blur-xl">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-100"><Icon size={20} /></div>
                <p className="text-sm text-white/45">{label}</p>
                <p className="mt-1 text-3xl font-semibold text-white">{value}</p>
                <p className="mt-1 text-xs text-white/38">{helper}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-black/30">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">Alta rápida</p>
                <h3 className="mt-1 text-xl font-semibold">Nuevo cliente</h3>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950"><Plus size={19} /></div>
            </div>
            <div className="grid gap-3">
              <input value={customerFormName} onChange={(e) => setCustomerFormName(e.target.value)} placeholder="Nombre completo" className="input-dark" />
              <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Teléfono / WhatsApp" className="input-dark" />
              <button onClick={createCustomer} className="btn-primary w-full justify-center"><Plus size={17} /> Crear ficha</button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">Pipeline visual</p>
            <div className="mt-5 space-y-3">
              {kanban.map((stage, index) => (
                <div key={stage.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white/84">{stage.title}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/62">{stage.count}</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-cyan-200" style={{ width: `${Math.min(100, 18 + index * 18 + stage.count * 6)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-300/15 bg-cyan-300/[0.07] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/70">Segmentos inteligentes</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Nuevo WhatsApp", "VIP", "Pendiente pago", "Sin seguimiento", "Cita próxima", "Factura pendiente"].map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-2 text-xs text-white/68">{tag}</span>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/65 p-4 shadow-2xl shadow-black/25">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 text-white/35" size={18} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, teléfono, documento, EPS, estado, origen o nota" className="input-dark pl-11" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-white/55 sm:min-w-[330px]">
                <div className="rounded-2xl bg-white/[0.06] px-3 py-3"><b className="block text-lg text-white">{filteredCustomers.length}</b> visibles</div>
                <div className="rounded-2xl bg-white/[0.06] px-3 py-3"><b className="block text-lg text-white">{vipCustomers}</b> VIP</div>
                <div className="rounded-2xl bg-white/[0.06] px-3 py-3"><b className="block text-lg text-white">{needsFollowUp}</b> revisar</div>
              </div>
            </div>
          </div>

          {newest && (
            <div className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,.10),rgba(255,255,255,.035))] p-5">
              <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
                <div className="flex gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-xl font-semibold text-slate-950">
                    {(customerName(newest).split(" ").filter(Boolean).slice(0, 2).map((part: string) => part[0]?.toUpperCase()).join("") || "CL")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">Ficha destacada</p>
                    <h3 className="mt-1 truncate text-2xl font-semibold">{customerName(newest)}</h3>
                    <p className="mt-2 text-sm text-white/50">{newest.phone || newest.email || "Sin contacto"} · {translateCrmStatus(newest.crm_status || "nuevo")}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-950"><MessageCircle size={14} className="mr-1 inline" /> WhatsApp</button>
                      <button className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/72"><CalendarDays size={14} className="mr-1 inline" /> Agendar</button>
                      <button className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/72"><Receipt size={14} className="mr-1 inline" /> Facturar</button>
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/38">Resumen IA</p>
                  <p className="mt-3 text-sm leading-6 text-white/62">Cliente listo para seguimiento. Revisa origen, próxima acción y posible presupuesto antes de cerrar la conversación.</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 2xl:grid-cols-2">
            {featured.map((customer: Customer) => {
              const initials = customerName(customer).split(" ").filter(Boolean).slice(0, 2).map((part: string) => part[0]?.toUpperCase()).join("") || "CL";
              const status = translateCrmStatus(customer.crm_status || "nuevo");
              const origin = (customer.crm_status || "").includes("whatsapp") || (customer.notes || "").toLowerCase().includes("whatsapp") ? "WhatsApp" : "CRM";
              return (
                <article key={customer.id} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.052] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/[0.085] hover:shadow-2xl hover:shadow-cyan-950/20">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-300/10 blur-2xl transition group-hover:bg-cyan-300/20" />
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-950 text-base font-semibold text-cyan-100">{initials}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-semibold text-white">{customerName(customer)}</h3>
                          <p className="mt-1 truncate text-sm text-white/45">{customer.phone || customer.email || "Sin contacto"}</p>
                        </div>
                        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold text-cyan-100">{origin}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/70">{status}</span>
                        {customer.document_number && <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/55">ID {customer.document_number}</span>}
                        {customer.eps && <span className="rounded-full bg-violet-300/10 px-3 py-1 text-[11px] text-violet-100">{translateIntent(customer.eps || "informacion")}</span>}
                      </div>
                      <div className="mt-5 grid gap-2 sm:grid-cols-3">
                        <button className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white/72 transition hover:bg-white/10"><MessageCircle size={14} className="mr-1 inline" /> WhatsApp</button>
                        <button className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white/72 transition hover:bg-white/10"><CalendarDays size={14} className="mr-1 inline" /> Agenda</button>
                        <button className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white/72 transition hover:bg-white/10"><Receipt size={14} className="mr-1 inline" /> Factura</button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
            {!filteredCustomers.length && <Empty text="No hay clientes que coincidan con la búsqueda." />}
          </div>
        </div>
      </section>
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
  removeBusinessAvatar,
  activeModules,
  inactiveModules,
  activateModule,
  deactivateModule,
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
  removeBusinessAvatar: () => void;
  activeModules: ModuleItem[];
  inactiveModules: ModuleItem[];
  activateModule: (moduleKey: string) => void;
  deactivateModule: (moduleKey: string) => void;
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
            <div className="grid gap-2 md:grid-cols-2">
              <button onClick={generateBusinessAvatar} disabled={avatarGenerating} className="btn-primary disabled:opacity-60"><Bot size={17} /> {avatarGenerating ? "Generando mascota IA..." : businessAvatar?.avatar_url ? "Regenerar mascota IA" : "Crear mi mascota IA"}</button>
              <button onClick={removeBusinessAvatar} disabled={!businessAvatar || avatarGenerating} className="rounded-full border border-red-300/25 px-5 py-3 text-sm font-medium text-red-100 disabled:cursor-not-allowed disabled:opacity-40"><XCircle size={17} className="inline" /> Quitar mascota</button>
            </div>
            <p className="text-xs leading-5 text-white/35">Si la quitas, desaparecerá del panel de este cliente. Podrás volver a crearla desde aquí cuando quieras.</p>
          </div>
        </GlassCard>

        <GlassCard title="Módulos contratados">
          <div className="grid gap-4">
            <p className="text-sm leading-6 text-white/55">Gestiona los módulos visibles en tu panel. Al eliminar uno se oculta del menú y queda desactivado para este negocio, sin borrar el histórico ya registrado.</p>
            <div className="grid gap-3">
              {activeModules.map((module) => {
                const Icon = module.Icon;
                return (
                  <div key={module.key} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-100"><Icon size={19} /></div>
                      <div>
                        <p className="font-semibold">{module.name}</p>
                        <p className="mt-1 text-xs leading-5 text-white/45">{module.description}</p>
                      </div>
                    </div>
                    <button onClick={() => deactivateModule(module.key)} className="rounded-full border border-red-300/25 px-4 py-2 text-xs font-medium text-red-100">Eliminar módulo</button>
                  </div>
                );
              })}
              {!activeModules.length && <Empty text="No hay módulos activos en este panel." />}
            </div>
            {inactiveModules.length > 0 && (
              <details className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-cyan-100">Ver módulos disponibles para volver a añadir</summary>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {inactiveModules.map((module) => <ModuleAccessCard key={module.key} module={module} onActivate={() => activateModule(module.key)} />)}
                </div>
              </details>
            )}
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
function Shell({ children }: { children: React.ReactNode; theme?: string }) { return <main className="flowly-app-shell relative overflow-hidden text-white"><div className="flowly-app-content relative z-10">{children}</div></main>; }
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
