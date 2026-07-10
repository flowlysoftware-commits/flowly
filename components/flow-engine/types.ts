export type FlowMode = "idle" | "walking" | "thinking" | "listening" | "talking" | "waving" | "pointing" | "error";
export type FlowFacing = "front" | "left" | "right";

export type FlowEmotion = {
  mood: string;
  calm: number;
  joy: number;
  curiosity: number;
  empathy: number;
  stress: number;
  confidence: number;
  attention: number;
  energy: number;
};

export type FlowPosition = { left: number; top: number };
export type FlowMessage = { id: string; role: "user" | "flow" | "system"; text: string };

export type FlowPanelTarget = {
  key: string;
  label: string;
  aliases?: string[];
};

export type FlowPanelResult = {
  ok: boolean;
  message: string;
  target?: string;
  label?: string;
  rect?: {
    left: number;
    top: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  };
};

export type FlowPanelApi = {
  targets: FlowPanelTarget[];
  findTarget: (target: string) => FlowPanelTarget | null;
  findElement: (target: string) => HTMLElement | null;
  navigate: (target: string) => Promise<FlowPanelResult>;
  click?: (target: string) => Promise<FlowPanelResult>;
  context?: () => unknown;
};

export type FlowRuntimeState = {
  mode: FlowMode;
  facing: FlowFacing;
  connected: boolean;
  open: boolean;
  position: FlowPosition;
  emotion: FlowEmotion;
  bubble: string;
  messages: FlowMessage[];
};

export const DEFAULT_EMOTION: FlowEmotion = {
  mood: "neutral",
  calm: 0.72,
  joy: 0.5,
  curiosity: 0.62,
  empathy: 0.7,
  stress: 0.06,
  confidence: 0.7,
  attention: 0.8,
  energy: 0.55,
};

declare global {
  interface Window {
    FlowPanelIntegration?: FlowPanelApi;
  }
}
