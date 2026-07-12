import type { FlowLogger } from "../core/logger";
import type { FlowMemorySnapshot } from "./types";

const EMPTY_MEMORY: FlowMemorySnapshot = {
  version: 1,
  updatedAt: new Date(0).toISOString(),
  facts: [],
  routes: [],
  routines: [],
  recentConversation: [],
};

export function emptyFlowMemory(): FlowMemorySnapshot {
  return structuredClone(EMPTY_MEMORY);
}

function isSnapshot(value: unknown): value is FlowMemorySnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<FlowMemorySnapshot>;
  return snapshot.version === 1 && Array.isArray(snapshot.facts) && Array.isArray(snapshot.routes) && Array.isArray(snapshot.routines) && Array.isArray(snapshot.recentConversation);
}

export function readFlowMemory(storageKey: string, logger?: FlowLogger): FlowMemorySnapshot {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return emptyFlowMemory();
    const parsed = JSON.parse(raw) as unknown;
    if (!isSnapshot(parsed)) throw new Error("Unsupported memory snapshot.");
    return parsed;
  } catch (error) {
    logger?.warn("Invalid companion memory discarded.", error);
    window.localStorage.removeItem(storageKey);
    return emptyFlowMemory();
  }
}

export function writeFlowMemory(storageKey: string, snapshot: FlowMemorySnapshot, logger?: FlowLogger) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
  } catch (error) {
    logger?.warn("Unable to persist companion memory.", error);
  }
}
