"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { FIRST_BRANCH_RULE, buildCommissionLines, canManageTeam, getCommissionRule } from "@/lib/salesCommissions";
import {
  BarChart3,
  Banknote,
  BookOpen,
  Crown,
  Euro,
  FileText,
  LogOut,
  FolderOpen,
  Plus,
  Search,
  Send,
  Shield,
  Users,
} from "lucide-react";

type SalesRole = "director" | "jefe" | "senior" | "asociado";
type AdminTab = "resumen" | "presupuestos" | "comerciales" | "fichajes" | "metodos_pago" | "documentos" | "formaciones" | "leads" | "comisiones" | "clientes" | "marketing";

type SalesUser = {
  id: string;
  user_id?: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  role: SalesRole;
  manager_id: string | null;
  monthly_target: number | null;
  status: string | null;
  referral_code?: string | null;
  payment_link?: string | null;
  payment_bank_name?: string | null;
  payment_account_number?: string | null;
  payment_account_holder?: string | null;
  payment_account_address?: string | null;
  payment_notes?: string | null;
  payment_methods_updated_at?: string | null;
  terminated_at?: string | null;
  created_at?: string;
};

type SalesTimeLog = {
  id: string;
  sales_user_id: string;
  clock_in_at: string;
  clock_out_at: string | null;
  status: "online" | "offline";
  notes?: string | null;
  created_at?: string;
};

type SalesLead = {
  id: string;
  company: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  sector: string | null;
  plan: string | null;
  estimated_mrr: number | null;
  status: string;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
};

type Commission = { id: string; sales_user_id: string | null; amount: number; type: string; status: string; created_at?: string; percentage?: number | null; hierarchy_level?: number | null; description?: string | null; source_sales_user_id?: string | null };
type Payout = { id: string; sales_user_id: string | null; amount: number; status: string; created_at?: string };
type Business = { id: string; name: string; plan: string | null; subscription_status: string | null; created_at?: string; sales_user_id?: string | null; stripe_customer_id?: string | null; stripe_subscription_id?: string | null };
type ManualSaleForm = { businessId: string; salesUserId: string; plan: string; monthlyAmount: string; setupAmount: string; notes: string };
type BusinessStatusOption = { value: string; label: string };
type BudgetModule = { key: string; name: string; price: number };
type SalesBudget = {
  id: string;
  sales_user_id: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  company: string | null;
  sector: string | null;
  plan_key: string;
  plan_name: string;
  modules: BudgetModule[] | null;
  monthly_amount: number;
  setup_amount: number;
  currency: string;
  country: string | null;
  status: string;
  notes: string | null;
  sent_at: string | null;
  created_at: string;
};

type SalesDocumentTemplate = {
  id: string;
  title: string;
  description: string | null;
  document_type: string | null;
  content: string | null;
  file_url: string | null;
  assigned_sales_user_id?: string | null;
  pdf_fields?: Record<string, string> | null;
  requires_signature: boolean | null;
  is_active: boolean | null;
  created_at?: string;
};

type SalesDocumentSignature = {
  id: string;
  document_id: string;
  sales_user_id: string;
  status: string;
  full_name: string | null;
  dni: string | null;
  address: string | null;
  signature_text: string | null;
  signed_at: string | null;
};

type TrainingFolder = { id: string; name: string; description: string | null; sort_order: number | null; is_active: boolean | null };
type TrainingItem = { id: string; folder_id: string | null; title: string; description: string | null; content: string | null; url: string | null; item_type: string | null; sort_order: number | null; is_active: boolean | null; requires_completion?: boolean | null; estimated_minutes?: number | null };
type TrainingProgress = { id: string; sales_user_id: string; training_item_id: string; status: string | null; watched_seconds: number | null; duration_seconds: number | null; progress_percent: number | null; completed_at: string | null; updated_at?: string | null };

type MarketingOrder = {
  id: string;
  plan_id: string;
  plan_name: string;
  plan_type?: string | null;
  tier?: string | null;
  posts_per_week?: number | null;
  monthly_amount?: number | null;
  currency?: string | null;
  includes_software_module?: boolean | null;
  features?: string[] | null;
  deliverables?: string[] | null;
  automation_blueprint?: string[] | null;
  status: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  business_name: string | null;
  sector: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  website_url: string | null;
  objectives: string | null;
  brand_tone: string | null;
  target_customer: string | null;
  offers: string | null;
  notes: string | null;
  created_at: string;
};

type MarketingTask = {
  id: string;
  marketing_order_id: string;
  title: string;
  status: string | null;
  due_at: string | null;
  sort_order: number | null;
};

type MarketingContentItem = {
  id: string;
  marketing_order_id: string;
  title: string;
  channel: string | null;
  content_type: string | null;
  status: string | null;
  scheduled_for: string | null;
  sort_order: number | null;
};

type PlanOption = { key: string; name: string; price: number; description: string };
type ModuleOption = { key: string; name: string; price: number };

const roles: SalesRole[] = ["asociado", "senior", "jefe", "director"];
const roleLabels: Record<SalesRole, string> = { asociado: "Comercial Asociado", senior: "Comercial Senior", jefe: "Jefe Comercial", director: "Director Comercial" };
const leadStatuses = ["nuevo", "contactado", "demo", "propuesta", "cerrado", "perdido"];
const budgetStatuses = ["borrador", "enviado", "aceptado", "rechazado"];
const businessStatusOptions: BusinessStatusOption[] = [
  { value: "trialing", label: "Prueba" },
  { value: "payment_pending", label: "Pendiente de pago" },
  { value: "paid", label: "Pagado" },
  { value: "active", label: "Activo" },
  { value: "past_due", label: "Pago atrasado" },
  { value: "cancelled", label: "Cancelado" },
];

const plans: PlanOption[] = [
  { key: "basic", name: "Flowly Basic", price: 29.99, description: "Agenda, clientes, reservas y panel base." },
  { key: "premium", name: "Flowly Premium", price: 59.99, description: "Pack completo recomendado." },
  { key: "modular", name: "Flowly Modular", price: 19.99, description: "Base flexible por módulos." },
  { key: "enterprise", name: "Flowly Enterprise", price: 0, description: "Proyecto personalizado bajo presupuesto." },
];

const modules: ModuleOption[] = [
  { key: "agenda", name: "Agenda PRO", price: 9.99 },
  { key: "whatsapp", name: "WhatsApp automático", price: 9.99 },
  { key: "billing", name: "Facturación PRO", price: 9.99 },
  { key: "pos", name: "TPV", price: 14.99 },
  { key: "crm", name: "CRM avanzado", price: 9.99 },
  { key: "marketing", name: "Marketing", price: 9.99 },
  { key: "ai", name: "IA Assistant", price: 14.99 },
  { key: "analytics", name: "Estadísticas avanzadas", price: 4.99 },
  { key: "booking_premium", name: "Reservas Premium", price: 4.99 },
  { key: "voice", name: "Flowly Voice", price: 29.99 },
];

function money(value: number, currency = "EUR") {
  if (currency === "COP") return `$${Math.round(value).toLocaleString("es-CO")} COP`;
  return `${Number(value || 0).toFixed(2)}€`;
}

function createReferralCode(name: string) {
  const base = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 10) || "FLOWLY";
  return `${base}${Math.floor(1000 + Math.random() * 9000)}`;
}

function businessStatusLabel(status?: string | null) {
  if (!status) return "Sin estado";
  const normalized = status === "manual_paid" || status === "maual_paid" ? "paid" : status;
  return businessStatusOptions.find((option) => option.value === normalized)?.label || normalized.replace(/_/g, " ");
}

function businessStatusValue(status?: string | null) {
  if (status === "manual_paid" || status === "maual_paid") return "paid";
  return status || "trialing";
}

