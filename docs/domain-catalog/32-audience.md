# Audience

Segmento de personas o empresas para campañas.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Audience`
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

- CreateAudience
- UpdateAudience
- ArchiveAudience

## Queries iniciales

- GetAudience
- SearchAudience
- ListAudiences

## Events iniciales

- AudienceCreated
- AudienceUpdated
- AudienceArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Audience
- Update Audience
- Archive Audience
- Analyze Audience

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
