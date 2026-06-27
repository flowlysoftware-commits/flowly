import { NextRequest, NextResponse } from "next/server";
import { inspectPullRequestForQA } from "@/lib/flowlyQAAgent";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const pr = String(body.pr || body.pullRequest || body.url || "").trim();
    const result = await inspectPullRequestForQA(pr);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
