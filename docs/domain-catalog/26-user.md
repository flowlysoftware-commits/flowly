# User

Identidad humana autenticada dentro de Flowly.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `User`
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

- CreateUser
- UpdateUser
- ArchiveUser

## Queries iniciales

- GetUser
- SearchUser
- ListUsers

## Events iniciales

- UserCreated
- UserUpdated
- UserArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create User
- Update User
- Archive User
- Analyze User

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
