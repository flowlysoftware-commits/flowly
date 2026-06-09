"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  BarChart3,
  Banknote,
  Crown,
  Euro,
  FileText,
  LogOut,
  Plus,
  Search,
  Send,
  Shield,
  Users,
} from "lucide-react";

type SalesRole = "director" | "jefe" | "senior" | "asociado";
type AdminTab = "resumen" | "presupuestos" | "comerciales" | "leads" | "comisiones" | "clientes";

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

type Commission = { id: string; sales_user_id: string | null; amount: number; type: string; status: string; created_at?: string };
type Payout = { id: string; sales_user_id: string | null; amount: number; status: string; created_at?: string };
type Business = { id: string; name: string; plan: string | null; subscription_status: string | null; created_at?: string; sales_user_id?: string | null; stripe_customer_id?: string | null; stripe_subscription_id?: string | null };
type ManualSaleForm = { businessId: string; salesUserId: string; plan: string; monthlyAmount: string; setupAmount: string; notes: string };
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

type PlanOption = { key: string; name: string; price: number; description: string };
type ModuleOption = { key: string; name: string; price: number };

const roles: SalesRole[] = ["asociado", "senior", "jefe", "director"];
const roleLabels: Record<SalesRole, string> = { asociado: "Comercial Asociado", senior: "Comercial Senior", jefe: "Jefe Comercial", director: "Director Comercial" };
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

