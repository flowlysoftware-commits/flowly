import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const plans: Record<string, { name: string; price: number; description: string; postsPerWeek: number; tier: string }> = {
  marketing_bronze: { name: "Flowly Marketing Bronze", price: 19.9, description: "1 publicación semanal + IA para campañas", postsPerWeek: 1, tier: "bronze" },
  marketing_plata: { name: "Flowly Marketing Plata", price: 34.9, description: "2 publicaciones semanales + estrategia e IA", postsPerWeek: 2, tier: "plata" },
  marketing_oro: { name: "Flowly Marketing Oro", price: 44.9, description: "4 publicaciones semanales + estrategia avanzada", postsPerWeek: 4, tier: "oro" },
  posts_1_week: { name: "Pack publicaciones 1/semana", price: 15, description: "1 publicación semanal", postsPerWeek: 1, tier: "publicaciones" },
  posts_2_week: { name: "Pack publicaciones 2/semana", price: 25, description: "2 publicaciones semanales", postsPerWeek: 2, tier: "publicaciones" },
  posts_4_week: { name: "Pack publicaciones 4/semana", price: 40, description: "4 publicaciones semanales", postsPerWeek: 4, tier: "publicaciones" },
};

type Country = "VE" | "ES" | "CO" | "EC" | "PR";

const marketingMarkets: Record<Country, { currency: "eur" | "usd" | "cop"; rate: number; locale: string }> = {
  VE: { currency: "usd", rate: 1.08, locale: "es-VE" },
  ES: { currency: "eur", rate: 1, locale: "es-ES" },
  CO: { currency: "cop", rate: 4300, locale: "es-CO" },
  EC: { currency: "usd", rate: 1.08, locale: "es-EC" },
  PR: { currency: "usd", rate: 1.08, locale: "es-PR" },
};

function isCountry(value: unknown): value is Country {
  return typeof value === "string" && value in marketingMarkets;
}

function getMarketingAmount(priceInEur: number, country: Country) {
  const market = marketingMarkets[country];
  const converted = priceInEur * market.rate;

  if (market.currency === "cop") {
    return { currency: market.currency, unitAmount: Math.round(converted), convertedAmount: Math.round(converted) };
  }

  return { currency: market.currency, unitAmount: Math.round(converted * 100), convertedAmount: converted };
}

export async function POST(request: Request) {
  try {
    const { planId, country: rawCountry } = await request.json();
    const country: Country = isCountry(rawCountry) ? rawCountry : "ES";
    const plan = plans[String(planId || "")];
    if (!plan) return NextResponse.json({ error: "Plan de marketing no válido" }, { status: 400 });
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://www.flowlyia.com";
    const pricing = getMarketingAmount(plan.price, country);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_collection: "always",
      line_items: [{
        price_data: {
          currency: pricing.currency,
          unit_amount: pricing.unitAmount,
          recurring: { interval: "month" },
          product_data: { name: plan.name, description: plan.description },
        },
        quantity: 1,
      }],
      metadata: {
        product_type: "marketing",
        plan_id: String(planId),
        plan_name: plan.name,
        tier: plan.tier,
        posts_per_week: String(plan.postsPerWeek),
        monthly_amount: pricing.convertedAmount.toFixed(pricing.currency === "cop" ? 0 : 2),
        base_monthly_amount_eur: plan.price.toFixed(2),
        country,
        currency: pricing.currency.toUpperCase(),
      },
      subscription_data: { metadata: { product_type: "marketing", plan_id: String(planId), plan_name: plan.name } },
      success_url: `${siteUrl}/marketing/onboarding?session_id={CHECKOUT_SESSION_ID}&country=${country}`,
      cancel_url: `${siteUrl}/marketing?estado=cancelado&country=${country}`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Marketing checkout error", error);
    return NextResponse.json({ error: "No se pudo crear el pago de marketing" }, { status: 500 });
  }
}
