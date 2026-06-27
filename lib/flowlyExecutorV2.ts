import { createExecutorPullRequest, getGitHubExecutorConfig, listRepositoryTree, readRepositoryFile, type ExecutorFileChange } from "@/lib/flowlyGitHubExecutor";
import { flowlyMigrationModules } from "@/lib/flowlyOSMigration";

export type ExecutorV2Mode = "plan" | "pull_request";

export type ExecutorV2Request = {
  instruction: string;
  approved?: boolean;
  mode?: ExecutorV2Mode;
};

export type ExecutorV2TargetFile = {
  path: string;
  reason: string;
  size?: number;
};

export type ExecutorV2Plan = {
  ok: true;
  status: "planned";
  instruction: string;
  summary: string;
  risk: "bajo" | "medio" | "alto";
  targetModules: string[];
  candidateFiles: ExecutorV2TargetFile[];
  proposedSteps: string[];
  proposedFiles: ExecutorFileChange[];
  requiresApproval: boolean;
};

export type ExecutorV2RunResult = Omit<ExecutorV2Plan, "status"> & {
  status: "planned" | "pull_request_created";
  pullRequestUrl?: string;
  pullRequestNumber?: number;
  branch?: string;
  error?: string;
};

const MAX_FILES_TO_READ = 8;
const MAX_FILE_CHARS = 9000;

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function slug(value: string) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "flowly-change";
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function detectTargetModules(instruction: string) {
  const text = normalize(instruction);
  const detected = flowlyMigrationModules
    .filter((module) => {
      const terms = [module.id, module.name, module.targetDomain, ...module.currentRoutes, ...module.businessObjects, ...module.capabilities];
      return terms.some((term) => text.includes(normalize(term)));
    })
    .map((module) => module.name);

  if (text.includes("companion") || text.includes("avatar") || text.includes("mascota")) detected.push("Companion Runtime");
  if (text.includes("crm") || text.includes("cliente") || text.includes("pipeline")) detected.push("CRM");
  if (text.includes("factura") || text.includes("facturacion") || text.includes("facturación")) detected.push("Facturación");
  if (text.includes("whatsapp")) detected.push("WhatsApp");
  if (text.includes("studio") || text.includes("builder") || text.includes("kernel")) detected.push("Flowly OS");

  return unique(detected.length ? detected : ["Flowly OS"]);
}

function pathScore(path: string, instruction: string) {
  const text = normalize(instruction);
  const normalizedPath = normalize(path);
  let score = 0;

  const pairs: Array<[string, string[]]> = [
    ["Companion", ["companion", "avatar", "mascota", "assistant", "brand-avatar"]],
    ["CRM", ["crm", "cliente", "clientes", "pipeline", "contact", "lead", "opportunity"]],
    ["Facturación", ["factura", "facturacion", "invoice", "budget", "presupuesto"]],
    ["WhatsApp", ["whatsapp", "messages", "webhooks"]],
    ["Studio", ["studio", "builder", "kernel", "brain", "executor"]],
    ["Docs", ["docs", "knowledge", "documentation"]],
  ];

  for (const [, keywords] of pairs) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      for (const keyword of keywords) if (normalizedPath.includes(keyword)) score += 8;
    }
  }

  for (const token of normalize(instruction).split(/\s+/).filter((item) => item.length > 4)) {
    if (normalizedPath.includes(token)) score += 1;
  }

  if (normalizedPath.endsWith("page.tsx")) score += 3;
  if (normalizedPath.includes("components/")) score += 2;
  if (normalizedPath.includes("lib/")) score += 2;
  if (normalizedPath.includes("api/")) score += 1;
  if (normalizedPath.includes("node_modules") || normalizedPath.includes(".next")) score -= 100;
  if (!/\.(tsx|ts|css|md|sql|json)$/.test(normalizedPath)) score -= 5;

  return score;
}

