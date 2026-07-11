"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useFBX, useTexture } from "@react-three/drei";
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Box3,
  Color,
  DoubleSide,
  Euler,
  Group,
  LoopOnce,
  LoopRepeat,
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
import { buildAnimationCatalog, chooseClipForMode } from "./animationCatalog";
import { FLOW_FRONT_YAW, FLOW_MODEL_URL } from "./animationLibrary";
import { FlowEmotion, FlowFacing, FlowMode } from "./types";

type Props = {
  mode: FlowMode;
  facing: FlowFacing;
  emotion: FlowEmotion;
  behaviourPulse?: number;
  behaviourId?: string | null;
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
  const result: FaceRig = { meshes: [], blinkLeft: [], blinkRight: [], smile: [], browUp: [] };

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
      const packed = meshIndex * 10000 + Number(index);
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

function removeRootTranslation(clip: AnimationClip) {
  const clean = clip.clone();
  clean.tracks = clean.tracks.filter((track) => {
    const name = normalizeBone(track.name);
    const isRoot = /root|armature|pelvis|hips/.test(name);
    return !(isRoot && /\.position$/i.test(track.name));
  });
  clean.resetDuration();
  return clean;
}

const tempEuler = new Euler();
const tempQuat = new Quaternion();

function multiplyLocalRotation(node: Object3D | undefined, x: number, y: number, z: number) {
  if (!node) return;
  tempEuler.set(x, y, z, "XYZ");
  tempQuat.setFromEuler(tempEuler);
  node.quaternion.multiply(tempQuat);
}

function applyRestRotation(
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
  const target = rest.quaternion.clone().multiply(tempQuat);
  node.quaternion.slerp(target, alpha);
}

function applyRestPosition(
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
  node.position.lerp(new Vector3(rest.position.x + x, rest.position.y + y, rest.position.z + z), alpha);
}

function CharacterScene({ mode, facing, emotion, behaviourPulse = 0, behaviourId = null }: Omit<Props, "onClick">) {
  const presentation = useRef<Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const restPose = useRef(new Map<Object3D, RestTransform>());
  const rig = useRef<BoneRig>({});
  const face = useRef<FaceRig>({ meshes: [], blinkLeft: [], blinkRight: [], smile: [], browUp: [] });
  const mixerRef = useRef<AnimationMixer | null>(null);
  const activeActionRef = useRef<AnimationAction | null>(null);
  const activeClipRef = useRef<AnimationClip | null>(null);
  const recentClipsRef = useRef<string[]>([]);
  const nextIdleVariationAt = useRef(0);
  const blinkStartedAt = useRef(-1);
  const nextBlinkAt = useRef(1.8);
  const modeEnteredAt = useRef(0);
  const lastMode = useRef<FlowMode>(mode);
  const activeBehaviourId = useRef<string | null>(behaviourId);
  const idleVariant = useRef(0);
  const lastBehaviourPulse = useRef(behaviourPulse);

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
    const scale = 3.18 / Math.max(size.y, 0.001);
    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -bounds.min.y * scale - 1.43, -center.z * scale);

    pose.set(clone, {
      position: clone.position.clone(),
      quaternion: clone.quaternion.clone(),
      scale: clone.scale.clone(),
    });

    restPose.current = pose;
    rig.current = {
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

  const catalog = useMemo(
    () => buildAnimationCatalog((source.animations || []).map(removeRootTranslation)),
    [source],
  );

  useEffect(() => {
    const mixer = new AnimationMixer(model);
    mixerRef.current = mixer;
    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      mixerRef.current = null;
    };
  }, [model]);

  const playClip = (clip: AnimationClip | null, requestedMode: FlowMode) => {
    const mixer = mixerRef.current;
    if (!mixer) return;
    const previous = activeActionRef.current;

    if (!clip) {
      previous?.fadeOut(0.22);
      activeActionRef.current = null;
      activeClipRef.current = null;
      return;
    }

    if (activeClipRef.current?.uuid === clip.uuid && previous) return;

    const action = mixer.clipAction(clip, model);
    action.reset();
    action.enabled = true;
    action.setEffectiveWeight(1);
    action.setEffectiveTimeScale(requestedMode === "walking" ? 1.08 : 1);

    const oneShot = requestedMode === "waving" || requestedMode === "pointing";
    action.setLoop(oneShot ? LoopOnce : LoopRepeat, oneShot ? 1 : Infinity);
    action.clampWhenFinished = oneShot;
    action.fadeIn(0.24).play();
    previous?.fadeOut(0.24);

    activeActionRef.current = action;
    activeClipRef.current = clip;
    recentClipsRef.current = [clip.name, ...recentClipsRef.current.filter((name) => name !== clip.name)].slice(0, 5);
  };

  useEffect(() => {
    activeBehaviourId.current = behaviourId;
    idleVariant.current = behaviourPulse % 6;
    const clip = chooseClipForMode(catalog, mode, emotion, recentClipsRef.current);
    playClip(clip, mode);
    // useFrame owns the Three.js clock; it will timestamp this state change.
  }, [catalog, mode, emotion.energy, emotion.stress, behaviourPulse, behaviourId]);

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
    mixerRef.current?.update(dt);

    if (lastMode.current !== mode) {
      lastMode.current = mode;
      modeEnteredAt.current = elapsed;
    }

    if (lastBehaviourPulse.current !== behaviourPulse) {
      lastBehaviourPulse.current = behaviourPulse;
      modeEnteredAt.current = elapsed;
    }

    const energy = MathUtils.clamp(emotion.energy, 0, 1);
    const calm = MathUtils.clamp(emotion.calm, 0, 1);
    const attention = MathUtils.clamp(emotion.attention, 0, 1);
    const joy = MathUtils.clamp(emotion.joy, 0, 1);
    const empathy = MathUtils.clamp(emotion.empathy, 0, 1);
    const stress = MathUtils.clamp(emotion.stress, 0, 1);
    const modeTime = elapsed - modeEnteredAt.current;
    const hasClip = Boolean(activeActionRef.current && activeClipRef.current);

    if (mode === "idle" && elapsed >= nextIdleVariationAt.current && catalog.idle.length > 1) {
      const clip = chooseClipForMode(catalog, "idle", emotion, recentClipsRef.current);
      playClip(clip, "idle");
      nextIdleVariationAt.current = elapsed + 7 + Math.random() * 9;
    }

    const breath = Math.sin(elapsed * (0.92 + energy * 0.42 + stress * 0.2) * Math.PI * 2);
    const sway = Math.sin(elapsed * 0.43) * (0.009 + (1 - calm) * 0.008);

    if (hasClip) {
      // Add only subtle life on top of the real full-body clip.
      multiplyLocalRotation(rig.current.spine01, breath * 0.0025, 0, sway * 0.18);
      multiplyLocalRotation(rig.current.spine02, breath * 0.0055, 0, -sway * 0.25);

      if (mode !== "walking" && mode !== "waving" && mode !== "pointing") {
        const pointerYaw = pointer.current.x * 0.045 * attention;
        const pointerPitch = -pointer.current.y * 0.025 * attention;
        multiplyLocalRotation(rig.current.neck, pointerPitch * 0.32, pointerYaw * 0.32, 0);
        multiplyLocalRotation(rig.current.head, pointerPitch * 0.55, pointerYaw * 0.55, 0);
      }

      if (mode === "idle" && activeBehaviourId.current) {
        const local = modeTime;
        const intro = MathUtils.smoothstep(Math.min(local / 0.4, 1), 0, 1);
        const outro = local > 1.55
          ? 1 - MathUtils.smoothstep(Math.min((local - 1.55) / 0.65, 1), 0, 1)
          : 1;
        const amount = intro * outro;
        const variant = idleVariant.current;

        if (variant % 3 === 0) {
          multiplyLocalRotation(rig.current.pelvis, 0, 0, Math.sin(local * 1.2) * 0.012 * amount);
          multiplyLocalRotation(rig.current.spine02, 0, 0, -Math.sin(local * 1.2) * 0.01 * amount);
        } else if (variant % 3 === 1) {
          multiplyLocalRotation(rig.current.neck, -0.008 * amount, 0.035 * amount, 0.01 * amount);
          multiplyLocalRotation(rig.current.head, -0.014 * amount, 0.045 * amount, 0.012 * amount);
        } else {
          multiplyLocalRotation(rig.current.spine01, -0.014 * amount, 0, 0);
          multiplyLocalRotation(rig.current.spine02, -0.022 * amount, 0, 0);
          multiplyLocalRotation(rig.current.leftShoulder, 0, 0, 0.018 * amount);
          multiplyLocalRotation(rig.current.rightShoulder, 0, 0, -0.018 * amount);
        }
      }
    } else {
      // Conservative fallback for files without an appropriate named clip.
      let pelvisY = 0;
      let pelvisZ = sway * 0.25;
      let chestX = breath * (0.006 + energy * 0.002);
      let chestY = 0;
      let chestZ = -sway * 0.4;
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

      if (mode === "idle") {
        const variant = idleVariant.current;
        const local = modeTime;
        const easeIn = MathUtils.smoothstep(Math.min(local / 0.45, 1), 0, 1);
        const easeOut = local > 1.7
          ? 1 - MathUtils.smoothstep(Math.min((local - 1.7) / 0.7, 1), 0, 1)
          : 1;
        const amount = easeIn * easeOut;

        if (variant === 0) {
          pelvisZ += Math.sin(local * 1.35) * 0.018 * amount;
          chestZ += -Math.sin(local * 1.35) * 0.018 * amount;
          headZ += Math.sin(local * 0.9) * 0.012 * amount;
        } else if (variant === 1) {
          headY += 0.06 * amount;
          headX -= 0.012 * amount;
          chestY -= 0.02 * amount;
        } else if (variant === 2) {
          leftUpperZ += 0.035 * amount;
          rightUpperZ -= 0.035 * amount;
          chestX -= 0.018 * amount;
          headX += 0.01 * amount;
        } else if (variant === 3) {
          pelvisY += 0.008 * amount;
          chestX += 0.028 * amount;
          headX -= 0.018 * amount;
        } else if (variant === 4) {
          headY -= 0.055 * amount;
          headZ += 0.018 * amount;
          chestY += 0.018 * amount;
        } else {
          pelvisZ += 0.014 * amount;
          leftThighX += 0.02 * amount;
          rightThighX -= 0.014 * amount;
          headY += Math.sin(local * 0.8) * 0.015 * amount;
        }
      }

      if (mode === "walking") {
        const cadence = 1.48 + energy * 0.34;
        const phase = elapsed * Math.PI * 2 * cadence;
        const stride = 0.38 + energy * 0.08;
        const leftStep = Math.sin(phase);
        const rightStep = -leftStep;
        leftThighX = leftStep * stride;
        rightThighX = rightStep * stride;
        leftCalfX = Math.max(0, -leftStep) * 0.48;
        rightCalfX = Math.max(0, -rightStep) * 0.48;
        leftFootX = -Math.max(0, leftStep) * 0.16;
        rightFootX = -Math.max(0, rightStep) * 0.16;
        leftUpperX = -leftStep * 0.25;
        rightUpperX = -rightStep * 0.25;
        pelvisY = Math.abs(Math.sin(phase)) * 0.012;
        pelvisZ = Math.sin(phase) * 0.025;
        chestY = -Math.sin(phase) * 0.018;
        chestX = 0.016;
      } else if (mode === "waving") {
        // Deliberately restrained fallback: one-arm greeting without forcing the shoulder behind the body.
        const intro = MathUtils.smoothstep(Math.min(modeTime / 0.45, 1), 0, 1);
        const outro = modeTime > 1.45
          ? 1 - MathUtils.smoothstep(Math.min((modeTime - 1.45) / 0.55, 1), 0, 1)
          : 1;
        const amount = intro * outro;
        const wave = Math.sin(modeTime * 7.2) * 0.12;
        rightUpperX = -0.22 * amount;
        rightUpperZ = -0.52 * amount;
        rightForeY = (-0.32 + wave) * amount;
        headZ = 0.025 * amount;
        chestY = -0.022 * amount;
      } else if (mode === "pointing") {
        const amount = MathUtils.smoothstep(Math.min(modeTime / 0.35, 1), 0, 1);
        rightUpperX = -0.12 * amount;
        rightUpperZ = -0.48 * amount;
        rightForeY = -0.08 * amount;
        headY = -0.055 * amount;
      } else if (mode === "talking") {
        const gesture = Math.sin(elapsed * (1.8 + energy));
        leftUpperZ = 0.06 + gesture * 0.035;
        rightUpperZ = -0.06 - gesture * 0.035;
        leftForeY = -0.045 + Math.sin(elapsed * 1.2 + 1.4) * 0.05;
        rightForeY = 0.045 - gesture * 0.05;
        chestY = gesture * 0.01;
      } else if (mode === "thinking") {
        headX = -0.025;
        headY = 0.055 + Math.sin(elapsed * 0.45) * 0.015;
        chestX += 0.014;
      } else if (mode === "listening") {
        headZ = 0.03 * empathy;
        headX = -0.012;
        chestX -= 0.008;
      } else {
        pelvisZ += Math.sin(elapsed * 0.23) * 0.01;
        headY += Math.sin(elapsed * 0.29) * 0.01 * attention;
        headZ += Math.sin(elapsed * 0.17 + 2.1) * 0.007;
      }

      if (mode !== "walking" && mode !== "waving" && mode !== "pointing") {
        headY += pointer.current.x * 0.05 * attention;
        headX += -pointer.current.y * 0.025 * attention;
      }

      applyRestPosition(rig.current.pelvis, restPose.current, 0, pelvisY, 0, alpha);
      applyRestRotation(rig.current.pelvis, restPose.current, 0, pelvisY * 0.15, pelvisZ, alpha);
      applyRestRotation(rig.current.spine01, restPose.current, chestX * 0.45, chestY * 0.45, chestZ * 0.55, alpha);
      applyRestRotation(rig.current.spine02, restPose.current, chestX, chestY, chestZ, alpha);
      applyRestRotation(rig.current.neck, restPose.current, headX * 0.35, headY * 0.35, headZ * 0.35, alpha);
      applyRestRotation(rig.current.head, restPose.current, headX * 0.65, headY * 0.65, headZ * 0.65, alpha);
      applyRestRotation(rig.current.leftUpperArm, restPose.current, leftUpperX, 0, leftUpperZ, alpha);
      applyRestRotation(rig.current.rightUpperArm, restPose.current, rightUpperX, 0, rightUpperZ, alpha);
      applyRestRotation(rig.current.leftForeArm, restPose.current, 0, leftForeY, 0, alpha);
      applyRestRotation(rig.current.rightForeArm, restPose.current, 0, rightForeY, 0, alpha);
      applyRestRotation(rig.current.leftThigh, restPose.current, leftThighX, 0, 0, alpha);
      applyRestRotation(rig.current.rightThigh, restPose.current, rightThighX, 0, 0, alpha);
      applyRestRotation(rig.current.leftCalf, restPose.current, leftCalfX, 0, 0, alpha);
      applyRestRotation(rig.current.rightCalf, restPose.current, rightCalfX, 0, 0, alpha);
      applyRestRotation(rig.current.leftFoot, restPose.current, leftFootX, 0, 0, alpha);
      applyRestRotation(rig.current.rightFoot, restPose.current, rightFootX, 0, 0, alpha);
    }

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
    setMorph(face.current, face.current.smile, MathUtils.clamp(joy * 0.58 + (mode === "waving" ? 0.2 : 0), 0, 0.8));
    setMorph(face.current, face.current.browUp, MathUtils.clamp(emotion.curiosity * 0.25 + (mode === "thinking" ? 0.12 : 0), 0, 0.5));

    if (!presentation.current) return;
    const sideTurn = facing === "left" ? 0.58 : facing === "right" ? -0.58 : 0;
    const targetYaw = FLOW_FRONT_YAW + sideTurn;
    presentation.current.rotation.y += (targetYaw - presentation.current.rotation.y) * Math.min(1, dt * 7.2);
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
          <CharacterScene
            mode={props.mode}
            facing={props.facing}
            emotion={props.emotion}
            behaviourPulse={props.behaviourPulse}
            behaviourId={props.behaviourId}
          />
        </Suspense>
      </Canvas>
    </button>
  );
}

useFBX.preload(FLOW_MODEL_URL);
