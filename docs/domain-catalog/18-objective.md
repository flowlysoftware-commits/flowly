# Objective

Objetivo empresarial como Business Object vivo.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Objective`
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

- CreateObjective
- UpdateObjective
- ArchiveObjective

## Queries iniciales

- GetObjective
- SearchObjective
- ListObjectives

## Events iniciales

- ObjectiveCreated
- ObjectiveUpdated
- ObjectiveArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Objective
- Update Objective
- Archive Objective
- Analyze Objective

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
