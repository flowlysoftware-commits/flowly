# Data Requests

Exportación, borrado y solicitudes RGPD.

## Propósito

Este capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.

## Decisión principal

Flowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.

## Reglas de implementación

- No duplicar lógica existente.
- No acceder directamente a infraestructura desde dominio o Apps.
- Mantener trazabilidad mediante Operation ID, Events y Observability.
- Respetar Identity, Authorization y Governance en toda acción relevante.
- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.

## Artefactos relacionados

- Business Objects implicados.
- Capabilities requeridas.
- Policies aplicables.
- Events generados.
- Tests obligatorios.

## Estado

READY
