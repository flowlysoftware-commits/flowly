import { NextRequest, NextResponse } from "next/server";
import { generateBusinessObjectArtifacts, normalizeStudioDefinition, type FlowlyBusinessObjectDefinition } from "@/lib/flowlyStudio";

export async function POST(request: NextRequest) {
  const definition = normalizeStudioDefinition(await request.json()) as FlowlyBusinessObjectDefinition;
  if (!definition?.name) return NextResponse.json({ error: "name es obligatorio." }, { status: 400 });
  return NextResponse.json({ artifacts: generateBusinessObjectArtifacts(definition) });
}
