# Lead

Contacto comercial inicial antes de ser cualificado.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Lead`
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

- CreateLead
- UpdateLead
- ArchiveLead

## Queries iniciales

- GetLead
- SearchLead
- ListLeads

## Events iniciales

- LeadCreated
- LeadUpdated
- LeadArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Lead
- Update Lead
- Archive Lead
- Analyze Lead

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
