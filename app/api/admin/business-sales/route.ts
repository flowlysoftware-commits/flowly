import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildCommissionLines } from "@/lib/salesCommissions";
import { requireAdmin } from "../_utils/auth";

function numeric(value: unknown) {
  const parsed = Number(String(value ?? "0").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const body = await request.json();
    const businessId = typeof body.businessId === "string" ? body.businessId : "";
    const hasSalesUserField = Object.prototype.hasOwnProperty.call(body, "salesUserId");
    const salesUserId = typeof body.salesUserId === "string" && body.salesUserId ? body.salesUserId : null;
    const subscriptionStatus = typeof body.subscriptionStatus === "string" && body.subscriptionStatus ? body.subscriptionStatus : null;
    if (!businessId) return NextResponse.json({ error: "Falta el cliente" }, { status: 400 });

    if (salesUserId) {
      const { data: salesUser, error: salesUserError } = await supabaseAdmin
        .from("sales_users")
        .select("id")
        .eq("id", salesUserId)
        .maybeSingle();
      if (salesUserError) return NextResponse.json({ error: salesUserError.message }, { status: 500 });
      if (!salesUser) return NextResponse.json({ error: "Comercial no encontrado" }, { status: 404 });
    }

    const updates: Record<string, string | null> = {};
    if (hasSalesUserField) updates.sales_user_id = salesUserId;
    if (subscriptionStatus) updates.subscription_status = subscriptionStatus;
    if (!Object.keys(updates).length) return NextResponse.json({ error: "No hay cambios para guardar" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("businesses")
      .update(updates)
      .eq("id", businessId)
      .select("id, name, sales_user_id, subscription_status")
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

    return NextResponse.json({ business: data });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error vinculando cliente" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

    const body = await request.json();
    const businessId = typeof body.businessId === "string" ? body.businessId : "";
    const salesUserId = typeof body.salesUserId === "string" ? body.salesUserId : "";
    const plan = typeof body.plan === "string" ? body.plan : "premium";
    const monthly = numeric(body.monthlyAmount);
    const setup = numeric(body.setupAmount);
    const notes = typeof body.notes === "string" ? body.notes : "";
    if (!businessId || !salesUserId) return NextResponse.json({ error: "Selecciona cliente y comercial" }, { status: 400 });

    const [{ data: business, error: businessFetchError }, { data: seller, error: sellerError }, { data: users, error: usersError }] = await Promise.all([
      supabaseAdmin.from("businesses").select("id, name").eq("id", businessId).maybeSingle(),
      supabaseAdmin.from("sales_users").select("id, full_name, role, manager_id").eq("id", salesUserId).maybeSingle(),
      supabaseAdmin.from("sales_users").select("id, full_name, role, manager_id"),
    ]);

    if (businessFetchError) return NextResponse.json({ error: businessFetchError.message }, { status: 500 });
    if (sellerError) return NextResponse.json({ error: sellerError.message }, { status: 500 });
    if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 });
    if (!business) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    if (!seller) return NextResponse.json({ error: "Comercial no encontrado" }, { status: 404 });

    const saleBaseAmount = setup > 0 ? setup : monthly;
    const { error: updateError } = await supabaseAdmin
      .from("businesses")
      .update({ sales_user_id: salesUserId, plan, subscription_status: "paid" })
      .eq("id", businessId);
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    const { data: deal, error: dealError } = await supabaseAdmin
      .from("sales_deals")
      .insert({
        business_id: businessId,
        sales_user_id: salesUserId,
        client_name: business.name || "Cliente manual",
        plan,
        monthly_amount: monthly,
        setup_amount: setup,
        currency: "EUR",
        status: "paid",
        source: "manual_admin",
        notes,
      })
      .select("id")
      .maybeSingle();
    if (dealError) return NextResponse.json({ error: dealError.message }, { status: 500 });

    const commissionLines = buildCommissionLines({
      seller: seller as any,
      users: (users || []) as any[],
      clientName: business.name || "Cliente manual",
      saleBaseAmount,
      monthlyAmount: monthly,
      source: "manual_admin",
      includeMonthly: false,
    });
    if (commissionLines.length > 0) {
      const { error: commissionError } = await supabaseAdmin.from("commissions").insert(commissionLines);
      if (commissionError) return NextResponse.json({ error: commissionError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, dealId: deal?.id || null });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error registrando venta" }, { status: 500 });
  }
}
