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

    const eps = cleanText(body.eps || parsed.eps || body.intent || "informacion");
    const documentType = cleanText(body.document_type || parsed.document_type || "");
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

    const { data, error } = await supabaseAdmin
      .from("voice_calls")
      .insert({
        business_id: businessId,
        caller_name: cleanText(body.caller_name) || null,
        caller_phone: callerPhone,
        reason:
          cleanText(body.reason) ||
          `Llamada entrante automática${eps ? ` · EPS: ${eps}` : ""}${
            documentType ? ` · Documento: ${documentType}` : ""
          }${documentNumber ? ` · ID: ${documentNumber}` : ""}`,
        transcript: cleanText(body.transcript) || null,
        intent: eps || "informacion",
        status: cleanText(body.status) || "nueva",
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
