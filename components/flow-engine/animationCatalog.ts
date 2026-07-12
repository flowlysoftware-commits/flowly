import { AnimationClip, KeyframeTrack, MathUtils } from "three";
import { FlowEmotion, FlowMode } from "./types";

export type FlowAnimationFamily =
  | "idle"
  | "walk"
  | "talk"
  | "wave"
  | "point"
  | "think"
  | "listen"
  | "seated"
  | "other";

export type FlowAnimationLoop = "repeat" | "once";

export type CataloguedClip = {
  id: string;
  clip: AnimationClip;
  family: FlowAnimationFamily;
  weight: number;
  priority: number;
  cooldownMs: number;
  loop: FlowAnimationLoop;
  blendIn: number;
  blendOut: number;
  playbackRate: [number, number];
  duration: number;
  activity: {
    arms: number;
    legs: number;
    torso: number;
    head: number;
    root: number;
    total: number;
  };
  explicit: boolean;
};

export type FlowAnimationCatalog = Record<FlowAnimationFamily, CataloguedClip[]>;

export type AnimationSelectionContext = {
  mode: FlowMode;
  emotion: FlowEmotion;
  recentIds: string[];
  cooldownUntil: ReadonlyMap<string, number>;
  now?: number;
};

const KEYWORDS: Record<Exclude<FlowAnimationFamily, "other">, RegExp> = {
  idle: /\b(idle|stand|waiting|breath|relax|neutral|rest)\b/i,
  walk: /\b(walk|walking|run|running|locomotion|free.?run|jog|step)\b/i,
  talk: /\b(talk|talking|speak|speaking|conversation|explain|chat|gesture)\b/i,
  wave: /\b(wave|waving|hello|hi|greet|greeting|salute)\b/i,
  point: /\b(point|pointing|show|indicate|direction|present)\b/i,
  think: /\b(think|thinking|ponder|wonder|consider|confused|reflect)\b/i,
  listen: /\b(listen|listening|attention|attentive|hear|nod|observe)\b/i,
  seated: /\b(sit|sitting|seated|chair|throne)\b/i,
};

const MODE_TO_FAMILY: Record<FlowMode, FlowAnimationFamily | null> = {
  idle: "idle",
  walking: "walk",
  thinking: "think",
  listening: "listen",
  talking: "talk",
  waving: "wave",
  pointing: "point",
  dragging: null,
  seated: "seated",
  error: "idle",
};

