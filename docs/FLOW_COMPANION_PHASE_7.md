# Flow Companion — Fase 7

## Integración real con Flowly

Esta fase añade una capa profesional de herramientas entre Flow Brain y los módulos del panel.

### Arquitectura

- `tools/registry.ts`: catálogo central de capacidades disponibles.
- `tools/executor.ts`: validación y ejecución desacoplada.
- `tools/types.ts`: contratos tipados para llamadas y resultados.
- `FlowPanelIntegrationLayer`: expone navegación, contexto y capacidades vivas del panel.
- `flowlyCompanionActions.ts`: convierte órdenes claras del usuario en acciones estructuradas.

### Capacidades iniciales

- Navegar a módulos.
- Buscar clientes.
- Crear tareas.
- Preparar facturas.
- Abrir WhatsApp.

Las acciones de escritura no modifican datos a ciegas: se delegan al módulo correspondiente mediante eventos `flow:tool-request` y `flow:tool:<id>`, dejando preparado el sistema para confirmación, permisos y auditoría.
