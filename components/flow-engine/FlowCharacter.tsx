"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useFBX, useTexture } from "@react-three/drei";
import {
  Box3,
  Color,
  DoubleSide,
  Euler,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  SRGBColorSpace,
  Texture,
  Vector3,
} from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
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
  root?: Object3D;
  pelvis?: Object3D;
  spine01?: Object3D;
  spine02?: Object3D;
  neck?: Object3D;
  head?: Object3D;
  leftShoulder?: Object3D;
  rightShoulder?: Object3D;
  leftUpperArm?: Object3D;
  rightUpperArm?: Object3D;
  leftForeArm?: Object3D;
  rightForeArm?: Object3D;
  leftHand?: Object3D;
  rightHand?: Object3D;
  leftThigh?: Object3D;
  rightThigh?: Object3D;
  leftCalf?: Object3D;
  rightCalf?: Object3D;
  leftFoot?: Object3D;
  rightFoot?: Object3D;
};

type FaceRig = {
  meshes: Mesh[];
  blinkLeft: number[];
  blinkRight: number[];
  smile: number[];
  browUp: number[];
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
    roughness: 0.78,
    metalness: 0.02,
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

function buildFaceRig(root: Object3D): FaceRig {
  const result: FaceRig = {
    meshes: [],
    blinkLeft: [],
    blinkRight: [],
    smile: [],
    browUp: [],
  };

  root.traverse((node) => {
    if (!isMesh(node)) return;
    const mesh = node as Mesh & {
      morphTargetDictionary?: Record<string, number>;
      morphTargetInfluences?: number[];
    };
    if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
    const meshIndex = result.meshes.push(mesh) - 1;
    Object.entries(mesh.morphTargetDictionary).forEach(([rawName, index]) => {
      const name = normalizeBone(rawName);
      const packed = meshIndex * 10000 + index;
      if (/blinkleft|eyeblinkleft|leftblink/.test(name)) result.blinkLeft.push(packed);
      if (/blinkright|eyeblinkright|rightblink/.test(name)) result.blinkRight.push(packed);
      if (/smile|mouthsmile|happy/.test(name)) result.smile.push(packed);
      if (/browup|eyebrowup|surprise/.test(name)) result.browUp.push(packed);
    });
  });

  return result;
}

function setMorph(face: FaceRig, packedIndices: number[], value: number) {
  packedIndices.forEach((packed) => {
    const meshIndex = Math.floor(packed / 10000);
    const morphIndex = packed % 10000;
    const mesh = face.meshes[meshIndex] as Mesh & { morphTargetInfluences?: number[] };
    if (mesh?.morphTargetInfluences) mesh.morphTargetInfluences[morphIndex] = value;
  });
}

const tempEuler = new Euler();
const tempQuat = new Quaternion();
const targetQuat = new Quaternion();

function applyAdditiveRotation(
  node: Object3D | undefined,
  restPose: Map<Object3D, RestTransform>,
  x: number,
  y: number,
  z: number,
  alpha: number,
) {
  if (!node) return;
  const rest = restPose.get(node);
  if (!rest) return;
  tempEuler.set(x, y, z, "XYZ");
  tempQuat.setFromEuler(tempEuler);
  targetQuat.copy(rest.quaternion).multiply(tempQuat);
  node.quaternion.slerp(targetQuat, alpha);
}

function applyAdditivePosition(
  node: Object3D | undefined,
  restPose: Map<Object3D, RestTransform>,
  x: number,
  y: number,
  z: number,
  alpha: number,
) {
  if (!node) return;
  const rest = restPose.get(node);
  if (!rest) return;
  const target = new Vector3(rest.position.x + x, rest.position.y + y, rest.position.z + z);
  node.position.lerp(target, alpha);
}

function CharacterScene({ mode, facing, emotion }: Omit<Props, "onClick">) {
  const presentation = useRef<Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const restPose = useRef(new Map<Object3D, RestTransform>());
  const rig = useRef<BoneRig>({});
  const face = useRef<FaceRig>({ meshes: [], blinkLeft: [], blinkRight: [], smile: [], browUp: [] });
  const blinkStartedAt = useRef(-1);
  const nextBlinkAt = useRef(1.8);
  const microGestureSeed = useRef(Math.random() * 100);
  const lastMode = useRef<FlowMode>(mode);
  const modeEnteredAt = useRef(0);

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
    const scale = 2.9 / Math.max(size.y, 0.001);
    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -bounds.min.y * scale - 1.30, -center.z * scale);

    pose.set(clone, {
      position: clone.position.clone(),
      quaternion: clone.quaternion.clone(),
      scale: clone.scale.clone(),
    });

    restPose.current = pose;
    rig.current = {
      root: findBone(boneMap, ["Root", "Armature"]),
      pelvis: findBone(boneMap, ["Pelvis", "Hips", "Hip"]),
      spine01: findBone(boneMap, ["Spine01", "Spine1", "Spine"]),
      spine02: findBone(boneMap, ["Spine02", "Spine2", "Chest", "UpperChest"]),
      neck: findBone(boneMap, ["NeckTwist01", "Neck"]),
      head: findBone(boneMap, ["Head"]),
      leftShoulder: findBone(boneMap, ["LeftShoulder", "Shoulder_L", "LShoulder"]),
      rightShoulder: findBone(boneMap, ["RightShoulder", "Shoulder_R", "RShoulder"]),
      leftUpperArm: findBone(boneMap, ["LeftArm", "LeftUpperArm", "UpperArm_L", "LUpperArm"]),
      rightUpperArm: findBone(boneMap, ["RightArm", "RightUpperArm", "UpperArm_R", "RUpperArm"]),
      leftForeArm: findBone(boneMap, ["LeftForeArm", "LeftLowerArm", "ForeArm_L", "LForeArm"]),
      rightForeArm: findBone(boneMap, ["RightForeArm", "RightLowerArm", "ForeArm_R", "RForeArm"]),
      leftHand: findBone(boneMap, ["LeftHand", "Hand_L", "LHand"]),
      rightHand: findBone(boneMap, ["RightHand", "Hand_R", "RHand"]),
      leftThigh: findBone(boneMap, ["LeftUpLeg", "LeftThigh", "Thigh_L", "LThigh"]),
      rightThigh: findBone(boneMap, ["RightUpLeg", "RightThigh", "Thigh_R", "RThigh"]),
      leftCalf: findBone(boneMap, ["LeftLeg", "LeftCalf", "Calf_L", "LCalf"]),
      rightCalf: findBone(boneMap, ["RightLeg", "RightCalf", "Calf_R", "RCalf"]),
      leftFoot: findBone(boneMap, ["LeftFoot", "Foot_L", "LFoot"]),
      rightFoot: findBone(boneMap, ["RightFoot", "Foot_R", "RFoot"]),
    };
    face.current = buildFaceRig(clone);

    return clone;
  }, [source, color, normal, roughness, metallic]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const elapsed = state.clock.elapsedTime;
    const alpha = 1 - Math.exp(-dt * 10);

    if (lastMode.current !== mode) {
      lastMode.current = mode;
      modeEnteredAt.current = elapsed;
      microGestureSeed.current = Math.random() * 100;
    }

    const modeTime = elapsed - modeEnteredAt.current;
    const energy = MathUtils.clamp(emotion.energy, 0, 1);
    const calm = MathUtils.clamp(emotion.calm, 0, 1);
    const attention = MathUtils.clamp(emotion.attention, 0, 1);
    const joy = MathUtils.clamp(emotion.joy, 0, 1);
    const empathy = MathUtils.clamp(emotion.empathy, 0, 1);
    const stress = MathUtils.clamp(emotion.stress, 0, 1);

    const breathSpeed = 0.95 + energy * 0.55 + stress * 0.35;
    const breath = Math.sin(elapsed * breathSpeed * Math.PI * 2);
    const slowSway = Math.sin(elapsed * 0.48 + microGestureSeed.current) * (0.012 + (1 - calm) * 0.012);
    const weightShift = Math.sin(elapsed * 0.24 + microGestureSeed.current * 0.7);

    let pelvisX = 0;
    let pelvisY = 0;
    let pelvisZ = slowSway * 0.35;
    let chestX = breath * (0.008 + energy * 0.004);
    let chestY = 0;
    let chestZ = -slowSway * 0.55;
    let headX = 0;
    let headY = 0;
    let headZ = 0;
    let leftUpperX = 0;
    let rightUpperX = 0;
    let leftUpperZ = 0;
    let rightUpperZ = 0;
    let leftForeY = 0;
    let rightForeY = 0;
    let leftThighX = 0;
    let rightThighX = 0;
    let leftCalfX = 0;
    let rightCalfX = 0;
    let leftFootX = 0;
    let rightFootX = 0;

    if (mode === "walking") {
      const cadence = 1.65 + energy * 0.45;
      const phase = elapsed * Math.PI * 2 * cadence;
      const stride = 0.48 + energy * 0.12;
      const leftStep = Math.sin(phase);
      const rightStep = -leftStep;
      leftThighX = leftStep * stride;
      rightThighX = rightStep * stride;
      leftCalfX = Math.max(0, -leftStep) * 0.68;
      rightCalfX = Math.max(0, -rightStep) * 0.68;
      leftFootX = -Math.max(0, leftStep) * 0.22;
      rightFootX = -Math.max(0, rightStep) * 0.22;
      leftUpperX = -leftStep * 0.34;
      rightUpperX = -rightStep * 0.34;
      pelvisY = Math.abs(Math.sin(phase)) * 0.018;
      pelvisZ = Math.sin(phase) * 0.045;
      chestY = -Math.sin(phase) * 0.028;
      chestX = 0.025;
    } else if (mode === "waving") {
      const intro = MathUtils.smoothstep(Math.min(modeTime / 0.35, 1), 0, 1);
      const outro = modeTime > 1.55 ? 1 - MathUtils.smoothstep(Math.min((modeTime - 1.55) / 0.45, 1), 0, 1) : 1;
      const amount = intro * outro;
      const wave = Math.sin(modeTime * 8.5) * 0.30;
      rightUpperZ = -1.08 * amount;
      rightUpperX = -0.28 * amount;
      rightForeY = (-0.72 + wave) * amount;
      headZ = 0.045 * amount;
      chestY = -0.05 * amount;
    } else if (mode === "pointing") {
      const amount = MathUtils.smoothstep(Math.min(modeTime / 0.3, 1), 0, 1);
      rightUpperZ = -0.88 * amount;
      rightUpperX = -0.18 * amount;
      rightForeY = -0.14 * amount;
      headY = -0.09 * amount;
      chestY = -0.035 * amount;
    } else if (mode === "talking") {
      const gesture = Math.sin(elapsed * (2.1 + energy * 1.2));
      const gesture2 = Math.sin(elapsed * 1.45 + 1.6);
      leftUpperZ = 0.12 + gesture * 0.07;
      rightUpperZ = -0.12 - gesture2 * 0.07;
      leftForeY = -0.10 + gesture2 * 0.12;
      rightForeY = 0.10 - gesture * 0.12;
      chestY = gesture * 0.018;
      headY = gesture2 * 0.025;
    } else if (mode === "thinking") {
      headX = -0.045;
      headY = 0.10 + Math.sin(elapsed * 0.55) * 0.028;
      chestX += 0.025;
      rightUpperZ = -0.10;
      rightForeY = -0.20;
    } else if (mode === "listening") {
      headZ = 0.045 * empathy;
      headX = -0.018;
      chestX -= 0.014;
      chestY = pointer.current.x * 0.018 * attention;
    } else {
      pelvisZ += weightShift * 0.018;
      chestZ -= weightShift * 0.012;
      const micro = Math.sin(elapsed * 0.31 + microGestureSeed.current);
      headY += micro * 0.018 * attention;
      headZ += Math.sin(elapsed * 0.19 + 2.1) * 0.012;
    }

    if (mode !== "walking" && mode !== "waving" && mode !== "pointing") {
      const pointerYaw = pointer.current.x * 0.08 * attention;
      const pointerPitch = -pointer.current.y * 0.04 * attention;
      headY += pointerYaw;
      headX += pointerPitch;
    }

    applyAdditivePosition(rig.current.pelvis, restPose.current, 0, pelvisY, 0, alpha);
    applyAdditiveRotation(rig.current.pelvis, restPose.current, pelvisX, pelvisY * 0.2, pelvisZ, alpha);
    applyAdditiveRotation(rig.current.spine01, restPose.current, chestX * 0.45, chestY * 0.45, chestZ * 0.55, alpha);
    applyAdditiveRotation(rig.current.spine02, restPose.current, chestX, chestY, chestZ, alpha);
    applyAdditiveRotation(rig.current.neck, restPose.current, headX * 0.35, headY * 0.35, headZ * 0.35, alpha);
    applyAdditiveRotation(rig.current.head, restPose.current, headX * 0.65, headY * 0.65, headZ * 0.65, alpha);
    applyAdditiveRotation(rig.current.leftUpperArm, restPose.current, leftUpperX, 0, leftUpperZ, alpha);
    applyAdditiveRotation(rig.current.rightUpperArm, restPose.current, rightUpperX, 0, rightUpperZ, alpha);
    applyAdditiveRotation(rig.current.leftForeArm, restPose.current, 0, leftForeY, 0, alpha);
    applyAdditiveRotation(rig.current.rightForeArm, restPose.current, 0, rightForeY, 0, alpha);
    applyAdditiveRotation(rig.current.leftThigh, restPose.current, leftThighX, 0, 0, alpha);
    applyAdditiveRotation(rig.current.rightThigh, restPose.current, rightThighX, 0, 0, alpha);
    applyAdditiveRotation(rig.current.leftCalf, restPose.current, leftCalfX, 0, 0, alpha);
    applyAdditiveRotation(rig.current.rightCalf, restPose.current, rightCalfX, 0, 0, alpha);
    applyAdditiveRotation(rig.current.leftFoot, restPose.current, leftFootX, 0, 0, alpha);
    applyAdditiveRotation(rig.current.rightFoot, restPose.current, rightFootX, 0, 0, alpha);

    // Natural blink rhythm. Stress produces quicker blinks; concentration slightly delays them.
    if (elapsed >= nextBlinkAt.current && blinkStartedAt.current < 0) blinkStartedAt.current = elapsed;
    let blink = 0;
    if (blinkStartedAt.current >= 0) {
      const t = (elapsed - blinkStartedAt.current) / 0.16;
      blink = t < 0.5 ? t * 2 : Math.max(0, 2 - t * 2);
      if (t >= 1) {
        blinkStartedAt.current = -1;
        nextBlinkAt.current = elapsed + 2.8 + calm * 3.2 + Math.random() * 2.5 - stress * 1.3;
      }
    }
    setMorph(face.current, face.current.blinkLeft, blink);
    setMorph(face.current, face.current.blinkRight, blink);
    setMorph(face.current, face.current.smile, MathUtils.clamp(joy * 0.58 + (mode === "waving" ? 0.24 : 0), 0, 0.8));
    setMorph(face.current, face.current.browUp, MathUtils.clamp(emotion.curiosity * 0.25 + (mode === "thinking" ? 0.12 : 0), 0, 0.5));

    if (!presentation.current) return;
    const sideTurn = facing === "left" ? 0.16 : facing === "right" ? -0.16 : 0;
    const targetYaw = FLOW_FRONT_YAW + sideTurn;
    presentation.current.rotation.y += (targetYaw - presentation.current.rotation.y) * Math.min(1, dt * 7.5);
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
        camera={{ position: [0, 1.08, 8], zoom: 70, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={2.25} />
        <hemisphereLight color="#ffffff" groundColor="#64748b" intensity={1.85} />
        <directionalLight position={[3, 5, 6]} intensity={3.25} />
        <directionalLight position={[-3, 2, 4]} intensity={1.55} />
        <Suspense fallback={<Loading />}>
          <CharacterScene mode={props.mode} facing={props.facing} emotion={props.emotion} />
        </Suspense>
      </Canvas>
    </button>
  );
}

useFBX.preload(FLOW_MODEL_URL);
