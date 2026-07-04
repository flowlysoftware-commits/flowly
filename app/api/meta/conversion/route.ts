import { NextResponse } from "next/server";
import crypto from "crypto";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1479231557294191";
const META_ACCESS_TOKEN = process.env.META_CONVERSIONS_API_TOKEN || process.env.META_ACCESS_TOKEN || "";
const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || "";
const META_API_VERSION = process.env.META_API_VERSION || "v21.0";

type MetaEventName = "PageView" | "ViewContent" | "Lead" | "InitiateCheckout" | "Purchase";

type MetaEventPayload = {
  eventName?: MetaEventName;
  eventId?: string;
  eventSourceUrl?: string;
  value?: number;
  currency?: string;
  email?: string;
  phone?: string;
  contentName?: string;
  contentCategory?: string;
  plan?: string;
};

function parseCookies(cookieHeader: string | null) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const [rawName, ...rawValue] = cookie.trim().split("=");
    if (!rawName) return;
    cookies[rawName] = decodeURIComponent(rawValue.join("="));
  });
  return cookies;
}

function normalize(value?: string) {
  return value?.trim().toLowerCase() || "";
}

function hash(value?: string) {
  const normalized = normalize(value);
  if (!normalized) return undefined;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function getIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined;
}

export async function POST(request: Request) {
  if (!META_ACCESS_TOKEN) {
    return NextResponse.json({ skipped: true, reason: "META_CONVERSIONS_API_TOKEN no configurado" });
  }

  let body: MetaEventPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  if (!body.eventName || !body.eventId) {
    return NextResponse.json({ error: "Faltan eventName o eventId" }, { status: 400 });
  }

  const cookies = parseCookies(request.headers.get("cookie"));
  const customData: Record<string, unknown> = {};
  if (typeof body.value === "number") customData.value = Number(body.value.toFixed(2));
  if (body.currency) customData.currency = body.currency;
  if (body.contentName) customData.content_name = body.contentName;
  if (body.contentCategory) customData.content_category = body.contentCategory;
  if (body.plan) customData.plan = body.plan;

  const userData: Record<string, unknown> = {
    client_user_agent: request.headers.get("user-agent") || undefined,
    client_ip_address: getIp(request),
    fbp: cookies._fbp,
    fbc: cookies._fbc,
    em: hash(body.email),
    ph: hash(body.phone),
  };

  Object.keys(userData).forEach((key) => userData[key] === undefined && delete userData[key]);

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: body.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: body.eventId,
        action_source: "website",
        event_source_url: body.eventSourceUrl || request.headers.get("referer") || undefined,
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  if (META_TEST_EVENT_CODE) payload.test_event_code = META_TEST_EVENT_CODE;

  const response = await fetch(`https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("Meta Conversions API error", result);
    return NextResponse.json({ error: "Error enviando evento a Meta", details: result }, { status: 502 });
  }

  return NextResponse.json({ ok: true, result });
}
