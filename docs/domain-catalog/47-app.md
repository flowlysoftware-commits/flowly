# App

Aplicación o experiencia dentro del App Runtime.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `App`
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

- CreateApp
- UpdateApp
- ArchiveApp

## Queries iniciales

- GetApp
- SearchApp
- ListApps

## Events iniciales

- AppCreated
- AppUpdated
- AppArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create App
- Update App
- Archive App
- Analyze App

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
