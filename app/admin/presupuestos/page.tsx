"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Send, Upload, CheckCircle2, XCircle } from "lucide-react";

type Budget = {
  id: string;
  client_name: string;
  client_email: string;
  service: string;
  amount: number;
  status: string;
  file_name: string | null;
  file_url: string | null;
  created_at: string;
};

export default function PresupuestosPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [service, setService] = useState("");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const loadBudgets = async () => {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setBudgets(data);
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const createBudget = async () => {
    if (!clientName || !clientEmail || !service || !amount) return;

    setLoading(true);

    let fileName = null;
    let filePath = null;
    let fileUrl = null;

    if (file) {
      fileName = file.name;
      filePath = `presupuestos/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("budgets")
        .upload(filePath, file);

      if (uploadError) {
  console.error(uploadError);
  alert(`Error subiendo archivo: ${uploadError.message}`);
  setLoading(false);
  return;
}
      const { data } = supabase.storage.from("budgets").getPublicUrl(filePath);
      fileUrl = data.publicUrl;
    }

    const { error } = await supabase.from("budgets").insert({
      client_name: clientName,
      client_email: clientEmail,
      service,
      amount: Number(amount),
      status: "Borrador",
      file_name: fileName,
      file_path: filePath,
      file_url: fileUrl,
    });

    if (error) {
      alert("Error creando presupuesto");
    } else {
      setClientName("");
      setClientEmail("");
      setService("");
      setAmount("");
      setFile(null);
      setOpen(false);
      await loadBudgets();
    }

    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("budgets").update({ status }).eq("id", id);
    await loadBudgets();
  };

  const total = budgets.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <main className="min-h-screen bg-[#f8f7fb] px-6 py-8 text-neutral-950">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-violet-600">Flowly IA · Administración</p>
            <h1 className="mt-2 text-4xl font-semibold">Presupuestos</h1>
            <p className="mt-2 text-neutral-600">Crea, sube archivos, envía y controla presupuestos.</p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="h-fit rounded-full bg-neutral-950 px-5 py-3 text-white"
          >
            <Plus className="inline" size={18} /> Nuevo presupuesto
          </button>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <Card title="Presupuestos" value={budgets.length} />
          <Card title="Aceptados" value={budgets.filter(b => b.status === "Aceptado").length} />
          <Card title="Valor total" value={`${total.toFixed(2)} €`} />
        </section>

        <section className="rounded-[2rem] bg-white p-5 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="text-neutral-500">
              <tr>
                <th className="p-4">Cliente</th>
                <th className="p-4">Servicio</th>
                <th className="p-4">Importe</th>
                <th className="p-4">Archivo</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {budgets.map((budget) => (
                <tr key={budget.id} className="border-t">
                  <td className="p-4">
                    <p className="font-medium">{budget.client_name}</p>
                    <p className="text-xs text-neutral-500">{budget.client_email}</p>
                  </td>

                  <td className="p-4">{budget.service}</td>
                  <td className="p-4 font-semibold">{Number(budget.amount).toFixed(2)} €</td>

                  <td className="p-4">
                    {budget.file_url ? (
                      <a href={budget.file_url} target="_blank" className="text-violet-600 underline">
                        Ver archivo
                      </a>
                    ) : (
                      "Sin archivo"
                    )}
                  </td>

                  <td className="p-4">
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs">
                      {budget.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <a
                        onClick={() => updateStatus(budget.id, "Enviado")}
                        href={`mailto:${budget.client_email}?subject=Presupuesto Flowly IA&body=Hola ${budget.client_name}, te enviamos tu presupuesto de Flowly IA.%0A%0A${budget.file_url || ""}`}
                        className="rounded-full border px-3 py-2 text-xs"
                      >
                        <Send size={14} className="inline" /> Enviar
                      </a>

                      <button
                        onClick={() => updateStatus(budget.id, "Aceptado")}
                        className="rounded-full border border-green-200 px-3 py-2 text-xs text-green-700"
                      >
                        <CheckCircle2 size={14} className="inline" /> Aceptado
                      </button>

                      <button
                        onClick={() => updateStatus(budget.id, "Rechazado")}
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
        </section>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold">Nuevo presupuesto</h2>

            <div className="mt-6 grid gap-4">
              <input className="rounded-2xl border px-4 py-3" placeholder="Cliente" value={clientName} onChange={(e) => setClientName(e.target.value)} />
              <input className="rounded-2xl border px-4 py-3" placeholder="Email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
              <input className="rounded-2xl border px-4 py-3" placeholder="Servicio" value={service} onChange={(e) => setService(e.target.value)} />
              <input className="rounded-2xl border px-4 py-3" placeholder="Importe" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />

              <label className="cursor-pointer rounded-2xl border border-dashed px-4 py-4 text-sm text-neutral-600">
                <Upload size={18} className="inline" /> {file ? file.name : "Subir archivo"}
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setOpen(false)} className="rounded-full border px-5 py-3">
                Cancelar
              </button>

              <button onClick={createBudget} disabled={loading} className="rounded-full bg-neutral-950 px-5 py-3 text-white">
                {loading ? "Guardando..." : "Crear presupuesto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm text-neutral-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
