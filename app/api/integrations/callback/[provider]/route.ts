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


async function fetchWhatsappAssets(accessToken: string) {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const businessesResponse = await fetch("https://graph.facebook.com/v19.0/me/businesses?fields=id,name", { headers, cache: "no-store" });
  const businessesData = await businessesResponse.json().catch(() => ({}));
  const businesses = Array.isArray(businessesData?.data) ? businessesData.data : [];

  for (const business of businesses) {
    const wabaResponse = await fetch(`https://graph.facebook.com/v19.0/${business.id}/owned_whatsapp_business_accounts?fields=id,name`, { headers, cache: "no-store" });
    const wabaData = await wabaResponse.json().catch(() => ({}));
    const wabas = Array.isArray(wabaData?.data) ? wabaData.data : [];

    for (const waba of wabas) {
      const phoneResponse = await fetch(`https://graph.facebook.com/v19.0/${waba.id}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating`, { headers, cache: "no-store" });
      const phoneData = await phoneResponse.json().catch(() => ({}));
      const phone = Array.isArray(phoneData?.data) ? phoneData.data[0] : null;
      if (phone?.id) {
        return {
          meta_business_id: business.id,
          meta_business_name: business.name || null,
          waba_id: waba.id,
          waba_name: waba.name || null,
          business_account_id: waba.id,
          phone_number_id: phone.id,
          display_phone_number: phone.display_phone_number || null,
          verified_name: phone.verified_name || null,
          quality_rating: phone.quality_rating || null,
        };
      }
    }
  }

  return null;
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
    const whatsappAssets = provider === "whatsapp_cloud" && tokenData.access_token
      ? await fetchWhatsappAssets(tokenData.access_token).catch(() => null)
      : null;

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
        ...(whatsappAssets || {}),
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
