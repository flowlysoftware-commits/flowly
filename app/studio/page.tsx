"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ArrowLeft,
  Boxes,
  BrainCircuit,
  Braces,
  CheckCircle2,
  Code2,
  Database,
  Download,
  FileCode2,
  GitBranch,
  Layers3,
  LayoutDashboard,
  Network,
  Plus,
  Rocket,
  Save,
  ScrollText,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import {
  createStudioId,
  initialAppDefinition,
  initialArchitectBlueprint,
  initialBusinessObjectDefinition,
  initialCapabilityDefinition,
  initialPolicyDefinition,
  initialWorkflowDefinition,
  slugifyStudio,
  studioDomains,
  type FlowlyAppDefinition,
  type FlowlyArchitectBlueprint,
  type FlowlyBusinessObjectDefinition,
  type FlowlyCapabilityDefinition,
  type FlowlyGeneratedArtifacts,
  type FlowlyPolicyDefinition,
  type FlowlyStudioArtifactKind,
  type FlowlyStudioDefinition,
  type FlowlyStudioField,
  type FlowlyStudioFieldType,
  type FlowlyStudioNamedItem,
  type FlowlyStudioRelationship,
  type FlowlyStudioState,
  type FlowlyWorkflowDefinition,
} from "@/lib/flowlyStudio";

type StudioArtifactRow = {
  id: string;
  kind: FlowlyStudioArtifactKind;
  name: string;
  slug: string;
  domain: string;
  description: string;
  status: string;
  definition: FlowlyStudioDefinition;
  generated_sql?: string | null;
  generated_typescript?: string | null;
  generated_api?: string | null;
  generated_markdown?: string | null;
  generated_tests?: string | null;
  generated_sdk?: string | null;
};

type BuilderType = "business_object" | "capability" | "workflow" | "policy" | "app";
type StudioMode = "builder" | "architect";
type StudioTab = "designer" | "generator" | "library";

const fieldTypes: FlowlyStudioFieldType[] = ["text", "long_text", "number", "boolean", "date", "datetime", "email", "phone", "currency", "relation", "file", "json", "ai"];
const relationshipTypes: FlowlyStudioRelationship["type"][] = ["ownership", "reference", "composition", "association", "dependency", "collaboration", "hierarchy", "temporal"];
const builderLabels: Record<BuilderType, string> = {
  business_object: "Objeto de negocio",
  capability: "Capacidad",
  workflow: "Flujo de trabajo",
  policy: "Política",
  app: "Aplicación",
};

function FieldInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="grid gap-2 text-sm text-white/65">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-200/45" />
    </label>
  );
}

function TextAreaInput({ label, value, onChange, rows = 4, placeholder }: { label: string; value: string; onChange: (value: string) => void; rows?: number; placeholder?: string }) {
  return (
    <label className="grid gap-2 text-sm text-white/65">
      <span>{label}</span>
      <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:border-cyan-200/45" />
    </label>
  );
}

function SelectInput({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm text-white/65">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-cyan-200/45">
        {options.map((option) => <option key={option} value={option} className="bg-slate-950">{option}</option>)}
      </select>
    </label>
  );
}

function StudioCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-200/15 bg-cyan-300/10 text-cyan-100">{icon}</span>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ArtifactBlock({ title, value }: { title: string; value: string }) {
  return (
    <details className="rounded-2xl border border-white/10 bg-black/25 p-4" open>
      <summary className="cursor-pointer text-sm font-semibold text-cyan-100">{title}</summary>
      <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-black/35 p-4 text-xs leading-5 text-white/70">{value || "Pendiente de generar."}</pre>
    </details>
  );
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Error inesperado");
  return data as T;
}

function lines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function namedItemsFromLines(value: string): FlowlyStudioNamedItem[] {
  return lines(value).map((name) => ({ id: createStudioId("item"), name }));
}

function asLines(items: string[] | FlowlyStudioNamedItem[] | undefined) {
  if (!items) return "";
  return items.map((item) => (typeof item === "string" ? item : item.name)).join("\n");
}

