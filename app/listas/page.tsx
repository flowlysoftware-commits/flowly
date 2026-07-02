"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Filter,
  MessageCircle,
  Plus,
  Scissors,
  Search,
  Upload,
  Users,
} from "lucide-react";

type LeadStatus = "pendiente" | "contactado" | "demo" | "propuesta" | "cliente" | "descartado";

type HairSalonLead = {
  id: string;
  businessName: string;
  country: string;
  province: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  googleRating: number;
  googleReviews: number;
  website: string;
  instagram: string;
  email: string;
  bookingSoftware: string;
  worked: boolean;
  workedBy: string;
  status: LeadStatus;
  lastContact: string;
  notes: string;
};

const STORAGE_KEY = "flowly_hair_salon_lists_v1";
const countries = ["España", "Colombia", "Ecuador", "Venezuela", "México", "Puerto Rico", "Todos"];
const statuses: LeadStatus[] = ["pendiente", "contactado", "demo", "propuesta", "cliente", "descartado"];

const seedLeads: HairSalonLead[] = [
  { id: "es-bcn-001", businessName: "Hair Cut Day Aragó", country: "España", province: "Barcelona", city: "Barcelona", address: "Carrer d'Aragó, Barcelona", phone: "+34 938 533 371", whatsapp: "+34 938 533 371", googleRating: 4.8, googleReviews: 2500, website: "", instagram: "", email: "", bookingSoftware: "Pendiente de revisar", worked: false, workedBy: "", status: "pendiente", lastContact: "", notes: "Prioridad alta: muchas reseñas y buena visibilidad local." },
  { id: "es-bcn-002", businessName: "ONDA Hair & Beauty Salon", country: "España", province: "Barcelona", city: "Barcelona", address: "Barcelona", phone: "+34 931 873 236", whatsapp: "+34 931 873 236", googleRating: 4.8, googleReviews: 1300, website: "", instagram: "", email: "", bookingSoftware: "Pendiente de revisar", worked: false, workedBy: "", status: "pendiente", lastContact: "", notes: "Buen candidato para demo de agenda + WhatsApp." },
  { id: "es-mad-001", businessName: "Blow Dry Bar - Daniele Sigigliano", country: "España", province: "Madrid", city: "Madrid", address: "Madrid", phone: "+34 910 096 594", whatsapp: "+34 910 096 594", googleRating: 4.7, googleReviews: 2700, website: "", instagram: "", email: "", bookingSoftware: "Pendiente de revisar", worked: false, workedBy: "", status: "pendiente", lastContact: "", notes: "Volumen alto de reseñas. Revisar si ya usa reservas online." },
  { id: "es-mad-002", businessName: "Peluquería Ana González Plaza España", country: "España", province: "Madrid", city: "Madrid", address: "Plaza España, Madrid", phone: "+34 910 145 547", whatsapp: "+34 910 145 547", googleRating: 4.8, googleReviews: 1000, website: "", instagram: "", email: "", bookingSoftware: "Pendiente de revisar", worked: false, workedBy: "", status: "pendiente", lastContact: "", notes: "Lead de peluquería con prueba social fuerte." },
  { id: "es-val-001", businessName: "Peluquería premium Valencia", country: "España", province: "Valencia", city: "Valencia", address: "Valencia", phone: "", whatsapp: "", googleRating: 4.6, googleReviews: 250, website: "", instagram: "", email: "", bookingSoftware: "Pendiente de revisar", worked: false, workedBy: "", status: "pendiente", lastContact: "", notes: "Plantilla de ejemplo para importar leads reales desde CSV." },
];

const emptyLead: HairSalonLead = { id: "", businessName: "", country: "España", province: "", city: "", address: "", phone: "", whatsapp: "", googleRating: 0, googleReviews: 0, website: "", instagram: "", email: "", bookingSoftware: "", worked: false, workedBy: "", status: "pendiente", lastContact: "", notes: "" };

function normalizeText(value: string) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
function csvEscape(value: unknown) { const text = String(value ?? ""); return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; }
function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && quoted && next === '"') { current += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if ((char === ";" || char === ",") && !quoted) { result.push(current.trim()); current = ""; }
    else current += char;
  }
  result.push(current.trim());
  return result;
}
function valueFrom(row: Record<string, string>, keys: string[]) { for (const key of keys) { const found = row[normalizeText(key)]; if (found) return found; } return ""; }

