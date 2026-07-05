export type FlowlyGroundingGuardInput = {
  objective: string;
  files: string[];
  existingPaths: string[];
};

export type FlowlyGroundingGuardResult = {
  allowed: boolean;
  reasons: string[];
  safeFiles: string[];
};

const SEO_METADATA_ALLOWED_PATH_FRAGMENTS = [
  "app/layout",
  "app/page",
  "sitemap",
  "robots",
  "manifest",
  "metadata",
  "opengraph",
  "open-graph",
  "twitter",
  "icon",
  "favicon",
];

function normalizePath(path: string) {
  return path.replace(/\\/g, "/").replace(/^\.\//, "").trim();
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function isMetadataOrOpenGraphObjective(objective: string) {
  const text = normalizeText(objective);
  return /metadata|metadatos|meta\s+datos|open\s*graph|opengraph|twitter\s*cards?|canonical|sitemap|robots|manifest|favicon|schema|json-ld/.test(text);
}

function isAllowedForMetadataOrOpenGraph(path: string) {
  const normalized = normalizeText(normalizePath(path));
  return SEO_METADATA_ALLOWED_PATH_FRAGMENTS.some((fragment) => normalized.includes(fragment));
}

export function validatePlanGrounding(input: FlowlyGroundingGuardInput): FlowlyGroundingGuardResult {
  const existing = new Set(input.existingPaths.map(normalizePath));
  const requestedFiles = unique(input.files.map(normalizePath).filter(Boolean));
  const reasons: string[] = [];

  if (!requestedFiles.length) {
    return {
      allowed: false,
      reasons: ["Grounding Guard bloqueó la ejecución porque el plan no contiene archivos concretos para validar."],
      safeFiles: [],
    };
  }

  const missingFiles = requestedFiles.filter((path) => !existing.has(path));
  if (missingFiles.length) {
    reasons.push(
      `Grounding Guard bloqueó rutas inexistentes en Project Graph: ${missingFiles.map((path) => `\`${path}\``).join(", ")}.`
    );
  }

  const existingFiles = requestedFiles.filter((path) => existing.has(path));
  let safeFiles = existingFiles;

  if (isMetadataOrOpenGraphObjective(input.objective)) {
    const blockedByObjective = existingFiles.filter((path) => !isAllowedForMetadataOrOpenGraph(path));
    safeFiles = existingFiles.filter(isAllowedForMetadataOrOpenGraph);

    if (blockedByObjective.length) {
      reasons.push(
        `Grounding Guard detectó que el objetivo es SEO/metadata/Open Graph y bloqueó archivos fuera de alcance: ${blockedByObjective
          .map((path) => `\`${path}\``)
          .join(", ")}.`
      );
    }
  }

  if (!safeFiles.length) {
    reasons.push("Grounding Guard no encontró archivos seguros y reales para ejecutar este plan.");
  }

  return {
    allowed: reasons.length === 0 && safeFiles.length > 0,
    reasons,
    safeFiles,
  };
}
