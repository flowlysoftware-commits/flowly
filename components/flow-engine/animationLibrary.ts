import { FlowMode } from "./types";

export const FLOW_MODEL_URL = "/models/flow/flow.fbx";

export const FLOW_ANIMATION_URLS: Record<Exclude<FlowMode, "error">, string> = {
  idle: "/avatars/Idle.fbx",
  walking: "/avatars/Walking.fbx",
  thinking: "/avatars/Thinking.fbx",
  listening: "/avatars/Listening.fbx",
  talking: "/avatars/Talking.fbx",
  waving: "/avatars/Waving.fbx",
  pointing: "/avatars/Pointing.fbx",
};

export const FLOW_FRONT_YAW = Math.PI;
