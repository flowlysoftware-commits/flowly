export type FlowChatCommand =
  | { type: "walk"; direction: "left" | "right" | "auto" }
  | { type: "wave" }
  | { type: "turn" }
  | { type: "idle" }
  | { type: "think" }
  | { type: "listen" };

function normalizeCommandText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[¡!¿?.,;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectFlowChatCommand(rawText: string): FlowChatCommand | null {
  const text = normalizeCommandText(rawText);
  if (!text) return null;

  const asksToWalk = /\b(camina|caminar|anda|andar|pasea|pasear|da un paseo|muevete caminando)\b/.test(text);
  if (asksToWalk) {
    if (/\b(izquierda|hacia la izquierda)\b/.test(text)) return { type: "walk", direction: "left" };
    if (/\b(derecha|hacia la derecha)\b/.test(text)) return { type: "walk", direction: "right" };
    return { type: "walk", direction: "auto" };
  }

  if (/\b(saluda|saludar|saludame|di hola|haz un saludo)\b/.test(text)) {
    return { type: "wave" };
  }

  if (/\b(gira|girar|date la vuelta|da una vuelta|haz un giro)\b/.test(text)) {
    return { type: "turn" };
  }

  if (/\b(quieto|quedate quieto|para|detente|reposo|descansa aqui)\b/.test(text)) {
    return { type: "idle" };
  }

  if (/\b(piensa|pensar|haz como que piensas)\b/.test(text)) {
    return { type: "think" };
  }

  if (/\b(escucha|escuchame|ponte a escuchar)\b/.test(text)) {
    return { type: "listen" };
  }

  return null;
}
