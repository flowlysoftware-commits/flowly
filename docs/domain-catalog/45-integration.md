# Integration

Conexión autorizada con un proveedor externo.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Integration`
- Organization scoped: Sí
- Versionado: Sí
- Timeline: Sí

## Estados iniciales

```text
Draft
↓
Active
↓
Archived
```

## Relaciones habituales

- Organization
- Identity
- Event
- Document
- Collaboration

## Commands iniciales

- CreateIntegration
- UpdateIntegration
- ArchiveIntegration

## Queries iniciales

- GetIntegration
- SearchIntegration
- ListIntegrations

## Events iniciales

- IntegrationCreated
- IntegrationUpdated
- IntegrationArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Integration
- Update Integration
- Archive Integration
- Analyze Integration

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
