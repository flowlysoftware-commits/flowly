import { NextRequest, NextResponse } from "next/server";
import { planExecutorV3 } from "@/lib/flowlyExecutorV3";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const instruction = String(body.instruction || "").trim();
    if (!instruction) return NextResponse.json({ ok: false, error: "Falta la instrucción para Executor V3." }, { status: 400 });
    const result = await planExecutorV3(instruction);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
