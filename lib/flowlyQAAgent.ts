import { commitFilesToBranch, getGitHubExecutorConfig, listPullRequestFiles, listPullRequestQuality, readRepositoryFile, type ExecutorFileChange } from "@/lib/flowlyGitHubExecutor";

export type FlowlyQARisk = "bajo" | "medio" | "alto";

export type FlowlyQAInspection = {
  ok: boolean;
  prNumber?: number;
  branch?: string;
  title?: string;
  state?: string;
  risk: FlowlyQARisk;
  status: "pending" | "green" | "failed" | "unknown";
  summary: string;
  checks: Array<{ name: string; status?: string; conclusion?: string; url?: string }>;
  files: Array<{ filename: string; status?: string; additions?: number; deletions?: number }>;
  recommendations: string[];
  needsFix: boolean;
  error?: string;
};

export type FlowlyQAFixResult = FlowlyQAInspection & {
  fixed: boolean;
  committedFiles: string[];
  message: string;
};

function parsePullRequestNumber(value: string): number | undefined {
  const clean = value.trim();
  const matchUrl = clean.match(/\/pull\/(\d+)/i);
  if (matchUrl) return Number(matchUrl[1]);
  const matchHash = clean.match(/#(\d+)/);
  if (matchHash) return Number(matchHash[1]);
  const number = Number(clean);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function detectStatus(checks: FlowlyQAInspection["checks"]): FlowlyQAInspection["status"] {
  if (!checks.length) return "unknown";
  if (checks.some((check) => check.conclusion === "failure" || check.conclusion === "cancelled" || check.conclusion === "timed_out")) return "failed";
  if (checks.some((check) => check.status && check.status !== "completed")) return "pending";
  if (checks.every((check) => check.conclusion === "success" || check.conclusion === "neutral" || check.conclusion === "skipped")) return "green";
  return "unknown";
}

function riskFrom(files: FlowlyQAInspection["files"], status: FlowlyQAInspection["status"]): FlowlyQARisk {
  if (status === "failed") return "alto";
  if (files.length > 8) return "medio";
  return "bajo";
}

function extractPathsFromLog(log: string) {
  const paths = new Set<string>();
  const regexes = [
    /(?:\.\/)?((?:app|components|lib|types|supabase|docs)\/[\w./()[\]\-]+\.(?:tsx|ts|css|md|sql|json))/g,
    /at\s+[^\n]*\(([^:)]+\.(?:tsx|ts)):\d+:\d+\)/g,
  ];
  for (const regex of regexes) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(log))) {
      paths.add(match[1].replace(/^\.\//, ""));
    }
  }
  return Array.from(paths).slice(0, 12);
}

function buildManualFixDoc(params: { inspection: FlowlyQAInspection; buildLog?: string }) {
  const now = new Date().toISOString();
  return [
    "# Flowly QA Agent - Diagnóstico",
    "",
    `Fecha: ${now}`,
    "",
    `Pull Request: #${params.inspection.prNumber || "desconocido"}`,
    `Estado detectado: ${params.inspection.status}`,
    `Riesgo: ${params.inspection.risk}`,
    "",
    "## Resumen",
    "",
    params.inspection.summary,
    "",
    "## Checks",
    "",
    ...(params.inspection.checks.length ? params.inspection.checks.map((check) => `- ${check.name}: ${check.status || "-"} / ${check.conclusion || "-"}`) : ["- No hay checks disponibles." ]),
    "",
    "## Archivos del PR",
    "",
    ...(params.inspection.files.length ? params.inspection.files.map((file) => `- ${file.filename}`) : ["- No hay archivos disponibles." ]),
    "",
    params.buildLog ? "## Log recibido" : "## Siguiente paso",
    "",
    params.buildLog ? "```text\n" + params.buildLog.slice(0, 12000) + "\n```" : "Pega el error exacto de Vercel/GitHub Actions para que QA Agent pueda preparar un commit correctivo sobre la misma rama.",
    "",
  ].join("\n");
}

async function buildAIFix(params: {
  inspection: FlowlyQAInspection;
  buildLog: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !params.inspection.branch) return null;

  const paths = Array.from(new Set([
    ...extractPathsFromLog(params.buildLog),
    ...params.inspection.files.map((file) => file.filename),
  ])).slice(0, 8);

  const context: Array<{ path: string; content: string }> = [];
  for (const path of paths) {
    try {
      const file = await readRepositoryFile(path, params.inspection.branch);
      context.push({ path: file.path, content: file.content.slice(0, 18000) });
    } catch {
      // Continuar con los archivos que sí se puedan leer.
    }
  }

  const system = [
    "Eres Flowly QA Agent, especialista en arreglar errores de build de Next.js/TypeScript.",
    "Responde SOLO JSON válido: {\"files\":[{\"path\":\"...\",\"content\":\"...\",\"message\":\"...\"}], \"summary\":\"...\"}",
    "Reglas:",
    "- Modifica preferentemente archivos existentes del PR o los citados por el log.",
    "- No crees archivos duplicados ni versiones V2/V3 salvo que sea inevitable.",
    "- No cambies package.json ni añadas dependencias.",
    "- El objetivo es que npm run build pase.",
    "- Devuelve archivos completos, no parches parciales.",
    "- Mantén el cambio mínimo y seguro.",
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.FLOWLY_QA_MODEL || process.env.FLOWLY_EXECUTOR_MODEL || process.env.FLOWLY_AI_MODEL || "gpt-4o-mini",
      temperature: 0.05,
      max_tokens: 12000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: JSON.stringify({
            pr: params.inspection,
            buildLog: params.buildLog.slice(0, 20000),
            contextFiles: context,
          }),
        },
      ],
    }),
  });

  if (!response.ok) return null;
  const data = await response.json().catch(() => null);
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") return null;

  try {
    const parsed = JSON.parse(content) as { files?: ExecutorFileChange[]; summary?: string };
    const files = (parsed.files || [])
      .filter((file) => typeof file.path === "string" && typeof file.content === "string")
      .filter((file) => !file.path.includes("..") && !file.path.startsWith("/"))
      .slice(0, 6)
      .map((file) => ({ ...file, message: file.message || "QA Agent: corregir error de build" }));
    return files.length ? { files, summary: parsed.summary || "QA Agent preparó una corrección automática." } : null;
  } catch {
    return null;
  }
}

