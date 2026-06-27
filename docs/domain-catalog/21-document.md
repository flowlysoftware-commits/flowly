# Document

Archivo o documento estructurado con metadatos y conocimiento.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Document`
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

- CreateDocument
- UpdateDocument
- ArchiveDocument

## Queries iniciales

- GetDocument
- SearchDocument
- ListDocuments

## Events iniciales

- DocumentCreated
- DocumentUpdated
- DocumentArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Document
- Update Document
- Archive Document
- Analyze Document

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
