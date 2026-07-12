import { FlowFacing, FlowPanelTarget, FlowPosition } from "./types";

const EDGE = 18;
const CHARACTER_WIDTH = 286;
const CHARACTER_HEIGHT = 420;
const TARGET_GAP = 18;

type RectLike = { left: number; top: number; right: number; bottom: number; width: number; height: number };

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

function clampPosition(position: FlowPosition): FlowPosition {
  return {
    left: Math.max(EDGE, Math.min(window.innerWidth - CHARACTER_WIDTH - EDGE, position.left)),
    top: Math.max(EDGE, Math.min(window.innerHeight - CHARACTER_HEIGHT - EDGE, position.top)),
  };
}

function characterRect(position: FlowPosition): RectLike {
  return { left: position.left, top: position.top, right: position.left + CHARACTER_WIDTH, bottom: position.top + CHARACTER_HEIGHT, width: CHARACTER_WIDTH, height: CHARACTER_HEIGHT };
}

function overlapArea(a: RectLike, b: RectLike) {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return width * height;
}

function visibleObstacles(target: HTMLElement): RectLike[] {
  const selectors = "button,a,input,textarea,select,[role='button'],h1,h2,h3,[data-flow-obstacle='true']";
  return Array.from(document.querySelectorAll<HTMLElement>(selectors))
    .filter((node) => node !== target && !node.closest(".flow-engine-root"))
    .map((node) => node.getBoundingClientRect())
    .filter((rect) => rect.width > 24 && rect.height > 16 && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth)
    .map((rect) => ({ left: rect.left - 8, top: rect.top - 8, right: rect.right + 8, bottom: rect.bottom + 8, width: rect.width + 16, height: rect.height + 16 }));
}

export function getTargetApproach(element: HTMLElement): FlowTargetApproach {
  const rect = element.getBoundingClientRect();
  const centeredTop = rect.top + rect.height / 2 - CHARACTER_HEIGHT / 2;
  const candidates: Array<{ position: FlowPosition; facing: FlowFacing; bias: number }> = [
    { position: { left: rect.right + TARGET_GAP, top: centeredTop }, facing: "left", bias: 0 },
    { position: { left: rect.left - CHARACTER_WIDTH - TARGET_GAP, top: centeredTop }, facing: "right", bias: 1 },
    { position: { left: rect.left + rect.width / 2 - CHARACTER_WIDTH / 2, top: rect.bottom + TARGET_GAP }, facing: "front", bias: 3 },
  ];
  const obstacles = visibleObstacles(element);
  const evaluated = candidates.map((candidate) => {
    const position = clampPosition(candidate.position);
    const area = characterRect(position);
    const overlap = obstacles.reduce((sum, obstacle) => sum + overlapArea(area, obstacle), 0);
    const targetOverlap = overlapArea(area, { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height });
    const edgePenalty = position.left <= EDGE || position.left >= window.innerWidth - CHARACTER_WIDTH - EDGE ? 30000 : 0;
    return { ...candidate, position, score: overlap + targetOverlap * 4 + edgePenalty + candidate.bias * 100 };
  }).sort((a, b) => a.score - b.score);
  const best = evaluated[0];
  return {
    destination: best.position,
    facing: best.facing,
    clickPoint: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
  };
}

export function getTargetDestination(element: HTMLElement): FlowPosition { return getTargetApproach(element).destination; }
export function isElementActionable(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none" && style.opacity !== "0";
}
export function highlightTarget(element: HTMLElement, active: boolean) { element.classList.toggle("flow-engine-target-highlight", active); }