function rowArtifacts(row: StudioArtifactRow): FlowlyGeneratedArtifacts {
  return {
    sql: row.generated_sql || "",
    typescript: row.generated_typescript || "",
    apiRoute: row.generated_api || "",
    markdown: row.generated_markdown || "",
    testPlan: row.generated_tests || "",
    sdk: row.generated_sdk || "",
  };
}

export default function FlowlyStudioPage() {
  const [mode, setMode] = useState<StudioMode>("builder");
  const [builderType, setBuilderType] = useState<BuilderType>("business_object");
  const [activeTab, setActiveTab] = useState<StudioTab>("designer");
  const [businessObject, setBusinessObject] = useState<FlowlyBusinessObjectDefinition>(initialBusinessObjectDefinition);
  const [capability, setCapability] = useState<FlowlyCapabilityDefinition>(initialCapabilityDefinition);
  const [workflow, setWorkflow] = useState<FlowlyWorkflowDefinition>(initialWorkflowDefinition);
  const [policy, setPolicy] = useState<FlowlyPolicyDefinition>(initialPolicyDefinition);
  const [appDefinition, setAppDefinition] = useState<FlowlyAppDefinition>(initialAppDefinition);
  const [blueprint, setBlueprint] = useState<FlowlyArchitectBlueprint>(initialArchitectBlueprint);
  const [artifacts, setArtifacts] = useState<FlowlyGeneratedArtifacts | null>(null);
  const [library, setBiblioteca] = useState<StudioArtifactRow[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const currentDefinition: FlowlyStudioDefinition = mode === "architect" ? blueprint : builderType === "capability" ? capability : builderType === "workflow" ? workflow : builderType === "policy" ? policy : builderType === "app" ? appDefinition : businessObject;
  const currentKind = (currentDefinition.kind || "business_object") as FlowlyStudioArtifactKind;
  const jsonPreview = useMemo(() => JSON.stringify(currentDefinition, null, 2), [currentDefinition]);

  useEffect(() => {
    loadBiblioteca();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateCommon(patch: Partial<FlowlyStudioDefinition>) {
    if (mode === "architect") return setBlueprint((current) => ({ ...current, ...patch } as FlowlyArchitectBlueprint));
    if (builderType === "capability") return setCapability((current) => ({ ...current, ...patch } as FlowlyCapabilityDefinition));
    if (builderType === "workflow") return setWorkflow((current) => ({ ...current, ...patch } as FlowlyWorkflowDefinition));
    if (builderType === "policy") return setPolicy((current) => ({ ...current, ...patch } as FlowlyPolicyDefinition));
    if (builderType === "app") return setAppDefinition((current) => ({ ...current, ...patch } as FlowlyAppDefinition));
    return setBusinessObject((current) => ({ ...current, ...patch } as FlowlyBusinessObjectDefinition));
  }

  function rename(name: string) {
    updateCommon({ name, slug: slugifyStudio(name) } as Partial<FlowlyStudioDefinition>);
  }

  async function saveDefinition(event?: FormEvent) {
    event?.preventDefault();
    setError("");
    setMessage("");
    try {
      const data = await postJson<{ artifact: StudioArtifactRow; artifacts: FlowlyGeneratedArtifacts }>("/api/studio/artifacts", currentDefinition);
      setArtifacts(data.artifacts);
      setMessage(`Guardado en Studio: ${data.artifact.name}`);
      await loadBiblioteca();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    }
  }

  async function generateArtifacts() {
    setError("");
    setMessage("");
    try {
      const data = await postJson<{ artifacts: FlowlyGeneratedArtifacts }>("/api/studio/generate/artifact", currentDefinition);
      setArtifacts(data.artifacts);
      setActiveTab("generator");
      setMessage("Artefactos generados sin guardar.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar.");
    }
  }

  async function loadBiblioteca() {
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      const response = await fetch(`/api/studio/artifacts?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo cargar la biblioteca.");
      setBiblioteca(data.artifacts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la biblioteca.");
    }
  }

  function loadRow(row: StudioArtifactRow) {
    const definition = row.definition;
    if (row.kind === "architect_blueprint") {
      setMode("architect");
      setBlueprint(definition as FlowlyArchitectBlueprint);
    } else {
      setMode("builder");
      setBuilderType(row.kind as BuilderType);
      if (row.kind === "capability") setCapability(definition as FlowlyCapabilityDefinition);
      if (row.kind === "workflow") setWorkflow(definition as FlowlyWorkflowDefinition);
      if (row.kind === "policy") setPolicy(definition as FlowlyPolicyDefinition);
      if (row.kind === "app") setAppDefinition(definition as FlowlyAppDefinition);
      if (row.kind === "business_object") setBusinessObject(definition as FlowlyBusinessObjectDefinition);
    }
    setArtifacts(rowArtifacts(row));
    setActiveTab("designer");
    setMessage(`Cargado: ${row.name}`);
  }

  function downloadJson() {
    const blob = new Blob([jsonPreview], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${currentDefinition.slug || "flowly-artifact"}.${currentKind}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function updateField(id: string, patch: Partial<FlowlyStudioField>) {
    setBusinessObject((current) => ({ ...current, fields: current.fields.map((field) => field.id === id ? { ...field, ...patch } : field) }));
  }

  function updateState(id: string, patch: Partial<FlowlyStudioState>) {
    setBusinessObject((current) => ({ ...current, states: current.states.map((state) => state.id === id ? { ...state, ...patch } : patch.isInitial ? { ...state, isInitial: false } : state) }));
  }

  return (
    <main className="min-h-screen bg-[#080611] px-5 py-8 text-white lg:px-8">
      <section className="mx-auto max-w-7xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ArrowLeft size={16} /> Volver al dashboard</Link>

        <header className="mt-6 overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.06] p-8 backdrop-blur-2xl md:p-10">
          <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">Flowly Studio</span>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Modo constructor + Modo arquitecto</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/62">El Studio ya no solo diseña Objetos de negocio. Ahora prepara Capacidades, Flujos de trabajo, Políticas, Apps y Blueprints de Arquitecto IA con Vista previa del generador y biblioteca unificada.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setMode("builder")} className={`rounded-2xl border px-4 py-4 text-left transition ${mode === "builder" ? "border-cyan-200/35 bg-cyan-100 text-slate-950" : "border-white/10 bg-white/[0.05] text-white"}`}>
                  <LayoutDashboard className="mb-3" size={20} />
                  <div className="font-semibold">Modo constructor</div>
                  <div className="mt-1 text-xs opacity-70">Diseño manual guiado.</div>
                </button>
                <button onClick={() => setMode("architect")} className={`rounded-2xl border px-4 py-4 text-left transition ${mode === "architect" ? "border-cyan-200/35 bg-cyan-100 text-slate-950" : "border-white/10 bg-white/[0.05] text-white"}`}>
                  <BrainCircuit className="mb-3" size={20} />
                  <div className="font-semibold">Modo arquitecto</div>
                  <div className="mt-1 text-xs opacity-70">Blueprints asistidos.</div>
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={saveDefinition} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950"><Save size={16} /> Guardar</button>
                <button onClick={generateArtifacts} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white"><Sparkles size={16} /> Generar</button>
                <Link href="/studio/generator" className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-cyan-200/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100"><Rocket size={16} /> Generator</Link>
              </div>
            </div>
          </div>
          {message ? <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}
          {error ? <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          {mode === "builder" ? (Object.keys(builderLabels) as BuilderType[]).map((type) => (
            <button key={type} onClick={() => { setBuilderType(type); setActiveTab("designer"); }} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${builderType === type ? "bg-cyan-100 text-slate-950" : "border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"}`}>
              {type === "business_object" ? <Boxes size={16} /> : type === "capability" ? <Braces size={16} /> : type === "workflow" ? <Workflow size={16} /> : type === "policy" ? <ShieldCheck size={16} /> : <LayoutDashboard size={16} />} {builderLabels[type]}
            </button>
          )) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {([
            ["designer", "Designer", Boxes],
            ["generator", "Vista previa del generador", Code2],
            ["library", "Biblioteca", Layers3],
          ] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => { setActiveTab(id); if (id === "library") loadBiblioteca(); }} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${activeTab === id ? "bg-white text-slate-950" : "border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {activeTab === "designer" && (
          <form onSubmit={saveDefinition} className="mt-6 grid gap-5">
            <StudioCard icon={mode === "architect" ? <BrainCircuit size={18} /> : <Boxes size={18} />} title={mode === "architect" ? "Architect Blueprint" : `${builderLabels[builderType]} Designer`}>
              <div className="grid gap-4 md:grid-cols-2">
                <FieldInput label="Nombre" value={currentDefinition.name} onChange={rename} />
                <FieldInput label="Slug" value={currentDefinition.slug} onChange={(slug) => updateCommon({ slug: slugifyStudio(slug) } as Partial<FlowlyStudioDefinition>)} />
                <SelectInput label="Dominio" value={currentDefinition.domain} options={studioDomains} onChange={(domain) => updateCommon({ domain } as Partial<FlowlyStudioDefinition>)} />
                <SelectInput label="Estado" value={currentDefinition.status} options={["draft", "review", "stable"]} onChange={(status) => updateCommon({ status } as Partial<FlowlyStudioDefinition>)} />
              </div>
              <div className="mt-4"><TextAreaInput label="Descripción" value={currentDefinition.description} onChange={(description) => updateCommon({ description } as Partial<FlowlyStudioDefinition>)} rows={3} /></div>
            </StudioCard>

            {mode === "builder" && builderType === "business_object" ? (
              <>
                <StudioCard icon={<Database size={18} />} title="Campos del Business Object">
                  <div className="grid gap-3">
                    {businessObject.fields.map((field) => (
                      <div key={field.id} className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 lg:grid-cols-[1fr,1fr,0.8fr,0.5fr] lg:items-end">
                        <FieldInput label="Nombre técnico" value={field.name} onChange={(name) => updateField(field.id, { name: slugifyStudio(name).replace(/-/g, "_") })} />
                        <FieldInput label="Etiqueta" value={field.label} onChange={(label) => updateField(field.id, { label })} />
                        <SelectInput label="Tipo" value={field.type} options={fieldTypes} onChange={(type) => updateField(field.id, { type: type as FlowlyStudioFieldType })} />
                        <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65"><input type="checkbox" checked={field.required} onChange={(event) => updateField(field.id, { required: event.target.checked })} /> Obligatorio</label>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setBusinessObject((current) => ({ ...current, fields: [...current.fields, { id: createStudioId("field"), name: "new_field", label: "Nuevo campo", type: "text", required: false }] }))} className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white"><Plus size={16} /> Añadir campo</button>
                </StudioCard>
                <StudioCard icon={<Workflow size={18} />} title="Estados">
                  <div className="grid gap-3 md:grid-cols-2">
                    {businessObject.states.map((state) => (
                      <div key={state.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="grid gap-3 md:grid-cols-2"><FieldInput label="Nombre" value={state.name} onChange={(name) => updateState(state.id, { name: slugifyStudio(name).replace(/-/g, "_") })} /><FieldInput label="Etiqueta" value={state.label} onChange={(label) => updateState(state.id, { label })} /></div>
                        <label className="mt-3 flex items-center gap-2 text-sm text-white/60"><input type="checkbox" checked={Boolean(state.isInitial)} onChange={(event) => updateState(state.id, { isInitial: event.target.checked })} /> Estado inicial</label>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setBusinessObject((current) => ({ ...current, states: [...current.states, { id: createStudioId("state"), name: "new_state", label: "Nuevo estado" }] }))} className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white"><Plus size={16} /> Añadir estado</button>
                </StudioCard>
                <StudioCard icon={<GitBranch size={18} />} title="Commands, Queries, Events, Políticas, Capacidades y Relationships">
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextAreaInput label="Commands" value={asLines(businessObject.commands)} onChange={(value) => setBusinessObject((current) => ({ ...current, commands: namedItemsFromLines(value) }))} />
                    <TextAreaInput label="Queries" value={asLines(businessObject.queries)} onChange={(value) => setBusinessObject((current) => ({ ...current, queries: namedItemsFromLines(value) }))} />
                    <TextAreaInput label="Events" value={asLines(businessObject.events)} onChange={(value) => setBusinessObject((current) => ({ ...current, events: namedItemsFromLines(value) }))} />
                    <TextAreaInput label="Políticas" value={asLines(businessObject.policies)} onChange={(value) => setBusinessObject((current) => ({ ...current, policies: namedItemsFromLines(value) }))} />
                    <TextAreaInput label="Capacidades" value={asLines(businessObject.capabilities)} onChange={(value) => setBusinessObject((current) => ({ ...current, capabilities: namedItemsFromLines(value) }))} />
                    <TextAreaInput label="Relationships (uno por línea: Object:type)" value={businessObject.relationships.map((rel) => `${rel.target}:${rel.type}`).join("\n")} onChange={(value) => setBusinessObject((current) => ({ ...current, relationships: lines(value).map((line) => { const [target, type] = line.split(":"); return { id: createStudioId("rel"), target: target || "Object", type: (relationshipTypes.includes(type as FlowlyStudioRelationship["type"]) ? type : "reference") as FlowlyStudioRelationship["type"] }; }) }))} />
                  </div>
                </StudioCard>
              </>
            ) : null}

            {mode === "builder" && builderType === "capability" ? (
              <StudioCard icon={<Braces size={18} />} title="Capability Contract">
                <div className="grid gap-4 md:grid-cols-2">
                  <TextAreaInput label="Objetos de negocio" value={asLines(capability.businessObjects)} onChange={(value) => setCapability((current) => ({ ...current, businessObjects: lines(value) }))} />
                  <TextAreaInput label="Inputs" value={capability.inputs.map((input) => input.name).join("\n")} onChange={(value) => setCapability((current) => ({ ...current, inputs: lines(value).map((name) => ({ id: createStudioId("input"), name, type: "text", required: true })) }))} />
                  <TextAreaInput label="Outputs" value={capability.outputs.map((output) => output.name).join("\n")} onChange={(value) => setCapability((current) => ({ ...current, outputs: lines(value).map((name) => ({ id: createStudioId("output"), name, type: "text", required: true })) }))} />
                  <TextAreaInput label="Commands" value={asLines(capability.commands)} onChange={(value) => setCapability((current) => ({ ...current, commands: namedItemsFromLines(value) }))} />
                  <TextAreaInput label="Queries" value={asLines(capability.queries)} onChange={(value) => setCapability((current) => ({ ...current, queries: namedItemsFromLines(value) }))} />
                  <TextAreaInput label="Políticas" value={asLines(capability.policies)} onChange={(value) => setCapability((current) => ({ ...current, policies: namedItemsFromLines(value) }))} />
                  <TextAreaInput label="Events" value={asLines(capability.events)} onChange={(value) => setCapability((current) => ({ ...current, events: namedItemsFromLines(value) }))} />
                  <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65"><input type="checkbox" checked={capability.usesAI} onChange={(event) => setCapability((current) => ({ ...current, usesAI: event.target.checked }))} /> Usa AI Runtime</label>
                </div>
              </StudioCard>
            ) : null}

            {mode === "builder" && builderType === "workflow" ? (
              <StudioCard icon={<Workflow size={18} />} title="Diseñador de flujos de trabajo">
                <div className="grid gap-4 md:grid-cols-2"><FieldInput label="Trigger" value={workflow.trigger} onChange={(trigger) => setWorkflow((current) => ({ ...current, trigger }))} /><TextAreaInput label="Steps" value={workflow.steps.map((step) => `${step.name}:${step.type}`).join("\n")} onChange={(value) => setWorkflow((current) => ({ ...current, steps: lines(value).map((line) => { const [name, type] = line.split(":"); return { id: createStudioId("step"), name: name || "Step", type: (type || "capability") as FlowlyWorkflowDefinition["steps"][number]["type"] }; }) }))} /><TextAreaInput label="Events" value={asLines(workflow.events)} onChange={(value) => setWorkflow((current) => ({ ...current, events: namedItemsFromLines(value) }))} /><TextAreaInput label="Políticas" value={asLines(workflow.policies)} onChange={(value) => setWorkflow((current) => ({ ...current, policies: namedItemsFromLines(value) }))} /></div>
              </StudioCard>
            ) : null}

            {mode === "builder" && builderType === "policy" ? (
              <StudioCard icon={<ShieldCheck size={18} />} title="Diseñador de políticas">
                <div className="grid gap-4 md:grid-cols-2"><SelectInput label="Scope" value={policy.scope} options={["organization", "workspace", "business_object", "capability", "workflow"]} onChange={(scope) => setPolicy((current) => ({ ...current, scope: scope as FlowlyPolicyDefinition["scope"] }))} /><TextAreaInput label="Rules (Subject | condition | effect)" rows={8} value={policy.rules.map((rule) => `${rule.subject} | ${rule.condition} | ${rule.effect}`).join("\n")} onChange={(value) => setPolicy((current) => ({ ...current, rules: lines(value).map((line) => { const [subject, condition, effect] = line.split("|").map((part) => part.trim()); return { id: createStudioId("rule"), subject: subject || "Resource", condition: condition || "true", effect: (effect || "allow") as FlowlyPolicyDefinition["rules"][number]["effect"] }; }) }))} /></div>
              </StudioCard>
            ) : null}

            {mode === "builder" && builderType === "app" ? (
              <StudioCard icon={<LayoutDashboard size={18} />} title="Diseñador de aplicaciones">
                <div className="grid gap-4 md:grid-cols-2"><TextAreaInput label="Objetos de negocio" value={asLines(appDefinition.businessObjects)} onChange={(value) => setAppDefinition((current) => ({ ...current, businessObjects: lines(value) }))} /><TextAreaInput label="Capacidades" value={asLines(appDefinition.capabilities)} onChange={(value) => setAppDefinition((current) => ({ ...current, capabilities: lines(value) }))} /><TextAreaInput label="Navigation" value={asLines(appDefinition.navigation)} onChange={(value) => setAppDefinition((current) => ({ ...current, navigation: namedItemsFromLines(value) }))} /><TextAreaInput label="Widgets" value={asLines(appDefinition.widgets)} onChange={(value) => setAppDefinition((current) => ({ ...current, widgets: namedItemsFromLines(value) }))} /></div>
              </StudioCard>
            ) : null}

            {mode === "architect" ? (
              <StudioCard icon={<BrainCircuit size={18} />} title="Arquitecto IA Blueprint">
                <div className="grid gap-4 md:grid-cols-2">
                  <TextAreaInput label="Objetivo" value={blueprint.goal} onChange={(goal) => setBlueprint((current) => ({ ...current, goal }))} rows={4} />
                  <TextAreaInput label="Objetos de negocio propuestos" value={asLines(blueprint.businessObjects)} onChange={(value) => setBlueprint((current) => ({ ...current, businessObjects: lines(value) }))} />
                  <TextAreaInput label="Capacidades propuestas" value={asLines(blueprint.capabilities)} onChange={(value) => setBlueprint((current) => ({ ...current, capabilities: lines(value) }))} />
                  <TextAreaInput label="Flujos de trabajo propuestos" value={asLines(blueprint.workflows)} onChange={(value) => setBlueprint((current) => ({ ...current, workflows: lines(value) }))} />
                  <TextAreaInput label="Políticas propuestas" value={asLines(blueprint.policies)} onChange={(value) => setBlueprint((current) => ({ ...current, policies: lines(value) }))} />
                  <TextAreaInput label="Riesgos / revisiones" value={asLines(blueprint.risks)} onChange={(value) => setBlueprint((current) => ({ ...current, risks: lines(value) }))} />
                </div>
              </StudioCard>
            ) : null}

            <StudioCard icon={<ScrollText size={18} />} title="Notas, JSON y acciones">
              <TextAreaInput label="Notas" value={(currentDefinition as { notes?: string }).notes || ""} onChange={(notes) => updateCommon({ notes } as Partial<FlowlyStudioDefinition>)} rows={3} />
              <pre className="mt-4 max-h-96 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-5 text-white/65">{jsonPreview}</pre>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950"><Save size={16} /> Guardar en Supabase</button>
                <button type="button" onClick={downloadJson} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white"><Download size={16} /> Exportar JSON</button>
                <button type="button" onClick={generateArtifacts} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white"><Rocket size={16} /> Generar artefactos</button>
              </div>
            </StudioCard>
          </form>
        )}

        {activeTab === "generator" && (
          <section className="mt-6 grid gap-5 lg:grid-cols-2">
            <StudioCard icon={<Database size={18} />} title="SQL Supabase"><ArtifactBlock title="Migration SQL" value={artifacts?.sql || ""} /></StudioCard>
            <StudioCard icon={<Code2 size={18} />} title="TypeScript"><ArtifactBlock title="Types / Contract" value={artifacts?.typescript || ""} /></StudioCard>
            <StudioCard icon={<FileCode2 size={18} />} title="API / Runtime"><ArtifactBlock title="Route / Runtime note" value={artifacts?.apiRoute || ""} /></StudioCard>
            <StudioCard icon={<ScrollText size={18} />} title="Documentación"><ArtifactBlock title="README Markdown" value={artifacts?.markdown || ""} /></StudioCard>
            <StudioCard icon={<CheckCircle2 size={18} />} title="Tests"><ArtifactBlock title="Test Plan" value={artifacts?.testPlan || ""} /></StudioCard>
            <StudioCard icon={<Network size={18} />} title="SDK"><ArtifactBlock title="SDK Function" value={artifacts?.sdk || ""} /></StudioCard>
          </section>
        )}

        {activeTab === "library" && (
          <section className="mt-6 rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="text-xl font-semibold">Biblioteca unificada de Flowly Studio</h2><p className="mt-1 text-sm text-white/50">Objetos de negocio, Capacidades, Flujos de trabajo, Políticas, Apps y Blueprints guardados.</p></div>
              <div className="flex flex-wrap gap-2"><div className="relative"><Search className="pointer-events-none absolute left-3 top-3.5 text-white/35" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} className="rounded-2xl border border-white/10 bg-black/25 py-3 pl-9 pr-4 text-sm text-white outline-none" placeholder="Buscar..." /></div><button onClick={loadBiblioteca} className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950">Actualizar</button></div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {library.map((row) => (
                <article key={row.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{row.name}</h3><p className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-100/70">{row.kind} · {row.domain} · {row.status}</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/45">{row.slug}</span></div>
                  <p className="mt-3 min-h-14 text-sm leading-6 text-white/55">{row.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => loadRow(row)} className="rounded-xl bg-cyan-100 px-3 py-2 text-xs font-semibold text-slate-950">Editar</button><a href={`/api/studio/export/artifact?kind=${encodeURIComponent(row.kind)}&slug=${encodeURIComponent(row.slug)}`} className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white">JSON</a></div>
                </article>
              ))}
              {!library.length ? <p className="text-sm text-white/45">Todavía no hay diseños guardados o Supabase no está configurado.</p> : null}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
