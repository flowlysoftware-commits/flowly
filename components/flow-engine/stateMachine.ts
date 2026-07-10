import { DEFAULT_EMOTION, FlowEmotion, FlowRuntimeState } from "./types";

export type FlowAction =
  | { type: "mode"; mode: FlowRuntimeState["mode"] }
  | { type: "facing"; facing: FlowRuntimeState["facing"] }
  | { type: "connected"; connected: boolean }
  | { type: "open"; open: boolean }
  | { type: "position"; left: number; top: number }
  | { type: "bubble"; text: string }
  | { type: "emotion"; emotion: Partial<FlowEmotion> }
  | { type: "message"; message: FlowRuntimeState["messages"][number] };

export function createInitialFlowState(): FlowRuntimeState {
  return {
    mode: "idle",
    facing: "front",
    connected: false,
    open: false,
    position: { left: 24, top: 220 },
    emotion: DEFAULT_EMOTION,
    bubble: "Estoy aquí. Puedo acompañarte por Flowly.",
    messages: [{ id: "welcome", role: "flow", text: "Soy Flow. Pídeme que te lleve a cualquier módulo." }],
  };
}

export function flowReducer(state: FlowRuntimeState, action: FlowAction): FlowRuntimeState {
  switch (action.type) {
    case "mode": return { ...state, mode: action.mode };
    case "facing": return { ...state, facing: action.facing };
    case "connected": return { ...state, connected: action.connected };
    case "open": return { ...state, open: action.open };
    case "position": return { ...state, position: { left: action.left, top: action.top } };
    case "bubble": return { ...state, bubble: action.text };
    case "emotion": return { ...state, emotion: { ...state.emotion, ...action.emotion } };
    case "message": return { ...state, messages: [...state.messages, action.message].slice(-20) };
    default: return state;
  }
}
