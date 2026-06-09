import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { error: "No autenticado", status: 401 as const };

  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !authData.user) return { error: "Sesión no válida", status: 401 as const };

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("user_profiles")
    .select("account_type, role")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (profileError) return { error: profileError.message, status: 500 as const };
  if (profile?.account_type !== "admin") return { error: "Solo un administrador puede gestionar cobros", status: 403 as const };

  return { userId: authData.user.id };
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const { data, error } = await supabaseAdmin
      .from("commission_payouts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ payouts: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error cargando solicitudes de cobro" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const body = await request.json();
    const payoutId = typeof body.payoutId === "string" ? body.payoutId : "";
    const status = typeof body.status === "string" ? body.status : "";
    if (!payoutId) return NextResponse.json({ error: "Falta la solicitud" }, { status: 400 });
    if (!["requested", "paid", "rejected"].includes(status)) return NextResponse.json({ error: "Estado de cobro no válido" }, { status: 400 });

    const { data: payout, error: payoutError } = await supabaseAdmin
      .from("commission_payouts")
      .select("id, sales_user_id, status")
      .eq("id", payoutId)
      .maybeSingle();

    if (payoutError) return NextResponse.json({ error: payoutError.message }, { status: 500 });
    if (!payout) return NextResponse.json({ error: "Solicitud de cobro no encontrada" }, { status: 404 });

    const { error } = await supabaseAdmin
      .from("commission_payouts")
      .update({ status, processed_at: status === "paid" || status === "rejected" ? new Date().toISOString() : null })
      .eq("id", payoutId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (status === "paid") {
      await supabaseAdmin.from("commissions").update({ status: "paid" }).eq("sales_user_id", payout.sales_user_id).eq("status", "requested");
    }

    if (status === "rejected") {
      await supabaseAdmin.from("commissions").update({ status: "pending" }).eq("sales_user_id", payout.sales_user_id).eq("status", "requested");
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error actualizando solicitud de cobro" }, { status: 500 });
  }
}
