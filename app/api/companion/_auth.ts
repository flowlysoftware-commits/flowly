import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type CompanionAuthContext = Readonly<{
  userId: string;
  businessId: string;
}>;

function bearerToken(request: NextRequest) {
  const header = request.headers.get("authorization") || "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
}

export async function requireCompanionAuth(request: NextRequest): Promise<CompanionAuthContext | null> {
  const token = bearerToken(request);
  if (!token) return null;

  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
  const userId = authData.user?.id;
  if (authError || !userId) return null;

  const { data: business, error: businessError } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();

  if (businessError || !business?.id) return null;
  return { userId, businessId: String(business.id) };
}
