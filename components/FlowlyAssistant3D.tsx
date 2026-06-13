"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

type AssistantMode = "idle" | "walk" | "wave" | "talk" | "point" | "thinking" | "tour";

type FlowlyAssistant3DProps = {
  modelUrl?: string;
  mode?: AssistantMode;
  facing?: "left" | "right";
  onClick?: () => void;
};

function findClipName(clips: THREE.AnimationClip[], mode: AssistantMode) {
  const candidates: Record<AssistantMode, string[]> = {
    idle: ["idle", "breathing", "stand", "rest"],
    walk: ["walk", "walking", "locomotion"],
    wave: ["wave", "waving", "hello", "greeting"],
    talk: ["talk", "talking", "speech", "speaking"],
    point: ["point", "pointing", "gesture"],
    thinking: ["thinking", "idle", "stand"],
    tour: ["point", "wave", "idle"],
  };

  const names = candidates[mode];
  return clips.find((clip) => names.some((name) => clip.name.toLowerCase().includes(name)))?.name || clips[0]?.name;
}

function Model({ modelUrl = "/avatars/flowly-grandma.glb", mode = "idle", facing = "left" }: Required<Pick<FlowlyAssistant3DProps, "modelUrl" | "mode" | "facing">>) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelUrl) as unknown as { scene: THREE.Group; animations: THREE.AnimationClip[] };
  const scene = useMemo(() => clone(gltf.scene) as THREE.Group, [gltf.scene]);
  const { actions } = useAnimations(gltf.animations, group);
  const hasClips = gltf.animations.length > 0;
  const activeMode = mode === "thinking" ? "idle" : mode === "tour" ? "point" : mode;

  useEffect(() => {
    if (!hasClips) return;
    const clipName = findClipName(gltf.animations, activeMode);
    Object.values(actions).forEach((action) => action?.fadeOut(0.18));
    const next = clipName ? actions[clipName] : null;
    next?.reset().fadeIn(0.2).play();
    return () => {
      next?.fadeOut(0.18);
    };
  }, [actions, activeMode, gltf.animations, hasClips]);

  useEffect(() => {
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
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
    const walk = mode === "walk";
    const talk = mode === "talk" || mode === "tour";
    const wave = mode === "wave";
    const point = mode === "point";

    group.current.position.y = -1.05 + Math.sin(t * (walk ? 8 : 2.2)) * (walk ? 0.055 : 0.025);
    group.current.rotation.y = (facing === "right" ? -0.42 : 0.42) + Math.sin(t * 1.3) * 0.035;
    group.current.rotation.z = Math.sin(t * (walk ? 7.5 : 1.8)) * (walk ? 0.045 : 0.014);
    group.current.rotation.x = talk ? Math.sin(t * 6.5) * 0.028 : 0;

    if (!hasClips) {
      const bones: THREE.Object3D[] = [];
      scene.traverse((object) => {
        if (object.type === "Bone") bones.push(object);
      });
      for (const bone of bones) {
        const name = bone.name.toLowerCase();
        if (walk && name.includes("left") && (name.includes("leg") || name.includes("upleg") || name.includes("foot"))) bone.rotation.x = Math.sin(t * 7.2) * 0.22;
        if (walk && name.includes("right") && (name.includes("leg") || name.includes("upleg") || name.includes("foot"))) bone.rotation.x = -Math.sin(t * 7.2) * 0.22;
        if (walk && name.includes("left") && name.includes("arm")) bone.rotation.x = -Math.sin(t * 7.2) * 0.18;
        if (walk && name.includes("right") && name.includes("arm")) bone.rotation.x = Math.sin(t * 7.2) * 0.18;
        if ((wave || talk) && name.includes("right") && name.includes("arm")) bone.rotation.z = -0.55 + Math.sin(t * 5.8) * 0.28;
        if (point && name.includes("right") && name.includes("arm")) bone.rotation.z = -0.85;
        if ((talk || wave) && (name.includes("head") || name.includes("neck"))) bone.rotation.y = Math.sin(t * 3.6) * 0.08;
      }
    }
  });

  return (
    <group ref={group} scale={1.82} position={[0, -1.05, 0]}>
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
      <Canvas shadows dpr={[1, 1.8]} camera={{ position: [0, 1.1, 4.2], fov: 34 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={1.45} />
        <directionalLight position={[2.4, 4, 3]} intensity={2.2} castShadow />
        <pointLight position={[-2.2, 2.8, 2]} intensity={1.4} color="#8b5cf6" />
        <pointLight position={[2.4, 1.2, 2.6]} intensity={1.1} color="#22d3ee" />
        <Suspense fallback={<ModelFallback />}>
          <Model modelUrl={modelUrl} mode={mode} facing={facing} />
          <Environment preset="city" />
        </Suspense>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.18, 0]} receiveShadow>
          <circleGeometry args={[1.18, 48]} />
          <meshStandardMaterial color="#020617" transparent opacity={0.26} />
        </mesh>
      </Canvas>
    </button>
  );
}

useGLTF.preload("/avatars/flowly-grandma.glb");
useGLTF.preload("/flowly-grandma.glb");
