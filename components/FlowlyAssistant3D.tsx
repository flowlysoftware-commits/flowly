"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useAnimations, useFBX, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

type AssistantMode = "idle" | "walk" | "wave" | "talk" | "point" | "thinking" | "tour";

type FlowlyAssistant3DProps = {
  modelUrl?: string;
  mode?: AssistantMode;
  facing?: "left" | "right";
  onClick?: () => void;
};

const ANIMATION_PATHS = {
  idle: "/avatars/Idle.fbx",
  walk: "/avatars/Walking.fbx",
  wave: "/avatars/Waving.fbx",
  talk: "/avatars/Talking.fbx",
  point: "/avatars/Pointing.fbx",
} as const satisfies Record<Exclude<AssistantMode, "thinking" | "tour">, string>;

function normalizeMode(mode: AssistantMode): Exclude<AssistantMode, "thinking" | "tour"> {
  if (mode === "thinking") return "idle";
  if (mode === "tour") return "point";
  return mode;
}

function extractClip(fbx: THREE.Group, name: Exclude<AssistantMode, "thinking" | "tour">) {
  const source = fbx.animations?.[0];
  if (!source) return null;
  const clip = source.clone();
  clip.name = name;
  return clip;
}

function Model({ modelUrl = "/avatars/flowly-grandma.glb", mode = "idle", facing = "left" }: Required<Pick<FlowlyAssistant3DProps, "modelUrl" | "mode" | "facing">>) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelUrl) as unknown as { scene: THREE.Group; animations: THREE.AnimationClip[] };
  const idleFbx = useFBX(ANIMATION_PATHS.idle) as THREE.Group;
  const walkFbx = useFBX(ANIMATION_PATHS.walk) as THREE.Group;
  const waveFbx = useFBX(ANIMATION_PATHS.wave) as THREE.Group;
  const talkFbx = useFBX(ANIMATION_PATHS.talk) as THREE.Group;
  const pointFbx = useFBX(ANIMATION_PATHS.point) as THREE.Group;

  const scene = useMemo(() => clone(gltf.scene) as THREE.Group, [gltf.scene]);
  const activeMode = normalizeMode(mode);

  const fbxClips = useMemo(() => {
    return [
      extractClip(idleFbx, "idle"),
      extractClip(walkFbx, "walk"),
      extractClip(waveFbx, "wave"),
      extractClip(talkFbx, "talk"),
      extractClip(pointFbx, "point"),
    ].filter((clip): clip is THREE.AnimationClip => Boolean(clip));
  }, [idleFbx, walkFbx, waveFbx, talkFbx, pointFbx]);

  const animationClips = useMemo(() => {
    // Prefer real Mixamo FBX clips. If the exported GLB already contains animations,
    // keep them as fallback only after the normalized FBX clips.
    const embedded = (gltf.animations || []).map((clip) => clip.clone());
    return [...fbxClips, ...embedded];
  }, [fbxClips, gltf.animations]);

  const { actions, mixer } = useAnimations(animationClips, group);
  const hasClips = animationClips.length > 0;

  useEffect(() => {
    if (!hasClips) return undefined;

    const exact = actions[activeMode];
    const fallback = actions.idle || Object.values(actions).find(Boolean);
    const next = exact || fallback;

    Object.values(actions).forEach((action) => {
      action?.fadeOut(0.18);
    });

    if (!next) return undefined;

    next.reset();
    next.setEffectiveTimeScale(activeMode === "walk" ? 1.08 : 1);
    next.setEffectiveWeight(1);
    next.fadeIn(0.2).play();

    return () => {
      next.fadeOut(0.18);
    };
  }, [actions, activeMode, hasClips]);

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

  useFrame((state, delta) => {
    mixer?.update(delta);
    if (!group.current) return;

    const t = state.clock.elapsedTime;
    const walk = activeMode === "walk";
    const talk = activeMode === "talk";

    // Only move the full character subtly. Real arm/leg/body motion now comes from Mixamo FBX clips.
    group.current.position.y = -1.22 + Math.sin(t * (walk ? 5.5 : 2.1)) * (walk ? 0.026 : 0.012);
    group.current.rotation.y = (facing === "right" ? -0.3 : 0.3) + Math.sin(t * 0.9) * 0.018;
    group.current.rotation.z = Math.sin(t * (walk ? 4.8 : 1.6)) * (walk ? 0.018 : 0.008);
    group.current.rotation.x = talk ? Math.sin(t * 5.2) * 0.016 : 0;
  });

  return (
    <group ref={group} scale={1.18} position={[0, -1.22, 0]}>
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
      <Canvas shadows dpr={[1, 1.8]} camera={{ position: [0, 1.15, 5.7], fov: 31 }} gl={{ alpha: true, antialias: true }} style={{ pointerEvents: "none" }}>
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
useFBX.preload(ANIMATION_PATHS.idle);
useFBX.preload(ANIMATION_PATHS.walk);
useFBX.preload(ANIMATION_PATHS.wave);
useFBX.preload(ANIMATION_PATHS.talk);
useFBX.preload(ANIMATION_PATHS.point);
