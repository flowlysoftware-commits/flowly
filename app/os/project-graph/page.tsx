"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import { ArrowLeft, Boxes, BrainCircuit, CheckCircle2, Code2, Database, FileCode2, GitBranch, Loader2, Network, Route, Search, ShieldCheck, Sparkles } from "lucide-react";

type ModuleSummary = { id: string; name: string; score: number; routes: number; apis: number; components: number; libraries: number; docs: number; sql: number };
type Impact = { instruction: string; detectedModules: Array<{ id: string; name: string; description: string; paths: string[] }>; primaryFiles: string[]; secondaryFiles: string[]; avoidCreating: string[]; safeChangeStrategy: string[]; risk: "bajo" | "medio" | "alto" };
type GraphResponse = {
  ok?: boolean;
  error?: string;
  summary?: {
    totalFiles: number;
    analyzedFiles: number;
    routes: number;
    apiRoutes: number;
    components: number;
    libraries: number;
    sqlFiles: number;
    docs: number;
    tables: number;
    edges: number;
    modules: ModuleSummary[];
    recommendations: string[];
  };
  impact?: Impact | null;
  graph?: { nodes: Array<{ id: string; label: string; type: string; path?: string; module?: string; weight: number }>; edges: Array<{ source: string; target: string; type: string; confidence: number }> };
};

const examples = [
  "Haz el Companion más vivo y mejora el avatar existente sin crear duplicados.",
  "Analiza el CRM y dime qué archivos tocarías para convertirlo en un Kanban moderno.",
  "Revisa el panel comercial y detecta dependencias antes de cambiar diseño.",
  "Mapea Brain, Executor, Kernel y Knowledge para entender cómo trabajan juntos.",
];

export default function ProjectGraphPage() {
  const [instruction, setInstruction] = useState(examples[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GraphResponse | null>(null);

  async function analyze(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/project-graph/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#02030a] px-5 py-6 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,.18),transparent_28%),radial-gradient(circle_at_76%_14%,rgba(124,58,237,.22),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,.12),transparent_28%)]" />
      <section className="relative mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/developer" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/[0.08]"><ArrowLeft size={16} /> Volver a Developer</Link>
          <Link href="/os/executor-v3" className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-50"><BrainCircuit size={16} /> Abrir Executor V3</Link>
        </div>

        <header className="mt-6 rounded-[2rem] border border-cyan-300/15 bg-white/[0.055] p-7 shadow-2xl shadow-cyan-950/25 backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100"><Network size={15} /> Flowly Project Graph</div>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">Mapa vivo del proyecto</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/62">Project Graph indexa rutas, APIs, componentes, librerías, SQL, Docs y dependencias para que Brain y Executor entiendan Flowly antes de modificarlo.</p>
        </header>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur">
            <form onSubmit={analyze}>
              <label className="text-sm font-black uppercase tracking-[0.18em] text-cyan-100/70">Petición o módulo que quieres analizar</label>
              <textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} rows={4} className="mt-3 w-full rounded-3xl border border-white/10 bg-black/35 p-4 text-sm leading-6 text-white outline-none focus:border-cyan-200/50" />
              <div className="mt-4 flex flex-wrap gap-3">
                <button disabled={loading} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-200 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-50">{loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />} Construir Project Graph</button>
              </div>
            </form>

            {result?.error ? <div className="mt-5 rounded-3xl border border-rose-300/25 bg-rose-300/10 p-4 text-sm text-rose-100">{result.error}</div> : null}

            {result?.summary ? (
              <div className="mt-5 space-y-5">
                <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                  <div className="flex items-center gap-2 font-black text-emerald-50"><CheckCircle2 size={18} /> Project Graph construido</div>
                  <p className="mt-2 text-sm text-white/65">Se han indexado {result.summary.totalFiles} archivos y se han analizado en profundidad {result.summary.analyzedFiles} piezas clave.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Metric icon={<FileCode2 size={17} />} label="Archivos" value={String(result.summary.totalFiles)} />
                  <Metric icon={<Route size={17} />} label="Rutas" value={String(result.summary.routes)} />
                  <Metric icon={<Code2 size={17} />} label="APIs" value={String(result.summary.apiRoutes)} />
                  <Metric icon={<GitBranch size={17} />} label="Dependencias" value={String(result.summary.edges)} />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Metric icon={<Boxes size={17} />} label="Componentes" value={String(result.summary.components)} />
                  <Metric icon={<Database size={17} />} label="SQL" value={String(result.summary.sqlFiles)} />
                  <Metric icon={<Sparkles size={17} />} label="Docs" value={String(result.summary.docs)} />
                </div>

                {result.impact ? (
                  <div className="rounded-3xl border border-cyan-300/15 bg-black/25 p-4">
                    <h3 className="font-black">Impacto de la petición</h3>
                    <p className="mt-2 text-sm text-white/55">Riesgo: <span className="font-black capitalize text-cyan-100">{result.impact.risk}</span></p>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <MiniList title="Archivos principales" items={result.impact.primaryFiles} />
                      <MiniList title="No duplicar / revisar antes" items={result.impact.avoidCreating} />
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-4 lg:grid-cols-2">
                  <Panel title="Módulos detectados">
                    {result.summary.modules.slice(0, 12).map((module) => <div key={module.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3"><p className="font-black text-white/90">{module.name}</p><p className="mt-1 text-[11px] text-white/45">Score {module.score} · rutas {module.routes} · APIs {module.apis} · componentes {module.components}</p></div>)}
                  </Panel>
                  <Panel title="Nodos principales">
                    {(result.graph?.nodes || []).slice(0, 16).map((node) => <div key={node.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3"><p className="text-xs font-bold text-cyan-50">{node.path || node.label}</p><p className="mt-1 text-[11px] text-white/45">{node.type} · {node.module || "sin módulo"} · peso {node.weight}</p></div>)}
                  </Panel>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-5">
              <h3 className="flex items-center gap-2 text-lg font-black text-emerald-50"><ShieldCheck size={18} /> Qué aporta</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-white/66">
                <li>• Evita crear archivos duplicados.</li>
                <li>• Detecta dependencias antes de modificar.</li>
                <li>• Alimenta a Brain y Executor con contexto real.</li>
                <li>• Mejora la trazabilidad de cada Pull Request.</li>
              </ul>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5">
              <h3 className="flex items-center gap-2 text-lg font-black"><Sparkles size={18} /> Pruebas rápidas</h3>
              <div className="mt-3 space-y-2">
                {examples.map((example) => <button key={example} onClick={() => setInstruction(example)} className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-left text-xs leading-5 text-white/60 hover:border-cyan-200/35 hover:text-white">{example}</button>)}
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-3xl border border-white/10 bg-black/25 p-4"><div className="text-cyan-100">{icon}</div><p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>;
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-3xl border border-white/10 bg-black/20 p-4"><h3 className="font-black">{title}</h3><div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">{children}</div></div>;
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return <div><p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">{title}</p><div className="mt-2 space-y-2">{items.slice(0, 10).map((item) => <div key={item} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/62">{item}</div>)}</div></div>;
}
