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

// Este FBX se exportó mirando al eje contrario de la cámara web. La rotación
// de 180° lo deja de frente; los giros laterales se suman de forma suave.
export const FLOW_FRONT_YAW = Math.PI;
