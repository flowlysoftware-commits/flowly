export type CompanionLifeState =
  | "Idle"
  | "Breathing"
  | "Looking"
  | "Listening"
  | "Thinking"
  | "Talking"
  | "Walking"
  | "Pointing"
  | "Reading"
  | "Typing"
  | "Happy"
  | "Concerned"
  | "Celebrating";

export type CompanionLifePhase = "presence" | "emotion" | "spatial" | "initiative" | "relationship";

export type CompanionSpatialTarget = "dock" | "center" | "left" | "right" | "lowerCenter";

export type CompanionLifeDecision = {
  state: CompanionLifeState;
  label: string;
  phase: CompanionLifePhase;
  spatialTarget: CompanionSpatialTarget;
  initiative?: string;
  voiceStyle: {
    speed: number;
    pauseMs: number;
    tone: "warm" | "focused" | "soft" | "celebratory" | "concerned";
    intensity: number;
  };
};

const routeMap: Array<{
  test: (path: string) => boolean;
  decision: CompanionLifeDecision;
}> = [
  {
    test: (path) => path.includes("crm") || path.includes("clientes") || path.includes("listas"),
    decision: {
      state: "Reading",
      label: "Revisando oportunidades del CRM",
      phase: "spatial",
      spatialTarget: "left",
      initiative: "Creo que puede haber oportunidades paradas. ¿Quieres que las revise contigo?",
      voiceStyle: { speed: 0.96, pauseMs: 340, tone: "focused", intensity: 0.72 },
    },
  },
  {
    test: (path) => path.includes("fact") || path.includes("presupuesto") || path.includes("finance") || path.includes("contabilidad"),
    decision: {
      state: "Thinking",
      label: "Analizando facturas y presupuestos",
      phase: "spatial",
      spatialTarget: "right",
      initiative: "Veo zona financiera abierta. Puedo ayudarte a revisar cobros o presupuestos pendientes.",
      voiceStyle: { speed: 0.9, pauseMs: 480, tone: "soft", intensity: 0.64 },
    },
  },
  {
    test: (path) => path.includes("marketing") || path.includes("camp") || path.includes("leads"),
    decision: {
      state: "Pointing",
      label: "Mirando campañas y captación",
      phase: "initiative",
      spatialTarget: "right",
      initiative: "Podemos convertir esta campaña en una acción concreta para vender más hoy.",
      voiceStyle: { speed: 1.02, pauseMs: 260, tone: "warm", intensity: 0.78 },
    },
  },
  {
    test: (path) => path.includes("developer") || path.includes("docs") || path.includes("brain") || path.includes("studio"),
    decision: {
      state: "Thinking",
      label: "Conectado al mismo Brain de Flowly OS",
      phase: "relationship",
      spatialTarget: "lowerCenter",
      voiceStyle: { speed: 0.92, pauseMs: 520, tone: "focused", intensity: 0.68 },
    },
  },
];

export const companionLifePhases = [
  { id: "presence", title: "Presence Engine", rule: "Nunca queda congelado: respira, mira, parpadea y cambia micro postura." },
  { id: "emotion", title: "Emotion Engine", rule: "La emoción se decide como intención visible antes del texto o la voz." },
  { id: "spatial", title: "Spatial Awareness", rule: "Habita Flowly y reacciona al módulo abierto con mirada, posición y gesto." },
  { id: "initiative", title: "Initiative Engine", rule: "Puede iniciar ayudas pequeñas, útiles y no invasivas." },
  { id: "relationship", title: "Relationship Engine", rule: "Ajusta estilo, memoria operativa y confianza según el uso del usuario." },
] as const;

export type CompanionLifeOptions = {
  thinking?: boolean;
  speaking?: boolean;
  listening?: boolean;
  moving?: boolean;
  open?: boolean;
  minimized?: boolean;
  energy?: number;
  level?: number;
};

export function decideCompanionLife(pathname: string, options?: CompanionLifeOptions): CompanionLifeDecision {
  const path = pathname.toLowerCase();
  if (options?.listening) {
    return { state: "Listening", label: "Te estoy escuchando", phase: "presence", spatialTarget: "lowerCenter", voiceStyle: { speed: 0.94, pauseMs: 420, tone: "warm", intensity: 0.68 } };
  }
  if (options?.speaking) {
    return { state: "Talking", label: "Hablando contigo", phase: "emotion", spatialTarget: "lowerCenter", voiceStyle: { speed: 0.98, pauseMs: 320, tone: "warm", intensity: 0.74 } };
  }
  if (options?.thinking) {
    return { state: "Thinking", label: "Pensando con Flowly Brain", phase: "emotion", spatialTarget: "lowerCenter", voiceStyle: { speed: 0.88, pauseMs: 540, tone: "focused", intensity: 0.62 } };
  }
  if (options?.moving) {
    return { state: "Walking", label: "Moviéndome por el espacio de trabajo", phase: "spatial", spatialTarget: "dock", voiceStyle: { speed: 1, pauseMs: 300, tone: "warm", intensity: 0.7 } };
  }
  if (options?.minimized) {
    return { state: "Breathing", label: "Presente en segundo plano", phase: "presence", spatialTarget: "dock", voiceStyle: { speed: 0.94, pauseMs: 420, tone: "soft", intensity: 0.54 } };
  }
  if (typeof options?.energy === "number" && options.energy < 35) {
    return { state: "Concerned", label: "Bajando intensidad para acompañarte mejor", phase: "emotion", spatialTarget: "dock", voiceStyle: { speed: 0.9, pauseMs: 520, tone: "soft", intensity: 0.52 } };
  }

  return routeMap.find((item) => item.test(path))?.decision || {
    state: options?.open ? "Looking" : "Breathing",
    label: options?.open ? "Mirando el trabajo contigo" : "Presente en Flowly",
    phase: "presence",
    spatialTarget: "dock",
    initiative: "Estoy aquí contigo. Puedo ayudarte a convertir lo que ves en la siguiente acción.",
    voiceStyle: { speed: 0.96, pauseMs: 360, tone: "warm", intensity: 0.66 },
  };
}

export function lifeStateToAvatarMode(state: CompanionLifeState) {
  switch (state) {
    case "Listening": return "attention";
    case "Thinking": return "thinking";
    case "Talking": return "talking";
    case "Walking": return "walking";
    case "Pointing": return "point";
    case "Typing":
    case "Reading": return "working";
    case "Happy": return "happy";
    case "Concerned": return "thinking";
    case "Celebrating": return "celebrating";
    case "Looking": return "attention";
    default: return "idle";
  }
}
