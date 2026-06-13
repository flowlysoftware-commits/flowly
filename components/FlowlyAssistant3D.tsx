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


function soften(value: number, amount = 1) {
  return value * amount;
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
    const breathe = Math.sin(t * 2.0);
    const slow = Math.sin(t * 0.9);
    const step = Math.sin(t * 6.2);
    const opposite = Math.sin(t * 6.2 + Math.PI);
    const isWalking = activeMode === "walk";
    const isSpeaking = activeMode === "talk";
    const isWaving = activeMode === "wave";
    const isPointing = activeMode === "point";

    // Always return to the original Mixamo rest pose first.
    // We only add small offsets. No forced world-direction solver: that was breaking shoulders.
    Object.values(rig).forEach((object) => {
      const base = object ? basePose.get(object.uuid) : undefined;
      if (object && base) object.quaternion.copy(base);
    });

    // Relaxed arms. The model comes from Mixamo with arms too far forward/T-pose.
    // These offsets keep shoulders connected and bring arms closer to the body.
    const leftArmRestZ = soften(1.05, 1);
    const rightArmRestZ = soften(-1.05, 1);
    const leftArmRestX = 0.06 + breathe * 0.012;
    const rightArmRestX = 0.06 - breathe * 0.012;
    const leftForeRestZ = 0.24;
    const rightForeRestZ = -0.24;

    let leftArmX = leftArmRestX;
    let rightArmX = rightArmRestX;
    let leftArmY = 0.02;
    let rightArmY = -0.02;
    let leftArmZ = leftArmRestZ;
    let rightArmZ = rightArmRestZ;
    let leftForeArmX = 0.04;
    let rightForeArmX = 0.04;
    let leftForeArmZ = leftForeRestZ;
    let rightForeArmZ = rightForeRestZ;
    let leftHandZ = 0.03;
    let rightHandZ = -0.03;

    if (isWalking) {
      // Gentle counter swing. It should feel like she walks, not like she slides.
      leftArmX += opposite * 0.18;
      rightArmX += step * 0.18;
      leftArmZ += opposite * 0.08;
      rightArmZ += step * 0.08;
      leftForeArmZ += opposite * 0.06;
      rightForeArmZ += step * 0.06;
    }

    if (isSpeaking) {
      // Conversational gestures stay subtle so arms do not float in front of the body.
      leftArmX += Math.sin(t * 3.1) * 0.035;
      rightArmX += Math.sin(t * 3.4 + 0.8) * 0.035;
      leftArmZ += Math.sin(t * 2.2) * 0.035;
      rightArmZ += Math.sin(t * 2.4 + 0.6) * 0.035;
      leftForeArmZ += Math.sin(t * 4.3) * 0.045;
      rightForeArmZ += Math.sin(t * 4.1 + 0.7) * 0.045;
    }

    if (isWaving) {
      // Right hand greeting; left arm remains relaxed.
      rightArmX = -0.35;
      rightArmY = -0.18;
      rightArmZ = -0.45;
      rightForeArmX = -0.18;
      rightForeArmZ = -0.82 + Math.sin(t * 8.0) * 0.18;
      rightHandZ = Math.sin(t * 9.6) * 0.16;
      leftArmX = leftArmRestX;
      leftArmZ = leftArmRestZ;
      leftForeArmZ = leftForeRestZ;
    }

    if (isPointing) {
      // Soft pointing, not a rigid zombie arm.
      rightArmX = -0.08;
      rightArmY = -0.05;
      rightArmZ = -0.72;
      rightForeArmX = 0.02;
      rightForeArmZ = -0.42;
      leftArmX = leftArmRestX;
      leftArmZ = leftArmRestZ;
      leftForeArmZ = leftForeRestZ;
    }

    applyOffset(basePose, rig.leftArm, leftArmX, leftArmY, leftArmZ);
    applyOffset(basePose, rig.rightArm, rightArmX, rightArmY, rightArmZ);
    applyOffset(basePose, rig.leftForeArm, leftForeArmX, 0, leftForeArmZ);
    applyOffset(basePose, rig.rightForeArm, rightForeArmX, 0, rightForeArmZ);
    applyOffset(basePose, rig.leftHand, 0.015, 0, leftHandZ);
    applyOffset(basePose, rig.rightHand, 0.015, 0, rightHandZ);

    applyOffset(basePose, rig.spine, breathe * 0.018 + (isWalking ? Math.abs(step) * 0.018 : 0), 0, slow * 0.012);
    applyOffset(basePose, rig.spine1, breathe * 0.012, 0, slow * 0.008);
    applyOffset(basePose, rig.spine2, breathe * 0.01, 0, slow * 0.006);
    applyOffset(basePose, rig.neck, isSpeaking ? Math.sin(t * 4.8) * 0.026 : slow * 0.012, slow * 0.018, 0);
    applyOffset(basePose, rig.head, isSpeaking ? Math.sin(t * 7.0) * 0.028 : breathe * 0.01, slow * 0.024, 0);

    if (isWalking) {
      applyOffset(basePose, rig.leftUpLeg, step * 0.32, 0, 0.018);
      applyOffset(basePose, rig.rightUpLeg, opposite * 0.32, 0, -0.018);
      applyOffset(basePose, rig.leftLeg, Math.max(0, -step) * 0.42, 0, 0);
      applyOffset(basePose, rig.rightLeg, Math.max(0, -opposite) * 0.42, 0, 0);
      applyOffset(basePose, rig.leftFoot, Math.sin(t * 6.2 + 0.5) * 0.10, 0, 0);
      applyOffset(basePose, rig.rightFoot, Math.sin(t * 6.2 + Math.PI + 0.5) * 0.10, 0, 0);
    } else {
      applyOffset(basePose, rig.leftUpLeg, 0.025 + breathe * 0.006, 0, 0.014);
      applyOffset(basePose, rig.rightUpLeg, 0.025 - breathe * 0.006, 0, -0.014);
      applyOffset(basePose, rig.leftLeg, -0.02, 0, 0);
      applyOffset(basePose, rig.rightLeg, -0.02, 0, 0);
    }

    if (rig.mouth) {
      rig.mouth.scale.y = isSpeaking ? 1 + Math.abs(Math.sin(t * 12)) * 0.10 : 1;
    }

    const bodyBob = isWalking ? Math.abs(step) * 0.028 : breathe * 0.01;
    group.current.position.set(0, -1.34 + bodyBob, 0);
    group.current.rotation.set(0, facing === "right" ? -0.58 : 0.58, slow * 0.003);
    group.current.scale.setScalar(1.16);
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
