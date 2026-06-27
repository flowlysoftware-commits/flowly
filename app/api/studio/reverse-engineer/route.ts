import { NextRequest, NextResponse } from "next/server";
import { reverseEngineerStudioSource } from "@/lib/flowlyStudioCore";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const source = String(body.source || "");
  const name = String(body.name || "Análisis inverso");
  if (!source.trim()) return NextResponse.json({ error: "Pega código, SQL o rutas para analizar." }, { status: 400 });
  return NextResponse.json({ result: reverseEngineerStudioSource(source, name) });
}
