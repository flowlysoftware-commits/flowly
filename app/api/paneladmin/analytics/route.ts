import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ADMIN_PASSWORD = "Nosotrostarot1.";
const funnelOrder = ["landing", "pricing", "signup", "onboarding", "checkout", "purchase", "dashboard"];

function isAuthorized(request: NextRequest) {
  return request.headers.get("x-paneladmin-password") === ADMIN_PASSWORD;
}

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function startOfDay() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function since(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!dbReady()) return NextResponse.json({ dbReady: false, summary: {}, funnel: [], abandonments: [], recentEvents: [], pages: [] });

  const today = startOfDay();
  const onlineSince = since(5);
  const last30Days = isoDaysAgo(30);

  const [online, eventsToday, visitorsToday, allEvents, sessions30, recentEvents] = await Promise.all([
    supabaseAdmin.from("flowly_analytics_sessions").select("session_id", { count: "exact", head: true }).gte("last_seen_at", onlineSince),
    supabaseAdmin.from("flowly_analytics_events").select("id", { count: "exact", head: true }).eq("event_name", "page_view").gte("created_at", today),
    supabaseAdmin.from("flowly_analytics_events").select("visitor_id").eq("event_name", "page_view").gte("created_at", today).limit(5000),
    supabaseAdmin.from("flowly_analytics_events").select("path, funnel_step, visitor_id, session_id, created_at").eq("event_name", "page_view").gte("created_at", last30Days).limit(10000),
    supabaseAdmin.from("flowly_analytics_sessions").select("session_id, last_path, last_funnel_step, last_seen_at").gte("last_seen_at", last30Days).limit(10000),
    supabaseAdmin.from("flowly_analytics_events").select("event_name, path, funnel_step, created_at, viewport, language").order("created_at", { ascending: false }).limit(25),
  ]);

  const pageViews = allEvents.data || [];
  const sessions = sessions30.data || [];
  const visitorSet = new Set((visitorsToday.data || []).map((row) => row.visitor_id).filter(Boolean));
  const allVisitorSet = new Set(pageViews.map((row) => row.visitor_id).filter(Boolean));
  const sessionSet = new Set(pageViews.map((row) => row.session_id).filter(Boolean));

  const funnel = funnelOrder.map((step, index) => {
    const sessionsInStep = new Set(pageViews.filter((row) => row.funnel_step === step).map((row) => row.session_id).filter(Boolean));
    const previousCount = index === 0 ? sessionsInStep.size : new Set(pageViews.filter((row) => row.funnel_step === funnelOrder[index - 1]).map((row) => row.session_id).filter(Boolean)).size;
    const dropRate = index === 0 || previousCount === 0 ? 0 : Math.max(0, Math.round(((previousCount - sessionsInStep.size) / previousCount) * 100));
    return { step, count: sessionsInStep.size, dropRate };
  });

  const abandonmentMap = new Map<string, number>();
  for (const session of sessions) {
    const key = session.last_path || "/";
    abandonmentMap.set(key, (abandonmentMap.get(key) || 0) + 1);
  }
  const abandonments = Array.from(abandonmentMap.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const pageMap = new Map<string, number>();
  for (const event of pageViews) {
    pageMap.set(event.path, (pageMap.get(event.path) || 0) + 1);
  }
  const pages = Array.from(pageMap.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const checkoutSessions = new Set(pageViews.filter((row) => row.funnel_step === "checkout").map((row) => row.session_id).filter(Boolean));
  const purchaseSessions = new Set(pageViews.filter((row) => row.funnel_step === "purchase").map((row) => row.session_id).filter(Boolean));

  const summary = {
    onlineNow: online.count || 0,
    visitsToday: eventsToday.count || 0,
    visitorsToday: visitorSet.size,
    visitors30Days: allVisitorSet.size,
    sessions30Days: sessionSet.size,
    reachedCheckout: checkoutSessions.size,
    completedPurchase: purchaseSessions.size,
    checkoutConversion: checkoutSessions.size ? Math.round((purchaseSessions.size / checkoutSessions.size) * 100) : 0,
  };

  const recommendations = [];
  const biggestDrop = funnel.slice(1).sort((a, b) => b.dropRate - a.dropRate)[0];
  if (biggestDrop?.dropRate > 25) recommendations.push(`La mayor fuga está antes de ${biggestDrop.step}: abandono aproximado del ${biggestDrop.dropRate}%.`);
  if ((summary.reachedCheckout || 0) > 0 && summary.checkoutConversion < 40) recommendations.push("Hay usuarios llegando al carrito/checkout, pero la conversión es baja. Revisa precio, confianza y pasos de pago.");
  if (!recommendations.length) recommendations.push("Todavía faltan datos para una recomendación sólida. Deja el tracking activo unas horas.");

  return NextResponse.json({
    dbReady: true,
    generatedAt: new Date().toISOString(),
    summary,
    funnel,
    abandonments,
    pages,
    recentEvents: recentEvents.data || [],
    recommendations,
  });
}
