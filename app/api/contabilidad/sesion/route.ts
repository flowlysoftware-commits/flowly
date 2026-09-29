import { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { accountingConfigured, accountingCookie, accountingUsers, cookieOptions, privateJson, requireAccounting, safeAccountingRequest, sessionHash, validSharedPassword } from "@/lib/accountingAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const actor = await requireAccounting(request);
  return actor ? privateJson({ user: actor }) : privateJson({ error: "Sesión no válida" }, 401);
}

export async function POST(request: NextRequest) {
  if (!safeAccountingRequest(request)) return privateJson({ error: "Solicitud no permitida" }, 403);
  if (!accountingConfigured()) return privateJson({ error: "Falta la conexión del servidor con Supabase." }, 503);
  let body;
  try { body = await request.json(); } catch { return privateJson({ error: "Usuario o contraseña incorrectos." }, 401); }
  const name = typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const actor = accountingUsers().find((user) => user.name.toLowerCase() === name);
  // Persistent, atomic account throttling works across serverless instances; no trust in spoofable IP headers.
  const { data: allowed, error: throttleError } = await supabaseAdmin.rpc("accounting_login_attempt", { p_key: "unknown" });
  if (throttleError) return privateJson({ error: "No se pudo comprobar el acceso. Comprueba que se haya ejecutado el SQL de esta actualización." }, 503);
  if (!allowed) return privateJson({ error: "Demasiados intentos. Espera 15 minutos e inténtalo de nuevo." }, 429);
  const denied = () => privateJson({ error: "Usuario o contraseña incorrectos." }, 401);
  if (!actor || !password || password.length > 1024) return denied();
  if (!(await validSharedPassword(password))) return denied();
  const token = randomBytes(32).toString("hex");
  const maxAge = 3600;
  const { error: saveError } = await supabaseAdmin.from("accounting_shared_sessions").insert({
    token_hash: sessionHash(token), selected_name: actor.name, expires_at: new Date(Date.now() + maxAge * 1000).toISOString(),
  });
  if (saveError) {
    return privateJson({ error: "No se pudo guardar la sesión. Ejecuta el SQL de esta actualización si todavía no lo has hecho." }, 503);
  }
  const previous = request.cookies.get(accountingCookie)?.value;
  if (previous) await supabaseAdmin.from("accounting_shared_sessions").delete().eq("token_hash", sessionHash(previous));
  const response = privateJson({ user: actor });
  response.cookies.set(accountingCookie, token, { ...cookieOptions, maxAge });
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!safeAccountingRequest(request)) return privateJson({ error: "Solicitud no permitida" }, 403);
  const token = request.cookies.get(accountingCookie)?.value;
  if (token) {
    const { error } = await supabaseAdmin.from("accounting_shared_sessions").delete().eq("token_hash", sessionHash(token));
    if (error) return privateJson({ error: "No se pudo cerrar la sesión. Vuelve a intentarlo." }, 503);
  }
  const response = privateJson({ ok: true });
  response.cookies.set(accountingCookie, "", { ...cookieOptions, maxAge: 0 });
  return response;
}
