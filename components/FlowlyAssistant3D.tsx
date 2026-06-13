"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

type AssistantMode = "idle" | "walk" | "wave" | "talk" | "point" | "thinking" | "tour";

type FlowlyAssistant3DProps = {
  modelUrl?: string;
  mode?: AssistantMode;
  facing?: "left" | "right";
  onClick?: () => void;
};

type RigBones = {
  hips?: THREE.Object3D;
  spine?: THREE.Object3D;
  chest?: THREE.Object3D;
  neck?: THREE.Object3D;
  head?: THREE.Object3D;
  leftShoulder?: THREE.Object3D;
  rightShoulder?: THREE.Object3D;
  leftArm?: THREE.Object3D;
  leftForeArm?: THREE.Object3D;
  leftHand?: THREE.Object3D;
  rightArm?: THREE.Object3D;
  rightForeArm?: THREE.Object3D;
  rightHand?: THREE.Object3D;
  leftUpLeg?: THREE.Object3D;
  leftLeg?: THREE.Object3D;
  leftFoot?: THREE.Object3D;
  leftToe?: THREE.Object3D;
  rightUpLeg?: THREE.Object3D;
  rightLeg?: THREE.Object3D;
  rightFoot?: THREE.Object3D;
  rightToe?: THREE.Object3D;
};

type BoneRestPose = Map<string, THREE.Euler>;

function normalizeMode(mode: AssistantMode): Exclude<AssistantMode, "thinking" | "tour"> {
  if (mode === "thinking") return "idle";
  if (mode === "tour") return "point";
  return mode;
}

function cleanBoneName(name: string) {
  return name.toLowerCase().replace(/mixamorig|_|\.|-/g, "");
}

function mapRigBones(root: THREE.Object3D): RigBones {
  const bones: RigBones = {};

  root.traverse((object) => {
    if (object.type !== "Bone") return;
    const name = cleanBoneName(object.name);

    if (!bones.hips && name.includes("hips")) bones.hips = object;
    if (!bones.spine && name === "spine") bones.spine = object;
    if (!bones.chest && (name.includes("spine1") || name.includes("spine2") || name.includes("chest"))) bones.chest = object;
    if (!bones.neck && name.includes("neck")) bones.neck = object;
    if (!bones.head && name.includes("head")) bones.head = object;

    if (!bones.leftShoulder && name.includes("leftshoulder")) bones.leftShoulder = object;
    if (!bones.rightShoulder && name.includes("rightshoulder")) bones.rightShoulder = object;
    if (!bones.leftArm && name.includes("leftarm") && !name.includes("fore")) bones.leftArm = object;
    if (!bones.leftForeArm && name.includes("leftforearm")) bones.leftForeArm = object;
    if (!bones.leftHand && name.includes("lefthand")) bones.leftHand = object;
    if (!bones.rightArm && name.includes("rightarm") && !name.includes("fore")) bones.rightArm = object;
    if (!bones.rightForeArm && name.includes("rightforearm")) bones.rightForeArm = object;
    if (!bones.rightHand && name.includes("righthand")) bones.rightHand = object;

    if (!bones.leftUpLeg && name.includes("leftupleg")) bones.leftUpLeg = object;
    if (!bones.leftLeg && name.includes("leftleg") && !name.includes("upleg")) bones.leftLeg = object;
    if (!bones.leftFoot && name.includes("leftfoot")) bones.leftFoot = object;
    if (!bones.leftToe && name.includes("lefttoe")) bones.leftToe = object;
    if (!bones.rightUpLeg && name.includes("rightupleg")) bones.rightUpLeg = object;
    if (!bones.rightLeg && name.includes("rightleg") && !name.includes("upleg")) bones.rightLeg = object;
    if (!bones.rightFoot && name.includes("rightfoot")) bones.rightFoot = object;
    if (!bones.rightToe && name.includes("righttoe")) bones.rightToe = object;
  });

  return bones;
}

function captureRestPose(root: THREE.Object3D): BoneRestPose {
  const restPose: BoneRestPose = new Map();
  root.traverse((object) => {
    if (object.type === "Bone") restPose.set(object.uuid, object.rotation.clone());
  });
  return restPose;
}

function resetRestPose(root: THREE.Object3D, restPose: BoneRestPose) {
  root.traverse((object) => {
    if (object.type !== "Bone") return;
    const rest = restPose.get(object.uuid);
    if (rest) object.rotation.copy(rest);
  });
}

function applyEuler(object: THREE.Object3D | undefined, x = 0, y = 0, z = 0) {
  if (!object) return;
  object.rotation.x += x;
  object.rotation.y += y;
  object.rotation.z += z;
}

