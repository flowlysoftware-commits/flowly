import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { convertBasePrice, resolveFlowlyMarket, stripeUnitAmount } from "@/lib/stripePricing";
import { getMarketingPlan } from "@/lib/marketingPlans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const modularModules = [
  { id: "agenda", name: "Agenda PRO", price: 9.99 },
  { id: "whatsapp", name: "WhatsApp automático", price: 9.99 },
  { id: "billing", name: "Facturación", price: 9.99 },
  { id: "pos", name: "TPV", price: 14.99 },
  { id: "crm", name: "CRM avanzado", price: 9.99 },
  { id: "marketing", name: "Marketing", price: 19.9 },
  { id: "ai", name: "IA Assistant", price: 14.99 },
  { id: "analytics", name: "Estadísticas avanzadas", price: 4.99 },
  { id: "booking_premium", name: "Reservas Premium", price: 4.99 },
  { id: "voice", name: "Flowly Voice", price: 29.99 },
  { id: "inventory", name: "Inventario", price: 14.99 },
  { id: "client_portal", name: "Portal Cliente", price: 19.99 },
  { id: "surveys", name: "Encuestas", price: 7.99 },
  { id: "hr", name: "RRHH", price: 19.99 },
  { id: "automations", name: "Automatizaciones", price: 24.99 },
  { id: "digital_signature", name: "Firma digital", price: 12.99 },
  { id: "time_tracking", name: "Módulo Fichaje", price: 11.99 },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const plan = body.plan as "basic" | "premium" | "modular";
    const selectedModuleIds = Array.isArray(body.modules) ? body.modules.map(String) : [];
    const marketingPlan = selectedModuleIds.includes("marketing") ? getMarketingPlan(body.marketingPlanId || "marketing_bronze") : null;
    const referralCode = body.referralCode ? String(body.referralCode).trim() : "";
    const market = resolveFlowlyMarket(body.country, body.currency);
    let salesUserId = "";
    if (referralCode) {
      const { data: salesUser } = await supabaseAdmin
        .from("sales_users")
        .select("id")
        .eq("referral_code", referralCode)
        .eq("status", "active")
        .maybeSingle();
      salesUserId = salesUser?.id || "";
    }

    if (!plan || !["basic", "premium", "modular"].includes(plan)) {
      return NextResponse.json({ error: "Plan no válido" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let metadata: Record<string, string> = { plan, referral_code: referralCode, sales_user_id: salesUserId, country: market.country, currency: market.currency, business_type: body.businessType ? String(body.businessType) : "" };

    if (plan === "modular") {
      const selectedModules = modularModules.filter((item) => selectedModuleIds.includes(item.id));
      const selectedModulesWithPricing = selectedModules.map((item) =>
        item.id === "marketing" && marketingPlan ? { ...item, name: `Marketing · ${marketingPlan.name.replace("Flowly Marketing ", "")}`, price: marketingPlan.price } : item
      );
      const base = 19.99;
      const total = base + selectedModulesWithPricing.reduce((sum, item) => sum + item.price, 0);
      const displayTotal = convertBasePrice(total, market);
      const moduleNames = selectedModulesWithPricing.map((item) => item.name).join(", ") || "Sin módulos extra";
      const moduleIds = selectedModules.map((item) => item.id).join(",");

      lineItems = [
        {
          price_data: {
            currency: market.stripeCurrency,
            unit_amount: stripeUnitAmount(displayTotal, market),
            recurring: { interval: "month" },
            product_data: { name: "Flowly Modular", description: `Base Flowly + ${moduleNames}` },
          },
          quantity: 1,
        },
      ];

      metadata = { plan, modules: moduleIds, monthly_amount: displayTotal.toFixed(2), base_amount_eur: total.toFixed(2), referral_code: referralCode, sales_user_id: salesUserId, country: market.country, currency: market.currency, business_type: body.businessType ? String(body.businessType) : "", marketing_plan_id: marketingPlan?.id || "", marketing_plan_name: marketingPlan?.name || "", marketing_plan_price_eur: marketingPlan?.price ? String(marketingPlan.price) : "" };
    } else {
      const basePrice = plan === "basic" ? 29.99 : 59.99;
      const displayPrice = convertBasePrice(basePrice, market);
      metadata = { ...metadata, monthly_amount: displayPrice.toFixed(2), base_amount_eur: basePrice.toFixed(2) };

      if (market.currency === "EUR") {
        const priceId = plan === "basic" ? process.env.STRIPE_BASIC_PRICE_ID : process.env.STRIPE_PREMIUM_PRICE_ID;
        if (!priceId) return NextResponse.json({ error: "Price ID no configurado" }, { status: 400 });
        lineItems = [{ price: priceId, quantity: 1 }];
      } else {
        lineItems = [
          {
            price_data: {
              currency: market.stripeCurrency,
              unit_amount: stripeUnitAmount(displayPrice, market),
              recurring: { interval: "month" },
              product_data: { name: `Flowly ${plan === "basic" ? "Basic" : "Premium"}`, description: `Suscripción mensual Flowly · ${market.country}` },
            },
            quantity: 1,
          },
        ];
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_collection: "always",
      line_items: lineItems,
      subscription_data: { trial_period_days: 30, metadata },
      metadata,
      success_url: `${siteUrl}/registro?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/precios?country=${market.country}&estado=cancelado`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Error creando la sesión de pago" }, { status: 500 });
  }
}
