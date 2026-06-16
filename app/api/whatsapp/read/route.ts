import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function normalizePhone(value: string | null | undefined) {
  return String(value || "").replace(/\D/g, "");
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
  const { data: ownerMatch, error: ownerError } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (!ownerError && ownerMatch?.id) return true;

  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("account_type")
    .eq("user_id", userId)
    .maybeSingle();

  return profile?.account_type === "admin";
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return json({ ok: false, error: "Sesión no válida" }, 401);

    const body = await request.json().catch(() => ({}));
    const businessId = String(body.businessId || "");
    const phone = normalizePhone(body.phone);

    if (!businessId) return json({ ok: false, error: "Falta businessId" }, 400);
    if (!phone) return json({ ok: false, error: "Falta teléfono" }, 400);

    const allowed = await userCanAccessBusiness(user.id, businessId);
    if (!allowed) return json({ ok: false, error: "No tienes acceso a este negocio" }, 403);

    const { data: messages, error: loadError } = await supabaseAdmin
      .from("whatsapp_messages")
      .select("id, phone")
      .eq("business_id", businessId)
      .eq("direction", "inbound")
      .eq("status", "received")
      .limit(500);

    if (loadError) throw new Error(loadError.message);

    const ids = (messages || [])
      .filter((message) => normalizePhone(message.phone) === phone)
      .map((message) => message.id)
      .filter(Boolean);

    if (!ids.length) return json({ ok: true, updated: 0 });

    const { error: updateError } = await supabaseAdmin
      .from("whatsapp_messages")
      .update({ status: "opened", updated_at: new Date().toISOString() })
      .in("id", ids)
      .eq("business_id", businessId);

    if (updateError) throw new Error(updateError.message);

    return json({ ok: true, updated: ids.length });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "Error marcando WhatsApp" }, 500);
  }
}
