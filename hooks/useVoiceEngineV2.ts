"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createVoiceEngineV2, type VoiceEngineV2Snapshot } from "@/lib/voice/voiceEngineV2";

export function useVoiceEngineV2(activeConversationMode = true) {
  const engineRef = useRef<ReturnType<typeof createVoiceEngineV2> | null>(null);
  const [snapshot, setSnapshot] = useState<VoiceEngineV2Snapshot>({
    active: false,
    permissionState: "unknown",
    phase: "idle",
    currentState: "idle",
    previousState: null,
    recording: false,
    lastAudioKb: 0,
    lastTranscript: "",
    lastTranscriptionStatus: null,
    lastTranscriptionRawResponse: "",
    wakeDetected: false,
    intentionDetected: false,
    lastBrainRequest: "",
    lastBrainResponse: "",
    lastError: "",
    lastTransitionAt: null,
    lastSilenceAt: null,
    lastSpeechDetectedAt: null,
    lastRecordingDurationMs: 0,
    lastReason: "",
    lastDebugEvents: [],
    config: {
      minRecordingMs: 900,
      maxRecordingMs: 9000,
      silenceTimeoutMs: 1150,
      minAudioKb: 2,
      debounceMs: 800,
      speakingCooldownMs: 500,
      speechThreshold: 0.045,
      analyserPollMs: 90,
      debugEventLimit: 18,
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const engine = createVoiceEngineV2({
      activeConversationMode,
      onStateChange: setSnapshot,
    });
    engineRef.current = engine;
    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, [activeConversationMode]);

  const start = useCallback(() => {
    engineRef.current?.start();
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  return useMemo(() => ({
    snapshot,
    start,
    stop,
  }), [snapshot, start, stop]);
}
