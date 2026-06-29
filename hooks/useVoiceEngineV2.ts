"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createVoiceEngineV2, type VoiceEngineV2Snapshot } from "@/lib/voice/voiceEngineV2";

export function useVoiceEngineV2(activeConversationMode = true) {
  const engineRef = useRef<ReturnType<typeof createVoiceEngineV2> | null>(null);
  const [snapshot, setSnapshot] = useState<VoiceEngineV2Snapshot>({
    active: false,
    permissionState: "unknown",
    phase: "idle",
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
