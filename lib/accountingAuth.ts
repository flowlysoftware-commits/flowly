import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const accountingCookie = process.env.NODE_ENV === "production" ? "__Host-flowly-accounting" : "flowly-accounting";
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/" };
export type AccountingActor = { id: string; name: "Ricky" | "Alex" };
export const sessionHash = (token: string) => createHash("sha256").update(token).digest("hex");

export function accountingUsers(): AccountingActor[] {
  const ricky = process.env.ACCOUNTING_RICKY_USER_ID;
  const alex = process.env.ACCOUNTING_ALEX_USER_ID;
  if (!ricky || !alex || ricky === alex) return [];
  return [{ id: ricky, name: "Ricky" }, { id: alex, name: "Alex" }];
}

export function accountingConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && accountingUsers().length);
}

export function safeAccountingRequest(request: NextRequest) {
  if (["GET", "HEAD"].includes(request.method)) return true;
  return request.headers.get("x-accounting-request") === "1"
    && request.headers.get("origin") === (process.env.ACCOUNTING_ORIGIN || request.nextUrl.origin)
    && request.headers.get("sec-fetch-site") !== "cross-site";
}

export function privateJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" } });
}

// A fresh client per request: never install a person's Auth session on the shared admin client.
export function accountingDatabase(actor?: AccountingActor) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: actor ? { headers: { "x-accounting-actor-id": actor.id, "x-accounting-actor-name": actor.name } } : undefined,
  });
}

export async function requireAccounting(request: NextRequest): Promise<AccountingActor | null> {
  if (!accountingConfigured() || !safeAccountingRequest(request)) return null;
  const token = request.cookies.get(accountingCookie)?.value;
  if (!token || token.length > 8192) return null;
  try {
    // The allowlist makes logout immediately revoke this accounting session, including its JWT.
    const { data: session, error } = await supabaseAdmin.from("accounting_sessions")
      .select("user_id").eq("token_hash", sessionHash(token)).gt("expires_at", new Date().toISOString()).maybeSingle();
    if (error || !session) return null;
    const actor = accountingUsers().find((user) => user.id === session.user_id);
    if (!actor) return null;
    const { data, error: authError } = await supabaseAdmin.auth.getUser(token);
    return !authError && data.user?.id === actor.id ? actor : null;
  } catch { return null; }
}
