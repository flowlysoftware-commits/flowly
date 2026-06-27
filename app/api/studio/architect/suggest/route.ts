import { NextRequest, NextResponse } from "next/server";
import { buildSeedModuleSuggestion } from "@/lib/flowlyStudioHeart";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const prompt = String(body.prompt || "");
  return NextResponse.json({ suggestion: buildSeedModuleSuggestion(prompt) });
}
