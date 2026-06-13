"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

type AssistantMode = "idle" | "walk" | "wave" | "talk" | "point" | "thinking" | "tour" | "sit";

type FlowlyAssistant3DProps = {
  modelUrl?: string;
  mode?: AssistantMode;
  facing?: "left" | "right";
  onClick?: () => void;
};

type LoadedAnimation = {
  key: Exclude<AssistantMode, "thinking" | "tour">;
  object: THREE.Group;
};

const ANIMATION_FILES: LoadedAnimation["key"][] = ["idle", "walk", "wave", "talk", "point", "sit"];
const ANIMATION_URLS: Record<LoadedAnimation["key"], string> = {
  idle: "/avatars/Idle.fbx",
  walk: "/avatars/Walking.fbx",
  wave: "/avatars/Waving.fbx",
  talk: "/avatars/Talking.fbx",
  point: "/avatars/Pointing.fbx",
  sit: "/avatars/Sitting Talking.fbx",
};

function normalizeMode(mode: AssistantMode): LoadedAnimation["key"] {
  if (mode === "thinking") return "idle";
  if (mode === "tour") return "point";
  return mode;
}

function sanitizeClip(clip: THREE.AnimationClip, name: string) {
  const tracks = clip.tracks.filter((track) => {
    const trackName = track.name.toLowerCase();

    // Keep the character anchored in the WebGL stage. Position tracks from Mixamo move the hips/root
    // through the scene and make the model slide, fall or disappear in a dashboard overlay.
    if (trackName.endsWith(".position")) return false;

    // Scale tracks are unnecessary and can distort the avatar when FBX units differ.
    if (trackName.endsWith(".scale")) return false;

    return true;
  });

  return new THREE.AnimationClip(name, clip.duration || 2.4, tracks);
}

function pickClip(fbx: THREE.Group, name: string) {
  const clip = fbx.animations[0];
  if (!clip) return null;
  return sanitizeClip(clip, name);
}

function useMixamoClips() {
  const idle = useLoader(FBXLoader, ANIMATION_URLS.idle) as THREE.Group;
  const walk = useLoader(FBXLoader, ANIMATION_URLS.walk) as THREE.Group;
  const wave = useLoader(FBXLoader, ANIMATION_URLS.wave) as THREE.Group;
  const talk = useLoader(FBXLoader, ANIMATION_URLS.talk) as THREE.Group;
  const point = useLoader(FBXLoader, ANIMATION_URLS.point) as THREE.Group;
  const sit = useLoader(FBXLoader, ANIMATION_URLS.sit) as THREE.Group;

  return useMemo(() => {
    const loaded: Record<LoadedAnimation["key"], THREE.AnimationClip | null> = {
      idle: pickClip(idle, "idle"),
      walk: pickClip(walk, "walk"),
      wave: pickClip(wave, "wave"),
      talk: pickClip(talk, "talk"),
      point: pickClip(point, "point"),
      sit: pickClip(sit, "sit"),
    };
    return loaded;
  }, [idle, walk, wave, talk, point, sit]);
}

function Model({ modelUrl = "/avatars/flowly-grandma.glb", mode = "idle", facing = "left" }: Required<Pick<FlowlyAssistant3DProps, "modelUrl" | "mode" | "facing">>) {
  const group = useRef<THREE.Group>(null);
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const activeAction = useRef<THREE.AnimationAction | null>(null);
  const activeName = useRef("");
  const gltf = useGLTF(modelUrl) as unknown as { scene: THREE.Group };
  const clips = useMixamoClips();
  const scene = useMemo(() => clone(gltf.scene) as THREE.Group, [gltf.scene]);
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
          material.transparent = false;
          material.needsUpdate = true;
        });
      }
    });

    mixer.current = new THREE.AnimationMixer(scene);
    return () => {
      mixer.current?.stopAllAction();
      mixer.current?.uncacheRoot(scene);
      mixer.current = null;
    };
  }, [scene]);

  useEffect(() => {
    const currentMixer = mixer.current;
    if (!currentMixer) return;

    const clip = clips[activeMode] || clips.idle;
    if (!clip) return;
    if (activeName.current === clip.name) return;

    const nextAction = currentMixer.clipAction(clip);
    nextAction.enabled = true;
    nextAction.clampWhenFinished = false;
    nextAction.loop = THREE.LoopRepeat;
    nextAction.reset().fadeIn(activeName.current ? 0.22 : 0.01).play();

    if (activeAction.current && activeAction.current !== nextAction) {
      activeAction.current.fadeOut(0.2);
    }

    activeAction.current = nextAction;
    activeName.current = clip.name;
  }, [activeMode, clips]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    mixer.current?.update(Math.min(delta, 0.045));

    const breathing = Math.sin(t * 2.05);
    const settle = Math.sin(t * 0.8);
    const isWalking = activeMode === "walk";
    const isSpeaking = activeMode === "talk";
    const isSitting = activeMode === "sit";

    // Keep the model upright and stable. The walking sensation comes from Mixamo limbs,
    // while the parent group adds only tiny body weight/grounding, not ugly sliding.
    group.current.position.set(0, isSitting ? -1.18 : -1.31 + breathing * 0.007 + (isWalking ? Math.abs(Math.sin(t * 7.4)) * 0.018 : 0), 0);
    group.current.rotation.set(0, facing === "right" ? -0.45 : 0.45, settle * 0.006);
    group.current.scale.setScalar(isSitting ? 1.08 : 1.16);

    // Small natural micro-life layered over the real FBX clips. This avoids the “dead mannequin” look
    // without forcing arms into unnatural positions.
    const head = scene.getObjectByName("mixamorigHead") || scene.getObjectByName("Head");
    const neck = scene.getObjectByName("mixamorigNeck") || scene.getObjectByName("Neck");
    const spine = scene.getObjectByName("mixamorigSpine") || scene.getObjectByName("Spine");

    if (head) {
      head.rotation.y += Math.sin(t * 1.1) * 0.012;
      head.rotation.x += Math.sin(t * 1.45) * 0.006 + (isSpeaking ? Math.sin(t * 8.5) * 0.012 : 0);
    }
    if (neck) neck.rotation.y += Math.sin(t * 0.9) * 0.007;
    if (spine) spine.rotation.x += breathing * 0.006;
  });

  return (
    <group ref={group} position={[0, -1.31, 0]} rotation={[0, facing === "right" ? -0.45 : 0.45, 0]} scale={1.16}>
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
ANIMATION_FILES.forEach((key) => useLoader.preload(FBXLoader, ANIMATION_URLS[key]));
