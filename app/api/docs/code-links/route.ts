export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SEARCH_DIRS = ["app", "components", "lib", "supabase", "types", "docs"];

function walk(dir: string, all: string[] = []) {
  if (!fs.existsSync(dir)) return all;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, all);
    else if (/\.(ts|tsx|md|sql|json)$/.test(entry.name)) all.push(full);
  }
  return all;
}

export async function GET(request: NextRequest) {
  const target = (request.nextUrl.searchParams.get("target") || "").toLowerCase().trim();
  if (!target) return NextResponse.json({ links: [] });
  const files = SEARCH_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)));
  const links = files
    .map((file) => {
      const relativePath = path.relative(ROOT, file).replace(/\\/g, "/");
      const content = fs.readFileSync(file, "utf8").toLowerCase();
      const fileScore = relativePath.toLowerCase().includes(target) ? 5 : 0;
      const contentScore = content.includes(target) ? 2 : 0;
      return { path: relativePath, score: fileScore + contentScore };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
    .slice(0, 30);
  return NextResponse.json({ target, links });
}