export default function ListasPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [leads, setLeads] = useState<HairSalonLead[]>(seedLeads);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("España");
  const [province, setProvince] = useState("Todas");
  const [minReviews, setMinReviews] = useState(50);
  const [workedFilter, setWorkedFilter] = useState("todos");
  const [editing, setEditing] = useState<HairSalonLead>({ ...emptyLead });

  useEffect(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) setLeads(JSON.parse(saved)); }
    catch { setLeads(seedLeads); }
  }, []);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(leads)); } catch {} }, [leads]);

  const provinces = useMemo(() => ["Todas", ...Array.from(new Set(leads.filter((lead) => country === "Todos" || lead.country === country).map((lead) => lead.province).filter(Boolean))).sort()], [country, leads]);
  const filteredLeads = useMemo(() => {
    const q = normalizeText(query);
    return leads.filter((lead) => {
      const haystack = normalizeText(`${lead.businessName} ${lead.city} ${lead.province} ${lead.phone} ${lead.whatsapp} ${lead.workedBy} ${lead.status}`);
      return (country === "Todos" || lead.country === country) && (province === "Todas" || lead.province === province) && Number(lead.googleReviews || 0) >= minReviews && (workedFilter === "todos" || (workedFilter === "trabajados" ? lead.worked : !lead.worked)) && (!q || haystack.includes(q));
    });
  }, [country, leads, minReviews, province, query, workedFilter]);
  const stats = useMemo(() => {
    const worked = filteredLeads.filter((lead) => lead.worked).length;
    const demos = filteredLeads.filter((lead) => lead.status === "demo" || lead.status === "propuesta" || lead.status === "cliente").length;
    const withPhone = filteredLeads.filter((lead) => lead.phone || lead.whatsapp).length;
    return { total: filteredLeads.length, worked, pending: filteredLeads.length - worked, demos, withPhone };
  }, [filteredLeads]);

  function saveLead() {
    if (!editing.businessName.trim()) return;
    const id = editing.id || `lead-${Date.now()}`;
    const next = { ...editing, id, googleRating: Number(editing.googleRating || 0), googleReviews: Number(editing.googleReviews || 0) };
    setLeads((current) => current.some((lead) => lead.id === id) ? current.map((lead) => (lead.id === id ? next : lead)) : [next, ...current]);
    setEditing({ ...emptyLead });
  }
  function updateLead(id: string, updates: Partial<HairSalonLead>) { setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead))); }
  function exportCsv() {
    const headers = ["nombre", "pais", "provincia", "ciudad", "direccion", "telefono", "whatsapp", "valoracion_google", "resenas_google", "web", "instagram", "email", "software_reservas", "trabajado", "trabajado_por", "estado", "ultimo_contacto", "observaciones"];
    const rows = filteredLeads.map((lead) => [lead.businessName, lead.country, lead.province, lead.city, lead.address, lead.phone, lead.whatsapp, lead.googleRating, lead.googleReviews, lead.website, lead.instagram, lead.email, lead.bookingSoftware, lead.worked ? "SI" : "NO", lead.workedBy, lead.status, lead.lastContact, lead.notes]);
    const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(";")).join("\n");
    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flowly-listado-peluquerias-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function importCsv(file: File) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return;
    const headers = parseCsvLine(lines[0]).map(normalizeText);
    const imported = lines.slice(1).map((line, index) => {
      const cells = parseCsvLine(line);
      const row = headers.reduce<Record<string, string>>((acc, header, cellIndex) => ({ ...acc, [header]: cells[cellIndex] || "" }), {});
      const status = valueFrom(row, ["estado"]) as LeadStatus;
      return { id: `import-${Date.now()}-${index}`, businessName: valueFrom(row, ["nombre", "negocio", "peluqueria", "businessName"]), country: valueFrom(row, ["pais", "country"]) || "España", province: valueFrom(row, ["provincia", "province"]), city: valueFrom(row, ["ciudad", "city"]), address: valueFrom(row, ["direccion", "address"]), phone: valueFrom(row, ["telefono", "phone"]), whatsapp: valueFrom(row, ["whatsapp", "posible whatsapp"]), googleRating: Number(valueFrom(row, ["valoracion_google", "rating", "valoracion"]) || 0), googleReviews: Number(valueFrom(row, ["resenas_google", "reseñas_google", "reviews", "resenas"]) || 0), website: valueFrom(row, ["web", "website", "pagina web"]), instagram: valueFrom(row, ["instagram"]), email: valueFrom(row, ["email", "correo"]), bookingSoftware: valueFrom(row, ["software_reservas", "software reservas", "bookingSoftware"]), worked: ["si", "sí", "true", "1", "yes"].includes(normalizeText(valueFrom(row, ["trabajado", "worked"]))), workedBy: valueFrom(row, ["trabajado_por", "trabajado por", "workedBy"]), status: statuses.includes(status) ? status : "pendiente", lastContact: valueFrom(row, ["ultimo_contacto", "ultimo contacto", "lastContact"]), notes: valueFrom(row, ["observaciones", "notas", "notes"]) } satisfies HairSalonLead;
    }).filter((lead) => lead.businessName.trim());
    setLeads((current) => [...imported, ...current]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0"><div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]" /><div className="absolute right-[-10rem] top-[-8rem] h-[34rem] w-[34rem] rounded-full bg-violet-600/25 blur-[140px]" /><div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[120px]" /><div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:radial-gradient(circle_at_top,black,transparent_72%)]" /></div>
      <div className="relative mx-auto max-w-7xl">
        <Link href="/comercial" className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/75 transition hover:bg-white/15"><ArrowLeft size={16} /> Volver al panel comercial</Link>
        <header className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur-2xl sm:p-7"><div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center"><div><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100"><Scissors size={14} /> Listas comerciales Flowly</div><h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">Peluquerías cualificadas para vender Flowly</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">Gestiona el listado por país, reseñas, ciudad y comercial asignado. Marca cada negocio como trabajado, registra quién lo está trabajando y exporta la base filtrada para campañas.</p></div><div className="grid min-w-[260px] gap-3 rounded-[1.5rem] border border-white/10 bg-black/25 p-4"><button onClick={exportCsv} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"><Download size={16} /> Exportar CSV</button><button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white"><Upload size={16} /> Importar CSV</button><input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => event.target.files?.[0] && importCsv(event.target.files[0])} /></div></div></header>
        <section className="mb-8 grid gap-4 md:grid-cols-5"><Metric icon={<Users />} label="Leads filtrados" value={stats.total} helper="Según filtros" /><Metric icon={<CheckCircle2 />} label="Trabajados" value={stats.worked} helper="Con seguimiento" /><Metric icon={<Filter />} label="Pendientes" value={stats.pending} helper="Sin trabajar" /><Metric icon={<MessageCircle />} label="Con teléfono" value={stats.withPhone} helper="Posible WhatsApp" /><Metric icon={<Scissors />} label="Demo/propuesta" value={stats.demos} helper="Oportunidad caliente" /></section>
        <section className="mb-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl"><div className="grid gap-3 lg:grid-cols-[1.2fr_.8fr_.8fr_.7fr_.8fr]"><label className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, ciudad, teléfono, comercial..." className="input-dark w-full pl-11" /></label><select value={country} onChange={(event) => { setCountry(event.target.value); setProvince("Todas"); }} className="input-dark">{countries.map((item) => <option key={item} value={item}>{item}</option>)}</select><select value={province} onChange={(event) => setProvince(event.target.value)} className="input-dark">{provinces.map((item) => <option key={item} value={item}>{item}</option>)}</select><input value={minReviews} min={0} type="number" onChange={(event) => setMinReviews(Number(event.target.value || 0))} className="input-dark" placeholder="Mín. reseñas" /><select value={workedFilter} onChange={(event) => setWorkedFilter(event.target.value)} className="input-dark"><option value="todos">Todos</option><option value="pendientes">Pendientes</option><option value="trabajados">Trabajados</option></select></div></section>
        <section className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]"><Panel title={editing.id ? "Editar negocio" : "Añadir negocio manual"}><div className="grid gap-3"><input value={editing.businessName} onChange={(e) => setEditing({ ...editing, businessName: e.target.value })} placeholder="Nombre de la peluquería" className="input-dark" /><div className="grid gap-3 md:grid-cols-2"><select value={editing.country} onChange={(e) => setEditing({ ...editing, country: e.target.value })} className="input-dark">{countries.filter((item) => item !== "Todos").map((item) => <option key={item}>{item}</option>)}</select><input value={editing.province} onChange={(e) => setEditing({ ...editing, province: e.target.value })} placeholder="Provincia" className="input-dark" /></div><div className="grid gap-3 md:grid-cols-2"><input value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} placeholder="Ciudad" className="input-dark" /><input value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} placeholder="Dirección" className="input-dark" /></div><div className="grid gap-3 md:grid-cols-2"><input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} placeholder="Teléfono público" className="input-dark" /><input value={editing.whatsapp} onChange={(e) => setEditing({ ...editing, whatsapp: e.target.value })} placeholder="WhatsApp público / posible WhatsApp" className="input-dark" /></div><div className="grid gap-3 md:grid-cols-2"><input value={editing.googleRating} type="number" step="0.1" onChange={(e) => setEditing({ ...editing, googleRating: Number(e.target.value || 0) })} placeholder="Valoración Google" className="input-dark" /><input value={editing.googleReviews} type="number" onChange={(e) => setEditing({ ...editing, googleReviews: Number(e.target.value || 0) })} placeholder="Nº reseñas" className="input-dark" /></div><div className="grid gap-3 md:grid-cols-2"><input value={editing.website} onChange={(e) => setEditing({ ...editing, website: e.target.value })} placeholder="Web" className="input-dark" /><input value={editing.instagram} onChange={(e) => setEditing({ ...editing, instagram: e.target.value })} placeholder="Instagram" className="input-dark" /></div><input value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} placeholder="Email público" className="input-dark" /><input value={editing.bookingSoftware} onChange={(e) => setEditing({ ...editing, bookingSoftware: e.target.value })} placeholder="Software de reservas detectado" className="input-dark" /><div className="grid gap-3 md:grid-cols-2"><select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as LeadStatus })} className="input-dark">{statuses.map((item) => <option key={item}>{item}</option>)}</select><input value={editing.workedBy} onChange={(e) => setEditing({ ...editing, workedBy: e.target.value })} placeholder="Lo trabaja..." className="input-dark" /></div><label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm text-white/70"><input type="checkbox" checked={editing.worked} onChange={(e) => setEditing({ ...editing, worked: e.target.checked })} className="h-5 w-5 accent-cyan-300" /> Marcado como trabajado</label><textarea value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} placeholder="Observaciones internas" className="input-dark min-h-24" /><div className="grid gap-2 md:grid-cols-2"><button onClick={saveLead} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 to-violet-300 px-5 py-3 text-sm font-semibold text-slate-950"><Plus size={16} /> Guardar</button><button onClick={() => setEditing({ ...emptyLead })} className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm text-white/75">Limpiar</button></div></div></Panel>
          <Panel title="Base comercial"><div className="overflow-x-auto"><table className="w-full min-w-[1100px] border-separate border-spacing-y-3 text-left text-sm"><thead className="text-xs uppercase tracking-[0.18em] text-white/35"><tr><th className="px-3">Trabajado</th><th className="px-3">Negocio</th><th className="px-3">Contacto</th><th className="px-3">Zona</th><th className="px-3">Google</th><th className="px-3">Lo trabaja</th><th className="px-3">Estado</th><th className="px-3">Último contacto</th><th className="px-3">Acción</th></tr></thead><tbody>{filteredLeads.map((lead) => (<tr key={lead.id} className="rounded-3xl bg-white/[0.055] align-top shadow-lg shadow-black/10"><td className="rounded-l-3xl p-3"><input type="checkbox" checked={lead.worked} onChange={(e) => updateLead(lead.id, { worked: e.target.checked })} className="h-5 w-5 accent-cyan-300" /></td><td className="p-3"><p className="font-semibold text-white">{lead.businessName}</p><p className="mt-1 max-w-60 text-xs text-white/45">{lead.address || "Sin dirección"}</p></td><td className="p-3 text-xs text-white/65"><p>{lead.phone || "Sin teléfono"}</p><p className="mt-1 text-emerald-200">{lead.whatsapp || "WhatsApp no confirmado"}</p>{lead.website && <a href={lead.website} target="_blank" rel="noreferrer" className="mt-1 block text-cyan-200">Web</a>}</td><td className="p-3 text-xs text-white/60">{lead.city || "-"}<br />{lead.province || "-"}<br />{lead.country}</td><td className="p-3 text-xs text-white/65"><strong className="text-white">{lead.googleRating || "-"}</strong><br />{Number(lead.googleReviews || 0).toLocaleString("es-ES")} reseñas</td><td className="p-3"><input value={lead.workedBy} onChange={(e) => updateLead(lead.id, { workedBy: e.target.value })} placeholder="Nombre" className="input-dark min-w-36 px-3 py-2 text-xs" /></td><td className="p-3"><select value={lead.status} onChange={(e) => updateLead(lead.id, { status: e.target.value as LeadStatus })} className="input-dark min-w-36 px-3 py-2 text-xs capitalize">{statuses.map((item) => <option key={item}>{item}</option>)}</select></td><td className="p-3"><input value={lead.lastContact} type="date" onChange={(e) => updateLead(lead.id, { lastContact: e.target.value })} className="input-dark min-w-36 px-3 py-2 text-xs" /></td><td className="rounded-r-3xl p-3"><button onClick={() => setEditing(lead)} className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs text-white/75">Editar</button></td></tr>))}</tbody></table>{!filteredLeads.length && <p className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-center text-sm text-white/50">No hay negocios con estos filtros.</p>}</div></Panel></section>
      </div>
    </main>
  );
}

function Metric({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: number | string; helper: string }) { return <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/10 backdrop-blur-xl"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100">{icon}</div><p className="text-sm text-white/45">{label}</p><p className="mt-1 text-3xl font-semibold">{value}</p><p className="mt-1 text-xs text-white/35">{helper}</p></div>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/10 backdrop-blur-xl"><h2 className="mb-5 text-xl font-semibold">{title}</h2>{children}</div>; }
