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

// El FBX está exportado con el frente en el eje +X. En Three.js la cámara
// observa desde +Z, por lo que giramos -90° para que Flow mire al usuario.
export const FLOW_FRONT_YAW = -Math.PI / 2;
