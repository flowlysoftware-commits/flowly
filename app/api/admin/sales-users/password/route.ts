import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type SalesUserRecord = {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  role: string | null;
  status: string | null;
};

function normalizePassword(password: unknown) {
  return typeof password === "string" ? password.trim() : "";
}

async function findAuthUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return null;
    const found = data.users.find((user) => user.email?.toLowerCase() === normalized);
    if (found) return found;
    if (data.users.length < 1000) break;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData.user) return NextResponse.json({ error: "Sesión no válida" }, { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("account_type, role")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (profile?.account_type !== "admin") {
      return NextResponse.json({ error: "Solo un administrador puede cambiar contraseñas de comerciales" }, { status: 403 });
    }

    const body = await request.json();
    const salesUserId = typeof body.salesUserId === "string" ? body.salesUserId : "";
    const password = normalizePassword(body.password);

    if (!salesUserId) return NextResponse.json({ error: "Falta el comercial" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "La contraseña debe tener mínimo 8 caracteres" }, { status: 400 });

    const { data: salesUser, error: salesUserError } = await supabaseAdmin
      .from("sales_users")
      .select("id, user_id, full_name, email, role, status")
      .eq("id", salesUserId)
      .maybeSingle();

    if (salesUserError) return NextResponse.json({ error: salesUserError.message }, { status: 500 });
    const salesUserRecord = salesUser as SalesUserRecord | null;
    if (!salesUserRecord) return NextResponse.json({ error: "Comercial no encontrado" }, { status: 404 });
    if (!salesUserRecord.email) return NextResponse.json({ error: "El comercial no tiene email" }, { status: 400 });

    let authUserId = salesUserRecord.user_id;
    let created = false;

    if (authUserId) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        password,
        email_confirm: true,
        user_metadata: {
          full_name: salesUserRecord.full_name || salesUserRecord.email,
          account_type: "sales",
          sales_role: salesUserRecord.role || "asociado",
        },
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const existingAuthUser = await findAuthUserByEmail(salesUserRecord.email);
      if (existingAuthUser?.id) {
        authUserId = existingAuthUser.id;
        const { error } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
          password,
          email_confirm: true,
          user_metadata: {
            ...(existingAuthUser.user_metadata || {}),
            full_name: salesUserRecord.full_name || salesUserRecord.email,
            account_type: "sales",
            sales_role: salesUserRecord.role || "asociado",
          },
        });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      } else {
        const { data: createdUser, error } = await supabaseAdmin.auth.admin.createUser({
          email: salesUserRecord.email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: salesUserRecord.full_name || salesUserRecord.email,
            account_type: "sales",
            sales_role: salesUserRecord.role || "asociado",
          },
        });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        authUserId = createdUser.user?.id || null;
        created = true;
      }

      if (!authUserId) return NextResponse.json({ error: "No se pudo crear el usuario de acceso" }, { status: 500 });

      const { error: updateError } = await supabaseAdmin
        .from("sales_users")
        .update({ user_id: authUserId, status: salesUserRecord.status || "active" })
        .eq("id", salesUserRecord.id);
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await supabaseAdmin.from("user_profiles").upsert(
      {
        user_id: authUserId,
        email: salesUserRecord.email,
        full_name: salesUserRecord.full_name || salesUserRecord.email,
        account_type: "sales",
        role: salesUserRecord.role || "asociado",
        status: "active",
      },
      { onConflict: "user_id" }
    );

    return NextResponse.json({ ok: true, created, userId: authUserId });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error cambiando contraseña" }, { status: 500 });
  }
}
