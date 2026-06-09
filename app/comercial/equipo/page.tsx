"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { FIRST_BRANCH_RULE, getCommissionRule, getUplineChain } from "@/lib/salesCommissions";
import { ArrowLeft, BarChart3, Crown, Euro, LogOut, Target, Trophy, Users } from "lucide-react";

type SalesUser = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  role: "director" | "jefe" | "senior" | "asociado";
  manager_id: string | null;
  status: string;
  monthly_target: number;
};

type Deal = {
  id: string;
  sales_user_id: string | null;
  monthly_amount: number;
  status: string;
};

type Lead = {
  id: string;
  assigned_to: string | null;
  status: string;
};

type Commission = {
  id: string;
  sales_user_id: string | null;
  amount: number;
  type: string;
  status: string;
};

const roleLabels: Record<string, string> = {
  asociado: "Asociado",
  senior: "Senior",
  jefe: "Jefe Comercial",
  director: "Director Comercial",
};

export default function EquipoComercialPage() {
  const router = useRouter();
  const [me, setMe] = useState<SalesUser | null>(null);
  const [team, setTeam] = useState<SalesUser[]>([]);
  const [allSalesUsers, setAllSalesUsers] = useState<SalesUser[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
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

    setMe(salesUser as SalesUser);

    const { data: allUsersData } = await supabase
      .from("sales_users")
      .select("*")
      .order("created_at", { ascending: false });

    const allUsers = (allUsersData || []) as SalesUser[];
    setAllSalesUsers(allUsers);
    const members = getDescendants(salesUser.id, allUsers, FIRST_BRANCH_RULE.maxLevels);
    setTeam(members);

    const ids = members.map((member) => member.id);
    if (ids.length === 0) {
      setDeals([]);
      setLeads([]);
      setCommissions([]);
      setLoading(false);
      return;
    }

    const [{ data: dealsData }, { data: leadsData }, { data: commissionsData }] = await Promise.all([
      supabase.from("sales_deals").select("*").in("sales_user_id", ids),
      supabase.from("sales_leads").select("id, assigned_to, status").in("assigned_to", ids),
      supabase.from("commissions").select("id, sales_user_id, amount, type, status").in("sales_user_id", ids),
    ]);

    setDeals((dealsData || []) as Deal[]);
    setLeads((leadsData || []) as Lead[]);
    setCommissions((commissionsData || []) as Commission[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const teamMrr = deals
    .filter((deal) => deal.status === "active" || deal.status === "trialing")
    .reduce((sum, deal) => sum + Number(deal.monthly_amount || 0), 0);
  const teamCommissions = commissions
    .filter((commission) => commission.status !== "cancelled")
    .reduce((sum, commission) => sum + Number(commission.amount || 0), 0);
  const closedLeads = leads.filter((lead) => lead.status === "cerrado").length;

  const ranking = useMemo(() => {
    return team
      .map((member) => {
        const memberDeals = deals.filter((deal) => deal.sales_user_id === member.id && (deal.status === "active" || deal.status === "trialing"));
        const mrr = memberDeals.reduce((sum, deal) => sum + Number(deal.monthly_amount || 0), 0);
        const memberLeads = leads.filter((lead) => lead.assigned_to === member.id);
        const closed = memberLeads.filter((lead) => lead.status === "cerrado").length;
        return { ...member, mrr, activeClients: memberDeals.length, leads: memberLeads.length, closed };
      })
      .sort((a, b) => b.mrr - a.mrr);
  }, [team, deals, leads]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#070711] text-white">Cargando equipo...</main>;

  if (!me) {
    return <main className="flex min-h-screen items-center justify-center bg-[#070711] text-white">No tienes perfil comercial vinculado.</main>;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#4c1d95_0%,#0b1020_35%,#020617_100%)] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <Link href="/comercial" className="mb-4 inline-flex items-center gap-2 text-sm text-violet-200"><ArrowLeft size={16} /> Volver a mi panel</Link>
            <p className="text-sm font-medium text-violet-300">Flowly IA · Equipo comercial</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Equipo de {me.full_name}</h1>
            <p className="mt-2 text-white/60">Liderazgo, ranking, MRR, comisiones de red y organigrama completo.</p>
          </div>

          <button onClick={logout} className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm"><LogOut size={16} className="inline" /> Salir</button>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <Metric icon={<Users />} label="Comerciales" value={team.length} helper="Equipo directo" />
          <Metric icon={<BarChart3 />} label="MRR equipo" value={`${teamMrr.toFixed(2)}€`} helper="Cartera total" />
          <Metric icon={<Target />} label="Cierres" value={closedLeads} helper="Leads cerrados" />
          <Metric icon={<Euro />} label="Comisiones equipo" value={`${teamCommissions.toFixed(2)}€`} helper="Registradas" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Panel title="Ranking del equipo">
            <div className="space-y-3">
              {ranking.map((member, index) => (
                <div key={member.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-200">
                        {index === 0 ? <Trophy /> : <Crown />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">#{index + 1} {member.full_name}</h3>
                        <p className="text-sm text-white/50">{roleLabels[member.role]} · {member.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center text-sm">
                      <Mini label="MRR" value={`${member.mrr.toFixed(0)}€`} />
                      <Mini label="Clientes" value={member.activeClients} />
                      <Mini label="Leads" value={member.leads} />
                    </div>
                  </div>
                </div>
              ))}
              {ranking.length === 0 && <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-white/50">Aún no tienes comerciales asignados.</div>}
            </div>
          </Panel>

          <Panel title="Plan de comisiones"><CommissionPlan role={me.role} /></Panel>

          <Panel title="Estructura de liderazgo">
            <div className="rounded-3xl bg-violet-500/20 p-5 text-center">
              <p className="text-sm text-violet-200">Tú</p>
              <p className="mt-1 text-2xl font-semibold">{me.full_name}</p>
              <p className="mt-1 text-sm text-white/50">{roleLabels[me.role]}</p>
            </div>
            <div className="mt-5 grid gap-3">
              <OrgBack me={me} allUsers={allSalesUsers} />
              <OrgForward root={me} allUsers={allSalesUsers} />
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}

function CommissionPlan({ role }: { role: SalesUser["role"] }) {
  const rule = getCommissionRule(role);
  return <div className="rounded-2xl border border-violet-300/20 bg-violet-500/10 p-4"><p className="text-sm text-violet-200">{roleLabels[role]}</p><p className="mt-2 text-2xl font-semibold">{rule.directSalePct}% venta + {rule.directMonthlyPct}% mensual</p><p className="mt-2 text-sm text-white/55">Rama propia: {rule.branchSalePct}% venta + {rule.branchMonthlyPct}% mensual. Primera rama: {FIRST_BRANCH_RULE.salePct}% venta + {FIRST_BRANCH_RULE.monthlyPct}% mensual. Máximo {FIRST_BRANCH_RULE.maxLevels} niveles.</p></div>;
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
  return <div className="space-y-3"><p className="text-sm font-medium text-violet-200">Hacia atrás</p><div className="rounded-2xl bg-white p-4 text-neutral-950"><p className="font-semibold">{me.full_name}</p><p className="text-xs">{roleLabels[me.role]}</p></div>{chain.map((user) => <div key={user.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-xs text-violet-200">Nivel superior {user.hierarchy_level}</p><p className="font-semibold">{user.full_name}</p><p className="text-xs text-white/45">{roleLabels[user.role]}</p></div>)}</div>;
}

function OrgForward({ root, allUsers }: { root: SalesUser; allUsers: SalesUser[] }) {
  const children = allUsers.filter((user) => user.manager_id === root.id);
  return <div className="mt-5 space-y-3"><p className="text-sm font-medium text-violet-200">Hacia delante</p>{children.map((child) => <OrgNode key={child.id} user={child} allUsers={allUsers} level={1} />)}{children.length === 0 && <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-white/45">Aún no tienes rama por debajo.</div>}</div>;
}

function OrgNode({ user, allUsers, level }: { user: SalesUser; allUsers: SalesUser[]; level: number }) {
  const children = level >= FIRST_BRANCH_RULE.maxLevels ? [] : allUsers.filter((candidate) => candidate.manager_id === user.id);
  return <div className="ml-3 border-l border-white/10 pl-4"><div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-xs text-violet-200">Nivel {level}</p><p className="font-semibold">{user.full_name}</p><p className="text-xs text-white/45">{roleLabels[user.role]}</p></div><div className="mt-3 space-y-3">{children.map((child) => <OrgNode key={child.id} user={child} allUsers={allUsers} level={level + 1} />)}</div></div>;
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
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3">
      <p className="font-semibold">{value}</p>
      <p className="text-xs text-white/45">{label}</p>
    </div>
  );
}
