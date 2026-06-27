import { slugifyStudio, type FlowlyStudioArtifactKind, type FlowlyStudioDefinition } from "@/lib/flowlyStudio";
import type { FlowlyStudioStoredArtifact } from "@/lib/flowlyStudioHeart";

export type FlowlyKernelRegistryKind = FlowlyStudioArtifactKind | "plugin" | "runtime" | "module";
export type FlowlyKernelStatus = "draft" | "active" | "paused" | "archived" | "error";

export type FlowlyKernelRegistryItem = {
  id: string;
  kind: FlowlyKernelRegistryKind;
  name: string;
  slug: string;
  domain: string;
  description: string;
  status: FlowlyKernelStatus | string;
  version: string;
  definition: Record<string, unknown>;
  dependencies: string[];
  capabilities: string[];
  events: string[];
  policies: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type FlowlyKernelEvent = {
  id: string;
  type: string;
  source: string;
  organizationId?: string | null;
  actorId?: string | null;
  objectType?: string | null;
  objectId?: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type FlowlyBusinessObjectRecord = {
  id: string;
  organizationId: string;
  objectType: string;
  slug: string;
  state: string;
  data: Record<string, unknown>;
  relationships: Array<{ type: string; targetType: string; targetId: string; label?: string }>;
  permissions: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type FlowlyCapabilityExecution = {
  id: string;
  capability: string;
  status: "queued" | "running" | "completed" | "failed";
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  events: FlowlyKernelEvent[];
  startedAt: string;
  finishedAt?: string;
};

export type FlowlyWorkflowRun = {
  id: string;
  workflow: string;
  status: "queued" | "running" | "completed" | "failed";
  steps: Array<{ name: string; status: "pending" | "completed" | "failed"; detail: string }>;
  events: FlowlyKernelEvent[];
  startedAt: string;
  finishedAt?: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
      const record = item as Record<string, unknown>;
      return String(record.name || record.label || record.slug || record.id || "");
    }
    return "";
  }).filter(Boolean);
}

function getDefinitionArray(definition: FlowlyStudioDefinition | Record<string, unknown>, key: string): string[] {
  return asStringArray((definition as Record<string, unknown>)[key]);
}

export function kernelItemFromStudioArtifact(artifact: FlowlyStudioStoredArtifact): FlowlyKernelRegistryItem {
  const definition = asRecord(artifact.definition);
  return {
    id: `${artifact.kind}:${artifact.slug}`,
    kind: artifact.kind,
    name: artifact.name,
    slug: artifact.slug,
    domain: artifact.domain || "core",
    description: artifact.description || "",
    status: artifact.status || "draft",
    version: String(definition.version || "1.0.0"),
    definition,
    dependencies: [
      ...getDefinitionArray(definition, "businessObjects"),
      ...getDefinitionArray(definition, "capabilities"),
      ...getDefinitionArray(definition, "policies"),
      ...getDefinitionArray(definition, "workflows"),
      ...getDefinitionArray(definition, "relationships").map((item) => item),
    ].map(slugifyStudio),
    capabilities: getDefinitionArray(definition, "capabilities"),
    events: getDefinitionArray(definition, "events"),
    policies: getDefinitionArray(definition, "policies"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function buildKernelRegistryFromArtifacts(artifacts: FlowlyStudioStoredArtifact[]) {
  const items = artifacts.map(kernelItemFromStudioArtifact);
  const totals = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.kind] = (acc[item.kind] || 0) + 1;
    return acc;
  }, {});
  const issues: string[] = [];
  if (!totals.business_object) issues.push("No hay Business Objects registrados en el Kernel.");
  if (!totals.capability) issues.push("No hay Capabilities registradas en el Kernel.");
  if (!totals.app) issues.push("No hay Apps registradas en el Kernel.");
  const duplicateSlugs = Object.entries(items.reduce<Record<string, number>>((acc, item) => {
    acc[item.slug] = (acc[item.slug] || 0) + 1;
    return acc;
  }, {})).filter(([, count]) => count > 1).map(([slug]) => slug);
  if (duplicateSlugs.length) issues.push(`Hay slugs duplicados: ${duplicateSlugs.join(", ")}`);
  return {
    generatedAt: new Date().toISOString(),
    totals,
    healthScore: Math.max(0, 100 - issues.length * 15),
    items,
    issues,
  };
}

