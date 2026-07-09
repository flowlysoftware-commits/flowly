"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Html, useFBX } from "@react-three/drei";
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Box3,
  Color,
  Group,
  LoopRepeat,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  TextureLoader,
  Vector3,
} from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

type FlowMode = "idle" | "walk" | "wave" | "talk" | "point" | "thinking";

type FlowRealAssistant3DProps = {
  mode?: FlowMode;
  facing?: "left" | "right" | "front";
  compact?: boolean;
  onClick?: () => void;
};

type FlowBoneRig = {
  head?: Object3D;
  neck?: Object3D;
  spine?: Object3D;
  chest?: Object3D;
  leftArm?: Object3D;
  rightArm?: Object3D;
  leftForeArm?: Object3D;
  rightForeArm?: Object3D;
  leftHand?: Object3D;
  rightHand?: Object3D;
  leftUpLeg?: Object3D;
  rightUpLeg?: Object3D;
  leftLeg?: Object3D;
  rightLeg?: Object3D;
  leftFoot?: Object3D;
  rightFoot?: Object3D;
};

type BoneBasePose = {
  object: Object3D;
  x: number;
  y: number;
  z: number;
};

const FLOW_BASE_ROTATION = Math.PI;

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

function findBone(root: Object3D, patterns: RegExp[]) {
  let result: Object3D | undefined;

  root.traverse((object) => {
    if (result) return;
    const name = object.name || "";
    if (patterns.some((pattern) => pattern.test(name))) result = object;
  });

  return result;
}

function getFirstClip(group: Group, fallbackName: string) {
  const clip = group.animations?.[0];
  if (!clip) return null;
  return clip.clone().resetDuration().optimize() || new AnimationClip(fallbackName, -1, clip.tracks);
}

function captureBasePose(rig: FlowBoneRig) {
  const bones = Object.values(rig).filter(Boolean) as Object3D[];
  return bones.map((object) => ({
    object,
    x: object.rotation.x,
    y: object.rotation.y,
    z: object.rotation.z,
  }));
}

function restoreBasePose(basePose: BoneBasePose[]) {
  for (const pose of basePose) {
    pose.object.rotation.set(pose.x, pose.y, pose.z);
  }
}

