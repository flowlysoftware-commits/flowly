import { AnimationClip, KeyframeTrack, QuaternionKeyframeTrack, VectorKeyframeTrack } from "three";
import { FlowMode } from "./types";

export type FlowAnimationCategory =
  | "idle"
  | "walk"
  | "talk"
  | "greeting"
  | "point"
  | "think"
  | "listen"
  | "gesture"
  | "transition";

export type FlowAnimationEntry = {
  clip: AnimationClip;
  category: FlowAnimationCategory;
  weight: number;
  loop: boolean;
  cooldownMs: number;
  energy: number;
};

export type FlowAnimationCatalog = Record<FlowAnimationCategory, FlowAnimationEntry[]>;

const EMPTY_CATALOG = (): FlowAnimationCatalog => ({
  idle: [],
  walk: [],
  talk: [],
  greeting: [],
  point: [],
  think: [],
  listen: [],
  gesture: [],
  transition: [],
});

function normalizedName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function trackAmplitude(track: KeyframeTrack) {
  const values = track.values;
  if (!values.length) return 0;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let index = 0; index < values.length; index += 1) {
    const value = Number(values[index]);
    if (!Number.isFinite(value)) continue;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  return Number.isFinite(min) && Number.isFinite(max) ? max - min : 0;
}

function motionStats(clip: AnimationClip) {
  let legs = 0;
  let arms = 0;
  let torso = 0;
  let root = 0;
  let total = 0;

  clip.tracks.forEach((track) => {
    const name = normalizedName(track.name);
    const amplitude = Math.min(trackAmplitude(track), 4);
    total += amplitude;
    if (/thigh|upleg|calf|leg|foot|toe|knee/.test(name)) legs += amplitude;
    if (/clavicle|shoulder|upperarm|forearm|hand|arm|wrist/.test(name)) arms += amplitude;
    if (/spine|chest|neck|head/.test(name)) torso += amplitude;
    if (/root|hips|hip|pelvis/.test(name)) root += amplitude;
  });

  return { legs, arms, torso, root, total };
}

function categoryFromName(name: string): FlowAnimationCategory | null {
  if (/walk|walking|stroll|pace|locomotion|run|jog/.test(name)) return "walk";
  if (/wave|waving|hello|greet|greeting|salute/.test(name)) return "greeting";
  if (/point|pointing|indicate|show|present/.test(name)) return "point";
  if (/talk|talking|speak|speaking|conversation|explain/.test(name)) return "talk";
  if (/think|thinking|ponder|wonder|confused|consider/.test(name)) return "think";
  if (/listen|listening|hear|attentive|nod/.test(name)) return "listen";
  if (/idle|stand|standing|breath|waiting|relax/.test(name)) return "idle";
  if (/sit|sitting|kneel|lie|lay|fall|jump|dance|combat|attack|kick|punch/.test(name)) return "transition";
  return null;
}

function inferCategory(clip: AnimationClip): FlowAnimationCategory {
  const name = normalizedName(clip.name);
  const named = categoryFromName(name);
  if (named) return named;

  const stats = motionStats(clip);
  const duration = Math.max(clip.duration, 0.01);
  const legRatio = stats.legs / Math.max(stats.total, 0.001);
  const armRatio = stats.arms / Math.max(stats.total, 0.001);

  if (legRatio > 0.34 && stats.legs > stats.arms * 1.05 && duration < 8) return "walk";
  if (armRatio > 0.38 && stats.legs < stats.arms * 0.45 && duration < 6) return "gesture";
  if (stats.total < 1.15 || duration > 8) return "idle";
  if (stats.torso > stats.legs && stats.arms > stats.legs) return "talk";
  return "gesture";
}

function cloneWithoutRootTranslation(source: AnimationClip) {
  const clip = source.clone();
  clip.tracks = clip.tracks.filter((track) => {
    if (!(track instanceof VectorKeyframeTrack)) return true;
    const name = normalizedName(track.name);
    const isPosition = / position$|\.position|position/.test(name);
    const isRoot = /root|hips|hip|pelvis/.test(name);
    return !(isPosition && isRoot);
  });
  clip.resetDuration();
  return clip;
}

function qualityWeight(clip: AnimationClip, category: FlowAnimationCategory) {
  const stats = motionStats(clip);
  const duration = Math.max(clip.duration, 0.1);
  let weight = 1;

  if (duration < 0.25 || duration > 20) weight *= 0.35;
  if (category === "walk" && stats.legs < 0.2) weight *= 0.25;
  if ((category === "greeting" || category === "point" || category === "gesture") && stats.arms < 0.15) weight *= 0.35;
  if (category === "idle" && stats.total > 12) weight *= 0.45;
  return Math.max(0.08, weight);
}

export function buildAnimationCatalog(sourceClips: AnimationClip[]): FlowAnimationCatalog {
  const catalog = EMPTY_CATALOG();

  sourceClips
    .filter((clip) => clip && clip.tracks.length > 0 && clip.duration > 0.05)
    .forEach((source, index) => {
      const clip = cloneWithoutRootTranslation(source);
      clip.name = source.name?.trim() || `FlowClip_${String(index + 1).padStart(3, "0")}`;
      const category = inferCategory(clip);
      const entry: FlowAnimationEntry = {
        clip,
        category,
        weight: qualityWeight(clip, category),
        loop: category === "idle" || category === "walk" || category === "talk" || category === "listen",
        cooldownMs: category === "idle" ? 12000 : category === "walk" ? 1000 : 24000,
        energy: Math.min(1, motionStats(clip).total / 12),
      };
      catalog[category].push(entry);
    });

  // Useful fallbacks: every master FBX is different, but the engine must stay alive.
  if (!catalog.idle.length) catalog.idle.push(...catalog.gesture.slice(0, 4));
  if (!catalog.talk.length) catalog.talk.push(...catalog.gesture.slice(0, 8));
  if (!catalog.greeting.length) catalog.greeting.push(...catalog.gesture.slice(0, 8));
  if (!catalog.point.length) catalog.point.push(...catalog.gesture.slice(0, 8));
  if (!catalog.think.length) catalog.think.push(...catalog.idle.slice(0, 8));
  if (!catalog.listen.length) catalog.listen.push(...catalog.idle.slice(0, 8));

  return catalog;
}

export function modeCategories(mode: FlowMode): FlowAnimationCategory[] {
  switch (mode) {
    case "walking": return ["walk"];
    case "talking": return ["talk", "gesture"];
    case "waving": return ["greeting", "gesture"];
    case "pointing": return ["point", "gesture"];
    case "thinking": return ["think", "idle"];
    case "listening": return ["listen", "idle"];
    case "idle": return ["idle", "gesture"];
    default: return ["idle"];
  }
}

export function chooseAnimation(
  catalog: FlowAnimationCatalog,
  mode: FlowMode,
  recentlyUsed: Map<string, number>,
  now = Date.now(),
) {
  const candidates = modeCategories(mode).flatMap((category) => catalog[category]);
  if (!candidates.length) return null;

  const available = candidates.filter((entry) => {
    const last = recentlyUsed.get(entry.clip.uuid) || 0;
    return now - last >= entry.cooldownMs;
  });
  const pool = available.length ? available : candidates;
  const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
  let cursor = Math.random() * Math.max(total, 0.001);
  for (const entry of pool) {
    cursor -= entry.weight;
    if (cursor <= 0) return entry;
  }
  return pool[pool.length - 1];
}

export function summarizeCatalog(catalog: FlowAnimationCatalog) {
  return Object.fromEntries(
    Object.entries(catalog).map(([key, entries]) => [key, entries.length]),
  );
}
