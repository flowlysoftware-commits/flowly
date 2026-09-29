import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { accountingConfigured, accountingCookie, accountingDatabase, accountingUsers, cookieOptions, privateJson, requireAccounting, safeAccountingRequest, sessionHash } from "@/lib/accountingAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const actor = await requireAccounting(request);
  return actor ? privateJson({ user: actor }) : privateJson({ error: "Sesión no válida" }, 401);
}

export async function POST(request: NextRequest) {
  if (!safeAccountingRequest(request)) return privateJson({ error: "Solicitud no permitida" }, 403);
  if (!accountingConfigured()) return privateJson({ error: "El acceso privado todavía no está configurado." }, 503);
  let body;
  try { body = await request.json(); } catch { return privateJson({ error: "Usuario o contraseña incorrectos." }, 401); }
  const name = typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const actor = accountingUsers().find((user) => user.name.toLowerCase() === name);
  // Persistent, atomic account throttling works across serverless instances; no trust in spoofable IP headers.
  const { data: allowed, error: throttleError } = await supabaseAdmin.rpc("accounting_login_attempt", { p_key: actor?.name || "unknown" });
  if (throttleError) return privateJson({ error: "El acceso privado no está disponible. Inténtalo más tarde." }, 503);
  if (!allowed) return privateJson({ error: "Demasiados intentos. Espera 15 minutos e inténtalo de nuevo." }, 429);
  const denied = () => privateJson({ error: "Usuario o contraseña incorrectos." }, 401);
  if (!actor || !password || password.length > 1024) return denied();
  const { data: account, error: accountError } = await supabaseAdmin.auth.admin.getUserById(actor.id);
  if (accountError || !account.user?.email) return denied();
  const auth = accountingDatabase();
  const { data, error } = await auth.auth.signInWithPassword({ email: account.user.email, password });
  if (error || !data.session || data.user?.id !== actor.id) return denied();
  const expiresAt = Math.min(data.session.expires_at || 0, Math.floor(Date.now() / 1000) + 3600);
  const maxAge = expiresAt - Math.floor(Date.now() / 1000);
  if (maxAge <= 0) { await auth.auth.signOut({ scope: "local" }); return denied(); }
  const { error: saveError } = await supabaseAdmin.from("accounting_sessions").insert({
    token_hash: sessionHash(data.session.access_token), user_id: actor.id, expires_at: new Date(expiresAt * 1000).toISOString(),
  });
  if (saveError) {
    await auth.auth.signOut({ scope: "local" });
    return privateJson({ error: "No se pudo crear la sesión privada." }, 503);
  }
  const previous = request.cookies.get(accountingCookie)?.value;
  if (previous) await supabaseAdmin.from("accounting_sessions").delete().eq("token_hash", sessionHash(previous));
  const response = privateJson({ user: actor });
  response.cookies.set(accountingCookie, data.session.access_token, { ...cookieOptions, maxAge });
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!safeAccountingRequest(request)) return privateJson({ error: "Solicitud no permitida" }, 403);
  const token = request.cookies.get(accountingCookie)?.value;
  if (token) {
    const { error } = await supabaseAdmin.from("accounting_sessions").delete().eq("token_hash", sessionHash(token));
    if (error) return privateJson({ error: "No se pudo cerrar la sesión. Vuelve a intentarlo." }, 503);
    // This is a separate Auth login: do not close the user's other Flowly sessions.
    await supabaseAdmin.auth.admin.signOut(token, "local");
  }
  const response = privateJson({ ok: true });
  response.cookies.set(accountingCookie, "", { ...cookieOptions, maxAge: 0 });
  return response;
}
