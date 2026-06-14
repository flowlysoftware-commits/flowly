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


type WhatsappAssetInfo = {
  meta_business_id?: string | null;
  meta_business_name?: string | null;
  waba_id?: string | null;
  waba_name?: string | null;
  business_account_id?: string | null;
  phone_number_id?: string | null;
  display_phone_number?: string | null;
  verified_name?: string | null;
  quality_rating?: string | null;
  onboarding_mode?: string;
};

async function fetchGraphJson(url: string, accessToken: string) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || "No se pudo leer Meta Graph");
  return data;
}

async function fetchPhoneForWaba(wabaId: string, accessToken: string): Promise<WhatsappAssetInfo | null> {
  const wabaData = await fetchGraphJson(`https://graph.facebook.com/v19.0/${wabaId}?fields=id,name`, accessToken).catch(() => null);
  const phoneData = await fetchGraphJson(`https://graph.facebook.com/v19.0/${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating`, accessToken).catch(() => null);
  const phone = Array.isArray(phoneData?.data) ? phoneData.data[0] : null;

  return {
    waba_id: wabaId,
    waba_name: wabaData?.name || null,
    business_account_id: wabaId,
    phone_number_id: phone?.id || null,
    display_phone_number: phone?.display_phone_number || null,
    verified_name: phone?.verified_name || null,
    quality_rating: phone?.quality_rating || null,
  };
}

function extractWhatsappTargetIds(debugData: any) {
  const granularScopes = Array.isArray(debugData?.data?.granular_scopes) ? debugData.data.granular_scopes : [];
  const targetIds = new Set<string>();

  for (const scope of granularScopes) {
    if (scope?.scope === "whatsapp_business_management" || scope?.scope === "whatsapp_business_messaging") {
      for (const targetId of Array.isArray(scope?.target_ids) ? scope.target_ids : []) {
        if (targetId) targetIds.add(String(targetId));
      }
    }
  }

  return Array.from(targetIds);
}

async function fetchWhatsappAssets(accessToken: string): Promise<WhatsappAssetInfo | null> {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (appId && appSecret) {
    const debugUrl = new URL("https://graph.facebook.com/v19.0/debug_token");
    debugUrl.searchParams.set("input_token", accessToken);
    debugUrl.searchParams.set("access_token", `${appId}|${appSecret}`);
    const debugData = await fetch(debugUrl, { cache: "no-store" }).then((response) => response.json()).catch(() => null);
    const targetIds = extractWhatsappTargetIds(debugData);

    for (const targetId of targetIds) {
      const asset = await fetchPhoneForWaba(targetId, accessToken).catch(() => null);
      if (asset?.waba_id) {
        return {
          ...asset,
          onboarding_mode: "embedded_signup_coexistence",
        };
      }
    }
  }

  const businessesData = await fetchGraphJson("https://graph.facebook.com/v19.0/me/businesses?fields=id,name", accessToken).catch(() => null);
  const businesses = Array.isArray(businessesData?.data) ? businessesData.data : [];

  for (const business of businesses) {
    const wabaData = await fetchGraphJson(`https://graph.facebook.com/v19.0/${business.id}/owned_whatsapp_business_accounts?fields=id,name`, accessToken).catch(() => null);
    const wabas = Array.isArray(wabaData?.data) ? wabaData.data : [];

    for (const waba of wabas) {
      const asset = await fetchPhoneForWaba(waba.id, accessToken).catch(() => null);
      if (asset?.waba_id) {
        return {
          ...asset,
          meta_business_id: business.id,
          meta_business_name: business.name || null,
          waba_name: asset.waba_name || waba.name || null,
          onboarding_mode: "oauth_whatsapp_cloud",
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
