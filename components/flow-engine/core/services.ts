import { FlowEventBus } from "./eventBus";
import { createFlowLogger } from "./logger";

export type FlowCoreServices = ReturnType<typeof createFlowCoreServices>;

export function createFlowCoreServices() {
  return Object.freeze({
    events: new FlowEventBus(),
    logger: createFlowLogger("Runtime"),
  });
}
