import { slugifyStudio, toPascalCase } from "@/lib/flowlyStudio";
import { analyzeStudioArchitecture, type FlowlyModuleGeneration, type FlowlyStudioStoredArtifact } from "@/lib/flowlyStudioHeart";

export type FlowlyGeneratorTemplate = {
  id: string;
  nombre: string;
  categoria: "sql" | "typescript" | "api" | "app" | "docs" | "tests" | "sdk" | "marketplace";
  descripcion: string;
  salida: string;
};

export type FlowlyRuntimeExtension = {
  id: string;
  nombre: string;
  tipo: "panel" | "inspector" | "validador" | "generador" | "revisor" | "exportador";
  estado: "activo" | "pendiente" | "experimental";
  descripcion: string;
};

export type FlowlyDependencyIssue = {
  tipo: "bloqueo" | "aviso" | "informacion";
  mensaje: string;
  artefactos: string[];
};

export type FlowlyRefactorPlan = {
  from: string;
  to: string;
  afectados: Array<{ path: string; accion: string; detalle: string }>;
  riesgo: "bajo" | "medio" | "alto";
  resumen: string;
};

export type FlowlyReverseEngineeringResult = {
  nombre: string;
  resumen: string;
  businessObjects: string[];
  capabilities: string[];
  routes: string[];
  tables: string[];
  recommendations: string[];
};

export type FlowlyMarketplacePackage = {
  id: string;
  nombre: string;
  slug: string;
  estado: "privado" | "organizacion" | "marketplace" | "premium";
  version: string;
  descripcion: string;
  permisos: string[];
  artefactos: Array<{ kind: string; name: string; slug: string }>;
  checklist: string[];
};

export const FLOWLY_GENERATOR_TEMPLATES: FlowlyGeneratorTemplate[] = [
  { id: "sql-table", nombre: "Migración Supabase", categoria: "sql", descripcion: "Crea tablas, índices, RLS y políticas de desarrollo para artefactos generados.", salida: "supabase/migrations/{module}.sql" },
  { id: "typescript-domain", nombre: "Tipos TypeScript", categoria: "typescript", descripcion: "Genera tipos, contratos e índices de módulo para que el código sea reutilizable.", salida: "lib/generated/{module}.ts" },
  { id: "api-route", nombre: "Ruta API", categoria: "api", descripcion: "Expone un manifiesto seguro del módulo generado sin saltarse el Runtime.", salida: "app/api/generated/{module}/route.ts" },
  { id: "app-route", nombre: "Ruta de aplicación", categoria: "app", descripcion: "Crea una página visible y conectable al dashboard para revisar el módulo.", salida: "app/generated/{module}/page.tsx" },
  { id: "docs", nombre: "Documentación", categoria: "docs", descripcion: "Crea documentación Markdown del módulo, impacto, instalación y pruebas.", salida: "docs/generated/{module}.md" },
  { id: "tests", nombre: "Plan de pruebas", categoria: "tests", descripcion: "Genera plan de pruebas funcionales, arquitectónicas y de seguridad.", salida: "tests/generated/{module}.test-plan.md" },
  { id: "sdk", nombre: "SDK", categoria: "sdk", descripcion: "Genera base del SDK para que otros componentes consuman el módulo.", salida: "sdk/generated/{module}.ts" },
  { id: "marketplace", nombre: "Paquete Marketplace", categoria: "marketplace", descripcion: "Genera manifiesto para publicar o distribuir el módulo.", salida: "marketplace/generated/{module}.json" },
];

