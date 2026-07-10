"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useFBX, useTexture } from "@react-three/drei";
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Bone,
  Box3,
  Color,
  Euler,
  Group,
  LoopOnce,
  LoopRepeat,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  SRGBColorSpace,
  Texture,
  Vector2,
  Vector3,
} from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

export type FlowCharacterMode = "idle" | "walk" | "wave" | "talk" | "point" | "thinking" | "listening";
export type FlowCharacterFacing = "front" | "left" | "right";
export type FlowEmotionSnapshot = {
  mood?: string;
  calm?: number;
  joy?: number;
  curiosity?: number;
  empathy?: number;
  stress?: number;
  confidence?: number;
  attention?: number;
  energy?: number;
};

type Props = {
  mode: FlowCharacterMode;
  facing: FlowCharacterFacing;
  pointer: Vector2;
  emotion: FlowEmotionSnapshot;
  onClick?: () => void;
};

const MODEL_URL = "/models/flow/flow.fbx";
const CLIPS: Record<Exclude<FlowCharacterMode, "thinking" | "listening">, string> = {
  idle: "/avatars/Idle.fbx",
  walk: "/avatars/Walking.fbx",
  wave: "/avatars/Waving.fbx",
  talk: "/avatars/Talking.fbx",
  point: "/avatars/Pointing.fbx",
};

// Único punto de calibración del frente del FBX.
const MODEL_FRONT_YAW = Math.PI;

