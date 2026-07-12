import type { FlowEmotion, FlowMessage } from "../types";
import type { FlowMemoryContext } from "../memory/types";

export type FlowInitiativeKind = "suggestion" | "warning" | "follow-up" | "routine";
export type FlowInitiativePriority = "low" | "medium" | "high";

export type FlowInitiativeAction = {
  label: string;
  toolId?: string;
  arguments?: Record<string, unknown>;
  target?: string;
};

export type FlowInitiative = {
  id: string;
  kind: FlowInitiativeKind;
  priority: FlowInitiativePriority;
  title: string;
  message: string;
  reason: string;
  action?: FlowInitiativeAction;
  createdAt: number;
  expiresAt: number;
  fingerprint: string;
};

export type FlowAutonomyObservation = {
  pathname: string;
  conversation: FlowMessage[];
  memory?: FlowMemoryContext;
  panel?: unknown;
  emotion: FlowEmotion;
  connected: boolean;
  isBusy: boolean;
  now: number;
};

export type FlowAutonomyEngineOptions = {
  storageKey: string;
  evaluateEveryMs?: number;
  minimumSilenceMs?: number;
  onInitiative: (initiative: FlowInitiative) => void;
  onDismiss?: (initiative: FlowInitiative, reason: string) => void;
  getObservation: () => FlowAutonomyObservation;
};
