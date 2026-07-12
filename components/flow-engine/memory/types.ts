import type { FlowMessage } from "../types";

export type FlowMemoryKind = "preference" | "company" | "person" | "routine" | "fact";

export type FlowMemoryFact = {
  id: string;
  kind: FlowMemoryKind;
  key: string;
  value: string;
  confidence: number;
  source: "explicit-user" | "observed" | "system";
  createdAt: string;
  updatedAt: string;
};

export type FlowRouteMemory = {
  pathname: string;
  visits: number;
  lastVisitedAt: string;
};

export type FlowRoutineMemory = {
  key: string;
  count: number;
  lastSeenAt: string;
};

export type FlowMemorySnapshot = {
  version: 1;
  updatedAt: string;
  facts: FlowMemoryFact[];
  routes: FlowRouteMemory[];
  routines: FlowRoutineMemory[];
  recentConversation: FlowMessage[];
};

export type FlowMemoryContext = {
  profile: Record<string, string>;
  preferences: Record<string, string>;
  company: Record<string, string>;
  people: Record<string, string>;
  routines: FlowRoutineMemory[];
  frequentRoutes: FlowRouteMemory[];
  recentConversation: Array<Pick<FlowMessage, "role" | "text">>;
};
