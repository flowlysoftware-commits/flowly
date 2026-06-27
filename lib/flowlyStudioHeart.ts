import { generateStudioArtifacts, slugifyStudio, toPascalCase, type FlowlyStudioArtifactKind, type FlowlyStudioDefinition } from "@/lib/flowlyStudio";

export type FlowlyStudioStoredArtifact = {
  id: string;
  kind: FlowlyStudioArtifactKind;
  name: string;
  slug: string;
  domain: string;
  description: string;
  status: string;
  definition: FlowlyStudioDefinition;
  generated_sql?: string | null;
  generated_typescript?: string | null;
  generated_api?: string | null;
  generated_markdown?: string | null;
  generated_tests?: string | null;
  generated_sdk?: string | null;
};

export type FlowlyArchitectureNode = {
  id: string;
  label: string;
  kind: FlowlyStudioArtifactKind | "external";
  domain: string;
  status: string;
};

export type FlowlyArchitectureEdge = {
  id: string;
  source: string;
  target: string;
  type: "uses" | "relates_to" | "emits" | "enforces" | "contains" | "depends_on" | "proposes";
};

export type FlowlyArchitectureAnalysis = {
  totals: Record<string, number>;
  nodes: FlowlyArchitectureNode[];
  edges: FlowlyArchitectureEdge[];
  impacted: string[];
  warnings: string[];
  recommendations: string[];
  riskLevel: "low" | "medium" | "high";
  architectureScore: number;
};

export type FlowlyModuleGeneration = {
  id: string;
  moduleName: string;
  slug: string;
  summary: string;
  artifacts: FlowlyStudioStoredArtifact[];
  migrationSql: string;
  typeScriptIndex: string;
  apiManifest: string;
  sdkIndex: string;
  docsIndex: string;
  testPlan: string;
  impactReport: string;
  generatedAt: string;
};

function asArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => typeof item === "string" ? item : typeof item === "object" && item && "name" in item ? String((item as { name?: unknown }).name || "") : "").filter(Boolean);
}

function namedItems(value: unknown): string[] {
  return asArray(value);
}

function getDefinitionList(definition: FlowlyStudioDefinition, key: string): string[] {
  const candidate = (definition as unknown as Record<string, unknown>)[key];
  return namedItems(candidate);
}

function addEdge(edges: FlowlyArchitectureEdge[], source: string, target: string, type: FlowlyArchitectureEdge["type"]) {
  if (!source || !target) return;
  const id = `${source}:${type}:${target}`;
  if (!edges.some((edge) => edge.id === id)) edges.push({ id, source, target, type });
}

function artifactId(artifact: Pick<FlowlyStudioStoredArtifact, "kind" | "slug">) {
  return `${artifact.kind}:${artifact.slug}`;
}

function externalId(name: string) {
  return `external:${slugifyStudio(name)}`;
}

