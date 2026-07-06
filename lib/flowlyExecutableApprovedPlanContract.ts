import { isBudgetCrmObjective } from "@/lib/flowlyGoalFidelityGuard";
import { getPlannerAllowedScope } from "@/lib/flowlyPlannerScopeGuard";

export type FlowlyExecutableApprovedPlanContract = {
  version: "flowly_executable_plan_contract_v1";
  goal: string;
  domain: string;
  filesToModify: string[];
  allowedFiles: string[];
  forbiddenFiles: string[];
  risks: string[];
  requiresSqlCheck: boolean;
  executionConditions: string[];
  source: "planner_scope" | "approved_plan" | "manual_contract";
};


function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectContractDomain(value: string) {
  const text = normalize(value);
  const hasBudget = /presupuesto|presupuestos|budget|salesbudget|budgetmodule|app\/admin\/presupuestos/.test(text);
  const hasCrm = /\bcrm\b|cliente|clientes|contacto|contactos|app\/admin\/clientes/.test(text);
  if (hasBudget && hasCrm) return "budget_crm";
  if (/\bseo\b|metadata|metadatos|robots\.ts|sitemap\.ts|open\s*graph|opengraph/.test(text)) return "seo";
  return "unknown";
}

function normalizePath(path: string) {
  return path.replace(/^\.\//, "").replace(/\\/g, "/").trim();
}

function unique(items: string[]) {
  return Array.from(new Set(items.map(normalizePath).filter(Boolean)));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function compactPlanText(plan: unknown) {
  if (!plan) return "";
  if (typeof plan === "string") return plan;
  try {
    return JSON.stringify(plan).slice(0, 12000);
  } catch {
    return "";
  }
}

export function getExecutableApprovedPlanContract(plan: unknown): FlowlyExecutableApprovedPlanContract | null {
  if (!isRecord(plan)) return null;
  const contract = plan.executableContract;
  if (!isRecord(contract)) return null;

  const filesToModify = unique(stringArray(contract.filesToModify));
  const allowedFiles = unique(stringArray(contract.allowedFiles));
  const forbiddenFiles = unique(stringArray(contract.forbiddenFiles));
  if (!filesToModify.length) return null;

  return {
    version: "flowly_executable_plan_contract_v1",
    goal: typeof contract.goal === "string" ? contract.goal : "Plan aprobado de Flowly",
    domain: typeof contract.domain === "string" ? contract.domain : "unknown",
    filesToModify,
    allowedFiles: allowedFiles.length ? allowedFiles : filesToModify,
    forbiddenFiles,
    risks: stringArray(contract.risks),
    requiresSqlCheck: Boolean(contract.requiresSqlCheck),
    executionConditions: stringArray(contract.executionConditions),
    source: contract.source === "manual_contract" || contract.source === "approved_plan" || contract.source === "planner_scope" ? contract.source : "approved_plan",
  };
}

export function buildExecutableApprovedPlanContract(params: {
  instruction: string;
  plan?: unknown;
}): FlowlyExecutableApprovedPlanContract | null {
  const existing = getExecutableApprovedPlanContract(params.plan);
  if (existing) return existing;

  const text = [params.instruction, compactPlanText(params.plan)].filter(Boolean).join("\n");
  const domain = detectContractDomain(text);
  const isBudgetCrm = domain === "budget_crm" || isBudgetCrmObjective(text);
  if (!isBudgetCrm) return null;

  const scope = getPlannerAllowedScope("integrar presupuestos en CRM");
  const files = unique(scope.allowedFiles);

  return {
    version: "flowly_executable_plan_contract_v1",
    goal: "Integrar presupuestos dentro del CRM reutilizando la pantalla de presupuestos, el PDF existente y la gestión de clientes.",
    domain: "budget_crm",
    filesToModify: files,
    allowedFiles: files,
    forbiddenFiles: [
      "app/docs/studio/page.tsx",
      "app/robots.ts",
      "app/sitemap.ts",
      "app/layout.tsx",
      "app/page.tsx",
    ],
    risks: [
      "Verificar durante ejecución si SalesBudget ya contiene relación con cliente.",
      "Si no existe relación cliente-presupuesto en Supabase, detenerse y pedir SQL mínimo antes de tocar datos.",
      "No ampliar scope fuera de CRM/presupuestos sin nueva evidencia del Project Reader.",
    ],
    requiresSqlCheck: true,
    executionConditions: [
      "Grounding Guard debe validar que todos los archivos existen en Project Graph.",
      "Executor solo puede modificar archivos dentro de allowedFiles salvo nueva evidencia explícita.",
      "Build Guard y QA deben ejecutarse antes de crear o cerrar el Pull Request.",
    ],
    source: "planner_scope",
  };
}

export function attachExecutableApprovedPlanContract<T extends object>(plan: T, instruction: string): T & { executableContract?: FlowlyExecutableApprovedPlanContract } {
  const contract = buildExecutableApprovedPlanContract({ instruction, plan });
  if (!contract) return plan;
  return {
    ...plan,
    executableContract: contract,
  };
}

export function getExecutablePlanFilePaths(plan: unknown): string[] {
  const contract = getExecutableApprovedPlanContract(plan);
  if (contract?.filesToModify.length) return contract.filesToModify;

  if (!isRecord(plan)) return [];
  const proposedFiles = Array.isArray(plan.proposedFiles) ? plan.proposedFiles : [];
  return unique(
    proposedFiles
      .map((file) => (isRecord(file) && typeof file.path === "string" ? file.path : ""))
      .filter(Boolean)
  );
}

export function buildExecutableContractSummary(contract: FlowlyExecutableApprovedPlanContract | null) {
  if (!contract) return "Sin contrato ejecutable.";
  return [
    `Contrato ejecutable: ${contract.domain}`,
    `Objetivo: ${contract.goal}`,
    `Archivos a validar: ${contract.filesToModify.join(", ")}`,
    contract.requiresSqlCheck ? "Requiere verificación SQL/modelo de datos antes de cerrar ejecución." : "No requiere SQL inicial.",
  ].join(" ");
}
