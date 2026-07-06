"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, useGLTF } from "@react-three/drei";
import type { Group, Object3D, SkinnedMesh, Mesh, MeshStandardMaterial } from "three";
import { Box3, Color, Vector3 } from "three";
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
  camera: [number, number, number];
  rotationY: number;
};

const FLOWLY_SKINS: Record<FlowlyCompanionSkinTone, RuntimeSkin> = {
  flowly: {
    key: "flowly",
    label: "Flow",
    accent: "#7c3aed",
    light: "#22d3ee",
    emissive: "#151a44",
    camera: [0, 1.32, 4.1],
    rotationY: 0,
  },
  cosmic: {
    key: "cosmic",
    label: "Cósmico",
    accent: "#a855f7",
    light: "#38bdf8",
    emissive: "#1e1148",
    camera: [0, 1.32, 4.1],
    rotationY: 0,
  },
  business: {
    key: "business",
    label: "Business",
    accent: "#94a3b8",
    light: "#e5e7eb",
    emissive: "#111827",
    camera: [0, 1.32, 4.1],
    rotationY: 0,
  },
  neon: {
    key: "neon",
    label: "Neón",
    accent: "#14b8a6",
    light: "#67e8f9",
    emissive: "#052e2b",
    camera: [0, 1.32, 4.1],
    rotationY: 0,
  },
  expert: {
    key: "expert",
    label: "Experta",
    accent: "#d946ef",
    light: "#f0abfc",
    emissive: "#30105f",
    camera: [0, 1.32, 4.1],
    rotationY: 0,
  },
  chef: {
    key: "chef",
    label: "Chef Flow",
    accent: "#f97316",
    light: "#fef3c7",
    emissive: "#431407",
    camera: [0, 1.32, 4.1],
    rotationY: 0,
  },
};

function normalizeMode(mode?: AssistantMode) {
  if (mode === "tour") return "point";
  if (mode === "sit") return "idle";
  return mode || "idle";
}

function isMesh(object: Object3D): object is Mesh | SkinnedMesh {
  return "isMesh" in object && Boolean((object as Mesh).isMesh);
}

function cloneMaterial(material: unknown, skin: RuntimeSkin) {
  const original = material as MeshStandardMaterial | MeshStandardMaterial[] | undefined;
  const tint = new Color(skin.accent);
  const glow = new Color(skin.emissive);

  const update = (mat: MeshStandardMaterial) => {
    const next = mat.clone();
    if (next.color) next.color.lerp(tint, skin.key === "flowly" ? 0.08 : 0.22);
    if ("emissive" in next && next.emissive) {
      next.emissive.copy(glow);
      next.emissiveIntensity = skin.key === "flowly" ? 0.08 : 0.18;
    }
    next.needsUpdate = true;
    return next;
  };

  if (Array.isArray(original)) return original.map((mat) => update(mat));
  if (original) return update(original);
  return original;
}

function FlowlyModel({ modelUrl, mode, skinTone, facing }: Required<Pick<FlowlyAssistant3DProps, "modelUrl" | "mode" | "skinTone" | "facing">>) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(modelUrl);
  const skin = FLOWLY_SKINS[skinTone] || FLOWLY_SKINS.flowly;

  const normalizedScene = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new Box3().setFromObject(cloned);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);
    const largest = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.45 / largest;

    cloned.position.set(-center.x * scale, -box.min.y * scale - 1.28, -center.z * scale);
    cloned.scale.setScalar(scale);
    cloned.traverse((object) => {
      if (isMesh(object)) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.material = cloneMaterial(object.material, skin) as typeof object.material;
      }
    });
    return cloned;
  }, [scene, skin]);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    const t = state.clock.elapsedTime;
    const baseFacing = facing === "left" ? -0.2 : facing === "right" ? 0.2 : 0;
    const talkPulse = mode === "talk" ? Math.sin(t * 14) * 0.012 : 0;
    const walkStep = mode === "walk" ? Math.sin(t * 9) * 0.035 : 0;
    const thinkingTurn = mode === "thinking" ? Math.sin(t * 1.2) * 0.08 : 0;
    const pointTurn = mode === "point" || mode === "attention" ? Math.sin(t * 2.1) * 0.035 : 0;

    group.rotation.y = skin.rotationY + baseFacing + thinkingTurn + pointTurn;
    group.rotation.z = walkStep;
    group.position.y = Math.sin(t * 2.1) * 0.025 + talkPulse;
    group.scale.setScalar(1 + (mode === "celebrating" ? Math.sin(t * 7) * 0.015 : 0));
  });

  return (
    <group ref={groupRef}>
      <primitive object={normalizedScene} />
    </group>
  );
}

function FlowlyV3Loading() {
  return (
    <div className="flowly-v3-loading" aria-hidden="true">
      <span />
    </div>
  );
}

/**
 * Companion V3: renderizador único real.
 *
 * Esta versión aparca el avatar CSS antiguo y vuelve al cuerpo Flow real en GLB.
 * El componente es la única entrada visual: no hay muñeco blanco, no hay fallback
 * superpuesto y no hay burbuja arrastrable. El usuario arrastra el propio cuerpo
 * del Companion mediante la clase `flowly-v3-drag-handle`.
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
        camera={{ position: skin.camera, fov: 32, near: 0.1, far: 100 }}
        dpr={[1, 1.75]}
        shadows
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.35} />
        <directionalLight position={[2.4, 3.8, 4.2]} intensity={2.4} castShadow />
        <pointLight position={[-2, 1.6, 2]} color={skin.light} intensity={1.2} />
        <Suspense fallback={null}>
          <FlowlyModel modelUrl={modelUrl} mode={safeMode} skinTone={skin.key} facing={facing} />
          <ContactShadows position={[0, -1.25, 0]} opacity={0.28} scale={4} blur={2.6} far={3.5} />
        </Suspense>
      </Canvas>
      <FlowlyV3Loading />
    </button>
  );
}

useGLTF.preload("/avatars/flowly.glb");
