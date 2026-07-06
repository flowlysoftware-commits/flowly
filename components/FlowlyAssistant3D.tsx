"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Html, useFBX, useGLTF } from "@react-three/drei";
import type {
  AnimationAction,
  AnimationClip,
  Bone,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SkinnedMesh,
} from "three";
import { AnimationMixer, Box3, Color, LoopRepeat, Vector3 } from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { FlowlyCompanionSkinTone } from "@/lib/flowlyCompanionSkins";

export type { FlowlyCompanionSkinTone } from "@/lib/flowlyCompanionSkins";

type AssistantMode =
  | "idle"
  | "walk"
  | "wave"
  | "talk"
  | "point"
  | "thinking"
  | "tour"
  | "sit"
  | "attention"
  | "reading"
  | "typing"
  | "concerned"
  | "celebrating";

type FlowlyAssistant3DProps = {
  modelUrl?: string;
  mode?: AssistantMode;
  facing?: "left" | "right" | "front";
  skinTone?: FlowlyCompanionSkinTone;
  onClick?: () => void;
};

type RuntimeSkin = {
  key: FlowlyCompanionSkinTone;
  label: string;
  accent: string;
  light: string;
  emissive: string;
  rotationY: number;
};

type RigBones = {
  head?: Bone;
  neck?: Bone;
  spine?: Bone;
  leftUpperArm?: Bone;
  leftLowerArm?: Bone;
  rightUpperArm?: Bone;
  rightLowerArm?: Bone;
  leftUpperLeg?: Bone;
  rightUpperLeg?: Bone;
};

const FLOWLY_SKINS: Record<FlowlyCompanionSkinTone, RuntimeSkin> = {
  flowly: {
    key: "flowly",
    label: "Flow",
    accent: "#7c3aed",
    light: "#22d3ee",
    emissive: "#151a44",
    rotationY: -Math.PI / 2,
  },
  cosmic: {
    key: "cosmic",
    label: "Cósmico",
    accent: "#a855f7",
    light: "#38bdf8",
    emissive: "#1e1148",
    rotationY: -Math.PI / 2,
  },
  business: {
    key: "business",
    label: "Business",
    accent: "#94a3b8",
    light: "#e5e7eb",
    emissive: "#111827",
    rotationY: -Math.PI / 2,
  },
  neon: {
    key: "neon",
    label: "Neón",
    accent: "#14b8a6",
    light: "#67e8f9",
    emissive: "#052e2b",
    rotationY: -Math.PI / 2,
  },
  expert: {
    key: "expert",
    label: "Experta",
    accent: "#d946ef",
    light: "#f0abfc",
    emissive: "#30105f",
    rotationY: -Math.PI / 2,
  },
  chef: {
    key: "chef",
    label: "Chef Flow",
    accent: "#f97316",
    light: "#fef3c7",
    emissive: "#431407",
    rotationY: -Math.PI / 2,
  },
};

const ANIMATION_URLS = {
  idle: "/avatars/Idle.fbx",
  walk: "/avatars/Walking.fbx",
  wave: "/avatars/Waving.fbx",
  talk: "/avatars/Talking.fbx",
  point: "/avatars/Pointing.fbx",
} as const;

function normalizeMode(mode?: AssistantMode) {
  if (mode === "tour") return "point";
  if (mode === "sit") return "idle";
  if (mode === "attention") return "wave";
  if (mode === "thinking") return "idle";
  if (mode === "typing") return "talk";
  if (mode === "reading") return "idle";
  if (mode === "concerned") return "idle";
  if (mode === "celebrating") return "wave";
  return mode || "idle";
}

function isMesh(object: Object3D): object is Mesh | SkinnedMesh {
  return "isMesh" in object && Boolean((object as Mesh).isMesh);
}

function isBone(object: Object3D): object is Bone {
  return "isBone" in object && Boolean((object as Bone).isBone);
}

function cloneMaterial(material: unknown, skin: RuntimeSkin) {
  const original = material as MeshStandardMaterial | MeshStandardMaterial[] | undefined;
  const tint = new Color(skin.accent);
  const glow = new Color(skin.emissive);

  const update = (mat: MeshStandardMaterial) => {
    const next = mat.clone();
    if (next.color) next.color.lerp(tint, skin.key === "flowly" ? 0.04 : 0.18);
    if ("emissive" in next && next.emissive) {
      next.emissive.copy(glow);
      next.emissiveIntensity = skin.key === "flowly" ? 0.06 : 0.16;
    }
    next.needsUpdate = true;
    return next;
  };

  if (Array.isArray(original)) return original.map((mat) => update(mat));
  if (original) return update(original);
  return original;
}

