export type CompanionMood = "feliz" | "pensando" | "celebrando" | "trabajando" | "alerta";

export type CompanionContext = {
  area: string;
  title: string;
  message: string;
  mission: string;
  suggestion: string;
  mode: "idle" | "walk" | "wave" | "talk" | "point" | "thinking";
  mood: CompanionMood;
};

export type CompanionReward = {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
};

export type CompanionMission = {
  id: string;
  label: string;
  progress: number;
  xp: number;
};

export const companionRewards: CompanionReward[] = [
  {
    id: "first-goal",
    label: "Primer objetivo",
    description: "Completa tu primera misión diaria.",
    unlocked: true,
  },
  {
    id: "sales-focus",
    label: "Modo ventas",
    description: "Activa 5 acciones comerciales desde Flowly.",
    unlocked: false,
  },
  {
    id: "automation-starter",
    label: "Automatizador",
    description: "Crea tu primera automatización aprobada.",
    unlocked: false,
  },
];

export const companionMissions: CompanionMission[] = [
  { id: "review-day", label: "Revisar prioridades del día", progress: 65, xp: 30 },
  { id: "create-goal", label: "Definir un objetivo importante", progress: 35, xp: 45 },
  { id: "connect-module", label: "Conectar Companion con un módulo", progress: 20, xp: 60 },
];

export function getCompanionContext(pathname: string): CompanionContext {
  const path = pathname.toLowerCase();

  if (path.includes("crm") || path.includes("clientes")) {
    return {
      area: "CRM",
      title: "Estoy revisando tus clientes",
      message: "He detectado oportunidades para mejorar el seguimiento comercial.",
      mission: "Contacta con 3 clientes pendientes antes de terminar el día.",
      suggestion: "Puedo ayudarte a crear una automatización para recordar seguimientos.",
      mode: "point",
      mood: "trabajando",
    };
  }

  if (path.includes("fact") || path.includes("presupuesto") || path.includes("finance")) {
    return {
      area: "Facturación",
      title: "Estoy mirando tus ingresos",
      message: "Podemos vigilar presupuestos, facturas pendientes y objetivos de cobro.",
      mission: "Revisa 2 presupuestos pendientes y conviértelos en próximas acciones.",
      suggestion: "Si quieres, preparo un flujo para avisarte cuando una factura esté vencida.",
      mode: "thinking",
      mood: "pensando",
    };
  }

  if (path.includes("studio") || path.includes("crear") || path.includes("asistente")) {
    return {
      area: "Construcción",
      title: "Estoy listo para crear contigo",
      message: "Dime qué quieres construir y lo convertiré en arquitectura, módulos y acciones.",
      mission: "Define una idea y deja que la transforme en un blueprint editable.",
      suggestion: "Puedes pedirme: 'crea un módulo para gestionar reservas con pagos y WhatsApp'.",
      mode: "talk",
      mood: "feliz",
    };
  }

  if (path.includes("marketing")) {
    return {
      area: "Marketing",
      title: "Estoy buscando oportunidades",
      message: "Puedo ayudarte a convertir campañas en tareas y objetivos medibles.",
      mission: "Prepara una campaña simple con objetivo, canal y recompensa.",
      suggestion: "Recomiendo revisar leads sin respuesta y mensajes de WhatsApp.",
      mode: "wave",
      mood: "celebrando",
    };
  }

  if (path.includes("docs")) {
    return {
      area: "Docs",
      title: "Conozco la documentación de Flowly",
      message: "Puedo explicar conceptos técnicos con palabras sencillas y ayudarte a construir sin perderte.",
      mission: "Consulta una duda sobre Studio, Kernel o Companion.",
      suggestion: "Prueba a preguntarme qué es un Business Object, pero en lenguaje normal.",
      mode: "thinking",
      mood: "pensando",
    };
  }

  return {
    area: "Flowly",
    title: "Estoy contigo en el panel",
    message: "Soy tu Companion. Te ayudaré con objetivos, misiones, recompensas y recomendaciones.",
    mission: "Completa una acción importante hoy y ganarás XP.",
    suggestion: "Empieza diciéndome qué quieres mejorar o construir en tu empresa.",
    mode: "idle",
    mood: "feliz",
  };
}

export const companionStats = {
  name: "Flowly Companion",
  level: 1,
  xp: 280,
  nextLevelXp: 500,
  energy: 82,
};
