export type FlowCompanionConfig = Readonly<{
  runtimeId: string;
  dashboardPrefix: string;
  storageKey: string;
  maxPersistedMessages: number;
  memoryStorageKey: string;
  maxMemoryFacts: number;
  gatewayHttpUrl: string;
  gatewayWsUrl: string | null;
  reconnectDelayMs: number;
}>;

function buildGatewayWsUrl(httpUrl: string) {
  if (!httpUrl) return null;
  return `${httpUrl.replace(/^http:/, "ws:").replace(/^https:/, "wss:").replace(/\/$/, "")}/flow-companion`;
}

const externalGateway = (process.env.NEXT_PUBLIC_FLOW_COMPANION_GATEWAY_URL || "").replace(/\/$/, "");

export const FLOW_COMPANION_CONFIG: FlowCompanionConfig = Object.freeze({
  runtimeId: "flow-companion-engine-v2",
  dashboardPrefix: "/dashboard",
  storageKey: "flow_companion_runtime_v2",
  maxPersistedMessages: 12,
  memoryStorageKey: "flow_companion_memory_v1",
  maxMemoryFacts: 80,
  gatewayHttpUrl: "/api/companion/chat",
  gatewayWsUrl: buildGatewayWsUrl(externalGateway),
  reconnectDelayMs: 4000,
});
