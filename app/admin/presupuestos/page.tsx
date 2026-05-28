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
};

const initialBudgets: Budget[] = [
  {
    id: 1,
    client: "Peluquería María",
    email: "maria@email.com",
    service: "Panel Flowly Hair + Centralita",
    amount: 84.99,
    status: "Enviado",
    date: "2026-05-28",
  },
  {
    id: 2,
    client: "Beauty Studio Laura",
    email: "laura@email.com",
    service: "Panel Flowly Beauty",
    amount: 29.99,
    status: "Aceptado",
    date: "2026-05-27",
  },
];

export default function PresupuestosPage() {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);

  const total = budgets.reduce((sum, item) => sum + item.amount, 0);
  const accepted = budgets.filter((item) => item.status === "Aceptado").length;
  const sent = budgets.filter((item) => item.status === "Enviado").length;

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
              Crea, envía y controla el estado de cada propuesta comercial.
            </p>
          </div>

          <button className="flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-neutral-300 transition hover:scale-[1.02]">
            <Plus size={18} />
            Nuevo presupuesto
          </button>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <FileText size={22} />
            </div>
            <p className="text-sm text-neutral-500">Presupuestos totales</p>
            <p className="mt-2 text-3xl font-semibold">{budgets.length}</p>
          </div>

          <div className="rounded-3xl border border-white bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-600">
              <CheckCircle2 size={22} />
            </div>
            <p className="text-sm text-neutral-500">Aceptados</p>
            <p className="mt-2 text-3xl font-semibold">{accepted}</p>
          </div>

          <div className="rounded-3xl border border-white bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
              <Euro size={22} />
            </div>
            <p className="text-sm text-neutral-500">Valor total</p>
            <p className="mt-2 text-3xl font-semibold">
              {total.toFixed(2)} €
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between px-2">
            <h2 className="text-lg font-semibold">Listado de presupuestos</h2>
            <p className="text-sm text-neutral-500">
              {sent} pendientes de respuesta
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-neutral-100">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Cliente</th>
                  <th className="px-5 py-4 font-medium">Servicio</th>
                  <th className="px-5 py-4 font-medium">Importe</th>
                  <th className="px-5 py-4 font-medium">Estado</th>
                  <th className="px-5 py-4 font-medium">Fecha</th>
                  <th className="px-5 py-4 font-medium">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {budgets.map((budget) => (
                  <tr key={budget.id} className="border-t border-neutral-100">
                    <td className="px-5 py-4">
                      <p className="font-medium">{budget.client}</p>
                      <p className="text-xs text-neutral-500">{budget.email}</p>
                    </td>

                    <td className="px-5 py-4 text-neutral-700">
                      {budget.service}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {budget.amount.toFixed(2)} €
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
                        {budget.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-neutral-500">
                      {budget.date}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`mailto:${budget.email}?subject=Presupuesto Flowly IA&body=Hola, te enviamos tu presupuesto personalizado de Flowly IA.`}
                          className="rounded-full border border-neutral-200 px-3 py-2 text-xs hover:bg-neutral-50"
                        >
                          <Send size={14} className="inline" /> Enviar
                        </a>

                        <button
                          onClick={() => updateStatus(budget.id, "Aceptado")}
                          className="rounded-full border border-green-200 px-3 py-2 text-xs text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle2 size={14} className="inline" /> Aceptado
                        </button>

                        <button
                          onClick={() => updateStatus(budget.id, "Rechazado")}
                          className="rounded-full border border-red-200 px-3 py-2 text-xs text-red-700 hover:bg-red-50"
                        >
                          <XCircle size={14} className="inline" /> Rechazado
                        </button>

                        <button
                          onClick={() => updateStatus(budget.id, "Enviado")}
                          className="rounded-full border border-orange-200 px-3 py-2 text-xs text-orange-700 hover:bg-orange-50"
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
        </section>
      </div>
    </main>
  );
}
