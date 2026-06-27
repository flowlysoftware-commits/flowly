import { NextResponse } from "next/server";
import { analyzeCurrentFlowlyProject, analyzeModule } from "@/lib/flowlyAnalyzer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("module");
  if (moduleId) {
    const report = analyzeModule(moduleId);
    if (!report) return NextResponse.json({ error: "Módulo no encontrado" }, { status: 404 });
    return NextResponse.json(report);
  }
  return NextResponse.json(analyzeCurrentFlowlyProject());
}
