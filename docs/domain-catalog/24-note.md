# Note

Nota contextual asociada a objetos o colaboraciones.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Note`
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

- CreateNote
- UpdateNote
- ArchiveNote

## Queries iniciales

- GetNote
- SearchNote
- ListNotes

## Events iniciales

- NoteCreated
- NoteUpdated
- NoteArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Note
- Update Note
- Archive Note
- Analyze Note

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