function findRigBones(root: Object3D): RigBones {
  const bones: RigBones = {};
  const matches = (name: string, terms: string[]) => {
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return terms.some((term) => clean.includes(term));
  };

  root.traverse((object) => {
    if (!isBone(object)) return;
    const name = object.name;
    if (!bones.head && matches(name, ["head"])) bones.head = object;
    if (!bones.neck && matches(name, ["neck"])) bones.neck = object;
    if (!bones.spine && matches(name, ["spine2", "chest", "spine"])) bones.spine = object;
    if (!bones.leftUpperArm && matches(name, ["leftarm", "leftuparm", "leftshoulder", "mixamorigleftarm"])) bones.leftUpperArm = object;
    if (!bones.leftLowerArm && matches(name, ["leftforearm", "leftlowerarm"])) bones.leftLowerArm = object;
    if (!bones.rightUpperArm && matches(name, ["rightarm", "rightuparm", "rightshoulder", "mixamorigrigharm", "mixamorigrightarm"])) bones.rightUpperArm = object;
    if (!bones.rightLowerArm && matches(name, ["rightforearm", "rightlowerarm"])) bones.rightLowerArm = object;
    if (!bones.leftUpperLeg && matches(name, ["leftupleg", "leftleg", "leftthigh"])) bones.leftUpperLeg = object;
    if (!bones.rightUpperLeg && matches(name, ["rightupleg", "rightleg", "rightthigh"])) bones.rightUpperLeg = object;
  });

  return bones;
}

function useCompanionFbxAnimations() {
  const idle = useFBX(ANIMATION_URLS.idle);
  const walk = useFBX(ANIMATION_URLS.walk);
  const wave = useFBX(ANIMATION_URLS.wave);
  const talk = useFBX(ANIMATION_URLS.talk);
  const point = useFBX(ANIMATION_URLS.point);

  return useMemo(() => {
    const firstClip = (group: Group, name: string) => {
      const clip = group.animations?.[0];
      if (!clip) return null;
      clip.name = name;
      return clip;
    };

    return {
      idle: firstClip(idle, "idle"),
      walk: firstClip(walk, "walk"),
      wave: firstClip(wave, "wave"),
      talk: firstClip(talk, "talk"),
      point: firstClip(point, "point"),
    } satisfies Partial<Record<ReturnType<typeof normalizeMode>, AnimationClip | null>>;
  }, [idle, point, talk, walk, wave]);
}

