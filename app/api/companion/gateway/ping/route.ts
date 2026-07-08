import { NextRequest, NextResponse } from "next/server";
import { createGatewayEventResponse } from "@/lib/flowlyCompanionGateway";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;

  return NextResponse.json(
    createGatewayEventResponse({
      type: "ping",
      companionId: search.get("companionId") || undefined,
      userId: search.get("userId") || undefined,
      sessionId: search.get("sessionId") || undefined,
      pathname: search.get("pathname") || "/companion",
    })
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json(
    createGatewayEventResponse({
      type: "ping",
      companionId: typeof body.companionId === "string" ? body.companionId : undefined,
      userId: typeof body.userId === "string" ? body.userId : undefined,
      sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
      pathname: typeof body.pathname === "string" ? body.pathname : "/companion",
    })
  );
}
