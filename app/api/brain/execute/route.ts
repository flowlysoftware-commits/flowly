import { NextRequest, NextResponse } from "next/server";
import { runExecutorV3 } from "@/lib/flowlyExecutorV3";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const approved = Boolean(body.approved);
    const action = String(body.action || body.instruction || "").trim();

    if (!approved) {
      return NextResponse.json({ ok: false, error: "Flowly Brain no ejecuta acciones sin aprobación explícita." }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ ok: false, error: "Falta la acción que debe ejecutar Brain." }, { status: 400 });
    }

    const result = await runExecutorV3(action, true);
    return NextResponse.json({
      ok: !result.error,
      status: result.status,
      action,
      message: result.pullRequestUrl ? "Executor V3 ha creado un Pull Request para revisión." : "Executor V3 ha preparado la acción, pero no pudo abrir Pull Request.",
      pullRequestUrl: result.pullRequestUrl,
      pullRequestNumber: result.pullRequestNumber,
      branch: result.branch,
      error: result.error,
      details: result,
    }, { status: result.error ? 400 : 200 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
