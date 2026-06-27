# Expense

Gasto registrado con justificante y aprobación.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Expense`
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

- CreateExpense
- UpdateExpense
- ArchiveExpense

## Queries iniciales

- GetExpense
- SearchExpense
- ListExpenses

## Events iniciales

- ExpenseCreated
- ExpenseUpdated
- ExpenseArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Expense
- Update Expense
- Archive Expense
- Analyze Expense

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
