# Landing Page

Página de captación conectada con campañas y formularios.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `LandingPage`
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

- CreateLandingPage
- UpdateLandingPage
- ArchiveLandingPage

## Queries iniciales

- GetLandingPage
- SearchLandingPage
- ListLandingPages

## Events iniciales

- LandingPageCreated
- LandingPageUpdated
- LandingPageArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Landing Page
- Update Landing Page
- Archive Landing Page
- Analyze Landing Page

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
