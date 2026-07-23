"use client";

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Filter,
  LockKeyhole,
  Pencil,
  Plus,
  ReceiptText,
  Settings,
  ShieldCheck,
  Trash2,
  Vault,
  X,
} from "lucide-react";

type AccountingEffect = "ingreso" | "gasto";
type BalanceMap = Record<string, number>;
type OptionCategory = "movement" | "business" | "origin" | "destination" | "channel" | "category" | "functionality";

type ConfigOption = {
  id: string;
  category: OptionCategory;
  label: string;
  accounting_effect?: AccountingEffect | null;
  active: boolean;
  sort_order: number;
};

type AccountingEntry = {
  id: string;
  type: string;
  effect: AccountingEffect;
  date: string;
  business: string;
  channel: string;
  category: string;
  functionality: string;
  amount: number;
  note: string;
  originAccount: string;
  destinationAccount: string;
  createdAt?: string;
};

type ApiEntry = {
  id: string;
  movement_type: string;
  movement_effect?: AccountingEffect | null;
  movement_date: string;
  business: string;
  channel: string;
  category: string;
  functionality?: string | null;
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

type CashRow = { entry: AccountingEntry; cashIn: number; cashOut: number; balance: number };

const ACCESS_PASSWORD = "Nosotrostarot1.";
const defaultOptions: Record<OptionCategory, Array<{ label: string; accounting_effect?: AccountingEffect }>> = {
  movement: [{ label: "Ingreso", accounting_effect: "ingreso" }, { label: "Gasto", accounting_effect: "gasto" }],
  business: [{ label: "Flowly" }, { label: "Celestial" }, { label: "Leonaris" }],
  origin: [{ label: "Banco" }, { label: "Caja extra" }],
  destination: [{ label: "Banco" }, { label: "Caja extra" }],
  channel: [{ label: "Square" }, { label: "Transferencia" }, { label: "Bizum" }, { label: "Tarjeta" }, { label: "Stripe" }, { label: "PayPal" }, { label: "Otro" }],
  category: [{ label: "recarga" }, { label: "facebook" }, { label: "pago tarotista" }, { label: "Deuda" }, { label: "Pago Centrales" }, { label: "Pago premium numbers" }, { label: "pago hubspot" }, { label: "otros" }, { label: "call400" }, { label: "Flowly" }],
  functionality: [{ label: "General" }],
};
const categoryLabels: Record<OptionCategory, string> = {
  movement: "Movimiento",
  business: "Negocio",
  origin: "Origen del dinero",
  destination: "Destino del dinero",
  channel: "Por dónde se paga",
  category: "Tipo",
  functionality: "Funcionamiento",
};
const emptyFilters: Filters = { date: "", origin: "", destination: "", channel: "", category: "", movement: "" };

function euro(value: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value || 0);
}
function today() { return new Date().toISOString().slice(0, 10); }
function currentMonth() { return new Date().toISOString().slice(0, 7); }
function optionValues(options: ConfigOption[], category: OptionCategory) {
  return options.filter((item) => item.category === category && item.active).sort((a, b) => a.sort_order - b.sort_order).map((item) => item.label);
}
function mergeHistoric(active: string[], historic: string[]) {
  return Array.from(new Set([...active, ...historic.filter(Boolean)]));
}
function mapEntry(entry: ApiEntry): AccountingEntry {
  return {
    id: entry.id,
    type: entry.movement_type,
    effect: entry.movement_effect === "gasto" || entry.movement_effect === "ingreso" ? entry.movement_effect : entry.movement_type.toLowerCase() === "gasto" ? "gasto" : "ingreso",
    date: entry.movement_date,
    business: entry.business,
    channel: entry.channel,
    category: entry.category,
    functionality: entry.functionality || "General",
    amount: Number(entry.amount) || 0,
    note: entry.note || "",
    originAccount: entry.origin_account || "Banco",
    destinationAccount: entry.destination_account || "Banco",
    createdAt: entry.created_at,
  };
}
function calculateTotals(entries: AccountingEntry[]) {
  const income = entries.filter((entry) => entry.effect === "ingreso").reduce((sum, entry) => sum + entry.amount, 0);
  const expenses = entries.filter((entry) => entry.effect === "gasto").reduce((sum, entry) => sum + entry.amount, 0);
  return { income, expenses, balance: income - expenses };
}
function calculateCashRows(entries: AccountingEntry[], openingBalance = 0) {
  const rows = entries.filter((entry) => entry.originAccount === "Caja extra" || entry.destinationAccount === "Caja extra").slice().sort((a, b) => `${a.date}-${a.createdAt || ""}`.localeCompare(`${b.date}-${b.createdAt || ""}`));
  let balance = openingBalance;
  return rows.map((entry) => {
    const cashIn = entry.destinationAccount === "Caja extra" ? entry.amount : 0;
    const cashOut = entry.originAccount === "Caja extra" ? entry.amount : 0;
    balance += cashIn - cashOut;
    return { entry, cashIn, cashOut, balance };
  });
}
function fallbackConfigOptions(): ConfigOption[] {
  return (Object.keys(defaultOptions) as OptionCategory[]).flatMap((category) => defaultOptions[category].map((item, index) => ({
    id: `fallback-${category}-${index}`,
    category,
    label: item.label,
    accounting_effect: item.accounting_effect || null,
    active: true,
    sort_order: (index + 1) * 10,
  })));
}

