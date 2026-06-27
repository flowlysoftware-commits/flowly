# Form

Formulario capturador de datos y generador de eventos.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Form`
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

- CreateForm
- UpdateForm
- ArchiveForm

## Queries iniciales

- GetForm
- SearchForm
- ListForms

## Events iniciales

- FormCreated
- FormUpdated
- FormArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Form
- Update Form
- Archive Form
- Analyze Form

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
