import { NextRequest, NextResponse } from "next/server";
import { fixPullRequestWithQA } from "@/lib/flowlyQAAgent";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const pr = String(body.pr || body.pullRequest || body.url || "").trim();
    const buildLog = String(body.buildLog || body.log || "");
    const result = await fixPullRequestWithQA({ pr, buildLog });

    try {
      await supabaseAdmin.from("flowly_qa_agent_runs").insert({
        pull_request_number: result.prNumber || null,
        branch: result.branch || null,
        status: result.status,
        risk: result.risk,
        fixed: result.fixed,
        committed_files: result.committedFiles,
        details: result,
      });
    } catch {
      // El log no debe bloquear la corrección.
    }

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
