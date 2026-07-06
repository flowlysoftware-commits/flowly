"use client";

import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { FlowlyCompanionSkinTone } from "@/lib/flowlyCompanionSkins";

export type { FlowlyCompanionSkinTone } from "@/lib/flowlyCompanionSkins";

type AssistantMode = "idle" | "walk" | "wave" | "talk" | "point" | "thinking" | "tour" | "sit" | "attention" | "reading" | "typing" | "concerned" | "celebrating";

type FlowlyAssistant3DProps = {
  modelUrl?: string;
  mode?: AssistantMode;
  facing?: "left" | "right" | "front";
  skinTone?: FlowlyCompanionSkinTone;
  onClick?: () => void;
};

class Silent3DErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("Flowly Companion 3D no se pudo cargar", error);
  }
  render() {
    if (this.state.hasError) {
      return <span className="flowly-avatar-load-error">Companion no cargado</span>;
    }
    return this.props.children;
  }
}

type RigBones = {
  spine?: THREE.Object3D;
  spine1?: THREE.Object3D;
  neck?: THREE.Object3D;
  head?: THREE.Object3D;
  jaw?: THREE.Object3D;
  leftArm?: THREE.Object3D;
  leftForeArm?: THREE.Object3D;
  leftHand?: THREE.Object3D;
  rightArm?: THREE.Object3D;
  rightForeArm?: THREE.Object3D;
  rightHand?: THREE.Object3D;
  mouth?: THREE.Object3D;
};

const skinToneProfiles: Record<FlowlyCompanionSkinTone, { primary: string; secondary: string; emissive: string; metalness: number; roughness: number }> = {
  flowly: { primary: "#7c3aed", secondary: "#22d3ee", emissive: "#0e7490", metalness: 0.22, roughness: 0.58 },
  cosmic: { primary: "#111827", secondary: "#a855f7", emissive: "#7e22ce", metalness: 0.32, roughness: 0.44 },
  business: { primary: "#0f172a", secondary: "#e5e7eb", emissive: "#0891b2", metalness: 0.2, roughness: 0.52 },
  neon: { primary: "#020617", secondary: "#14b8a6", emissive: "#22d3ee", metalness: 0.42, roughness: 0.3 },
  chef: { primary: "#f8fafc", secondary: "#f97316", emissive: "#f97316", metalness: 0.16, roughness: 0.64 },
  expert: { primary: "#312e81", secondary: "#f0abfc", emissive: "#c026d3", metalness: 0.24, roughness: 0.5 },
};

function normalizeMode(mode: AssistantMode) {
  if (mode === "celebrating") return "wave";
  if (mode === "tour") return "point";
  if (mode === "sit") return "idle";
  return mode;
}

function getObject(scene: THREE.Object3D, ...names: string[]) {
  for (const name of names) {
    const found = scene.getObjectByName(name);
    if (found) return found;
  }
  return undefined;
}

function getRig(scene: THREE.Object3D): RigBones {
  return {
    spine: getObject(scene, "mixamorig:Spine", "mixamorigSpine", "Spine", "Waist", "Spine01"),
    spine1: getObject(scene, "mixamorig:Spine1", "mixamorigSpine1", "Spine1", "Spine01", "Spine02"),
    neck: getObject(scene, "mixamorig:Neck", "mixamorigNeck", "Neck", "NeckTwist01", "NeckTwist02"),
    head: getObject(scene, "mixamorig:Head", "mixamorigHead", "Head"),
    jaw: getObject(scene, "mixamorig:Jaw", "mixamorigJaw", "Jaw", "jaw"),
    leftArm: getObject(scene, "mixamorig:LeftArm", "mixamorigLeftArm", "LeftArm", "L_Upperarm", "L_Clavicle", "L_UpperarmTwist01"),
    leftForeArm: getObject(scene, "mixamorig:LeftForeArm", "mixamorigLeftForeArm", "LeftForeArm", "L_Forearm"),
    leftHand: getObject(scene, "mixamorig:LeftHand", "mixamorigLeftHand", "LeftHand", "L_Hand"),
    rightArm: getObject(scene, "mixamorig:RightArm", "mixamorigRightArm", "RightArm", "R_Upperarm", "R_Clavicle", "R_UpperarmTwist01"),
    rightForeArm: getObject(scene, "mixamorig:RightForeArm", "mixamorigRightForeArm", "RightForeArm", "R_Forearm"),
    rightHand: getObject(scene, "mixamorig:RightHand", "mixamorigRightHand", "RightHand", "R_Hand"),
    mouth: getObject(scene, "Fitness_Grandma_MouthAnimGeo", "Mouth", "mouth"),
  };
}

function rememberBasePose(rig: RigBones) {
  const map = new Map<string, THREE.Quaternion>();
  Object.values(rig).forEach((object) => {
    if (object) map.set(object.uuid, object.quaternion.clone());
  });
  return map;
}

