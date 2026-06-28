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

function wakePattern(wakeWord: string) {
  const escaped = cleanText(wakeWord).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s)(hola\\s+|oye\\s+|hey\\s+)?${escaped}(\\s|$)`, "i");
}

function containsWakeWord(value: string, wakeWord: string) {
  return wakePattern(wakeWord).test(cleanText(value).toLowerCase());
}

function removeWakeWord(value: string, wakeWord: string) {
  return cleanText(value).replace(wakePattern(wakeWord), " ").replace(/\s+/g, " ").trim();
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
  const awakeRef = useRef(false);
  const enabledRef = useRef(enabled);
  const manuallyStoppedRef = useRef(false);
  const startingRef = useRef(false);
  const processingRef = useRef(false);
  const speakingRef = useRef(false);
  const lastCommandRef = useRef("");
  const lastCommandAtRef = useRef(0);
  const idleTimeoutRef = useRef<number | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);

  const [supported, setSupported] = useState(true);
  const [active, setActive] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [state, setState] = useState<VoiceRuntimeState>("disabled");
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

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

  const setAwake = useCallback((value: boolean) => {
    awakeRef.current = value;
    setIsAwake(value);
  }, []);

  const goToSleep = useCallback(() => {
    clearIdleTimeout();
    setAwake(false);
    setTranscript("");
    if (activeRef.current) updateStatus("listening", "Di Flow para llamarme");
  }, [clearIdleTimeout, setAwake, updateStatus]);

  const scheduleSleep = useCallback(() => {
    clearIdleTimeout();
    idleTimeoutRef.current = window.setTimeout(goToSleep, 11000);
  }, [clearIdleTimeout, goToSleep]);

  const safeStart = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || !enabledRef.current || manuallyStoppedRef.current || startingRef.current || speakingRef.current) return;

    startingRef.current = true;
    try {
      recognition.start();
    } catch {
      // Chrome lanza excepción si ya estaba escuchando. Lo tratamos como activo.
      setActive(true);
      activeRef.current = true;
      updateStatus(awakeRef.current ? "awake" : "listening", awakeRef.current ? "Te escucho" : "Di Flow para llamarme");
    } finally {
      window.setTimeout(() => {
        startingRef.current = false;
      }, 450);
    }
  }, [updateStatus]);

  const restartListening = useCallback((delay = 500) => {
    clearRestartTimeout();
    if (!enabledRef.current || manuallyStoppedRef.current || speakingRef.current) return;
    restartTimeoutRef.current = window.setTimeout(() => safeStart(), delay);
  }, [clearRestartTimeout, safeStart]);

  const pauseRecognitionForSpeech = useCallback(() => {
    speakingRef.current = true;
    try { recognitionRef.current?.stop(); } catch { /* noop */ }
  }, []);

  const processCommand = useCallback(async (rawCommand: string) => {
    const command = cleanText(rawCommand);
    if (!command || command.length < 2) return;

    const now = Date.now();
    if (command === lastCommandRef.current && now - lastCommandAtRef.current < 3000) return;

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

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;

    const shortText = text.slice(0, 420);
    window.speechSynthesis.cancel();
    pauseRecognitionForSpeech();

    const utterance = new SpeechSynthesisUtterance(shortText);
    utterance.lang = "es-ES";
    utterance.rate = 1.02;
    utterance.pitch = 1.08;
    utterance.volume = 0.92;

    utterance.onstart = () => updateStatus("speaking", "Flow está hablando");
    utterance.onend = () => {
      speakingRef.current = false;
      if (activeRef.current) {
        updateStatus(awakeRef.current ? "awake" : "listening", awakeRef.current ? "Te escucho" : "Di Flow para llamarme");
        restartListening(420);
      }
    };
    utterance.onerror = () => {
      speakingRef.current = false;
      if (activeRef.current) restartListening(420);
    };

    window.speechSynthesis.speak(utterance);
  }, [pauseRecognitionForSpeech, restartListening, updateStatus]);

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
      speakingRef.current = false;

      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "es-ES";

      recognition.onstart = () => {
        setActive(true);
        activeRef.current = true;
        updateStatus(awakeRef.current ? "awake" : "listening", awakeRef.current ? "Te escucho" : "Di Flow para llamarme");
      };

      recognition.onerror = (event) => {
        const error = event.error || "unknown";
        if (error === "no-speech" || error === "audio-capture" || error === "network") {
          if (activeRef.current) restartListening(750);
          return;
        }
        if (error === "aborted") return;
        setActive(false);
        activeRef.current = false;
        updateStatus("error", error === "not-allowed" ? "Permiso de micrófono bloqueado" : `Error de voz: ${error}`);
      };

      recognition.onend = () => {
        if (!enabledRef.current || manuallyStoppedRef.current) return;
        if (activeRef.current || !speakingRef.current) restartListening(520);
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

        const raw = finalText || interimText;
        const heard = cleanText(raw).toLowerCase();
        if (!heard || speakingRef.current) return;

        setTranscript(heard);

        const hasWake = containsWakeWord(heard, wakeWord);

        if (!awakeRef.current) {
          if (!hasWake) return;

          setAwake(true);
          onWake?.();
          updateStatus("awake", "Te escucho");
          scheduleSleep();

          const inlineCommand = removeWakeWord(finalText || heard, wakeWord);
          if (finalText && inlineCommand.length >= 2 && !processingRef.current) {
            await processCommand(inlineCommand);
          }
          return;
        }

        scheduleSleep();

        if (!finalText || processingRef.current) return;
        const command = hasWake ? removeWakeWord(finalText, wakeWord) : cleanText(finalText);
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
  }, [onWake, processCommand, restartListening, safeStart, scheduleSleep, setAwake, updateStatus, wakeWord]);

  const deactivate = useCallback(() => {
    clearIdleTimeout();
    clearRestartTimeout();
    manuallyStoppedRef.current = true;
    activeRef.current = false;
    setAwake(false);
    setActive(false);
    setTranscript("");
    try { recognitionRef.current?.abort(); } catch { /* noop */ }
    updateStatus("disabled", "Voz desactivada");
  }, [clearIdleTimeout, clearRestartTimeout, setAwake, updateStatus]);

  useEffect(() => {
    const Recognition = getSpeechRecognitionConstructor();
    setSupported(Boolean(Recognition));
    if (!Recognition) updateStatus("unsupported", "Tu navegador no soporta escucha por voz");
    return () => {
      clearIdleTimeout();
      clearRestartTimeout();
      try { recognitionRef.current?.abort(); } catch { /* noop */ }
    };
  }, [clearIdleTimeout, clearRestartTimeout, updateStatus]);

  return {
    supported,
    active,
    isAwake,
    state,
    transcript,
    activate,
    deactivate,
    speak,
  };
}
