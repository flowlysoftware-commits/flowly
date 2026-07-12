export type FlowVoicePhase =
  | "disabled"
  | "permission"
  | "passive"
  | "listening"
  | "thinking"
  | "speaking"
  | "unsupported"
  | "error";

export type FlowVoiceSnapshot = {
  active: boolean;
  phase: FlowVoicePhase;
  transcript: string;
  speechLevel: number;
};

export function sanitizeSpeechText(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_`>\[\]]/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 700);
}

export function chooseSpanishVoice(voices: SpeechSynthesisVoice[]) {
  const spanish = voices.filter((voice) => /^es(?:-|_)/i.test(voice.lang));
  return spanish.find((voice) => /natural|premium|neural|microsoft|google/i.test(voice.name)) || spanish[0] || voices[0] || null;
}

export function createSpeechEnvelope(text: string, elapsedMs: number) {
  if (!text) return 0;
  const cadence = 8.2 + Math.min(4, text.length / 90);
  const pulse = Math.abs(Math.sin((elapsedMs / 1000) * Math.PI * cadence));
  const secondary = Math.abs(Math.sin((elapsedMs / 1000) * Math.PI * 3.7 + 0.8));
  return Math.min(1, 0.16 + pulse * 0.58 + secondary * 0.18);
}
