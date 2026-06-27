# Content

Pieza de contenido para marketing, soporte o documentación.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Content`
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

- CreateContent
- UpdateContent
- ArchiveContent

## Queries iniciales

- GetContent
- SearchContent
- ListContents

## Events iniciales

- ContentCreated
- ContentUpdated
- ContentArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Content
- Update Content
- Archive Content
- Analyze Content

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
