"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useFBX, useTexture } from "@react-three/drei";
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Box3,
  Color,
  DoubleSide,
  Group,
  LoopOnce,
  LoopRepeat,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SRGBColorSpace,
  Texture,
  Vector3,
} from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { FLOW_ANIMATION_URLS, FLOW_FRONT_YAW, FLOW_MODEL_URL } from "./animationLibrary";
import { FlowEmotion, FlowFacing, FlowMode } from "./types";

type Props = {
  mode: FlowMode;
  facing: FlowFacing;
  emotion: FlowEmotion;
  onClick?: () => void;
};

const HUMANOID_BONE_ALIASES: Record<string, string> = {
  hips: "pelvis",
  pelvis: "pelvis",
  spine: "spine01",
  spine1: "spine02",
  spine2: "spine02",
  neck: "necktwist01",
  head: "head",
  leftshoulder: "lclavicle",
  leftarm: "lupperarm",
  leftforearm: "lforearm",
  lefthand: "lhand",
  leftupleg: "lthigh",
  leftleg: "lcalf",
  leftfoot: "lfoot",
  lefttoebase: "ltoebase",
  rightshoulder: "rclavicle",
  rightarm: "rupperarm",
  rightforearm: "rforearm",
  righthand: "rhand",
  rightupleg: "rthigh",
  rightleg: "rcalf",
  rightfoot: "rfoot",
  righttoebase: "rtoebase",
};