export function analyzeStudioArchitecture(artifacts: FlowlyStudioStoredArtifact[]): FlowlyArchitectureAnalysis {
  const totals: Record<string, number> = {};
  const nodes: FlowlyArchitectureNode[] = [];
  const edges: FlowlyArchitectureEdge[] = [];
  const knownByName = new Map<string, string>();
  const warnings: string[] = [];
  const recommendations: string[] = [];

  for (const artifact of artifacts) {
    totals[artifact.kind] = (totals[artifact.kind] || 0) + 1;
    const id = artifactId(artifact);
    nodes.push({ id, label: artifact.name, kind: artifact.kind, domain: artifact.domain, status: artifact.status });
    knownByName.set(artifact.name.toLowerCase(), id);
    knownByName.set(artifact.slug.toLowerCase(), id);
  }

  function ensureTarget(name: string) {
    const known = knownByName.get(name.toLowerCase()) || knownByName.get(slugifyStudio(name).toLowerCase());
    if (known) return known;
    const id = externalId(name);
    if (!nodes.some((node) => node.id === id)) nodes.push({ id, label: name, kind: "external", domain: "unknown", status: "unregistered" });
    return id;
  }

  for (const artifact of artifacts) {
    const source = artifactId(artifact);
    const definition = artifact.definition;
    for (const name of getDefinitionList(definition, "businessObjects")) addEdge(edges, source, ensureTarget(name), "uses");
    for (const name of getDefinitionList(definition, "capabilities")) addEdge(edges, source, ensureTarget(name), "uses");
    for (const name of getDefinitionList(definition, "commands")) addEdge(edges, source, ensureTarget(name), "depends_on");
    for (const name of getDefinitionList(definition, "queries")) addEdge(edges, source, ensureTarget(name), "depends_on");
    for (const name of getDefinitionList(definition, "events")) addEdge(edges, source, ensureTarget(name), "emits");
    for (const name of getDefinitionList(definition, "policies")) addEdge(edges, source, ensureTarget(name), "enforces");
    for (const relationship of ((definition as unknown as { relationships?: Array<{ target?: string; type?: string }> }).relationships || [])) {
      if (relationship.target) addEdge(edges, source, ensureTarget(relationship.target), "relates_to");
    }
    for (const name of getDefinitionList(definition, "workflows")) addEdge(edges, source, ensureTarget(name), "proposes");
  }

  const duplicatedNames = artifacts.reduce<Record<string, number>>((acc, artifact) => {
    const key = artifact.name.toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  Object.entries(duplicatedNames).filter(([, count]) => count > 1).forEach(([name]) => warnings.push(`Posible duplicidad de artefacto: ${name}`));

  const externalNodes = nodes.filter((node) => node.kind === "external");
  if (externalNodes.length) warnings.push(`${externalNodes.length} dependencias todavía no están registradas en Studio.`);
  if (!totals.business_object) recommendations.push("Crea al menos un Business Object antes de generar módulos completos.");
  if (!totals.capability) recommendations.push("Crea Capabilities para que las Apps y Workflows consuman capacidades reutilizables.");
  if (!totals.policy) recommendations.push("Añade Policies para que el módulo nazca gobernado desde el principio.");
  if (!totals.workflow) recommendations.push("Añade Workflows para convertir el diseño en operaciones ejecutables.");

  const warningPenalty = Math.min(30, warnings.length * 7);
  const missingPenalty = ["business_object", "capability", "policy", "workflow", "app"].filter((kind) => !totals[kind]).length * 5;
  const architectureScore = Math.max(0, 100 - warningPenalty - missingPenalty);
  const riskLevel = architectureScore >= 85 ? "low" : architectureScore >= 65 ? "medium" : "high";
  const impacted = Array.from(new Set(edges.map((edge) => edge.target))).slice(0, 50);

  return { totals, nodes, edges, impacted, warnings, recommendations, riskLevel, architectureScore };
}

function section(title: string, body: string) {
  return `\n## ${title}\n\n${body.trim()}\n`;
}

export function generateModuleFromArtifacts(moduleName: string, artifacts: FlowlyStudioStoredArtifact[]): FlowlyModuleGeneration {
  const slug = slugifyStudio(moduleName);
  const generatedAt = new Date().toISOString();
  const analysis = analyzeStudioArchitecture(artifacts);
  const generated = artifacts.map((artifact) => ({ artifact, generated: generateStudioArtifacts(artifact.definition) }));
  const migrationSql = [
    `-- Flowly Module Generation: ${moduleName}`,
    `-- Generado el: ${generatedAt}`,
    `-- Aplicar manualmente después de revisar.`,
    ...generated.map(({ artifact, generated }) => `\n-- ============================================================\n-- ${artifact.kind}: ${artifact.name}\n-- ============================================================\n${generated.sql}`),
  ].join("\n");

  const typeScriptIndex = [
    `// Flowly Module: ${moduleName}`,
    `// Generado el: ${generatedAt}`,
    `export const ${toPascalCase(moduleName)}Module = {`,
    `  name: ${JSON.stringify(moduleName)},`,
    `  slug: ${JSON.stringify(slug)},`,
    `  artifacts: [`,
    ...artifacts.map((artifact) => `    { kind: ${JSON.stringify(artifact.kind)}, name: ${JSON.stringify(artifact.name)}, slug: ${JSON.stringify(artifact.slug)}, domain: ${JSON.stringify(artifact.domain)} },`),
    `  ],`,
    `} as const;`,
    ...generated.map(({ artifact, generated }) => `\n// ${artifact.name}\n${generated.typescript}`),
  ].join("\n");

  const apiManifest = JSON.stringify({
    module: moduleName,
    slug,
    generatedAt,
    routes: artifacts.map((artifact) => ({ kind: artifact.kind, slug: artifact.slug, suggestedPath: `/api/generated/${artifact.kind}/${artifact.slug}` })),
    note: "Las rutas generadas deben ejecutarse mediante Capability Runtime y contratos del dominio.",
  }, null, 2);

  const sdkIndex = generated.map(({ artifact, generated }) => `// ${artifact.name}\n${generated.sdk}`).join("\n\n");
  const docsIndex = `# ${moduleName}\n\nGenerado por Flowly Studio.\n${section("Artefactos", artifacts.map((artifact) => `- **${artifact.name}** (${artifact.kind}) — ${artifact.description}`).join("\n"))}${section("Puntuación arquitectónica", `${analysis.architectureScore}/100 · Riesgo: ${analysis.riskLevel}`)}${section("Avisos", analysis.warnings.length ? analysis.warnings.map((warning) => `- ${warning}`).join("\n") : "- No se han detectado avisos.")}${section("Recomendaciones", analysis.recommendations.length ? analysis.recommendations.map((item) => `- ${item}`).join("\n") : "- Listo para revisión.")}`;
  const testPlan = `# ${moduleName} Plan de pruebas\n\n${generated.map(({ artifact, generated }) => `## ${artifact.name}\n\n${generated.testPlan}`).join("\n\n")}\n\n## Pruebas arquitectónicas\n\n- Las apps deben consumir solo capacidades oficiales.\n- Las capacidades deben usar comandos/consultas oficiales.\n- Los objetos de negocio deben emitir eventos.\n- Los artefactos generados deben revisarse antes de producción.`;
  const impactReport = `# ${moduleName} Informe de impacto\n\n- Puntuación arquitectónica: ${analysis.architectureScore}/100\n- Nivel de riesgo: ${analysis.riskLevel}\n- Nodes: ${analysis.nodes.length}\n- Edges: ${analysis.edges.length}\n\n## Totales\n\n${Object.entries(analysis.totals).map(([kind, total]) => `- ${kind}: ${total}`).join("\n")}\n\n## Avisos\n\n${analysis.warnings.length ? analysis.warnings.map((warning) => `- ${warning}`).join("\n") : "- Ninguno"}\n\n## Recomendaciones\n\n${analysis.recommendations.length ? analysis.recommendations.map((item) => `- ${item}`).join("\n") : "- Ninguno"}`;

  return {
    id: `generation_${slug}_${Date.now()}`,
    moduleName,
    slug,
    summary: `Generados ${artifacts.length} artifacts for ${moduleName}. Architecture score ${analysis.architectureScore}/100.`,
    artifacts,
    migrationSql,
    typeScriptIndex,
    apiManifest,
    sdkIndex,
    docsIndex,
    testPlan,
    impactReport,
    generatedAt,
  };
}

export function buildSeedModuleSuggestion(prompt: string) {
  const normalized = prompt.toLowerCase();
  if (normalized.includes("veh") || normalized.includes("coche") || normalized.includes("alquiler")) {
    return {
      moduleName: "Vehicle Rental",
      businessObjects: ["Vehicle", "Rental", "Driver", "Insurance", "Maintenance", "Invoice"],
      capabilities: ["CreateVehicle", "CreateRental", "AssignDriver", "ScheduleMaintenance", "GenerateRentalInvoice"],
      workflows: ["Rental Onboarding", "Vehicle Maintenance", "Rental Closing"],
      policies: ["DriverLicenseRequired", "DepositRequired", "HighValueRentalApproval"],
    };
  }
  if (normalized.includes("rrhh") || normalized.includes("emple") || normalized.includes("human")) {
    return {
      moduleName: "Human Resources",
      businessObjects: ["Employee", "Contract", "Payroll", "Absence", "PerformanceReview", "Team"],
      capabilities: ["CreateEmployee", "ApproveAbsence", "GeneratePayroll", "ScheduleReview"],
      workflows: ["Employee Onboarding", "Absence Approval", "Payroll Closing"],
      policies: ["PayrollPrivacy", "ManagerApprovalRequired", "EmployeeDataRetention"],
    };
  }
  return {
    moduleName: "Custom Business Module",
    businessObjects: ["BusinessEntity", "Activity", "Document", "Invoice"],
    capabilities: ["CreateBusinessEntity", "UpdateBusinessEntity", "GenerateDocument", "RunWorkflow"],
    workflows: ["Default Onboarding", "Document Approval"],
    policies: ["OrganizationIsolation", "HumanApprovalRequired"],
  };
}
