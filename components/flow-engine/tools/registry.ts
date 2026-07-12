import type { FlowToolDefinition } from "./types";

export const FLOW_TOOL_REGISTRY: FlowToolDefinition[] = [
  {
    id: "navigate",
    label: "Navegar por Flowly",
    description: "Abre un módulo o sección visible del panel.",
    risk: "navigate",
    aliases: ["open", "go", "visit", "navigate.to", "open.module"],
    requiredArguments: ["target"],
  },
  {
    id: "search_customer",
    label: "Buscar cliente",
    description: "Solicita al CRM que busque un cliente por nombre, teléfono o identificador.",
    risk: "read",
    aliases: ["find_customer", "find.client", "search.client", "buscar_cliente"],
    requiredArguments: ["query"],
  },
  {
    id: "create_task",
    label: "Crear tarea",
    description: "Solicita al módulo de tareas la creación de una tarea.",
    risk: "write",
    aliases: ["task.create", "crear_tarea"],
    requiredArguments: ["title"],
  },
  {
    id: "create_invoice",
    label: "Crear factura",
    description: "Abre el flujo de facturación con los datos disponibles.",
    risk: "write",
    aliases: ["invoice.create", "crear_factura"],
  },
  {
    id: "open_whatsapp",
    label: "Abrir WhatsApp",
    description: "Abre WhatsApp o prepara una conversación con un contacto.",
    risk: "navigate",
    aliases: ["whatsapp.open", "open.whatsapp"],
  },
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[\s_-]+/g, ".");
}

export function resolveFlowTool(id: string) {
  const normalized = normalize(id);
  return (
    FLOW_TOOL_REGISTRY.find((tool) => normalize(tool.id) === normalized) ||
    FLOW_TOOL_REGISTRY.find((tool) => tool.aliases.some((alias) => normalize(alias) === normalized)) ||
    null
  );
}
