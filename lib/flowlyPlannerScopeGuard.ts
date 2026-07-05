import type { ExecutorFileChange } from "@/lib/flowlyGitHubExecutor";
import { isBudgetCrmObjective } from "@/lib/flowlyGoalFidelityGuard";

export type FlowlyPlannerScopeGuardResult = {
  ok: boolean;
  active: boolean;
  scopeName: string;
  allowedFiles: string[];
  safeFiles: string[];
  blockedFiles: string[];
  reasons: string[];
  summary: string;
};

const BUDGET_CRM_SCOPE = [
  "app/admin/presupuestos/page.tsx",
  "app/admin/presupuestos/pdf.tsx",
  "app/admin/clientes/page.tsx",
];

function normalizePath(path: string) {
  return path.replace(/^\.\//, "").replace(/\\/g, "/");
}

function unique(items: string[]) {
  return Array.from(new Set(items));
}

export function getPlannerAllowedScope(instruction: string): { active: boolean; scopeName: string; allowedFiles: string[] } {
  if (isBudgetCrmObjective(instruction)) {
    return {
      active: true,
      scopeName: "budget_crm_integration",
      allowedFiles: BUDGET_CRM_SCOPE,
    };
  }

  return {
    active: false,
    scopeName: "general",
    allowedFiles: [],
  };
}

export function validatePlannerScope(params: { instruction: string; files: Array<{ path: string }> }): FlowlyPlannerScopeGuardResult {
  const scope = getPlannerAllowedScope(params.instruction);
  const requestedFiles = unique(params.files.map((file) => normalizePath(file.path)).filter(Boolean));

  if (!scope.active) {
    return {
      ok: true,
      active: false,
      scopeName: scope.scopeName,
      allowedFiles: [],
      safeFiles: requestedFiles,
      blockedFiles: [],
      reasons: [],
      summary: "Planner Scope Guard inactivo: no hay scope cerrado para esta misión.",
    };
  }

  const allowed = new Set(scope.allowedFiles.map(normalizePath));
  const safeFiles = requestedFiles.filter((path) => allowed.has(path));
  const blockedFiles = requestedFiles.filter((path) => !allowed.has(path));
  const reasons = blockedFiles.map(
    (path) => `Planner Scope Guard bloqueó ${path}: no pertenece al scope validado ${scope.scopeName}.`
  );

  return {
    ok: blockedFiles.length === 0,
    active: true,
    scopeName: scope.scopeName,
    allowedFiles: scope.allowedFiles,
    safeFiles,
    blockedFiles,
    reasons,
    summary: blockedFiles.length
      ? `Planner Scope Guard bloqueado: ${blockedFiles.length} archivo(s) fuera del scope validado. Scope permitido: ${scope.allowedFiles.join(", ")}.`
      : `Planner Scope Guard OK: todos los archivos pertenecen al scope validado ${scope.scopeName}.`,
  };
}

export function filterFilesToPlannerScope<T extends ExecutorFileChange>(instruction: string, files: T[]): { files: T[]; guard: FlowlyPlannerScopeGuardResult } {
  const guard = validatePlannerScope({ instruction, files });
  if (!guard.active) return { files, guard };

  const safe = new Set(guard.safeFiles.map(normalizePath));
  return {
    files: files.filter((file) => safe.has(normalizePath(file.path))),
    guard,
  };
}

export function buildPlannerScopePrompt(instruction: string) {
  const scope = getPlannerAllowedScope(instruction);
  if (!scope.active) return null;

  return [
    `Planner Scope Guard activo: ${scope.scopeName}.`,
    "La planificación y cualquier propuesta de archivos debe permanecer dentro del scope validado.",
    "Archivos permitidos:",
    ...scope.allowedFiles.map((path) => `- ${path}`),
    "Cualquier archivo fuera de esta lista queda bloqueado salvo que antes se ejecute una nueva verificación de evidencia.",
  ].join("\n");
}
