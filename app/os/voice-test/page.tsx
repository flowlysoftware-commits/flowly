"use client";

import { useMemo, useRef, useState } from "react";

type StepState = "idle" | "running" | "ok" | "error";

type LogItem = {
  label: string;
  state: StepState;
  detail?: string;
};

const initialLogs: LogItem[] = [
  { label: "Permiso de micrófono", state: "idle" },
  { label: "Grabación MediaRecorder", state: "idle" },
  { label: "Audio recibido", state: "idle" },
  { label: "Transcripción OpenAI", state: "idle" },
  { label: "Activación inteligente", state: "idle" },
  { label: "Brain", state: "idle" },
];

function updateLog(logs: LogItem[], label: string, state: StepState, detail?: string) {
  return logs.map((item) => (item.label === label ? { ...item, state, detail } : item));
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function detectMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/mpeg",
  ];
  return candidates.find((mime) => MediaRecorder.isTypeSupported(mime)) || "";
}

export default function VoiceTestPage() {
  const [logs, setLogs] = useState<LogItem[]>(initialLogs);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [brainReply, setBrainReply] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const supported = useMemo(() => {
    if (typeof window === "undefined") return true;

    const hasMediaRecorder = "MediaRecorder" in window;
    const hasMediaDevices = "mediaDevices" in navigator && Boolean(navigator.mediaDevices);
    const hasGetUserMedia = hasMediaDevices && "getUserMedia" in navigator.mediaDevices;

    return hasMediaRecorder && hasGetUserMedia;
  }, []);

  const reset = () => {
    setLogs(initialLogs);
    setTranscript("");
    setBrainReply("");
    setLastError(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  };

  const cleanup = () => {
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    chunksRef.current = [];
    setRecording(false);
  };

  const runBrain = async (text: string) => {
    setLogs((prev) => updateLog(prev, "Brain", "running", "Enviando texto al Brain..."));
    try {
      const response = await fetch("/api/voice-test/brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Brain no respondió correctamente.");
      setBrainReply(String(data.reply || ""));
      setLogs((prev) => updateLog(prev, "Brain", "ok", "Respuesta recibida."));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido al llamar al Brain.";
      setLastError(message);
      setLogs((prev) => updateLog(prev, "Brain", "error", message));
    }
  };

  const transcribe = async (blob: Blob) => {
    setLogs((prev) => updateLog(prev, "Transcripción OpenAI", "running", "Enviando audio a OpenAI..."));
    const formData = new FormData();
    const extension = blob.type.includes("mp4") ? "mp4" : "webm";
    formData.append("audio", blob, `flowly-voice-test.${extension}`);

    try {
      const response = await fetch("/api/voice-test/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "No se pudo transcribir el audio.");
      const text = String(data.text || "").trim();
      setTranscript(text);
      setLogs((prev) => updateLog(prev, "Transcripción OpenAI", text ? "ok" : "error", text || "OpenAI no devolvió texto."));

      const normalized = text.toLowerCase();
      const words = normalized.split(/\s+/).filter(Boolean);
      const hasWakeWord = /\b(hola\s+flow|oye\s+flow|flowly|flow|flou|flo|flor)\b/i.test(normalized);
      const looksDirected = hasWakeWord || words.length >= 3 || /\b(que|como|ayuda|abre|crea|muestra|dime|tengo|hacer|cliente|clientes|venta|ventas|factura|facturas|crm|whatsapp|objetivo|objetivos|tarea|tareas)\b/i.test(normalized);
      setLogs((prev) => updateLog(prev, "Activación inteligente", looksDirected ? "ok" : "error", looksDirected ? (hasWakeWord ? "Flow detectado." : "No dijo Flow, pero parece una petición válida para el Companion.") : "No parece una frase dirigida al Companion."));

      if (text && looksDirected) await runBrain(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido transcribiendo.";
      setLastError(message);
      setLogs((prev) => updateLog(prev, "Transcripción OpenAI", "error", message));
    }
  };

  const startRecording = async () => {
    reset();
    if (!supported) {
      setLastError("Este navegador no soporta MediaRecorder o getUserMedia.");
      return;
    }

    try {
      setLogs((prev) => updateLog(prev, "Permiso de micrófono", "running", "Solicitando acceso..."));
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setLogs((prev) => updateLog(prev, "Permiso de micrófono", "ok", "Permiso concedido."));

      const mimeType = detectMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        setLogs((prev) => updateLog(prev, "Grabación MediaRecorder", "error", "MediaRecorder lanzó un error."));
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const sizeText = formatBytes(blob.size);
        setAudioUrl(URL.createObjectURL(blob));
        setLogs((prev) => updateLog(prev, "Grabación MediaRecorder", "ok", "Grabación finalizada."));
        setLogs((prev) => updateLog(prev, "Audio recibido", blob.size > 1000 ? "ok" : "error", sizeText));
        cleanup();
        if (blob.size > 1000) await transcribe(blob);
      };

      setLogs((prev) => updateLog(prev, "Grabación MediaRecorder", "running", `Grabando 5 segundos${mimeType ? ` (${mimeType})` : ""}...`));
      setRecording(true);
      recorder.start(250);
      window.setTimeout(() => {
        if (recorder.state !== "inactive") recorder.stop();
      }, 5000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo activar el micrófono.";
      setLastError(message);
      setLogs((prev) => updateLog(prev, "Permiso de micrófono", "error", message));
      cleanup();
    }
  };

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-cyan-400/20 bg-white/[0.04] p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-200/70">Flowly OS · Diagnóstico de voz</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Prueba limpia del micrófono</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
            Esta pantalla no usa el Companion. Graba 5 segundos, envía el audio a OpenAI, detecta si es una frase para Flow y prueba el Brain. Sirve para saber exactamente dónde se corta la voz.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={startRecording}
              disabled={recording}
              className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {recording ? "Grabando 5 segundos..." : "🎙 Grabar 5 segundos"}
            </button>
            <button onClick={reset} className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-bold text-white/80 hover:bg-white/10">
              Reiniciar prueba
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {logs.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-white">{item.label}</p>
                  <span className={
                    item.state === "ok"
                      ? "rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-200"
                      : item.state === "error"
                        ? "rounded-full bg-rose-400/15 px-3 py-1 text-xs font-black text-rose-200"
                        : item.state === "running"
                          ? "rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-black text-cyan-200"
                          : "rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/50"
                  }>
                    {item.state === "ok" ? "OK" : item.state === "error" ? "ERROR" : item.state === "running" ? "PROBANDO" : "PENDIENTE"}
                  </span>
                </div>
                {item.detail && <p className="mt-2 text-sm text-white/55">{item.detail}</p>}
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h2 className="font-black">Audio grabado</h2>
              {audioUrl ? <audio controls src={audioUrl} className="mt-4 w-full" /> : <p className="mt-3 text-sm text-white/50">Todavía no hay audio.</p>}
            </section>
            <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h2 className="font-black">Transcripción</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-white/70">{transcript || "Todavía no hay transcripción."}</p>
            </section>
            <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h2 className="font-black">Respuesta Brain</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-white/70">{brainReply || "Todavía no hay respuesta."}</p>
            </section>
          </div>

          {lastError && (
            <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
              <strong>Error:</strong> {lastError}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
