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
};

function cleanPhone(value: unknown) {
  return String(value || "")
    .replace(/[<>\"'`]/g, "")
    .trim();
}

async function readPayload(req: Request): Promise<VoiceInboundPayload> {
  const raw = await req.text();

  if (!raw.trim()) return {};

  try {
    return JSON.parse(raw) as VoiceInboundPayload;
  } catch {
    // Fallback para pruebas o PBX que envíen x-www-form-urlencoded.
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
    const businessId = body.business_id || process.env.FLOWLY_VOICE_BUSINESS_ID;
    const callerPhone = cleanPhone(body.caller_phone);

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

    const { data, error } = await supabaseAdmin
      .from("voice_calls")
      .insert({
        business_id: businessId,
        caller_name: body.caller_name || null,
        caller_phone: callerPhone,
        reason: body.reason || "Llamada entrante automática",
        transcript: body.transcript || null,
        intent: body.intent || "informacion",
        status: body.status || "nueva",
        priority: body.priority || "normal",
        source: body.source || "asterisk",
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
      call_id: body.call_id || null,
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
