import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const { data: userData } = await supabase.auth.getUser(token);

    if (!userData.user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
    }

    const { data: business, error } = await supabase
      .from("businesses")
      .select("stripe_customer_id")
      .eq("owner_id", userData.user.id)
      .single();

    if (error || !business?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Cliente de Stripe no encontrado" },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

    const session = await stripe.billingPortal.sessions.create({
      customer: business.stripe_customer_id,
      return_url: `${siteUrl}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe portal error:", error);

    return NextResponse.json(
      { error: "Error abriendo el portal de facturación" },
      { status: 500 }
    );
  }
}
