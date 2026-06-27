# Event

Hecho ocurrido dentro del sistema.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Event`
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

- CreateEvent
- UpdateEvent
- ArchiveEvent

## Queries iniciales

- GetEvent
- SearchEvent
- ListEvents

## Events iniciales

- EventCreated
- EventUpdated
- EventArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Event
- Update Event
- Archive Event
- Analyze Event

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
