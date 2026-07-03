"use client";

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { CalendarDays, LockKeyhole, Plus, ReceiptText, ShieldCheck, WalletCards, Landmark } from "lucide-react";

type MovementType = "ingreso" | "gasto";
type BusinessName = "Flowly" | "Celestial" | "Leonaris";
type MoneyPlace = "Cuenta" | "Caja extra";

type AccountingEntry = {
  id: string;
  type: MovementType;
  date: string;
  business: BusinessName;
  channel: string;
  category: string;
  amount: number;
  note: string;
  origin: MoneyPlace;
  destination: MoneyPlace;
  createdAt?: string;
};

type ApiEntry = {
  id: string;
  movement_type: MovementType;
  movement_date: string;
  business: BusinessName;
  channel: string;
  category: string;
  amount: number | string;
  note: string | null;
  origin_wallet?: MoneyPlace | null;
  destination_wallet?: MoneyPlace | null;
  created_at?: string;
};

const ACCESS_PASSWORD = "Nosotrostarot1.";
const businesses = ["Flowly", "Celestial", "Leonaris"] as const;
const channelOptions = ["Square", "Transferencia", "Bizum", "Tarjeta", "Stripe", "PayPal", "Otro"] as const;
const categoryOptions = [
  "recarga",
  "facebook",
  "pago tarotista",
  "Deuda",
  "Pago Centrales",
  "Pago premium numbers",
  "pago hubspot",
  "otros",
  "call400",
  "Flowly",
] as const;
const moneyPlaces = ["Cuenta", "Caja extra"] as const;

function euro(value: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value || 0);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function normalizeMoneyPlace(value: unknown): MoneyPlace {
  return value === "Caja extra" ? "Caja extra" : "Cuenta";
}

function mapEntry(entry: ApiEntry): AccountingEntry {
  return {
    id: entry.id,
    type: entry.movement_type,
    date: entry.movement_date,
    business: entry.business,
    channel: entry.channel,
    category: entry.category,
    amount: Number(entry.amount) || 0,
    note: entry.note || "",
    origin: normalizeMoneyPlace(entry.origin_wallet),
    destination: normalizeMoneyPlace(entry.destination_wallet),
    createdAt: entry.created_at,
  };
}

function calculateTotals(entries: AccountingEntry[]) {
  const income = entries.filter((entry) => entry.type === "ingreso").reduce((sum, entry) => sum + entry.amount, 0);
  const expenses = entries.filter((entry) => entry.type === "gasto").reduce((sum, entry) => sum + entry.amount, 0);
  return { income, expenses, balance: income - expenses };
}

function calculateCashBox(entries: AccountingEntry[]) {
  const incoming = entries.filter((entry) => entry.destination === "Caja extra").reduce((sum, entry) => sum + entry.amount, 0);
  const outgoing = entries.filter((entry) => entry.origin === "Caja extra").reduce((sum, entry) => sum + entry.amount, 0);
  return { incoming, outgoing, balance: incoming - outgoing };
}