function Model({ modelUrl = "/avatars/flowly-grandma.glb", mode = "idle", facing = "left" }: Required<Pick<FlowlyAssistant3DProps, "modelUrl" | "mode" | "facing">>) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelUrl) as unknown as { scene: THREE.Group };
  const scene = useMemo(() => clone(gltf.scene) as THREE.Group, [gltf.scene]);
  const rig = useMemo(() => mapRigBones(scene), [scene]);
  const restPose = useMemo(() => captureRestPose(scene), [scene]);
  const activeMode = normalizeMode(mode);

  useEffect(() => {
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => {
            material.transparent = false;
            material.needsUpdate = true;
          });
        } else if (mesh.material) {
          mesh.material.transparent = false;
          mesh.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (!group.current) return;

    const t = state.clock.elapsedTime;
    const walk = activeMode === "walk";
    const talk = activeMode === "talk";
    const wave = activeMode === "wave";
    const point = activeMode === "point";
    const speed = walk ? 7.1 : 2.2;
    const step = Math.sin(t * speed);
    const stepFast = Math.sin(t * speed * 2);
    const oppositeStep = Math.sin(t * speed + Math.PI);
    const breathe = Math.sin(t * 2.05);
    const idleShift = Math.sin(t * 0.72);
    const aliveLook = Math.sin(t * 1.25);

    // Stable WebGL root. The character stays upright; all life is in the rig, not in a square moving around.
    group.current.position.set(0, -1.29 + breathe * 0.012 + (walk ? Math.abs(stepFast) * 0.03 : 0), 0);
    group.current.rotation.set(0, facing === "right" ? -0.38 : 0.38, 0);
    group.current.scale.setScalar(1.16);

    resetRestPose(scene, restPose);

    // Natural neutral pose: arms down, shoulders relaxed, slight body asymmetry.
    applyEuler(rig.leftShoulder, 0.02, 0, 0.04);
    applyEuler(rig.rightShoulder, -0.01, 0, -0.04);
    applyEuler(rig.leftArm, 0.13, 0.04, 1.2);
    applyEuler(rig.rightArm, 0.13, -0.04, -1.2);
    applyEuler(rig.leftForeArm, 0.1, 0, 0.22);
    applyEuler(rig.rightForeArm, 0.1, 0, -0.22);
    applyEuler(rig.leftHand, 0.04, 0.03, 0.05);
    applyEuler(rig.rightHand, 0.04, -0.03, -0.05);

    // Always alive: breathing, subtle weight shift, head scans, small hand motion.
    applyEuler(rig.hips, 0, idleShift * 0.014, idleShift * 0.025);
    applyEuler(rig.spine, breathe * 0.026, 0, breathe * 0.012 + idleShift * 0.018);
    applyEuler(rig.chest, breathe * 0.032, 0, -breathe * 0.012 - idleShift * 0.012);
    applyEuler(rig.neck, aliveLook * 0.018, Math.sin(t * 1.4) * 0.04, 0);
    applyEuler(rig.head, Math.sin(t * 1.08) * 0.025, Math.sin(t * 1.67) * 0.052, Math.sin(t * 0.9) * 0.014);
    applyEuler(rig.leftHand, Math.sin(t * 1.6) * 0.018, 0, Math.cos(t * 1.35) * 0.018);
    applyEuler(rig.rightHand, Math.cos(t * 1.45) * 0.018, 0, -Math.sin(t * 1.55) * 0.018);

    if (walk) {
      // Walk cycle with real readable gait: hips, shoulders, arms, knees, ankles and head all move together.
      const stride = 0.52;
      const kneeLiftL = Math.max(0, -step) * 0.62;
      const kneeLiftR = Math.max(0, -oppositeStep) * 0.62;
      const footRollL = Math.sin(t * speed - 0.7) * 0.18;
      const footRollR = Math.sin(t * speed + Math.PI - 0.7) * 0.18;

      applyEuler(rig.hips, Math.abs(stepFast) * 0.035, 0, step * 0.055);
      applyEuler(rig.spine, Math.abs(stepFast) * 0.025, 0, -step * 0.045);
      applyEuler(rig.chest, 0, 0, step * 0.035);

      applyEuler(rig.leftUpLeg, step * stride, 0.02, -0.02);
      applyEuler(rig.rightUpLeg, oppositeStep * stride, -0.02, 0.02);
      applyEuler(rig.leftLeg, kneeLiftL, 0, 0);
      applyEuler(rig.rightLeg, kneeLiftR, 0, 0);
      applyEuler(rig.leftFoot, footRollL, 0, 0);
      applyEuler(rig.rightFoot, footRollR, 0, 0);
      applyEuler(rig.leftToe, Math.max(0, step) * 0.18, 0, 0);
      applyEuler(rig.rightToe, Math.max(0, oppositeStep) * 0.18, 0, 0);

      applyEuler(rig.leftArm, -step * 0.35 - 0.04, 0, -0.02);
      applyEuler(rig.rightArm, -oppositeStep * 0.35 - 0.04, 0, 0.02);
      applyEuler(rig.leftForeArm, Math.max(0, step) * 0.18, 0, 0.05);
      applyEuler(rig.rightForeArm, Math.max(0, oppositeStep) * 0.18, 0, -0.05);
      applyEuler(rig.neck, Math.abs(stepFast) * -0.025, 0, -step * 0.022);
      applyEuler(rig.head, Math.abs(stepFast) * -0.02, 0, step * 0.018);
    }

    if (wave) {
      const waveMotion = Math.sin(t * 7.6);
      applyEuler(rig.rightShoulder, -0.16, 0.18, -0.18);
      applyEuler(rig.rightArm, -1.12, 0.2, 0.86);
      applyEuler(rig.rightForeArm, -0.92 + waveMotion * 0.28, 0.22, -0.38 + waveMotion * 0.22);
      applyEuler(rig.rightHand, 0.04, waveMotion * 0.4, waveMotion * 0.18);
      applyEuler(rig.head, 0.015, -0.08 + waveMotion * 0.02, 0.02);
      applyEuler(rig.spine, 0, -0.04, -0.02);
    }

    if (talk) {
      const talkMotion = Math.sin(t * 8.4);
      const explain = Math.sin(t * 3.2);
      applyEuler(rig.rightArm, -0.36 + talkMotion * 0.09, 0.08, 0.18 + explain * 0.04);
      applyEuler(rig.rightForeArm, -0.28 + talkMotion * 0.12, 0, -0.12 + explain * 0.08);
      applyEuler(rig.leftArm, -0.22 - talkMotion * 0.07, -0.05, -0.12 - explain * 0.03);
      applyEuler(rig.leftForeArm, -0.18 - talkMotion * 0.09, 0, 0.1 - explain * 0.06);
      applyEuler(rig.head, talkMotion * 0.05, Math.sin(t * 2.75) * 0.052, Math.sin(t * 4.2) * 0.012);
      applyEuler(rig.neck, talkMotion * 0.032, 0, 0);
      applyEuler(rig.chest, talkMotion * 0.015, 0, explain * 0.02);
    }

    if (point) {
      applyEuler(rig.rightShoulder, -0.05, -0.1, 0.1);
      applyEuler(rig.rightArm, -0.78, -0.22, 0.5);
      applyEuler(rig.rightForeArm, -0.22, -0.08, -0.24);
      applyEuler(rig.rightHand, 0.05, 0.16, 0);
      applyEuler(rig.head, 0.02, -0.18, 0);
      applyEuler(rig.spine, 0, -0.1, 0);
    }
  });

  return (
    <group ref={group} position={[0, -1.29, 0]} rotation={[0, facing === "right" ? -0.38 : 0.38, 0]} scale={1.16}>
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

export default function FlowlyAssistant3D({ modelUrl = "/avatars/flowly-grandma.glb", mode = "idle", facing = "left", onClick }: FlowlyAssistant3DProps) {
  return (
    <button type="button" onClick={onClick} className="flowly-3d-stage" aria-label="Abrir asistente 3D de Flowly">
      <Canvas shadows dpr={[1, 1.8]} camera={{ position: [0, 1.08, 5.8], fov: 30 }} gl={{ alpha: true, antialias: true }} style={{ pointerEvents: "none" }}>
        <ambientLight intensity={1.45} />
        <directionalLight position={[2.4, 4, 3]} intensity={2.35} castShadow />
        <pointLight position={[-2.2, 2.8, 2]} intensity={1.35} color="#8b5cf6" />
        <pointLight position={[2.4, 1.2, 2.6]} intensity={1.1} color="#22d3ee" />
        <Suspense fallback={<ModelFallback />}>
          <Model modelUrl={modelUrl} mode={mode} facing={facing} />
          <Environment preset="city" />
        </Suspense>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, 0]} receiveShadow>
          <circleGeometry args={[1.05, 48]} />
          <meshStandardMaterial color="#020617" transparent opacity={0.22} />
        </mesh>
      </Canvas>
    </button>
  );
}

useGLTF.preload("/avatars/flowly-grandma.glb");
