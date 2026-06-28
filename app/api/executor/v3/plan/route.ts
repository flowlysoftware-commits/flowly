import { NextRequest, NextResponse } from "next/server";
import { planExecutorV3 } from "@/lib/flowlyExecutorV3";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const instruction = String(body.instruction || "").trim();
    if (!instruction) return NextResponse.json({ ok: false, error: "Falta la instrucción para Executor V3." }, { status: 400 });
    const result = await planExecutorV3(instruction);

    try {
      await supabaseAdmin.from("flowly_brain_memory").insert({
        type: "executor_plan",
        source: "executor_v3",
        title: `Plan Executor V3: ${instruction.slice(0, 96)}`,
        content: instruction,
        metadata: {
          risk: result.risk,
          modules: result.projectMap.modules,
          analyzedFiles: result.projectMap.analyzedFiles,
          relatedFiles: result.projectMap.relatedFiles,
          proposedFiles: result.proposedFiles.map((file) => file.path),
          summary: result.summary,
        },
      });
    } catch {
      // La memoria del Brain no debe bloquear el análisis.
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
