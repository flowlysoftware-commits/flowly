import { FlowEmotion, FlowMode } from "./types";

export type FlowBehaviourFamily =
  | "idle"
  | "locomotion"
  | "conversation"
  | "greeting"
  | "guidance"
  | "thinking"
  | "listening";

export type FlowBehaviourProfile = {
  family: FlowBehaviourFamily;
  mode: FlowMode;
  minEnergy: number;
  maxStress: number;
  weight: number;
  cooldownMs: number;
  oneShot: boolean;
};

export const FLOW_BEHAVIOUR_PROFILES: FlowBehaviourProfile[] = [
  { family: "idle", mode: "idle", minEnergy: 0, maxStress: 1, weight: 1, cooldownMs: 0, oneShot: false },
  { family: "locomotion", mode: "walking", minEnergy: 0.2, maxStress: 1, weight: 1, cooldownMs: 0, oneShot: false },
  { family: "conversation", mode: "talking", minEnergy: 0.2, maxStress: 1, weight: 1, cooldownMs: 0, oneShot: false },
  { family: "greeting", mode: "waving", minEnergy: 0.25, maxStress: 0.85, weight: 1, cooldownMs: 9000, oneShot: true },
  { family: "guidance", mode: "pointing", minEnergy: 0.15, maxStress: 1, weight: 1, cooldownMs: 2500, oneShot: true },
  { family: "thinking", mode: "thinking", minEnergy: 0, maxStress: 1, weight: 1, cooldownMs: 0, oneShot: false },
  { family: "listening", mode: "listening", minEnergy: 0, maxStress: 1, weight: 1, cooldownMs: 0, oneShot: false },
];

export function behaviourForMode(mode: FlowMode, emotion: FlowEmotion) {
  const candidates = FLOW_BEHAVIOUR_PROFILES.filter(
    (profile) => profile.mode === mode && emotion.energy >= profile.minEnergy && emotion.stress <= profile.maxStress,
  );
  return candidates[0] || FLOW_BEHAVIOUR_PROFILES[0];
}

export function nextAmbientMode(emotion: FlowEmotion): FlowMode {
  const roll = Math.random();
  if (emotion.attention > 0.82 && roll < 0.16) return "listening";
  if (emotion.curiosity > 0.7 && roll < 0.32) return "thinking";
  if (emotion.joy > 0.74 && roll < 0.12) return "waving";
  return "idle";
}
