# Deliverable

Resultado entregable asociado a proyecto, cliente u objetivo.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Deliverable`
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

- CreateDeliverable
- UpdateDeliverable
- ArchiveDeliverable

## Queries iniciales

- GetDeliverable
- SearchDeliverable
- ListDeliverables

## Events iniciales

- DeliverableCreated
- DeliverableUpdated
- DeliverableArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Deliverable
- Update Deliverable
- Archive Deliverable
- Analyze Deliverable

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
