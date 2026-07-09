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
  LoopOnce,
  LoopRepeat,
  Mesh,
  MeshStandardMaterial,
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

const ANIMATION_URLS = {
  idle: "/avatars/Idle.fbx",
  walk: "/avatars/Walking.fbx",
  talk: "/avatars/Talking.fbx",
  wave: "/avatars/Waving.fbx",
  point: "/avatars/Pointing.fbx",
};

const BASE_FRONT_ROTATION = Math.PI;

const MODEL_BONE_NAMES = new Set([
  "Root",
  "Pelvis",
  "Waist",
  "Spine01",
  "Spine02",
  "NeckTwist01",
  "NeckTwist02",
  "Head",
  "L_Clavicle",
  "L_Upperarm",
  "L_Forearm",
  "L_Hand",
  "R_Clavicle",
  "R_Upperarm",
  "R_Forearm",
  "R_Hand",
  "L_Thigh",
  "L_Calf",
  "L_Foot",
  "R_Thigh",
  "R_Calf",
  "R_Foot",
]);

const RETARGET_BONE_MAP: Record<string, string> = {
  "mixamorig:Hips": "Pelvis",
  "mixamorig:Spine": "Waist",
  "mixamorig:Spine1": "Spine01",
  "mixamorig:Spine2": "Spine02",
  "mixamorig:Neck": "NeckTwist01",
  "mixamorig:Head": "Head",

  "mixamorig:LeftShoulder": "L_Clavicle",
  "mixamorig:LeftArm": "L_Upperarm",
  "mixamorig:LeftForeArm": "L_Forearm",
  "mixamorig:LeftHand": "L_Hand",
  "mixamorig:RightShoulder": "R_Clavicle",
  "mixamorig:RightArm": "R_Upperarm",
  "mixamorig:RightForeArm": "R_Forearm",
  "mixamorig:RightHand": "R_Hand",

  "mixamorig:LeftUpLeg": "L_Thigh",
  "mixamorig:LeftLeg": "L_Calf",
  "mixamorig:LeftFoot": "L_Foot",
  "mixamorig:RightUpLeg": "R_Thigh",
  "mixamorig:RightLeg": "R_Calf",
  "mixamorig:RightFoot": "R_Foot",
};

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

function getTrackParts(trackName: string) {
  const dotIndex = trackName.lastIndexOf(".");
  if (dotIndex < 0) return null;
  return {
    nodeName: trackName.slice(0, dotIndex),
    propertyName: trackName.slice(dotIndex + 1),
  };
}

function retargetClip(sourceClip: AnimationClip | undefined, fallbackName: string, mode: FlowMode) {
  if (!sourceClip) return null;

  const tracks = sourceClip.tracks
    .map((track) => {
      const parts = getTrackParts(track.name);
      if (!parts) return null;

      const mappedBone = RETARGET_BONE_MAP[parts.nodeName] || (MODEL_BONE_NAMES.has(parts.nodeName) ? parts.nodeName : null);
      if (!mappedBone) return null;

      // Evitamos escalados y dedos/accesorios. El modelo real de Flow tiene un rig más simple.
      if (parts.propertyName === "scale") return null;

      // Las posiciones de muchos paquetes FBX son root-motion o offsets del rig origen.
      // Solo dejamos una posición de pelvis MUY reducida para respiración/cambio de peso natural.
      if (parts.propertyName === "position" && mappedBone !== "Pelvis") return null;

      const clonedTrack = track.clone();
      clonedTrack.name = `${mappedBone}.${parts.propertyName}`;

      if (parts.propertyName === "position") {
        const values = clonedTrack.values;
        const positionScale = mode === "walk" ? 0.10 : 0.055;
        for (let index = 0; index < values.length; index += 1) {
          values[index] *= positionScale;
        }
      }

      return clonedTrack;
    })
    .filter(Boolean) as AnimationClip["tracks"];

  if (!tracks.length) return null;

  const clip = new AnimationClip(fallbackName, sourceClip.duration, tracks);
  clip.optimize();
  return clip;
}

