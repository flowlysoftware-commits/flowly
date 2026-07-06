export type FlowlyCompanionSkinTone = "flowly" | "cosmic" | "business" | "neon" | "chef" | "expert";

export type FlowlyCompanionSkin = {
  id: string;
  label: string;
  hint: string;
  modelUrl: string;
  tone: FlowlyCompanionSkinTone;
  description: string;
};

export const FLOWLY_COMPANION_SKINS: FlowlyCompanionSkin[] = [
  {
    id: "flowly",
    label: "Flow",
    hint: "Base",
    modelUrl: "/avatars/flowly.glb",
    tone: "flowly",
    description: "Skin principal del Companion.",
  },
  {
    id: "cosmic",
    label: "Cósmico",
    hint: "Místico",
    modelUrl: "/avatars/flowly.glb",
    tone: "cosmic",
    description: "Mismo cuerpo base con aro cósmico y materiales más energéticos.",
  },
  {
    id: "business",
    label: "Business",
    hint: "Formal",
    modelUrl: "/avatars/flowly.glb",
    tone: "business",
    description: "Apariencia formal con detalle tipo corbata.",
  },
  {
    id: "neon",
    label: "Neón",
    hint: "Energía",
    modelUrl: "/avatars/flowly.glb",
    tone: "neon",
    description: "Skin tecnológica con luz neón adicional.",
  },
  {
    id: "expert",
    label: "Experta",
    hint: "Consejera",
    modelUrl: "/avatars/flowly.glb",
    tone: "expert",
    description: "Skin de consejera con detalle visual de gafas.",
  },
  {
    id: "chef",
    label: "Chef Flow",
    hint: "Creativo",
    modelUrl: "/avatars/flowly.glb",
    tone: "chef",
    description: "Skin creativa con gorro de chef, delantal blanco y cuchara de madera.",
  },
];

export function normalizeCompanionSkinId(value?: string | null) {
  const text = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  if (!text) return "flowly";
  if (text.includes("cosmic") || text.includes("cosmico") || text.includes("mistico")) return "cosmic";
  if (text.includes("business") || text.includes("formal") || text.includes("empresa")) return "business";
  if (text.includes("neon") || text.includes("energia")) return "neon";
  if (text.includes("expert") || text.includes("experta") || text.includes("consejera")) return "expert";
  if (text.includes("chef") || text.includes("cocin")) return "chef";
  if (text.includes("flow") || text.includes("base")) return "flowly";

  return FLOWLY_COMPANION_SKINS.some((skin) => skin.id === text) ? text : "flowly";
}

export function getCompanionSkin(id?: string | null) {
  const normalized = normalizeCompanionSkinId(id);
  return FLOWLY_COMPANION_SKINS.find((skin) => skin.id === normalized) || FLOWLY_COMPANION_SKINS[0];
}
