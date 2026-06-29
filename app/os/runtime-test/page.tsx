"use client";

import { useMemo } from "react";
import { useVoiceEngineV2 } from "@/hooks/useVoiceEngineV2";

export default function RuntimeTestPage() {
  const { snapshot, start, stop } = useVoiceEngineV2(true);

  const statusTone = useMemo(() => {
    if (snapshot.currentState === "error") return "text-rose-200";
    if (["speech_detected", "recording", "silence_wait", "uploading", "transcribing"].includes(snapshot.currentState)) return "text-cyan-200";
    if (snapshot.currentState === "speaking" || snapshot.currentState === "thinking") return "text-amber-200";
    return "text-white/70";
  }, [snapshot.currentState]);

  const formatTime = (value: number | null) => (value ? new Date(value).toLocaleTimeString("es-ES", { hour12: false }) : "—");

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-cyan-400/20 bg-white/[0.04] p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-200/70">Flowly OS · Voice Engine V2</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Runtime test</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
          Este panel valida una ruta independiente de voz con permiso de micrófono, MediaRecorder, transcripción OpenAI, detección de intención para Flow y respuesta de Brain.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={start}
            className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20"
          >
            Iniciar motor
          </button>
          <button
            type="button"
            onClick={stop}
            className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-bold text-white/80 hover:bg-white/10"
          >
            Detener motor
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h2 className="font-black">Estado general</h2>
            <div className={`mt-3 text-sm ${statusTone}`}>
              <div><strong>Permiso:</strong> {snapshot.permissionState}</div>
              <div><strong>Estado actual:</strong> {snapshot.currentState}</div>
              <div><strong>Estado anterior:</strong> {snapshot.previousState || "—"}</div>
              <div><strong>Grabando:</strong> {snapshot.recording ? "sí" : "no"}</div>
              <div><strong>Duración grabación:</strong> {snapshot.lastRecordingDurationMs} ms</div>
              <div><strong>Audio:</strong> {snapshot.lastAudioKb} KB</div>
              <div><strong>Última transición:</strong> {formatTime(snapshot.lastTransitionAt)}</div>
              <div><strong>Último silencio:</strong> {formatTime(snapshot.lastSilenceAt)}</div>
              <div><strong>Última voz detectada:</strong> {formatTime(snapshot.lastSpeechDetectedAt)}</div>
              <div><strong>Razón:</strong> {snapshot.lastReason || "—"}</div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h2 className="font-black">Transcripción</h2>
            <div className="mt-3 space-y-2 text-sm text-white/70">
              <div><strong>Estado de transcripción:</strong> {snapshot.lastTranscriptionStatus ?? "—"}</div>
              <div><strong>Texto limpio:</strong> {snapshot.lastTranscript || "—"}</div>
              <div><strong>Respuesta completa:</strong></div>
              <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-cyan-100">
                {snapshot.lastTranscriptionRawResponse || "—"}
              </pre>
              <div><strong>Wake detectado:</strong> {snapshot.wakeDetected ? "sí" : "no"}</div>
              <div><strong>Intención detectada:</strong> {snapshot.intentionDetected ? "sí" : "no"}</div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h2 className="font-black">Brain</h2>
            <div className="mt-3 space-y-2 text-sm text-white/70">
              <div><strong>Petición enviada:</strong> {snapshot.lastBrainRequest || "—"}</div>
              <div><strong>Respuesta Brain:</strong> {snapshot.lastBrainResponse || "—"}</div>
              <div><strong>Error:</strong> {snapshot.lastError || "—"}</div>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
          <h2 className="font-black">Configuración y trazas</h2>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <div className="space-y-1 text-sm text-white/70">
              <div><strong>minRecordingMs:</strong> {snapshot.config.minRecordingMs}</div>
              <div><strong>maxRecordingMs:</strong> {snapshot.config.maxRecordingMs}</div>
              <div><strong>silenceTimeoutMs:</strong> {snapshot.config.silenceTimeoutMs}</div>
              <div><strong>minAudioKb:</strong> {snapshot.config.minAudioKb}</div>
              <div><strong>debounceMs:</strong> {snapshot.config.debounceMs}</div>
              <div><strong>speakingCooldownMs:</strong> {snapshot.config.speakingCooldownMs}</div>
            </div>
            <div>
              <strong className="text-sm text-white/80">Últimos eventos</strong>
              <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-cyan-100">
                {snapshot.lastDebugEvents.length ? snapshot.lastDebugEvents.join("\n") : "—"}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
