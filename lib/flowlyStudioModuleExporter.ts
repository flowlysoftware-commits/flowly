import { slugifyStudio, toPascalCase, toSnakeCase } from "@/lib/flowlyStudio";
import type { FlowlyModuleGeneration } from "@/lib/flowlyStudioHeart";

type ZipFile = {
  path: string;
  content: string;
};

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUInt16LE(value: number) {
  const output = Buffer.alloc(2);
  output.writeUInt16LE(value, 0);
  return output;
}

function writeUInt32LE(value: number) {
  const output = Buffer.alloc(4);
  output.writeUInt32LE(value >>> 0, 0);
  return output;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosTime, dosDate };
}

export function createZipArchive(files: ZipFile[]) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  const { dosTime, dosDate } = dosDateTime();

  for (const file of files) {
    const name = Buffer.from(file.path.replace(/^\/+/, ""), "utf8");
    const data = Buffer.from(file.content, "utf8");
    const checksum = crc32(data);

    const localHeader = Buffer.concat([
      writeUInt32LE(0x04034b50),
      writeUInt16LE(20),
      writeUInt16LE(0),
      writeUInt16LE(0),
      writeUInt16LE(dosTime),
      writeUInt16LE(dosDate),
      writeUInt32LE(checksum),
      writeUInt32LE(data.length),
      writeUInt32LE(data.length),
      writeUInt16LE(name.length),
      writeUInt16LE(0),
      name,
    ]);
    localParts.push(localHeader, data);

    const centralHeader = Buffer.concat([
      writeUInt32LE(0x02014b50),
      writeUInt16LE(20),
      writeUInt16LE(20),
      writeUInt16LE(0),
      writeUInt16LE(0),
      writeUInt16LE(dosTime),
      writeUInt16LE(dosDate),
      writeUInt32LE(checksum),
      writeUInt32LE(data.length),
      writeUInt32LE(data.length),
      writeUInt16LE(name.length),
      writeUInt16LE(0),
      writeUInt16LE(0),
      writeUInt16LE(0),
      writeUInt16LE(0),
      writeUInt32LE(0),
      writeUInt32LE(offset),
      name,
    ]);
    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const endOfCentralDirectory = Buffer.concat([
    writeUInt32LE(0x06054b50),
    writeUInt16LE(0),
    writeUInt16LE(0),
    writeUInt16LE(files.length),
    writeUInt16LE(files.length),
    writeUInt32LE(centralDirectory.length),
    writeUInt32LE(offset),
    writeUInt16LE(0),
  ]);

  return Buffer.concat([...localParts, centralDirectory, endOfCentralDirectory]);
}

function safeJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function appPage(moduleName: string, slug: string) {
  const title = moduleName.replace(/`/g, "");
  return `import Link from "next/link";\nimport { ${toPascalCase(moduleName)}Module } from "@/lib/generated/${slug}";\n\nexport default function ${toPascalCase(moduleName)}GeneratedPage() {\n  return (\n    <main className="min-h-screen bg-[#080611] px-5 py-8 text-white lg:px-8">\n      <section className="mx-auto max-w-6xl">\n        <Link href="/dashboard" className="text-sm text-white/55 hover:text-white">← Volver al panel</Link>\n        <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-8">\n          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">Módulo generado por Flowly Studio</p>\n          <h1 className="mt-4 text-4xl font-semibold">${title}</h1>\n          <p className="mt-4 max-w-3xl text-white/60">Este módulo ha sido generado desde Flowly Studio. Revisa sus artefactos, aplica la migración Supabase y conecta sus capacidades al runtime antes de usarlo en producción.</p>\n        </div>\n        <div className="mt-6 grid gap-4 md:grid-cols-2">\n          {${toPascalCase(moduleName)}Module.artifacts.map((artifact) => (\n            <article key={artifact.slug} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">\n              <p className="text-xs uppercase tracking-[0.2em] text-white/35">{artifact.kind}</p>\n              <h2 className="mt-2 text-xl font-semibold">{artifact.name}</h2>\n              <p className="mt-2 text-sm text-white/45">Dominio: {artifact.domain}</p>\n            </article>\n          ))}\n        </div>\n      </section>\n    </main>\n  );\n}\n`;
}

function apiRoute(moduleName: string, slug: string) {
  return `import { NextResponse } from "next/server";\nimport { ${toPascalCase(moduleName)}Module } from "@/lib/generated/${slug}";\n\nexport async function GET() {\n  return NextResponse.json({ module: ${toPascalCase(moduleName)}Module });\n}\n`;
}

function menuSnippet(moduleName: string, slug: string) {
  return `// Añadir este enlace al menú del dashboard cuando quieras activar el módulo:\n// { label: "${moduleName}", href: "/generated/${slug}", icon: "Package" }\n`;
}

function installReadme(moduleName: string, slug: string) {
  return `# ${moduleName}\n\nPaquete generado por Flowly Studio.\n\n## Cómo instalarlo\n\n1. Copia las carpetas del ZIP encima de tu proyecto Flowly.\n2. Ejecuta la migración SQL ubicada en:\n\n\`supabase/migrations/${slug}.sql\`\n\n3. Abre la ruta generada:\n\n\`/generated/${slug}\`\n\n4. Revisa el archivo de menú:\n\n\`app/dashboard/generated-menu-snippet-${slug}.ts\`\n\n5. Antes de producción, conecta las acciones al Capability Runtime real y revisa las políticas.\n\n## Importante\n\nEste ZIP genera código instalable y revisable. Flowly Studio no sobrescribe automáticamente tu proyecto en producción para evitar cambios peligrosos sin revisión.\n`;
}

export function buildModuleFiles(generation: FlowlyModuleGeneration): ZipFile[] {
  const slug = slugifyStudio(generation.slug || generation.moduleName);
  const pascal = toPascalCase(generation.moduleName);
  return [
    { path: `README-${slug}.md`, content: installReadme(generation.moduleName, slug) },
    { path: `supabase/migrations/${slug}.sql`, content: generation.migrationSql },
    { path: `lib/generated/${slug}.ts`, content: generation.typeScriptIndex },
    { path: `app/generated/${slug}/page.tsx`, content: appPage(generation.moduleName, slug) },
    { path: `app/api/generated/${slug}/route.ts`, content: apiRoute(generation.moduleName, slug) },
    { path: `app/dashboard/generated-menu-snippet-${slug}.ts`, content: menuSnippet(generation.moduleName, slug) },
    { path: `docs/generated/${slug}.md`, content: generation.docsIndex },
    { path: `tests/generated/${slug}.test-plan.md`, content: generation.testPlan },
    { path: `sdk/generated/${slug}.ts`, content: generation.sdkIndex },
    { path: `studio-exports/${slug}/module.json`, content: safeJson(generation) },
    { path: `studio-exports/${slug}/api-manifest.json`, content: generation.apiManifest },
    { path: `studio-exports/${slug}/impact-report.md`, content: generation.impactReport },
    { path: `studio-exports/${slug}/module-index.ts`, content: `export { ${pascal}Module } from "../../lib/generated/${slug}";\n` },
  ];
}

export function buildModuleZip(generation: FlowlyModuleGeneration) {
  return createZipArchive(buildModuleFiles(generation));
}

export function reviewModuleGeneration(generation: FlowlyModuleGeneration) {
  const warnings: string[] = [];
  const blockers: string[] = [];
  const actions: string[] = [];
  const hasBusinessObject = generation.artifacts.some((artifact) => artifact.kind === "business_object");
  const hasCapability = generation.artifacts.some((artifact) => artifact.kind === "capability");
  const hasPolicy = generation.artifacts.some((artifact) => artifact.kind === "policy");
  const hasWorkflow = generation.artifacts.some((artifact) => artifact.kind === "workflow");

  if (!hasBusinessObject) blockers.push("El módulo no incluye ningún Business Object. Añade al menos uno antes de instalarlo.");
  if (!hasCapability) warnings.push("El módulo no incluye Capabilities. Funcionará como estructura, pero no como capacidad reutilizable.");
  if (!hasPolicy) warnings.push("El módulo no incluye Policies. Revisa permisos y gobernanza antes de producción.");
  if (!hasWorkflow) warnings.push("El módulo no incluye Workflows. Puedes añadirlos después si hay procesos repetibles.");
  if (generation.migrationSql.includes("using (true)")) warnings.push("La migración contiene políticas RLS abiertas de desarrollo. Sustitúyelas por reglas reales antes de producción.");

  actions.push("Revisar la migración SQL antes de ejecutarla en Supabase.");
  actions.push("Copiar el snippet de menú solo cuando el módulo esté validado.");
  actions.push("Conectar las Capabilities al Runtime real antes de permitir uso en producción.");

  return {
    approved: blockers.length === 0,
    blockers,
    warnings,
    actions,
    score: Math.max(0, 100 - blockers.length * 35 - warnings.length * 8),
  };
}
