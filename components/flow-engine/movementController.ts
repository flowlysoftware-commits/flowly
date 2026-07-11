import { FlowFacing, FlowPosition } from "./types";

export type MovementCallbacks = {
  onPosition: (position: FlowPosition) => void;
  onFacing: (facing: FlowFacing) => void;
  onWalking: (walking: boolean) => void;
  onPhase?: (phase: "turn" | "start" | "cruise" | "stop" | "arrived") => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function smootherStep(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

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
    callbacks.onPhase?.("arrived");
    return;
  }

  const horizontalFacing: FlowFacing = dx < -8 ? "left" : dx > 8 ? "right" : "front";
  callbacks.onPhase?.("turn");
  callbacks.onFacing(horizontalFacing);
  await new Promise((resolve) => window.setTimeout(resolve, 220));

  callbacks.onPhase?.("start");
  callbacks.onWalking(true);
  await new Promise((resolve) => window.setTimeout(resolve, 120));

  const speed = 210;
  const duration = clamp((distance / speed) * 1000, 760, 4300);
  const began = performance.now();

  await new Promise<void>((resolve) => {
    const step = (now: number) => {
      const raw = clamp((now - began) / duration, 0, 1);
      const t = smootherStep(raw);
      callbacks.onPhase?.(raw < 0.14 ? "start" : raw > 0.84 ? "stop" : "cruise");
      callbacks.onPosition({
        left: start.left + dx * t,
        top: start.top + dy * t,
      });
      if (raw < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });

  callbacks.onPhase?.("stop");
  callbacks.onPosition(destination);
  await new Promise((resolve) => window.setTimeout(resolve, 150));
  callbacks.onWalking(false);
  callbacks.onFacing("front");
  callbacks.onPhase?.("arrived");
}
