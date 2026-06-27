import { NextRequest, NextResponse } from "next/server";
import { buildArchitectFullBlueprint } from "@/lib/flowlyStudioCore";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const prompt = String(body.prompt || "");
  if (!prompt.trim()) return NextResponse.json({ error: "Describe el módulo que quieres crear." }, { status: 400 });
  return NextResponse.json({ blueprint: buildArchitectFullBlueprint(prompt) });
}
