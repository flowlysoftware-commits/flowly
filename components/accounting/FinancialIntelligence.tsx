"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, BarChart3, Building2, CircleDollarSign, History, Landmark, Sparkles, TrendingUp, WalletCards } from "lucide-react";
import { businessMetrics, historicalMethod, historicalMetrics, methodMetrics, previousMonth, snapshot, type AccountingMetricEntry, type AccountingMetricFilters } from "@/lib/accountingMetrics";
import styles from "./FinancialIntelligence.module.css";

const euro = (value: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value || 0);
const percent = (value: number) => `${value > 0 ? "+" : ""}${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(value)} %`;
const monthLabel = (month: string, short = false) => { const [year, number] = month.split("-").map(Number); return new Intl.DateTimeFormat("es-ES", { month: short ? "short" : "long", year: short ? undefined : "numeric" }).format(new Date(year, number - 1, 1)); };
const hash = (value: string) => [...value].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
const methodColor = (value: string) => `hsl(${[188, 262, 326, 42, 151, 218, 16][hash(value) % 7]} 78% 63%)`;

function ComparisonCard({ title, current, previous, inverse = false, icon }: { title: string; current: number; previous: number; inverse?: boolean; icon: React.ReactNode }) {
  const difference = current - previous;
  const variation = previous ? difference / Math.abs(previous) * 100 : null;
  const favourable = inverse ? difference <= 0 : difference >= 0;
  return <article className={`${styles.metricCard} ${favourable ? styles.positive : styles.negative}`} title={`${title}: comparación contra el mes anterior visible`}><div className={styles.metricTop}><span>{icon}</span><small>{title}</small>{difference >= 0 ? <ArrowUpRight/> : <ArrowDownRight/>}</div><strong>{euro(current)}</strong><div className={styles.metricCompare}><span>Anterior <b>{euro(previous)}</b></span><span>Diferencia <b>{difference > 0 ? "+" : ""}{euro(difference)}</b></span></div><div className={styles.variation}>{variation == null ? "Sin datos suficientes para comparar" : `${percent(variation)} vs. mes anterior`}</div></article>;
}

