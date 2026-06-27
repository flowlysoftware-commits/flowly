# Collaboration

Relación de trabajo persistente entre usuarios, Companion y objetivos.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Collaboration`
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

- CreateCollaboration
- UpdateCollaboration
- ArchiveCollaboration

## Queries iniciales

- GetCollaboration
- SearchCollaboration
- ListCollaborations

## Events iniciales

- CollaborationCreated
- CollaborationUpdated
- CollaborationArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Collaboration
- Update Collaboration
- Archive Collaboration
- Analyze Collaboration

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
