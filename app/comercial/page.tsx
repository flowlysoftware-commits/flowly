"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { FIRST_BRANCH_RULE, getCommissionRule, getUplineChain } from "@/lib/salesCommissions";
import {
  ArrowRight,
  Banknote,
  BarChart3,
  CheckCircle2,
  Clock,
  Euro,
  FileText,
  LogOut,
  Mail,
  Plus,
  Send,
  Target,
  Trophy,
  Users,
} from "lucide-react";

type SalesRole = "director" | "jefe" | "senior" | "asociado";
type Tab = "resumen" | "presupuestos" | "leads" | "saldo" | "metodos_pago" | "equipo";

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

    const [{ data: leadsData }, { data: budgetsData }, { data: commissionsData }] = await Promise.all([
      supabase.from("sales_leads").select("*").in("assigned_to", visibleIds).order("created_at", { ascending: false }),
      supabase.from("sales_budgets").select("*").in("sales_user_id", visibleIds).order("created_at", { ascending: false }),
      supabase.from("commissions").select("*").eq("sales_user_id", current.id).order("created_at", { ascending: false }),
    ]);

    setLeads((leadsData || []) as SalesLead[]);
    setBudgets((budgetsData || []) as unknown as SalesBudget[]);
    setCommissions((commissionsData || []) as Commission[]);
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
