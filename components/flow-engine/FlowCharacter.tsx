"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import {
  AnimationClip,
  Box3,
  Euler,
  Group,
  MathUtils,
  Mesh,
  Object3D,
  Quaternion,
  Vector3,
} from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { buildAnimationCatalog } from "./animationCatalog";
import { FlowAnimationEngine } from "./animationEngine";
import { FLOW_FRONT_YAW, FLOW_MODEL_URL } from "./animationLibrary";
import { FlowEmotion, FlowFacing, FlowMode } from "./types";
import { FlowCinematicLifeEngine } from "./cinematicLifeEngine";

type Props = {
  mode: FlowMode;
  facing: FlowFacing;
  emotion: FlowEmotion;
  behaviourPulse?: number;
  behaviourId?: string | null;
  gaitSpeed?: number;
  speechLevel?: number;
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
  leftEye?: Object3D;
  rightEye?: Object3D;
  leftIndex?: Object3D;
  rightIndex?: Object3D;
  leftMiddle?: Object3D;
  rightMiddle?: Object3D;
};

type FaceRig = {
  meshes: Mesh[];
  blinkLeft: number[];
  blinkRight: number[];
  smile: number[];
  browUp: number[];
  mouthOpen: number[];
  browDown: number[];
  squintLeft: number[];
  squintRight: number[];
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

function Loading() {
  return (
    <Html center>
      <span className="flow-engine-loading">Cargando Flow…</span>
    </Html>
  );
}

function buildFaceRig(root: Object3D): FaceRig {
  const result: FaceRig = { meshes: [], blinkLeft: [], blinkRight: [], smile: [], browUp: [], mouthOpen: [], browDown: [], squintLeft: [], squintRight: [] };

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
      if (/jawopen|mouthopen|visemeaa|visemeoh|visemeo/.test(name)) result.mouthOpen.push(packed);
      if (/browdown|eyebrowdown|frown/.test(name)) result.browDown.push(packed);
      if (/squintleft|eyesquintleft|leftsquint/.test(name)) result.squintLeft.push(packed);
      if (/squintright|eyesquintright|rightsquint/.test(name)) result.squintRight.push(packed);
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

function CharacterScene({ mode, facing, emotion, behaviourPulse = 0, behaviourId = null, gaitSpeed = 0, speechLevel = 0 }: Omit<Props, "onClick">) {
  const presentation = useRef<Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const restPose = useRef(new Map<Object3D, RestTransform>());
  const rig = useRef<BoneRig>({});
  const face = useRef<FaceRig>({ meshes: [], blinkLeft: [], blinkRight: [], smile: [], browUp: [], mouthOpen: [], browDown: [], squintLeft: [], squintRight: [] });
  const cinematicLife = useRef(new FlowCinematicLifeEngine());
  const animationEngineRef = useRef<FlowAnimationEngine | null>(null);
  const nextIdleVariationAt = useRef(0);
  const blinkStartedAt = useRef(-1);
  const nextBlinkAt = useRef(1.8);
  const modeEnteredAt = useRef(0);
  const lastMode = useRef<FlowMode>(mode);
  const activeBehaviourId = useRef<string | null>(behaviourId);
  const idleVariant = useRef(0);
  const lastBehaviourPulse = useRef(behaviourPulse);

  const source = useGLTF(FLOW_MODEL_URL);

  const model = useMemo(() => {
    const clone = cloneSkeleton(source.scene) as Group;
    const pose = new Map<Object3D, RestTransform>();
    const boneMap = buildBoneMap(clone);

    clone.traverse((node) => {
      pose.set(node, {
        position: node.position.clone(),
        quaternion: node.quaternion.clone(),
        scale: node.scale.clone(),
      });
      if (!isMesh(node)) return;
      const normalizedName = normalizeBone(node.name);
      if (normalizedName.startsWith("ctrl") || normalizedName.startsWith("ik")) {
        node.visible = false;
        return;
      }
      node.frustumCulled = false;
      node.castShadow = false;
      node.receiveShadow = false;
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
      pelvis: findBone(boneMap, ["J hip", "Pelvis", "Hips", "Hip"]),
      spine01: findBone(boneMap, ["J spline", "Spine01", "Spine1", "Spine"]),
      spine02: findBone(boneMap, ["J chest", "Spine02", "Spine2", "Chest", "UpperChest"]),
      neck: findBone(boneMap, ["J neck", "NeckTwist01", "Neck"]),
      head: findBone(boneMap, ["J head", "Head"]),
      leftShoulder: findBone(boneMap, ["J shoulder l", "J shoulder upper l", "LeftShoulder", "Shoulder_L", "LShoulder"]),
      rightShoulder: findBone(boneMap, ["J shoulder r", "J shoulder upper r", "RightShoulder", "Shoulder_R", "RShoulder"]),
      leftUpperArm: findBone(boneMap, ["J arm l", "LeftArm", "LeftUpperArm", "UpperArm_L", "LUpperArm"]),
      rightUpperArm: findBone(boneMap, ["J arm r", "RightArm", "RightUpperArm", "UpperArm_R", "RUpperArm"]),
      leftForeArm: findBone(boneMap, ["J hand l", "LeftForeArm", "LeftLowerArm", "ForeArm_L", "LForeArm"]),
      rightForeArm: findBone(boneMap, ["J hand r", "RightForeArm", "RightLowerArm", "ForeArm_R", "RForeArm"]),
      leftHand: findBone(boneMap, ["J hand l", "LeftHand", "Hand_L", "LHand"]),
      rightHand: findBone(boneMap, ["J hand r", "RightHand", "Hand_R", "RHand"]),
      leftThigh: findBone(boneMap, ["J leg l", "LeftUpLeg", "LeftThigh", "Thigh_L", "LThigh"]),
      rightThigh: findBone(boneMap, ["J leg r", "RightUpLeg", "RightThigh", "Thigh_R", "RThigh"]),
      leftCalf: findBone(boneMap, ["J knee l", "LeftLeg", "LeftCalf", "Calf_L", "LCalf"]),
      rightCalf: findBone(boneMap, ["J knee r", "RightLeg", "RightCalf", "Calf_R", "RCalf"]),
      leftFoot: findBone(boneMap, ["J foot l", "LeftFoot", "Foot_L", "LFoot"]),
      rightFoot: findBone(boneMap, ["J foot r", "RightFoot", "Foot_R", "RFoot"]),
      leftEye: findBone(boneMap, ["LeftEye", "Eye_L", "LEye"]),
      rightEye: findBone(boneMap, ["RightEye", "Eye_R", "REye"]),
      leftIndex: findBone(boneMap, ["LeftHandIndex1", "LeftIndex1", "Index1_L"]),
      rightIndex: findBone(boneMap, ["RightHandIndex1", "RightIndex1", "Index1_R"]),
      leftMiddle: findBone(boneMap, ["LeftHandMiddle1", "LeftMiddle1", "Middle1_L"]),
      rightMiddle: findBone(boneMap, ["RightHandMiddle1", "RightMiddle1", "Middle1_R"]),
    };
    face.current = buildFaceRig(clone);
    return clone;
  }, [source.scene]);

  const catalog = useMemo(
    () => buildAnimationCatalog((source.animations || []).map(removeRootTranslation)),
    [source.animations],
  );

  useEffect(() => {
    const engine = new FlowAnimationEngine(model, catalog);
    animationEngineRef.current = engine;
    return () => {
      engine.dispose();
      if (animationEngineRef.current === engine) animationEngineRef.current = null;
    };
  }, [model, catalog]);

  useEffect(() => {
    activeBehaviourId.current = behaviourId;
    idleVariant.current = behaviourPulse % 6;

    // The throne and greeting both use authored animation clips. The dedicated
    // greeting bends the elbow, raises the hand beside the face and waves from
    // the wrist, instead of extending the arm sideways.
    animationEngineRef.current?.playMode(mode, emotion, { force: mode === "seated" || mode === "waving" });
    // useFrame owns the Three.js clock; it will timestamp this state change.
  }, [mode, emotion.energy, emotion.stress, emotion.joy, emotion.attention, behaviourPulse, behaviourId]);

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
    animationEngineRef.current?.update(dt);
    if (mode === "walking") animationEngineRef.current?.setLocomotionSpeed(gaitSpeed);

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
    const life = cinematicLife.current.update(elapsed, dt, pointer.current.x, pointer.current.y, emotion, mode);
    const modeTime = elapsed - modeEnteredAt.current;
    const hasClip = Boolean(animationEngineRef.current?.hasActiveClip);

    if (mode === "idle" && elapsed >= nextIdleVariationAt.current && catalog.idle.length > 1) {
      animationEngineRef.current?.playMode("idle", emotion, { force: true });
      nextIdleVariationAt.current = elapsed + 7 + Math.random() * 9;
    }

    const breath = life.breath;
    const sway = life.bodySway;

    if (hasClip) {
      // Add only subtle life on top of the real full-body clip.
      multiplyLocalRotation(rig.current.spine01, breath * 0.0025, 0, sway * 0.18);
      multiplyLocalRotation(rig.current.spine02, breath * 0.0055, 0, -sway * 0.25);

      if (mode !== "walking" && mode !== "waving" && mode !== "pointing" && mode !== "dragging") {
        const seatedBoost = mode === "seated" ? 1.55 : 1;
        const pointerYaw = life.headYaw * seatedBoost;
        const pointerPitch = life.headPitch * seatedBoost;
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
      let rightHandX = 0;
      let rightHandY = 0;
      let rightHandZ = 0;
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

      if (mode === "seated") {
        // Resting pose for Flow's throne. Keep this procedural so it remains
        // compatible with the master rig even when no dedicated sit clip exists.
        const settle = MathUtils.smoothstep(Math.min(modeTime / 0.75, 1), 0, 1);
        const relaxedBreath = Math.sin(elapsed * 1.15) * 0.006;
        // Mixamo-style rigs bend the thighs forward on positive local X and the
        // knees backwards on negative local X. The previous signs produced an
        // almost kneeling/backwards pose on the throne.
        pelvisY = -0.115 * settle;
        chestX = (-0.055 + relaxedBreath) * settle;
        chestZ = Math.sin(elapsed * 0.35) * 0.006 * settle;
        leftThighX = 1.08 * settle;
        rightThighX = 1.08 * settle;
        leftCalfX = -1.22 * settle;
        rightCalfX = -1.22 * settle;
        leftFootX = 0.16 * settle;
        rightFootX = 0.16 * settle;
        leftUpperX = 0.34 * settle;
        rightUpperX = 0.34 * settle;
        leftUpperZ = 0.12 * settle;
        rightUpperZ = -0.12 * settle;
        leftForeY = -0.24 * settle;
        rightForeY = 0.24 * settle;
        headX = 0.025 * settle;
        headZ = Math.sin(elapsed * 0.28) * 0.005;
      } else if (mode === "dragging") {
        // Mii-style dangling reaction while the user grabs Flow by the head.
        const kick = Math.sin(elapsed * 11.5);
        const counterKick = Math.sin(elapsed * 11.5 + Math.PI);
        pelvisY = -0.018 + Math.abs(Math.sin(elapsed * 5.75)) * 0.008;
        pelvisZ = Math.sin(elapsed * 4.4) * 0.045;
        chestX = -0.035;
        chestZ = -pelvisZ * 0.55;
        headZ = Math.sin(elapsed * 3.8) * 0.025;
        leftThighX = 0.22 + kick * 0.24;
        rightThighX = 0.22 + counterKick * 0.24;
        leftCalfX = 0.28 + Math.max(0, -kick) * 0.38;
        rightCalfX = 0.28 + Math.max(0, -counterKick) * 0.38;
        leftFootX = -0.12 - Math.max(0, kick) * 0.12;
        rightFootX = -0.12 - Math.max(0, counterKick) * 0.12;
        leftUpperX = -0.2 + counterKick * 0.1;
        rightUpperX = -0.2 + kick * 0.1;
        leftUpperZ = 0.22 + Math.sin(elapsed * 7.2) * 0.08;
        rightUpperZ = -0.22 - Math.sin(elapsed * 7.2 + 0.8) * 0.08;
        leftForeY = -0.12 + Math.sin(elapsed * 8.4) * 0.12;
        rightForeY = 0.12 - Math.sin(elapsed * 8.4 + 0.6) * 0.12;
      } else if (mode === "walking") {
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
        // Friendly, unmistakable greeting. Flow first raises the hand beside his
        // face, opens the palm toward the visitor and then performs two wrist
        // waves before returning naturally to idle.
        const raise = MathUtils.smoothstep(Math.min(modeTime / 0.55, 1), 0, 1);
        const lower = modeTime > 2.35
          ? 1 - MathUtils.smoothstep(Math.min((modeTime - 2.35) / 0.55, 1), 0, 1)
          : 1;
        const amount = raise * lower;
        const waveWindow = MathUtils.smoothstep(Math.min(Math.max((modeTime - 0.48) / 0.22, 0), 1), 0, 1)
          * (modeTime > 2.15
            ? 1 - MathUtils.smoothstep(Math.min((modeTime - 2.15) / 0.2, 1), 0, 1)
            : 1);
        const wave = Math.sin((modeTime - 0.45) * 10.4) * waveWindow;

        // Shoulder and upper arm place the hand clearly beside the head instead
        // of leaving the arm diagonally extended at waist height.
        rightUpperX = -0.34 * amount;
        rightUpperZ = -1.28 * amount;
        rightForeY = (-1.08 + wave * 0.12) * amount;

        // Most of the greeting comes from the wrist, as in a real human wave.
        rightHandX = -0.12 * amount;
        rightHandY = (0.08 + wave * 0.42) * amount;
        rightHandZ = 0.12 * amount;

        // The whole body participates subtly: eye contact, a small head tilt and
        // a gentle lean make the gesture feel welcoming rather than mechanical.
        headZ = 0.055 * amount;
        headY = -0.045 * amount;
        headX = -0.018 * amount;
        chestY = -0.045 * amount;
        chestZ = 0.018 * amount;
      } else if (mode === "pointing") {
        const amount = MathUtils.smoothstep(Math.min(modeTime / 0.35, 1), 0, 1);
        rightUpperX = -0.025 * amount;
        rightUpperZ = -0.12 * amount;
        rightForeY = -0.018 * amount;
        headY = -0.035 * amount;
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

      if (mode !== "walking" && mode !== "waving" && mode !== "pointing" && mode !== "dragging") {
        const seatedBoost = mode === "seated" ? 1.75 : 1;
        headY += pointer.current.x * 0.05 * attention * seatedBoost;
        headX += -pointer.current.y * 0.025 * attention * seatedBoost;
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
      applyRestRotation(rig.current.rightHand, restPose.current, rightHandX, rightHandY, rightHandZ, alpha);
      applyRestRotation(rig.current.leftThigh, restPose.current, leftThighX, 0, 0, alpha);
      applyRestRotation(rig.current.rightThigh, restPose.current, rightThighX, 0, 0, alpha);
      applyRestRotation(rig.current.leftCalf, restPose.current, leftCalfX, 0, 0, alpha);
      applyRestRotation(rig.current.rightCalf, restPose.current, rightCalfX, 0, 0, alpha);
      applyRestRotation(rig.current.leftFoot, restPose.current, leftFootX, 0, 0, alpha);
      applyRestRotation(rig.current.rightFoot, restPose.current, rightFootX, 0, 0, alpha);
    }

    // Cinematic secondary motion layered over every animation clip.
    if (mode !== "walking" && mode !== "dragging") {
      multiplyLocalRotation(rig.current.pelvis, 0, 0, life.weightShift);
      multiplyLocalRotation(rig.current.spine01, life.breathLift * 0.38, 0, -life.weightShift * 0.45);
      multiplyLocalRotation(rig.current.spine02, life.breathLift, 0, life.bodySway * 0.35);
      multiplyLocalRotation(rig.current.leftShoulder, 0, 0, life.shoulderLift);
      multiplyLocalRotation(rig.current.rightShoulder, 0, 0, -life.shoulderLift);
      multiplyLocalRotation(rig.current.leftIndex, life.fingerCurl, 0, 0);
      multiplyLocalRotation(rig.current.rightIndex, life.fingerCurl, 0, 0);
      multiplyLocalRotation(rig.current.leftMiddle, life.fingerCurl * 0.72, 0, 0);
      multiplyLocalRotation(rig.current.rightMiddle, life.fingerCurl * 0.72, 0, 0);
    }
    multiplyLocalRotation(rig.current.leftEye, life.eyePitch, life.eyeYaw, 0);
    multiplyLocalRotation(rig.current.rightEye, life.eyePitch, life.eyeYaw, 0);

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
    setMorph(face.current, face.current.smile, life.smile);
    setMorph(face.current, face.current.browUp, life.browUp);
    setMorph(face.current, face.current.browDown, life.browDown);
    setMorph(face.current, face.current.squintLeft, life.squint);
    setMorph(face.current, face.current.squintRight, life.squint);
    const talkAmount = mode === "talking" ? MathUtils.clamp(speechLevel, 0, 1) : 0;
    setMorph(face.current, face.current.mouthOpen, talkAmount * 0.82);

    if (!presentation.current) return;
    // The official GLB is normalized once through FLOW_FRONT_YAW.
    // Screen-left/right remain quarter turns around the vertical axis.
    const sideTurn = facing === "left" ? -Math.PI / 2 : facing === "right" ? Math.PI / 2 : 0;
    const targetYaw = FLOW_FRONT_YAW + sideTurn;
    presentation.current.rotation.y += (targetYaw - presentation.current.rotation.y) * Math.min(1, dt * 7.2);

    // The dedicated sitting clip bends the skeleton. This offset aligns the pelvis
    // with the throne cushion instead of leaving Flow floating above it.
    const targetPresentationY = mode === "seated" ? -0.08 : 0;
    const targetPresentationZ = mode === "seated" ? -0.04 : 0;
    const targetPresentationScale = mode === "seated" ? 0.92 : 1;
    presentation.current.position.y += (targetPresentationY - presentation.current.position.y) * Math.min(1, dt * 7.5);
    presentation.current.position.z += (targetPresentationZ - presentation.current.position.z) * Math.min(1, dt * 7.5);
    const scaleAlpha = Math.min(1, dt * 7.5);
    presentation.current.scale.x += (targetPresentationScale - presentation.current.scale.x) * scaleAlpha;
    presentation.current.scale.y += (targetPresentationScale - presentation.current.scale.y) * scaleAlpha;
    presentation.current.scale.z += (targetPresentationScale - presentation.current.scale.z) * scaleAlpha;
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
        dpr={[1, 1.35]}
        gl={{ alpha: true, antialias: true, premultipliedAlpha: false, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={1.15} />
        <hemisphereLight color="#ffffff" groundColor="#334155" intensity={1.1} />
        <directionalLight position={[3.8, 5.6, 6]} intensity={3.15} />
        <directionalLight position={[-3.2, 2.4, 4]} intensity={1.15} />
        <pointLight position={[0, 2.7, 3.8]} intensity={0.72} distance={9} decay={2} />
        <Suspense fallback={<Loading />}>
          <CharacterScene
            mode={props.mode}
            facing={props.facing}
            emotion={props.emotion}
            behaviourPulse={props.behaviourPulse}
            behaviourId={props.behaviourId}
            gaitSpeed={props.gaitSpeed}
            speechLevel={props.speechLevel}
          />
        </Suspense>
      </Canvas>
    </button>
  );
}

useGLTF.preload(FLOW_MODEL_URL);
