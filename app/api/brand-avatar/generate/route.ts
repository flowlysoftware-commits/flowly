import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateAndStoreBrandAvatar } from "@/lib/brandAvatar";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Sesión no válida" }, { status: 401 });

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) return NextResponse.json({ error: "Sesión no válida" }, { status: 401 });

    const body = await request.json();
    const businessId = String(body.businessId || "");
    if (!businessId) return NextResponse.json({ error: "Falta businessId" }, { status: 400 });

    const { data: business, error: businessError } = await supabaseAdmin
      .from("businesses")
      .select("id, owner_id, name, business_type, logo_url")
      .eq("id", businessId)
      .maybeSingle();

    if (businessError) return NextResponse.json({ error: businessError.message }, { status: 400 });
    if (!business || business.owner_id !== userData.user.id) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const avatar = await generateAndStoreBrandAvatar({
      businessId,
      businessName: body.businessName || business.name,
      businessType: body.businessType || business.business_type,
      logoUrl: body.logoUrl || business.logo_url || null,
      avatarName: body.avatarName || "Nia",
      avatarStyle: body.avatarStyle || "robot-premium",
      avatarPersonality: body.avatarPersonality || "cercana, estratégica y muy orientada a ventas",
      brandColors: Array.isArray(body.brandColors) ? body.brandColors : [],
    });

    return NextResponse.json({ success: true, avatar });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || "Error generando mascota IA" }, { status: 500 });
  }
}
