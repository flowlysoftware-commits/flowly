"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Html, useFBX } from "@react-three/drei";
import { Box3, Color, Group, Mesh, MeshStandardMaterial, Object3D, TextureLoader, Vector3 } from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

type FlowMode = "idle" | "walk" | "wave" | "talk" | "point" | "thinking";

type FlowRealAssistant3DProps = {
  mode?: FlowMode;
  facing?: "left" | "right" | "front";
  compact?: boolean;
  onClick?: () => void;
};

function isMesh(object: Object3D): object is Mesh {
  return "isMesh" in object && Boolean((object as Mesh).isMesh);
}

function Loading() {
  return (
    <Html center className="flowly-v3-loading-label">
      <span>Cargando Flow…</span>
    </Html>
  );
}

function FlowModel({ mode = "idle", facing = "front", compact = true }: Required<Pick<FlowRealAssistant3DProps, "mode" | "facing" | "compact">>) {
  const rootRef = useRef<Group>(null);
  const fbx = useFBX("/models/flow/flow.fbx") as Group;
  const colorMap = useLoader(TextureLoader, "/models/flow/color.jpg");
  const normalMap = useLoader(TextureLoader, "/models/flow/normal.jpg");
  const roughnessMap = useLoader(TextureLoader, "/models/flow/roughness.jpeg");
  const metalnessMap = useLoader(TextureLoader, "/models/flow/metallic.jpeg");

  const model = useMemo(() => {
    const cloned = cloneSkeleton(fbx) as Group;
    const box = new Box3().setFromObject(cloned);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);

    const height = size.y || 1;
    const targetHeight = compact ? 2.15 : 3.15;
    const scale = targetHeight / height;

    cloned.position.set(-center.x * scale, -box.min.y * scale - (compact ? 1.1 : 1.72), -center.z * scale);
    cloned.scale.setScalar(scale);
    cloned.rotation.y = Math.PI / 2;

    cloned.traverse((object) => {
      if (!isMesh(object)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = false;

      const material = new MeshStandardMaterial({
        map: colorMap,
        normalMap,
        roughnessMap,
        metalnessMap,
        color: new Color("#ffffff"),
        roughness: 0.76,
        metalness: 0.12,
      });

      object.material = material;
    });

    return cloned;
  }, [fbx, colorMap, normalMap, roughnessMap, metalnessMap, compact]);

  useFrame((state) => {
    const root = rootRef.current;
    if (!root) return;

    const t = state.clock.elapsedTime;
    const isWalking = mode === "walk";
    const isTalking = mode === "talk";
    const isThinking = mode === "thinking";
    const isPointing = mode === "point";
    const isWaving = mode === "wave";

    const direction = facing === "left" ? -0.35 : facing === "right" ? 0.35 : 0;
    const breath = Math.sin(t * 2.0) * 0.018;
    const walk = isWalking ? Math.sin(t * 7.2) * 0.045 : 0;
    const talk = isTalking ? Math.sin(t * 9.5) * 0.018 : 0;
    const thought = isThinking ? Math.sin(t * 1.35) * 0.018 : 0;

    root.position.y = breath + Math.abs(walk) * 0.45 + talk;
    root.rotation.y = direction + Math.sin(t * 0.65) * 0.035 + (isPointing ? direction * 0.55 : 0);
    root.rotation.z = Math.sin(t * (isWalking ? 5.4 : 0.78)) * (isWalking ? 0.028 : 0.012);
    root.rotation.x = thought;

    if (isWaving) {
      root.rotation.z += Math.sin(t * 8) * 0.018;
    }
  });

  return (
    <group ref={rootRef}>
      <primitive object={model} />
    </group>
  );
}

export default function FlowRealAssistant3D({ mode = "idle", facing = "front", compact = true, onClick }: FlowRealAssistant3DProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && onClick) {
          event.preventDefault();
          onClick();
        }
      }}
      className="flowly-avatar-renderer-v6 flow-real-avatar-renderer"
      data-mode={mode}
      data-facing={facing}
      data-compact={compact ? "true" : "false"}
      aria-label="Abrir Flow"
    >
      <Canvas
        className="flowly-v3-canvas"
        orthographic
        camera={{ position: [0, 1.28, 8], zoom: compact ? 82 : 68, near: 0.1, far: 100 }}
        dpr={[1, 1.75]}
        shadows
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.65} />
        <directionalLight position={[2.6, 4.8, 5.5]} intensity={2.45} castShadow />
        <pointLight position={[-2.4, 2.2, 3]} color="#67e8f9" intensity={1.1} />
        <Suspense fallback={<Loading />}>
          <FlowModel mode={mode} facing={facing} compact={compact} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useFBX.preload("/models/flow/flow.fbx");
