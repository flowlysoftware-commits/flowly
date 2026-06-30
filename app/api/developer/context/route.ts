import { NextRequest, NextResponse } from "next/server";
import { buildDeveloperContextBundle, summarizeDeveloperContext } from "@/lib/flowlyDeveloperContextEngine";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const instruction = String(body.instruction || body.query || "").trim();
    if (!instruction) {
      return NextResponse.json({ ok: false, error: "Falta una instrucción para construir contexto." }, { status: 400 });
    }

    const bundle = await buildDeveloperContextBundle(instruction);
    return NextResponse.json({
      ok: true,
      summary: summarizeDeveloperContext(bundle),
      sources: bundle.sources,
      warnings: bundle.warnings,
      instructionsForAgent: bundle.instructionsForAgent,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
