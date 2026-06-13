import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function sign(payload: string) {
  const secret = process.env.INTEGRATION_STATE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "flowly-dev";
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function readState(state: string) {
  const [payload, signature] = state.split(".");
  if (!payload || !signature || sign(payload) !== signature) throw new Error("Estado OAuth no válido");
  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (Date.now() - Number(parsed.ts || 0) > 15 * 60 * 1000) throw new Error("Estado OAuth caducado");
  return parsed as { provider: string; businessId: string; ts: number };
}

async function exchangeGoogle(code: string, redirectUri: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.error || "No se pudo conectar Google");
  return data;
}

async function exchangeMeta(code: string, redirectUri: string) {
  const url = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
  url.searchParams.set("client_id", process.env.META_APP_ID || "");
  url.searchParams.set("client_secret", process.env.META_APP_SECRET || "");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("code", code);
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "No se pudo conectar Meta");
  return data;
}

export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  try {
    const code = request.nextUrl.searchParams.get("code") || "";
    const state = request.nextUrl.searchParams.get("state") || "";
    if (!code || !state) throw new Error("Faltan parámetros OAuth");
    const { businessId } = readState(state);
    const redirectUri = `${baseUrl}/api/integrations/callback/${provider}`;

    const tokenData = ["google_ads", "google_business", "google_calendar", "gmail"].includes(provider)
      ? await exchangeGoogle(code, redirectUri)
      : await exchangeMeta(code, redirectUri);

    const providerName = provider.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    const { error } = await supabaseAdmin.from("business_integrations").upsert({
      business_id: businessId,
      provider_key: provider,
      provider_name: providerName,
      category: provider.includes("google") ? "google" : provider.includes("meta") || provider.includes("whatsapp") ? "meta" : "custom",
      status: "connected",
      config: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        expires_in: tokenData.expires_in || null,
        token_type: tokenData.token_type || "Bearer",
        scope: tokenData.scope || null,
      },
      connected_at: new Date().toISOString(),
      last_checked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "business_id,provider_key" });

    if (error) throw new Error(error.message);
    return NextResponse.redirect(`${baseUrl}/dashboard?integration_connected=${encodeURIComponent(provider)}`);
  } catch (error) {
    return NextResponse.redirect(`${baseUrl}/dashboard?integration_error=${encodeURIComponent(error instanceof Error ? error.message : "oauth_error")}`);
  }
}
