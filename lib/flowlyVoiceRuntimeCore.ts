export type FlowlyVoiceRuntimeState =
  | "unsupported"
  | "disabled"
  | "permission"
  | "passive"
  | "waking"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";

export type FlowlyVoiceTranscriptionResult = {
  text: string;
  error?: string;
};

export function cleanText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?¿¡;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeText(value: string) {
  return cleanText(value).toLowerCase();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function stripFlowWakeWord(value: string, wakeWord = "flow") {
  const aliasPattern = [wakeWord, "flowly", "flow", "flou", "flo", "flor", "flui", "fluy", "floe"]
    .filter(Boolean)
    .map((alias) => escapeRegExp(alias))
    .join("|");

  return cleanText(value)
    .replace(new RegExp(`\\b(hola|oye|hey|buenas)\\s+(?:${aliasPattern})\\b`, "gi"), " ")
    .replace(new RegExp(`\\b(?:${aliasPattern})\\b`, "gi"), " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasWakeWord(value: string, wakeWord = "flow") {
  const aliasPattern = [wakeWord, "flowly", "flow", "flou", "flo", "flor", "flui", "fluy", "floe"]
    .filter(Boolean)
    .map((alias) => escapeRegExp(alias))
    .join("|");

  return new RegExp(`\\b(?:${aliasPattern})\\b`, "i").test(normalizeText(value));
}

export function isUsefulCommand(value: string, wakeWord = "flow") {
  const clean = normalizeText(value);
  if (!clean) return false;
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 3) return true;
  if (clean.length >= 10) return true;
  if (hasWakeWord(clean, wakeWord)) return false;
  return /\b(crm|cliente|clientes|venta|ventas|factura|facturas|whatsapp|agenda|tarea|tareas|objetivo|objetivos|hacer|ayuda|abre|dime|muestra|revisa|companion|flow)\b/i.test(clean);
}

export function bestMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

export async function requestTranscription(blob: Blob): Promise<FlowlyVoiceTranscriptionResult> {
  if (!blob.size || blob.size < 512) return { text: "", error: "Audio demasiado corto" };

  const form = new FormData();
  const extension = blob.type.includes("mp4") ? "m4a" : "webm";
  form.append("audio", blob, `flowly-voice.${extension}`);

  try {
    const response = await fetch("/api/voice-test/transcribe", { method: "POST", body: form });
    const data = await response.json().catch(() => null);
    const text = cleanText(typeof data?.text === "string" ? data.text : "");
    const error = typeof data?.error === "string" ? data.error : undefined;

    if (!response.ok) return { text, error: error || `Error HTTP ${response.status}` };
    return { text, error };
  } catch (error) {
    return { text: "", error: error instanceof Error ? error.message : "Error transcribiendo audio" };
  }
}

export async function recordAudioSegment(stream: MediaStream, durationMs = 4500): Promise<Blob | null> {
  if (typeof MediaRecorder === "undefined") return null;

  const mimeType = bestMimeType();
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: BlobPart[] = [];

  return new Promise((resolve) => {
    let resolved = false;
    const finish = () => {
      if (resolved) return;
      resolved = true;
      const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" });
      resolve(blob);
    };

    recorder.ondataavailable = (event) => {
      if (event.data?.size) chunks.push(event.data);
    };
    recorder.onerror = () => finish();
    recorder.onstop = () => finish();

    try {
      recorder.start(500);
      window.setTimeout(() => {
        try {
          if (recorder.state !== "inactive") recorder.stop();
          else finish();
        } catch {
          finish();
        }
      }, durationMs);
    } catch {
      finish();
    }
  });
}
