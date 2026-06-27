"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  Boxes,
  Braces,
  CheckCircle2,
  Code2,
  Database,
  Download,
  FileCode2,
  GitBranch,
  Layers3,
  Plus,
  Rocket,
  Save,
  ScrollText,
  Sparkles,
  Trash2,
  Workflow,
} from "lucide-react";
import {
  createStudioId,
  initialBusinessObjectDefinition,
  slugifyStudio,
  type FlowlyBusinessObjectDefinition,
  type FlowlyGeneratedBusinessObjectArtifacts,
  type FlowlyStudioField,
  type FlowlyStudioFieldType,
  type FlowlyStudioNamedItem,
  type FlowlyStudioRelationship,
  type FlowlyStudioState,
} from "@/lib/flowlyStudio";

type StudioBusinessObjectRow = {
  id: string;
  name: string;
  slug: string;
  domain: string;
  description: string;
  status: string;
  definition: FlowlyBusinessObjectDefinition;
  generated_sql?: string | null;
  generated_typescript?: string | null;
  generated_api?: string | null;
  generated_markdown?: string | null;
  generated_tests?: string | null;
  generated_sdk?: string | null;
};

const fieldTypes: FlowlyStudioFieldType[] = ["text", "long_text", "number", "boolean", "date", "datetime", "email", "phone", "currency", "relation", "file", "json", "ai"];
const domains = ["sales", "finance", "projects", "people", "marketing", "support", "organization", "operations", "system", "custom"];
const relationshipTypes: FlowlyStudioRelationship["type"][] = ["ownership", "reference", "composition", "association", "dependency", "collaboration", "hierarchy", "temporal"];

function FieldInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="grid gap-2 text-sm text-white/65">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-200/45" />
    </label>
  );
}

