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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ede9fe_0%,#ffffff_35%,#f8fafc_100%)] px-6 py-8 text-neutral-950">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-violet-600">
            Flowly IA · Administración
          </p>
          <h1 className="mt-2 text-4xl font-semibold">Clientes y contactos</h1>
          <p className="mt-2 text-neutral-600">
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
                  ? "rounded-full bg-neutral-950 px-5 py-3 text-sm text-white"
                  : "rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm text-neutral-600"
              }
            >
              {tab}
            </button>
          ))}
        </section>

        <section className="rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-neutral-500">
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
                  <tr key={contact.id} className="border-t">
                    <td className="p-4">
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-xs text-neutral-500">{contact.email}</p>
                      <p className="text-xs text-neutral-500">
                        {contact.phone || "Sin teléfono"}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {contact.company || "Sin negocio"}
                      </p>
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-violet-50 px-3 py-1 text-xs text-violet-700">
                        {contact.type}
                      </span>
                    </td>

                    <td className="max-w-md p-4 text-neutral-600">
                      {contact.message}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs">
                        {contact.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => updateStatus(contact.id, "En gestión")}
                          className="rounded-full border border-orange-200 px-3 py-2 text-xs text-orange-700"
                        >
                          <Clock size={14} className="inline" /> Gestionar
                        </button>

                        <button
                          onClick={() => updateStatus(contact.id, "Convertido")}
                          className="rounded-full border border-green-200 px-3 py-2 text-xs text-green-700"
                        >
                          <CheckCircle2 size={14} className="inline" /> Convertido
                        </button>

                        <button
                          onClick={() => updateStatus(contact.id, "Descartado")}
                          className="rounded-full border border-red-200 px-3 py-2 text-xs text-red-700"
                        >
                          <XCircle size={14} className="inline" /> Descartar
                        </button>

                        <a
                          href={`mailto:${contact.email}?subject=Flowly IA&body=Hola ${contact.name}, hemos recibido tu solicitud.`}
                          className="rounded-full border px-3 py-2 text-xs"
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
              <div className="p-10 text-center text-neutral-500">
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
    <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
        <UserRound size={22} />
      </div>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
