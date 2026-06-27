import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { executeCapabilityLocally } from "@/lib/flowlyKernel";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const execution = executeCapabilityLocally(String(body.capability || "UnnamedCapability"), body.input && typeof body.input === "object" ? body.input : {});
  if (!dbReady()) return NextResponse.json({ execution, dbReady: false });

  const { data, error } = await supabaseAdmin.from("flowly_capability_executions").insert({
    capability: execution.capability,
    status: execution.status,
    input: execution.input,
    output: execution.output,
    events: execution.events,
    started_at: execution.startedAt,
    finished_at: execution.finishedAt,
  }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  for (const event of execution.events) await supabaseAdmin.from("flowly_kernel_events").insert({ event_type: event.type, source: event.source, payload: event.payload });
  return NextResponse.json({ execution: data, events: execution.events, dbReady: true });
}