export async function inspectPullRequestForQA(input: string): Promise<FlowlyQAInspection> {
  const prNumber = parsePullRequestNumber(input);
  if (!prNumber) {
    return {
      ok: false,
      risk: "alto",
      status: "unknown",
      summary: "No he podido identificar el número del Pull Request. Pega la URL del PR o escribe su número.",
      checks: [],
      files: [],
      recommendations: ["Abre GitHub, entra en el PR fallido y copia la URL completa."],
      needsFix: true,
      error: "Pull Request no identificado.",
    };
  }

  const data = await listPullRequestQuality(prNumber);
  const files = await listPullRequestFiles(prNumber);
  const checks = data.checks;
  const status = detectStatus(checks);
  const simplifiedFiles = files.map((file) => ({ filename: file.filename, status: file.status, additions: file.additions, deletions: file.deletions }));
  const risk = riskFrom(simplifiedFiles, status);
  const recommendations = status === "green"
    ? ["El PR está en verde. Ya puedes revisarlo y hacer merge si el cambio visual te convence."]
    : status === "failed"
      ? ["Hay checks fallidos. Pega el log de Vercel/GitHub Actions o pulsa corregir si el log está disponible.", "QA Agent debe corregir sobre la misma rama, no crear un PR nuevo."]
      : ["Espera a que terminen los checks o pega el error exacto si Vercel ya lo muestra."];

  return {
    ok: true,
    prNumber,
    branch: data.pullRequest.head.ref,
    title: data.pullRequest.title,
    state: data.pullRequest.state,
    risk,
    status,
    summary: status === "green"
      ? `El Pull Request #${prNumber} está en verde.`
      : status === "failed"
        ? `El Pull Request #${prNumber} tiene checks fallidos y necesita corrección.`
        : `El Pull Request #${prNumber} está en estado ${status}.`,
    checks,
    files: simplifiedFiles,
    recommendations,
    needsFix: status !== "green",
  };
}

export async function fixPullRequestWithQA(params: { pr: string; buildLog?: string }): Promise<FlowlyQAFixResult> {
  const inspection = await inspectPullRequestForQA(params.pr);
  if (!inspection.ok || !inspection.prNumber || !inspection.branch) {
    return { ...inspection, fixed: false, committedFiles: [], message: inspection.error || "No se puede corregir sin Pull Request válido." };
  }
  if (inspection.status === "green") {
    return { ...inspection, fixed: false, committedFiles: [], message: "No he aplicado cambios porque el PR ya está en verde." };
  }

  const buildLog = params.buildLog?.trim() || "";
  const aiFix = buildLog ? await buildAIFix({ inspection, buildLog }) : null;
  const fallbackDoc: ExecutorFileChange = {
    path: `docs/qa/pr-${inspection.prNumber}-diagnostico.md`,
    content: buildManualFixDoc({ inspection, buildLog }),
    message: "QA Agent: registrar diagnóstico de build",
  };
  const files = aiFix?.files?.length ? [fallbackDoc, ...aiFix.files] : [fallbackDoc];
  const commit = await commitFilesToBranch({ branch: inspection.branch, files, message: aiFix?.summary || "QA Agent: diagnóstico/corrección de build" });

  return {
    ...inspection,
    fixed: commit.ok && Boolean(aiFix?.files?.length),
    committedFiles: files.map((file) => file.path),
    message: commit.ok
      ? aiFix?.files?.length
        ? "He aplicado una corrección automática sobre la misma rama. Espera el nuevo deploy y revisa si queda en verde."
        : "He añadido un diagnóstico al PR. Pega el log exacto del error para que pueda aplicar una corrección real."
      : `No he podido hacer commit en la rama: ${commit.error || "error desconocido"}`,
  };
}

export function getQAAgentStatus() {
  const config = getGitHubExecutorConfig();
  return {
    ready: config.hasCredentials,
    mode: config.authMode,
    repository: config.owner && config.repo ? `${config.owner}/${config.repo}` : null,
    needsOpenAI: !process.env.OPENAI_API_KEY,
    missing: config.missing,
  };
}
