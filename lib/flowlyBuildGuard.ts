import type { ExecutorFileChange } from "@/lib/flowlyGitHubExecutor";

export type FlowlyBuildGuardIssue = {
  path: string;
  severity: "error" | "warning";
  code: string;
  message: string;
  fixApplied?: boolean;
};

export type FlowlyBuildGuardResult = {
  ok: boolean;
  files: ExecutorFileChange[];
  issues: FlowlyBuildGuardIssue[];
  summary: string;
};

const REACT_VALUE_IMPORTS = ["useEffect", "useMemo", "useState", "useCallback", "useRef", "Suspense"];
const REACT_TYPE_IMPORTS = ["FormEvent", "ReactNode", "ChangeEvent", "MouseEvent"];

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function isCodeFile(path: string) {
  return /\.(tsx|ts)$/.test(path);
}

function hasJsx(content: string) {
  return /<[A-Za-z][\w.:-]*(\s|>|\/>)/.test(content);
}

function needsClientDirective(content: string) {
  return /\b(useEffect|useState|useRef|useMemo|useCallback)\b/.test(content) || /\bwindow\./.test(content) || /\blocalStorage\b/.test(content);
}

function hasClientDirective(content: string) {
  return /^\s*["']use client["'];/.test(content);
}

function detectReactImports(content: string) {
  const valueImports = REACT_VALUE_IMPORTS.filter((name) => new RegExp(`\\b${name}\\b`).test(content));
  const typeImports = REACT_TYPE_IMPORTS.filter((name) => new RegExp(`\\b${name}\\b`).test(content));
  return { valueImports, typeImports };
}

function removeReactImport(content: string) {
  return content.replace(/^import\s+React\s*,?\s*\{[^}]*\}\s+from\s+["']react["'];\s*\n?/m, "")
    .replace(/^import\s+\{[^}]*\}\s+from\s+["']react["'];\s*\n?/m, "")
    .replace(/^import\s+type\s+\{[^}]*\}\s+from\s+["']react["'];\s*\n?/m, "")
    .replace(/^import\s+React\s+from\s+["']react["'];\s*\n?/m, "");
}

function buildReactImport(content: string) {
  const { valueImports, typeImports } = detectReactImports(content);
  const values = unique(valueImports);
  const types = unique(typeImports).map((name) => `type ${name}`);
  const imports = [...values, ...types];
  if (!imports.length && !hasJsx(content)) return "";
  if (!imports.length && hasJsx(content)) return "";
  return `import { ${imports.join(", ")} } from "react";\n`;
}

function normalizeReactImport(content: string) {
  const reactImport = buildReactImport(content);
  const withoutReactImport = removeReactImport(content);
  if (!reactImport) return withoutReactImport;
  const clientMatch = withoutReactImport.match(/^(\s*["']use client["'];\s*\n+)/);
  if (clientMatch) {
    return withoutReactImport.replace(clientMatch[0], `${clientMatch[0]}${reactImport}`);
  }
  return `${reactImport}${withoutReactImport}`;
}

function ensureClientDirective(content: string) {
  if (!needsClientDirective(content) || hasClientDirective(content)) return content;
  return `"use client";\n\n${content}`;
}

function fixWindowGtag(content: string) {
  if (!content.includes("window.gtag")) return content;
  return content.replace(/window\.gtag\?\./g, '(window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.');
}

function removeDuplicateFbqDeclaration(content: string) {
  if (!content.includes("fbq?:")) return content;
  return content.replace(/\n?\s*fbq\?:\s*\(\.\.\.args:\s*unknown\[\]\)\s*=>\s*void;\n?/g, "\n");
}

function analyzeKnownFailures(path: string, content: string): FlowlyBuildGuardIssue[] {
  const issues: FlowlyBuildGuardIssue[] = [];
  const add = (code: string, message: string, severity: "error" | "warning" = "error") => {
    issues.push({ path, severity, code, message });
  };

  if (/Missing closing parenthesis|Cannot find name/.test(content)) {
    add("debug-placeholder", "El archivo contiene texto de error/debug que no debe llegar a producción.");
  }

  if (/\bvoiceNeed\b/.test(content) && !/\bvoiceNeedsActivation\b/.test(content)) {
    add("suspicious-voice-need", "Se detecta voiceNeed suelto. Probablemente debería ser voiceNeedsActivation.");
  }

  if (/\buseSearchParams\s*\(/.test(content) && path.startsWith("app/") && path.endsWith("/page.tsx") && !/\bSuspense\b/.test(content)) {
    add("usesearchparams-without-suspense", "useSearchParams en una page debe aislarse en un componente cliente envuelto en Suspense para evitar errores de prerender.");
  }

  if (/\bwindow\./.test(content) && !hasClientDirective(content)) {
    add("browser-api-without-use-client", "El archivo usa APIs del navegador y necesita directiva use client.", "warning");
  }

  return issues;
}

function analyzeMissingReactImports(path: string, original: string, fixed: string): FlowlyBuildGuardIssue[] {
  const issues: FlowlyBuildGuardIssue[] = [];
  const used = [...REACT_VALUE_IMPORTS, ...REACT_TYPE_IMPORTS].filter((name) => new RegExp(`\\b${name}\\b`).test(original));
  for (const name of used) {
    const hadImport = new RegExp(`import[\\s\\S]*\\b${name}\\b[\\s\\S]*from\\s+["']react["']`).test(original);
    if (!hadImport) {
      issues.push({
        path,
        severity: "warning",
        code: "react-import-autofix",
        message: `Se añadió el import de React necesario para ${name}.`,
        fixApplied: fixed !== original,
      });
    }
  }
  return issues;
}

function fixSingleFile(file: ExecutorFileChange): { file: ExecutorFileChange; issues: FlowlyBuildGuardIssue[] } {
  if (!isCodeFile(file.path)) return { file, issues: [] };

  const original = file.content;
  let content = original;
  content = removeDuplicateFbqDeclaration(content);
  content = fixWindowGtag(content);
  content = ensureClientDirective(content);
  content = normalizeReactImport(content);

  const issues = [
    ...analyzeMissingReactImports(file.path, original, content),
    ...analyzeKnownFailures(file.path, content),
  ];

  return {
    file: { ...file, content },
    issues,
  };
}

export function runFlowlyBuildGuard(files: ExecutorFileChange[]): FlowlyBuildGuardResult {
  const fixed = files.map(fixSingleFile);
  const nextFiles = fixed.map((item) => item.file);
  const issues = fixed.flatMap((item) => item.issues);

  const errors = issues.filter((issue) => issue.severity === "error");
  const fixedCount = issues.filter((issue) => issue.fixApplied).length;
  const summary = errors.length
    ? `Build Guard bloquea el PR: ${errors.length} error(es) crítico(s) detectado(s).`
    : fixedCount
      ? `Build Guard aplicó ${fixedCount} corrección(es) preventiva(s) antes del PR.`
      : "Build Guard no detectó errores estáticos conocidos.";

  return {
    ok: errors.length === 0,
    files: nextFiles,
    issues,
    summary,
  };
}
