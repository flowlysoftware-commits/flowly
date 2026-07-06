"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "flowly_analytics_session_id";
const VISITOR_KEY = "flowly_analytics_visitor_id";
const SESSION_STARTED_KEY = "flowly_analytics_session_started_at";
const SCROLL_DEPTHS = [25, 50, 75, 100];

type AnalyticsExtra = Record<string, unknown>;

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function readOrCreateVisitorId() {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const next = createId("visitor");
    window.localStorage.setItem(VISITOR_KEY, next);
    return next;
  } catch {
    return createId("visitor");
  }
}

function readOrCreateSessionId() {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    const startedAt = Number(
      window.sessionStorage.getItem(SESSION_STARTED_KEY) || 0,
    );
    const isFresh = startedAt && Date.now() - startedAt < 30 * 60 * 1000;
    if (existing && isFresh) {
      window.sessionStorage.setItem(SESSION_STARTED_KEY, String(Date.now()));
      return existing;
    }
    const next = createId("session");
    window.sessionStorage.setItem(SESSION_KEY, next);
    window.sessionStorage.setItem(SESSION_STARTED_KEY, String(Date.now()));
    return next;
  } catch {
    return createId("session");
  }
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
  if (cleanPath.includes("registro") || cleanPath.includes("signup"))
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

function shouldSkipTracking(path: string) {
  return (
    path.startsWith("/paneladmin") ||
    path.startsWith("/contabilidad") ||
    path.startsWith("/api")
  );
}

function getAttribution() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term"),
    fbclid: params.get("fbclid"),
    gclid: params.get("gclid"),
  };
}

function isGoogleAdsAttribution(
  attribution: ReturnType<typeof getAttribution>,
) {
  const source = String(attribution.utm_source || "").toLowerCase();
  const medium = String(attribution.utm_medium || "").toLowerCase();
  const campaign = String(attribution.utm_campaign || "").toLowerCase();
  const referrer = document.referrer.toLowerCase();

  return Boolean(
    attribution.gclid ||
    source.includes("google") ||
    medium.includes("cpc") ||
    medium.includes("paid") ||
    campaign.includes("google") ||
    referrer.includes("googleadservices") ||
    referrer.includes("doubleclick"),
  );
}

function getElementLabel(element: Element | null) {
  if (!element) return "sin etiqueta";
  return (
    element.getAttribute("data-track-label") ||
    element.getAttribute("aria-label") ||
    element.textContent?.trim().replace(/\s+/g, " ").slice(0, 120) ||
    element.getAttribute("href") ||
    "sin etiqueta"
  );
}

