"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle2, Clock, XCircle, UserRound } from "lucide-react";

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  type: string;
  message: string;
  status: string;
  notes: string | null;
  created_at: string;
};

export default function ClientesPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeTab, setActiveTab] = useState("Nuevos");

  const loadContacts = async () => {
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    setContacts(data || []);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("contacts").update({ status }).eq("id", id);
    await loadContacts();
  };

  const nuevos = contacts.filter((c) => c.status === "Nuevo");
  const enGestion = contacts.filter((c) => c.status === "En gestión");
  const convertidos = contacts.filter((c) => c.status === "Convertido");
  const descartados = contacts.filter((c) => c.status === "Descartado");

  const visibleContacts =
    activeTab === "Nuevos"
      ? nuevos
      : activeTab === "En gestión"
      ? enGestion
      : activeTab === "Convertidos"
      ? convertidos
      : descartados;

  return (
    <main className="flowly-app-shell px-6 py-8 text-white">
      <div className="flowly-app-content mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-cyan-200">
            Flowly IA · Administración
          </p>
          <h1 className="mt-2 text-4xl font-semibold">Clientes y contactos</h1>
          <p className="mt-2 text-white/60">
            Gestiona formularios recibidos, leads comerciales, incidencias y
            solicitudes de demo.
          </p>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <Card label="Nuevos" value={nuevos.length} />
          <Card label="En gestión" value={enGestion.length} />
          <Card label="Convertidos" value={convertidos.length} />
          <Card label="Descartados" value={descartados.length} />
        </section>

        <section className="mb-4 flex flex-wrap gap-3">
          {["Nuevos", "En gestión", "Convertidos", "Descartados"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                activeTab === tab
                  ? "flowly-app-button flowly-app-button-active px-5 py-3 text-sm"
                  : "flowly-app-button px-5 py-3 text-sm"
              }
            >
              {tab}
            </button>
          ))}
        </section>

        <section className="flowly-app-panel rounded-[2rem] p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-white/45">
                <tr>
                  <th className="p-4">Contacto</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Mensaje</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {visibleContacts.map((contact) => (
                  <tr key={contact.id} className="flowly-soft-row border-t">
                    <td className="p-4">
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-xs text-white/45">{contact.email}</p>
                      <p className="text-xs text-white/45">
                        {contact.phone || "Sin teléfono"}
                      </p>
                      <p className="text-xs text-white/45">
                        {contact.company || "Sin negocio"}
                      </p>
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-100">
                        {contact.type}
                      </span>
                    </td>

                    <td className="max-w-md p-4 text-white/60">
                      {contact.message}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                        {contact.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => updateStatus(contact.id, "En gestión")}
                          className="rounded-full border border-orange-300/30 bg-orange-500/10 px-3 py-2 text-xs text-orange-100"
                        >
                          <Clock size={14} className="inline" /> Gestionar
                        </button>

                        <button
                          onClick={() => updateStatus(contact.id, "Convertido")}
                          className="rounded-full border border-green-300/30 bg-green-500/10 px-3 py-2 text-xs text-green-100"
                        >
                          <CheckCircle2 size={14} className="inline" /> Convertido
                        </button>

                        <button
                          onClick={() => updateStatus(contact.id, "Descartado")}
                          className="rounded-full border border-red-300/30 bg-red-500/10 px-3 py-2 text-xs text-red-100"
                        >
                          <XCircle size={14} className="inline" /> Descartar
                        </button>

                        <a
                          href={`mailto:${contact.email}?subject=Flowly IA&body=Hola ${contact.name}, hemos recibido tu solicitud.`}
                          className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-white/70"
                        >
                          Responder
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {visibleContacts.length === 0 && (
              <div className="p-10 text-center text-white/45">
                No hay contactos en esta pestaña.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flowly-app-metric rounded-3xl p-6">
      <div className="flowly-app-icon mb-4 flex h-11 w-11 items-center justify-center rounded-2xl">
        <UserRound size={22} />
      </div>
      <p className="text-sm text-white/45">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
