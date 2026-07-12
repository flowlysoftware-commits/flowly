import { DEFAULT_EMOTION, FlowEmotion, FlowMood, FlowMode, FlowUserActivitySource } from "./types";

type EmotionVector = Omit<FlowEmotion, "mood">;
type EmotionStimulus =
  | { type: "user-activity"; source: FlowUserActivitySource }
  | { type: "mode"; mode: FlowMode }
  | { type: "message-received" }
  | { type: "message-sent" }
  | { type: "navigation-success" }
  | { type: "navigation-failure" }
  | { type: "rest-start" }
  | { type: "wake" }
  | { type: "external"; emotion: Partial<FlowEmotion> };

type FlowEmotionEngineOptions = {
  initial?: FlowEmotion;
  tickMs?: number;
  onChange: (emotion: FlowEmotion) => void;
};

const KEYS: Array<keyof EmotionVector> = [
  "calm", "joy", "curiosity", "empathy", "stress", "confidence", "attention", "energy",
];

const BASELINE: EmotionVector = {
  calm: DEFAULT_EMOTION.calm,
  joy: DEFAULT_EMOTION.joy,
  curiosity: DEFAULT_EMOTION.curiosity,
  empathy: DEFAULT_EMOTION.empathy,
  stress: DEFAULT_EMOTION.stress,
  confidence: DEFAULT_EMOTION.confidence,
  attention: DEFAULT_EMOTION.attention,
  energy: DEFAULT_EMOTION.energy,
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function deriveMood(value: EmotionVector): FlowMood {
  if (value.stress >= 0.68) return "stressed";
  if (value.energy <= 0.28) return "tired";
  if (value.empathy >= 0.78 && value.calm >= 0.6) return "empathetic";
  if (value.attention >= 0.78 && value.curiosity >= 0.62) return "focused";
  if (value.joy >= 0.68 && value.confidence >= 0.6) return "joyful";
  if (value.curiosity >= 0.72) return "curious";
  if (value.calm >= 0.76 && value.stress <= 0.2) return "calm";
  return "neutral";
}

export class FlowEmotionEngine {
  private current: FlowEmotion;
  private target: EmotionVector;
  private timer: number | null = null;
  private lastTick = Date.now();
  private readonly tickMs: number;

  constructor(private readonly options: FlowEmotionEngineOptions) {
    this.current = { ...(options.initial ?? DEFAULT_EMOTION) };
    this.target = { ...this.current };
    delete (this.target as Partial<FlowEmotion>).mood;
    this.tickMs = options.tickMs ?? 120;
  }

  start() {
    if (this.timer !== null || typeof window === "undefined") return;
    this.lastTick = Date.now();
    this.timer = window.setInterval(() => this.tick(), this.tickMs);
    this.options.onChange(this.current);
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }

  getSnapshot() { return this.current; }

  stimulate(stimulus: EmotionStimulus) {
    switch (stimulus.type) {
      case "external":
        this.apply(stimulus.emotion, 1);
        break;
      case "user-activity":
        this.apply({ attention: 0.92, curiosity: 0.7, energy: 0.62, stress: Math.max(0, this.target.stress - 0.06) }, 0.62);
        if (stimulus.source === "chat") this.apply({ empathy: 0.82, curiosity: 0.76 }, 0.74);
        if (stimulus.source === "drag") this.apply({ joy: 0.7, stress: 0.22, energy: 0.76 }, 0.72);
        break;
      case "mode":
        if (stimulus.mode === "thinking") this.apply({ attention: 0.94, curiosity: 0.86, calm: 0.66 }, 0.7);
        if (stimulus.mode === "talking") this.apply({ confidence: 0.82, joy: 0.62, energy: 0.67 }, 0.64);
        if (stimulus.mode === "walking") this.apply({ attention: 0.9, energy: 0.76, calm: 0.58 }, 0.64);
        if (stimulus.mode === "error") this.apply({ stress: 0.72, confidence: 0.32, calm: 0.3 }, 0.86);
        if (stimulus.mode === "seated") this.apply({ calm: 0.9, stress: 0.04, energy: 0.36 }, 0.82);
        break;
      case "message-received":
        this.apply({ joy: 0.66, confidence: 0.78, stress: 0.05, empathy: 0.78 }, 0.7);
        break;
      case "message-sent":
        this.apply({ attention: 0.96, curiosity: 0.82, empathy: 0.84 }, 0.72);
        break;
      case "navigation-success":
        this.apply({ joy: 0.72, confidence: 0.88, stress: 0.04 }, 0.78);
        break;
      case "navigation-failure":
        this.apply({ stress: 0.48, confidence: 0.42, curiosity: 0.72 }, 0.74);
        break;
      case "rest-start":
        this.apply({ calm: 0.94, stress: 0.02, energy: 0.3, attention: 0.56 }, 0.9);
        break;
      case "wake":
        this.apply({ energy: 0.66, attention: 0.9, curiosity: 0.72, calm: 0.72 }, 0.82);
        break;
    }
  }

  private apply(patch: Partial<FlowEmotion>, strength: number) {
    for (const key of KEYS) {
      const incoming = patch[key];
      if (typeof incoming !== "number") continue;
      this.target[key] = clamp01(this.target[key] + (incoming - this.target[key]) * strength);
    }
  }

  private tick() {
    const now = Date.now();
    const dt = Math.min(0.5, (now - this.lastTick) / 1000);
    this.lastTick = now;

    for (const key of KEYS) {
      const baseline = BASELINE[key];
      const recovery = key === "stress" ? 0.11 : key === "energy" ? 0.035 : 0.055;
      this.target[key] += (baseline - this.target[key]) * recovery * dt;
      this.target[key] = clamp01(this.target[key]);
    }

    const nextVector = {} as EmotionVector;
    let changed = false;
    for (const key of KEYS) {
      const speed = key === "stress" ? 4.8 : 3.2;
      const value = this.current[key] + (this.target[key] - this.current[key]) * Math.min(1, speed * dt);
      nextVector[key] = clamp01(value);
      if (Math.abs(value - this.current[key]) > 0.002) changed = true;
    }

    const next: FlowEmotion = { ...nextVector, mood: deriveMood(nextVector) };
    if (next.mood !== this.current.mood) changed = true;
    this.current = next;
    if (changed) this.options.onChange(next);
  }
}