async function getCandidateFiles(instruction: string): Promise<ExecutorV2TargetFile[]> {
  try {
    const tree = await listRepositoryTree();
    return tree.items
      .filter((item) => item.type === "blob")
      .map((item) => ({ item, score: pathScore(item.path, instruction) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 18)
      .map(({ item, score }) => ({
        path: item.path,
        size: item.size,
        reason: `Coincidencia con la petición. Relevancia ${score}/100.`,
      }));
  } catch {
    return [];
  }
}

async function readContextFiles(files: ExecutorV2TargetFile[]) {
  const reads = [] as Array<{ path: string; content: string }>;
  for (const file of files.slice(0, MAX_FILES_TO_READ)) {
    try {
      const data = await readRepositoryFile(file.path);
      reads.push({ path: data.path, content: data.content.slice(0, MAX_FILE_CHARS) });
    } catch {
      // Si un archivo no se puede leer, seguimos con el resto.
    }
  }
  return reads;
}

function buildPlanMarkdown(params: {
  instruction: string;
  targetModules: string[];
  candidateFiles: ExecutorV2TargetFile[];
  proposedSteps: string[];
}) {
  const now = new Date().toISOString();
  return [
    "# Flowly Executor V2 - Plan de cambio",
    "",
    `Fecha: ${now}`,
    "",
    "## Instrucción",
    "",
    params.instruction,
    "",
    "## Módulos detectados",
    "",
    ...params.targetModules.map((item) => `- ${item}`),
    "",
    "## Archivos candidatos",
    "",
    ...(params.candidateFiles.length ? params.candidateFiles.map((file) => `- \`${file.path}\` — ${file.reason}`) : ["- No se encontraron archivos candidatos automáticamente."]),
    "",
    "## Plan",
    "",
    ...params.proposedSteps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "## Seguridad",
    "",
    "Este cambio fue preparado por Flowly Executor V2. Nunca modifica la rama principal directamente: crea una rama y un Pull Request para revisión humana.",
    "",
  ].join("\n");
}

function buildCompanionAvatarScaffold(instruction: string): ExecutorFileChange[] {
  return [
    {
      path: "components/companion/CompanionAvatarEvolutionV2.tsx",
      content: `"use client";\n\nimport { useMemo } from "react";\n\ntype CompanionAvatarEvolutionV2Props = {\n  mood?: "feliz" | "pensando" | "celebrando" | "trabajando" | "descansando";\n  level?: number;\n  message?: string;\n};\n\nexport default function CompanionAvatarEvolutionV2({ mood = "feliz", level = 1, message }: CompanionAvatarEvolutionV2Props) {\n  const expression = useMemo(() => {\n    if (mood === "pensando") return "🤔";\n    if (mood === "celebrando") return "🥳";\n    if (mood === "trabajando") return "🧠";\n    if (mood === "descansando") return "😴";\n    return "😊";\n  }, [mood]);\n\n  return (\n    <div className="flowly-companion-evolution-v2" data-mood={mood}>\n      <div className="flowly-companion-evolution-v2__aura" />\n      <div className="flowly-companion-evolution-v2__body">\n        <div className="flowly-companion-evolution-v2__head">\n          <span className="flowly-companion-evolution-v2__hair" />\n          <span className="flowly-companion-evolution-v2__face">{expression}</span>\n        </div>\n        <div className="flowly-companion-evolution-v2__chest">\n          <span>F</span>\n        </div>\n        <div className="flowly-companion-evolution-v2__shadow" />\n      </div>\n      <div className="flowly-companion-evolution-v2__meta">\n        <strong>Companion Nivel {level}</strong>\n        <span>{message || "Estoy vivo dentro de Flowly."}</span>\n      </div>\n    </div>\n  );\n}\n`,
      message: "Executor V2: añadir avatar evolutivo Companion V2",
    },
    {
      path: "docs/executor/companion-avatar-v2.md",
      content: `# Companion Avatar V2\n\n## Origen\n\n${instruction}\n\n## Objetivo\n\nCrear una primera base aislada para un avatar evolutivo del Companion sin romper el Companion Runtime actual.\n\n## Siguiente paso\n\nIntegrar este componente en el Runtime global cuando la revisión visual sea aprobada.\n`,
      message: "Executor V2: documentar avatar evolutivo Companion V2",
    },
  ];
}

function buildDefaultScaffold(instruction: string, targetModules: string[]): ExecutorFileChange[] {
  const name = slug(instruction);
  return [
    {
      path: `docs/executor/plans/${name}.md`,
      content: `# Plan Executor V2\n\n## Petición\n\n${instruction}\n\n## Módulos\n\n${targetModules.map((item) => `- ${item}`).join("\n")}\n\n## Estado\n\nPlan creado para revisión. El siguiente paso es convertirlo en cambios de código concretos mediante Executor V2.\n`,
      message: "Executor V2: registrar plan de cambio",
    },
  ];
}

async function buildAIGeneratedFiles(params: {
  instruction: string;
  targetModules: string[];
  candidateFiles: ExecutorV2TargetFile[];
  contextFiles: Array<{ path: string; content: string }>;
}): Promise<ExecutorFileChange[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const system = [
    "Eres Flowly Executor V2. Debes proponer cambios de código seguros para un proyecto Next.js/TypeScript.",
    "Responde SOLO JSON válido con esta forma: {\"files\":[{\"path\":\"...\",\"content\":\"...\",\"message\":\"...\"}]}",
    "Reglas estrictas:",
    "- Máximo 4 archivos.",
    "- No borres archivos.",
    "- Si no estás seguro, crea documentación en docs/executor/plans en lugar de tocar código crítico.",
    "- No uses imports de paquetes nuevos.",
    "- No expongas secretos.",
    "- Mantén el cambio aislado y revisable.",
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.FLOWLY_EXECUTOR_MODEL || process.env.FLOWLY_AI_MODEL || "gpt-4o-mini",
      temperature: 0.12,
      max_tokens: 5500,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: JSON.stringify({
            instruction: params.instruction,
            targetModules: params.targetModules,
            candidateFiles: params.candidateFiles.slice(0, 12),
            contextFiles: params.contextFiles,
          }),
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) return null;
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") return null;

  try {
    const parsed = JSON.parse(content) as { files?: ExecutorFileChange[] };
    if (!Array.isArray(parsed.files)) return null;
    return parsed.files
      .filter((file) => typeof file.path === "string" && typeof file.content === "string")
      .filter((file) => !file.path.includes("..") && !file.path.startsWith("/"))
      .slice(0, 4)
      .map((file) => ({ path: file.path, content: file.content, message: file.message || "Executor V2: cambio generado" }));
  } catch {
    return null;
  }
}

export async function planExecutorV2(request: ExecutorV2Request): Promise<ExecutorV2Plan> {
  const instruction = request.instruction.trim();
  const targetModules = detectTargetModules(instruction);
  const candidateFiles = await getCandidateFiles(instruction);
  const proposedSteps = [
    "Analizar intención y módulos afectados.",
    "Localizar archivos candidatos dentro del repositorio real.",
    "Preparar cambios aislados en una rama nueva.",
    "Crear Pull Request para revisión humana.",
    "Esperar aprobación antes de fusionar o desplegar.",
  ];

  const lower = normalize(instruction);
  let proposedFiles: ExecutorFileChange[];
  if (lower.includes("avatar") || lower.includes("companion") || lower.includes("mascota")) {
    proposedFiles = buildCompanionAvatarScaffold(instruction);
  } else {
    proposedFiles = buildDefaultScaffold(instruction, targetModules);
  }

  proposedFiles.unshift({
    path: `docs/executor/plans/${slug(instruction)}-plan.md`,
    content: buildPlanMarkdown({ instruction, targetModules, candidateFiles, proposedSteps }),
    message: "Executor V2: registrar plan de ejecución",
  });

  return {
    ok: true,
    status: "planned",
    instruction,
    summary: `Executor V2 ha detectado ${targetModules.length} módulo(s) y ${candidateFiles.length} archivo(s) candidato(s).`,
    risk: candidateFiles.length > 12 ? "medio" : "bajo",
    targetModules,
    candidateFiles,
    proposedSteps,
    proposedFiles,
    requiresApproval: true,
  };
}

export async function runExecutorV2(request: ExecutorV2Request): Promise<ExecutorV2RunResult> {
  const plan = await planExecutorV2(request);
  if (!request.approved) return plan;

  const contextFiles = await readContextFiles(plan.candidateFiles);
  const aiFiles = await buildAIGeneratedFiles({
    instruction: plan.instruction,
    targetModules: plan.targetModules,
    candidateFiles: plan.candidateFiles,
    contextFiles,
  });

  const files = aiFiles?.length ? [plan.proposedFiles[0], ...aiFiles] : plan.proposedFiles;
  const title = `Flowly Executor V2: ${plan.instruction.slice(0, 72)}`;
  const pr = await createExecutorPullRequest({
    title,
    body: [
      "## Flowly Executor V2",
      "Este Pull Request fue creado automáticamente por Flowly Brain/Executor V2.",
      "",
      "### Petición",
      plan.instruction,
      "",
      "### Módulos detectados",
      ...plan.targetModules.map((item) => `- ${item}`),
      "",
      "### Seguridad",
      "No se modifica la rama principal directamente. Este PR debe revisarse antes de hacer merge.",
    ].join("\n"),
    branchName: `flowly/executor-v2-${slug(plan.instruction)}-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 12)}`,
    files,
  });

  return {
    ...plan,
    status: pr.ok ? "pull_request_created" : "planned",
    pullRequestUrl: pr.pullRequestUrl,
    pullRequestNumber: pr.pullRequestNumber,
    branch: pr.branch,
    error: pr.error,
    proposedFiles: files,
  };
}
