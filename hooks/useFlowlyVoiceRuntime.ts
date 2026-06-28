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

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives?: number;
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

function normalizeForWake(value: string) {
  return cleanText(value).toLowerCase();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wakeAliases(wakeWord: string) {
  const base = escapeRegExp(normalizeForWake(wakeWord || "flow"));
  return [base, "flowly", "flou", "flo", "flor", "flow li", "floui"].filter(Boolean);
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

function transcriptFromEvent(event: SpeechRecognitionEventLike) {
  const pieces: string[] = [];
  for (let index = 0; index < event.results.length; index += 1) {
    const phrase = event.results[index]?.[0]?.transcript;
    if (phrase) pieces.push(phrase);
  }
  return cleanText(pieces.join(" "));
}

function commandLooksComplete(value: string) {
  const clean = cleanText(value);
  const words = clean.split(/\s+/).filter(Boolean);
  return clean.length >= 8 || words.length >= 2;
}

export function useFlowlyVoiceRuntime({
  wakeWord = "flow",
  enabled = true,
  onWake,
  onCommand,
  onStatus,
  onPhase,
}: VoiceRuntimeOptions = {}) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const enabledRef = useRef(enabled);
  const activeRef = useRef(false);
  const awakeRef = useRef(false);
  const startingRef = useRef(false);
  const speakingRef = useRef(false);
  const processingRef = useRef(false);
  const manuallyStoppedRef = useRef(false);
  const currentCommandRef = useRef("");
  const lastCommandRef = useRef("");
  const lastCommandAtRef = useRef(0);
  const silenceTimerRef = useRef<number | null>(null);
  const restartTimerRef = useRef<number | null>(null);
  const awakeTimeoutRef = useRef<number | null>(null);

  const [supported, setSupported] = useState(true);
  const [active, setActive] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [state, setState] = useState<VoiceRuntimeState>("disabled");
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const clearTimer = useCallback((timer: { current: number | null }) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const setPhase = useCallback((next: VoiceRuntimeState, label?: string) => {
    setState(next);
    onPhase?.(next);
    if (label) onStatus?.(label);
  }, [onPhase, onStatus]);

  const setAwake = useCallback((value: boolean) => {
    awakeRef.current = value;
    setIsAwake(value);
  }, []);

  const resetCommand = useCallback(() => {
    currentCommandRef.current = "";
    setTranscript("");
    clearTimer(silenceTimerRef);
    clearTimer(awakeTimeoutRef);
  }, [clearTimer]);

  const safeStart = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || !enabledRef.current || manuallyStoppedRef.current || speakingRef.current || startingRef.current) return;
    startingRef.current = true;
    try {
      recognition.start();
    } catch {
      // Chrome lanza excepción si ya está iniciado. En ese caso lo tratamos como activo.
      activeRef.current = true;
      setActive(true);
      setPhase(awakeRef.current ? "listening" : "passive", awakeRef.current ? "Te escucho" : "Voz activa. Di Flow para llamarme");
    } finally {
      window.setTimeout(() => {
        startingRef.current = false;
      }, 450);
    }
  }, [setPhase]);

  const restartListening = useCallback((delay = 420) => {
    clearTimer(restartTimerRef);
    if (!enabledRef.current || manuallyStoppedRef.current || speakingRef.current) return;
    restartTimerRef.current = window.setTimeout(() => safeStart(), delay);
  }, [clearTimer, safeStart]);

  const goPassive = useCallback(() => {
    setAwake(false);
    resetCommand();
    if (activeRef.current) setPhase("passive", "Voz activa. Di Flow para llamarme");
  }, [resetCommand, setAwake, setPhase]);

  const processCommand = useCallback(async (raw: string) => {
    const command = cleanText(removeWakeWord(raw, wakeWord));
    if (!commandLooksComplete(command)) {
      // Evita enviar solo "que", "hola", etc. Mantiene a Flow despierto un poco más.
      setTranscript(command);
      setPhase("listening", "Te escucho. Termina la frase");
      clearTimer(awakeTimeoutRef);
      awakeTimeoutRef.current = window.setTimeout(goPassive, 6500);
      return;
    }

    const now = Date.now();
    if (command === lastCommandRef.current && now - lastCommandAtRef.current < 4500) return;

    lastCommandRef.current = command;
    lastCommandAtRef.current = now;
    processingRef.current = true;
    resetCommand();
    setPhase("thinking", "Pensando con Flowly Brain");

    try {
      await onCommand?.(command);
    } finally {
      processingRef.current = false;
      setAwake(false);
      if (!speakingRef.current) {
        setPhase("passive", "Voz activa. Di Flow para llamarme");
        restartListening(500);
      }
    }
  }, [clearTimer, goPassive, onCommand, resetCommand, restartListening, setAwake, setPhase, wakeWord]);

  const scheduleCommand = useCallback(() => {
    clearTimer(silenceTimerRef);
    silenceTimerRef.current = window.setTimeout(() => {
      const command = currentCommandRef.current;
      if (!processingRef.current && !speakingRef.current) void processCommand(command);
    }, 2300);
  }, [clearTimer, processCommand]);

  const createRecognition = useCallback(() => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) return null;

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "es-ES";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      activeRef.current = true;
      setActive(true);
      setPhase(awakeRef.current ? "listening" : "passive", awakeRef.current ? "Te escucho" : "Voz activa. Di Flow para llamarme");
    };

    recognition.onerror = (event) => {
      const error = event.error || "unknown";
      if (error === "aborted") return;

      if (error === "not-allowed" || error === "service-not-allowed") {
        activeRef.current = false;
        setActive(false);
        setAwake(false);
        setPhase("error", "Permiso de micrófono bloqueado");
        return;
      }

      if (["no-speech", "audio-capture", "network"].includes(error)) {
        if (activeRef.current && !speakingRef.current) restartListening(750);
        return;
      }

      setPhase("error", `Error de voz: ${error}`);
      if (activeRef.current && !speakingRef.current) restartListening(900);
    };

    recognition.onend = () => {
      if (!enabledRef.current || manuallyStoppedRef.current) return;

      if (awakeRef.current && commandLooksComplete(currentCommandRef.current) && !processingRef.current && !speakingRef.current) {
        void processCommand(currentCommandRef.current);
        return;
      }

      if (!speakingRef.current) restartListening(450);
    };

    recognition.onresult = (event) => {
      if (speakingRef.current || processingRef.current) return;

      const heard = transcriptFromEvent(event);
      if (!heard) return;

      if (!awakeRef.current) {
        setTranscript(heard);
        if (!containsWakeWord(heard, wakeWord)) return;

        const afterWake = removeWakeWord(heard, wakeWord);
        setAwake(true);
        currentCommandRef.current = afterWake;
        setTranscript(afterWake);
        onWake?.();

        if (commandLooksComplete(afterWake)) {
          setPhase("listening", "Te escucho");
          scheduleCommand();
        } else {
          setPhase("waking", "Te escucho. Dime qué necesitas");
          clearTimer(awakeTimeoutRef);
          awakeTimeoutRef.current = window.setTimeout(goPassive, 8500);
        }
        return;
      }

      const cleanHeard = removeWakeWord(heard, wakeWord);
      if (cleanHeard) {
        currentCommandRef.current = cleanHeard;
        setTranscript(cleanHeard);
      }

      setPhase("listening", "Te escucho");
      scheduleCommand();
    };

    return recognition;
  }, [clearTimer, goPassive, onWake, processCommand, restartListening, scheduleCommand, setAwake, setPhase, wakeWord]);

  const activate = useCallback(async () => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setSupported(false);
      setPhase("unsupported", "Tu navegador no soporta escucha por voz");
      return false;
    }

    try {
      setPhase("permission", "Solicitando permiso de micrófono");

      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        stream.getTracks().forEach((track) => track.stop());
      }

      try { recognitionRef.current?.abort(); } catch { /* noop */ }

      manuallyStoppedRef.current = false;
      speakingRef.current = false;
      processingRef.current = false;
      activeRef.current = true;
      setActive(true);
      setAwake(false);
      resetCommand();

      recognitionRef.current = createRecognition();
      setPhase("passive", "Voz activa. Di Flow para llamarme");
      window.setTimeout(() => safeStart(), 120);
      return true;
    } catch (error) {
      console.error("Flowly voice runtime error", error);
      activeRef.current = false;
      setActive(false);
      setAwake(false);
      setPhase("error", "No he podido activar el micrófono. Revisa permisos del navegador.");
      return false;
    }
  }, [createRecognition, resetCommand, safeStart, setAwake, setPhase]);

  const deactivate = useCallback(() => {
    manuallyStoppedRef.current = true;
    activeRef.current = false;
    speakingRef.current = false;
    processingRef.current = false;
    setActive(false);
    setAwake(false);
    resetCommand();
    clearTimer(restartTimerRef);
    try { recognitionRef.current?.abort(); } catch { /* noop */ }
    setPhase("disabled", "Voz desactivada");
  }, [clearTimer, resetCommand, setAwake, setPhase]);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;

    const shortText = text.replace(/[#*_`>\[\]]/g, " ").replace(/\s+/g, " ").slice(0, 520);
    window.speechSynthesis.cancel();

    speakingRef.current = true;
    clearTimer(silenceTimerRef);
    clearTimer(awakeTimeoutRef);
    try { recognitionRef.current?.abort(); } catch { /* noop */ }

    const utterance = new SpeechSynthesisUtterance(shortText);
    utterance.lang = "es-ES";
    utterance.rate = 1.02;
    utterance.pitch = 1.08;
    utterance.volume = 0.94;

    utterance.onstart = () => setPhase("speaking", "Flow está hablando");
    utterance.onend = () => {
      speakingRef.current = false;
      goPassive();
      restartListening(650);
    };
    utterance.onerror = () => {
      speakingRef.current = false;
      goPassive();
      restartListening(650);
    };

    window.speechSynthesis.speak(utterance);
  }, [clearTimer, goPassive, restartListening, setPhase]);

  useEffect(() => {
    const Recognition = getSpeechRecognitionConstructor();
    setSupported(Boolean(Recognition));
    if (!Recognition) setPhase("unsupported", "Tu navegador no soporta escucha por voz");

    return () => {
      manuallyStoppedRef.current = true;
      clearTimer(silenceTimerRef);
      clearTimer(restartTimerRef);
      clearTimer(awakeTimeoutRef);
      try { recognitionRef.current?.abort(); } catch { /* noop */ }
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [clearTimer, setPhase]);

  return { supported, active, isAwake, state, transcript, activate, deactivate, speak };
}
