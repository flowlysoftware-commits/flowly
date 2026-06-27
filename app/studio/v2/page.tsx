"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Code2,
  Database,
  Download,
  FileJson,
  FolderTree,
  GitBranch,
  LayoutDashboard,
  Loader2,
  Network,
  PackagePlus,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Trash2,
  Wand2,
  Workflow,
} from "lucide-react";
import { buildProjectDefinitions, type FlowlyProjectType, type FlowlyStudioProjectBlueprint } from "@/lib/flowlyStudioProjects";
import { generateStudioArtifacts, type FlowlyStudioArtifactKind, type FlowlyStudioDefinition } from "@/lib/flowlyStudio";

type ProjectRow = {
  id: string;
  name: string;
  slug: string;
  type: FlowlyProjectType;
  description: string;
  modules: string[];
  blueprint: FlowlyStudioProjectBlueprint;
  status: string;
  updated_at: string;
};

type ArtifactRow = {
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
  updated_at?: string;
};

type ArchitectureAnalysis = {
  totals: Record<string, number>;
  nodes: Array<{ id: string; label: string; kind: string; domain: string; status: string }>;
  edges: Array<{ id: string; source: string; target: string; type: string }>;
  impacted: string[];
  warnings: string[];
  recommendations: string[];
  riskLevel: "low" | "medium" | "high";
  architectureScore: number;
};

type ReviewReport = {
  approved: boolean;
  blockers: string[];
  warnings: string[];
  actions: string[];
  score: number;
};

type BuilderPhase = {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "warning" | "failed";
  detail: string;
};

type BuilderRun = {
  id: string;
  moduleName: string;
  slug: string;
  status: "ready" | "completed" | "failed";
  phases: BuilderPhase[];
  files: Array<{ path: string; kind: string; description: string }>;
  review: ReviewReport;
  nextActions: string[];
  createdAt: string;
};

type SelectedItem =
  | { type: "project"; item: ProjectRow }
  | { type: "artifact"; item: ArtifactRow }
  | { type: "none" };

const artifactLabels: Record<string, string> = {
  business_object: "Objetos de negocio",
  capability: "Capacidades",
  workflow: "Flujos de trabajo",
  policy: "Políticas",
  app: "Aplicaciones",
  architect_blueprint: "Blueprints",
};

const artifactIcons: Record<string, ReactNode> = {
  business_object: <Boxes size={16} />,
  capability: <Sparkles size={16} />,
  workflow: <Workflow size={16} />,
  policy: <ShieldCheck size={16} />,
  app: <LayoutDashboard size={16} />,
  architect_blueprint: <BrainCircuit size={16} />,
};


const blueprintLabels: Record<string, string> = {
  businessObjects: "Objetos de negocio",
  capabilities: "Capacidades",
  workflows: "Flujos de trabajo",
  policies: "Políticas",
  apps: "Aplicaciones",
  risks: "Riesgos",
  nextSteps: "Próximos pasos",
  modules: "Módulos",
  fields: "Campos",
  states: "Estados",
  steps: "Pasos",
  rules: "Reglas",
  events: "Eventos",
};

function definitionToRuntimeArtifact(definition: FlowlyStudioDefinition): ArtifactRow {
  const generated = generateStudioArtifacts(definition);
  return {
    id: `runtime-${definition.kind}-${definition.slug}`,
    kind: definition.kind || "business_object",
    name: definition.name,
    slug: definition.slug,
    domain: definition.domain,
    description: definition.description,
    status: definition.status,
    definition,
    generated_sql: generated.sql,
    generated_typescript: generated.typescript,
    generated_api: generated.apiRoute,
    generated_markdown: generated.markdown,
    generated_tests: generated.testPlan,
    generated_sdk: generated.sdk,
  };
}

function buildBlueprintRuntimeArtifacts(project?: ProjectRow | null, storedArtifacts: ArtifactRow[] = []) {
  if (!project?.blueprint) return storedArtifacts;
  const storedByKey = new Map(storedArtifacts.map((artifact) => [`${artifact.kind}:${artifact.slug}`, artifact]));
  const runtime = buildProjectDefinitions(project.blueprint).map((definition) => {
    const key = `${definition.kind}:${definition.slug}`;
    return storedByKey.get(key) || definitionToRuntimeArtifact(definition);
  });
  const runtimeKeys = new Set(runtime.map((artifact) => `${artifact.kind}:${artifact.slug}`));
  const relatedStored = storedArtifacts.filter((artifact) => !runtimeKeys.has(`${artifact.kind}:${artifact.slug}`) && artifact.domain === runtime[0]?.domain);
  return [...runtime, ...relatedStored];
}

function blueprintCount(project: ProjectRow | null | undefined, key: keyof FlowlyStudioProjectBlueprint) {
  const value = project?.blueprint?.[key];
  return Array.isArray(value) ? value.length : 0;
}