export const FLOWLY_STUDIO_RUNTIME_EXTENSIONS: FlowlyRuntimeExtension[] = [
  { id: "builder", nombre: "Builder Mode", tipo: "panel", estado: "activo", descripcion: "Diseño manual de objetos, capacidades, flujos, políticas y apps." },
  { id: "architect", nombre: "Architect Mode", tipo: "panel", estado: "activo", descripcion: "Diseño asistido desde una descripción en lenguaje natural." },
  { id: "generator-engine", nombre: "Generator Engine", tipo: "generador", estado: "activo", descripcion: "Convierte diseños de Studio en archivos instalables y revisables." },
  { id: "dependency-engine", nombre: "Dependency Engine", tipo: "inspector", estado: "activo", descripcion: "Calcula relaciones, dependencias e impacto entre artefactos." },
  { id: "reviewer-ai", nombre: "Reviewer AI", tipo: "revisor", estado: "experimental", descripcion: "Revisa módulos generados antes de exportarlos o instalarlos." },
  { id: "reverse-engineering", nombre: "Reverse Engineering", tipo: "inspector", estado: "experimental", descripcion: "Analiza código, SQL o texto para reconstruir modelos de Studio." },
  { id: "refactor-engine", nombre: "Refactoring Engine", tipo: "validador", estado: "experimental", descripcion: "Prepara planes de cambio masivo sin modificar archivos automáticamente." },
  { id: "marketplace-builder", nombre: "Marketplace Builder", tipo: "exportador", estado: "activo", descripcion: "Empaqueta módulos para uso privado, organización o Marketplace." },
];


function reviewGenerationLocally(generation: FlowlyModuleGeneration) {
  const warnings: string[] = [];
  const blockers: string[] = [];
  const actions: string[] = [];
  const hasBusinessObject = generation.artifacts.some((artifact) => artifact.kind === "business_object");
  const hasCapability = generation.artifacts.some((artifact) => artifact.kind === "capability");
  const hasPolicy = generation.artifacts.some((artifact) => artifact.kind === "policy");
  const hasWorkflow = generation.artifacts.some((artifact) => artifact.kind === "workflow");
  if (!hasBusinessObject) blockers.push("El módulo no incluye ningún Business Object.");
  if (!hasCapability) warnings.push("El módulo no incluye Capabilities reutilizables.");
  if (!hasPolicy) warnings.push("El módulo no incluye Policies de gobernanza.");
  if (!hasWorkflow) warnings.push("El módulo no incluye Workflows.");
  if (generation.migrationSql.includes("using (true)")) warnings.push("La migración contiene políticas RLS abiertas de desarrollo.");
  actions.push("Revisar SQL antes de ejecutarlo en Supabase.");
  actions.push("Ejecutar pruebas generadas antes de publicar.");
  actions.push("Registrar el módulo en el menú solo tras revisión.");
  return { approved: blockers.length === 0, blockers, warnings, actions, score: Math.max(0, 100 - blockers.length * 35 - warnings.length * 8) };
}


function unique(values: string[]) {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
}

function artifactLabel(artifact: Pick<FlowlyStudioStoredArtifact, "kind" | "name" | "slug">) {
  return `${artifact.kind}:${artifact.slug || slugifyStudio(artifact.name)}`;
}

export function buildGlobalStudioRegistry(artifacts: FlowlyStudioStoredArtifact[]) {
  const architecture = analyzeStudioArchitecture(artifacts);
  const registry = {
    generadoEn: new Date().toISOString(),
    resumen: {
      totalArtefactos: artifacts.length,
      puntuacionArquitectonica: architecture.architectureScore,
      riesgo: architecture.riskLevel,
      nodos: architecture.nodes.length,
      relaciones: architecture.edges.length,
    },
    artefactos: artifacts.map((artifact) => ({
      id: artifact.id,
      tipo: artifact.kind,
      nombre: artifact.name,
      slug: artifact.slug,
      dominio: artifact.domain,
      estado: artifact.status,
      descripcion: artifact.description,
      dependencias: architecture.edges.filter((edge) => edge.source === artifactLabel(artifact)).map((edge) => ({ tipo: edge.type, destino: edge.target })),
    })),
    avisos: architecture.warnings,
    recomendaciones: architecture.recommendations,
  };
  return registry;
}

