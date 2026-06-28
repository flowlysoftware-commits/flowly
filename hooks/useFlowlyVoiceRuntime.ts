"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type VoiceRuntimeOptions = {
  wakeWord?: string;
  enabled?: boolean;
  onWake?: () => void;
  onCommand?: (text: string) => Promise<void> | void;
  onStatus?: (status: string) => void;
  onPhase?: (phase: VoiceRuntimeState) => void;
};

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

function buildTranscriptFromEvent(event: SpeechRecognitionEventLike) {
  let finalText = "";
  let interimText = "";

  for (let index = event.resultIndex; index < event.results.length; index += 1) {
    const result = event.results[index];
    const phrase = result[0]?.transcript || "";
    if (result.isFinal) finalText += ` ${phrase}`;
    else interimText += ` ${phrase}`;
  }

  return {
    finalText: cleanText(finalText),
    interimText: cleanText(interimText),
    heard: cleanText(`${finalText} ${interimText}`).toLowerCase(),
  };
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
  const activeRef = useRef(false);
  const awakeRef = useRef(false);
  const enabledRef = useRef(enabled);
  const manuallyStoppedRef = useRef(false);
  const startingRef = useRef(false);
  const processingRef = useRef(false);
  const speakingRef = useRef(false);
  const userBufferRef = useRef("");
  const interimBufferRef = useRef("");
  const lastCommandRef = useRef("");
  const lastCommandAtRef = useRef(0);
  const captureTimeoutRef = useRef<number | null>(null);
  const sleepTimeoutRef = useRef<number | null>(null);
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
    onPhase?.(next);
    if (label) onStatus?.(label);
  }, [onPhase, onStatus]);

  const clearTimer = useCallback((timer: React.MutableRefObject<number | null>) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const setAwake = useCallback((value: boolean) => {
    awakeRef.current = value;
    setIsAwake(value);
  }, []);

  const resetUserCapture = useCallback(() => {
    userBufferRef.current = "";
    interimBufferRef.current = "";
    setTranscript("");
    clearTimer(captureTimeoutRef);
  }, [clearTimer]);

  const goPassive = useCallback(() => {
    resetUserCapture();
    setAwake(false);
    if (activeRef.current) updateStatus("passive", "Di Flow para llamarme");
  }, [resetUserCapture, setAwake, updateStatus]);

  const schedulePassiveSleep = useCallback(() => {
    clearTimer(sleepTimeoutRef);
    sleepTimeoutRef.current = window.setTimeout(goPassive, 13000);
  }, [clearTimer, goPassive]);

  const safeStart = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || !enabledRef.current || manuallyStoppedRef.current || startingRef.current || speakingRef.current) return;

    startingRef.current = true;
    try {
      recognition.start();
    } catch {
      setActive(true);
      activeRef.current = true;
      updateStatus(awakeRef.current ? "listening" : "passive", awakeRef.current ? "Te escucho" : "Di Flow para llamarme");
    } finally {
      window.setTimeout(() => {
        startingRef.current = false;
      }, 450);
    }
  }, [updateStatus]);

  const restartListening = useCallback((delay = 420) => {
    clearTimer(restartTimeoutRef);
    if (!enabledRef.current || manuallyStoppedRef.current || speakingRef.current) return;
    restartTimeoutRef.current = window.setTimeout(() => safeStart(), delay);
  }, [clearTimer, safeStart]);

  const processCommand = useCallback(async (rawCommand: string) => {
    const command = cleanText(rawCommand);
    if (!command || command.length < 2) return;

    const now = Date.now();
    if (command === lastCommandRef.current && now - lastCommandAtRef.current < 4500) return;

    lastCommandRef.current = command;
    lastCommandAtRef.current = now;
    processingRef.current = true;
    resetUserCapture();
    updateStatus("thinking", "Pensando con Flowly Brain");

    try {
      await onCommand?.(command);
    } finally {
      processingRef.current = false;
      schedulePassiveSleep();
    }
  }, [onCommand, resetUserCapture, schedulePassiveSleep, updateStatus]);

  const scheduleCommandFromSilence = useCallback(() => {
    clearTimer(captureTimeoutRef);
    captureTimeoutRef.current = window.setTimeout(() => {
      const phrase = cleanText(`${userBufferRef.current} ${interimBufferRef.current}`);
      if (phrase && !processingRef.current && !speakingRef.current) void processCommand(phrase);
    }, 1500);
  }, [clearTimer, processCommand]);

  const pauseRecognitionForSpeech = useCallback(() => {
    speakingRef.current = true;
    clearTimer(captureTimeoutRef);
    try { recognitionRef.current?.stop(); } catch { /* noop */ }
  }, [clearTimer]);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;

    const shortText = text.replace(/[#*_`>\[\]]/g, " ").replace(/\s+/g, " ").slice(0, 520);
    window.speechSynthesis.cancel();
    pauseRecognitionForSpeech();

    const utterance = new SpeechSynthesisUtterance(shortText);
    utterance.lang = "es-ES";
    utterance.rate = 1.02;
    utterance.pitch = 1.08;
    utterance.volume = 0.94;

    utterance.onstart = () => updateStatus("speaking", "Flow está hablando");
    utterance.onend = () => {
      speakingRef.current = false;
      if (activeRef.current) {
        updateStatus(awakeRef.current ? "listening" : "passive", awakeRef.current ? "Te escucho" : "Di Flow para llamarme");
        restartListening(380);
      }
    };
    utterance.onerror = () => {
      speakingRef.current = false;
      if (activeRef.current) restartListening(380);
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
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        stream.getTracks().forEach((track) => track.stop());
      }

      try { recognitionRef.current?.abort(); } catch { /* noop */ }

      manuallyStoppedRef.current = false;
      speakingRef.current = false;
      processingRef.current = false;
      resetUserCapture();
      setAwake(false);

      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "es-ES";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setActive(true);
        activeRef.current = true;
        updateStatus(awakeRef.current ? "listening" : "passive", awakeRef.current ? "Te escucho" : "Di Flow para llamarme");
      };

      recognition.onerror = (event) => {
        const error = event.error || "unknown";
        if (error === "aborted") return;
        if (error === "no-speech" || error === "audio-capture" || error === "network") {
          if (activeRef.current) restartListening(720);
          return;
        }
        setActive(false);
        activeRef.current = false;
        updateStatus("error", error === "not-allowed" ? "Permiso de micrófono bloqueado" : `Error de voz: ${error}`);
      };

      recognition.onend = () => {
        if (!enabledRef.current || manuallyStoppedRef.current) return;
        if (!speakingRef.current) restartListening(520);
      };

      recognition.onresult = async (event) => {
        if (speakingRef.current || processingRef.current) return;

        const { finalText, interimText, heard } = buildTranscriptFromEvent(event);
        if (!heard) return;

        const visibleTranscript = cleanText(`${userBufferRef.current} ${interimText || finalText || heard}`);
        setTranscript(visibleTranscript);

        if (!awakeRef.current) {
          if (!containsWakeWord(heard, wakeWord)) return;

          const afterWake = removeWakeWord(heard, wakeWord);
          setAwake(true);
          onWake?.();
          updateStatus("waking", "Flow te escucha");
          schedulePassiveSleep();

          if (afterWake.length >= 2) {
            userBufferRef.current = cleanText(`${userBufferRef.current} ${afterWake}`);
            setTranscript(userBufferRef.current);
            scheduleCommandFromSilence();
          } else {
            updateStatus("listening", "Te escucho. Dime qué necesitas");
          }
          return;
        }

        updateStatus("listening", "Te escucho");
        schedulePassiveSleep();

        const commandPiece = finalText || interimText;
        const cleanPiece = cleanText(commandPiece);
        if (finalText && cleanPiece) {
          const withoutWake = containsWakeWord(cleanPiece, wakeWord) ? removeWakeWord(cleanPiece, wakeWord) : cleanPiece;
          userBufferRef.current = cleanText(`${userBufferRef.current} ${withoutWake}`);
          interimBufferRef.current = "";
        } else if (interimText) {
          interimBufferRef.current = cleanText(containsWakeWord(interimText, wakeWord) ? removeWakeWord(interimText, wakeWord) : interimText);
        }

        setTranscript(cleanText(`${userBufferRef.current} ${interimBufferRef.current}`));
        scheduleCommandFromSilence();
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
  }, [onWake, resetUserCapture, restartListening, safeStart, scheduleCommandFromSilence, schedulePassiveSleep, setAwake, updateStatus, wakeWord]);

  const deactivate = useCallback(() => {
    clearTimer(captureTimeoutRef);
    clearTimer(sleepTimeoutRef);
    clearTimer(restartTimeoutRef);
    manuallyStoppedRef.current = true;
    activeRef.current = false;
    processingRef.current = false;
    speakingRef.current = false;
    setAwake(false);
    setActive(false);
    resetUserCapture();
    try { recognitionRef.current?.abort(); } catch { /* noop */ }
    updateStatus("disabled", "Voz desactivada");
  }, [clearTimer, resetUserCapture, setAwake, updateStatus]);

  useEffect(() => {
    const Recognition = getSpeechRecognitionConstructor();
    setSupported(Boolean(Recognition));
    if (!Recognition) updateStatus("unsupported", "Tu navegador no soporta escucha por voz");
    return () => {
      clearTimer(captureTimeoutRef);
      clearTimer(sleepTimeoutRef);
      clearTimer(restartTimeoutRef);
      try { recognitionRef.current?.abort(); } catch { /* noop */ }
    };
  }, [clearTimer, updateStatus]);

  return { supported, active, isAwake, state, transcript, activate, deactivate, speak };
}
