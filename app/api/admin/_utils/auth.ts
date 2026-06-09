import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { error: "No autenticado", status: 401 as const };

  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !authData.user) return { error: "Sesión no válida", status: 401 as const };

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("user_profiles")
    .select("account_type, role")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (profileError) return { error: profileError.message, status: 500 as const };
  if (profile?.account_type !== "admin") return { error: "Solo un administrador puede realizar esta acción", status: 403 as const };

  return { userId: authData.user.id };
}