function normalizeBone(value: string) {
  return value
    .replace(/^.*[|:]/, "")
    .replace(/mixamorig/gi, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

function targetMap(root: Object3D) {
  const map = new Map<string, Object3D>();
  root.traverse((node) => {
    if (node.name) map.set(normalizeBone(node.name), node);
  });
  return map;
}

function findTargetBone(sourceName: string, map: Map<string, Object3D>) {
  const normalized = normalizeBone(sourceName);
  const aliased = HUMANOID_BONE_ALIASES[normalized] || normalized;
  const direct = map.get(aliased);
  if (direct) return direct;

  return [...map.entries()].find(
    ([key]) => key.endsWith(aliased) || aliased.endsWith(key),
  )?.[1];
}

function retarget(source: AnimationClip | undefined, target: Object3D, name: string) {
  if (!source) return null;
  const map = targetMap(target);

  const tracks = source.tracks.flatMap((track) => {
    const dot = track.name.lastIndexOf(".");
    if (dot < 0) return [];

    const sourceNode = track.name.slice(0, dot);
    const property = track.name.slice(dot + 1);
    const node = findTargetBone(sourceNode, map);

    if (!node || property === "scale") return [];

    // Keep locomotion in-place. The web movement controller moves the whole
    // character across the panel while the clip animates the complete rig.
    if (property === "position" && /pelvis|hips|root|armature/.test(normalizeBone(node.name))) {
      return [];
    }

    const cloned = track.clone();
    cloned.name = `${node.name}.${property}`;
    return [cloned];
  });

  return tracks.length ? new AnimationClip(name, source.duration, tracks) : null;
}

function first(group: Group) {
  return group.animations?.find((clip) => clip.tracks.length > 0);
}

function isMesh(node: Object3D): node is Mesh {
  return Boolean((node as Mesh).isMesh);
}

function createVisibleMaterial(
  color: Texture,
  normal: Texture,
  roughness: Texture,
  metallic: Texture,
  source?: unknown,
) {
  const sourceMaterial = source as {
    transparent?: boolean;
    opacity?: number;
    alphaTest?: number;
  } | undefined;

  return new MeshStandardMaterial({
    color: new Color(0xffffff),
    map: color,
    normalMap: normal,
    roughnessMap: roughness,
    metalnessMap: metallic,
    roughness: 0.78,
    metalness: 0.08,
    transparent: Boolean(sourceMaterial?.transparent),
    opacity: sourceMaterial?.opacity ?? 1,
    alphaTest: sourceMaterial?.alphaTest ?? 0,
    side: DoubleSide,
  });
}

function Loading() {
  return (
    <Html center>
      <span className="flow-engine-loading">Cargando Flow…</span>
    </Html>
  );
}

function CharacterScene({ mode, facing, emotion }: Omit<Props, "onClick">) {
  const presentation = useRef<Group>(null);
  const mixer = useRef<AnimationMixer | null>(null);
  const active = useRef<AnimationAction | null>(null);

  const modelSource = useFBX(FLOW_MODEL_URL);
  const idle = useFBX(FLOW_ANIMATION_URLS.idle);
  const walking = useFBX(FLOW_ANIMATION_URLS.walking);
  const thinking = useFBX(FLOW_ANIMATION_URLS.thinking);
  const listening = useFBX(FLOW_ANIMATION_URLS.listening);
  const talking = useFBX(FLOW_ANIMATION_URLS.talking);
  const waving = useFBX(FLOW_ANIMATION_URLS.waving);
  const pointing = useFBX(FLOW_ANIMATION_URLS.pointing);

  const [color, normal, roughness, metallic] = useTexture([
    "/models/flow/color.jpg",
    "/models/flow/normal.jpg",
    "/models/flow/roughness.jpeg",
    "/models/flow/metallic.jpeg",
  ]);
  color.colorSpace = SRGBColorSpace;

  const model = useMemo(() => {
    const clone = cloneSkeleton(modelSource) as Group;
    clone.rotation.y = FLOW_FRONT_YAW;

    clone.traverse((node) => {
      if (!isMesh(node)) return;
      node.frustumCulled = false;
      node.castShadow = false;
      node.receiveShadow = false;

      const sourceMaterials = Array.isArray(node.material)
        ? node.material
        : [node.material];
      node.material = sourceMaterials.map((material) =>
        createVisibleMaterial(color, normal, roughness, metallic, material),
      );
    });

    const bounds = new Box3().setFromObject(clone);
    const size = new Vector3();
    const center = new Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);

    const scale = 2.7 / Math.max(size.y, 0.001);
    clone.scale.setScalar(scale);
    clone.position.set(
      -center.x * scale,
      -bounds.min.y * scale - 1.34,
      -center.z * scale,
    );

    return clone;
  }, [modelSource, color, normal, roughness, metallic]);

  const clips = useMemo(
    () => ({
      idle: retarget(first(idle), model, "idle"),
      walking: retarget(first(walking), model, "walking"),
      thinking: retarget(first(thinking), model, "thinking"),
      listening: retarget(first(listening), model, "listening"),
      talking: retarget(first(talking), model, "talking"),
      waving: retarget(first(waving), model, "waving"),
      pointing: retarget(first(pointing), model, "pointing"),
      error: retarget(first(idle), model, "error"),
    }),
    [idle, walking, thinking, listening, talking, waving, pointing, model],
  );

  const actions = useRef<Partial<Record<FlowMode, AnimationAction>>>({});

  useEffect(() => {
    const nextMixer = new AnimationMixer(model);
    mixer.current = nextMixer;
    const nextActions: Partial<Record<FlowMode, AnimationAction>> = {};

    (Object.keys(clips) as FlowMode[]).forEach((key) => {
      const clip = clips[key] || clips.idle;
      if (!clip) return;

      const action = nextMixer.clipAction(clip, model);
      const oneShot = key === "waving" || key === "pointing";
      action.clampWhenFinished = oneShot;
      action.setLoop(oneShot ? LoopOnce : LoopRepeat, oneShot ? 1 : Infinity);
      action.enabled = true;
      action.setEffectiveWeight(1);
      action.setEffectiveTimeScale(1);
      nextActions[key] = action;
    });

    actions.current = nextActions;
    const initial = nextActions[mode] || nextActions.idle;
    initial?.reset().fadeIn(0.2).play();
    active.current = initial || null;

    return () => {
      nextMixer.stopAllAction();
      nextMixer.uncacheRoot(model);
    };
  }, [model, clips, mode]);

  useEffect(() => {
    const next = actions.current[mode] || actions.current.idle;
    if (!next || next === active.current) return;

    next.reset().setEffectiveWeight(1).fadeIn(0.25).play();
    active.current?.fadeOut(0.25);
    active.current = next;
  }, [mode]);

  useFrame((state, delta) => {
    mixer.current?.update(Math.min(delta, 0.05));
    if (!presentation.current) return;

    // The imported model is calibrated to face the camera. Left/right only
    // adds a small natural turn and never leaves Flow in profile.
    const yaw = facing === "left" ? 0.18 : facing === "right" ? -0.18 : 0;
    presentation.current.rotation.y +=
      (yaw - presentation.current.rotation.y) * Math.min(1, delta * 7);

    const breath =
      Math.sin(state.clock.elapsedTime * (1.15 + emotion.energy * 0.55)) *
      (0.003 + (1 - emotion.calm) * 0.003);
    presentation.current.scale.set(1 - breath * 0.12, 1 + breath, 1);
  });

  return (
    <group ref={presentation}>
      <primitive object={model} />
    </group>
  );
}

export default function FlowCharacter(props: Props) {
  return (
    <button
      type="button"
      className="flow-engine-character-button"
      onClick={props.onClick}
      aria-label="Hablar con Flow"
    >
      <Canvas
        orthographic
        camera={{ position: [0, 1.1, 8], zoom: 76, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={2.6} />
        <hemisphereLight
          color={new Color("#ffffff")}
          groundColor={new Color("#4b5563")}
          intensity={2.1}
        />
        <directionalLight position={[3, 5, 6]} intensity={3.4} />
        <directionalLight position={[-3, 2, 4]} intensity={1.8} />
        <Suspense fallback={<Loading />}>
          <CharacterScene
            mode={props.mode}
            facing={props.facing}
            emotion={props.emotion}
          />
        </Suspense>
      </Canvas>
    </button>
  );
}

useFBX.preload(FLOW_MODEL_URL);
Object.values(FLOW_ANIMATION_URLS).forEach((url) => useFBX.preload(url));
