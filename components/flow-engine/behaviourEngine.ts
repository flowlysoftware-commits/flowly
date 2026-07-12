import { action, condition, selector, sequence } from "./behaviourTree";
import { FlowEmotion, FlowMode, FlowUserActivitySource } from "./types";

export type FlowGoalId = "recover" | "engage" | "focus" | "explore" | "rest" | "presence";
export type FlowRoutineId = "acknowledge-user" | "calm-down" | "inspect-panel" | "reflect" | "micro-presence" | "rest-cycle";
export type FlowBehaviourId = "wake" | "listen" | "recover-calm" | "observe" | "reflect" | "micro-shift" | "stretch" | "rest";

export type FlowBehaviourDecision = {
  id: FlowBehaviourId;
  goal: FlowGoalId;
  routine: FlowRoutineId;
  mode: FlowMode;
  durationMs: number;
  nextDelayMs: number;
  priority: number;
  interruptible: boolean;
  pulse: number;
  command?: "wake" | "rest";
};

type ActivitySignal = { source: FlowUserActivitySource; at: number };

type BehaviourContext = {
  now: number;
  emotion: FlowEmotion;
  mode: FlowMode;
  idleForMs: number;
  lastActivity: ActivitySignal | null;
  isThroned: boolean;
};

type BehaviourRule = Omit<FlowBehaviourDecision, "durationMs" | "nextDelayMs" | "pulse"> & {
  duration: [number, number];
  cooldown: [number, number];
  score: (context: BehaviourContext) => number;
};

type FlowBehaviourEngineOptions = {
  getMode: () => FlowMode;
  getEmotion: () => FlowEmotion;
  isBlocked: () => boolean;
  isThroned: () => boolean;
  onDecision: (decision: FlowBehaviourDecision) => void;
  onReturnToIdle: (decision: FlowBehaviourDecision) => void;
};

const RULES: BehaviourRule[] = [
  { id: "wake", goal: "engage", routine: "acknowledge-user", mode: "listening", priority: 100, interruptible: false, command: "wake", duration: [1000, 1700], cooldown: [4000, 6500], score: (c) => c.isThroned && Boolean(c.lastActivity && c.now - c.lastActivity.at < 2200) ? 100 : 0 },
  { id: "listen", goal: "engage", routine: "acknowledge-user", mode: "listening", priority: 85, interruptible: true, duration: [900, 1700], cooldown: [4500, 8000], score: (c) => c.lastActivity && c.now - c.lastActivity.at < 1800 ? 8 + c.emotion.attention * 4 : 0 },
  { id: "recover-calm", goal: "recover", routine: "calm-down", mode: "idle", priority: 80, interruptible: false, duration: [2400, 4200], cooldown: [8500, 14000], score: (c) => c.emotion.stress > 0.58 ? 8 + c.emotion.stress * 6 : 0 },
  { id: "observe", goal: "explore", routine: "inspect-panel", mode: "listening", priority: 45, interruptible: true, duration: [1500, 2800], cooldown: [7000, 12000], score: (c) => 2 + c.emotion.attention * 2.5 + c.emotion.curiosity * 1.4 },
  { id: "reflect", goal: "focus", routine: "reflect", mode: "thinking", priority: 42, interruptible: true, duration: [2100, 3900], cooldown: [9500, 16500], score: (c) => 1.2 + c.emotion.curiosity * 2.7 + Math.min(2.2, c.idleForMs / 22000) },
  { id: "stretch", goal: "presence", routine: "micro-presence", mode: "idle", priority: 30, interruptible: true, duration: [1800, 3100], cooldown: [12000, 21000], score: (c) => 1 + c.emotion.energy * 1.5 + Math.min(1.8, c.idleForMs / 32000) },
  { id: "micro-shift", goal: "presence", routine: "micro-presence", mode: "idle", priority: 20, interruptible: true, duration: [1200, 2400], cooldown: [4200, 7600], score: (c) => 4.5 + c.emotion.energy + c.emotion.stress * 0.4 },
  { id: "rest", goal: "rest", routine: "rest-cycle", mode: "seated", priority: 55, interruptible: true, command: "rest", duration: [12000, 22000], cooldown: [45000, 80000], score: (c) => !c.isThroned && c.idleForMs > 65000 && c.emotion.energy < 0.48 ? 9 + (0.48 - c.emotion.energy) * 12 : 0 },
];

function randomBetween([min, max]: [number, number]) { return min + Math.random() * (max - min); }

