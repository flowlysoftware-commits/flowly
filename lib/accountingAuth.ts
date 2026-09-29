import { createHash, scrypt, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const accountingCookie = process.env.NODE_ENV === "production" ? "__Host-flowly-accounting-shared" : "flowly-accounting-shared";
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/" };
export type AccountingActor = { id: null; name: "Ricky" | "Alex" };
export const sessionHash = (token: string) => createHash("sha256").update(token).digest("hex");

export function accountingUsers(): AccountingActor[] {
  return [{ id: null, name: "Ricky" }, { id: null, name: "Alex" }];
}

// Hash of the previously used shared password. Server-only; never return this to the browser.
const passwordSalt = "a92d5612a5e1fc9132ebd0a44a7878aa";
const passwordHash = "cf20ea845e785c6bc83c588054f35314ed28846aa9e9f6dbb4d6c0448ad9b598681b5f567d7a7223f623bae723decf2871f3fdcceb1346c722b2417b6f76ac23";
export async function validSharedPassword(password: string): Promise<boolean> {
  if (!password || password.length > 1024) return false;
  const derived = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, passwordSalt, 64, (error, key) => error ? reject(error) : resolve(key));
  });
  return timingSafeEqual(derived, Buffer.from(passwordHash, "hex"));
}

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
  return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" } });
}

// The label is selected by the person holding the common password, not an Auth identity.
export function accountingDatabase(actor?: AccountingActor) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: actor ? { headers: { "x-accounting-actor-name": actor.name, "x-accounting-identity-mode": "shared-password" } } : undefined,
  });
}

export async function requireAccounting(request: NextRequest): Promise<AccountingActor | null> {
  if (!accountingConfigured() || !safeAccountingRequest(request)) return null;
  const token = request.cookies.get(accountingCookie)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  try {
    const { data: session, error } = await supabaseAdmin.from("accounting_shared_sessions")
      .select("selected_name").eq("token_hash", sessionHash(token)).gt("expires_at", new Date().toISOString()).maybeSingle();
    if (error || !session) return null;
    return accountingUsers().find((user) => user.name === session.selected_name) || null;
  } catch { return null; }
}
