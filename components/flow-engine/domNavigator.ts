import { FlowPanelTarget, FlowPosition } from "./types";

const EDGE = 16;
const CHARACTER_WIDTH = 220;
const CHARACTER_HEIGHT = 320;

export function normalizeFlowText(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function detectNavigationTarget(text: string, targets: FlowPanelTarget[]) {
  const normalized = normalizeFlowText(text);
  const intent = /\b(llevame|abre|abrir|ve|ir|vamos|entra|muestrame|navega|pulsa|click|clic)\b/.test(normalized);
  if (!intent) return null;
  return targets.find((target) => [target.key, target.label, ...(target.aliases || [])].some((alias) => normalized.includes(normalizeFlowText(alias)))) || null;
}

export function getTargetDestination(element: HTMLElement): FlowPosition {
  const rect = element.getBoundingClientRect();
  const right = rect.right + 10;
  const left = right + CHARACTER_WIDTH <= window.innerWidth - EDGE ? right : rect.left - CHARACTER_WIDTH - 10;
  return {
    left: Math.max(EDGE, Math.min(window.innerWidth - CHARACTER_WIDTH - EDGE, left)),
    top: Math.max(EDGE, Math.min(window.innerHeight - CHARACTER_HEIGHT - EDGE, rect.top + rect.height / 2 - CHARACTER_HEIGHT / 2)),
  };
}

export function highlightTarget(element: HTMLElement, active: boolean) {
  element.classList.toggle("flow-engine-target-highlight", active);
}
