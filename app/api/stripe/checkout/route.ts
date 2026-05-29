import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { plan } = await request.json();

  const priceId =
    plan === "basic"
      ? process.env.STRIPE_BASIC_PRICE_ID
      : process.env.STRIPE_PREMIUM_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: "Price ID no configurado" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_collection: "always",
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 30,
      metadata: { plan },
    },
    metadata: { plan },
    success_url: `${siteUrl}/registro?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/precios?estado=cancelado`,
  });

  return NextResponse.json({ url: session.url });
}
