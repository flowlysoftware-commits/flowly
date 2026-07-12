import { AnimationAction, AnimationClip, AnimationMixer, LoopOnce, LoopRepeat, Object3D } from "three";
import {
  CataloguedClip,
  FlowAnimationCatalog,
  chooseAnimation,
  randomPlaybackRate,
} from "./animationCatalog";
import { FlowEmotion, FlowMode } from "./types";

type PlayOptions = {
  force?: boolean;
  fallbackClip?: AnimationClip | null;
};

export class FlowAnimationEngine {
  private readonly mixer: AnimationMixer;
  private readonly root: Object3D;
  private readonly catalog: FlowAnimationCatalog;
  private activeAction: AnimationAction | null = null;
  private activeEntry: CataloguedClip | null = null;
  private activeFallback: AnimationClip | null = null;
  private readonly recentIds: string[] = [];
  private readonly cooldownUntil = new Map<string, number>();

  constructor(root: Object3D, catalog: FlowAnimationCatalog) {
    this.root = root;
    this.catalog = catalog;
    this.mixer = new AnimationMixer(root);
  }

  get hasActiveClip() {
    return Boolean(this.activeAction);
  }

  get activeClip() {
    return this.activeEntry?.clip ?? this.activeFallback;
  }

  update(delta: number) {
    this.mixer.update(delta);
  }

  playMode(mode: FlowMode, emotion: FlowEmotion, options: PlayOptions = {}) {
    const entry = chooseAnimation(this.catalog, {
      mode,
      emotion,
      recentIds: this.recentIds,
      cooldownUntil: this.cooldownUntil,
    });

    if (!entry && options.fallbackClip) {
      return this.playFallback(options.fallbackClip, mode, emotion, options.force);
    }

    if (!entry) {
      this.stop(0.22);
      return false;
    }

    if (!options.force && this.activeEntry?.id === entry.id && this.activeAction) return true;

    const previous = this.activeAction;
    const action = this.mixer.clipAction(entry.clip, this.root);
    action.reset();
    action.enabled = true;
    action.setEffectiveWeight(1);
    action.setEffectiveTimeScale(randomPlaybackRate(entry, emotion));
    action.setLoop(entry.loop === "once" ? LoopOnce : LoopRepeat, entry.loop === "once" ? 1 : Infinity);
    action.clampWhenFinished = entry.loop === "once";
    action.fadeIn(entry.blendIn).play();
    previous?.fadeOut(this.activeEntry?.blendOut ?? 0.24);

    this.activeAction = action;
    this.activeEntry = entry;
    this.activeFallback = null;
    this.cooldownUntil.set(entry.id, Date.now() + entry.cooldownMs);
    this.recentIds.unshift(entry.id);
    this.recentIds.splice(6);
    return true;
  }

  private playFallback(clip: AnimationClip, mode: FlowMode, emotion: FlowEmotion, force = false) {
    if (!force && this.activeFallback?.uuid === clip.uuid && this.activeAction) return true;
    const previous = this.activeAction;
    const action = this.mixer.clipAction(clip, this.root);
    action.reset();
    action.enabled = true;
    action.setEffectiveWeight(1);
    action.setEffectiveTimeScale(mode === "seated" ? 0.74 : 0.96 + emotion.energy * 0.08);
    action.setLoop(mode === "waving" || mode === "pointing" ? LoopOnce : LoopRepeat, 1);
    action.clampWhenFinished = mode === "waving" || mode === "pointing";
    action.fadeIn(0.24).play();
    previous?.fadeOut(0.24);
    this.activeAction = action;
    this.activeEntry = null;
    this.activeFallback = clip;
    return true;
  }

  stop(fadeOut = 0.2) {
    this.activeAction?.fadeOut(fadeOut);
    this.activeAction = null;
    this.activeEntry = null;
    this.activeFallback = null;
  }

  dispose() {
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.root);
    this.activeAction = null;
    this.activeEntry = null;
    this.activeFallback = null;
    this.recentIds.length = 0;
    this.cooldownUntil.clear();
  }
}
