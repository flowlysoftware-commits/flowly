"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Boxes,
  BrainCircuit,
  Building2,
  CheckCircle2,
  Download,
  Factory,
  GitBranch,
  Hotel,
  Loader2,
  Plus,
  Rocket,
  Settings2,
  Sparkles,
  Stethoscope,
  Truck,
  UsersRound,
  Wrench,
} from "lucide-react";
import type { FlowlyProjectType, FlowlyStudioProjectBlueprint } from "@/lib/flowlyStudioProjects";

const projectTypes: Array<{ id: FlowlyProjectType; label: string; description: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
  { id: "erp", label: "ERP completo", description: "Base empresarial general: clientes, finanzas, proyectos y operaciones.", icon: Factory },
  { id: "crm", label: "CRM comercial", description: "Leads, clientes, oportunidades, propuestas y seguimiento comercial.", icon: UsersRound },
  { id: "rrhh", label: "Recursos humanos", description: "Empleados, contratos, ausencias, nóminas y aprobaciones.", icon: Building2 },
  { id: "vehiculos", label: "Vehículos / flota", description: "Vehículos, conductores, alquileres, seguros y mantenimientos.", icon: Truck },
  { id: "hotel", label: "Hotel", description: "Reservas, huéspedes, habitaciones, estancias y facturación.", icon: Hotel },
  { id: "clinica", label: "Clínica", description: "Pacientes, citas, tratamientos, consentimientos y facturas.", icon: Stethoscope },
  { id: "logistica", label: "Logística", description: "Envíos, almacenes, rutas, paquetes y entregas.", icon: GitBranch },
  { id: "taller", label: "Taller", description: "Vehículos, órdenes de trabajo, mecánicos, inspecciones y recambios.", icon: Wrench },
  { id: "libre", label: "Proyecto libre", description: "Estructura genérica para diseñar cualquier software empresarial.", icon: Settings2 },
];

const moduleOptions = ["CRM", "Facturación", "Inventario", "IA", "Documentos", "Recursos humanos", "Marketing", "Soporte", "Operaciones", "Marketplace"];

type ProjectRow = {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
  modules: string[];
  blueprint: FlowlyStudioProjectBlueprint;
  status: string;
  updated_at: string;
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Error inesperado");
  return data as T;
}

