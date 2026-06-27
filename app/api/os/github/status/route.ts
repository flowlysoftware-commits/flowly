import { NextResponse } from "next/server";
import { getGitHubExecutorConfig, getGitHubRepositoryStatus } from "@/lib/flowlyGitHubExecutor";

export const runtime = "nodejs";

export async function GET() {
  try {
    const config = getGitHubExecutorConfig();
    if (!config.hasCredentials) {
      return NextResponse.json({ ok: false, configured: false, config });
    }

    const status = await getGitHubRepositoryStatus();
    return NextResponse.json({ ok: true, ...status });
  } catch (error) {
    return NextResponse.json({ ok: false, configured: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