const projectTypes: Array<{ id: FlowlyProjectType; label: string }> = [
  { id: "ia_assistant", label: "IA Assistant / Companion" },
  { id: "libre", label: "Libre" },
  { id: "rrhh", label: "Recursos Humanos" },
  { id: "crm", label: "CRM" },
  { id: "erp", label: "ERP" },
  { id: "vehiculos", label: "Vehículos" },
  { id: "hotel", label: "Hotel" },
  { id: "clinica", label: "Clínica" },
  { id: "logistica", label: "Logística" },
  { id: "taller", label: "Taller" },
];

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Error inesperado");
  return data as T;
}

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

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function riskLabel(value?: string) {
  if (value === "low") return "Bajo";
  if (value === "medium") return "Medio";
  if (value === "high") return "Alto";
  return "Sin calcular";
}

function Panel({ title, icon, children, className }: { title: string; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx("rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4 backdrop-blur-2xl", className)}>
      <div className="mb-4 flex items-center gap-3">
        {icon ? <span className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-200/15 bg-cyan-300/10 text-cyan-100">{icon}</span> : null}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SmallButton({ children, onClick, disabled, tone = "default" }: { children: ReactNode; onClick?: () => void; disabled?: boolean; tone?: "default" | "primary" | "danger" }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45",
        tone === "primary" && "border-cyan-200/40 bg-cyan-200 text-slate-950 hover:bg-cyan-100",
        tone === "danger" && "border-red-300/25 bg-red-400/10 text-red-100 hover:bg-red-400/20",
        tone === "default" && "border-white/10 bg-white/[0.06] text-white/75 hover:bg-white/[0.1]",
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center">
      <p className="font-semibold text-white/80">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/45">{text}</p>
    </div>
  );
}

function artifactSummary(artifact: ArtifactRow) {
  const definition = artifact.definition as Record<string, unknown>;
  const counters = [
    ["Campos", Array.isArray(definition.fields) ? definition.fields.length : null],
    ["Estados", Array.isArray(definition.states) ? definition.states.length : null],
    ["Capacidades", Array.isArray(definition.capabilities) ? definition.capabilities.length : null],
    ["Objetos", Array.isArray(definition.businessObjects) ? definition.businessObjects.length : null],
    ["Pasos", Array.isArray(definition.steps) ? definition.steps.length : null],
    ["Reglas", Array.isArray(definition.rules) ? definition.rules.length : null],
  ].filter(([, value]) => typeof value === "number") as Array<[string, number]>;
  return counters.slice(0, 3);
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function readArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function getItemTitle(value: unknown, fallback: string) {
  const record = asRecord(value);
  return String(record.label ?? record.name ?? record.target ?? record.subject ?? record.condition ?? fallback);
}

function getItemSubtitle(value: unknown) {
  const record = asRecord(value);
  return String(record.description ?? record.type ?? record.effect ?? record.target ?? "");
}

function projectArchitectureMetrics(project: ProjectRow | null, runtimeArtifacts: ArtifactRow[]) {
  const businessObjects = runtimeArtifacts.filter((artifact) => artifact.kind === "business_object");
  const capabilities = runtimeArtifacts.filter((artifact) => artifact.kind === "capability");
  const workflows = runtimeArtifacts.filter((artifact) => artifact.kind === "workflow");
  const policies = runtimeArtifacts.filter((artifact) => artifact.kind === "policy");
  const apps = runtimeArtifacts.filter((artifact) => artifact.kind === "app");
  const relationships = businessObjects.reduce((total, artifact) => total + readArray(asRecord(artifact.definition).relationships).length, 0);
  const fields = businessObjects.reduce((total, artifact) => total + readArray(asRecord(artifact.definition).fields).length, 0);
  const generatedFiles = runtimeArtifacts.length * 6;
  const tests = runtimeArtifacts.length + capabilities.length + workflows.length;
  const score = Math.min(98, 70 + Math.floor(runtimeArtifacts.length / 2) + (relationships > 0 ? 6 : 0) + (capabilities.length > 0 ? 6 : 0) + (workflows.length > 0 ? 5 : 0));
  return { projectName: project?.name || "Proyecto", businessObjects, capabilities, workflows, policies, apps, relationships, fields, generatedFiles, tests, score };
}

function Pill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "cyan" | "green" | "amber" }) {
  return (
    <span className={cx(
      "inline-flex items-center rounded-full border px-3 py-1 text-xs",
      tone === "cyan" && "border-cyan-300/20 bg-cyan-300/10 text-cyan-50",
      tone === "green" && "border-emerald-300/20 bg-emerald-300/10 text-emerald-50",
      tone === "amber" && "border-amber-300/20 bg-amber-300/10 text-amber-50",
      tone === "default" && "border-white/10 bg-white/[0.06] text-white/55",
    )}>{children}</span>
  );
}

