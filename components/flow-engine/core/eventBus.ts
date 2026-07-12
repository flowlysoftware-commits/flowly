import { FlowEmotion, FlowMessage, FlowMode, FlowPosition, FlowUserActivitySource } from "../types";

export type FlowCompanionEvents = {
  "runtime:mounted": { runtimeId: string };
  "runtime:unmounted": { runtimeId: string };
  "runtime:error": { error: Error };
  "state:mode": { mode: FlowMode };
  "state:emotion": { emotion: Partial<FlowEmotion> };
  "state:position": { position: FlowPosition };
  "chat:message": { message: FlowMessage };
  "navigation:requested": { target: string };
  "activity:user": { source: FlowUserActivitySource };
  "behaviour:goal": { goal: string; routine: string; behaviour: string; priority: number };
  "behaviour:interrupted": { behaviour: string; reason: string };
};

type EventName = keyof FlowCompanionEvents;
type Listener<K extends EventName> = (payload: FlowCompanionEvents[K]) => void;

export class FlowEventBus {
  private listeners = new Map<EventName, Set<(payload: never) => void>>();

  on<K extends EventName>(event: K, listener: Listener<K>) {
    const bucket = this.listeners.get(event) ?? new Set<(payload: never) => void>();
    bucket.add(listener as (payload: never) => void);
    this.listeners.set(event, bucket);
    return () => bucket.delete(listener as (payload: never) => void);
  }

  emit<K extends EventName>(event: K, payload: FlowCompanionEvents[K]) {
    this.listeners.get(event)?.forEach((listener) => listener(payload as never));
  }

  clear() {
    this.listeners.clear();
  }
}
