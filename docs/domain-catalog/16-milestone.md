# Milestone

Hito verificable dentro de un proyecto o plan.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Milestone`
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

- CreateMilestone
- UpdateMilestone
- ArchiveMilestone

## Queries iniciales

- GetMilestone
- SearchMilestone
- ListMilestones

## Events iniciales

- MilestoneCreated
- MilestoneUpdated
- MilestoneArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Milestone
- Update Milestone
- Archive Milestone
- Analyze Milestone

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