function FlowlyCharacterEngine({
  modelUrl,
  mode,
  skinTone,
  facing,
}: Required<Pick<FlowlyAssistant3DProps, "modelUrl" | "mode" | "skinTone" | "facing">>) {
  const rootRef = useRef<Group>(null);
  const modelRef = useRef<Group | null>(null);
  const bonesRef = useRef<RigBones>({});
  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionRef = useRef<AnimationAction | null>(null);
  const { scene, animations: glbAnimations } = useGLTF(modelUrl);
  const fbxAnimations = useCompanionFbxAnimations();
  const skin = FLOWLY_SKINS[skinTone] || FLOWLY_SKINS.flowly;
  const targetMode = normalizeMode(mode);

  const normalizedScene = useMemo(() => {
    const cloned = cloneSkeleton(scene) as Group;
    const box = new Box3().setFromObject(cloned);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);

    const height = size.y || 1;
    const scale = 3.15 / height;

    cloned.position.set(-center.x * scale, -box.min.y * scale - 1.48, -center.z * scale);
    cloned.scale.setScalar(scale);
    cloned.rotation.y = skin.rotationY;

    cloned.traverse((object) => {
      if (isMesh(object)) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.frustumCulled = false;
        object.material = cloneMaterial(object.material, skin) as typeof object.material;
      }
    });

    modelRef.current = cloned;
    bonesRef.current = findRigBones(cloned);
    return cloned;
  }, [scene, skin]);

  const clipMap = useMemo(() => {
    const map: Partial<Record<ReturnType<typeof normalizeMode>, AnimationClip>> = {};
    const modelClip = glbAnimations?.[0];
    if (modelClip) map.idle = modelClip;
    Object.entries(fbxAnimations).forEach(([key, clip]) => {
      if (clip) map[key as ReturnType<typeof normalizeMode>] = clip;
    });
    return map;
  }, [fbxAnimations, glbAnimations]);

  useEffect(() => {
    const root = normalizedScene;
    mixerRef.current?.stopAllAction();
    mixerRef.current = new AnimationMixer(root);
    actionRef.current = null;
    return () => {
      mixerRef.current?.stopAllAction();
      mixerRef.current = null;
      actionRef.current = null;
    };
  }, [normalizedScene]);

  useEffect(() => {
    const mixer = mixerRef.current;
    if (!mixer) return;
    const clip = clipMap[targetMode] || clipMap.idle;
    if (!clip) return;

    const next = mixer.clipAction(clip, normalizedScene);
    next.reset();
    next.setLoop(LoopRepeat, Number.POSITIVE_INFINITY);
    next.enabled = true;
    next.clampWhenFinished = false;
    next.timeScale = targetMode === "walk" ? 0.86 : targetMode === "talk" ? 1.05 : 0.72;
    next.setEffectiveWeight(1);

    const previous = actionRef.current;
    if (previous && previous !== next) {
      previous.fadeOut(0.22);
      next.fadeIn(0.22).play();
    } else {
      next.play();
    }
    actionRef.current = next;
  }, [clipMap, normalizedScene, targetMode]);

  useFrame((state, delta) => {
    const root = rootRef.current;
    const model = modelRef.current;
    if (!root || !model) return;

    mixerRef.current?.update(delta);

    const t = state.clock.elapsedTime;
    const baseFacing = facing === "left" ? -0.22 : facing === "right" ? 0.22 : 0;
    const isWalking = targetMode === "walk";
    const isTalking = targetMode === "talk";
    const isPointing = targetMode === "point";
    const isWaving = targetMode === "wave";
    const breathe = Math.sin(t * 2.0) * 0.018;
    const weightShift = Math.sin(t * 0.86) * 0.026;
    const talkPulse = isTalking ? Math.sin(t * 11) * 0.018 : 0;

    root.position.y = breathe + talkPulse;
    root.rotation.y = baseFacing + Math.sin(t * 0.55) * 0.035;
    root.rotation.z = weightShift * 0.35;

    const bones = bonesRef.current;
    const headNod = Math.sin(t * (isTalking ? 6.5 : 1.4)) * (isTalking ? 0.075 : 0.035);
    const headLook = Math.sin(t * 0.9) * 0.075;
    if (bones.head) {
      bones.head.rotation.x += headNod * delta * 4.5;
      bones.head.rotation.y += headLook * delta * 3.2;
    }
    if (bones.neck) bones.neck.rotation.y += headLook * delta * 1.6;
    if (bones.spine) bones.spine.rotation.z += weightShift * delta * 2.2;

    const armSwing = Math.sin(t * (isWalking ? 7.5 : 1.8)) * (isWalking ? 0.26 : 0.045);
    if (bones.leftUpperArm) bones.leftUpperArm.rotation.x += armSwing * delta * 6;
    if (bones.rightUpperArm) bones.rightUpperArm.rotation.x -= armSwing * delta * 6;
    if (bones.leftUpperLeg) bones.leftUpperLeg.rotation.x -= armSwing * delta * 4;
    if (bones.rightUpperLeg) bones.rightUpperLeg.rotation.x += armSwing * delta * 4;

    if (isWaving && bones.rightUpperArm) {
      bones.rightUpperArm.rotation.z += Math.sin(t * 7.6) * delta * 8;
      bones.rightUpperArm.rotation.x -= 0.85 * delta * 4;
    }
    if (isPointing && bones.rightUpperArm) {
      bones.rightUpperArm.rotation.x -= 0.62 * delta * 4;
      bones.rightUpperArm.rotation.z -= 0.3 * delta * 4;
    }
  });

  return (
    <group ref={rootRef}>
      <primitive object={normalizedScene} />
    </group>
  );
}

function FlowlyV3Loading() {
  return (
    <Html center className="flowly-v3-loading-label">
      <span>Cargando Flow…</span>
    </Html>
  );
}

/**
 * Companion Engine V3.
 *
 * Motor real GLB + FBX: normaliza el modelo por BoundingBox, lo orienta hacia
 * cámara, reproduce animaciones con AnimationMixer y añade micro-presencia aunque
 * el clip no tenga suficientes huesos animados.
 */
export default function FlowlyAssistant3D({
  modelUrl = "/avatars/flowly.glb",
  mode = "idle",
  facing = "front",
  skinTone = "flowly",
  onClick,
}: FlowlyAssistant3DProps) {
  const safeMode = normalizeMode(mode);
  const skin = FLOWLY_SKINS[skinTone] || FLOWLY_SKINS.flowly;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flowly-3d-stage flowly-v3-stage flowly-v3-drag-handle flowly-v3-skin-${skin.key}`}
      data-mode={safeMode}
      data-facing={facing}
      data-skin={skin.key}
      aria-label={`Abrir Companion ${skin.label}`}
    >
      <Canvas
        className="flowly-v3-canvas"
        orthographic
        camera={{ position: [0, 1.35, 8], zoom: 92, near: 0.1, far: 100 }}
        dpr={[1, 1.75]}
        shadows
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.45} />
        <directionalLight position={[2.4, 4.2, 5.2]} intensity={2.25} castShadow />
        <pointLight position={[-2.2, 2.2, 3]} color={skin.light} intensity={1.18} />
        <Suspense fallback={<FlowlyV3Loading />}>
          <FlowlyCharacterEngine modelUrl={modelUrl} mode={safeMode} skinTone={skin.key} facing={facing} />
          <ContactShadows position={[0, -1.46, 0]} opacity={0.26} scale={3.8} blur={2.8} far={3.4} />
        </Suspense>
      </Canvas>
    </button>
  );
}

useGLTF.preload("/avatars/flowly.glb");
Object.values(ANIMATION_URLS).forEach((url) => useFBX.preload(url));
