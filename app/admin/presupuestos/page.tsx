"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { BarChart3, CheckCircle2, Filter, Search, Send, Users, XCircle } from "lucide-react";

type SalesUser = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  manager_id: string | null;
  status: string | null;
};

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
  rejection_reason: string | null;
  sent_at: string | null;
  accepted_at: string | null;
  created_at: string;
};

const statusOptions = ["todos", "borrador", "enviado", "aceptado", "rechazado"];
const roleLabels: Record<string, string> = {
  asociado: "Asociado",
  senior: "Senior",
  jefe: "Jefe Comercial",
  director: "Director Comercial",
};

function money(value: number, currency = "EUR") {
  if (currency === "COP") return `$${Math.round(value).toLocaleString("es-CO")} COP`;
  return `${Number(value || 0).toFixed(2)}€`;
}

export default function AdminPresupuestosPage() {
  const [budgets, setBudgets] = useState<SalesBudget[]>([]);
  const [salesUsers, setSalesUsers] = useState<SalesUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("todos");
  const [salesUserId, setSalesUserId] = useState("todos");
  const [role, setRole] = useState("todos");
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    const [{ data: usersData }, { data: budgetsData }] = await Promise.all([
      supabase.from("sales_users").select("*").order("created_at", { ascending: false }),
      supabase.from("sales_budgets").select("*").order("created_at", { ascending: false }),
    ]);
    setSalesUsers((usersData || []) as SalesUser[]);
    setBudgets((budgetsData || []) as unknown as SalesBudget[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const userMap = useMemo(() => new Map(salesUsers.map((user) => [user.id, user])), [salesUsers]);

  const filtered = useMemo(() => {
    return budgets.filter((budget) => {
      const owner = budget.sales_user_id ? userMap.get(budget.sales_user_id) : null;
      const matchesStatus = status === "todos" || budget.status === status;
      const matchesUser = salesUserId === "todos" || budget.sales_user_id === salesUserId;
      const matchesRole = role === "todos" || owner?.role === role;
      const search = query.trim().toLowerCase();
      const matchesQuery = !search || [budget.client_name, budget.client_email, budget.company, budget.plan_name, owner?.full_name].filter(Boolean).join(" ").toLowerCase().includes(search);
      return matchesStatus && matchesUser && matchesRole && matchesQuery;
    });
  }, [budgets, query, role, salesUserId, status, userMap]);

  const total = filtered.length;
  const sent = filtered.filter((item) => item.status === "enviado").length;
  const accepted = filtered.filter((item) => item.status === "aceptado").length;
  const rejected = filtered.filter((item) => item.status === "rechazado").length;
  const mrr = filtered.filter((item) => item.status === "aceptado").reduce((sum, item) => sum + Number(item.monthly_amount || 0), 0);

  const ranking = useMemo(() => {
    return salesUsers.map((user) => {
      const userBudgets = budgets.filter((budget) => budget.sales_user_id === user.id);
      const userAccepted = userBudgets.filter((budget) => budget.status === "aceptado");
      return {
        ...user,
        budgets: userBudgets.length,
        accepted: userAccepted.length,
        mrr: userAccepted.reduce((sum, budget) => sum + Number(budget.monthly_amount || 0), 0),
      };
    }).sort((a, b) => b.mrr - a.mrr);
  }, [budgets, salesUsers]);

  const updateStatus = async (id: string, newStatus: string) => {
    const patch: Record<string, string | null> = { status: newStatus };
    if (newStatus === "aceptado") patch.accepted_at = new Date().toISOString();
    const { error } = await supabase.from("sales_budgets").update(patch).eq("id", id);
    if (error) return alert(error.message);
    await load();
  };

  if (loading) return <main className="flowly-app-shell flex items-center justify-center"><div className="flowly-app-content text-white">Cargando presupuestos...</div></main>;

  return (
    <main className="flowly-app-shell px-6 py-8 text-white">
      <div className="flowly-app-content mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Flowly IA" width={150} height={42} className="h-auto w-36 object-contain" />
            <div>
              <p className="text-sm font-medium text-violet-300">Admin · Control comercial</p>
              <h1 className="mt-1 text-4xl font-semibold tracking-tight">Presupuestos por comercial y equipo</h1>
              <p className="mt-2 text-white/60">Filtra, controla, aprueba, revisa rankings y analiza el MRR generado por la red.</p>
            </div>
          </div>
          <Link href="/admin" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm">Volver al admin</Link>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-5">
          <Metric icon={<BarChart3 />} label="Presupuestos" value={total} helper="Según filtros" />
          <Metric icon={<Send />} label="Enviados" value={sent} helper="Pendientes de respuesta" />
          <Metric icon={<CheckCircle2 />} label="Aceptados" value={accepted} helper="Cierres" />
          <Metric icon={<XCircle />} label="Rechazados" value={rejected} helper="Perdidos" />
          <Metric icon={<Users />} label="MRR aceptado" value={money(mrr)} helper="Mensual recurrente" />
        </section>

        <section className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.08] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2 text-violet-200"><Filter size={18} /> Filtros de control</div>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative"><Search className="absolute left-4 top-3.5 text-white/35" size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar cliente, email, comercial..." className="input-dark w-full pl-11" /></div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-dark capitalize">{statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input-dark"><option value="todos">Todos los rangos</option><option value="asociado">Asociados</option><option value="senior">Senior</option><option value="jefe">Jefes</option><option value="director">Directores</option></select>
            <select value={salesUserId} onChange={(e) => setSalesUserId(e.target.value)} className="input-dark"><option value="todos">Todos los comerciales</option>{salesUsers.map((user) => <option key={user.id} value={user.id}>{user.full_name}</option>)}</select>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <Panel title="Presupuestos">
            <div className="space-y-3">
              {filtered.map((budget) => {
                const owner = budget.sales_user_id ? userMap.get(budget.sales_user_id) : null;
                return (
                  <div key={budget.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                    <div className="grid gap-4 md:grid-cols-[1.1fr_0.8fr_0.6fr_0.6fr] md:items-center">
                      <div>
                        <p className="text-lg font-semibold">{budget.client_name}</p>
                        <p className="text-sm text-white/50">{budget.company || "Sin empresa"} · {budget.client_email || "Sin email"}</p>
                        <p className="mt-2 text-xs text-violet-200">{owner?.full_name || "Sin comercial"} · {owner ? roleLabels[owner.role] || owner.role : "Sin rango"}</p>
                      </div>
                      <div>
                        <p className="font-medium">{budget.plan_name}</p>
                        <p className="text-sm text-white/45">{money(Number(budget.monthly_amount || 0), budget.currency)} / mes</p>
                      </div>
                      <select value={budget.status} onChange={(e) => updateStatus(budget.id, e.target.value)} className="input-dark capitalize">
                        <option value="borrador">Borrador</option>
                        <option value="enviado">Enviado</option>
                        <option value="aceptado">Aceptado</option>
                        <option value="rechazado">Rechazado</option>
                      </select>
                      <p className="text-sm text-white/40">{new Date(budget.created_at).toLocaleDateString("es-ES")}</p>
                    </div>
                    {budget.modules && budget.modules.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{budget.modules.map((module) => <span key={module.key} className="rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-100">{module.name}</span>)}</div>}
                    {budget.notes && <p className="mt-3 text-sm text-white/45">{budget.notes}</p>}
                  </div>
                );
              })}
              {filtered.length === 0 && <Empty text="No hay presupuestos con estos filtros." />}
            </div>
          </Panel>

          <Panel title="Ranking por comercial">
            <div className="space-y-3">
              {ranking.slice(0, 10).map((user, index) => <div key={user.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div className="flex items-center justify-between"><div><p className="font-semibold">#{index + 1} {user.full_name}</p><p className="text-xs text-white/40">{roleLabels[user.role] || user.role}</p></div><div className="text-right"><p className="text-lg font-semibold text-violet-200">{money(user.mrr)}</p><p className="text-xs text-white/40">{user.accepted}/{user.budgets} aceptados</p></div></div></div>)}
              {ranking.length === 0 && <Empty text="Sin comerciales." />}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}

function Metric({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string | number; helper: string }) { return <div className="flowly-app-metric rounded-[1.5rem] p-5"><div className="flowly-app-icon mb-4 flex h-11 w-11 items-center justify-center rounded-2xl">{icon}</div><p className="text-sm text-white/50">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p><p className="mt-1 text-xs text-cyan-100/70">{helper}</p></div>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="flowly-app-panel rounded-[2rem] p-6"><h2 className="mb-5 text-xl font-semibold">{title}</h2>{children}</div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/45">{text}</div>; }
