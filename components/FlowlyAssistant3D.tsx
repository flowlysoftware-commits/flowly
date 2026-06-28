"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

type AssistantMode = "idle" | "walk" | "wave" | "talk" | "point" | "thinking" | "tour" | "sit" | "attention";

type FlowlyAssistant3DProps = {
  modelUrl?: string;
  mode?: AssistantMode;
  facing?: "left" | "right" | "front";
  onClick?: () => void;
};

type RigBones = {
  hips?: THREE.Object3D;
  spine?: THREE.Object3D;
  spine1?: THREE.Object3D;
  spine2?: THREE.Object3D;
  neck?: THREE.Object3D;
  head?: THREE.Object3D;
  leftArm?: THREE.Object3D;
  leftForeArm?: THREE.Object3D;
  leftHand?: THREE.Object3D;
  rightArm?: THREE.Object3D;
  rightForeArm?: THREE.Object3D;
  rightHand?: THREE.Object3D;
  mouth?: THREE.Object3D;
};

function normalizeMode(mode: AssistantMode) {
  if (mode === "thinking" || mode === "attention") return "idle";
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

function getFacingYaw(facing: Required<FlowlyAssistant3DProps>["facing"]) {
  const modelForwardCorrection = -Math.PI / 2;
  if (facing === "right") return modelForwardCorrection - 0.18;
  if (facing === "left") return modelForwardCorrection + 0.18;
  return modelForwardCorrection;
}

function Model({
  modelUrl = "/avatars/flowly.glb",
  mode = "idle",
  facing = "front",
}: Required<Pick<FlowlyAssistant3DProps, "modelUrl" | "mode" | "facing">>) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelUrl) as unknown as { scene: THREE.Group; animations?: THREE.AnimationClip[] };
  const scene = useMemo(() => clone(gltf.scene) as THREE.Group, [gltf.scene]);
  const rig = useMemo(() => getRig(scene), [scene]);
  const basePose = useMemo(() => rememberBasePose(rig), [rig]);
  const activeMode = normalizeMode(mode);
  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);
  const clips = gltf.animations || [];
  const hasNativeAnimations = clips.length > 0;

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
      rig.mouth.scale.y = activeSpeaking ? 1 + Math.abs(Math.sin(t * 10)) * 0.12 : 1;
    }

    const baseYaw = getFacingYaw(facing);
    const attentiveLean = activeAttention ? 0.045 : 0;
    const looking = activeSpeaking ? Math.sin(t * 2.1) * 0.03 : Math.sin(t * 0.45) * 0.02;
    const bodyBreath = breathe * 0.01;

    // Movimiento del personaje completo. Las piernas no se fuerzan: el Runtime mueve el cuerpo por pantalla.
    group.current.position.set(Math.sin(t * 0.38) * 0.012, -1.1 + bodyBreath, 0);
    group.current.rotation.set(attentiveLean, baseYaw + looking, slow * 0.004);
    group.current.scale.setScalar(1.42);
  });

  return (
    <group ref={group} position={[0, -1.1, 0]} rotation={[0, getFacingYaw(facing), 0]} scale={1.42}>
      <primitive object={scene} />
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
  onClick,
}: FlowlyAssistant3DProps) {
  return (
    <button type="button" onClick={onClick} className="flowly-3d-stage" aria-label="Abrir asistente 3D de Flowly">
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 1.12, 4.9], fov: 32 }} gl={{ alpha: true, antialias: true }} style={{ pointerEvents: "none" }}>
        <ambientLight intensity={1.35} />
        <directionalLight position={[2.4, 4, 3]} intensity={2.05} castShadow />
        <pointLight position={[-2.2, 2.8, 2]} intensity={1.05} color="#8b5cf6" />
        <pointLight position={[2.4, 1.2, 2.6]} intensity={0.9} color="#22d3ee" />
        <Suspense fallback={<ModelFallback />}>
          <Model modelUrl={modelUrl} mode={mode} facing={facing} />
          <Environment preset="city" />
        </Suspense>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.34, 0]} receiveShadow>
          <circleGeometry args={[1.45, 64]} />
          <meshStandardMaterial color="#020617" transparent opacity={0.18} />
        </mesh>
      </Canvas>
    </button>
  );
}

useGLTF.preload("/avatars/flowly.glb");
