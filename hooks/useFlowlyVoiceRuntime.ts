"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type VoiceRuntimeOptions = {
  wakeWord?: string;
  enabled?: boolean;
  onWake?: () => void;
  onCommand?: (text: string) => Promise<void> | void;
  onStatus?: (status: string) => void;
};

type VoiceRuntimeState =
  | "unsupported"
  | "disabled"
  | "permission"
  | "listening"
  | "awake"
  | "thinking"
  | "speaking"
  | "error";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function cleanText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?¿¡;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getWakeRegex(wakeWord: string) {
  const escaped = wakeWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s)(hola\\s+)?${escaped}(\\s|$)`, "i");
}

function containsWakeWord(value: string, wakeWord: string) {
  return getWakeRegex(wakeWord).test(cleanText(value).toLowerCase());
}

function removeWakeWord(value: string, wakeWord: string) {
  return cleanText(value.replace(getWakeRegex(wakeWord), " "));
}

export function useFlowlyVoiceRuntime({
  wakeWord = "flow",
  enabled = true,
  onWake,
  onCommand,
  onStatus,
}: VoiceRuntimeOptions = {}) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const activeRef = useRef(false);
  const manuallyStoppedRef = useRef(false);
  const startingRef = useRef(false);
  const awakeRef = useRef(false);
  const processingRef = useRef(false);
  const lastCommandRef = useRef("");
  const lastCommandAtRef = useRef(0);
  const idleTimeoutRef = useRef<number | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);

  const [supported, setSupported] = useState(true);
  const [active, setActive] = useState(false);
  const [state, setState] = useState<VoiceRuntimeState>("disabled");
  const [transcript, setTranscript] = useState("");

  const updateStatus = useCallback((next: VoiceRuntimeState, label?: string) => {
    setState(next);
    if (label) onStatus?.(label);
  }, [onStatus]);

  const clearIdleTimeout = useCallback(() => {
    if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = null;
  }, []);

  const clearRestartTimeout = useCallback(() => {
    if (restartTimeoutRef.current) window.clearTimeout(restartTimeoutRef.current);
    restartTimeoutRef.current = null;
  }, []);

  const goToSleep = useCallback(() => {
    clearIdleTimeout();
    awakeRef.current = false;
    setTranscript("");
    if (activeRef.current) updateStatus("listening", "Escuchando la palabra Flow");
  }, [clearIdleTimeout, updateStatus]);

  const scheduleSleep = useCallback(() => {
    clearIdleTimeout();
    idleTimeoutRef.current = window.setTimeout(goToSleep, 9500);
  }, [clearIdleTimeout, goToSleep]);

  const safeStart = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || !enabled || manuallyStoppedRef.current || startingRef.current) return;
    startingRef.current = true;
    try {
      recognition.start();
    } catch {
      // Chrome lanza excepción si ya está escuchando. Lo tratamos como activo.
      setActive(true);
      activeRef.current = true;
      updateStatus(awakeRef.current ? "awake" : "listening", awakeRef.current ? "Flow sigue atento" : "Di Flow para llamarme");
    } finally {
      window.setTimeout(() => {
        startingRef.current = false;
      }, 300);
    }
  }, [enabled, updateStatus]);

  const restartListening = useCallback((delay = 450) => {
    clearRestartTimeout();
    if (!enabled || manuallyStoppedRef.current) return;
    restartTimeoutRef.current = window.setTimeout(() => safeStart(), delay);
  }, [clearRestartTimeout, enabled, safeStart]);

  const pauseRecognitionForSpeech = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch { /* noop */ }
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;

    const shortText = text.slice(0, 320);
    window.speechSynthesis.cancel();

    // Evita que el micro transcriba la propia voz de Flow.
    pauseRecognitionForSpeech();

    const utterance = new SpeechSynthesisUtterance(shortText);
    utterance.lang = "es-ES";
    utterance.rate = 1.02;
    utterance.pitch = 1.08;
    utterance.volume = 0.92;

    utterance.onstart = () => updateStatus("speaking", "Flow está hablando");
    utterance.onend = () => {
      if (activeRef.current) {
        updateStatus(awakeRef.current ? "awake" : "listening", awakeRef.current ? "Flow sigue atento" : "Escuchando la palabra Flow");
        restartListening(350);
      }
    };
    utterance.onerror = () => {
      if (activeRef.current) restartListening(350);
    };

    window.speechSynthesis.speak(utterance);
  }, [pauseRecognitionForSpeech, restartListening, updateStatus]);

  const processCommand = useCallback(async (rawCommand: string) => {
    const command = cleanText(rawCommand);
    if (!command || command.length < 3) return;

    const now = Date.now();
    if (command === lastCommandRef.current && now - lastCommandAtRef.current < 2500) return;

    lastCommandRef.current = command;
    lastCommandAtRef.current = now;
    processingRef.current = true;
    updateStatus("thinking", "Pensando con Flowly Brain");

    try {
      await onCommand?.(command);
    } finally {
      processingRef.current = false;
      scheduleSleep();
    }
  }, [onCommand, scheduleSleep, updateStatus]);

  const activate = useCallback(async () => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setSupported(false);
      updateStatus("unsupported", "Tu navegador no soporta escucha por voz");
      return false;
    }

    try {
      updateStatus("permission", "Solicitando permiso de micrófono");

      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        stream.getTracks().forEach((track) => track.stop());
      }

      try { recognitionRef.current?.abort(); } catch { /* noop */ }

      manuallyStoppedRef.current = false;
      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "es-ES";

      recognition.onstart = () => {
        setActive(true);
        activeRef.current = true;
        updateStatus(awakeRef.current ? "awake" : "listening", awakeRef.current ? "Flow sigue atento" : "Di Flow para llamarme");
      };

      recognition.onerror = (event) => {
        const error = event.error || "unknown";
        if (error === "no-speech" || error === "audio-capture" || error === "network") {
          if (activeRef.current) restartListening(700);
          return;
        }
        if (error === "aborted") return;
        setActive(false);
        activeRef.current = false;
        updateStatus("error", error === "not-allowed" ? "Permiso de micrófono bloqueado" : `Error de voz: ${error}`);
      };

      recognition.onend = () => {
        if (!enabled || manuallyStoppedRef.current) return;
        if (activeRef.current) restartListening(450);
      };

      recognition.onresult = async (event) => {
        let finalText = "";
        let interimText = "";

        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          const phrase = result[0]?.transcript || "";
          if (result.isFinal) finalText += phrase;
          else interimText += phrase;
        }

        const heard = cleanText(finalText || interimText).toLowerCase();
        if (!heard) return;

        setTranscript(heard);

        const hasWake = containsWakeWord(heard, wakeWord);
        if (!awakeRef.current) {
          if (!hasWake) return;

          awakeRef.current = true;
          onWake?.();
          updateStatus("awake", "Te escucho");
          scheduleSleep();

          const inlineCommand = removeWakeWord(finalText || heard, wakeWord);
          if (finalText && inlineCommand.length >= 3 && !processingRef.current) {
            await processCommand(inlineCommand);
          } else {
            speak("Te escucho");
          }
          return;
        }

        scheduleSleep();

        if (!finalText || processingRef.current) return;
        const command = removeWakeWord(finalText, wakeWord);
        await processCommand(command);
      };

      recognitionRef.current = recognition;
      safeStart();
      return true;
    } catch (error) {
      console.error("Flowly voice runtime error", error);
      setActive(false);
      activeRef.current = false;
      updateStatus("error", "No he podido activar el micrófono");
      return false;
    }
  }, [enabled, onWake, processCommand, restartListening, safeStart, scheduleSleep, speak, updateStatus, wakeWord]);

  const deactivate = useCallback(() => {
    clearIdleTimeout();
    clearRestartTimeout();
    manuallyStoppedRef.current = true;
    awakeRef.current = false;
    activeRef.current = false;
    setActive(false);
    setTranscript("");
    updateStatus("disabled", "Voz desactivada");
    try { recognitionRef.current?.abort(); } catch { /* noop */ }
    recognitionRef.current = null;
  }, [clearIdleTimeout, clearRestartTimeout, updateStatus]);

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognitionConstructor()));
    return () => deactivate();
  }, [deactivate]);

  return {
    supported,
    active,
    state,
    transcript,
    activate,
    deactivate,
    speak,
    isAwake: state === "awake" || state === "thinking" || state === "speaking",
  };
}
