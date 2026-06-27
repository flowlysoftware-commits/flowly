import { NextRequest, NextResponse } from "next/server";
import { runExecutorV2 } from "@/lib/flowlyExecutorV2";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const instruction = String(body.instruction || "").trim();
    const approved = Boolean(body.approved);
    if (!instruction) return NextResponse.json({ ok: false, error: "Falta la instrucción para Executor V2." }, { status: 400 });
    if (!approved) return NextResponse.json({ ok: false, error: "Executor V2 necesita aprobación explícita antes de crear un Pull Request." }, { status: 400 });

    const result = await runExecutorV2({ instruction, approved, mode: "pull_request" });

    try {
      await supabaseAdmin.from("flowly_executor_v2_runs").insert({
        instruction,
        status: result.status,
        risk: result.risk,
        target_modules: result.targetModules,
        candidate_files: result.candidateFiles,
        generated_files: result.proposedFiles.map((file) => file.path),
        branch: result.branch || null,
        pull_request_url: result.pullRequestUrl || null,
        details: result,
      });
    } catch {
      // El log no debe bloquear el Pull Request.
    }

    return NextResponse.json(result, { status: result.error ? 400 : 200 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
