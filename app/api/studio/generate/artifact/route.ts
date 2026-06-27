import { NextRequest, NextResponse } from "next/server";
import { generateStudioArtifacts, normalizeStudioDefinition } from "@/lib/flowlyStudio";

export async function POST(request: NextRequest) {
  const definition = normalizeStudioDefinition(await request.json());
  if (!definition?.name) return NextResponse.json({ error: "name es obligatorio." }, { status: 400 });
  return NextResponse.json({ artifacts: generateStudioArtifacts(definition) });
}
