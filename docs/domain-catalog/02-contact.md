# Contact

Persona de contacto vinculada a clientes, empresas y oportunidades.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Contact`
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

- CreateContact
- UpdateContact
- ArchiveContact

## Queries iniciales

- GetContact
- SearchContact
- ListContacts

## Events iniciales

- ContactCreated
- ContactUpdated
- ContactArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Contact
- Update Contact
- Archive Contact
- Analyze Contact

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
