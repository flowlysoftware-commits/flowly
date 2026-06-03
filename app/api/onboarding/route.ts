import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const premiumModules = [
  "whatsapp",
  "billing",
  "crm",
  "marketing",
  "ai",
  "analytics",
  "booking_premium",
];

export async function POST(request: Request) {
  try {
    const { sessionId, password, businessName, businessType, logoUrl, theme, primaryGoal } = await request.json();

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status !== "complete") {
      return NextResponse.json({ error: "Pago no completado" }, { status: 400 });
    }

    const email = session.customer_details?.email;
    if (!email) {
      return NextResponse.json({ error: "Email no encontrado" }, { status: 400 });
    }

    const plan = session.metadata?.plan || "basic";
    const metadataModules = session.metadata?.modules ? session.metadata.modules.split(",").filter(Boolean) : [];
    const modules = plan === "premium" ? premiumModules : metadataModules;
    const monthlyAmount = session.metadata?.monthly_amount
      ? Number(session.metadata.monthly_amount)
      : plan === "premium"
        ? 59.99
        : plan === "basic"
          ? 29.99
          : null;

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());

    let userId = existingUser?.id;

    if (!userId) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (userError) {
        return NextResponse.json({ error: userError.message }, { status: 400 });
      }

      userId = userData.user?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 400 });
    }

    await supabaseAdmin.from("user_profiles").upsert(
      {
        user_id: userId,
        email,
        full_name: businessName,
        account_type: "client",
        role: "owner",
        status: "active",
      },
      { onConflict: "user_id" }
    );

    const { data: business, error: businessError } = await supabaseAdmin
      .from("businesses")
      .insert({
        owner_id: userId,
        name: businessName,
        business_type: businessType,
        plan,
        stripe_customer_id: String(session.customer || ""),
        stripe_subscription_id: String(session.subscription || ""),
        subscription_status: "trialing",
        public_booking_enabled: true,
        logo_url: logoUrl || null,
        panel_theme: theme || "dark",
        onboarding_goal: primaryGoal || null,
      })
      .select("id")
      .single();

    if (businessError) {
      return NextResponse.json({ error: businessError.message }, { status: 400 });
    }

    if (business?.id && modules.length > 0) {
      const rows = modules.map((moduleKey) => ({ business_id: business.id, module_key: moduleKey, status: "active" }));
      const { error: moduleError } = await supabaseAdmin.from("business_modules").upsert(rows, { onConflict: "business_id,module_key" });
      if (moduleError) console.warn("Module insert warning:", moduleError.message);
    }

    if (business?.id && monthlyAmount) {
      await supabaseAdmin.from("sales_deals").insert({
        business_id: business.id,
        plan,
        monthly_amount: monthlyAmount,
        status: "trialing",
        closed_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, email });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creando cuenta" }, { status: 500 });
  }
}
