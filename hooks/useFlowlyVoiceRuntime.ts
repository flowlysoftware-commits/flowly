"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type VoiceRuntimeState =
  | "unsupported"
  | "disabled"
  | "permission"
  | "passive"
  | "listening"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "error";

type VoiceRuntimeOptions = {
  wakeWord?: string;
  enabled?: boolean;
  onWake?: () => void;
  onCommand?: (text: string) => Promise<void> | void;
  onStatus?: (status: string) => void;
  onPhase?: (phase: VoiceRuntimeState) => void;
};

type TranscriptionResult = {
  text: string;
  error?: string;
};

function cleanText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?¿¡;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value: string) {
  return cleanText(value).toLowerCase();
}

function stripWakeWord(value: string) {
  return cleanText(value)
    .replace(/\b(hola|oye|hey|buenas)\s+(flowly|flow|flou|flo|flor|flui|fluy|floe)\b/gi, " ")
    .replace(/\b(flowly|flow|flou|flo|flor|flui|fluy|floe)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasWakeWord(value: string) {
  return /\b(flowly|flow|flou|flo|flor|flui|fluy|floe)\b/i.test(normalizeText(value));
}

function isUsefulCommand(value: string) {
  const clean = normalizeText(value);
  if (!clean) return false;
  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length >= 3) return true;
  if (clean.length >= 12) return true;

  return /\b(crm|cliente|clientes|venta|ventas|factura|facturas|whatsapp|agenda|tarea|tareas|objetivo|objetivos|hacer|ayuda|abre|dime|muestra|revisa|companion|flow|panel|hoy)\b/i.test(clean);
}

function getBestMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

async function transcribeAudio(blob: Blob): Promise<TranscriptionResult> {
  if (!blob.size || blob.size < 512) return { text: "", error: "Audio demasiado corto" };

  const form = new FormData();
  const extension = blob.type.includes("mp4") ? "m4a" : "webm";
  form.append("audio", blob, `flowly-companion.${extension}`);

  try {
    // Endpoint limpio que ya funciona en /os/voice-test.
    const response = await fetch("/api/voice-test/transcribe", {
      method: "POST",
      body: form,
    });
    const data = await response.json().catch(() => null);
    const text = cleanText(typeof data?.text === "string" ? data.text : "");
    const error = typeof data?.error === "string" ? data.error : undefined;

    if (!response.ok) return { text, error: error || `Error HTTP ${response.status}` };
    return { text, error };
  } catch (error) {
    return { text: "", error: error instanceof Error ? error.message : "Error de transcripción" };
  }
}

function recordSegment(stream: MediaStream, durationMs: number): Promise<Blob | null> {
  if (typeof MediaRecorder === "undefined") return Promise.resolve(null);

  const mimeType = getBestMimeType();
  const chunks: BlobPart[] = [];
  let recorder: MediaRecorder;

  try {
    recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  } catch {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve(new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" }));
    };

    recorder.ondataavailable = (event) => {
      if (event.data?.size) chunks.push(event.data);
    };
    recorder.onerror = finish;
    recorder.onstop = finish;

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

export function useFlowlyVoiceRuntime({
  enabled = true,
  onWake,
  onCommand,
  onStatus,
  onPhase,
}: VoiceRuntimeOptions = {}) {
  const enabledRef = useRef(enabled);
  const activeRef = useRef(false);
  const manualStopRef = useRef(false);
  const speakingRef = useRef(false);
  const recordingRef = useRef(false);
  const processingRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const speechSafetyTimeoutRef = useRef<number | null>(null);
  const lastCommandRef = useRef("");
  const lastCommandAtRef = useRef(0);
  const lastWakeAtRef = useRef(0);

  const [supported, setSupported] = useState(true);
  const [active, setActive] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [state, setState] = useState<VoiceRuntimeState>("disabled");
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const setPhase = useCallback((next: VoiceRuntimeState, label?: string) => {
    setState(next);
    onPhase?.(next);
    if (label) onStatus?.(label);
  }, [onPhase, onStatus]);

  const clearNextCycle = useCallback(() => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const scheduleNextCycle = useCallback((delayMs = 650) => {
    clearNextCycle();
    if (!activeRef.current || manualStopRef.current || !enabledRef.current) return;
    timeoutRef.current = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("flowly-voice-cycle"));
    }, delayMs);
  }, [clearNextCycle]);

  const ensureStream = useCallback(async () => {
    if (streamRef.current?.active) return streamRef.current;

    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setSupported(false);
      setPhase("unsupported", "Tu navegador no soporta voz avanzada");
      return null;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    streamRef.current = stream;
    return stream;
  }, [setPhase]);

  const processCommand = useCallback(async (rawText: string) => {
    const heard = cleanText(rawText);
    if (!heard) return;

    setTranscript(heard);

    const wake = hasWakeWord(heard);
    if (wake) {
      lastWakeAtRef.current = Date.now();
      setIsAwake(true);
      onWake?.();
    }

    // Flujo natural: si la transcripción tiene sentido, la tratamos como una orden.
    // No exigimos wake word exacta porque Whisper puede transcribir Flow de formas distintas.
    const command = stripWakeWord(heard) || heard;
    const recentlyAwake = Date.now() - lastWakeAtRef.current < 45000;
    const shouldAnswer = wake || recentlyAwake || isUsefulCommand(command);

    if (!shouldAnswer || !isUsefulCommand(command)) {
      setPhase("passive", `He oído: ${heard}`);
      return;
    }

    const commandKey = normalizeText(command);
    const now = Date.now();
    if (commandKey === lastCommandRef.current && now - lastCommandAtRef.current < 9000) {
      setPhase("passive", "He ignorado una frase repetida");
      return;
    }

    lastCommandRef.current = commandKey;
    lastCommandAtRef.current = now;
    processingRef.current = true;
    setIsAwake(true);
    setTranscript(command);
    setPhase("thinking", "Pensando con Flowly Brain");

    try {
      await onCommand?.(command);
    } finally {
      processingRef.current = false;
      setIsAwake(false);
      if (activeRef.current && !manualStopRef.current && !speakingRef.current) {
        setPhase("passive", "Voz activa. Puedes hablarme cuando quieras");
      }
    }
  }, [onCommand, onWake, setPhase]);

  const runCycle = useCallback(async () => {
    if (!activeRef.current || manualStopRef.current || !enabledRef.current) return;

    if (speakingRef.current || processingRef.current || recordingRef.current) {
      scheduleNextCycle(850);
      return;
    }

    const stream = await ensureStream().catch((error) => {
      console.error("Flowly voice stream error", error);
      return null;
    });
    if (!stream) {
      activeRef.current = false;
      setActive(false);
      return;
    }

    recordingRef.current = true;
    setPhase("listening", "Escuchando...");

    try {
      const blob = await recordSegment(stream, 4800);
      if (!activeRef.current || manualStopRef.current) return;

      if (!blob || blob.size < 1024) {
        setPhase("passive", "Voz activa. No he recibido suficiente audio");
        return;
      }

      setPhase("transcribing", `Transcribiendo ${Math.round(blob.size / 1024)} KB de audio`);
      const result = await transcribeAudio(blob);

      if (result.error && !result.text) {
        setTranscript(result.error);
        setPhase("passive", `No pude transcribir: ${result.error}`);
        return;
      }

      if (result.text) await processCommand(result.text);
      else setPhase("passive", "Voz activa. No he oído una frase clara");
    } finally {
      recordingRef.current = false;
      scheduleNextCycle(650);
    }
  }, [ensureStream, processCommand, scheduleNextCycle, setPhase]);

  const activate = useCallback(async () => {
    setPhase("permission", "Solicitando permiso de micrófono");
    try {
      const stream = await ensureStream();
      if (!stream) return false;

      manualStopRef.current = false;
      activeRef.current = true;
      setActive(true);
      setIsAwake(false);
      setTranscript("");
      setPhase("passive", "Voz activa. Puedes hablarme cuando quieras");
      scheduleNextCycle(350);
      return true;
    } catch (error) {
      console.error("Flowly voice activation error", error);
      activeRef.current = false;
      manualStopRef.current = true;
      setActive(false);
      setIsAwake(false);
      setPhase("error", "No he podido activar el micrófono. Revisa permisos del navegador.");
      return false;
    }
  }, [ensureStream, scheduleNextCycle, setPhase]);

  const deactivate = useCallback(() => {
    manualStopRef.current = true;
    activeRef.current = false;
    speakingRef.current = false;
    processingRef.current = false;
    recordingRef.current = false;
    clearNextCycle();
    stopStream();
    if (speechSafetyTimeoutRef.current !== null) window.clearTimeout(speechSafetyTimeoutRef.current);
    speechSafetyTimeoutRef.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setActive(false);
    setIsAwake(false);
    setTranscript("");
    setPhase("disabled", "Voz desactivada");
  }, [clearNextCycle, setPhase, stopStream]);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !text.trim()) return;
    if (!("speechSynthesis" in window)) return;

    const clean = text.replace(/[#*_`>\[\]]/g, " ").replace(/\s+/g, " ").slice(0, 520).trim();
    if (!clean) return;

    window.speechSynthesis.cancel();
    speakingRef.current = true;
    setPhase("speaking", "Flow está hablando");

    if (speechSafetyTimeoutRef.current !== null) window.clearTimeout(speechSafetyTimeoutRef.current);

    const finish = () => {
      if (speechSafetyTimeoutRef.current !== null) window.clearTimeout(speechSafetyTimeoutRef.current);
      speechSafetyTimeoutRef.current = null;
      speakingRef.current = false;
      if (activeRef.current && !manualStopRef.current) {
        setPhase("passive", "Voz activa. Puedes responderme cuando quieras");
        scheduleNextCycle(900);
      }
    };

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "es-ES";
    utterance.rate = 1.02;
    utterance.pitch = 1.08;
    utterance.volume = 0.94;
    utterance.onend = finish;
    utterance.onerror = finish;

    // Failsafe: Chrome a veces no dispara onend si se interrumpe el audio.
    const estimatedMs = Math.min(14000, Math.max(3500, clean.length * 65));
    speechSafetyTimeoutRef.current = window.setTimeout(finish, estimatedMs);

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      finish();
    }
  }, [scheduleNextCycle, setPhase]);

  useEffect(() => {
    const ok = typeof window !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined";
    setSupported(ok);
    if (!ok) setPhase("unsupported", "Tu navegador no soporta voz avanzada");
  }, [setPhase]);

  useEffect(() => {
    const onCycle = () => {
      void runCycle();
    };
    window.addEventListener("flowly-voice-cycle", onCycle);
    return () => window.removeEventListener("flowly-voice-cycle", onCycle);
  }, [runCycle]);

  useEffect(() => {
    return () => {
      manualStopRef.current = true;
      activeRef.current = false;
      clearNextCycle();
      stopStream();
      if (speechSafetyTimeoutRef.current !== null) window.clearTimeout(speechSafetyTimeoutRef.current);
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [clearNextCycle, stopStream]);

  return { supported, active, isAwake, state, transcript, activate, deactivate, speak };
}
