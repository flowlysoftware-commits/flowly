"use client";

import { FormEvent, useMemo, useState, type ReactNode } from "react";
import { CalendarDays, LockKeyhole, Plus, ReceiptText, ShieldCheck, WalletCards } from "lucide-react";

type MovementType = "ingreso" | "gasto";

type AccountingEntry = {
  id: string;
  type: MovementType;
  date: string;
  person: AccountingEntity;
  channel: string;
  category: string;
  amount: number;
  note: string;
};

const ACCESS_PASSWORDS = new Set(["Nosotrostarot1.", "Nosotrostarot1"]);

const entityOptions = ["Flowly", "Celestial", "Leonaris"] as const;
type AccountingEntity = (typeof entityOptions)[number];

const peopleOptions = {
  ingreso: entityOptions,
  gasto: entityOptions,
} satisfies Record<MovementType, readonly AccountingEntity[]>;

const channelOptions = {
  ingreso: ["Square", "Transferencia", "Bizum", "Tarjeta", "Stripe", "PayPal", "Otro"],
  gasto: ["Square", "Transferencia", "Bizum", "Tarjeta", "Domiciliación", "Otro"],
} satisfies Record<MovementType, readonly string[]>;

const categoryOptions = {
  ingreso: ["recarga", "facebook", "pago tarotista", "Deuda", "Pago Centrales", "Pago premium numbers", "pago hubspot", "otros", "call400", "Flowly"],
  gasto: ["recarga", "facebook", "pago tarotista", "Deuda", "Pago Centrales", "Pago premium numbers", "pago hubspot", "otros", "call400", "Flowly"],
} satisfies Record<MovementType, readonly string[]>;

