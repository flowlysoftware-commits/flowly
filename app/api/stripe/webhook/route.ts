import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildCommissionLines } from "@/lib/salesCommissions";

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
      const salesUserId = session.metadata?.sales_user_id || null;
      const referralCode = session.metadata?.referral_code || null;
      const businessId = session.metadata?.business_id || null;
      const salesDealId = session.metadata?.sales_deal_id || null;
      const setupAmount = Number(session.metadata?.setup_amount || 0);
      const monthlyAmount = Number(session.metadata?.monthly_amount || 0);

      await supabaseAdmin.from("stripe_checkout_sessions").upsert({
        stripe_session_id: session.id,
        customer_email: email,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plan,
        sales_user_id: salesUserId,
        referral_code: referralCode,
        status: "completed",
      });

      if (businessId) {
        await supabaseAdmin
          .from("businesses")
          .update({
            sales_user_id: salesUserId,
            plan,
            subscription_status: "paid",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          })
          .eq("id", businessId);
      }

      if (salesDealId) {
        const { data: deal } = await supabaseAdmin
          .from("sales_deals")
          .select("id, status")
          .eq("id", salesDealId)
          .maybeSingle();

        if (deal && deal.status !== "paid") {
          await supabaseAdmin
            .from("sales_deals")
            .update({ status: "paid", paid_at: new Date().toISOString(), stripe_session_id: session.id })
            .eq("id", salesDealId);

          if (salesUserId) {
            const [{ data: users }, { data: seller }, { data: business }] = await Promise.all([
              supabaseAdmin.from("sales_users").select("id, full_name, role, manager_id"),
              supabaseAdmin.from("sales_users").select("id, full_name, role, manager_id").eq("id", salesUserId).maybeSingle(),
              businessId ? supabaseAdmin.from("businesses").select("name").eq("id", businessId).maybeSingle() : Promise.resolve({ data: null } as any),
            ]);

            if (seller) {
              const saleBaseAmount = setupAmount > 0 ? setupAmount : monthlyAmount;
              const lines = buildCommissionLines({
                seller,
                users: users || [],
                clientName: business?.name || email || "cliente",
                saleBaseAmount,
                monthlyAmount,
                source: "stripe_checkout",
                includeMonthly: false,
              });
              if (lines.length > 0) await supabaseAdmin.from("commissions").insert(lines);
            }
          }
        }
      }
    }



    if (event.type === "invoice.paid") {
      const invoice = event.data.object as any;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : "";
      const amountPaid = Number(invoice.amount_paid || 0) / 100;
      const billingReason = typeof invoice.billing_reason === "string" ? invoice.billing_reason : "";

      if (billingReason === "subscription_create") {
        return NextResponse.json({ received: true });
      }

      if (customerId && amountPaid > 0) {
        const { data: business } = await supabaseAdmin
          .from("businesses")
          .select("id, name, sales_user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (business?.sales_user_id) {
          const { data: users } = await supabaseAdmin.from("sales_users").select("id, full_name, role, manager_id");
          const seller = (users || []).find((user: any) => user.id === business.sales_user_id);
          if (seller) {
            const monthlyLines = buildCommissionLines({
              seller,
              users: users || [],
              clientName: business.name || "cliente",
              saleBaseAmount: 0,
              monthlyAmount: amountPaid,
              source: "stripe_invoice",
            }).filter((line) => line.type === "direct_monthly" || line.type === "branch_monthly");

            if (monthlyLines.length > 0) await supabaseAdmin.from("commissions").insert(monthlyLines);
          }
        }
      }
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
