export type FlowlyCompanionAction = {
  name: string;
  payload: Record<string, unknown>;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAfter(text: string, markers: string[]) {
  for (const marker of markers) {
    const index = text.indexOf(marker);
    if (index >= 0) return text.slice(index + marker.length).trim();
  }
  return "";
}

export function detectFlowlyCompanionActions(message: string): FlowlyCompanionAction[] {
  const text = normalize(message);
  const actions: FlowlyCompanionAction[] = [];

  const navigationTargets: Array<[string, string[]]> = [
    ["crm", ["crm", "clientes", "contactos"]],
    ["agenda", ["agenda", "calendario"]],
    ["whatsapp", ["whatsapp", "wasap", "mensajes"]],
    ["facturacion", ["facturacion", "facturas", "presupuestos"]],
    ["automatizaciones", ["automatizaciones", "flujos"]],
    ["estadisticas", ["estadisticas", "metricas", "analytics"]],
    ["ajustes", ["ajustes", "configuracion"]],
  ];

  if (/\b(abre|abrir|llevame|ve a|ir a|muestrame|entra en)\b/.test(text)) {
    const target = navigationTargets.find(([, aliases]) => aliases.some((alias) => text.includes(alias)));
    if (target) actions.push({ name: "navigate", payload: { target: target[0] } });
  }

  if (/\b(busca|buscar|encuentra|localiza)\b/.test(text) && /\b(cliente|contacto)\b/.test(text)) {
    const query = extractAfter(text, ["cliente", "contacto"]);
    if (query) actions.push({ name: "search_customer", payload: { query } });
  }

  if (/\b(crea|crear|anade|añade)\b/.test(text) && /\b(tarea|recordatorio)\b/.test(text)) {
    const title = extractAfter(text, ["tarea", "recordatorio"]);
    actions.push({ name: "create_task", payload: { title: title || message.trim() } });
  }

  if (/\b(crea|crear|genera|generar)\b/.test(text) && /\b(factura|presupuesto)\b/.test(text)) {
    actions.push({ name: "create_invoice", payload: { request: message.trim() } });
  }

  return actions;
}
