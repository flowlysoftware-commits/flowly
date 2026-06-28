import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = String(body?.message || "").trim();

    if (!message) {
      return NextResponse.json({ error: "No se recibió mensaje." }, { status: 400 });
    }

    const baseUrl = new URL(request.url).origin;

    try {
      const brainResponse = await fetch(`${baseUrl}/api/companion/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, source: "voice-test", mode: "customer" }),
      });
      const brainData = await brainResponse.json().catch(() => ({}));
      if (brainResponse.ok) {
        return NextResponse.json({ reply: brainData.reply || brainData.message || brainData.text || "Brain respondió sin texto visible.", details: brainData });
      }
    } catch {
      // fallback below
    }

    return NextResponse.json({
      reply: `He recibido tu voz correctamente: "${message}". La transcripción funciona. Si esta respuesta aparece, el problema ya no está en el micrófono sino en la integración final con el Companion.`,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error probando Brain." }, { status: 500 });
  }
}
