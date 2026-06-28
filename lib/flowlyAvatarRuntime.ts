export type FlowlyAvatarProvider = "local" | "supabase" | "external";

export type FlowlyAvatarAnimation = {
  id: string;
  label: string;
  mode: "idle" | "walk" | "wave" | "talk" | "point" | "thinking" | "tour" | "sit";
  description: string;
};

export type FlowlyAvatarProfile = {
  id: string;
  name: string;
  description: string;
  provider: FlowlyAvatarProvider;
  modelUrl: string;
  thumbnailUrl?: string;
  active: boolean;
  version: string;
  fileSizeMb?: number;
  supportsNativeAnimations: boolean;
  supportsProceduralAnimations: boolean;
  animations: FlowlyAvatarAnimation[];
  notes: string[];
};

export const flowlyAvatarAnimations: FlowlyAvatarAnimation[] = [
  { id: "idle", label: "Respirar / esperar", mode: "idle", description: "Movimiento suave para que el avatar no parezca una imagen estática." },
  { id: "walk", label: "Caminar", mode: "walk", description: "Pequeño ciclo de movimiento para dar sensación de vida." },
  { id: "wave", label: "Saludar", mode: "wave", description: "Saludo al entrar en un módulo o al abrir el chat." },
  { id: "talk", label: "Hablar", mode: "talk", description: "Gestos y movimiento mientras el Companion responde." },
  { id: "point", label: "Señalar", mode: "point", description: "Apunta hacia recomendaciones, tarjetas o avisos importantes." },
  { id: "thinking", label: "Pensar", mode: "thinking", description: "Pose tranquila mientras analiza contexto o prepara una respuesta." },
  { id: "sit", label: "Descansar", mode: "sit", description: "Estado de descanso cuando no hay actividad." },
];

export const defaultFlowlyAvatarProfile: FlowlyAvatarProfile = {
  id: "flowly-default-3d",
  name: "Flowly 3D",
  description: "Avatar oficial optimizado para el Companion global de Flowly.",
  provider: "local",
  modelUrl: "/avatars/flowly.glb",
  thumbnailUrl: "/avatars/flowly-preview.png",
  active: true,
  version: "1.0.0",
  fileSizeMb: 5,
  supportsNativeAnimations: false,
  supportsProceduralAnimations: true,
  animations: flowlyAvatarAnimations,
  notes: [
    "El modelo optimizado debe colocarse en public/avatars/flowly.glb.",
    "Si el archivo no existe, el visor 3D mostrará el fallback del runtime.",
    "Las animaciones procedurales se aplican desde FlowlyAssistant3D sin duplicar el modelo.",
  ],
};

export function normalizeAvatarUrl(value?: string | null) {
  const clean = String(value || "").trim();
  if (!clean) return defaultFlowlyAvatarProfile.modelUrl;
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/")) return clean;
  return `/${clean.replace(/^\/+/, "")}`;
}

export function buildAvatarProfile(input?: Partial<FlowlyAvatarProfile> | null): FlowlyAvatarProfile {
  return {
    ...defaultFlowlyAvatarProfile,
    ...(input || {}),
    modelUrl: normalizeAvatarUrl(input?.modelUrl || input?.modelUrl),
    animations: input?.animations?.length ? input.animations : defaultFlowlyAvatarProfile.animations,
  };
}
