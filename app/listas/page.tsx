"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  Download,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

type LeadStatus = "pendiente" | "en_proceso" | "contactado" | "demo" | "propuesta" | "cliente" | "descartado" | "volver_llamar";
type Priority = "baja" | "media" | "alta";
type LeadTab = "disponibles" | "trabajando" | "cerrados";

type ProspectLead = {
  id: string;
  business_name: string;
  business_type: string;
  country: string;
  province: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  website: string;
  booking_software: string;
  google_rating: number;
  google_reviews: number;
  google_maps_uri: string;
  google_place_id: string;
  worked: boolean;
  worked_by: string;
  assigned_to: string;
  status: LeadStatus;
  priority: Priority;
  last_contact_at: string;
  next_follow_up_at: string;
  notes: string;
  created_at?: string;
};

const countries = ["España", "Colombia", "Ecuador", "Venezuela", "México", "Puerto Rico"];
const businessTypes = ["Peluquería", "Barbería", "Centro de estética", "Salón de uñas", "Clínica estética", "Spa", "Dentista", "Restaurante"];
const statuses: LeadStatus[] = ["pendiente", "en_proceso", "contactado", "demo", "propuesta", "cliente", "descartado", "volver_llamar"];
const priorities: Priority[] = ["baja", "media", "alta"];
const tabs: { id: LeadTab; label: string; helper: string }[] = [
  { id: "disponibles", label: "Disponibles", helper: "Leads libres para trabajar" },
  { id: "trabajando", label: "Trabajando", helper: "Asignados o en proceso" },
  { id: "cerrados", label: "Cerrados", helper: "Clientes, descartados o no interesados" },
];

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pendiente: "pendiente",
    en_proceso: "en proceso",
    contactado: "contactado",
    demo: "demo",
    propuesta: "propuesta",
    cliente: "cliente",
    descartado: "descartado",
    volver_llamar: "volver a llamar",
  };
  return labels[status] || status.replace("_", " ");
}

function nextTabForLead(lead: ProspectLead): LeadTab {
  if (["cliente", "descartado"].includes(lead.status)) return "cerrados";
  if (lead.worked || lead.status !== "pendiente" || lead.worked_by || lead.assigned_to) return "trabajando";
  return "disponibles";
}

