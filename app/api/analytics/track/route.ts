import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const EVENT_NAMES = new Set([
  "page_load",
  "page_view",
  "heartbeat",
  "page_leave",
  "cta_click",
  "scroll_depth",
  "checkout_started",
  "checkout_completed",
  "signup_started",
  "signup_completed",
  "demo_intent",
  "pricing_intent",
  "section_view",
  "ad_click_landing",
]);
const MAX_TEXT = 500;

function dbReady() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function cleanText(value: unknown, fallback = "") {
  return String(value ?? fallback).slice(0, MAX_TEXT);
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    null
  );
}

function cleanMetadata(body: Record<string, unknown>) {
  return {
    ...body,
    title: cleanText(body.title || body.page_title),
    label: cleanText(body.label),
    href: cleanText(body.href),
  };
}

function inferFunnelStep(path: string, fullPath = path) {
  const cleanPath = `${path} ${fullPath}`.toLowerCase();
  if (path === "/" || path === "") return "landing";
  if (
    cleanPath.includes("precios") ||
    cleanPath.includes("pricing") ||
    cleanPath.includes("#precios")
  )
    return "pricing";
  if (
    cleanPath.includes("registro") ||
    cleanPath.includes("/registro") ||
    cleanPath.includes("signup") ||
    cleanPath.includes("register")
  )
    return "signup";
  if (cleanPath.includes("login")) return "login";
  if (cleanPath.includes("onboarding")) return "onboarding";
  if (
    cleanPath.includes("checkout") ||
    cleanPath.includes("carrito") ||
    cleanPath.includes("stripe")
  )
    return "checkout";
  if (cleanPath.includes("dashboard")) return "dashboard";
  if (
    cleanPath.includes("bienvenido") ||
    cleanPath.includes("gracias") ||
    cleanPath.includes("success") ||
    cleanPath.includes("completed")
  )
    return "purchase";
  return "other";
}

async function storeAnalyticsEvent(
  request: NextRequest,
  body: Record<string, unknown>,
) {
  if (!dbReady()) return { ok: true, stored: false };

  const eventName = cleanText(body.eventName || body.event_name, "page_view");
  if (!EVENT_NAMES.has(eventName)) {
    return { ok: false, error: "Evento no permitido", status: 400 };
  }

  const sessionId = cleanText(body.sessionId || body.session_id);
  const visitorId = cleanText(body.visitorId || body.visitor_id);
  const path = cleanText(body.path, "/");
  const fullPath = cleanText(body.fullPath || body.full_path, path);
  const now = new Date().toISOString();

  if (!sessionId || !visitorId) {
    return { ok: false, error: "Falta sesión", status: 400 };
  }

  const eventPayload = {
    event_name: eventName,
    visitor_id: visitorId,
    session_id: sessionId,
    path,
    full_path: fullPath,
    funnel_step: cleanText(
      body.funnelStep || body.funnel_step,
      inferFunnelStep(path, fullPath),
    ),
    page_title: cleanText(body.title || body.page_title),
    referrer: body.referrer ? cleanText(body.referrer) : null,
    viewport: cleanText(body.viewport),
    language: cleanText(body.language),
    timezone: cleanText(body.timezone),
    duration_ms: Number(body.durationMs || body.duration_ms || 0) || null,
    user_agent: cleanText(request.headers.get("user-agent")),
    ip_address: getClientIp(request),
    metadata: cleanMetadata(body),
  };

  const { error } = await supabaseAdmin
    .from("flowly_analytics_events")
    .insert(eventPayload);
  if (error) return { ok: false, error: error.message, status: 500 };

  const { data: existingSession } = await supabaseAdmin
    .from("flowly_analytics_sessions")
    .select("session_id, first_path, created_at")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existingSession?.session_id) {
    await supabaseAdmin
      .from("flowly_analytics_sessions")
      .update({
        last_path: path,
        last_funnel_step: eventPayload.funnel_step,
        last_seen_at: now,
        viewport: eventPayload.viewport,
        language: eventPayload.language,
        timezone: eventPayload.timezone,
      })
      .eq("session_id", sessionId);
  } else {
    await supabaseAdmin.from("flowly_analytics_sessions").insert({
      session_id: sessionId,
      visitor_id: visitorId,
      first_path: path,
      last_path: path,
      last_funnel_step: eventPayload.funnel_step,
      last_seen_at: now,
      user_agent: eventPayload.user_agent,
      ip_address: eventPayload.ip_address,
      referrer: eventPayload.referrer,
      viewport: eventPayload.viewport,
      language: eventPayload.language,
      timezone: eventPayload.timezone,
    });
  }

  return { ok: true, stored: true };
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payload inválido" },
      { status: 400 },
    );
  }

  const result = await storeAnalyticsEvent(request, body);
  if (!result.ok)
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.status || 500 },
    );

  return NextResponse.json(result);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const body: Record<string, unknown> = {
    eventName: params.get("event") || "page_load",
    visitorId: params.get("visitorId") || params.get("visitor_id"),
    sessionId: params.get("sessionId") || params.get("session_id"),
    path: params.get("path") || "/",
    fullPath: params.get("fullPath") || params.get("full_path") || "/",
    funnelStep: params.get("funnelStep") || params.get("funnel_step") || undefined,
    referrer: params.get("referrer"),
    viewport: params.get("viewport"),
    language: params.get("language"),
    timezone: params.get("timezone"),
    attribution: {
      gclid: params.get("gclid"),
      fbclid: params.get("fbclid"),
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_content: params.get("utm_content"),
      utm_term: params.get("utm_term"),
    },
  };

  const result = await storeAnalyticsEvent(request, body);
  const pixel = Buffer.from(
    "R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
    "base64",
  );

  return new NextResponse(pixel, {
    status: result.ok ? 200 : result.status || 204,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}
