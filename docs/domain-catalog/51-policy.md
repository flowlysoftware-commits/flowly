# Policy

Regla de gobierno versionada y auditable.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Policy`
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

- CreatePolicy
- UpdatePolicy
- ArchivePolicy

## Queries iniciales

- GetPolicy
- SearchPolicy
- ListPolicys

## Events iniciales

- PolicyCreated
- PolicyUpdated
- PolicyArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Policy
- Update Policy
- Archive Policy
- Analyze Policy

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
