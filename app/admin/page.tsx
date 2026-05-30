"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { BarChart3, BriefcaseBusiness, Crown, Euro, LogOut, Plus, Shield, Target, Users } from "lucide-react";

type SalesUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: "director" | "jefe" | "senior" | "asociado";
  manager_id: string | null;
  monthly_target: number;
  status: string;
};

type Lead = {
  id: string;
  company: string;
  status: string;
  assigned_to: string | null;
  estimated_mrr: number | null;
};

type Deal = {
  id: string;
  sales_user_id: string | null;
  monthly_amount: number;
  status: string;
  plan: string;
};

type Commission = {
  id: string;
  sales_user_id: string | null;
  amount: number;
  type: string;
  status: string;
};

type Business = {
  id: string;
  name: string;
  plan: string | null;
  subscription_status: string | null;
};

const roles = ["asociado", "senior", "jefe", "director"];
const roleLabels: Record<string, string> = {
  asociado: "Comercial Asociado",
  senior: "Comercial Senior",
  jefe: "Jefe Comercial",
  director: "Director Comercial",
};

export default function AdminPage() {
  const router = useRouter();
  const [salesUsers, setSalesUsers] = useState<SalesUser[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("asociado");
  const [managerId, setManagerId] = useState("");
  const [monthlyTarget, setMonthlyTarget] = useState("5");

  const load = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return router.push("/login");

    const [salesUsersRes, leadsRes, dealsRes, commissionsRes, businessesRes] = await Promise.all([
      supabase.from("sales_users").select("*").order("created_at", { ascending: false }),
      supabase.from("sales_leads").select("id, company, status, assigned_to, estimated_mrr").order("created_at", { ascending: false }),
      supabase.from("sales_deals").select("id, sales_user_id, monthly_amount, status, plan").order("created_at", { ascending: false }),
      supabase.from("commissions").select("id, sales_user_id, amount, type, status").order("created_at", { ascending: false }),
      supabase.from("businesses").select("id, name, plan, subscription_status").limit(100),
    ]);

    setSalesUsers((salesUsersRes.data || []) as SalesUser[]);
    setLeads((leadsRes.data || []) as Lead[]);
    setDeals((dealsRes.data || []) as Deal[]);
    setCommissions((commissionsRes.data || []) as Commission[]);
    setBusinesses((businessesRes.data || []) as Business[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const createSalesUser = async () => {
    if (!fullName || !email) return alert("Nombre y email son obligatorios");

    const { error } = await supabase.from("sales_users").insert({
      full_name: fullName,
      email,
      phone,
      role,
      manager_id: managerId || null,
      monthly_target: Number(monthlyTarget),
      status: "active",
    });

    if (error) return alert(error.message);

    setFullName("");
    setEmail("");
    setPhone("");
    setRole("asociado");
    setManagerId("");
    setMonthlyTarget("5");
    await load();
  };

  const updateSalesUser = async (id: string, field: string, value: string | number | null) => {
    await supabase.from("sales_users").update({ [field]: value }).eq("id", id);
    await load();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const mrr = deals
    .filter((deal) => deal.status === "active" || deal.status === "trialing")
    .reduce((sum, deal) => sum + Number(deal.monthly_amount || 0), 0);
  const pendingCommissions = commissions
    .filter((commission) => commission.status === "pending")
    .reduce((sum, commission) => sum + Number(commission.amount || 0), 0);
  const closedLeads = leads.filter((lead) => lead.status === "cerrado").length;

  const ranking = useMemo(() => {
    return salesUsers
      .map((user) => {
        const userDeals = deals.filter((deal) => deal.sales_user_id === user.id && (deal.status === "active" || deal.status === "trialing"));
        const userMrr = userDeals.reduce((sum, deal) => sum + Number(deal.monthly_amount || 0), 0);
        const userLeads = leads.filter((lead) => lead.assigned_to === user.id);
        return { ...user, mrr: userMrr, clients: userDeals.length, leads: userLeads.length };
      })
      .sort((a, b) => b.mrr - a.mrr);
  }, [salesUsers, deals, leads]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#070711] text-white">Cargando admin...</main>;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#5b21b6_0%,#0b1020_34%,#020617_100%)] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-violet-300">Flowly IA · Super Admin</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Centro de control comercial</h1>
            <p className="mt-2 text-white/60">Usuarios, equipos, ventas, leads, comisiones y clientes SaaS.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/comercial" className="rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950">Panel comercial</Link>
            <button onClick={logout} className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm"><LogOut size={16} className="inline" /> Salir</button>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-5">
          <Metric icon={<Users />} label="Comerciales" value={salesUsers.length} helper="Red activa" />
          <Metric icon={<BriefcaseBusiness />} label="Clientes SaaS" value={businesses.length} helper="Negocios creados" />
          <Metric icon={<BarChart3 />} label="MRR ventas" value={`${mrr.toFixed(2)}€`} helper="Deals registrados" />
          <Metric icon={<Target />} label="Cierres" value={closedLeads} helper="Leads cerrados" />
          <Metric icon={<Euro />} label="Comisiones pendientes" value={`${pendingCommissions.toFixed(2)}€`} helper="Por aprobar/pagar" />
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Panel title="Crear comercial">
            <div className="grid gap-3">
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nombre completo" className="input-dark" />
              <div className="grid gap-3 md:grid-cols-2">
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input-dark" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" className="input-dark" />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <select value={role} onChange={(e) => setRole(e.target.value)} className="input-dark">
                  {roles.map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}
                </select>
                <select value={managerId} onChange={(e) => setManagerId(e.target.value)} className="input-dark">
                  <option value="">Sin responsable</option>
                  {salesUsers.filter((user) => user.role === "jefe" || user.role === "director").map((user) => (
                    <option key={user.id} value={user.id}>{user.full_name}</option>
                  ))}
                </select>
                <input value={monthlyTarget} onChange={(e) => setMonthlyTarget(e.target.value)} type="number" placeholder="Objetivo mensual" className="input-dark" />
              </div>
              <button onClick={createSalesUser} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white shadow-lg shadow-violet-950/40">
                <Plus size={18} className="inline" /> Crear perfil comercial
              </button>
              <p className="text-xs text-white/45">Nota: para que pueda iniciar sesión, debe existir también como usuario de Supabase Auth. Después vincula el user_id desde Supabase si quieres acceso directo a su panel.</p>
            </div>
          </Panel>

          <Panel title="Ranking comercial">
            <div className="space-y-3">
              {ranking.slice(0, 6).map((user, index) => (
                <div key={user.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-200">{index === 0 ? <Crown /> : <Shield />}</div>
                      <div>
                        <p className="font-semibold">#{index + 1} {user.full_name}</p>
                        <p className="text-xs text-white/45">{roleLabels[user.role]} · {user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 text-center text-sm">
                      <Mini label="MRR" value={`${user.mrr.toFixed(0)}€`} />
                      <Mini label="Clientes" value={user.clients} />
                      <Mini label="Leads" value={user.leads} />
                    </div>
                  </div>
                </div>
              ))}
              {ranking.length === 0 && <Empty text="Aún no hay comerciales creados." />}
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Panel title="Gestión de comerciales">
            <div className="space-y-3">
              {salesUsers.map((user) => (
                <div key={user.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] md:items-center">
                    <div>
                      <p className="font-semibold">{user.full_name}</p>
                      <p className="text-xs text-white/45">{user.email}</p>
                    </div>
                    <select value={user.role} onChange={(e) => updateSalesUser(user.id, "role", e.target.value)} className="input-dark">
                      {roles.map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}
                    </select>
                    <select value={user.manager_id || ""} onChange={(e) => updateSalesUser(user.id, "manager_id", e.target.value || null)} className="input-dark">
                      <option value="">Sin manager</option>
                      {salesUsers.filter((manager) => manager.id !== user.id && (manager.role === "jefe" || manager.role === "director")).map((manager) => (
                        <option key={manager.id} value={manager.id}>{manager.full_name}</option>
                      ))}
                    </select>
                    <select value={user.status} onChange={(e) => updateSalesUser(user.id, "status", e.target.value)} className="input-dark">
                      <option value="active">Activo</option>
                      <option value="paused">Pausado</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Resumen de la red">
            <div className="space-y-3">
              {roles.map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p>{roleLabels[item]}</p>
                  <p className="text-2xl font-semibold text-violet-200">{salesUsers.filter((user) => user.role === item).length}</p>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}

function Metric({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string | number; helper: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-200">{icon}</div>
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-violet-200/80">{helper}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <h2 className="mb-5 text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl bg-white/10 px-4 py-3"><p className="font-semibold">{value}</p><p className="text-xs text-white/45">{label}</p></div>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/45">{text}</div>;
}