function normalizeBoneName(value: string) {
  return value
    .replace(/^.*[|:]/, "")
    .replace(/mixamorig/gi, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

function aliases(value: string) {
  const normalized = normalizeBoneName(value);
  const values = new Set([normalized]);
  if (normalized.includes("pelvis")) values.add(normalized.replace("pelvis", "hips"));
  if (normalized.includes("hips")) values.add(normalized.replace("hips", "pelvis"));
  if (normalized.includes("upperchest")) values.add(normalized.replace("upperchest", "chest"));
  if (normalized.includes("chest")) values.add(normalized.replace("chest", "upperchest"));
  return [...values];
}

function buildTargetMap(root: Object3D) {
  const map = new Map<string, Object3D>();
  root.traverse((object) => {
    if (!object.name) return;
    for (const alias of aliases(object.name)) {
      if (!map.has(alias)) map.set(alias, object);
    }
  });
  return map;
}

function findTargetNode(sourceName: string, targetMap: Map<string, Object3D>) {
  for (const alias of aliases(sourceName)) {
    const exact = targetMap.get(alias);
    if (exact) return exact;
  }

  const normalized = normalizeBoneName(sourceName);
  for (const [key, value] of targetMap.entries()) {
    if (key.endsWith(normalized) || normalized.endsWith(key)) return value;
  }
  return null;
}

function retargetClip(source: AnimationClip | undefined, target: Object3D, name: string) {
  if (!source) return null;
  const targetMap = buildTargetMap(target);
  const tracks = source.tracks.flatMap((track) => {
    const dot = track.name.lastIndexOf(".");
    if (dot < 1) return [];
    const sourceNode = track.name.slice(0, dot);
    const property = track.name.slice(dot + 1);
    const node = findTargetNode(sourceNode, targetMap);
    if (!node) return [];

    const lowerNode = normalizeBoneName(node.name);
    if (property === "scale") return [];
    // El desplazamiento por pantalla lo controla React; evitamos root motion vertical/horizontal.
    if (property === "position" && /(root|hips|pelvis|armature)/.test(lowerNode)) return [];

    const cloned = track.clone();
    cloned.name = `${node.name}.${property}`;
    return [cloned];
  });

  if (!tracks.length) return null;
  const clip = new AnimationClip(name, source.duration, tracks);
  clip.optimize();
  return clip;
}

function firstAnimation(group: Group) {
  return group.animations?.find((clip) => clip.tracks.length > 0);
}

function isMesh(value: Object3D): value is Mesh {
  return "isMesh" in value && Boolean((value as Mesh).isMesh);
}

function setMaterialTextures(material: Material, color: Texture, normal: Texture, roughness: Texture, metallic: Texture) {
  if (!(material instanceof MeshStandardMaterial)) return;
  material.map = color;
  material.normalMap = normal;
  material.roughnessMap = roughness;
  material.metalnessMap = metallic;
  material.roughness = 0.9;
  material.metalness = 0.08;
  material.needsUpdate = true;
}

function findBone(root: Object3D, candidates: RegExp[]) {
  let found: Bone | null = null;
  root.traverse((object) => {
    if (found || !(object instanceof Bone)) return;
    const normalized = normalizeBoneName(object.name);
    if (candidates.some((candidate) => candidate.test(normalized))) found = object;
  });
  return found;
}

function actionSettings(action: AnimationAction, mode: FlowCharacterMode) {
  const oneShot = mode === "wave" || mode === "point";
  action.enabled = true;
  action.clampWhenFinished = oneShot;
  action.setLoop(oneShot ? LoopOnce : LoopRepeat, oneShot ? 1 : Infinity);
  action.setEffectiveWeight(1);
  action.setEffectiveTimeScale(mode === "walk" ? 1.03 : mode === "talk" ? 0.92 : mode === "thinking" ? 0.7 : 1);
}

function Loading() {
  return <Html center><span className="flow-companion-loading">Cargando Flow…</span></Html>;
}

function CharacterScene({ mode, facing, pointer, emotion }: Omit<Props, "onClick">) {
  const presentationRef = useRef<Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const activeActionRef = useRef<AnimationAction | null>(null);
  const actionsRef = useRef<Partial<Record<FlowCharacterMode, AnimationAction>>>({});
  const modeRef = useRef(mode);
  const pointerRef = useRef(pointer);
  const emotionRef = useRef(emotion);
  const headRef = useRef<Bone | null>(null);
  const neckRef = useRef<Bone | null>(null);
  const chestRef = useRef<Bone | null>(null);
  const additiveQuaternion = useMemo(() => new Quaternion(), []);
  const additiveEuler = useMemo(() => new Euler(), []);

  const sourceModel = useFBX(MODEL_URL);
  const idleFbx = useFBX(CLIPS.idle);
  const walkFbx = useFBX(CLIPS.walk);
  const waveFbx = useFBX(CLIPS.wave);
  const talkFbx = useFBX(CLIPS.talk);
  const pointFbx = useFBX(CLIPS.point);
  const [color, normal, roughness, metallic] = useTexture([
    "/models/flow/color.jpg",
    "/models/flow/normal.jpg",
    "/models/flow/roughness.jpeg",
    "/models/flow/metallic.jpeg",
  ]);

  color.colorSpace = SRGBColorSpace;

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { pointerRef.current = pointer; }, [pointer]);
  useEffect(() => { emotionRef.current = emotion; }, [emotion]);

  const model = useMemo(() => {
    const cloned = cloneSkeleton(sourceModel) as Group;
    cloned.rotation.y = MODEL_FRONT_YAW;
    cloned.traverse((object) => {
      if (!isMesh(object)) return;
      object.frustumCulled = false;
      object.castShadow = true;
      object.receiveShadow = true;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => setMaterialTextures(material, color, normal, roughness, metallic));
    });

    const bounds = new Box3().setFromObject(cloned);
    const size = new Vector3();
    const center = new Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);
    const scale = 2.82 / Math.max(size.y, 0.001);
    cloned.scale.setScalar(scale);
    cloned.position.set(-center.x * scale, -bounds.min.y * scale - 1.38, -center.z * scale);
    return cloned;
  }, [sourceModel, color, normal, roughness, metallic]);

  const animationClips = useMemo(() => {
    const idle = retargetClip(firstAnimation(idleFbx), model, "flow_idle");
    const walk = retargetClip(firstAnimation(walkFbx), model, "flow_walk") || idle;
    const wave = retargetClip(firstAnimation(waveFbx), model, "flow_wave") || idle;
    const talk = retargetClip(firstAnimation(talkFbx), model, "flow_talk") || idle;
    const point = retargetClip(firstAnimation(pointFbx), model, "flow_point") || idle;
    return { idle, walk, wave, talk, point, thinking: idle, listening: idle };
  }, [idleFbx, walkFbx, waveFbx, talkFbx, pointFbx, model]);

  useEffect(() => {
    headRef.current = findBone(model, [/^head$/, /head$/]);
    neckRef.current = findBone(model, [/^neck$/, /neck$/]);
    chestRef.current = findBone(model, [/upperchest/, /^chest$/, /spine2/, /spine3/]);

    const mixer = new AnimationMixer(model);
    mixerRef.current = mixer;
    const actions: Partial<Record<FlowCharacterMode, AnimationAction>> = {};
    (Object.keys(animationClips) as FlowCharacterMode[]).forEach((key) => {
      const clip = animationClips[key];
      if (!clip) return;
      const action = mixer.clipAction(clip, model);
      actionSettings(action, key);
      actions[key] = action;
    });
    actionsRef.current = actions;
    const initial = actions[mode] || actions.idle;
    initial?.reset().fadeIn(0.25).play();
    activeActionRef.current = initial || null;

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      mixerRef.current = null;
      actionsRef.current = {};
      activeActionRef.current = null;
    };
  }, [model, animationClips]);

  useEffect(() => {
    const next = actionsRef.current[mode] || actionsRef.current.idle;
    if (!next || next === activeActionRef.current) return;
    const previous = activeActionRef.current;
    next.reset().fadeIn(0.28).play();
    previous?.fadeOut(0.28);
    activeActionRef.current = next;
  }, [mode]);

  useFrame((state, delta) => {
    mixerRef.current?.update(Math.min(delta, 0.05));

    const presentation = presentationRef.current;
    if (!presentation) return;
    const t = state.clock.elapsedTime;
    const currentEmotion = emotionRef.current;
    const energy = currentEmotion.energy ?? 0.55;
    const calm = currentEmotion.calm ?? 0.7;
    const stress = currentEmotion.stress ?? 0.05;
    const attention = currentEmotion.attention ?? 0.75;

    const targetYaw = facing === "left" ? 0.24 : facing === "right" ? -0.24 : 0;
    presentation.rotation.y += (targetYaw - presentation.rotation.y) * Math.min(1, delta * 5);

    // Respiración corporal aditiva, sutil y continua.
    const breath = Math.sin(t * (1.35 + energy * 0.65)) * (0.006 + (1 - calm) * 0.005);
    presentation.scale.y = 1 + breath;
    presentation.scale.x = 1 - breath * 0.28;
    presentation.rotation.z = modeRef.current === "walk" ? 0 : Math.sin(t * 0.52) * (0.002 + stress * 0.003);

    // Mirada limitada al ratón, únicamente en cabeza/cuello y sin romper la animación.
    const p = pointerRef.current;
    const yaw = p.x * 0.12 * attention;
    const pitch = -p.y * 0.075 * attention;
    additiveEuler.set(pitch, yaw, 0, "YXZ");
    additiveQuaternion.setFromEuler(additiveEuler);
    if (neckRef.current) neckRef.current.quaternion.multiply(additiveQuaternion);
    if (headRef.current) {
      additiveEuler.set(pitch * 0.65, yaw * 0.75, 0, "YXZ");
      additiveQuaternion.setFromEuler(additiveEuler);
      headRef.current.quaternion.multiply(additiveQuaternion);
    }

    // Pecho abierto/cerrado según emoción, muy leve.
    if (chestRef.current && modeRef.current !== "walk") {
      additiveEuler.set((energy - 0.5) * -0.018, 0, 0, "XYZ");
      additiveQuaternion.setFromEuler(additiveEuler);
      chestRef.current.quaternion.multiply(additiveQuaternion);
    }
  });

  return (
    <group ref={presentationRef}>
      <primitive object={model} />
    </group>
  );
}

export default function FlowCharacter3D({ mode, facing, pointer, emotion, onClick }: Props) {
  return (
    <button type="button" className="flow-companion-character-button" onClick={onClick} aria-label="Hablar con Flow">
      <Canvas
        orthographic
        camera={{ position: [0, 1.15, 8], zoom: 75, near: 0.1, far: 100 }}
        dpr={[1, 1.6]}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: false }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={1.45} />
        <hemisphereLight color={new Color("#e0f2fe")} groundColor={new Color("#111827")} intensity={1.1} />
        <directionalLight position={[3, 5, 6]} intensity={2.1} />
        <pointLight position={[-2, 2, 4]} color="#67e8f9" intensity={0.85} />
        <Suspense fallback={<Loading />}>
          <CharacterScene mode={mode} facing={facing} pointer={pointer} emotion={emotion} />
        </Suspense>
      </Canvas>
    </button>
  );
}

useFBX.preload(MODEL_URL);
Object.values(CLIPS).forEach((url) => useFBX.preload(url));
