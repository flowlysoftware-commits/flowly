import { FlowMode } from "./types";

export const FLOW_MODEL_URL = "/models/flow/flow.fbx";

export const FLOW_ANIMATION_URLS: Record<Exclude<FlowMode, "error">, string> = {
  idle: "/avatars/Idle.fbx",
  walking: "/avatars/Walking.fbx",
  thinking: "/avatars/Idle.fbx",
  listening: "/avatars/Idle.fbx",
  talking: "/avatars/Talking.fbx",
  waving: "/avatars/Waving.fbx",
  pointing: "/avatars/Pointing.fbx",
};

// The source FBX faces the X axis. Rotate it 90 degrees so it faces the
// orthographic web camera instead of remaining in profile.
export const FLOW_FRONT_YAW = Math.PI / 2;
