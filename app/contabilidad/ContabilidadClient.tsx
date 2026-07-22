"use client";

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Filter,
  LockKeyhole,
  Plus,
  ReceiptText,
  ShieldCheck,
  Trash2,
  Vault,
  WalletCards,
  X,
} from "lucide-react";

type MovementType = "ingreso" | "gasto";
type BusinessName = "Flowly" | "Celestial" | "Leonaris";
type BalanceMap = Record<BusinessName, number>;

type AccountingEntry = {
  id: string;
  type: MovementType;
  date: string;
  business: BusinessName;
  channel: string;
  category: string;
  amount: number;
  note: string;
  originAccount: string;
  destinationAccount: string;
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
  origin_account?: string | null;
  destination_account?: string | null;
  created_at?: string;
};

type Filters = {
  date: string;
  origin: string;
  destination: string;
  channel: string;
  category: string;
  movement: string;
};

type CashRow = {
  entry: AccountingEntry;
  cashIn: number;
  cashOut: number;
  balance: number;
};

const ACCESS_PASSWORD = "Nosotrostarot1.";
const businesses = ["Flowly", "Celestial", "Leonaris"] as const;
const defaultAccounts = ["Banco", "Caja extra"];
const defaultChannels = ["Square", "Transferencia", "Bizum", "Tarjeta", "Stripe", "PayPal", "Otro"];
const defaultCategories = [
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
];
const emptyBalances: BalanceMap = { Flowly: 0, Celestial: 0, Leonaris: 0 };
const emptyFilters: Filters = { date: "", origin: "", destination: "", channel: "", category: "", movement: "" };

function euro(value: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value || 0);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
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
    originAccount: entry.origin_account || "Banco",
    destinationAccount: entry.destination_account || "Banco",
    createdAt: entry.created_at,
  };
}

function calculateTotals(entries: AccountingEntry[]) {
  const income = entries.filter((entry) => entry.type === "ingreso").reduce((sum, entry) => sum + entry.amount, 0);
  const expenses = entries.filter((entry) => entry.type === "gasto").reduce((sum, entry) => sum + entry.amount, 0);
  return { income, expenses, balance: income - expenses };
}

function calculateCashRows(entries: AccountingEntry[], openingBalance = 0) {
  const rows = entries
    .filter((entry) => entry.originAccount === "Caja extra" || entry.destinationAccount === "Caja extra")
    .slice()
    .sort((a, b) => `${a.date}-${a.createdAt || ""}`.localeCompare(`${b.date}-${b.createdAt || ""}`));

  let balance = openingBalance;
  return rows.map((entry) => {
    const cashIn = entry.destinationAccount === "Caja extra" ? entry.amount : 0;
    const cashOut = entry.originAccount === "Caja extra" ? entry.amount : 0;
    balance += cashIn - cashOut;
    return { entry, cashIn, cashOut, balance };
  });
}

function uniqueOptions(defaults: string[], values: string[]) {
  return Array.from(new Set([...defaults, ...values].filter(Boolean)));
}

function readStoredOptions(key: string, defaults: string[]) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return uniqueOptions(defaults, Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : []);
  } catch {
    return defaults;
  }
}