function createReferralCode(name: string) {
  const base = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 10) || "FLOWLY";
  return `${base}${Math.floor(1000 + Math.random() * 9000)}`;
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

  const load = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return router.push("/login");

    const [salesUsersRes, leadsRes, budgetsRes, commissionsRes, payoutsRes, businessesRes] = await Promise.all([
      supabase.from("sales_users").select("*").order("created_at", { ascending: false }),
      supabase.from("sales_leads").select("*").order("created_at", { ascending: false }),
      supabase.from("sales_budgets").select("*").order("created_at", { ascending: false }),
      supabase.from("commissions").select("*").order("created_at", { ascending: false }),
      supabase.from("commission_payouts").select("*").order("created_at", { ascending: false }),
      supabase.from("businesses").select("id, name, plan, subscription_status, created_at, sales_user_id, stripe_customer_id, stripe_subscription_id").order("created_at", { ascending: false }).limit(200),
    ]);

    setSalesUsers((salesUsersRes.data || []) as SalesUser[]);
    setLeads((leadsRes.data || []) as SalesLead[]);
    setBudgets((budgetsRes.data || []) as unknown as SalesBudget[]);
    setCommissions((commissionsRes.data || []) as Commission[]);
    setPayouts((payoutsRes.data || []) as Payout[]);
    setBusinesses((businessesRes.data || []) as Business[]);
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

  const ranking = useMemo(() => salesUsers.map((user) => {
    const userBudgets = budgets.filter((budget) => budget.sales_user_id === user.id);
    const accepted = userBudgets.filter((budget) => budget.status === "aceptado");
    const userMrr = accepted.reduce((sum, budget) => sum + Number(budget.monthly_amount || 0), 0);
    return { ...user, mrr: userMrr, budgets: userBudgets.length, accepted: accepted.length, leads: leads.filter((lead) => lead.assigned_to === user.id).length };
  }).sort((a, b) => b.mrr - a.mrr), [salesUsers, budgets, leads]);

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
    await supabase.from("commission_payouts").update({ status, processed_at: status === "paid" ? new Date().toISOString() : null }).eq("id", id);
    await load();
  };

  const assignBusinessToSalesUser = async (businessId: string, salesUserId: string) => {
    const { error } = await supabase.from("businesses").update({ sales_user_id: salesUserId || null }).eq("id", businessId);
    if (error) return alert(error.message);
    await load();
  };

  const registerManualSale = async () => {
    if (!manualSale.businessId || !manualSale.salesUserId) return alert("Selecciona cliente y comercial");
    const monthly = Number(manualSale.monthlyAmount || 0);
    const setup = Number(manualSale.setupAmount || 0);
    const commissionAmount = Math.round((monthly * 0.2 + setup * 0.1) * 100) / 100;
    const selectedBusiness = businesses.find((business) => business.id === manualSale.businessId);
    const { error: businessError } = await supabase.from("businesses").update({ sales_user_id: manualSale.salesUserId, plan: manualSale.plan, subscription_status: "manual_active" }).eq("id", manualSale.businessId);
    if (businessError) return alert(businessError.message);
    const { error: saleError } = await supabase.from("sales_deals").insert({ business_id: manualSale.businessId, sales_user_id: manualSale.salesUserId, client_name: selectedBusiness?.name || "Cliente manual", plan: manualSale.plan, monthly_amount: monthly, setup_amount: setup, currency: "EUR", status: "closed_won", source: "manual_admin", notes: manualSale.notes });
    if (saleError) return alert(saleError.message);
    if (commissionAmount > 0) {
      const { error: commissionError } = await supabase.from("commissions").insert({ sales_user_id: manualSale.salesUserId, amount: commissionAmount, type: "manual_sale", status: "pending", source: "manual_admin", description: `Venta manual ${selectedBusiness?.name || "cliente"}` });
      if (commissionError) return alert(commissionError.message);
    }
    setManualSale({ businessId: "", salesUserId: "", plan: "premium", monthlyAmount: "84.99", setupAmount: "0", notes: "" });
    await load();
    alert("Venta manual registrada y cliente vinculado al comercial");
  };

  const logout = async () => { await supabase.auth.signOut(); router.push("/"); };

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#070711] text-white">Cargando admin...</main>;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#5b21b6_0%,#0b1020_34%,#020617_100%)] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white p-3"><Image src="/logo.png" alt="Flowly IA" width={120} height={36} className="h-auto w-28 object-contain" /></div>
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
          <TabButton label="Leads" active={tab === "leads"} onClick={() => setTab("leads")} />
          <TabButton label="Comisiones" active={tab === "comisiones"} onClick={() => setTab("comisiones")} />
          <TabButton label="Clientes SaaS" active={tab === "clientes"} onClick={() => setTab("clientes")} />
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-5">
          <Metric icon={<Users />} label="Comerciales" value={salesUsers.length} helper="Red activa" />
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
              <div className="space-y-3">{roles.map((item) => <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p>{roleLabels[item]}</p><p className="text-2xl font-semibold text-violet-200">{salesUsers.filter((user) => user.role === item).length}</p></div>)}</div>
            </Panel>
            <Panel title="Últimos presupuestos"><BudgetList budgets={budgets.slice(0, 6)} salesUsers={salesUsers} onSend={sendBudget} onStatus={updateBudgetStatus} /></Panel>
            <Panel title="Últimos leads"><LeadList leads={leads.slice(0, 6)} salesUsers={salesUsers} onStatus={updateLead} /></Panel>
          </section>
        )}

        {tab === "presupuestos" && (
          <section className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <Panel title="Crear presupuesto admin">
              <div className="grid gap-3">
                <select value={budgetSalesUser} onChange={(e) => setBudgetSalesUser(e.target.value)} className="input-dark"><option value="">Sin comercial asignado</option>{salesUsers.map((user) => <option key={user.id} value={user.id}>{user.full_name} · {roleLabels[user.role]}</option>)}</select>
                <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nombre del cliente" className="input-dark" />
                <div className="grid gap-3 md:grid-cols-2"><input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Email cliente" className="input-dark" /><input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="Teléfono" className="input-dark" /></div>
                <div className="grid gap-3 md:grid-cols-2"><input value={budgetCompany} onChange={(e) => setBudgetCompany(e.target.value)} placeholder="Empresa" className="input-dark" /><select value={budgetSector} onChange={(e) => setBudgetSector(e.target.value)} className="input-dark"><option>Peluquería</option><option>Barbería</option><option>Estética</option><option>Clínica</option><option>Academia</option><option>Restaurante</option></select></div>
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
            <Panel title="Crear comercial"><div className="grid gap-3"><input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nombre completo" className="input-dark" /><div className="grid gap-3 md:grid-cols-2"><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input-dark" /><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" className="input-dark" /></div><div className="grid gap-3 md:grid-cols-3"><select value={role} onChange={(e) => setRole(e.target.value as SalesRole)} className="input-dark">{roles.map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}</select><select value={managerId} onChange={(e) => setManagerId(e.target.value)} className="input-dark"><option value="">Sin responsable</option>{salesUsers.filter((user) => user.role === "jefe" || user.role === "director").map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}</select><input value={monthlyTarget} onChange={(e) => setMonthlyTarget(e.target.value)} type="number" placeholder="Objetivo mensual" className="input-dark" /></div><button onClick={createSalesUser} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white shadow-lg shadow-violet-950/40"><Plus size={18} className="inline" /> Crear perfil comercial</button><p className="text-xs text-white/45">Para que pueda iniciar sesión, debe existir también como usuario de Supabase Auth y vincular user_id.</p></div></Panel>
            <Panel title="Gestión de equipo comercial"><div className="space-y-3">{salesUsers.map((user) => { const code = user.referral_code || createReferralCode(user.full_name); const link = user.payment_link || buildPaymentLink(code); return <div key={user.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-4"><div className="grid gap-3 md:grid-cols-[1.1fr_0.75fr_0.75fr_0.7fr] md:items-center"><div><p className="font-semibold">{user.full_name}</p><p className="text-xs text-white/45">{user.email}</p><p className="mt-1 text-xs text-violet-200">Código: {code}</p></div><select value={user.role} onChange={(e) => updateSalesUser(user.id, "role", e.target.value)} className="input-dark">{roles.map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}</select><select value={user.manager_id || ""} onChange={(e) => updateSalesUser(user.id, "manager_id", e.target.value || null)} className="input-dark"><option value="">Sin manager</option>{salesUsers.filter((manager) => manager.id !== user.id && (manager.role === "jefe" || manager.role === "director")).map((manager) => <option key={manager.id} value={manager.id}>{manager.full_name}</option>)}</select><select value={user.status || "active"} onChange={(e) => updateSalesUser(user.id, "status", e.target.value)} className="input-dark"><option value="active">Activo</option><option value="paused">Pausado</option><option value="inactive">Inactivo</option></select></div><div className="mt-3 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3"><p className="text-xs text-white/45">Enlace de pago del comercial</p><div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center"><input readOnly value={link} className="input-dark flex-1 text-xs" /><button onClick={() => navigator.clipboard?.writeText(link)} className="rounded-full bg-white px-4 py-2 text-xs font-medium text-neutral-950">Copiar enlace</button><Link href={link.replace(typeof window !== "undefined" ? window.location.origin : "", "")} className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/75">Abrir</Link></div></div></div>; })}</div></Panel>
          </section>
        )}

        {tab === "leads" && <section className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]"><Panel title="Nuevo lead admin"><div className="grid gap-3"><input value={leadCompany} onChange={(e) => setLeadCompany(e.target.value)} placeholder="Empresa / negocio" className="input-dark" /><div className="grid gap-3 md:grid-cols-2"><input value={leadContact} onChange={(e) => setLeadContact(e.target.value)} placeholder="Persona de contacto" className="input-dark" /><select value={leadSector} onChange={(e) => setLeadSector(e.target.value)} className="input-dark"><option>Peluquería</option><option>Barbería</option><option>Estética</option><option>Clínica</option><option>Academia</option><option>Restaurante</option></select></div><div className="grid gap-3 md:grid-cols-2"><input value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} placeholder="Teléfono" className="input-dark" /><input value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} placeholder="Email" className="input-dark" /></div><select value={leadAssigned} onChange={(e) => setLeadAssigned(e.target.value)} className="input-dark"><option value="">Sin asignar</option>{salesUsers.map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}</select><textarea value={leadNotes} onChange={(e) => setLeadNotes(e.target.value)} placeholder="Notas comerciales" className="input-dark min-h-24" /><button onClick={createLead} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white"><Plus size={18} className="inline" /> Crear lead</button></div></Panel><Panel title="Todos los leads"><LeadList leads={leads} salesUsers={salesUsers} onStatus={updateLead} /></Panel></section>}

        {tab === "comisiones" && <section className="grid gap-6 lg:grid-cols-2"><Panel title="Comisiones"><div className="space-y-3">{commissions.map((commission) => <div key={commission.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div><p className="font-medium capitalize">{commission.type}</p><p className="text-xs text-white/45">{sellerName(commission.sales_user_id, salesUsers)} · {commission.status}</p></div><p className="text-lg font-semibold text-violet-200">{money(Number(commission.amount || 0))}</p></div>)}{!commissions.length && <Empty text="No hay comisiones registradas." />}</div></Panel><Panel title="Solicitudes de cobro"><div className="space-y-3">{payouts.map((payout) => <div key={payout.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-medium">{sellerName(payout.sales_user_id, salesUsers)}</p><p className="text-xs text-white/45">Estado: {payout.status}</p></div><p className="text-lg font-semibold text-violet-200">{money(Number(payout.amount || 0))}</p></div><div className="mt-3 flex gap-2"><button onClick={() => updatePayout(payout.id, "paid")} className="rounded-full bg-white px-3 py-2 text-xs font-medium text-neutral-950">Marcar pagado</button><button onClick={() => updatePayout(payout.id, "rejected")} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70">Rechazar</button></div></div>)}{!payouts.length && <Empty text="No hay solicitudes de cobro." />}</div></Panel></section>}

        {tab === "clientes" && <section className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]"><Panel title="Registrar venta manual"><div className="grid gap-3"><p className="text-sm text-white/55">Úsalo para paneles ya entregados: vincula el cliente al comercial y genera la comisión interna sin pasar por Stripe.</p><select value={manualSale.businessId} onChange={(e) => setManualSale({ ...manualSale, businessId: e.target.value })} className="input-dark"><option value="">Seleccionar cliente SaaS</option>{businesses.map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}</select><select value={manualSale.salesUserId} onChange={(e) => setManualSale({ ...manualSale, salesUserId: e.target.value })} className="input-dark"><option value="">Seleccionar comercial</option>{salesUsers.map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}</select><div className="grid gap-3 md:grid-cols-3"><select value={manualSale.plan} onChange={(e) => setManualSale({ ...manualSale, plan: e.target.value })} className="input-dark"><option value="basic">Basic</option><option value="premium">Premium</option><option value="clinic">Clinic</option><option value="enterprise">Enterprise</option></select><input value={manualSale.monthlyAmount} onChange={(e) => setManualSale({ ...manualSale, monthlyAmount: e.target.value })} type="number" step="0.01" placeholder="Mensualidad" className="input-dark" /><input value={manualSale.setupAmount} onChange={(e) => setManualSale({ ...manualSale, setupAmount: e.target.value })} type="number" step="0.01" placeholder="Instalación" className="input-dark" /></div><textarea value={manualSale.notes} onChange={(e) => setManualSale({ ...manualSale, notes: e.target.value })} placeholder="Notas internas de la venta" className="input-dark min-h-24" /><div className="rounded-2xl bg-white/10 p-4 text-sm text-white/70">Comisión estimada: <strong className="text-violet-200">{money(Math.round((Number(manualSale.monthlyAmount || 0) * 0.2 + Number(manualSale.setupAmount || 0) * 0.1) * 100) / 100)}</strong></div><button onClick={registerManualSale} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white">Registrar venta y vincular</button></div></Panel><Panel title="Clientes SaaS"><div className="space-y-3">{businesses.map((business) => <div key={business.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><p className="text-lg font-semibold">{business.name}</p><p className="text-sm text-white/45">Plan {business.plan || "sin plan"} · Estado {business.subscription_status || "sin estado"}</p><p className="mt-1 text-xs text-violet-200">Comercial actual: {sellerName(business.sales_user_id || null, salesUsers)}</p></div><select value={business.sales_user_id || ""} onChange={(e) => assignBusinessToSalesUser(business.id, e.target.value)} className="input-dark max-w-64"><option value="">Sin comercial</option>{salesUsers.map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}</select></div></div>)}{!businesses.length && <Empty text="Aún no hay clientes SaaS." />}</div></Panel></section>}
      </div>
    </main>
  );
}

function sellerName(id: string | null, users: SalesUser[]) { return users.find((user) => user.id === id)?.full_name || "Sin asignar"; }
function RankingCard({ user, index }: { user: SalesUser & { mrr: number; budgets: number; accepted: number; leads: number }; index: number }) { return <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div className="flex items-center gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-200">{index === 0 ? <Crown /> : <Shield />}</div><div><p className="font-semibold">#{index + 1} {user.full_name}</p><p className="text-xs text-white/45">{roleLabels[user.role]} · {user.email}</p></div></div><div className="flex gap-3 text-center text-sm"><Mini label="MRR" value={money(user.mrr)} /><Mini label="Aceptados" value={user.accepted} /><Mini label="Leads" value={user.leads} /></div></div></div>; }
function BudgetList({ budgets, salesUsers, onSend, onStatus }: { budgets: SalesBudget[]; salesUsers: SalesUser[]; onSend: (budget: SalesBudget) => void; onStatus: (id: string, status: string) => void }) { return <div className="space-y-3">{budgets.map((budget) => <div key={budget.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><p className="text-lg font-semibold">{budget.client_name}</p><p className="text-sm text-white/50">{budget.company || "Sin empresa"} · {budget.client_email || "Sin email"}</p><p className="mt-2 text-sm text-violet-200">{budget.plan_name} · {money(Number(budget.monthly_amount || 0), budget.currency)} / mes</p><p className="mt-1 text-xs text-white/40">Comercial: {sellerName(budget.sales_user_id, salesUsers)} · Estado: <span className="capitalize">{budget.status}</span></p></div><div className="flex flex-wrap gap-2"><button onClick={() => onSend(budget)} className="rounded-full bg-white px-4 py-2 text-xs font-medium text-neutral-950"><Send size={13} className="inline" /> Enviar</button><select value={budget.status} onChange={(e) => onStatus(budget.id, e.target.value)} className="rounded-full border border-white/10 bg-neutral-950 px-3 py-2 text-xs capitalize">{budgetStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div></div>{budget.modules && budget.modules.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{budget.modules.map((module) => <span key={module.key} className="rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-100">{module.name}</span>)}</div>}</div>)}{budgets.length === 0 && <Empty text="No hay presupuestos con estos filtros." />}</div>; }
function LeadList({ leads, salesUsers, onStatus }: { leads: SalesLead[]; salesUsers: SalesUser[]; onStatus: (id: string, status: string) => void }) { return <div className="space-y-3">{leads.map((lead) => <div key={lead.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h3 className="text-lg font-semibold">{lead.company}</h3><p className="mt-1 text-sm text-white/55">{lead.contact_name || "Sin contacto"} · {lead.phone || "Sin teléfono"} · {lead.sector || "Sector"}</p><p className="mt-1 text-xs text-violet-200">Asignado a: {sellerName(lead.assigned_to, salesUsers)}</p></div><select value={lead.status} onChange={(e) => onStatus(lead.id, e.target.value)} className="input-dark max-w-44 capitalize">{leadStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>{lead.notes && <p className="mt-3 text-sm text-white/50">{lead.notes}</p>}</div>)}{leads.length === 0 && <Empty text="No hay leads." />}</div>; }
function Metric({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string | number; helper: string }) { return <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-200">{icon}</div><p className="text-sm text-white/50">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p><p className="mt-1 text-xs text-violet-200/80">{helper}</p></div>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"><h2 className="mb-5 text-xl font-semibold">{title}</h2>{children}</div>; }
function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) { return <button onClick={onClick} className={active ? "rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950" : "rounded-full border border-white/10 bg-white/[0.07] px-5 py-3 text-sm text-white/60"}>{label}</button>; }
function Mini({ label, value }: { label: string; value: string | number }) { return <div className="rounded-2xl bg-white/10 px-4 py-3"><p className="font-semibold">{value}</p><p className="text-xs text-white/45">{label}</p></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/45">{text}</div>; }
