import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ADMIN_PASSWORD = "Nosotrostarot1.";
const funnelOrder = [
  "landing",
  "pricing",
  "signup",
  "onboarding",
  "checkout",
  "purchase",
  "dashboard",
];

function isAuthorized(request: NextRequest) {
  return request.headers.get("x-paneladmin-password") === ADMIN_PASSWORD;
}

function dbReady() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
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

type EventRow = {
  event_name: string;
  path: string;
  full_path?: string | null;
  funnel_step: string;
  visitor_id: string | null;
  session_id: string | null;
  created_at: string;
  duration_ms?: number | null;
  viewport?: string | null;
  language?: string | null;
  metadata?: Record<string, unknown> | null;
};

function uniqueSessions(
  events: EventRow[],
  predicate: (row: EventRow) => boolean,
) {
  return new Set(
    events
      .filter(predicate)
      .map((row) => row.session_id)
      .filter(Boolean),
  ).size;
}

function uniqueVisitors(
  events: EventRow[],
  predicate: (row: EventRow) => boolean,
) {
  return new Set(
    events
      .filter(predicate)
      .map((row) => row.visitor_id)
      .filter(Boolean),
  ).size;
}

function readAttribution(row: EventRow) {
  const metadata = row.metadata || {};
  const attribution = (metadata.attribution || {}) as Record<string, unknown>;
  const urlData = (() => {
    try {
      const url = new URL(
        row.full_path || row.path || "/",
        "https://flowly.local",
      );
      return {
        gclid: url.searchParams.get("gclid") || "",
        fbclid: url.searchParams.get("fbclid") || "",
        utm_source: url.searchParams.get("utm_source") || "",
        utm_medium: url.searchParams.get("utm_medium") || "",
        utm_campaign: url.searchParams.get("utm_campaign") || "",
      };
    } catch {
      return {
        gclid: "",
        fbclid: "",
        utm_source: "",
        utm_medium: "",
        utm_campaign: "",
      };
    }
  })();

  const gclid = String(
    attribution.gclid || metadata.gclid || urlData.gclid || "",
  );
  const fbclid = String(
    attribution.fbclid || metadata.fbclid || urlData.fbclid || "",
  );
  const utmSource = String(
    attribution.utm_source || metadata.utm_source || urlData.utm_source || "",
  );
  const utmMedium = String(
    attribution.utm_medium || metadata.utm_medium || urlData.utm_medium || "",
  );
  const source = String(
    utmSource || (gclid ? "google_ads" : fbclid ? "meta_ads" : "directo"),
  );
  const campaign = String(
    attribution.utm_campaign ||
      metadata.utm_campaign ||
      urlData.utm_campaign ||
      (gclid ? "gclid detectado" : fbclid ? "fbclid detectado" : "sin campaña"),
  );
  const referrer = String(
    metadata.referrer || (attribution.referrer as string | undefined) || "",
  );
  const fullPath = `${row.full_path || ""} ${row.path || ""}`;
  return { source, campaign, gclid, fbclid, utmMedium, referrer, fullPath };
}

function hasGoogleAdsClick(row: EventRow) {
  const { source, gclid, utmMedium, referrer, fullPath } = readAttribution(row);
  const text = `${source} ${utmMedium} ${referrer} ${fullPath}`.toLowerCase();
  return Boolean(
    gclid ||
    text.includes("gclid=") ||
    text.includes("utm_source=google") ||
    text.includes("google_ads") ||
    text.includes("googleads") ||
    text.includes("googleadservices") ||
    text.includes("doubleclick") ||
    (text.includes("google") &&
      (text.includes("cpc") || text.includes("paid") || text.includes("ads"))),
  );
}

function hasPaidClick(row: EventRow) {
  const { source, gclid, fbclid, utmMedium, referrer, fullPath } =
    readAttribution(row);
  const text = `${source} ${utmMedium} ${referrer} ${fullPath}`.toLowerCase();
  return Boolean(
    gclid ||
    fbclid ||
    text.includes("gclid=") ||
    text.includes("fbclid=") ||
    text.includes("cpc") ||
    text.includes("paid") ||
    text.includes("ads") ||
    text.includes("googleadservices") ||
    text.includes("doubleclick") ||
    text.includes("facebook") ||
    text.includes("instagram") ||
    text.includes("meta"),
  );
}