export default function ContabilidadClient() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [type, setType] = useState<MovementType>("ingreso");
  const [date, setDate] = useState(today());
  const [month, setMonth] = useState(currentMonth());
  const [business, setBusiness] = useState<BusinessName>("Flowly");
  const [originAccount, setOriginAccount] = useState("Banco");
  const [destinationAccount, setDestinationAccount] = useState("Banco");
  const [channel, setChannel] = useState(defaultChannels[0]);
  const [category, setCategory] = useState(defaultCategories[0]);
  const [accountOptions, setAccountOptions] = useState(defaultAccounts);
  const [channelOptions, setChannelOptions] = useState(defaultChannels);
  const [categoryOptions, setCategoryOptions] = useState(defaultCategories);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [openingBalances, setOpeningBalances] = useState<BalanceMap>(emptyBalances);
  const [openingCashBalances, setOpeningCashBalances] = useState<BalanceMap>(emptyBalances);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setAccountOptions(readStoredOptions("flowly-account-options", defaultAccounts));
    setChannelOptions(readStoredOptions("flowly-channel-options", defaultChannels));
    setCategoryOptions(readStoredOptions("flowly-category-options", defaultCategories));
  }, []);

  useEffect(() => {
    if (!entries.length) return;
    setAccountOptions((current) => uniqueOptions(current, entries.flatMap((entry) => [entry.originAccount, entry.destinationAccount])));
    setChannelOptions((current) => uniqueOptions(current, entries.map((entry) => entry.channel)));
    setCategoryOptions((current) => uniqueOptions(current, entries.map((entry) => entry.category)));
  }, [entries]);

  const monthlyTotals = useMemo(() => calculateTotals(entries), [entries]);
  const totalOpening = useMemo(() => businesses.reduce((sum, name) => sum + (openingBalances[name] || 0), 0), [openingBalances]);
  const totalOpeningCash = useMemo(() => businesses.reduce((sum, name) => sum + (openingCashBalances[name] || 0), 0), [openingCashBalances]);
  const allCashRows = useMemo(() => calculateCashRows(entries, totalOpeningCash), [entries, totalOpeningCash]);
  const totalCashMovement = useMemo(() => {
    const incoming = allCashRows.reduce((sum, row) => sum + row.cashIn, 0);
    const outgoing = allCashRows.reduce((sum, row) => sum + row.cashOut, 0);
    return { incoming, outgoing, final: totalOpeningCash + incoming - outgoing };
  }, [allCashRows, totalOpeningCash]);

  const entriesByBusiness = useMemo(
    () => businesses.map((name) => {
      const businessEntries = entries.filter((entry) => entry.business === name);
      const totals = calculateTotals(businessEntries);
      const cashRows = calculateCashRows(businessEntries, openingCashBalances[name] || 0);
      const cashIn = cashRows.reduce((sum, row) => sum + row.cashIn, 0);
      const cashOut = cashRows.reduce((sum, row) => sum + row.cashOut, 0);
      return {
        business: name,
        entries: businessEntries,
        totals,
        opening: openingBalances[name] || 0,
        final: (openingBalances[name] || 0) + totals.balance,
        cashRows,
        cashIn,
        cashOut,
        cashFinal: (openingCashBalances[name] || 0) + cashIn - cashOut,
      };
    }),
    [entries, openingBalances, openingCashBalances],
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
        if (!cancelled) {
          setEntries((payload.entries || []).map(mapEntry));
          setOpeningBalances({ ...emptyBalances, ...(payload.openingBalances || {}) });
          setOpeningCashBalances({ ...emptyBalances, ...(payload.openingCashBalances || {}) });
        }
      } catch (error) {
        if (!cancelled) setFormError(error instanceof Error ? error.message : "No se pudieron cargar los movimientos.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEntries();
    return () => { cancelled = true; };
  }, [month, unlocked]);

  const addCustomOption = (
    label: string,
    current: string[],
    setter: (options: string[]) => void,
    storageKey: string,
    select: (value: string) => void,
  ) => {
    const value = window.prompt(`Escribe la nueva opción para ${label}:`)?.trim();
    if (!value) return;
    if (value.length > 80) {
      setFormError("La nueva opción no puede superar los 80 caracteres.");
      return;
    }
    const next = uniqueOptions(current, [value]);
    setter(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    select(value);
  };

  const handleAccess = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.trim() === ACCESS_PASSWORD) {
      setUnlocked(true);
      setAccessError("");
    } else {
      setAccessError("Contraseña incorrecta.");
    }
  };

  const handleDelete = async (entry: AccountingEntry) => {
    if (!window.confirm(`¿Seguro que deseas eliminar este ${entry.type} de ${euro(entry.amount)}? Esta acción no se puede deshacer.`)) return;
    setDeletingId(entry.id);
    setFormError("");
    try {
      const response = await fetch(`/api/contabilidad/movimientos?id=${encodeURIComponent(entry.id)}`, {
        method: "DELETE",
        headers: { "x-contabilidad-password": ACCESS_PASSWORD },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "No se pudo eliminar el movimiento.");
      setEntries((current) => current.filter((item) => item.id !== entry.id));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudo eliminar el movimiento.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = Number(amount.replace(",", "."));
    if (!date || !business || !channel || !category || !originAccount || !destinationAccount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError("Completa los campos obligatorios y pon un importe válido.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const response = await fetch("/api/contabilidad/movimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-contabilidad-password": ACCESS_PASSWORD },
        body: JSON.stringify({ type, date, business, originAccount, destinationAccount, channel, category, amount: numericAmount, note: note.trim() }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "No se pudo guardar el movimiento.");
      const savedEntry = mapEntry(payload.entry);
      if (savedEntry.date.slice(0, 7) === month) setEntries((current) => [savedEntry, ...current]);
      else setMonth(savedEntry.date.slice(0, 7));
      setAmount("");
      setNote("");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudo guardar el movimiento.");
    } finally {
      setSaving(false);
    }
  };

  if (!unlocked) {
    return (
      <main className="flowly-app-shell min-h-screen px-6 py-10 text-white">
        <section className="mx-auto flex min-h-[78vh] max-w-xl items-center justify-center">
          <form onSubmit={handleAccess} className="flowly-client-card w-full rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-purple-950/30 backdrop-blur">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200"><LockKeyhole size={26} /></div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-200/70">Área privada</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight">Contabilidad mensual</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">Introduce la contraseña para acceder al panel de ingresos, gastos y cajas independientes.</p>
            <div className="mt-8 space-y-3">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Contraseña</label>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none transition focus:border-cyan-300/70" placeholder="••••••••••••" />
              {accessError ? <p className="text-sm font-semibold text-rose-300">{accessError}</p> : null}
            </div>
            <button type="submit" className="mt-6 w-full rounded-2xl bg-cyan-300 px-5 py-4 font-black text-slate-950 transition hover:bg-cyan-200">Entrar</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="flowly-app-shell min-h-screen px-5 py-8 text-white sm:px-8">
      <section className="mx-auto max-w-[1600px] space-y-6">
        <header className="flowly-client-hero overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-400/12 via-purple-500/10 to-black p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.32em] text-cyan-200/75"><ShieldCheck size={16} /> Privado</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Contabilidad mensual</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Los saldos anteriores se arrastran automáticamente y cada negocio conserva su propia caja extra.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[760px] xl:grid-cols-5">
              <StatCard label="Saldo anterior" value={euro(totalOpening)} tone="purple" />
              <StatCard label="Ingresos del mes" value={euro(monthlyTotals.income)} tone="emerald" />
              <StatCard label="Gastos del mes" value={euro(monthlyTotals.expenses)} tone="rose" />
              <StatCard label="Saldo actual" value={euro(totalOpening + monthlyTotals.balance)} tone="cyan" />
              <StatCard label="Cajas extra" value={euro(totalCashMovement.final)} tone="amber" />
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flowly-client-card rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-purple-950/10 backdrop-blur sm:p-5">
          <div className="mb-4 flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-100"><Plus size={20} /></div>
              <div><h2 className="font-black">Nuevo movimiento</h2><p className="text-xs text-slate-400">Puedes crear nuevas opciones desde los desplegables de origen, destino, medio y tipo.</p></div>
            </div>
            <Field label="Mes visible"><input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="min-h-[46px] rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-cyan-300/70" /></Field>
          </div>

          <div className="grid gap-3 xl:grid-cols-[125px_150px_1fr_1fr_1fr_1fr_1fr_135px_1.2fr_auto]">
            <Field label="Movimiento"><select value={type} onChange={(event) => setType(event.target.value as MovementType)} className="field-control capitalize"><option value="ingreso">Ingreso</option><option value="gasto">Gasto</option></select></Field>
            <Field label="Fecha"><div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="field-control pl-10" /></div></Field>
            <Field label="Negocio"><select value={business} onChange={(event) => setBusiness(event.target.value as BusinessName)} className="field-control">{businesses.map((option) => <option key={option}>{option}</option>)}</select></Field>
            <Field label="Origen dinero"><CustomSelect value={originAccount} options={accountOptions} onChange={setOriginAccount} onAdd={() => addCustomOption("origen/destino", accountOptions, setAccountOptions, "flowly-account-options", setOriginAccount)} /></Field>
            <Field label="Destino dinero"><CustomSelect value={destinationAccount} options={accountOptions} onChange={setDestinationAccount} onAdd={() => addCustomOption("origen/destino", accountOptions, setAccountOptions, "flowly-account-options", setDestinationAccount)} /></Field>
            <Field label={type === "ingreso" ? "Por dónde ingresa" : "Por dónde se paga"}><CustomSelect value={channel} options={channelOptions} onChange={setChannel} onAdd={() => addCustomOption("medio", channelOptions, setChannelOptions, "flowly-channel-options", setChannel)} /></Field>
            <Field label="Tipo"><CustomSelect value={category} options={categoryOptions} onChange={setCategory} onAdd={() => addCustomOption("tipo", categoryOptions, setCategoryOptions, "flowly-category-options", setCategory)} /></Field>
            <Field label="Importe"><input type="number" inputMode="decimal" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="field-control" placeholder="0,00 €" /></Field>
            <Field label="Observación"><input value={note} onChange={(event) => setNote(event.target.value)} className="field-control" placeholder="Opcional" /></Field>
            <div className="flex items-end"><button type="submit" disabled={saving} className="h-[50px] rounded-2xl bg-cyan-300 px-6 font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Guardando" : "Añadir"}</button></div>
          </div>
          {formError ? <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm font-semibold text-rose-200">{formError}</p> : null}
        </form>

        <MovementPanel
          title="Movimientos del mes"
          subtitle={loading ? "Cargando movimientos desde Supabase..." : "Filtra por fecha, origen, destino, medio o tipo. Se muestran 10 registros inicialmente."}
          entries={entries}
          options={{ accounts: accountOptions, channels: channelOptions, categories: categoryOptions }}
          emptyText="Todavía no hay movimientos. Añade el primer ingreso o gasto desde la barra superior."
          onDelete={handleDelete}
          deletingId={deletingId}
        />

        <section className="grid gap-5 xl:grid-cols-3">
          {entriesByBusiness.map((group) => (
            <div key={group.business} className="flowly-client-card rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-purple-950/10 backdrop-blur">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div><p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200/70">Negocio</p><h3 className="mt-1 text-2xl font-black">{group.business}</h3></div>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-slate-300">{group.entries.length} líneas</span>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5 xl:grid-cols-2 2xl:grid-cols-5">
                <MiniStat label="Saldo anterior" value={euro(group.opening)} tone="purple" />
                <MiniStat label="Ingresos" value={euro(group.totals.income)} tone="emerald" />
                <MiniStat label="Gastos" value={euro(group.totals.expenses)} tone="rose" />
                <MiniStat label="Saldo actual" value={euro(group.final)} tone="cyan" />
                <MiniStat label="Caja extra" value={euro(group.cashFinal)} tone="amber" />
              </div>
              <MovementTableWithFilters
                entries={group.entries}
                compact
                options={{ accounts: accountOptions, channels: channelOptions, categories: categoryOptions }}
                emptyText={`Sin movimientos para ${group.business}.`}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
              <div className="mt-5 rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
                <CashHeader business={group.business} opening={openingCashBalances[group.business]} cashIn={group.cashIn} cashOut={group.cashOut} balance={group.cashFinal} count={group.cashRows.length} />
                <CashTable rows={group.cashRows} onDelete={handleDelete} deletingId={deletingId} />
              </div>
            </div>
          ))}
        </section>
      </section>
      <style jsx global>{`
        .field-control { min-height: 50px; width: 100%; border-radius: 1rem; border: 1px solid rgba(255,255,255,.1); background: rgba(0,0,0,.3); padding: 0 1rem; color: white; outline: none; transition: border-color 160ms ease; }
        .field-control:focus { border-color: rgba(103,232,249,.7); }
        .field-control option { background: #0f172a; color: white; }
      `}</style>
    </main>
  );
}

function CustomSelect({ value, options, onChange, onAdd }: { value: string; options: string[]; onChange: (value: string) => void; onAdd: () => void }) {
  return (
    <select value={value} onChange={(event) => event.target.value === "__add__" ? onAdd() : onChange(event.target.value)} className="field-control">
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
      <option value="__add__">＋ Añadir nueva opción…</option>
    </select>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="space-y-2"><span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</span>{children}</label>;
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: "emerald" | "rose" | "cyan" | "amber" | "purple" }) {
  const classes = { emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100", rose: "border-rose-300/20 bg-rose-300/10 text-rose-100", cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100", amber: "border-amber-300/25 bg-amber-300/10 text-amber-100", purple: "border-purple-300/20 bg-purple-300/10 text-purple-100" }[tone];
  return <div className={`rounded-2xl border p-4 ${classes}`}><p className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-80">{label}</p><p className="mt-2 text-xl font-black">{value}</p></div>;
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: "emerald" | "rose" | "cyan" | "amber" | "purple" }) {
  const classes = { emerald: "bg-emerald-300/10 text-emerald-100", rose: "bg-rose-300/10 text-rose-100", cyan: "bg-cyan-300/10 text-cyan-100", amber: "bg-amber-300/10 text-amber-100", purple: "bg-purple-300/10 text-purple-100" }[tone];
  return <div className={`rounded-2xl p-3 ${classes}`}><p className="text-[9px] font-black uppercase tracking-[0.1em] opacity-70">{label}</p><p className="mt-1 text-sm font-black">{value}</p></div>;
}

function MovementPanel(props: { title: string; subtitle: string; entries: AccountingEntry[]; options: FilterOptions; emptyText: string; onDelete: (entry: AccountingEntry) => void; deletingId: string | null }) {
  return (
    <section className="flowly-client-card rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-cyan-950/10 backdrop-blur">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-300/15 text-purple-100"><ReceiptText size={20} /></div><div><h2 className="font-black">{props.title}</h2><p className="text-xs text-slate-400">{props.subtitle}</p></div></div>
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-bold text-slate-300 sm:flex"><WalletCards size={15} /> {props.entries.length} movimientos</div>
      </div>
      <MovementTableWithFilters {...props} />
    </section>
  );
}

type FilterOptions = { accounts: string[]; channels: string[]; categories: string[] };

function MovementTableWithFilters({ entries, options, emptyText, compact = false, onDelete, deletingId }: { entries: AccountingEntry[]; options: FilterOptions; emptyText: string; compact?: boolean; onDelete: (entry: AccountingEntry) => void; deletingId: string | null }) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [visibleCount, setVisibleCount] = useState(10);
  const filtered = useMemo(() => entries.filter((entry) =>
    (!filters.date || entry.date === filters.date) &&
    (!filters.origin || entry.originAccount === filters.origin) &&
    (!filters.destination || entry.destinationAccount === filters.destination) &&
    (!filters.channel || entry.channel === filters.channel) &&
    (!filters.category || entry.category === filters.category) &&
    (!filters.movement || entry.type === filters.movement)
  ), [entries, filters]);

  useEffect(() => { setVisibleCount(10); }, [filters, entries.length]);
  const activeFilters = Object.values(filters).filter(Boolean).length;

  return (
    <div>
      <div className="mb-4 rounded-3xl border border-white/10 bg-black/20 p-3">
        <div className="mb-3 flex items-center justify-between"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-300"><Filter size={14} /> Filtros {activeFilters ? `(${activeFilters})` : ""}</p>{activeFilters ? <button type="button" onClick={() => setFilters(emptyFilters)} className="flex items-center gap-1 text-xs font-bold text-cyan-200"><X size={13} /> Limpiar</button> : null}</div>
        <div className={`grid gap-2 ${compact ? "sm:grid-cols-2 2xl:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-6"}`}>
          <FilterInput label="Fecha" type="date" value={filters.date} onChange={(value) => setFilters((current) => ({ ...current, date: value }))} />
          <FilterSelect label="Origen" value={filters.origin} options={options.accounts} onChange={(value) => setFilters((current) => ({ ...current, origin: value }))} />
          <FilterSelect label="Destino" value={filters.destination} options={options.accounts} onChange={(value) => setFilters((current) => ({ ...current, destination: value }))} />
          <FilterSelect label="Medio" value={filters.channel} options={options.channels} onChange={(value) => setFilters((current) => ({ ...current, channel: value }))} />
          <FilterSelect label="Tipo" value={filters.category} options={options.categories} onChange={(value) => setFilters((current) => ({ ...current, category: value }))} />
          <FilterSelect label="Movimiento" value={filters.movement} options={["ingreso", "gasto"]} onChange={(value) => setFilters((current) => ({ ...current, movement: value }))} />
        </div>
      </div>
      <MovementsTable entries={filtered.slice(0, visibleCount)} emptyText={emptyText} compact={compact} onDelete={onDelete} deletingId={deletingId} />
      {filtered.length > 10 ? <div className="mt-4 flex justify-center"><button type="button" onClick={() => setVisibleCount((current) => current >= filtered.length ? 10 : current + 10)} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/20">{visibleCount >= filtered.length ? <><ChevronUp size={16} /> Mostrar menos</> : <><ChevronDown size={16} /> Mostrar más ({Math.min(10, filtered.length - visibleCount)})</>}</button></div> : null}
      {entries.length > 0 && filtered.length === 0 ? <p className="mt-3 text-center text-xs text-slate-400">No hay movimientos que coincidan con los filtros seleccionados.</p> : null}
    </div>
  );
}

function FilterInput({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (value: string) => void }) {
  return <label className="space-y-1"><span className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-xs text-white outline-none focus:border-cyan-300/60" /></label>;
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="space-y-1"><span className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-xs text-white outline-none focus:border-cyan-300/60"><option value="">Todos</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function CashHeader({ business, opening, cashIn, cashOut, balance, count }: { business: string; opening: number; cashIn: number; cashOut: number; balance: number; count: number }) {
  return (
    <div className="mb-4">
      <div className="mb-3 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-100"><Vault size={18} /></div><div><h4 className="font-black">Caja extra · {business}</h4><p className="text-[11px] text-slate-400">Saldo independiente y acumulado para futuros meses.</p></div></div>
      <div className="grid grid-cols-2 gap-2 2xl:grid-cols-5"><MiniStat label="Anterior" value={euro(opening)} tone="purple" /><MiniStat label="Entradas" value={euro(cashIn)} tone="emerald" /><MiniStat label="Salidas" value={euro(cashOut)} tone="rose" /><MiniStat label="Saldo actual" value={euro(balance)} tone="amber" /><div className="rounded-2xl bg-black/20 p-3 text-slate-200"><p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">Líneas</p><p className="mt-1 text-sm font-black">{count}</p></div></div>
    </div>
  );
}

function MovementsTable({ entries, emptyText, compact = false, onDelete, deletingId }: { entries: AccountingEntry[]; emptyText: string; compact?: boolean; onDelete: (entry: AccountingEntry) => void; deletingId: string | null }) {
  if (entries.length === 0) return <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-8 text-center text-sm text-slate-400">{emptyText}</div>;
  return (
    <div className="overflow-x-auto"><table className={`w-full text-left text-sm ${compact ? "min-w-[960px]" : "min-w-[1120px]"}`}><thead className="text-xs uppercase tracking-[0.18em] text-slate-500"><tr className="border-b border-white/10"><th className="px-4 py-3">Movimiento</th><th className="px-4 py-3">Fecha</th>{!compact ? <th className="px-4 py-3">Negocio</th> : null}<th className="px-4 py-3">Origen</th><th className="px-4 py-3">Destino</th><th className="px-4 py-3">Medio</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3 text-right">Importe</th><th className="px-4 py-3">Observación</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id} className="border-b border-white/5 text-slate-200 last:border-0"><td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${entry.type === "ingreso" ? "bg-emerald-300/15 text-emerald-200" : "bg-rose-300/15 text-rose-200"}`}>{entry.type}</span></td><td className="px-4 py-4">{entry.date}</td>{!compact ? <td className="px-4 py-4 font-semibold">{entry.business}</td> : null}<td className="px-4 py-4">{entry.originAccount}</td><td className="px-4 py-4">{entry.destinationAccount}</td><td className="px-4 py-4">{entry.channel}</td><td className="px-4 py-4">{entry.category}</td><td className={`px-4 py-4 text-right font-black ${entry.type === "ingreso" ? "text-emerald-200" : "text-rose-200"}`}>{entry.type === "gasto" ? "-" : "+"}{euro(entry.amount)}</td><td className="px-4 py-4 text-slate-400">{entry.note || "—"}</td><td className="px-4 py-4 text-right"><button type="button" onClick={() => onDelete(entry)} disabled={deletingId === entry.id} className="inline-flex items-center gap-2 rounded-xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs font-black text-rose-200 transition hover:bg-rose-300/20 disabled:opacity-50"><Trash2 size={15} />{deletingId === entry.id ? "Eliminando" : "Eliminar"}</button></td></tr>)}</tbody></table></div>
  );
}

function CashTable({ rows, onDelete, deletingId }: { rows: CashRow[]; onDelete: (entry: AccountingEntry) => void; deletingId: string | null }) {
  if (rows.length === 0) return <div className="rounded-2xl border border-dashed border-amber-300/20 bg-black/20 p-5 text-center text-xs text-slate-400">Sin movimientos de caja extra este mes.</div>;
  const recent = rows.slice().reverse().slice(0, 10);
  return <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-xs"><thead className="uppercase tracking-[0.14em] text-slate-500"><tr className="border-b border-white/10"><th className="px-3 py-2">Fecha</th><th className="px-3 py-2">Medio</th><th className="px-3 py-2 text-right">Entrada</th><th className="px-3 py-2 text-right">Salida</th><th className="px-3 py-2 text-right">Saldo</th><th className="px-3 py-2 text-right">Acción</th></tr></thead><tbody>{recent.map((row) => <tr key={row.entry.id} className="border-b border-white/5"><td className="px-3 py-3">{row.entry.date}</td><td className="px-3 py-3">{row.entry.channel}</td><td className="px-3 py-3 text-right font-bold text-emerald-200">{row.cashIn ? euro(row.cashIn) : "—"}</td><td className="px-3 py-3 text-right font-bold text-rose-200">{row.cashOut ? euro(row.cashOut) : "—"}</td><td className="px-3 py-3 text-right font-black text-amber-100">{euro(row.balance)}</td><td className="px-3 py-3 text-right"><button type="button" onClick={() => onDelete(row.entry)} disabled={deletingId === row.entry.id} className="rounded-lg p-2 text-rose-200 hover:bg-rose-300/10"><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>;
}
