"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Html, useAnimations, useFBX, useGLTF } from "@react-three/drei";
import type { AnimationClip, Bone, Group, Mesh, MeshStandardMaterial, Object3D, SkinnedMesh } from "three";
import { Box3, Color, Euler, LoopRepeat, Vector3 } from "three";
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
  | "celebrating"
  | "jump"
  | "spin";

type FlowlyAssistant3DProps = {
  modelUrl?: string;
  mode?: AssistantMode;
  facing?: "left" | "right" | "front";
  skinTone?: FlowlyCompanionSkinTone;
  onClick?: () => void;
  compact?: boolean;
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
  root?: Bone;
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

type CompanionMode = "idle" | "walk" | "wave" | "talk" | "point" | "thinking" | "jump" | "spin";

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

const FLOWLY_MOTION_CLIPS: Record<CompanionMode, string> = {
  idle: "/avatars/Idle.fbx",
  walk: "/avatars/Walking.fbx",
  wave: "/avatars/Waving.fbx",
  talk: "/avatars/Talking.fbx",
  point: "/avatars/Pointing.fbx",
  thinking: "/avatars/Sitting Talking.fbx",
  jump: "/avatars/Waving.fbx",
  spin: "/avatars/Idle.fbx",
};

function getPrimaryClip(fbx: { animations?: AnimationClip[] }, fallbackName: string) {
  const clip = fbx.animations?.[0]?.clone();
  if (clip) {
    clip.name = fallbackName;
    return clip;
  }
  return null;
}

function normalizeMode(mode?: AssistantMode): CompanionMode {
  if (mode === "walk") return "walk";
  if (mode === "jump") return "jump";
  if (mode === "spin") return "spin";
  if (mode === "wave" || mode === "attention" || mode === "celebrating") return "wave";
  if (mode === "talk" || mode === "typing") return "talk";
  if (mode === "point" || mode === "tour") return "point";
  if (mode === "thinking" || mode === "reading" || mode === "concerned") return "thinking";
  return "idle";
}

function isMesh(object: Object3D): object is Mesh | SkinnedMesh {
  return "isMesh" in object && Boolean((object as Mesh).isMesh);
}

function isBone(object: Object3D): object is Bone {
  return "isBone" in object && Boolean((object as Bone).isBone);
}

function cleanBoneName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function cloneMaterial(material: unknown, skin: RuntimeSkin) {
  const original = material as MeshStandardMaterial | MeshStandardMaterial[] | undefined;
  const tint = new Color(skin.accent);
  const glow = new Color(skin.emissive);

  const update = (mat: MeshStandardMaterial) => {
    const next = mat.clone();
    if (next.color) next.color.lerp(tint, skin.key === "flowly" ? 0.03 : 0.16);
    if (next.emissive) {
      next.emissive.copy(glow);
      next.emissiveIntensity = skin.key === "flowly" ? 0.04 : 0.13;
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
  const byName = new Map<string, Bone>();

  root.traverse((object) => {
    if (!isBone(object)) return;
    byName.set(cleanBoneName(object.name), object);
  });

  const pick = (...names: string[]) => {
    for (const name of names) {
      const bone = byName.get(cleanBoneName(name));
      if (bone) return bone;
    }
    return undefined;
  };

  bones.root = pick("Armature", "Hips", "Root");
  bones.head = pick("Head");
  bones.neck = pick("Neck");
  bones.spine = pick("Spine02", "Spine01", "Spine", "Chest");
  bones.leftUpperArm = pick("L_Upperarm", "LeftUpperArm", "mixamorigLeftArm");
  bones.leftLowerArm = pick("L_Forearm", "LeftForeArm", "mixamorigLeftForeArm");
  bones.rightUpperArm = pick("R_Upperarm", "RightUpperArm", "mixamorigRightArm");
  bones.rightLowerArm = pick("R_Forearm", "RightForeArm", "mixamorigRightForeArm");
  bones.leftUpperLeg = pick("L_Thigh", "LeftUpLeg", "mixamorigLeftUpLeg");
  bones.rightUpperLeg = pick("R_Thigh", "RightUpLeg", "mixamorigRightUpLeg");

  return bones;
}

function rememberBaseRotations(bones: RigBones) {
  const map = new Map<string, Euler>();
  Object.values(bones).forEach((bone) => {
    if (bone) map.set(bone.uuid, bone.rotation.clone());
  });
  return map;
}

function applyRotation(bone: Bone | undefined, base: Map<string, Euler>, x = 0, y = 0, z = 0) {
  if (!bone) return;
  const initial = base.get(bone.uuid);
  if (!initial) return;
  bone.rotation.set(initial.x + x, initial.y + y, initial.z + z);
}

function FlowlyCharacterEngine({
  modelUrl,
  mode,
  skinTone,
  facing,
  compact,
}: Required<Pick<FlowlyAssistant3DProps, "modelUrl" | "mode" | "skinTone" | "facing" | "compact">>) {
  const rootRef = useRef<Group>(null);
  const bonesRef = useRef<RigBones>({});
  const baseRotationsRef = useRef<Map<string, Euler>>(new Map());
  const { scene, animations: embeddedAnimations = [] } = useGLTF(modelUrl) as { scene: Group; animations?: AnimationClip[] };
  const idleFbx = useFBX(FLOWLY_MOTION_CLIPS.idle);
  const walkFbx = useFBX(FLOWLY_MOTION_CLIPS.walk);
  const waveFbx = useFBX(FLOWLY_MOTION_CLIPS.wave);
  const talkFbx = useFBX(FLOWLY_MOTION_CLIPS.talk);
  const pointFbx = useFBX(FLOWLY_MOTION_CLIPS.point);
  const thinkingFbx = useFBX(FLOWLY_MOTION_CLIPS.thinking);
  const skin = FLOWLY_SKINS[skinTone] || FLOWLY_SKINS.flowly;
  const companionMode = normalizeMode(mode);
  const clips = useMemo(() => {
    if (embeddedAnimations.length) {
      const fallbackByMode: Record<CompanionMode, number> = {
        idle: 0,
        walk: Math.min(1, embeddedAnimations.length - 1),
        wave: Math.min(2, embeddedAnimations.length - 1),
        talk: Math.min(3, embeddedAnimations.length - 1),
        point: Math.min(4, embeddedAnimations.length - 1),
        thinking: Math.min(5, embeddedAnimations.length - 1),
        jump: Math.min(2, embeddedAnimations.length - 1),
        spin: 0,
      };

      const used = new Set<number>();
      return (Object.keys(fallbackByMode) as CompanionMode[])
        .map((modeName) => {
          const index = fallbackByMode[modeName];
          const sourceClip = embeddedAnimations[index] || embeddedAnimations[0];
          if (!sourceClip) return null;
          const clip = sourceClip.clone();
          clip.name = `flowly-${modeName}`;
          used.add(index);
          return clip;
        })
        .filter((clip): clip is AnimationClip => Boolean(clip));
    }

    const entries: Array<[CompanionMode, { animations?: AnimationClip[] }]> = [
      ["idle", idleFbx],
      ["walk", walkFbx],
      ["wave", waveFbx],
      ["talk", talkFbx],
      ["point", pointFbx],
      ["thinking", thinkingFbx],
      ["jump", waveFbx],
      ["spin", idleFbx],
    ];
    return entries
      .map(([name, fbx]) => getPrimaryClip(fbx, `flowly-${name}`))
      .filter((clip): clip is AnimationClip => Boolean(clip));
  }, [embeddedAnimations, idleFbx, walkFbx, waveFbx, talkFbx, pointFbx, thinkingFbx]);
  const { actions, names } = useAnimations(clips, rootRef);

  useEffect(() => {
    if (!names.length) return;
    const requestedName = `flowly-${companionMode}`;
    const nextName = names.includes(requestedName) ? requestedName : names[0];

    Object.entries(actions).forEach(([name, action]) => {
      if (!action) return;
      if (name === nextName) {
        action.enabled = true;
        action.loop = LoopRepeat;
        action.clampWhenFinished = false;
        action.reset().fadeIn(0.22).play();
        action.timeScale = companionMode === "walk" ? 0.92 : companionMode === "talk" ? 0.84 : 0.72;
      } else {
        action.fadeOut(0.18);
      }
    });
  }, [actions, companionMode, names]);

  const normalizedScene = useMemo(() => {
    const cloned = cloneSkeleton(scene) as Group;
    const box = new Box3().setFromObject(cloned);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);

    const height = size.y || 1;
    const targetHeight = compact ? 1.85 : 3.05;
    const scale = targetHeight / height;
    cloned.position.set(-center.x * scale, -box.min.y * scale - (compact ? 1.02 : 1.62), -center.z * scale);
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

    const bones = findRigBones(cloned);
    bonesRef.current = bones;
    baseRotationsRef.current = rememberBaseRotations(bones);
    return cloned;
  }, [compact, scene, skin]);

  useFrame((state) => {
    const root = rootRef.current;
    if (!root) return;

    const t = state.clock.elapsedTime;
    const isWalking = companionMode === "walk";
    const isJumping = companionMode === "jump";
    const isSpinning = companionMode === "spin";
    const isTalking = companionMode === "talk";
    const isThinking = companionMode === "thinking";
    const baseFacing = facing === "left" ? -0.28 : facing === "right" ? 0.28 : 0;

    const breathe = Math.sin(t * 2.1) * 0.022;
    const weightShift = Math.sin(t * 0.95) * 0.035;
    const talkPulse = isTalking ? Math.sin(t * 10.5) * 0.014 : 0;
    const walkPulse = isWalking ? Math.abs(Math.sin(t * 5.6)) * 0.045 : 0;
    const jumpPulse = isJumping ? Math.max(0, Math.sin(t * 5.2)) * 0.32 : 0;

    root.position.y = breathe + talkPulse + walkPulse + jumpPulse;
    root.rotation.y = baseFacing + Math.sin(t * 0.7) * 0.045 + (isSpinning ? t * 1.35 : 0);
    root.rotation.z = weightShift * 0.25;

    const bones = bonesRef.current;
    const base = baseRotationsRef.current;
    const walk = Math.sin(t * 5.6);
    const talk = Math.sin(t * 8.8);
    const look = Math.sin(t * 0.86);

    // Companion V3.1: el personaje no se anima como una burbuja ni forzando huesos
    // agresivamente. Los clips FBX mandan; esta capa solo añade microvida segura
    // en cabeza, cuello y torso para evitar cortes de brazos/piernas.
    applyRotation(
      bones.head,
      base,
      (isTalking ? talk * 0.032 : Math.sin(t * 1.15) * 0.014) + (isThinking ? 0.035 : 0),
      look * 0.045,
      0,
    );
    applyRotation(bones.neck, base, 0, look * 0.022, 0);
    applyRotation(bones.spine, base, isThinking ? 0.022 : 0, 0, weightShift * 0.075);
  });

  return (
    <group ref={rootRef}>
      <primitive object={normalizedScene} />
      <FlowlySkinAccessories skin={skin} />
    </group>
  );
}


function FlowlySkinAccessories({ skin }: { skin: RuntimeSkin }) {
  if (skin.key === "chef") {
    return (
      <group>
        <mesh position={[0, 1.72, 0.02]} scale={[0.44, 0.08, 0.3]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#fff7ed" roughness={0.72} />
        </mesh>
        <mesh position={[0, 1.55, 0.02]} scale={[0.32, 0.17, 0.24]}>
          <sphereGeometry args={[1, 18, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.78} />
        </mesh>
        <mesh position={[0, 0.35, 0.06]} scale={[0.38, 0.7, 0.035]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.82} />
        </mesh>
        <mesh position={[0.58, 0.25, 0.08]} rotation={[0.1, 0, -0.42]} scale={[0.035, 0.62, 0.035]}>
          <cylinderGeometry args={[1, 1, 1, 12]} />
          <meshStandardMaterial color="#a16207" roughness={0.65} />
        </mesh>
        <mesh position={[0.76, 0.7, 0.09]} rotation={[0.1, 0, -0.42]} scale={[0.1, 0.17, 0.025]}>
          <sphereGeometry args={[1, 16, 8]} />
          <meshStandardMaterial color="#b45309" roughness={0.72} />
        </mesh>
      </group>
    );
  }

  if (skin.key === "business") {
    return (
      <group>
        <mesh position={[0, 0.62, 0.08]} scale={[0.08, 0.48, 0.035]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.48, 0.105]} rotation={[0, 0, 0.78]} scale={[0.1, 0.1, 0.035]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
      </group>
    );
  }

  if (skin.key === "expert") {
    return (
      <group position={[0, 1.33, 0.11]}>
        <mesh position={[-0.105, 0, 0]} scale={[0.095, 0.045, 0.01]}>
          <torusGeometry args={[1, 0.08, 8, 18]} />
          <meshStandardMaterial color="#f0abfc" emissive="#581c87" emissiveIntensity={0.22} />
        </mesh>
        <mesh position={[0.105, 0, 0]} scale={[0.095, 0.045, 0.01]}>
          <torusGeometry args={[1, 0.08, 8, 18]} />
          <meshStandardMaterial color="#f0abfc" emissive="#581c87" emissiveIntensity={0.22} />
        </mesh>
        <mesh scale={[0.11, 0.01, 0.01]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f0abfc" />
        </mesh>
      </group>
    );
  }

  if (skin.key === "cosmic") {
    return (
      <group>
        <mesh position={[0, 1.84, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.36, 0.36, 0.02]}>
          <torusGeometry args={[1, 0.035, 8, 42]} />
          <meshStandardMaterial color="#c084fc" emissive="#7c3aed" emissiveIntensity={0.7} />
        </mesh>
      </group>
    );
  }

  if (skin.key === "neon") {
    return (
      <pointLight position={[0, 0.7, 0.5]} color="#67e8f9" intensity={0.95} distance={3.4} />
    );
  }

  return null;
}

function FlowlyV3Loading() {
  return (
    <Html center className="flowly-v3-loading-label">
      <span>Cargando Flow…</span>
    </Html>
  );
}

export default function FlowlyAssistant3D({
  modelUrl = "/avatars/flowly.glb",
  mode = "idle",
  facing = "front",
  skinTone = "flowly",
  onClick,
  compact = false,
}: FlowlyAssistant3DProps) {
  const safeMode = normalizeMode(mode);
  const skin = FLOWLY_SKINS[skinTone] || FLOWLY_SKINS.flowly;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flowly-avatar-renderer-v6 flowly-v6-skin-${skin.key}`}
      data-mode={safeMode}
      data-facing={facing}
      data-skin={skin.key}
      data-compact={compact ? "true" : "false"}
      aria-label={`Abrir Companion ${skin.label}`}
    >
      <Canvas
        className="flowly-v3-canvas"
        orthographic
        camera={{ position: [0, 1.22, 8], zoom: compact ? 94 : 78, near: 0.1, far: 100 }}
        dpr={[1, 1.75]}
        shadows
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.55} />
        <directionalLight position={[2.4, 4.2, 5.2]} intensity={2.35} castShadow />
        <pointLight position={[-2.2, 2.2, 3]} color={skin.light} intensity={1.25} />
        <Suspense fallback={<FlowlyV3Loading />}>
          <FlowlyCharacterEngine modelUrl={modelUrl} mode={safeMode} skinTone={skin.key} facing={facing} compact={compact} />
          <ContactShadows position={[0, -1.84, 0]} opacity={0.28} scale={4.6} blur={2.8} far={3.4} />
        </Suspense>
      </Canvas>
    </button>
  );
}

useGLTF.preload("/avatars/flowly.glb");
useFBX.preload("/avatars/Idle.fbx");
useFBX.preload("/avatars/Walking.fbx");
useFBX.preload("/avatars/Waving.fbx");
useFBX.preload("/avatars/Talking.fbx");
useFBX.preload("/avatars/Pointing.fbx");
