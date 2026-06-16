import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

async function userCanAccessBusiness(userId: string, businessId: string) {
  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (business?.id) return true;

  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("account_type")
    .eq("user_id", userId)
    .maybeSingle();

  return profile?.account_type === "admin";
}

function normalizeId(value: unknown) {
  return String(value || "").trim();
}

async function probeWhatsappPhoneNumber(accessToken: string, phoneNumberId: string) {
  const url = new URL(`https://graph.facebook.com/v19.0/${phoneNumberId}`);
  url.searchParams.set("fields", "id,display_phone_number,verified_name,quality_rating");
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || "Meta no ha podido validar el Phone Number ID con ese token";
    throw new Error(message);
  }
  return data as { id?: string; display_phone_number?: string; verified_name?: string; quality_rating?: string };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return json({ ok: false, error: "Sesión no válida" }, 401);

    const body = await request.json();
    const businessId = normalizeId(body.businessId);
    const accessToken = normalizeId(body.accessToken);
    const phoneNumberId = normalizeId(body.phoneNumberId || body.phone_number_id);
    const wabaId = normalizeId(body.wabaId || body.waba_id || body.business_account_id);
    const displayPhoneNumber = normalizeId(body.displayPhoneNumber || body.display_phone_number);

    if (!businessId) return json({ ok: false, error: "Falta businessId" }, 400);
    if (!accessToken) return json({ ok: false, error: "Falta Access Token" }, 400);
    if (!phoneNumberId) return json({ ok: false, error: "Falta Phone Number ID" }, 400);

    const allowed = await userCanAccessBusiness(user.id, businessId);
    if (!allowed) return json({ ok: false, error: "No tienes acceso a este panel" }, 403);

    const metaPhone = await probeWhatsappPhoneNumber(accessToken, phoneNumberId);

    const config = {
      access_token: accessToken,
      phone_number_id: phoneNumberId,
      phoneNumberId,
      waba_id: wabaId || null,
      business_account_id: wabaId || null,
      display_phone_number: displayPhoneNumber || metaPhone.display_phone_number || null,
      verified_name: metaPhone.verified_name || null,
      quality_rating: metaPhone.quality_rating || null,
      token_type: "Bearer",
      onboarding_mode: "manual_neuronas_cloud_api",
    };

    const { error } = await supabaseAdmin.from("business_integrations").upsert({
      business_id: businessId,
      provider_key: "whatsapp_cloud",
      provider_name: "WhatsApp Cloud",
      category: "whatsapp",
      status: "connected",
      config,
      connected_at: new Date().toISOString(),
      last_checked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "business_id,provider_key" });

    if (error) throw new Error(error.message);

    return json({ ok: true, config: { ...config, access_token: "***" } });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "No se pudo completar la conexión manual" }, 500);
  }
}
