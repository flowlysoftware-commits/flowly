import { AnimationClip, KeyframeTrack } from "three";
import { FlowEmotion, FlowMode } from "./types";

export type FlowAnimationFamily =
  | "idle"
  | "walk"
  | "talk"
  | "wave"
  | "point"
  | "think"
  | "listen"
  | "other";

export type CataloguedClip = {
  clip: AnimationClip;
  family: FlowAnimationFamily;
  weight: number;
};

export type FlowAnimationCatalog = Record<FlowAnimationFamily, CataloguedClip[]>;

const KEYWORDS: Record<Exclude<FlowAnimationFamily, "other">, RegExp> = {
  idle: /\b(idle|stand|waiting|breath|relax|neutral)\b/i,
  walk: /\b(walk|walking|run|running|locomotion|free.?run|jog|step)\b/i,
  talk: /\b(talk|talking|speak|speaking|conversation|explain|chat|gesture)\b/i,
  wave: /\b(wave|waving|hello|hi|greet|greeting|salute)\b/i,
  point: /\b(point|pointing|show|indicate|direction|present)\b/i,
  think: /\b(think|thinking|ponder|wonder|consider|confused)\b/i,
  listen: /\b(listen|listening|attention|attentive|hear|nod)\b/i,
};

function normalizedTrackName(track: KeyframeTrack) {
  return track.name
    .replace(/^.*[|:]/, "")
    .replace(/mixamorig/gi, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
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

function inferFamily(clip: AnimationClip): FlowAnimationFamily {
  const name = clip.name || "";
  for (const [family, expression] of Object.entries(KEYWORDS) as Array<
    [Exclude<FlowAnimationFamily, "other">, RegExp]
  >) {
    if (expression.test(name)) return family;
  }

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
    else if (/head/.test(bone)) head += activity;
    else if (/root|pelvis|hips/.test(bone)) root += activity;
  });

  const total = arms + legs + torso + head + root;
  if (total < 0.18) return "idle";
  if (legs > 0.5 && legs > arms * 0.55) return "walk";
  if (arms > Math.max(0.45, legs * 1.65)) return "talk";
  if (head + torso > arms + legs && total < 1.8) return "listen";
  return "other";
}

function clipWeight(clip: AnimationClip, family: FlowAnimationFamily) {
  let weight = 1;
  if (clip.duration >= 0.7 && clip.duration <= 6) weight += 0.35;
  if (family === "idle" && clip.duration >= 2) weight += 0.4;
  if (family === "walk" && clip.duration <= 3) weight += 0.35;
  if (KEYWORDS[family as Exclude<FlowAnimationFamily, "other">]?.test(clip.name || "")) weight += 2;
  return weight;
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
    other: [],
  };

  clips.forEach((sourceClip) => {
    const clip = sourceClip.clone();
    clip.resetDuration();
    const family = inferFamily(clip);
    catalog[family].push({ clip, family, weight: clipWeight(clip, family) });
  });

  // Only use inferred generic arm clips for conversation. Deliberate actions such
  // as greeting and pointing need an explicitly named clip to avoid grotesque poses.
  return catalog;
}

function weightedPick(entries: CataloguedClip[], recentNames: string[]) {
  const allowed = entries.filter((entry) => !recentNames.includes(entry.clip.name));
  const pool = allowed.length ? allowed : entries;
  if (!pool.length) return null;
  const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return entry.clip;
  }
  return pool[pool.length - 1].clip;
}

export function chooseClipForMode(
  catalog: FlowAnimationCatalog,
  mode: FlowMode,
  emotion: FlowEmotion,
  recentNames: string[],
) {
  if (mode === "dragging" || mode === "seated") return null;
  const family: FlowAnimationFamily =
    mode === "walking" ? "walk" :
    mode === "talking" ? "talk" :
    mode === "waving" ? "wave" :
    mode === "pointing" ? "point" :
    mode === "thinking" ? "think" :
    mode === "listening" ? "listen" :
    "idle";

  let candidates = catalog[family];

  if (family === "talk" && emotion.energy < 0.35) {
    candidates = [...catalog.listen, ...candidates];
  }

  return weightedPick(candidates, recentNames);
}
