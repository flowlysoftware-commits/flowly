"use client";

import { useEffect, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { supabase } from "@/lib/supabaseClient";
import { BudgetPDF } from "./pdf";
import { Plus, Send, CheckCircle2, XCircle, FileText } from "lucide-react";

type Tab = "Pendientes" | "Aceptados" | "Rechazados";

type Budget = {
  id: string;
  client_name: string;
  client_email: string;
  phone: string | null;
  business_type: string | null;
  service: string;
  amount: number;
  status: string;
  rejection_reason: string | null;
  notes: string | null;
  pdf_url: string | null;
  created_at: string;
};

export default function PresupuestosPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("Pendientes");
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

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const weeklyBudgetGoal = 10;
  const monthlyClosedGoal = 5;

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

  const now = new Date();

  const startOfWeek = useMemo(() => {
    const date = new Date(now);
    const day = date.getDay() || 7;
    date.setDate(date.getDate() - day + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const startOfMonth = useMemo(() => {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  const weeklyCreated = budgets.filter(
    (b) => new Date(b.created_at) >= startOfWeek
  ).length;

  const monthlyAccepted = budgets.filter(
    (b) =>
      b.status === "Aceptado" &&
      new Date(b.created_at) >= startOfMonth
  ).length;

  const pendingBudgets = budgets.filter(
    (b) => b.status !== "Aceptado" && b.status !== "Rechazado"
  );

  const acceptedBudgets = budgets.filter((b) => b.status === "Aceptado");
  const rejectedBudgets = budgets.filter((b) => b.status === "Rechazado");

  const visibleBudgets =
    activeTab === "Pendientes"
      ? pendingBudgets
      : activeTab === "Aceptados"
      ? acceptedBudgets
      : rejectedBudgets;

  const createBudget = async () => {
    if (!client || !email || !service || !monthly) {
      alert("Faltan datos");
      return;
    }

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

    const pdfPath = `budget-${crypto.randomUUID()}.pdf`;
    const pdfBytes = new Uint8Array(await blob.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("budgets")
      .upload(pdfPath, pdfBytes, {
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
      setActiveTab("Pendientes");
    }

    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("budgets").update({ status }).eq("id", id);
    await loadBudgets();

    if (status === "Aceptado") setActiveTab("Aceptados");
  };

  const rejectBudget = async () => {
    if (!rejectingId || !rejectionReason) {
      alert("Escribe el motivo del rechazo");
      return;
    }

    await supabase
      .from("budgets")
      .update({
        status: "Rechazado",
        rejection_reason: rejectionReason,
      })
      .eq("id", rejectingId);

    setRejectingId(null);
    setRejectionReason("");
    await loadBudgets();
    setActiveTab("Rechazados");
  };

  const pendingValue = pendingBudgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const acceptedValue = acceptedBudgets.reduce((sum, b) => sum + Number(b.amount), 0);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ede9fe_0%,#ffffff_35%,#f8fafc_100%)] px-6 py-8 text-neutral-950">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-violet-600">
              Flowly IA · Administración
            </p>
            <h1 className="mt-2 text-4xl font-semibold">Presupuestos</h1>
            <p className="mt-2 text-neutral-600">
              Gestiona propuestas, objetivos comerciales y seguimiento.
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
          <Card label="Pendientes" value={pendingBudgets.length} />
          <Card label="Aceptados" value={acceptedBudgets.length} />
          <Card label="Rechazados" value={rejectedBudgets.length} />
          <Card label="Valor aceptado mensual" value={`${acceptedValue.toFixed(2)} €`} />
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2">
          <GoalCard
            title="Objetivo semanal"
            subtitle="Presupuestos creados esta semana"
            current={weeklyCreated}
            goal={weeklyBudgetGoal}
          />

          <GoalCard
            title="Objetivo mensual"
            subtitle="Presupuestos cerrados este mes"
            current={monthlyAccepted}
            goal={monthlyClosedGoal}
          />
        </section>

        <section className="mb-4 flex flex-wrap gap-3">
          <TabButton
            label={`Pendientes (${pendingBudgets.length})`}
            active={activeTab === "Pendientes"}
            onClick={() => setActiveTab("Pendientes")}
          />
          <TabButton
            label={`Aceptados (${acceptedBudgets.length})`}
            active={activeTab === "Aceptados"}
            onClick={() => setActiveTab("Aceptados")}
          />
          <TabButton
            label={`Rechazados (${rejectedBudgets.length})`}
            active={activeTab === "Rechazados"}
            onClick={() => setActiveTab("Rechazados")}
          />
        </section>

        <section className="rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{activeTab}</h2>
            {activeTab === "Pendientes" && (
              <p className="text-sm text-neutral-500">
                Valor pendiente: {pendingValue.toFixed(2)} €
              </p>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-neutral-500">
                <tr>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Servicio</th>
                  <th className="p-4">Mensualidad</th>
                  <th className="p-4">PDF</th>
                  <th className="p-4">Estado</th>
                  {activeTab === "Rechazados" && (
                    <th className="p-4">Motivo</th>
                  )}
                  {activeTab !== "Rechazados" && (
                    <th className="p-4">Acciones</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {visibleBudgets.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="p-4">
                      <p className="font-medium">{b.client_name}</p>
                      <p className="text-xs text-neutral-500">{b.client_email}</p>
                    </td>

                    <td className="p-4">{b.service}</td>

                    <td className="p-4 font-semibold">
                      {Number(b.amount).toFixed(2)} €
                    </td>

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

                    {activeTab === "Rechazados" ? (
                      <td className="max-w-xs p-4 text-sm text-neutral-600">
                        {b.rejection_reason || "Sin motivo indicado"}
                      </td>
                    ) : (
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {activeTab === "Pendientes" && (
                            <a
                              href={`mailto:${b.client_email}?subject=Presupuesto Flowly IA&body=Hola ${b.client_name}, te enviamos tu presupuesto personalizado:%0A%0A${b.pdf_url || ""}`}
                              onClick={() => updateStatus(b.id, "Enviado")}
                              className="rounded-full border px-3 py-2 text-xs"
                            >
                              <Send size={14} className="inline" /> Enviar
                            </a>
                          )}

                          <button
                            onClick={() => updateStatus(b.id, "Aceptado")}
                            className="rounded-full border border-green-200 px-3 py-2 text-xs text-green-700"
                          >
                            <CheckCircle2 size={14} className="inline" /> Aceptado
                          </button>

                          <button
                            onClick={() => setRejectingId(b.id)}
                            className="rounded-full border border-red-200 px-3 py-2 text-xs text-red-700"
                          >
                            <XCircle size={14} className="inline" /> Rechazado
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {visibleBudgets.length === 0 && (
              <div className="p-10 text-center text-neutral-500">
                No hay presupuestos en esta pestaña.
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

      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold">Motivo del rechazo</h2>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ejemplo: precio alto, no interesado, ya tiene otro proveedor..."
              className="mt-6 min-h-32 w-full rounded-2xl border px-4 py-3 outline-none"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectionReason("");
                }}
                className="rounded-full border px-5 py-3"
              >
                Cancelar
              </button>

              <button
                onClick={rejectBudget}
                className="rounded-full bg-red-600 px-5 py-3 text-white"
              >
                Confirmar rechazo
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
    <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function GoalCard({
  title,
  subtitle,
  current,
  goal,
}: {
  title: string;
  subtitle: string;
  current: number;
  goal: number;
}) {
  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
      <p className="text-sm font-medium text-violet-600">{title}</p>
      <h3 className="mt-2 text-xl font-semibold">{subtitle}</h3>
      <p className="mt-4 text-3xl font-semibold">
        {current}/{goal}
      </p>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-violet-600"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-neutral-500">
        {percentage.toFixed(0)}% completado
      </p>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-neutral-950 px-5 py-3 text-sm text-white"
          : "rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm text-neutral-600"
      }
    >
      {label}
    </button>
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
