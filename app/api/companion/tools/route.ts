import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Flowly Companion Tools",
    generatedAt: new Date().toISOString(),
    tools: [
      {
        name: "flowly.status",
        description: "Devuelve el estado operativo básico de Flowly y contadores internos.",
        endpoint: "/api/companion/tools/status",
        method: "GET",
      },
    ],
  });
}
