import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          text: "",
          error: "Falta OPENAI_API_KEY en variables de entorno.",
          audioReceived: false,
          audioSize: 0,
          provider: "openai",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audio = formData.get("audio");
    if (!(audio instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          text: "",
          error: "No se recibió ningún archivo de audio.",
          audioReceived: false,
          audioSize: 0,
          provider: "openai",
        },
        { status: 400 }
      );
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
      return NextResponse.json(
        {
          ok: false,
          text: "",
          error: data?.error?.message || "OpenAI no pudo transcribir el audio.",
          details: data,
          audioReceived: true,
          audioSize: audio.size,
          audioName: audio.name || "flowly-voice-test.webm",
          provider: "openai",
          status: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      ok: true,
      text: data.text || "",
      audioReceived: true,
      audioSize: audio.size,
      audioName: audio.name || "flowly-voice-test.webm",
      provider: "openai",
      status: response.status,
      raw: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        text: "",
        error: error instanceof Error ? error.message : "Error inesperado transcribiendo audio.",
        audioReceived: false,
        audioSize: 0,
        provider: "openai",
      },
      { status: 500 }
    );
  }
}
