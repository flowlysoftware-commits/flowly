# Business Unit

Unidad de negocio con objetivos y métricas propias.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `BusinessUnit`
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

- CreateBusinessUnit
- UpdateBusinessUnit
- ArchiveBusinessUnit

## Queries iniciales

- GetBusinessUnit
- SearchBusinessUnit
- ListBusinessUnits

## Events iniciales

- BusinessUnitCreated
- BusinessUnitUpdated
- BusinessUnitArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Business Unit
- Update Business Unit
- Archive Business Unit
- Analyze Business Unit

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
