"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Send } from "lucide-react";

export default function ContactoPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [type, setType] = useState("Información");
  const [message, setMessage] = useState("");

  const submitContact = async () => {
    if (!name || !email || !message) {
      alert("Rellena nombre, email y mensaje");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("contacts").insert({
      name,
      email,
      phone,
      company,
      type,
      message,
      status: "Nuevo",
    });

    if (error) {
      alert(`Error enviando contacto: ${error.message}`);
    } else {
      setSent(true);
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setType("Información");
      setMessage("");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f3e8ff_0%,#ffffff_35%,#f8fafc_100%)] px-6 py-8 text-neutral-950">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold">
            Flowly IA
          </Link>

          <Link
            href="/"
            className="rounded-full border border-neutral-200 bg-white px-5 py-2 text-sm"
          >
            Volver
          </Link>
        </header>

        <section className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-medium text-violet-600">
              Contacto Flowly IA
            </p>

            <h1 className="mt-4 text-5xl font-semibold tracking-tight">
              Hablemos de tu negocio
            </h1>

            <p className="mt-6 text-lg leading-8 text-neutral-600">
              Cuéntanos qué necesitas: información comercial, soporte,
              incidencias, una demo personalizada o una propuesta para tu
              negocio.
            </p>

            <div className="mt-8 rounded-3xl border border-white bg-white/70 p-6 shadow-sm backdrop-blur">
              <p className="font-medium">Qué puedes solicitar</p>
              <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                <li>· Información sobre Flowly IA</li>
                <li>· Presupuesto personalizado</li>
                <li>· Demo para peluquerías, estética, uñas o academias</li>
                <li>· Incidencias o soporte</li>
              </ul>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white bg-white p-6 shadow-xl shadow-violet-100">
            {sent ? (
              <div className="py-12 text-center">
                <h2 className="text-2xl font-semibold">
                  Mensaje enviado correctamente
                </h2>
                <p className="mt-3 text-neutral-600">
                  Hemos recibido tu solicitud. Te contactaremos lo antes posible.
                </p>

                <button
                  onClick={() => setSent(false)}
                  className="mt-8 rounded-full bg-neutral-950 px-6 py-3 text-white"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold">Formulario de contacto</h2>

                <div className="mt-6 grid gap-4">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre"
                    className="rounded-2xl border px-4 py-3 outline-none"
                  />

                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    type="email"
                    className="rounded-2xl border px-4 py-3 outline-none"
                  />

                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Teléfono"
                    className="rounded-2xl border px-4 py-3 outline-none"
                  />

                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nombre del negocio"
                    className="rounded-2xl border px-4 py-3 outline-none"
                  />

                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="rounded-2xl border px-4 py-3 outline-none"
                  >
                    <option>Información</option>
                    <option>Comercial</option>
                    <option>Solicitar demo</option>
                    <option>Presupuesto</option>
                    <option>Incidencia</option>
                    <option>Soporte</option>
                  </select>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Cuéntanos qué necesitas"
                    className="min-h-32 rounded-2xl border px-4 py-3 outline-none"
                  />
                </div>

                <button
                  onClick={submitContact}
                  disabled={loading}
                  className="mt-6 w-full rounded-full bg-neutral-950 px-6 py-4 text-white"
                >
                  <Send size={16} className="inline" />{" "}
                  {loading ? "Enviando..." : "Enviar contacto"}
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
