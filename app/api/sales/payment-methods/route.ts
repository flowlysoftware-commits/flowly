import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getSalesUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { error: "No autenticado", status: 401 as const };

  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !authData.user) return { error: "Sesión no válida", status: 401 as const };

  const { data: salesUser, error } = await supabaseAdmin
    .from("sales_users")
    .select("id, user_id, full_name, email, status")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (error) return { error: error.message, status: 500 as const };
  if (!salesUser) return { error: "No existe perfil comercial asociado a este usuario", status: 404 as const };
  if (salesUser.status === "terminated") return { error: "Este perfil comercial está dado de baja", status: 403 as const };

  return { salesUser };
}

export async function PATCH(request: NextRequest) {
  const result = await getSalesUser(request);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const body = await request.json().catch(() => ({}));
  const payment_bank_name = String(body.payment_bank_name || "").trim();
  const payment_account_number = String(body.payment_account_number || "").trim();
  const payment_account_holder = String(body.payment_account_holder || "").trim();
  const payment_account_address = String(body.payment_account_address || "").trim();
  const payment_notes = String(body.payment_notes || "").trim();

  if (!payment_bank_name || !payment_account_number || !payment_account_holder) {
    return NextResponse.json({ error: "Banco, número de cuenta y titular son obligatorios" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("sales_users")
    .update({
      payment_bank_name,
      payment_account_number,
      payment_account_holder,
      payment_account_address,
      payment_notes,
      payment_methods_updated_at: new Date().toISOString(),
    })
    .eq("id", result.salesUser.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ salesUser: data });
}