export function buildDependencyEngineReport(artifacts: FlowlyStudioStoredArtifact[]) {
  const architecture = analyzeStudioArchitecture(artifacts);
  const issues: FlowlyDependencyIssue[] = [];
  const external = architecture.nodes.filter((node) => node.kind === "external");
  if (external.length) issues.push({ tipo: "aviso", mensaje: `${external.length} dependencias todavía no están registradas como artefactos de Studio.`, artefactos: external.map((item) => item.label) });
  const isolated = architecture.nodes.filter((node) => node.kind !== "external" && !architecture.edges.some((edge) => edge.source === node.id || edge.target === node.id));
  if (isolated.length) issues.push({ tipo: "informacion", mensaje: `${isolated.length} artefactos no tienen relaciones detectadas.`, artefactos: isolated.map((item) => item.label) });
  const duplicateNames = artifacts.reduce<Record<string, number>>((acc, artifact) => {
    const key = artifact.name.toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const duplicates = Object.entries(duplicateNames).filter(([, count]) => count > 1).map(([name]) => name);
  if (duplicates.length) issues.push({ tipo: "bloqueo", mensaje: "Hay nombres duplicados que deben resolverse antes de generar módulos grandes.", artefactos: duplicates });
  return { architecture, issues };
}

export function buildGeneratorPipeline(generation: FlowlyModuleGeneration) {
  const review = reviewGenerationLocally(generation);
  return [
    { paso: 1, nombre: "Modelo", estado: "completado", detalle: `${generation.artifacts.length} artefactos seleccionados.` },
    { paso: 2, nombre: "Validación", estado: review.approved ? "completado" : "bloqueado", detalle: review.approved ? "La revisión no tiene bloqueos críticos." : review.blockers.join(" · ") },
    { paso: 3, nombre: "Arquitectura", estado: "completado", detalle: "Dependencias, impacto y riesgo calculados." },
    { paso: 4, nombre: "Generación", estado: "completado", detalle: "SQL, TypeScript, API, SDK, Docs y Tests preparados." },
    { paso: 5, nombre: "Revisión", estado: review.approved ? "completado" : "pendiente", detalle: `Puntuación de revisión: ${review.score}/100.` },
    { paso: 6, nombre: "Instalación", estado: "manual", detalle: "Exporta el ZIP o activa instalación local en desarrollo." },
  ];
}

export function reverseEngineerStudioSource(source: string, name = "Reverse Engineering") : FlowlyReverseEngineeringResult {
  const text = source || "";
  const tableMatches = Array.from(text.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-zA-Z0-9_]+)/gi)).map((match) => match[1]);
  const routeMatches = Array.from(text.matchAll(/(?:app\/api\/|\/api\/)([a-zA-Z0-9_\-\/]+)/g)).map((match) => `/api/${match[1].replace(/\/route\.ts$/, "")}`);
  const classMatches = Array.from(text.matchAll(/(?:type|interface|class)\s+([A-Z][a-zA-Z0-9]+)/g)).map((match) => match[1]);
  const capabilityMatches = Array.from(text.matchAll(/(?:Create|Update|Delete|Archive|Generate|Send|Approve|Assign|Schedule)[A-Z][a-zA-Z0-9]+/g)).map((match) => match[0]);
  const businessObjects = unique([...classMatches, ...tableMatches.map((item) => toPascalCase(item.replace(/^flowly_/, "")))]).slice(0, 20);
  const capabilities = unique(capabilityMatches).slice(0, 30);
  const tables = unique(tableMatches).slice(0, 30);
  const routes = unique(routeMatches).slice(0, 30);
  const recommendations = [
    businessObjects.length ? "Revisar si cada entidad detectada debe ser Business Object o Value Object." : "No se detectaron entidades claras. Añade más código o SQL para analizar.",
    capabilities.length ? "Convertir acciones repetibles en Capabilities oficiales." : "No se detectaron acciones. Define Commands/Capabilities antes de generar.",
    routes.length ? "Validar que las rutas API expongan Capabilities y no lógica de negocio directa." : "No se detectaron rutas API.",
  ];
  return {
    nombre: name,
    resumen: `Detectados ${businessObjects.length} posibles objetos, ${capabilities.length} capacidades, ${tables.length} tablas y ${routes.length} rutas.`,
    businessObjects,
    capabilities,
    routes,
    tables,
    recommendations,
  };
}

