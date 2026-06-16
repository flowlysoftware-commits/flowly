import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WhatsAppMessage = {
  id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
  button?: { text?: string };
  interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } };
};

type WhatsAppStatus = {
  id?: string;
  status?: string;
  timestamp?: string;
  recipient_id?: string;
};

type WhatsAppChangeValue = {
  messaging_product?: string;
  metadata?: {
    display_phone_number?: string;
    phone_number_id?: string;
  };
  contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
  messages?: WhatsAppMessage[];
  statuses?: WhatsAppStatus[];
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function getMessageText(message: WhatsAppMessage) {
  if (message.type === "text") return message.text?.body || "";
  if (message.type === "button") return message.button?.text || "";
  if (message.type === "interactive") {
    return message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || "";
  }
  return message.type ? `[${message.type}]` : "";
}

function normalizePhone(value: string | null | undefined) {
  return String(value || "").replace(/\D/g, "");
}

type WhatsAppIntegration = {
  business_id: string;
  config: Record<string, unknown> | null;
};

function asObjectConfig(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
    } catch {
      return {};
    }
  }
  return typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function getConfiguredPhoneNumberIds(config: Record<string, unknown>) {
  return [
    config.phone_number_id,
    config.phoneNumberId,
    config.phone_id,
    config.phoneId,
    config.whatsapp_phone_number_id,
    config.whatsappPhoneNumberId,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);
}

async function findIntegrationByPhoneNumberId(phoneNumberId?: string): Promise<WhatsAppIntegration | null> {
  const normalizedPhoneNumberId = String(phoneNumberId || "").trim();
  if (!normalizedPhoneNumberId) return null;

  // First try a direct JSONB lookup. This is fast when PostgREST supports the JSON path filter.
  const { data: directMatch, error: directError } = await supabaseAdmin
    .from("business_integrations")
    .select("business_id, config")
    .eq("provider_key", "whatsapp_cloud")
    .filter("config->>phone_number_id", "eq", normalizedPhoneNumberId)
    .maybeSingle();

  if (!directError && directMatch?.business_id) {
    return {
      business_id: directMatch.business_id as string,
      config: asObjectConfig(directMatch.config),
    };
  }

  // Fallback: load connected WhatsApp integrations and match in JS. This avoids issues with JSONB filters,
  // cached schemas, text-vs-json shapes, or legacy camelCase config names.
  const { data, error } = await supabaseAdmin
    .from("business_integrations")
    .select("business_id, status, config")
    .eq("provider_key", "whatsapp_cloud");

  if (error || !data) {
    console.error("WHATSAPP WEBHOOK INTEGRATION LOOKUP ERROR", error?.message || "no_data");
    return null;
  }

  const activeRows = data.filter((row) => ["connected", "pending", "active"].includes(String(row.status || "connected")));
  const match = activeRows.find((row) => {
    const config = asObjectConfig(row.config);
    return getConfiguredPhoneNumberIds(config).includes(normalizedPhoneNumberId);
  });

  if (match?.business_id) {
    return {
      business_id: match.business_id as string,
      config: asObjectConfig(match.config),
    };
  }

  console.warn("WHATSAPP WEBHOOK MATCH CHECK", {
    phoneNumberId: normalizedPhoneNumberId,
    candidates: activeRows.map((row) => {
      const config = asObjectConfig(row.config);
      return {
        business_id: row.business_id,
        status: row.status,
        configured_phone_number_ids: getConfiguredPhoneNumberIds(config),
        has_access_token: Boolean(config.access_token),
      };
    }),
  });

  return null;
}

async function findCustomerIdByPhone(businessId: string, phone: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const { data } = await supabaseAdmin.from("customers").select("id, phone").eq("business_id", businessId).limit(500);
  const match = (data || []).find((customer) => {
    const candidate = normalizePhone(customer.phone);
    return candidate === normalized || (!!candidate && candidate.endsWith(normalized.slice(-9))) || normalized.endsWith(candidate.slice(-9));
  });
  return match?.id || null;
}

async function findOrCreateCustomerFromWhatsapp(businessId: string, phone: string, contactName: string | null, firstMessage: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;

  const existingId = await findCustomerIdByPhone(businessId, phone);
  if (existingId) {
    await supabaseAdmin
      .from("customers")
      .update({ last_contact_at: new Date().toISOString() })
      .eq("id", existingId)
      .eq("business_id", businessId);
    return existingId;
  }

  const name = contactName?.trim() || `WhatsApp +${normalized}`;
  const notes = [
    "Lead creado automáticamente desde WhatsApp Cloud API.",
    firstMessage ? `Primer mensaje: ${firstMessage}` : "",
  ].filter(Boolean).join("\n");

  const { data, error } = await supabaseAdmin
    .from("customers")
    .insert({
      business_id: businessId,
      name,
      full_name: name,
      phone: `+${normalized}`,
      notes,
      crm_status: "nuevo",
      last_contact_at: new Date().toISOString(),
    })
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("WHATSAPP CRM CUSTOMER CREATE ERROR", error.message);
    return null;
  }

  return data?.id || null;
}

