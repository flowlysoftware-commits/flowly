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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wakePattern(wakeWord: string) {
  const base = escapeRegExp(cleanText(wakeWord));
  const aliases = [base, "flowly", "flou", "flo", "flor", "floki"].filter(Boolean).join("|");
  return new RegExp(`(^|\\s)(hola\\s+|oye\\s+|hey\\s+|buenas\\s+)?(${aliases})(\\s|$)`, "i");
}

function containsWakeWord(value: string, wakeWord: string) {
  return wakePattern(wakeWord).test(cleanText(value).toLowerCase());
}

function removeWakeWord(value: string, wakeWord: string) {
  return cleanText(value).replace(wakePattern(wakeWord), " ").replace(/\s+/g, " ").trim();
}

function allTranscriptFromEvent(event: SpeechRecognitionEventLike) {
  let finalText = "";
  let interimText = "";
  let heard = "";

  for (let index = 0; index < event.results.length; index += 1) {
    const result = event.results[index];
    const phrase = result[0]?.transcript || "";
    heard += ` ${phrase}`;
    if (index >= event.resultIndex) {
      if (result.isFinal) finalText += ` ${phrase}`;
      else interimText += ` ${phrase}`;
    }
  }

  return {
    finalText: cleanText(finalText),
    interimText: cleanText(interimText),
    heard: cleanText(heard).toLowerCase(),
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
  const commandBufferRef = useRef("");
  const interimBufferRef = useRef("");
  const lastCommandRef = useRef("");
  const lastCommandAtRef = useRef(0);
  const silenceTimerRef = useRef<number | null>(null);
  const restartTimerRef = useRef<number | null>(null);
  const passiveTimerRef = useRef<number | null>(null);

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

  const resetCapture = useCallback(() => {
    commandBufferRef.current = "";
    interimBufferRef.current = "";
    setTranscript("");
    clearTimer(silenceTimerRef);
  }, [clearTimer]);

  const setAwake = useCallback((value: boolean) => {
    awakeRef.current = value;
    setIsAwake(value);
  }, []);

  const goPassive = useCallback(() => {
    resetCapture();
    setAwake(false);
    if (activeRef.current) updateStatus("passive", "Di Flow para llamarme");
  }, [resetCapture, setAwake, updateStatus]);

  const schedulePassive = useCallback(() => {
    clearTimer(passiveTimerRef);
    passiveTimerRef.current = window.setTimeout(goPassive, 16000);
  }, [clearTimer, goPassive]);

  const safeStart = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || !enabledRef.current || manuallyStoppedRef.current || startingRef.current || speakingRef.current) return;

    startingRef.current = true;
    try {
      recognition.start();
    } catch {
      activeRef.current = true;
      setActive(true);
      updateStatus(awakeRef.current ? "listening" : "passive", awakeRef.current ? "Te escucho" : "Escucha activa. Di Flow para llamarme");
    } finally {
      window.setTimeout(() => {
        startingRef.current = false;
      }, 600);
    }
  }, [updateStatus]);

  const restartListening = useCallback((delay = 500) => {
    clearTimer(restartTimerRef);
    if (!enabledRef.current || manuallyStoppedRef.current || speakingRef.current) return;
    restartTimerRef.current = window.setTimeout(() => safeStart(), delay);
  }, [clearTimer, safeStart]);

  const processCommand = useCallback(async (rawCommand: string) => {
    const command = cleanText(rawCommand);
    if (!command || command.length < 2) return;

    const now = Date.now();
    if (command === lastCommandRef.current && now - lastCommandAtRef.current < 5000) return;

    lastCommandRef.current = command;
    lastCommandAtRef.current = now;
    processingRef.current = true;
    resetCapture();
    updateStatus("thinking", "Pensando con Flowly Brain");

    try {
      await onCommand?.(command);
    } finally {
      processingRef.current = false;
      schedulePassive();
      if (!speakingRef.current) restartListening(500);
    }
  }, [onCommand, resetCapture, restartListening, schedulePassive, updateStatus]);

  const scheduleCommandFromSilence = useCallback(() => {
    clearTimer(silenceTimerRef);
    silenceTimerRef.current = window.setTimeout(() => {
      const phrase = cleanText(`${commandBufferRef.current} ${interimBufferRef.current}`);
      if (phrase && !processingRef.current && !speakingRef.current) void processCommand(phrase);
    }, 2100);
  }, [clearTimer, processCommand]);

  const pauseRecognitionForSpeech = useCallback(() => {
    speakingRef.current = true;
    clearTimer(silenceTimerRef);
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
        updateStatus(awakeRef.current ? "listening" : "passive", awakeRef.current ? "Te escucho" : "Escucha activa. Di Flow para llamarme");
        restartListening(450);
      }
    };
    utterance.onerror = () => {
      speakingRef.current = false;
      if (activeRef.current) restartListening(450);
    };

    window.speechSynthesis.speak(utterance);
  }, [pauseRecognitionForSpeech, restartListening, updateStatus]);

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
      updateStatus(awakeRef.current ? "listening" : "passive", awakeRef.current ? "Te escucho" : "Escucha activa. Di Flow para llamarme");
    };

    recognition.onerror = (event) => {
      const error = event.error || "unknown";
      if (error === "aborted") return;
      if (["no-speech", "audio-capture", "network"].includes(error)) {
        if (activeRef.current) restartListening(700);
        return;
      }
      activeRef.current = false;
      setActive(false);
      updateStatus("error", error === "not-allowed" ? "Permiso de micrófono bloqueado" : `Error de voz: ${error}`);
    };

    recognition.onend = () => {
      if (!enabledRef.current || manuallyStoppedRef.current) return;
      if (awakeRef.current) {
        const phrase = cleanText(`${commandBufferRef.current} ${interimBufferRef.current}`);
        if (phrase && !processingRef.current && !speakingRef.current) {
          void processCommand(phrase);
          return;
        }
      }
      if (!speakingRef.current) restartListening(520);
    };

    recognition.onresult = (event) => {
      if (speakingRef.current || processingRef.current) return;

      const { finalText, interimText, heard } = allTranscriptFromEvent(event);
      const candidate = cleanText(`${finalText} ${interimText}`) || heard;
      if (!candidate) return;

      if (!awakeRef.current) {
        setTranscript(candidate);
        if (!containsWakeWord(candidate, wakeWord)) return;

        const afterWake = removeWakeWord(candidate, wakeWord);
        setAwake(true);
        onWake?.();
        updateStatus("waking", "Flow te escucha");
        schedulePassive();

        if (afterWake.length >= 2) {
          commandBufferRef.current = afterWake;
          interimBufferRef.current = "";
          setTranscript(afterWake);
          scheduleCommandFromSilence();
        } else {
          setTranscript("");
          updateStatus("listening", "Te escucho. Dime qué necesitas");
        }
        return;
      }

      updateStatus("listening", "Te escucho");
      schedulePassive();

      const cleanFinal = cleanText(finalText);
      const cleanInterim = cleanText(interimText);
      const cleanCandidate = cleanText(candidate);
      const withoutWake = containsWakeWord(cleanCandidate, wakeWord) ? removeWakeWord(cleanCandidate, wakeWord) : cleanCandidate;

      if (cleanFinal) {
        const finalWithoutWake = containsWakeWord(cleanFinal, wakeWord) ? removeWakeWord(cleanFinal, wakeWord) : cleanFinal;
        commandBufferRef.current = cleanText(`${commandBufferRef.current} ${finalWithoutWake}`);
        interimBufferRef.current = "";
      } else if (cleanInterim) {
        interimBufferRef.current = containsWakeWord(cleanInterim, wakeWord) ? removeWakeWord(cleanInterim, wakeWord) : cleanInterim;
      } else if (withoutWake) {
        interimBufferRef.current = withoutWake;
      }

      setTranscript(cleanText(`${commandBufferRef.current} ${interimBufferRef.current}`));
      scheduleCommandFromSilence();
    };

    return recognition;
  }, [onWake, processCommand, restartListening, scheduleCommandFromSilence, schedulePassive, setAwake, updateStatus, wakeWord]);

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
      resetCapture();
      setAwake(false);

      recognitionRef.current = createRecognition();
      activeRef.current = true;
      setActive(true);
      updateStatus("passive", "Escucha activa. Di Flow para llamarme");
      safeStart();
      return true;
    } catch (error) {
      console.error("Flowly voice runtime error", error);
      activeRef.current = false;
      setActive(false);
      updateStatus("error", "No he podido activar el micrófono. Revisa permisos del navegador.");
      return false;
    }
  }, [createRecognition, resetCapture, safeStart, setAwake, updateStatus]);

  const deactivate = useCallback(() => {
    clearTimer(silenceTimerRef);
    clearTimer(passiveTimerRef);
    clearTimer(restartTimerRef);
    manuallyStoppedRef.current = true;
    activeRef.current = false;
    processingRef.current = false;
    speakingRef.current = false;
    setAwake(false);
    setActive(false);
    resetCapture();
    try { recognitionRef.current?.abort(); } catch { /* noop */ }
    updateStatus("disabled", "Voz desactivada");
  }, [clearTimer, resetCapture, setAwake, updateStatus]);

  useEffect(() => {
    const Recognition = getSpeechRecognitionConstructor();
    setSupported(Boolean(Recognition));
    if (!Recognition) updateStatus("unsupported", "Tu navegador no soporta escucha por voz");
    return () => {
      clearTimer(silenceTimerRef);
      clearTimer(passiveTimerRef);
      clearTimer(restartTimerRef);
      try { recognitionRef.current?.abort(); } catch { /* noop */ }
    };
  }, [clearTimer, updateStatus]);

  return { supported, active, isAwake, state, transcript, activate, deactivate, speak };
}
