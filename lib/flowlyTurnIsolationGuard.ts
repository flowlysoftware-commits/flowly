import { isEvidenceCheckInstruction } from "@/lib/flowlyEvidenceCheck";
import { mustTreatAsPlanningTransition } from "@/lib/flowlyIntentTransitionGuard";
import { isIndependentArchitectureCritiqueInstruction } from "@/lib/flowlyMissionRelevanceFilter";

export type FlowlyTurnIsolationIntent =
  | "audit_evidence_check"
  | "planning_transition"
  | "architecture_critique"
  | "current_turn";

export type FlowlyTurnIsolationDecision = {
  intent: FlowlyTurnIsolationIntent;
  isolated: boolean;
  reason: string;
  mustIgnorePreviousGuardReply: boolean;
  mustIgnoreCurrentMission: boolean;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function hasEvidenceLanguage(instruction: string) {
  const text = normalize(instruction);
  return (
    /\bevidencia\b/.test(text) ||
    /primeras\s+\d+\s+lineas/.test(text) ||
    /contenido\s+real/.test(text) ||
    /project\s+reader/.test(text) ||
    /si\s+existe\s+o\s+no\s+existe/.test(text)
  );
}

function hasExplicitArchitectureDanger(instruction: string) {
  const text = normalize(instruction);
  return (
    /\b(segundo|otro|nuevo)\s+brain\b/.test(text) ||
    /\bbudgetengine\b/.test(text) ||
    /\b(nuevo|otro|segundo)\s+engine\b/.test(text) ||
    /\bmotor\s+nuevo\b/.test(text) ||
    /\bmotores\s+duplicados\b/.test(text)
  );
}

export function analyzeTurnIsolation(instruction: string): FlowlyTurnIsolationDecision {
  if (isEvidenceCheckInstruction(instruction) || hasEvidenceLanguage(instruction)) {
    return {
      intent: "audit_evidence_check",
      isolated: true,
      reason: "El mensaje actual pide evidencia verificable del proyecto; debe ignorar respuestas/guards anteriores y ejecutar Evidence Check.",
      mustIgnorePreviousGuardReply: true,
      mustIgnoreCurrentMission: false,
    };
  }

  if (mustTreatAsPlanningTransition(instruction)) {
    return {
      intent: "planning_transition",
      isolated: true,
      reason: "El mensaje actual acepta evidencia previa y pide transición a planificación; no debe repetir evidencia ni reutilizar otro guard.",
      mustIgnorePreviousGuardReply: true,
      mustIgnoreCurrentMission: false,
    };
  }

  if (hasExplicitArchitectureDanger(instruction) && isIndependentArchitectureCritiqueInstruction(instruction)) {
    return {
      intent: "architecture_critique",
      isolated: true,
      reason: "El mensaje actual plantea una decisión arquitectónica peligrosa; debe responder como CTO sin contaminarse por la misión activa.",
      mustIgnorePreviousGuardReply: true,
      mustIgnoreCurrentMission: true,
    };
  }

  return {
    intent: "current_turn",
    isolated: false,
    reason: "No hay señales de que deba aislarse un guard específico; el turno puede seguir el flujo normal.",
    mustIgnorePreviousGuardReply: true,
    mustIgnoreCurrentMission: false,
  };
}
