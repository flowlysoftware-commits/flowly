import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const EVENT_NAMES = new Set([
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
]);
const MAX_TEXT = 500;

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
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
    // Nunca guardamos textos enormes por accidente.
    title: cleanText(body.title || body.page_title),
    label: cleanText(body.label),
    href: cleanText(body.href),
  };
}

export async function POST(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ ok: true, stored: false });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Payload inválido" }, { status: 400 });
  }

  const eventName = cleanText(body.eventName || body.event_name, "page_view");
  if (!EVENT_NAMES.has(eventName)) return NextResponse.json({ ok: false, error: "Evento no permitido" }, { status: 400 });

  const sessionId = cleanText(body.sessionId || body.session_id);
  const visitorId = cleanText(body.visitorId || body.visitor_id);
  const path = cleanText(body.path, "/");
  const now = new Date().toISOString();

  if (!sessionId || !visitorId) return NextResponse.json({ ok: false, error: "Falta sesión" }, { status: 400 });

  const eventPayload = {
    event_name: eventName,
    visitor_id: visitorId,
    session_id: sessionId,
    path,
    full_path: cleanText(body.fullPath || body.full_path, path),
    funnel_step: cleanText(body.funnelStep || body.funnel_step, "other"),
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

  const { error } = await supabaseAdmin.from("flowly_analytics_events").insert(eventPayload);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

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

  return NextResponse.json({ ok: true, stored: true });
}
