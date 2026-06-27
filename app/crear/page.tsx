"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2,
  MessageCircle,
  Rocket,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import type { FlowlyProjectType, FlowlyStudioProjectBlueprint } from "@/lib/flowlyStudioProjects";

type CreationKind = "ia" | "erp" | "app" | "automation" | "module" | "unknown";
type WizardStep = "kind" | "name" | "purpose" | "areas" | "features" | "personality" | "summary" | "done";

type CreatedProject = {
  project?: { id?: string; name?: string; slug?: string };
  blueprint?: FlowlyStudioProjectBlueprint;
  artifacts?: unknown[];
};

const kindOptions: Array<{ id: CreationKind; title: string; description: string; icon: React.ReactNode; suggestedType: FlowlyProjectType }> = [
  { id: "ia", title: "Una IA", description: "Companion, avatar, objetivos, recompensas o asistente inteligente.", icon: <Bot size={26} />, suggestedType: "ia_assistant" },
  { id: "erp", title: "Un ERP", description: "Un sistema completo para gestionar una empresa.", icon: <Building2 size={26} />, suggestedType: "erp" },
  { id: "app", title: "Una aplicación", description: "Una app interna para trabajar mejor.", icon: <Rocket size={26} />, suggestedType: "libre" },
  { id: "automation", title: "Una automatización", description: "Un proceso que se ejecute solo.", icon: <Zap size={26} />, suggestedType: "libre" },
  { id: "module", title: "Un módulo", description: "Una pieza nueva para añadir a Flowly.", icon: <FileText size={26} />, suggestedType: "libre" },
  { id: "unknown", title: "No lo sé, ayúdame", description: "Cuéntalo con tus palabras y Flowly lo estructura.", icon: <MessageCircle size={26} />, suggestedType: "libre" },
];

const areaOptions = ["CRM", "Facturación", "RRHH", "Marketing", "WhatsApp", "Documentos", "Agenda", "Inventario", "Soporte", "Operaciones"];
const iaFeatureOptions = ["Avatar", "Memoria", "Conversaciones", "Objetivos", "Misiones", "Recompensas", "Niveles", "Experiencia", "Notificaciones", "Recomendaciones"];
const generalFeatureOptions = ["Clientes", "Documentos", "Aprobaciones", "Automatizaciones", "Informes", "Notificaciones", "Permisos", "Archivos", "IA", "Dashboard"];
const personalityOptions = ["Amigable", "Profesional", "Motivadora", "Analítica", "Divertida", "Seria", "Comercial", "Cercana"];

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function inferProjectType(kind: CreationKind, name: string, purpose: string): FlowlyProjectType {
  const text = `${name} ${purpose}`.toLowerCase();
  if (kind === "ia" || text.includes("companion") || text.includes("assistant") || text.includes("avatar") || text.includes("mascota")) return "ia_assistant";
  if (text.includes("crm") || text.includes("comercial") || text.includes("ventas")) return "crm";
  if (text.includes("rrhh") || text.includes("recursos humanos") || text.includes("empleado")) return "rrhh";
  if (text.includes("hotel")) return "hotel";
  if (text.includes("clínica") || text.includes("clinica") || text.includes("paciente")) return "clinica";
  if (text.includes("logística") || text.includes("logistica") || text.includes("envío") || text.includes("envio")) return "logistica";
  if (text.includes("taller") || text.includes("mecánico") || text.includes("mecanico")) return "taller";
  if (text.includes("vehículo") || text.includes("vehiculo") || text.includes("flota")) return "vehiculos";
  if (kind === "erp") return "erp";
  return "libre";
}

function nextStep(step: WizardStep): WizardStep {
  if (step === "kind") return "name";
  if (step === "name") return "purpose";
  if (step === "purpose") return "areas";
  if (step === "areas") return "features";
  if (step === "features") return "personality";
  if (step === "personality") return "summary";
  return "summary";
}

