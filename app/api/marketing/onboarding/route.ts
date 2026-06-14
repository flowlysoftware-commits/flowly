import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionId = String(body.sessionId || "");
    if (!sessionId) return NextResponse.json({ error: "Falta sesión de pago" }, { status: 400 });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status !== "complete") return NextResponse.json({ error: "Pago no completado" }, { status: 400 });
    const email = session.customer_details?.email || body.email || "";
    const customerId = typeof session.customer === "string" ? session.customer : "";
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : "";
    const payload = {
      stripe_session_id: session.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan_id: session.metadata?.plan_id || body.planId || "marketing",
      plan_name: session.metadata?.plan_name || body.planName || "Marketing Flowly",
      status: "briefing_pending",
      contact_name: body.contactName || session.customer_details?.name || "",
      email,
      phone: body.phone || "",
      business_name: body.businessName || "",
      sector: body.sector || "",
      instagram_url: body.instagramUrl || "",
      facebook_url: body.facebookUrl || "",
      website_url: body.websiteUrl || "",
      objectives: body.objectives || "",
      brand_tone: body.brandTone || "",
      target_customer: body.targetCustomer || "",
      offers: body.offers || "",
      notes: body.notes || "",
      briefing: body,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabaseAdmin.from("marketing_orders").upsert(payload, { onConflict: "stripe_session_id" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Marketing onboarding error", error);
    return NextResponse.json({ error: error?.message || "No se pudo guardar el briefing" }, { status: 500 });
  }
}
