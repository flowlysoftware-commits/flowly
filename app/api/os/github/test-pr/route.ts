import { NextRequest, NextResponse } from "next/server";
import { buildExecutorTestFile, createExecutorPullRequest } from "@/lib/flowlyGitHubExecutor";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const instruction = String(body.instruction || "Prueba de Flowly Executor con GitHub.");
    const title = String(body.title || "Flowly Executor: prueba de conexión GitHub");
    const result = await createExecutorPullRequest({
      title,
      body: [
        "## Flowly Executor",
        "Este Pull Request fue creado automáticamente por Flowly OS para comprobar que el Brain/Executor tiene acceso seguro al repositorio.",
        "",
        "### Instrucción",
        instruction,
        "",
        "### Seguridad",
        "Este flujo nunca modifica la rama principal directamente. Siempre crea una rama y un Pull Request.",
      ].join("\n"),
      files: [buildExecutorTestFile(instruction)],
    });

    await supabaseAdmin.from("flowly_executor_runs").insert({
      kind: "github_test_pr",
      status: result.ok ? "completed" : "failed",
      instruction,
      branch: result.branch || null,
      pull_request_url: result.pullRequestUrl || null,
      details: result,
    }).then(() => undefined).catch(() => undefined);

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