function readManualGoogleClicks(request: NextRequest) {
  const fromHeader = Number(
    request.headers.get("x-google-ads-reported-clicks") || 0,
  );
  const fromEnv = Number(process.env.GOOGLE_ADS_REPORTED_CLICKS || 0);
  const value =
    Number.isFinite(fromHeader) && fromHeader > 0 ? fromHeader : fromEnv;
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}

function isPageLandingEvent(row: EventRow) {
  return row.event_name === "page_view" || row.event_name === "page_load";
}

function uniqueSessionPathCount(events: EventRow[]) {
  return new Set(
    events
      .map((row) => `${row.session_id || row.visitor_id || "anon"}::${row.path}`)
      .filter(Boolean),
  ).size;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!dbReady())
    return NextResponse.json({
      dbReady: false,
      summary: {},
      funnel: [],
      abandonments: [],
      recentEvents: [],
      pages: [],
    });

  const today = startOfDay();
  const googleAdsReportedClicks = readManualGoogleClicks(request);
  const onlineSince = since(5);
  const last30Days = isoDaysAgo(30);

  const [
    online,
    eventsToday,
    visitorsToday,
    allEvents,
    sessions30,
    recentEvents,
  ] = await Promise.all([
    supabaseAdmin
      .from("flowly_analytics_sessions")
      .select("session_id", { count: "exact", head: true })
      .gte("last_seen_at", onlineSince),
    supabaseAdmin
      .from("flowly_analytics_events")
      .select("id", { count: "exact", head: true })
      .gte("created_at", today),
    supabaseAdmin
      .from("flowly_analytics_events")
      .select("visitor_id")
      .eq("event_name", "page_view")
      .gte("created_at", today)
      .limit(5000),
    supabaseAdmin
      .from("flowly_analytics_events")
      .select(
        "event_name, path, full_path, funnel_step, visitor_id, session_id, created_at, duration_ms, viewport, language, metadata",
      )
      .gte("created_at", last30Days)
      .limit(20000),
    supabaseAdmin
      .from("flowly_analytics_sessions")
      .select("session_id, last_path, last_funnel_step, last_seen_at")
      .gte("last_seen_at", last30Days)
      .limit(10000),
    supabaseAdmin
      .from("flowly_analytics_events")
      .select(
        "event_name, path, funnel_step, created_at, viewport, language, metadata",
      )
      .order("created_at", { ascending: false })
      .limit(35),
  ]);

  const events = (allEvents.data || []) as EventRow[];
  const pageViews = events.filter(isPageLandingEvent);
  const pageViewEventsToday = pageViews.filter((row) => row.created_at >= today);
  const sessions = sessions30.data || [];
  const visitorSet = new Set(
    pageViewEventsToday.map((row) => row.visitor_id).filter(Boolean),
  );
  const allVisitorSet = new Set(
    pageViews.map((row) => row.visitor_id).filter(Boolean),
  );
  const sessionSet = new Set(
    pageViews.map((row) => row.session_id).filter(Boolean),
  );

  const funnel = funnelOrder.map((step, index) => {
    const count = uniqueSessions(
      events,
      (row) =>
        row.funnel_step === step ||
        (step === "pricing" &&
          row.event_name === "cta_click" &&
          String(row.metadata?.href || "").includes("precios")),
    );
    const previousCount =
      index === 0
        ? count
        : uniqueSessions(
            events,
            (row) => row.funnel_step === funnelOrder[index - 1],
          );
    const dropRate =
      index === 0 || previousCount === 0
        ? 0
        : Math.max(
            0,
            Math.round(((previousCount - count) / previousCount) * 100),
          );
    return { step, count, dropRate };
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

  const campaignMap = new Map<
    string,
    {
      source: string;
      campaign: string;
      sessions: Set<string>;
      ctaClicks: number;
      signupStarts: number;
    }
  >();
  for (const event of events) {
    const { source, campaign } = readAttribution(event);
    const key = `${source} · ${campaign}`;
    const row = campaignMap.get(key) || {
      source,
      campaign,
      sessions: new Set<string>(),
      ctaClicks: 0,
      signupStarts: 0,
    };
    if (event.session_id) row.sessions.add(event.session_id);
    if (event.event_name === "cta_click") row.ctaClicks += 1;
    if (event.event_name === "signup_started") row.signupStarts += 1;
    campaignMap.set(key, row);
  }

  const campaigns = Array.from(campaignMap.values())
    .map((row) => ({
      source: row.source,
      campaign: row.campaign,
      sessions: row.sessions.size,
      ctaClicks: row.ctaClicks,
      signupStarts: row.signupStarts,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 8);

  const ctaMap = new Map<string, number>();
  for (const event of events.filter((row) => row.event_name === "cta_click")) {
    const label = String(
      event.metadata?.label || event.metadata?.href || "CTA sin etiqueta",
    );
    ctaMap.set(label, (ctaMap.get(label) || 0) + 1);
  }
  const ctas = Array.from(ctaMap.entries())
    .map(([label, clicks]) => ({ label, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  const checkoutSessions = uniqueSessions(
    events,
    (row) =>
      row.funnel_step === "checkout" || row.event_name === "checkout_started",
  );
  const purchaseSessions = uniqueSessions(
    events,
    (row) =>
      row.funnel_step === "purchase" || row.event_name === "checkout_completed",
  );
  const landingSessions = uniqueSessions(
    events,
    (row) => row.funnel_step === "landing",
  );
  const pricingSessions = uniqueSessions(
    events,
    (row) => row.funnel_step === "pricing",
  );
  const signupStartedSessions = uniqueSessions(
    events,
    (row) =>
      row.event_name === "signup_started" || row.funnel_step === "signup",
  );
  const ctaClickSessions = uniqueSessions(
    events,
    (row) => row.event_name === "cta_click",
  );
  const scroll75Sessions = uniqueSessions(
    events,
    (row) =>
      row.event_name === "scroll_depth" &&
      Number(row.metadata?.depth || 0) >= 75,
  );
  const googleLandingEvents = events.filter(
    (row) =>
      row.event_name === "ad_click_landing" ||
      (row.event_name === "page_view" && hasGoogleAdsClick(row)),
  );
  const googleAdsClickEvents = googleLandingEvents.length;
  const googleAdsClickEventsToday = googleLandingEvents.filter(
    (row) => row.created_at >= today,
  ).length;
  const googleAdsClickSessions = uniqueSessions(
    googleLandingEvents,
    () => true,
  );
  const paidClickSessions = uniqueSessions(events, hasPaidClick);

  const summary = {
    onlineNow: online.count || 0,
    eventsToday: eventsToday.count || 0,
    visitsToday: uniqueSessions(pageViewEventsToday, () => true),
    pageViewsTodayRaw: pageViewEventsToday.length,
    trackedLandingSessions: uniqueSessions(pageViews, () => true),
    trackedPageLoads: pageViews.length,
    uniqueSessionPages30Days: uniqueSessionPathCount(pageViews),
    visitorsToday: visitorSet.size,
    visitors30Days: allVisitorSet.size,
    sessions30Days: sessionSet.size,
    landingSessions,
    pricingSessions,
    ctaClickSessions,
    signupStartedSessions,
    scroll75Sessions,
    googleAdsClickEvents,
    googleAdsClickEventsToday,
    googleAdsClickSessions,
    paidClickSessions,
    googleAdsReportedClicks,
    googleAdsMissingClicks: googleAdsReportedClicks
      ? Math.max(0, googleAdsReportedClicks - googleAdsClickEvents)
      : 0,
    googleAdsTrackingRate: googleAdsReportedClicks
      ? Math.round((googleAdsClickEvents / googleAdsReportedClicks) * 100)
      : 0,
    websiteTrackingRate: googleAdsReportedClicks
      ? Math.round((uniqueSessions(pageViews, () => true) / googleAdsReportedClicks) * 100)
      : 0,
    websiteMissingVisits: googleAdsReportedClicks
      ? Math.max(0, googleAdsReportedClicks - uniqueSessions(pageViews, () => true))
      : 0,
    reachedCheckout: checkoutSessions,
    completedPurchase: purchaseSessions,
    pricingRate: landingSessions
      ? Math.round((pricingSessions / landingSessions) * 100)
      : 0,
    ctaRate: landingSessions
      ? Math.round((ctaClickSessions / landingSessions) * 100)
      : 0,
    signupRate: landingSessions
      ? Math.round((signupStartedSessions / landingSessions) * 100)
      : 0,
    checkoutConversion: checkoutSessions
      ? Math.round((purchaseSessions / checkoutSessions) * 100)
      : 0,
  };

  const recommendations = [];
  if (summary.landingSessions >= 20 && summary.ctaRate < 8) {
    recommendations.push(
      `Problema principal: mucha gente llega a la landing, pero solo el ${summary.ctaRate}% hace clic. Hay que mejorar promesa, CTA y confianza arriba del todo.`,
    );
  }
  if (summary.landingSessions >= 20 && summary.pricingRate < 10) {
    recommendations.push(
      `Solo el ${summary.pricingRate}% avanza a precios. La publicidad está trayendo visitas, pero la home no está empujando suficiente al siguiente paso.`,
    );
  }
  if (summary.ctaClickSessions > 0 && summary.signupStartedSessions === 0) {
    recommendations.push(
      "Hay clics en CTA, pero no empieza el registro. Revisa que el botón lleve a la ruta correcta y que el formulario cargue bien en móvil.",
    );
  }
  if ((summary.reachedCheckout || 0) > 0 && summary.checkoutConversion < 40) {
    recommendations.push(
      "Hay usuarios llegando al carrito/checkout, pero la conversión es baja. Revisa precio, confianza y pasos de pago.",
    );
  }
  if (
    summary.googleAdsReportedClicks &&
    summary.trackedLandingSessions < summary.googleAdsReportedClicks * 0.2
  ) {
    recommendations.unshift(
      `Google Ads informa ${summary.googleAdsReportedClicks} clics y Flowly solo registra ${summary.trackedLandingSessions} sesiones web. Esto ya no depende solo del gclid: se ha añadido un pixel temprano page_load antes de React para contar aterrizajes aunque el usuario rebote rápido. Revisa que el anuncio apunte al dominio correcto y que la URL final no pase por redirecciones que bloqueen la carga.`,
    );
  } else if (
    summary.googleAdsReportedClicks &&
    summary.googleAdsClickEvents < summary.googleAdsReportedClicks * 0.2
  ) {
    recommendations.unshift(
      `La web está recibiendo sesiones, pero solo ${summary.googleAdsClickEvents} aparecen atribuibles a Google Ads. Revisa autoetiquetado gclid y UTMs; las visitas sin gclid se cuentan como web, pero no se pueden atribuir a campaña.`,
    );
  } else if (summary.trackedLandingSessions === 0) {
    recommendations.push(
      "Si Google Ads muestra clics pero aquí no aparecen visitas, revisa que el anuncio apunte a esta web y que /api/analytics/track no esté bloqueado. Desde ahora Flowly usa page_load temprano + sendBeacon para contar mejor.",
    );
  }
  if (!recommendations.length)
    recommendations.push(
      "Todavía faltan datos para una recomendación sólida. Deja el tracking activo unas horas y revisa CTA, scroll y campañas.",
    );

  return NextResponse.json({
    dbReady: true,
    generatedAt: new Date().toISOString(),
    summary,
    funnel,
    abandonments,
    pages,
    campaigns,
    ctas,
    recentEvents: recentEvents.data || [],
    recommendations,
  });
}
