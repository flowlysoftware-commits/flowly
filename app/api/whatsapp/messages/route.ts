import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WhatsAppMessageRow = {
  id: string;
  business_id: string;
  customer_id: string | null;
  phone: string | null;
  template_key: string | null;
  message: string | null;
  status: string | null;
  direction: string | null;
  provider_message_id?: string | null;
  contact_name?: string | null;
  created_at: string;
  updated_at?: string | null;
};

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

function normalizePhone(value: string | null | undefined) {
  return String(value || "").replace(/\D/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return json({ ok: false, error: "Sesión no válida" }, 401);

    const businessId = request.nextUrl.searchParams.get("businessId") || "";
    if (!businessId) return json({ ok: false, error: "Falta businessId" }, 400);

    const allowed = await userCanAccessBusiness(user.id, businessId);
    if (!allowed) return json({ ok: false, error: "No tienes acceso a este negocio" }, 403);

    const { data, error } = await supabaseAdmin
      .from("whatsapp_messages")
      .select("id, business_id, customer_id, phone, template_key, message, status, direction, provider_message_id, contact_name, created_at, updated_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw new Error(error.message);

    const messages = ((data || []) as WhatsAppMessageRow[]).map((message) => ({
      ...message,
      phone: normalizePhone(message.phone),
      message: message.message || "",
      direction: message.direction || "inbound",
      status: message.status || null,
      contact_name: message.contact_name || null,
    }));

    return json({ ok: true, messages });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "Error inesperado" }, 500);
  }
}
