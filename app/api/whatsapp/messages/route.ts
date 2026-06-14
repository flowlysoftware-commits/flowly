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
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw new Error(error.message);

    return json({ ok: true, messages: data || [] });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "Error cargando WhatsApp" }, 500);
  }
}
