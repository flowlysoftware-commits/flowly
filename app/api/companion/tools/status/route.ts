import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function safeCount(table: string) {
  try {
    const { count, error } = await supabaseAdmin
      .from(table)
      .select("id", { count: "exact", head: true });

    if (error) {
      return { ok: false, table, count: 0, error: error.message };
    }

    return { ok: true, table, count: count || 0 };
  } catch (error) {
    return {
      ok: false,
      table,
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function GET() {
  const [
    businesses,
    customers,
    appointments,
    modules,
    integrations,
    voiceCalls,
  ] = await Promise.all([
    safeCount("businesses"),
    safeCount("customers"),
    safeCount("appointments"),
    safeCount("business_modules"),
    safeCount("business_integrations"),
    safeCount("voice_calls"),
  ]);

  const counters = {
    businesses: businesses.count,
    customers: customers.count,
    appointments: appointments.count,
    modules: modules.count,
    integrations: integrations.count,
    voiceCalls: voiceCalls.count,
  };

  return NextResponse.json({
    ok: true,
    service: "Flowly Companion Tools",
    tool: "flowly.status",
    generatedAt: new Date().toISOString(),
    counters,
    checks: {
      businesses,
      customers,
      appointments,
      modules,
      integrations,
      voiceCalls,
    },
  });
}
