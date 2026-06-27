# SLA

Acuerdo de nivel de servicio medible.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `SLA`
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

- CreateSLA
- UpdateSLA
- ArchiveSLA

## Queries iniciales

- GetSLA
- SearchSLA
- ListSLAs

## Events iniciales

- SLACreated
- SLAUpdated
- SLAArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create SLA
- Update SLA
- Archive SLA
- Analyze SLA

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
