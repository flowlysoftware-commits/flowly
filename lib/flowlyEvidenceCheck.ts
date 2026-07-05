import { buildFlowlyProjectSnapshot } from "@/lib/flowlyProjectReader";
import { readRepositoryFile } from "@/lib/flowlyGitHubExecutor";

export type FlowlyEvidenceFileCheck = {
  path: string;
  exists: boolean;
  firstLines?: string[];
  error?: string;
};

export type FlowlyEvidenceCheckResult = {
  ok: true;
  engine: "flow_evidence_check_v1";
  intent: "audit_evidence_check";
  activeEngines: string[];
  blockedEngines: string[];
  files: FlowlyEvidenceFileCheck[];
  reply: string;
};

const FILE_PATH_PATTERN = /(?:^|[\s`'"•\-])((?:app|components|lib|hooks|docs|types|supabase|public)\/[\w@./()[\]-]+\.(?:tsx|ts|jsx|js|md|json|css|sql|svg|png|ico|txt))/gi;

function normalizePath(value: string) {
  return value.replace(/\\/g, "/").replace(/^\/+/, "").replace(/[.,;:)\]]+$/, "").trim();
}

export function isEvidenceCheckInstruction(instruction: string) {
  const text = instruction
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const asksEvidence = [
    "evidencia verificable",
    "evidencia real",
    "primeras 20 lineas",
    "primeras 20 líneas",
    "lee el contenido real",
    "contenido real del archivo",
    "ejecuta project reader",
    "project reader real",
    "si existe o no existe",
    "si no puedes leer",
    "no planifiques",
    "no implementes",
  ].some((term) => text.includes(term.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));

  FILE_PATH_PATTERN.lastIndex = 0;
  const hasFilePath = FILE_PATH_PATTERN.test(` ${instruction}`);
  FILE_PATH_PATTERN.lastIndex = 0;

  return asksEvidence && hasFilePath;
}

export function extractEvidencePaths(instruction: string) {
  const matches = new Set<string>();
  const text = ` ${instruction}`;
  FILE_PATH_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = FILE_PATH_PATTERN.exec(text))) {
    if (match[1]) matches.add(normalizePath(match[1]));
  }
  return Array.from(matches);
}

function formatFirstLines(lines: string[]) {
  if (!lines.length) return "(archivo vacío)";
  return lines.map((line, index) => `${String(index + 1).padStart(2, "0")}: ${line}`).join("\n");
}

export async function runFlowlyEvidenceCheck(instruction: string): Promise<FlowlyEvidenceCheckResult> {
  const requestedPaths = extractEvidencePaths(instruction);
  let existing = new Set<string>();
  let projectReaderError: string | null = null;

  try {
    const snapshot = await buildFlowlyProjectSnapshot();
    existing = new Set(snapshot.existingPaths);
  } catch (error) {
    projectReaderError = error instanceof Error ? error.message : String(error);
  }

  const files: FlowlyEvidenceFileCheck[] = projectReaderError
    ? requestedPaths.map((filePath) => ({ path: filePath, exists: false, error: projectReaderError || "Project Reader no disponible." }))
    : await Promise.all(
    requestedPaths.map(async (filePath) => {
      if (!existing.has(filePath)) {
        return { path: filePath, exists: false };
      }

      try {
        const file = await readRepositoryFile(filePath);
        const lines = file.content.split(/\r?\n/).slice(0, 20);
        return { path: filePath, exists: true, firstLines: lines };
      } catch (error) {
        return {
          path: filePath,
          exists: true,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    })
  );

  const reply = [
    "Intent correcto: AUDIT_EVIDENCE_CHECK.",
    "No planifico, no implemento y no abro PR.",
    "Motores activos: Brain, Project Reader, Grounding Guard.",
    "Motores bloqueados: Planning, Executor, GitHub PR, Build Guard.",
    "",
    ...files.map((file) => {
      if (!file.exists && file.error) {
        return [`## ${file.path}`, "No tengo acceso al Project Reader real en esta ejecución.", `Error: ${file.error}`].join("\n");
      }
      if (!file.exists) {
        return [`## ${file.path}`, "Estado: NO EXISTE en el Project Reader real."].join("\n");
      }
      if (file.error) {
        return [`## ${file.path}`, "Estado: EXISTE, pero no he podido leer su contenido real.", `Error: ${file.error}`].join("\n");
      }
      return [`## ${file.path}`, "Estado: EXISTE.", "Primeras 20 líneas reales:", "```", formatFirstLines(file.firstLines || []), "```"].join("\n");
    }),
    "",
    "Veredicto: EVIDENCIA ENTREGADA. La misión activa se conserva, pero no puede secuestrar esta verificación.",
  ].join("\n");

  return {
    ok: true,
    engine: "flow_evidence_check_v1",
    intent: "audit_evidence_check",
    activeEngines: ["brain", "projectReader", "groundingGuard"],
    blockedEngines: ["planning", "executor", "github", "buildGuard"],
    files,
    reply,
  };
}
