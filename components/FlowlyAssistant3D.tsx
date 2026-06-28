"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Html, useAnimations, useFBX, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

type AssistantMode = "idle" | "walk" | "wave" | "talk" | "point" | "thinking" | "tour" | "sit";

type FlowlyAssistant3DProps = {
  modelUrl?: string;
  mode?: AssistantMode;
  facing?: "left" | "right" | "front";
  onClick?: () => void;
};

const FBX_ANIMATIONS: Record<string, string> = {
  idle: "/avatars/Idle.fbx",
  walk: "/avatars/Walking.fbx",
  wave: "/avatars/Waving.fbx",
  talk: "/avatars/Talking.fbx",
  point: "/avatars/Pointing.fbx",
  sit: "/avatars/Sitting Talking.fbx",
};

function normalizeMode(mode: AssistantMode) {
  if (mode === "thinking") return "idle";
  if (mode === "tour") return "point";
  return mode;
}

function getClipFromFbx(group: THREE.Group, name: string) {
  const clip = group.animations?.[0];
  if (!clip) return null;
  const cloned = clip.clone();
  cloned.name = name;
  return cloned;
}

function prepareAvatarScene(originalScene: THREE.Group) {
  const scene = clone(originalScene) as THREE.Group;

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

  const box = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const height = Math.max(size.y, 0.001);
  const scale = THREE.MathUtils.clamp(2.75 / height, 1.35, 3.1);
  scene.scale.setScalar(scale);
  scene.position.set(-center.x * scale, -box.min.y * scale - 1.32, -center.z * scale);

  return scene;
}

function getFallbackYaw(facing: Required<FlowlyAssistant3DProps>["facing"]) {
  // El modelo optimizado llega ligeramente orientado de lado. Este offset lo pone mirando a cámara.
  const frontCorrection = -Math.PI / 2;
  if (facing === "left") return frontCorrection + 0.18;
  if (facing === "right") return frontCorrection - 0.18;
  return frontCorrection;
}

function AvatarModel({
  modelUrl,
  mode,
  facing,
}: Required<Pick<FlowlyAssistant3DProps, "modelUrl" | "mode" | "facing">>) {
  const rootRef = useRef<THREE.Group>(null);
  const avatarRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelUrl) as unknown as { scene: THREE.Group; animations?: THREE.AnimationClip[] };
  const idle = useFBX(FBX_ANIMATIONS.idle);
  const walk = useFBX(FBX_ANIMATIONS.walk);
  const wave = useFBX(FBX_ANIMATIONS.wave);
  const talk = useFBX(FBX_ANIMATIONS.talk);
  const point = useFBX(FBX_ANIMATIONS.point);
  const sit = useFBX(FBX_ANIMATIONS.sit);

  const scene = useMemo(() => prepareAvatarScene(gltf.scene), [gltf.scene]);
  const activeMode = normalizeMode(mode);

  const clips = useMemo(() => {
    const namedFbxClips = [
      getClipFromFbx(idle, "idle"),
      getClipFromFbx(walk, "walk"),
      getClipFromFbx(wave, "wave"),
      getClipFromFbx(talk, "talk"),
      getClipFromFbx(point, "point"),
      getClipFromFbx(sit, "sit"),
    ].filter(Boolean) as THREE.AnimationClip[];

    const nativeClips = (gltf.animations || []).map((clip, index) => {
      const cloned = clip.clone();
      cloned.name = cloned.name || `native-${index}`;
      return cloned;
    });

    // Las animaciones FBX pequeñas son las principales. Si el GLB trae clips propios,
    // quedan como reserva, pero nunca forzamos huesos manualmente.
    return [...namedFbxClips, ...nativeClips];
  }, [gltf.animations, idle, point, sit, talk, walk, wave]);

  const { actions, mixer } = useAnimations(clips, scene);

  useEffect(() => {
    const actionName = actions[activeMode] ? activeMode : actions.idle ? "idle" : Object.keys(actions)[0];
    const action = actionName ? actions[actionName] : undefined;
    if (!action) return;

    Object.values(actions).forEach((candidate) => {
      if (candidate && candidate !== action) candidate.fadeOut(0.22);
    });

    action.reset();
    action.enabled = true;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = false;
    action.timeScale = activeMode === "walk" ? 0.9 : activeMode === "talk" ? 1.05 : activeMode === "wave" ? 0.85 : 0.75;
    action.fadeIn(0.24).play();

    return () => {
      action.fadeOut(0.18);
    };
  }, [actions, activeMode]);

  useFrame((state, delta) => {
    const root = rootRef.current;
    const avatar = avatarRef.current;
    if (!root || !avatar) return;

    mixer.update(delta);

    const t = state.clock.elapsedTime;
    const yaw = getFallbackYaw(facing);
    const isWalking = activeMode === "walk";
    const isTalking = activeMode === "talk";
    const isPointing = activeMode === "point";

    // Vida global del personaje: se mueve completo, no se rompen huesos/extremidades.
    root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, yaw + Math.sin(t * 0.7) * 0.035, 0.07);
    root.position.y = Math.sin(t * (isWalking ? 4.6 : 1.8)) * (isWalking ? 0.035 : 0.018);
    root.position.x = Math.sin(t * 0.55) * (isWalking ? 0.05 : 0.018);

    avatar.rotation.z = Math.sin(t * (isTalking ? 2.8 : 1.4)) * (isTalking ? 0.018 : 0.01);
    avatar.rotation.x = Math.sin(t * (isPointing ? 1.1 : 0.9)) * 0.012;
  });

  return (
    <group ref={rootRef}>
      <primitive ref={avatarRef} object={scene} />
    </group>
  );
}

function AvatarFallback() {
  return (
    <Html center>
      <div style={{ color: "#a5f3fc", fontSize: 12, fontWeight: 900, textAlign: "center", whiteSpace: "nowrap" }}>
        Cargando Flowly…
      </div>
    </Html>
  );
}

export default function FlowlyAssistant3D({
  modelUrl = "/avatars/flowly.glb",
  mode = "idle",
  facing = "front",
  onClick,
}: FlowlyAssistant3DProps) {
  return (
    <div className="flowly-3d-stage" onClick={onClick} role="button" tabIndex={0} aria-label="Flowly Companion 3D">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.55, 6.2], fov: 30, near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1.25} />
        <directionalLight position={[2.8, 4, 5]} intensity={2.1} castShadow />
        <pointLight position={[-2.2, 2.4, 2.2]} intensity={1.2} color="#a78bfa" />
        <pointLight position={[2.4, 1.1, 1.4]} intensity={0.75} color="#22d3ee" />
        <Suspense fallback={<AvatarFallback />}>
          <AvatarModel modelUrl={modelUrl} mode={mode} facing={facing} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/avatars/flowly.glb");
Object.values(FBX_ANIMATIONS).forEach((path) => useFBX.preload(path));
