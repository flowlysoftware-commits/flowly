"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Crown,
  Euro,
  LogOut,
  Plus,
  Target,
  Trophy,
  Users,
} from "lucide-react";

type SalesUser = {
  id: string;
  full_name: string;
  email: string;
  role: "director" | "jefe" | "senior" | "asociado";
  manager_id: string | null;
  monthly_target: number;
  status: string;
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

type Deal = {
  id: string;
  sales_user_id: string | null;
  monthly_amount: number;
  plan: string;
  status: string;
  closed_at: string;
};

type Commission = {
  id: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
};

const leadStatuses = ["nuevo", "contactado", "demo", "propuesta", "cerrado", "perdido"];

const roleLabels: Record<string, string> = {
  asociado: "Comercial Asociado",
  senior: "Comercial Senior",
  jefe: "Jefe Comercial",
  director: "Director Comercial",
};

export default function ComercialPage() {
  const router = useRouter();
  const [me, setMe] = useState<SalesUser | null>(null);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sector, setSector] = useState("Peluquería");
  const [notes, setNotes] = useState("");

  const loadData = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      router.push("/login");
      return;
    }

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

    const [{ data: leadsData }, { data: dealsData }, { data: commissionsData }] = await Promise.all([
      supabase
        .from("sales_leads")
        .select("*")
        .eq("assigned_to", salesUser.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("sales_deals")
        .select("*")
        .eq("sales_user_id", salesUser.id)
        .order("closed_at", { ascending: false }),
      supabase
        .from("commissions")
        .select("*")
        .eq("sales_user_id", salesUser.id)
        .order("created_at", { ascending: false }),
    ]);

    setLeads((leadsData || []) as SalesLead[]);
    setDeals((dealsData || []) as Deal[]);
    setCommissions((commissionsData || []) as Commission[]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const activeClients = deals.filter((deal) => deal.status === "active" || deal.status === "trialing").length;
  const mrr = deals
    .filter((deal) => deal.status === "active" || deal.status === "trialing")
    .reduce((sum, deal) => sum + Number(deal.monthly_amount || 0), 0);
  const commissionTotal = commissions
    .filter((commission) => commission.status !== "cancelled")
    .reduce((sum, commission) => sum + Number(commission.amount || 0), 0);
  const closedLeads = leads.filter((lead) => lead.status === "cerrado").length;
  const targetProgress = me?.monthly_target ? Math.min(100, Math.round((closedLeads / me.monthly_target) * 100)) : 0;

  const pipeline = useMemo(() => {
    return leadStatuses.map((status) => ({ status, count: leads.filter((lead) => lead.status === status).length }));
  }, [leads]);

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#070711] text-white">Cargando panel comercial...</main>;
  }

  if (!me) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#4c1d95_0%,#09090f_35%,#020617_100%)] px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/10 p-8 backdrop-blur">
          <h1 className="text-3xl font-semibold">Tu usuario todavía no está vinculado a la red comercial</h1>
          <p className="mt-3 text-white/60">Pide a un administrador que cree tu perfil en sales_users con tu email de acceso.</p>
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
            <p className="mt-2 text-white/60">{roleLabels[me.role]} · Cartera, objetivos y comisiones</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {(me.role === "jefe" || me.role === "director") && (
              <Link href="/comercial/equipo" className="rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950">
                Ver equipo <ArrowRight size={16} className="inline" />
              </Link>
            )}
            <button onClick={logout} className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm text-white">
              <LogOut size={16} className="inline" /> Salir
            </button>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <Metric icon={<Target />} label="Progreso objetivo" value={`${targetProgress}%`} helper={`${closedLeads}/${me.monthly_target} cierres`} />
          <Metric icon={<Users />} label="Clientes activos" value={activeClients} helper="Cartera propia" />
          <Metric icon={<BarChart3 />} label="MRR generado" value={`${mrr.toFixed(2)}€`} helper="Mensual recurrente" />
          <Metric icon={<Euro />} label="Comisiones" value={`${commissionTotal.toFixed(2)}€`} helper="Total registrado" />
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Panel title="Nuevo lead" dark>
            <div className="grid gap-3">
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Empresa / negocio" className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 outline-none placeholder:text-white/40" />
              <div className="grid gap-3 md:grid-cols-2">
                <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Persona de contacto" className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 outline-none placeholder:text-white/40" />
                <select value={sector} onChange={(e) => setSector(e.target.value)} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 outline-none">
                  <option>Peluquería</option>
                  <option>Barbería</option>
                  <option>Estética</option>
                  <option>Clínica</option>
                  <option>Academia</option>
                  <option>Restaurante</option>
                </select>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 outline-none placeholder:text-white/40" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 outline-none placeholder:text-white/40" />
              </div>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas comerciales" className="min-h-24 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 outline-none placeholder:text-white/40" />
              <button onClick={createLead} className="rounded-full bg-violet-500 px-5 py-3 font-medium text-white shadow-lg shadow-violet-950/40">
                <Plus size={18} className="inline" /> Crear lead
              </button>
            </div>
          </Panel>

          <Panel title="Pipeline comercial" dark>
            <div className="grid gap-3 md:grid-cols-6">
              {pipeline.map((item) => (
                <div key={item.status} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-center">
                  <p className="text-2xl font-semibold">{item.count}</p>
                  <p className="mt-1 text-xs capitalize text-white/50">{item.status}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-300" style={{ width: `${targetProgress}%` }} />
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Panel title="Leads asignados" dark>
            <div className="space-y-3">
              {leads.map((lead) => (
                <div key={lead.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{lead.company}</h3>
                      <p className="mt-1 text-sm text-white/55">{lead.contact_name || "Sin contacto"} · {lead.phone || "Sin teléfono"} · {lead.sector || "Sector"}</p>
                    </div>
                    <select value={lead.status} onChange={(e) => updateLead(lead.id, e.target.value)} className="rounded-full border border-white/10 bg-neutral-950 px-4 py-2 text-sm capitalize">
                      {leadStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                  {lead.notes && <p className="mt-3 text-sm text-white/50">{lead.notes}</p>}
                </div>
              ))}
              {leads.length === 0 && <Empty text="Aún no tienes leads asignados." />}
            </div>
          </Panel>

          <Panel title="Comisiones recientes" dark>
            <div className="space-y-3">
              {commissions.slice(0, 8).map((commission) => (
                <div key={commission.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <div>
                    <p className="font-medium capitalize">{commission.type}</p>
                    <p className="text-xs text-white/45">{commission.status}</p>
                  </div>
                  <p className="text-lg font-semibold text-violet-200">{Number(commission.amount).toFixed(2)}€</p>
                </div>
              ))}
              {commissions.length === 0 && <Empty text="No hay comisiones registradas todavía." />}
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

function Panel({ title, children, dark = false }: { title: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={dark ? "rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl" : "rounded-[2rem] bg-white p-6 shadow-sm"}>
      <h2 className="mb-5 text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/45">{text}</div>;
}
