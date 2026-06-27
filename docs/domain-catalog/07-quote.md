# Quote

Presupuesto formal con líneas, importes y aprobación.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Quote`
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

- CreateQuote
- UpdateQuote
- ArchiveQuote

## Queries iniciales

- GetQuote
- SearchQuote
- ListQuotes

## Events iniciales

- QuoteCreated
- QuoteUpdated
- QuoteArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Quote
- Update Quote
- Archive Quote
- Analyze Quote

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
