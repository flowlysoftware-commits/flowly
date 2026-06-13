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

    // Neutral pose: keep shoulders relaxed and elbows close to the body.
    // IMPORTANT: the Mixamo grandma GLB uses opposite Z signs for each shoulder.
    // Negative Z lowers the left arm; positive Z lowers the right arm.
    // Previous patches used the inverse signs and pushed both arms upward/forward.
    // The original Mixamo rest pose is very close to a T-pose; these offsets intentionally
    // pull the arms down and slightly back so she does not look like she is holding them forward.
    // Mixamo imports the grandma in a broad T-pose. Keep the shoulders clearly down by default.
    // The previous values were too close to the rest pose and visually looked like both arms
    // were pushed forward. These offsets intentionally make the default silhouette relaxed.
    const leftArmDown = -1.72;
    const rightArmDown = 1.72;
    const leftForeArmRelax = -0.18;
    const rightForeArmRelax = 0.18;

    let leftArmZ = leftArmDown;
    let rightArmZ = rightArmDown;
    let leftArmX = 0.08 + breathe * 0.014;
    let rightArmX = 0.08 - breathe * 0.014;
    let leftArmY = -0.18;
    let rightArmY = 0.18;
    let leftForeArmZ = leftForeArmRelax;
    let rightForeArmZ = rightForeArmRelax;
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
      // Small conversational gestures, not constant big waving.
      leftArmZ = -1.56 + Math.sin(t * 3.1) * 0.045;
      rightArmZ = 1.56 + Math.sin(t * 2.7) * 0.045;
      leftArmX += 0.08 + Math.sin(t * 4.3) * 0.03;
      rightArmX += 0.08 + Math.sin(t * 4.0 + 0.8) * 0.03;
      leftForeArmZ -= 0.1 + Math.sin(t * 5.3) * 0.045;
      rightForeArmZ += 0.1 + Math.sin(t * 5.1) * 0.045;
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
      rightArmZ = 0.82;
      rightArmX = -0.1;
      rightArmY = 0.1;
      rightForeArmZ = 0.42;
      leftArmZ = leftArmDown;
      leftForeArmZ = leftForeArmRelax;
    }

    applyOffset(basePose, rig.leftArm, leftArmX, leftArmY, leftArmZ);
    applyOffset(basePose, rig.rightArm, rightArmX, rightArmY, rightArmZ);
    applyOffset(basePose, rig.leftForeArm, 0.05, 0, leftForeArmZ);
    applyOffset(basePose, rig.rightForeArm, 0.05, 0, rightForeArmZ);
    applyOffset(basePose, rig.leftHand, 0.02, 0, leftHandZ);
    applyOffset(basePose, rig.rightHand, 0.02, 0, rightHandZ);

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
