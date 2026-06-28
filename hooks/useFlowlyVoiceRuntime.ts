"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type VoiceRuntimeState =
  | "unsupported"
  | "disabled"
  | "permission"
  | "passive"
  | "waking"
  | "listening"
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

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wakeAliases(wakeWord: string) {
  const base = escapeRegExp(normalizeText(wakeWord || "flow"));
  return [base, "flowly", "flou", "flo", "flor", "flui", "fluy", "floe", "flow li"].filter(Boolean);
}

function wakeRegex(wakeWord: string) {
  return new RegExp(`(^|\\s)(hola\\s+|oye\\s+|hey\\s+|buenas\\s+)?(${wakeAliases(wakeWord).join("|")})(\\s|$)`, "i");
}

function hasWakeWord(value: string, wakeWord: string) {
  return wakeRegex(wakeWord).test(normalizeText(value));
}

function stripWakeWord(value: string, wakeWord: string) {
  return cleanText(value).replace(wakeRegex(wakeWord), " ").replace(/\s+/g, " ").trim();
}

function isUsefulCommand(value: string) {
  const clean = normalizeText(value);
  if (!clean) return false;
  const words = clean.split(/\s+/).filter(Boolean);
  if (clean.length >= 10 || words.length >= 3) return true;
  return /\b(crm|cliente|clientes|venta|ventas|factura|facturas|whatsapp|agenda|tarea|tareas|objetivo|objetivos|hacer|ayuda|abre|dime|muestra|revisa|flow)\b/i.test(clean);
}

function bestMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

async function requestTranscription(blob: Blob): Promise<TranscriptionResult> {
  if (!blob.size || blob.size < 512) return { text: "", error: "Audio demasiado corto" };

  const form = new FormData();
  const extension = blob.type.includes("mp4") ? "m4a" : "webm";
  form.append("audio", blob, `flowly-voice.${extension}`);

  try {
    const response = await fetch("/api/companion/transcribe", { method: "POST", body: form });
    const data = await response.json().catch(() => null);
    const text = cleanText(typeof data?.text === "string" ? data.text : "");
    const error = typeof data?.error === "string" ? data.error : undefined;
    const detail = typeof data?.detail === "string" ? data.detail : undefined;

    if (!response.ok) return { text, error: error || `Error HTTP ${response.status}` };
    if (error && !text) return { text: "", error: detail ? `${error}: ${detail}` : error };
    return { text };
  } catch (error) {
    return { text: "", error: error instanceof Error ? error.message : "Error transcribiendo audio" };
  }
}

