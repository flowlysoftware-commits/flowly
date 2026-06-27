import { NextResponse } from "next/server";
import { buildKernelSeedFromMigration } from "@/lib/flowlyOSMigration";
import { createClient } from "@/lib/supabaseAdmin";

export async function POST() {
  const items = buildKernelSeedFromMigration();
  try {
    const supabase = createClient();
    const { error } = await supabase.from("flowly_kernel_registry").upsert(items.map((item) => ({
      id: item.id,
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
    })), { onConflict: "id" });
    if (error) throw error;
    return NextResponse.json({ ok: true, registered: items.length, items });
  } catch (error) {
    return NextResponse.json({ ok: false, registered: 0, items, warning: "No se pudo guardar en Supabase. Devuelvo el seed para revisión local.", detail: error instanceof Error ? error.message : String(error) }, { status: 200 });
  }
}
