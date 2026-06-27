# Product

Producto o servicio vendible con precio, coste y catálogo.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Product`
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

- CreateProduct
- UpdateProduct
- ArchiveProduct

## Queries iniciales

- GetProduct
- SearchProduct
- ListProducts

## Events iniciales

- ProductCreated
- ProductUpdated
- ProductArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Product
- Update Product
- Archive Product
- Analyze Product

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
