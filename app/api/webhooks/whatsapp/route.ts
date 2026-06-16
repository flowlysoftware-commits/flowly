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

function normalizeText(value: string | null | undefined) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function getConfigString(config: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = config[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

type WhatsAppIntegration = {
  business_id: string;
  config: Record<string, unknown> | null;
};


type NeuronasFlowState = {
  step: "eps" | "document_type" | "details" | "completed";
  eps?: string;
  document_type?: string;
  started_at?: string;
};

const NEURONAS_EPS_OPTIONS: Record<string, string> = {
  "1": "Nueva EPS",
  "2": "Salud Total",
  "3": "Fomag",
  "4": "Sura",
  "5": "Colsanitas",
  "6": "Coomeva Prepagada",
  "7": "Axa Colpatria",
  "8": "Particular",
  "9": "Otra",
};

const NEURONAS_DOCUMENT_OPTIONS: Record<string, string> = {
  "1": "Registro Civil",
  "2": "Tarjeta de Identidad",
  "3": "Cédula de Ciudadanía",
  "4": "P.T.",
};

function buildNeuronasEpsPrompt() {
  return [
    "Hola! Bienvenido a Neuronas Ips. Para ayudarte a agendar tu cita, por favor selecciona tu EPS respondiendo solo con el número:",
    "1 Nueva EPS",
    "2 Salud Total",
    "3 Fomag",
    "4 Sura",
    "5 Colsanitas",
    "6 Coomeva Prepagada",
    "7 Axa Colpatria",
    "8 Particular",
    "9 Otra",
  ].join("\n");
}

function buildNeuronasDocumentPrompt() {
  return [
    "Perfecto. Ahora selecciona el tipo de documento de identidad del paciente enviando el número de la opción:",
    "1 Registro Civil",
    "2 Tarjeta de Identidad",
    "3 Cédula de Ciudadanía",
    "4 P.T.",
  ].join("\n");
}

function buildNeuronasDetailsPrompt() {
  return [
    "Gracias. Para finalizar el agendamiento, por favor envíanos en un solo mensaje los siguientes datos:",
    "",
    ". Número de documento:",
    ". Nombre completo del paciente:",
    ". Régimen",
    ". Teléfono de contacto:",
    ". Especialidad médica que requiere:",
    "",
    "Un asesor confirmará la fecha y hora en breve",
  ].join("\n");
}

function getLineValue(text: string, labels: string[]) {
  const normalizeLabel = (value: string) => normalizeText(value).replace(/[^a-z0-9ñ]+/g, " ").trim();
  const normalizedLabels = labels.map(normalizeLabel);

  for (const line of String(text || "").split(/\r?\n/)) {
    const clean = line.replace(/^\s*[.:-]\s*/, "").trim();
    const normalizedLine = normalizeLabel(clean);

    for (let index = 0; index < normalizedLabels.length; index += 1) {
      const label = normalizedLabels[index];
      if (!label) continue;
      if (normalizedLine === label) continue;
      if (normalizedLine.startsWith(`${label} `) || normalizedLine.startsWith(`${label}:`)) {
        const originalLabel = labels[index];
        return clean.slice(originalLabel.length).replace(/^\s*:?\s*/, "").trim();
      }
    }
  }

  return "";
}

function parseNeuronasDetails(text: string) {
  return {
    document_number: getLineValue(text, ["Número de documento", "Numero de documento", "Documento"]),
    patient_name: getLineValue(text, ["Nombre completo del paciente", "Nombre completo", "Paciente", "Nombre"]),
    regimen: getLineValue(text, ["Régimen", "Regimen"]),
    contact_phone: getLineValue(text, ["Teléfono de contacto", "Telefono de contacto", "Teléfono", "Telefono"]),
    specialty: getLineValue(text, ["Especialidad médica que requiere", "Especialidad medica que requiere", "Especialidad"]),
  };
}

function getNeuronasFlowPayload(raw: unknown): NeuronasFlowState | null {
  const object = asObjectConfig(raw);
  const flow = asObjectConfig(object.neuronas_flow);
  const step = String(flow.step || "").trim();
  if (!["eps", "document_type", "details", "completed"].includes(step)) return null;
  return {
    step: step as NeuronasFlowState["step"],
    eps: String(flow.eps || "").trim() || undefined,
    document_type: String(flow.document_type || "").trim() || undefined,
    started_at: String(flow.started_at || "").trim() || undefined,
  };
}

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



type FlowlyMenuOption = {
  digit: string;
  label: string;
  crm_status?: string;
  response?: string;
};

type FlowlyMenuPayload = {
  type: "flowly_menu_v1";
  intro: string;
  options: FlowlyMenuOption[];
};

function parseFlowlyMenu(value: unknown): FlowlyMenuPayload | null {
  if (!value) return null;
  if (typeof value === "object" && !Array.isArray(value)) {
    const candidate = value as Record<string, unknown>;
    if (candidate.type === "flowly_menu_v1" && Array.isArray(candidate.options)) {
      return {
        type: "flowly_menu_v1",
        intro: String(candidate.intro || "Elige una opción:"),
        options: candidate.options
          .map((option) => {
            const item = option as Record<string, unknown>;
            return {
              digit: String(item.digit || "").replace(/\D/g, ""),
              label: String(item.label || "").trim(),
              crm_status: String(item.crm_status || "").trim() || undefined,
              response: String(item.response || "").trim() || undefined,
            };
          })
          .filter((option) => option.digit && option.label),
      };
    }
  }

  const text = String(value || "").trim();
  if (!text.startsWith("FLOWLY_MENU_V1:")) return null;
  try {
    return parseFlowlyMenu(JSON.parse(text.slice("FLOWLY_MENU_V1:".length))) as FlowlyMenuPayload | null;
  } catch {
    return null;
  }
}

function buildMenuText(menu: FlowlyMenuPayload) {
  const lines = [menu.intro || "Elige una opción:"];
  for (const option of menu.options) {
    lines.push(`${option.digit}. ${option.label}`);
  }
  return lines.join("\n");
}

function normalizeMenuDigit(text: string) {
  const match = String(text || "").trim().match(/^\s*(\d{1,2})\s*$/);
  return match?.[1] || "";
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
    contact_id: customerId,
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

async function sendAutoReply(integration: WhatsAppIntegration, phoneNumberId: string | undefined, to: string, text: string, trigger: string, rawPayload?: Record<string, unknown>) {
  const config = integration.config || {};
  const accessToken = getConfigString(config, ["access_token", "accessToken", "token"]);
  const phoneId = getConfigString(config, ["phone_number_id", "phoneNumberId", "phone_id", "phoneId", "whatsapp_phone_number_id"]) || String(phoneNumberId || "").trim();
  const phone = normalizePhone(to);

  if (!accessToken || !phoneId || !phone || !text.trim()) {
    console.warn("WHATSAPP BOT SKIPPED MISSING CONFIG", {
      business_id: integration.business_id,
      has_access_token: Boolean(accessToken),
      phoneId,
      to: phone,
      has_text: Boolean(text.trim()),
    });
    return;
  }

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
  const providerMessageId = result?.messages?.[0]?.id || null;

  if (!response.ok) {
    console.error("WHATSAPP BOT SEND ERROR", {
      business_id: integration.business_id,
      status: response.status,
      phoneId,
      to: phone,
      error: result?.error?.message || result,
    });
    await supabaseAdmin.from("whatsapp_messages").insert({
      business_id: integration.business_id,
      customer_id: await findCustomerIdByPhone(integration.business_id, phone),
      phone,
      template_key: trigger.startsWith("menu:") ? `bot_menu:${trigger.slice(5)}` : `bot:${trigger}`,
      message: text,
      direction: "outbound",
      status: "failed",
      provider_message_id: providerMessageId,
      raw_payload: rawPayload || result,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return;
  }

  await supabaseAdmin.from("whatsapp_messages").insert({
    business_id: integration.business_id,
    customer_id: await findCustomerIdByPhone(integration.business_id, phone),
    phone,
    template_key: trigger.startsWith("menu:") ? `bot_menu:${trigger.slice(5)}` : `bot:${trigger}`,
    message: text,
    direction: "outbound",
    status: "sent",
    provider_message_id: providerMessageId,
    raw_payload: rawPayload || result,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  console.info("WHATSAPP BOT AUTO REPLY SENT", {
    business_id: integration.business_id,
    trigger,
    to: phone,
    providerMessageId,
  });
}


async function findLatestPendingMenu(businessId: string, phone: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;

  const { data, error } = await supabaseAdmin
    .from("whatsapp_messages")
    .select("id, phone, message, raw_payload, created_at")
    .eq("business_id", businessId)
    .eq("direction", "outbound")
    .like("template_key", "bot_menu:%")
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    console.error("WHATSAPP MENU LOOKUP ERROR", { businessId, error: error.message });
    return null;
  }

  const match = (data || []).find((row) => normalizePhone(row.phone) === normalized);
  if (!match) return null;

  const createdAt = new Date(match.created_at || 0).getTime();
  if (Number.isFinite(createdAt) && Date.now() - createdAt > 1000 * 60 * 60 * 48) return null;

  const raw = asObjectConfig(match.raw_payload);
  const menu = parseFlowlyMenu(raw.flowly_menu || raw.menu || match.message);
  return menu ? { row: match, menu } : null;
}

async function handleMenuSelection(integration: WhatsAppIntegration, phoneNumberId: string | undefined, message: WhatsAppMessage) {
  const incomingText = getMessageText(message).trim();
  const digit = normalizeMenuDigit(incomingText);
  const phone = message.from || "";
  if (!digit || !phone) return false;

  const pending = await findLatestPendingMenu(integration.business_id, phone);
  if (!pending?.menu?.options?.length) return false;

  const option = pending.menu.options.find((item) => item.digit === digit);
  if (!option) {
    await sendAutoReply(
      integration,
      phoneNumberId,
      phone,
      `No hemos encontrado la opción ${digit}.\n\n${buildMenuText(pending.menu)}`,
      "menu_invalid_option",
      { flowly_menu_retry: pending.menu, invalid_option: digit },
    );
    return true;
  }

  const customerId = await findCustomerIdByPhone(integration.business_id, phone);
  if (customerId) {
    const crmStatus = option.crm_status || "interesado";
    const note = `\n\n[WhatsApp · Marcaje ${digit}] ${option.label}\n${new Date().toLocaleString("es-ES")}`;
    const { data: currentCustomer } = await supabaseAdmin
      .from("customers")
      .select("notes")
      .eq("id", customerId)
      .eq("business_id", integration.business_id)
      .maybeSingle();

    await supabaseAdmin
      .from("customers")
      .update({
        crm_status: crmStatus,
        notes: `${String(currentCustomer?.notes || "").trim()}${note}`.trim(),
        last_contact_at: new Date().toISOString(),
      })
      .eq("id", customerId)
      .eq("business_id", integration.business_id);
  }

  await sendAutoReply(
    integration,
    phoneNumberId,
    phone,
    option.response || `Perfecto, hemos registrado tu selección: ${option.label}. Un asesor revisará tu ficha.`,
    `menu_option_${digit}`,
    { flowly_menu_selection: { digit, option, source_menu_id: pending.row.id } },
  );

  console.info("WHATSAPP MENU OPTION PROCESSED", {
    business_id: integration.business_id,
    phone: normalizePhone(phone),
    digit,
    label: option.label,
    customerId,
  });

  return true;
}


async function findLatestNeuronasFlowState(businessId: string, phone: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;

  const { data, error } = await supabaseAdmin
    .from("whatsapp_messages")
    .select("id, phone, raw_payload, created_at")
    .eq("business_id", businessId)
    .eq("direction", "outbound")
    .like("template_key", "%neuronas_flow:%")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("WHATSAPP NEURONAS FLOW LOOKUP ERROR", { businessId, error: error.message });
    return null;
  }

  const match = (data || []).find((row) => normalizePhone(row.phone) === normalized);
  if (!match) return null;

  const createdAt = new Date(match.created_at || 0).getTime();
  if (Number.isFinite(createdAt) && Date.now() - createdAt > 1000 * 60 * 60 * 24 * 7) return null;

  const state = getNeuronasFlowPayload(match.raw_payload);
  return state ? { row: match, state } : null;
}

async function createNeuronasContactFicha(businessId: string, phone: string, detailsText: string, state: NeuronasFlowState) {
  const normalized = normalizePhone(phone);
  const parsed = parseNeuronasDetails(detailsText);
  const name = parsed.patient_name || `Paciente WhatsApp +${normalized}`;
  const contactPhone = parsed.contact_phone ? `+${normalizePhone(parsed.contact_phone)}` : `+${normalized}`;
  const message = [
    "Solicitud de agendamiento recibida desde WhatsApp · Neuronas IPS",
    "",
    "Estado: Pendiente de confirmar cita",
    state.eps ? `EPS: ${state.eps}` : "EPS: No indicada",
    state.document_type ? `Tipo de documento: ${state.document_type}` : "Tipo de documento: No indicado",
    parsed.document_number ? `Número de documento: ${parsed.document_number}` : "Número de documento: No indicado",
    parsed.patient_name ? `Nombre completo del paciente: ${parsed.patient_name}` : "Nombre completo del paciente: No indicado",
    parsed.regimen ? `Régimen: ${parsed.regimen}` : "Régimen: No indicado",
    parsed.contact_phone ? `Teléfono de contacto: ${parsed.contact_phone}` : `Teléfono de contacto: +${normalized}`,
    parsed.specialty ? `Especialidad médica que requiere: ${parsed.specialty}` : "Especialidad médica que requiere: No indicada",
    "",
    "Mensaje original enviado por WhatsApp:",
    detailsText,
    "",
    `Business ID: ${businessId}`,
    `WhatsApp origen: +${normalized}`,
    `Registrado: ${new Date().toLocaleString("es-ES")}`,
  ].filter(Boolean).join("\n");

  const payload = {
    name,
    email: `whatsapp-${normalized || Date.now()}@flowly.local`,
    phone: contactPhone,
    company: state.eps || "WhatsApp · Neuronas IPS",
    type: "Paciente WhatsApp · Neuronas IPS",
    message,
    status: "Nuevo",
  };

  const { data, error } = await supabaseAdmin
    .from("contacts")
    .insert(payload)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("WHATSAPP NEURONAS CONTACT CREATE ERROR", { businessId, error: error.message, payload });
    return null;
  }

  console.info("WHATSAPP NEURONAS CONTACT CREATED", {
    business_id: businessId,
    phone: normalized,
    contactId: data?.id || null,
  });

  return data?.id || null;
}

async function handleNeuronasAppointmentFlow(integration: WhatsAppIntegration, phoneNumberId: string | undefined, message: WhatsAppMessage) {
  const incomingText = getMessageText(message).trim();
  const normalizedIncoming = normalizeText(incomingText);
  const phone = message.from || "";
  if (!incomingText || !phone) return false;

  const isStart = /\bhola\b/.test(normalizedIncoming) || ["inicio", "cita", "agendar", "agendamiento"].includes(normalizedIncoming);
  const pending = await findLatestNeuronasFlowState(integration.business_id, phone);

  if (isStart) {
    await sendAutoReply(
      integration,
      phoneNumberId,
      phone,
      buildNeuronasEpsPrompt(),
      "neuronas_flow:eps",
      { neuronas_flow: { step: "eps", started_at: new Date().toISOString() } },
    );
    return true;
  }

  if (!pending?.state || pending.state.step === "completed") return false;

  const digit = normalizeMenuDigit(incomingText);

  if (pending.state.step === "eps") {
    const eps = NEURONAS_EPS_OPTIONS[digit] || `Opción ${digit || incomingText}`;
    await sendAutoReply(
      integration,
      phoneNumberId,
      phone,
      buildNeuronasDocumentPrompt(),
      "neuronas_flow:document_type",
      { neuronas_flow: { step: "document_type", eps, started_at: pending.state.started_at || new Date().toISOString() } },
    );
    return true;
  }

  if (pending.state.step === "document_type") {
    const documentType = NEURONAS_DOCUMENT_OPTIONS[digit] || `Opción ${digit || incomingText}`;
    await sendAutoReply(
      integration,
      phoneNumberId,
      phone,
      buildNeuronasDetailsPrompt(),
      "neuronas_flow:details",
      {
        neuronas_flow: {
          step: "details",
          eps: pending.state.eps,
          document_type: documentType,
          started_at: pending.state.started_at || new Date().toISOString(),
        },
      },
    );
    return true;
  }

  if (pending.state.step === "details") {
    const contactId = await createNeuronasContactFicha(integration.business_id, phone, incomingText, pending.state);
    await sendAutoReply(
      integration,
      phoneNumberId,
      phone,
      "Gracias. Hemos registrado tus datos correctamente. Un asesor revisará tu solicitud y confirmará la fecha y hora de la cita en breve.",
      "neuronas_flow:completed",
      {
        neuronas_flow: {
          step: "completed",
          eps: pending.state.eps,
          document_type: pending.state.document_type,
          contact_id: customerId,
          completed_at: new Date().toISOString(),
        },
      },
    );
    console.info("WHATSAPP NEURONAS CRM FICHA CREATED", {
      business_id: integration.business_id,
      phone: normalizePhone(phone),
      contactId,
    });
    return true;
  }

  return false;
}

async function runBotRules(integration: WhatsAppIntegration, phoneNumberId: string | undefined, message: WhatsAppMessage) {
  const incomingText = getMessageText(message).trim();
  const phone = message.from || "";
  if (!incomingText || !phone) return;

  const { data, error } = await supabaseAdmin
    .from("whatsapp_bot_rules")
    .select("*")
    .eq("business_id", integration.business_id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("WHATSAPP BOT RULES LOAD ERROR", { business_id: integration.business_id, error: error.message });
    return;
  }

  const activeRules = (data || []).filter((rule) => rule.is_active !== false);
  if (!activeRules.length) {
    console.info("WHATSAPP BOT NO ACTIVE RULES", { business_id: integration.business_id, incomingText });
    return;
  }

  const normalizedText = normalizeText(incomingText);
  const matchedRule = activeRules.find((rule) => {
    const rawTrigger = String(rule.trigger_text || rule.keyword || rule.trigger || "").trim();
    const trigger = normalizeText(rawTrigger);
    if (!trigger) return false;
    const mode = String(rule.match_mode || "contains").toLowerCase();
    return mode === "exact" ? normalizedText === trigger : normalizedText.includes(trigger);
  });

  if (!matchedRule) {
    console.info("WHATSAPP BOT NO MATCH", {
      business_id: integration.business_id,
      incomingText,
      availableTriggers: activeRules.map((rule) => rule.trigger_text || rule.keyword || rule.trigger).filter(Boolean),
    });
    return;
  }

  const responseMessage = String(matchedRule.response_message || matchedRule.reply_message || matchedRule.message || "").trim();
  if (!responseMessage) {
    console.warn("WHATSAPP BOT MATCH WITHOUT RESPONSE", { business_id: integration.business_id, rule_id: matchedRule.id });
    return;
  }

  const menu = parseFlowlyMenu(responseMessage);
  if (menu?.options?.length) {
    await sendAutoReply(
      integration,
      phoneNumberId,
      phone,
      buildMenuText(menu),
      `menu:${matchedRule.id || matchedRule.trigger_text || "bot"}`,
      { flowly_menu: menu, bot_rule_id: matchedRule.id || null },
    );
    return;
  }

  await sendAutoReply(
    integration,
    phoneNumberId,
    phone,
    responseMessage,
    String(matchedRule.trigger_text || matchedRule.keyword || matchedRule.trigger || "bot"),
  );
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
          const handledByNeuronasFlow = await handleNeuronasAppointmentFlow(integration, phoneNumberId, message);
          if (handledByNeuronasFlow) continue;
          const handledByMenu = await handleMenuSelection(integration, phoneNumberId, message);
          if (!handledByMenu) await runBotRules(integration, phoneNumberId, message);
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
