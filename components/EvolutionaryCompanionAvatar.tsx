"use client";

type CompanionMood = "idle" | "happy" | "thinking" | "talking" | "celebrating" | "working" | "sleeping" | "walking";

type EvolutionaryCompanionAvatarProps = {
  name?: string;
  level?: number;
  xpPercent?: number;
  mood?: CompanionMood | string;
  compact?: boolean;
  onClick?: () => void;
  memory?: string; // New prop for memory
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

export default function EvolutionaryCompanionAvatar({
  name = "Nova",
  level = 1,
  xpPercent = 28,
  mood = "idle",
  compact = false,
  onClick,
  memory = "", // Default memory
}: EvolutionaryCompanionAvatarProps) {
  const normalizedMood = normalizeMood(mood);
  const stage = level >= 20 ? "legendary" : level >= 10 ? "evolved" : level >= 5 ? "growing" : "starter";
  const safeXp = Math.max(4, Math.min(100, xpPercent));

  return (
    <button
      type="button"
      className={`evo-companion evo-companion-${stage} evo-companion-${normalizedMood} ${compact ? "evo-companion-compact" : ""}`}
      onClick={onClick}
      aria-label={`Hablar con ${name}`}
    >
      <span className="evo-aura evo-aura-one" />
      <span className="evo-aura evo-aura-two" />
      <span className="evo-spark evo-spark-a" />
      <span className="evo-spark evo-spark-b" />
      <span className="evo-spark evo-spark-c" />

      <span className="evo-body">
        <span className="evo-hood" />
        <span className="evo-head">
          <span className="evo-hair evo-hair-a" />
          <span className="evo-hair evo-hair-b" />
          <span className="evo-hair evo-hair-c" />
          <span className="evo-ear evo-ear-left" />
          <span className="evo-ear evo-ear-right" />
          <span className="evo-eye evo-eye-left" />
          <span className="evo-eye evo-eye-right" />
          <span className="evo-cheek evo-cheek-left" />
          <span className="evo-cheek evo-cheek-right" />
          <span className="evo-mouth" />
        </span>
        <span className="evo-torso">
          <span className="evo-core" />
          <span className="evo-badge" />
        </span>
        <span className="evo-arm evo-arm-left"><span /></span>
        <span className="evo-arm evo-arm-right"><span /></span>
        <span className="evo-leg evo-leg-left" />
        <span className="evo-leg evo-leg-right" />
      </span>

      <span className="evo-shadow" />
      {!compact && (
        <span className="evo-card">
          <strong>{name}</strong>
          <small>Nivel {level} · Evolución {stage === "starter" ? "inicial" : stage === "growing" ? "creciendo" : stage === "evolved" ? "avanzada" : "legendaria"}</small>
          <span className="evo-xp"><i style={{ width: `${safeXp}%` }} /></span>
          <p className="evo-memory">Memoria: {memory}</p> {/* Display memory */}
        </span>
      )}
    </button>
  );
}