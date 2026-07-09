"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Box3,
  Euler,
  Group,
  LoopOnce,
  LoopRepeat,
  Mesh,
  Object3D,
  Quaternion,
  Vector2,
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

const MODEL_URL = "/avatars/flowly.glb";
const BASE_FRONT_ROTATION = Math.PI;

const LOWER_BODY_KEYWORDS = ["thigh", "calf", "foot", "toe", "leg"];
const UPPER_BODY_KEYWORDS = ["clavicle", "shoulder", "upperarm", "forearm", "hand", "arm"];
const TORSO_KEYWORDS = ["spine", "waist", "pelvis", "hips", "hip"];
const HEAD_KEYWORDS = ["head", "neck"];

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

function includesAny(value: string, keywords: string[]) {
  const normalized = value.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

function trackEnergy(track: AnimationClip["tracks"][number]) {
  const values = track.values;
  if (!values || values.length < 8) return 0;

  let score = 0;
  const step = Math.max(1, Math.floor(values.length / 180));
  for (let index = step; index < values.length; index += step) {
    score += Math.abs(values[index] - values[index - step]);
  }
  return score / Math.max(1, values.length / step);
}

function scoreClip(clip: AnimationClip, keywords: string[]) {
  return clip.tracks.reduce((total, track) => {
    if (!includesAny(track.name, keywords)) return total;
    if (track.name.toLowerCase().includes("scale")) return total;
    return total + trackEnergy(track);
  }, 0);
}

function totalClipScore(clip: AnimationClip) {
  return clip.tracks.reduce((total, track) => {
    if (track.name.toLowerCase().includes("scale")) return total;
    return total + trackEnergy(track);
  }, 0);
}

function cloneClipWithoutRootTranslation(clip: AnimationClip, name: string) {
  const tracks = clip.tracks
    .filter((track) => {
      const lower = track.name.toLowerCase();
      if (lower.includes("scale")) return false;
      // Evita que una animación desplace el personaje fuera del overlay.
      if ((lower.includes("root") || lower.includes("hip") || lower.includes("pelvis")) && lower.includes("position")) return false;
      return true;
    })
    .map((track) => track.clone());

  const cloned = new AnimationClip(name, clip.duration, tracks);
  cloned.optimize();
  return cloned;
}

function pickClips(sourceClips: AnimationClip[]) {
  const clips = sourceClips.filter((clip) => clip.tracks?.length > 0);
  if (!clips.length) return {} as Partial<Record<FlowMode, AnimationClip>>;

  const byTotal = [...clips].sort((a, b) => totalClipScore(a) - totalClipScore(b));
  const idleSource = byTotal[0] || clips[0];

  const byLower = [...clips].sort((a, b) => scoreClip(b, LOWER_BODY_KEYWORDS) - scoreClip(a, LOWER_BODY_KEYWORDS));
  const walkSource = byLower[0] || idleSource;

  const byUpper = [...clips].sort((a, b) => scoreClip(b, UPPER_BODY_KEYWORDS) - scoreClip(a, UPPER_BODY_KEYWORDS));
  const waveSource = byUpper[0] || idleSource;
  const pointSource = byUpper.find((clip) => clip !== waveSource) || waveSource;

  const byTalk = [...clips].sort((a, b) => {
    const scoreA = scoreClip(a, UPPER_BODY_KEYWORDS) + scoreClip(a, TORSO_KEYWORDS) + scoreClip(a, HEAD_KEYWORDS) - scoreClip(a, LOWER_BODY_KEYWORDS) * 0.35;
    const scoreB = scoreClip(b, UPPER_BODY_KEYWORDS) + scoreClip(b, TORSO_KEYWORDS) + scoreClip(b, HEAD_KEYWORDS) - scoreClip(b, LOWER_BODY_KEYWORDS) * 0.35;
    return scoreB - scoreA;
  });
  const talkSource = byTalk.find((clip) => clip !== walkSource && clip !== waveSource) || byTalk[0] || idleSource;

  const thinkingSource = byTotal.find((clip) => clip !== idleSource) || idleSource;

  return {
    idle: cloneClipWithoutRootTranslation(idleSource, "flow_idle"),
    walk: cloneClipWithoutRootTranslation(walkSource, "flow_walk"),
    talk: cloneClipWithoutRootTranslation(talkSource, "flow_talk"),
    wave: cloneClipWithoutRootTranslation(waveSource, "flow_wave"),
    point: cloneClipWithoutRootTranslation(pointSource, "flow_point"),
    thinking: cloneClipWithoutRootTranslation(thinkingSource, "flow_thinking"),
  } satisfies Partial<Record<FlowMode, AnimationClip>>;
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

  if (mode === "walk") action.setEffectiveTimeScale(1.05);
  else if (mode === "talk") action.setEffectiveTimeScale(0.92);
  else if (mode === "thinking") action.setEffectiveTimeScale(0.66);
  else action.setEffectiveTimeScale(1);

  return action;
}

function facingOffset(facing: "left" | "right" | "front") {
  // Giro muy pequeño; Flow debe seguir mirando al usuario, no quedar de lado.
  if (facing === "left") return 0.22;
  if (facing === "right") return -0.22;
  return 0;
}

function findFirstByName(root: Object3D, names: string[]) {
  const wanted = names.map((name) => name.toLowerCase());
  let found: Object3D | null = null;

  root.traverse((object) => {
    if (found) return;
    const objectName = object.name.toLowerCase();
    if (wanted.some((name) => objectName === name || objectName.includes(name))) found = object;
  });

  return found;
}

function FlowModel({ mode = "idle", facing = "front", compact = true }: Required<Pick<FlowRealAssistant3DProps, "mode" | "facing" | "compact">>) {
  const rootRef = useRef<Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const currentActionRef = useRef<AnimationAction | null>(null);
  const actionsRef = useRef<Partial<Record<FlowMode, AnimationAction>>>({});
  const modeRef = useRef<FlowMode>(mode);
  const facingRef = useRef(facing);
  const pointerRef = useRef(new Vector2(0, 0));
  const headRef = useRef<Object3D | null>(null);
  const neckRef = useRef<Object3D | null>(null);
  const headOffsetRef = useRef(new Quaternion());
  const neckOffsetRef = useRef(new Quaternion());

  const gltf = useGLTF(MODEL_URL);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    facingRef.current = facing;
  }, [facing]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current.set(
        (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2,
        -(event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2
      );
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  const model = useMemo(() => {
    const cloned = cloneSkeleton(gltf.scene) as Group;
    const box = new Box3().setFromObject(cloned);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);

    const height = size.y || 1;
    const targetHeight = compact ? 2.42 : 3.22;
    const scale = targetHeight / height;

    cloned.position.set(
      -center.x * scale,
      -box.min.y * scale - (compact ? 1.18 : 1.72),
      -center.z * scale
    );
    cloned.scale.setScalar(scale);
    cloned.rotation.y = BASE_FRONT_ROTATION;

    cloned.traverse((object) => {
      if (!isMesh(object)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = false;
    });

    headRef.current = findFirstByName(cloned, ["Head"]);
    neckRef.current = findFirstByName(cloned, ["NeckTwist02", "NeckTwist01", "Neck"]);

    return cloned;
  }, [gltf.scene, compact]);

  const clipMap = useMemo(() => pickClips(gltf.animations || []), [gltf.animations]);

  useEffect(() => {
    const mixer = new AnimationMixer(model);
    mixerRef.current = mixer;

    const actions: Partial<Record<FlowMode, AnimationAction>> = {};

    for (const key of ["idle", "walk", "talk", "wave", "point", "thinking"] as FlowMode[]) {
      const clip = clipMap[key] || clipMap.idle;
      if (!clip) continue;
      actions[key] = configureAction(mixer.clipAction(clip, model), key);
    }

    actionsRef.current = actions;
    const initial = actions[mode] || actions.idle;
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
  }, [model, clipMap, mode]);

  useEffect(() => {
    const actions = actionsRef.current;
    const next = actions[mode] || actions.idle;
    if (!next || currentActionRef.current === next) return;

    const previous = currentActionRef.current;
    next.reset().fadeIn(0.24).play();
    previous?.fadeOut(0.24);
    currentActionRef.current = next;

    if ((mode === "wave" || mode === "point") && actions.idle) {
      const timer = window.setTimeout(() => {
        const idle = actionsRef.current.idle;
        if (!idle || modeRef.current !== mode) return;
        const current = currentActionRef.current;
        idle.reset().fadeIn(0.28).play();
        current?.fadeOut(0.28);
        currentActionRef.current = idle;
      }, mode === "wave" ? 1700 : 1350);

      return () => window.clearTimeout(timer);
    }
  }, [mode]);

  useFrame((state, delta) => {
    mixerRef.current?.update(delta);

    const root = rootRef.current;
    if (!root) return;

    const t = state.clock.elapsedTime;
    const currentMode = modeRef.current;
    const pointer = pointerRef.current;

    const subtleMouseYaw = Math.max(-0.18, Math.min(0.18, pointer.x * 0.09));
    const targetRotationY = facingOffset(facingRef.current) + subtleMouseYaw;
    root.rotation.y += (targetRotationY - root.rotation.y) * Math.min(1, delta * 4.8);

    // Presencia mínima del cuerpo completo. Las animaciones reales vienen del GLB.
    const breathe = Math.sin(t * 1.1) * (currentMode === "walk" ? 0.001 : 0.004);
    root.position.y = breathe;
    root.rotation.z = Math.sin(t * 0.42) * (currentMode === "walk" ? 0.0008 : 0.0022);

    const head = headRef.current;
    const neck = neckRef.current;

    if (head || neck) {
      const headYaw = Math.max(-0.16, Math.min(0.16, pointer.x * 0.12));
      const headPitch = Math.max(-0.10, Math.min(0.10, pointer.y * 0.07));
      const neckYaw = headYaw * 0.42;
      const neckPitch = headPitch * 0.36;

      headOffsetRef.current.setFromEuler(new Euler(headPitch, headYaw, 0, "XYZ"));
      neckOffsetRef.current.setFromEuler(new Euler(neckPitch, neckYaw, 0, "XYZ"));

      // El mixer actualiza la pose cada frame; multiplicamos un offset pequeño y acotado.
      if (neck) neck.quaternion.multiply(neckOffsetRef.current);
      if (head) head.quaternion.multiply(headOffsetRef.current);
    }
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
        camera={{ position: [0, 1.18, 8], zoom: compact ? 76 : 66, near: 0.1, far: 100 }}
        dpr={[1, 1.75]}
        shadows
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={1.45} />
        <directionalLight position={[2.6, 4.8, 5.5]} intensity={2.25} castShadow />
        <pointLight position={[-2.4, 2.2, 3]} color="#67e8f9" intensity={0.95} />
        <pointLight position={[1.6, 0.75, 2.4]} color="#a855f7" intensity={0.64} />
        <Suspense fallback={<Loading />}>
          <FlowModel mode={mode} facing={facing} compact={compact} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
