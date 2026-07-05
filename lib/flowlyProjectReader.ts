import { listRepositoryTree, readRepositoryFile, type GitHubTreeItem } from "@/lib/flowlyGitHubExecutor";

export type FlowlyProjectSnapshot = {
  generatedAt: string;
  framework: {
    name: string;
    router: "app-router" | "pages-router" | "unknown";
    language: string;
    styling: string[];
    runtime: string[];
  };
  packageInfo: {
    name?: string;
    next?: string;
    react?: string;
    typescript?: string;
  };
  counts: {
    totalFiles: number;
    appRoutes: number;
    apiRoutes: number;
    components: number;
    libraries: number;
    docs: number;
  };
  existingPaths: string[];
  keyPaths: {
    packageJson?: string;
    appLayout?: string;
    homePage?: string;
    robots?: string;
    sitemap?: string;
    manifest?: string;
    openGraphImage?: string;
    twitterImage?: string;
    icon?: string;
    favicon?: string;
    nextConfig?: string;
    middleware?: string;
  };
  publicRoutes: string[];
  privateRoutes: string[];
  apiRoutes: string[];
  seoRelevantPaths: string[];
  notes: string[];
  warnings: string[];
};

const SEO_PATH_PATTERNS = [
  /^app\/layout\.(tsx|ts|jsx|js)$/i,
  /^app\/page\.(tsx|ts|jsx|js)$/i,
  /^app\/robots\.(ts|js)$/i,
  /^app\/sitemap\.(ts|js)$/i,
  /^app\/manifest\.(ts|js)$/i,
  /^app\/opengraph-image\.(tsx|ts|jsx|js)$/i,
  /^app\/twitter-image\.(tsx|ts|jsx|js)$/i,
  /^app\/icon\.(png|jpg|jpeg|svg|ico)$/i,
  /^app\/favicon\.(ico|png|svg)$/i,
  /^public\/favicon/i,
  /^public\/apple-touch-icon/i,
  /^public\/site\.webmanifest$/i,
];

const PUBLIC_ROUTE_BLOCKLIST = [
  "/dashboard",
  "/developer",
  "/flow-studio",
  "/paneladmin",
  "/contabilidad",
  "/api",
];

function normalizePath(value: string) {
  return value.replace(/\\/g, "/").replace(/^\/+/, "");
}

