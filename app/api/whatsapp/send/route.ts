import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WhatsAppConfig = {
  access_token?: string;
  phone_number_id?: string;
  phoneNumberId?: string;
  display_phone_number?: string;
  waba_id?: string;
  business_account_id?: string;
};

function normalizePhone(value: string) {
  return String(value || "").replace(/\D/g, "");
}

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
  const { data, error } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_id", userId)
    .maybeSingle();
  return !error && !!data;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return json({ ok: false, error: "Sesión no válida" }, 401);

    const body = await request.json();
    const businessId = String(body.businessId || "");
    const customerId = body.customerId ? String(body.customerId) : null;
    const phone = normalizePhone(String(body.phone || ""));
    const message = String(body.message || "").trim();
    const templateKey = body.templateKey ? String(body.templateKey) : null;

    if (!businessId) return json({ ok: false, error: "Falta businessId" }, 400);
    if (!phone) return json({ ok: false, error: "Falta teléfono de destino" }, 400);
    if (!message) return json({ ok: false, error: "Falta mensaje" }, 400);

    const allowed = await userCanAccessBusiness(user.id, businessId);
    if (!allowed) return json({ ok: false, error: "No tienes acceso a este negocio" }, 403);

    const { data: integration, error: integrationError } = await supabaseAdmin
      .from("business_integrations")
      .select("id, config, status")
      .eq("business_id", businessId)
      .eq("provider_key", "whatsapp_cloud")
      .eq("status", "connected")
      .maybeSingle();

    if (integrationError) throw new Error(integrationError.message);
    if (!integration) return json({ ok: false, error: "WhatsApp Cloud no está conectado para este panel" }, 400);

    const config = (integration.config || {}) as WhatsAppConfig;
    const accessToken = String(config.access_token || "");
    const phoneNumberId = String(config.phone_number_id || config.phoneNumberId || "");

    if (!accessToken || !phoneNumberId) {
      return json({ ok: false, error: "La conexión de WhatsApp no tiene token o Phone Number ID" }, 400);
    }

    const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: {
          preview_url: true,
          body: message,
        },
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return json({ ok: false, error: result?.error?.message || "Meta rechazó el envío", detail: result }, 400);
    }

    const providerMessageId = result?.messages?.[0]?.id || null;
    const { error: insertError } = await supabaseAdmin.from("whatsapp_messages").insert({
      business_id: businessId,
      customer_id: customerId,
      phone,
      template_key: templateKey,
      message,
      direction: "outbound",
      status: "sent",
      provider_message_id: providerMessageId,
      raw_payload: result,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) throw new Error(insertError.message);
    return json({ ok: true, providerMessageId, result });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "Error inesperado" }, 500);
  }
}
