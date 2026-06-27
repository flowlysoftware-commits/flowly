# Task

Unidad de trabajo asignable y medible.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Task`
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

- CreateTask
- UpdateTask
- ArchiveTask

## Queries iniciales

- GetTask
- SearchTask
- ListTasks

## Events iniciales

- TaskCreated
- TaskUpdated
- TaskArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Task
- Update Task
- Archive Task
- Analyze Task

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
