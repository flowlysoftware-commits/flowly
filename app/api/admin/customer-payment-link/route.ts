import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "../_utils/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

function numeric(value: unknown) {
  const parsed = Number(String(value ?? "0").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
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
    if (monthly <= 0) return NextResponse.json({ error: "La mensualidad debe ser mayor que 0" }, { status: 400 });

    const [{ data: business, error: businessError }, { data: seller, error: sellerError }] = await Promise.all([
      supabaseAdmin.from("businesses").select("id, name, owner_id, stripe_customer_id").eq("id", businessId).maybeSingle(),
      supabaseAdmin.from("sales_users").select("id, full_name, referral_code").eq("id", salesUserId).maybeSingle(),
    ]);
    if (businessError) return NextResponse.json({ error: businessError.message }, { status: 500 });
    if (sellerError) return NextResponse.json({ error: sellerError.message }, { status: 500 });
    if (!business) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    if (!seller) return NextResponse.json({ error: "Comercial no encontrado" }, { status: 404 });

    const { data: deal, error: dealError } = await supabaseAdmin
      .from("sales_deals")
      .insert({
        business_id: businessId,
        sales_user_id: salesUserId,
        client_name: business.name || "Cliente",
        plan,
        monthly_amount: monthly,
        setup_amount: setup,
        currency: "EUR",
        status: "pending",
        source: "admin_payment_link",
        notes,
      })
      .select("id")
      .maybeSingle();
    if (dealError) return NextResponse.json({ error: dealError.message }, { status: 500 });

    await supabaseAdmin.from("businesses").update({ sales_user_id: salesUserId, plan, subscription_status: "payment_pending" }).eq("id", businessId);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "eur",
          unit_amount: Math.round(monthly * 100),
          recurring: { interval: "month" },
          product_data: { name: `Flowly IA · ${plan}`, description: `Suscripción mensual de ${business.name || "cliente"}` },
        },
        quantity: 1,
      },
    ];

    if (setup > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          unit_amount: Math.round(setup * 100),
          product_data: { name: "Instalación Flowly IA" },
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_collection: "always",
      customer: business.stripe_customer_id || undefined,
      line_items: lineItems,
      subscription_data: {
        metadata: {
          plan,
          business_id: businessId,
          sales_user_id: salesUserId,
          referral_code: seller.referral_code || "",
          sales_deal_id: deal?.id || "",
          source: "admin_payment_link",
        },
      },
      metadata: {
        plan,
        business_id: businessId,
        sales_user_id: salesUserId,
        referral_code: seller.referral_code || "",
        sales_deal_id: deal?.id || "",
        source: "admin_payment_link",
        monthly_amount: String(monthly),
        setup_amount: String(setup),
      },
      success_url: `${siteUrl}/dashboard?payment=success`,
      cancel_url: `${siteUrl}/dashboard?payment=cancelled`,
    });

    if (deal?.id) {
      await supabaseAdmin.from("sales_deals").update({ payment_url: session.url }).eq("id", deal.id);
    }

    return NextResponse.json({ url: session.url, dealId: deal?.id || null });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error generando enlace de pago" }, { status: 500 });
  }
}
