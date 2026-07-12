import type { FlowLogger } from "../core/logger";
import { resolveFlowTool } from "./registry";
import type { FlowToolCall, FlowToolExecutionContext, FlowToolResult } from "./types";

function firstString(args: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = args[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export class FlowToolExecutor {
  constructor(private readonly logger?: FlowLogger) {}

  async execute(call: FlowToolCall, context: FlowToolExecutionContext): Promise<FlowToolResult> {
    const definition = resolveFlowTool(call.id);
    if (!definition) {
      return { ok: false, toolId: call.id, message: `No conozco la herramienta ${call.id}.` };
    }

    const args = call.arguments || {};
    const missing = (definition.requiredArguments || []).filter((key) => {
      const value = args[key];
      return value === undefined || value === null || value === "";
    });
    if (missing.length) {
      return {
        ok: false,
        toolId: definition.id,
        message: `Faltan datos para ${definition.label}: ${missing.join(", ")}.`,
      };
    }

    try {
      if (definition.id === "navigate") {
        const target = firstString(args, ["target", "module", "destination", "route"]);
        if (!target || !context.panel?.navigate) {
          return { ok: false, toolId: definition.id, message: "No puedo navegar desde esta pantalla." };
        }
        const result = await context.panel.navigate(target);
        return { ok: true, toolId: definition.id, message: `He abierto ${target}.`, data: result };
      }

      if (definition.id === "open_whatsapp") {
        if (context.panel?.navigate) await context.panel.navigate("whatsapp");
      }

      const detail = {
        call: { ...call, id: definition.id },
        definition,
        pathname: context.pathname,
      };
      window.dispatchEvent(new CustomEvent("flow:tool-request", { detail }));
      window.dispatchEvent(new CustomEvent(`flow:tool:${definition.id}`, { detail }));

      return {
        ok: true,
        toolId: definition.id,
        message:
          definition.risk === "write"
            ? `${definition.label} preparado para que el módulo lo complete.`
            : `${definition.label} solicitado.`,
        data: detail,
        requiresConfirmation: definition.risk === "write",
      };
    } catch (error) {
      this.logger?.error(`Tool ${definition.id} failed.`, error);
      return {
        ok: false,
        toolId: definition.id,
        message: error instanceof Error ? error.message : `No se pudo ejecutar ${definition.label}.`,
      };
    }
  }
}
