import { FlowEmotion, FlowMode } from "./types";

export type FlowBehaviourId =
  | "micro-shift"
  | "observe"
  | "reflect";

export type FlowBehaviourDecision = {
  id: FlowBehaviourId;
  mode: FlowMode;
  durationMs: number;
  nextDelayMs: number;
  pulse: number;
};

type BehaviourRule = {
  id: FlowBehaviourId;
  mode: FlowMode;
  weight: (emotion: FlowEmotion, idleForMs: number) => number;
  duration: [number, number];
  cooldown: [number, number];
};

type FlowBehaviourEngineOptions = {
  getMode: () => FlowMode;
  getEmotion: () => FlowEmotion;
  isBlocked: () => boolean;
  onDecision: (decision: FlowBehaviourDecision) => void;
  onReturnToIdle: (decision: FlowBehaviourDecision) => void;
};

const RULES: BehaviourRule[] = [
  {
    id: "micro-shift",
    mode: "idle",
    weight: (emotion) => 5.2 + emotion.energy * 1.1 + emotion.stress * 0.5,
    duration: [1300, 2600],
    cooldown: [4200, 7600],
  },
  {
    id: "observe",
    mode: "listening",
    weight: (emotion) => 2.2 + emotion.attention * 2.4 + emotion.curiosity * 1.1,
    duration: [1500, 2800],
    cooldown: [7000, 12000],
  },
  {
    id: "reflect",
    mode: "thinking",
    weight: (emotion, idleForMs) =>
      1.2 + emotion.curiosity * 2.5 + Math.min(1.8, idleForMs / 24000),
    duration: [2100, 3900],
    cooldown: [9500, 16500],
  },
];

function randomBetween([min, max]: [number, number]) {
  return min + Math.random() * (max - min);
}

function weightedRule(
  rules: BehaviourRule[],
  emotion: FlowEmotion,
  idleForMs: number,
  cooldownUntil: Map<FlowBehaviourId, number>,
  recent: FlowBehaviourId[],
) {
  const now = Date.now();
  const candidates = rules
    .filter((rule) => (cooldownUntil.get(rule.id) || 0) <= now)
    .map((rule) => {
      const recentPenalty = recent.includes(rule.id) ? 0.16 : 1;
      return { rule, weight: Math.max(0, rule.weight(emotion, idleForMs) * recentPenalty) };
    })
    .filter((entry) => entry.weight > 0);

  if (!candidates.length) return RULES[0];

  const total = candidates.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of candidates) {
    roll -= entry.weight;
    if (roll <= 0) return entry.rule;
  }
  return candidates[candidates.length - 1].rule;
}

export class FlowBehaviourEngine {
  private readonly options: FlowBehaviourEngineOptions;
  private timer: number | null = null;
  private returnTimer: number | null = null;
  private stopped = true;
  private pulse = 0;
  private lastActivityAt = Date.now();
  private readonly cooldownUntil = new Map<FlowBehaviourId, number>();
  private readonly recent: FlowBehaviourId[] = [];

  constructor(options: FlowBehaviourEngineOptions) {
    this.options = options;
  }

  start() {
    if (!this.stopped) return;
    this.stopped = false;
    this.schedule(3200 + Math.random() * 2200);
  }

  stop() {
    this.stopped = true;
    if (this.timer !== null) window.clearTimeout(this.timer);
    if (this.returnTimer !== null) window.clearTimeout(this.returnTimer);
    this.timer = null;
    this.returnTimer = null;
  }

  noteActivity() {
    this.lastActivityAt = Date.now();
  }

  private schedule(delayMs: number) {
    if (this.stopped) return;
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.tick(), Math.max(900, delayMs));
  }

  private tick() {
    if (this.stopped) return;

    if (document.hidden || this.options.isBlocked() || this.options.getMode() !== "idle") {
      this.schedule(1200 + Math.random() * 1100);
      return;
    }

    const emotion = this.options.getEmotion();
    const idleForMs = Date.now() - this.lastActivityAt;
    const rule = weightedRule(RULES, emotion, idleForMs, this.cooldownUntil, this.recent);
    const durationMs = randomBetween(rule.duration);
    const nextDelayMs = randomBetween(rule.cooldown);

    this.pulse += 1;
    const decision: FlowBehaviourDecision = {
      id: rule.id,
      mode: rule.mode,
      durationMs,
      nextDelayMs,
      pulse: this.pulse,
    };

    this.cooldownUntil.set(rule.id, Date.now() + nextDelayMs * 0.72);
    this.recent.unshift(rule.id);
    this.recent.splice(4);
    this.options.onDecision(decision);

    if (this.returnTimer !== null) window.clearTimeout(this.returnTimer);
    this.returnTimer = window.setTimeout(() => {
      if (this.stopped) return;
      if (this.options.getMode() === decision.mode) {
        this.options.onReturnToIdle(decision);
      }
    }, durationMs);

    this.schedule(durationMs + nextDelayMs);
  }
}
