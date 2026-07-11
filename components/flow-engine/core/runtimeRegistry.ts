import { createFlowLogger } from "./logger";

const logger = createFlowLogger("RuntimeRegistry");
const REGISTRY_KEY = "__FLOW_COMPANION_RUNTIME__";

type RuntimeRecord = { id: string; mountedAt: number };
type RuntimeWindow = Window & { [REGISTRY_KEY]?: RuntimeRecord };

export function claimFlowRuntime(runtimeId: string) {
  const runtimeWindow = window as RuntimeWindow;
  const current = runtimeWindow[REGISTRY_KEY];

  if (current && current.id !== runtimeId) {
    logger.warn("A second runtime attempted to mount and was rejected.", { current: current.id, attempted: runtimeId });
    return false;
  }

  runtimeWindow[REGISTRY_KEY] = current ?? { id: runtimeId, mountedAt: Date.now() };
  return true;
}

export function releaseFlowRuntime(runtimeId: string) {
  const runtimeWindow = window as RuntimeWindow;
  if (runtimeWindow[REGISTRY_KEY]?.id === runtimeId) delete runtimeWindow[REGISTRY_KEY];
}