function buildPaymentLink(code: string) {
  const base = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || "");
  return `${base}/precios?ref=${encodeURIComponent(code)}`;
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("resumen");
  const [salesUsers, setSalesUsers] = useState<SalesUser[]>([]);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [budgets, setBudgets] = useState<SalesBudget[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [documents, setDocuments] = useState<SalesDocumentTemplate[]>([]);
  const [documentSignatures, setDocumentSignatures] = useState<SalesDocumentSignature[]>([]);
  const [trainingFolders, setTrainingFolders] = useState<TrainingFolder[]>([]);
  const [trainingItems, setTrainingItems] = useState<TrainingItem[]>([]);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress[]>([]);
  const [marketingOrders, setMarketingOrders] = useState<MarketingOrder[]>([]);
  const [marketingTasks, setMarketingTasks] = useState<MarketingTask[]>([]);
  const [marketingContentItems, setMarketingContentItems] = useState<MarketingContentItem[]>([]);
  const [timeLogs, setTimeLogs] = useState<SalesTimeLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [salesFilter, setSalesFilter] = useState("todos");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<SalesRole>("asociado");
  const [managerId, setManagerId] = useState("");
  const [monthlyTarget, setMonthlyTarget] = useState("5");
  const resetSalesPassword = async (user: SalesUser) => {
    const password = window.prompt(`Nueva contraseña para ${user.full_name} (${user.email})`);
    if (!password) return;
    if (password.trim().length < 8) return alert("La contraseña debe tener mínimo 8 caracteres.");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return router.push("/login");
    const res = await fetch("/api/admin/sales-users/password", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ salesUserId: user.id, password }),
    });
    const result = await res.json();
    if (!res.ok) return alert(result.error || "No se pudo cambiar la contraseña");
    await load();
    alert(result.created ? "Usuario de acceso creado y contraseña asignada." : "Contraseña actualizada correctamente.");
  };

  const [leadCompany, setLeadCompany] = useState("");
  const [leadContact, setLeadContact] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSector, setLeadSector] = useState("Peluquería");
  const [leadAssigned, setLeadAssigned] = useState("");
  const [leadNotes, setLeadNotes] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [budgetCompany, setBudgetCompany] = useState("");
  const [budgetSector, setBudgetSector] = useState("Peluquería");
  const [budgetSalesUser, setBudgetSalesUser] = useState("");
  const [planKey, setPlanKey] = useState("premium");
  const [setupAmount, setSetupAmount] = useState("0");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [budgetNotes, setBudgetNotes] = useState("");

  const [manualSale, setManualSale] = useState<ManualSaleForm>({ businessId: "", salesUserId: "", plan: "premium", monthlyAmount: "84.99", setupAmount: "0", notes: "" });
  const [paymentLinks, setPaymentLinks] = useState<Record<string, string>>({});
  const [documentTitle, setDocumentTitle] = useState("Contrato comercial");
  const [documentDescription, setDocumentDescription] = useState("Contrato genérico para firma del trabajador");
  const [documentType, setDocumentType] = useState("contrato");
  const [documentContent, setDocumentContent] = useState("CONTRATO COMERCIAL\n\nEntre Flowly IA y {{nombre}}, con documento {{dni}} y dirección {{direccion}}, se acuerdan las condiciones comerciales indicadas por la empresa.\n\nFecha: {{fecha}}\nFirma: {{nombre}}");
  const [documentFileUrl, setDocumentFileUrl] = useState("");
  const [documentFileUploading, setDocumentFileUploading] = useState(false);
  const [documentAssignedSalesUser, setDocumentAssignedSalesUser] = useState("");
  const [documentTargetMode, setDocumentTargetMode] = useState<"single" | "all">("single");
  const [trainingUploadMessage, setTrainingUploadMessage] = useState("");
  const [contractWorkerName, setContractWorkerName] = useState("");
  const [contractWorkerDni, setContractWorkerDni] = useState("");
  const [contractWorkerAddress, setContractWorkerAddress] = useState("");
  const [documentRequiresSignature, setDocumentRequiresSignature] = useState(true);
  const [folderName, setFolderName] = useState("Formación en ventas");
  const [folderDescription, setFolderDescription] = useState("");
  const [trainingFolderId, setTrainingFolderId] = useState("");
  const [trainingTitle, setTrainingTitle] = useState("");
  const [trainingDescription, setTrainingDescription] = useState("");
  const [trainingContent, setTrainingContent] = useState("");
  const [trainingUrl, setTrainingUrl] = useState("");
  const [trainingType, setTrainingType] = useState("video");
  const [trainingFileUploading, setTrainingFileUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return router.push("/login");

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const [salesUsersRes, leadsRes, budgetsRes, commissionsRes, payoutsRes, businessesRes, documentsRes, signaturesRes, foldersRes, trainingItemsRes, trainingProgressRes, marketingOrdersRes, marketingTasksRes, marketingContentRes, timeLogsRes] = await Promise.all([
      supabase.from("sales_users").select("*").order("created_at", { ascending: false }),
      supabase.from("sales_leads").select("*").order("created_at", { ascending: false }),
      supabase.from("sales_budgets").select("*").order("created_at", { ascending: false }),
      supabase.from("commissions").select("*").order("created_at", { ascending: false }),
      token
        ? fetch("/api/admin/commission-payouts", { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json())
        : Promise.resolve({ payouts: [] }),
      supabase.from("businesses").select("id, name, plan, subscription_status, created_at, sales_user_id, stripe_customer_id, stripe_subscription_id").order("created_at", { ascending: false }).limit(200),
      supabase.from("sales_document_templates").select("*").order("created_at", { ascending: false }),
      supabase.from("sales_document_signatures").select("*").order("signed_at", { ascending: false }),
      supabase.from("sales_training_folders").select("*").order("sort_order", { ascending: true }),
      supabase.from("sales_training_items").select("*").order("sort_order", { ascending: true }),
      supabase.from("sales_training_progress").select("*").order("updated_at", { ascending: false }),
      supabase.from("marketing_orders").select("*").order("created_at", { ascending: false }),
      supabase.from("marketing_tasks").select("*").order("sort_order", { ascending: true }),
      supabase.from("marketing_content_calendar").select("*").order("scheduled_for", { ascending: true }),
      supabase.from("sales_time_logs").select("*").order("clock_in_at", { ascending: false }).limit(300),
    ]);

    setSalesUsers((salesUsersRes.data || []) as SalesUser[]);
    setLeads((leadsRes.data || []) as SalesLead[]);
    setBudgets((budgetsRes.data || []) as unknown as SalesBudget[]);
    setCommissions((commissionsRes.data || []) as Commission[]);
    setPayouts(((payoutsRes as any).payouts || []) as Payout[]);
    setBusinesses((businessesRes.data || []) as Business[]);
    setDocuments((documentsRes.data || []) as SalesDocumentTemplate[]);
    setDocumentSignatures((signaturesRes.data || []) as SalesDocumentSignature[]);
    setTrainingFolders((foldersRes.data || []) as TrainingFolder[]);
    setTrainingItems((trainingItemsRes.data || []) as TrainingItem[]);
    setTrainingProgress((trainingProgressRes.data || []) as TrainingProgress[]);
    setMarketingOrders(((marketingOrdersRes as any).data || []) as MarketingOrder[]);
    setMarketingTasks(((marketingTasksRes as any).data || []) as MarketingTask[]);
    setMarketingContentItems(((marketingContentRes as any).data || []) as MarketingContentItem[]);
    setTimeLogs(((timeLogsRes as any).data || []) as SalesTimeLog[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const selectedPlan = plans.find((plan) => plan.key === planKey) || plans[1];
  const budgetModules = modules.filter((module) => selectedModules.includes(module.key));
  const monthlyTotal = planKey === "enterprise" ? 0 : selectedPlan.price + budgetModules.reduce((sum, module) => sum + module.price, 0);

  const mrr = budgets.filter((budget) => budget.status === "aceptado").reduce((sum, budget) => sum + Number(budget.monthly_amount || 0), 0);
  const pendingCommissions = commissions.filter((item) => item.status === "pending").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const requestedPayouts = payouts.filter((item) => item.status === "requested").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const acceptedBudgets = budgets.filter((budget) => budget.status === "aceptado").length;
  const activeSalesUsers = salesUsers.filter((user) => user.status !== "terminated");
  const terminatedSalesUsers = salesUsers.filter((user) => user.status === "terminated");
  const onlineSalesUserIds = new Set(timeLogs.filter((log) => log.status === "online" && !log.clock_out_at).map((log) => log.sales_user_id));
  const onlineSalesUsers = activeSalesUsers.filter((user) => onlineSalesUserIds.has(user.id));
  const offlineSalesUsers = activeSalesUsers.filter((user) => !onlineSalesUserIds.has(user.id));
  const latestLogBySalesUser = (salesUserId: string) => timeLogs.find((log) => log.sales_user_id === salesUserId);
  const formatDuration = (start?: string | null, end?: string | null) => {
    if (!start) return "-";
    const diff = Math.max(0, new Date(end || new Date()).getTime() - new Date(start).getTime());
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return hours ? `${hours}h ${rest}m` : `${rest}m`;
  };

  const ranking = useMemo(() => activeSalesUsers.map((user) => {
    const userBudgets = budgets.filter((budget) => budget.sales_user_id === user.id);
    const accepted = userBudgets.filter((budget) => budget.status === "aceptado");
    const userMrr = accepted.reduce((sum, budget) => sum + Number(budget.monthly_amount || 0), 0);
    return { ...user, mrr: userMrr, budgets: userBudgets.length, accepted: accepted.length, leads: leads.filter((lead) => lead.assigned_to === user.id).length };
  }).sort((a, b) => b.mrr - a.mrr), [activeSalesUsers, budgets, leads]);

  const filteredBudgets = budgets.filter((budget) => {
    const seller = salesUsers.find((user) => user.id === budget.sales_user_id);
    const query = `${budget.client_name} ${budget.client_email || ""} ${budget.company || ""} ${seller?.full_name || ""}`.toLowerCase();
    const matchesSearch = !search || query.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "todos" || budget.status === statusFilter;
    const matchesSales = salesFilter === "todos" || budget.sales_user_id === salesFilter;
    return matchesSearch && matchesStatus && matchesSales;
  });

  const createSalesUser = async () => {
    if (!fullName || !email) return alert("Nombre y email son obligatorios");
    const referralCode = createReferralCode(fullName);
    const { error } = await supabase.from("sales_users").insert({ full_name: fullName, email, phone, role, manager_id: managerId || null, monthly_target: Number(monthlyTarget), status: "active", referral_code: referralCode, payment_link: buildPaymentLink(referralCode) });
    if (error) return alert(error.message);
    setFullName(""); setEmail(""); setPhone(""); setRole("asociado"); setManagerId(""); setMonthlyTarget("5");
    await load();
  };

  const updateSalesUser = async (id: string, field: string, value: string | number | null) => {
    await supabase.from("sales_users").update({ [field]: value }).eq("id", id);
    await load();
  };

  const terminateSalesUser = async (user: SalesUser) => {
    if (!window.confirm(`¿Dar de baja definitivamente a ${user.full_name}? Dejará de aparecer en la lista activa, selectores y equipo comercial.`)) return;
    const { error } = await supabase
      .from("sales_users")
      .update({ status: "terminated", manager_id: null, terminated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) return alert(error.message);
    await load();
  };

  const restoreSalesUser = async (user: SalesUser) => {
    const { error } = await supabase
      .from("sales_users")
      .update({ status: "active", terminated_at: null })
      .eq("id", user.id);
    if (error) return alert(error.message);
    await load();
  };

  const createLead = async () => {
    if (!leadCompany) return alert("Indica la empresa");
    const { error } = await supabase.from("sales_leads").insert({ company: leadCompany, contact_name: leadContact, phone: leadPhone, email: leadEmail, sector: leadSector, plan: "premium", estimated_mrr: 59.99, status: "nuevo", assigned_to: leadAssigned || null, notes: leadNotes });
    if (error) return alert(error.message);
    setLeadCompany(""); setLeadContact(""); setLeadPhone(""); setLeadEmail(""); setLeadNotes("");
    await load();
  };

  const updateLead = async (id: string, status: string) => {
    await supabase.from("sales_leads").update({ status }).eq("id", id);
    await load();
  };

  const createBudget = async () => {
    if (!clientName || !clientEmail) return alert("Indica cliente y email");
    const { error } = await supabase.from("sales_budgets").insert({
      sales_user_id: budgetSalesUser || null,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      company: budgetCompany,
      sector: budgetSector,
      plan_key: selectedPlan.key,
      plan_name: selectedPlan.name,
      modules: budgetModules,
      monthly_amount: monthlyTotal,
      setup_amount: Number(setupAmount || 0),
      currency: "EUR",
      country: "ES",
      status: "borrador",
      notes: budgetNotes,
    });
    if (error) return alert(error.message);
    setClientName(""); setClientEmail(""); setClientPhone(""); setBudgetCompany(""); setSelectedModules([]); setBudgetNotes("");
    await load(); setTab("presupuestos");
  };

  const sendBudget = async (budget: SalesBudget) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return router.push("/login");
    const res = await fetch("/api/sales/budgets/send", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ budgetId: budget.id }) });
    const result = await res.json();
    if (!res.ok) return alert(result.error || "No se pudo enviar el presupuesto");
    await load();
    if (result.mailto) window.location.href = result.mailto;
    alert(result.sent ? "Presupuesto enviado por email" : "Presupuesto marcado como enviado. Configura Resend para envío automático real.");
  };

  const updateBudgetStatus = async (id: string, status: string) => {
    await supabase.from("sales_budgets").update({ status, accepted_at: status === "aceptado" ? new Date().toISOString() : null }).eq("id", id);
    await load();
  };

  const updatePayout = async (id: string, status: string) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return router.push("/login");

    const res = await fetch("/api/admin/commission-payouts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ payoutId: id, status }),
    });
    const result = await res.json();
    if (!res.ok) return alert(result.error || "No se pudo actualizar la solicitud de cobro");
    await load();
  };

  const getAdminToken = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) router.push("/login");
    return token || "";
  };

  const assignBusinessToSalesUser = async (businessId: string, salesUserId: string) => {
    const token = await getAdminToken();
    if (!token) return;
    const res = await fetch("/api/admin/business-sales", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ businessId, salesUserId: salesUserId || null }),
    });
    const result = await res.json();
    if (!res.ok) return alert(result.error || "No se pudo asociar el cliente");
    setBusinesses((items) => items.map((item) => item.id === businessId ? { ...item, sales_user_id: salesUserId || null } : item));
    await load();
  };

  const updateBusinessSubscriptionStatus = async (businessId: string, subscriptionStatus: string) => {
    const token = await getAdminToken();
    if (!token) return;
    const res = await fetch("/api/admin/business-sales", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ businessId, subscriptionStatus }),
    });
    const result = await res.json();
    if (!res.ok) return alert(result.error || "No se pudo cambiar el estado del panel");
    setBusinesses((items) => items.map((item) => item.id === businessId ? { ...item, subscription_status: subscriptionStatus } : item));
    await load();
  };

  const createCustomerPaymentLink = async () => {
    if (!manualSale.businessId || !manualSale.salesUserId) return alert("Selecciona cliente y comercial antes de generar el enlace");
    const token = await getAdminToken();
    if (!token) return;
    const res = await fetch("/api/admin/customer-payment-link", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(manualSale),
    });
    const result = await res.json();
    if (!res.ok) return alert(result.error || "No se pudo generar el enlace de pago");
    setPaymentLinks((prev) => ({ ...prev, [manualSale.businessId]: result.url }));
    await load();
    window.prompt("Enlace de pago del cliente. Copia y envíalo:", result.url);
  };

  const updateCommissionAmount = async (commission: Commission) => {
    const value = window.prompt(`Nuevo importe para la comisión de ${sellerName(commission.sales_user_id, salesUsers)}`, String(Number(commission.amount || 0)));
    if (value === null) return;
    const amount = Number(value.replace(",", "."));
    if (!Number.isFinite(amount) || amount < 0) return alert("Importe no válido");
    const token = await getAdminToken();
    if (!token) return;
    const res = await fetch("/api/admin/commissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ commissionId: commission.id, amount }),
    });
    const result = await res.json();
    if (!res.ok) return alert(result.error || "No se pudo modificar la comisión");
    await load();
  };

  const deleteCommission = async (commission: Commission) => {
    if (!window.confirm(`¿Eliminar esta comisión de ${money(Number(commission.amount || 0))}?`)) return;
    const token = await getAdminToken();
    if (!token) return;
    const res = await fetch(`/api/admin/commissions?id=${encodeURIComponent(commission.id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (!res.ok) return alert(result.error || "No se pudo eliminar la comisión");
    await load();
  };

  const registerManualSale = async () => {
    if (!manualSale.businessId || !manualSale.salesUserId) return alert("Selecciona cliente y comercial");
    const token = await getAdminToken();
    if (!token) return;
    const res = await fetch("/api/admin/business-sales", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(manualSale),
    });
    const result = await res.json();
    if (!res.ok) return alert(result.error || "No se pudo registrar la venta");
    setManualSale({ businessId: "", salesUserId: "", plan: "premium", monthlyAmount: "84.99", setupAmount: "0", notes: "" });
    await load();
    alert("Venta manual registrada y cliente vinculado. Solo se ha generado comisión de venta; la mensual se generará cuando entre el pago mensual real.");
  };


  const uploadAdminFile = async (file: File, folder: "contratos" | "formaciones", acceptPdfOnly = false) => {
    if (!file) return "";
    if (acceptPdfOnly && file.type !== "application/pdf") {
      alert("Sube un archivo PDF válido.");
      return "";
    }
    const token = await getAdminToken();
    if (!token) return "";

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 90000);
    try {
      const signedRes = await fetch("/api/admin/sales-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ folder, fileName: file.name, contentType: file.type, size: file.size }),
        signal: controller.signal,
      });
      const signedText = await signedRes.text();
      const signedResult = signedText ? JSON.parse(signedText) : {};
      if (!signedRes.ok) {
        alert(signedResult.error || "No se pudo preparar la subida del archivo");
        return "";
      }

      const { error: uploadError } = await supabase.storage
        .from(signedResult.bucket || "sales-documents")
        .uploadToSignedUrl(signedResult.path, signedResult.token, file, {
          contentType: file.type || "application/octet-stream",
        });

      if (uploadError) {
        alert(uploadError.message || "No se pudo subir el archivo a Storage");
        return "";
      }

      return signedResult.publicUrl as string;
    } catch (error: any) {
      const message = error?.name === "AbortError"
        ? "La subida tardó demasiado. Prueba con un archivo más ligero."
        : error?.message?.includes("JSON")
          ? "No se pudo completar la subida. La respuesta del servidor no fue válida."
          : "No se pudo completar la subida.";
      alert(message);
      return "";
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const uploadDocumentPdf = async (file: File) => {
    setDocumentFileUploading(true);
    try {
      const publicUrl = await uploadAdminFile(file, "contratos", true);
      if (publicUrl) setDocumentFileUrl(publicUrl);
    } finally {
      setDocumentFileUploading(false);
    }
  };

  const uploadTrainingFile = async (file: File) => {
    if (!file) return;
    setTrainingFileUploading(true);
    setTrainingUploadMessage("Subiendo archivo a Flowly...");
    try {
      const publicUrl = await uploadAdminFile(file, "formaciones");
      if (!publicUrl) {
        setTrainingUploadMessage("No se pudo subir el archivo. Revisa Storage y vuelve a intentarlo.");
        return;
      }
      setTrainingUrl(publicUrl);
      setTrainingUploadMessage("Archivo subido correctamente. Ya puedes publicar la formación.");
      if (!trainingTitle.trim()) setTrainingTitle(file.name.replace(/\.[^.]+$/, ""));
      if (file.type.includes("pdf")) setTrainingType("pdf");
      else if (file.type.includes("video")) setTrainingType("video");
      else if (file.type.includes("image")) setTrainingType("imagen");
      else setTrainingType("archivo");
    } finally {
      setTrainingFileUploading(false);
    }
  };

  const getDocumentTargetMode = (document: SalesDocumentTemplate) => {
    const fields = document.pdf_fields || {};
    return fields.target_mode === "all" ? "all" : "single";
  };

  const documentAssigneeLabel = (document: SalesDocumentTemplate) => {
    if (getDocumentTargetMode(document) === "all") return "Todos los comerciales";
    if (document.assigned_sales_user_id) return sellerName(document.assigned_sales_user_id, salesUsers);
    return "Sin destinatario visible";
  };

  const createDocumentTemplate = async () => {
    if (!documentTitle.trim()) return alert("Indica el título del documento");
    if (documentTargetMode === "single" && !documentAssignedSalesUser) return alert("Selecciona el comercial que debe recibir este documento.");
    const { error } = await supabase.from("sales_document_templates").insert({
      title: documentTitle.trim(),
      description: documentDescription.trim(),
      document_type: documentType,
      content: documentContent,
      file_url: documentFileUrl.trim() || null,
      assigned_sales_user_id: documentTargetMode === "single" ? documentAssignedSalesUser : null,
      pdf_fields: {
        nombre: contractWorkerName.trim(),
        dni: contractWorkerDni.trim(),
        direccion: contractWorkerAddress.trim(),
        target_mode: documentTargetMode,
      },
      requires_signature: documentRequiresSignature,
      is_active: true,
    });
    if (error) return alert(error.message);
    setDocumentTitle("Contrato comercial");
    setDocumentDescription("Contrato genérico para firma del trabajador");
    setDocumentType("contrato");
    setDocumentContent("CONTRATO COMERCIAL\n\nEntre Flowly IA y {{nombre}}, con documento {{dni}} y dirección {{direccion}}, se acuerdan las condiciones comerciales indicadas por la empresa.\n\nFecha: {{fecha}}\nFirma: {{nombre}}");
    setDocumentFileUrl("");
    setDocumentAssignedSalesUser("");
    setDocumentTargetMode("single");
    setContractWorkerName("");
    setContractWorkerDni("");
    setContractWorkerAddress("");
    await load();
  };

  const updateDocumentTemplate = async (id: string, updates: Partial<SalesDocumentTemplate>) => {
    const { error } = await supabase.from("sales_document_templates").update(updates).eq("id", id);
    if (error) return alert(error.message);
    await load();
  };

  const updateDocumentTarget = async (document: SalesDocumentTemplate, value: string) => {
    const currentFields = document.pdf_fields || {};
    const updates = value === "__all__"
      ? { assigned_sales_user_id: null, pdf_fields: { ...currentFields, target_mode: "all" } }
      : { assigned_sales_user_id: value || null, pdf_fields: { ...currentFields, target_mode: "single" } };
    await updateDocumentTemplate(document.id, updates);
  };

  const deleteDocumentTemplate = async (document: SalesDocumentTemplate) => {
    const signed = documentSignatures.some((item) => item.document_id === document.id);
    const message = signed
      ? "Este documento ya tiene firmas. Se ocultará del panel comercial y quedará archivado en admin. ¿Continuar?"
      : "¿Eliminar este documento? Dejará de aparecer al comercial.";
    if (!window.confirm(message)) return;
    const { error } = await supabase.from("sales_document_templates").update({ is_active: false, assigned_sales_user_id: null }).eq("id", document.id);
    if (error) return alert(error.message);
    await load();
  };

  const createTrainingFolder = async () => {
    if (!folderName.trim()) return alert("Indica el nombre de la carpeta");
    const { error } = await supabase.from("sales_training_folders").insert({ name: folderName.trim(), description: folderDescription.trim(), is_active: true, sort_order: trainingFolders.length + 1 });
    if (error) return alert(error.message);
    setFolderName("");
    setFolderDescription("");
    await load();
  };

  const createTrainingItem = async () => {
    if (!trainingFolderId || !trainingTitle.trim()) return alert("Selecciona carpeta e indica título");
    const { error } = await supabase.from("sales_training_items").insert({
      folder_id: trainingFolderId,
      title: trainingTitle.trim(),
      description: trainingDescription.trim(),
      content: trainingContent.trim(),
      url: trainingUrl.trim() || null,
      item_type: trainingType,
      requires_completion: true,
      is_active: true,
      sort_order: trainingItems.filter((item) => item.folder_id === trainingFolderId).length + 1,
    });
    if (error) return alert(error.message);
    setTrainingTitle("");
    setTrainingDescription("");
    setTrainingContent("");
    setTrainingUrl("");
    setTrainingUploadMessage("");
    await load();
  };

  const updateTrainingFolder = async (id: string, updates: Partial<TrainingFolder>) => {
    const { error } = await supabase.from("sales_training_folders").update(updates).eq("id", id);
    if (error) return alert(error.message);
    await load();
  };

  const updateTrainingItem = async (id: string, updates: Partial<TrainingItem>) => {
    const { error } = await supabase.from("sales_training_items").update(updates).eq("id", id);
    if (error) return alert(error.message);
    await load();
  };


  const updateMarketingOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("marketing_orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return alert(error.message);
    await load();
  };


  const updateMarketingTaskStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("marketing_tasks").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return alert(error.message);
    await load();
  };

  const updateMarketingContentStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("marketing_content_calendar").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return alert(error.message);
    await load();
  };

  const orderTasks = (orderId: string) => marketingTasks.filter((task) => task.marketing_order_id === orderId);
  const orderContentItems = (orderId: string) => marketingContentItems.filter((item) => item.marketing_order_id === orderId);

  const marketingStatusLabel = (status?: string | null) => {
    const labels: Record<string, string> = {
      briefing_pending: "Briefing recibido",
      in_review: "En revisión",
      in_production: "En producción",
      scheduled: "Programado",
      active: "Activo",
      paused: "Pausado",
      cancelled: "Cancelado",
    };
    return labels[status || ""] || status || "Sin estado";
  };

  const seller = (id?: string | null) => salesUsers.find((user) => user.id === id);

  const logout = async () => { await supabase.auth.signOut(); router.push("/"); };

  if (loading) return <main className="flowly-app-shell flex items-center justify-center"><div className="flowly-app-content text-white">Cargando admin...</div></main>;

  return (
    <main className="flowly-app-shell px-6 py-8 text-white">
      <div className="flowly-app-content mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flowly-app-panel rounded-2xl p-3"><Image src="/logo.png" alt="Flowly IA" width={120} height={36} className="h-auto w-28 object-contain" /></div>
            <div>
              <p className="text-sm font-medium text-violet-300">Flowly IA · Super Admin</p>
              <h1 className="mt-1 text-4xl font-semibold tracking-tight">Centro de control</h1>
              <p className="mt-2 text-white/60">Presupuestos, comerciales, equipos, leads, comisiones y clientes SaaS.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/comercial" className="rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950">Panel comercial</Link>
            <button onClick={logout} className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm"><LogOut size={16} className="inline" /> Salir</button>
          </div>
        </header>

        <section className="mb-6 flex flex-wrap gap-3">
          <TabButton label="Resumen" active={tab === "resumen"} onClick={() => setTab("resumen")} />
          <TabButton label="Presupuestos" active={tab === "presupuestos"} onClick={() => setTab("presupuestos")} />
          <TabButton label="Comerciales" active={tab === "comerciales"} onClick={() => setTab("comerciales")} />
          <TabButton label="Fichajes" active={tab === "fichajes"} onClick={() => setTab("fichajes" as AdminTab)} />
          <TabButton label="Métodos de pago" active={tab === "metodos_pago"} onClick={() => setTab("metodos_pago")} />
          <TabButton label="Documentos" active={tab === "documentos"} onClick={() => setTab("documentos")} />
          <TabButton label="Formaciones" active={tab === "formaciones"} onClick={() => setTab("formaciones")} />
          <TabButton label="Leads" active={tab === "leads"} onClick={() => setTab("leads")} />
          <TabButton label="Comisiones" active={tab === "comisiones"} onClick={() => setTab("comisiones")} />
          <TabButton label="Clientes SaaS" active={tab === "clientes"} onClick={() => setTab("clientes")} />
          <TabButton label="Marketing" active={tab === "marketing"} onClick={() => setTab("marketing")} />
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-5">
          <Metric icon={<Users />} label="Comerciales" value={activeSalesUsers.length} helper="Red activa" />
          <Metric icon={<FileText />} label="Presupuestos" value={budgets.length} helper={`${acceptedBudgets} aceptados`} />
          <Metric icon={<BarChart3 />} label="MRR aceptado" value={money(mrr)} helper="Desde presupuestos" />
          <Metric icon={<Euro />} label="Comisiones pendientes" value={money(pendingCommissions)} helper="Por aprobar/pagar" />
          <Metric icon={<Banknote />} label="Cobros solicitados" value={money(requestedPayouts)} helper="Payouts pendientes" />
        </section>

        {tab === "resumen" && (
          <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <Panel title="Ranking comercial">
              <div className="space-y-3">{ranking.slice(0, 8).map((user, index) => <RankingCard key={user.id} user={user} index={index} />)}{!ranking.length && <Empty text="Aún no hay comerciales creados." />}</div>
            </Panel>
            <Panel title="Resumen de la red">
              <div className="space-y-3">{roles.map((item) => <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p>{roleLabels[item]}</p><p className="text-2xl font-semibold text-violet-200">{activeSalesUsers.filter((user) => user.role === item).length}</p></div>)}</div>
            </Panel>
            <Panel title="Últimos presupuestos"><BudgetList budgets={budgets.slice(0, 6)} salesUsers={salesUsers} onSend={sendBudget} onStatus={updateBudgetStatus} /></Panel>
            <Panel title="Últimos leads"><LeadList leads={leads.slice(0, 6)} salesUsers={salesUsers} onStatus={updateLead} /></Panel>
          </section>
        )}

        {tab === "presupuestos" && (
          <section className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <Panel title="Crear presupuesto admin">
              <div className="grid gap-3">
                <select value={budgetSalesUser} onChange={(e) => setBudgetSalesUser(e.target.value)} className="input-dark"><option value="">Sin comercial asignado</option>{activeSalesUsers.map((user) => <option key={user.id} value={user.id}>{user.full_name} · {roleLabels[user.role]}</option>)}</select>
                <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nombre del cliente" className="input-dark" />
                <div className="grid gap-3 md:grid-cols-2"><input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Email cliente" className="input-dark" /><input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="Teléfono" className="input-dark" /></div>
                <div className="grid gap-3 md:grid-cols-2"><input value={budgetCompany} onChange={(e) => setBudgetCompany(e.target.value)} placeholder="Empresa" className="input-dark" /><select value={budgetSector} onChange={(e) => setBudgetSector(e.target.value)} className="input-dark"><option>Peluquería</option><option>Barbería</option><option>Estética</option><option>Clínica</option><option>Academia</option><option>Restaurante</option><option>Otros</option></select></div>
                <select value={planKey} onChange={(e) => setPlanKey(e.target.value)} className="input-dark">{plans.map((plan) => <option key={plan.key} value={plan.key}>{plan.name} · {plan.key === "enterprise" ? "A medida" : money(plan.price)}</option>)}</select>
                <div className="grid gap-2 rounded-3xl border border-white/10 bg-white/[0.05] p-4"><p className="text-sm font-medium text-violet-200">Módulos incluidos</p><div className="grid gap-2 md:grid-cols-2">{modules.map((module) => <label key={module.key} className="flex cursor-pointer items-center justify-between rounded-2xl bg-black/20 p-3 text-sm"><span>{module.name}</span><span className="flex items-center gap-2"><span className="text-white/45">{money(module.price)}</span><input type="checkbox" checked={selectedModules.includes(module.key)} onChange={(e) => setSelectedModules(e.target.checked ? [...selectedModules, module.key] : selectedModules.filter((key) => key !== module.key))} /></span></label>)}</div></div>
                <input value={setupAmount} onChange={(e) => setSetupAmount(e.target.value)} placeholder="Instalación" type="number" className="input-dark" />
                <textarea value={budgetNotes} onChange={(e) => setBudgetNotes(e.target.value)} placeholder="Notas comerciales" className="input-dark min-h-24" />
                <div className="rounded-3xl bg-white p-5 text-neutral-950"><div className="flex justify-between"><span>Total mensual</span><strong>{planKey === "enterprise" ? "A medida" : money(monthlyTotal)}</strong></div><p className="mt-1 text-xs text-neutral-500">{selectedPlan.description}</p></div>
                <button onClick={createBudget} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white shadow-lg shadow-violet-950/40"><Plus size={18} className="inline" /> Crear presupuesto</button>
              </div>
            </Panel>
            <Panel title="Control de presupuestos">
              <div className="mb-4 grid gap-3 md:grid-cols-3">
                <div className="relative"><Search className="absolute left-3 top-3 text-white/30" size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente, empresa o comercial" className="input-dark pl-10" /></div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-dark"><option value="todos">Todos los estados</option>{budgetStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
                <select value={salesFilter} onChange={(e) => setSalesFilter(e.target.value)} className="input-dark"><option value="todos">Todos los comerciales</option>{salesUsers.map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}</select>
              </div>
              <BudgetList budgets={filteredBudgets} salesUsers={salesUsers} onSend={sendBudget} onStatus={updateBudgetStatus} />
            </Panel>
          </section>
        )}

        {tab === "comerciales" && (
          <section className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <Panel title="Plan de comisiones vigente"><div className="grid gap-3 md:grid-cols-2">{roles.map((roleItem) => <CommissionPlan key={roleItem} role={roleItem} />)}</div><p className="mt-4 text-xs text-violet-200">Primera rama: {FIRST_BRANCH_RULE.salePct}% venta + {FIRST_BRANCH_RULE.monthlyPct}% mensual. Profundidad máxima: {FIRST_BRANCH_RULE.maxLevels} niveles.</p></Panel>
            <Panel title="Crear comercial"><div className="grid gap-3"><input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nombre completo" className="input-dark" /><div className="grid gap-3 md:grid-cols-2"><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input-dark" /><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" className="input-dark" /></div><div className="grid gap-3 md:grid-cols-3"><select value={role} onChange={(e) => setRole(e.target.value as SalesRole)} className="input-dark">{roles.map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}</select><select value={managerId} onChange={(e) => setManagerId(e.target.value)} className="input-dark"><option value="">Sin responsable</option>{activeSalesUsers.filter((user) => canManageTeam(user.role)).map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}</select><input value={monthlyTarget} onChange={(e) => setMonthlyTarget(e.target.value)} type="number" placeholder="Objetivo mensual" className="input-dark" /></div><button onClick={createSalesUser} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white shadow-lg shadow-violet-950/40"><Plus size={18} className="inline" /> Crear perfil comercial</button><p className="text-xs text-white/45">Después de crear el comercial, pulsa “Cambiar contraseña” para crearle el acceso o actualizar su contraseña de Supabase Auth.</p></div></Panel>
            <Panel title="Gestión de equipo comercial"><div className="space-y-3">{activeSalesUsers.map((user) => { const code = user.referral_code || createReferralCode(user.full_name); const link = user.payment_link || buildPaymentLink(code); return <div key={user.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-4"><div className="grid gap-3 md:grid-cols-[1.1fr_0.7fr_0.75fr_0.65fr_0.75fr] md:items-center"><div><p className="font-semibold">{user.full_name}</p><p className="text-xs text-white/45">{user.email}</p><p className="mt-1 text-xs text-violet-200">Código: {code}</p><p className="mt-1 text-[11px] text-white/35">{user.user_id ? "Acceso creado" : "Sin acceso Auth todavía"}</p></div><select value={user.role} onChange={(e) => updateSalesUser(user.id, "role", e.target.value)} className="input-dark">{roles.map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}</select><select value={user.manager_id || ""} onChange={(e) => updateSalesUser(user.id, "manager_id", e.target.value || null)} className="input-dark"><option value="">Sin manager</option>{activeSalesUsers.filter((manager) => manager.id !== user.id && canManageTeam(manager.role)).map((manager) => <option key={manager.id} value={manager.id}>{manager.full_name}</option>)}</select><select value={user.status || "active"} onChange={(e) => updateSalesUser(user.id, "status", e.target.value)} className="input-dark"><option value="active">Activo</option><option value="paused">Pausado</option><option value="inactive">Inactivo</option></select><button onClick={() => resetSalesPassword(user)} className="rounded-full border border-violet-300/30 bg-violet-500/15 px-4 py-3 text-xs font-medium text-violet-100 hover:bg-violet-500/25">Cambiar contraseña</button><button onClick={() => terminateSalesUser(user)} className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-100 hover:bg-red-500/20">Dar de baja</button></div><div className="mt-3 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3"><p className="text-xs text-white/45">Enlace de pago del comercial</p><div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center"><input readOnly value={link} className="input-dark flex-1 text-xs" /><button onClick={() => navigator.clipboard?.writeText(link)} className="rounded-full bg-white px-4 py-2 text-xs font-medium text-neutral-950">Copiar enlace</button><Link href={link.replace(typeof window !== "undefined" ? window.location.origin : "", "")} className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/75">Abrir</Link></div></div></div>; })}</div></Panel>
          </section>
        )}

        {tab === "fichajes" && (
          <section className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
            <Panel title="Comerciales en línea ahora">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-5">
                  <p className="text-sm text-emerald-100/80">En línea</p>
                  <p className="mt-2 text-4xl font-semibold">{onlineSalesUsers.length}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                  <p className="text-sm text-white/55">Desconectados</p>
                  <p className="mt-2 text-4xl font-semibold">{offlineSalesUsers.length}</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {activeSalesUsers.map((user) => {
                  const latestLog = latestLogBySalesUser(user.id);
                  const onlineLog = timeLogs.find((log) => log.sales_user_id === user.id && log.status === "online" && !log.clock_out_at);
                  return <div key={user.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{user.full_name}</p>
                        <p className="text-xs text-white/45">{user.email} · {roleLabels[user.role]}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs ${onlineLog ? "bg-emerald-400/15 text-emerald-200" : "bg-white/10 text-white/55"}`}>{onlineLog ? "En línea" : "Desconectado"}</span>
                    </div>
                    <p className="mt-2 text-xs text-white/45">{onlineLog ? `Entrada: ${new Date(onlineLog.clock_in_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} · ${formatDuration(onlineLog.clock_in_at)}` : latestLog ? `Último fichaje: ${new Date(latestLog.clock_in_at).toLocaleDateString("es-ES")}` : "Sin fichajes"}</p>
                  </div>;
                })}
                {!activeSalesUsers.length && <Empty text="No hay comerciales activos." />}
              </div>
            </Panel>
            <Panel title="Historial de fichajes">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.2em] text-white/35"><tr><th className="py-3">Comercial</th><th>Fecha</th><th>Entrada</th><th>Salida</th><th>Total</th><th>Estado</th></tr></thead>
                  <tbody className="divide-y divide-white/10">
                    {timeLogs.map((log) => {
                      const user = seller(log.sales_user_id);
                      return <tr key={log.id} className="text-white/70"><td className="py-3 font-medium text-white">{user?.full_name || "Comercial"}</td><td>{new Date(log.clock_in_at).toLocaleDateString("es-ES")}</td><td>{new Date(log.clock_in_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</td><td>{log.clock_out_at ? new Date(log.clock_out_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "En curso"}</td><td>{formatDuration(log.clock_in_at, log.clock_out_at)}</td><td><span className={`rounded-full px-3 py-1 text-xs ${log.status === "online" && !log.clock_out_at ? "bg-emerald-400/15 text-emerald-200" : "bg-white/10 text-white/55"}`}>{log.status === "online" && !log.clock_out_at ? "En línea" : "Cerrado"}</span></td></tr>;
                    })}
                  </tbody>
                </table>
              </div>
              {!timeLogs.length && <Empty text="Todavía no hay fichajes registrados." />}
            </Panel>
          </section>
        )}


        {tab === "metodos_pago" && (
          <section className="grid gap-6 lg:grid-cols-[1fr]">
            <Panel title="Métodos de pago de comerciales">
              <div className="space-y-3">
                {activeSalesUsers.map((user) => (
                  <div key={user.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.4fr]">
                      <div className="min-w-0">
                        <p className="font-semibold break-words">{user.full_name}</p>
                        <p className="text-xs text-white/45 break-words">{user.email} · {roleLabels[user.role]}</p>
                        <p className="mt-2 text-xs text-violet-200">Actualizado: {user.payment_methods_updated_at ? new Date(user.payment_methods_updated_at).toLocaleString("es-ES") : "Sin actualizar"}</p>
                      </div>
                      <div className="grid gap-2 text-sm text-white/70 md:grid-cols-2">
                        <InfoLine label="Titular" value={user.payment_account_holder || "Sin configurar"} />
                        <InfoLine label="Banco" value={user.payment_bank_name || "Sin configurar"} />
                        <InfoLine label="Cuenta" value={user.payment_account_number || "Sin configurar"} />
                        <InfoLine label="Dirección" value={user.payment_account_address || "Sin configurar"} />
                        {user.payment_notes && <div className="md:col-span-2"><InfoLine label="Notas" value={user.payment_notes} /></div>}
                      </div>
                    </div>
                  </div>
                ))}
                {!activeSalesUsers.length && <Empty text="No hay comerciales activos." />}
              </div>
            </Panel>
            {terminatedSalesUsers.length > 0 && (
              <Panel title="Trabajadores dados de baja">
                <div className="space-y-3">
                  {terminatedSalesUsers.map((user) => (
                    <div key={user.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 md:flex-row md:items-center">
                      <div><p className="font-medium">{user.full_name}</p><p className="text-xs text-white/45">{user.email}</p></div>
                      <button onClick={() => restoreSalesUser(user)} className="rounded-full bg-white px-4 py-2 text-xs font-medium text-neutral-950">Reactivar</button>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </section>
        )}


        {tab === "documentos" && (
          <section className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <Panel title="Subir PDF y preparar contrato">
              <div className="grid gap-3">
                <input value={documentTitle} onChange={(e) => setDocumentTitle(e.target.value)} placeholder="Título del documento" className="input-dark" />
                <div className="grid gap-3 md:grid-cols-2">
                  <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="input-dark"><option value="contrato">Contrato</option><option value="legal">Legal</option><option value="comercial">Comercial</option><option value="otro">Otro</option></select>
                  <select value={documentTargetMode} onChange={(e) => setDocumentTargetMode(e.target.value as "single" | "all")} className="input-dark"><option value="single">Enviar a un comercial concreto</option><option value="all">Enviar a todos los comerciales</option></select>
                  {documentTargetMode === "single" && <select value={documentAssignedSalesUser} onChange={(e) => setDocumentAssignedSalesUser(e.target.value)} className="input-dark"><option value="">Selecciona comercial destinatario</option>{activeSalesUsers.map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}</select>}
                </div>
                <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-violet-300/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
                  {documentFileUploading ? "Subiendo PDF..." : documentFileUrl ? "PDF subido · cambiar archivo" : "Subir PDF del contrato"}
                  <input type="file" accept="application/pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadDocumentPdf(file); e.currentTarget.value = ""; }} />
                </label>
                {documentFileUrl && <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30"><iframe src={documentFileUrl} className="h-[360px] w-full" title="Vista previa PDF" /></div>}
                <textarea value={documentDescription} onChange={(e) => setDocumentDescription(e.target.value)} placeholder="Descripción" className="input-dark min-h-20" />
                <div className="rounded-3xl border border-cyan-300/15 bg-cyan-400/10 p-4">
                  <p className="text-sm font-semibold text-cyan-100">Datos editables sobre el contrato</p>
                  <p className="mt-1 text-xs text-white/45">Rellena aquí los datos variables. El comercial los verá junto al PDF y podrá corregirlos antes de firmar.</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <input value={contractWorkerName} onChange={(e) => setContractWorkerName(e.target.value)} placeholder="Nombre trabajador" className="input-dark" />
                    <input value={contractWorkerDni} onChange={(e) => setContractWorkerDni(e.target.value)} placeholder="DNI / documento" className="input-dark" />
                    <input value={contractWorkerAddress} onChange={(e) => setContractWorkerAddress(e.target.value)} placeholder="Dirección" className="input-dark" />
                  </div>
                </div>
                <textarea value={documentContent} onChange={(e) => setDocumentContent(e.target.value)} placeholder="Texto editable que acompaña al PDF. Variables: {{nombre}}, {{dni}}, {{direccion}}, {{fecha}}" className="input-dark min-h-44 font-mono text-xs" />
                <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-sm text-white/70"><input type="checkbox" checked={documentRequiresSignature} onChange={(e) => setDocumentRequiresSignature(e.target.checked)} /> Requiere firma del comercial</label>
                <button onClick={createDocumentTemplate} disabled={documentFileUploading} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white disabled:opacity-50"><FileText size={18} className="inline" /> Guardar y enviar documento</button>
              </div>
            </Panel>
            <Panel title="Documentos activos y firmas">
              <div className="space-y-4">
                {documents.map((document) => {
                  const signed = documentSignatures.filter((item) => item.document_id === document.id);
                  return <div key={document.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                      <div className="min-w-0">
                        <p className="font-semibold break-words">{document.title}</p>
                        <p className="mt-1 text-sm text-white/45 break-words">{document.description || "Sin descripción"}</p>
                        <p className="mt-2 text-xs text-violet-200">{signed.length} firmas · {document.file_url ? "PDF subido" : "Sin PDF"} · {document.requires_signature === false ? "Solo lectura" : "Firma requerida"}</p><p className="mt-1 text-xs text-cyan-200">Asignado a: {documentAssigneeLabel(document)}</p>
                        {document.file_url && <a href={document.file_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs text-cyan-200 underline">Abrir PDF</a>}
                      </div>
                      <div className="grid gap-2 md:min-w-72"><select value={getDocumentTargetMode(document) === "all" ? "__all__" : (document.assigned_sales_user_id || "")} onChange={(e) => updateDocumentTarget(document, e.target.value)} className="input-dark"><option value="">Sin destinatario visible</option><option value="__all__">Todos los comerciales</option>{activeSalesUsers.map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}</select><div className="flex flex-wrap gap-2"><button onClick={() => { const value = window.prompt("Nuevo título", document.title); if (value) updateDocumentTemplate(document.id, { title: value }); }} className="rounded-full bg-white px-3 py-2 text-xs font-medium text-neutral-950">Editar título</button><button onClick={() => updateDocumentTemplate(document.id, { is_active: !document.is_active })} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70">{document.is_active ? "Ocultar" : "Activar"}</button><button onClick={() => deleteDocumentTemplate(document)} className="rounded-full border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">Eliminar enviado</button></div></div>
                    </div>
                    {document.file_url && <iframe src={document.file_url} className="mt-4 h-72 w-full rounded-2xl border border-white/10 bg-black/30" title={document.title} />}
                    <div className="mt-4 grid gap-2">{signed.slice(0, 6).map((signature) => <div key={signature.id} className="rounded-2xl bg-black/20 p-3 text-xs text-white/60"><strong className="text-white">{seller(signature.sales_user_id)?.full_name || signature.full_name || "Comercial"}</strong> · DNI {signature.dni || "-"} · {signature.signed_at ? new Date(signature.signed_at).toLocaleString("es-ES") : "sin fecha"}</div>)}{!signed.length && <p className="text-xs text-white/35">Sin firmas todavía.</p>}</div>
                  </div>;
                })}
                {!documents.length && <Empty text="Todavía no hay documentos." />}
              </div>
            </Panel>
          </section>
        )}

        {tab === "formaciones" && <section className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <div className="grid gap-6">
            <Panel title="Crear carpeta de formación"><div className="grid gap-3"><input value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Nombre de carpeta" className="input-dark" /><textarea value={folderDescription} onChange={(e) => setFolderDescription(e.target.value)} placeholder="Descripción" className="input-dark min-h-20" /><button onClick={createTrainingFolder} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white"><FolderOpen size={18} className="inline" /> Crear carpeta</button></div></Panel>
            <Panel title="Añadir contenido"><div className="grid gap-3"><select value={trainingFolderId} onChange={(e) => setTrainingFolderId(e.target.value)} className="input-dark"><option value="">Seleccionar carpeta</option>{trainingFolders.filter((folder) => folder.is_active !== false).map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select><input value={trainingTitle} onChange={(e) => setTrainingTitle(e.target.value)} placeholder="Título del recurso" className="input-dark" /><div className="grid gap-3 md:grid-cols-2"><select value={trainingType} onChange={(e) => setTrainingType(e.target.value)} className="input-dark"><option value="video">Vídeo</option><option value="pdf">PDF</option><option value="texto">Texto</option><option value="link">Link</option><option value="archivo">Archivo</option><option value="imagen">Imagen</option></select><input value={trainingUrl} onChange={(e) => setTrainingUrl(e.target.value)} placeholder="URL YouTube, Vimeo o archivo subido" className="input-dark" /></div><label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-300/30 bg-violet-500/10 px-4 py-4 text-sm text-violet-100 hover:bg-violet-500/20"><FileText size={16} /> {trainingFileUploading ? "Subiendo archivo..." : trainingUrl ? "Archivo subido · cambiar archivo" : "Subir archivo de formación"}<input type="file" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadTrainingFile(file); e.currentTarget.value = ""; }} /></label>{trainingUploadMessage && <p className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-xs text-white/60">{trainingUploadMessage}</p>}{trainingUrl && <a href={trainingUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-xs text-violet-100 break-all">Archivo/enlace: {trainingUrl}</a>}<textarea value={trainingDescription} onChange={(e) => setTrainingDescription(e.target.value)} placeholder="Descripción corta" className="input-dark min-h-20" /><textarea value={trainingContent} onChange={(e) => setTrainingContent(e.target.value)} placeholder="Contenido o instrucciones" className="input-dark min-h-32" /><button onClick={createTrainingItem} disabled={trainingFileUploading} className="rounded-full bg-white px-5 py-3 font-medium text-neutral-950 disabled:opacity-50"><BookOpen size={18} className="inline" /> Publicar formación</button></div></Panel>
          </div>
          <div className="grid gap-6">
            <Panel title="Seguimiento de academia"><TrainingAdminMatrix users={activeSalesUsers} items={trainingItems.filter((item) => item.is_active !== false)} progress={trainingProgress} /></Panel>
            <Panel title="Biblioteca de formaciones"><div className="space-y-5">{trainingFolders.map((folder) => <div key={folder.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"><div className="flex flex-col justify-between gap-2 md:flex-row md:items-center"><div><p className="font-semibold">{folder.name}</p><p className="text-sm text-white/45">{folder.description || "Sin descripción"}</p></div><button onClick={() => updateTrainingFolder(folder.id, { is_active: !folder.is_active })} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70">{folder.is_active === false ? "Activar" : "Ocultar"}</button></div><div className="mt-4 grid gap-2">{trainingItems.filter((item) => item.folder_id === folder.id).map((item) => <div key={item.id} className="rounded-2xl bg-black/20 p-3"><div className="flex flex-col justify-between gap-2 md:flex-row md:items-center"><div><p className="font-medium">{item.title}</p><p className="text-xs text-white/45">{item.item_type || "recurso"} · {trainingProgress.filter((p) => p.training_item_id === item.id && p.completed_at).length}/{activeSalesUsers.length} completado</p>{item.url && <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs text-violet-100">Ver archivo</a>}</div><button onClick={() => updateTrainingItem(item.id, { is_active: !item.is_active })} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70">{item.is_active === false ? "Activar" : "Ocultar"}</button></div></div>)}{!trainingItems.filter((item) => item.folder_id === folder.id).length && <p className="text-xs text-white/35">Carpeta vacía.</p>}</div></div>)}{!trainingFolders.length && <Empty text="Todavía no hay formación publicada." />}</div></Panel>
          </div>
        </section>}

        {tab === "leads" && <section className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]"><Panel title="Nuevo lead admin"><div className="grid gap-3"><input value={leadCompany} onChange={(e) => setLeadCompany(e.target.value)} placeholder="Empresa / negocio" className="input-dark" /><div className="grid gap-3 md:grid-cols-2"><input value={leadContact} onChange={(e) => setLeadContact(e.target.value)} placeholder="Persona de contacto" className="input-dark" /><select value={leadSector} onChange={(e) => setLeadSector(e.target.value)} className="input-dark"><option>Peluquería</option><option>Barbería</option><option>Estética</option><option>Clínica</option><option>Academia</option><option>Restaurante</option><option>Otros</option></select></div><div className="grid gap-3 md:grid-cols-2"><input value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} placeholder="Teléfono" className="input-dark" /><input value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} placeholder="Email" className="input-dark" /></div><select value={leadAssigned} onChange={(e) => setLeadAssigned(e.target.value)} className="input-dark"><option value="">Sin asignar</option>{activeSalesUsers.map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}</select><textarea value={leadNotes} onChange={(e) => setLeadNotes(e.target.value)} placeholder="Notas comerciales" className="input-dark min-h-24" /><button onClick={createLead} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white"><Plus size={18} className="inline" /> Crear lead</button></div></Panel><Panel title="Todos los leads"><LeadList leads={leads} salesUsers={salesUsers} onStatus={updateLead} /></Panel></section>}

        {tab === "comisiones" && <section className="grid gap-6 lg:grid-cols-2"><Panel title="Comisiones"><div className="space-y-3">{commissions.map((commission) => <div key={commission.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div className="flex flex-col justify-between gap-3 md:flex-row md:items-start"><div className="min-w-0"><p className="font-medium capitalize break-words">{commission.type}</p><p className="text-xs text-white/45 break-words">{sellerName(commission.sales_user_id, salesUsers)} · {commission.status}</p>{commission.description && <p className="mt-1 text-xs text-white/35 break-words">{commission.description}</p>}<p className="mt-1 text-[11px] text-violet-200">{commission.percentage ? `${commission.percentage}%` : ""}{commission.hierarchy_level != null ? ` · Nivel ${commission.hierarchy_level}` : ""}</p></div><div className="shrink-0 text-left md:text-right"><p className="text-lg font-semibold text-violet-200">{money(Number(commission.amount || 0))}</p><div className="mt-3 flex flex-wrap gap-2 md:justify-end"><button onClick={() => updateCommissionAmount(commission)} className="rounded-full bg-white px-3 py-2 text-xs font-medium text-neutral-950">Cambiar importe</button><button onClick={() => deleteCommission(commission)} className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-100">Borrar</button></div></div></div></div>)}{!commissions.length && <Empty text="No hay comisiones registradas." />}</div></Panel><Panel title="Solicitudes de cobro"><div className="space-y-3">{payouts.map((payout) => <div key={payout.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-medium">{sellerName(payout.sales_user_id, salesUsers)}</p><p className="text-xs text-white/45">Estado: {payout.status}</p></div><p className="text-lg font-semibold text-violet-200">{money(Number(payout.amount || 0))}</p></div><div className="mt-3 flex gap-2"><button onClick={() => updatePayout(payout.id, "paid")} className="rounded-full bg-white px-3 py-2 text-xs font-medium text-neutral-950">Marcar pagado</button><button onClick={() => updatePayout(payout.id, "rejected")} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70">Rechazar</button></div></div>)}{!payouts.length && <Empty text="No hay solicitudes de cobro." />}</div></Panel></section>}



        {tab === "marketing" && <section className="grid gap-6 xl:grid-cols-[.75fr_1.25fr]">
          <div className="space-y-6">
            <Panel title="Marketing OS">
              <div className="grid gap-4">
                <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                  <p className="text-sm text-cyan-100">Pedidos activos</p>
                  <p className="mt-2 text-4xl font-semibold">{marketingOrders.filter((order) => !["cancelled", "paused"].includes(order.status || "")).length}</p>
                  <p className="mt-1 text-xs text-cyan-100/70">Software + servicio de marketing contratables juntos o por separado.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                    <p className="text-sm text-white/55">Pendientes</p>
                    <p className="mt-2 text-3xl font-semibold text-amber-200">{marketingOrders.filter((order) => (order.status || "briefing_pending") === "briefing_pending").length}</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                    <p className="text-sm text-white/55">Publicaciones/semana</p>
                    <p className="mt-2 text-3xl font-semibold text-cyan-200">{marketingOrders.reduce((sum, order) => sum + Number(order.posts_per_week || 0), 0)}</p>
                  </div>
                </div>
                <div className="rounded-3xl border border-violet-300/20 bg-violet-500/10 p-5 text-sm leading-6 text-white/65">
                  Cada contratación crea automáticamente tareas internas, entregables y calendario editorial según el pack. Los packs Bronze/Plata/Oro pueden vivir como módulo dentro del software; los packs de publicaciones funcionan como servicio independiente.
                </div>
              </div>
            </Panel>
            <Panel title="Producción próxima">
              <div className="space-y-3">
                {marketingContentItems.slice(0, 8).map((item) => <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-white/45">{item.channel || "Canal"} · {item.content_type || "Contenido"} · {item.scheduled_for ? new Date(item.scheduled_for).toLocaleDateString("es-ES") : "Sin fecha"}</p>
                  <select value={item.status || "idea"} onChange={(e) => updateMarketingContentStatus(item.id, e.target.value)} className="input-dark mt-3 text-xs">
                    <option value="idea">Idea</option><option value="draft">Borrador</option><option value="review">Revisión</option><option value="scheduled">Programado</option><option value="published">Publicado</option>
                  </select>
                </div>)}
                {!marketingContentItems.length && <Empty text="Aún no hay calendario generado." />}
              </div>
            </Panel>
          </div>
          <Panel title="Pedidos de marketing">
            <div className="space-y-4">
              {marketingOrders.map((order) => {
                const tasks = orderTasks(order.id);
                const content = orderContentItems(order.id);
                const completedTasks = tasks.filter((task) => ["done", "completed"].includes(task.status || "")).length;
                return <div key={order.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold break-words">{order.business_name || order.contact_name || "Nuevo cliente marketing"}</p>
                        <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-[11px] text-cyan-100">{order.plan_type === "publication" ? "Solo publicaciones" : "Marketing + módulo"}</span>
                      </div>
                      <p className="mt-1 text-sm text-cyan-200 break-words">{order.plan_name} · {marketingStatusLabel(order.status)} · {order.posts_per_week || 0} publis/semana</p>
                      <p className="mt-1 text-xs text-white/45 break-words">{order.contact_name} · {order.email} · {order.phone}</p>
                      <p className="mt-3 text-sm text-white/70 break-words"><strong>Objetivo:</strong> {order.objectives || "Sin objetivo indicado"}</p>
                      <div className="mt-3 grid gap-2 text-xs text-white/50 md:grid-cols-2">
                        <p><strong>Sector:</strong> {order.sector || "-"}</p>
                        <p><strong>Tono:</strong> {order.brand_tone || "-"}</p>
                        <p><strong>Precio:</strong> {order.monthly_amount ? `${order.monthly_amount} ${order.currency || "EUR"}` : "-"}</p>
                        <p><strong>Tareas:</strong> {completedTasks}/{tasks.length}</p>
                        <p className="break-all"><strong>Instagram:</strong> {order.instagram_url || "-"}</p>
                        <p className="break-all"><strong>Facebook:</strong> {order.facebook_url || "-"}</p>
                        <p className="break-all"><strong>Web:</strong> {order.website_url || "-"}</p>
                        <p><strong>Creado:</strong> {order.created_at ? new Date(order.created_at).toLocaleDateString("es-ES") : "-"}</p>
                      </div>
                      {order.deliverables && order.deliverables.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{order.deliverables.map((item) => <span key={item} className="rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-100">{item}</span>)}</div>}
                      {order.target_customer && <p className="mt-3 text-xs text-white/45 break-words"><strong>Cliente ideal:</strong> {order.target_customer}</p>}
                      {order.offers && <p className="mt-2 text-xs text-white/45 break-words"><strong>Servicios/ofertas:</strong> {order.offers}</p>}
                      {order.notes && <p className="mt-2 text-xs text-white/45 break-words"><strong>Notas:</strong> {order.notes}</p>}
                    </div>
                    <select value={order.status || "briefing_pending"} onChange={(e) => updateMarketingOrderStatus(order.id, e.target.value)} className="input-dark w-full md:max-w-56">
                      <option value="briefing_pending">Briefing recibido</option>
                      <option value="in_review">En revisión</option>
                      <option value="in_production">En producción</option>
                      <option value="scheduled">Programado</option>
                      <option value="active">Activo</option>
                      <option value="paused">Pausado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="mb-3 text-sm font-semibold text-cyan-100">Automatización del pack</p>
                      <div className="space-y-2">{tasks.map((task) => <div key={task.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] p-3 text-xs"><span>{task.title}</span><select value={task.status || "pending"} onChange={(e) => updateMarketingTaskStatus(task.id, e.target.value)} className="rounded-full bg-neutral-950 px-2 py-1"><option value="pending">Pendiente</option><option value="ready">Listo</option><option value="in_progress">En curso</option><option value="done">Hecho</option></select></div>)}{!tasks.length && <p className="text-xs text-white/35">Sin tareas generadas. Revisa SQL de marketing_tasks.</p>}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="mb-3 text-sm font-semibold text-fuchsia-100">Calendario generado</p>
                      <div className="space-y-2">{content.slice(0, 6).map((item) => <div key={item.id} className="rounded-xl bg-white/[0.04] p-3 text-xs"><p>{item.title}</p><p className="mt-1 text-white/40">{item.scheduled_for ? new Date(item.scheduled_for).toLocaleDateString("es-ES") : "Sin fecha"} · {item.status || "idea"}</p></div>)}{!content.length && <p className="text-xs text-white/35">Sin calendario generado.</p>}</div>
                    </div>
                  </div>
                </div>;
              })}
              {!marketingOrders.length && <Empty text="Aún no hay pedidos de marketing." />}
            </div>
          </Panel>
        </section>}

        {tab === "clientes" && <section className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]"><Panel title="Registrar venta / pago cliente"><div className="grid gap-3"><p className="text-sm text-white/55">Para paneles ya entregados: primero vincula cliente y comercial. Puedes registrar una venta manual ya pagada o generar un enlace de pago Stripe para que el cliente pague y quede marcado como pagado automáticamente.</p><select value={manualSale.businessId} onChange={(e) => setManualSale({ ...manualSale, businessId: e.target.value })} className="input-dark"><option value="">Seleccionar cliente SaaS</option>{businesses.map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}</select><select value={manualSale.salesUserId} onChange={(e) => setManualSale({ ...manualSale, salesUserId: e.target.value })} className="input-dark"><option value="">Seleccionar comercial</option>{activeSalesUsers.map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}</select><div className="grid gap-3 md:grid-cols-3"><select value={manualSale.plan} onChange={(e) => setManualSale({ ...manualSale, plan: e.target.value })} className="input-dark"><option value="basic">Basic</option><option value="premium">Premium</option><option value="modular">Modular</option><option value="clinic">Clinic</option><option value="enterprise">Enterprise</option></select><input value={manualSale.monthlyAmount} onChange={(e) => setManualSale({ ...manualSale, monthlyAmount: e.target.value })} type="number" step="0.01" placeholder="Mensualidad" className="input-dark" /><input value={manualSale.setupAmount} onChange={(e) => setManualSale({ ...manualSale, setupAmount: e.target.value })} type="number" step="0.01" placeholder="Instalación" className="input-dark" /></div><textarea value={manualSale.notes} onChange={(e) => setManualSale({ ...manualSale, notes: e.target.value })} placeholder="Notas internas de la venta" className="input-dark min-h-24" /><div className="rounded-2xl bg-white/10 p-4 text-sm text-white/70">Comisión estimada red: <strong className="text-violet-200">{money(estimateManualCommissions(manualSale, salesUsers))}</strong></div><div className="grid gap-2 md:grid-cols-2"><button onClick={registerManualSale} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white">Registrar venta ya pagada</button><button onClick={createCustomerPaymentLink} className="rounded-full bg-white px-5 py-3 font-medium text-neutral-950">Generar enlace de pago</button></div>{manualSale.businessId && paymentLinks[manualSale.businessId] && <a href={paymentLinks[manualSale.businessId]} target="_blank" rel="noreferrer" className="break-all rounded-2xl border border-violet-300/30 bg-violet-500/10 p-3 text-xs text-violet-100">{paymentLinks[manualSale.businessId]}</a>}</div></Panel><Panel title="Clientes SaaS"><div className="space-y-3">{businesses.map((business) => <div key={business.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div className="min-w-0"><p className="text-lg font-semibold break-words">{business.name}</p><p className="text-sm text-white/45 break-words">Plan {business.plan || "sin plan"} · Estado <span className={businessStatusValue(business.subscription_status) === "paid" || businessStatusValue(business.subscription_status) === "active" ? "text-emerald-300" : "text-amber-200"}>{businessStatusLabel(business.subscription_status)}</span></p><p className="mt-1 text-xs text-violet-200 break-words">Comercial actual: {sellerName(business.sales_user_id || null, salesUsers)}</p><p className="mt-1 text-[11px] text-white/35 break-words">Stripe: {business.stripe_customer_id ? "Cliente creado" : "Sin pago Stripe"}</p></div><div className="grid w-full gap-2 md:max-w-72"><select value={business.sales_user_id || ""} onChange={(e) => assignBusinessToSalesUser(business.id, e.target.value)} className="input-dark"><option value="">Sin comercial</option>{activeSalesUsers.map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}</select><select value={businessStatusValue(business.subscription_status)} onChange={(e) => updateBusinessSubscriptionStatus(business.id, e.target.value)} className="input-dark">{businessStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div></div></div>)}{!businesses.length && <Empty text="Aún no hay clientes SaaS." />}</div></Panel></section>}
      </div>
    </main>
  );
}

function TrainingAdminMatrix({ users, items, progress }: { users: SalesUser[]; items: TrainingItem[]; progress: TrainingProgress[] }) {
  const rows = users.map((user) => {
    const completed = items.filter((item) => progress.some((entry) => entry.sales_user_id === user.id && entry.training_item_id === item.id && entry.completed_at));
    const percent = items.length ? Math.round((completed.length / items.length) * 100) : 0;
    const pending = items.filter((item) => !progress.some((entry) => entry.sales_user_id === user.id && entry.training_item_id === item.id && entry.completed_at));
    return { user, completed: completed.length, percent, pending };
  }).sort((a, b) => a.percent - b.percent);
  return <div className="space-y-3">{rows.map((row) => <div key={row.user.id} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold">{row.user.full_name}</p><p className="text-xs text-white/45">{roleLabels[row.user.role]} · {row.user.email}</p></div><div className="min-w-40"><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-violet-400" style={{ width: `${row.percent}%` }} /></div><p className="mt-1 text-right text-xs text-white/55">{row.completed}/{items.length} · {row.percent}%</p></div></div>{row.pending.length > 0 ? <p className="mt-3 text-xs text-amber-200">Pendiente: {row.pending.slice(0, 4).map((item) => item.title).join(', ')}{row.pending.length > 4 ? ` +${row.pending.length - 4} más` : ''}</p> : <p className="mt-3 text-xs text-emerald-200">Academia completada</p>}</div>)}{!users.length && <Empty text="No hay comerciales activos." />}</div>;
}

function sellerName(id: string | null, users: SalesUser[]) { return users.find((user) => user.id === id)?.full_name || "Sin asignar"; }
function estimateManualCommissions(form: ManualSaleForm, users: SalesUser[]) {
  const seller = users.find((user) => user.id === form.salesUserId);
  if (!seller) return 0;
  const monthly = Number(form.monthlyAmount || 0);
  const setup = Number(form.setupAmount || 0);
  const saleBaseAmount = setup > 0 ? setup : monthly;
  return buildCommissionLines({ seller, users, clientName: "cliente", saleBaseAmount, monthlyAmount: monthly, source: "preview", includeMonthly: false }).reduce((sum, item) => sum + Number(item.amount || 0), 0);
}
function CommissionPlan({ role }: { role: SalesRole }) {
  const rule = getCommissionRule(role);
  return <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm"><p className="font-semibold">{roleLabels[role]}</p><p className="mt-1 text-white/55">Directa: {rule.directSalePct}% venta + {rule.directMonthlyPct}% mensual</p><p className="text-white/55">Rama: {rule.branchSalePct}% venta + {rule.branchMonthlyPct}% mensual</p></div>;
}
function RankingCard({ user, index }: { user: SalesUser & { mrr: number; budgets: number; accepted: number; leads: number }; index: number }) { return <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div className="flex items-center gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-200">{index === 0 ? <Crown /> : <Shield />}</div><div><p className="font-semibold">#{index + 1} {user.full_name}</p><p className="text-xs text-white/45">{roleLabels[user.role]} · {user.email}</p></div></div><div className="flex gap-3 text-center text-sm"><Mini label="MRR" value={money(user.mrr)} /><Mini label="Aceptados" value={user.accepted} /><Mini label="Leads" value={user.leads} /></div></div></div>; }
function BudgetList({ budgets, salesUsers, onSend, onStatus }: { budgets: SalesBudget[]; salesUsers: SalesUser[]; onSend: (budget: SalesBudget) => void; onStatus: (id: string, status: string) => void }) { return <div className="space-y-3">{budgets.map((budget) => <div key={budget.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><p className="text-lg font-semibold">{budget.client_name}</p><p className="text-sm text-white/50">{budget.company || "Sin empresa"} · {budget.client_email || "Sin email"}</p><p className="mt-2 text-sm text-violet-200">{budget.plan_name} · {money(Number(budget.monthly_amount || 0), budget.currency)} / mes</p><p className="mt-1 text-xs text-white/40">Comercial: {sellerName(budget.sales_user_id, salesUsers)} · Estado: <span className="capitalize">{budget.status}</span></p></div><div className="flex flex-wrap gap-2"><button onClick={() => onSend(budget)} className="rounded-full bg-white px-4 py-2 text-xs font-medium text-neutral-950"><Send size={13} className="inline" /> Enviar</button><select value={budget.status} onChange={(e) => onStatus(budget.id, e.target.value)} className="rounded-full border border-white/10 bg-neutral-950 px-3 py-2 text-xs capitalize">{budgetStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div></div>{budget.modules && budget.modules.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{budget.modules.map((module) => <span key={module.key} className="rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-100">{module.name}</span>)}</div>}</div>)}{budgets.length === 0 && <Empty text="No hay presupuestos con estos filtros." />}</div>; }
function LeadList({ leads, salesUsers, onStatus }: { leads: SalesLead[]; salesUsers: SalesUser[]; onStatus: (id: string, status: string) => void }) { return <div className="space-y-3">{leads.map((lead) => <div key={lead.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h3 className="text-lg font-semibold">{lead.company}</h3><p className="mt-1 text-sm text-white/55">{lead.contact_name || "Sin contacto"} · {lead.phone || "Sin teléfono"} · {lead.sector || "Sector"}</p><p className="mt-1 text-xs text-violet-200">Asignado a: {sellerName(lead.assigned_to, salesUsers)}</p></div><select value={lead.status} onChange={(e) => onStatus(lead.id, e.target.value)} className="input-dark max-w-44 capitalize">{leadStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>{lead.notes && <p className="mt-3 text-sm text-white/50">{lead.notes}</p>}</div>)}{leads.length === 0 && <Empty text="No hay leads." />}</div>; }
function Metric({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string | number; helper: string }) { return <div className="flowly-app-metric rounded-[1.5rem] p-5"><div className="flowly-app-icon mb-4 flex h-11 w-11 items-center justify-center rounded-2xl">{icon}</div><p className="text-sm text-white/50">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p><p className="mt-1 text-xs text-cyan-100/70">{helper}</p></div>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="flowly-app-panel rounded-[2rem] p-6"><h2 className="mb-5 text-xl font-semibold">{title}</h2>{children}</div>; }
function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) { return <button onClick={onClick} className={active ? "flowly-app-button flowly-app-button-active px-5 py-3 text-sm font-semibold" : "flowly-app-button px-5 py-3 text-sm"}>{label}</button>; }
function Mini({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl bg-white/10 px-4 py-3"><p className="font-semibold">{value}</p><p className="text-xs text-white/45">{label}</p></div>; }
function InfoLine({ label, value }: { label: string; value: string }) { return <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-3"><p className="text-[11px] uppercase tracking-[0.18em] text-white/35">{label}</p><p className="mt-1 break-words text-white/75">{value}</p></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/45">{text}</div>; }
