import { FlowMode } from "./types";

export const FLOW_MODEL_URL = "/models/flow/flow.fbx";

/**
 * Solo cargamos clips que aportan movimiento real.
 * Idle, thinking y listening usan la pose base del propio avatar para evitar
 * que clips incompatibles de otro rig lo sienten o deformen.
 */
export const FLOW_ANIMATION_URLS: Partial<
  Record<Exclude<FlowMode, "error">, string>
> = {
  walking: "/avatars/Walking.fbx",
  talking: "/avatars/Talking.fbx",
  waving: "/avatars/Waving.fbx",
  pointing: "/avatars/Pointing.fbx",
};

// El modelo base está exportado mirando en sentido contrario a la cámara web.
export const FLOW_FRONT_YAW = Math.PI;