export default function CrearPage() {
  const [step, setStep] = useState<WizardStep>("kind");
  const [kind, setKind] = useState<CreationKind>("ia");
  const [name, setName] = useState("IA Assistant");
  const [purpose, setPurpose] = useState("Quiero crear el Companion oficial de Flowly con mascota, objetivos, recompensas, misiones diarias, niveles, experiencia, estado de ánimo y avatar.");
  const [areas, setAreas] = useState<string[]>(["CRM", "Facturación", "RRHH", "Marketing", "WhatsApp", "Documentos"]);
  const [features, setFeatures] = useState<string[]>(["Avatar", "Memoria", "Objetivos", "Misiones", "Recompensas", "Niveles", "Experiencia", "Notificaciones"]);
  const [personality, setPersonality] = useState<string[]>(["Amigable", "Motivadora", "Profesional"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedProject | null>(null);

  const selectedKind = kindOptions.find((option) => option.id === kind) || kindOptions[0];
  const projectType = useMemo(() => inferProjectType(kind, name, purpose), [kind, name, purpose]);
  const availableFeatures = projectType === "ia_assistant" ? iaFeatureOptions : generalFeatureOptions;

  const prompt = useMemo(() => {
    return [
      `Quiero crear: ${name}.`,
      `Tipo de creación: ${selectedKind.title}.`,
      `Descripción: ${purpose}.`,
      areas.length ? `Debe trabajar con estos apartados: ${areas.join(", ")}.` : "",
      features.length ? `Debe incluir estas funciones: ${features.join(", ")}.` : "",
      personality.length ? `Estilo deseado: ${personality.join(", ")}.` : "",
      "Créalo de forma sencilla para el usuario, pero usando por detrás la arquitectura de Flowly: blueprint, objetos, capacidades, flujos, políticas y aplicación.",
    ].filter(Boolean).join("\n");
  }, [areas, features, name, personality, purpose, selectedKind.title]);

  async function createProject() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/studio/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: purpose,
          type: projectType,
          modules: areas,
          prompt,
          createArtifacts: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "No se pudo crear el proyecto.");
      setCreated(data);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido creando el proyecto.");
    } finally {
      setLoading(false);
    }
  }

  const progress = step === "kind" ? 12 : step === "name" ? 26 : step === "purpose" ? 40 : step === "areas" ? 55 : step === "features" ? 70 : step === "personality" ? 84 : step === "summary" ? 96 : 100;

  return (
    <main className="min-h-screen bg-[#07040d] px-5 py-6 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link href="/dashboard" className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/70 hover:bg-white/[0.08]"><ArrowLeft size={16} /> Panel</Link>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-100/70">Flowly Crear</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight">Crea software hablando claro</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">Responde preguntas sencillas. Flowly convierte tus respuestas en arquitectura, proyecto, blueprint y módulo listo para revisar en Studio.</p>
            </div>
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-cyan-50">
              <Sparkles className="mb-3" />
              <p className="text-sm font-bold">Modo simple</p>
              <p className="mt-1 text-xs text-cyan-100/60">Sin lenguaje técnico</p>
            </div>
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-200 transition-all" style={{ width: `${progress}%` }} /></div>
        </header>

        {step !== "done" && (
          <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6">
              {step === "kind" && (
                <StepBlock eyebrow="Paso 1" title="¿Qué quieres crear hoy?" helper="Elige la opción más parecida. Si no lo tienes claro, Flowly te ayudará.">
                  <div className="grid gap-3 md:grid-cols-2">
                    {kindOptions.map((option) => (
                      <button key={option.id} onClick={() => { setKind(option.id); setStep("name"); }} className={`rounded-3xl border p-5 text-left transition ${kind === option.id ? "border-cyan-300/60 bg-cyan-400/15" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"}`}>
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-100">{option.icon}</div>
                        <p className="text-lg font-bold">{option.title}</p>
                        <p className="mt-2 text-sm leading-6 text-white/50">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </StepBlock>
              )}

              {step === "name" && (
                <StepBlock eyebrow="Paso 2" title="¿Cómo se llamará?" helper="Pon un nombre sencillo. Luego podremos cambiarlo.">
                  <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-lg font-semibold outline-none focus:border-cyan-300/50" placeholder="Ej: IA Assistant" />
                  <NavigationButtons onBack={() => setStep("kind")} onNext={() => setStep("purpose")} nextDisabled={!name.trim()} />
                </StepBlock>
              )}

              {step === "purpose" && (
                <StepBlock eyebrow="Paso 3" title="Cuéntame qué debe hacer" helper="Escríbelo como se lo contarías a una persona. No hace falta usar palabras técnicas.">
                  <textarea value={purpose} onChange={(event) => setPurpose(event.target.value)} className="min-h-48 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm leading-6 outline-none focus:border-cyan-300/50" />
                  <NavigationButtons onBack={() => setStep("name")} onNext={() => setStep("areas")} nextDisabled={!purpose.trim()} />
                </StepBlock>
              )}

              {step === "areas" && (
                <StepBlock eyebrow="Paso 4" title="¿Dónde trabajará?" helper="Marca los apartados de Flowly con los que se conectará.">
                  <OptionGrid options={areaOptions} selected={areas} onToggle={(value) => setAreas((current) => toggleValue(current, value))} />
                  <NavigationButtons onBack={() => setStep("purpose")} onNext={() => setStep("features")} />
                </StepBlock>
              )}

              {step === "features" && (
                <StepBlock eyebrow="Paso 5" title="¿Qué funciones tendrá?" helper="Selecciona lo que quieres que venga preparado desde el primer diseño.">
                  <OptionGrid options={availableFeatures} selected={features} onToggle={(value) => setFeatures((current) => toggleValue(current, value))} />
                  <NavigationButtons onBack={() => setStep("areas")} onNext={() => setStep("personality")} />
                </StepBlock>
              )}

              {step === "personality" && (
                <StepBlock eyebrow="Paso 6" title="¿Qué estilo tendrá?" helper="Esto ayuda al Architect AI a preparar una experiencia más adecuada.">
                  <OptionGrid options={personalityOptions} selected={personality} onToggle={(value) => setPersonality((current) => toggleValue(current, value))} />
                  <NavigationButtons onBack={() => setStep("features")} onNext={() => setStep("summary")} />
                </StepBlock>
              )}

              {step === "summary" && (
                <StepBlock eyebrow="Resumen" title="Perfecto. Esto es lo que voy a crear" helper="Flowly generará el proyecto completo y lo dejará abierto para revisarlo en Studio.">
                  <div className="grid gap-3 text-sm text-white/70">
                    <SummaryLine label="Nombre" value={name} />
                    <SummaryLine label="Tipo detectado" value={projectType === "ia_assistant" ? "IA / Companion" : projectType.toUpperCase()} />
                    <SummaryLine label="Apartados" value={areas.join(", ") || "Sin apartados seleccionados"} />
                    <SummaryLine label="Funciones" value={features.join(", ") || "Sin funciones seleccionadas"} />
                    <SummaryLine label="Estilo" value={personality.join(", ") || "Sin estilo definido"} />
                  </div>
                  {error && <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button onClick={() => setStep("personality")} className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/70">Atrás</button>
                    <button onClick={createProject} disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-6 py-3 text-sm font-black text-slate-950 disabled:opacity-60">
                      {loading ? <Loader2 className="animate-spin" size={17} /> : <Wand2 size={17} />}
                      {loading ? "Creando proyecto..." : "Crear con Flowly"}
                    </button>
                  </div>
                </StepBlock>
              )}
            </div>

            <aside className="grid h-fit gap-4 rounded-[2rem] border border-white/10 bg-white/[0.055] p-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/35">Lo que hará Flowly</p>
              <MiniCheck text="Entender tu idea" />
              <MiniCheck text="Diseñar la arquitectura oculta" />
              <MiniCheck text="Crear objetos, capacidades y flujos" />
              <MiniCheck text="Preparar la aplicación" />
              <MiniCheck text="Dejarlo listo para revisar en Studio" />
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-50/80">
                Tú no necesitas entender Business Objects, Capabilities ni Kernel. Flowly lo prepara por detrás.
              </div>
            </aside>
          </section>
        )}

        {step === "done" && created?.blueprint && (
          <section className="rounded-[2rem] border border-emerald-300/20 bg-emerald-400/10 p-7">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-300/20 text-emerald-100"><CheckCircle2 size={28} /></div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-100/70">Proyecto creado</p>
                <h2 className="mt-2 text-4xl font-black">{created.blueprint.name}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Flowly ya ha preparado el proyecto. Puedes abrirlo en Studio para revisar el árbol, editar piezas o generar el módulo.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/studio/v2" className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">Abrir en Studio</Link>
                <button onClick={() => { setStep("kind"); setCreated(null); }} className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/80">Crear otro</button>
              </div>
            </div>
            <div className="mt-7 grid gap-4 md:grid-cols-5">
              <ResultMetric label="Objetos" value={created.blueprint.businessObjects.length} />
              <ResultMetric label="Capacidades" value={created.blueprint.capabilities.length} />
              <ResultMetric label="Flujos" value={created.blueprint.workflows.length} />
              <ResultMetric label="Políticas" value={created.blueprint.policies.length} />
              <ResultMetric label="Apps" value={created.blueprint.apps.length} />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StepBlock({ eyebrow, title, helper, children }: { eyebrow: string; title: string; helper: string; children: React.ReactNode }) {
  return <div><p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-100/60">{eyebrow}</p><h2 className="mt-2 text-3xl font-black">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">{helper}</p><div className="mt-6">{children}</div></div>;
}

function NavigationButtons({ onBack, onNext, nextDisabled }: { onBack: () => void; onNext: () => void; nextDisabled?: boolean }) {
  return <div className="mt-6 flex flex-wrap gap-3"><button onClick={onBack} className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/70">Atrás</button><button onClick={onNext} disabled={nextDisabled} className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-6 py-3 text-sm font-black text-slate-950 disabled:opacity-50">Siguiente <ChevronRight size={16} /></button></div>;
}

function OptionGrid({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <div className="grid gap-3 md:grid-cols-2">{options.map((option) => <button key={option} onClick={() => onToggle(option)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${selected.includes(option) ? "border-cyan-300/60 bg-cyan-400/15 text-cyan-50" : "border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.07]"}`}>{selected.includes(option) ? "✓ " : "+ "}{option}</button>)}</div>;
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.2em] text-white/35">{label}</p><p className="mt-2 font-semibold text-white">{value}</p></div>;
}

function MiniCheck({ text }: { text: string }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/70"><CheckCircle2 size={17} className="text-cyan-100" /> {text}</div>;
}

function ResultMetric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.2em] text-white/35">{label}</p><p className="mt-2 text-3xl font-black text-white">{value}</p></div>;
}
