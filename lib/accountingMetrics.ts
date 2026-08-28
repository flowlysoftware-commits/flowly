export type AccountingMetricEntry = {
  id: string;
  type: "ingreso" | "gasto" | "traspaso";
  date: string;
  business: string;
  channel: string;
  category: string;
  amount: number;
  originAccount: string;
  destinationAccount: string;
};

export type AccountingMetricFilters = { business: string; method: string; type: string };
export type MetricSnapshot = { income: number; expenses: number; balance: number; cash: number; count: number };

export type AccountingBalanceEntry = {
  type: "ingreso" | "gasto" | "traspaso";
  business: string;
  amount: number;
  originAccount: string;
  destinationAccount: string;
};
export type BalanceEffects = { income: number; expenses: number; main: Record<string, number>; cash: Record<string, number> };

const cents = (value: number) => Math.round((Number(value) || 0) * 100);
const money = (value: number) => value / 100;
const normalized = (value: string) => String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
const extraCash = (value: string) => normalized(value) === "caja extra";
export const isExtraCashAccount = (value: string | null | undefined) => extraCash(String(value || ""));

function addBalance(target: Record<string, number>, key: string, amount: number) {
  if (key) target[key] = (target[key] || 0) + amount;
}

export function accountingBalanceEffects(entry: AccountingBalanceEntry, businessNames: Iterable<string>): BalanceEffects {
  const result: BalanceEffects = { income: 0, expenses: 0, main: {}, cash: {} };
  const amount = Number(entry.amount) || 0;
  const names = new Map(Array.from(businessNames, (name) => [normalized(name), name]));
  if (!names.has(normalized(entry.business))) names.set(normalized(entry.business), entry.business);
  const originBusiness = names.get(normalized(entry.originAccount));
  const destinationBusiness = names.get(normalized(entry.destinationAccount));
  const fromCash = isExtraCashAccount(entry.originAccount);
  const toCash = isExtraCashAccount(entry.destinationAccount);

  if (entry.type === "traspaso") {
    const cashOwner = originBusiness || destinationBusiness || entry.business;
    if (originBusiness) addBalance(result.main, originBusiness, -amount);
    else if (fromCash) addBalance(result.cash, cashOwner, -amount);
    else if (toCash || destinationBusiness) addBalance(result.main, entry.business, -amount);
    if (destinationBusiness) addBalance(result.main, destinationBusiness, amount);
    else if (toCash) addBalance(result.cash, cashOwner, amount);
    else if (fromCash || originBusiness) addBalance(result.main, entry.business, amount);
    return result;
  }

  if (fromCash && toCash) return result;
  if (fromCash) {
    addBalance(result.cash, entry.business, -amount);
    if (entry.type === "ingreso") addBalance(result.main, entry.business, amount);
    return result;
  }
  if (toCash) {
    addBalance(result.cash, entry.business, amount);
    if (entry.type === "gasto") addBalance(result.main, entry.business, -amount);
    return result;
  }
  if (entry.type === "ingreso") { result.income = amount; addBalance(result.main, entry.business, amount); }
  else { result.expenses = amount; addBalance(result.main, entry.business, -amount); }
  return result;
}

export function applyAccountingEffects(entries: AccountingBalanceEntry[], businessNames: Iterable<string>, openingMain: Record<string, number> = {}, openingCash: Record<string, number> = {}) {
  const main = { ...openingMain }, cash = { ...openingCash };
  let income = 0, expenses = 0;
  for (const entry of entries) {
    const effect = accountingBalanceEffects(entry, businessNames);
    income += effect.income; expenses += effect.expenses;
    for (const [name, value] of Object.entries(effect.main)) addBalance(main, name, value);
    for (const [name, value] of Object.entries(effect.cash)) addBalance(cash, name, value);
  }
  return { main, cash, income, expenses };
}
export const monthKey = (date: string) => String(date || "").slice(0, 7);
export function previousMonth(month: string) { const [year, number] = month.split("-").map(Number); return new Date(Date.UTC(year, number - 2, 1)).toISOString().slice(0, 7); }