function normalize(value: string) {
  return value
    .replace(/^.*[|:]/, "")
    .replace(/mixamorig/gi, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

function normalizedTrackName(track: KeyframeTrack) {
  return normalize(track.name);
}

function trackActivity(track: KeyframeTrack) {
  const values = track.values;
  if (!values || values.length < 2) return 0;
  const stride = Math.max(1, Math.floor(values.length / 96));
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let index = 0; index < values.length; index += stride) {
    const value = Number(values[index]);
    if (!Number.isFinite(value)) continue;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  return Number.isFinite(min) && Number.isFinite(max) ? Math.abs(max - min) : 0;
}

function analyseActivity(clip: AnimationClip): CataloguedClip["activity"] {
  let arms = 0;
  let legs = 0;
  let torso = 0;
  let head = 0;
  let root = 0;

  clip.tracks.forEach((track) => {
    const activity = trackActivity(track);
    const bone = normalizedTrackName(track);
    if (/upperarm|forearm|hand|shoulder|arm/.test(bone)) arms += activity;
    else if (/thigh|upleg|calf|leg|foot|toe/.test(bone)) legs += activity;
    else if (/spine|chest|neck/.test(bone)) torso += activity;
    else if (/head|eye/.test(bone)) head += activity;
    else if (/root|pelvis|hips/.test(bone)) root += activity;
  });

  return { arms, legs, torso, head, root, total: arms + legs + torso + head + root };
}

function explicitFamily(name: string): FlowAnimationFamily | null {
  for (const [family, expression] of Object.entries(KEYWORDS) as Array<
    [Exclude<FlowAnimationFamily, "other">, RegExp]
  >) {
    if (expression.test(name)) return family;
  }
  return null;
}

function inferFamily(clip: AnimationClip, activity: CataloguedClip["activity"]): FlowAnimationFamily {
  const named = explicitFamily(clip.name || "");
  if (named) return named;

  const { arms, legs, torso, head, root, total } = activity;
  if (total < 0.18) return "idle";
  if (legs > 0.5 && legs > arms * 0.55) return "walk";
  if (arms > Math.max(0.45, legs * 1.65)) return "talk";
  if (head + torso > arms + legs && total < 1.8) return "listen";
  if (root < 0.2 && torso + head > arms * 0.75 && total < 2.3) return "think";
  return "other";
}

function familyDefaults(family: FlowAnimationFamily) {
  switch (family) {
    case "walk":
      return { priority: 80, cooldownMs: 0, loop: "repeat" as const, blendIn: 0.16, blendOut: 0.18, playbackRate: [0.96, 1.08] as [number, number] };
    case "wave":
    case "point":
      return { priority: 90, cooldownMs: 9000, loop: "once" as const, blendIn: 0.18, blendOut: 0.22, playbackRate: [0.94, 1.04] as [number, number] };
    case "seated":
      return { priority: 85, cooldownMs: 0, loop: "repeat" as const, blendIn: 0.32, blendOut: 0.32, playbackRate: [0.72, 0.84] as [number, number] };
    case "talk":
      return { priority: 60, cooldownMs: 1400, loop: "repeat" as const, blendIn: 0.22, blendOut: 0.24, playbackRate: [0.92, 1.08] as [number, number] };
    case "think":
    case "listen":
      return { priority: 50, cooldownMs: 5500, loop: "once" as const, blendIn: 0.24, blendOut: 0.28, playbackRate: [0.9, 1.02] as [number, number] };
    case "idle":
      return { priority: 10, cooldownMs: 6500, loop: "repeat" as const, blendIn: 0.35, blendOut: 0.35, playbackRate: [0.94, 1.04] as [number, number] };
    default:
      return { priority: 1, cooldownMs: 8000, loop: "once" as const, blendIn: 0.3, blendOut: 0.3, playbackRate: [0.95, 1.05] as [number, number] };
  }
}

function clipWeight(clip: AnimationClip, family: FlowAnimationFamily, explicit: boolean) {
  let weight = 1;
  if (clip.duration >= 0.7 && clip.duration <= 6) weight += 0.35;
  if (family === "idle" && clip.duration >= 2) weight += 0.4;
  if (family === "walk" && clip.duration <= 3) weight += 0.35;
  if (explicit) weight += 2.2;
  return weight;
}

function makeId(clip: AnimationClip, index: number) {
  const base = normalize(clip.name || `clip${index}`) || `clip${index}`;
  return `${base}-${index}`;
}

export function buildAnimationCatalog(clips: AnimationClip[]): FlowAnimationCatalog {
  const catalog: FlowAnimationCatalog = {
    idle: [],
    walk: [],
    talk: [],
    wave: [],
    point: [],
    think: [],
    listen: [],
    seated: [],
    other: [],
  };

  clips.forEach((sourceClip, index) => {
    const clip = sourceClip.clone();
    clip.resetDuration();
    const activity = analyseActivity(clip);
    const explicit = Boolean(explicitFamily(clip.name || ""));
    const family = inferFamily(clip, activity);
    const defaults = familyDefaults(family);
    catalog[family].push({
      id: makeId(clip, index),
      clip,
      family,
      weight: clipWeight(clip, family, explicit),
      duration: clip.duration,
      activity,
      explicit,
      ...defaults,
    });
  });

  Object.values(catalog).forEach((entries) => {
    entries.sort((a, b) => b.priority - a.priority || b.weight - a.weight || a.duration - b.duration);
  });

  return catalog;
}

function emotionMultiplier(entry: CataloguedClip, emotion: FlowEmotion) {
  const energy = MathUtils.clamp(emotion.energy, 0, 1);
  const stress = MathUtils.clamp(emotion.stress, 0, 1);
  const attention = MathUtils.clamp(emotion.attention, 0, 1);
  const joy = MathUtils.clamp(emotion.joy, 0, 1);

  switch (entry.family) {
    case "talk": return 0.75 + energy * 0.65 + joy * 0.2;
    case "listen": return 0.7 + attention * 0.7;
    case "think": return 0.75 + emotion.curiosity * 0.55;
    case "idle": return 1.15 - stress * 0.25 + (1 - energy) * 0.18;
    case "walk": return 0.8 + energy * 0.4;
    case "seated": return 1.1 + (1 - energy) * 0.2;
    default: return 1;
  }
}

function weightedPick(entries: CataloguedClip[], context: AnimationSelectionContext) {
  const now = context.now ?? Date.now();
  const available = entries.filter((entry) => (context.cooldownUntil.get(entry.id) || 0) <= now);
  const pool = available.length ? available : entries;
  if (!pool.length) return null;

  const weighted = pool.map((entry) => {
    const recentIndex = context.recentIds.indexOf(entry.id);
    const recentPenalty = recentIndex < 0 ? 1 : Math.max(0.08, 0.22 + recentIndex * 0.12);
    return {
      entry,
      weight: Math.max(0.001, entry.weight * recentPenalty * emotionMultiplier(entry, context.emotion)),
    };
  });

  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of weighted) {
    roll -= item.weight;
    if (roll <= 0) return item.entry;
  }
  return weighted[weighted.length - 1].entry;
}

export function chooseAnimation(
  catalog: FlowAnimationCatalog,
  context: AnimationSelectionContext,
): CataloguedClip | null {
  const family = MODE_TO_FAMILY[context.mode];
  if (!family) return null;

  let candidates = catalog[family];
  if (family === "talk" && context.emotion.energy < 0.35) {
    candidates = [...catalog.listen, ...candidates];
  }

  // Deliberate actions must be explicitly named. This prevents inferred arm motion
  // from being used as a greeting or pointing gesture.
  if (family === "wave" || family === "point") {
    candidates = candidates.filter((entry) => entry.explicit);
  }

  return weightedPick(candidates, context);
}

export function randomPlaybackRate(entry: CataloguedClip, emotion: FlowEmotion) {
  const [min, max] = entry.playbackRate;
  const base = min + Math.random() * (max - min);
  const energyOffset = (MathUtils.clamp(emotion.energy, 0, 1) - 0.5) * 0.08;
  return MathUtils.clamp(base + energyOffset, 0.72, 1.28);
}
