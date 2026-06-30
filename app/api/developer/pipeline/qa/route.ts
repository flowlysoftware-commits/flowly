import { NextRequest, NextResponse } from "next/server";
import { fixDeveloperPipelinePullRequest, inspectDeveloperPipelinePullRequest } from "@/lib/flowlyDeveloperPipeline";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const pr = String(body.pr || body.pullRequest || body.url || "").trim();
    const buildLog = String(body.buildLog || body.log || "");
    const mode = String(body.mode || "inspect");
    if (!pr) return NextResponse.json({ ok: false, error: "Falta la URL o número del Pull Request." }, { status: 400 });

    const result = mode === "fix"
      ? await fixDeveloperPipelinePullRequest({ pr, buildLog })
      : await inspectDeveloperPipelinePullRequest(pr);

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