function methodKey(value: string) { return normalized(value) || "sin metodo"; }
function applies(entry: AccountingMetricEntry, filters: AccountingMetricFilters) {
  if (filters.business && normalized(entry.business) !== normalized(filters.business)) return false;
  if (filters.method && methodKey(entry.channel) !== methodKey(filters.method)) return false;
  if (filters.type && entry.category !== filters.type) return false;
  return true;
}
function economicEffect(entry: AccountingMetricEntry) {
  const amount = cents(entry.amount);
  const fromCash = extraCash(entry.originAccount);
  const toCash = extraCash(entry.destinationAccount);
  if (entry.type === "traspaso" || fromCash || toCash) return { income: 0, expenses: 0 };
  return entry.type === "ingreso" ? { income: amount, expenses: 0 } : { income: 0, expenses: amount };
}
function cashEffect(entry: AccountingMetricEntry) {
  const amount = cents(entry.amount);
  return (extraCash(entry.destinationAccount) ? amount : 0) - (extraCash(entry.originAccount) ? amount : 0);
}

export function snapshot(entries: AccountingMetricEntry[], month: string, filters: AccountingMetricFilters): MetricSnapshot {
  let income = 0, expenses = 0, cash = 0, count = 0;
  for (const entry of entries) {
    if (!applies(entry, filters)) continue;
    const entryMonth = monthKey(entry.date);
    if (entryMonth <= month) cash += cashEffect(entry);
    if (entryMonth !== month) continue;
    const effect = economicEffect(entry);
    income += effect.income; expenses += effect.expenses; count += 1;
  }
  return { income: money(income), expenses: money(expenses), balance: money(income - expenses), cash: money(cash), count };
}

export function methodMetrics(entries: AccountingMetricEntry[], month: string, filters: AccountingMetricFilters) {
  const previous = previousMonth(month);
  const labels = new Map<string, string>();
  const amounts = new Map<string, { current: number; previous: number }>();
  for (const entry of entries) {
    if (!applies(entry, { ...filters, method: "" }) || entry.type !== "ingreso" || economicEffect(entry).income <= 0) continue;
    const entryMonth = monthKey(entry.date);
    if (entryMonth !== month && entryMonth !== previous) continue;
    const key = methodKey(entry.channel);
    if (!labels.has(key)) labels.set(key, entry.channel.trim() || "Sin método");
    const item = amounts.get(key) || { current: 0, previous: 0 };
    item[entryMonth === month ? "current" : "previous"] += cents(entry.amount);
    amounts.set(key, item);
  }
  const total = [...amounts.values()].reduce((sum, item) => sum + item.current, 0);
  return [...amounts].map(([key, value]) => ({
    key, label: labels.get(key) || key, current: money(value.current), previous: money(value.previous),
    difference: money(value.current - value.previous), share: total ? value.current / total * 100 : 0,
    variation: value.previous ? (value.current - value.previous) / value.previous * 100 : null,
  })).sort((a, b) => b.current - a.current || b.previous - a.previous);
}

export function businessMetrics(entries: AccountingMetricEntry[], month: string, filters: AccountingMetricFilters) {
  const names = new Map<string, string>();
  for (const entry of entries) if (!filters.business || normalized(entry.business) === normalized(filters.business)) names.set(normalized(entry.business), entry.business);
  return [...names.values()].map((business) => {
    const current = snapshot(entries, month, { ...filters, business });
    const previous = snapshot(entries, previousMonth(month), { ...filters, business });
    return { business, current, previous, difference: current.balance - previous.balance, variation: previous.balance ? (current.balance - previous.balance) / Math.abs(previous.balance) * 100 : null };
  }).sort((a, b) => b.current.balance - a.current.balance);
}

export function historicalMetrics(entries: AccountingMetricEntry[], visibleMonth: string, filters: AccountingMetricFilters) {
  const months = [...new Set(entries.filter((entry) => monthKey(entry.date) <= visibleMonth && applies(entry, filters)).map((entry) => monthKey(entry.date)))].sort();
  return months.map((month) => ({ month, ...snapshot(entries, month, filters) }));
}

export function historicalMethod(entries: AccountingMetricEntry[], visibleMonth: string, filters: AccountingMetricFilters, method: string) {
  const months = [...new Set(entries.filter((entry) => monthKey(entry.date) <= visibleMonth && entry.type === "ingreso" && applies(entry, { ...filters, method })).map((entry) => monthKey(entry.date)))].sort();
  return months.map((month) => ({ month, value: methodMetrics(entries, month, { ...filters, method: "" }).find((item) => item.key === methodKey(method))?.current || 0 }));
}