function ProjectArchitectureOverview({ project, runtimeArtifacts, onSelectArtifact }: { project: ProjectRow; runtimeArtifacts: ArtifactRow[]; onSelectArtifact: (artifact: ArtifactRow) => void }) {
  const metrics = projectArchitectureMetrics(project, runtimeArtifacts);
  const blocks = [
    ["Objetos de negocio", metrics.businessObjects.length, <Boxes key="bo" size={16} />],
    ["Capacidades", metrics.capabilities.length, <Sparkles key="cap" size={16} />],
    ["Flujos de trabajo", metrics.workflows.length, <Workflow key="flow" size={16} />],
    ["Políticas", metrics.policies.length, <ShieldCheck key="pol" size={16} />],
    ["Aplicaciones", metrics.apps.length, <LayoutDashboard key="app" size={16} />],
    ["Relaciones", metrics.relationships, <GitBranch key="rel" size={16} />],
    ["Archivos generables", metrics.generatedFiles, <Code2 key="code" size={16} />],
    ["Tests previstos", metrics.tests, <CheckCircle2 key="tests" size={16} />],
  ] as const;

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">Vista de arquitectura</p>
            <h2 className="mt-2 text-4xl font-semibold">{project.name}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">{project.description}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-white/35">Calidad arquitectónica</p>
            <p className="mt-2 text-3xl font-semibold text-cyan-50">{metrics.score}/100</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{project.modules?.map((item) => <Pill key={item} tone="cyan">{item}</Pill>)}</div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {blocks.map(([label, value, icon]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between gap-3 text-white/45"><span className="text-xs uppercase tracking-[0.18em]">{label}</span>{icon}</div>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {Object.entries(artifactLabels).map(([kind, label]) => {
          const items = runtimeArtifacts.filter((artifact) => artifact.kind === kind);
          if (!items.length) return null;
          return (
            <div key={kind} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-100">{artifactIcons[kind]} {label}</p>
              <div className="grid gap-2">
                {items.slice(0, 10).map((artifact) => (
                  <button key={`${artifact.kind}-${artifact.slug}`} onClick={() => onSelectArtifact(artifact)} className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-left text-xs text-white/60 hover:border-cyan-300/30 hover:bg-cyan-300/10">
                    <span className="block font-semibold text-white/80">{artifact.name}</span>
                    <span className="mt-1 block truncate text-white/35">{artifact.description}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <details className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-cyan-100">Blueprint completo</summary>
        <pre className="mt-3 max-h-80 overflow-auto text-xs leading-5 text-white/60">{JSON.stringify(project.blueprint, null, 2)}</pre>
      </details>
    </div>
  );
}

function DynamicListSection({ title, items, open = false }: { title: string; items: unknown[]; open?: boolean }) {
  if (!items.length) return null;
  return (
    <details open={open} className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-cyan-100">{title} ({items.length})</summary>
      <div className="mt-3 grid gap-2">
        {items.map((entry, index) => (
          <div key={`${title}-${index}`} className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-xs text-white/55">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong className="text-white/80">{getItemTitle(entry, `Elemento ${index + 1}`)}</strong>
              {getItemSubtitle(entry) ? <span className="rounded-full bg-black/25 px-2 py-1 text-white/35">{getItemSubtitle(entry)}</span> : null}
            </div>
            {asRecord(entry).description ? <p className="mt-2 leading-5 text-white/40">{String(asRecord(entry).description)}</p> : null}
          </div>
        ))}
      </div>
    </details>
  );
}

function DynamicArtifactEditor({ artifact, runtimeArtifacts }: { artifact: ArtifactRow; runtimeArtifacts: ArtifactRow[] }) {
  const definition = asRecord(artifact.definition);
  const fields = readArray(definition.fields);
  const states = readArray(definition.states);
  const relationships = readArray(definition.relationships);
  const commands = readArray(definition.commands);
  const queries = readArray(definition.queries);
  const events = readArray(definition.events);
  const policies = readArray(definition.policies);
  const capabilities = readArray(definition.capabilities);
  const steps = readArray(definition.steps);
  const rules = readArray(definition.rules);
  const inputs = readArray(definition.inputs);
  const outputs = readArray(definition.outputs);
  const navigation = readArray(definition.navigation);
  const widgets = readArray(definition.widgets);
  const relatedNames = new Set([...relationships.map((item) => String(asRecord(item).target || "")), ...readArray(definition.businessObjects).map(String), ...capabilities.map((item) => getItemTitle(item, ""))].filter(Boolean));
  const relatedArtifacts = runtimeArtifacts.filter((item) => relatedNames.has(item.name) || relatedNames.has(item.slug));

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">Editor dinámico · {artifactLabels[artifact.kind] || artifact.kind}</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr,220px]">
          <div>
            <label className="text-xs uppercase tracking-[0.16em] text-white/35">Nombre</label>
            <input readOnly value={artifact.name} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-2xl font-semibold text-white outline-none" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.16em] text-white/35">Estado</label>
            <input readOnly value={artifact.status || "draft"} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-white outline-none" />
          </div>
        </div>
        <label className="mt-3 block text-xs uppercase tracking-[0.16em] text-white/35">Descripción</label>
        <textarea readOnly value={artifact.description} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-sm leading-6 text-white/70 outline-none" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Campos", fields.length], ["Estados", states.length], ["Relaciones", relationships.length], ["Capabilities", capabilities.length || readArray(definition.capabilities).length],
          ["Commands", commands.length], ["Queries", queries.length], ["Eventos", events.length], ["Políticas", policies.length || rules.length],
        ].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</p><p className="mt-2 text-2xl font-semibold">{String(value)}</p></div>)}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="grid gap-3">
          <DynamicListSection title="Campos" items={fields} open />
          <DynamicListSection title="Estados" items={states} open />
          <DynamicListSection title="Relaciones" items={relationships} />
          <DynamicListSection title="Entradas" items={inputs} />
          <DynamicListSection title="Salidas" items={outputs} />
          <DynamicListSection title="Pasos del flujo" items={steps} open={artifact.kind === "workflow"} />
          <DynamicListSection title="Reglas" items={rules} open={artifact.kind === "policy"} />
        </div>
        <div className="grid gap-3">
          <DynamicListSection title="Commands" items={commands} />
          <DynamicListSection title="Queries" items={queries} />
          <DynamicListSection title="Eventos" items={events} />
          <DynamicListSection title="Políticas vinculadas" items={policies} />
          <DynamicListSection title="Capacidades vinculadas" items={capabilities} />
          <DynamicListSection title="Navegación" items={navigation} open={artifact.kind === "app"} />
          <DynamicListSection title="Widgets" items={widgets} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="mb-3 text-sm font-semibold text-cyan-100">Relaciones visuales</p>
        {relationships.length || relatedArtifacts.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {relationships.map((relation, index) => {
              const record = asRecord(relation);
              return <div key={`rel-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-xs"><p className="text-white/75">{artifact.name}</p><p className="my-2 text-cyan-100">──── {String(record.type || "relación")} →</p><p className="font-semibold text-white">{String(record.target || "Destino")}</p><p className="mt-1 text-white/35">{String(record.cardinality || "")}</p></div>;
            })}
            {relatedArtifacts.slice(0, 6).map((related) => <div key={related.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-xs"><p className="text-white/75">{artifact.name}</p><p className="my-2 text-cyan-100">──── usa →</p><p className="font-semibold text-white">{related.name}</p><p className="mt-1 text-white/35">{artifactLabels[related.kind] || related.kind}</p></div>)}
          </div>
        ) : <p className="text-sm text-white/40">Sin relaciones detectadas en el Blueprint.</p>}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <details open className="rounded-2xl border border-white/10 bg-black/20 p-4"><summary className="cursor-pointer text-sm font-semibold text-cyan-100">SQL generado</summary><pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap text-xs text-white/55">{artifact.generated_sql || "Pendiente"}</pre></details>
        <details className="rounded-2xl border border-white/10 bg-black/20 p-4"><summary className="cursor-pointer text-sm font-semibold text-cyan-100">TypeScript generado</summary><pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap text-xs text-white/55">{artifact.generated_typescript || "Pendiente"}</pre></details>
        <details className="rounded-2xl border border-white/10 bg-black/20 p-4"><summary className="cursor-pointer text-sm font-semibold text-cyan-100">API generada</summary><pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap text-xs text-white/55">{artifact.generated_api || "Pendiente"}</pre></details>
        <details className="rounded-2xl border border-white/10 bg-black/20 p-4"><summary className="cursor-pointer text-sm font-semibold text-cyan-100">Markdown generado</summary><pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap text-xs text-white/55">{artifact.generated_markdown || "Pendiente"}</pre></details>
      </div>
    </div>
  );
}

function GeneratorProgress({ runtimeArtifacts, review }: { runtimeArtifacts: ArtifactRow[]; review: ReviewReport | null }) {
  const metrics = projectArchitectureMetrics(null, runtimeArtifacts);
  const steps = [
    ["Blueprint", runtimeArtifacts.length > 0, `${runtimeArtifacts.length} piezas detectadas`],
    ["SQL", runtimeArtifacts.some((item) => item.generated_sql), `${metrics.businessObjects.length} tablas previstas`],
    ["TypeScript", runtimeArtifacts.some((item) => item.generated_typescript), `${runtimeArtifacts.length} tipos/servicios`],
    ["API", runtimeArtifacts.some((item) => item.generated_api), `${runtimeArtifacts.length} rutas candidatas`],
    ["SDK", runtimeArtifacts.some((item) => item.generated_sdk), "Clientes preparados"],
    ["Docs", runtimeArtifacts.some((item) => item.generated_markdown), "Markdown generado"],
    ["Tests", runtimeArtifacts.some((item) => item.generated_tests), `${metrics.tests} pruebas previstas`],
    ["Revisión", Boolean(review), review ? `${review.score}/100` : "Pendiente"],
  ] as const;
  return (
    <div className="grid gap-2 md:grid-cols-4">
      {steps.map(([label, done, detail]) => (
        <div key={label} className={cx("rounded-xl border p-3", done ? "border-emerald-300/20 bg-emerald-300/10" : "border-white/10 bg-black/20")}>
          <p className={cx("flex items-center gap-2 text-xs font-semibold", done ? "text-emerald-100" : "text-white/45")}>{done ? <CheckCircle2 size={14} /> : <Loader2 size={14} />} {label}</p>
          <p className="mt-1 text-xs text-white/35">{detail}</p>
        </div>
      ))}
    </div>
  );
}

function BuilderProgress({ run }: { run: BuilderRun | null }) {
  if (!run) return null;
  return (
    <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">Flowly Builder</p>
          <h3 className="mt-1 text-lg font-semibold">{run.moduleName} · {run.status === "completed" ? "fabricado" : "preparado"}</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/60">{run.files.length} archivos</span>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {run.phases.map((phase) => (
          <div key={phase.id} className={cx("rounded-xl border p-3", phase.status === "completed" ? "border-emerald-300/20 bg-emerald-300/10" : phase.status === "warning" ? "border-amber-300/20 bg-amber-300/10" : "border-white/10 bg-black/20")}>
            <p className="flex items-center gap-2 text-xs font-semibold text-white/80">{phase.status === "completed" ? <CheckCircle2 size={14} /> : <Loader2 size={14} />} {phase.name}</p>
            <p className="mt-1 text-xs text-white/40">{phase.detail}</p>
          </div>
        ))}
      </div>
      <details className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
        <summary className="cursor-pointer text-xs font-semibold text-cyan-100">Ver archivos que fabricará Flowly</summary>
        <div className="mt-3 max-h-56 space-y-2 overflow-auto pr-1">
          {run.files.map((file) => (
            <div key={file.path} className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-white/55">
              <span className="block font-mono text-white/75">{file.path}</span>
              <span className="mt-1 block text-white/35">{file.description}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

export default function FlowlyStudioV2Page() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactRow[]>([]);
  const [analysis, setAnalysis] = useState<ArchitectureAnalysis | null>(null);
  const [selected, setSelected] = useState<SelectedItem>({ type: "none" });
  const [query, setQuery] = useState("");
  const [projectName, setProjectName] = useState("IA Assistant");
  const [projectDescription, setProjectDescription] = useState("Módulo del Companion con objetivos, misiones, recompensas, niveles, experiencia, avatar y gamificación.");
  const [projectPrompt, setProjectPrompt] = useState("Quiero crear el módulo IA Assistant: Companion de Flowly con mascota, objetivos, recompensas, misiones diarias, niveles, experiencia, estado de ánimo y avatar.");
  const [projectType, setProjectType] = useState<FlowlyProjectType>("ia_assistant");
  const [moduleName, setModuleName] = useState("IA Assistant");
  const [review, setReview] = useState<ReviewReport | null>(null);
  const [builderRun, setBuilderRun] = useState<BuilderRun | null>(null);
  const [consoleLines, setConsoleLines] = useState<string[]>(["Studio V2 preparado. Crea o selecciona un proyecto para empezar."]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedProject = selected.type === "project" ? selected.item : null;
  const selectedArtifact = selected.type === "artifact" ? selected.item : null;
  const activeProject = selectedProject || projects.find((project) => project.name === moduleName) || projects[0] || null;

  const runtimeArtifacts = useMemo(() => buildBlueprintRuntimeArtifacts(activeProject, artifacts), [activeProject, artifacts]);

  const filteredArtifacts = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return runtimeArtifacts;
    return runtimeArtifacts.filter((item) => [item.name, item.slug, item.domain, item.kind, item.description].join(" ").toLowerCase().includes(value));
  }, [runtimeArtifacts, query]);

  const groupedArtifacts = useMemo(() => {
    return filteredArtifacts.reduce<Record<string, ArtifactRow[]>>((acc, item) => {
      acc[item.kind] = acc[item.kind] || [];
      acc[item.kind].push(item);
      return acc;
    }, {});
  }, [filteredArtifacts]);

  const selectedSlugs = useMemo(() => runtimeArtifacts.map((item) => item.slug), [runtimeArtifacts]);

  useEffect(() => {
    void loadStudio();
  }, []);

  function pushConsole(line: string) {
    setConsoleLines((current) => [`${new Date().toLocaleTimeString("es-ES")} · ${line}`, ...current].slice(0, 8));
  }

  async function loadStudio() {
    setLoading(true);
    setError("");
    try {
      const [projectsData, artifactsData, architectureData] = await Promise.all([
        readJson<{ projects: ProjectRow[] }>("/api/studio/projects"),
        readJson<{ artifacts: ArtifactRow[] }>("/api/studio/artifacts"),
        readJson<{ analysis: ArchitectureAnalysis }>("/api/studio/architecture"),
      ]);
      setProjects(projectsData.projects || []);
      setArtifacts(artifactsData.artifacts || []);
      setAnalysis(architectureData.analysis || null);
      if (!selected || selected.type === "none") {
        const firstProject = projectsData.projects?.[0];
        if (firstProject) setSelected({ type: "project", item: firstProject });
      }
      pushConsole("Datos de Studio sincronizados.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar Studio V2.");
    } finally {
      setLoading(false);
    }
  }

  async function createProject() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await postJson<{ project: ProjectRow; blueprint: FlowlyStudioProjectBlueprint; artifacts: ArtifactRow[] }>("/api/studio/projects", {
        name: projectName,
        description: projectDescription,
        type: projectType,
        prompt: projectPrompt,
        modules: ["Companion", "Objetivos", "Misiones", "Recompensas", "Gamificación", "Avatar"],
        createArtifacts: true,
      });
      setMessage(`Proyecto ${data.project.name} creado con ${data.artifacts.length} piezas iniciales.`);
      setModuleName(data.project.name);
      setSelected({ type: "project", item: data.project });
      pushConsole(`Proyecto creado: ${data.project.name}.`);
      await loadStudio();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el proyecto.");
    } finally {
      setLoading(false);
    }
  }


  async function createIaAssistantSeed() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await postJson<{ project: ProjectRow; blueprint: FlowlyStudioProjectBlueprint; artifacts: ArtifactRow[] }>("/api/studio/projects/ia-assistant", {});
      setMessage(`IA Assistant creado con ${data.artifacts.length} piezas listas.`);
      setModuleName("IA Assistant");
      setSelected({ type: "project", item: data.project });
      pushConsole(`IA Assistant diseñado por Project Generator Engine: ${data.artifacts.length} piezas.`);
      await loadStudio();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear IA Assistant.");
    } finally {
      setLoading(false);
    }
  }

  async function reviewModule() {
    setLoading(true);
    setError("");
    try {
      const data = await postJson<{ review: ReviewReport }>("/api/studio/review/module", { moduleName, slugs: selectedSlugs, artifacts: runtimeArtifacts });
      setReview(data.review);
      pushConsole(`Revisión completada. Puntuación: ${data.review.score}/100.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo revisar el módulo.");
    } finally {
      setLoading(false);
    }
  }

  async function generateModule() {
    setLoading(true);
    setError("");
    try {
      const data = await postJson<{ review: ReviewReport }>("/api/studio/generate/module", { moduleName, slugs: selectedSlugs, artifacts: runtimeArtifacts });
      setReview(data.review);
      pushConsole(`Generación registrada. Revisión: ${data.review.score}/100.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el módulo.");
    } finally {
      setLoading(false);
    }
  }

  async function exportModule() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/studio/export/module", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ moduleName, slugs: selectedSlugs, artifacts: runtimeArtifacts, force: true }) });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "No se pudo exportar el módulo.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${moduleName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-flowly-module.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
      pushConsole("ZIP instalable exportado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo exportar el módulo.");
    } finally {
      setLoading(false);
    }
  }

  async function installLocal() {
    setLoading(true);
    setError("");
    try {
      const data = await postJson<{ written: string[]; review: ReviewReport }>("/api/studio/install/module", { moduleName, slugs: selectedSlugs, artifacts: runtimeArtifacts, force: true });
      setReview(data.review);
      pushConsole(`Instalación local completada. Archivos escritos: ${data.written.length}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo instalar. Activa FLOWLY_STUDIO_ALLOW_FILE_WRITE=true en local si quieres escribir archivos automáticamente.");
    } finally {
      setLoading(false);
    }
  }


  async function buildModule() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await postJson<{ run: BuilderRun }>("/api/studio/build/module", { moduleName, slugs: selectedSlugs, artifacts: runtimeArtifacts, force: true });
      setBuilderRun(data.run);
      setReview(data.run.review);
      setMessage(`Builder preparado: ${data.run.files.length} archivos listos para fabricar.`);
      pushConsole(`Flowly Builder listo para ${data.run.moduleName}: ${data.run.files.length} archivos, ${data.run.phases.length} fases.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo fabricar el módulo.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteProject(project: ProjectRow) {
    const confirmed = window.confirm(`¿Eliminar el proyecto "${project.name}" y sus piezas de Studio? Esta acción no elimina código instalado, solo la prueba guardada en Studio.`);
    if (!confirmed) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await postJson<{ ok: boolean }>(`/api/studio/projects?id=${encodeURIComponent(project.id)}&deleteArtifacts=true`, { _method: "DELETE" });
      setMessage(`Proyecto eliminado: ${project.name}`);
      if (selectedProject?.id === project.id) setSelected({ type: "none" });
      pushConsole(`Proyecto eliminado: ${project.name}.`);
      await loadStudio();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el proyecto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#06040d] text-white">
      <section className="mx-auto flex min-h-screen max-w-[1800px] flex-col px-4 py-4">
        <header className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/studio" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/65 hover:text-white"><ArrowLeft size={16} /> Studio</Link>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">Flowly Studio V2</p>
                <h1 className="text-2xl font-semibold md:text-3xl">Sistema operativo para crear módulos</h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SmallButton onClick={loadStudio} disabled={loading}><Search size={14} /> Sincronizar</SmallButton>
              <SmallButton onClick={() => downloadJson("flowly-studio-blueprint.json", { projects, artifacts: runtimeArtifacts, analysis, activeProject })}><FileJson size={14} /> Exportar JSON</SmallButton>
              <Link href="/studio/projects" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/75 hover:bg-white/[0.1]"><PackagePlus size={14} /> Modo clásico</Link>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.07] p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-200/20 bg-cyan-200/10 text-cyan-100"><Bot size={18} /></span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-cyan-50">Architect AI</p>
                  <textarea value={projectPrompt} onChange={(event) => setProjectPrompt(event.target.value)} rows={2} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm leading-6 text-white outline-none focus:border-cyan-200/40" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-white/40">Puntuación</p><p className="mt-1 text-2xl font-semibold">{analysis?.architectureScore ?? "—"}/100</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-white/40">Riesgo</p><p className="mt-1 text-2xl font-semibold">{riskLabel(analysis?.riskLevel)}</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-white/40">Piezas</p><p className="mt-1 text-2xl font-semibold">{runtimeArtifacts.length}</p></div>
            </div>
          </div>
          {message ? <div className="mt-3 rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}
          {error ? <div className="mt-3 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        </header>

        <section className="mt-4 grid flex-1 gap-4 xl:grid-cols-[310px,minmax(0,1fr),360px]">
          <Panel title="Árbol del proyecto" icon={<FolderTree size={18} />} className="min-h-[620px]">
            <div className="grid gap-3">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en Studio..." className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30" />
              <button onClick={() => setSelected({ type: "none" })} className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-left text-sm font-semibold text-cyan-50 hover:bg-cyan-300/15">+ Nuevo proyecto</button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Proyectos</p>
                {projects.length ? projects.map((project) => (
                  <div key={project.id} className={cx("mb-2 flex w-full items-center gap-2 rounded-xl border px-2 py-2 transition", selectedProject?.id === project.id ? "border-cyan-300/30 bg-cyan-300/10" : "border-white/10 bg-black/20 hover:bg-white/[0.06]")}>
                    <button onClick={() => { setSelected({ type: "project", item: project }); setModuleName(project.name); }} className="min-w-0 flex-1 text-left text-sm">
                      <span className="block truncate">{project.name}</span>
                    </button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); void deleteProject(project); }} title="Eliminar proyecto" className="rounded-lg border border-red-300/15 bg-red-400/10 p-1.5 text-red-100 opacity-70 transition hover:opacity-100">
                      <Trash2 size={13} />
                    </button>
                    <ChevronRight size={14} className="text-white/35" />
                  </div>
                )) : <p className="text-sm text-white/35">Aún no hay proyectos.</p>}
              </div>

              {activeProject ? (
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">Runtime del Blueprint</p>
                  <p className="mt-2 text-sm font-semibold text-white">{activeProject.name}</p>
                  <p className="mt-1 text-xs leading-5 text-white/45">El árbol se construye directamente desde el blueprint activo. Todo lo que aparece aquí alimenta al editor, inspector y Generator.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <span className="rounded-lg bg-black/25 px-2 py-1 text-white/55">BO: {blueprintCount(activeProject, "businessObjects")}</span>
                    <span className="rounded-lg bg-black/25 px-2 py-1 text-white/55">Caps: {blueprintCount(activeProject, "capabilities")}</span>
                    <span className="rounded-lg bg-black/25 px-2 py-1 text-white/55">Flows: {blueprintCount(activeProject, "workflows")}</span>
                    <span className="rounded-lg bg-black/25 px-2 py-1 text-white/55">Apps: {blueprintCount(activeProject, "apps")}</span>
                  </div>
                </div>
              ) : null}

              {Object.entries(artifactLabels).map(([kind, label]) => {
                const items = groupedArtifacts[kind] || [];
                return (
                  <details key={kind} open className="rounded-xl border border-white/10 bg-black/15 p-3">
                    <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-white/75">{artifactIcons[kind]} {label} <span className="ml-auto text-xs text-white/35">{items.length}</span></summary>
                    <div className="mt-3 space-y-2">
                      {items.length ? items.map((artifact) => (
                        <button key={`${artifact.kind}-${artifact.slug}`} onClick={() => { setSelected({ type: "artifact", item: artifact }); setModuleName(activeProject?.name || moduleName); }} className={cx("w-full rounded-lg border px-3 py-2 text-left text-xs transition", selectedArtifact?.slug === artifact.slug && selectedArtifact?.kind === artifact.kind ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-50" : "border-white/10 bg-white/[0.035] text-white/60 hover:bg-white/[0.07]")}> 
                          <span className="block truncate font-semibold">{artifact.name}</span>
                          <span className="mt-1 block text-white/35">{artifact.domain}{artifact.id.startsWith("runtime-") ? " · blueprint" : " · guardado"}</span>
                        </button>
                      )) : <p className="py-2 text-xs text-white/30">Vacío</p>}
                    </div>
                  </details>
                );
              })}
            </div>
          </Panel>

          <Panel title="Editor visual" icon={<Network size={18} />} className="min-h-[620px]">
            {selected.type === "none" ? (
              <div className="grid gap-4">
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">Nuevo proyecto</p>
                  <h2 className="mt-2 text-3xl font-semibold">IA Assistant</h2>
                  <p className="mt-3 text-sm leading-6 text-white/55">Crea la estructura base del módulo del Companion con recompensas, objetivos, misiones y avatar. Después lo revisamos en el árbol y lo pasamos al Generator.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-2 text-sm text-white/65">Nombre<input value={projectName} onChange={(event) => setProjectName(event.target.value)} className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-white outline-none" /></label>
                  <label className="grid gap-2 text-sm text-white/65">Tipo<select value={projectType} onChange={(event) => setProjectType(event.target.value as FlowlyProjectType)} className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-white outline-none">{projectTypes.map((item) => <option key={item.id} value={item.id} className="bg-slate-950">{item.label}</option>)}</select></label>
                </div>
                <label className="grid gap-2 text-sm text-white/65">Descripción<textarea value={projectDescription} onChange={(event) => setProjectDescription(event.target.value)} rows={3} className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-white outline-none" /></label>
                <div className="flex flex-wrap gap-2"><SmallButton tone="primary" onClick={createProject} disabled={loading}>{loading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />} Diseñar proyecto con IA</SmallButton><SmallButton onClick={createIaAssistantSeed} disabled={loading}><Bot size={14} /> Crear IA Assistant listo</SmallButton><SmallButton onClick={() => { setProjectName("IA Assistant"); setProjectType("ia_assistant"); setProjectDescription("Módulo del Companion con objetivos, misiones, recompensas, niveles, experiencia, avatar y gamificación."); setProjectPrompt("Quiero crear el módulo IA Assistant: Companion de Flowly con mascota, objetivos, recompensas, misiones diarias, niveles, experiencia, estado de ánimo y avatar."); }}>Restaurar IA Assistant</SmallButton></div>
              </div>
            ) : null}

            {selectedProject ? (
              <ProjectArchitectureOverview
                project={selectedProject}
                runtimeArtifacts={runtimeArtifacts}
                onSelectArtifact={(artifact) => setSelected({ type: "artifact", item: artifact })}
              />
            ) : null}

            {selectedArtifact ? <DynamicArtifactEditor artifact={selectedArtifact} runtimeArtifacts={runtimeArtifacts} /> : null}
          </Panel>

          <Panel title="Inspector" icon={<TerminalSquare size={18} />} className="min-h-[620px]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/35">Elemento seleccionado</p>
                <p className="mt-2 text-xl font-semibold">{selectedProject?.name || selectedArtifact?.name || "Nuevo proyecto"}</p>
                <p className="mt-2 text-sm leading-6 text-white/45">{selectedProject?.description || selectedArtifact?.description || "Define un proyecto desde el editor central."}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="mb-3 text-sm font-semibold">Análisis de arquitectura</p>
                {analysis ? <div className="space-y-3">
                  <div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-200" style={{ width: `${analysis.architectureScore}%` }} /></div>
                  <p className="text-sm text-white/55">Puntuación: <strong className="text-white">{analysis.architectureScore}/100</strong> · Riesgo {riskLabel(analysis.riskLevel)}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-white/50">{Object.entries(analysis.totals || {}).map(([key, value]) => <div key={key} className="rounded-xl border border-white/10 bg-white/[0.04] p-3"><span className="block uppercase tracking-[0.16em] text-white/30">{artifactLabels[key] || key}</span><strong className="mt-1 block text-lg text-white">{value}</strong></div>)}</div>
                </div> : <p className="text-sm text-white/40">Sin análisis.</p>}
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="mb-3 text-sm font-semibold">Avisos y recomendaciones</p>
                <div className="space-y-2">
                  {analysis?.warnings?.length ? analysis.warnings.slice(0, 4).map((item) => <p key={item} className="flex gap-2 text-xs leading-5 text-amber-100"><AlertTriangle size={14} className="mt-0.5 shrink-0" />{item}</p>) : <p className="flex gap-2 text-xs text-emerald-100"><CheckCircle2 size={14} />Sin avisos críticos.</p>}
                  {analysis?.recommendations?.slice(0, 4).map((item) => <p key={item} className="flex gap-2 text-xs leading-5 text-white/50"><Sparkles size={14} className="mt-0.5 shrink-0 text-cyan-100" />{item}</p>)}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="mb-3 text-sm font-semibold">Revisión automática</p>
                {review ? <div className="space-y-2 text-xs leading-5 text-white/55">
                  <p className={review.approved ? "text-emerald-100" : "text-red-100"}>{review.approved ? "Aprobado para exportar" : "Bloqueado"} · {review.score}/100</p>
                  {review.blockers.map((item) => <p key={item} className="text-red-100">Bloqueo: {item}</p>)}
                  {review.warnings.map((item) => <p key={item} className="text-amber-100">Aviso: {item}</p>)}
                  {review.actions.map((item) => <p key={item}>Acción: {item}</p>)}
                </div> : <p className="text-sm text-white/40">Ejecuta una revisión antes de exportar.</p>}
              </div>
            </div>
          </Panel>
        </section>

        <footer className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-2xl">
          <div className="grid gap-4 xl:grid-cols-[1fr,1.4fr]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-200/15 bg-cyan-300/10 text-cyan-100"><Rocket size={18} /></span>
                <div><p className="text-sm font-semibold">Generator acoplado al proyecto</p><p className="text-xs text-white/40">Revisa, genera, instala o exporta el módulo completo.</p></div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr,auto]">
                <input value={moduleName} onChange={(event) => setModuleName(event.target.value)} className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none" placeholder="Nombre del módulo" />
                <div className="flex flex-wrap gap-2">
                  <SmallButton onClick={reviewModule} disabled={loading}><ShieldCheck size={14} /> Revisar</SmallButton>
                  <SmallButton onClick={generateModule} disabled={loading}><Code2 size={14} /> Generar</SmallButton>
                  <SmallButton onClick={buildModule} disabled={loading} tone="primary"><Rocket size={14} /> Construir módulo</SmallButton>
                  <SmallButton onClick={exportModule} disabled={loading} tone="primary"><Download size={14} /> Exportar ZIP</SmallButton>
                  <SmallButton onClick={installLocal} disabled={loading} tone="danger"><Database size={14} /> Instalar local</SmallButton>
                </div>
              </div>
            </div>
            <div className="grid gap-3">
              <GeneratorProgress runtimeArtifacts={runtimeArtifacts} review={review} />
              <BuilderProgress run={builderRun} />
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Consola</p>
                <div className="space-y-1 text-xs leading-5 text-white/55">{consoleLines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</div>
              </div>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}
