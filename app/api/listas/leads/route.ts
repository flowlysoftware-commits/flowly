import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const allowedUpdateFields = new Set([
  "worked",
  "worked_by",
  "assigned_to",
  "status",
  "priority",
  "last_contact_at",
  "next_follow_up_at",
  "notes",
  "email",
  "instagram",
  "booking_software",
  "whatsapp",
]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country") || "Todos";
    const province = searchParams.get("province") || "Todas";
    const city = searchParams.get("city") || "";
    const businessType = searchParams.get("businessType") || "Todos";
    const worked = searchParams.get("worked") || "todos";
    const status = searchParams.get("status") || "todos";
    const query = searchParams.get("query") || "";
    const minReviews = Number(searchParams.get("minReviews") || 0);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 300), 1), 1000);

    let requestBuilder = supabaseAdmin
      .from("flowly_prospecting_leads")
      .select("*")
      .gte("google_reviews", minReviews)
      .order("google_reviews", { ascending: false })
      .limit(limit);

    if (country !== "Todos") requestBuilder = requestBuilder.eq("country", country);
    if (province !== "Todas") requestBuilder = requestBuilder.eq("province", province);
    if (city) requestBuilder = requestBuilder.ilike("city", `%${city}%`);
    if (businessType !== "Todos") requestBuilder = requestBuilder.eq("business_type", businessType);
    if (worked === "trabajados") requestBuilder = requestBuilder.eq("worked", true);
    if (worked === "pendientes") requestBuilder = requestBuilder.eq("worked", false);
    if (status !== "todos") requestBuilder = requestBuilder.eq("status", status);
    if (query) requestBuilder = requestBuilder.or(`business_name.ilike.%${query}%,phone.ilike.%${query}%,worked_by.ilike.%${query}%,assigned_to.ilike.%${query}%,address.ilike.%${query}%`);

    const { data, error } = await requestBuilder;
    if (error) throw error;

    return NextResponse.json({ leads: data || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo cargar la base de datos." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = String(body.id || "");
    const updates = body.updates || {};
    if (!id) return NextResponse.json({ error: "Falta el ID del negocio." }, { status: 400 });

    const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([key]) => allowedUpdateFields.has(key)));
    if (Object.keys(cleanUpdates).length === 0) {
      return NextResponse.json({ error: "No hay campos válidos para actualizar." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("flowly_prospecting_leads")
      .update({ ...cleanUpdates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ lead: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo actualizar el negocio." }, { status: 500 });
  }
}
