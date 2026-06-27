# Supplier

Proveedor con contratos, pedidos, gastos y rendimiento.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Supplier`
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

- CreateSupplier
- UpdateSupplier
- ArchiveSupplier

## Queries iniciales

- GetSupplier
- SearchSupplier
- ListSuppliers

## Events iniciales

- SupplierCreated
- SupplierUpdated
- SupplierArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Supplier
- Update Supplier
- Archive Supplier
- Analyze Supplier

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
