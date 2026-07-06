"use client";

import FlowlyAssistant3D from "@/components/FlowlyAssistant3D";

type LegacyEvolutionaryCompanionAvatarProps = {
  name?: string;
  level?: number;
  xpPercent?: number;
  mood?: string;
  modelUrl?: string;
  memory?: string;
  compact?: boolean;
  onClick?: () => void;
};

function mapLegacyMood(mood?: string) {
  if (mood === "walking") return "walk";
  if (mood === "talking" || mood === "working") return "talk";
  if (mood === "thinking") return "thinking";
  if (mood === "happy" || mood === "celebrating") return "wave";
  return "idle";
}

/**
 * V6 compatibility preview.
 * The old evolutionary avatar no longer owns movement, bubble, drag or runtime state.
 * It only renders the same Flow model for legacy preview pages so no second Companion
 * can fight with the real FlowlyCompanionRuntime.
 */
export default function EvolutionaryCompanionAvatar({
  name = "Flow",
  mood = "idle",
  modelUrl = "/avatars/flowly.glb",
  compact = false,
  onClick,
}: LegacyEvolutionaryCompanionAvatarProps) {
  return (
    <div className="flowly-v6-legacy-preview" aria-label={`Vista previa de ${name}`}>
      <FlowlyAssistant3D
        modelUrl={modelUrl || "/avatars/flowly.glb"}
        mode={mapLegacyMood(mood)}
        facing="front"
        skinTone="flowly"
        compact={compact}
        onClick={onClick}
      />
    </div>
  );
}
