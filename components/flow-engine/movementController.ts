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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function velocityEnvelope(t: number) {
  const acceleration = smoothstep(clamp(t / 0.18, 0, 1));
  const braking = 1 - smoothstep(clamp((t - 0.78) / 0.22, 0, 1));
  return clamp(Math.min(acceleration, braking), 0, 1);
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Movement cancelled", "AbortError");
}

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    throwIfAborted(signal);
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      window.clearTimeout(timer);
      reject(new DOMException("Movement cancelled", "AbortError"));
    }, { once: true });
  });
}

function getFacing(dx: number): FlowFacing {
  if (dx < -8) return "left";
  if (dx > 8) return "right";
  return "front";
}

export async function walkFlowTo(
  start: FlowPosition,
  destination: FlowPosition,
  callbacks: MovementCallbacks,
  options: WalkOptions = {},
) {
  const dx = destination.left - start.left;
  const dy = destination.top - start.top;
  const distance = Math.hypot(dx, dy);
  const signal = options.signal;

  if (distance < 8) {
    callbacks.onPosition(destination);
    callbacks.onGait?.({ speed: 0, normalizedSpeed: 0, distanceRemaining: 0, phase: "arrived" });
    callbacks.onPhase?.("arrived");
    return;
  }

  const facing = getFacing(dx);
  const targetSpeed = options.speedPxPerSecond ?? 122;
  const duration = clamp(
    (distance / targetSpeed) * 1000,
    options.minimumDurationMs ?? 900,
    options.maximumDurationMs ?? 7200,
  );

  try {
    callbacks.onPhase?.("turn");
    callbacks.onFacing(facing);
    callbacks.onGait?.({ speed: 0, normalizedSpeed: 0, distanceRemaining: distance, phase: "turn" });
    await wait(options.turnDurationMs ?? 260, signal);

    callbacks.onWalking(true);
    callbacks.onPhase?.("start");
    const began = performance.now();
    let previousTime = began;
    let previousPosition = start;

    await new Promise<void>((resolve, reject) => {
      const step = (now: number) => {
        if (signal?.aborted) {
          reject(new DOMException("Movement cancelled", "AbortError"));
          return;
        }

        const raw = clamp((now - began) / duration, 0, 1);
        const envelope = velocityEnvelope(raw);
        const eased = raw < 0.5
          ? 0.5 * Math.pow(raw * 2, 1.45)
          : 1 - 0.5 * Math.pow((1 - raw) * 2, 1.45);
        const position = {
          left: start.left + dx * eased,
          top: start.top + dy * eased,
        };
        const dt = Math.max((now - previousTime) / 1000, 1 / 120);
        const actualSpeed = Math.hypot(
          position.left - previousPosition.left,
          position.top - previousPosition.top,
        ) / dt;
        const remaining = Math.hypot(destination.left - position.left, destination.top - position.top);
        const phase: MovementPhase = raw < 0.18 ? "start" : raw > 0.78 ? "stop" : "cruise";

        callbacks.onPhase?.(phase);
        callbacks.onPosition(position);
        callbacks.onGait?.({
          speed: actualSpeed,
          normalizedSpeed: clamp((actualSpeed / targetSpeed) * envelope, 0, 1.35),
          distanceRemaining: remaining,
          phase,
        });

        previousTime = now;
        previousPosition = position;
        if (raw < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });

    callbacks.onPosition(destination);
    callbacks.onPhase?.("stop");
    callbacks.onGait?.({ speed: 0, normalizedSpeed: 0, distanceRemaining: 0, phase: "stop" });
    await wait(180, signal);
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
