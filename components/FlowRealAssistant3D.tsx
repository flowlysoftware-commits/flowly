"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Html, useFBX } from "@react-three/drei";
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Box3,
  Color,
  Group,
  KeyframeTrack,
  LoopOnce,
  LoopRepeat,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  TextureLoader,
  Vector3,
} from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

type FlowMode = "idle" | "walk" | "wave" | "talk" | "point" | "thinking";

type FlowRealAssistant3DProps = {
  mode?: FlowMode;
  facing?: "left" | "right" | "front";
  compact?: boolean;
  onClick?: () => void;
};

const MODEL_URL = "/models/flow/flow.fbx";
const TEXTURE_URLS = {
  color: "/models/flow/color.jpg",
  normal: "/models/flow/normal.jpg",
  roughness: "/models/flow/roughness.jpeg",
  metalness: "/models/flow/metallic.jpeg",
};

const ANIMATION_URLS: Record<Exclude<FlowMode, "thinking">, string> = {
  idle: "/avatars/Idle.fbx",
  walk: "/avatars/Walking.fbx",
  talk: "/avatars/Talking.fbx",
  wave: "/avatars/Waving.fbx",
  point: "/avatars/Pointing.fbx",
};

// El FBX del personaje está exportado de espaldas respecto a la cámara web.
// Este giro deja el torso mirando al usuario.
const BASE_FRONT_ROTATION = Math.PI;

function isMesh(object: unknown): object is Mesh {
  return Boolean(object && typeof object === "object" && "isMesh" in object && (object as Mesh).isMesh);
}

function Loading() {
  return (
    <Html center className="flowly-v3-loading-label">
      <span>Cargando Flow…</span>
    </Html>
  );
}

