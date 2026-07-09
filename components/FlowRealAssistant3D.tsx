"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useFBX, useGLTF } from "@react-three/drei";
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Box3,
  Group,
  LoopOnce,
  LoopRepeat,
  Mesh,
  Object3D,
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
const CLIP_URLS: Record<FlowMode, string> = {
  idle: "/avatars/Idle.fbx",
  walk: "/avatars/Walking.fbx",
  wave: "/avatars/Waving.fbx",
  talk: "/avatars/Talking.fbx",
  point: "/avatars/Pointing.fbx",
  thinking: "/avatars/Idle.fbx",
};

// La orientación del avatar se controla aquí. Si el FBX/GLB vuelve a quedar de lado,
// solo hay que tocar este valor, no todo el runtime.
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

function sanitizeClip(clip: AnimationClip, name: string) {
  const tracks = clip.tracks
    .filter((track) => {
      const lower = track.name.toLowerCase();
      if (lower.includes("scale")) return false;
      // En web el desplazamiento lo controla el overlay DOM. La animación solo mueve el esqueleto.
      if ((lower.includes("root") || lower.includes("hips") || lower.includes("hip") || lower.includes("pelvis")) && lower.includes("position")) return false;
      return true;
    })
    .map((track) => track.clone());

  const clean = new AnimationClip(name, clip.duration, tracks);
  clean.optimize();
  return clean;
}

function firstClipFromFbx(fbx: Group, fallbackName: string) {
  const animations = (fbx.animations || []).filter((clip) => clip.tracks?.length > 0);
  if (!animations.length) return null;
  return sanitizeClip(animations[0], fallbackName);
}

function facingToYaw(facing: "left" | "right" | "front") {
  if (facing === "left") return 0.34;
  if (facing === "right") return -0.34;
  return 0;
}

function configureAction(action: AnimationAction, mode: FlowMode) {
  action.enabled = true;
  action.clampWhenFinished = mode === "wave" || mode === "point";
  action.setLoop(mode === "wave" || mode === "point" ? LoopOnce : LoopRepeat, mode === "wave" || mode === "point" ? 1 : Infinity);
  action.setEffectiveWeight(1);

  if (mode === "walk") action.setEffectiveTimeScale(1.0);
  else if (mode === "talk") action.setEffectiveTimeScale(0.92);
  else if (mode === "thinking") action.setEffectiveTimeScale(0.62);
  else action.setEffectiveTimeScale(1);

  return action;
}

function FlowModel({ mode, facing, compact }: Required<Pick<FlowRealAssistant3DProps, "mode" | "facing" | "compact">>) {
  const rootRef = useRef<Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const currentActionRef = useRef<AnimationAction | null>(null);
  const actionsRef = useRef<Partial<Record<FlowMode, AnimationAction>>>({});
  const modeRef = useRef<FlowMode>(mode);
  const facingRef = useRef(facing);

  const gltf = useGLTF(MODEL_URL);
  const idleFbx = useFBX(CLIP_URLS.idle);
  const walkFbx = useFBX(CLIP_URLS.walk);
  const waveFbx = useFBX(CLIP_URLS.wave);
  const talkFbx = useFBX(CLIP_URLS.talk);
  const pointFbx = useFBX(CLIP_URLS.point);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    facingRef.current = facing;
  }, [facing]);

  const model = useMemo(() => {
    const cloned = cloneSkeleton(gltf.scene) as Group;
    const box = new Box3().setFromObject(cloned);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);

    const height = size.y || 1;
    const targetHeight = compact ? 2.28 : 3.05;
    const scale = targetHeight / height;

    cloned.position.set(-center.x * scale, -box.min.y * scale - (compact ? 1.03 : 1.48), -center.z * scale);
    cloned.scale.setScalar(scale);
    cloned.rotation.y = BASE_FRONT_ROTATION;

    cloned.traverse((object) => {
      if (!isMesh(object)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = false;
    });

    return cloned;
  }, [gltf.scene, compact]);

  const clips = useMemo(() => {
    const idle = firstClipFromFbx(idleFbx, "flow_idle") || firstClipFromFbx(walkFbx, "flow_idle_fallback");
    return {
      idle,
      walk: firstClipFromFbx(walkFbx, "flow_walk") || idle,
      wave: firstClipFromFbx(waveFbx, "flow_wave") || idle,
      talk: firstClipFromFbx(talkFbx, "flow_talk") || idle,
      point: firstClipFromFbx(pointFbx, "flow_point") || idle,
      thinking: idle,
    } satisfies Partial<Record<FlowMode, AnimationClip | null>>;
  }, [idleFbx, walkFbx, waveFbx, talkFbx, pointFbx]);

  useEffect(() => {
    const mixer = new AnimationMixer(model);
    mixerRef.current = mixer;

    const actions: Partial<Record<FlowMode, AnimationAction>> = {};
    for (const key of ["idle", "walk", "talk", "wave", "point", "thinking"] as FlowMode[]) {
      const clip = clips[key] || clips.idle;
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
  }, [model, clips, mode]);

  useEffect(() => {
    const actions = actionsRef.current;
    const next = actions[mode] || actions.idle;
    if (!next || currentActionRef.current === next) return;

    const previous = currentActionRef.current;
    next.reset().fadeIn(0.18).play();
    previous?.fadeOut(0.18);
    currentActionRef.current = next;

    if ((mode === "wave" || mode === "point") && actions.idle) {
      const timer = window.setTimeout(() => {
        if (modeRef.current !== mode) return;
        const idle = actionsRef.current.idle;
        if (!idle) return;
        const current = currentActionRef.current;
        idle.reset().fadeIn(0.22).play();
        current?.fadeOut(0.22);
        currentActionRef.current = idle;
      }, mode === "wave" ? 1650 : 1200);

      return () => window.clearTimeout(timer);
    }
  }, [mode]);

  useFrame((state, delta) => {
    mixerRef.current?.update(delta);

    const root = rootRef.current;
    if (!root) return;

    const t = state.clock.elapsedTime;
    const targetYaw = facingToYaw(facingRef.current);
    root.rotation.y += (targetYaw - root.rotation.y) * Math.min(1, delta * 5.2);

    // Solo presencia mínima. Nada de manipular cabeza/huesos a ciegas.
    if (modeRef.current !== "walk") {
      root.position.y = Math.sin(t * 1.1) * 0.004;
      root.rotation.z = Math.sin(t * 0.42) * 0.002;
    } else {
      root.position.y = Math.sin(t * 5.5) * 0.002;
      root.rotation.z = 0;
    }
  });

  return (
    <group ref={rootRef} rotation-y={0}>
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
        camera={{ position: [0, 1.12, 8], zoom: compact ? 78 : 66, near: 0.1, far: 100 }}
        dpr={[1, 1.75]}
        shadows
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={1.35} />
        <directionalLight position={[2.6, 4.8, 5.5]} intensity={2.15} castShadow />
        <pointLight position={[-2.4, 2.2, 3]} color="#67e8f9" intensity={0.88} />
        <pointLight position={[1.6, 0.75, 2.4]} color="#a855f7" intensity={0.58} />
        <Suspense fallback={<Loading />}>
          <FlowModel mode={mode} facing={facing} compact={compact} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
useFBX.preload(CLIP_URLS.idle);
useFBX.preload(CLIP_URLS.walk);
useFBX.preload(CLIP_URLS.wave);
useFBX.preload(CLIP_URLS.talk);
useFBX.preload(CLIP_URLS.point);
