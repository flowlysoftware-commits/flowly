"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createSpeechEnvelope, chooseSpanishVoice, sanitizeSpeechText } from "@/components/flow-engine/voiceEngine";
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
  onSpeechLevel?: (level: number) => void;
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

const CAPTURE_DURATION_MS = 1800;
const LOOP_INTERVAL_MS = 2100;

export function useFlowlyVoiceRuntime({
  enabled = true,
  wakeWord = "flow",
  onWake,
  onCommand,
  onStatus,
  onPhase,
  onSpeechLevel,
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
  const speechEnvelopeRef = useRef<number | null>(null);
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
  const [speechLevel, setSpeechLevel] = useState(0);

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

  const stopSpeaking = useCallback(() => {
    if (speechEnvelopeRef.current) window.clearInterval(speechEnvelopeRef.current);
    speechEnvelopeRef.current = null;
    setSpeechLevel(0);
    onSpeechLevel?.(0);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (speechTimeoutRef.current) window.clearTimeout(speechTimeoutRef.current);
    speechTimeoutRef.current = null;
    speakingRef.current = false;
  }, [onSpeechLevel]);

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

    if (speakingRef.current) {
      if (wake || useful) {
        stopSpeaking();
        syncDebug({ lastEvent: "Interrumpido por voz del usuario" });
      } else {
        return;
      }
    }

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
  }, [onCommand, onWake, setPhase, stopSpeaking, syncDebug]);

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
    if (recordingRef.current || processingRef.current) return;

    const stream = await ensureStream();
    console.info("[voice-debug] ensureStream result", stream ? "stream-ready" : "stream-null");
    if (!stream) return;

    recordingRef.current = true;
    syncDebug({ isRecording: true });
    setPhase("listening", "Escuchando audio...");

    try {
      console.info("[voice-debug] recording start");
      const blob = await recordAudioSegment(stream, CAPTURE_DURATION_MS);
      console.info("[voice-debug] recording result", { size: blob?.size ?? 0, type: blob?.type ?? "" });
      if (!activeRef.current || manualStopRef.current) return;

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
    }, LOOP_INTERVAL_MS);
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
    stopSpeaking();
    processingRef.current = false;
    recordingRef.current = false;
    clearLoop();
    stopStream();
    setActive(false);
    setIsAwake(false);
    setTranscript("");
    setPhase("disabled", "Voz desactivada");
  }, [clearLoop, setPhase, stopSpeaking, stopStream]);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;

    const clean = sanitizeSpeechText(text);
    if (!clean) return;

    stopSpeaking();
    speakingRef.current = true;
    setPhase("speaking", "Flow está hablando");

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "es-ES";
    utterance.rate = 1.01;
    utterance.pitch = 1.04;
    utterance.volume = 0.96;
    const voice = chooseSpanishVoice(window.speechSynthesis.getVoices());
    if (voice) utterance.voice = voice;

    const startedAt = performance.now();
    speechEnvelopeRef.current = window.setInterval(() => {
      const level = createSpeechEnvelope(clean, performance.now() - startedAt);
      setSpeechLevel(level);
      onSpeechLevel?.(level);
    }, 55);

    const finish = () => {
      if (speechTimeoutRef.current) window.clearTimeout(speechTimeoutRef.current);
      if (speechEnvelopeRef.current) window.clearInterval(speechEnvelopeRef.current);
      speechTimeoutRef.current = null;
      speechEnvelopeRef.current = null;
      speakingRef.current = false;
      setSpeechLevel(0);
      onSpeechLevel?.(0);
      if (activeRef.current && !manualStopRef.current) setPhase("passive", "Voz activa. Puedes responderme cuando quieras");
    };

    utterance.onend = finish;
    utterance.onerror = finish;
    speechTimeoutRef.current = window.setTimeout(finish, Math.min(18000, Math.max(1800, clean.length * 68)));
    window.speechSynthesis.speak(utterance);
  }, [onSpeechLevel, setPhase, stopSpeaking]);

  useEffect(() => {
    const ok = typeof window !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== "undefined";
    setSupported(ok);
    if (!ok) setPhase("unsupported", "Tu navegador no soporta voz avanzada");

    return () => {
      manualStopRef.current = true;
      activeRef.current = false;
      clearLoop();
      stopSpeaking();
      stopStream();
    };
    // Este efecto solo debe correr al montar/desmontar; si se re-ejecuta por callbacks cambiantes,
    // puede apagar el loop de escucha mientras la UI sigue en "activa".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearLoop, setPhase, stopSpeaking, stopStream]);

  return { supported, active, isAwake, state, transcript, speechLevel, debug, refreshDebug, activate, deactivate, speak, stopSpeaking };
}
