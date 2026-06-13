import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

function sign(payload: string) {
  const secret = process.env.INTEGRATION_STATE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "flowly-dev";
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function makeState(provider: string, businessId: string) {
  const payload = Buffer.from(JSON.stringify({ provider, businessId, ts: Date.now() })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  const businessId = request.nextUrl.searchParams.get("businessId") || "";
  if (!businessId) return NextResponse.json({ error: "Falta businessId" }, { status: 400 });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/integrations/callback/${provider}`;
  const state = makeState(provider, businessId);

  if (["google_ads", "google_business", "google_calendar", "gmail"].includes(provider)) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return NextResponse.redirect(`${baseUrl}/dashboard?integration_error=missing_google_client_id`);
    const scopes = [
      "openid",
      "email",
      "profile",
      provider === "google_calendar" ? "https://www.googleapis.com/auth/calendar" : "",
      provider === "gmail" ? "https://www.googleapis.com/auth/gmail.send" : "",
      provider === "google_business" ? "https://www.googleapis.com/auth/business.manage" : "",
      provider === "google_ads" ? "https://www.googleapis.com/auth/adwords" : "",
    ].filter(Boolean).join(" ");
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("scope", scopes);
    url.searchParams.set("state", state);
    return NextResponse.redirect(url);
  }

  if (["meta_ads", "whatsapp_cloud"].includes(provider)) {
    const clientId = process.env.META_APP_ID;
    if (!clientId) return NextResponse.redirect(`${baseUrl}/dashboard?integration_error=missing_meta_app_id`);
    const url = new URL("https://www.facebook.com/v19.0/dialog/oauth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("state", state);
   url.searchParams.set(
  "scope",
  provider === "whatsapp_cloud"
    ? "whatsapp_business_management,whatsapp_business_messaging"
    : "ads_read,ads_management,business_management,pages_show_list,instagram_basic"
);
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(`${baseUrl}/dashboard?integration_error=oauth_not_supported`);
}
