import { buildDeveloperContextBundle, summarizeDeveloperContext } from "@/lib/flowlyDeveloperContextEngine";
import { buildFlowlyProjectGraph, summarizeProjectGraph } from "@/lib/flowlyProjectGraph";
import { buildFlowlyProjectSnapshot, summarizeFlowlyProjectSnapshot, type FlowlyProjectSnapshot } from "@/lib/flowlyProjectReader";

export type FlowlyIntelligenceContext = {
  instruction: string;
  contextSummary: ReturnType<typeof summarizeDeveloperContext> | null;
  projectSummary: ReturnType<typeof summarizeProjectGraph> | null;
  projectSnapshot: FlowlyProjectSnapshot | null;
  projectSnapshotText: string;
  docsContext: string;
  sources: Array<{ path: string; title: string; kind: string; summary?: string }>;
  warnings: string[];
};

function trimText(value: string, limit: number) {
  const clean = value.replace(/\u0000/g, "").trim();
  return clean.length > limit ? `${clean.slice(0, limit)}\n\n[Contexto recortado]` : clean;
}

export async function buildFlowlyIntelligenceContext(instruction: string): Promise<FlowlyIntelligenceContext> {
  const [bundleResult, graphResult, snapshotResult] = await Promise.allSettled([
    buildDeveloperContextBundle(instruction),
    buildFlowlyProjectGraph(instruction),
    buildFlowlyProjectSnapshot(),
  ]);

  const bundle = bundleResult.status === "fulfilled" ? bundleResult.value : null;
  const graph = graphResult.status === "fulfilled" ? graphResult.value : null;
  const snapshot = snapshotResult.status === "fulfilled" ? snapshotResult.value : null;

  const warnings = [
    ...(bundle?.warnings || []),
    ...(bundleResult.status === "rejected" ? [`Context Engine falló: ${bundleResult.reason instanceof Error ? bundleResult.reason.message : String(bundleResult.reason)}`] : []),
    ...(graphResult.status === "rejected" ? [`Project Graph falló: ${graphResult.reason instanceof Error ? graphResult.reason.message : String(graphResult.reason)}`] : []),
    ...(snapshotResult.status === "rejected" ? [`Project Reader falló: ${snapshotResult.reason instanceof Error ? snapshotResult.reason.message : String(snapshotResult.reason)}`] : []),
    ...(snapshot?.warnings || []),
  ];

  return {
    instruction,
    contextSummary: bundle ? summarizeDeveloperContext(bundle) : null,
    projectSummary: graph ? summarizeProjectGraph(graph) : null,
    projectSnapshot: snapshot,
    projectSnapshotText: snapshot ? summarizeFlowlyProjectSnapshot(snapshot) : "",
    docsContext: bundle ? trimText(bundle.contextText, 22000) : "",
    sources: bundle?.loadedSources.slice(0, 16).map((source) => ({
      path: source.path,
      title: source.title,
      kind: source.kind,
      summary: source.summary,
    })) || [],
    warnings,
  };
}
