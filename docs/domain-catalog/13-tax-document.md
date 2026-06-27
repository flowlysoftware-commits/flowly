# Tax Document

Documento fiscal asociado a facturación, impuestos o cumplimiento.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `TaxDocument`
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

- CreateTaxDocument
- UpdateTaxDocument
- ArchiveTaxDocument

## Queries iniciales

- GetTaxDocument
- SearchTaxDocument
- ListTaxDocuments

## Events iniciales

- TaxDocumentCreated
- TaxDocumentUpdated
- TaxDocumentArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Tax Document
- Update Tax Document
- Archive Tax Document
- Analyze Tax Document

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
