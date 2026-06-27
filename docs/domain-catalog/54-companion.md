# Companion

Identidad operativa del compañero IA de una Organization.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Companion`
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

- CreateCompanion
- UpdateCompanion
- ArchiveCompanion

## Queries iniciales

- GetCompanion
- SearchCompanion
- ListCompanions

## Events iniciales

- CompanionCreated
- CompanionUpdated
- CompanionArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Companion
- Update Companion
- Archive Companion
- Analyze Companion

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
