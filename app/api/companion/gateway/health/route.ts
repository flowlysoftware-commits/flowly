import { companionJson, companionOptions } from "@/lib/flowlyCompanionCors";
import { FLOW_COMPANION_GATEWAY_VERSION } from "@/lib/flowlyCompanionGateway";

export const runtime = "nodejs";

export async function OPTIONS() {
  return companionOptions();
}

export async function GET() {
  return companionJson({
    ok: true,
    service: "flow-companion-gateway",
    version: FLOW_COMPANION_GATEWAY_VERSION,
    transport: "http",
    vercelSafe: true,
    generatedAt: new Date().toISOString(),
  });
}