export class FlowBehaviourEngine {
  private timer: number | null = null;
  private returnTimer: number | null = null;
  private stopped = true;
  private pulse = 0;
  private lastActivityAt = Date.now();
  private lastActivity: ActivitySignal | null = null;
  private active: FlowBehaviourDecision | null = null;
  private readonly cooldownUntil = new Map<FlowBehaviourId, number>();
  private readonly recent: FlowBehaviourId[] = [];

  constructor(private readonly options: FlowBehaviourEngineOptions) {}

  start() { if (!this.stopped) return; this.stopped = false; this.schedule(2200 + Math.random() * 1800); }
  stop() { this.stopped = true; if (this.timer !== null) window.clearTimeout(this.timer); if (this.returnTimer !== null) window.clearTimeout(this.returnTimer); this.timer = null; this.returnTimer = null; this.active = null; }

  signalActivity(source: FlowUserActivitySource) {
    const now = Date.now();
    this.lastActivityAt = now;
    this.lastActivity = { source, at: now };
    if (this.active?.interruptible) this.interrupt("user-activity");
  }

  noteActivity(source: FlowUserActivitySource = "pointer") { this.signalActivity(source); }

  interrupt(_reason: string) {
    if (!this.active?.interruptible) return false;
    if (this.returnTimer !== null) window.clearTimeout(this.returnTimer);
    const interrupted = this.active;
    this.active = null;
    this.options.onReturnToIdle(interrupted);
    this.schedule(450);
    return true;
  }

  private schedule(delayMs: number) {
    if (this.stopped) return;
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.tick(), Math.max(350, delayMs));
  }

  private buildContext(): BehaviourContext {
    const now = Date.now();
    return { now, emotion: this.options.getEmotion(), mode: this.options.getMode(), idleForMs: now - this.lastActivityAt, lastActivity: this.lastActivity, isThroned: this.options.isThroned() };
  }

  private choose(context: BehaviourContext) {
    const available = RULES.filter((rule) => (this.cooldownUntil.get(rule.id) || 0) <= context.now)
      .map((rule) => ({ rule, score: Math.max(0, rule.score(context)) * (this.recent.includes(rule.id) ? 0.18 : 1) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.rule.priority - a.rule.priority || b.score - a.score);

    if (!available.length) return null;
    const highestPriority = available[0].rule.priority;
    const pool = available.filter((entry) => entry.rule.priority >= highestPriority - 18);
    const total = pool.reduce((sum, entry) => sum + entry.score, 0);
    let roll = Math.random() * total;
    for (const entry of pool) { roll -= entry.score; if (roll <= 0) return entry.rule; }
    return pool[pool.length - 1].rule;
  }

  private findRule(id: FlowBehaviourId, context: BehaviourContext) {
    const rule = RULES.find((candidate) => candidate.id === id);
    if (!rule || (this.cooldownUntil.get(id) || 0) > context.now || rule.score(context) <= 0) return null;
    return rule;
  }

  private readonly tree = selector<BehaviourContext, BehaviourRule>(
    "flow-root",
    sequence("wake-branch", condition("is-throned", (c) => c.isThroned), action("wake", (c) => this.findRule("wake", c))),
    sequence("recover-branch", condition("is-stressed", (c) => c.emotion.stress > 0.58), action("recover", (c) => this.findRule("recover-calm", c))),
    sequence("engage-branch", condition("recent-user", (c) => Boolean(c.lastActivity && c.now - c.lastActivity.at < 1800)), action("listen", (c) => this.findRule("listen", c))),
    action("select-goal", (context) => this.choose(context)),
  );

  private tick() {
    if (this.stopped) return;
    if (document.hidden) { this.schedule(1800); return; }
    if (this.options.isBlocked()) { this.schedule(1000 + Math.random() * 700); return; }
    const context = this.buildContext();
    if (context.mode !== "idle" && context.mode !== "seated") { this.schedule(700); return; }
    const result = this.tree.evaluate(context);
    const rule = result.decision;
    if (!rule) { this.schedule(900 + Math.random() * 900); return; }

    const durationMs = randomBetween(rule.duration);
    const nextDelayMs = randomBetween(rule.cooldown);
    const decision: FlowBehaviourDecision = { ...rule, durationMs, nextDelayMs, pulse: ++this.pulse };
    this.active = decision;
    this.cooldownUntil.set(rule.id, Date.now() + nextDelayMs * 0.75);
    this.recent.unshift(rule.id); this.recent.splice(5);
    this.options.onDecision(decision);

    if (this.returnTimer !== null) window.clearTimeout(this.returnTimer);
    this.returnTimer = window.setTimeout(() => {
      if (this.stopped || this.active?.pulse !== decision.pulse) return;
      this.active = null;
      this.options.onReturnToIdle(decision);
    }, durationMs);
    this.schedule(durationMs + nextDelayMs);
  }
}