export function createKernelEvent(input: Partial<FlowlyKernelEvent> & { type: string; source: string }): FlowlyKernelEvent {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    type: input.type,
    source: input.source,
    organizationId: input.organizationId || null,
    actorId: input.actorId || null,
    objectType: input.objectType || null,
    objectId: input.objectId || null,
    payload: input.payload || {},
    createdAt: new Date().toISOString(),
  };
}

export function createBusinessObjectRecord(params: {
  organizationId?: string;
  objectType: string;
  data: Record<string, unknown>;
  state?: string;
  permissions?: Record<string, unknown>;
  relationships?: FlowlyBusinessObjectRecord["relationships"];
}): FlowlyBusinessObjectRecord {
  const now = new Date().toISOString();
  const objectType = params.objectType;
  const baseSlug = String(params.data.name || params.data.title || objectType);
  return {
    id: `bo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    organizationId: params.organizationId || "default",
    objectType,
    slug: slugifyStudio(baseSlug),
    state: params.state || "draft",
    data: params.data,
    relationships: params.relationships || [],
    permissions: params.permissions || { read: ["owner"], write: ["owner"] },
    createdAt: now,
    updatedAt: now,
  };
}

export function executeCapabilityLocally(capability: string, input: Record<string, unknown>): FlowlyCapabilityExecution {
  const startedAt = new Date().toISOString();
  const event = createKernelEvent({
    type: "CapabilityExecuted",
    source: "capability-runtime",
    payload: { capability, inputPreview: Object.keys(input) },
  });
  return {
    id: `cap_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    capability,
    status: "completed",
    input,
    output: {
      ok: true,
      message: `Capability ${capability} ejecutada por el Runtime local de Flowly.`,
      result: input,
    },
    events: [event],
    startedAt,
    finishedAt: new Date().toISOString(),
  };
}

export function runWorkflowLocally(workflow: string, steps: string[] = []): FlowlyWorkflowRun {
  const startedAt = new Date().toISOString();
  const normalizedSteps = steps.length ? steps : ["Validar contexto", "Ejecutar capacidades", "Publicar eventos", "Registrar auditoría"];
  const event = createKernelEvent({ type: "WorkflowCompleted", source: "workflow-runtime", payload: { workflow, steps: normalizedSteps.length } });
  return {
    id: `wrk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    workflow,
    status: "completed",
    steps: normalizedSteps.map((step) => ({ name: step, status: "completed", detail: `${step} completado por Workflow Runtime.` })),
    events: [event],
    startedAt,
    finishedAt: new Date().toISOString(),
  };
}

export function buildKernelHealthSummary(registry: ReturnType<typeof buildKernelRegistryFromArtifacts>) {
  return {
    name: "Flowly Kernel",
    status: registry.healthScore >= 80 ? "healthy" : registry.healthScore >= 60 ? "warning" : "degraded",
    score: registry.healthScore,
    services: [
      { id: "core-runtime", name: "Core Runtime", status: "active", description: "Registro de Business Objects, Capabilities y Apps." },
      { id: "event-bus", name: "Event Bus", status: "active", description: "Eventos internos estructurados y auditables." },
      { id: "business-object-runtime", name: "Business Object Runtime", status: "active", description: "CRUD, estados, relaciones y permisos." },
      { id: "capability-runtime", name: "Capability Runtime", status: "active", description: "Ejecución y orquestación de capacidades." },
      { id: "workflow-runtime", name: "Workflow Runtime", status: "active", description: "Automatizaciones y flujos ejecutables." },
      { id: "plugin-runtime", name: "Plugin Runtime", status: "active", description: "Carga dinámica de módulos y extensiones." },
    ],
    totals: registry.totals,
    issues: registry.issues,
    generatedAt: registry.generatedAt,
  };
}
