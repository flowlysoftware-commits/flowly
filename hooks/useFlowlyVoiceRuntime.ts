"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type VoiceRuntimeOptions = {
  wakeWord?: string;
  enabled?: boolean;
  onWake?: () => void;
  onCommand?: (text: string) => Promise<void> | void;
  onStatus?: (status: string) => void;
};

type VoiceRuntimeState = "unsupported" | "disabled" | "permission" | "listening" | "awake" | "thinking" | "speaking" | "error";

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
  return value.replace(/[.,!?¿¡]/g, " ").replace(/\s+/g, " ").trim();
}

function removeWakeWord(value: string, wakeWord: string) {
  const expression = new RegExp(`(^|\\s)${wakeWord}(\\s|$)`, "i");
  return cleanText(value.replace(expression, " "));
}

export function useFlowlyVoiceRuntime({
  wakeWord = "flow",
  enabled = true,
  onWake,
  onCommand,
  onStatus,
}: VoiceRuntimeOptions = {}) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const awakeRef = useRef(false);
  const processingRef = useRef(false);
  const lastCommandRef = useRef("");
  const idleTimeoutRef = useRef<number | null>(null);
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

  const goToSleep = useCallback(() => {
    clearIdleTimeout();
    awakeRef.current = false;
    setTranscript("");
    if (active) updateStatus("listening", "Escuchando la palabra Flow");
  }, [active, clearIdleTimeout, updateStatus]);

  const scheduleSleep = useCallback(() => {
    clearIdleTimeout();
    idleTimeoutRef.current = window.setTimeout(goToSleep, 9500);
  }, [clearIdleTimeout, goToSleep]);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 260));
    utterance.lang = "es-ES";
    utterance.rate = 1.02;
    utterance.pitch = 1.08;
    utterance.volume = 0.92;
    utterance.onstart = () => updateStatus("speaking", "Flow está hablando");
    utterance.onend = () => {
      if (active) updateStatus(awakeRef.current ? "awake" : "listening", awakeRef.current ? "Flow sigue atento" : "Escuchando la palabra Flow");
    };
    window.speechSynthesis.speak(utterance);
  }, [active, updateStatus]);

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
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }

      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "es-ES";

      recognition.onstart = () => {
        setActive(true);
        updateStatus("listening", "Di Flow para llamarme");
      };

      recognition.onerror = (event) => {
        updateStatus("error", event.error ? `Error de voz: ${event.error}` : "Error de voz");
      };

      recognition.onend = () => {
        if (!enabled) return;
        window.setTimeout(() => {
          try { recognition.start(); } catch { /* El navegador ya puede estar escuchando. */ }
        }, 550);
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

        if (!awakeRef.current) {
          if (heard.includes(wakeWord.toLowerCase())) {
            awakeRef.current = true;
            onWake?.();
            updateStatus("awake", "Te escucho");
            speak("Te escucho");
            scheduleSleep();
          }
          return;
        }

        scheduleSleep();
        if (!finalText || processingRef.current) return;
        const command = removeWakeWord(finalText, wakeWord);
        if (!command || command.length < 3 || command === lastCommandRef.current) return;

        lastCommandRef.current = command;
        processingRef.current = true;
        updateStatus("thinking", "Pensando con Flowly Brain");
        try {
          await onCommand?.(command);
        } finally {
          processingRef.current = false;
          scheduleSleep();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      return true;
    } catch (error) {
      console.error("Flowly voice runtime error", error);
      updateStatus("error", "No he podido activar el micrófono");
      return false;
    }
  }, [enabled, onCommand, onWake, scheduleSleep, speak, updateStatus, wakeWord]);

  const deactivate = useCallback(() => {
    clearIdleTimeout();
    awakeRef.current = false;
    setActive(false);
    updateStatus("disabled", "Voz desactivada");
    try { recognitionRef.current?.abort(); } catch { /* noop */ }
    recognitionRef.current = null;
  }, [clearIdleTimeout, updateStatus]);

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
