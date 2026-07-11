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

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

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
  await wait(300);

  callbacks.onPhase?.("start");
  callbacks.onWalking(true);
  await wait(180);

  // A slower screen-space velocity lets the leg cycle read as an actual walk,
  // instead of making the character look like it is skating across the UI.
  const speed = 118;
  const duration = clamp((distance / speed) * 1000, 1050, 6200);
  const began = performance.now();

  await new Promise<void>((resolve) => {
    const step = (now: number) => {
      const raw = clamp((now - began) / duration, 0, 1);
      const eased = smootherStep(raw);
      callbacks.onPhase?.(
        raw < 0.12 ? "start" :
        raw > 0.86 ? "stop" :
        "cruise",
      );
      callbacks.onPosition({
        left: start.left + dx * eased,
        top: start.top + dy * eased,
      });

      if (raw < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });

  callbacks.onPhase?.("stop");
  callbacks.onPosition(destination);
  await wait(260);
  callbacks.onWalking(false);
  await wait(110);
  callbacks.onFacing("front");
  callbacks.onPhase?.("arrived");
}
