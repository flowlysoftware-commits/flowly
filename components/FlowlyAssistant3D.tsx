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

const targetVec = new THREE.Vector3();
const targetVec2 = new THREE.Vector3();
const targetVec3 = new THREE.Vector3();
const parentWorldQuat = new THREE.Quaternion();
const parentWorldQuatInv = new THREE.Quaternion();
const desiredLocalDir = new THREE.Vector3();
const restAxisLocal = new THREE.Vector3();
const restAxisAfterBase = new THREE.Vector3();
const deltaQuat = new THREE.Quaternion();
const finalQuat = new THREE.Quaternion();
const baseWorldA = new THREE.Vector3();
const baseWorldB = new THREE.Vector3();

function getRestSideDirection(bone: THREE.Object3D | undefined, child: THREE.Object3D | undefined) {
  if (!bone || !child) return new THREE.Vector3(1, 0, 0);
  bone.getWorldPosition(baseWorldA);
  child.getWorldPosition(baseWorldB);
  const side = new THREE.Vector3().copy(baseWorldB).sub(baseWorldA).setY(0);
  if (side.lengthSq() < 0.0001) side.set(1, 0, 0);
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

    // Arms: use a bind-pose direction solver instead of hard-coded local axes.
    // This fixes the forward/backward arm problem because it does not assume a Mixamo X/Y/Z axis.
    scene.updateMatrixWorld(true);
    const down = targetVec.set(0, -1, 0);
    const up = targetVec2.set(0, 1, 0);
    const forward = targetVec3.set(0, 0, 1);
    const leftSide = getRestSideDirection(rig.leftArm, rig.leftForeArm);
    const rightSide = getRestSideDirection(rig.rightArm, rig.rightForeArm);

    const leftUpperTarget = leftSide.clone().multiplyScalar(0.18).add(down.clone().multiplyScalar(0.98)).normalize();
    const rightUpperTarget = rightSide.clone().multiplyScalar(0.18).add(down.clone().multiplyScalar(0.98)).normalize();
    const leftForeTarget = leftSide.clone().multiplyScalar(0.08).add(down.clone().multiplyScalar(1)).normalize();
    const rightForeTarget = rightSide.clone().multiplyScalar(0.08).add(down.clone().multiplyScalar(1)).normalize();

    if (isWalking) {
      leftUpperTarget.add(forward.clone().multiplyScalar(walkOpposite * 0.18)).normalize();
      rightUpperTarget.add(forward.clone().multiplyScalar(walkCycle * 0.18)).normalize();
      leftForeTarget.add(forward.clone().multiplyScalar(walkOpposite * 0.08)).normalize();
      rightForeTarget.add(forward.clone().multiplyScalar(walkCycle * 0.08)).normalize();
    }

    if (isSpeaking) {
      leftUpperTarget.add(forward.clone().multiplyScalar(0.08 + Math.sin(t * 3.1) * 0.05)).normalize();
      rightUpperTarget.add(forward.clone().multiplyScalar(0.08 + Math.sin(t * 3.4 + 0.6) * 0.05)).normalize();
    }

    if (isWaving) {
      rightUpperTarget.copy(rightSide).multiplyScalar(0.2).add(up.clone().multiplyScalar(0.95)).add(forward.clone().multiplyScalar(0.05)).normalize();
      rightForeTarget.copy(rightSide).multiplyScalar(0.35 + Math.sin(t * 7.5) * 0.12).add(up.clone().multiplyScalar(0.65)).normalize();
    }

    if (isPointing) {
      rightUpperTarget.copy(rightSide).multiplyScalar(0.7).add(forward.clone().multiplyScalar(0.45)).add(down.clone().multiplyScalar(0.18)).normalize();
      rightForeTarget.copy(rightSide).multiplyScalar(0.9).add(forward.clone().multiplyScalar(0.35)).normalize();
    }

    aimBoneToWorldDirection(basePose, rig.leftArm, rig.leftForeArm, leftUpperTarget, 0.94);
    aimBoneToWorldDirection(basePose, rig.rightArm, rig.rightForeArm, rightUpperTarget, 0.94);
    scene.updateMatrixWorld(true);
    aimBoneToWorldDirection(basePose, rig.leftForeArm, rig.leftHand, leftForeTarget, 0.86);
    aimBoneToWorldDirection(basePose,