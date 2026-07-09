"use client";

type EvolutionaryCompanionAvatarProps = {
  name?: string;
  mood?: string;
  modelUrl?: string;
  onClick?: () => void;
};

export default function EvolutionaryCompanionAvatar({
  name = "Flow",
  mood = "neutral",
  onClick,
}: EvolutionaryCompanionAvatarProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-cyan-300/20 bg-slate-950/70 px-4 py-3 text-left text-white shadow-lg"
      aria-label={`Vista previa de ${name}`}
    >
      <div className="text-sm font-bold">{name}</div>
      <div className="text-xs text-cyan-200/80">Estado: {mood}</div>
    </button>
  );
}
}