function firstExisting(paths: Set<string>, candidates: string[]) {
  return candidates.find((path) => paths.has(path));
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function versionFromPackage(pkg: Record<string, unknown> | null, name: string) {
  const deps = typeof pkg?.dependencies === "object" && pkg.dependencies ? pkg.dependencies as Record<string, unknown> : {};
  const devDeps = typeof pkg?.devDependencies === "object" && pkg.devDependencies ? pkg.devDependencies as Record<string, unknown> : {};
  const value = deps[name] ?? devDeps[name];
  return typeof value === "string" ? value : undefined;
}

function routeFromAppPage(path: string) {
  const clean = normalizePath(path);
  if (!/^app\/.*\/page\.(tsx|ts|jsx|js)$/i.test(clean) && !/^app\/page\.(tsx|ts|jsx|js)$/i.test(clean)) return null;
  const withoutPrefix = clean.replace(/^app\//, "").replace(/\/?page\.(tsx|ts|jsx|js)$/i, "");
  if (!withoutPrefix) return "/";
  const route = `/${withoutPrefix}`
    .replace(/\/\([^/]+\)/g, "")
    .replace(/\/\[[^/]+\]/g, "/:param")
    .replace(/\/+/g, "/");
  return route === "" ? "/" : route;
}

function apiRouteFromPath(path: string) {
  const clean = normalizePath(path);
  if (!/^app\/api\/.*\/route\.(tsx|ts|jsx|js)$/i.test(clean)) return null;
  return `/${clean.replace(/^app\//, "").replace(/\/route\.(tsx|ts|jsx|js)$/i, "")}`;
}

function classifyPublicRoute(route: string) {
  if (route === "/") return true;
  return !PUBLIC_ROUTE_BLOCKLIST.some((blocked) => route === blocked || route.startsWith(`${blocked}/`));
}

function buildPathSummary(paths: string[]) {
  const set = new Set(paths);
  return {
    packageJson: firstExisting(set, ["package.json"]),
    appLayout: firstExisting(set, ["app/layout.tsx", "app/layout.ts", "src/app/layout.tsx"]),
    homePage: firstExisting(set, ["app/page.tsx", "app/page.ts", "src/app/page.tsx"]),
    robots: firstExisting(set, ["app/robots.ts", "app/robots.js", "public/robots.txt"]),
    sitemap: firstExisting(set, ["app/sitemap.ts", "app/sitemap.js", "public/sitemap.xml"]),
    manifest: firstExisting(set, ["app/manifest.ts", "app/manifest.js", "public/site.webmanifest", "public/manifest.webmanifest"]),
    openGraphImage: firstExisting(set, ["app/opengraph-image.tsx", "app/opengraph-image.ts", "public/og-image.png", "public/opengraph-image.png"]),
    twitterImage: firstExisting(set, ["app/twitter-image.tsx", "app/twitter-image.ts", "public/twitter-image.png"]),
    icon: firstExisting(set, ["app/icon.png", "app/icon.svg", "public/icon.png"]),
    favicon: firstExisting(set, ["app/favicon.ico", "public/favicon.ico", "public/favicon-32x32.png"]),
    nextConfig: firstExisting(set, ["next.config.ts", "next.config.js", "next.config.mjs"]),
    middleware: firstExisting(set, ["middleware.ts", "middleware.js", "src/middleware.ts"]),
  };
}

export function summarizeFlowlyProjectSnapshot(snapshot: FlowlyProjectSnapshot) {
  return [
    "PROJECT SNAPSHOT VERIFICADO",
    `- Framework: ${snapshot.framework.name} (${snapshot.framework.router})`,
    `- Lenguaje: ${snapshot.framework.language}`,
    `- Styling: ${snapshot.framework.styling.join(", ") || "No detectado"}`,
    `- Paquete: ${snapshot.packageInfo.name || "desconocido"}`,
    `- Next: ${snapshot.packageInfo.next || "desconocido"} · React: ${snapshot.packageInfo.react || "desconocido"} · TypeScript: ${snapshot.packageInfo.typescript || "desconocido"}`,
    `- Archivos reales: ${snapshot.counts.totalFiles}`,
    `- Rutas App: ${snapshot.counts.appRoutes}`,
    `- APIs: ${snapshot.counts.apiRoutes}`,
    `- Componentes: ${snapshot.counts.components}`,
    "",
    "RUTAS/ARCHIVOS CLAVE REALES",
    `- Layout global: ${snapshot.keyPaths.appLayout || "NO encontrado"}`,
    `- Home: ${snapshot.keyPaths.homePage || "NO encontrado"}`,
    `- Robots: ${snapshot.keyPaths.robots || "NO encontrado"}`,
    `- Sitemap: ${snapshot.keyPaths.sitemap || "NO encontrado"}`,
    `- Manifest: ${snapshot.keyPaths.manifest || "NO encontrado"}`,
    `- Open Graph image: ${snapshot.keyPaths.openGraphImage || "NO encontrado"}`,
    `- Twitter image: ${snapshot.keyPaths.twitterImage || "NO encontrado"}`,
    `- Icon: ${snapshot.keyPaths.icon || "NO encontrado"}`,
    `- Favicon: ${snapshot.keyPaths.favicon || "NO encontrado"}`,
    "",
    "ARCHIVOS SEO REALES",
    ...(snapshot.seoRelevantPaths.length ? snapshot.seoRelevantPaths.map((path) => `- ${path}`) : ["- No hay archivos SEO específicos detectados todavía."]),
    "",
    "REGLA DE GROUNDING",
    "- Este proyecto NO usa index.html, about.html, blog.html ni header.php como entrada principal.",
    "- Si vas a hablar de SEO/metadata en Flowly, debes mencionar rutas reales del App Router como app/layout.tsx, app/page.tsx, app/sitemap.ts, app/robots.ts o app/manifest.ts cuando existan.",
  ].join("\n");
}

export async function buildFlowlyProjectSnapshot(): Promise<FlowlyProjectSnapshot> {
  const tree = await listRepositoryTree();
  const files = (tree.items || [])
    .filter((item: GitHubTreeItem) => item.type === "blob")
    .map((item) => normalizePath(item.path))
    .sort((a, b) => a.localeCompare(b));

  const pathSet = new Set(files);
  const keyPaths = buildPathSummary(files);

  let pkg: Record<string, unknown> | null = null;
  if (keyPaths.packageJson) {
    try {
      pkg = safeJsonParse((await readRepositoryFile(keyPaths.packageJson)).content);
    } catch {
      pkg = null;
    }
  }

  const appPageRoutes = files.map(routeFromAppPage).filter((route): route is string => Boolean(route));
  const apiRoutes = files.map(apiRouteFromPath).filter((route): route is string => Boolean(route));
  const publicRoutes = appPageRoutes.filter(classifyPublicRoute).sort();
  const privateRoutes = appPageRoutes.filter((route) => !classifyPublicRoute(route)).sort();

  const hasAppRouter = files.some((path) => /^app\/.*(page|layout|route)\.(tsx|ts|jsx|js)$/i.test(path));
  const hasPagesRouter = files.some((path) => /^pages\/.*\.(tsx|ts|jsx|js)$/i.test(path));
  const styling = [
    pathSet.has("tailwind.config.ts") || pathSet.has("tailwind.config.js") ? "Tailwind CSS" : "",
    files.some((path) => path.endsWith(".css")) ? "CSS global/componentes" : "",
  ].filter(Boolean);

  const seoRelevantPaths = files.filter((path) => SEO_PATH_PATTERNS.some((pattern) => pattern.test(path))).sort();

  const warnings: string[] = [];
  if (!keyPaths.appLayout) warnings.push("No se ha encontrado app/layout.tsx o equivalente.");
  if (!keyPaths.homePage) warnings.push("No se ha encontrado app/page.tsx o equivalente.");
  if (!keyPaths.robots) warnings.push("No se ha encontrado robots.ts ni public/robots.txt.");
  if (!keyPaths.sitemap) warnings.push("No se ha encontrado sitemap.ts ni public/sitemap.xml.");
  if (!keyPaths.manifest) warnings.push("No se ha encontrado manifest.ts ni webmanifest público.");

  return {
    generatedAt: new Date().toISOString(),
    framework: {
      name: "Next.js",
      router: hasAppRouter ? "app-router" : hasPagesRouter ? "pages-router" : "unknown",
      language: files.some((path) => path.endsWith(".ts") || path.endsWith(".tsx")) ? "TypeScript" : "JavaScript",
      styling,
      runtime: ["React", "Supabase", "Stripe", "OpenAI"].filter((name) => {
        const key = name.toLowerCase() === "openai" ? "openai" : name.toLowerCase();
        return Boolean(versionFromPackage(pkg, key)) || (name === "OpenAI" && files.some((path) => path.toLowerCase().includes("openai")));
      }),
    },
    packageInfo: {
      name: typeof pkg?.name === "string" ? pkg.name : undefined,
      next: versionFromPackage(pkg, "next"),
      react: versionFromPackage(pkg, "react"),
      typescript: versionFromPackage(pkg, "typescript"),
    },
    counts: {
      totalFiles: files.length,
      appRoutes: appPageRoutes.length,
      apiRoutes: apiRoutes.length,
      components: files.filter((path) => path.startsWith("components/") && /\.(tsx|ts|jsx|js)$/i.test(path)).length,
      libraries: files.filter((path) => path.startsWith("lib/") && /\.(tsx|ts|jsx|js)$/i.test(path)).length,
      docs: files.filter((path) => path.startsWith("docs/")).length,
    },
    existingPaths: files,
    keyPaths,
    publicRoutes,
    privateRoutes,
    apiRoutes,
    seoRelevantPaths,
    notes: [
      "Flowly usa Next.js App Router; la metadata global se suele centralizar en app/layout.tsx.",
      "robots, sitemap y manifest deben implementarse como archivos del App Router si no existen.",
      "Las landings públicas deben optimizarse sin tocar paneles privados ni APIs internas.",
    ],
    warnings,
  };
}