function firstUsableClip(group: Group, fallbackName: string, mode: FlowMode) {
  const sourceClip = group.animations?.find((item) => item.tracks?.length > 0) || group.animations?.[0];
  return retargetClip(sourceClip, fallbackName, mode);
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
  else if (mode === "talk") action.setEffectiveTimeScale(0.96);
  else if (mode === "thinking") action.setEffectiveTimeScale(0.72);
  else action.setEffectiveTimeScale(1);

  return action;
}

function facingOffset(facing: "left" | "right" | "front") {
  // Pequeño giro de intención. La orientación principal del modelo se mantiene estable.
  if (facing === "left") return 0.62;
  if (facing === "right") return -0.62;
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
    const targetHeight = compact ? 2.26 : 3.18;
    const scale = targetHeight / height;

    cloned.position.set(
      -center.x * scale,
      -box.min.y * scale - (compact ? 1.10 : 1.72),
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
      idle: firstUsableClip(idleFbx, "flow_idle", "idle"),
      walk: firstUsableClip(walkFbx, "flow_walk", "walk"),
      talk: firstUsableClip(talkFbx, "flow_talk", "talk"),
      wave: firstUsableClip(waveFbx, "flow_wave", "wave"),
      point: firstUsableClip(pointFbx, "flow_point", "point"),
      thinking: firstUsableClip(idleFbx, "flow_thinking", "thinking"),
    };

    const actions: Partial<Record<FlowMode, AnimationAction>> = {};

    for (const key of ["idle", "walk", "talk", "wave", "point", "thinking"] as FlowMode[]) {
      const clip = clips[key] || clips.idle;
      if (!clip) continue;
      actions[key] = configureAction(mixer.clipAction(clip, model), key);
    }

    actionsRef.current = actions;
    const initial = actions[mode] || actions.idle;
    if (initial) {
      initial.reset().fadeIn(0.18).play();
      currentActionRef.current = initial;
    }

    return () => {
      mixer.stopAllAction();
      actionsRef.current = {};
      currentActionRef.current = null;
      mixerRef.current = null;
    };
  }, [model, idleFbx, walkFbx, talkFbx, waveFbx, pointFbx, mode]);

  useEffect(() => {
    const actions = actionsRef.current;
    const next = actions[mode] || actions.idle;
    if (!next || currentActionRef.current === next) return;

    const previous = currentActionRef.current;
    next.reset().fadeIn(0.26).play();
    previous?.fadeOut(0.26);
    currentActionRef.current = next;

    if ((mode === "wave" || mode === "point") && actions.idle) {
      const timer = window.setTimeout(() => {
        const idle = actionsRef.current.idle;
        if (!idle || modeRef.current !== mode) return;
        const current = currentActionRef.current;
        idle.reset().fadeIn(0.28).play();
        current?.fadeOut(0.28);
        currentActionRef.current = idle;
      }, mode === "wave" ? 1650 : 1300);

      return () => window.clearTimeout(timer);
    }
  }, [mode]);

  useFrame((state, delta) => {
    mixerRef.current?.update(delta);

    const root = rootRef.current;
    if (!root) return;

    const t = state.clock.elapsedTime;
    const currentMode = modeRef.current;

    const targetRotationY = facingOffset(facingRef.current);
    root.rotation.y += (targetRotationY - root.rotation.y) * Math.min(1, delta * 5.2);

    // Solo presencia global mínima. Las piernas, brazos y cabeza las mueve AnimationMixer.
    const breathe = Math.sin(t * 1.25) * (currentMode === "walk" ? 0.002 : 0.006);
    root.position.y = breathe;
    root.rotation.z = Math.sin(t * 0.55) * (currentMode === "walk" ? 0.0015 : 0.003);
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
