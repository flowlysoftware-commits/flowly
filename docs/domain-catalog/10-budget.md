# Budget

Presupuesto interno o externo para planificación financiera.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Budget`
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

- CreateBudget
- UpdateBudget
- ArchiveBudget

## Queries iniciales

- GetBudget
- SearchBudget
- ListBudgets

## Events iniciales

- BudgetCreated
- BudgetUpdated
- BudgetArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Budget
- Update Budget
- Archive Budget
- Analyze Budget

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
