export type FlowlyRuntimeMode = "cliente" | "arquitecto";

export const ARCHITECT_ROUTES = [
  "/os",
  "/asistente",
  "/crear",
  "/studio",
  "/kernel",
  "/docs/studio",
] as const;

export function getFlowlyRuntimeMode(pathname: string): FlowlyRuntimeMode {
  const path = pathname.toLowerCase();
  return ARCHITECT_ROUTES.some((route) => path === route || path.startsWith(`${route}/`)) ? "arquitecto" : "cliente";
}

export function isArchitectRoute(pathname: string) {
  return getFlowlyRuntimeMode(pathname) === "arquitecto";
}

export const customerCompanionBoundaries = {
  allowed: [
    "Explicar el panel del cliente",
    "Crear tareas y recordatorios",
    "Sugerir acciones comerciales",
    "Ayudar con CRM, facturación, marketing, agenda, documentos y WhatsApp",
    "Proponer objetivos, misiones y recompensas motivacionales",
  ],
  forbidden: [
    "Crear o modificar módulos",
    "Abrir Studio, Builder, Kernel o Generator",
    "Cambiar código, SQL, APIs o componentes internos",
    "Mostrar lenguaje técnico de arquitectura al cliente",
  ],
};

export const architectCompanionBoundaries = {
  allowed: [
    "Analizar módulos existentes",
    "Crear blueprints",
    "Abrir Studio y Builder",
    "Generar planes técnicos",
    "Preparar cambios de código, SQL, Docs y pruebas",
  ],
};
