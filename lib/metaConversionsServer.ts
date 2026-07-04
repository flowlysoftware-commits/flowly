import crypto from "crypto";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1479231557294191";
const META_ACCESS_TOKEN = process.env.META_CONVERSIONS_API_TOKEN || process.env.META_ACCESS_TOKEN || "";
const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || "";
const META_API_VERSION = process.env.META_API_VERSION || "v21.0";

type ServerMetaEvent = {
  eventName: "Purchase" | "Lead" | "InitiateCheckout" | "ViewContent" | "PageView";
  eventId: string;
  eventSourceUrl?: string;
  email?: string;
  phone?: string;
  value?: number;
  currency?: string;
  contentName?: string;
  contentCategory?: string;
  plan?: string;
};

function normalize(value?: string) {
  return value?.trim().toLowerCase() || "";
}

function hash(value?: string) {
  const normalized = normalize(value);
  if (!normalized) return undefined;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export async function sendMetaServerEvent(event: ServerMetaEvent) {
  if (!META_ACCESS_TOKEN) {
    console.warn("Meta CAPI omitido: META_CONVERSIONS_API_TOKEN no configurado");
    return { skipped: true };
  }

  const userData: Record<string, unknown> = {
    em: hash(event.email),
    ph: hash(event.phone),
  };
  Object.keys(userData).forEach((key) => userData[key] === undefined && delete userData[key]);

  const customData: Record<string, unknown> = {};
  if (typeof event.value === "number") customData.value = Number(event.value.toFixed(2));
  if (event.currency) customData.currency = event.currency;
  if (event.contentName) customData.content_name = event.contentName;
  if (event.contentCategory) customData.content_category = event.contentCategory;
  if (event.plan) customData.plan = event.plan;

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        action_source: "website",
        event_source_url: event.eventSourceUrl,
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
    console.error("Meta CAPI server error", result);
    return { error: result };
  }

  return result;
}