function TextAreaInput({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return (
    <label className="grid gap-2 text-sm text-white/65">
      <span>{label}</span>
      <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:border-cyan-200/45" />
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

function StudioCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
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
    <details className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-cyan-100">{title}</summary>
      <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-black/35 p-4 text-xs leading-5 text-white/70">{value || "Pendiente de generar."}</pre>
    </details>
  );
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Error inesperado");
  return data as T;
}

export default function FlowlyStudioPage() {
  const [definition, setDefinition] = useState<FlowlyBusinessObjectDefinition>(initialBusinessObjectDefinition);
  const [businessObjects, setBusinessObjects] = useState<StudioBusinessObjectRow[]>([]);
  const [artifacts, setArtifacts] = useState<FlowlyGeneratedBusinessObjectArtifacts | null>(null);
  const [activeTab, setActiveTab] = useState<"designer" | "generator" | "library">("designer");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const jsonPreview = useMemo(() => JSON.stringify(definition, null, 2), [definition]);
  const tabs: { id: typeof activeTab; label: string; Icon: typeof Boxes }[] = [
    { id: "designer", label: "Business Object Designer", Icon: Boxes },
    { id: "generator", label: "Generator Preview", Icon: Code2 },
    { id: "library", label: "Biblioteca", Icon: Layers3 },
  ];

  function updateDefinition(partial: Partial<FlowlyBusinessObjectDefinition>) {
    setDefinition((current) => ({ ...current, ...partial }));
  }

  function renameObject(name: string) {
    updateDefinition({ name, slug: slugifyStudio(name) });
  }

  function addField() {
    updateDefinition({
      fields: [...definition.fields, { id: createStudioId("field"), name: "new_field", label: "Nuevo campo", type: "text", required: false }],
    });
  }

  function updateField(id: string, patch: Partial<FlowlyStudioField>) {
    updateDefinition({ fields: definition.fields.map((field) => field.id === id ? { ...field, ...patch } : field) });
  }

  function removeField(id: string) {
    updateDefinition({ fields: definition.fields.filter((field) => field.id !== id) });
  }

  function addState() {
    updateDefinition({ states: [...definition.states, { id: createStudioId("state"), name: "new_state", label: "Nuevo estado" }] });
  }

  function updateState(id: string, patch: Partial<FlowlyStudioState>) {
    updateDefinition({ states: definition.states.map((state) => state.id === id ? { ...state, ...patch } : patch.isInitial ? { ...state, isInitial: false } : state) });
  }

  function removeState(id: string) {
    updateDefinition({ states: definition.states.filter((state) => state.id !== id) });
  }

  function addNamedItem(key: "commands" | "queries" | "events" | "policies" | "capabilities", prefix: string) {
    updateDefinition({ [key]: [...definition[key], { id: createStudioId(key), name: prefix, description: "" }] } as Partial<FlowlyBusinessObjectDefinition>);
  }

  function updateNamedItem(key: "commands" | "queries" | "events" | "policies" | "capabilities", id: string, patch: Partial<FlowlyStudioNamedItem>) {
    updateDefinition({ [key]: definition[key].map((item) => item.id === id ? { ...item, ...patch } : item) } as Partial<FlowlyBusinessObjectDefinition>);
  }

  function removeNamedItem(key: "commands" | "queries" | "events" | "policies" | "capabilities", id: string) {
    updateDefinition({ [key]: definition[key].filter((item) => item.id !== id) } as Partial<FlowlyBusinessObjectDefinition>);
  }

  function addRelationship() {
    updateDefinition({ relationships: [...definition.relationships, { id: createStudioId("relationship"), target: "Company", type: "reference", description: "" }] });
  }

  function updateRelationship(id: string, patch: Partial<FlowlyStudioRelationship>) {
    updateDefinition({ relationships: definition.relationships.map((relationship) => relationship.id === id ? { ...relationship, ...patch } : relationship) });
  }

  function removeRelationship(id: string) {
    updateDefinition({ relationships: definition.relationships.filter((relationship) => relationship.id !== id) });
  }

  async function saveDefinition(event?: FormEvent) {
    event?.preventDefault();
    setError("");
    setMessage("");
    try {
      const data = await postJson<{ businessObject: StudioBusinessObjectRow; artifacts: FlowlyGeneratedBusinessObjectArtifacts }>("/api/studio/business-objects", definition);
      setArtifacts(data.artifacts);
      setMessage(`Business Object guardado: ${data.businessObject.name}`);
      await loadBusinessObjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    }
  }

  async function generateArtifacts() {
    setError("");
    setMessage("");
    try {
      const data = await postJson<{ artifacts: FlowlyGeneratedBusinessObjectArtifacts }>("/api/studio/generate/business-object", definition);
      setArtifacts(data.artifacts);
      setActiveTab("generator");
      setMessage("Artefactos generados sin guardar.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar.");
    }
  }

  async function loadBusinessObjects() {
    setError("");
    try {
      const response = await fetch("/api/studio/business-objects");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo cargar la biblioteca.");
      setBusinessObjects(data.businessObjects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la biblioteca.");
    }
  }

  function downloadJson() {
    const blob = new Blob([jsonPreview], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${definition.slug || "business-object"}.business-object.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function loadRow(row: StudioBusinessObjectRow) {
    setDefinition(row.definition);
    setArtifacts({
      sql: row.generated_sql || "",
      typescript: row.generated_typescript || "",
      apiRoute: row.generated_api || "",
      markdown: row.generated_markdown || "",
      testPlan: row.generated_tests || "",
      sdk: row.generated_sdk || "",
    });
    setActiveTab("designer");
    setMessage(`Cargado: ${row.name}`);
  }

  return (
    <main className="min-h-screen bg-[#080611] px-5 py-8 text-white lg:px-8">
      <section className="mx-auto max-w-7xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ArrowLeft size={16} /> Volver al dashboard</Link>

        <header className="mt-6 overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.06] p-8 backdrop-blur-2xl md:p-10">
          <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">Flowly Studio</span>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">La fábrica que construye Flowly OS</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/62">Primer bloque funcional: Business Object Designer con guardado en Supabase, exportación JSON y generación inicial de SQL, TypeScript, API, SDK, tests y documentación.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><div className="text-3xl font-semibold">{definition.fields.length}</div><div className="text-xs text-white/45">Campos</div></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><div className="text-3xl font-semibold">{definition.commands.length + definition.queries.length}</div><div className="text-xs text-white/45">Commands/Queries</div></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={saveDefinition} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950"><Save size={16} /> Guardar</button>
                <button onClick={generateArtifacts} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white"><Sparkles size={16} /> Generar</button>
              </div>
            </div>
          </div>
          {message ? <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}
          {error ? <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => { setActiveTab(id); if (id === "library") loadBusinessObjects(); }} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${activeTab === id ? "bg-cyan-100 text-slate-950" : "border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {activeTab === "designer" && (
          <form onSubmit={saveDefinition} className="mt-6 grid gap-5">
            <StudioCard icon={<Boxes size={18} />} title="1. Identidad del Business Object">
              <div className="grid gap-4 md:grid-cols-2">
                <FieldInput label="Nombre" value={definition.name} onChange={renameObject} />
                <FieldInput label="Slug" value={definition.slug} onChange={(slug) => updateDefinition({ slug: slugifyStudio(slug) })} />
                <SelectInput label="Dominio" value={definition.domain} options={domains} onChange={(domain) => updateDefinition({ domain })} />
                <SelectInput label="Estado del diseño" value={definition.status} options={["draft", "review", "stable"]} onChange={(status) => updateDefinition({ status: status as FlowlyBusinessObjectDefinition["status"] })} />
              </div>
              <div className="mt-4"><TextAreaInput label="Descripción" value={definition.description} onChange={(description) => updateDefinition({ description })} rows={3} /></div>
            </StudioCard>

            <StudioCard icon={<Database size={18} />} title="2. Campos">
              <div className="grid gap-3">
                {definition.fields.map((field) => (
                  <div key={field.id} className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 lg:grid-cols-[1fr,1fr,0.8fr,0.5fr,auto] lg:items-end">
                    <FieldInput label="Nombre técnico" value={field.name} onChange={(name) => updateField(field.id, { name: slugifyStudio(name).replace(/-/g, "_") })} />
                    <FieldInput label="Etiqueta" value={field.label} onChange={(label) => updateField(field.id, { label })} />
                    <SelectInput label="Tipo" value={field.type} options={fieldTypes} onChange={(type) => updateField(field.id, { type: type as FlowlyStudioFieldType })} />
                    <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65"><input type="checkbox" checked={field.required} onChange={(event) => updateField(field.id, { required: event.target.checked })} /> Obligatorio</label>
                    <button type="button" onClick={() => removeField(field.id)} className="grid h-12 w-12 place-items-center rounded-2xl border border-red-300/20 bg-red-400/10 text-red-100"><Trash2 size={16} /></button>
                    {field.type === "relation" ? <FieldInput label="Relaciona con" value={field.relationTo || ""} onChange={(relationTo) => updateField(field.id, { relationTo })} /> : null}
                    <div className="lg:col-span-4"><FieldInput label="Descripción" value={field.description || ""} onChange={(description) => updateField(field.id, { description })} /></div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addField} className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white"><Plus size={16} /> Añadir campo</button>
            </StudioCard>

            <StudioCard icon={<Workflow size={18} />} title="3. Estados">
              <div className="grid gap-3 md:grid-cols-2">
                {definition.states.map((state) => (
                  <div key={state.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <FieldInput label="Nombre" value={state.name} onChange={(name) => updateState(state.id, { name: slugifyStudio(name).replace(/-/g, "_") })} />
                      <FieldInput label="Etiqueta" value={state.label} onChange={(label) => updateState(state.id, { label })} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-sm text-white/60"><input type="checkbox" checked={Boolean(state.isInitial)} onChange={(event) => updateState(state.id, { isInitial: event.target.checked })} /> Estado inicial</label>
                      <button type="button" onClick={() => removeState(state.id)} className="text-sm text-red-100/80">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addState} className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white"><Plus size={16} /> Añadir estado</button>
            </StudioCard>

            <div className="grid gap-5 lg:grid-cols-2">
              {(["commands", "queries", "events", "policies", "capabilities"] as const).map((key) => (
                <StudioCard key={key} icon={<Braces size={18} />} title={key.charAt(0).toUpperCase() + key.slice(1)}>
                  <div className="grid gap-3">
                    {definition[key].map((item) => (
                      <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <FieldInput label="Nombre" value={item.name} onChange={(name) => updateNamedItem(key, item.id, { name })} />
                        <div className="mt-3"><FieldInput label="Descripción" value={item.description || ""} onChange={(description) => updateNamedItem(key, item.id, { description })} /></div>
                        <button type="button" onClick={() => removeNamedItem(key, item.id)} className="mt-3 text-sm text-red-100/80">Eliminar</button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addNamedItem(key, `${key === "queries" ? "Get" : key === "events" ? definition.name + "Updated" : key === "policies" ? "NewPolicy" : key === "capabilities" ? definition.name + "Capability" : "Create" + definition.name}`)} className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white"><Plus size={16} /> Añadir</button>
                </StudioCard>
              ))}
            </div>

            <StudioCard icon={<GitBranch size={18} />} title="4. Relaciones">
              <div className="grid gap-3">
                {definition.relationships.map((relationship) => (
                  <div key={relationship.id} className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr,1fr,1.4fr,auto] md:items-end">
                    <FieldInput label="Objeto destino" value={relationship.target} onChange={(target) => updateRelationship(relationship.id, { target })} />
                    <SelectInput label="Tipo" value={relationship.type} options={relationshipTypes} onChange={(type) => updateRelationship(relationship.id, { type: type as FlowlyStudioRelationship["type"] })} />
                    <FieldInput label="Descripción" value={relationship.description || ""} onChange={(description) => updateRelationship(relationship.id, { description })} />
                    <button type="button" onClick={() => removeRelationship(relationship.id)} className="grid h-12 w-12 place-items-center rounded-2xl border border-red-300/20 bg-red-400/10 text-red-100"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addRelationship} className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white"><Plus size={16} /> Añadir relación</button>
            </StudioCard>

            <StudioCard icon={<ScrollText size={18} />} title="5. Notas y JSON">
              <TextAreaInput label="Notas de arquitectura" value={definition.notes || ""} onChange={(notes) => updateDefinition({ notes })} rows={3} />
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
            <StudioCard icon={<Code2 size={18} />} title="TypeScript"><ArtifactBlock title="Types" value={artifacts?.typescript || ""} /></StudioCard>
            <StudioCard icon={<FileCode2 size={18} />} title="API"><ArtifactBlock title="Next.js Route" value={artifacts?.apiRoute || ""} /></StudioCard>
            <StudioCard icon={<ScrollText size={18} />} title="Documentación"><ArtifactBlock title="README Markdown" value={artifacts?.markdown || ""} /></StudioCard>
            <StudioCard icon={<CheckCircle2 size={18} />} title="Tests"><ArtifactBlock title="Test Plan" value={artifacts?.testPlan || ""} /></StudioCard>
            <StudioCard icon={<GitBranch size={18} />} title="SDK"><ArtifactBlock title="SDK Function" value={artifacts?.sdk || ""} /></StudioCard>
          </section>
        )}

        {activeTab === "library" && (
          <section className="mt-6 rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Biblioteca de Business Objects</h2>
                <p className="mt-1 text-sm text-white/50">Diseños guardados en Supabase y listos para el Generator.</p>
              </div>
              <button onClick={loadBusinessObjects} className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950">Actualizar</button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {businessObjects.map((row) => (
                <article key={row.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{row.name}</h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-100/70">{row.domain} · {row.status}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/45">{row.slug}</span>
                  </div>
                  <p className="mt-3 min-h-14 text-sm leading-6 text-white/55">{row.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => loadRow(row)} className="rounded-xl bg-cyan-100 px-3 py-2 text-xs font-semibold text-slate-950">Editar</button>
                    <a href={`/api/studio/export/business-object?slug=${encodeURIComponent(row.slug)}`} className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white">JSON</a>
                  </div>
                </article>
              ))}
              {!businessObjects.length ? <p className="text-sm text-white/45">Todavía no hay Business Objects guardados o Supabase no está configurado.</p> : null}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
