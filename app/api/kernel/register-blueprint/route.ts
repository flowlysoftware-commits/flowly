import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createKernelEvent, kernelItemFromStudioArtifact } from "@/lib/flowlyKernel";
import { slugifyStudio, type FlowlyStudioArtifactKind } from "@/lib/flowlyStudio";
import type { FlowlyStudioStoredArtifact } from "@/lib/flowlyStudioHeart";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function normalizeArtifact(item: unknown): FlowlyStudioStoredArtifact | null {
  if (!item || typeof item !== "object") return null;
  const record = item as Record<string, unknown>;
  const kind = String(record.kind || "business_object") as FlowlyStudioArtifactKind;
  const name = String(record.name || record.label || "Unnamed");
  const slug = String(record.slug || slugifyStudio(name));
  const definition = record.definition && typeof record.definition === "object" ? record.definition : record;
  return {
    id: String(record.id || `${kind}:${slug}`),
    kind,
    name,
    slug,
    domain: String(record.domain || "core"),
    description: String(record.description || ""),
    status: String(record.status || "draft"),
    definition: definition as FlowlyStudioStoredArtifact["definition"],
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const rawArtifacts = Array.isArray(body.artifacts) ? body.artifacts : [];
  const artifacts = rawArtifacts.map(normalizeArtifact).filter(Boolean) as FlowlyStudioStoredArtifact[];
  if (!artifacts.length) return NextResponse.json({ error: "No se recibieron artefactos para registrar en el Kernel." }, { status: 400 });

  const items = artifacts.map(kernelItemFromStudioArtifact);
  const event = createKernelEvent({ type: "BlueprintRegistered", source: "core-runtime", payload: { artifacts: items.length, moduleName: body.moduleName || null } });

  if (!dbReady()) return NextResponse.json({ registered: items, event, dbReady: false });

  const rows = items.map((item) => ({
    kind: item.kind,
    name: item.name,
    slug: item.slug,
    domain: item.domain,
    description: item.description,
    status: item.status,
    version: item.version,
    definition: item.definition,
    dependencies: item.dependencies,
    capabilities: item.capabilities,
    events: item.events,
    policies: item.policies,
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabaseAdmin.from("flowly_kernel_registry").upsert(rows, { onConflict: "kind,slug" }).select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("flowly_kernel_events").insert({
    event_type: event.type,
    source: event.source,
    organization_id: event.organizationId,
    actor_id: event.actorId,
    object_type: event.objectType,
    object_id: event.objectId,
    payload: event.payload,
  });

  return NextResponse.json({ registered: data || [], event, dbReady: true });
}
