import type { FlowLogger } from "../core/logger";
import type { FlowMessage } from "../types";
import { emptyFlowMemory, readFlowMemory, writeFlowMemory } from "./storage";
import type { FlowMemoryContext, FlowMemoryFact, FlowMemoryKind, FlowMemorySnapshot } from "./types";

type MemoryOptions = {
  storageKey: string;
  logger?: FlowLogger;
  maxFacts?: number;
  maxRoutes?: number;
  maxRoutines?: number;
  maxConversation?: number;
  onChange?: (snapshot: FlowMemorySnapshot) => void;
};

const normalize = (value: string) => value.trim().replace(/\s+/g, " ");
const slug = (value: string) => normalize(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const now = () => new Date().toISOString();

function extractExplicitFacts(text: string): Array<{ kind: FlowMemoryKind; key: string; value: string }> {
  const clean = normalize(text);
  const results: Array<{ kind: FlowMemoryKind; key: string; value: string }> = [];
  const remember = clean.match(/(?:recuerda|acu[eé]rdate)(?:\s+de)?\s+que\s+(.{3,180})/i);
  if (remember?.[1]) results.push({ kind: "fact", key: slug(remember[1].slice(0, 48)) || "dato", value: remember[1] });

  const preference = clean.match(/(?:prefiero|me gusta m[aá]s|quiero que siempre)\s+(.{3,140})/i);
  if (preference?.[1]) results.push({ kind: "preference", key: slug(preference[1].slice(0, 48)) || "preferencia", value: preference[1] });

  const company = clean.match(/(?:mi empresa|nuestra empresa|la empresa)\s+(?:se llama|es)\s+(.{2,80})/i);
  if (company?.[1]) results.push({ kind: "company", key: "name", value: company[1].replace(/[.?!].*$/, "") });

  const name = clean.match(/(?:me llamo|mi nombre es)\s+([A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{2,60})/i);
  if (name?.[1]) results.push({ kind: "person", key: "user-name", value: name[1].replace(/[.?!].*$/, "") });
  return results;
}

export class FlowMemoryEngine {
  private snapshot: FlowMemorySnapshot = emptyFlowMemory();
  private flushTimer: number | null = null;
  private readonly options: Required<Pick<MemoryOptions, "storageKey" | "maxFacts" | "maxRoutes" | "maxRoutines" | "maxConversation">> & Omit<MemoryOptions, "storageKey" | "maxFacts" | "maxRoutes" | "maxRoutines" | "maxConversation">;

  constructor(options: MemoryOptions) {
    this.options = {
      ...options,
      maxFacts: options.maxFacts ?? 80,
      maxRoutes: options.maxRoutes ?? 20,
      maxRoutines: options.maxRoutines ?? 30,
      maxConversation: options.maxConversation ?? 24,
    };
  }

  start() {
    this.snapshot = readFlowMemory(this.options.storageKey, this.options.logger);
    this.emit();
  }

  stop() {
    if (this.flushTimer !== null) window.clearTimeout(this.flushTimer);
    this.flush();
  }

  getSnapshot(): FlowMemorySnapshot {
    return structuredClone(this.snapshot);
  }

  buildContext(): FlowMemoryContext {
    const groups = {
      profile: {} as Record<string, string>,
      preferences: {} as Record<string, string>,
      company: {} as Record<string, string>,
      people: {} as Record<string, string>,
    };
    for (const fact of this.snapshot.facts) {
      if (fact.kind === "preference") groups.preferences[fact.key] = fact.value;
      else if (fact.kind === "company") groups.company[fact.key] = fact.value;
      else if (fact.kind === "person") groups.people[fact.key] = fact.value;
      else groups.profile[fact.key] = fact.value;
    }
    return {
      ...groups,
      routines: [...this.snapshot.routines].sort((a, b) => b.count - a.count).slice(0, 10),
      frequentRoutes: [...this.snapshot.routes].sort((a, b) => b.visits - a.visits).slice(0, 8),
      recentConversation: this.snapshot.recentConversation.slice(-12).map(({ role, text }) => ({ role, text })),
    };
  }

  recordMessage(message: FlowMessage) {
    this.snapshot.recentConversation = [...this.snapshot.recentConversation, message].slice(-this.options.maxConversation);
    if (message.role === "user") {
      extractExplicitFacts(message.text).forEach((fact) => this.rememberFact({ ...fact, confidence: 1, source: "explicit-user" }, false));
      this.recordRoutine(`chat:${slug(message.text.slice(0, 42)) || "message"}`, false);
    }
    this.touch();
  }

  observePath(pathname: string) {
    const clean = pathname.trim();
    if (!clean) return;
    const existing = this.snapshot.routes.find((item) => item.pathname === clean);
    if (existing) {
      existing.visits += 1;
      existing.lastVisitedAt = now();
    } else {
      this.snapshot.routes.push({ pathname: clean, visits: 1, lastVisitedAt: now() });
    }
    this.snapshot.routes = this.snapshot.routes.sort((a, b) => b.visits - a.visits).slice(0, this.options.maxRoutes);
    this.recordRoutine(`route:${clean}`, false);
    this.touch();
  }

  rememberFact(input: Pick<FlowMemoryFact, "kind" | "key" | "value" | "confidence" | "source">, notify = true) {
    const key = normalize(input.key);
    const value = normalize(input.value);
    if (!key || !value) return;
    const current = this.snapshot.facts.find((fact) => fact.kind === input.kind && fact.key === key);
    if (current) {
      current.value = value;
      current.confidence = Math.max(current.confidence, input.confidence);
      current.source = input.source;
      current.updatedAt = now();
    } else {
      const timestamp = now();
      this.snapshot.facts.push({ id: `memory_${Date.now()}_${Math.random().toString(16).slice(2)}`, ...input, key, value, createdAt: timestamp, updatedAt: timestamp });
    }
    this.snapshot.facts = this.snapshot.facts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, this.options.maxFacts);
    if (notify) this.touch();
  }

  forgetFact(idOrKey: string) {
    const before = this.snapshot.facts.length;
    this.snapshot.facts = this.snapshot.facts.filter((fact) => fact.id !== idOrKey && fact.key !== idOrKey);
    if (before !== this.snapshot.facts.length) this.touch();
  }

  clear() {
    this.snapshot = emptyFlowMemory();
    this.touch();
  }

  private recordRoutine(key: string, notify = true) {
    const existing = this.snapshot.routines.find((routine) => routine.key === key);
    if (existing) {
      existing.count += 1;
      existing.lastSeenAt = now();
    } else {
      this.snapshot.routines.push({ key, count: 1, lastSeenAt: now() });
    }
    this.snapshot.routines = this.snapshot.routines.sort((a, b) => b.count - a.count).slice(0, this.options.maxRoutines);
    if (notify) this.touch();
  }

  private touch() {
    this.snapshot.updatedAt = now();
    this.emit();
    if (this.flushTimer !== null) window.clearTimeout(this.flushTimer);
    this.flushTimer = window.setTimeout(() => this.flush(), 250);
  }

  private flush() {
    if (typeof window === "undefined") return;
    writeFlowMemory(this.options.storageKey, this.snapshot, this.options.logger);
    this.flushTimer = null;
  }

  private emit() {
    this.options.onChange?.(this.getSnapshot());
  }
}
