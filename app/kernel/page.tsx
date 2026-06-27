import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Boxes, Cable, Cpu, LayoutDashboard, Plug, RadioTower, ShieldCheck, Workflow } from "lucide-react";
import { buildKernelHealthSummary, buildKernelRegistryFromArtifacts } from "@/lib/flowlyKernel";

const services = buildKernelHealthSummary(buildKernelRegistryFromArtifacts([])).services;

const serviceIcons: Record<string, ReactNode> = {
  "core-runtime": <Cpu size={18} />,
  "event-bus": <RadioTower size={18} />,
  "business-object-runtime": <Boxes size={18} />,
  "capability-runtime": <Cable size={18} />,
  "workflow-runtime": <Workflow size={18} />,
  "plugin-runtime": <Plug size={18} />,
};

export default function KernelPage() {
  return (
    <main className="min-h-screen bg-[#06030d] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/30">
          <div className="mb-5 flex items-center justify-between gap-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 hover:bg-white/10">
              <ArrowLeft size={16} /> Panel
            </Link>
            <Link href="/studio/v2" className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15">
              <LayoutDashboard size={16} /> Abrir Studio V2
            </Link>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.34em] text-cyan-100/70">Flowly Kernel</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Runtime central de Flowly OS</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
            Esta es la primera base del Kernel: registro central, Event Bus, Business Object Runtime, Capability Runtime, Workflow Runtime y Plugin Runtime. Studio diseña; el Kernel ejecuta y gobierna.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Metric title="Servicios Kernel" value="6" />
          <Metric title="Estado base" value="Activo" />
          <Metric title="SQL requerido" value="flowly_kernel.sql" />
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article key={service.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-200/15 bg-cyan-300/10 text-cyan-100">{serviceIcons[service.id] || <ShieldCheck size={18} />}</span>
                <div>
                  <h2 className="font-bold">{service.name}</h2>
                  <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70">{service.status}</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-white/60">{service.description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-6">
          <h2 className="text-xl font-bold">Endpoints disponibles</h2>
          <div className="mt-4 grid gap-3 text-sm text-white/70 md:grid-cols-2">
            <Endpoint method="GET" path="/api/kernel/status" />
            <Endpoint method="POST" path="/api/kernel/register-blueprint" />
            <Endpoint method="GET/POST" path="/api/kernel/events" />
            <Endpoint method="GET/POST" path="/api/kernel/business-objects" />
            <Endpoint method="POST" path="/api/kernel/capabilities/execute" />
            <Endpoint method="POST" path="/api/kernel/workflows/run" />
            <Endpoint method="GET/POST" path="/api/kernel/plugins" />
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-white/40">{title}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function Endpoint({ method, path }: { method: string; path: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <span className="mr-3 rounded-full bg-cyan-300/10 px-2 py-1 text-xs font-bold text-cyan-100">{method}</span>
      <code>{path}</code>
    </div>
  );
}