export default function ContabilidadPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [type, setType] = useState<MovementType>("ingreso");
  const [date, setDate] = useState(today());
  const [month, setMonth] = useState(currentMonth());
  const [business, setBusiness] = useState<BusinessName>("Flowly");
  const [channel, setChannel] = useState<(typeof channelOptions)[number]>(channelOptions[0]);
  const [category, setCategory] = useState<(typeof categoryOptions)[number]>(categoryOptions[0]);
  const [origin, setOrigin] = useState<MoneyPlace>("Cuenta");
  const [destination, setDestination] = useState<MoneyPlace>("Cuenta");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const totals = useMemo(() => calculateTotals(entries), [entries]);
  const cashBox = useMemo(() => calculateCashBox(entries), [entries]);
  const cashBoxEntries = useMemo(() => entries.filter((entry) => entry.origin === "Caja extra" || entry.destination === "Caja extra"), [entries]);

  const entriesByBusiness = useMemo(
    () => businesses.map((name) => ({ business: name, entries: entries.filter((entry) => entry.business === name), totals: calculateTotals(entries.filter((entry) => entry.business === name)) })),
    [entries],
  );

  useEffect(() => {
    if (!unlocked) return;

    let cancelled = false;
    async function loadEntries() {
      setLoading(true);
      setFormError("");
      try {
        const response = await fetch(`/api/contabilidad/movimientos?month=${encodeURIComponent(month)}`, {
          headers: { "x-contabilidad-password": ACCESS_PASSWORD },
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || "No se pudieron cargar los movimientos.");
        if (!cancelled) setEntries((payload.entries || []).map(mapEntry));
      } catch (error) {
        if (!cancelled) setFormError(error instanceof Error ? error.message : "No se pudieron cargar los movimientos.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEntries();
    return () => {
      cancelled = true;
    };
  }, [month, unlocked]);

  const handleAccess = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.trim() === ACCESS_PASSWORD) {
      setUnlocked(true);
      setAccessError("");
      return;
    }
    setAccessError("Contraseña incorrecta.");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = Number(amount.replace(",", "."));

    if (!date || !business || !channel || !category || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError("Completa los campos obligatorios y pon un importe válido.");
      return;
    }

    if (origin === "Caja extra" && destination === "Caja extra") {
      setFormError("El origen y el destino no pueden ser Caja extra a la vez.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const response = await fetch("/api/contabilidad/movimientos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-contabilidad-password": ACCESS_PASSWORD,
        },
        body: JSON.stringify({
          type,
          date,
          business,
          channel,
          category,
          amount: numericAmount,
          note: note.trim(),
          origin,
          destination,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "No se pudo guardar el movimiento.");

      const savedEntry = mapEntry(payload.entry);
      setEntries((current) => [savedEntry, ...current]);
      setMonth(savedEntry.date.slice(0, 7));
      setAmount("");
      setNote("");
      setOrigin("Cuenta");
      setDestination("Cuenta");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudo guardar el movimiento.");
    } finally {
      setSaving(false);
    }
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
            <p className="mt-3 text-sm leading-6 text-slate-300">Introduce la contraseña para acceder al panel manual de ingresos, gastos y caja extra.</p>
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
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Registro manual conectado a Supabase. Cada movimiento guardado queda registrado abajo y separado por negocio y caja extra.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[700px] lg:grid-cols-4">
              <StatCard label="Ingresos" value={euro(totals.income)} tone="emerald" />
              <StatCard label="Gastos" value={euro(totals.expenses)} tone="rose" />
              <StatCard label="Saldo" value={euro(totals.balance)} tone="cyan" />
              <StatCard label="Caja extra" value={euro(cashBox.balance)} tone="amber" />
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-amber-200/20 bg-amber-300/10 p-5 shadow-2xl shadow-amber-950/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-200/15 text-amber-100">
                <Landmark size={21} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-100/70">Tesorería</p>
                <h2 className="text-2xl font-black">Caja extra</h2>
              </div>
            </div>
            <p className="mt-4 text-4xl font-black text-amber-50">{euro(cashBox.balance)}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <MiniStat label="Entradas" value={euro(cashBox.incoming)} tone="emerald" />
              <MiniStat label="Salidas" value={euro(cashBox.outgoing)} tone="rose" />
            </div>
            <p className="mt-4 text-xs leading-5 text-amber-100/70">Marca “Destino: Caja extra” para guardar dinero en caja. Marca “Origen: Caja extra” cuando un gasto salga de esa caja.</p>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-purple-950/10 backdrop-blur sm:p-5">
          <div className="mb-4 flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-100">
                <Plus size={20} />
              </div>
              <div>
                <h2 className="font-black">Nuevo movimiento</h2>
                <p className="text-xs text-slate-400">Añade una línea manual a la contabilidad.</p>
              </div>
            </div>
            <Field label="Mes visible">
              <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="min-h-[46px] rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-cyan-300/70" />
            </Field>
          </div>

          <div className="grid gap-3 xl:grid-cols-[130px_155px_1fr_1fr_1fr_1fr_1fr_145px_1.2fr_auto]">
            <Field label="Movimiento">
              <select value={type} onChange={(event) => setType(event.target.value as MovementType)} className="field-control capitalize">
                <option value="ingreso">Ingreso</option>
                <option value="gasto">Gasto</option>
              </select>
            </Field>

            <Field label="Fecha">
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="field-control pl-10" />
              </div>
            </Field>

            <Field label="Negocio">
              <select value={business} onChange={(event) => setBusiness(event.target.value as BusinessName)} className="field-control">
                {businesses.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </Field>

            <Field label="Origen">
              <select value={origin} onChange={(event) => setOrigin(event.target.value as MoneyPlace)} className="field-control">
                {moneyPlaces.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </Field>

            <Field label="Destino">
              <select value={destination} onChange={(event) => setDestination(event.target.value as MoneyPlace)} className="field-control">
                {moneyPlaces.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </Field>

            <Field label={type === "ingreso" ? "Por dónde ingresa" : "Por dónde se paga"}>
              <select value={channel} onChange={(event) => setChannel(event.target.value as (typeof channelOptions)[number])} className="field-control">
                {channelOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </Field>

            <Field label="Tipo">
              <select value={category} onChange={(event) => setCategory(event.target.value as (typeof categoryOptions)[number])} className="field-control">
                {categoryOptions.map((option) => (
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
                className="field-control"
                placeholder="0,00 €"
              />
            </Field>

            <Field label="Observación">
              <input value={note} onChange={(event) => setNote(event.target.value)} className="field-control" placeholder="Opcional" />
            </Field>

            <div className="flex items-end">
              <button type="submit" disabled={saving} className="h-[50px] rounded-2xl bg-cyan-300 px-6 font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? "Guardando" : "Añadir"}
              </button>
            </div>
          </div>
          {formError ? <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm font-semibold text-rose-200">{formError}</p> : null}
        </form>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-cyan-950/10 backdrop-blur">
          <SectionHeader title="Movimientos del mes" subtitle={loading ? "Cargando movimientos desde Supabase..." : "Registros guardados para el mes seleccionado."} count={entries.length} />
          <MovementsTable entries={entries} emptyText="Todavía no hay movimientos. Añade el primer ingreso o gasto desde la barra superior." />
        </section>

        <section className="rounded-[2rem] border border-amber-200/20 bg-amber-300/10 p-5 shadow-2xl shadow-amber-950/10 backdrop-blur">
          <SectionHeader title="Movimientos de caja extra" subtitle="Entradas y salidas que afectan al saldo de la caja extra." count={cashBoxEntries.length} />
          <CashBoxTable entries={cashBoxEntries} emptyText="Todavía no hay movimientos de caja extra en este mes." />
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          {entriesByBusiness.map((group) => (
            <div key={group.business} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-purple-950/10 backdrop-blur">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200/70">Negocio</p>
                  <h3 className="mt-1 text-2xl font-black">{group.business}</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-slate-300">{group.entries.length} líneas</span>
              </div>
              <div className="mb-4 grid grid-cols-3 gap-2">
                <MiniStat label="Ingresos" value={euro(group.totals.income)} tone="emerald" />
                <MiniStat label="Gastos" value={euro(group.totals.expenses)} tone="rose" />
                <MiniStat label="Saldo" value={euro(group.totals.balance)} tone="cyan" />
              </div>
              <MovementsTable entries={group.entries} compact emptyText={`Sin movimientos para ${group.business}.`} />
            </div>
          ))}
        </section>
      </section>
      <style jsx global>{`
        .field-control {
          min-height: 50px;
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.3);
          padding: 0 1rem;
          color: white;
          outline: none;
          transition: border-color 160ms ease;
        }
        .field-control:focus { border-color: rgba(103, 232, 249, 0.7); }
        .field-control option { background: #0f172a; color: white; }
      `}</style>
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

function StatCard({ label, value, tone }: { label: string; value: string; tone: "emerald" | "rose" | "cyan" | "amber" }) {
  const classes = {
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
    rose: "border-rose-300/20 bg-rose-300/10 text-rose-100",
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
    amber: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  }[tone];
  return (
    <div className={`rounded-2xl border p-4 ${classes}`}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: "emerald" | "rose" | "cyan" }) {
  const classes = {
    emerald: "bg-emerald-300/10 text-emerald-100",
    rose: "bg-rose-300/10 text-rose-100",
    cyan: "bg-cyan-300/10 text-cyan-100",
  }[tone];
  return (
    <div className={`rounded-2xl p-3 ${classes}`}>
      <p className="text-[9px] font-black uppercase tracking-[0.12em] opacity-70">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle, count }: { title: string; subtitle: string; count: number }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-300/15 text-purple-100">
          <ReceiptText size={20} />
        </div>
        <div>
          <h2 className="font-black">{title}</h2>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-bold text-slate-300 sm:flex">
        <WalletCards size={15} /> {count} movimientos
      </div>
    </div>
  );
}

function MovementsTable({ entries, emptyText, compact = false }: { entries: AccountingEntry[]; emptyText: string; compact?: boolean }) {
  if (entries.length === 0) {
    return <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-8 text-center text-sm text-slate-400">{emptyText}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left text-sm ${compact ? "min-w-[820px]" : "min-w-[1100px]"}`}>
        <thead className="text-xs uppercase tracking-[0.18em] text-slate-500">
          <tr className="border-b border-white/10">
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Fecha</th>
            {!compact ? <th className="px-4 py-3">Negocio</th> : null}
            <th className="px-4 py-3">Origen</th>
            <th className="px-4 py-3">Destino</th>
            <th className="px-4 py-3">Medio</th>
            <th className="px-4 py-3">Tipo</th>
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
              {!compact ? <td className="px-4 py-4 font-semibold">{entry.business}</td> : null}
              <td className="px-4 py-4">{entry.origin}</td>
              <td className="px-4 py-4">{entry.destination}</td>
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
  );
}

function CashBoxTable({ entries, emptyText }: { entries: AccountingEntry[]; emptyText: string }) {
  if (entries.length === 0) {
    return <div className="rounded-3xl border border-dashed border-amber-200/20 bg-black/20 p-8 text-center text-sm text-amber-100/70">{emptyText}</div>;
  }

  let runningBalance = 0;
  const chronological = [...entries].sort((a, b) => `${a.date}-${a.createdAt || ""}`.localeCompare(`${b.date}-${b.createdAt || ""}`));
  const rows = chronological.map((entry) => {
    const cashIn = entry.destination === "Caja extra" ? entry.amount : 0;
    const cashOut = entry.origin === "Caja extra" ? entry.amount : 0;
    runningBalance += cashIn - cashOut;
    return { entry, cashIn, cashOut, runningBalance };
  }).reverse();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.18em] text-amber-100/60">
          <tr className="border-b border-amber-200/15">
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Negocio</th>
            <th className="px-4 py-3">Concepto</th>
            <th className="px-4 py-3 text-right">Entrada</th>
            <th className="px-4 py-3 text-right">Salida</th>
            <th className="px-4 py-3 text-right">Saldo</th>
            <th className="px-4 py-3">Observación</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ entry, cashIn, cashOut, runningBalance: balance }) => (
            <tr key={entry.id} className="border-b border-amber-200/10 text-slate-200 last:border-0">
              <td className="px-4 py-4">{entry.date}</td>
              <td className="px-4 py-4 font-semibold">{entry.business}</td>
              <td className="px-4 py-4">{entry.category} · {entry.channel}</td>
              <td className="px-4 py-4 text-right font-black text-emerald-200">{cashIn ? `+${euro(cashIn)}` : "—"}</td>
              <td className="px-4 py-4 text-right font-black text-rose-200">{cashOut ? `-${euro(cashOut)}` : "—"}</td>
              <td className="px-4 py-4 text-right font-black text-amber-100">{euro(balance)}</td>
              <td className="px-4 py-4 text-slate-400">{entry.note || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