export function useFlowlyVoiceRuntime({
  wakeWord = "flow",
  enabled = true,
  onWake,
  onCommand,
  onStatus,
  onPhase,
}: VoiceRuntimeOptions = {}) {
  const enabledRef = useRef(enabled);
  const activeRef = useRef(false);
  const speakingRef = useRef(false);
  const processingRef = useRef(false);
  const manualStopRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const loopTimerRef = useRef<number | null>(null);
  const lastCommandRef = useRef("");
  const lastCommandAtRef = useRef(0);
  const lastAwakeAtRef = useRef(0);

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

  const clearLoopTimer = useCallback(() => {
    if (loopTimerRef.current) window.clearTimeout(loopTimerRef.current);
    loopTimerRef.current = null;
  }, []);

  const setAwakeState = useCallback((value: boolean) => {
    if (value) lastAwakeAtRef.current = Date.now();
    setIsAwake(value);
  }, []);

  const stopRecorder = useCallback(() => {
    const recorder = recorderRef.current;
    recorderRef.current = null;
    if (recorder && recorder.state !== "inactive") {
      try { recorder.stop(); } catch { /* noop */ }
    }
  }, []);

  const stopStream = useCallback(() => {
    stopRecorder();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, [stopRecorder]);

  const ensureStream = useCallback(async () => {
    if (streamRef.current && streamRef.current.active) return streamRef.current;

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

  const recordFixedSegment = useCallback(async (durationMs = 5200): Promise<Blob | null> => {
    const stream = await ensureStream();
    if (!stream) return null;

    const mimeType = bestMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;
    const chunks: BlobPart[] = [];

    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        recorderRef.current = null;
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
      } catch {
        finish();
        return;
      }

      window.setTimeout(() => {
        if (recorder.state !== "inactive") {
          try { recorder.stop(); } catch { finish(); }
        } else {
          finish();
        }
      }, durationMs);
    });
  }, [ensureStream]);

  const processCommand = useCallback(async (raw: string) => {
    const command = cleanText(stripWakeWord(raw, wakeWord) || raw);
    if (!isUsefulCommand(command)) {
      setTranscript(command || raw);
      setPhase("passive", "Te he oído, pero no he detectado una petición clara");
      return;
    }

    const now = Date.now();
    if (command === lastCommandRef.current && now - lastCommandAtRef.current < 6500) return;
    lastCommandRef.current = command;
    lastCommandAtRef.current = now;

    processingRef.current = true;
    clearLoopTimer();
    setAwakeState(true);
    setTranscript(command);
    setPhase("thinking", "Pensando con Flowly Brain");

    try {
      await onCommand?.(command);
    } finally {
      processingRef.current = false;
      setAwakeState(false);
      if (activeRef.current && !manualStopRef.current) {
        setPhase("passive", "Voz activa. Puedes hablarme cuando quieras");
      }
    }
  }, [clearLoopTimer, onCommand, setAwakeState, setPhase, wakeWord]);

  const runListenLoop = useCallback(async () => {
    if (!activeRef.current || manualStopRef.current || !enabledRef.current) return;
    if (speakingRef.current || processingRef.current) {
      loopTimerRef.current = window.setTimeout(() => void runListenLoop(), 900);
      return;
    }

    setPhase("listening", "Escuchando...");
    const blob = await recordFixedSegment(5200);
    if (!activeRef.current || manualStopRef.current) return;

    if (blob && blob.size > 1024) {
      setPhase("listening", `Procesando audio (${Math.round(blob.size / 1024)} KB)`);
      const result = await requestTranscription(blob);
      if (result.error && !result.text) {
        setTranscript(result.error);
        setPhase("passive", `Voz activa, pero no pude transcribir: ${result.error}`);
      }

      const text = result.text;
      if (text) {
        setTranscript(text);
        const wake = hasWakeWord(text, wakeWord);
        const recentlyAwake = Date.now() - lastAwakeAtRef.current < 25000;
        const shouldAnswer = wake || recentlyAwake || isUsefulCommand(text);

        if (wake) {
          setAwakeState(true);
          onWake?.();
        }

        if (shouldAnswer) {
          await processCommand(text);
        } else {
          setPhase("passive", "Voz activa. Sigo escuchando");
        }
      } else {
        setPhase("passive", "Voz activa. No he oído una frase clara");
      }
    } else {
      setPhase("passive", "Voz activa. Sigo escuchando");
    }

    if (activeRef.current && !manualStopRef.current) {
      loopTimerRef.current = window.setTimeout(() => void runListenLoop(), 450);
    }
  }, [onWake, processCommand, recordFixedSegment, setAwakeState, setPhase, wakeWord]);

  const activate = useCallback(async () => {
    if (activeRef.current) return true;
    setPhase("permission", "Solicitando permiso de micrófono");

    try {
      const stream = await ensureStream();
      if (!stream) return false;

      manualStopRef.current = false;
      activeRef.current = true;
      setActive(true);
      setAwakeState(false);
      setTranscript("");
      setPhase("passive", "Voz activa. Puedes hablarme cuando quieras");
      clearLoopTimer();
      loopTimerRef.current = window.setTimeout(() => void runListenLoop(), 350);
      return true;
    } catch (error) {
      console.error("Flowly voice runtime error", error);
      activeRef.current = false;
      setActive(false);
      setAwakeState(false);
      setPhase("error", "No he podido activar el micrófono. Revisa permisos del navegador.");
      return false;
    }
  }, [clearLoopTimer, ensureStream, runListenLoop, setAwakeState, setPhase]);

  const deactivate = useCallback(() => {
    manualStopRef.current = true;
    activeRef.current = false;
    speakingRef.current = false;
    processingRef.current = false;
    clearLoopTimer();
    stopStream();
    setActive(false);
    setAwakeState(false);
    setTranscript("");
    setPhase("disabled", "Voz desactivada");
  }, [clearLoopTimer, setAwakeState, setPhase, stopStream]);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) {
      if (activeRef.current && !manualStopRef.current) loopTimerRef.current = window.setTimeout(() => void runListenLoop(), 450);
      return;
    }

    const shortText = text.replace(/[#*_`>\[\]]/g, " ").replace(/\s+/g, " ").slice(0, 520);
    window.speechSynthesis.cancel();
    clearLoopTimer();
    stopRecorder();

    speakingRef.current = true;
    const utterance = new SpeechSynthesisUtterance(shortText);
    utterance.lang = "es-ES";
    utterance.rate = 1.02;
    utterance.pitch = 1.08;
    utterance.volume = 0.94;

    utterance.onstart = () => setPhase("speaking", "Flow está hablando");
    utterance.onend = () => {
      speakingRef.current = false;
      if (activeRef.current && !manualStopRef.current) {
        setPhase("passive", "Voz activa. Puedes responderme cuando quieras");
        loopTimerRef.current = window.setTimeout(() => void runListenLoop(), 700);
      }
    };
    utterance.onerror = () => {
      speakingRef.current = false;
      if (activeRef.current && !manualStopRef.current) {
        setPhase("passive", "Voz activa. Puedes responderme cuando quieras");
        loopTimerRef.current = window.setTimeout(() => void runListenLoop(), 700);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [clearLoopTimer, runListenLoop, setPhase, stopRecorder]);

  useEffect(() => {
    const ok = typeof window !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined";
    setSupported(ok);
    if (!ok) setPhase("unsupported", "Tu navegador no soporta voz avanzada");
    return () => {
      manualStopRef.current = true;
      activeRef.current = false;
      clearLoopTimer();
      stopStream();
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [clearLoopTimer, setPhase, stopStream]);

  return { supported, active, isAwake, state, transcript, activate, deactivate, speak };
}
