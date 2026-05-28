"use client";

import { useState } from "react";
import {
  Plus,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Euro,
  Upload,
} from "lucide-react";

type BudgetStatus = "Borrador" | "Enviado" | "Aceptado" | "Rechazado";

type Budget = {
  id: number;
  client: string;
  email: string;
  service: string;
  amount: number;
  status: BudgetStatus;
  date: string;
  fileName?: string;
};

export default function PresupuestosPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [open, setOpen] = useState(false);

  const [client, setClient] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [amount, setAmount] = useState("");
  const [fileName, setFileName] = useState("");

  const total = budgets.reduce((sum, item) => sum + item.amount, 0);
  const accepted = budgets.filter((item) => item.status === "Aceptado").length;
  const sent = budgets.filter((item) => item.status === "Enviado").length;

  const createBudget = () => {
    if (!client || !email || !service || !amount) return;

    const newBudget: Budget = {
      id: Date.now(),
      client,
      email,
      service,
      amount: Number(amount),
      status: "Borrador",
      date: new Date().toISOString().slice(0, 10),
      fileName,
    };

    setBudgets([newBudget, ...budgets]);
    setOpen(false);

    setClient("");
    setEmail("");
    setService("");
    setAmount("");
    setFileName("");
  };

  const updateStatus = (id: number, status: BudgetStatus) => {
    setBudgets((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  return (
    <main className="min-h-screen bg-[#f8f7fb] px-6 py-8 text-neutral-950">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-violet-600">
              Flowly IA · Administración
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Presupuestos
            </h1>
            <p className="mt-2 text-neutral-600">
              Crea, envía y controla propuestas comerciales.
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-neutral-300"
          >
            <Plus size={18} />
            Nuevo presupuesto
          </button>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <Card icon={<FileText />} label="Presupuestos" value={budgets.length} />
          <Card icon={<CheckCircle2 />} label="Aceptados" value={accepted} />
          <Card icon={<Euro />} label="Valor total" value={`${total.toFixed(2)} €`} />
        </section>

        <section className="rounded-[2rem] border border-white bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between px-2">
            <h2 className="text-lg font-semibold">Listado de presupuestos</h2>
            <p className="text-sm text-neutral-500">
              {sent} pendientes de respuesta
            </p>
          </div>

          {budgets.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-200 p-10 text-center text-neutral-500">
              Todavía no hay presupuestos creados.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-neutral-100">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-neutral-50 text-neutral-500">
                  <tr>
                    <th className="px-5 py-4">Cliente</th>
                    <th className="px-5 py-4">Servicio</th>
                    <th className="px-5 py-4">Importe</th>
                    <th className="px-5 py-4">Archivo</th>
                    <th className="px-5 py-4">Estado</th>
                    <th className="px-5 py-4">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {budgets.map((budget) => (
                    <tr key={budget.id} className="border-t border-neutral-100">
                      <td className="px-5 py-4">
                        <p className="font-medium">{budget.client}</p>
                        <p className="text-xs text-neutral-500">{budget.email}</p>
                      </td>

                      <td className="px-5 py-4">{budget.service}</td>

                      <td className="px-5 py-4 font-semibold">
                        {budget.amount.toFixed(2)} €
                      </td>

                      <td className="px-5 py-4 text-xs text-neutral-500">
                        {budget.fileName || "Sin archivo"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
                          {budget.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`mailto:${budget.email}?subject=Presupuesto Flowly IA&body=Hola ${budget.client}, te enviamos tu presupuesto personalizado de Flowly IA.`}
                            onClick={() => updateStatus(budget.id, "Enviado")}
                            className="rounded-full border px-3 py-2 text-xs"
                          >
                            <Send size={14} className="inline" /> Enviar
                          </a>

                          <button
                            onClick={() => updateStatus(budget.id, "Aceptado")}
                            className="rounded-full border border-green-200 px-3 py-2 text-xs text-green-700"
                          >
                            Aceptado
                          </button>

                          <button
                            onClick={() => updateStatus(budget.id, "Rechazado")}
                            className="rounded-full border border-red-200 px-3 py-2 text-xs text-red-700"
                          >
                            Rechazado
                          </button>

                          <button
                            onClick={() => updateStatus(budget.id, "Enviado")}
                            className="rounded-full border border-orange-200 px-3 py-2 text-xs text-orange-700"
                          >
                            <Clock size={14} className="inline" /> Seguimiento
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold">Nuevo presupuesto</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Crea una propuesta comercial para un cliente.
            </p>

            <div className="mt-6 grid gap-4">
              <input
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Nombre del cliente o negocio"
                className="rounded-2xl border px-4 py-3 outline-none"
              />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email del cliente"
                className="rounded-2xl border px-4 py-3 outline-none"
              />

              <input
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="Servicio presupuestado"
                className="rounded-2xl border px-4 py-3 outline-none"
              />

              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Importe mensual o total"
                type="number"
                className="rounded-2xl border px-4 py-3 outline-none"
              />

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed px-4 py-4 text-sm text-neutral-600">
                <Upload size={18} />
                {fileName || "Subir archivo del presupuesto"}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    setFileName(e.target.files?.[0]?.name || "")
                  }
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-full border px-5 py-3 text-sm"
              >
                Cancelar
              </button>

              <button
                onClick={createBudget}
                className="rounded-full bg-neutral-950 px-5 py-3 text-sm text-white"
              >
                Crear presupuesto
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Card({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-3xl border border-white bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
        {icon}
      </div>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
