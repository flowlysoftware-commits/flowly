import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "../_utils/auth";

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });
    const body = await request.json();
    const commissionId = typeof body.commissionId === "string" ? body.commissionId : "";
    const amount = Number(body.amount);
    if (!commissionId) return NextResponse.json({ error: "Falta la comisión" }, { status: 400 });
    if (!Number.isFinite(amount) || amount < 0) return NextResponse.json({ error: "Importe no válido" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("commissions")
      .update({ amount, edited_by_admin: true, updated_at: new Date().toISOString() })
      .eq("id", commissionId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error actualizando comisión" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });
    const id = request.nextUrl.searchParams.get("id") || "";
    if (!id) return NextResponse.json({ error: "Falta la comisión" }, { status: 400 });

    const { error } = await supabaseAdmin.from("commissions").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error eliminando comisión" }, { status: 500 });
  }
}