export default function FlowlyAnalyticsTracker() {
  const pathname = usePathname();
  const sentScrollDepthsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!pathname || shouldSkipTracking(pathname)) return;

    sentScrollDepthsRef.current = new Set();

    const visitorId = readOrCreateVisitorId();
    const sessionId = readOrCreateSessionId();
    const fullPath = `${pathname}${window.location.search || ""}${window.location.hash || ""}`;
    const startedAt = Date.now();
    const attribution = getAttribution();

    async function send(eventName: string, extra?: AnalyticsExtra) {
      try {
        const nextFullPath = `${window.location.pathname}${window.location.search || ""}${window.location.hash || ""}`;
        await fetch("/api/analytics/track", {
          method: "POST",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventName,
            visitorId,
            sessionId,
            path: window.location.pathname || pathname,
            fullPath: nextFullPath || fullPath,
            funnelStep: inferFunnelStep(
              window.location.pathname || pathname,
              nextFullPath || fullPath,
            ),
            title: document.title,
            referrer: document.referrer || null,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            attribution,
            ...extra,
          }),
        });
      } catch {
        // Analytics should never block the app.
      }
    }

    send("page_view");

    const adClickKey = `flowly_ad_click_landing_${sessionId}`;
    try {
      if (
        isGoogleAdsAttribution(attribution) &&
        !window.sessionStorage.getItem(adClickKey)
      ) {
        window.sessionStorage.setItem(adClickKey, "1");
        send("ad_click_landing", {
          provider: "google_ads",
          gclid: attribution.gclid,
          utm_source: attribution.utm_source,
          utm_medium: attribution.utm_medium,
          utm_campaign: attribution.utm_campaign,
          referrer: document.referrer || null,
          durationMs: Date.now() - startedAt,
        });
      }
    } catch {
      // Ad-click diagnostics should never block analytics.
    }

    const handleClick = (event: MouseEvent) => {
      const target =
        event.target instanceof Element
          ? event.target.closest("a,button,[data-track-label]")
          : null;
      if (!target) return;

      const href =
        target instanceof HTMLAnchorElement
          ? target.getAttribute("href")
          : null;
      const label = getElementLabel(target);
      const isCheckout = Boolean(
        href?.includes("checkout") ||
        href?.includes("stripe") ||
        label.toLowerCase().includes("checkout") ||
        label.toLowerCase().includes("carrito"),
      );
      const isDemo = Boolean(
        href?.includes("demo") || label.toLowerCase().includes("demo"),
      );
      const isSignup = Boolean(
        href?.includes("registro") ||
        href?.includes("signup") ||
        label.toLowerCase().includes("empezar") ||
        label.toLowerCase().includes("prueba") ||
        label.toLowerCase().includes("gratis"),
      );
      const isPricing = Boolean(
        href?.includes("precios") ||
        href?.includes("pricing") ||
        label.toLowerCase().includes("plan") ||
        label.toLowerCase().includes("precio"),
      );

      send("cta_click", {
        label,
        href,
        targetTag: target.tagName.toLowerCase(),
        durationMs: Date.now() - startedAt,
        funnelStep: isCheckout
          ? "checkout"
          : isSignup
            ? "signup"
            : isPricing
              ? "pricing"
              : inferFunnelStep(window.location.pathname),
      });

      if (isCheckout)
        send("checkout_started", {
          label,
          href,
          durationMs: Date.now() - startedAt,
          funnelStep: "checkout",
        });
      if (isSignup)
        send("signup_started", {
          label,
          href,
          durationMs: Date.now() - startedAt,
          funnelStep: "signup",
        });
      if (isDemo)
        send("demo_intent", {
          label,
          href,
          durationMs: Date.now() - startedAt,
          funnelStep: "signup",
        });
      if (isPricing)
        send("pricing_intent", {
          label,
          href,
          durationMs: Date.now() - startedAt,
          funnelStep: "pricing",
        });
    };

    const handleScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      if (height <= 0) return;
      const percent = Math.min(
        100,
        Math.round((window.scrollY / height) * 100),
      );
      const nextDepth = SCROLL_DEPTHS.find(
        (depth) => percent >= depth && !sentScrollDepthsRef.current.has(depth),
      );
      if (!nextDepth) return;
      sentScrollDepthsRef.current.add(nextDepth);
      send("scroll_depth", {
        depth: nextDepth,
        durationMs: Date.now() - startedAt,
      });
    };

    const sectionObserver =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                const element = entry.target as HTMLElement;
                const section = element.dataset.analyticsSection || element.id;
                if (!section) continue;
                send("section_view", {
                  section,
                  durationMs: Date.now() - startedAt,
                });
                sectionObserver?.unobserve(element);
              }
            },
            { threshold: 0.45 },
          )
        : null;

    document
      .querySelectorAll<HTMLElement>("[data-analytics-section]")
      .forEach((element) => sectionObserver?.observe(element));

    document.addEventListener("click", handleClick, true);
    window.addEventListener("scroll", handleScroll, { passive: true });

    const heartbeat = window.setInterval(() => {
      send("heartbeat", { durationMs: Date.now() - startedAt });
    }, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        send("page_leave", { durationMs: Date.now() - startedAt });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(heartbeat);
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibility);
      sectionObserver?.disconnect();
      send("page_leave", { durationMs: Date.now() - startedAt });
    };
  }, [pathname]);

  return null;
}
