export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1479231557294191";

type MetaEventName = "PageView" | "ViewContent" | "Lead" | "InitiateCheckout" | "Purchase";

type MetaEventOptions = {
  value?: number;
  currency?: string;
  email?: string;
  phone?: string;
  contentName?: string;
  contentCategory?: string;
  plan?: string;
};

type FbqFunction = (command: "track" | "trackCustom", eventName: string, parameters?: Record<string, unknown>, options?: Record<string, unknown>) => void;

declare global {
  interface Window {
    fbq?: FbqFunction;
  }
}

function createEventId(eventName: string) {
  const randomPart = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `flowly_${eventName}_${Date.now()}_${randomPart}`;
}

function buildPayload(options: MetaEventOptions = {}) {
  const payload: Record<string, unknown> = {};
  if (typeof options.value === "number") payload.value = Number(options.value.toFixed(2));
  if (options.currency) payload.currency = options.currency;
  if (options.contentName) payload.content_name = options.contentName;
  if (options.contentCategory) payload.content_category = options.contentCategory;
  if (options.plan) payload.plan = options.plan;
  return payload;
}

export async function trackMetaEvent(eventName: MetaEventName, options: MetaEventOptions = {}) {
  if (typeof window === "undefined") return;

  const eventId = createEventId(eventName);
  const customData = buildPayload(options);

  try {
    window.fbq?.("track", eventName, customData, { eventID: eventId });
  } catch (error) {
    console.warn("Meta Pixel browser event failed", error);
  }

  try {
    await fetch("/api/meta/conversion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl: window.location.href,
        ...options,
      }),
    });
  } catch (error) {
    console.warn("Meta Conversions API event failed", error);
  }
}
