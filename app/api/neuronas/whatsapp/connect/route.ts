import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

function sign(payload: string) {
  const secret = process.env.INTEGRATION_STATE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "flowly-dev";
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function makeState(provider: string, businessId: string, extra: Record<string, string> = {}) {
  const payload = Buffer.from(JSON.stringify({ provider, businessId, ts: Date.now(), ...extra })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function getBaseUrl(request: NextRequest) {
  const origin = request.nextUrl.origin;
  if (origin && !origin.includes("localhost")) return origin;
  return process.env.NEXT_PUBLIC_APP_URL || origin;
}

export async function GET(request: NextRequest) {
  const businessId = request.nextUrl.searchParams.get("businessId") || "";
  if (!businessId) {
    return NextResponse.redirect(`${getBaseUrl(request)}/dashboard?integration_error=missing_business_id`);
  }

  const clientId = process.env.META_APP_ID;
  if (!clientId) {
    return NextResponse.redirect(`${getBaseUrl(request)}/dashboard?integration_error=missing_meta_app_id`);
  }

  const baseUrl = getBaseUrl(request);
  const redirectUri = `${baseUrl}/api/integrations/callback/whatsapp_cloud`;
  const url = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "whatsapp_business_management,whatsapp_business_messaging");
  url.searchParams.set("state", makeState("whatsapp_cloud", businessId, { mode: "classic", source: "neuronas" }));

  return NextResponse.redirect(url);
}
