# Query

Solicitud de lectura sin modificar estado.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Query`
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

- CreateQuery
- UpdateQuery
- ArchiveQuery

## Queries iniciales

- GetQuery
- SearchQuery
- ListQuerys

## Events iniciales

- QueryCreated
- QueryUpdated
- QueryArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Query
- Update Query
- Archive Query
- Analyze Query

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
