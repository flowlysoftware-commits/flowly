"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Html, useAnimations, useFBX, useGLTF } from "@react-three/drei";
import type { Bone, Group, Mesh, MeshStandardMaterial, Object3D, SkinnedMesh } from "three";
import { Box3, Color, Euler, Vector3 } from "three";
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
}: Required<Pick<FlowlyAssistant3DProps, "modelUrl" | "mode" | "skinTone" | "facing">>) {
  const rootRef = useRef<Group>(null);
  const bonesRef = useRef<RigBones>({});
  const baseRotationsRef = useRef<Map<string, Euler>>(new Map());
  const { scene, animations: glbAnimations } = useGLTF(modelUrl);
  const idleFbx = useFBX("/avatars/Idle.fbx");
  const walkFbx = useFBX("/avatars/Walking.fbx");
  const waveFbx = useFBX("/avatars/Waving.fbx");
  const talkFbx = useFBX("/avatars/Talking.fbx");
  const pointFbx = useFBX("/avatars/Pointing.fbx");
  const skin = FLOWLY_SKINS[skinTone] || FLOWLY_SKINS.flowly;
  const companionMode = normalizeMode(mode);
  const clips = useMemo(() => {
    const all = [
      ...glbAnimations,
      ...idleFbx.animations.map((clip) => clip.clone()),
      ...walkFbx.animations.map((clip) => clip.clone()),
      ...waveFbx.animations.map((clip) => clip.clone()),
      ...talkFbx.animations.map((clip) => clip.clone()),
      ...pointFbx.animations.map((clip) => clip.clone()),
    ];

    const rename = (from: number, name: string) => {
      if (all[from]) all[from].name = name;
    };
    rename(glbAnimations.length, "idle");
    rename(glbAnimations.length + idleFbx.animations.length, "walk");
    rename(glbAnimations.length + idleFbx.animations.length + walkFbx.animations.length, "wave");
    rename(glbAnimations.length + idleFbx.animations.length + walkFbx.animations.length + waveFbx.animations.length, "talk");
    rename(glbAnimations.length + idleFbx.animations.length + walkFbx.animations.length + waveFbx.animations.length + talkFbx.animations.length, "point");
    return all;
  }, [glbAnimations, idleFbx.animations, pointFbx.animations, talkFbx.animations, walkFbx.animations, waveFbx.animations]);
  const { actions, names } = useAnimations(clips, rootRef);

  useEffect(() => {
    if (!names.length) return;
    const preferred =
      companionMode === "walk"
        ? ["walk", "walking", "nlatrack.004", "nlatrack.003"]
        : companionMode === "wave"
          ? ["wave", "waving", "nlatrack.005"]
          : companionMode === "talk"
            ? ["talk", "talking", "nlatrack.002"]
            : companionMode === "point"
              ? ["point", "pointing", "nlatrack.001"]
              : ["idle", "nlatrack", names[0]];
    const nextName =
      names.find((name) => preferred.some((candidate) => name.toLowerCase().includes(candidate))) ||
      names[0];

    Object.entries(actions).forEach(([name, action]) => {
      if (!action) return;
      if (name === nextName) {
        action.reset().fadeIn(0.22).play();
        action.timeScale = companionMode === "walk" ? 0.92 : companionMode === "wave" ? 0.86 : 0.72;
      } else {
        action.fadeOut(0.2);
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
    const scale = 4.18 / height;
    cloned.position.set(-center.x * scale, -box.min.y * scale - 2.05, -center.z * scale);
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
  }, [scene, skin]);

  useFrame((state) => {
    const root = rootRef.current;
    if (!root) return;

    const t = state.clock.elapsedTime;
    const isWalking = companionMode === "walk";
    const isJumping = companionMode === "jump";
    const isSpinning = companionMode === "spin";
    const isTalking = companionMode === "talk";
    const isThinking = companionMode === "thinking";
    const isWaving = companionMode === "wave";
    const isPointing = companionMode === "point";
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
    const idleArm = Math.sin(t * 1.8) * 0.035;
    const talk = Math.sin(t * 8.8);
    const look = Math.sin(t * 0.86);

    // El modelo base llega en T-pose. Bajamos brazos y añadimos vida procedimental.
    const leftArmDown = 1.22;
    const rightArmDown = 1.22;
    const armSwing = isWalking ? walk * 0.32 : idleArm;
    const legSwing = isWalking ? walk * 0.34 : Math.sin(t * 0.9) * 0.025;

    applyRotation(bones.head, base, (isTalking ? talk * 0.045 : Math.sin(t * 1.25) * 0.025) + (isThinking ? 0.05 : 0), look * 0.06, 0);
    applyRotation(bones.neck, base, 0, look * 0.035, 0);
    applyRotation(bones.spine, base, 0, 0, weightShift * 0.38);

    applyRotation(bones.leftUpperArm, base, armSwing * 0.45, 0, leftArmDown + armSwing * 0.2);
    applyRotation(bones.rightUpperArm, base, -armSwing * 0.45, 0, rightArmDown + armSwing * 0.2);
    applyRotation(bones.leftLowerArm, base, 0, 0, 0.2 + Math.sin(t * 1.7) * 0.04);
    applyRotation(bones.rightLowerArm, base, 0, 0, 0.2 + Math.sin(t * 1.7) * 0.04);
    applyRotation(bones.leftUpperLeg, base, -legSwing, 0, 0);
    applyRotation(bones.rightUpperLeg, base, legSwing, 0, 0);

    if (isTalking) {
      applyRotation(bones.leftUpperArm, base, 0.08 + talk * 0.07, 0, leftArmDown + 0.12 + talk * 0.04);
      applyRotation(bones.rightUpperArm, base, -0.08 - talk * 0.07, 0, rightArmDown + 0.12 + talk * 0.04);
    }

    if (isWaving) {
      applyRotation(bones.rightUpperArm, base, -0.45, 0.12, 0.62 + Math.sin(t * 7.8) * 0.28);
      applyRotation(bones.rightLowerArm, base, -0.28, 0, 0.75 + Math.sin(t * 7.8) * 0.18);
      applyRotation(bones.leftUpperArm, base, 0, 0, leftArmDown);
    }

    if (isPointing) {
      applyRotation(bones.rightUpperArm, base, -0.28, -0.15, 0.82);
      applyRotation(bones.rightLowerArm, base, -0.1, 0, 0.25);
      applyRotation(bones.head, base, -0.02, 0.12, 0);
    }
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
        camera={{ position: [0, 1.35, 8], zoom: 72, near: 0.1, far: 100 }}
        dpr={[1, 1.75]}
        shadows
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.55} />
        <directionalLight position={[2.4, 4.2, 5.2]} intensity={2.35} castShadow />
        <pointLight position={[-2.2, 2.2, 3]} color={skin.light} intensity={1.25} />
        <Suspense fallback={<FlowlyV3Loading />}>
          <FlowlyCharacterEngine modelUrl={modelUrl} mode={safeMode} skinTone={skin.key} facing={facing} />
          <ContactShadows position={[0, -1.84, 0]} opacity={0.28} scale={4.6} blur={2.8} far={3.4} />
        </Suspense>
      </Canvas>
    </button>
  );
}

useGLTF.preload("/avatars/flowly.glb");
