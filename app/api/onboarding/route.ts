import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildCommissionLines } from "@/lib/salesCommissions";
import { generateAndStoreBrandAvatar } from "@/lib/brandAvatar";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const premiumModules = [
  "agenda",
  "whatsapp",
  "billing",
  "crm",
  "marketing",
  "ai",
  "analytics",
  "booking_premium",
  "time_tracking",
];

export async function POST(request: Request) {
  try {
    const { sessionId, password, businessName, businessType, logoUrl, logoBase64, logoFileName, logoMimeType, termsAccepted, termsVersion, theme, primaryGoal, createAvatar, avatarName, avatarStyle, avatarPersonality } = await request.json();

    if (!termsAccepted) {
      return NextResponse.json({ error: "Debes aceptar las condiciones de contratación de Flowly IA" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status !== "complete") {
      return NextResponse.json({ error: "Pago no completado" }, { status: 400 });
    }

    const email = session.customer_details?.email;
    if (!email) {
      return NextResponse.json({ error: "Email no encontrado" }, { status: 400 });
    }

    const plan = session.metadata?.plan || "basic";
    const salesUserId = session.metadata?.sales_user_id || null;
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

    let finalLogoUrl = logoUrl || null;
    if (logoBase64 && typeof logoBase64 === "string" && logoBase64.startsWith("data:")) {
      try {
        const base64Payload = logoBase64.split(",")[1];
        const buffer = Buffer.from(base64Payload, "base64");
        const extension = String(logoFileName || "logo.png").split(".").pop() || "png";
        const safeName = String(businessName || "negocio").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "negocio";
        const filePath = `onboarding/${safeName}-${Date.now()}.${extension}`;
        const { error: uploadError } = await supabaseAdmin.storage.from("business-logos").upload(filePath, buffer, {
          contentType: logoMimeType || "image/png",
          upsert: true,
        });
        if (!uploadError) {
          const { data: publicUrlData } = supabaseAdmin.storage.from("business-logos").getPublicUrl(filePath);
          finalLogoUrl = publicUrlData.publicUrl;
        } else {
          console.warn("Logo upload warning:", uploadError.message);
        }
      } catch (logoError) {
        console.warn("Logo upload warning:", logoError);
      }
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
        logo_url: finalLogoUrl,
        panel_theme: theme || "dark",
        onboarding_goal: primaryGoal || null,
        sales_user_id: salesUserId,
      })
      .select("id")
      .single();

    if (businessError) {
      return NextResponse.json({ error: businessError.message }, { status: 400 });
    }

    if (business?.id && createAvatar) {
      try {
        await generateAndStoreBrandAvatar({
          businessId: business.id,
          businessName,
          businessType,
          logoUrl: finalLogoUrl,
          avatarName: avatarName || "Nia",
          avatarStyle: avatarStyle || "robot-premium",
          avatarPersonality: avatarPersonality || "cercana, estratégica y orientada a ventas",
          brandColors: theme === "violet" ? ["#7c3aed", "#06b6d4"] : ["#2563eb", "#7c3aed"],
        });
      } catch (avatarError) {
        console.warn("Avatar generation warning:", avatarError);
      }
    }

    if (business?.id && modules.length > 0) {
      const rows = modules.map((moduleKey) => ({ business_id: business.id, module_key: moduleKey, status: "active" }));
      const { error: moduleError } = await supabaseAdmin.from("business_modules").upsert(rows, { onConflict: "business_id,module_key" });
      if (moduleError) console.warn("Module insert warning:", moduleError.message);
    }

    if (business?.id && monthlyAmount) {
      await supabaseAdmin.from("sales_deals").insert({
        business_id: business.id,
        sales_user_id: salesUserId,
        client_name: businessName,
        plan,
        monthly_amount: monthlyAmount,
        status: "trialing",
        closed_at: new Date().toISOString(),
      });

      if (salesUserId) {
        const { data: users } = await supabaseAdmin.from("sales_users").select("id, full_name, role, manager_id");
        const seller = (users || []).find((user: any) => user.id === salesUserId);
        if (seller) {
          const lines = buildCommissionLines({
            seller,
            users: users || [],
            clientName: businessName,
            saleBaseAmount: Number(monthlyAmount),
            monthlyAmount: Number(monthlyAmount),
            source: "stripe",
            includeMonthly: false,
          });
          if (lines.length > 0) await supabaseAdmin.from("commissions").insert(lines);
        }
      }
    }

    if (business?.id) {
      try {
        await supabaseAdmin.from("legal_acceptances").insert({
          business_id: business.id,
          user_id: userId,
          email,
          terms_version: termsVersion || "flowly-ia-v1",
          accepted_at: new Date().toISOString(),
          source: "onboarding",
        });
      } catch (legalError) {
        console.warn("Legal acceptance warning:", legalError);
      }
    }

    return NextResponse.json({ success: true, email });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creando cuenta" }, { status: 500 });
  }
}