const tempQuaternion = new THREE.Quaternion();
const tempEuler = new THREE.Euler(0, 0, 0, "XYZ");
const baseWorldA = new THREE.Vector3();
const baseWorldB = new THREE.Vector3();
const parentWorldQuat = new THREE.Quaternion();
const parentWorldQuatInv = new THREE.Quaternion();
const desiredLocalDir = new THREE.Vector3();
const restAxisLocal = new THREE.Vector3();
const restAxisAfterBase = new THREE.Vector3();
const deltaQuat = new THREE.Quaternion();
const finalQuat = new THREE.Quaternion();
const leftTarget = new THREE.Vector3();
const rightTarget = new THREE.Vector3();
const downVector = new THREE.Vector3(0, -1, 0);

function applyOffset(basePose: Map<string, THREE.Quaternion>, object: THREE.Object3D | undefined, x = 0, y = 0, z = 0) {
  if (!object) return;
  const base = basePose.get(object.uuid);
  if (!base) return;
  tempEuler.set(x, y, z, "XYZ");
  tempQuaternion.setFromEuler(tempEuler);
  object.quaternion.copy(base).multiply(tempQuaternion);
}

function getRestSideDirection(bone: THREE.Object3D | undefined, child: THREE.Object3D | undefined, fallback: -1 | 1) {
  if (!bone || !child) return new THREE.Vector3(fallback, 0, 0);
  bone.getWorldPosition(baseWorldA);
  child.getWorldPosition(baseWorldB);
  const side = new THREE.Vector3().copy(baseWorldB).sub(baseWorldA).setY(0);
  if (side.lengthSq() < 0.0001) side.set(fallback, 0, 0);
  return side.normalize();
}

function aimBoneToWorldDirection(basePose: Map<string, THREE.Quaternion>, bone: THREE.Object3D | undefined, child: THREE.Object3D | undefined, targetWorldDirection: THREE.Vector3, influence = 1) {
  if (!bone || !child || !bone.parent) return;
  const base = basePose.get(bone.uuid);
  if (!base) return;
  restAxisLocal.copy(child.position).normalize();
  if (restAxisLocal.lengthSq() < 0.0001) return;
  bone.parent.getWorldQuaternion(parentWorldQuat);
  parentWorldQuatInv.copy(parentWorldQuat).invert();
  desiredLocalDir.copy(targetWorldDirection).normalize().applyQuaternion(parentWorldQuatInv).normalize();
  restAxisAfterBase.copy(restAxisLocal).applyQuaternion(base).normalize();
  deltaQuat.setFromUnitVectors(restAxisAfterBase, desiredLocalDir);
  finalQuat.copy(deltaQuat).multiply(base).normalize();
  bone.quaternion.copy(base).slerp(finalQuat, THREE.MathUtils.clamp(influence, 0, 1));
}

function softenTPose(basePose: Map<string, THREE.Quaternion>, rig: RigBones) {
  const leftSide = getRestSideDirection(rig.leftArm, rig.leftForeArm || rig.leftHand, -1);
  const rightSide = getRestSideDirection(rig.rightArm, rig.rightForeArm || rig.rightHand, 1);
  leftTarget.copy(leftSide).multiplyScalar(0.06).add(downVector).normalize();
  rightTarget.copy(rightSide).multiplyScalar(0.06).add(downVector).normalize();
  aimBoneToWorldDirection(basePose, rig.leftArm, rig.leftForeArm || rig.leftHand, leftTarget, 0.92);
  aimBoneToWorldDirection(basePose, rig.rightArm, rig.rightForeArm || rig.rightHand, rightTarget, 0.92);
}

function applySkinTone(scene: THREE.Object3D, skinTone: FlowlyCompanionSkinTone) {
  const profile = skinToneProfiles[skinTone] || skinToneProfiles.flowly;
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const nextMaterials = materials.map((sourceMaterial, index) => {
      const material = sourceMaterial.clone() as THREE.MeshStandardMaterial;
      const name = `${mesh.name} ${material.name}`.toLowerCase();
      const looksLikeSkin = name.includes("skin") || name.includes("face") || name.includes("head") || name.includes("hand");
      const looksLikeEye = name.includes("eye") || name.includes("iris");
      if (!looksLikeSkin && !looksLikeEye) {
        const chosen = index % 2 === 0 ? profile.primary : profile.secondary;
        material.color = new THREE.Color(chosen).lerp(material.color || new THREE.Color("#ffffff"), skinTone === "chef" ? 0.18 : 0.38);
        material.emissive = new THREE.Color(profile.emissive).multiplyScalar(skinTone === "neon" ? 0.2 : 0.08);
        material.metalness = profile.metalness;
        material.roughness = profile.roughness;
      }
      material.needsUpdate = true;
      return material;
    });
    mesh.material = Array.isArray(mesh.material) ? nextMaterials : nextMaterials[0];
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
  });
}

