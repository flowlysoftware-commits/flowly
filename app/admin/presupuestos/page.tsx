"use client";

import { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { supabase } from "@/lib/supabaseClient";
import { BudgetPDF } from "./pdf";
import { Plus, Send, CheckCircle2, XCircle, FileText } from "lucide-react";

type Budget = {
  id: string;
  client_name: string;
  client_email: string;
  phone: string | null;
  business_type: string | null;
  service: string;
  amount: number;
  status: string;
  notes: string | null;
  pdf_url: string | null;
  created_at: string;
};

export default function PresupuestosPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [client, setClient] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("Peluquería");
  const [service, setService] = useState("Panel Flowly Hair + Centralita");
  const [monthly, setMonthly] = useState("84.99");
  const [installation, setInstallation] = useState("0");
  const [notes, setNotes] = useState("Promoción especial: primer mes gratis.");

  const loadBudgets = async () => {
    const { data } = await supabase
      .from("budgets")
      .select("*")
      .order("created_at", { ascending: false });

    setBudgets(data || []);
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const createBudget = async () => {
    if (!client || !email || !service || !monthly) return alert("Faltan datos");

    setLoading(true);

    const blob = await pdf(
      <BudgetPDF
        client={client}
        email={email}
        phone={phone}
        businessType={businessType}
        service={service}
        monthly={monthly}
        installation={installation}
        notes={notes}
      />
    ).toBlob();

    const safeClientName = client
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "");

const pdfPath = `${Date.now()}-${safeClientName}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("budgets")
      .upload(pdfPath, blob, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      alert(`Error subiendo PDF: ${uploadError.message}`);
      setLoading(false);
      return;
    }

    const { data: publicData } = supabase.storage
      .from("budgets")
      .getPublicUrl(pdfPath);

    const { error } = await supabase.from("budgets").insert({
      client_name: client,
      client_email: email,
      phone,
      business_type: businessType,
      service,
      amount: Number(monthly),
      status: "Borrador",
      notes,
      pdf_path: pdfPath,
      pdf_url: publicData.publicUrl,
      file_name: `${client}.pdf`,
      file_path: pdfPath,
      file_url: publicData.publicUrl,
    });

    if (error) {
      alert(`Error guardando presupuesto: ${error.message}`);
    } else {
      setOpen(false);
      setClient("");
      setEmail("");
      setPhone("");
      await loadBudgets();
    }

    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("budgets").update({ status }).eq("id", id);
    await loadBudgets();
  };

  const total = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const accepted = budgets.filter((b) => b.status === "Aceptado").length;
  const sent = budgets.filter((b) => b.status === "Enviado").length;

  return (
    <main className="min-h-screen bg-[#f8f7fb] px-6 py-8 text-neutral-950">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-violet-600">
              Flowly IA · Administración
            </p>
            <h1 className="mt-2 text-4xl font-semibold">Presupuestos</h1>
            <p className="mt-2 text-neutral-600">
              Genera PDFs, envía propuestas y controla el estado comercial.
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="rounded-full bg-neutral-950 px-5 py-3 text-white"
          >
            <Plus size={18} className="inline" /> Nuevo presupuesto
          </button>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <Card label="Total presupuestos" value={budgets.length} />
          <Card label="Enviados" value={sent} />
          <Card label="Aceptados" value={accepted} />
          <Card label="Valor mensual" value={`${total.toFixed(2)} €`} />
        </section>

        <section className="rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-neutral-500">
                <tr>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Servicio</th>
                  <th className="p-4">Mensualidad</th>
                  <th className="p-4">PDF</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {budgets.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="p-4">
                      <p className="font-medium">{b.client_name}</p>
                      <p className="text-xs text-neutral-500">{b.client_email}</p>
                    </td>

                    <td className="p-4">{b.service}</td>
                    <td className="p-4 font-semibold">{Number(b.amount).toFixed(2)} €</td>

                    <td className="p-4">
                      {b.pdf_url ? (
                        <a
                          href={b.pdf_url}
                          target="_blank"
                          className="text-violet-600 underline"
                        >
                          Ver PDF
                        </a>
                      ) : (
                        "Sin PDF"
                      )}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs">
                        {b.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`mailto:${b.client_email}?subject=Presupuesto Flowly IA&body=Hola ${b.client_name}, te enviamos tu presupuesto personalizado:%0A%0A${b.pdf_url || ""}`}
                          onClick={() => updateStatus(b.id, "Enviado")}
                          className="rounded-full border px-3 py-2 text-xs"
                        >
                          <Send size={14} className="inline" /> Enviar
                        </a>

                        <button
                          onClick={() => updateStatus(b.id, "Aceptado")}
                          className="rounded-full border border-green-200 px-3 py-2 text-xs text-green-700"
                        >
                          <CheckCircle2 size={14} className="inline" /> Aceptado
                        </button>

                        <button
                          onClick={() => updateStatus(b.id, "Rechazado")}
                          className="rounded-full border border-red-200 px-3 py-2 text-xs text-red-700"
                        >
                          <XCircle size={14} className="inline" /> Rechazado
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {budgets.length === 0 && (
              <div className="p-10 text-center text-neutral-500">
                Todavía no hay presupuestos creados.
              </div>
            )}
          </div>
        </section>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold">Nuevo presupuesto</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input label="Cliente" value={client} setValue={setClient} />
              <Input label="Email" value={email} setValue={setEmail} />
              <Input label="Teléfono" value={phone} setValue={setPhone} />
              <Input label="Tipo de negocio" value={businessType} setValue={setBusinessType} />
              <Input label="Servicio" value={service} setValue={setService} />
              <Input label="Instalación" value={installation} setValue={setInstallation} />
              <Input label="Cuota mensual" value={monthly} setValue={setMonthly} />

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas del presupuesto"
                className="min-h-28 rounded-2xl border px-4 py-3 md:col-span-2"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setOpen(false)} className="rounded-full border px-5 py-3">
                Cancelar
              </button>

              <button
                onClick={createBudget}
                disabled={loading}
                className="rounded-full bg-neutral-950 px-5 py-3 text-white"
              >
                <FileText size={16} className="inline" />{" "}
                {loading ? "Generando..." : "Crear PDF y guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Input({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={label}
      className="rounded-2xl border px-4 py-3"
    />
  );
}
