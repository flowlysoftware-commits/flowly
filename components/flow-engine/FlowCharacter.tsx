"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useFBX, useTexture } from "@react-three/drei";
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Bone,
  Box3,
  Color,
  DoubleSide,
  Group,
  LoopOnce,
  LoopRepeat,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  SkinnedMesh,
  Skeleton,
  Quaternion,
  SRGBColorSpace,
  Texture,
  Vector3,
} from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import {
  clone as cloneSkeleton,
  retargetClip as retargetSkeletonClip,
} from "three/examples/jsm/utils/SkeletonUtils.js";
import { FLOW_ANIMATION_URLS, FLOW_FRONT_YAW, FLOW_MODEL_URL } from "./animationLibrary";
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
  leftClavicle?: Object3D;
  rightClavicle?: Object3D;
};

const RETARGET_NAMES: Record<string, string> = {
  Hip: "mixamorigHips",
  Waist: "mixamorigSpine",
  Spine01: "mixamorigSpine1",
  Spine02: "mixamorigSpine2",
  NeckTwist01: "mixamorigNeck",
  Head: "mixamorigHead",
  L_Clavicle: "mixamorigLeftShoulder",
  L_Upperarm: "mixamorigLeftArm",
  L_Forearm: "mixamorigLeftForeArm",
  L_Hand: "mixamorigLeftHand",
  R_Clavicle: "mixamorigRightShoulder",
  R_Upperarm: "mixamorigRightArm",
  R_Forearm: "mixamorigRightForeArm",
  R_Hand: "mixamorigRightHand",
  L_Thigh: "mixamorigLeftUpLeg",
  L_Calf: "mixamorigLeftLeg",
  L_Foot: "mixamorigLeftFoot",
  L_ToeBase: "mixamorigLeftToeBase",
  R_Thigh: "mixamorigRightUpLeg",
  R_Calf: "mixamorigRightLeg",
  R_Foot: "mixamorigRightFoot",
  R_ToeBase: "mixamorigRightToeBase",
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

function findPrimarySkinnedMesh(root: Object3D) {
  let result: SkinnedMesh | null = null;
  root.traverse((node) => {
    if (!result && (node as SkinnedMesh).isSkinnedMesh) {
      result = node as SkinnedMesh;
    }
  });
  return result;
}

function createSourceSkeleton(root: Object3D) {
  const bones: Bone[] = [];
  root.traverse((node) => {
    if ((node as Bone).isBone) bones.push(node as Bone);
  });
  return bones.length ? new Skeleton(bones) : null;
}

/**
 * Uses Three.js' world-space skeleton retargeter instead of copying local
 * quaternion deltas. The avatar and the animation pack have very different
 * bind axes, so local quaternion copying keeps producing the same broken pose.
 */
function retargetClip(
  sourceClip: AnimationClip | undefined,
  sourceRoot: Object3D,
  targetRoot: Object3D,
  name: string,
) {
  if (!sourceClip) return null;

  const sourceSkeleton = createSourceSkeleton(sourceRoot);
  const targetMesh = findPrimarySkinnedMesh(targetRoot);
  if (!sourceSkeleton || !targetMesh) return null;

  sourceRoot.updateMatrixWorld(true);
  targetRoot.updateMatrixWorld(true);

  const clip = retargetSkeletonClip(
    targetMesh,
    sourceSkeleton,
    sourceClip,
    {
      names: RETARGET_NAMES,
      hip: "Hip",
      hipInfluence: new Vector3(0, 0, 0),
      preserveBoneMatrix: true,
      preserveBonePositions: true,
      useFirstFramePosition: true,
      fps: 30,
    },
  );

  targetMesh.skeleton.pose();
  targetRoot.updateMatrixWorld(true);
  clip.name = name;
  return clip.tracks.length ? clip : null;
}

function firstClip(group: Group) {
  return group.animations?.find((clip) => clip.tracks.length > 0);
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
    metalness: 0.06,
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
  const actions = useRef<Partial<Record<FlowMode, AnimationAction>>>({});
  const active = useRef<AnimationAction | null>(null);
  const restPose = useRef(new Map<Object3D, RestTransform>());
  const rig = useRef<BoneRig>({});
  const pointer = useRef({ x: 0, y: 0 });
  const requestedMode = useRef<FlowMode>(mode);
  requestedMode.current = mode;

  const modelSource = useFBX(FLOW_MODEL_URL);
  const [color, normal, roughness, metallic] = useTexture([
    "/models/flow/color.jpg",
    "/models/flow/normal.jpg",
    "/models/flow/roughness.jpeg",
    "/models/flow/metallic.jpeg",
  ]);
  color.colorSpace = SRGBColorSpace;

  const model = useMemo(() => {
    const clone = cloneSkeleton(modelSource) as Group;
    const pose = new Map<Object3D, RestTransform>();
    const map = buildBoneMap(clone);

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

      const sourceMaterials = Array.isArray(node.material)
        ? node.material
        : [node.material];
      const visibleMaterials = sourceMaterials.map((material) =>
        createVisibleMaterial(color, normal, roughness, metallic, material),
      );
      node.material = Array.isArray(node.material)
        ? visibleMaterials
        : visibleMaterials[0];
    });

    const bounds = new Box3().setFromObject(clone);
    const size = new Vector3();
    const center = new Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);

    const scale = 2.65 / Math.max(size.y, 0.001);
    clone.scale.setScalar(scale);
    clone.position.set(
      -center.x * scale,
      -bounds.min.y * scale - 1.18,
      -center.z * scale,
    );

    pose.set(clone, {
      position: clone.position.clone(),
      quaternion: clone.quaternion.clone(),
      scale: clone.scale.clone(),
    });
    restPose.current = pose;
    rig.current = {
      pelvis: map.get("pelvis"),
      spine01: map.get("spine01"),
      spine02: map.get("spine02"),
      neck: map.get("necktwist01") || map.get("neck"),
      head: map.get("head"),
      leftClavicle: map.get("lclavicle"),
      rightClavicle: map.get("rclavicle"),
    };

    return clone;
  }, [modelSource, color, normal, roughness, metallic]);

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
    let cancelled = false;
    const loader = new FBXLoader();
    const entries = Object.entries(FLOW_ANIMATION_URLS) as Array<[
      Exclude<FlowMode, "error">,
      string,
    ]>;

    Promise.allSettled(
      entries.map(async ([key, url]) => {
        const source = await loader.loadAsync(url);
        return {
          key,
          clip: retargetClip(firstClip(source), source, model, key),
        };
      }),
    ).then((results) => {
      if (cancelled) return;

      const nextActions: Partial<Record<FlowMode, AnimationAction>> = {};
      results.forEach((result) => {
        if (result.status !== "fulfilled" || !result.value.clip) {
          if (result.status === "rejected") {
            console.warn("[FlowCharacter] Animation load failed:", result.reason);
          }
          return;
        }

        const { key, clip } = result.value;
        const targetMesh = findPrimarySkinnedMesh(model);
        if (!targetMesh) return;
        const action = nextMixer.clipAction(clip, targetMesh);
        const oneShot = key === "waving" || key === "pointing";
        action.clampWhenFinished = false;
        action.setLoop(oneShot ? LoopOnce : LoopRepeat, oneShot ? 1 : Infinity);
        action.enabled = true;
        action.setEffectiveWeight(1);
        action.setEffectiveTimeScale(key === "walking" ? 1.08 : 1);
        nextActions[key] = action;
      });

      actions.current = nextActions;
      const initial = nextActions[requestedMode.current];
      initial?.reset().fadeIn(0.2).play();
      active.current = initial || null;
    });

    return () => {
      cancelled = true;
      nextMixer.stopAllAction();
      nextMixer.uncacheRoot(model);
      actions.current = {};
      active.current = null;
      mixer.current = null;
    };
  }, [model]);

  useEffect(() => {
    const next = actions.current[mode];
    if (!next) {
      active.current?.fadeOut(0.2);
      active.current = null;
      return;
    }
    if (next === active.current) return;

    next.reset().setEffectiveWeight(1).fadeIn(0.26).play();
    active.current?.crossFadeTo(next, 0.26, false);
    active.current = next;
  }, [mode]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    // Remove last frame's procedural offsets before AnimationMixer evaluates
    // the next pose. This prevents head/neck/chest rotations from accumulating.
    [
      rig.current.pelvis,
      rig.current.spine01,
      rig.current.spine02,
      rig.current.neck,
      rig.current.head,
      rig.current.leftClavicle,
      rig.current.rightClavicle,
    ].forEach((node) => {
      if (!node) return;
      const rest = restPose.current.get(node);
      if (rest) node.quaternion.copy(rest.quaternion);
    });

    mixer.current?.update(dt);

    if (!active.current) {
      const blend = Math.min(1, dt * 8);
      restPose.current.forEach((rest, node) => {
        node.position.lerp(rest.position, blend);
        node.quaternion.slerp(rest.quaternion, blend);
        node.scale.lerp(rest.scale, blend);
      });
    }

    const elapsed = state.clock.elapsedTime;
    const energy = Math.max(0, Math.min(1, emotion.energy));
    const calm = Math.max(0, Math.min(1, emotion.calm));
    const idleLike = mode === "idle" || mode === "thinking" || mode === "listening" || mode === "talking";

    if (idleLike) {
      const breath = Math.sin(elapsed * (1.25 + energy * 0.45));
      const sway = Math.sin(elapsed * 0.52) * (0.006 + (1 - calm) * 0.006);
      const chestAmount = breath * (0.007 + (1 - calm) * 0.004);

      const spine01 = rig.current.spine01;
      const spine02 = rig.current.spine02;
      const pelvis = rig.current.pelvis;
      if (spine01) spine01.rotateX(chestAmount * 0.42);
      if (spine02) spine02.rotateX(chestAmount);
      if (pelvis) pelvis.rotateZ(sway * 0.35);

      const canLook = mode !== "thinking";
      if (canLook) {
        const yaw = pointer.current.x * 0.055 * emotion.attention;
        const pitch = -pointer.current.y * 0.028 * emotion.attention;
        rig.current.neck?.rotateY(yaw * 0.42);
        rig.current.neck?.rotateX(pitch * 0.42);
        rig.current.head?.rotateY(yaw * 0.58);
        rig.current.head?.rotateX(pitch * 0.58);
      } else {
        rig.current.head?.rotateY(Math.sin(elapsed * 0.44) * 0.018);
        rig.current.head?.rotateX(-0.025);
      }
    }

    if (!presentation.current) return;
    const sideTurn = facing === "left" ? 0.15 : facing === "right" ? -0.15 : 0;
    const targetYaw = FLOW_FRONT_YAW + sideTurn;
    presentation.current.rotation.y +=
      (targetYaw - presentation.current.rotation.y) * Math.min(1, dt * 7);
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
        <ambientLight intensity={2.2} />
        <hemisphereLight color="#ffffff" groundColor="#64748b" intensity={1.8} />
        <directionalLight position={[3, 5, 6]} intensity={3.2} />
        <directionalLight position={[-3, 2, 4]} intensity={1.5} />
        <Suspense fallback={<Loading />}>
          <CharacterScene
            mode={props.mode}
            facing={props.facing}
            emotion={props.emotion}
          />
        </Suspense>
      </Canvas>
    </button>
  );
}

useFBX.preload(FLOW_MODEL_URL);
