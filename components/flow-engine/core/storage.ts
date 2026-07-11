import { FlowMessage, FlowPosition } from "../types";
import { createFlowLogger } from "./logger";

const logger = createFlowLogger("Storage");

export type FlowPersistedState = {
  position?: FlowPosition;
  messages?: FlowMessage[];
};

export function readFlowState(storageKey: string): FlowPersistedState | null {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw) as FlowPersistedState;
  } catch (error) {
    logger.warn("Discarding invalid persisted state.", error);
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

export function writeFlowState(storageKey: string, state: FlowPersistedState) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    logger.warn("Unable to persist runtime state.", error);
  }
}