function euro(value: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value || 0);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function ContabilidadPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [type, setType] = useState<MovementType>("ingreso");
  const [date, setDate] = useState(today());
  const [person, setPerson] = useState<AccountingEntity>(peopleOptions.ingreso[0]);
  const [channel, setChannel] = useState(channelOptions.ingreso[0]);
  const [category, setCategory] = useState(categoryOptions.ingreso[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<AccountingEntry[]>([]);

  const totals = useMemo(() => {
    const income = entries.filter((entry) => entry.type === "ingreso").reduce((sum, entry) => sum + entry.amount, 0);
    const expenses = entries.filter((entry) => entry.type === "gasto").reduce((sum, entry) => sum + entry.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [entries]);

  const entitySummaries = useMemo(() => {
    return entityOptions.map((entity) => {
      const entityEntries = entries.filter((entry) => entry.person === entity);
      const income = entityEntries.filter((entry) => entry.type === "ingreso").reduce((sum, entry) => sum + entry.amount, 0);
      const expenses = entityEntries.filter((entry) => entry.type === "gasto").reduce((sum, entry) => sum + entry.amount, 0);
      return { entity, entries: entityEntries, income, expenses, balance: income - expenses };
    });
  }, [entries]);

  const changeType = (nextType: MovementType) => {
    setType(nextType);
    setPerson(peopleOptions[nextType][0]);
    setChannel(channelOptions[nextType][0]);
    setCategory(categoryOptions[nextType][0]);
  };

  const handleAccess = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (ACCESS_PASSWORDS.has(password.trim())) {
      setUnlocked(true);
      setAccessError("");
      return;
    }
    setAccessError("Contraseña incorrecta.");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = Number(amount.replace(",", "."));

    if (!date || !person || !channel || !category || !Number.isFinite(numericAmount) || numericAmount <= 0) return;

    setEntries((current) => [
      {
        id: crypto.randomUUID(),
        type,
        date,
        person,
        channel,
        category,
        amount: numericAmount,
        note: note.trim(),
      },
      ...current,
    ]);
    setAmount("");
    setNote("");
  };

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-[#070913] px-6 py-10 text-white">
        <section className="mx-auto flex min-h-[78vh] max-w-xl items-center justify-center">
          <form onSubmit={handleAccess} className="w-full rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-purple-950/30 backdrop-blur">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200">
              <LockKeyhole size={26} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-200/70">Área privada</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight">Contabilidad mensual</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">Introduce la contraseña para acceder al panel manual de ingresos y gastos.</p>
            <div className="mt-8 space-y-3">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none transition focus:border-cyan-300/70"
                placeholder="••••••••••••"
              />
              {accessError ? <p className="text-sm font-semibold text-rose-300">{accessError}</p> : null}
            </div>
            <button type="submit" className="mt-6 w-full rounded-2xl bg-cyan-300 px-5 py-4 font-black text-slate-950 transition hover:bg-cyan-200">
              Entrar
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#060816] px-5 py-8 text-white sm:px-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-400/12 via-purple-500/10 to-black p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.32em] text-cyan-200/75">
                <ShieldCheck size={16} /> Privado
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Contabilidad mensual</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Registro manual para anotar ingresos y gastos. De momento funciona como maqueta visual con datos en pantalla.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/80">Ingresos</p>
                <p className="mt-2 text-2xl font-black text-emerald-100">{euro(totals.income)}</p>
              </div>
              <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-200/80">Gastos</p>
                <p className="mt-2 text-2xl font-black text-rose-100">{euro(totals.expenses)}</p>
              </div>
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200/80">Balance</p>
                <p className="mt-2 text-2xl font-black text-cyan-100">{euro(totals.balance)}</p>
              </div>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-purple-950/10 backdrop-blur sm:p-5">
          <div className="mb-4 flex items-center gap-3 px-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-100">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="font-black">Nuevo movimiento</h2>
              <p className="text-xs text-slate-400">Añade una línea manual a la contabilidad.</p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[150px_165px_1fr_1fr_1fr_150px_1.3fr_auto]">
            <Field label="Movimiento">
              <select value={type} onChange={(event) => changeType(event.target.value as MovementType)} className="min-h-[50px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-cyan-300/70 [&_option]:bg-slate-900 [&_option]:text-white capitalize">
                <option value="ingreso">Ingreso</option>
                <option value="gasto">Gasto</option>
              </select>
            </Field>

            <Field label="Fecha">
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="min-h-[50px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-cyan-300/70 [&_option]:bg-slate-900 [&_option]:text-white pl-10" />
              </div>
            </Field>

            <Field label={type === "ingreso" ? "Quién ingresa" : "Quién paga"}>
              <select value={person} onChange={(event) => setPerson(event.target.value as AccountingEntity)} className="min-h-[50px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-cyan-300/70 [&_option]:bg-slate-900 [&_option]:text-white">
                {peopleOptions[type].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </Field>

            <Field label={type === "ingreso" ? "Por dónde ingresa" : "Por dónde se paga"}>
              <select value={channel} onChange={(event) => setChannel(event.target.value)} className="min-h-[50px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-cyan-300/70 [&_option]:bg-slate-900 [&_option]:text-white">
                {channelOptions[type].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </Field>

            <Field label="Tipo">
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-[50px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-cyan-300/70 [&_option]:bg-slate-900 [&_option]:text-white">
                {categoryOptions[type].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </Field>

            <Field label="Importe">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="min-h-[50px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-cyan-300/70 [&_option]:bg-slate-900 [&_option]:text-white"
                placeholder="0,00 €"
              />
            </Field>

            <Field label="Observación">
              <input value={note} onChange={(event) => setNote(event.target.value)} className="min-h-[50px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-cyan-300/70 [&_option]:bg-slate-900 [&_option]:text-white" placeholder="Opcional" />
            </Field>

            <div className="flex items-end">
              <button type="submit" className="h-[50px] rounded-2xl bg-cyan-300 px-6 font-black text-slate-950 transition hover:bg-cyan-200">
                Añadir
              </button>
            </div>
          </div>
        </form>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-cyan-950/10 backdrop-blur">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-300/15 text-purple-100">
                <ReceiptText size={20} />
              </div>
              <div>
                <h2 className="font-black">Movimientos del mes</h2>
                <p className="text-xs text-slate-400">Vista previa de los registros añadidos manualmente.</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-bold text-slate-300 sm:flex">
              <WalletCards size={15} /> {entries.length} movimientos
            </div>
          </div>

          {entries.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-10 text-center text-slate-400">
              Todavía no hay movimientos. Añade el primer ingreso o gasto desde la barra superior.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Quién</th>
                    <th className="px-4 py-3">Medio</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3 text-right">Importe</th>
                    <th className="px-4 py-3">Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-white/5 text-slate-200 last:border-0">
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${entry.type === "ingreso" ? "bg-emerald-300/15 text-emerald-200" : "bg-rose-300/15 text-rose-200"}`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-4 py-4">{entry.date}</td>
                      <td className="px-4 py-4 font-semibold">{entry.person}</td>
                      <td className="px-4 py-4">{entry.channel}</td>
                      <td className="px-4 py-4">{entry.category}</td>
                      <td className={`px-4 py-4 text-right font-black ${entry.type === "ingreso" ? "text-emerald-200" : "text-rose-200"}`}>
                        {entry.type === "gasto" ? "-" : "+"}{euro(entry.amount)}
                      </td>
                      <td className="px-4 py-4 text-slate-400">{entry.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          {entitySummaries.map((summary) => (
            <article key={summary.entity} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-purple-950/10 backdrop-blur">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200/70">Resumen</p>
                  <h3 className="mt-1 text-2xl font-black">{summary.entity}</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-slate-300">
                  {summary.entries.length} movimientos
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-200/70">Ingresos</p>
                  <p className="mt-1 font-black text-emerald-100">{euro(summary.income)}</p>
                </div>
                <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-rose-200/70">Gastos</p>
                  <p className="mt-1 font-black text-rose-100">{euro(summary.expenses)}</p>
                </div>
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-200/70">Saldo</p>
                  <p className="mt-1 font-black text-cyan-100">{euro(summary.balance)}</p>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-3xl border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/25 uppercase tracking-[0.14em] text-slate-500">
                    <tr>
                      <th className="px-3 py-3">Fecha</th>
                      <th className="px-3 py-3">Tipo</th>
                      <th className="px-3 py-3 text-right">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.entries.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-6 text-center text-slate-500">Sin movimientos.</td>
                      </tr>
                    ) : (
                      summary.entries.slice(0, 6).map((entry) => (
                        <tr key={entry.id} className="border-t border-white/5 text-slate-300">
                          <td className="px-3 py-3">{entry.date}</td>
                          <td className="px-3 py-3">{entry.category}</td>
                          <td className={`px-3 py-3 text-right font-black ${entry.type === "ingreso" ? "text-emerald-200" : "text-rose-200"}`}>
                            {entry.type === "gasto" ? "-" : "+"}{euro(entry.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}
