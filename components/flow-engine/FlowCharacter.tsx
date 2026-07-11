"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useFBX, useTexture } from "@react-three/drei";
import {
  AnimationAction,
  AnimationMixer,
  Box3,
  Color,
  DoubleSide,
  Group,
  LoopOnce,
  LoopRepeat,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  SRGBColorSpace,
  Texture,
  Vector3,
} from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  buildAnimationCatalog,
  chooseAnimation,
  FlowAnimationCatalog,
  FlowAnimationEntry,
  summarizeCatalog,
} from "./animationCatalog";
import { FLOW_FRONT_YAW, FLOW_MODEL_URL } from "./animationLibrary";
import { FlowEmotion, FlowFacing, FlowMode } from "./types";

type Props = {
  mode: FlowMode;
  facing: FlowFacing;
  emotion: FlowEmotion;
  onClick?: () => void;
};

type RestTransform = {
  position: Vector3;
  quaternion: Quaternion;
  scale: Vector3;
};

type BoneRig = {
  pelvis?: Object3D;
  spine01?: Object3D;
  spine02?: Object3D;
  neck?: Object3D;
  head?: Object3D;
};

function normalizeBone(value: string) {
  return value
    .replace(/^.*[|:]/, "")
    .replace(/mixamorig/gi, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

function buildBoneMap(root: Object3D) {
  const map = new Map<string, Object3D>();
  root.traverse((node) => {
    if (node.name) map.set(normalizeBone(node.name), node);
  });
  return map;
}

function findBone(map: Map<string, Object3D>, names: string[]) {
  for (const name of names) {
    const exact = map.get(normalizeBone(name));
    if (exact) return exact;
  }
  for (const [key, node] of map) {
    if (names.some((name) => key.includes(normalizeBone(name)))) return node;
  }
  return undefined;
}

function isMesh(node: Object3D): node is Mesh {
  return Boolean((node as Mesh).isMesh);
}

function createVisibleMaterial(
  color: Texture,
  normal: Texture,
  roughness: Texture,
  metallic: Texture,
  source?: unknown,
) {
  const sourceMaterial = source as {
    transparent?: boolean;
    opacity?: number;
    alphaTest?: number;
  } | undefined;

  return new MeshStandardMaterial({
    color: new Color(0xffffff),
    map: color,
    normalMap: normal,
    roughnessMap: roughness,
    metalnessMap: metallic,
    roughness: 0.72,
    metalness: 0.04,
    transparent: Boolean(sourceMaterial?.transparent),
    opacity: sourceMaterial?.opacity ?? 1,
    alphaTest: sourceMaterial?.alphaTest ?? 0,
    side: DoubleSide,
  });
}

function Loading() {
  return (
    <Html center>
      <span className="flow-engine-loading">Cargando Flow…</span>
    </Html>
  );
}

function CharacterScene({ mode, facing, emotion }: Omit<Props, "onClick">) {
  const presentation = useRef<Group>(null);
  const mixer = useRef<AnimationMixer | null>(null);
  const activeAction = useRef<AnimationAction | null>(null);
  const activeEntry = useRef<FlowAnimationEntry | null>(null);
  const currentMode = useRef<FlowMode>(mode);
  const recentlyUsed = useRef(new Map<string, number>());
  const ambientAt = useRef(0);
  const oneShotEndsAt = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const restPose = useRef(new Map<Object3D, RestTransform>());
  const rig = useRef<BoneRig>({});

  currentMode.current = mode;

  const source = useFBX(FLOW_MODEL_URL);
  const [color, normal, roughness, metallic] = useTexture([
    "/models/flow/color.jpg",
    "/models/flow/normal.jpg",
    "/models/flow/roughness.jpeg",
    "/models/flow/metallic.jpeg",
  ]);
  color.colorSpace = SRGBColorSpace;

  const model = useMemo(() => {
    const clone = cloneSkeleton(source) as Group;
    const pose = new Map<Object3D, RestTransform>();
    const boneMap = buildBoneMap(clone);

    clone.traverse((node) => {
      pose.set(node, {
        position: node.position.clone(),
        quaternion: node.quaternion.clone(),
        scale: node.scale.clone(),
      });
      if (!isMesh(node)) return;
      node.frustumCulled = false;
      node.castShadow = false;
      node.receiveShadow = false;

      const materials = Array.isArray(node.material) ? node.material : [node.material];
      const visible = materials.map((material) =>
        createVisibleMaterial(color, normal, roughness, metallic, material),
      );
      node.material = Array.isArray(node.material) ? visible : visible[0];
    });

    const bounds = new Box3().setFromObject(clone);
    const size = new Vector3();
    const center = new Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);
    const scale = 2.65 / Math.max(size.y, 0.001);
    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -bounds.min.y * scale - 1.18, -center.z * scale);

    pose.set(clone, {
      position: clone.position.clone(),
      quaternion: clone.quaternion.clone(),
      scale: clone.scale.clone(),
    });
    restPose.current = pose;
    rig.current = {
      pelvis: findBone(boneMap, ["Pelvis", "Hips", "Hip"]),
      spine01: findBone(boneMap, ["Spine01", "Spine1", "Spine"]),
      spine02: findBone(boneMap, ["Spine02", "Spine2", "Chest"]),
      neck: findBone(boneMap, ["NeckTwist01", "Neck"]),
      head: findBone(boneMap, ["Head"]),
    };

    return clone;
  }, [source, color, normal, roughness, metallic]);

  const catalog = useMemo<FlowAnimationCatalog>(() => {
    const built = buildAnimationCatalog(source.animations || []);
    console.info("[Flow Animation Brain] Master FBX clips:", source.animations?.length || 0, summarizeCatalog(built));
    return built;
  }, [source]);

  const playEntry = (entry: FlowAnimationEntry | null, fade = 0.35) => {
    const nextMixer = mixer.current;
    if (!entry || !nextMixer) return false;

    const action = nextMixer.clipAction(entry.clip, model);
    if (action === activeAction.current && action.isRunning()) return true;

    action.enabled = true;
    action.clampWhenFinished = !entry.loop;
    action.setLoop(entry.loop ? LoopRepeat : LoopOnce, entry.loop ? Infinity : 1);
    action.setEffectiveWeight(1);
    action.setEffectiveTimeScale(
      entry.category === "walk"
        ? 1.04 + emotion.energy * 0.22
        : entry.category === "talk"
          ? 0.92 + emotion.energy * 0.18
          : 1,
    );
    action.reset().fadeIn(fade).play();

    if (activeAction.current && activeAction.current !== action) {
      activeAction.current.crossFadeTo(action, fade, false);
    }

    activeAction.current = action;
    activeEntry.current = entry;
    recentlyUsed.current.set(entry.clip.uuid, Date.now());
    oneShotEndsAt.current = entry.loop
      ? 0
      : performance.now() + (entry.clip.duration / Math.max(action.getEffectiveTimeScale(), 0.01)) * 1000;
    return true;
  };

  const chooseForMode = (requested: FlowMode) =>
    chooseAnimation(catalog, requested, recentlyUsed.current);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useEffect(() => {
    const nextMixer = new AnimationMixer(model);
    mixer.current = nextMixer;
    ambientAt.current = performance.now() + 3500;
    playEntry(chooseForMode(mode), 0.18);

    return () => {
      nextMixer.stopAllAction();
      nextMixer.uncacheRoot(model);
      mixer.current = null;
      activeAction.current = null;
      activeEntry.current = null;
    };
    // Catalog and model are immutable per loaded master FBX.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, catalog]);

  useEffect(() => {
    const entry = chooseForMode(mode);
    if (entry) playEntry(entry, mode === "walking" ? 0.22 : 0.34);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const now = performance.now();

    // Remove procedural offsets. The mixer then writes the native master-rig pose.
    [rig.current.spine01, rig.current.spine02, rig.current.neck, rig.current.head].forEach((node) => {
      if (!node) return;
      const rest = restPose.current.get(node);
      if (rest) node.quaternion.copy(rest.quaternion);
    });

    mixer.current?.update(dt);

    // One-shot gestures naturally return to the current behavioural state.
    if (oneShotEndsAt.current && now >= oneShotEndsAt.current) {
      oneShotEndsAt.current = 0;
      const fallback = chooseForMode(currentMode.current === "waving" || currentMode.current === "pointing" ? "idle" : currentMode.current);
      if (fallback) playEntry(fallback, 0.3);
    }

    // Idle intelligence: vary the native clips without repeating recently used ones.
    if (currentMode.current === "idle" && now >= ambientAt.current && !oneShotEndsAt.current) {
      const roll = Math.random();
      const ambientMode: FlowMode = roll < 0.62 ? "idle" : roll < 0.76 ? "listening" : roll < 0.9 ? "thinking" : "waving";
      const ambient = chooseForMode(ambientMode);
      if (ambient) playEntry(ambient, 0.45);
      const calmDelay = 7000 + emotion.calm * 9000;
      ambientAt.current = now + calmDelay + Math.random() * 7000;
    }

    const elapsed = state.clock.elapsedTime;
    const energy = Math.max(0, Math.min(1, emotion.energy));
    const calm = Math.max(0, Math.min(1, emotion.calm));
    const attention = Math.max(0, Math.min(1, emotion.attention));
    const idleLike = mode === "idle" || mode === "thinking" || mode === "listening" || mode === "talking";

    if (idleLike) {
      const breath = Math.sin(elapsed * (1.08 + energy * 0.48));
      const chest = breath * (0.0045 + (1 - calm) * 0.0035);
      rig.current.spine01?.rotateX(chest * 0.45);
      rig.current.spine02?.rotateX(chest);

      if (mode !== "thinking") {
        const yaw = pointer.current.x * 0.045 * attention;
        const pitch = -pointer.current.y * 0.022 * attention;
        rig.current.neck?.rotateY(yaw * 0.35);
        rig.current.neck?.rotateX(pitch * 0.35);
        rig.current.head?.rotateY(yaw * 0.65);
        rig.current.head?.rotateX(pitch * 0.65);
      }
    }

    if (!presentation.current) return;
    const sideTurn = facing === "left" ? 0.12 : facing === "right" ? -0.12 : 0;
    const targetYaw = FLOW_FRONT_YAW + sideTurn;
    presentation.current.rotation.y += (targetYaw - presentation.current.rotation.y) * Math.min(1, dt * 8);
  });

  return (
    <group ref={presentation} rotation={[0, FLOW_FRONT_YAW, 0]}>
      <primitive object={model} />
    </group>
  );
}

export default function FlowCharacter(props: Props) {
  return (
    <button
      type="button"
      className="flow-engine-character-button"
      onClick={props.onClick}
      aria-label="Hablar con Flow"
    >
      <Canvas
        orthographic
        camera={{ position: [0, 1.05, 8], zoom: 72, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={2.15} />
        <hemisphereLight color="#ffffff" groundColor="#64748b" intensity={1.75} />
        <directionalLight position={[3, 5, 6]} intensity={3.1} />
        <directionalLight position={[-3, 2, 4]} intensity={1.45} />
        <Suspense fallback={<Loading />}>
          <CharacterScene mode={props.mode} facing={props.facing} emotion={props.emotion} />
        </Suspense>
      </Canvas>
    </button>
  );
}

useFBX.preload(FLOW_MODEL_URL);
