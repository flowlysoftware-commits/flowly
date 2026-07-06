import type { FlowlyApprovedPlanResolution } from "@/lib/flowlyApprovedPlanResolver";

export type FlowlySeoPlanBlockerResult = {
  blocked: boolean;
  reason: string;
};

export function analyzeSeoPlanBlocker(params: {
  planResolution: FlowlyApprovedPlanResolution;
}): FlowlySeoPlanBlockerResult {
  const { planResolution } = params;

  if ((planResolution.requestedDomain === "budget_crm" || planResolution.requestedDomain === "companion_avatar") && planResolution.planDomain === "seo") {
    return {
      blocked: true,
      reason: `La misión actual apunta a ${planResolution.requestedDomain}, pero el plan recuperado es de SEO/robots/sitemap/metadata. Se bloquea para evitar ejecutar un plan contaminado.`,
    };
  }

  return {
    blocked: false,
    reason: "No se detectó contaminación SEO incompatible con la misión actual.",
  };
}

export function buildSeoPlanBlockedReply(result: FlowlySeoPlanBlockerResult) {
  return [
    "No ejecuto ese plan.",
    "",
    `Motivo: ${result.reason}`,
    "",
    "Necesito recuperar un plan aprobado compatible con presupuestos del CRM antes de activar Executor.",
  ].join("\n");
}
