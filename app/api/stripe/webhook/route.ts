import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Falta firma de Stripe" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature error:", error);

    return NextResponse.json(
      { error: "Firma inválida" },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const customerId =
        typeof session.customer === "string" ? session.customer : "";

      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : "";

      const email = session.customer_details?.email || "";
      const plan = session.metadata?.plan || "basic";

      await supabaseAdmin.from("stripe_checkout_sessions").upsert({
        stripe_session_id: session.id,
        customer_email: email,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plan,
        status: "completed",
      });
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : "";

      const subscriptionId = subscription.id;
      const status = subscription.status;

      await supabaseAdmin
        .from("businesses")
        .update({
          subscription_status: status,
          stripe_subscription_id: subscriptionId,
        })
        .eq("stripe_customer_id", customerId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);

    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 }
    );
  }
}
