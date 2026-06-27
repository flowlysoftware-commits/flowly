# Team

Grupo de usuarios con objetivos, permisos y responsabilidades.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Team`
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

- CreateTeam
- UpdateTeam
- ArchiveTeam

## Queries iniciales

- GetTeam
- SearchTeam
- ListTeams

## Events iniciales

- TeamCreated
- TeamUpdated
- TeamArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Team
- Update Team
- Archive Team
- Analyze Team

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
