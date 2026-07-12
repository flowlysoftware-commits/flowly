export type FlowToolRisk = "read" | "navigate" | "write";

export type FlowToolDefinition = {
  id: string;
  label: string;
  description: string;
  risk: FlowToolRisk;
  aliases: string[];
  requiredArguments?: string[];
};

export type FlowToolCall = {
  id: string;
  arguments?: Record<string, unknown>;
  source?: "brain" | "user" | "system";
};

export type FlowToolResult = {
  ok: boolean;
  toolId: string;
  message: string;
  data?: unknown;
  requiresConfirmation?: boolean;
};

export type FlowToolExecutionContext = {
  pathname: string;
  panel?: {
    navigate?: (target: string) => Promise<unknown>;
    executeTool?: (call: FlowToolCall) => Promise<FlowToolResult>;
    context?: () => unknown;
  };
};
