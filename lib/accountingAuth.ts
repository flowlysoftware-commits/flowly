import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const accountingCookie = process.env.NODE_ENV === "production" ? "__Host-flowly-accounting-admin" : "flowly-accounting-admin";
export const legacyAccountingCookie = process.env.NODE_ENV === "production" ? "__Host-flowly-accounting-shared" : "flowly-accounting-shared";
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/" };
export type AccountingActor = { id: string; name: string };

export function accountingConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function safeAccountingRequest(request: NextRequest) {
  if (["GET", "HEAD"].includes(request.method)) return true;
  return request.headers.get("x-accounting-request") === "1"
    && request.headers.get("origin") === (process.env.ACCOUNTING_ORIGIN || request.nextUrl.origin)
    && request.headers.get("sec-fetch-site") !== "cross-site";
}

export function privateJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: {
    "Cache-Control": "private, no-store, max-age=0", Pragma: "no-cache", Vary: "Authorization, Cookie",
  } });
}

export function accountingBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const token = header.match(/^Bearer\s+(\S+)$/i)?.[1];
  return token && token.length <= 3800 ? token : null;
}

/** Read exp only AFTER Supabase Auth has validated this exact token. */
export function verifiedAccountingTokenMaxAge(token: string): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    if (!Number.isSafeInteger(payload.exp)) return 0;
    return Math.max(0, Math.min(3600, payload.exp - Math.floor(Date.now() / 1000)));
  } catch { return 0; }
}

/** Auth identity is verified remotely and administrative permission is read afresh. */
export async function requireAccounting(request: NextRequest): Promise<AccountingActor | null> {
  if (!accountingConfigured() || !safeAccountingRequest(request)) return null;
  // An invalid explicitly supplied bearer must not fall back to another user's cookie.
  const token = request.headers.has("authorization")
    ? accountingBearerToken(request) : request.cookies.get(accountingCookie)?.value;
  if (!token || token.length > 3800) return null;
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user || data.user.is_anonymous || verifiedAccountingTokenMaxAge(token) <= 0) return null;
    const { data: profile, error: profileError } = await supabaseAdmin.from("user_profiles")
      .select("account_type").eq("user_id", data.user.id).maybeSingle();
    if (profileError || profile?.account_type !== "admin") return null;
    // Never infer authorization or a person's identity from a selectable name or user_metadata.
    return { id: data.user.id, name: data.user.email || data.user.id };
  } catch { return null; }
}

export function accountingDatabase(actor?: AccountingActor) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: actor ? { headers: {
      "x-accounting-actor-name": actor.name,
      "x-accounting-actor-id": actor.id,
      "x-accounting-identity-mode": "verified-admin",
    } } : undefined,
  });
}
