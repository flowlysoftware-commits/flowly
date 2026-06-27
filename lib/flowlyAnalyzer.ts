import { flowlyMigrationModules, flowlyMigrationSprints, getMigrationSummary, buildModuleBlueprint } from "@/lib/flowlyOSMigration";

export type FlowlyAnalyzerReport = {
  generatedAt: string;
  summary: ReturnType<typeof getMigrationSummary>;
  modules: typeof flowlyMigrationModules;
  sprints: typeof flowlyMigrationSprints;
  findings: Array<{ level: "info" | "warning" | "critical"; title: string; detail: string }>;
  recommendedNextActions: string[];
};

export function analyzeCurrentFlowlyProject(): FlowlyAnalyzerReport {
  const summary = getMigrationSummary();
  const findings: FlowlyAnalyzerReport["findings"] = [
    {
      level: "info",
      title: "Flowly OS y Panel Cliente ya están separados conceptualmente",
      detail: "Las rutas internas (/os, /studio, /kernel, /asistente) deben quedar reservadas para administración y desarrollo.",
    },
    {
      level: "warning",
      title: "Hay módulos legacy todavía no registrados del todo",
      detail: "Marketing, WhatsApp y algunas partes del CRM/facturación deben convertirse en módulos oficiales del Kernel.",
    },
    {
      level: "critical",
      title: "El Companion cliente no debe acceder a Studio",
      detail: "Cualquier acción técnica debe redirigirse al Companion Arquitecto y nunca mostrarse al cliente final.",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    summary,
    modules: flowlyMigrationModules,
    sprints: flowlyMigrationSprints,
    findings,
    recommendedNextActions: [
      "Ejecutar SQL de migración para registrar módulos en Supabase.",
      "Probar /os/migration para revisar el inventario.",
      "Usar /asistente solo para cambios internos y mantener /dashboard limpio para clientes.",
      "Elegir un primer módulo legacy, por ejemplo CRM, y generar su blueprint desde Analyzer.",
    ],
  };
}

export function analyzeModule(moduleId: string) {
  const blueprint = buildModuleBlueprint(moduleId);
  if (!blueprint) return null;
  return {
    moduleId,
    blueprint,
    impact: {
      filesEstimated: blueprint.businessObjects.length * 8 + blueprint.capabilities.length * 4 + 12,
      migrationsEstimated: Math.max(1, blueprint.businessObjects.length),
      testsEstimated: blueprint.businessObjects.length * 2 + blueprint.capabilities.length,
      risk: blueprint.risk,
    },
    proposal: [
      "Registrar módulo en Kernel.",
      "Crear blueprint compatible con Studio.",
      "Conectar Companion cliente con el contexto del módulo.",
      "Preparar Builder para cambios bajo aprobación.",
    ],
  };
}
