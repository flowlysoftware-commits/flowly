"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "flowly_analytics_session_id";
const VISITOR_KEY = "flowly_analytics_visitor_id";

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function readOrCreateStorageId(key: string, prefix: string) {
  try {
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const next = createId(prefix);
    window.localStorage.setItem(key, next);
    return next;
  } catch {
    return createId(prefix);
  }
}

function inferFunnelStep(path: string) {
  const cleanPath = path.toLowerCase();
  if (cleanPath === "/" || cleanPath === "") return "landing";
  if (cleanPath.includes("precios") || cleanPath.includes("pricing")) return "pricing";
  if (cleanPath.includes("registro") || cleanPath.includes("signup")) return "signup";
  if (cleanPath.includes("login")) return "login";
  if (cleanPath.includes("onboarding")) return "onboarding";
  if (cleanPath.includes("checkout") || cleanPath.includes("carrito") || cleanPath.includes("stripe")) return "checkout";
  if (cleanPath.includes("dashboard")) return "dashboard";
  if (cleanPath.includes("gracias") || cleanPath.includes("success") || cleanPath.includes("completed")) return "purchase";
  return "other";
}

function shouldSkipTracking(path: string) {
  return path.startsWith("/paneladmin") || path.startsWith("/contabilidad") || path.startsWith("/api");
}

export default function FlowlyAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || shouldSkipTracking(pathname)) return;

    const visitorId = readOrCreateStorageId(VISITOR_KEY, "visitor");
    const sessionId = readOrCreateStorageId(SESSION_KEY, "session");
    const fullPath = `${pathname}${window.location.search || ""}`;
    const startedAt = Date.now();

    async function send(eventName: string, extra?: Record<string, unknown>) {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventName,
            visitorId,
            sessionId,
            path: pathname,
            fullPath,
            funnelStep: inferFunnelStep(pathname),
            title: document.title,
            referrer: document.referrer || null,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            ...extra,
          }),
        });
      } catch {
        // Analytics should never block the app.
      }
    }

    send("page_view");

    const heartbeat = window.setInterval(() => {
      send("heartbeat", { durationMs: Date.now() - startedAt });
    }, 30000);

    return () => {
      window.clearInterval(heartbeat);
      send("page_leave", { durationMs: Date.now() - startedAt });
    };
  }, [pathname]);

  return null;
}
