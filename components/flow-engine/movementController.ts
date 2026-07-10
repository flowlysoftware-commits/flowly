import { FlowFacing, FlowPosition } from "./types";

export type MovementCallbacks = {
  onPosition: (position: FlowPosition) => void;
  onFacing: (facing: FlowFacing) => void;
  onWalking: (walking: boolean) => void;
};

function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }
function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

export async function walkFlowTo(start: FlowPosition, destination: FlowPosition, callbacks: MovementCallbacks) {
  const dx = destination.left - start.left;
  const dy = destination.top - start.top;
  const distance = Math.hypot(dx, dy);
  const duration = clamp(distance * 4.5, 800, 3600);
  callbacks.onFacing(dx < -8 ? "left" : dx > 8 ? "right" : "front");
  callbacks.onWalking(true);
  const began = performance.now();

  await new Promise<void>((resolve) => {
    const step = (now: number) => {
      const raw = clamp((now - began) / duration, 0, 1);
      const t = easeInOut(raw);
      callbacks.onPosition({ left: start.left + dx * t, top: start.top + dy * t });
      if (raw < 1) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });

  callbacks.onWalking(false);
  callbacks.onFacing("front");
}
