import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Falta OPENAI_API_KEY en variables de entorno." }, { status: 500 });
    }

    const formData = await request.formData();
    const audio = formData.get("audio");
    if (!(audio instanceof File)) {
      return NextResponse.json({ error: "No se recibió ningún archivo de audio." }, { status: 400 });
    }

    const openaiForm = new FormData();
    openaiForm.append("file", audio, audio.name || "flowly-voice-test.webm");
    openaiForm.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1");
    openaiForm.append("language", "es");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openaiForm,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || "OpenAI no pudo transcribir el audio.", details: data }, { status: response.status });
    }

    return NextResponse.json({ text: data.text || "" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error inesperado transcribiendo audio." }, { status: 500 });
  }
}