async function saveInboundMessage(businessId: string, value: WhatsAppChangeValue, message: WhatsAppMessage) {
  const phone = message.from || value.contacts?.[0]?.wa_id || "";
  const customerName = value.contacts?.find((contact) => contact.wa_id === phone)?.profile?.name || value.contacts?.[0]?.profile?.name || null;
  const text = getMessageText(message);
  const customerId = await findOrCreateCustomerFromWhatsapp(businessId, phone, customerName, text);

  const payload = {
    business_id: businessId,
    customer_id: customerId,
    phone,
    template_key: null,
    message: text,
    direction: "inbound",
    status: "received",
    provider_message_id: message.id || null,
    contact_name: customerName,
    raw_payload: value,
    created_at: message.timestamp ? new Date(Number(message.timestamp) * 1000).toISOString() : new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from("whatsapp_messages").insert(payload);
  if (error) console.error("WHATSAPP WEBHOOK INSERT ERROR", error.message);
}

async function sendAutoReply(integration: WhatsAppIntegration, phoneNumberId: string | undefined, to: string, text: string, trigger: string) {
  const config = integration.config || {};
  const accessToken = String(config.access_token || "");
  const phoneId = String(config.phone_number_id || config.phoneNumberId || phoneNumberId || "");
  const phone = normalizePhone(to);
  if (!accessToken || !phoneId || !phone || !text.trim()) return;

  const response = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "text",
      text: { preview_url: true, body: text },
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("WHATSAPP BOT SEND ERROR", result?.error?.message || result);
    return;
  }

  await supabaseAdmin.from("whatsapp_messages").insert({
    business_id: integration.business_id,
    customer_id: await findCustomerIdByPhone(integration.business_id, phone),
    phone,
    template_key: `bot:${trigger}`,
    message: text,
    direction: "outbound",
    status: "sent",
    provider_message_id: result?.messages?.[0]?.id || null,
    raw_payload: result,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

async function runBotRules(integration: WhatsAppIntegration, phoneNumberId: string | undefined, message: WhatsAppMessage) {
  const incomingText = getMessageText(message).trim();
  const phone = message.from || "";
  if (!incomingText || !phone) return;

  const { data, error } = await supabaseAdmin
    .from("whatsapp_bot_rules")
    .select("trigger_text, response_message, match_mode, is_active")
    .eq("business_id", integration.business_id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error || !data?.length) return;
  const normalizedText = incomingText.toLowerCase();
  const matchedRule = data.find((rule) => {
    const trigger = String(rule.trigger_text || "").toLowerCase().trim();
    if (!trigger) return false;
    return rule.match_mode === "exact" ? normalizedText === trigger : normalizedText.includes(trigger);
  });

  if (matchedRule?.response_message) {
    await sendAutoReply(integration, phoneNumberId, phone, String(matchedRule.response_message), String(matchedRule.trigger_text || "bot"));
  }
}

async function updateMessageStatus(businessId: string, status: WhatsAppStatus) {
  if (!status.id) return;
  const { error } = await supabaseAdmin
    .from("whatsapp_messages")
    .update({
      status: status.status || "updated",
      provider_status_at: status.timestamp ? new Date(Number(status.timestamp) * 1000).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("business_id", businessId)
    .eq("provider_message_id", status.id);

  if (error) console.error("WHATSAPP WEBHOOK STATUS ERROR", error.message);
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!verifyToken) {
    return new NextResponse("WHATSAPP_VERIFY_TOKEN no configurado", { status: 500 });
  }

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entries = Array.isArray(body?.entry) ? body.entry : [];

    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      for (const change of changes) {
        const value = (change?.value || {}) as WhatsAppChangeValue;
        const phoneNumberId = value.metadata?.phone_number_id;
        const integration = await findIntegrationByPhoneNumberId(phoneNumberId);

        if (!integration) {
          console.warn("WHATSAPP WEBHOOK WITHOUT BUSINESS MATCH", { phoneNumberId });
          continue;
        }

        for (const message of value.messages || []) {
          await saveInboundMessage(integration.business_id, value, message);
          await runBotRules(integration, phoneNumberId, message);
        }

        for (const status of value.statuses || []) {
          await updateMessageStatus(integration.business_id, status);
        }
      }
    }

    return json({ received: true });
  } catch (error) {
    console.error("WHATSAPP WEBHOOK ERROR", error);
    return json({ received: true, warning: error instanceof Error ? error.message : "unknown_error" });
  }
}
