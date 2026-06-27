import { NextRequest, NextResponse } from "next/server";
import { analyzeFlowlyImpact, buildFlowlyProjectGraph, summarizeProjectGraph } from "@/lib/flowlyProjectGraph";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const instruction = String(body.instruction || "").trim();
    const graph = await buildFlowlyProjectGraph(instruction || undefined);
    const impact = instruction ? await analyzeFlowlyImpact(instruction) : null;
    const summary = summarizeProjectGraph(graph);

    try {
      await supabaseAdmin.from("flowly_project_graph_snapshots").insert({
        instruction: instruction || null,
        total_files: graph.totalFiles,
        analyzed_files: graph.analyzedFiles,
        modules: summary.modules,
        routes: summary.routes,
        api_routes: summary.apiRoutes,
        components: summary.components,
        libraries: summary.libraries,
        sql_files: summary.sqlFiles,
        docs: summary.docs,
        tables: summary.tables,
        edges: summary.edges,
        snapshot: { summary, impact, graphPreview: { nodes: graph.nodes.slice(0, 80), edges: graph.edges.slice(0, 120) } },
      });
    } catch {
      // El análisis debe funcionar aunque la tabla de logs no exista todavía.
    }

    return NextResponse.json({ ok: true, summary, impact, graph });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
