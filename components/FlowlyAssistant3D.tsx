"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

type AssistantMode = "idle" | "walk" | "wave" | "talk" | "point" | "thinking" | "tour" | "sit";

type FlowlyAssistant3DProps = {
  modelUrl?: string;
  mode?: AssistantMode;
  facing?: "left" | "right";
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
  leftUpLeg?: THREE.Object3D;
  leftLeg?: THREE.Object3D;
  leftFoot?: THREE.Object3D;
  rightUpLeg?: THREE.Object3D;
  rightLeg?: THREE.Object3D;
  rightFoot?: THREE.Object3D;
  mouth?: THREE.Object3D;
};

function normalizeMode(mode: AssistantMode) {
  if (mode === "thinking") return "idle";
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
    hips: getObject(scene, "mixamorig:Hips", "mixamorigHips", "Hips"),
    spine: getObject(scene, "mixamorig:Spine", "mixamorigSpine", "Spine"),
    spine1: getObject(scene, "mixamorig:Spine1", "mixamorigSpine1", "Spine1"),
    spine2: getObject(scene, "mixamorig:Spine2", "mixamorigSpine2", "Spine2"),
    neck: getObject(scene, "mixamorig:Neck", "mixamorigNeck", "Neck"),
    head: getObject(scene, "mixamorig:Head", "mixamorigHead", "Head"),
    leftArm: getObject(scene, "mixamorig:LeftArm", "mixamorigLeftArm", "LeftArm"),
    leftForeArm: getObject(scene, "mixamorig:LeftForeArm", "mixamorigLeftForeArm", "LeftForeArm"),
    leftHand: getObject(scene, "mixamorig:LeftHand", "mixamorigLeftHand", "LeftHand"),
    rightArm: getObject(scene, "mixamorig:RightArm", "mixamorigRightArm", "RightArm"),
    rightForeArm: getObject(scene, "mixamorig:RightForeArm", "mixamorigRightForeArm", "RightForeArm"),
    rightHand: getObject(scene, "mixamorig:RightHand", "mixamorigRightHand", "RightHand"),
    leftUpLeg: getObject(scene, "mixamorig:LeftUpLeg", "mixamorigLeftUpLeg", "LeftUpLeg"),
    leftLeg: getObject(scene, "mixamorig:LeftLeg", "mixamorigLeftLeg", "LeftLeg"),
    leftFoot: getObject(scene, "mixamorig:LeftFoot", "mixamorigLeftFoot", "LeftFoot"),
    rightUpLeg: getObject(scene, "mixamorig:RightUpLeg", "mixamorigRightUpLeg", "RightUpLeg"),
    rightLeg: getObject(scene, "mixamorig:RightLeg", "mixamorigRightLeg", "RightLeg"),
    rightFoot: getObject(scene, "mixamorig:RightFoot", "mixamorigRightFoot", "RightFoot"),
    mouth: getObject(scene, "Fitness_Grandma_MouthAnimGeo"),
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

function applyOffset(basePose: Map<string, THREE.Quaternion>, object: THREE.Object3D | undefined, x = 0, y = 0, z = 0) {
  if (!object) return;
  const base = basePose.get(object.uuid);
  if (!base) return;
  tempEuler.set(x, y, z, "XYZ");
  tempQuaternion.setFromEuler(tempEuler);
  object.quaternion.copy(base).multiply(tempQuaternion);
}

const worldStart = new THREE.Vector3();
const worldEnd = new THREE.Vector3();
const currentDirection = new THREE.Vector3();
const desiredDirection = new THREE.Vector3();
const worldQuaternion = new THREE.Quaternion();
const parentWorldQuaternion = new THREE.Quaternion();
const parentWorldInverse = new THREE.Quaternion();
const targetWorldQuaternion = new THREE.Quaternion();
const targetLocalQuaternion = new THREE.Quaternion();
const alignQuaternion = new THREE.Quaternion();

function alignBoneToWorldDirection(
  bone: THREE.Object3D | undefined,
  child: THREE.Object3D | undefined,
  direction: [number, number, number],
  strength = 1,
) {
  if (!bone || !child) return;
  bone.updateWorldMatrix(true, false);
  child.updateWorldMatrix(true, false);
  bone.getWorldPosition(worldStart);
  child.getWorldPosition(worldEnd);
  currentDirection.subVectors(worldEnd, worldStart);
  if (currentDirection.lengthSq() < 0.000001) return;
  currentDirection.normalize();
  desiredDirection.set(direction[0], direction[1], direction[2]);
  if (desiredDirection.lengthSq() < 0.000001) return;
  desiredDirection.normalize();

  alignQuaternion.setFromUnitVectors(currentDirection, desiredDirection);
  bone.getWorldQuaternion(worldQuaternion);
  targetWorldQuaternion.copy(alignQuaternion).multiply(worldQuaternion);

  if (bone.parent) {
    bone.parent.getWorldQuaternion(parentWorldQuaternion);
    parentWorldInverse.copy(parentWorldQuaternion).invert();
    targetLocalQuaternion.copy(parentWorldInverse).multiply(targetWorldQuaternion);
  } else {
    targetLocalQuaternion.copy(targetWorldQuaternion);
  }

  if (strength >= 1) bone.quaternion.copy(targetLocalQuaternion);
  else bone.quaternion.slerp(targetLocalQuaternion, strength);
  bone.updateWorldMatrix(false, true);
}


function Model({
  modelUrl = "/avatars/flowly-grandma.glb",
  mode = "idle",
  facing = "left",
}: Required<Pick<FlowlyAssistant3DProps, "modelUrl" | "mode" | "facing">>) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelUrl) as unknown as { scene: THREE.Group };
  const scene = useMemo(() => clone(gltf.scene) as THREE.Group, [gltf.scene]);
  const rig = useMemo(() => getRig(scene), [scene]);
  const basePose = useMemo(() => rememberBasePose(rig), [rig]);
  const activeMode = normalizeMode(mode);

  useEffect(() => {
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.filter(Boolean).forEach((material) => {
          material.needsUpdate = true;
        });
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (!group.current) return;

    const t = state.clock.elapsedTime;
    const breathe = Math.sin(t * 2.1);
    const slow = Math.sin(t * 0.85);
    const fast = Math.sin(t * 8.0);
    const walkCycle = Math.sin(t * 7.2);
    const walkOpposite = Math.sin(t * 7.2 + Math.PI);
    const isWalking = activeMode === "walk";
    const isSpeaking = activeMode === "talk";
    const isWaving = activeMode === "wave";
    const isPointing = activeMode === "point";

    // Reset every frame to the GLB rest pose, then layer a safe procedural pose.
    // This avoids the broken FBX retargeting that made the character fall or keep its arms in T-pose.
    Object.values(rig).forEach((object) => {
      const base = object ? basePose.get(object.uuid) : undefined;
      if (object && base) object.quaternion.copy(base);
    });

    // Start from a very small procedural pose. The real arm correction happens below
    // with alignBoneToWorldDirection(), which is more robust than guessing Mixamo axes.
    let leftArmZ = 0;
    let rightArmZ = 0;
    let leftArmX = breathe * 0.01;
    let rightArmX = -breathe * 0.01;
    let leftArmY = 0;
    let rightArmY = 0;
    let leftForeArmZ = 0;
    let rightForeArmZ = 0;
    let leftHandZ = 0;
    let rightHandZ = 0;

    if (isWalking) {
      // Short, soft arm swing that follows the step cycle without becoming robotic.
      leftArmX += walkOpposite * 0.14;
      rightArmX += walkCycle * 0.14;
      leftArmY += walkOpposite * 0.028;
      rightArmY += walkCycle * 0.028;
      leftForeArmZ += walkOpposite * 0.035;
      rightForeArmZ += walkCycle * 0.035;
    }

    if (isSpeaking) {
      // Conversational motion comes mostly from head and torso; arms stay relaxed.
      leftArmX += Math.sin(t * 3.4) * 0.018;
      rightArmX += Math.sin(t * 3.1 + 0.8) * 0.018;
      leftForeArmZ += Math.sin(t * 4.8) * 0.018;
      rightForeArmZ += Math.sin(t * 4.5 + 0.6) * 0.018;
    }

    if (isWaving) {
      // One clear greeting: right arm up, relaxed left arm down.
      rightArmZ = -0.72;
      rightArmX = -0.38;
      rightArmY = 0.12;
      rightForeArmZ = -0.92 + Math.sin(t * 7.5) * 0.16;
      rightHandZ = Math.sin(t * 9.5) * 0.18;
    }

    if (isPointing) {
      rightArmZ = -0.2;
      rightArmX = -0.08;
      rightArmY = 0.08;
      rightForeArmZ = -0.18;
      leftArmZ = 0;
      leftForeArmZ = 0;
    }

    applyOffset(basePose, rig.leftArm, leftArmX, leftArmY, leftArmZ);
    applyOffset(basePose, rig.rightArm, rightArmX, rightArmY, rightArmZ);
    applyOffset(basePose, rig.leftForeArm, 0.05, 0, leftForeArmZ);
    applyOffset(basePose, rig.rightForeArm, 0.05, 0, rightForeArmZ);
    applyOffset(basePose, rig.leftHand, 0.02, 0, leftHandZ);
    applyOffset(basePose, rig.rightHand, 0.02, 0, rightHandZ);

    // Final arm solver: force the upper arms and forearms to point down/relaxed in model space.
    // This removes the persistent "arms stretched forward" problem caused by the GLB bind pose.
    if (isWaving) {
      alignBoneToWorldDirection(rig.leftArm, rig.leftForeArm, [-0.35, -0.92, 0.04], 0.92);
      alignBoneToWorldDirection(rig.leftForeArm, rig.leftHand, [-0.18, -0.96, 0.02], 0.9);
      alignBoneToWorldDirection(rig.rightArm, rig.rightForeArm, [0.25, 0.58, 0.18], 0.85);
      alignBoneToWorldDirection(rig.rightForeArm, rig.rightHand, [0.18, 0.55, 0.32 + Math.sin(t * 8.5) * 0.28], 0.85);
    } else if (isPointing) {
      alignBoneToWorldDirection(rig.leftArm, rig.leftForeArm, [-0.35, -0.92, 0.04], 0.92);
      alignBoneToWorldDirection(rig.leftForeArm, rig.leftHand, [-0.18, -0.96, 0.02], 0.9);
      alignBoneToWorldDirection(rig.rightArm, rig.rightForeArm, [0.62, -0.2, 0.76], 0.88);
      alignBoneToWorldDirection(rig.rightForeArm, rig.rightHand, [0.62, -0.1, 0.78], 0.88);
    } else {
      const swing = isWalking ? Math.sin(t * 7.2) * 0.14 : Math.sin(t * 1.4) * 0.025;
      alignBoneToWorldDirection(rig.leftArm, rig.leftForeArm, [-0.38, -0.92, 0.03 + swing], 0.94);
      alignBoneToWorldDirection(rig.rightArm, rig.rightForeArm, [0.38, -0.92, 0.03 - swing], 0.94);
      alignBoneToWorldDirection(rig.leftForeArm, rig.leftHand, [-0.1, -0.98, 0.02], 0.92);
      alignBoneToWorldDirection(rig.rightForeArm, rig.rightHand, [0.1, -0.98, 0.02], 0.92);
    }

    applyOffset(basePose, rig.spine, breathe * 0.018 + (isWalking ? Math.abs(walkCycle) * 0.025 : 0), 0, slow * 0.012);
    applyOffset(basePose, rig.spine1, breathe * 0.014, 0, slow * 0.01);
    applyOffset(basePose, rig.spine2, breathe * 0.012, 0, slow * 0.008);
    applyOffset(basePose, rig.neck, isSpeaking ? Math.sin(t * 5.5) * 0.03 : slow * 0.015, slow * 0.018, 0);
    applyOffset(basePose, rig.head, isSpeaking ? Math.sin(t * 8.0) * 0.035 : breathe * 0.012, slow * 0.025, 0);

    if (isWalking) {
      applyOffset(basePose, rig.leftUpLeg, walkCycle * 0.38, 0, 0.035);
      applyOffset(basePose, rig.rightUpLeg, walkOpposite * 0.38, 0, -0.035);
      applyOffset(basePose, rig.leftLeg, Math.max(0, -walkCycle) * 0.55, 0, 0);
      applyOffset(basePose, rig.rightLeg, Math.max(0, -walkOpposite) * 0.55, 0, 0);
      applyOffset(basePose, rig.leftFoot, Math.sin(t * 7.2 + 0.6) * 0.16, 0, 0);
      applyOffset(basePose, rig.rightFoot, Math.sin(t * 7.2 + Math.PI + 0.6) * 0.16, 0, 0);
    } else {
      applyOffset(basePose, rig.leftUpLeg, 0.04 + breathe * 0.012, 0, 0.025);
      applyOffset(basePose, rig.rightUpLeg, 0.04 - breathe * 0.012, 0, -0.025);
      applyOffset(basePose, rig.leftLeg, -0.035, 0, 0);
      applyOffset(basePose, rig.rightLeg, -0.035, 0, 0);
    }

    if (rig.mouth) {
      rig.mouth.scale.y = isSpeaking ? 1 + Math.abs(Math.sin(t * 12)) * 0.12 : 1;
    }

    const bodyBob = isWalking ? Math.abs(walkCycle) * 0.035 : breathe * 0.012;
    group.current.position.set(0, -1.34 + bodyBob, 0);
    group.current.rotation.set(0, facing === "right" ? 0.34 : -0.34, slow * 0.004);
    group.current.scale.setScalar(1.18);
  });

  return (
    <group ref={group} position={[0, -1.34, 0]} rotation={[0, facing === "right" ? 0.34 : -0.34, 0]} scale={1.18}>
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
  modelUrl = "/avatars/flowly-grandma.glb",
  mode = "idle",
  facing = "left",
  onClick,
}: FlowlyAssistant3DProps) {
  return (
    <button type="button" onClick={onClick} className="flowly-3d-stage" aria-label="Abrir asistente 3D de Flowly">
      <Canvas shadows dpr={[1, 1.8]} camera={{ position: [0, 1.08, 5.8], fov: 30 }} gl={{ alpha: true, antialias: true }} style={{ pointerEvents: "none" }}>
        <ambientLight intensity={1.35} />
        <directionalLight position={[2.4, 4, 3]} intensity={2.15} castShadow />
        <pointLight position={[-2.2, 2.8, 2]} intensity={1.2} color="#8b5cf6" />
        <pointLight position={[2.4, 1.2, 2.6]} intensity={1.0} color="#22d3ee" />
        <Suspense fallback={<ModelFallback />}>
          <Model modelUrl={modelUrl} mode={mode} facing={facing} />
          <Environment preset="city" />
        </Suspense>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, 0]} receiveShadow>
          <circleGeometry args={[1.05, 48]} />
          <meshStandardMaterial color="#020617" transparent opacity={0.18} />
        </mesh>
      </Canvas>
    </button>
  );
}

useGLTF.preload("/avatars/flowly-grandma.glb");
