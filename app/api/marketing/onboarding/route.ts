import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildMarketingContentCalendar, buildMarketingTasks, getMarketingPlan } from "@/lib/marketingPlans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sessionId = String(body.sessionId || "");
    if (!sessionId) return NextResponse.json({ error: "Falta sesión de pago" }, { status: 400 });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status !== "complete") return NextResponse.json({ error: "Pago no completado" }, { status: 400 });

    const plan = getMarketingPlan(session.metadata?.plan_id || body.planId || "marketing_bronze");
    if (!plan) return NextResponse.json({ error: "Plan de marketing no válido" }, { status: 400 });

    const email = session.customer_details?.email || body.email || "";
    const customerId = typeof session.customer === "string" ? session.customer : "";
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : "";
    const now = new Date().toISOString();

    const payload = {
      stripe_session_id: session.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan_id: plan.id,
      plan_name: plan.name,
      plan_type: plan.planType,
      tier: plan.tier,
      posts_per_week: plan.postsPerWeek,
      monthly_amount: Number(session.metadata?.monthly_amount || plan.price),
      base_monthly_amount_eur: plan.price,
      currency: session.metadata?.currency || "EUR",
      country: session.metadata?.country || body.country || "ES",
      includes_software_module: plan.includesSoftwareModule,
      features: plan.features,
      deliverables: plan.deliverables,
      automation_blueprint: plan.automationSteps,
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
      updated_at: now,
    };

    const { data: order, error } = await supabaseAdmin
      .from("marketing_orders")
      .upsert(payload, { onConflict: "stripe_session_id" })
      .select("id")
      .single();

    if (error) throw error;

    if (order?.id) {
      const { count: taskCount } = await supabaseAdmin
        .from("marketing_tasks")
        .select("id", { count: "exact", head: true })
        .eq("marketing_order_id", order.id);

      if (!taskCount) {
        const tasks = buildMarketingTasks(plan).map((task) => ({
          ...task,
          marketing_order_id: order.id,
          created_at: now,
          updated_at: now,
        }));
        if (tasks.length) await supabaseAdmin.from("marketing_tasks").insert(tasks);
      }

      const { count: contentCount } = await supabaseAdmin
        .from("marketing_content_calendar")
        .select("id", { count: "exact", head: true })
        .eq("marketing_order_id", order.id);

      if (!contentCount) {
        const contentItems = buildMarketingContentCalendar(plan).map((item) => ({
          ...item,
          marketing_order_id: order.id,
          created_at: now,
          updated_at: now,
        }));
        if (contentItems.length) await supabaseAdmin.from("marketing_content_calendar").insert(contentItems);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Marketing onboarding error", error);
    return NextResponse.json({ error: error?.message || "No se pudo guardar el briefing" }, { status: 500 });
  }
}
