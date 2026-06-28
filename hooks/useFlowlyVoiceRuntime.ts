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

type RecorderResult = {
  blob: Blob;
  durationMs: number;
  hadVoice: boolean;
  size: number;
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

function normalizeForWake(value: string) {
  return cleanText(value).toLowerCase();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wakeAliases(wakeWord: string) {
  const base = escapeRegExp(normalizeForWake(wakeWord || "flow"));
  return [base, "flowly", "flou", "flo", "flor", "flow li", "floui", "fluy", "floe"].filter(Boolean);
}

function wakeRegex(wakeWord: string) {
  return new RegExp(`(^|\\s)(hola\\s+|oye\\s+|hey\\s+|buenas\\s+)?(${wakeAliases(wakeWord).join("|")})(\\s|$)`, "i");
}

function containsWakeWord(value: string, wakeWord: string) {
  return wakeRegex(wakeWord).test(normalizeForWake(value));
}

function removeWakeWord(value: string, wakeWord: string) {
  return cleanText(value).replace(wakeRegex(wakeWord), " ").replace(/\s+/g, " ").trim();
}

function commandLooksComplete(value: string) {
  const clean = cleanText(value);
  const words = clean.split(/\s+/).filter(Boolean);
  return clean.length >= 6 || words.length >= 2;
}

function looksLikeDirectedCommand(value: string) {
  const clean = normalizeForWake(value);
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 4) return true;
  return /\b(que|como|ayuda|abre|crea|muestra|dime|tengo|hacer|cliente|clientes|venta|ventas|factura|facturas|crm|whatsapp|objetivo|objetivos|tarea|tareas)\b/i.test(clean) && words.length >= 2;
}

function bestMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

async function requestTranscription(blob: Blob): Promise<TranscriptionResult> {
  if (!blob.size || blob.size < 512) return { text: "", error: "Audio demasiado corto" };

  const form = new FormData();
  const extension = blob.type.includes("mp4") ? "m4a" : "webm";
  form.append("audio", blob, `flowly-voice.${extension}`);

  try {
    const response = await fetch("/api/companion/transcribe", {
      method: "POST",
      body: form,
    });

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
  const awakeRef = useRef(false);
  const speakingRef = useRef(false);
  const processingRef = useRef(false);
  const manualStopRef = useRef(false);
  const loopTimerRef = useRef<number | null>(null);
  const loopRunningRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const lastCommandRef = useRef("");
  const lastCommandAtRef = useRef(0);
  const lastAwakeAtRef = useRef(0);
  const passiveLoopRef = useRef<() => Promise<void>>(async () => undefined);

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

  const setAwake = useCallback((value: boolean) => {
    awakeRef.current = value;
    if (value) lastAwakeAtRef.current = Date.now();
    setIsAwake(value);
  }, []);

  const clearLoopTimer = useCallback(() => {
    if (loopTimerRef.current) window.clearTimeout(loopTimerRef.current);
    loopTimerRef.current = null;
  }, []);

  const getAudioLevel = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return 0;
    const buffer = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(buffer);
    let sum = 0;
    for (const value of buffer) {
      const normalized = (value - 128) / 128;
      sum += normalized * normalized;
    }
    return Math.sqrt(sum / buffer.length);
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    try { void audioContextRef.current?.close(); } catch { /* noop */ }
    audioContextRef.current = null;
    analyserRef.current = null;
  }, []);

  const ensureAudio = useCallback(async () => {
    if (streamRef.current && streamRef.current.active) {
      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume().catch(() => undefined);
      }
      return streamRef.current;
    }

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined" || !AudioContextCtor) {
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

    const audioContext = new AudioContextCtor();
    await audioContext.resume().catch(() => undefined);
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.72;
    source.connect(analyser);

    streamRef.current = stream;
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    return stream;
  }, [setPhase]);

  const recordSegment = useCallback(async ({
    maxMs,
    minMs = 900,
    stopOnSilence = false,
    silenceMs = 1200,
    voiceThreshold = 0.006,
  }: {
    maxMs: number;
    minMs?: number;
    stopOnSilence?: boolean;
    silenceMs?: number;
    voiceThreshold?: number;
  }): Promise<RecorderResult | null> => {
    const stream = await ensureAudio();
    if (!stream) return null;

    const mimeType = bestMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: BlobPart[] = [];
    let hadVoice = false;
    let voiceStarted = false;
    let lastVoiceAt = Date.now();
    const startedAt = Date.now();

    return new Promise((resolve) => {
      let settled = false;
      let monitor: number | null = null;
      let hardStop: number | null = null;

      const finish = () => {
        if (settled) return;
        settled = true;
        if (monitor) window.clearInterval(monitor);
        if (hardStop) window.clearTimeout(hardStop);
        const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" });
        resolve({ blob, durationMs: Date.now() - startedAt, hadVoice, size: blob.size });
      };

      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunks.push(event.data);
      };
      recorder.onerror = () => finish();
      recorder.onstop = () => finish();

      try {
        recorder.start(250);
      } catch {
        finish();
        return;
      }

      monitor = window.setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const level = getAudioLevel();
        if (level > voiceThreshold) {
          hadVoice = true;
          voiceStarted = true;
          lastVoiceAt = Date.now();
        }

        if (stopOnSilence && elapsed >= minMs && voiceStarted && Date.now() - lastVoiceAt >= silenceMs) {
          try { recorder.stop(); } catch { finish(); }
        }
      }, 90);

      hardStop = window.setTimeout(() => {
        try { recorder.stop(); } catch { finish(); }
      }, maxMs);
    });
  }, [ensureAudio, getAudioLevel]);

  const schedulePassiveLoop = useCallback((delay = 450) => {
    clearLoopTimer();
    if (!activeRef.current || manualStopRef.current || !enabledRef.current) return;
    loopTimerRef.current = window.setTimeout(() => {
      void passiveLoopRef.current();
    }, delay);
  }, [clearLoopTimer]);

  const goPassive = useCallback(() => {
    setAwake(false);
    if (activeRef.current && !manualStopRef.current) {
      setPhase("passive", "Voz activa. Puedes decir Flow o hablarme directamente");
      schedulePassiveLoop(550);
    }
  }, [schedulePassiveLoop, setAwake, setPhase]);

  const processCommand = useCallback(async (raw: string) => {
    const command = cleanText(removeWakeWord(raw, wakeWord));
    if (!commandLooksComplete(command)) {
      setTranscript(command || raw);
      setPhase("passive", "No he entendido la frase completa. Di Flow y repítelo.");
      goPassive();
      return;
    }

    const now = Date.now();
    if (command === lastCommandRef.current && now - lastCommandAtRef.current < 4500) return;
    lastCommandRef.current = command;
    lastCommandAtRef.current = now;

    processingRef.current = true;
    clearLoopTimer();
    setTranscript(command);
    setPhase("thinking", "Pensando con Flowly Brain");

    try {
      await onCommand?.(command);
    } finally {
      processingRef.current = false;
      setAwake(false);
    }
  }, [clearLoopTimer, goPassive, onCommand, setAwake, setPhase, wakeWord]);

  const captureCommandAfterWake = useCallback(async () => {
    if (!activeRef.current || speakingRef.current || processingRef.current) return;
    clearLoopTimer();
    setPhase("listening", "Te escucho. Habla normal y espera un segundo al terminar.");
    setTranscript("");

    const segment = await recordSegment({ maxMs: 9500, minMs: 1400, stopOnSilence: true, silenceMs: 1450, voiceThreshold: 0.005 });
    if (!segment || !activeRef.current) return;

    setPhase("listening", `Procesando tu frase (${Math.round(segment.size / 1024)} KB)`);
    const result = await requestTranscription(segment.blob);
    if (result.error) setPhase("listening", `Transcripción: ${result.error}`);

    const text = result.text;
    const command = removeWakeWord(text, wakeWord) || text;
    setTranscript(command || text);

    if (commandLooksComplete(command)) {
      await processCommand(command);
    } else {
      setPhase("passive", "No he captado la frase completa. Puedes hablarme de nuevo.");
      goPassive();
    }
  }, [clearLoopTimer, goPassive, processCommand, recordSegment, setPhase, wakeWord]);

  passiveLoopRef.current = useCallback(async () => {
    if (!activeRef.current || manualStopRef.current || !enabledRef.current) return;
    if (loopRunningRef.current) return;

    if (speakingRef.current || processingRef.current) {
      schedulePassiveLoop(700);
      return;
    }

    loopRunningRef.current = true;
    try {
      setPhase("passive", "Voz activa. Puedes decir Flow o hablarme directamente");
      const segment = await recordSegment({ maxMs: 4200, minMs: 1800, stopOnSilence: false, voiceThreshold: 0.005 });
      if (!segment || !activeRef.current || manualStopRef.current) return;

      // Importante: transcribimos aunque el medidor no haya detectado voz.
      // Algunos micros/WebAudio dan niveles muy bajos aunque el audio sí llegue bien al blob.
      if (segment.size > 1024) {
        setPhase("passive", `Escuchando audio (${Math.round(segment.size / 1024)} KB)`);
        const result = await requestTranscription(segment.blob);
        if (result.error) {
          setTranscript(result.error);
          setPhase("passive", `Voz activa, pero no pude transcribir: ${result.error}`);
        }

        const text = result.text;
        if (text) setTranscript(text);

        if (text) {
          const hasWake = containsWakeWord(text, wakeWord);
          const afterWake = removeWakeWord(text, wakeWord);
          const recentlyAwake = Date.now() - lastAwakeAtRef.current < 18000;
          const shouldTreatAsCommand = hasWake || recentlyAwake || looksLikeDirectedCommand(text);

          if (hasWake) {
            setAwake(true);
            onWake?.();
          }

          if (shouldTreatAsCommand && commandLooksComplete(afterWake || text)) {
            setAwake(true);
            await processCommand(afterWake || text);
          } else if (hasWake) {
            setPhase("waking", "Te escucho. Dime qué necesitas.");
            await captureCommandAfterWake();
          } else {
            setPhase("passive", "Voz activa. Estoy escuchando el panel.");
          }
        }
      }
    } finally {
      loopRunningRef.current = false;
      if (activeRef.current && !manualStopRef.current && !speakingRef.current && !processingRef.current) {
        schedulePassiveLoop(350);
      }
    }
  }, [captureCommandAfterWake, onWake, processCommand, recordSegment, schedulePassiveLoop, setAwake, setPhase, wakeWord]);

  const activate = useCallback(async () => {
    if (activeRef.current) return true;
    setPhase("permission", "Solicitando permiso de micrófono");

    try {
      const stream = await ensureAudio();
      if (!stream) return false;

      manualStopRef.current = false;
      activeRef.current = true;
      setActive(true);
      setAwake(false);
      setTranscript("");
      setPhase("passive", "Voz activa. Puedes decir Flow o hablarme directamente");
      schedulePassiveLoop(400);
      return true;
    } catch (error) {
      console.error("Flowly voice runtime error", error);
      activeRef.current = false;
      setActive(false);
      setAwake(false);
      setPhase("error", "No he podido activar el micrófono. Revisa permisos del navegador.");
      return false;
    }
  }, [ensureAudio, schedulePassiveLoop, setAwake, setPhase]);

  const deactivate = useCallback(() => {
    manualStopRef.current = true;
    activeRef.current = false;
    speakingRef.current = false;
    processingRef.current = false;
    loopRunningRef.current = false;
    clearLoopTimer();
    stopStream();
    setActive(false);
    setAwake(false);
    setTranscript("");
    setPhase("disabled", "Voz desactivada");
  }, [clearLoopTimer, setAwake, setPhase, stopStream]);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) {
      goPassive();
      return;
    }

    const shortText = text.replace(/[#*_`>\[\]]/g, " ").replace(/\s+/g, " ").slice(0, 520);
    window.speechSynthesis.cancel();

    speakingRef.current = true;
    clearLoopTimer();

    const utterance = new SpeechSynthesisUtterance(shortText);
    utterance.lang = "es-ES";
    utterance.rate = 1.02;
    utterance.pitch = 1.08;
    utterance.volume = 0.94;

    utterance.onstart = () => setPhase("speaking", "Flow está hablando");
    utterance.onend = () => {
      speakingRef.current = false;
      goPassive();
    };
    utterance.onerror = () => {
      speakingRef.current = false;
      goPassive();
    };

    window.speechSynthesis.speak(utterance);
  }, [clearLoopTimer, goPassive, setPhase]);

  useEffect(() => {
    const ok = typeof window !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined";
    setSupported(ok);
    if (!ok) setPhase("unsupported", "Tu navegador no soporta voz avanzada");
    return () => {
      manualStopRef.current = true;
      activeRef.current = false;
      loopRunningRef.current = false;
      clearLoopTimer();
      stopStream();
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [clearLoopTimer, setPhase, stopStream]);

  return { supported, active, isAwake, state, transcript, activate, deactivate, speak };
}
