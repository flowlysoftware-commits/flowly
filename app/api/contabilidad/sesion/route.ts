import { NextRequest, NextResponse } from "next/server";
import { accountingBearerToken, accountingConfigured, accountingCookie, cookieOptions, legacyAccountingCookie, privateJson, requireAccounting, safeAccountingRequest, verifiedAccountingTokenMaxAge } from "@/lib/accountingAuth";

export const dynamic = "force-dynamic";

function rememberVerifiedBearer(request: NextRequest, response: NextResponse) {
  // Call only after requireAccounting has verified this request's exact bearer.
  const token = accountingBearerToken(request);
  if (token) {
    const maxAge = verifiedAccountingTokenMaxAge(token);
    if (maxAge > 0) response.cookies.set(accountingCookie, token, { ...cookieOptions, maxAge });
  }
  response.cookies.set(legacyAccountingCookie, "", { ...cookieOptions, maxAge: 0 });
  return response;
}

export async function GET(request: NextRequest) {
  if (!accountingConfigured()) return privateJson({ error: "Falta la conexión del servidor con Supabase." }, 503);
  const actor = await requireAccounting(request);
  return actor
    ? rememberVerifiedBearer(request, privateJson({ user: actor, access: "verified-admin" }))
    : privateJson({ error: "Accede con una cuenta de administrador de Flowly." }, 401);
}

export async function POST(request: NextRequest) {
  if (!safeAccountingRequest(request)) return privateJson({ error: "Solicitud no permitida" }, 403);
  if (!accountingConfigured()) return privateJson({ error: "Falta la conexión del servidor con Supabase." }, 503);
  // The old common password and Alex/Ricky selector cannot establish a session.
  if (!accountingBearerToken(request)) return privateJson({ error: "Inicia sesión con tu cuenta de administrador de Flowly." }, 401);
  const actor = await requireAccounting(request);
  if (!actor) return privateJson({ error: "Esta cuenta no tiene acceso administrativo a Contabilidad." }, 403);
  return rememberVerifiedBearer(request, privateJson({ user: actor, access: "verified-admin" }));
}

export async function DELETE(request: NextRequest) {
  if (!safeAccountingRequest(request)) return privateJson({ error: "Solicitud no permitida" }, 403);
  const response = privateJson({ ok: true });
  response.cookies.set(accountingCookie, "", { ...cookieOptions, maxAge: 0 });
  response.cookies.set(legacyAccountingCookie, "", { ...cookieOptions, maxAge: 0 });
  return response;
}
