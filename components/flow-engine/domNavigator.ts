import { FlowFacing, FlowPanelTarget, FlowPosition } from "./types";

const EDGE = 16;
const CHARACTER_WIDTH = 220;
const CHARACTER_HEIGHT = 320;
const TARGET_GAP = 14;

export type FlowTargetApproach = {
  destination: FlowPosition;
  facing: FlowFacing;
  clickPoint: { x: number; y: number };
};

export function normalizeFlowText(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function detectNavigationTarget(text: string, targets: FlowPanelTarget[]) {
  const normalized = normalizeFlowText(text);
  const intent = /\b(llevame|abre|abrir|ve|ir|vamos|entra|muestrame|navega|pulsa|click|clic)\b/.test(normalized);
  if (!intent) return null;
  return targets.find((target) => [target.key, target.label, ...(target.aliases || [])].some((alias) => normalized.includes(normalizeFlowText(alias)))) || null;
}

export function getTargetApproach(element: HTMLElement): FlowTargetApproach {
  const rect = element.getBoundingClientRect();
  const availableRight = window.innerWidth - rect.right;
  const availableLeft = rect.left;
  const standOnRight = availableRight >= CHARACTER_WIDTH + TARGET_GAP || availableRight >= availableLeft;
  const rawLeft = standOnRight
    ? rect.right + TARGET_GAP
    : rect.left - CHARACTER_WIDTH - TARGET_GAP;
  const destination = {
    left: Math.max(EDGE, Math.min(window.innerWidth - CHARACTER_WIDTH - EDGE, rawLeft)),
    top: Math.max(
      EDGE,
      Math.min(
        window.innerHeight - CHARACTER_HEIGHT - EDGE,
        rect.top + rect.height / 2 - CHARACTER_HEIGHT / 2,
      ),
    ),
  };

  return {
    destination,
    facing: standOnRight ? "left" : "right",
    clickPoint: {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    },
  };
}

export function getTargetDestination(element: HTMLElement): FlowPosition {
  return getTargetApproach(element).destination;
}

export function isElementActionable(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
}

export function highlightTarget(element: HTMLElement, active: boolean) {
  element.classList.toggle("flow-engine-target-highlight", active);
}
