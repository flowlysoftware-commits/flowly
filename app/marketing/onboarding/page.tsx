"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Send, Sparkles } from "lucide-react";

export default function MarketingOnboardingPage() {
  const [sessionId, setSessionId] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    contactName: "", email: "", phone: "", businessName: "", sector: "", instagramUrl: "", facebookUrl: "", websiteUrl: "", objectives: "", brandTone: "Profesional y cercano", targetCustomer: "", offers: "", notes: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSessionId(params.get("session_id") || "");
  }, []);

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    if (!sessionId) return alert("Falta la sesión de pago. Vuelve desde el enlace de compra.");
    if (!form.contactName || !form.email || !form.businessName || !form.objectives) return alert("Rellena nombre, email, negocio y objetivos.");
    setLoading(true);
    const res = await fetch("/api/marketing/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, sessionId }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return alert(data.error || "No se pudo guardar");
    setSent(true);
  };

  return (
    <main className="flowly-public min-h-screen px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between rounded-full flowly-glass px-5 py-3"><Link href="/" className="font-semibold">Flowly IA</Link><Link href="/marketing" className="flowly-chip rounded-full px-4 py-2 text-sm">Marketing</Link></header>
        <section className="flowly-glass rounded-[2.2rem] p-6 md:p-8">
          {sent ? <div className="py-16 text-center"><CheckCircle2 className="mx-auto text-emerald-300" size={64} /><h1 className="mt-5 text-4xl font-semibold">Briefing recibido</h1><p className="mx-auto mt-4 max-w-xl text-white/60">Ya tenemos la información inicial. El equipo de Flowly revisará tu negocio y preparará el flujo de trabajo de marketing.</p><Link href="/" className="flowly-primary mt-8 inline-flex rounded-full px-6 py-3 font-semibold">Volver a Flowly</Link></div> : <>
            <div className="mb-8"><div className="flowly-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"><Sparkles size={16} /> Briefing inicial</div><h1 className="mt-5 text-4xl font-semibold md:text-6xl">Cuéntanos tu negocio para activar marketing.</h1><p className="mt-4 text-white/60">Esta información aparecerá en admin para planificar publicaciones, campañas y automatizaciones.</p></div>
            <div className="grid gap-4 md:grid-cols-2">
              <input className="flowly-input-light rounded-2xl px-4 py-3" placeholder="Nombre completo" value={form.contactName} onChange={(e) => update("contactName", e.target.value)} />
              <input className="flowly-input-light rounded-2xl px-4 py-3" placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} />
              <input className="flowly-input-light rounded-2xl px-4 py-3" placeholder="Teléfono" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              <input className="flowly-input-light rounded-2xl px-4 py-3" placeholder="Nombre del negocio" value={form.businessName} onChange={(e) => update("businessName", e.target.value)} />
              <select className="flowly-input-light rounded-2xl px-4 py-3" value={form.sector} onChange={(e) => update("sector", e.target.value)}><option value="">Tipo de negocio</option><option>Clínica</option><option>Peluquería / Barbería</option><option>Estética</option><option>Restaurante</option><option>Comercio</option><option>Servicios</option><option>Otro</option></select>
              <select className="flowly-input-light rounded-2xl px-4 py-3" value={form.brandTone} onChange={(e) => update("brandTone", e.target.value)}><option>Profesional y cercano</option><option>Juvenil y atrevido</option><option>Premium y elegante</option><option>Educativo</option><option>Promocional directo</option></select>
              <input className="flowly-input-light rounded-2xl px-4 py-3" placeholder="Instagram URL" value={form.instagramUrl} onChange={(e) => update("instagramUrl", e.target.value)} />
              <input className="flowly-input-light rounded-2xl px-4 py-3" placeholder="Facebook URL" value={form.facebookUrl} onChange={(e) => update("facebookUrl", e.target.value)} />
              <input className="flowly-input-light rounded-2xl px-4 py-3 md:col-span-2" placeholder="Web del negocio" value={form.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)} />
              <textarea className="flowly-input-light min-h-28 rounded-2xl px-4 py-3 md:col-span-2" placeholder="Objetivos: más citas, más ventas, marca, lanzamiento, promociones..." value={form.objectives} onChange={(e) => update("objectives", e.target.value)} />
              <textarea className="flowly-input-light min-h-24 rounded-2xl px-4 py-3" placeholder="Cliente ideal / público objetivo" value={form.targetCustomer} onChange={(e) => update("targetCustomer", e.target.value)} />
              <textarea className="flowly-input-light min-h-24 rounded-2xl px-4 py-3" placeholder="Ofertas, servicios o productos principales" value={form.offers} onChange={(e) => update("offers", e.target.value)} />
              <textarea className="flowly-input-light min-h-24 rounded-2xl px-4 py-3 md:col-span-2" placeholder="Notas, referencias, colores, competencia, ideas..." value={form.notes} onChange={(e) => update("notes", e.target.value)} />
            </div>
            <button onClick={submit} disabled={loading} className="flowly-primary mt-6 w-full rounded-full px-6 py-4 font-semibold"><Send size={16} className="inline" /> {loading ? "Guardando..." : "Enviar briefing"}</button>
          </>}
        </section>
      </div>
    </main>
  );
}
