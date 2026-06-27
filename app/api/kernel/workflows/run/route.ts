import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { runWorkflowLocally } from "@/lib/flowlyKernel";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const run = runWorkflowLocally(String(body.workflow || "UnnamedWorkflow"), Array.isArray(body.steps) ? body.steps.map(String) : []);
  if (!dbReady()) return NextResponse.json({ run, dbReady: false });

  const { data, error } = await supabaseAdmin.from("flowly_workflow_runs").insert({
    workflow: run.workflow,
    status: run.status,
    steps: run.steps,
    events: run.events,
    started_at: run.startedAt,
    finished_at: run.finishedAt,
  }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  for (const event of run.events) await supabaseAdmin.from("flowly_kernel_events").insert({ event_type: event.type, source: event.source, payload: event.payload });
  return NextResponse.json({ run: data, events: run.events, dbReady: true });
}
