import { NextRequest } from "next/server";
import { createCompanionSession } from "@/lib/flowlyCompanionGateway";
import { companionJson, companionOptions } from "@/lib/flowlyCompanionCors";

export const runtime = "nodejs";

export async function OPTIONS() {
  return companionOptions();
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const session = createCompanionSession({
    companionId: search.get("companionId") || undefined,
    userId: search.get("userId") || undefined,
    sessionId: search.get("sessionId") || undefined,
    origin: request.nextUrl.origin,
  });

  return companionJson({
    ok: true,
    generatedAt: session.generatedAt,
    version: session.version,
    mode: session.unity.mode,
    gatewayBaseUrl: session.unity.gatewayBaseUrl,
    websocketUrl: session.unity.websocketUrl,
    companionId: session.companionId,
    userId: session.userId,
    sessionId: session.sessionId,
    endpoints: session.endpoints,
    debugLogs: session.unity.debugLogs,
  });
}
