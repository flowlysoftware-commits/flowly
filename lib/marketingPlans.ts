export type MarketingPlanType = "strategic" | "publication";

export type MarketingPlanDefinition = {
  id: string;
  name: string;
  price: number;
  description: string;
  postsPerWeek: number;
  tier: string;
  planType: MarketingPlanType;
  includesSoftwareModule: boolean;
  features: string[];
  automationSteps: string[];
  deliverables: string[];
};

export const marketingPlans: Record<string, MarketingPlanDefinition> = {
  marketing_bronze: {
    id: "marketing_bronze",
    name: "Flowly Marketing Bronze",
    price: 19.9,
    description: "1 publicación semanal, planificación básica e IA para mejorar campañas.",
    postsPerWeek: 1,
    tier: "bronze",
    planType: "strategic",
    includesSoftwareModule: true,
    features: [
      "1 publicación semanal",
      "Calendario mensual básico",
      "IA para mejorar copies y llamadas a la acción",
      "Revisión de tono de marca",
      "Registro en el módulo Marketing de Flowly",
    ],
    automationSteps: [
      "Crear briefing y diagnóstico inicial",
      "Generar calendario editorial del mes",
      "Crear 4 ideas de publicación",
      "Preparar revisión de CTA con IA",
      "Programar seguimiento mensual",
    ],
    deliverables: ["Calendario mensual", "4 publicaciones/mes", "Ideas de campañas básicas", "Checklist de marca"],
  },
  marketing_plata: {
    id: "marketing_plata",
    name: "Flowly Marketing Plata",
    price: 34.9,
    description: "2 publicaciones semanales, estrategia mensual e ideas para campañas.",
    postsPerWeek: 2,
    tier: "plata",
    planType: "strategic",
    includesSoftwareModule: true,
    features: [
      "2 publicaciones semanales",
      "Calendario editorial mensual",
      "Copies para redes y anuncios",
      "Recomendaciones de campañas Meta Ads",
      "Análisis mensual de oportunidades",
      "Registro operativo en Flowly Marketing",
    ],
    automationSteps: [
      "Crear briefing y diagnóstico inicial",
      "Definir público objetivo y propuesta de valor",
      "Generar calendario editorial de 8 piezas",
      "Crear ideas de anuncios para Meta Ads",
      "Preparar reporte mensual de oportunidades",
    ],
    deliverables: ["Calendario mensual", "8 publicaciones/mes", "Copies para Ads", "Reporte mensual"],
  },
  marketing_oro: {
    id: "marketing_oro",
    name: "Flowly Marketing Oro",
    price: 44.9,
    description: "4 publicaciones semanales, estrategia avanzada y calendario comercial completo.",
    postsPerWeek: 4,
    tier: "oro",
    planType: "strategic",
    includesSoftwareModule: true,
    features: [
      "4 publicaciones semanales",
      "Calendario editorial completo",
      "Ideas de reels, historias y carruseles",
      "Propuestas de anuncios para Meta Ads",
      "Informe mensual de acciones recomendadas",
      "Priorización de campañas y promociones",
      "Sistema operativo de marketing dentro de Flowly",
    ],
    automationSteps: [
      "Crear briefing y mapa de objetivos",
      "Definir pilares de contenido y ofertas",
      "Generar calendario editorial de 16 piezas",
      "Preparar ideas de reels, carruseles e historias",
      "Crear propuesta mensual de campañas pagadas",
      "Programar revisión y optimización mensual",
    ],
    deliverables: ["Calendario completo", "16 publicaciones/mes", "Ideas de reels", "Plan de campañas", "Informe mensual"],
  },
  posts_1_week: {
    id: "posts_1_week",
    name: "Pack Publicaciones 1/semana",
    price: 15,
    description: "Solo publicaciones recurrentes, sin estrategia avanzada.",
    postsPerWeek: 1,
    tier: "publicaciones",
    planType: "publication",
    includesSoftwareModule: false,
    features: ["1 publicación semanal", "Texto + idea visual", "Entrega mensual organizada"],
    automationSteps: ["Crear briefing de contenido", "Generar calendario simple", "Preparar 4 publicaciones mensuales"],
    deliverables: ["4 publicaciones/mes", "Textos optimizados", "Calendario simple"],
  },
  posts_2_week: {
    id: "posts_2_week",
    name: "Pack Publicaciones 2/semana",
    price: 25,
    description: "Publicaciones recurrentes para mantener presencia activa.",
    postsPerWeek: 2,
    tier: "publicaciones",
    planType: "publication",
    includesSoftwareModule: false,
    features: ["2 publicaciones semanales", "Textos optimizados", "Calendario simple"],
    automationSteps: ["Crear briefing de contenido", "Generar calendario simple", "Preparar 8 publicaciones mensuales"],
    deliverables: ["8 publicaciones/mes", "Textos optimizados", "Calendario simple"],
  },
  posts_4_week: {
    id: "posts_4_week",
    name: "Pack Publicaciones 4/semana",
    price: 40,
    description: "Publicaciones frecuentes para mantener presencia intensiva.",
    postsPerWeek: 4,
    tier: "publicaciones",
    planType: "publication",
    includesSoftwareModule: false,
    features: ["4 publicaciones semanales", "Ideas por temporada", "Organización mensual"],
    automationSteps: ["Crear briefing de contenido", "Generar calendario simple", "Preparar 16 publicaciones mensuales"],
    deliverables: ["16 publicaciones/mes", "Ideas por temporada", "Calendario simple"],
  },
};

export function getMarketingPlan(planId: string | null | undefined) {
  return marketingPlans[String(planId || "")] || null;
}

export function buildMarketingTasks(plan: MarketingPlanDefinition, startDate = new Date()) {
  return plan.automationSteps.map((title, index) => {
    const due = new Date(startDate);
    due.setDate(startDate.getDate() + index * 2);
    return {
      title,
      status: index === 0 ? "ready" : "pending",
      due_at: due.toISOString(),
      sort_order: index + 1,
    };
  });
}

export function buildMarketingContentCalendar(plan: MarketingPlanDefinition, startDate = new Date()) {
  const total = Math.max(plan.postsPerWeek * 4, 1);
  return Array.from({ length: total }, (_, index) => {
    const due = new Date(startDate);
    due.setDate(startDate.getDate() + 3 + index * Math.max(1, Math.floor(28 / total)));
    return {
      title: `Publicación ${index + 1} · ${plan.name}`,
      channel: "Instagram / Facebook",
      content_type: plan.planType === "strategic" ? "post estratégico" : "post",
      status: "idea",
      scheduled_for: due.toISOString(),
      sort_order: index + 1,
    };
  });
}
