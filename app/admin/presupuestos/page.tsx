"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { supabase } from "@/lib/supabaseClient";
import { BudgetPDF, type BudgetItem } from "./pdf";
import { CheckCircle2, FileText, Plus, Send, XCircle } from "lucide-react";

type Tab = "Pendientes" | "Aceptados" | "Rechazados";
type Budget = { id: string; client_name: string; client_email: string; phone: string | null; business_type: string | null; service: string; amount: number; status: string; rejection_reason: string | null; notes: string | null; pdf_url: string | null; created_at: string; };
type PlanKey = "basic" | "premium" | "modular" | "enterprise";
type PlanOption = { key: PlanKey; name: string; price: number; description: string; included: string[]; };
type ModuleOption = { key: string; name: string; price: number; description: string; };

const plans: PlanOption[] = [
  { key: "basic", name: "Flowly Basic", price: 29.99, description: "Para negocios pequeños que necesitan agenda, clientes y reservas online.", included: ["Dashboard", "Clientes", "Reservas online", "Servicios", "Agenda básica"] },
  { key: "premium", name: "Flowly Premium", price: 59.99, description: "La opción recomendada para vender una solución completa desde el primer día.", included: ["Todo Basic", "Facturación", "CRM avanzado", "Estadísticas", "Automatizaciones"] },
  { key: "modular", name: "Flowly Modular", price: 19.99, description: "Base flexible para construir una propuesta personalizada por módulos.", included: ["Dashboard", "Clientes", "Reservas", "Servicios", "Agenda"] },
  { key: "enterprise", name: "Flowly Enterprise", price: 0, description: "Solución personalizada para cadenas, equipos grandes y necesidades avanzadas.", included: ["Proyecto a medida", "Soporte prioritario", "Configuración personalizada"] },
];

const modules: ModuleOption[] = [
  { key: "whatsapp", name: "WhatsApp automático", price: 9.99, description: "Recordatorios, confirmaciones y mensajes automatizados." },
  { key: "facturacion", name: "Facturación PRO", price: 9.99, description: "Ingresos, gastos, proveedores, presupuestos y control financiero." },
  { key: "tpv", name: "TPV", price: 14.99, description: "Caja, tickets, ventas presenciales y control diario." },
  { key: "crm", name: "CRM avanzado", price: 9.99, description: "Filtros, notas, seguimiento comercial y oportunidades." },
  { key: "marketing", name: "Marketing", price: 9.99, description: "Campañas, promociones y preparación para Ads." },
  { key: "ia", name: "IA Assistant", price: 14.99, description: "Capa inteligente para análisis, recomendaciones y automatización." },
  { key: "estadisticas", name: "Estadísticas avanzadas", price: 4.99, description: "KPIs, rendimiento, ingresos previstos y evolución." },
  { key: "reservas-premium", name: "Reservas Premium", price: 4.99, description: "Reglas avanzadas, bloqueos y experiencia de reserva mejorada." },
  { key: "voice", name: "Flowly Voice", price: 29.99, description: "Preparado para centralita IA, llamadas y agendado por voz." },
];

const businessTypes = ["Peluquería", "Barbería", "Estética", "Clínica", "Fisioterapia", "Restaurante", "Academia", "Otro"];