export function buildRefactorPlan(artifacts: FlowlyStudioStoredArtifact[], from: string, to: string): FlowlyRefactorPlan {
  const fromSlug = slugifyStudio(from);
  const toSlug = slugifyStudio(to);
  const fromPascal = toPascalCase(from);
  const toPascal = toPascalCase(to);
  const affected = artifacts.filter((artifact) => {
    const joined = JSON.stringify(artifact).toLowerCase();
    return joined.includes(from.toLowerCase()) || joined.includes(fromSlug.toLowerCase()) || joined.includes(fromPascal.toLowerCase());
  });
  const files = affected.flatMap((artifact) => [
    { path: `lib/generated/${artifact.slug}.ts`, accion: "reemplazar", detalle: `${fromPascal} → ${toPascal}` },
    { path: `docs/generated/${artifact.slug}.md`, accion: "actualizar documentación", detalle: `${from} → ${to}` },
    { path: `supabase/migrations/${artifact.slug}.sql`, accion: "crear nueva migración", detalle: `${fromSlug} → ${toSlug}` },
  ]);
  const risk = affected.length > 10 ? "alto" : affected.length > 4 ? "medio" : "bajo";
  return {
    from,
    to,
    afectados: files,
    riesgo: risk,
    resumen: `Plan preparado para renombrar ${from} a ${to}. Artefactos afectados: ${affected.length}. Riesgo: ${risk}.`,
  };
}

export function buildArchitectFullBlueprint(prompt: string) {
  const normalized = prompt.toLowerCase();
  const isClinic = normalized.includes("clinica") || normalized.includes("clínica") || normalized.includes("dental") || normalized.includes("veterin");
  const isHotel = normalized.includes("hotel") || normalized.includes("reserva") || normalized.includes("habitacion") || normalized.includes("habitación");
  const isVehicle = normalized.includes("veh") || normalized.includes("coche") || normalized.includes("alquiler") || normalized.includes("flota");
  const isHr = normalized.includes("rrhh") || normalized.includes("emple") || normalized.includes("nomina") || normalized.includes("nómina");

  if (isClinic) return {
    moduleName: "Gestión de Clínica",
    domain: "health",
    businessObjects: ["Paciente", "Profesional", "Cita", "Tratamiento", "HistoriaClinica", "Consentimiento", "Factura"],
    capabilities: ["CrearPaciente", "AgendarCita", "RegistrarTratamiento", "GenerarConsentimiento", "EmitirFactura"],
    workflows: ["Admisión de paciente", "Cita y tratamiento", "Facturación clínica"],
    policies: ["PrivacidadSanitaria", "ConsentimientoObligatorio", "AprobacionDatosSensibles"],
    apps: ["Panel Clínica"],
  };
  if (isHotel) return {
    moduleName: "Gestión Hotelera",
    domain: "hospitality",
    businessObjects: ["Huesped", "Habitacion", "Reserva", "CheckIn", "CheckOut", "Servicio", "Factura"],
    capabilities: ["CrearReserva", "AsignarHabitacion", "RealizarCheckIn", "RealizarCheckOut", "EmitirFactura"],
    workflows: ["Reserva a entrada", "Salida y cobro", "Limpieza de habitación"],
    policies: ["DocumentoIdentidadRequerido", "PagoGarantia", "ProteccionDatosHuesped"],
    apps: ["Panel Hotel"],
  };
  if (isVehicle) return {
    moduleName: "Gestión de Alquiler de Vehículos",
    domain: "operations",
    businessObjects: ["Vehiculo", "Alquiler", "Conductor", "Seguro", "Mantenimiento", "Factura"],
    capabilities: ["CrearVehiculo", "CrearAlquiler", "AsignarConductor", "ProgramarMantenimiento", "GenerarFacturaAlquiler"],
    workflows: ["Alta de alquiler", "Cierre de alquiler", "Mantenimiento preventivo"],
    policies: ["LicenciaConductorObligatoria", "DepositoObligatorio", "AprobacionAlquilerAltoValor"],
    apps: ["Panel Flota"],
  };
  if (isHr) return {
    moduleName: "Recursos Humanos",
    domain: "people",
    businessObjects: ["Empleado", "Contrato", "Nomina", "Ausencia", "Evaluacion", "Equipo"],
    capabilities: ["CrearEmpleado", "AprobarAusencia", "GenerarNomina", "ProgramarEvaluacion"],
    workflows: ["Onboarding empleado", "Aprobación de ausencia", "Cierre de nómina"],
    policies: ["PrivacidadNomina", "AprobacionManager", "RetencionDatosEmpleado"],
    apps: ["Panel RRHH"],
  };
  return {
    moduleName: "Módulo Empresarial Personalizado",
    domain: "custom",
    businessObjects: ["EntidadPrincipal", "Actividad", "Documento", "Factura"],
    capabilities: ["CrearEntidad", "ActualizarEntidad", "GenerarDocumento", "EjecutarProceso"],
    workflows: ["Alta inicial", "Aprobación documental"],
    policies: ["AislamientoOrganizacion", "AprobacionHumanaRequerida"],
    apps: ["Panel del módulo"],
  };
}