export default function ListasPage() {
  const [leads, setLeads] = useState<ProspectLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [businessType, setBusinessType] = useState("Peluquería");
  const [country, setCountry] = useState("España");
  const [province, setProvince] = useState("Barcelona");
  const [city, setCity] = useState("");
  const [minReviews, setMinReviews] = useState(50);
  const [limit, setLimit] = useState(20);

  const [activeTab, setActiveTab] = useState<LeadTab>("disponibles");
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const available = leads.filter((lead) => nextTabForLead(lead) === "disponibles").length;
    const working = leads.filter((lead) => nextTabForLead(lead) === "trabajando").length;
    const closed = leads.filter((lead) => nextTabForLead(lead) === "cerrados").length;
    const clients = leads.filter((lead) => lead.status === "cliente").length;
    const withPhone = leads.filter((lead) => lead.phone || lead.whatsapp).length;
    return { total: leads.length, available, working, closed, clients, withPhone };
  }, [leads]);

  async function loadLeads(clearCurrentMessage = false) {
    setLoading(true);
    if (clearCurrentMessage) setMessage("");
    try {
      const params = new URLSearchParams({
        tab: activeTab,
        country,
        province: "Todas",
        businessType,
        query,
        minReviews: String(minReviews),
        limit: "500",
      });
      const response = await fetch(`/api/listas/leads?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo cargar la base comercial.");
      setLeads(payload.leads || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo cargar la base comercial.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, country, businessType, minReviews]);

  async function runGoogleSearch() {
    setSearching(true);
    setMessage("");
    try {
      const response = await fetch("/api/listas/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessType, country, province, city, minReviews, limit }),
      });
      const payload = await response.json();
      if (!response.ok) {
        const extra = [payload.details, payload.hint].filter(Boolean).join(" ");
        throw new Error(`${payload.error || "No se pudo hacer la búsqueda real."}${extra ? ` ${extra}` : ""}`);
      }
      setActiveTab("disponibles");
      setMessage(`Búsqueda terminada. Nuevos disponibles importados: ${payload.inserted || 0}. Ya existentes ignorados: ${payload.duplicates || 0}. Páginas consultadas: ${payload.pages || 1}.`);
      await loadLeads(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo hacer la búsqueda real.");
    } finally {
      setSearching(false);
    }
  }

  async function updateLead(id: string, updates: Partial<ProspectLead>) {
    setSavingId(id);
    let changedLead: ProspectLead | null = null;
    setLeads((current) =>
      current
        .map((lead) => {
          if (lead.id !== id) return lead;
          changedLead = { ...lead, ...updates };
          return changedLead;
        })
        .filter((lead) => nextTabForLead(lead) === activeTab),
    );

    try {
      const response = await fetch("/api/listas/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo guardar el cambio.");
      if (changedLead && nextTabForLead(changedLead) !== activeTab) {
        setMessage(`Lead movido a la pestaña "${tabs.find((tab) => tab.id === nextTabForLead(changedLead as ProspectLead))?.label}".`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el cambio.");
      await loadLeads(false);
    } finally {
      setSavingId(null);
    }
  }

  function exportCsv() {
    const headers = ["nombre", "tipo", "pais", "provincia", "ciudad", "direccion", "telefono", "whatsapp", "email", "instagram", "web", "google_maps", "valoracion", "resenas", "trabajado", "trabajado_por", "asignado_a", "estado", "prioridad", "ultimo_contacto", "proximo_seguimiento", "notas"];
    const rows = leads.map((lead) => [lead.business_name, lead.business_type, lead.country, lead.province, lead.city, lead.address, lead.phone, lead.whatsapp, lead.email, lead.instagram, lead.website, lead.google_maps_uri, lead.google_rating, lead.google_reviews, lead.worked ? "SI" : "NO", lead.worked_by, lead.assigned_to, statusLabel(lead.status), lead.priority, lead.last_contact_at, lead.next_follow_up_at, lead.notes]);
    const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(";")).join("\n");
    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flowly-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-8 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/comercial" className="mb-4 inline-flex items-center gap-2 text-sm text-cyan-100/80 hover:text-cyan-100">
              <ArrowLeft className="h-4 w-4" /> Volver al panel comercial
            </Link>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Flowly Leads IA</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Base comercial propia</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">
              Importa negocios nuevos y organízalos por pestañas: disponibles, trabajando y cerrados. Si un lead pasa a en proceso, deja de aparecer como disponible.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => loadLeads(true)} className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">
              <RefreshCw className="mr-2 inline h-4 w-4" /> Actualizar
            </button>
            <button onClick={exportCsv} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-100">
              <Download className="mr-2 inline h-4 w-4" /> Exportar CSV
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Metric icon={<Database className="h-5 w-5" />} label="Vista actual" value={stats.total} helper="Leads en esta pestaña" />
          <Metric icon={<Users className="h-5 w-5" />} label="Disponibles" value={stats.available} helper="Libres en esta vista" />
          <Metric icon={<Sparkles className="h-5 w-5" />} label="Trabajando" value={stats.working} helper="En proceso" />
          <Metric icon={<CheckCircle2 className="h-5 w-5" />} label="Cerrados" value={stats.closed} helper="Ganados/descartados" />
          <Metric icon={<CheckCircle2 className="h-5 w-5" />} label="Clientes" value={stats.clients} helper="Ganados" />
          <Metric icon={<Search className="h-5 w-5" />} label="Con teléfono" value={stats.withPhone} helper="Contacto directo" />
        </section>

        <Panel title="Buscar e importar negocios nuevos">
          <div className="grid gap-3 lg:grid-cols-6">
            <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="input-dark">
              {businessTypes.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="input-dark">
              {countries.map((item) => <option key={item}>{item}</option>)}
            </select>
            <input value={province} onChange={(e) => setProvince(e.target.value)} className="input-dark" placeholder="Provincia" />
            <input value={city} onChange={(e) => setCity(e.target.value)} className="input-dark" placeholder="Ciudad opcional" />
            <input value={minReviews} min={0} type="number" onChange={(e) => setMinReviews(Number(e.target.value || 0))} className="input-dark" placeholder="Mín. reseñas" />
            <input value={limit} min={1} max={60} type="number" onChange={(e) => setLimit(Number(e.target.value || 20))} className="input-dark" placeholder="Cantidad" />
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-white/45">Flowly ignora negocios que ya estén guardados, incluso si están en Trabajando o Cerrados. Si pides 20, intentará completar con 20 nuevos disponibles consultando varias páginas de Google Places.</p>
            <button onClick={runGoogleSearch} disabled={searching} className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">
              {searching ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : <Search className="mr-2 inline h-4 w-4" />} Buscar e importar
            </button>
          </div>
          {message && <p className="mt-4 rounded-2xl border border-cyan-200/20 bg-cyan-200/10 p-3 text-sm text-cyan-50">{message}</p>}
        </Panel>

        <Panel title="Base de datos comercial">
          <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid gap-2 sm:grid-cols-3">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`rounded-2xl border px-4 py-3 text-left transition ${activeTab === tab.id ? "border-cyan-200/60 bg-cyan-200/15 text-cyan-50" : "border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/10"}`}>
                  <span className="block text-sm font-bold">{tab.label}</span>
                  <span className="mt-1 block text-[11px] text-white/40">{tab.helper}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") loadLeads(true); }} className="input-dark min-w-72" placeholder="Buscar por nombre, teléfono, comercial o dirección" />
              <button onClick={() => loadLeads(true)} className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">Buscar</button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-white/60"><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Cargando negocios...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1480px] border-separate border-spacing-y-3 text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.18em] text-white/35">
                  <tr><th className="px-3">Mover</th><th className="px-3">Negocio</th><th className="px-3">Contacto</th><th className="px-3">Zona</th><th className="px-3">Google</th><th className="px-3">Lo trabaja</th><th className="px-3">Asignado</th><th className="px-3">Estado</th><th className="px-3">Prioridad</th><th className="px-3">Último contacto</th><th className="px-3">Próximo seguimiento</th><th className="px-3">Notas</th></tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="rounded-3xl bg-white/[0.055] align-top shadow-lg shadow-black/10">
                      <td className="rounded-l-3xl p-3">
                        <button onClick={() => updateLead(lead.id, { status: "en_proceso", worked: true })} className="rounded-xl border border-cyan-200/20 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-200/10">En proceso</button>
                        <button onClick={() => updateLead(lead.id, { status: "cliente", worked: true })} className="mt-2 block rounded-xl border border-emerald-200/20 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-200/10">Cliente</button>
                        <button onClick={() => updateLead(lead.id, { status: "descartado", worked: true })} className="mt-2 block rounded-xl border border-rose-200/20 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-200/10">Descartar</button>
                      </td>
                      <td className="p-3"><p className="font-semibold text-white">{lead.business_name}</p><p className="mt-1 text-xs text-white/45">{lead.business_type}</p><p className="mt-1 max-w-72 text-xs text-white/45">{lead.address || "Sin dirección"}</p>{lead.google_maps_uri && <a href={lead.google_maps_uri} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-cyan-200">Ver ficha Google</a>}</td>
                      <td className="p-3 text-xs text-white/65"><p>{lead.phone || "Sin teléfono"}</p><p className="mt-1 text-emerald-200">{lead.whatsapp || "WhatsApp no confirmado"}</p>{lead.website && <a href={lead.website} target="_blank" rel="noreferrer" className="mt-1 block text-cyan-200">Web</a>}<input value={lead.email || ""} onChange={(e) => updateLead(lead.id, { email: e.target.value })} placeholder="Email" className="input-dark mt-2 min-w-40 px-3 py-2 text-xs" /></td>
                      <td className="p-3 text-xs text-white/60">{lead.city || "-"}<br />{lead.province || "-"}<br />{lead.country}</td>
                      <td className="p-3 text-xs text-white/65"><strong className="text-white">{lead.google_rating || "-"}</strong><br />{Number(lead.google_reviews || 0).toLocaleString("es-ES")} reseñas</td>
                      <td className="p-3"><input value={lead.worked_by || ""} onChange={(e) => updateLead(lead.id, { worked_by: e.target.value, worked: Boolean(e.target.value) || lead.worked, status: e.target.value && lead.status === "pendiente" ? "en_proceso" : lead.status })} placeholder="Nombre" className="input-dark min-w-36 px-3 py-2 text-xs" />{savingId === lead.id && <p className="mt-1 text-[11px] text-cyan-200">Guardando...</p>}</td>
                      <td className="p-3"><input value={lead.assigned_to || ""} onChange={(e) => updateLead(lead.id, { assigned_to: e.target.value, worked: Boolean(e.target.value) || lead.worked, status: e.target.value && lead.status === "pendiente" ? "en_proceso" : lead.status })} placeholder="Comercial" className="input-dark min-w-36 px-3 py-2 text-xs" /></td>
                      <td className="p-3"><select value={lead.status || "pendiente"} onChange={(e) => updateLead(lead.id, { status: e.target.value as LeadStatus, worked: e.target.value !== "pendiente" })} className="input-dark min-w-40 px-3 py-2 text-xs capitalize">{statuses.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}</select></td>
                      <td className="p-3"><select value={lead.priority || "media"} onChange={(e) => updateLead(lead.id, { priority: e.target.value as Priority })} className="input-dark min-w-28 px-3 py-2 text-xs capitalize">{priorities.map((item) => <option key={item}>{item}</option>)}</select></td>
                      <td className="p-3"><input value={lead.last_contact_at || ""} type="date" onChange={(e) => updateLead(lead.id, { last_contact_at: e.target.value, worked: true, status: lead.status === "pendiente" ? "en_proceso" : lead.status })} className="input-dark min-w-36 px-3 py-2 text-xs" /></td>
                      <td className="p-3"><input value={lead.next_follow_up_at || ""} type="date" onChange={(e) => updateLead(lead.id, { next_follow_up_at: e.target.value })} className="input-dark min-w-36 px-3 py-2 text-xs" /></td>
                      <td className="rounded-r-3xl p-3"><textarea value={lead.notes || ""} onChange={(e) => updateLead(lead.id, { notes: e.target.value })} placeholder="Observaciones" className="input-dark min-h-16 min-w-64 px-3 py-2 text-xs" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!leads.length && <p className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-center text-sm text-white/50">No hay negocios en esta pestaña. Importa nuevos leads o revisa otra pestaña.</p>}
            </div>
          )}
        </Panel>
      </div>
    </main>
  );
}

function Metric({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: number | string; helper: string }) {
  return <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/10 backdrop-blur-xl"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100">{icon}</div><p className="text-sm text-white/45">{label}</p><p className="mt-1 text-3xl font-semibold">{value}</p><p className="mt-1 text-xs text-white/35">{helper}</p></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/10 backdrop-blur-xl"><h2 className="mb-5 text-xl font-semibold">{title}</h2>{children}</div>;
}