function LineChart({ points, metric }: { points: Array<{ month: string; income: number; expenses: number; balance: number; cash: number }>; metric: "income"|"expenses"|"balance"|"cash" }) {
  const values = points.map((point) => point[metric]);
  const min = Math.min(0, ...values), max = Math.max(1, ...values), span = Math.max(1, max - min);
  const coordinates = points.map((point, index) => `${points.length === 1 ? 50 : index / (points.length - 1) * 100},${88 - ((point[metric] - min) / span) * 72}`).join(" ");
  return <div className={styles.lineChart}>{points.length ? <><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`Evolución de ${metric}`}><defs><linearGradient id={`finance-${metric}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#67e8f9" stopOpacity=".32"/><stop offset="1" stopColor="#8b5cf6" stopOpacity="0"/></linearGradient></defs><polygon points={`0,96 ${coordinates} 100,96`} fill={`url(#finance-${metric})`}/><polyline points={coordinates} fill="none" stroke="#78e7f2" strokeWidth="2.2" vectorEffect="non-scaling-stroke"/></svg><div className={styles.chartLabels}>{points.map((point) => <span key={point.month}><b>{monthLabel(point.month,true)}</b><small>{euro(point[metric])}</small></span>)}</div></> : <div className={styles.empty}>Sin histórico disponible</div>}</div>;
}

export default function FinancialIntelligence({ entries, month, businesses, channels, categories, loading, onOpenComparison }: { entries: AccountingMetricEntry[]; month: string; businesses: string[]; channels: string[]; categories: string[]; loading?: boolean; onOpenComparison: () => void }) {
  const [filters, setFilters] = useState<AccountingMetricFilters>({ business: "", method: "", type: "" });
  const [historyMetric, setHistoryMetric] = useState<"income"|"expenses"|"balance"|"cash">("income");
  const [selectedMethod, setSelectedMethod] = useState("");
  const current = useMemo(() => snapshot(entries, month, filters), [entries, month, filters]);
  const priorMonth = previousMonth(month);
  const previous = useMemo(() => snapshot(entries, priorMonth, filters), [entries, filters, priorMonth]);
  const methods = useMemo(() => methodMetrics(entries, month, filters), [entries, month, filters]);
  const businessesRank = useMemo(() => businessMetrics(entries, month, filters), [entries, month, filters]);
  const history = useMemo(() => historicalMetrics(entries, month, filters), [entries, month, filters]);
  const activeMethod = selectedMethod || methods[0]?.label || "";
  const methodHistory = useMemo(() => activeMethod ? historicalMethod(entries, month, filters, activeMethod) : [], [activeMethod, entries, filters, month]);
  const growing = methods.filter((item) => item.variation != null).sort((a,b)=>(b.variation||0)-(a.variation||0));
  const topMethod = methods[0];
  const topBusiness = businessesRank[0];
  const insights = [
    previous.income ? `Los ingresos ${current.income >= previous.income ? "aumentaron" : "disminuyeron"} un ${Math.abs((current.income-previous.income)/previous.income*100).toLocaleString("es-ES",{maximumFractionDigits:1})} % respecto a ${monthLabel(priorMonth)}.` : "Sin datos suficientes para comparar ingresos.",
    previous.expenses ? `Los gastos ${current.expenses >= previous.expenses ? "aumentaron" : "disminuyeron"} un ${Math.abs((current.expenses-previous.expenses)/previous.expenses*100).toLocaleString("es-ES",{maximumFractionDigits:1})} %.` : "Sin datos suficientes para comparar gastos.",
    topMethod ? `${topMethod.label} representa el ${topMethod.share.toLocaleString("es-ES",{maximumFractionDigits:1})} % de los ingresos del periodo.` : "No hay ingresos clasificados por método en este periodo.",
    topBusiness ? `${topBusiness.business} presenta el mayor balance neto: ${euro(topBusiness.current.balance)}.` : "No hay negocios con movimientos en este periodo.",
  ];

  return <section className={styles.shell} aria-labelledby="financial-intelligence-title">
    <header className={styles.hero}><div><span><Sparkles/> INTELIGENCIA FINANCIERA</span><h2 id="financial-intelligence-title">Estadísticas financieras</h2><p>{monthLabel(month)} comparado con {monthLabel(priorMonth)} · movimientos reales, sin contabilizar traspasos como ingresos.</p></div><div className={styles.live}><i/>{loading ? "Sincronizando" : "Datos confirmados"}</div></header>
    <div className={styles.filters}><label>Negocio<select value={filters.business} onChange={(e)=>setFilters({...filters,business:e.target.value})}><option value="">Todos los negocios</option>{businesses.map((item)=><option key={item}>{item}</option>)}</select></label><label>Método<select value={filters.method} onChange={(e)=>setFilters({...filters,method:e.target.value})}><option value="">Todos los métodos</option>{channels.map((item)=><option key={item}>{item}</option>)}</select></label><label>Tipo<select value={filters.type} onChange={(e)=>setFilters({...filters,type:e.target.value})}><option value="">Todos los tipos</option>{categories.map((item)=><option key={item}>{item}</option>)}</select></label></div>
    <div className={styles.metrics}><ComparisonCard title="Ingresos" current={current.income} previous={previous.income} icon={<CircleDollarSign/>}/><ComparisonCard title="Gastos" current={current.expenses} previous={previous.expenses} inverse icon={<WalletCards/>}/><ComparisonCard title="Balance neto" current={current.balance} previous={previous.balance} icon={<TrendingUp/>}/><ComparisonCard title="Caja extra" current={current.cash} previous={previous.cash} icon={<Landmark/>}/></div>
    <div className={styles.grid}><article className={styles.panel}><div className={styles.panelTitle}><div><span>¿DE DÓNDE VIENE EL DINERO?</span><h3>Ingresos por método</h3></div><BarChart3/></div>{methods.length ? <div className={styles.methods}>{methods.map((item,index)=><button key={item.key} onClick={()=>setSelectedMethod(item.label)} className={activeMethod===item.label?styles.selected:""}><i style={{background:methodColor(item.key),width:`${Math.max(3,item.share)}%`}}/><span><b>{index<3?["🥇","🥈","🥉"][index]:`#${index+1}`} {item.label}</b><small>{item.share.toLocaleString("es-ES",{maximumFractionDigits:1})} % de los ingresos</small></span><strong>{euro(item.current)}</strong><em className={(item.variation||0)>=0?styles.up:styles.down}>{item.variation==null?"Sin base":percent(item.variation)}</em></button>)}</div>:<div className={styles.empty}>No hay ingresos reales en el periodo seleccionado.</div>}</article><article className={styles.panel}><div className={styles.panelTitle}><div><span>EVOLUCIÓN DEL CANAL</span><h3>{activeMethod || "Selecciona un método"}</h3></div><select value={activeMethod} onChange={(e)=>setSelectedMethod(e.target.value)}>{methods.map((item)=><option key={item.key}>{item.label}</option>)}</select></div><LineChart points={methodHistory.map((item)=>({month:item.month,income:item.value,expenses:0,balance:0,cash:0}))} metric="income"/><div className={styles.growth}>{growing[0]?.variation != null?<span>Mayor crecimiento <b>{growing[0].label} · {percent(growing[0].variation)}</b></span>:<span>Sin histórico suficiente para crecimiento</span>}{growing.at(-1)?.variation != null&&growing.at(-1)!.variation!<0?<span>Mayor descenso <b>{growing.at(-1)!.label} · {percent(growing.at(-1)!.variation!)}</b></span>:null}</div></article></div>
    <article className={styles.panel}><div className={styles.panelTitle}><div><span>EVOLUCIÓN FINANCIERA</span><h3>Histórico real disponible</h3></div><div className={styles.tabs}><button type="button" onClick={onOpenComparison} aria-label="Abrir historial de auditoría y comparación" className="inline-flex items-center gap-1.5 border-violet-300/30 bg-violet-300/10 text-violet-100"><History className="h-3.5 w-3.5"/> Comparación</button>{(["income","expenses","balance","cash"] as const).map((key)=><button key={key} className={historyMetric===key?styles.active:""} onClick={()=>setHistoryMetric(key)}>{({income:"Ingresos",expenses:"Gastos",balance:"Balance",cash:"Caja extra"})[key]}</button>)}</div></div><LineChart points={history} metric={historyMetric}/></article>
    <div className={styles.grid}><article className={styles.panel}><div className={styles.panelTitle}><div><span>RENDIMIENTO POR NEGOCIO</span><h3>Ranking por balance neto</h3></div><Building2/></div><div className={styles.businesses}>{businessesRank.map((item,index)=><div key={item.business}><span>{index<3?["🥇","🥈","🥉"][index]:`#${index+1}`} <b>{item.business}</b></span><small>Ingresos {euro(item.current.income)} · Gastos {euro(item.current.expenses)}</small><strong>{euro(item.current.balance)}</strong></div>)}</div></article><article className={`${styles.panel} ${styles.insights}`}><div className={styles.panelTitle}><div><span>LECTURA EJECUTIVA</span><h3>Insights matemáticos</h3></div><Sparkles/></div>{insights.map((text,index)=><p key={index}><i/>{text}</p>)}</article></div>
  </section>;
}
