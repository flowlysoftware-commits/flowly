import type {
  FlowAutonomyEngineOptions,
  FlowAutonomyObservation,
  FlowInitiative,
  FlowInitiativeAction,
  FlowInitiativeKind,
  FlowInitiativePriority,
} from "./types";

type PersistedState = {
  dismissed: Record<string, number>;
  shown: Record<string, number>;
  lastUserActivityAt: number;
};

type Candidate = {
  kind: FlowInitiativeKind;
  priority: FlowInitiativePriority;
  title: string;
  message: string;
  reason: string;
  fingerprint: string;
  score: number;
  ttlMs: number;
  cooldownMs: number;
  action?: FlowInitiativeAction;
};

const DEFAULT_STATE: PersistedState = {
  dismissed: {},
  shown: {},
  lastUserActivityAt: Date.now(),
};

const priorityWeight: Record<FlowInitiativePriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

function safeRead(storageKey: string): PersistedState {
  if (typeof window === "undefined") return { ...DEFAULT_STATE };
  try {
    const value = window.localStorage.getItem(storageKey);
    if (!value) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(value) as Partial<PersistedState>;
    return {
      dismissed: parsed.dismissed || {},
      shown: parsed.shown || {},
      lastUserActivityAt: parsed.lastUserActivityAt || Date.now(),
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function safeWrite(storageKey: string, state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // La autonomía nunca debe romper el runtime por falta de almacenamiento.
  }
}

function recentUserText(observation: FlowAutonomyObservation) {
  return observation.conversation
    .filter((message) => message.role === "user")
    .slice(-5)
    .map((message) => message.text.toLowerCase())
    .join(" ");
}

function pathLabel(pathname: string) {
  const segment = pathname.split("/").filter(Boolean).pop() || "panel";
  return segment.replace(/[-_]/g, " ");
}

function buildCandidates(observation: FlowAutonomyObservation): Candidate[] {
  const candidates: Candidate[] = [];
  const recentText = recentUserText(observation);
  const routes = observation.memory?.frequentRoutes || [];
  const routines = observation.memory?.routines || [];
  const currentRoute = pathLabel(observation.pathname);

  if (!observation.connected) {
    candidates.push({
      kind: "warning",
      priority: "high",
      title: "Conexión del Brain",
      message: "He detectado que mi conexión con el Brain no está disponible. Puedo seguir navegando por el panel, pero no responderé con IA hasta recuperarla.",
      reason: "gateway-disconnected",
      fingerprint: "warning:brain-disconnected",
      score: 100,
      ttlMs: 30_000,
      cooldownMs: 10 * 60_000,
    });
  }

  const taskIntent = /(?:tarea|recordatorio|pendiente|hacer|llamar|contactar)/i.test(recentText);
  if (taskIntent) {
    candidates.push({
      kind: "follow-up",
      priority: "medium",
      title: "Convertirlo en tarea",
      message: "Has mencionado algo que parece un pendiente. Puedo prepararlo como tarea para que no se pierda.",
      reason: "task-intent-in-conversation",
      fingerprint: `follow-up:task:${recentText.slice(-80)}`,
      score: 60,
      ttlMs: 90_000,
      cooldownMs: 30 * 60_000,
      action: { label: "Crear tarea", toolId: "create_task", arguments: { source: "companion-initiative" } },
    });
  }

  const invoiceIntent = /(?:factura|cobro|presupuesto|pago)/i.test(recentText);
  if (invoiceIntent) {
    candidates.push({
      kind: "follow-up",
      priority: "medium",
      title: "Continuar con facturación",
      message: "Parece que estás trabajando con un cobro o documento comercial. Puedo abrir la herramienta adecuada o preparar la factura.",
      reason: "billing-intent-in-conversation",
      fingerprint: `follow-up:billing:${currentRoute}`,
      score: 58,
      ttlMs: 90_000,
      cooldownMs: 30 * 60_000,
      action: { label: "Abrir facturación", target: "facturacion" },
    });
  }

  const frequentElsewhere = routes
    .filter((route) => route.pathname !== observation.pathname && route.visits >= 3)
    .sort((a, b) => b.visits - a.visits)[0];
  if (frequentElsewhere) {
    candidates.push({
      kind: "routine",
      priority: "low",
      title: "Ruta habitual",
      message: `Sueles visitar ${pathLabel(frequentElsewhere.pathname)} desde aquí. Puedo llevarte directamente.`,
      reason: "frequent-route",
      fingerprint: `routine:route:${observation.pathname}->${frequentElsewhere.pathname}`,
      score: 20 + Math.min(20, frequentElsewhere.visits),
      ttlMs: 120_000,
      cooldownMs: 2 * 60 * 60_000,
      action: { label: `Ir a ${pathLabel(frequentElsewhere.pathname)}`, target: frequentElsewhere.pathname },
    });
  }

  const strongestRoutine = routines.filter((routine) => routine.count >= 4)[0];
  if (strongestRoutine && strongestRoutine.key.startsWith("route:")) {
    const target = strongestRoutine.key.slice("route:".length);
    candidates.push({
      kind: "routine",
      priority: "low",
      title: "He aprendido una rutina",
      message: `Veo que repites a menudo esta ruta. Puedo anticiparme y llevarte a ${pathLabel(target)} cuando lo necesites.`,
      reason: "learned-route-routine",
      fingerprint: `routine:learned:${target}`,
      score: 18 + Math.min(15, strongestRoutine.count),
      ttlMs: 120_000,
      cooldownMs: 4 * 60 * 60_000,
      action: { label: "Abrir ahora", target },
    });
  }

  if (observation.emotion.stress > 0.72) {
    candidates.push({
      kind: "suggestion",
      priority: "low",
      title: "Bajar el ritmo",
      message: "Detecto bastante tensión en la interacción. Puedo quedarme en silencio y limitarme a avisarte solo de lo importante.",
      reason: "high-stress-state",
      fingerprint: "suggestion:quiet-mode",
      score: 36,
      ttlMs: 60_000,
      cooldownMs: 60 * 60_000,
    });
  }

  return candidates;
}

export class FlowAutonomyEngine {
  private timer: number | null = null;
  private state: PersistedState;
  private active: FlowInitiative | null = null;
  private stopped = true;
  private readonly evaluateEveryMs: number;
  private readonly minimumSilenceMs: number;

  constructor(private readonly options: FlowAutonomyEngineOptions) {
    this.evaluateEveryMs = options.evaluateEveryMs ?? 18_000;
    this.minimumSilenceMs = options.minimumSilenceMs ?? 12_000;
    this.state = safeRead(options.storageKey);
  }

  start() {
    if (!this.stopped) return;
    this.stopped = false;
    this.schedule(7_000);
  }

  stop() {
    this.stopped = true;
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
    safeWrite(this.options.storageKey, this.state);
  }

  signalUserActivity() {
    this.state.lastUserActivityAt = Date.now();
    if (this.active) this.dismiss("user-activity", false);
  }

  acknowledge(id: string) {
    if (this.active?.id !== id) return;
    this.state.shown[this.active.fingerprint] = Date.now();
    this.active = null;
    safeWrite(this.options.storageKey, this.state);
  }

  dismiss(reason = "dismissed", remember = true) {
    if (!this.active) return;
    const initiative = this.active;
    this.active = null;
    if (remember) this.state.dismissed[initiative.fingerprint] = Date.now();
    this.options.onDismiss?.(initiative, reason);
    safeWrite(this.options.storageKey, this.state);
  }

  private schedule(delayMs = this.evaluateEveryMs) {
    if (this.stopped) return;
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.tick(), delayMs);
  }

  private tick() {
    if (this.stopped) return;
    if (document.hidden || this.active) {
      this.schedule();
      return;
    }

    const observation = this.options.getObservation();
    const silentFor = observation.now - this.state.lastUserActivityAt;
    if (observation.isBusy || silentFor < this.minimumSilenceMs) {
      this.schedule();
      return;
    }

    const candidates = buildCandidates(observation)
      .filter((candidate) => {
        const dismissedAt = this.state.dismissed[candidate.fingerprint] || 0;
        const shownAt = this.state.shown[candidate.fingerprint] || 0;
        return observation.now - Math.max(dismissedAt, shownAt) >= candidate.cooldownMs;
      })
      .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority] || b.score - a.score);

    const candidate = candidates[0];
    if (!candidate) {
      this.schedule();
      return;
    }

    const initiative: FlowInitiative = {
      id: `initiative_${observation.now}_${Math.random().toString(16).slice(2)}`,
      ...candidate,
      createdAt: observation.now,
      expiresAt: observation.now + candidate.ttlMs,
    };
    this.active = initiative;
    this.state.shown[initiative.fingerprint] = observation.now;
    safeWrite(this.options.storageKey, this.state);
    this.options.onInitiative(initiative);
    this.schedule(candidate.ttlMs + 1_000);
  }
}
