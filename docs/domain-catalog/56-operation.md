# Operation

Ejecución completa trazada por Operation ID.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Operation`
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

- CreateOperation
- UpdateOperation
- ArchiveOperation

## Queries iniciales

- GetOperation
- SearchOperation
- ListOperations

## Events iniciales

- OperationCreated
- OperationUpdated
- OperationArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Operation
- Update Operation
- Archive Operation
- Analyze Operation

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
