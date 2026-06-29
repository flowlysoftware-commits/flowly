"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  cleanText,
  hasWakeWord,
  isUsefulCommand,
  normalizeText,
  recordAudioSegment,
  requestTranscription,
  stripFlowWakeWord,
  type FlowlyVoiceRuntimeState,
} from "@/lib/flowlyVoiceRuntimeCore";

type VoiceRuntimeState = FlowlyVoiceRuntimeState;

type VoiceRuntimeOptions = {
  wakeWord?: string;
  enabled?: boolean;
  onWake?: () => void;
  onCommand?: (text: string) => Promise<void> | void;
  onStatus?: (status: string) => void;
  onPhase?: (phase: VoiceRuntimeState) => void;
};

type VoiceDebugSnapshot = {
  ticks: number;
  lastAudioKb: number;
  lastTranscription: string;
  lastError: string;
  lastEvent: string;
  isRecording: boolean;
  loopActive: boolean;
};

export function useFlowlyVoiceRuntime({
  enabled = true,
  wakeWord = "flow",
  onWake,
  onCommand,
  onStatus,
  onPhase,
}: VoiceRuntimeOptions = {}) {
  const enabledRef = useRef(enabled);
  const activeRef = useRef(false);
  const speakingRef = useRef(false);
  const processingRef = useRef(false);
  const recordingRef = useRef(false);
  const manualStopRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const speechTimeoutRef = useRef<number | null>(null);
  const debugRef = useRef<VoiceDebugSnapshot>({
    ticks: 0,
    lastAudioKb: 0,
    lastTranscription: "",
    lastError: "",
    lastEvent: "Inicializando voz",
    isRecording: false,
    loopActive: false,
  });
  const [debug, setDebug] = useState<VoiceDebugSnapshot>(debugRef.current);
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

  const syncDebug = useCallback((patch: Partial<VoiceDebugSnapshot>) => {
    debugRef.current = { ...debugRef.current, ...patch };
  }, []);

  const refreshDebug = useCallback(() => {
    setDebug({ ...debugRef.current });
  }, []);

  const setPhase = useCallback((next: VoiceRuntimeState, label?: string) => {
    setState(next);
    onPhase?.(next);
    if (label) {
      onStatus?.(label);
      syncDebug({ lastEvent: label });
    }
  }, [onPhase, onStatus, syncDebug]);

  const clearLoop = useCallback(() => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    syncDebug({ loopActive: false });
  }, [syncDebug]);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

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

  const processTranscribedText = useCallback(async (rawText: string) => {
    const text = cleanText(rawText);
    if (!text) return;

    setTranscript(text);
    syncDebug({ lastTranscription: text, lastError: "" });

    const wake = hasWakeWord(text, wakeWord);
    if (wake) {
      lastWakeAtRef.current = Date.now();
      setIsAwake(true);
      onWake?.();
    }

    const command = stripFlowWakeWord(text, wakeWord) || text;
    const recentlyAwake = Date.now() - lastWakeAtRef.current < 30000;
    const useful = isUsefulCommand(command, wakeWord);
    const shouldAnswer = wake || recentlyAwake || useful;

    if (!shouldAnswer) {
      setPhase("passive", `He oído: ${text}`);
      return;
    }

    if (!useful) {
      setPhase("waking", "Te escucho. Dime tu petición para Flow.");
      return;
    }

    const now = Date.now();
    const commandKey = normalizeText(command);
    if (commandKey === lastCommandRef.current && now - lastCommandAtRef.current < 9000) return;

    lastCommandRef.current = commandKey;
    lastCommandAtRef.current = now;
    processingRef.current = true;
    syncDebug({ lastEvent: `Enviando al Brain: ${command}` });
    setIsAwake(true);
    setTranscript(command);
    setPhase("thinking", "Pensando con Flowly Brain");

    try {
      await onCommand?.(command);
    } finally {
      processingRef.current = false;
      setIsAwake(false);
      if (activeRef.current && !manualStopRef.current) setPhase("passive", "Voz activa. Puedes hablarme cuando quieras");
    }
  }, [onCommand, onWake, setPhase]);

  const captureAndTranscribe = useCallback(async () => {
    console.info("[voice-debug] captureAndTranscribe enter", {
      active: activeRef.current,
      manualStop: manualStopRef.current,
      enabled: enabledRef.current,
      recording: recordingRef.current,
      processing: processingRef.current,
      speaking: speakingRef.current,
    });
    if (!activeRef.current || manualStopRef.current || !enabledRef.current) return;
    if (recordingRef.current || processingRef.current || speakingRef.current) return;

    const stream = await ensureStream();
    console.info("[voice-debug] ensureStream result", stream ? "stream-ready" : "stream-null");
    if (!stream) return;

    recordingRef.current = true;
    syncDebug({ isRecording: true });
    setPhase("listening", "Escuchando audio...");

    try {
      console.info("[voice-debug] recording start");
      const blob = await recordAudioSegment(stream, 4200);
      console.info("[voice-debug] recording result", { size: blob?.size ?? 0, type: blob?.type ?? "" });
      if (!activeRef.current || manualStopRef.current || speakingRef.current) return;

      if (!blob || blob.size < 256) {
        syncDebug({
          ticks: debugRef.current.ticks + 1,
          lastAudioKb: blob ? Math.round(blob.size / 1024) : 0,
          lastEvent: "Audio demasiado pequeño",
        });
        setPhase("passive", "Voz activa. No he recibido suficiente audio");
        return;
      }

      const kb = Math.round(blob.size / 1024);
      syncDebug({
        ticks: debugRef.current.ticks + 1,
        lastAudioKb: kb,
        lastEvent: `Audio capturado: ${kb} KB`,
      });
      setPhase("listening", `Procesando ${kb} KB de audio`);
      console.info("[voice-debug] transcription request", { size: blob.size });
      const result = await requestTranscription(blob);
      console.info("[voice-debug] transcription result", result);

      if (result.error && !result.text) {
        setTranscript(result.error);
        syncDebug({ lastError: result.error || "Error de transcripción" });
        setPhase("passive", `No pude transcribir: ${result.error}`);
        return;
      }

      if (result.text) await processTranscribedText(result.text);
      else setPhase("passive", "Voz activa. No he oído una frase clara");
    } finally {
      recordingRef.current = false;
      syncDebug({ isRecording: false });
    }
  }, [ensureStream, processTranscribedText, setPhase, syncDebug]);

  const startLoop = useCallback(() => {
    console.info("[voice-debug] startLoop");
    clearLoop();
    syncDebug({ loopActive: true });
    void captureAndTranscribe();
    intervalRef.current = window.setInterval(() => {
      void captureAndTranscribe();
    }, 5200);
  }, [captureAndTranscribe, clearLoop]);

  const activate = useCallback(async () => {
    console.info("[voice-debug] activate start");
    setPhase("permission", "Solicitando permiso de micrófono");
    try {
      const stream = await ensureStream();
      console.info("[voice-debug] activate stream", stream ? "ready" : "missing");
      if (!stream) return false;

      manualStopRef.current = false;
      activeRef.current = true;
      setActive(true);
      setIsAwake(false);
      setTranscript("");
      setPhase("passive", "Voz activa. Puedes hablarme cuando quieras");
      startLoop();
      return true;
    } catch (error) {
      console.error("Flowly voice runtime error", error);
      activeRef.current = false;
      setActive(false);
      setIsAwake(false);
      setPhase("error", "No he podido activar el micrófono. Revisa permisos del navegador.");
      return false;
    }
  }, [ensureStream, setPhase, startLoop]);

  const deactivate = useCallback(() => {
    manualStopRef.current = true;
    activeRef.current = false;
    speakingRef.current = false;
    processingRef.current = false;
    recordingRef.current = false;
    clearLoop();
    stopStream();
    setActive(false);
    setIsAwake(false);
    setTranscript("");
    setPhase("disabled", "Voz desactivada");
  }, [clearLoop, setPhase, stopStream]);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;

    const clean = text.replace(/[#*_`>\[\]]/g, " ").replace(/\s+/g, " ").slice(0, 520);
    if (!clean) return;

    window.speechSynthesis.cancel();
    if (speechTimeoutRef.current) window.clearTimeout(speechTimeoutRef.current);
    speakingRef.current = true;
    setPhase("speaking", "Flow está hablando");

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "es-ES";
    utterance.rate = 1.02;
    utterance.pitch = 1.08;
    utterance.volume = 0.94;

    const finish = () => {
      if (speechTimeoutRef.current) window.clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
      speakingRef.current = false;
      if (activeRef.current && !manualStopRef.current) setPhase("passive", "Voz activa. Puedes responderme cuando quieras");
    };

    utterance.onend = finish;
    utterance.onerror = finish;
    speechTimeoutRef.current = window.setTimeout(finish, Math.min(12000, Math.max(1800, clean.length * 65)));
    window.speechSynthesis.speak(utterance);
  }, [setPhase]);

  useEffect(() => {
    const ok = typeof window !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined";
    setSupported(ok);
    if (!ok) setPhase("unsupported", "Tu navegador no soporta voz avanzada");

    return () => {
      manualStopRef.current = true;
      activeRef.current = false;
      clearLoop();
      if (speechTimeoutRef.current) window.clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
      stopStream();
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
    // Este efecto solo debe correr al montar/desmontar; si se re-ejecuta por callbacks cambiantes,
    // puede apagar el loop de escucha mientras la UI sigue en "activa".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { supported, active, isAwake, state, transcript, debug, refreshDebug, activate, deactivate, speak };
}
