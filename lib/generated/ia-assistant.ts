export const IaAssistantModule = {
  name: "IA Assistant",
  slug: "ia-assistant",
  route: "/ia-assistant",
  domain: "companion",
  description: "Módulo del Companion de Flowly con mascota, objetivos, misiones, recompensas, niveles, experiencia y avatar.",
  artifacts: [
    { kind: "business_object", name: "CompanionProfile", slug: "companion-profile", domain: "companion" },
    { kind: "business_object", name: "CompanionAvatar", slug: "companion-avatar", domain: "companion" },
    { kind: "business_object", name: "CompanionGoal", slug: "companion-goal", domain: "companion" },
    { kind: "business_object", name: "CompanionMission", slug: "companion-mission", domain: "companion" },
    { kind: "business_object", name: "CompanionReward", slug: "companion-reward", domain: "companion" },
    { kind: "business_object", name: "CompanionAchievement", slug: "companion-achievement", domain: "companion" },
    { kind: "business_object", name: "CompanionLevel", slug: "companion-level", domain: "companion" },
    { kind: "business_object", name: "CompanionExperience", slug: "companion-experience", domain: "companion" },
    { kind: "business_object", name: "CompanionMood", slug: "companion-mood", domain: "companion" },
    { kind: "business_object", name: "CompanionActivity", slug: "companion-activity", domain: "companion" },
    { kind: "capability", name: "GenerateDailyMissions", slug: "generate-daily-missions", domain: "companion" },
    { kind: "capability", name: "UpdateCompanionGoalProgress", slug: "update-companion-goal-progress", domain: "companion" },
    { kind: "capability", name: "ClaimCompanionReward", slug: "claim-companion-reward", domain: "companion" },
    { kind: "workflow", name: "Objetivo completado suma experiencia", slug: "objetivo-completado-suma-experiencia", domain: "companion" },
    { kind: "workflow", name: "Misión completada desbloquea recompensa", slug: "mision-completada-desbloquea-recompensa", domain: "companion" },
    { kind: "policy", name: "Objetivos críticos requieren aprobación humana", slug: "objetivos-criticos-requieren-aprobacion-humana", domain: "companion" },
    { kind: "app", name: "IA Assistant", slug: "ia-assistant", domain: "companion" },
  ],
  screens: ["Panel", "Objetivos", "Misiones", "Recompensas", "Logros", "Avatar", "Actividad", "Configuración"],
  rewards: [
    { name: "Primer objetivo completado", points: 50, status: "Disponible" },
    { name: "Semana productiva", points: 250, status: "Bloqueada" },
    { name: "Maestro de ventas", points: 1000, status: "Bloqueada" },
  ],
  missions: [
    { name: "Revisar objetivos del día", xp: 20, status: "En progreso" },
    { name: "Completar una acción importante", xp: 60, status: "Pendiente" },
    { name: "Actualizar el estado del Companion", xp: 15, status: "Completada" },
  ],
  goals: [
    { name: "Preparar IA Assistant", progress: 68, target: 100, status: "Activo" },
    { name: "Definir recompensas", progress: 40, target: 100, status: "Activo" },
    { name: "Conectar avatar", progress: 20, target: 100, status: "Borrador" },
  ],
} as const;

export type IaAssistantArtifact = (typeof IaAssistantModule.artifacts)[number];
