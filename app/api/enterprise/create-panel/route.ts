import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resolveFlowlyMarket, stripeUnitAmount } from "@/lib/stripePricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const enterpriseAllowedModules = ["agenda", "crm", "voice", "whatsapp", "billing", "pos", "marketing", "ai", "analytics", "booking_premium", "time_tracking"];

type Body = {
  businessName: string;
  contactName?: string;
  email: string;
  phone?: string;
  password: string;
  businessType?: string;
  monthlyAmount: number;
  setupAmount?: number;
  currency?: "EUR" | "COP" | "USD";
  createCheckout?: boolean;
  modules?: string[];
  logoUrl?: string;
  primaryColor?: string;
  theme?: string;
  goal?: string;
  clinicServices?: string[];
  doctors?: string[];
  voice?: { number?: string; provider?: string; notes?: string };
  internalNotes?: string;
};

async function getRequestUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data } = await supabase.auth.getUser(token);
  return data.user;
}

async function assertAdmin(request: Request) {
  const user = await getRequestUser(request);
  if (!user?.id || !user.email) return { ok: false, error: "No autorizado" };

  const { data: profile } = await supabaseAdmin
    .from("user_profiles")
    .select("account_type, role, email")
    .eq("user_id", user.id)
    .maybeSingle();

  const allowedEmails = (process.env.ENTERPRISE_ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin =
    profile?.account_type === "admin" ||
    profile?.role === "admin" ||
    profile?.role === "super_admin" ||
    allowedEmails.includes(user.email.toLowerCase());

  if (!isAdmin) return { ok: false, error: "No tienes permisos para crear paneles Enterprise" };
  return { ok: true, user };
}

export async function POST(request: Request) {
  try {
    const admin = await assertAdmin(request);
    if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: 401 });

    const body = (await request.json()) as Body;
    const email = String(body.email || "").trim().toLowerCase();
    const businessName = String(body.businessName || "").trim();
    const password = String(body.password || "").trim();
    const monthlyAmount = Number(body.monthlyAmount || 0);
    const market = resolveFlowlyMarket(undefined, body.currency);
    const currency = market.currency;
    const selectedModules = (body.modules || []).filter((item) => enterpriseAllowedModules.includes(item));

    if (!email || !businessName || !password || monthlyAmount <= 0) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers.users.find((item) => item.email?.toLowerCase() === email);

    let userId = existingUser?.id;
    if (!userId) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: body.contactName || businessName, business_name: businessName },
      });
      if (userError) return NextResponse.json({ error: userError.message }, { status: 400 });
      userId = userData.user?.id;
    }

    if (!userId) return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 400 });

    let stripeCustomerId: string | null = null;
    try {
      const customer = await stripe.customers.create({
        email,
        name: body.contactName || businessName,
        phone: body.phone || undefined,
        metadata: { business_name: businessName, source: "enterprise_factory" },
      });
      stripeCustomerId = customer.id;
    } catch (error) {
      console.warn("Stripe customer warning", error);
    }

    await supabaseAdmin.from("user_profiles").upsert(
      {
        user_id: userId,
        email,
        full_name: body.contactName || businessName,
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
        business_type: body.businessType || "Enterprise",
        plan: "enterprise",
        stripe_customer_id: stripeCustomerId,
        subscription_status: body.createCheckout ? "pending_payment" : "active",
        public_booking_enabled: true,
        logo_url: body.logoUrl || null,
        panel_theme: body.theme || "dark",
        onboarding_goal: body.goal || null,
      })
      .select("id")
      .single();

    if (businessError || !business?.id) {
      return NextResponse.json({ error: businessError?.message || "No se pudo crear el negocio" }, { status: 400 });
    }

    const businessId = business.id as string;

    if (selectedModules.length > 0) {
      const moduleRows = selectedModules.map((moduleKey) => ({ business_id: businessId, module_key: moduleKey, status: "active" }));
      await supabaseAdmin.from("business_modules").upsert(moduleRows, { onConflict: "business_id,module_key" });
    }

    await supabaseAdmin.from("business_custom_settings").upsert(
      {
        business_id: businessId,
        primary_color: body.primaryColor || "#7C3AED",
        theme: body.theme || "dark",
        logo_url: body.logoUrl || null,
        monthly_amount: monthlyAmount,
        setup_amount: Number(body.setupAmount || 0),
        currency,
        internal_notes: body.internalNotes || null,
        custom_features: {
          enterprise: true,
          clinic_mode: String(body.businessType || "").toLowerCase().includes("clín") || String(body.businessType || "").toLowerCase().includes("clinic"),
          voice: body.voice || {},
          modules: selectedModules,
        },
      },
      { onConflict: "business_id" }
    );

    await supabaseAdmin.from("booking_settings").upsert(
      {
        business_id: businessId,
        start_time: "09:00",
        end_time: "20:00",
        interval_minutes: 30,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      { onConflict: "business_id" }
    );

    const services = (body.clinicServices || []).filter(Boolean).slice(0, 20);
    if (services.length > 0) {
      await supabaseAdmin.from("services").insert(
        services.map((serviceName) => ({
          business_id: businessId,
          name: serviceName,
          duration: 45,
          price: 0,
          active: true,
        }))
      );
    }

    const doctors = (body.doctors || []).filter(Boolean).slice(0, 20);
    if (doctors.length > 0) {
      await supabaseAdmin.from("employees").insert(
        doctors.map((name) => ({
          business_id: businessId,
          name,
          phone: null,
          email: null,
          active: true,
        }))
      );
    }

    if (selectedModules.includes("voice")) {
      await supabaseAdmin.from("module_records").insert({
        business_id: businessId,
        module_key: "voice",
        title: "Configuración inicial de centralita",
        notes: `Número: ${body.voice?.number || "pendiente"}\nProveedor: ${body.voice?.provider || "pendiente"}\nObjetivo: ${body.voice?.notes || "registrar llamadas y conectarlas con CRM"}`,
        amount: null,
        status: "active",
      });
    }

    if (selectedModules.includes("crm")) {
      await supabaseAdmin.from("module_records").insert({
        business_id: businessId,
        module_key: "crm",
        title: "CRM clínico inicial",
        notes: "Preparado para pacientes, doctores, notas, seguimientos y agenda clínica.",
        amount: null,
        status: "active",
      });
    }

    await supabaseAdmin.from("sales_deals").insert({
      business_id: businessId,
      plan: "enterprise",
      monthly_amount: monthlyAmount,
      status: body.createCheckout ? "pending_payment" : "active",
      closed_at: new Date().toISOString(),
    });

    let checkoutUrl: string | null = null;
    if (body.createCheckout && stripeCustomerId) {
      const unitAmount = stripeUnitAmount(monthlyAmount, market);
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: stripeCustomerId,
        line_items: [
          {
            price_data: {
              currency: market.stripeCurrency,
              unit_amount: unitAmount,
              recurring: { interval: "month" },
              product_data: {
                name: `Flowly Enterprise · ${businessName}`,
                description: `Panel personalizado con módulos: ${selectedModules.join(", ")}`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: { plan: "enterprise", business_id: businessId, modules: selectedModules.join(","), monthly_amount: String(monthlyAmount), currency: market.currency },
        subscription_data: { metadata: { plan: "enterprise", business_id: businessId, modules: selectedModules.join(","), currency: market.currency } },
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://flowlyia.com"}/login?enterprise=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://flowlyia.com"}/Enterprise?estado=cancelado`,
      });
      checkoutUrl = session.url;
    }

    return NextResponse.json({
      success: true,
      businessId,
      userId,
      email,
      password,
      checkoutUrl,
      stripeCustomerId,
    });
  } catch (error) {
    console.error("Enterprise creation error", error);
    return NextResponse.json({ error: "Error creando panel Enterprise" }, { status: 500 });
  }
}
