import { NextResponse } from "next/server";

type Config = Record<string, string | number | boolean | null | undefined>;

function text(value: unknown) {
  return String(value || "").trim();
}

async function probe(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, error: body?.error?.message || body?.error_description || body?.message || `HTTP ${response.status}` };
  }
  return { ok: true, body };
}

export async function POST(request: Request) {
  try {
    const { providerKey, config } = (await request.json()) as { providerKey?: string; config?: Config };
    const provider = text(providerKey);
    const cfg = config || {};

    if (["meta_ads", "whatsapp_cloud"].includes(provider)) {
      const token = text(cfg.access_token);
      if (!token) return NextResponse.json({ ok: false, error: "Falta access token" }, { status: 400 });
      if (provider === "whatsapp_cloud") {
        const phoneNumberId = text(cfg.phone_number_id);
        if (!phoneNumberId) return NextResponse.json({ ok: false, error: "Falta Phone Number ID" }, { status: 400 });
        const result = await probe(`https://graph.facebook.com/v19.0/${phoneNumberId}?fields=display_phone_number,verified_name&access_token=${encodeURIComponent(token)}`);
        return NextResponse.json(result.ok ? { ok: true, message: `WhatsApp conectado: ${result.body?.display_phone_number || result.body?.verified_name || phoneNumberId}` } : result);
      }
      const accountId = text(cfg.ad_account_id).replace(/^act_/, "");
      const url = accountId
        ? `https://graph.facebook.com/v19.0/act_${accountId}?fields=name,account_status,currency&access_token=${encodeURIComponent(token)}`
        : `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${encodeURIComponent(token)}`;
      const result = await probe(url);
      return NextResponse.json(result.ok ? { ok: true, message: `Meta conectado: ${result.body?.name || result.body?.id || "OK"}` } : result);
    }

    if (["google_ads", "google_business", "google_calendar", "gmail"].includes(provider)) {
      const token = text(cfg.access_token);
      if (!token) return NextResponse.json({ ok: false, error: "Falta OAuth access token de Google" }, { status: 400 });
      const result = await probe("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: `Bearer ${token}` } });
      return NextResponse.json(result.ok ? { ok: true, message: `Google conectado: ${result.body?.email || result.body?.name || "OK"}` } : result);
    }

    if (provider === "stripe") {
      const key = text(cfg.secret_key);
      if (!key.startsWith("sk_")) return NextResponse.json({ ok: false, error: "Secret key de Stripe no válida" }, { status: 400 });
      const result = await probe("https://api.stripe.com/v1/account", { headers: { Authorization: `Bearer ${key}` } });
      return NextResponse.json(result.ok ? { ok: true, message: `Stripe conectado: ${result.body?.business_profile?.name || result.body?.id || "OK"}` } : result);
    }

    if (provider === "openai") {
      const key = text(cfg.api_key);
      if (!key) return NextResponse.json({ ok: false, error: "Falta API key" }, { status: 400 });
      const result = await probe("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${key}` } });
      return NextResponse.json(result.ok ? { ok: true, message: "Proveedor IA validado" } : result);
    }

    if (provider === "email_smtp") {
      if (!text(cfg.smtp_host) || !text(cfg.from_email)) return NextResponse.json({ ok: false, error: "Faltan SMTP host y email emisor" }, { status: 400 });
      return NextResponse.json({ ok: true, message: "Datos SMTP guardados. La prueba de envío requiere backend SMTP dedicado." });
    }

    if (provider === "website_tracking") {
      const url = text(cfg.website_url);
      if (!/^https?:\/\//i.test(url)) return NextResponse.json({ ok: false, error: "Añade una URL válida con https://" }, { status: 400 });
      const response = await fetch(url, { method: "HEAD", cache: "no-store" }).catch(() => null);
      return NextResponse.json({ ok: !!response?.ok, message: response?.ok ? "Web accesible" : "No se pudo acceder a la web" });
    }

    return NextResponse.json({ ok: true, message: "Configuración guardada. Este proveedor no tiene prueba automática todavía." });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Error inesperado" }, { status: 500 });
  }
}
