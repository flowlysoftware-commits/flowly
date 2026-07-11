type LogPayload = unknown;

function prefix(scope: string) {
  return `[FlowCompanion:${scope}]`;
}

export type FlowLogger = ReturnType<typeof createFlowLogger>;

export function createFlowLogger(scope: string) {
  return {
    debug(message: string, payload?: LogPayload) {
      if (process.env.NODE_ENV !== "production") console.debug(prefix(scope), message, payload ?? "");
    },
    info(message: string, payload?: LogPayload) {
      console.info(prefix(scope), message, payload ?? "");
    },
    warn(message: string, payload?: LogPayload) {
      console.warn(prefix(scope), message, payload ?? "");
    },
    error(message: string, payload?: LogPayload) {
      console.error(prefix(scope), message, payload ?? "");
    },
  };
}