function normalizeBoneName(value: string) {
  return value
    .replace(/^.*:/, "")
    .replace(/^mixamorig/i, "")
    .replace(/^Armature[_\-. ]?/i, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

function collectObjectNameMap(root: Object3D) {
  const exact = new Map<string, string>();
  const normalized = new Map<string, string>();

  root.traverse((object) => {
    if (!object.name) return;
    exact.set(object.name, object.name);
    const key = normalizeBoneName(object.name);
    if (key && !normalized.has(key)) normalized.set(key, object.name);
  });

  return { exact, normalized };
}

function splitTrackName(trackName: string) {
  const dotIndex = trackName.indexOf(".");
  if (dotIndex < 0) return { nodeName: trackName, property: "" };
  return {
    nodeName: trackName.slice(0, dotIndex),
    property: trackName.slice(dotIndex),
  };
}

function shouldDropTrack(nodeName: string, property: string) {
  const normalized = normalizeBoneName(nodeName);

  // Evita que algunos FBX muevan todo el avatar fuera de su sitio.
  // Mantiene Hips.position porque es necesaria para caminar natural.
  if (property === ".position" && (normalized === "armature" || normalized === "root" || normalized === "scene")) {
    return true;
  }

  return false;
}

function retargetClipToModel(group: Group, model: Group, fallbackName: string) {
  const sourceClip = group.animations?.find((item) => item.tracks?.length > 0) || group.animations?.[0];
  if (!sourceClip) return null;

  const names = collectObjectNameMap(model);
  const tracks: KeyframeTrack[] = [];

  for (const track of sourceClip.tracks) {
    const { nodeName, property } = splitTrackName(track.name);
    if (!property || shouldDropTrack(nodeName, property)) continue;

    const exactMatch = names.exact.get(nodeName);
    const normalizedMatch = names.normalized.get(normalizeBoneName(nodeName));
    const targetName = exactMatch || normalizedMatch;

    if (!targetName) {
      // Si no encontramos el hueso en el avatar real, no aplicamos esa pista.
      // Esto evita rotaciones raras de cabeza/cuello/piernas por nombres incompatibles.
      continue;
    }

    const clonedTrack = track.clone();
    clonedTrack.name = `${targetName}${property}`;
    tracks.push(clonedTrack);
  }

  if (tracks.length === 0) return null;

  const clip = new AnimationClip(fallbackName, sourceClip.duration, tracks);
  return clip.optimize();
}

function configureAction(action: AnimationAction, mode: FlowMode) {
  action.enabled = true;
  action.clampWhenFinished = mode === "wave" || mode === "point";

  if (mode === "wave" || mode === "point") {
    action.setLoop(LoopOnce, 1);
  } else {
    action.setLoop(LoopRepeat, Infinity);
  }

  action.setEffectiveWeight(1);

  if (mode === "walk") action.setEffectiveTimeScale(1.16);
  else if (mode === "talk") action.setEffectiveTimeScale(0.95);
  else if (mode === "thinking") action.setEffectiveTimeScale(0.72);
  else action.setEffectiveTimeScale(1);

  return action;
}

function facingOffset(facing: "left" | "right" | "front") {
  // Pequeño giro expresivo, no giro lateral completo. Así no vuelve a mirar de lado.
  if (facing === "left") return 0.16;
  if (facing === "right") return -0.16;
  return 0;
}

function FlowModel({ mode = "idle", facing = "front", compact = true }: Required<Pick<FlowRealAssistant3DProps, "mode" | "facing" | "compact">>) {
  const rootRef = useRef<Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const currentActionRef = useRef<AnimationAction | null>(null);
  const actionsRef = useRef<Partial<Record<FlowMode, AnimationAction>>>({});
  const modeRef = useRef<FlowMode>(mode);
  const facingRef = useRef(facing);

  const modelFbx = useFBX(MODEL_URL) as Group;
  const idleFbx = useFBX(ANIMATION_URLS.idle) as Group;
  const walkFbx = useFBX(ANIMATION_URLS.walk) as Group;
  const talkFbx = useFBX(ANIMATION_URLS.talk) as Group;
  const waveFbx = useFBX(ANIMATION_URLS.wave) as Group;
  const pointFbx = useFBX(ANIMATION_URLS.point) as Group;

  const colorMap = useLoader(TextureLoader, TEXTURE_URLS.color);
  const normalMap = useLoader(TextureLoader, TEXTURE_URLS.normal);
  const roughnessMap = useLoader(TextureLoader, TEXTURE_URLS.roughness);
  const metalnessMap = useLoader(TextureLoader, TEXTURE_URLS.metalness);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    facingRef.current = facing;
  }, [facing]);

  const model = useMemo(() => {
    const cloned = cloneSkeleton(modelFbx) as Group;
    const box = new Box3().setFromObject(cloned);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);

    const height = size.y || 1;
    const targetHeight = compact ? 2.18 : 3.15;
    const scale = targetHeight / height;

    cloned.position.set(
      -center.x * scale,
      -box.min.y * scale - (compact ? 1.05 : 1.72),
      -center.z * scale
    );
    cloned.scale.setScalar(scale);
    cloned.rotation.y = BASE_FRONT_ROTATION;

    cloned.traverse((object) => {
      if (!isMesh(object)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = false;

      object.material = new MeshStandardMaterial({
        map: colorMap,
        normalMap,
        roughnessMap,
        metalnessMap,
        color: new Color("#ffffff"),
        roughness: 0.74,
        metalness: 0.08,
      });
    });

    return cloned;
  }, [modelFbx, colorMap, normalMap, roughnessMap, metalnessMap, compact]);

  useEffect(() => {
    const mixer = new AnimationMixer(model);
    mixerRef.current = mixer;

    const clips: Partial<Record<FlowMode, AnimationClip | null>> = {
      idle: retargetClipToModel(idleFbx, model, "flow_idle"),
      walk: retargetClipToModel(walkFbx, model, "flow_walk"),
      talk: retargetClipToModel(talkFbx, model, "flow_talk"),
      wave: retargetClipToModel(waveFbx, model, "flow_wave"),
      point: retargetClipToModel(pointFbx, model, "flow_point"),
      thinking: retargetClipToModel(idleFbx, model, "flow_thinking"),
    };

    const actions: Partial<Record<FlowMode, AnimationAction>> = {};

    for (const key of ["idle", "walk", "talk", "wave", "point", "thinking"] as FlowMode[]) {
      const clip = clips[key] || clips.idle;
      if (!clip) continue;
      actions[key] = configureAction(mixer.clipAction(clip, model), key);
    }

    actionsRef.current = actions;
    const initial = actions[modeRef.current] || actions.idle;
    if (initial) {
      initial.reset().fadeIn(0.2).play();
      currentActionRef.current = initial;
    }

    return () => {
      mixer.stopAllAction();
      actionsRef.current = {};
      currentActionRef.current = null;
      mixerRef.current = null;
    };
  }, [model, idleFbx, walkFbx, talkFbx, waveFbx, pointFbx]);

  useEffect(() => {
    const actions = actionsRef.current;
    const next = actions[mode] || actions.idle;
    if (!next || currentActionRef.current === next) return;

    const previous = currentActionRef.current;
    next.reset().fadeIn(mode === "walk" ? 0.12 : 0.24).play();
    previous?.fadeOut(mode === "walk" ? 0.12 : 0.24);
    currentActionRef.current = next;

    if ((mode === "wave" || mode === "point") && actions.idle) {
      const timer = window.setTimeout(() => {
        const idle = actionsRef.current.idle;
        if (!idle || modeRef.current !== mode) return;
        const current = currentActionRef.current;
        idle.reset().fadeIn(0.25).play();
        current?.fadeOut(0.25);
        currentActionRef.current = idle;
      }, mode === "wave" ? 1450 : 1150);

      return () => window.clearTimeout(timer);
    }
  }, [mode]);

  useFrame((state, delta) => {
    mixerRef.current?.update(delta);

    const root = rootRef.current;
    if (!root) return;

    const t = state.clock.elapsedTime;
    const currentMode = modeRef.current;
    const isWalking = currentMode === "walk";
    const isTalking = currentMode === "talk";
    const isThinking = currentMode === "thinking";

    const targetRotationY = facingOffset(facingRef.current);
    root.rotation.y += (targetRotationY - root.rotation.y) * Math.min(1, delta * 4.5);

    // Presencia suave encima de los clips FBX. No toca huesos.
    const idleBreath = Math.sin(t * 1.25) * (isWalking ? 0.001 : 0.006);
    const talkingPulse = isTalking ? Math.sin(t * 4.8) * 0.003 : 0;
    const thinkingLean = isThinking ? Math.sin(t * 0.8) * 0.006 : 0;

    root.position.y = idleBreath + talkingPulse;
    root.rotation.x = thinkingLean;
    root.rotation.z = isWalking ? Math.sin(t * 6.4) * 0.004 : Math.sin(t * 0.55) * 0.0025;
  });

  return (
    <group ref={rootRef}>
      <primitive object={model} />
    </group>
  );
}

