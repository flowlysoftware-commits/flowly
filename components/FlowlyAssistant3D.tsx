"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

type AssistantMode = "idle" | "walk" | "wave" | "talk" | "point" | "thinking" | "tour" | "sit" | "attention" | "reading" | "typing" | "concerned" | "celebrating";

export type FlowlyCompanionSkinTone = "flowly" | "cosmic" | "business" | "neon" | "chef" | "expert";

type FlowlyAssistant3DProps = {
  modelUrl?: string;
  mode?: AssistantMode;
  facing?: "left" | "right" | "front";
  skinTone?: FlowlyCompanionSkinTone;
  onClick?: () => void;
};

type RigBones = {
  hips?: THREE.Object3D;
  spine?: THREE.Object3D;
  spine1?: THREE.Object3D;
  spine2?: THREE.Object3D;
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

function normalizeMode(mode: AssistantMode) {
  if (mode === "thinking" || mode === "attention" || mode === "reading" || mode === "typing" || mode === "concerned") return "idle";
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
    hips: getObject(scene, "mixamorig:Hips", "mixamorigHips", "Hips", "Hip", "Pelvis", "Root"),
    spine: getObject(scene, "mixamorig:Spine", "mixamorigSpine", "Spine", "Waist", "Spine01"),
    spine1: getObject(scene, "mixamorig:Spine1", "mixamorigSpine1", "Spine1", "Spine01", "Spine02"),
    spine2: getObject(scene, "mixamorig:Spine2", "mixamorigSpine2", "Spine2", "Spine02"),
    neck: getObject(scene, "mixamorig:Neck", "mixamorigNeck", "Neck", "NeckTwist01", "NeckTwist02"),
    head: getObject(scene, "mixamorig:Head", "mixamorigHead", "Head"),
    jaw: getObject(scene, "mixamorig:Jaw", "mixamorigJaw", "Jaw", "jaw"),
    leftArm: getObject(scene, "mixamorig:LeftArm", "mixamorigLeftArm", "LeftArm", "L_Upperarm", "L_Clavicle", "L_UpperarmTwist01", "L_UpperarmTwist02"),
    leftForeArm: getObject(scene, "mixamorig:LeftForeArm", "mixamorigLeftForeArm", "LeftForeArm", "L_Forearm"),
    leftHand: getObject(scene, "mixamorig:LeftHand", "mixamorigLeftHand", "LeftHand", "L_Hand"),
    rightArm: getObject(scene, "mixamorig:RightArm", "mixamorigRightArm", "RightArm", "R_Upperarm", "R_Clavicle", "R_UpperarmTwist01", "R_UpperarmTwist02"),
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

function aimBoneToWorldDirection(
  basePose: Map<string, THREE.Quaternion>,
  bone: THREE.Object3D | undefined,
  child: THREE.Object3D | undefined,
  targetWorldDirection: THREE.Vector3,
  influence = 1,
) {
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

function softenTPose(basePose: Map<string, THREE.Quaternion>, rig: RigBones, mode: AssistantMode) {
  // Corrección mínima de pose: baja los brazos abiertos del GLB sin animar extremidades como muñeco.
  const influence = 0.92;
  const leftSide = getRestSideDirection(rig.leftArm, rig.leftForeArm || rig.leftHand, -1);
  const rightSide = getRestSideDirection(rig.rightArm, rig.rightForeArm || rig.rightHand, 1);
  leftTarget.copy(leftSide).multiplyScalar(0.06).add(downVector).normalize();
  rightTarget.copy(rightSide).multiplyScalar(0.06).add(downVector).normalize();
  aimBoneToWorldDirection(basePose, rig.leftArm, rig.leftForeArm || rig.leftHand, leftTarget, influence);
  aimBoneToWorldDirection(basePose, rig.rightArm, rig.rightForeArm || rig.rightHand, rightTarget, influence);
}


const skinToneProfiles: Record<FlowlyCompanionSkinTone, { primary: string; secondary: string; emissive: string; metalness: number; roughness: number; }> = {
  flowly: { primary: "#7c3aed", secondary: "#22d3ee", emissive: "#0e7490", metalness: 0.22, roughness: 0.58 },
  cosmic: { primary: "#111827", secondary: "#a855f7", emissive: "#7e22ce", metalness: 0.32, roughness: 0.44 },
  business: { primary: "#0f172a", secondary: "#e5e7eb", emissive: "#0891b2", metalness: 0.2, roughness: 0.52 },
  neon: { primary: "#020617", secondary: "#14b8a6", emissive: "#22d3ee", metalness: 0.42, roughness: 0.3 },
  chef: { primary: "#f8fafc", secondary: "#0f172a", emissive: "#f97316", metalness: 0.16, roughness: 0.64 },
  expert: { primary: "#312e81", secondary: "#f0abfc", emissive: "#c026d3", metalness: 0.24, roughness: 0.5 },
};

function applySkinTone(scene: THREE.Object3D, skinTone: FlowlyCompanionSkinTone) {
  const profile = skinToneProfiles[skinTone] || skinToneProfiles.flowly;
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const nextMaterials = materials.map((sourceMaterial, index) => {
      const material = sourceMaterial.clone() as THREE.MeshStandardMaterial;
      const name = `${mesh.name} ${material.name}`.toLowerCase();
      const looksLikeSkin = name.includes("skin") || name.includes("face") || name.includes("head") || name.includes("hand") || name.includes("body");
      const looksLikeHair = name.includes("hair") || name.includes("eyebrow");
      const looksLikeEye = name.includes("eye") || name.includes("iris");
      if (!looksLikeSkin && !looksLikeEye) {
        const chosen = looksLikeHair ? profile.secondary : index % 2 === 0 ? profile.primary : profile.secondary;
        material.color = new THREE.Color(chosen).lerp(material.color || new THREE.Color("#ffffff"), 0.38);
        material.emissive = new THREE.Color(profile.emissive).multiplyScalar(skinTone === "neon" ? 0.18 : 0.08);
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

function getModelProfile(modelUrl: string, facing: Required<FlowlyAssistant3DProps>["facing"]) {
  const url = modelUrl.toLowerCase();
  const baseTurn = facing === "right" ? -0.16 : facing === "left" ? 0.16 : 0;

  // Cada skin puede venir de una herramienta distinta y con escala/orientación distinta.
  // Normalizamos por bounding box y solo dejamos aquí una corrección visual de frente.
  if (url.includes("grandma")) return { yaw: 0 + baseTurn, targetHeight: 2.95, lift: -1.42 };
  if (url.includes("chef")) return { yaw: 0 + baseTurn, targetHeight: 3.05, lift: -1.46 };
  return { yaw: -Math.PI / 2 + baseTurn, targetHeight: 3.05, lift: -1.46 };
}

function Model({
  modelUrl = "/avatars/flowly.glb",
  mode = "idle",
  facing = "front",
  skinTone = "flowly",
}: Required<Pick<FlowlyAssistant3DProps, "modelUrl" | "mode" | "facing" | "skinTone">>) {
  const group = useRef<THREE.Group>(null);
  const isFbx = modelUrl.toLowerCase().endsWith(".fbx");
  const gltf = useGLTF(isFbx ? "/avatars/flowly.glb" : modelUrl) as unknown as { scene: THREE.Group; animations?: THREE.AnimationClip[] };
  const fbx = useLoader(FBXLoader, isFbx ? modelUrl : "/avatars/Idle.fbx") as THREE.Group & { animations?: THREE.AnimationClip[] };
  const sourceScene = isFbx ? fbx : gltf.scene;
  const scene = useMemo(() => {
    const cloned = clone(sourceScene) as THREE.Group;
    applySkinTone(cloned, skinTone);
    return cloned;
  }, [sourceScene, skinTone]);
  const profile = useMemo(() => getModelProfile(modelUrl, facing), [modelUrl, facing]);
  const normalizedBounds = useMemo(() => {
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const height = size.y > 0.001 ? size.y : 1;
    const scale = profile.targetHeight / height;
    return {
      scale,
      position: new THREE.Vector3(-center.x, -box.min.y + profile.lift, -center.z),
    };
  }, [scene, profile]);
  const rig = useMemo(() => getRig(scene), [scene]);
  const basePose = useMemo(() => rememberBasePose(rig), [rig]);
  const activeMode = normalizeMode(mode);
  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);
  const clips = (isFbx ? fbx.animations : gltf.animations) || [];
  const hasNativeAnimations = clips.length > 0 && isFbx; // Chef puede traer clips propios; el GLB original sigue con micro estados seguros.

  useEffect(() => {
    if (!hasNativeAnimations) return;
    // Evitamos clips problemáticos de caminar o extremidades si el GLB viene mal riggeado.
    // El movimiento "vivo" ocurre moviendo el personaje completo desde el Runtime, no retorciendo huesos.
    const clipIndex = activeMode === "talk" ? 1 : 0;
    const clip = clips[clipIndex] || clips[0];
    if (!clip) return;
    mixer.stopAllAction();
    const action = mixer.clipAction(clip);
    action.reset().fadeIn(0.18).play();
    return () => { action.fadeOut(0.16); };
  }, [activeMode, clips, hasNativeAnimations, mixer]);

  useEffect(() => {
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.filter(Boolean).forEach((material) => { material.needsUpdate = true; });
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (!group.current) return;

    const t = state.clock.elapsedTime;
    const slow = Math.sin(t * 0.68);
    const breathe = Math.sin(t * 1.45);
    const activeSpeaking = activeMode === "talk";
    const activeThinking = mode === "thinking";
    const activeAttention = mode === "attention";

    if (hasNativeAnimations) {
      mixer.update(delta);
    } else {
      Object.values(rig).forEach((object) => {
        const base = object ? basePose.get(object.uuid) : undefined;
        if (object && base) object.quaternion.copy(base);
      });
      applyOffset(basePose, rig.spine, breathe * 0.014, 0, slow * 0.008);
      applyOffset(basePose, rig.neck, slow * 0.012, slow * 0.014, 0);
      applyOffset(basePose, rig.head, activeThinking ? -0.045 : breathe * 0.008, slow * 0.014, 0);
    }

    softenTPose(basePose, rig, activeMode);

    if (rig.mouth) {
      rig.mouth.scale.y = activeSpeaking ? 1 + Math.abs(Math.sin(t * 12.5)) * 0.26 : 1;
      rig.mouth.scale.x = activeSpeaking ? 1 + Math.abs(Math.sin(t * 8.5)) * 0.06 : 1;
    }

    if (activeSpeaking) {
      applyOffset(basePose, rig.jaw as THREE.Object3D | undefined, Math.abs(Math.sin(t * 12.5)) * 0.08, 0, 0);
      applyOffset(basePose, rig.head, Math.sin(t * 5.2) * 0.028, Math.sin(t * 3.6) * 0.035, 0);
      applyOffset(basePose, rig.neck, Math.sin(t * 4.2) * 0.018, Math.sin(t * 3.1) * 0.02, 0);
      applyOffset(basePose, rig.spine1, Math.sin(t * 3.2) * 0.014, 0, Math.sin(t * 2.4) * 0.02);
    }

    const baseYaw = profile.yaw;
    const concernedLean = mode === "concerned" ? -0.05 : 0;
    const readingLean = mode === "reading" || mode === "typing" ? 0.035 : 0;
    const attentiveLean = activeAttention ? 0.045 : concernedLean + readingLean;
    const looking = activeSpeaking ? Math.sin(t * 2.8) * 0.05 : Math.sin(t * 0.45) * 0.02;
    const bodyBreath = activeSpeaking ? breathe * 0.018 : breathe * 0.01;

    // Movimiento del personaje completo. Las piernas no se fuerzan: el Runtime mueve el cuerpo por pantalla.
    group.current.position.set(Math.sin(t * 0.38) * 0.012, -1.1 + bodyBreath, 0);
    group.current.rotation.set(attentiveLean, baseYaw + looking, slow * 0.004);
    group.current.scale.setScalar(normalizedBounds.scale);
  });

  return (
    <group ref={group} position={[0, -1.1, 0]} rotation={[0, profile.yaw, 0]} scale={normalizedBounds.scale}>
      <primitive object={scene} position={normalizedBounds.position} />
    </group>
  );
}

function ModelFallback() {
  return (
    <mesh position={[0, 0, 0]}>
      <capsuleGeometry args={[0.42, 1.35, 8, 16]} />
      <meshStandardMaterial color="#22d3ee" metalness={0.55} roughness={0.2} />
    </mesh>
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
    <button type="button" onClick={onClick} className="flowly-3d-stage" aria-label="Abrir asistente 3D de Flowly">
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 1.08, 5.25], fov: 34 }} gl={{ alpha: true, antialias: true }} style={{ pointerEvents: "none" }}>
        <ambientLight intensity={1.35} />
        <directionalLight position={[2.4, 4, 3]} intensity={2.05} castShadow />
        <pointLight position={[-2.2, 2.8, 2]} intensity={1.05} color="#8b5cf6" />
        <pointLight position={[2.4, 1.2, 2.6]} intensity={0.9} color="#22d3ee" />
        <Suspense fallback={<ModelFallback />}>
          <Model modelUrl={modelUrl} mode={mode} facing={facing} skinTone={skinTone} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </button>
  );
}

useGLTF.preload("/avatars/flowly.glb");