function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function Pill({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/60">{children}</span>;
}

export default function StudioProjectsPage() {
  const [name, setName] = useState("Módulo de Recursos Humanos");
  const [description, setDescription] = useState("Sistema interno para empleados, contratos, ausencias, nóminas y documentos.");
  const [type, setType] = useState<FlowlyProjectType>("rrhh");
  const [prompt, setPrompt] = useState("Quiero crear un módulo completo de recursos humanos para Flowly");
  const [modules, setModules] = useState<string[]>(["Recursos humanos", "Documentos", "IA"]);
  const [blueprint, setBlueprint] = useState<FlowlyStudioProjectBlueprint | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedType = useMemo(() => projectTypes.find((item) => item.id === type) || projectTypes[0], [type]);

  useEffect(() => {
    void loadProjects();
  }, []);

  async function loadProjects() {
    const response = await fetch("/api/studio/projects");
    const data = await response.json();
    if (response.ok) setProjects(data.projects || []);
  }

  function toggleModule(item: string) {
    setModules((current) => current.includes(item) ? current.filter((module) => module !== item) : [...current, item]);
  }

  async function previewProject() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await postJson<{ blueprint: FlowlyStudioProjectBlueprint }>("/api/studio/projects?preview=true", { name, description, type, modules, prompt });
      setBlueprint(data.blueprint);
      setMessage("Blueprint preparado. Revísalo antes de crear la estructura.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo preparar el proyecto.");
    } finally {
      setLoading(false);
    }
  }

  async function createProject() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await postJson<{ blueprint: FlowlyStudioProjectBlueprint; artifacts: unknown[] }>("/api/studio/projects", { name, description, type, modules, prompt, createArtifacts: true });
      setBlueprint(data.blueprint);
      setMessage(`Proyecto creado. Studio ha generado ${data.artifacts.length} piezas iniciales listas para Generator.`);
      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el proyecto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080611] px-5 py-8 text-white lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/studio" className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ArrowLeft size={16} /> Volver a Studio</Link>
          <Link href="/studio/generator" className="inline-flex items-center gap-2 text-sm text-cyan-100/80 transition hover:text-cyan-100"><Rocket size={16} /> Abrir Generator</Link>
        </div>

        <header className="mt-6 rounded-[2.2rem] border border-white/10 bg-white/[0.06] p-8 backdrop-blur-2xl md:p-10">
          <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">Modo Proyecto</span>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Nuevo proyecto</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/62">Crea de golpe toda la estructura inicial de un módulo: objetos de negocio, capacidades, flujos, políticas, apps, blueprint y piezas listas para el Generator.</p>
            </div>
            <div className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-400/10 p-5 text-emerald-50">
              <p className="text-xs uppercase tracking-[0.22em] opacity-65">Prueba recomendada</p>
              <p className="mt-2 text-2xl font-semibold">Recursos Humanos</p>
              <p className="mt-2 text-sm opacity-75">Es un módulo real con privacidad, documentos, aprobaciones, workflows y permisos.</p>
            </div>
          </div>
          {message ? <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}
          {error ? <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[0.95fr,1.05fr]">
          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl">
            <h2 className="text-xl font-semibold">1. Define el proyecto</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm text-white/65"><span>Nombre del proyecto</span><input value={name} onChange={(event) => setName(event.target.value)} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-cyan-200/45" /></label>
              <label className="grid gap-2 text-sm text-white/65"><span>Descripción</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-200/45" /></label>
              <label className="grid gap-2 text-sm text-white/65"><span>Architect AI</span><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-200/45" /></label>
            </div>

            <h2 className="mt-7 text-xl font-semibold">2. Tipo de proyecto</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {projectTypes.map((item) => {
                const Icon = item.icon;
                const active = item.id === type;
                return (
                  <button key={item.id} onClick={() => setType(item.id)} className={`rounded-2xl border p-4 text-left transition ${active ? "border-cyan-300/35 bg-cyan-300/10" : "border-white/10 bg-black/20 hover:bg-white/[0.06]"}`}>
                    <div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-cyan-100"><Icon size={18} /></span><div><h3 className="font-semibold">{item.label}</h3><p className="mt-1 text-sm leading-5 text-white/45">{item.description}</p></div></div>
                  </button>
                );
              })}
            </div>

            <h2 className="mt-7 text-xl font-semibold">3. Módulos incluidos</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {moduleOptions.map((item) => <button key={item} onClick={() => toggleModule(item)} className={`rounded-xl border px-3 py-2 text-sm ${modules.includes(item) ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100" : "border-white/10 bg-white/[0.04] text-white/60"}`}>{item}</button>)}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={previewProject} disabled={loading} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100 disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} Previsualizar blueprint</button>
              <button onClick={createProject} disabled={loading} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-100 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Crear estructura completa</button>
            </div>
          </div>

          <div className="space-y-5">
            <section className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl">
              <div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-semibold">Blueprint generado</h2><p className="mt-1 text-sm text-white/50">Esto será lo que Studio creará como base del módulo.</p></div>{blueprint ? <button onClick={() => downloadJson(`${blueprint.slug}-blueprint.json`, blueprint)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/10"><Download size={13} /> JSON</button> : null}</div>
              {blueprint ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4"><p className="text-xs uppercase tracking-[0.2em] text-cyan-100/65">{selectedType.label}</p><h3 className="mt-2 text-2xl font-semibold">{blueprint.name}</h3><p className="mt-2 text-sm leading-6 text-white/60">{blueprint.description}</p></div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><h3 className="font-semibold">Objetos de negocio</h3><div className="mt-3 flex flex-wrap gap-2">{blueprint.businessObjects.map((item) => <Pill key={item}>{item}</Pill>)}</div></div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><h3 className="font-semibold">Capacidades</h3><div className="mt-3 flex flex-wrap gap-2">{blueprint.capabilities.map((item) => <Pill key={item}>{item}</Pill>)}</div></div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><h3 className="font-semibold">Workflows</h3><div className="mt-3 flex flex-wrap gap-2">{blueprint.workflows.map((item) => <Pill key={item}>{item}</Pill>)}</div></div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><h3 className="font-semibold">Políticas</h3><div className="mt-3 flex flex-wrap gap-2">{blueprint.policies.map((item) => <Pill key={item}>{item}</Pill>)}</div></div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><h3 className="font-semibold">Siguientes pasos</h3><ul className="mt-3 space-y-2 text-sm text-white/60">{blueprint.nextSteps.map((item) => <li key={item}>• {item}</li>)}</ul></div>
                  <Link href="/studio/generator" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-100 px-5 py-3 text-sm font-semibold text-slate-950"><Rocket size={16} /> Ir al Generator para exportar el módulo</Link>
                </div>
              ) : <p className="mt-5 text-sm leading-6 text-white/45">Pulsa “Previsualizar blueprint” para ver la arquitectura antes de crearla.</p>}
            </section>

            <section className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl">
              <h2 className="text-xl font-semibold">Proyectos creados</h2>
              <div className="mt-4 space-y-3">
                {projects.map((project) => <article key={project.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{project.name}</h3><p className="mt-1 text-sm text-white/45">{project.type} · {project.modules?.join(", ")}</p></div><CheckCircle2 className="text-emerald-100" size={18} /></div></article>)}
                {!projects.length ? <p className="text-sm text-white/45">Aún no hay proyectos guardados.</p> : null}
              </div>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
