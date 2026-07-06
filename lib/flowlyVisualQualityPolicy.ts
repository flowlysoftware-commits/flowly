import type { ExecutorFileChange } from "@/lib/flowlyGitHubExecutor";

export type FlowlyVisualQualityCheck = {
  label: string;
  ok: boolean;
  detail: string;
};

export type FlowlyVisualQualityResult = {
  applies: boolean;
  ok: boolean;
  summary: string;
  checks: FlowlyVisualQualityCheck[];
  remediationMode?: boolean;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isVisualUiInstruction(instruction: string) {
  const text = normalize(instruction);
  return /(avatar|companion|mas grande|más grande|tamano|tamaño|layout|pantalla|movil|móvil|responsive|modal|panel|boton|botón|ui|interfaz|visual|css|height|width|escala|scale)/i.test(text);
}

export function isVisualRemediationInstruction(instruction: string) {
  const text = normalize(instruction);
  return isVisualUiInstruction(instruction) && /(corrige|corregir|arregla|arreglar|remedia|remediacion|bloque|visual qa|viewport|contenedor|max-height|max-width|clamp|overflow|no uses un scale libre|patron seguro|patrón seguro)/i.test(text);
}

function touchesVisualFile(file: ExecutorFileChange) {
  return /\.(tsx|css)$/.test(file.path) && /(app\/|components\/|globals\.css|companion|avatar|ui|panel|layout)/i.test(file.path);
}

function hasResponsiveBound(content: string) {
  return /clamp\(|min\(|max\(|max-width|max-height|calc\(100v[wh]|max\(0px|@media|overflow\s*:/i.test(content);
}

function hasSafeRemediationPattern(content: string) {
  const hasClamp = /clamp\(/i.test(content);
  const hasMaxSize = /(max-width|max-height)/i.test(content);
  const hasViewportLimit = /calc\(100v[wh]|100dvh|100svh|100vw|100vh|max\(0px/i.test(content);
  const hasOverflowControl = /overflow\s*:\s*(hidden|clip)/i.test(content);
  const hasBoxSizing = /box-sizing\s*:\s*border-box/i.test(content);
  return hasClamp && hasMaxSize && hasViewportLimit && (hasOverflowControl || hasBoxSizing);
}

function hasUnsafeScale(content: string) {
  return /scale\s*[:(]\s*1\.(?:2[5-9]|[3-9]\d)|scale\([^)]*1\.(?:2[5-9]|[3-9]\d)/i.test(content);
}

function hasViewportRisk(content: string) {
  return /(100vh|100vw|fixed|absolute)/i.test(content) && !/(max-height|max-width|overflow|clamp\(|calc\(100v[wh]|@media)/i.test(content);
}

function hasCompanionAvatarBounds(content: string) {
  if (!/flowly-companion-avatar-shell|evo-companion|CompanionAvatar|FlowlyCompanion/i.test(content)) return true;
  return /(max-height|max-width|clamp\(|@media|maxAvatar|avatarWidth|avatarHeight|margin|overflow\s*:\s*(hidden|clip)|calc\(100v[wh]|100dvh|100svh)/i.test(content);
}

export function buildVisualQualityPolicyPrompt(instruction: string) {
  if (!isVisualUiInstruction(instruction)) return null;

  return [
    "VISUAL QUALITY POLICY:",
    "- Si modificas tamaño, avatar, panel, modal, layout o UI visible, el cambio debe caber en viewport de escritorio y móvil.",
    "- No uses escalados brutos grandes como scale(1.25) sin límites de contenedor.",
    "- Usa clamp(), max-width, max-height, calc(100vw/100vh) o breakpoints cuando cambies tamaños.",
    "- Si aumentas un elemento aproximadamente un 25%, hazlo perceptible pero con límites; no debe salir de su contenedor ni tapar zonas críticas.",
    "- No modifiques animaciones ni lógica si el usuario lo prohíbe; ajusta solo tamaño/estilos necesarios.",
    "- Para Companion/avatar, coordina CSS visible con los cálculos de posición para que el avatar no quede cortado en el borde inferior o lateral.",
    "- Si Visual QA bloqueó un cambio anterior, aplica REMEDIATION MODE: no repitas el escalado libre; corrige con contenedor seguro, max-width, max-height, clamp(), overflow control y límites de viewport.",
    "- En remediation mode debes devolver cambios reales con bounds verificables; si no puedes, devuelve {\"files\":[]} y explica por qué en el mensaje del archivo si aplica.",
    "- Si no puedes garantizar responsive básico, devuelve {\"files\":[]} y no crees PR.",
  ].join("\n");
}

export function evaluateVisualQualityPolicy(params: { instruction: string; files: ExecutorFileChange[] }): FlowlyVisualQualityResult {
  const applies = isVisualUiInstruction(params.instruction) || params.files.some(touchesVisualFile);
  if (!applies) {
    return { applies: false, ok: true, summary: "Visual QA no aplica a esta petición.", checks: [] };
  }

  const remediationMode = isVisualRemediationInstruction(params.instruction);
  const visualFiles = params.files.filter(touchesVisualFile);
  const combined = visualFiles.map((file) => `/* ${file.path} */\n${file.content}`).join("\n\n");
  const safeRemediation = remediationMode && hasSafeRemediationPattern(combined);
  const checks: FlowlyVisualQualityCheck[] = [
    {
      label: "Archivos visuales acotados",
      ok: visualFiles.length > 0,
      detail: visualFiles.length ? `Se revisan ${visualFiles.length} archivo(s) visual(es).` : "La petición visual no modifica ningún archivo visual verificable.",
    },
    {
      label: "Responsive bounds",
      ok: hasResponsiveBound(combined) || safeRemediation,
      detail: hasResponsiveBound(combined) || safeRemediation
        ? "El cambio incluye límites responsive, viewport o breakpoints."
        : "Faltan límites responsive como clamp(), max-width, max-height, calc(100vw/100vh) o @media.",
    },
    {
      label: "Sin escalado bruto inseguro",
      ok: !hasUnsafeScale(combined) || safeRemediation,
      detail: hasUnsafeScale(combined) && !safeRemediation
        ? "Se detecta un escalado >= 1.25 sin garantía de bounds. Usa tamaño limitado o clamp en el contenedor."
        : safeRemediation
          ? "Remediation mode: cualquier escala queda acompañada de bounds verificables."
          : "No se detecta scale >= 1.25 peligroso.",
    },
    {
      label: "Viewport seguro",
      ok: !hasViewportRisk(combined) || safeRemediation,
      detail: hasViewportRisk(combined) && !safeRemediation
        ? "Hay posicionamiento fijo/absoluto con unidades viewport sin límites de overflow/max size."
        : "No se detecta riesgo evidente de salida del viewport.",
    },
    {
      label: "Companion/avatar dentro de contenedor",
      ok: hasCompanionAvatarBounds(combined) || safeRemediation,
      detail: hasCompanionAvatarBounds(combined) || safeRemediation
        ? safeRemediation
          ? "Remediation mode: Companion/avatar incluye límites de contenedor, viewport y overflow."
          : "Los cambios del Companion/avatar declaran límites o cálculos de posición."
        : "El Companion/avatar cambia sin límites de contenedor o cálculo de posición asociado.",
    },
  ];

  const failed = checks.find((check) => !check.ok);
  return {
    applies: true,
    ok: !failed,
    checks,
    remediationMode,
    summary: failed
      ? `Visual QA bloquea el cambio: ${failed.detail}`
      : remediationMode
        ? "Visual QA superado en remediation mode: el cambio visual incluye límites seguros de contenedor y viewport."
        : "Visual QA superado: el cambio visual declara límites básicos para escritorio y móvil.",
  };
}
