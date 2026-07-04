"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { trackMetaEvent } from "@/lib/metaEvents";
import Link from "next/link";
import { CheckCircle2, Send, Sparkles } from "lucide-react";

export default function ContactoPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [type, setType] = useState("Información");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tipo = params.get("tipo");
    const mensaje = params.get("mensaje");
    if (tipo) setType(tipo);
    if (mensaje) setMessage(mensaje);
  }, []);

  const submitContact = async () => {
    if (!name || !email || !message) {
      alert("Rellena nombre, email y mensaje");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contacts").insert({ name, email, phone, company, type, message, status: "Nuevo" });
    if (error) alert(`Error enviando contacto: ${error.message}`);
    else {
      await trackMetaEvent("Lead", {
        email,
        phone,
        contentName: "Formulario de contacto Flowly",
        contentCategory: type,
      });
      setSent(true);
      setName(""); setEmail(""); setPhone(""); setCompany(""); setType("Información"); setMessage("");
    }
    setLoading(false);
  };

  return (
    <main className="flowly-public min-h-screen px-6 py-8">
      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="mb-12 flex items-center justify-between rounded-full flowly-glass px-5 py-3">
          <Link href="/" className="text-lg font-semibold">Flowly IA</Link>
          <Link href="/" className="flowly-chip rounded-full px-5 py-2 text-sm">Volver</Link>
        </header>
        <section className="grid gap-8 md:grid-cols-[.9fr_1.1fr] md:items-center">
          <div>
            <div className="flowly-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"><Sparkles size={16} /> Contacto Flowly IA</div>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight md:text-7xl">Hablemos de tu <span className="flowly-gradient-text">próximo panel</span></h1>
            <p className="mt-6 text-lg leading-8 text-white/65">Cuéntanos qué necesitas: demo, propuesta, soporte o implementación personalizada.</p>
            <div className="mt-8 grid gap-3 text-sm text-white/70 sm:grid-cols-2">
              {["Presupuesto personalizado", "Demo guiada", "Implementación clínica", "Soporte comercial"].map((item) => <div key={item} className="flowly-card rounded-2xl p-4"><CheckCircle2 className="mb-2 text-cyan-200" size={18} />{item}</div>)}
            </div>
          </div>
          <div className="flowly-glass rounded-[2rem] p-6">
            {sent ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-300 text-slate-950"><CheckCircle2 /></div>
                <h2 className="text-2xl font-semibold">Mensaje enviado</h2>
                <p className="mt-3 text-white/60">Hemos recibido tu solicitud. Te contactaremos lo antes posible.</p>
                <button onClick={() => setSent(false)} className="flowly-primary mt-8 rounded-full px-6 py-3 font-semibold">Enviar otro mensaje</button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold">Formulario de contacto</h2>
                <div className="mt-6 grid gap-4">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="flowly-input-light rounded-2xl px-4 py-3" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="flowly-input-light rounded-2xl px-4 py-3" />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" className="flowly-input-light rounded-2xl px-4 py-3" />
                  <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Nombre del negocio" className="flowly-input-light rounded-2xl px-4 py-3" />
                  <select value={type} onChange={(e) => setType(e.target.value)} className="flowly-input-light rounded-2xl px-4 py-3"><option>Información</option><option>Informacion comercial</option><option>Marketing</option><option>Comercial</option><option>Solicitar demo</option><option>Presupuesto</option><option>Incidencia</option><option>Soporte</option></select>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Cuéntanos qué necesitas" className="flowly-input-light min-h-32 rounded-2xl px-4 py-3" />
                </div>
                <button onClick={submitContact} disabled={loading} className="flowly-primary mt-6 w-full rounded-full px-6 py-4 font-semibold"><Send size={16} className="inline" /> {loading ? "Enviando..." : "Enviar contacto"}</button>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
