import { FlowMode } from "./types";

export const FLOW_MODEL_URL = "/models/flow/flow.fbx";

// Use only assets that are actually present in /public/avatars.
// Thinking and listening temporarily reuse Idle so a missing FBX can never
// crash the entire Next.js application at runtime.
export const FLOW_ANIMATION_URLS: Record<Exclude<FlowMode, "error">, string> = {
  idle: "/avatars/Idle.fbx",
  walking: "/avatars/Walking.fbx",
  thinking: "/avatars/Idle.fbx",
  listening: "/avatars/Idle.fbx",
  talking: "/avatars/Talking.fbx",
  waving: "/avatars/Waving.fbx",
  pointing: "/avatars/Pointing.fbx",
};

export const FLOW_FRONT_YAW = Math.PI;
