import { NextResponse } from "next/server";

export const runtime = "nodejs";

type OpenAITranscriptionResponse = {
  text?: string;
};

function cleanText(value: unknown) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, text: "", error: "Missing OPENAI_API_KEY" },
        { status: 200 }
      );
    }

    const formData = await req.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof File) || audio.size < 256) {
      return NextResponse.json({ ok: true, text: "" });
    }

    const openAIForm = new FormData();
    openAIForm.append("file", audio, audio.name || "flowly-voice.webm");
    openAIForm.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1");
    openAIForm.append("language", "es");
    openAIForm.append("temperature", "0");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openAIForm,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return NextResponse.json(
        { ok: false, text: "", error: "Transcription failed", detail: detail.slice(0, 500) },
        { status: 200 }
      );
    }

    const data = (await response.json()) as OpenAITranscriptionResponse;
    return NextResponse.json({ ok: true, text: cleanText(data.text) });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        text: "",
        error: error instanceof Error ? error.message : "Unknown transcription error",
      },
      { status: 200 }
    );
  }
}
