import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function buildBody(budget: any) {
  const modules = Array.isArray(budget.modules) && budget.modules.length ? budget.modules.map((m: any) => `- ${m.name}: ${Number(m.price || 0).toFixed(2)}€`).join("\n") : "- Sin módulos adicionales";
  return `Hola ${budget.client_name},\n\nTe enviamos tu presupuesto de Flowly IA:\n\nPack: ${budget.plan_name}\nMensualidad: ${Number(budget.monthly_amount || 0).toFixed(2)}€ / mes\nInstalación: ${Number(budget.setup_amount || 0).toFixed(2)}€\n\nMódulos:\n${modules}\n\nNotas:\n${budget.notes || "Sin notas adicionales"}\n\nUn saludo,\nEquipo Flowly IA`;
}

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

    const { budgetId } = await request.json();
    const { data: budget, error } = await supabaseAdmin.from("sales_budgets").select("*").eq("id", budgetId).single();
    if (error || !budget) return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });

    const { data: salesUser } = await supabaseAdmin.from("sales_users").select("id").eq("user_id", userData.user.id).maybeSingle();
    const { data: profile } = await supabaseAdmin.from("user_profiles").select("account_type").eq("user_id", userData.user.id).maybeSingle();
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
    const isAdmin = profile?.account_type === "admin" || profile?.account_type === "super_admin" || adminEmails.includes((userData.user.email || "").toLowerCase());
    const isOwner = salesUser?.id && salesUser.id === budget.sales_user_id;
    const isUnassignedAdminBudget = !budget.sales_user_id;
    if (!isAdmin && !isOwner && !isUnassignedAdminBudget) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    await supabaseAdmin.from("sales_budgets").update({ status: "enviado", sent_at: new Date().toISOString() }).eq("id", budgetId);

    const body = buildBody(budget);
    const subject = `Presupuesto Flowly IA · ${budget.plan_name}`;
    const to = budget.client_email;
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL || "Flowly IA <onboarding@resend.dev>";

    if (apiKey && to) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, subject, text: body }),
      });
      if (resendRes.ok) return NextResponse.json({ sent: true });
    }

    const mailto = to ? `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : null;
    return NextResponse.json({ sent: false, mailto });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error enviando presupuesto" }, { status: 500 });
  }
}
