"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { BudgetPDF } from "./pdf";

export default function PresupuestosPage() {
  const [client, setClient] = useState("");
  const [service, setService] = useState("");
  const [monthly, setMonthly] = useState("");
  const [installation, setInstallation] = useState("");

  const generatePDF = async () => {
    const blob = await pdf(
      <BudgetPDF
        client={client}
        service={service}
        monthly={monthly}
        installation={installation}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);

    window.open(url);
  };

  return (
    <main className="min-h-screen bg-[#f8f7fb] px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-semibold tracking-tight">
          Generador de presupuestos
        </h1>

        <p className="mt-2 text-neutral-600">
          Crea presupuestos profesionales en PDF para tus clientes.
        </p>

        <div className="mt-8 grid gap-4">
          <input
            placeholder="Cliente"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="rounded-2xl border px-4 py-3"
          />

          <input
            placeholder="Servicio"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="rounded-2xl border px-4 py-3"
          />

          <input
            placeholder="Coste instalación"
            value={installation}
            onChange={(e) => setInstallation(e.target.value)}
            className="rounded-2xl border px-4 py-3"
          />

          <input
            placeholder="Cuota mensual"
            value={monthly}
            onChange={(e) => setMonthly(e.target.value)}
            className="rounded-2xl border px-4 py-3"
          />
        </div>

        <button
          onClick={generatePDF}
          className="mt-8 rounded-full bg-neutral-950 px-6 py-4 text-white"
        >
          Generar PDF
        </button>
      </div>
    </main>
  );
}