function FlowModel({ mode = "idle", facing = "front", compact = true }: Required<Pick<FlowRealAssistant3DProps, "mode" | "facing" | "compact">>) {
  const rootRef = useRef<Group>(null);
  const modelRef = useRef<Group | null>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const currentActionRef = useRef<AnimationAction | null>(null);
  const actionsRef = useRef<Partial<Record<FlowMode, AnimationAction>>>({});

  const fbx = useFBX("/models/flow/flow.fbx") as Group;
  const idleFbx = useFBX("/avatars/Idle.fbx") as Group;
  const walkFbx = useFBX("/avatars/Walking.fbx") as Group;
  const talkFbx = useFBX("/avatars/Talking.fbx") as Group;
  const waveFbx = useFBX("/avatars/Waving.fbx") as Group;
  const pointFbx = useFBX("/avatars/Pointing.fbx") as Group;

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
    const targetHeight = compact ? 2.22 : 3.15;
    const scale = targetHeight / height;

    cloned.position.set(-center.x * scale, -box.min.y * scale - (compact ? 1.1 : 1.72), -center.z * scale);
    cloned.scale.setScalar(scale);
    cloned.rotation.y = FLOW_BASE_ROTATION;

    cloned.traverse((object) => {
      if (!isMesh(object)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = false;

      object.material = new MeshStandardMaterial({
        map: colorMap,
        normalMap,
        roughnessMap,
        metalnessMap,
        color: new Color("#ffffff"),
        roughness: 0.72,
        metalness: 0.1,
      });
    });

    const rig: FlowBoneRig = {
      head: findBone(cloned, [/head/i]),
      neck: findBone(cloned, [/neck/i]),
      spine: findBone(cloned, [/spine/i, /waist/i, /hips/i]),
      chest: findBone(cloned, [/chest/i, /spine02/i, /upperchest/i]),
      leftArm: findBone(cloned, [/left.*arm/i, /l_.*arm/i, /mixamorigleftarm/i]),
      rightArm: findBone(cloned, [/right.*arm/i, /r_.*arm/i, /mixamorigrightarm/i]),
      leftForeArm: findBone(cloned, [/left.*fore.*arm/i, /left.*lower.*arm/i, /mixamorigleftforearm/i]),
      rightForeArm: findBone(cloned, [/right.*fore.*arm/i, /right.*lower.*arm/i, /mixamorigrightforearm/i]),
      leftHand: findBone(cloned, [/left.*hand/i, /l_.*hand/i, /mixamoriglefthand/i]),
      rightHand: findBone(cloned, [/right.*hand/i, /r_.*hand/i, /mixamorigrightthand/i, /mixamorigrightHand/i]),
      leftUpLeg: findBone(cloned, [/left.*up.*leg/i, /left.*thigh/i, /l_.*thigh/i, /mixamorigleftupleg/i]),
      rightUpLeg: findBone(cloned, [/right.*up.*leg/i, /right.*thigh/i, /r_.*thigh/i, /mixamorigrightupleg/i]),
      leftLeg: findBone(cloned, [/left.*leg/i, /left.*shin/i, /left.*calf/i, /mixamorigleftleg/i]),
      rightLeg: findBone(cloned, [/right.*leg/i, /right.*shin/i, /right.*calf/i, /mixamorigrightleg/i]),
      leftFoot: findBone(cloned, [/left.*foot/i, /l_.*foot/i, /mixamorigleftfoot/i]),
      rightFoot: findBone(cloned, [/right.*foot/i, /r_.*foot/i, /mixamorigrightfoot/i]),
    };

    cloned.userData.flowRig = rig;
    cloned.userData.flowBasePose = captureBasePose(rig);
    return cloned;
  }, [fbx, colorMap, normalMap, roughnessMap, metalnessMap, compact]);

  useEffect(() => {
    modelRef.current = model;
    const mixer = new AnimationMixer(model);
    mixerRef.current = mixer;

    const idleClip = getFirstClip(idleFbx, "idle");
    const walkClip = getFirstClip(walkFbx, "walk");
    const talkClip = getFirstClip(talkFbx, "talk");
    const waveClip = getFirstClip(waveFbx, "wave");
    const pointClip = getFirstClip(pointFbx, "point");

    const actions: Partial<Record<FlowMode, AnimationAction>> = {};

    const register = (key: FlowMode, clip: AnimationClip | null, loop = true) => {
      if (!clip) return;
      const action = mixer.clipAction(clip, model);
      action.enabled = true;
      action.clampWhenFinished = !loop;
      action.setLoop(LoopRepeat, loop ? Infinity : 1);
      actions[key] = action;
    };

    register("idle", idleClip, true);
    register("walk", walkClip || idleClip, true);
    register("talk", talkClip || idleClip, true);
    register("wave", waveClip || idleClip, true);
    register("point", pointClip || idleClip, true);
    register("thinking", idleClip, true);

    actionsRef.current = actions;

    const first = actions[mode] || actions.idle;
    if (first) {
      first.reset().fadeIn(0.2).play();
      currentActionRef.current = first;
    }

    return () => {
      mixer.stopAllAction();
      actionsRef.current = {};
      mixerRef.current = null;
      currentActionRef.current = null;
    };
  }, [model, idleFbx, walkFbx, talkFbx, waveFbx, pointFbx]);

  useEffect(() => {
    const actions = actionsRef.current;
    const next = actions[mode] || actions.idle;
    if (!next || currentActionRef.current === next) return;

    const previous = currentActionRef.current;
    next.reset().setEffectiveWeight(1).setEffectiveTimeScale(mode === "walk" ? 1.18 : 1).fadeIn(0.22).play();
    if (previous) previous.fadeOut(0.22);
    currentActionRef.current = next;
  }, [mode]);

  useFrame((state, delta) => {
    mixerRef.current?.update(delta);

    const root = rootRef.current;
    const modelObject = modelRef.current;
    if (!root || !modelObject) return;

    const t = state.clock.elapsedTime;
    const isWalking = mode === "walk";
    const isTalking = mode === "talk";
    const isThinking = mode === "thinking";
    const isPointing = mode === "point";
    const isWaving = mode === "wave";

    const facingAngle = facing === "left" ? 0.72 : facing === "right" ? -0.72 : 0;
    const breath = Math.sin(t * 1.65) * 0.010;
    const walkCycle = Math.sin(t * 8.4);
    const walkLift = isWalking ? Math.abs(walkCycle) * 0.046 : 0;
    const talkPulse = isTalking ? Math.sin(t * 7.7) * 0.010 : 0;
    const thinkingLean = isThinking ? Math.sin(t * 1.05) * 0.018 : 0;
    const idleSway = Math.sin(t * 0.68) * 0.011;

    root.position.y = breath + walkLift + talkPulse;
    root.rotation.y = facingAngle + Math.sin(t * 0.5) * 0.014;
    root.rotation.z = idleSway + (isWalking ? Math.sin(t * 8.4) * 0.022 : Math.sin(t * 0.42) * 0.004);
    root.rotation.x = thinkingLean;

    const rig = modelObject.userData.flowRig as FlowBoneRig | undefined;
    const basePose = modelObject.userData.flowBasePose as BoneBasePose[] | undefined;
    if (!rig || !basePose) return;

    restoreBasePose(basePose);

    const armSwing = isWalking ? walkCycle * 0.28 : Math.sin(t * 0.9) * 0.025;
    const legSwing = isWalking ? walkCycle * 0.34 : 0;
    const kneeSwing = isWalking ? Math.abs(walkCycle) * 0.22 : 0;
    const bodyEnergy = isWalking ? 1 : isTalking ? 0.65 : isThinking ? 0.35 : 0.22;

    if (rig.head) {
      rig.head.rotation.x += Math.sin(t * 1.15) * 0.008 + (isThinking ? 0.055 : 0) + (isTalking ? Math.sin(t * 7.4) * 0.016 : 0);
      rig.head.rotation.y += facingAngle * 0.2 + Math.sin(t * 0.85) * 0.012;
      rig.head.rotation.z += (isPointing ? -0.035 : 0) + Math.sin(t * 0.65) * 0.006;
    }

    if (rig.neck) {
      rig.neck.rotation.y += facingAngle * 0.12 + Math.sin(t * 0.6) * 0.006;
    }

    if (rig.chest) {
      rig.chest.rotation.x += breath * 0.7 + (isTalking ? Math.sin(t * 6.6) * 0.012 : 0);
      rig.chest.rotation.z += Math.sin(t * 0.42) * 0.008 * bodyEnergy;
    }

    if (rig.spine) {
      rig.spine.rotation.z += Math.sin(t * 0.5) * 0.006 * bodyEnergy;
    }

    if (rig.leftArm) rig.leftArm.rotation.x += -armSwing;
    if (rig.rightArm) rig.rightArm.rotation.x += armSwing;
    if (rig.leftForeArm) rig.leftForeArm.rotation.x += isWalking ? 0.08 + Math.abs(walkCycle) * 0.08 : 0.035;
    if (rig.rightForeArm) rig.rightForeArm.rotation.x += isWalking ? 0.08 + Math.abs(walkCycle) * 0.08 : 0.035;

    if (rig.leftUpLeg) rig.leftUpLeg.rotation.x += legSwing;
    if (rig.rightUpLeg) rig.rightUpLeg.rotation.x -= legSwing;
    if (rig.leftLeg) rig.leftLeg.rotation.x += kneeSwing;
    if (rig.rightLeg) rig.rightLeg.rotation.x += Math.abs(Math.sin(t * 8.4 + Math.PI)) * 0.22;
    if (rig.leftFoot) rig.leftFoot.rotation.x += isWalking ? Math.sin(t * 8.4 + Math.PI / 2) * 0.08 : 0;
    if (rig.rightFoot) rig.rightFoot.rotation.x += isWalking ? Math.sin(t * 8.4 - Math.PI / 2) * 0.08 : 0;

    if (isWaving && rig.rightArm) {
      rig.rightArm.rotation.z += 0.55 + Math.sin(t * 9.8) * 0.24;
      rig.rightArm.rotation.x -= 0.38;
      if (rig.rightForeArm) rig.rightForeArm.rotation.z += Math.sin(t * 10.5) * 0.18;
    }

    if (isPointing && rig.rightArm) {
      rig.rightArm.rotation.x -= 0.32;
      rig.rightArm.rotation.z -= 0.16;
      if (rig.rightForeArm) rig.rightForeArm.rotation.x -= 0.18;
    }
  });

  return (
    <group ref={rootRef}>
      <primitive object={model} />
      <mesh position={[0, -1.11, -0.08]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.68, 48]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.13} />
      </mesh>
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
        camera={{ position: [0, 1.26, 8], zoom: compact ? 79 : 66, near: 0.1, far: 100 }}
        dpr={[1, 1.75]}
        shadows
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={1.55} />
        <directionalLight position={[2.6, 4.8, 5.5]} intensity={2.35} castShadow />
        <pointLight position={[-2.4, 2.2, 3]} color="#67e8f9" intensity={1.1} />
        <pointLight position={[1.6, 0.75, 2.4]} color="#a855f7" intensity={0.75} />
        <Suspense fallback={<Loading />}>
          <FlowModel mode={mode} facing={facing} compact={compact} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useFBX.preload("/models/flow/flow.fbx");
useFBX.preload("/avatars/Idle.fbx");
useFBX.preload("/avatars/Walking.fbx");
useFBX.preload("/avatars/Talking.fbx");
useFBX.preload("/avatars/Waving.fbx");
useFBX.preload("/avatars/Pointing.fbx");
