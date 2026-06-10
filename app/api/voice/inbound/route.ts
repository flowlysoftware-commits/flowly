import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type VoiceInboundPayload = {
  business_id?: string;
  caller_phone?: string;
  caller_name?: string;
  reason?: string;
  transcript?: string;
  intent?: string;
  status?: string;
  priority?: string;
  call_id?: string;
  source?: string;
  eps?: string;
  document_type?: string;
  document_number?: string;
};

function cleanText(value: unknown) {
  return String(value || "")
    .replace(/[<>\"'`]/g, "")
    .trim();
}

function cleanPhone(value: unknown) {
  return cleanText(value).replace(/\s+/g, "");
}

function cleanDocumentNumber(value: unknown) {
  return String(value || "").replace(/\D/g, "").trim();
}


const EPS_VALUES: Record<string, string> = {
  "1": "nueva_eps",
  nueva_eps: "nueva_eps",
  "nueva eps": "nueva_eps",
  nueva: "nueva_eps",
  "2": "salud_total",
  salud_total: "salud_total",
  "salud total": "salud_total",
  "3": "fomag",
  fomag: "fomag",
  "4": "sura",
  sura: "sura",
  "5": "colsanitas",
  colsanitas: "colsanitas",
  "6": "coomeva_medicina_prepagada",
  coomeva: "coomeva_medicina_prepagada",
  "coomeva medicina prepagada": "coomeva_medicina_prepagada",
  "7": "axa_colpatria",
  axa: "axa_colpatria",
  "axa colpatria": "axa_colpatria",
  colpatria: "axa_colpatria",
  "8": "particular",
  particular: "particular",
  "9": "otra_eps",
  otra_eps: "otra_eps",
  "otra eps": "otra_eps",
};

const EPS_LABELS: Record<string, string> = {
  nueva_eps: "Nueva EPS",
  salud_total: "Salud Total",
  fomag: "FOMAG",
  sura: "SURA",
  colsanitas: "Colsanitas",
  coomeva_medicina_prepagada: "Coomeva Medicina Prepagada",
  axa_colpatria: "AXA Colpatria",
  particular: "Particular",
  otra_eps: "Otra EPS",
};

const DOCUMENT_VALUES: Record<string, string> = {
  "1": "registro_civil",
  registro_civil: "registro_civil",
  "registro civil": "registro_civil",
  "2": "tarjeta_identidad",
  tarjeta_identidad: "tarjeta_identidad",
  "tarjeta de identidad": "tarjeta_identidad",
  "3": "cedula_ciudadania",
  cedula_ciudadania: "cedula_ciudadania",
  "cedula de ciudadania": "cedula_ciudadania",
  "cédula de ciudadanía": "cedula_ciudadania",
  cedula: "cedula_ciudadania",
  "4": "pt",
  pt: "pt",
  "p t": "pt",
};

const DOCUMENT_LABELS: Record<string, string> = {
  registro_civil: "Registro civil",
  tarjeta_identidad: "Tarjeta de identidad",
  cedula_ciudadania: "Cédula de ciudadanía",
  pt: "PT",
};

function normalizeOption(value: unknown, options: Record<string, string>) {
  const raw = cleanText(value).toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ").trim();
  if (!raw) return "";
  return options[raw] || options[raw.replace(/\s+/g, "_")] || cleanText(value);
}

function normalizeEps(value: unknown) {
  return normalizeOption(value, EPS_VALUES);
}

function normalizeDocumentType(value: unknown) {
  return normalizeOption(value, DOCUMENT_VALUES);
}

function epsLabel(value: string) {
  return EPS_LABELS[value] || value;
}

function documentTypeLabel(value: string) {
  return DOCUMENT_LABELS[value] || value;
}


function parseReason(reason?: string | null) {
  const text = String(reason || "");

  const epsMatch = text.match(/EPS:\s*([^|]+)/i);
  const docTypeMatch = text.match(/Documento:\s*([^|]+)/i);
  const idMatch = text.match(/ID:\s*([0-9A-Za-z.-]+)/i);

  return {
    eps: epsMatch?.[1]?.trim() || null,
    document_type: docTypeMatch?.[1]?.trim() || null,
    document_number: idMatch?.[1]?.trim() || null,
  };
}

async function readPayload(req: Request): Promise<VoiceInboundPayload> {
  const raw = await req.text();

  if (!raw.trim()) return {};

  try {
    return JSON.parse(raw) as VoiceInboundPayload;
  } catch {
    const params = new URLSearchParams(raw);
    return Object.fromEntries(params.entries()) as VoiceInboundPayload;
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Flowly Voice inbound webhook",
  });
}

export async function POST(req: Request) {
  try {
    const configuredSecret = process.env.FLOWLY_VOICE_WEBHOOK_SECRET;
    const receivedSecret =
      req.headers.get("x-flowly-secret") ||
      new URL(req.url).searchParams.get("secret");

    if (configuredSecret && receivedSecret !== configuredSecret) {
      return NextResponse.json(
        { success: false, error: "Unauthorized voice webhook" },
        { status: 401 }
      );
    }

    const body = await readPayload(req);
    const businessId = cleanText(body.business_id || process.env.FLOWLY_VOICE_BUSINESS_ID);
    const callerPhone = cleanPhone(body.caller_phone);
    const parsed = parseReason(body.reason);

    const eps = normalizeEps(body.eps || parsed.eps || body.intent || "informacion");
    const documentType = normalizeDocumentType(body.document_type || parsed.document_type || "");
    const documentNumber = cleanDocumentNumber(body.document_number || parsed.document_number || "");

    if (!businessId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing business_id. Send it in the webhook body or set FLOWLY_VOICE_BUSINESS_ID in Vercel.",
        },
        { status: 400 }
      );
    }

    if (!callerPhone) {
      return NextResponse.json(
        { success: false, error: "Missing caller_phone" },
        { status: 400 }
      );
    }

    let matchedCustomerId: string | null = null;

    if (documentNumber) {
      const { data: directCustomer } = await supabaseAdmin
        .from("customers")
        .select("id")
        .eq("business_id", businessId)
        .eq("document_number", documentNumber)
        .maybeSingle();

      matchedCustomerId = directCustomer?.id || null;
    }

    if (!matchedCustomerId && documentNumber) {
      const { data: patientProfile } = await supabaseAdmin
        .from("patient_profiles")
        .select("customer_id")
        .eq("business_id", businessId)
        .eq("document_id", documentNumber)
        .maybeSingle();

      matchedCustomerId = patientProfile?.customer_id || null;
    }

    if (!matchedCustomerId) {
      const { data: customers } = await supabaseAdmin
        .from("customers")
        .select("id, phone")
        .eq("business_id", businessId)
        .not("phone", "is", null);

      const lastDigits = callerPhone.replace(/\D/g, "").slice(-9);
      const match = (customers || []).find((customer) =>
        String(customer.phone || "").replace(/\D/g, "").endsWith(lastDigits)
      );

      matchedCustomerId = match?.id || null;
    }

    if (matchedCustomerId) {
      await supabaseAdmin
        .from("customers")
        .update({
          eps: eps || null,
          document_type: documentType || null,
          document_number: documentNumber || null,
          crm_status: "en_llamada",
          last_contact_at: new Date().toISOString(),
        })
        .eq("id", matchedCustomerId);
    } else {
      const fallbackName =
        cleanText(body.caller_name) ||
        (documentNumber ? `Paciente ${documentNumber}` : `Paciente ${callerPhone}`);

      const { data: createdCustomer, error: customerCreateError } = await supabaseAdmin
        .from("customers")
        .insert({
          business_id: businessId,
          name: fallbackName,
          full_name: fallbackName,
          phone: callerPhone,
          notes: [
            "Creado automáticamente desde llamada entrante.",
            eps ? `EPS: ${epsLabel(eps)}` : "",
            documentType ? `Tipo documento: ${documentTypeLabel(documentType)}` : "",
            documentNumber ? `Documento: ${documentNumber}` : "",
          ].filter(Boolean).join("\n"),
          crm_status: "en_llamada",
          eps: eps || null,
          document_type: documentType || null,
          document_number: documentNumber || null,
          last_contact_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (!customerCreateError) {
        matchedCustomerId = createdCustomer?.id || null;
      } else {
        console.error("FLOWLY VOICE CUSTOMER UPSERT ERROR", customerCreateError);
      }
    }

    const { data, error } = await supabaseAdmin
      .from("voice_calls")
      .insert({
        business_id: businessId,
        caller_name: cleanText(body.caller_name) || null,
        caller_phone: callerPhone,
        reason:
          cleanText(body.reason) ||
          `Llamada entrante automática${eps ? ` · EPS: ${epsLabel(eps)}` : ""}${
            documentType ? ` · Documento: ${documentTypeLabel(documentType)}` : ""
          }${documentNumber ? ` · ID: ${documentNumber}` : ""}`,
        transcript: cleanText(body.transcript) || null,
        intent: eps || "informacion",
        status: cleanText(body.status) || "en_llamada",
        priority: cleanText(body.priority) || "normal",
        source: cleanText(body.source) || "asterisk",
        call_id: cleanText(body.call_id) || null,
        eps: eps || null,
        document_type: documentType || null,
        document_number: documentNumber || null,
        customer_id: matchedCustomerId,
      })
      .select()
      .single();

    if (error) {
      console.error("FLOWLY VOICE INSERT ERROR", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (matchedCustomerId) {
      await supabaseAdmin.from("voice_links").upsert({
        business_id: businessId,
        voice_call_id: data.id,
        customer_id: matchedCustomerId,
      }, { onConflict: "voice_call_id,customer_id" });
    }

    console.log("FLOWLY VOICE CALL SAVED", {
      business_id: businessId,
      caller_phone: callerPhone,
      eps,
      document_type: documentType,
      document_number: documentNumber,
      customer_id: matchedCustomerId,
    });

    return NextResponse.json({
      success: true,
      call: data,
    });
  } catch (error) {
    console.error("FLOWLY VOICE WEBHOOK ERROR", error);

    return NextResponse.json(
      { success: false, error: "Voice webhook failed" },
      { status: 500 }
    );
  }
}
