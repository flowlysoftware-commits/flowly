import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createBusinessObjectRecord, createKernelEvent } from "@/lib/flowlyKernel";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ records: [], dbReady: false });
  const objectType = request.nextUrl.searchParams.get("type");
  let query = supabaseAdmin.from("flowly_business_object_records").select("*").order("updated_at", { ascending: false }).limit(200);
  if (objectType) query = query.eq("object_type", objectType);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ records: data || [], dbReady: true });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const record = createBusinessObjectRecord({
    organizationId: body.organizationId ? String(body.organizationId) : "default",
    objectType: String(body.objectType || "BusinessObject"),
    data: body.data && typeof body.data === "object" ? body.data : {},
    state: body.state ? String(body.state) : "draft",
    relationships: Array.isArray(body.relationships) ? body.relationships : [],
    permissions: body.permissions && typeof body.permissions === "object" ? body.permissions : undefined,
  });
  const event = createKernelEvent({ type: "BusinessObjectCreated", source: "business-object-runtime", objectType: record.objectType, objectId: record.id, payload: { slug: record.slug, state: record.state } });

  if (!dbReady()) return NextResponse.json({ record, event, dbReady: false });

  const { data, error } = await supabaseAdmin.from("flowly_business_object_records").insert({
    organization_id: record.organizationId,
    object_type: record.objectType,
    slug: record.slug,
    state: record.state,
    data: record.data,
    relationships: record.relationships,
    permissions: record.permissions,
  }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("flowly_kernel_events").insert({ event_type: event.type, source: event.source, object_type: event.objectType, object_id: data.id, payload: event.payload });
  return NextResponse.json({ record: data, event, dbReady: true });
}
