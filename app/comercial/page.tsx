"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { FIRST_BRANCH_RULE, getCommissionRule, getUplineChain } from "@/lib/salesCommissions";
import {
  ArrowRight,
  Banknote,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Euro,
  FileText,
  LogOut,
  PenLine,
  Mail,
  Plus,
  Send,
  Target,
  Trophy,
  Users,
} from "lucide-react";

type SalesRole = "director" | "jefe" | "senior" | "asociado";
type Tab = "resumen" | "presupuestos" | "leads" | "saldo" | "metodos_pago" | "documentos" | "formaciones" | "equipo";

type SalesUser = {
  id: string;
  full_name: string;
  email: string;
  role: SalesRole;
  manager_id: string | null;
  monthly_target: number | null;
  status: string | null;
  payment_bank_name?: string | null;
  payment_account_number?: string | null;
  payment_account_holder?: string | null;
  payment_account_address?: string | null;
  payment_notes?: string | null;
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
  notes: string | null;
  created_at: string;
};

type Commission = {
  id: string;
  amount: number;
  type: string;
  status: string;
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

type BudgetModule = { key: string; name: string; price: number };

type PlanOption = { key: string; name: string; price: number; description: string };
type ModuleOption = { key: string; name: string; price: number };

const roleLabels: Record<SalesRole, string> = {
  asociado: "Comercial Asociado",
  senior: "Comercial Senior",
  jefe: "Jefe Comercial",
  director: "Director Comercial",
};

const leadStatuses = ["nuevo", "contactado", "demo", "propuesta", "cerrado", "perdido"];
const budgetStatuses = ["borrador", "enviado", "aceptado", "rechazado"];

const plans: PlanOption[] = [
  { key: "basic", name: "Flowly Basic", price: 29.99, description: "Agenda, clientes, reservas y panel base." },
  { key: "premium", name: "Flowly Premium", price: 59.99, description: "Pack completo recomendado." },
  { key: "modular", name: "Flowly Modular", price: 19.99, description: "Base flexible por módulos." },
  { key: "enterprise", name: "Flowly Enterprise", price: 0, description: "Proyecto personalizado bajo presupuesto." },
];

const modules: ModuleOption[] = [
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

export default function ComercialPage() {
  const router = useRouter();
  const [me, setMe] = useState<SalesUser | null>(null);
  const [team, setTeam] = useState<SalesUser[]>([]);
  const [allSalesUsers, setAllSalesUsers] = useState<SalesUser[]>([]);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [budgets, setBudgets] = useState<SalesBudget[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [documents, setDocuments] = useState<SalesDocumentTemplate[]>([]);
  const [signatures, setSignatures] = useState<SalesDocumentSignature[]>([]);
  const [documentDrafts, setDocumentDrafts] = useState<Record<string, { dni: string; address: string; signature: string }>>({});
  const [trainingFolders, setTrainingFolders] = useState<TrainingFolder[]>([]);
  const [trainingItems, setTrainingItems] = useState<TrainingItem[]>([]);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("resumen");
  const [paymentBankName, setPaymentBankName] = useState("");
  const [paymentAccountNumber, setPaymentAccountNumber] = useState("");
  const [paymentAccountHolder, setPaymentAccountHolder] = useState("");
  const [paymentAccountAddress, setPaymentAccountAddress] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sector, setSector] = useState("Peluquería");
  const [notes, setNotes] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [budgetCompany, setBudgetCompany] = useState("");
  const [budgetSector, setBudgetSector] = useState("Peluquería");
  const [planKey, setPlanKey] = useState("premium");
  const [setupAmount, setSetupAmount] = useState("0");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [budgetNotes, setBudgetNotes] = useState("");

  const loadData = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return router.push("/login");

    const { data: salesUser } = await supabase
      .from("sales_users")
      .select("*")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (!salesUser) {
      setMe(null);
      setLoading(false);
      return;
    }

    const current = salesUser as SalesUser;
    setMe(current);
    setPaymentBankName(current.payment_bank_name || "");
    setPaymentAccountNumber(current.payment_account_number || "");
    setPaymentAccountHolder(current.payment_account_holder || current.full_name || "");
    setPaymentAccountAddress(current.payment_account_address || "");
    setPaymentNotes(current.payment_notes || "");

    const { data: allUsersData } = await supabase
      .from("sales_users")
      .select("*")
      .order("created_at", { ascending: false });

    const allUsers = (allUsersData || []) as SalesUser[];
    setAllSalesUsers(allUsers);
    const members = getDescendants(current.id, allUsers, FIRST_BRANCH_RULE.maxLevels);
    setTeam(members);
    const visibleIds = current.role === "asociado" ? [current.id] : [current.id, ...members.map((m) => m.id)];

    const [
      { data: leadsData },
      { data: budgetsData },
      { data: commissionsData },
      { data: documentsData },
      { data: signaturesData },
      { data: foldersData },
      { data: itemsData },
      { data: progressData },
    ] = await Promise.all([
      supabase.from("sales_leads").select("*").in("assigned_to", visibleIds).order("created_at", { ascending: false }),
      supabase.from("sales_budgets").select("*").in("sales_user_id", visibleIds).order("created_at", { ascending: false }),
      supabase.from("commissions").select("*").eq("sales_user_id", current.id).order("created_at", { ascending: false }),
      supabase.from("sales_document_templates").select("*").eq("is_active", true).order("created_at", { ascending: false }),
      supabase.from("sales_document_signatures").select("*").eq("sales_user_id", current.id).order("created_at", { ascending: false }),
      supabase.from("sales_training_folders").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
      supabase.from("sales_training_items").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
      supabase.from("sales_training_progress").select("*").eq("sales_user_id", current.id),
    ]);

    setLeads((leadsData || []) as SalesLead[]);
    setBudgets((budgetsData || []) as unknown as SalesBudget[]);
    setCommissions((commissionsData || []) as Commission[]);
    setDocuments(((documentsData || []) as SalesDocumentTemplate[]).filter((document) => canSeeDocument(document, current.id)));
    setSignatures((signaturesData || []) as SalesDocumentSignature[]);
    setTrainingFolders((foldersData || []) as TrainingFolder[]);
    setTrainingItems((itemsData || []) as TrainingItem[]);
    setTrainingProgress((progressData || []) as TrainingProgress[]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedPlan = plans.find((plan) => plan.key === planKey) || plans[1];
  const budgetModules = modules.filter((module) => selectedModules.includes(module.key));
  const monthlyTotal = planKey === "enterprise" ? 0 : selectedPlan.price + budgetModules.reduce((sum, module) => sum + module.price, 0);
  const pendingBalance = commissions.filter((item) => item.status === "pending").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalBalance = commissions.filter((item) => item.status !== "cancelled").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const sentBudgets = budgets.filter((budget) => budget.status === "enviado").length;
  const acceptedBudgets = budgets.filter((budget) => budget.status === "aceptado").length;
  const closedLeads = leads.filter((lead) => lead.status === "cerrado").length;
  const target = me?.monthly_target || 5;
  const targetProgress = Math.min(100, Math.round((acceptedBudgets / target) * 100));
  const teamMrr = budgets.filter((budget) => budget.status === "aceptado").reduce((sum, budget) => sum + Number(budget.monthly_amount || 0), 0);

  const createLead = async () => {
    if (!me || !company) return alert("Indica al menos el nombre de la empresa");
    const { error } = await supabase.from("sales_leads").insert({
      company,
      contact_name: contactName,
      phone,
      email,
      sector,
      plan: "premium",
      estimated_mrr: 59.99,
      status: "nuevo",
      assigned_to: me.id,
      notes,
    });
    if (error) return alert(error.message);
    setCompany("");
    setContactName("");
    setPhone("");
    setEmail("");
    setNotes("");
    await loadData();
  };

  const updateLead = async (id: string, status: string) => {
    await supabase.from("sales_leads").update({ status }).eq("id", id);
    await loadData();
  };

  const createBudget = async () => {
    if (!me || !clientName || !clientEmail) return alert("Indica cliente y email");
    const { error } = await supabase.from("sales_budgets").insert({
      sales_user_id: me.id,
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
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setBudgetCompany("");
    setSelectedModules([]);
    setBudgetNotes("");
    await loadData();
    setTab("presupuestos");
  };

  const sendBudget = async (budget: SalesBudget) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return router.push("/login");

    const res = await fetch("/api/sales/budgets/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ budgetId: budget.id }),
    });
    const result = await res.json();
    if (!res.ok) return alert(result.error || "No se pudo enviar el presupuesto");
    await loadData();
    if (result.mailto) window.location.href = result.mailto;
    alert(result.sent ? "Presupuesto enviado por email" : "Presupuesto marcado como enviado. Configura Resend para envío automático real.");
  };

  const updateBudgetStatus = async (id: string, status: string) => {
    await supabase.from("sales_budgets").update({ status, accepted_at: status === "aceptado" ? new Date().toISOString() : null }).eq("id", id);
    await loadData();
  };

  const requestPayout = async () => {
    if (pendingBalance <= 0) return alert("No tienes saldo pendiente para solicitar cobro");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return router.push("/login");
    const res = await fetch("/api/sales/payouts/request", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const result = await res.json();
    if (!res.ok) return alert(result.error || "No se pudo solicitar el cobro");
    alert("Solicitud de cobro enviada al administrador");
    await loadData();
  };

  const savePaymentMethods = async () => {
    if (!me) return;
    if (!paymentBankName.trim() || !paymentAccountNumber.trim() || !paymentAccountHolder.trim()) {
      return alert("Indica banco, número de cuenta y titular para recibir pagos.");
    }
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return router.push("/login");
    const res = await fetch("/api/sales/payment-methods", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        payment_bank_name: paymentBankName.trim(),
        payment_account_number: paymentAccountNumber.trim(),
        payment_account_holder: paymentAccountHolder.trim(),
        payment_account_address: paymentAccountAddress.trim(),
        payment_notes: paymentNotes.trim(),
      }),
    });
    const result = await res.json();
    if (!res.ok) return alert(result.error || "No se pudieron guardar los métodos de pago");
    await loadData();
    alert("Métodos de pago guardados correctamente.");
  };


  const updateDocumentDraft = (documentId: string, field: "dni" | "address" | "signature", value: string) => {
    setDocumentDrafts((current) => ({
      ...current,
      [documentId]: {
        dni: current[documentId]?.dni || "",
        address: current[documentId]?.address || "",
        signature: current[documentId]?.signature || me?.full_name || "",
        [field]: value,
      },
    }));
  };

  const getDocumentField = (document: SalesDocumentTemplate, key: string) => {
    const fields = document.pdf_fields || {};
    return typeof fields[key] === "string" ? fields[key] : "";
  };

  const canSeeDocument = (document: SalesDocumentTemplate, salesUserId: string) => {
    if (document.is_active === false) return false;
    if (document.assigned_sales_user_id) return document.assigned_sales_user_id === salesUserId;
    return getDocumentField(document, "target_mode") === "all";
  };

  const renderDocumentContent = (document: SalesDocumentTemplate, extra?: { dni?: string; address?: string }) => {
    const today = new Date().toLocaleDateString("es-ES");
    return (document.content || "")
      .replaceAll("{{nombre}}", me?.full_name || "")
      .replaceAll("{{trabajador}}", me?.full_name || "")
      .replaceAll("{{email}}", me?.email || "")
      .replaceAll("{{dni}}", extra?.dni || getDocumentField(document, "dni") || "________________")
      .replaceAll("{{direccion}}", extra?.address || getDocumentField(document, "direccion") || "________________")
      .replaceAll("{{fecha}}", today);
  };

  const signDocument = async (document: SalesDocumentTemplate) => {
    if (!me) return;
    const existing = signatures.find((item) => item.document_id === document.id);
    const draft = documentDrafts[document.id] || {
      dni: existing?.dni || getDocumentField(document, "dni"),
      address: existing?.address || getDocumentField(document, "direccion"),
      signature: existing?.signature_text || me.full_name,
    };
    if (!draft.dni?.trim()) return alert("Indica tu DNI/documento antes de firmar.");
    if (!draft.address?.trim()) return alert("Indica tu dirección antes de firmar.");
    if (!draft.signature?.trim()) return alert("La firma es obligatoria.");

    const payload = {
      document_id: document.id,
      sales_user_id: me.id,
      status: "signed",
      full_name: me.full_name,
      dni: draft.dni.trim(),
      address: draft.address.trim(),
      signature_text: draft.signature.trim(),
      signed_at: new Date().toISOString(),
    };

    const query = existing
      ? supabase.from("sales_document_signatures").update(payload).eq("id", existing.id)
      : supabase.from("sales_document_signatures").insert(payload);
    const { error } = await query;
    if (error) return alert(error.message);
    await loadData();
    alert("Documento firmado correctamente.");
  };

  const trainingStats = useMemo(() => {
    const activeItems = trainingItems.filter((item) => item.is_active !== false);
    const completed = activeItems.filter((item) => trainingProgress.some((progress) => progress.training_item_id === item.id && progress.completed_at));
    return { total: activeItems.length, completed: completed.length, percent: activeItems.length ? Math.round((completed.length / activeItems.length) * 100) : 0 };
  }, [trainingItems, trainingProgress]);

  const progressFor = (itemId: string) => trainingProgress.find((progress) => progress.training_item_id === itemId);

  const saveTrainingProgress = async (item: TrainingItem, updates: Partial<TrainingProgress>) => {
    if (!me) return;
    const existing = progressFor(item.id);
    const payload = {
      sales_user_id: me.id,
      training_item_id: item.id,
      status: updates.completed_at ? "completed" : updates.status || existing?.status || "in_progress",
      watched_seconds: Math.max(Number(existing?.watched_seconds || 0), Number(updates.watched_seconds || 0)),
      duration_seconds: updates.duration_seconds ?? existing?.duration_seconds ?? null,
      progress_percent: Math.max(Number(existing?.progress_percent || 0), Number(updates.progress_percent || 0)),
      completed_at: updates.completed_at || existing?.completed_at || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("sales_training_progress")
      .upsert(payload, { onConflict: "sales_user_id,training_item_id" })
      .select("*")
      .maybeSingle();

    if (error) return alert(error.message);
    if (data) {
      setTrainingProgress((current) => {
        const rest = current.filter((entry) => entry.training_item_id !== item.id || entry.sales_user_id !== me.id);
        return [data as TrainingProgress, ...rest];
      });
    }
  };

  const completeTrainingItem = async (item: TrainingItem, watchedSeconds = 0, durationSeconds = 0) => {
    if (progressFor(item.id)?.completed_at) return;
    await saveTrainingProgress(item, {
      status: "completed",
      watched_seconds: watchedSeconds,
      duration_seconds: durationSeconds || null,
      progress_percent: 100,
      completed_at: new Date().toISOString(),
    });
  };


  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const pipeline = useMemo(() => leadStatuses.map((status) => ({ status, count: leads.filter((lead) => lead.status === status).length })), [leads]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#070711] text-white">Cargando panel comercial...</main>;

  if (!me) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#4c1d95_0%,#09090f_35%,#020617_100%)] px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/10 p-8 backdrop-blur">
          <h1 className="text-3xl font-semibold">Tu usuario todavía no está vinculado a la red comercial</h1>
          <p className="mt-3 text-white/60">Pide a un administrador que cree tu perfil comercial y lo vincule con tu usuario.</p>
          <Link href="/dashboard" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-neutral-950">Volver al dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#5b21b6_0%,#0b1020_32%,#020617_100%)] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-violet-300">Flowly IA · Panel comercial</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">{me.full_name}</h1>
            <p className="mt-2 text-white/60">{roleLabels[me.role]} · Presupuestos, equipo, cartera y saldo acumulado</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {(me.role === "senior" || me.role === "jefe" || me.role === "director") && <Link href="/comercial/equipo" className="rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950">Ver equipo <ArrowRight size={16} className="inline" /></Link>}
            <button onClick={logout} className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm text-white"><LogOut size={16} className="inline" /> Salir</button>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-5">
          <Metric icon={<Target />} label="Objetivo" value={`${targetProgress}%`} helper={`${acceptedBudgets}/${target} aceptados`} />
          <Metric icon={<FileText />} label="Presupuestos" value={budgets.length} helper={`${sentBudgets} enviados`} />
          <Metric icon={<CheckCircle2 />} label="Aceptados" value={acceptedBudgets} helper="Cierres" />
          <Metric icon={<BarChart3 />} label="MRR aceptado" value={money(teamMrr)} helper="Mensual recurrente" />
          <Metric icon={<Euro />} label="Saldo disponible" value={money(pendingBalance)} helper="Pendiente de cobro" />
        </section>

        <nav className="mb-6 flex flex-wrap gap-3">
          <TabButton label="Resumen" active={tab === "resumen"} onClick={() => setTab("resumen")} />
          <TabButton label="Presupuestos" active={tab === "presupuestos"} onClick={() => setTab("presupuestos")} />
          <TabButton label="Leads" active={tab === "leads"} onClick={() => setTab("leads")} />
          <TabButton label="Saldo" active={tab === "saldo"} onClick={() => setTab("saldo")} />
          <TabButton label="Métodos de pago" active={tab === "metodos_pago"} onClick={() => setTab("metodos_pago")} />
          <TabButton label="Documentos" active={tab === "documentos"} onClick={() => setTab("documentos")} />
          <TabButton label="Formaciones" active={tab === "formaciones"} onClick={() => setTab("formaciones")} />
          {(me.role === "senior" || me.role === "jefe" || me.role === "director") && <TabButton label="Equipo y rama" active={tab === "equipo"} onClick={() => setTab("equipo")} />}
        </nav>

        {tab === "resumen" && (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Pipeline comercial">
              <div className="grid gap-3 md:grid-cols-6">{pipeline.map((item) => <div key={item.status} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-center"><p className="text-2xl font-semibold">{item.count}</p><p className="mt-1 text-xs capitalize text-white/50">{item.status}</p></div>)}</div>
              <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-300" style={{ width: `${targetProgress}%` }} /></div>
            </Panel>
            <Panel title="Mi plan de comisión">
              <CommissionPlan role={me.role} />
            </Panel>
            <Panel title="Últimos presupuestos">
              <BudgetList budgets={budgets.slice(0, 5)} onSend={sendBudget} onStatus={updateBudgetStatus} />
            </Panel>
          </section>
        )}

        {tab === "presupuestos" && (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Crear presupuesto">
              <div className="grid gap-3">
                <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nombre del cliente" className="input-dark" />
                <div className="grid gap-3 md:grid-cols-2"><input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Email cliente" className="input-dark" /><input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="Teléfono" className="input-dark" /></div>
                <div className="grid gap-3 md:grid-cols-2"><input value={budgetCompany} onChange={(e) => setBudgetCompany(e.target.value)} placeholder="Empresa" className="input-dark" /><select value={budgetSector} onChange={(e) => setBudgetSector(e.target.value)} className="input-dark"><option>Peluquería</option><option>Barbería</option><option>Estética</option><option>Clínica</option><option>Academia</option><option>Restaurante</option></select></div>
                <select value={planKey} onChange={(e) => setPlanKey(e.target.value)} className="input-dark">{plans.map((plan) => <option key={plan.key} value={plan.key}>{plan.name} · {plan.key === "enterprise" ? "A medida" : money(plan.price)}</option>)}</select>
                <div className="grid gap-2 rounded-3xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-sm font-medium text-violet-200">Módulos incluidos</p>
                  <div className="grid gap-2 md:grid-cols-2">{modules.map((module) => <label key={module.key} className="flex cursor-pointer items-center justify-between rounded-2xl bg-black/20 p-3 text-sm"><span>{module.name}</span><span className="flex items-center gap-2"><span className="text-white/45">{money(module.price)}</span><input type="checkbox" checked={selectedModules.includes(module.key)} onChange={(e) => setSelectedModules(e.target.checked ? [...selectedModules, module.key] : selectedModules.filter((key) => key !== module.key))} /></span></label>)}</div>
                </div>
                <input value={setupAmount} onChange={(e) => setSetupAmount(e.target.value)} placeholder="Instalación" type="number" className="input-dark" />
                <textarea value={budgetNotes} onChange={(e) => setBudgetNotes(e.target.value)} placeholder="Notas comerciales" className="input-dark min-h-24" />
                <div className="rounded-3xl bg-white p-5 text-neutral-950"><div className="flex justify-between"><span>Total mensual</span><strong>{planKey === "enterprise" ? "A medida" : money(monthlyTotal)}</strong></div><p className="mt-1 text-xs text-neutral-500">{selectedPlan.description}</p></div>
                <button onClick={createBudget} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white shadow-lg shadow-violet-950/40"><Plus size={18} className="inline" /> Crear presupuesto</button>
              </div>
            </Panel>
            <Panel title="Mis presupuestos y equipo">
              <BudgetList budgets={budgets} onSend={sendBudget} onStatus={updateBudgetStatus} />
            </Panel>
          </section>
        )}

        {tab === "leads" && (
          <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <Panel title="Nuevo lead">
              <div className="grid gap-3"><input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Empresa / negocio" className="input-dark" /><div className="grid gap-3 md:grid-cols-2"><input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Persona de contacto" className="input-dark" /><select value={sector} onChange={(e) => setSector(e.target.value)} className="input-dark"><option>Peluquería</option><option>Barbería</option><option>Estética</option><option>Clínica</option><option>Academia</option><option>Restaurante</option></select></div><div className="grid gap-3 md:grid-cols-2"><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" className="input-dark" /><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input-dark" /></div><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas comerciales" className="input-dark min-h-24" /><button onClick={createLead} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white"><Plus size={18} className="inline" /> Crear lead</button></div>
            </Panel>
            <Panel title="Leads asignados">
              <div className="space-y-3">{leads.map((lead) => <div key={lead.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h3 className="text-lg font-semibold">{lead.company}</h3><p className="mt-1 text-sm text-white/55">{lead.contact_name || "Sin contacto"} · {lead.phone || "Sin teléfono"} · {lead.sector || "Sector"}</p></div><select value={lead.status} onChange={(e) => updateLead(lead.id, e.target.value)} className="input-dark max-w-44 capitalize">{leadStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>{lead.notes && <p className="mt-3 text-sm text-white/50">{lead.notes}</p>}</div>)}{leads.length === 0 && <Empty text="Aún no tienes leads asignados." />}</div>
            </Panel>
          </section>
        )}

        {tab === "saldo" && (
          <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Saldo acumulado"><div className="rounded-[2rem] bg-white p-6 text-neutral-950"><p className="text-sm text-neutral-500">Disponible para solicitar</p><p className="mt-2 text-5xl font-semibold">{money(pendingBalance)}</p><p className="mt-2 text-sm text-neutral-500">Total histórico: {money(totalBalance)}</p><button onClick={requestPayout} className="mt-6 rounded-full bg-neutral-950 px-6 py-4 font-medium text-white"><Banknote size={18} className="inline" /> Cobrar saldo</button></div></Panel>
            <Panel title="Movimientos de comisión"><div className="space-y-3">{commissions.map((commission) => <div key={commission.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div><p className="font-medium capitalize">{commission.type}</p><p className="text-xs text-white/45">{commission.status}</p></div><p className="text-lg font-semibold text-violet-200">{money(Number(commission.amount || 0))}</p></div>)}{commissions.length === 0 && <Empty text="No hay comisiones registradas todavía." />}</div></Panel>
          </section>
        )}

        {tab === "metodos_pago" && (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Métodos de pago">
              <div className="grid gap-3">
                <input value={paymentAccountHolder} onChange={(e) => setPaymentAccountHolder(e.target.value)} placeholder="Nombre completo del titular" className="input-dark" />
                <input value={paymentBankName} onChange={(e) => setPaymentBankName(e.target.value)} placeholder="Banco" className="input-dark" />
                <input value={paymentAccountNumber} onChange={(e) => setPaymentAccountNumber(e.target.value)} placeholder="Número de cuenta / IBAN / cuenta bancaria" className="input-dark" />
                <textarea value={paymentAccountAddress} onChange={(e) => setPaymentAccountAddress(e.target.value)} placeholder="Dirección fiscal o dirección del titular" className="input-dark min-h-20" />
                <textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} placeholder="Notas para administración: país, tipo de cuenta, documento, instrucciones especiales..." className="input-dark min-h-20" />
                <button onClick={savePaymentMethods} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white shadow-lg shadow-violet-950/40">Guardar métodos de pago</button>
              </div>
            </Panel>
            <Panel title="Información para cobros">
              <div className="space-y-3 text-sm text-white/65">
                <p>Estos datos son visibles para administración cuando solicites cobrar saldo.</p>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/35">Resumen actual</p>
                  <p className="mt-3 break-words"><strong>Titular:</strong> {paymentAccountHolder || "Sin configurar"}</p>
                  <p className="mt-1 break-words"><strong>Banco:</strong> {paymentBankName || "Sin configurar"}</p>
                  <p className="mt-1 break-words"><strong>Cuenta:</strong> {paymentAccountNumber || "Sin configurar"}</p>
                </div>
              </div>
            </Panel>
          </section>
        )}


        {tab === "documentos" && (
          <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
            <Panel title="Documentos pendientes y firmados">
              <div className="space-y-4">
                {documents.map((document) => {
                  const signature = signatures.find((item) => item.document_id === document.id);
                  const draft = documentDrafts[document.id] || {
                    dni: signature?.dni || getDocumentField(document, "dni"),
                    address: signature?.address || getDocumentField(document, "direccion"),
                    signature: signature?.signature_text || me.full_name,
                  };
                  return (
                    <div key={document.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div className="min-w-0">
                          <p className="text-lg font-semibold break-words">{document.title}</p>
                          <p className="mt-1 text-sm text-white/50 break-words">{document.description || "Documento comercial"}</p>
                          <p className="mt-2 text-xs text-violet-200">Estado: {signature?.status === "signed" ? `Firmado ${signature.signed_at ? new Date(signature.signed_at).toLocaleDateString("es-ES") : ""}` : "Pendiente de firma"}</p>
                        </div>
                        {document.file_url && <a href={document.file_url} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/75">Abrir PDF</a>}
                      </div>
                      {document.file_url && <iframe src={document.file_url} className="mt-4 h-[420px] w-full rounded-2xl border border-white/10 bg-black/30" title={document.title} />}
                      <div className="mt-4 grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
                        <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-4">
                          <p className="text-sm font-semibold text-cyan-100">Datos del contrato</p>
                          <div className="mt-3 grid gap-3">
                            <input value={draft.dni} onChange={(e) => updateDocumentDraft(document.id, "dni", e.target.value)} placeholder="DNI / documento" className="input-dark" />
                            <textarea value={draft.address} onChange={(e) => updateDocumentDraft(document.id, "address", e.target.value)} placeholder="Dirección" className="input-dark min-h-20" />
                            <input value={draft.signature} onChange={(e) => updateDocumentDraft(document.id, "signature", e.target.value)} placeholder="Firma digital: nombre completo" className="input-dark" />
                            {document.requires_signature !== false && <button onClick={() => signDocument(document)} className="rounded-full bg-white px-4 py-3 text-xs font-medium text-neutral-950"><PenLine size={13} className="inline" /> {signature ? "Actualizar firma" : "Firmar documento"}</button>}
                          </div>
                        </div>
                        {document.content && <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/25 p-4 text-xs leading-relaxed text-white/70">{renderDocumentContent(document, { dni: draft.dni, address: draft.address })}</pre>}
                      </div>
                    </div>
                  );
                })}
                {!documents.length && <Empty text="Todavía no tienes documentos asignados." />}
              </div>
            </Panel>
            <Panel title="Cómo funciona la firma">
              <div className="space-y-3 text-sm text-white/65">
                <p>Administración sube el PDF real del contrato. Tú lo ves en línea, completas o corriges tus datos y firmas desde el panel.</p>
                <p>La firma guarda nombre, DNI/documento, dirección, texto firmado y fecha. Si el contrato tiene PDF, queda vinculado a esa firma.</p>
              </div>
            </Panel>
          </section>
        )}

        {tab === "formaciones" && (
          <section className="grid gap-6 lg:grid-cols-[.82fr_1.18fr]">
            <div className="grid gap-6">
              <Panel title="Mi progreso de academia">
                <div className="flex flex-col items-center gap-5 text-center">
                  <ProgressRing percent={trainingStats.percent} />
                  <div>
                    <p className="text-lg font-semibold">{trainingStats.completed} de {trainingStats.total} cursos completados</p>
                    <p className="mt-1 text-sm text-white/50">Los vídeos deben verse completos. El reproductor bloquea el avance manual y marca el CHECK al finalizar.</p>
                  </div>
                </div>
              </Panel>
              <Panel title="Carpetas de formación">
                <div className="space-y-3">
                  {trainingFolders.map((folder) => {
                    const items = trainingItems.filter((item) => item.folder_id === folder.id);
                    const done = items.filter((item) => progressFor(item.id)?.completed_at).length;
                    return <div key={folder.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="font-semibold"><BookOpen size={16} className="inline" /> {folder.name}</p><p className="mt-1 text-sm text-white/45">{folder.description || "Contenido formativo"}</p><p className="mt-2 text-xs text-violet-200">{done}/{items.length} recursos completados</p></div>;
                  })}
                  {!trainingFolders.length && <Empty text="Todavía no hay carpetas de formación." />}
                </div>
              </Panel>
            </div>
            <Panel title="Academia Flowly">
              <div className="space-y-5">
                {trainingFolders.map((folder) => {
                  const items = trainingItems.filter((item) => item.folder_id === folder.id);
                  return <div key={folder.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"><div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between"><div><h3 className="text-lg font-semibold">{folder.name}</h3><p className="text-sm text-white/45">{folder.description || "Contenido formativo"}</p></div><span className="text-xs text-violet-200">{items.filter((item) => progressFor(item.id)?.completed_at).length}/{items.length} completados</span></div><div className="mt-4 grid gap-4">{items.map((item) => <TrainingCard key={item.id} item={item} progress={progressFor(item.id)} onProgress={(updates) => saveTrainingProgress(item, updates)} onComplete={(watched, duration) => completeTrainingItem(item, watched, duration)} />)}{!items.length && <Empty text="Esta carpeta todavía no tiene contenido." />}</div></div>;
                })}
              </div>
            </Panel>
          </section>
        )}

        {tab === "equipo" && (
          <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <Panel title="Organigrama hacia atrás">
              <OrgBack me={me} allUsers={allSalesUsers} />
            </Panel>
            <Panel title="Mi equipo y rama hasta 5 niveles">
              <OrgForward root={me} allUsers={allSalesUsers} />
            </Panel>
            <Panel title="Porcentajes aplicables">
              <CommissionPlan role={me.role} />
            </Panel>
            <Panel title="Resumen de rama">
              <div className="grid gap-3 md:grid-cols-3"><Mini label="Personas en rama" value={team.length} /><Mini label="Niveles pagados" value={FIRST_BRANCH_RULE.maxLevels} /><Mini label="Primera rama" value={`${FIRST_BRANCH_RULE.salePct}% + ${FIRST_BRANCH_RULE.monthlyPct}%`} /></div>
            </Panel>
          </section>
        )}
      </div>
    </main>
  );
}


function ProgressRing({ percent }: { percent: number }) {
  const safe = Math.max(0, Math.min(100, percent));
  return (
    <div className="relative h-36 w-36">
      <div className="absolute inset-0 rounded-full bg-[conic-gradient(#8b5cf6_var(--p),rgba(255,255,255,.12)_0)]" style={{ "--p": `${safe}%` } as React.CSSProperties} />
      <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-[#09090f] text-center shadow-inner shadow-black/60">
        <span className="text-3xl font-semibold">{safe}%</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">completado</span>
      </div>
    </div>
  );
}

function getYouTubeId(url?: string | null) {
  if (!url) return "";
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] || "";
}

function TrainingCard({ item, progress, onProgress, onComplete }: { item: TrainingItem; progress?: TrainingProgress; onProgress: (updates: Partial<TrainingProgress>) => void; onComplete: (watched: number, duration: number) => void }) {
  const isCompleted = Boolean(progress?.completed_at);
  const percent = Math.round(Number(progress?.progress_percent || 0));
  const isVideo = item.item_type === "video" || Boolean(getYouTubeId(item.url));
  return (
    <div className={isCompleted ? "rounded-3xl border border-emerald-300/25 bg-emerald-500/10 p-4" : "rounded-3xl border border-white/10 bg-white/[0.07] p-4"}>
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div className="min-w-0">
          <p className="font-semibold break-words">{item.title}</p>
          <p className="mt-1 text-sm text-white/45 break-words">{item.description || item.item_type || "Recurso formativo"}</p>
        </div>
        <span className={isCompleted ? "inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200" : "inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white/55"}>{isCompleted ? <CheckCircle2 size={14} /> : <Clock size={14} />} {isCompleted ? "Completado" : `${percent}%`}</span>
      </div>
      {item.content && <p className="mt-3 whitespace-pre-wrap text-sm text-white/65">{item.content}</p>}
      {isVideo && item.url && <LockedVideoPlayer item={item} progress={progress} onProgress={onProgress} onComplete={onComplete} />}
      {item.url && item.item_type === "pdf" && <iframe src={item.url} className="mt-3 h-[420px] w-full rounded-2xl border border-white/10 bg-black/30" title={item.title} />}
      {item.url && item.item_type === "imagen" && <img src={item.url} alt={item.title} className="mt-3 max-h-[360px] w-full rounded-2xl border border-white/10 object-contain" />}
      {!isVideo && !isCompleted && <button onClick={() => onComplete(0, 0)} className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-medium text-neutral-950">Marcar recurso como completado</button>}
      {item.url && !isVideo && <a href={item.url} target="_blank" rel="noreferrer" className="ml-2 mt-3 inline-flex rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white/70">Abrir / descargar</a>}
    </div>
  );
}

function LockedVideoPlayer({ item, progress, onProgress, onComplete }: { item: TrainingItem; progress?: TrainingProgress; onProgress: (updates: Partial<TrainingProgress>) => void; onComplete: (watched: number, duration: number) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const youtubeBoxRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const maxWatchedRef = useRef(Number(progress?.watched_seconds || 0));
  const completedRef = useRef(Boolean(progress?.completed_at));
  const youtubeId = getYouTubeId(item.url);
  const [playerMessage, setPlayerMessage] = useState("");

  useEffect(() => { completedRef.current = Boolean(progress?.completed_at); }, [progress?.completed_at]);

  const openFullscreen = async () => {
    const element = youtubeId ? youtubeBoxRef.current : videoRef.current;
    try {
      if (element?.requestFullscreen) await element.requestFullscreen();
      else setPlayerMessage("Pantalla completa no disponible en este navegador.");
    } catch {
      setPlayerMessage("No se pudo abrir pantalla completa. Prueba desde el botón nativo del reproductor.");
    }
  };

  useEffect(() => {
    if (!youtubeId || !youtubeBoxRef.current) return;
    let interval: number | undefined;
    let fallback: number | undefined;

    const createPlayer = () => {
      if (!youtubeBoxRef.current || playerRef.current || !(window as any).YT?.Player) return;
      playerRef.current = new (window as any).YT.Player(youtubeBoxRef.current, {
        videoId: youtubeId,
        playerVars: {
          controls: 1,
          disablekb: 1,
          fs: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin,
          enablejsapi: 1,
        },
        events: {
          onReady: () => {
            setPlayerMessage("");
            interval = window.setInterval(() => {
              const player = playerRef.current;
              if (!player?.getCurrentTime) return;
              const current = Number(player.getCurrentTime() || 0);
              const duration = Number(player.getDuration?.() || 0);
              if (current > maxWatchedRef.current + 2 && !completedRef.current) {
                player.seekTo(maxWatchedRef.current, true);
                setPlayerMessage("Avance bloqueado hasta completar el vídeo.");
                return;
              }
              if (current > maxWatchedRef.current) maxWatchedRef.current = current;
              const percent = duration ? Math.min(99, Math.round((maxWatchedRef.current / duration) * 100)) : 0;
              if (duration && current >= duration * 0.95 && !completedRef.current) {
                completedRef.current = true;
                onComplete(Math.round(duration), Math.round(duration));
              } else if (percent > Number(progress?.progress_percent || 0) && Math.round(maxWatchedRef.current) % 10 === 0) {
                onProgress({ watched_seconds: Math.round(maxWatchedRef.current), duration_seconds: Math.round(duration || 0), progress_percent: percent, status: "in_progress" });
              }
            }, 1200);
          },
          onStateChange: (event: any) => {
            if (event.data === 0 && !completedRef.current) {
              const duration = Number(playerRef.current?.getDuration?.() || maxWatchedRef.current || 0);
              completedRef.current = true;
              onComplete(Math.round(duration), Math.round(duration));
            }
          },
          onError: () => setPlayerMessage("No se pudo reproducir este vídeo. Revisa que el enlace sea público u oculto y permita inserción."),
        },
      });
    };

    if (!(window as any).YT?.Player) {
      const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existing) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      const prev = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => { prev?.(); createPlayer(); };
      fallback = window.setInterval(createPlayer, 500);
    } else {
      createPlayer();
    }

    return () => {
      if (fallback) window.clearInterval(fallback);
      if (interval) window.clearInterval(interval);
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [youtubeId]);

  if (youtubeId) {
    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
        <div ref={youtubeBoxRef} className="aspect-video w-full" />
        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-4 py-3">
          <button onClick={() => playerRef.current?.playVideo?.()} className="rounded-full bg-white px-4 py-2 text-xs font-medium text-neutral-950">Reproducir</button>
          <button onClick={() => playerRef.current?.pauseVideo?.()} className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/70">Pausar</button>
          <button onClick={openFullscreen} className="rounded-full border border-violet-300/30 bg-violet-500/10 px-4 py-2 text-xs text-violet-100">Pantalla completa</button>
          <span className="text-xs text-white/45">Vídeo bloqueado: no se puede avanzar. El CHECK aparece al verlo completo.</span>
        </div>
        {playerMessage && <p className="border-t border-white/10 px-4 py-3 text-xs text-amber-200">{playerMessage}</p>}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
      <video
        ref={videoRef}
        src={item.url || ""}
        className="w-full rounded-xl bg-black"
        controls
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          if (maxWatchedRef.current > 0 && maxWatchedRef.current < video.duration) video.currentTime = maxWatchedRef.current;
        }}
        onPlay={() => setPlayerMessage("")}
        onError={() => setPlayerMessage("No se pudo reproducir este archivo. Revisa que sea un vídeo compatible, por ejemplo MP4 H.264, y que el enlace sea público o firmado.")}
        onSeeking={(e) => {
          const video = e.currentTarget;
          if (video.currentTime > maxWatchedRef.current + 1.5 && !completedRef.current) {
            video.currentTime = maxWatchedRef.current;
            setPlayerMessage("Avance bloqueado hasta completar el vídeo.");
          }
        }}
        onTimeUpdate={(e) => {
          const video = e.currentTarget;
          if (video.currentTime > maxWatchedRef.current) maxWatchedRef.current = video.currentTime;
          const percent = video.duration ? Math.min(99, Math.round((maxWatchedRef.current / video.duration) * 100)) : 0;
          if (video.duration && video.currentTime >= video.duration * 0.95 && !completedRef.current) {
            completedRef.current = true;
            onComplete(Math.round(video.duration), Math.round(video.duration));
          } else if (percent > Number(progress?.progress_percent || 0) && Math.round(maxWatchedRef.current) % 10 === 0) {
            onProgress({ watched_seconds: Math.round(maxWatchedRef.current), duration_seconds: Math.round(video.duration || 0), progress_percent: percent, status: "in_progress" });
          }
        }}
        onEnded={(e) => {
          const video = e.currentTarget;
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete(Math.round(video.duration || maxWatchedRef.current), Math.round(video.duration || maxWatchedRef.current));
          }
        }}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={() => videoRef.current?.play().catch(() => setPlayerMessage("El navegador bloqueó la reproducción. Pulsa play dentro del reproductor."))} className="rounded-full bg-white px-4 py-2 text-xs font-medium text-neutral-950">Reproducir</button>
        <button onClick={() => videoRef.current?.pause()} className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/70">Pausar</button>
        <button onClick={openFullscreen} className="rounded-full border border-violet-300/30 bg-violet-500/10 px-4 py-2 text-xs text-violet-100">Pantalla completa</button>
        <span className="text-xs text-white/45">Avance bloqueado hasta completar el vídeo.</span>
      </div>
      {playerMessage && <p className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">{playerMessage}</p>}
    </div>
  );
}

function CommissionPlan({ role }: { role: SalesRole }) {
  const rule = getCommissionRule(role);
  const rows = [
    { label: "Tus ventas", sale: rule.directSalePct, monthly: rule.directMonthlyPct, helper: "Comisión directa por cada cliente que cierres tú." },
    { label: "Primera rama directa", sale: FIRST_BRANCH_RULE.salePct, monthly: FIRST_BRANCH_RULE.monthlyPct, helper: "Personas que cuelgan directamente de ti." },
    { label: "Ramas siguientes", sale: rule.branchSalePct, monthly: rule.branchMonthlyPct, helper: `Niveles 2 a ${FIRST_BRANCH_RULE.maxLevels} de tu red.` },
  ];
  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-violet-300/20 bg-violet-500/10 p-4">
        <p className="text-sm text-violet-200">{roleLabels[role]}</p>
        <p className="mt-2 text-2xl font-semibold">{rule.directSalePct}% venta + {rule.directMonthlyPct}% mensual</p>
        <p className="mt-2 text-sm text-white/55">La rama se paga hasta {FIRST_BRANCH_RULE.maxLevels} niveles. El Comercial Asociado no puede tener equipo.</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-3 border-b border-white/10 bg-white/[0.05] p-4 last:border-b-0 md:grid-cols-[1fr_.45fr_.45fr] md:items-center">
            <div><p className="font-medium">{row.label}</p><p className="text-xs text-white/45">{row.helper}</p></div>
            <p className="rounded-full bg-white/10 px-3 py-2 text-center text-sm">{row.sale}% venta</p>
            <p className="rounded-full bg-white/10 px-3 py-2 text-center text-sm">{row.monthly}% mensual</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function branchRateFor(rootRole: SalesRole, level: number) {
  const rule = getCommissionRule(rootRole);
  return level === 1
    ? { sale: FIRST_BRANCH_RULE.salePct, monthly: FIRST_BRANCH_RULE.monthlyPct }
    : { sale: rule.branchSalePct, monthly: rule.branchMonthlyPct };
}
function getDescendants(rootId: string, users: SalesUser[], maxLevels: number) {
  const result: SalesUser[] = [];
  let frontier = users.filter((user) => user.manager_id === rootId);
  const seen = new Set<string>([rootId]);
  for (let level = 1; level <= maxLevels && frontier.length; level += 1) {
    const next: SalesUser[] = [];
    frontier.forEach((user) => {
      if (seen.has(user.id)) return;
      seen.add(user.id);
      result.push(user);
      next.push(...users.filter((candidate) => candidate.manager_id === user.id));
    });
    frontier = next;
  }
  return result;
}

function OrgBack({ me, allUsers }: { me: SalesUser; allUsers: SalesUser[] }) {
  const chain = getUplineChain(me.id, allUsers, FIRST_BRANCH_RULE.maxLevels);
  return <div className="space-y-3"><div className="rounded-2xl bg-white p-4 text-neutral-950"><p className="text-xs text-neutral-500">Tú</p><p className="font-semibold">{me.full_name}</p><p className="text-xs">{roleLabels[me.role]}</p></div>{chain.map((user) => <div key={user.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-xs text-violet-200">Nivel superior {user.hierarchy_level}</p><p className="font-semibold">{user.full_name}</p><p className="text-xs text-white/45">{roleLabels[user.role]}</p></div>)}{chain.length === 0 && <Empty text="No tienes responsables por encima." />}</div>;
}

function OrgForward({ root, allUsers }: { root: SalesUser; allUsers: SalesUser[] }) {
  const children = allUsers.filter((user) => user.manager_id === root.id);
  return <div className="space-y-3"><div className="rounded-2xl bg-violet-500/20 p-4"><p className="font-semibold">{root.full_name}</p><p className="text-xs text-white/45">{roleLabels[root.role]}</p></div>{children.map((child) => <OrgNode key={child.id} user={child} allUsers={allUsers} level={1} rootRole={root.role} />)}{children.length === 0 && <Empty text="Aún no tienes rama por debajo." />}</div>;
}

function OrgNode({ user, allUsers, level, rootRole }: { user: SalesUser; allUsers: SalesUser[]; level: number; rootRole: SalesRole }) {
  const children = level >= FIRST_BRANCH_RULE.maxLevels ? [] : allUsers.filter((candidate) => candidate.manager_id === user.id);
  const rate = branchRateFor(rootRole, level);
  return <div className="ml-3 border-l border-white/10 pl-4"><div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-xs text-violet-200">Nivel {level} · {rate.sale}% venta + {rate.monthly}% mensual para ti</p><p className="font-semibold">{user.full_name}</p><p className="text-xs text-white/45">{roleLabels[user.role]}</p></div><div className="mt-3 space-y-3">{children.map((child) => <OrgNode key={child.id} user={child} allUsers={allUsers} level={level + 1} rootRole={rootRole} />)}</div></div>;
}

function BudgetList({ budgets, onSend, onStatus }: { budgets: SalesBudget[]; onSend: (budget: SalesBudget) => void; onStatus: (id: string, status: string) => void }) {
  return <div className="space-y-3">{budgets.map((budget) => <div key={budget.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><p className="text-lg font-semibold">{budget.client_name}</p><p className="text-sm text-white/50">{budget.company || "Sin empresa"} · {budget.client_email || "Sin email"}</p><p className="mt-2 text-sm text-violet-200">{budget.plan_name} · {money(Number(budget.monthly_amount || 0), budget.currency)} / mes</p><p className="mt-1 text-xs capitalize text-white/40">Estado: {budget.status}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => onSend(budget)} className="rounded-full bg-white px-4 py-2 text-xs font-medium text-neutral-950"><Send size={13} className="inline" /> Enviar</button><select value={budget.status} onChange={(e) => onStatus(budget.id, e.target.value)} className="rounded-full border border-white/10 bg-neutral-950 px-3 py-2 text-xs capitalize">{budgetStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div></div>{budget.modules && budget.modules.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{budget.modules.map((module) => <span key={module.key} className="rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-100">{module.name}</span>)}</div>}</div>)}{budgets.length === 0 && <Empty text="No hay presupuestos todavía." />}</div>;
}

function Metric({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string | number; helper: string }) { return <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-200">{icon}</div><p className="text-sm text-white/50">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p><p className="mt-1 text-xs text-violet-200/80">{helper}</p></div>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"><h2 className="mb-5 text-xl font-semibold">{title}</h2>{children}</div>; }
function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) { return <button onClick={onClick} className={active ? "rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950" : "rounded-full border border-white/10 bg-white/[0.07] px-5 py-3 text-sm text-white/60"}>{label}</button>; }
function Mini({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl bg-white/10 px-4 py-3"><p className="font-semibold">{value}</p><p className="text-xs text-white/45">{label}</p></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/45">{text}</div>; }
