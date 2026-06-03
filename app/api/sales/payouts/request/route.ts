import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const userClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData } = await userClient.auth.getUser(token);
    if (!userData.user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });

    const { data: salesUser } = await supabaseAdmin.from("sales_users").select("id").eq("user_id", userData.user.id).single();
    if (!salesUser) return NextResponse.json({ error: "Perfil comercial no encontrado" }, { status: 404 });

    const { data: commissions } = await supabaseAdmin.from("commissions").select("amount").eq("sales_user_id", salesUser.id).eq("status", "pending");
    const amount = (commissions || []).reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
    if (amount <= 0) return NextResponse.json({ error: "No hay saldo pendiente" }, { status: 400 });

    const { error } = await supabaseAdmin.from("commission_payouts").insert({ sales_user_id: salesUser.id, amount, status: "requested" });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabaseAdmin.from("commissions").update({ status: "requested" }).eq("sales_user_id", salesUser.id).eq("status", "pending");
    return NextResponse.json({ success: true, amount });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error solicitando cobro" }, { status: 500 });
  }
}
