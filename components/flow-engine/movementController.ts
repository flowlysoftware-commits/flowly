import { FlowFacing, FlowPosition } from "./types";

export type MovementCallbacks = {
  onPosition: (position: FlowPosition) => void;
  onFacing: (facing: FlowFacing) => void;
  onWalking: (walking: boolean) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function smoothStep(t: number) {
  return t * t * (3 - 2 * t);
}

/**
 * Moves the transparent character viewport across the DOM while the 3D rig
 * plays its real walking cycle. The eased acceleration/deceleration prevents
 * Flow from looking like a sticker sliding at constant speed.
 */
export async function walkFlowTo(
  start: FlowPosition,
  destination: FlowPosition,
  callbacks: MovementCallbacks,
) {
  const dx = destination.left - start.left;
  const dy = destination.top - start.top;
  const distance = Math.hypot(dx, dy);

  if (distance < 8) {
    callbacks.onFacing("front");
    callbacks.onPosition(destination);
    return;
  }

  // Around 185 screen pixels per second, constrained for short/long trips.
  const duration = clamp((distance / 185) * 1000, 900, 4200);
  callbacks.onFacing(dx < -8 ? "left" : dx > 8 ? "right" : "front");
  callbacks.onWalking(true);
  const began = performance.now();

  await new Promise<void>((resolve) => {
    const step = (now: number) => {
      const raw = clamp((now - began) / duration, 0, 1);
      const t = smoothStep(raw);
      callbacks.onPosition({
        left: start.left + dx * t,
        top: start.top + dy * t,
      });
      if (raw < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });

  callbacks.onPosition(destination);
  callbacks.onWalking(false);
  callbacks.onFacing("front");
}
