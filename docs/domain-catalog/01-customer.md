# Customer

Cliente con historial, relaciones, métricas y capacidades comerciales.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Customer`
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

- CreateCustomer
- UpdateCustomer
- ArchiveCustomer

## Queries iniciales

- GetCustomer
- SearchCustomer
- ListCustomers

## Events iniciales

- CustomerCreated
- CustomerUpdated
- CustomerArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Customer
- Update Customer
- Archive Customer
- Analyze Customer

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