function FlowlyModel({ modelUrl, mode, facing, skinTone }: Required<Pick<FlowlyAssistant3DProps, "modelUrl" | "mode" | "facing" | "skinTone">>) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelUrl) as unknown as { scene: THREE.Group };
  const scene = useMemo(() => {
    const cloned = clone(gltf.scene) as THREE.Group;
    applySkinTone(cloned, skinTone);
    return cloned;
  }, [gltf.scene, skinTone]);

  const normalized = useMemo(() => {
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const height = Math.max(size.y, 0.001);
    return {
      scale: 3.55 / height,
      offset: new THREE.Vector3(-center.x, -box.min.y - 1.72, -center.z),
    };
  }, [scene]);

  const rig = useMemo(() => getRig(scene), [scene]);
  const basePose = useMemo(() => rememberBasePose(rig), [rig]);
  const activeMode = normalizeMode(mode);
  const baseYaw = facing === "left" ? -Math.PI / 2 + 0.18 : facing === "right" ? -Math.PI / 2 - 0.18 : -Math.PI / 2;

  useEffect(() => {
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) mesh.frustumCulled = false;
    });
  }, [scene]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const slow = Math.sin(t * 0.68);
    const breathe = Math.sin(t * 1.45);
    const talking = activeMode === "talk";
    const thinking = activeMode === "thinking";
    const attention = activeMode === "attention";

    Object.values(rig).forEach((object) => {
      const base = object ? basePose.get(object.uuid) : undefined;
      if (object && base) object.quaternion.copy(base);
    });

    applyOffset(basePose, rig.spine, breathe * 0.014, 0, slow * 0.008);
    applyOffset(basePose, rig.neck, slow * 0.012, slow * 0.014, 0);
    applyOffset(basePose, rig.head, thinking ? -0.045 : breathe * 0.008, slow * 0.014, 0);
    softenTPose(basePose, rig);

    if (talking) {
      applyOffset(basePose, rig.jaw, Math.abs(Math.sin(t * 12.5)) * 0.08, 0, 0);
      applyOffset(basePose, rig.head, Math.sin(t * 5.2) * 0.028, Math.sin(t * 3.6) * 0.035, 0);
      applyOffset(basePose, rig.spine1, Math.sin(t * 3.2) * 0.014, 0, Math.sin(t * 2.4) * 0.02);
    }

    if (rig.mouth) {
      rig.mouth.scale.y = talking ? 1 + Math.abs(Math.sin(t * 12.5)) * 0.26 : 1;
    }

    const wave = activeMode === "wave";
    const point = activeMode === "point";
    if (wave || point) {
      const arm = rig.rightArm;
      const foreArm = rig.rightForeArm;
      applyOffset(basePose, arm, -0.6, 0.12, -0.2 + Math.sin(t * 4.6) * (wave ? 0.16 : 0.02));
      applyOffset(basePose, foreArm, -0.28, 0, 0.08);
    }

    const lean = attention ? 0.045 : activeMode === "concerned" ? -0.05 : activeMode === "reading" || activeMode === "typing" ? 0.035 : 0;
    group.current.position.set(Math.sin(t * 0.38) * 0.018, breathe * 0.015, 0);
    group.current.rotation.set(lean, baseYaw + (talking ? Math.sin(t * 2.8) * 0.05 : Math.sin(t * 0.45) * 0.02), slow * 0.004);
    group.current.scale.setScalar(normalized.scale);
  });

  return (
    <group ref={group} scale={normalized.scale}>
      <primitive object={scene} position={normalized.offset} />
    </group>
  );
}

export default function FlowlyAssistant3D({
  modelUrl = "/avatars/flowly.glb",
  mode = "idle",
  facing = "front",
  skinTone = "flowly",
  onClick,
}: FlowlyAssistant3DProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flowly-3d-stage flowly-3d-stage-${skinTone}`}
      aria-label="Abrir Companion de Flowly"
    >
      <Silent3DErrorBoundary>
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ position: [0, 0.4, 4.15], fov: 31 }}
          gl={{ alpha: true, antialias: true }}
          style={{ pointerEvents: "none", position: "absolute", inset: 0 }}
        >
          <ambientLight intensity={1.75} />
          <directionalLight position={[2.4, 4, 3]} intensity={2.05} castShadow />
          <pointLight position={[-2.2, 2.8, 2]} intensity={1.05} color="#8b5cf6" />
          <pointLight position={[2.4, 1.2, 2.6]} intensity={0.9} color="#22d3ee" />
          <Suspense fallback={null}>
            <FlowlyModel modelUrl={modelUrl} mode={mode} facing={facing} skinTone={skinTone} />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </Silent3DErrorBoundary>
    </button>
  );
}

useGLTF.preload("/avatars/flowly.glb");