export default function ContabilidadClient() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [configOptions, setConfigOptions] = useState<ConfigOption[]>(fallbackConfigOptions());
  const [type, setType] = useState("Ingreso");
  const [date, setDate] = useState(today());
  const [month, setMonth] = useState(currentMonth());
  const [business, setBusiness] = useState("Flowly");
  const [originAccount, setOriginAccount] = useState("Banco");
  const [destinationAccount, setDestinationAccount] = useState("Banco");
  const [channel, setChannel] = useState("Square");
  const [category, setCategory] = useState("recarga");
  const [functionality, setFunctionality] = useState("General");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [openingBalances, setOpeningBalances] = useState<BalanceMap>({});
  const [openingCashBalances, setOpeningCashBalances] = useState<BalanceMap>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [managerCategory, setManagerCategory] = useState<OptionCategory | null>(null);
  const [addCategory, setAddCategory] = useState<OptionCategory | null>(null);

  const movementOptions = optionValues(configOptions, "movement");
  const businessOptions = optionValues(configOptions, "business");
  const originOptions = optionValues(configOptions, "origin");
  const destinationOptions = optionValues(configOptions, "destination");
  const channelOptions = optionValues(configOptions, "channel");
  const categoryOptions = optionValues(configOptions, "category");
  const functionalityOptions = optionValues(configOptions, "functionality");
  const selectedMovement = configOptions.find((item) => item.category === "movement" && item.active && item.label === type);
  const selectedEffect: AccountingEffect = selectedMovement?.accounting_effect === "gasto" ? "gasto" : "ingreso";

  const filterAccounts = useMemo(() => mergeHistoric(mergeHistoric(originOptions, destinationOptions), entries.flatMap((entry) => [entry.originAccount, entry.destinationAccount])), [originOptions, destinationOptions, entries]);
  const filterChannels = useMemo(() => mergeHistoric(channelOptions, entries.map((entry) => entry.channel)), [channelOptions, entries]);
  const filterCategories = useMemo(() => mergeHistoric(categoryOptions, entries.map((entry) => entry.category)), [categoryOptions, entries]);
  const filterMovements = useMemo(() => mergeHistoric(movementOptions, entries.map((entry) => entry.type)), [movementOptions, entries]);

  const monthlyTotals = useMemo(() => calculateTotals(entries), [entries]);
  const allBusinessNames = useMemo(() => mergeHistoric(businessOptions, [...Object.keys(openingBalances), ...Object.keys(openingCashBalances), ...entries.map((entry) => entry.business)]), [businessOptions, entries, openingBalances, openingCashBalances]);
  const totalOpening = useMemo(() => allBusinessNames.reduce((sum, name) => sum + (openingBalances[name] || 0), 0), [allBusinessNames, openingBalances]);
  const totalOpeningCash = useMemo(() => allBusinessNames.reduce((sum, name) => sum + (openingCashBalances[name] || 0), 0), [allBusinessNames, openingCashBalances]);
  const allCashRows = useMemo(() => calculateCashRows(entries, totalOpeningCash), [entries, totalOpeningCash]);
  const totalCashMovement = useMemo(() => {
    const incoming = allCashRows.reduce((sum, row) => sum + row.cashIn, 0);
    const outgoing = allCashRows.reduce((sum, row) => sum + row.cashOut, 0);
    return { final: totalOpeningCash + incoming - outgoing };
  }, [allCashRows, totalOpeningCash]);
  const entriesByBusiness = useMemo(() => allBusinessNames.map((name) => {
    const businessEntries = entries.filter((entry) => entry.business === name);
    const totals = calculateTotals(businessEntries);
    const cashRows = calculateCashRows(businessEntries, openingCashBalances[name] || 0);
    const cashIn = cashRows.reduce((sum, row) => sum + row.cashIn, 0);
    const cashOut = cashRows.reduce((sum, row) => sum + row.cashOut, 0);
    return { business: name, entries: businessEntries, totals, opening: openingBalances[name] || 0, final: (openingBalances[name] || 0) + totals.balance, cashRows, cashIn, cashOut, cashFinal: (openingCashBalances[name] || 0) + cashIn - cashOut };
  }), [allBusinessNames, entries, openingBalances, openingCashBalances]);

  async function loadOptions() {
    const response = await fetch("/api/contabilidad/opciones", { headers: { "x-contabilidad-password": ACCESS_PASSWORD } });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error || "No se pudieron cargar las opciones configurables.");
    setConfigOptions(payload.options || []);
  }

  useEffect(() => {
    if (!unlocked) return;
    loadOptions().catch((error) => setFormError(error instanceof Error ? error.message : "No se pudieron cargar las opciones."));
  }, [unlocked]);

  useEffect(() => {
    if (!unlocked) return;
    let cancelled = false;
    async function loadEntries() {
      setLoading(true);
      setFormError("");
      try {
        const response = await fetch(`/api/contabilidad/movimientos?month=${encodeURIComponent(month)}`, { headers: { "x-contabilidad-password": ACCESS_PASSWORD } });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || "No se pudieron cargar los movimientos.");
        if (!cancelled) {
          setEntries((payload.entries || []).map(mapEntry));
          setOpeningBalances(payload.openingBalances || {});
          setOpeningCashBalances(payload.openingCashBalances || {});
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

  useEffect(() => {
    if (!movementOptions.includes(type) && movementOptions[0]) setType(movementOptions[0]);
    if (!businessOptions.includes(business) && businessOptions[0]) setBusiness(businessOptions[0]);
    if (!originOptions.includes(originAccount) && originOptions[0]) setOriginAccount(originOptions[0]);
    if (!destinationOptions.includes(destinationAccount) && destinationOptions[0]) setDestinationAccount(destinationOptions[0]);
    if (!channelOptions.includes(channel) && channelOptions[0]) setChannel(channelOptions[0]);
    if (!categoryOptions.includes(category) && categoryOptions[0]) setCategory(categoryOptions[0]);
    if (!functionalityOptions.includes(functionality) && functionalityOptions[0]) setFunctionality(functionalityOptions[0]);
  }, [configOptions]);

  const handleAccess = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.trim() === ACCESS_PASSWORD) { setUnlocked(true); setAccessError(""); }
    else setAccessError("Contraseña incorrecta.");
  };

  const handleDelete = async (entry: AccountingEntry) => {
    if (!window.confirm(`¿Seguro que deseas eliminar este movimiento de ${euro(entry.amount)}? Esta acción no se puede deshacer.`)) return;
    setDeletingId(entry.id);
    setFormError("");
    try {
      const response = await fetch(`/api/contabilidad/movimientos?id=${encodeURIComponent(entry.id)}`, { method: "DELETE", headers: { "x-contabilidad-password": ACCESS_PASSWORD } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "No se pudo eliminar el movimiento.");
      setEntries((current) => current.filter((item) => item.id !== entry.id));
    } catch (error) { setFormError(error instanceof Error ? error.message : "No se pudo eliminar el movimiento."); }
    finally { setDeletingId(null); }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericAmount = Number(amount.replace(",", "."));
    if (!date || !business || !type || !channel || !category || !functionality || !originAccount || !destinationAccount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError("Completa los campos obligatorios y pon un importe válido.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const response = await fetch("/api/contabilidad/movimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-contabilidad-password": ACCESS_PASSWORD },
        body: JSON.stringify({ type, effect: selectedEffect, date, business, originAccount, destinationAccount, channel, category, functionality, amount: numericAmount, note: note.trim() }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "No se pudo guardar el movimiento.");
      const savedEntry = mapEntry(payload.entry);
      if (savedEntry.date.slice(0, 7) === month) setEntries((current) => [savedEntry, ...current]);
      else setMonth(savedEntry.date.slice(0, 7));
      setAmount("");
      setNote("");
    } catch (error) { setFormError(error instanceof Error ? error.message : "No se pudo guardar el movimiento."); }
    finally { setSaving(false); }
  };

  if (!unlocked) return (
    <main className="flowly-app-shell min-h-screen px-6 py-10 text-white"><section className="mx-auto flex min-h-[78vh] max-w-xl items-center justify-center"><form onSubmit={handleAccess} className="flowly-client-card w-full rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-purple-950/30 backdrop-blur"><div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200"><LockKeyhole size={26} /></div><p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-200/70">Área privada</p><h1 className="mt-3 text-3xl font-black tracking-tight">Contabilidad mensual</h1><p className="mt-3 text-sm leading-6 text-slate-300">Introduce la contraseña para acceder al panel de ingresos, gastos y cajas independientes.</p><div className="mt-8 space-y-3"><label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Contraseña</label><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none transition focus:border-cyan-300/70" placeholder="••••••••••••" />{accessError ? <p className="text-sm font-semibold text-rose-300">{accessError}</p> : null}</div><button type="submit" className="mt-6 w-full rounded-2xl bg-cyan-300 px-5 py-4 font-black text-slate-950 transition hover:bg-cyan-200">Entrar</button></form></section></main>
  );

  const selectProps = (categoryName: OptionCategory, value: string, setValue: (value: string) => void, options: string[]) => ({ category: categoryName, value, options, onChange: setValue, onAdd: () => setAddCategory(categoryName), onManage: () => setManagerCategory(categoryName) });

  return (
    <main className="flowly-app-shell min-h-screen px-5 py-8 text-white sm:px-8">
      <section className="mx-auto max-w-[1600px] space-y-6">
        <header className="flowly-client-hero overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-400/12 via-purple-500/10 to-black p-6 shadow-2xl shadow-cyan-950/20 sm:p-8"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.32em] text-cyan-200/75"><ShieldCheck size={16} /> Privado</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Contabilidad mensual</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Los saldos anteriores se arrastran automáticamente y cada negocio conserva su propia caja extra.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:min-w-[760px] xl:grid-cols-5"><StatCard label="Saldo anterior" value={euro(totalOpening)} tone="purple" /><StatCard label="Ingresos del mes" value={euro(monthlyTotals.income)} tone="emerald" /><StatCard label="Gastos del mes" value={euro(monthlyTotals.expenses)} tone="rose" /><StatCard label="Saldo actual" value={euro(totalOpening + monthlyTotals.balance)} tone="cyan" /><StatCard label="Cajas extra" value={euro(totalCashMovement.final)} tone="amber" /></div></div></header>

        <form onSubmit={handleSubmit} className="flowly-client-card rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-purple-950/10 backdrop-blur sm:p-5">
          <div className="mb-4 flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-100"><Plus size={20} /></div><div><h2 className="font-black">Nuevo movimiento</h2><p className="text-xs text-slate-400">Añade o administra las opciones desde cada desplegable.</p></div></div><Field label="Mes visible"><input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="min-h-[46px] rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-cyan-300/70" /></Field></div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-[1fr_145px_1fr_1fr_1fr_1fr_1fr_1fr_135px_1.2fr_auto]">
            <Field label="Movimiento"><ConfigurableSelect {...selectProps("movement", type, setType, movementOptions)} /></Field>
            <Field label="Fecha"><div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="field-control pl-10" /></div></Field>
            <Field label="Negocio"><ConfigurableSelect {...selectProps("business", business, setBusiness, businessOptions)} /></Field>
            <Field label="Origen del dinero"><ConfigurableSelect {...selectProps("origin", originAccount, setOriginAccount, originOptions)} /></Field>
            <Field label="Destino del dinero"><ConfigurableSelect {...selectProps("destination", destinationAccount, setDestinationAccount, destinationOptions)} /></Field>
            <Field label={selectedEffect === "ingreso" ? "Por dónde ingresa" : "Por dónde se paga"}><ConfigurableSelect {...selectProps("channel", channel, setChannel, channelOptions)} /></Field>
            <Field label="Tipo"><ConfigurableSelect {...selectProps("category", category, setCategory, categoryOptions)} /></Field>
            <Field label="Funcionamiento"><ConfigurableSelect {...selectProps("functionality", functionality, setFunctionality, functionalityOptions)} /></Field>
            <Field label="Importe"><input type="number" inputMode="decimal" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="field-control" placeholder="0,00 €" /></Field>
            <Field label="Observación"><input value={note} onChange={(event) => setNote(event.target.value)} className="field-control" placeholder="Opcional" /></Field>
            <div className="flex items-end"><button type="submit" disabled={saving} className="h-[50px] rounded-2xl bg-cyan-300 px-6 font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Guardando" : "Añadir"}</button></div>
          </div>
          {formError ? <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm font-semibold text-rose-200">{formError}</p> : null}
        </form>

        <section className="flowly-client-card rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-purple-950/10 backdrop-blur"><div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-300/15 text-purple-100"><ReceiptText size={20} /></div><div><h2 className="font-black">Movimientos del mes</h2><p className="text-xs text-slate-400">{loading ? "Cargando..." : `${entries.length} movimientos registrados`}</p></div></div></div><MovementTableWithFilters entries={entries} options={{ accounts: filterAccounts, channels: filterChannels, categories: filterCategories, movements: filterMovements }} emptyText="No hay movimientos en este mes." onDelete={handleDelete} deletingId={deletingId} /></section>

        <section className="grid gap-5 xl:grid-cols-3">
          {entriesByBusiness.map((group) => <div key={group.business} className="flowly-client-card rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-purple-950/10 backdrop-blur"><div className="mb-4 flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200/70">Negocio</p><h3 className="mt-1 text-2xl font-black">{group.business}</h3></div><span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-slate-300">{group.entries.length} líneas</span></div><div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5 xl:grid-cols-2 2xl:grid-cols-5"><MiniStat label="Saldo anterior" value={euro(group.opening)} tone="purple" /><MiniStat label="Ingresos" value={euro(group.totals.income)} tone="emerald" /><MiniStat label="Gastos" value={euro(group.totals.expenses)} tone="rose" /><MiniStat label="Saldo actual" value={euro(group.final)} tone="cyan" /><MiniStat label="Caja extra" value={euro(group.cashFinal)} tone="amber" /></div><MovementTableWithFilters entries={group.entries} compact options={{ accounts: filterAccounts, channels: filterChannels, categories: filterCategories, movements: filterMovements }} emptyText={`Sin movimientos para ${group.business}.`} onDelete={handleDelete} deletingId={deletingId} /><div className="mt-5 rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-4"><CashHeader business={group.business} opening={openingCashBalances[group.business] || 0} cashIn={group.cashIn} cashOut={group.cashOut} balance={group.cashFinal} count={group.cashRows.length} /><CashTable rows={group.cashRows} onDelete={handleDelete} deletingId={deletingId} /></div></div>)}
        </section>
      </section>

      {addCategory ? <OptionEditorModal category={addCategory} title={`Añadir opción · ${categoryLabels[addCategory]}`} onClose={() => setAddCategory(null)} onSaved={async (saved) => { await loadOptions(); setAddCategory(null); if (saved.category === "movement") setType(saved.label); if (saved.category === "business") setBusiness(saved.label); if (saved.category === "origin") setOriginAccount(saved.label); if (saved.category === "destination") setDestinationAccount(saved.label); if (saved.category === "channel") setChannel(saved.label); if (saved.category === "category") setCategory(saved.label); if (saved.category === "functionality") setFunctionality(saved.label); }} setError={setFormError} /> : null}
      {managerCategory ? <OptionsManagerModal category={managerCategory} options={configOptions.filter((item) => item.category === managerCategory && item.active)} onClose={() => setManagerCategory(null)} onChanged={loadOptions} setError={setFormError} /> : null}
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="space-y-1.5"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</span>{children}</label>; }
function ConfigurableSelect({ category, value, options, onChange, onAdd, onManage }: { category: OptionCategory; value: string; options: string[]; onChange: (value: string) => void; onAdd: () => void; onManage: () => void }) {
  return <div className="flex gap-1.5"><select value={value} onChange={(event) => { if (event.target.value === "__add__") onAdd(); else onChange(event.target.value); }} className="field-control min-w-0 flex-1"><option value="" disabled>Selecciona</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}<option value="__add__">➕ Añadir nueva opción</option></select><button type="button" onClick={onManage} title={`Administrar ${categoryLabels[category]}`} className="flex h-[50px] w-[46px] shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-100"><Settings size={17} /></button></div>;
}
function OptionEditorModal({ category, title, initial, onClose, onSaved, setError }: { category: OptionCategory; title: string; initial?: ConfigOption; onClose: () => void; onSaved: (option: ConfigOption) => void | Promise<void>; setError: (error: string) => void }) {
  const [label, setLabel] = useState(initial?.label || "");
  const [effect, setEffect] = useState<AccountingEffect>(initial?.accounting_effect === "gasto" ? "gasto" : "ingreso");
  const [saving, setSaving] = useState(false);
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch("/api/contabilidad/opciones", { method: initial ? "PATCH" : "POST", headers: { "Content-Type": "application/json", "x-contabilidad-password": ACCESS_PASSWORD }, body: JSON.stringify({ id: initial?.id, category, label: label.trim(), accountingEffect: category === "movement" ? effect : null }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "No se pudo guardar la opción.");
      await onSaved(payload.option);
    } catch (error) { setError(error instanceof Error ? error.message : "No se pudo guardar la opción."); }
    finally { setSaving(false); }
  }
  return <Modal title={title} onClose={onClose}><form onSubmit={save} className="space-y-4"><Field label="Nombre de la opción"><input autoFocus value={label} onChange={(event) => setLabel(event.target.value)} maxLength={80} className="field-control" placeholder="Escribe el nuevo valor" /></Field>{category === "movement" ? <Field label="Comportamiento contable"><select value={effect} onChange={(event) => setEffect(event.target.value as AccountingEffect)} className="field-control"><option value="ingreso">Cuenta como ingreso</option><option value="gasto">Cuenta como gasto</option></select></Field> : null}<div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-300">Cancelar</button><button type="submit" disabled={saving || !label.trim()} className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-50">{saving ? "Guardando" : "Guardar"}</button></div></form></Modal>;
}
function OptionsManagerModal({ category, options, onClose, onChanged, setError }: { category: OptionCategory; options: ConfigOption[]; onClose: () => void; onChanged: () => Promise<void>; setError: (error: string) => void }) {
  const [editing, setEditing] = useState<ConfigOption | null>(null);
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  async function remove(option: ConfigOption) {
    if (!window.confirm(`¿Eliminar "${option.label}"? Los movimientos antiguos seguirán mostrándola.`)) return;
    setBusyId(option.id); setError("");
    try { const response = await fetch(`/api/contabilidad/opciones?id=${encodeURIComponent(option.id)}`, { method: "DELETE", headers: { "x-contabilidad-password": ACCESS_PASSWORD } }); const payload = await response.json(); if (!response.ok) throw new Error(payload?.error || "No se pudo eliminar la opción."); await onChanged(); }
    catch (error) { setError(error instanceof Error ? error.message : "No se pudo eliminar la opción."); }
    finally { setBusyId(null); }
  }
  if (editing) return <OptionEditorModal category={category} title={`Editar · ${categoryLabels[category]}`} initial={editing} onClose={() => setEditing(null)} onSaved={async () => { await onChanged(); setEditing(null); }} setError={setError} />;
  if (adding) return <OptionEditorModal category={category} title={`Añadir opción · ${categoryLabels[category]}`} onClose={() => setAdding(false)} onSaved={async () => { await onChanged(); setAdding(false); }} setError={setError} />;
  return <Modal title={`Administrar · ${categoryLabels[category]}`} onClose={onClose}><div className="space-y-3"><button type="button" onClick={() => setAdding(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-black text-cyan-100"><Plus size={16} /> Añadir nueva opción</button><div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">{options.length ? options.map((option) => <div key={option.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-3"><div><p className="font-bold text-white">{option.label}</p>{category === "movement" ? <p className="mt-0.5 text-[11px] text-slate-400">Cuenta como {option.accounting_effect || "ingreso"}</p> : null}</div><div className="flex gap-2"><button type="button" onClick={() => setEditing(option)} className="rounded-xl border border-white/10 p-2 text-slate-300 hover:text-cyan-100"><Pencil size={15} /></button><button type="button" onClick={() => remove(option)} disabled={busyId === option.id} className="rounded-xl border border-rose-300/20 p-2 text-rose-200 disabled:opacity-50"><Trash2 size={15} /></button></div></div>) : <p className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-400">No hay opciones activas.</p>}</div></div></Modal>;
}
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) { return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-950 p-5 shadow-2xl shadow-black/60"><div className="mb-5 flex items-center justify-between"><h3 className="text-lg font-black text-white">{title}</h3><button type="button" onClick={onClose} className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white"><X size={18} /></button></div>{children}</div></div>; }
function StatCard({ label, value, tone }: { label: string; value: string; tone: "purple" | "emerald" | "rose" | "cyan" | "amber" }) { const tones = { purple: "text-purple-200", emerald: "text-emerald-200", rose: "text-rose-200", cyan: "text-cyan-200", amber: "text-amber-200" }; return <div className="rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p><p className={`mt-1 text-base font-black ${tones[tone]}`}>{value}</p></div>; }
function MiniStat({ label, value, tone }: { label: string; value: string; tone: "purple" | "emerald" | "rose" | "cyan" | "amber" }) { return <StatCard label={label} value={value} tone={tone} />; }
type FilterOptions = { accounts: string[]; channels: string[]; categories: string[]; movements: string[] };
function MovementTableWithFilters({ entries, options, emptyText, compact = false, onDelete, deletingId }: { entries: AccountingEntry[]; options: FilterOptions; emptyText: string; compact?: boolean; onDelete: (entry: AccountingEntry) => void; deletingId: string | null }) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [visibleCount, setVisibleCount] = useState(10);
  const filtered = useMemo(() => entries.filter((entry) => (!filters.date || entry.date === filters.date) && (!filters.origin || entry.originAccount === filters.origin) && (!filters.destination || entry.destinationAccount === filters.destination) && (!filters.channel || entry.channel === filters.channel) && (!filters.category || entry.category === filters.category) && (!filters.movement || entry.type === filters.movement)), [entries, filters]);
  useEffect(() => { setVisibleCount(10); }, [filters, entries.length]);
  const activeFilters = Object.values(filters).filter(Boolean).length;
  return <div><div className="mb-4 rounded-3xl border border-white/10 bg-black/20 p-3"><div className="mb-3 flex items-center justify-between"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-300"><Filter size={14} /> Filtros {activeFilters ? `(${activeFilters})` : ""}</p>{activeFilters ? <button type="button" onClick={() => setFilters(emptyFilters)} className="flex items-center gap-1 text-xs font-bold text-cyan-200"><X size={13} /> Limpiar</button> : null}</div><div className={`grid gap-2 ${compact ? "sm:grid-cols-2 2xl:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-6"}`}><FilterInput label="Fecha" type="date" value={filters.date} onChange={(value) => setFilters((current) => ({ ...current, date: value }))} /><FilterSelect label="Origen" value={filters.origin} options={options.accounts} onChange={(value) => setFilters((current) => ({ ...current, origin: value }))} /><FilterSelect label="Destino" value={filters.destination} options={options.accounts} onChange={(value) => setFilters((current) => ({ ...current, destination: value }))} /><FilterSelect label="Medio" value={filters.channel} options={options.channels} onChange={(value) => setFilters((current) => ({ ...current, channel: value }))} /><FilterSelect label="Tipo" value={filters.category} options={options.categories} onChange={(value) => setFilters((current) => ({ ...current, category: value }))} /><FilterSelect label="Movimiento" value={filters.movement} options={options.movements} onChange={(value) => setFilters((current) => ({ ...current, movement: value }))} /></div></div><MovementsTable entries={filtered.slice(0, visibleCount)} emptyText={emptyText} compact={compact} onDelete={onDelete} deletingId={deletingId} />{filtered.length > 10 ? <div className="mt-4 flex justify-center"><button type="button" onClick={() => setVisibleCount((current) => current >= filtered.length ? 10 : current + 10)} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/20">{visibleCount >= filtered.length ? <><ChevronUp size={16} /> Mostrar menos</> : <><ChevronDown size={16} /> Mostrar más ({Math.min(10, filtered.length - visibleCount)})</>}</button></div> : null}{entries.length > 0 && filtered.length === 0 ? <p className="mt-3 text-center text-xs text-slate-400">No hay movimientos que coincidan con los filtros seleccionados.</p> : null}</div>;
}
function FilterInput({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (value: string) => void }) { return <label className="space-y-1"><span className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-xs text-white outline-none focus:border-cyan-300/60" /></label>; }
function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="space-y-1"><span className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-xs text-white outline-none focus:border-cyan-300/60"><option value="">Todos</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
function CashHeader({ business, opening, cashIn, cashOut, balance, count }: { business: string; opening: number; cashIn: number; cashOut: number; balance: number; count: number }) { return <div className="mb-4"><div className="mb-3 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-100"><Vault size={18} /></div><div><h4 className="font-black">Caja extra · {business}</h4><p className="text-[11px] text-slate-400">Saldo independiente y acumulado para futuros meses.</p></div></div><div className="grid grid-cols-2 gap-2 2xl:grid-cols-5"><MiniStat label="Anterior" value={euro(opening)} tone="purple" /><MiniStat label="Entradas" value={euro(cashIn)} tone="emerald" /><MiniStat label="Salidas" value={euro(cashOut)} tone="rose" /><MiniStat label="Saldo actual" value={euro(balance)} tone="amber" /><div className="rounded-2xl bg-black/20 p-3 text-slate-200"><p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">Líneas</p><p className="mt-1 text-sm font-black">{count}</p></div></div></div>; }
function MovementsTable({ entries, emptyText, compact = false, onDelete, deletingId }: { entries: AccountingEntry[]; emptyText: string; compact?: boolean; onDelete: (entry: AccountingEntry) => void; deletingId: string | null }) {
  if (!entries.length) return <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-8 text-center text-sm text-slate-400">{emptyText}</div>;
  return <div className="overflow-x-auto"><table className={`w-full text-left text-sm ${compact ? "min-w-[1080px]" : "min-w-[1220px]"}`}><thead className="text-xs uppercase tracking-[0.18em] text-slate-500"><tr className="border-b border-white/10"><th className="px-4 py-3">Movimiento</th><th className="px-4 py-3">Fecha</th>{!compact ? <th className="px-4 py-3">Negocio</th> : null}<th className="px-4 py-3">Origen</th><th className="px-4 py-3">Destino</th><th className="px-4 py-3">Medio</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Funcionamiento</th><th className="px-4 py-3 text-right">Importe</th><th className="px-4 py-3">Observación</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id} className="border-b border-white/5 text-slate-200 last:border-0"><td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${entry.effect === "ingreso" ? "bg-emerald-300/15 text-emerald-200" : "bg-rose-300/15 text-rose-200"}`}>{entry.type}</span></td><td className="px-4 py-4">{entry.date}</td>{!compact ? <td className="px-4 py-4 font-semibold">{entry.business}</td> : null}<td className="px-4 py-4">{entry.originAccount}</td><td className="px-4 py-4">{entry.destinationAccount}</td><td className="px-4 py-4">{entry.channel}</td><td className="px-4 py-4">{entry.category}</td><td className="px-4 py-4">{entry.functionality}</td><td className={`px-4 py-4 text-right font-black ${entry.effect === "ingreso" ? "text-emerald-200" : "text-rose-200"}`}>{entry.effect === "gasto" ? "-" : "+"}{euro(entry.amount)}</td><td className="px-4 py-4 text-slate-400">{entry.note || "—"}</td><td className="px-4 py-4 text-right"><button type="button" onClick={() => onDelete(entry)} disabled={deletingId === entry.id} className="inline-flex items-center gap-2 rounded-xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs font-black text-rose-200 transition hover:bg-rose-300/20 disabled:opacity-50"><Trash2 size={15} />{deletingId === entry.id ? "Eliminando" : "Eliminar"}</button></td></tr>)}</tbody></table></div>;
}
function CashTable({ rows, onDelete, deletingId }: { rows: CashRow[]; onDelete: (entry: AccountingEntry) => void; deletingId: string | null }) { if (!rows.length) return <div className="rounded-2xl border border-dashed border-amber-300/20 bg-black/20 p-5 text-center text-xs text-slate-400">Sin movimientos de caja extra este mes.</div>; const recent = rows.slice().reverse().slice(0, 10); return <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-xs"><thead className="uppercase tracking-[0.14em] text-slate-500"><tr className="border-b border-white/10"><th className="px-3 py-2">Fecha</th><th className="px-3 py-2">Medio</th><th className="px-3 py-2 text-right">Entrada</th><th className="px-3 py-2 text-right">Salida</th><th className="px-3 py-2 text-right">Saldo</th><th className="px-3 py-2 text-right">Acción</th></tr></thead><tbody>{recent.map((row) => <tr key={row.entry.id} className="border-b border-white/5"><td className="px-3 py-3">{row.entry.date}</td><td className="px-3 py-3">{row.entry.channel}</td><td className="px-3 py-3 text-right font-bold text-emerald-200">{row.cashIn ? euro(row.cashIn) : "—"}</td><td className="px-3 py-3 text-right font-bold text-rose-200">{row.cashOut ? euro(row.cashOut) : "—"}</td><td className="px-3 py-3 text-right font-black text-amber-100">{euro(row.balance)}</td><td className="px-3 py-3 text-right"><button type="button" onClick={() => onDelete(row.entry)} disabled={deletingId === row.entry.id} className="rounded-lg p-2 text-rose-200 hover:bg-rose-300/10"><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>; }
