"use client";

import type { FlowlyCompanionSkinTone } from "@/lib/flowlyCompanionSkins";

export type { FlowlyCompanionSkinTone } from "@/lib/flowlyCompanionSkins";

type AssistantMode =
  | "idle"
  | "walk"
  | "wave"
  | "talk"
  | "point"
  | "thinking"
  | "tour"
  | "sit"
  | "attention"
  | "reading"
  | "typing"
  | "concerned"
  | "celebrating";

type FlowlyAssistant3DProps = {
  modelUrl?: string;
  mode?: AssistantMode;
  facing?: "left" | "right" | "front";
  skinTone?: FlowlyCompanionSkinTone;
  onClick?: () => void;
};

function normalizeMode(mode?: AssistantMode) {
  if (mode === "tour") return "point";
  if (mode === "sit") return "idle";
  return mode || "idle";
}

/**
 * Companion V2 renderer.
 *
 * This intentionally uses the Flow base character as a deterministic CSS renderer.
 * The previous Three/GLB path was brittle in production: if WebGL, the model file,
 * Suspense, CSS sizing or a browser GPU failed, the Companion disappeared. For the
 * product we need the opposite: Flow must be visible 100% of the time and skins must
 * be cheap variants of the same base character.
 *
 * Real 3D can return later behind this same component, but this component must remain
 * the single source of truth for rendering the Companion.
 */
export default function FlowlyAssistant3D({
  mode = "idle",
  facing = "front",
  skinTone = "flowly",
  onClick,
}: FlowlyAssistant3DProps) {
  const safeMode = normalizeMode(mode);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flowly-3d-stage flowly-css-stage flowly-css-avatar-${skinTone}`}
      data-mode={safeMode}
      data-facing={facing}
      aria-label="Abrir Companion de Flowly"
    >
      <span className="flowly-css-avatar" aria-hidden="true">
        <span className="flowly-css-avatar-shadow" />
        <span className="flowly-css-avatar-body">
          <span className="flowly-css-avatar-neck" />
          <span className="flowly-css-avatar-chest" />
          <span className="flowly-css-avatar-core" />
        </span>
        <span className="flowly-css-avatar-head">
          <span className="flowly-css-avatar-hair hair-a" />
          <span className="flowly-css-avatar-hair hair-b" />
          <span className="flowly-css-avatar-hair hair-c" />
          <span className="flowly-css-avatar-chef-hat" />
          <span className="flowly-css-avatar-face">
            <span className="flowly-css-avatar-eye flowly-css-avatar-eye-left" />
            <span className="flowly-css-avatar-eye flowly-css-avatar-eye-right" />
            <span className="flowly-css-avatar-smile" />
          </span>
        </span>
        <span className="flowly-css-avatar-arm flowly-css-avatar-arm-left" />
        <span className="flowly-css-avatar-arm flowly-css-avatar-arm-right" />
        <span className="flowly-css-avatar-leg flowly-css-avatar-leg-left" />
        <span className="flowly-css-avatar-leg flowly-css-avatar-leg-right" />
        <span className="flowly-css-avatar-spark spark-a" />
        <span className="flowly-css-avatar-spark spark-b" />
      </span>
    </button>
  );
}