export default function PresupuestosPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("Pendientes");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("Peluquería");
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("premium");
  const [selectedModules, setSelectedModules] = useState<string[]>(["facturacion", "crm", "estadisticas"]);
  const [installation, setInstallation] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("Promoción especial: primer mes gratis. Sin permanencia.");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const weeklyBudgetGoal = 10;
  const monthlyClosedGoal = 5;

  const loadBudgets = async () => {
    const { data } = await supabase.from("budgets").select("*").order("created_at", { ascending: false });
    setBudgets(data || []);
  };

  useEffect(() => { loadBudgets(); }, []);

  const selectedPlanData = plans.find((plan) => plan.key === selectedPlan) || plans[1];
  const selectedModuleData = modules.filter((module) => selectedModules.includes(module.key));
  const monthlySubtotal = selectedPlanData.price + selectedModuleData.reduce((sum, module) => sum + module.price, 0);
  const discountAmount = Number(discount || 0);
  const monthlyTotal = Math.max(monthlySubtotal - discountAmount, 0);
  const installationTotal = Number(installation || 0);
  const budgetItems: BudgetItem[] = [
    { name: selectedPlanData.name, description: selectedPlanData.description, price: selectedPlanData.price, type: "Mensual" },
    ...selectedModuleData.map((module) => ({ name: module.name, description: module.description, price: module.price, type: "Mensual" as const })),
    ...(discountAmount > 0 ? [{ name: "Descuento comercial", description: "Descuento aplicado a la cuota mensual.", price: -discountAmount, type: "Mensual" as const }] : []),
    { name: "Instalación y configuración inicial", description: installationTotal === 0 ? "Promoción actual: instalación incluida." : "Puesta en marcha, configuración inicial y acompañamiento.", price: installationTotal, type: "Único" },
  ];
  const serviceSummary = `${selectedPlanData.name}${selectedModuleData.length ? ` + ${selectedModuleData.map((module) => module.name).join(", ")}` : ""}`;

  const toggleModule = (moduleKey: string) => setSelectedModules((current) => current.includes(moduleKey) ? current.filter((item) => item !== moduleKey) : [...current, moduleKey]);
  const setPlan = (plan: PlanKey) => {
    setSelectedPlan(plan);
    if (plan === "basic") setSelectedModules([]);
    if (plan === "premium") setSelectedModules(["facturacion", "crm", "estadisticas"]);
    if (plan === "enterprise") setSelectedModules(["whatsapp", "facturacion", "tpv", "crm", "marketing", "ia", "estadisticas", "reservas-premium"]);
  };

  const now = new Date();
  const startOfWeek = useMemo(() => { const date = new Date(now); const day = date.getDay() || 7; date.setDate(date.getDate() - day + 1); date.setHours(0, 0, 0, 0); return date; }, []);
  const startOfMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 1), []);
  const weeklyCreated = budgets.filter((budget) => new Date(budget.created_at) >= startOfWeek).length;
  const monthlyAccepted = budgets.filter((budget) => budget.status === "Aceptado" && new Date(budget.created_at) >= startOfMonth).length;
  const pendingBudgets = budgets.filter((budget) => budget.status !== "Aceptado" && budget.status !== "Rechazado");
  const acceptedBudgets = budgets.filter((budget) => budget.status === "Aceptado");
  const rejectedBudgets = budgets.filter((budget) => budget.status === "Rechazado");
  const visibleBudgets = activeTab === "Pendientes" ? pendingBudgets : activeTab === "Aceptados" ? acceptedBudgets : rejectedBudgets;

  const createBudget = async () => {
    if (!client || !email || !selectedPlanData) return alert("Faltan datos del cliente o del plan");
    setLoading(true);
    try {
      const logoUrl = typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "/logo.png";
      const blob = await pdf(<BudgetPDF client={client} email={email} phone={phone} businessType={businessType} service={serviceSummary} monthly={monthlyTotal.toFixed(2)} installation={installationTotal.toFixed(2)} notes={notes} planName={selectedPlanData.name} items={budgetItems} logoUrl={logoUrl} monthlySubtotal={monthlySubtotal.toFixed(2)} discount={discountAmount.toFixed(2)} />).toBlob();
      const pdfPath = `budget-${crypto.randomUUID()}.pdf`;
      const pdfBytes = new Uint8Array(await blob.arrayBuffer());
      const { error: uploadError } = await supabase.storage.from("budgets").upload(pdfPath, pdfBytes, { contentType: "application/pdf", upsert: true });
      if (uploadError) { alert(`Error subiendo PDF: ${uploadError.message}`); setLoading(false); return; }
      const { data: publicData } = supabase.storage.from("budgets").getPublicUrl(pdfPath);
      const budgetNotes = [notes, "", "Resumen automático:", `Plan: ${selectedPlanData.name}`, `Módulos: ${selectedModuleData.length ? selectedModuleData.map((module) => module.name).join(", ") : "Sin módulos adicionales"}`, `Subtotal mensual: ${monthlySubtotal.toFixed(2)} €`, `Descuento mensual: ${discountAmount.toFixed(2)} €`, `Total mensual: ${monthlyTotal.toFixed(2)} €`, `Instalación: ${installationTotal.toFixed(2)} €`].join("\n");
      const { error } = await supabase.from("budgets").insert({ client_name: client, client_email: email, phone, business_type: businessType, service: serviceSummary, amount: Number(monthlyTotal.toFixed(2)), status: "Borrador", notes: budgetNotes, pdf_path: pdfPath, pdf_url: publicData.publicUrl, file_name: `${client}.pdf`, file_path: pdfPath, file_url: publicData.publicUrl });
      if (error) alert(`Error guardando presupuesto: ${error.message}`);
      else { setOpen(false); setClient(""); setEmail(""); setPhone(""); setBusinessType("Peluquería"); setSelectedPlan("premium"); setSelectedModules(["facturacion", "crm", "estadisticas"]); setInstallation("0"); setDiscount("0"); setNotes("Promoción especial: primer mes gratis. Sin permanencia."); await loadBudgets(); setActiveTab("Pendientes"); }
    } catch (error) { console.error(error); alert("Error generando el presupuesto"); }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => { await supabase.from("budgets").update({ status }).eq("id", id); await loadBudgets(); if (status === "Aceptado") setActiveTab("Aceptados"); };
  const rejectBudget = async () => { if (!rejectingId || !rejectionReason) return alert("Escribe el motivo del rechazo"); await supabase.from("budgets").update({ status: "Rechazado", rejection_reason: rejectionReason }).eq("id", rejectingId); setRejectingId(null); setRejectionReason(""); await loadBudgets(); setActiveTab("Rechazados"); };
  const pendingValue = pendingBudgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
  const acceptedValue = acceptedBudgets.reduce((sum, budget) => sum + Number(budget.amount), 0);

  return (
    <main className="min-h-screen bg-[#070711] px-6 py-8 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,.55),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,.18),transparent_30%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="relative mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div><div className="mb-5 flex items-center gap-3"><Image src="/logo.png" alt="Flowly IA" width={150} height={42} priority /><span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-violet-100">Administración</span></div><h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Presupuestos inteligentes</h1><p className="mt-3 max-w-2xl text-white/60">Crea propuestas profesionales seleccionando planes, módulos y condiciones. El PDF se genera automáticamente con el logo y el desglose completo.</p></div>
          <button onClick={() => setOpen(true)} className="rounded-full bg-white px-5 py-3 font-medium text-neutral-950 shadow-xl shadow-violet-950/30"><Plus size={18} className="inline" /> Nuevo presupuesto</button>
        </header>
        <section className="mb-8 grid gap-4 md:grid-cols-4"><Card label="Pendientes" value={pendingBudgets.length} /><Card label="Aceptados" value={acceptedBudgets.length} /><Card label="Rechazados" value={rejectedBudgets.length} /><Card label="Valor aceptado mensual" value={`${acceptedValue.toFixed(2)} €`} /></section>
        <section className="mb-8 grid gap-4 md:grid-cols-2"><GoalCard title="Objetivo semanal" subtitle="Presupuestos creados esta semana" current={weeklyCreated} goal={weeklyBudgetGoal} /><GoalCard title="Objetivo mensual" subtitle="Presupuestos cerrados este mes" current={monthlyAccepted} goal={monthlyClosedGoal} /></section>
        <section className="mb-4 flex flex-wrap gap-3"><TabButton label={`Pendientes (${pendingBudgets.length})`} active={activeTab === "Pendientes"} onClick={() => setActiveTab("Pendientes")} /><TabButton label={`Aceptados (${acceptedBudgets.length})`} active={activeTab === "Aceptados"} onClick={() => setActiveTab("Aceptados")} /><TabButton label={`Rechazados (${rejectedBudgets.length})`} active={activeTab === "Rechazados"} onClick={() => setActiveTab("Rechazados")} /></section>
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{activeTab}</h2>{activeTab === "Pendientes" && <p className="text-sm text-white/50">Valor pendiente: {pendingValue.toFixed(2)} €</p>}</div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-white/45"><tr><th className="p-4">Cliente</th><th className="p-4">Propuesta</th><th className="p-4">Mensualidad</th><th className="p-4">PDF</th><th className="p-4">Estado</th>{activeTab === "Rechazados" && <th className="p-4">Motivo</th>}{activeTab !== "Rechazados" && <th className="p-4">Acciones</th>}</tr></thead><tbody>{visibleBudgets.map((budget) => (<tr key={budget.id} className="border-t border-white/10"><td className="p-4"><p className="font-medium">{budget.client_name}</p><p className="text-xs text-white/45">{budget.client_email}</p></td><td className="max-w-md p-4 text-white/70">{budget.service}</td><td className="p-4 font-semibold">{Number(budget.amount).toFixed(2)} €</td><td className="p-4">{budget.pdf_url ? <a href={budget.pdf_url} target="_blank" className="text-violet-200 underline">Ver PDF</a> : <span className="text-white/40">Sin PDF</span>}</td><td className="p-4"><span className="rounded-full bg-white/10 px-3 py-1 text-xs">{budget.status}</span></td>{activeTab === "Rechazados" ? <td className="max-w-xs p-4 text-sm text-white/55">{budget.rejection_reason || "Sin motivo indicado"}</td> : <td className="p-4"><div className="flex flex-wrap gap-2">{activeTab === "Pendientes" && <a href={`mailto:${budget.client_email}?subject=Presupuesto Flowly IA&body=Hola ${budget.client_name}, te enviamos tu presupuesto personalizado:%0A%0A${budget.pdf_url || ""}`} onClick={() => updateStatus(budget.id, "Enviado")} className="rounded-full border border-white/15 px-3 py-2 text-xs"><Send size={14} className="inline" /> Enviar</a>}<button onClick={() => updateStatus(budget.id, "Aceptado")} className="rounded-full border border-green-300/30 px-3 py-2 text-xs text-green-200"><CheckCircle2 size={14} className="inline" /> Aceptado</button><button onClick={() => setRejectingId(budget.id)} className="rounded-full border border-red-300/30 px-3 py-2 text-xs text-red-200"><XCircle size={14} className="inline" /> Rechazado</button></div></td>}</tr>))}</tbody></table>{visibleBudgets.length === 0 && <div className="p-10 text-center text-white/45">No hay presupuestos en esta pestaña.</div>}</div></section>
      </div>

      {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"><div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0b0b16] p-6 text-white shadow-2xl"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><div className="mb-4 flex items-center gap-3"><Image src="/logo.png" alt="Flowly IA" width={130} height={38} /><span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-100">Constructor de propuestas</span></div><h2 className="text-3xl font-semibold">Nuevo presupuesto</h2><p className="mt-2 text-sm text-white/55">Selecciona el pack, los módulos y las condiciones. El PDF saldrá con el desglose completo.</p></div><div className="rounded-3xl bg-white p-5 text-neutral-950"><p className="text-sm text-neutral-500">Total mensual</p><p className="text-3xl font-semibold">{monthlyTotal.toFixed(2)} €</p><p className="mt-1 text-xs text-neutral-500">Instalación: {installationTotal.toFixed(2)} €</p></div></div><div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_.95fr]"><div className="space-y-6"><Section title="Datos del cliente"><div className="grid gap-3 md:grid-cols-2"><Input label="Cliente" value={client} setValue={setClient} /><Input label="Email" value={email} setValue={setEmail} /><Input label="Teléfono" value={phone} setValue={setPhone} /><select value={businessType} onChange={(event) => setBusinessType(event.target.value)} className="input-dark">{businessTypes.map((type) => <option key={type}>{type}</option>)}</select></div></Section><Section title="Selecciona un pack"><div className="grid gap-3 md:grid-cols-2">{plans.map((plan) => <button key={plan.key} onClick={() => setPlan(plan.key)} className={selectedPlan === plan.key ? "rounded-3xl border border-violet-300 bg-violet-500/20 p-5 text-left" : "rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-left hover:bg-white/[0.08]"}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{plan.name}</p><p className="mt-1 text-sm text-white/55">{plan.description}</p></div><p className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-sm font-semibold text-neutral-950">{plan.price > 0 ? `${plan.price.toFixed(2)} €` : "A medida"}</p></div><div className="mt-4 flex flex-wrap gap-2">{plan.included.map((item) => <span key={item} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/65">{item}</span>)}</div></button>)}</div></Section><Section title="Añade módulos"><div className="grid gap-3 md:grid-cols-2">{modules.map((module) => { const active = selectedModules.includes(module.key); return <button key={module.key} onClick={() => toggleModule(module.key)} className={active ? "rounded-3xl border border-violet-300 bg-violet-500/20 p-4 text-left" : "rounded-3xl border border-white/10 bg-white/[0.05] p-4 text-left hover:bg-white/[0.08]"}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{module.name}</p><p className="mt-1 text-sm text-white/50">{module.description}</p></div><span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-neutral-950">+{module.price.toFixed(2)} €</span></div></button>; })}</div></Section></div><div className="space-y-6"><Section title="Condiciones comerciales"><div className="grid gap-3"><Input label="Instalación" value={installation} setValue={setInstallation} /><Input label="Descuento mensual" value={discount} setValue={setDiscount} /><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notas del presupuesto" className="input-dark min-h-32" /></div></Section><Section title="Resumen de la propuesta"><div className="space-y-3">{budgetItems.map((item) => <div key={`${item.name}-${item.type}`} className="rounded-2xl bg-black/25 p-4"><div className="flex justify-between gap-3"><div><p className="font-medium">{item.name}</p><p className="mt-1 text-xs text-white/45">{item.description}</p></div><div className="text-right"><p className="font-semibold">{item.price.toFixed(2)} €</p><p className="text-xs text-white/40">{item.type}</p></div></div></div>)}</div><div className="mt-5 rounded-3xl bg-white p-5 text-neutral-950"><div className="flex justify-between text-sm"><span>Subtotal mensual</span><strong>{monthlySubtotal.toFixed(2)} €</strong></div><div className="mt-2 flex justify-between text-sm"><span>Descuento</span><strong>-{discountAmount.toFixed(2)} €</strong></div><div className="mt-4 flex justify-between border-t pt-4 text-lg"><span>Total mensual</span><strong>{monthlyTotal.toFixed(2)} €</strong></div></div></Section><div className="flex justify-end gap-3"><button onClick={() => setOpen(false)} className="rounded-full border border-white/15 px-5 py-3">Cancelar</button><button onClick={createBudget} disabled={loading} className="rounded-full bg-white px-5 py-3 font-medium text-neutral-950 disabled:opacity-60"><FileText size={16} className="inline" /> {loading ? "Generando..." : "Crear PDF y guardar"}</button></div></div></div></div></div>}

      {rejectingId && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"><div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#0b0b16] p-6 text-white shadow-2xl"><h2 className="text-2xl font-semibold">Motivo del rechazo</h2><textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Ejemplo: precio alto, no interesado, ya tiene otro proveedor..." className="input-dark mt-6 min-h-32 w-full" /><div className="mt-6 flex justify-end gap-3"><button onClick={() => { setRejectingId(null); setRejectionReason(""); }} className="rounded-full border border-white/15 px-5 py-3">Cancelar</button><button onClick={rejectBudget} className="rounded-full bg-red-600 px-5 py-3 text-white">Confirmar rechazo</button></div></div></div>}
    </main>
  );
}

function Card({ label, value }: { label: string; value: string | number }) { return <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"><p className="text-sm text-white/50">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>; }
function GoalCard({ title, subtitle, current, goal }: { title: string; subtitle: string; current: number; goal: number }) { const percentage = Math.min((current / goal) * 100, 100); return <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"><p className="text-sm font-medium text-violet-200">{title}</p><h3 className="mt-2 text-xl font-semibold">{subtitle}</h3><p className="mt-4 text-3xl font-semibold">{current}/{goal}</p><div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-violet-400" style={{ width: `${percentage}%` }} /></div><p className="mt-3 text-sm text-white/45">{percentage.toFixed(0)}% completado</p></div>; }
function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) { return <button onClick={onClick} className={active ? "rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950" : "rounded-full border border-white/10 bg-white/[0.07] px-5 py-3 text-sm text-white/60"}>{label}</button>; }
function Input({ label, value, setValue }: { label: string; value: string; setValue: (value: string) => void }) { return <input value={value} onChange={(event) => setValue(event.target.value)} placeholder={label} className="input-dark" />; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5"><h3 className="mb-4 text-lg font-semibold">{title}</h3>{children}</section>; }
