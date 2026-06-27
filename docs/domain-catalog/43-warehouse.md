# Warehouse

Almacén o ubicación logística.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Warehouse`
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

- CreateWarehouse
- UpdateWarehouse
- ArchiveWarehouse

## Queries iniciales

- GetWarehouse
- SearchWarehouse
- ListWarehouses

## Events iniciales

- WarehouseCreated
- WarehouseUpdated
- WarehouseArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Warehouse
- Update Warehouse
- Archive Warehouse
- Analyze Warehouse

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
