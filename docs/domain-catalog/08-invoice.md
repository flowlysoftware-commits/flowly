# Invoice

Factura fiscal con estados, documentos y pagos.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Invoice`
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

- CreateInvoice
- UpdateInvoice
- ArchiveInvoice

## Queries iniciales

- GetInvoice
- SearchInvoice
- ListInvoices

## Events iniciales

- InvoiceCreated
- InvoiceUpdated
- InvoiceArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Invoice
- Update Invoice
- Archive Invoice
- Analyze Invoice

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
