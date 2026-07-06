"use client";

import FlowlyAssistant3D from "@/components/FlowlyAssistant3D";

type CompanionMood = "idle" | "happy" | "thinking" | "talking" | "celebrating" | "working" | "sleeping" | "walking" | "wave" | "point" | "attention" | "reading" | "typing" | "concerned";

type EvolutionaryCompanionAvatarProps = {
  name?: string;
  level?: number;
  xpPercent?: number;
  mood?: CompanionMood | string;
  compact?: boolean;
  onClick?: () => void;
  memory?: string;
  modelUrl?: string;
};

function normalizeMood(value?: CompanionMood | string): CompanionMood {
  const mood = String(value || "idle").toLowerCase();
  if (mood.includes("feliz") || mood.includes("happy")) return "happy";
  if (mood.includes("atent") || mood.includes("attention")) return "attention";
  if (mood.includes("concern") || mood.includes("preocup")) return "concerned";
  if (mood.includes("read") || mood.includes("ley")) return "reading";
  if (mood.includes("typ") || mood.includes("escrib")) return "typing";
  if (mood.includes("pens") || mood.includes("thinking")) return "thinking";
  if (mood.includes("habl") || mood.includes("talk")) return "talking";
  if (mood.includes("wave") || mood.includes("salud")) return "wave";
  if (mood.includes("point") || mood.includes("señ") || mood.includes("senal")) return "point";
  if (mood.includes("cele") || mood.includes("logro")) return "celebrating";
  if (mood.includes("trab") || mood.includes("work")) return "working";
  if (mood.includes("dorm") || mood.includes("sleep")) return "sleeping";
  if (mood.includes("cam") || mood.includes("walk")) return "walking";
  return "idle";
}

function moodTo3DMode(mood: CompanionMood): "idle" | "walk" | "wave" | "talk" | "point" | "thinking" | "tour" | "sit" | "attention" | "reading" | "typing" | "concerned" | "celebrating" {
  if (mood === "attention") return "attention";
  if (mood === "talking") return "talk";
  if (mood === "reading") return "reading";
  if (mood === "typing") return "typing";
  if (mood === "concerned") return "concerned";
  if (mood === "walking") return "walk";
  if (mood === "wave") return "wave";
  if (mood === "point") return "point";
  if (mood === "happy") return "wave";
  if (mood === "celebrating") return "celebrating";
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
  modelUrl = "/avatars/flowly.glb",
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
        modelUrl={modelUrl}
        mode={mode}
        facing="front"
        onClick={onClick}
      />
      {!compact && (
        <span className="evo-card evo-card-3d" aria-hidden="true">
          <strong>{name}</strong>
          <small>
            Nivel {level} · Evolución {stage === "starter" ? "inicial" : stage === "growing" ? "creciendo" : stage === "evolved" ? "avanzada" : "legendaria"}
          </small>
          <span className="evo-status-strip">
            <i>{normalizedMood === "talking" ? "Hablando" : normalizedMood === "thinking" ? "Pensando" : normalizedMood === "walking" ? "Explorando" : normalizedMood === "attention" ? "Escuchando" : normalizedMood === "wave" ? "Saludando" : normalizedMood === "point" ? "Señalando" : normalizedMood === "celebrating" ? "Celebrando" : "Vivo"}</i>
            {memory && <em>{memory}</em>}
          </span>
          <span className="evo-xp"><i style={{ width: `${safeXp}%` }} /></span>
        </span>
      )}
    </div>
  );
}