export function buildReviewerAIReport(generation: FlowlyModuleGeneration) {
  const review = reviewGenerationLocally(generation);
  const architecture = analyzeStudioArchitecture(generation.artifacts);
  const criterios = [
    { nombre: "Dominio", estado: generation.artifacts.some((artifact) => artifact.kind === "business_object") ? "correcto" : "bloqueado", detalle: "Debe existir al menos un objeto de negocio." },
    { nombre: "Capacidades", estado: generation.artifacts.some((artifact) => artifact.kind === "capability") ? "correcto" : "aviso", detalle: "Las Apps deben consumir Capabilities reutilizables." },
    { nombre: "Gobernanza", estado: generation.artifacts.some((artifact) => artifact.kind === "policy") ? "correcto" : "aviso", detalle: "Añade políticas antes de producción." },
    { nombre: "Dependencias", estado: architecture.riskLevel === "high" ? "aviso" : "correcto", detalle: `Riesgo arquitectónico: ${architecture.riskLevel}.` },
  ];
  return {
    aprobado: review.approved,
    puntuacion: Math.round((review.score + architecture.architectureScore) / 2),
    criterios,
    bloqueos: review.blockers,
    avisos: [...review.warnings, ...architecture.warnings],
    acciones: review.actions,
  };
}

export function buildMarketplacePackage(generation: FlowlyModuleGeneration, estado: FlowlyMarketplacePackage["estado"] = "privado"): FlowlyMarketplacePackage {
  const review = reviewGenerationLocally(generation);
  const permissions = unique(generation.artifacts.flatMap((artifact) => {
    const definition = artifact.definition as unknown as { policies?: unknown[]; capabilities?: unknown[]; businessObjects?: unknown[] };
    return [artifact.domain, ...(definition.policies || []).map((item) => typeof item === "string" ? item : JSON.stringify(item)).slice(0, 3)];
  })).map((item) => `studio.${slugifyStudio(item)}.use`).slice(0, 20);
  return {
    id: `marketplace_${slugifyStudio(generation.moduleName)}`,
    nombre: generation.moduleName,
    slug: generation.slug,
    estado,
    version: "0.1.0",
    descripcion: generation.summary,
    permisos: permissions,
    artefactos: generation.artifacts.map((artifact) => ({ kind: artifact.kind, name: artifact.name, slug: artifact.slug })),
    checklist: [
      review.approved ? "Revisión automática superada" : "Resolver bloqueos antes de publicar",
      "Revisar SQL y políticas RLS",
      "Añadir capturas y documentación comercial",
      "Validar compatibilidad con la versión actual de Flowly",
      "Ejecutar pruebas del módulo generado",
    ],
  };
}

export function buildStudioCoreSnapshot(artifacts: FlowlyStudioStoredArtifact[]) {
  const dependency = buildDependencyEngineReport(artifacts);
  const registry = buildGlobalStudioRegistry(artifacts);
  return {
    generadoEn: new Date().toISOString(),
    runtime: FLOWLY_STUDIO_RUNTIME_EXTENSIONS,
    templates: FLOWLY_GENERATOR_TEMPLATES,
    registry,
    dependency,
    estado: {
      generatorEngine: "activo",
      templateSystem: "activo",
      globalRegistry: "activo",
      reverseEngineering: "experimental",
      dependencyEngine: "activo",
      refactoringEngine: "experimental",
      studioRuntime: "activo",
      architectAI: "experimental",
      reviewerAI: "experimental",
      marketplaceIntegration: "activo",
    },
  };
}
