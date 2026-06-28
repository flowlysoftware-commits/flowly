"use client";

import FlowlyAssistant3D from "@/components/FlowlyAssistant3D";

type CompanionMood = "idle" | "happy" | "thinking" | "talking" | "celebrating" | "working" | "sleeping" | "walking";

type EvolutionaryCompanionAvatarProps = {
  name?: string;
  level?: number;
  xpPercent?: number;
  mood?: CompanionMood | string;
  compact?: boolean;
  onClick?: () => void;
  memory?: string;
};

function normalizeMood(value?: CompanionMood | string): CompanionMood {
  const mood = String(value || "idle").toLowerCase();
  if (mood.includes("feliz") || mood.includes("happy")) return "happy";
  if (mood.includes("pens") || mood.includes("thinking")) return "thinking";
  if (mood.includes("habl") || mood.includes("talk")) return "talking";
  if (mood.includes("cele") || mood.includes("logro")) return "celebrating";
  if (mood.includes("trab") || mood.includes("work")) return "working";
  if (mood.includes("dorm") || mood.includes("sleep")) return "sleeping";
  if (mood.includes("cam") || mood.includes("walk")) return "walking";
  return "idle";
}

function moodTo3DMode(mood: CompanionMood): "idle" | "walk" | "wave" | "talk" | "point" | "thinking" | "tour" | "sit" {
  if (mood === "talking") return "talk";
  if (mood === "walking") return "walk";
  if (mood === "happy" || mood === "celebrating") return "wave";
  if (mood === "working") return "point";
  if (mood === "sleeping") return "sit";
  if (mood === "thinking") return "thinking";
  return "idle";
}

export default function EvolutionaryCompanionAvatar({
  name = "Flowly",
  level = 1,
  xpPercent = 28,
  mood = "idle",
  compact = false,
  onClick,
  memory,
}: EvolutionaryCompanionAvatarProps) {
  const normalizedMood = normalizeMood(mood);
  const stage = level >= 20 ? "legendary" : level >= 10 ? "evolved" : level >= 5 ? "growing" : "starter";
  const safeXp = Math.max(4, Math.min(100, xpPercent));
  const mode = moodTo3DMode(normalizedMood);

  return (
    <div
      className={`evo-companion-3d evo-companion-3d-${stage} evo-companion-3d-${normalizedMood} ${compact ? "evo-companion-3d-compact" : ""}`}
      data-mood={normalizedMood}
      data-stage={stage}
    >
      <span className="evo-3d-aura evo-3d-aura-one" />
      <span className="evo-3d-aura evo-3d-aura-two" />
      <span className="evo-3d-pulse" />
      <FlowlyAssistant3D
        modelUrl="/avatars/flowly-companion.glb"
        mode={mode}
        facing="left"
        onClick={onClick}
      />
      {!compact && (
        <span className="evo-card evo-card-3d">
          <strong>{name}</strong>
          <small>
            Nivel {level} · Evolución {stage === "starter" ? "inicial" : stage === "growing" ? "creciendo" : stage === "evolved" ? "avanzada" : "legendaria"}
          </small>
          <span className="evo-status-strip">
            <i>{normalizedMood === "talking" ? "Hablando" : normalizedMood === "thinking" ? "Pensando" : normalizedMood === "walking" ? "Explorando" : normalizedMood === "celebrating" ? "Celebrando" : "Vivo"}</i>
            {memory && <em>{memory}</em>}
          </span>
          <span className="evo-xp"><i style={{ width: `${safeXp}%` }} /></span>
        </span>
      )}
    </div>
  );
}
