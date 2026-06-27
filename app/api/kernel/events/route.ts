import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createKernelEvent } from "@/lib/flowlyKernel";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET() {
  if (!dbReady()) return NextResponse.json({ events: [], dbReady: false });
  const { data, error } = await supabaseAdmin.from("flowly_kernel_events").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events: data || [], dbReady: true });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const event = createKernelEvent({
    type: String(body.type || body.eventType || "KernelEvent"),
    source: String(body.source || "event-bus"),
    organizationId: body.organizationId ? String(body.organizationId) : null,
    actorId: body.actorId ? String(body.actorId) : null,
    objectType: body.objectType ? String(body.objectType) : null,
    objectId: body.objectId ? String(body.objectId) : null,
    payload: body.payload && typeof body.payload === "object" ? body.payload : {},
  });

  if (!dbReady()) return NextResponse.json({ event, dbReady: false });
  const { data, error } = await supabaseAdmin.from("flowly_kernel_events").insert({
    event_type: event.type,
    source: event.source,
    organization_id: event.organizationId,
    actor_id: event.actorId,
    object_type: event.objectType,
    object_id: event.objectId,
    payload: event.payload,
  }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data, dbReady: true });
}
