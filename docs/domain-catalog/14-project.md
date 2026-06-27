# Project

Proyecto con fases, tareas, responsables y entregables.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Project`
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

- CreateProject
- UpdateProject
- ArchiveProject

## Queries iniciales

- GetProject
- SearchProject
- ListProjects

## Events iniciales

- ProjectCreated
- ProjectUpdated
- ProjectArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Project
- Update Project
- Archive Project
- Analyze Project

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
