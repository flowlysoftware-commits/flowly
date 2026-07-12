import { FlowFacing, FlowGait, FlowPosition } from "./types";

export type MovementPhase = "turn" | "start" | "cruise" | "stop" | "arrived" | "cancelled";
export type MovementCallbacks = {
  onPosition: (position: FlowPosition) => void;
  onFacing: (facing: FlowFacing) => void;
  onWalking: (walking: boolean) => void;
  onGait?: (gait: FlowGait) => void;
  onPhase?: (phase: MovementPhase) => void;
};
export type WalkOptions = {
  signal?: AbortSignal;
  speedPxPerSecond?: number;
  turnDurationMs?: number;
  minimumDurationMs?: number;
  maximumDurationMs?: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const smoothstep = (t: number) => t * t * (3 - 2 * t);
function throwIfAborted(signal?: AbortSignal) { if (signal?.aborted) throw new DOMException("Movement cancelled", "AbortError"); }
function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    throwIfAborted(signal);
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { window.clearTimeout(timer); reject(new DOMException("Movement cancelled", "AbortError")); }, { once: true });
  });
}
function getFacing(dx: number): FlowFacing { return dx < -6 ? "left" : dx > 6 ? "right" : "front"; }

function buildRoute(start: FlowPosition, destination: FlowPosition): FlowPosition[] {
  const dx = Math.abs(destination.left - start.left);
  const dy = Math.abs(destination.top - start.top);
  if (dx < 24 || dy < 24) return [destination];
  // Move in orthogonal legs. It avoids the unnatural diagonal glide across cards and text.
  const horizontalFirst = start.top > window.innerHeight * 0.52 || destination.top > window.innerHeight * 0.52;
  return horizontalFirst
    ? [{ left: destination.left, top: start.top }, destination]
    : [{ left: start.left, top: destination.top }, destination];
}

async function animateSegment(
  start: FlowPosition,
  destination: FlowPosition,
  callbacks: MovementCallbacks,
  options: WalkOptions,
  keepWalking: boolean,
) {
  const dx = destination.left - start.left;
  const dy = destination.top - start.top;
  const distance = Math.hypot(dx, dy);
  if (distance < 4) { callbacks.onPosition(destination); return; }
  const signal = options.signal;
  const targetSpeed = options.speedPxPerSecond ?? 108;
  const duration = clamp((distance / targetSpeed) * 1000, options.minimumDurationMs ?? 520, options.maximumDurationMs ?? 5200);
  const facing = getFacing(dx);
  callbacks.onPhase?.("turn");
  callbacks.onFacing(facing);
  callbacks.onGait?.({ speed: 0, normalizedSpeed: 0, distanceRemaining: distance, phase: "turn" });
  await wait(options.turnDurationMs ?? 220, signal);
  if (!keepWalking) callbacks.onWalking(true);

  const began = performance.now();
  let previousTime = began;
  let previousPosition = start;
  await new Promise<void>((resolve, reject) => {
    const step = (now: number) => {
      if (signal?.aborted) { reject(new DOMException("Movement cancelled", "AbortError")); return; }
      const raw = clamp((now - began) / duration, 0, 1);
      const acceleration = smoothstep(clamp(raw / 0.2, 0, 1));
      const braking = 1 - smoothstep(clamp((raw - 0.8) / 0.2, 0, 1));
      const envelope = Math.min(acceleration, braking);
      const eased = raw < 0.5 ? 0.5 * Math.pow(raw * 2, 1.35) : 1 - 0.5 * Math.pow((1 - raw) * 2, 1.35);
      const position = { left: start.left + dx * eased, top: start.top + dy * eased };
      const dt = Math.max((now - previousTime) / 1000, 1 / 120);
      const actualSpeed = Math.hypot(position.left - previousPosition.left, position.top - previousPosition.top) / dt;
      const remaining = Math.hypot(destination.left - position.left, destination.top - position.top);
      const phase: MovementPhase = raw < 0.2 ? "start" : raw > 0.8 ? "stop" : "cruise";
      callbacks.onPhase?.(phase);
      callbacks.onPosition(position);
      callbacks.onGait?.({ speed: actualSpeed, normalizedSpeed: clamp((actualSpeed / targetSpeed) * envelope, 0, 1.2), distanceRemaining: remaining, phase });
      previousTime = now;
      previousPosition = position;
      if (raw < 1) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });
  callbacks.onPosition(destination);
}

export async function walkFlowTo(start: FlowPosition, destination: FlowPosition, callbacks: MovementCallbacks, options: WalkOptions = {}) {
  const signal = options.signal;
  const route = buildRoute(start, destination);
  try {
    let current = start;
    callbacks.onWalking(true);
    for (let index = 0; index < route.length; index += 1) {
      await animateSegment(current, route[index], callbacks, options, true);
      current = route[index];
      if (index < route.length - 1) await wait(90, signal);
    }
    callbacks.onPhase?.("stop");
    callbacks.onGait?.({ speed: 0, normalizedSpeed: 0, distanceRemaining: 0, phase: "stop" });
    await wait(170, signal);
    callbacks.onWalking(false);
    callbacks.onPhase?.("arrived");
    callbacks.onGait?.({ speed: 0, normalizedSpeed: 0, distanceRemaining: 0, phase: "arrived" });
  } catch (error) {
    callbacks.onWalking(false);
    callbacks.onPhase?.("cancelled");
    callbacks.onGait?.({ speed: 0, normalizedSpeed: 0, distanceRemaining: 0, phase: "cancelled" });
    if (error instanceof DOMException && error.name === "AbortError") return;
    throw error;
  }
}