export default function FlowRealAssistant3D({ mode = "idle", facing = "front", compact = true, onClick }: FlowRealAssistant3DProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && onClick) {
          event.preventDefault();
          onClick();
        }
      }}
      className="flowly-avatar-renderer-v6 flow-real-avatar-renderer"
      data-mode={mode}
      data-facing={facing}
      data-compact={compact ? "true" : "false"}
      aria-label="Abrir Flow"
    >
      <Canvas
        className="flowly-v3-canvas"
        orthographic
        camera={{ position: [0, 1.22, 8], zoom: compact ? 78 : 66, near: 0.1, far: 100 }}
        dpr={[1, 1.75]}
        shadows
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[2.6, 4.8, 5.5]} intensity={2.35} castShadow />
        <pointLight position={[-2.4, 2.2, 3]} color="#67e8f9" intensity={1.05} />
        <pointLight position={[1.6, 0.75, 2.4]} color="#a855f7" intensity={0.7} />
        <Suspense fallback={<Loading />}>
          <FlowModel mode={mode} facing={facing} compact={compact} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useFBX.preload(MODEL_URL);
useFBX.preload(ANIMATION_URLS.idle);
useFBX.preload(ANIMATION_URLS.walk);
useFBX.preload(ANIMATION_URLS.talk);
useFBX.preload(ANIMATION_URLS.wave);
useFBX.preload(ANIMATION_URLS.point);
