# Asset

Activo de la empresa con ciclo de vida y mantenimiento.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Asset`
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

- CreateAsset
- UpdateAsset
- ArchiveAsset

## Queries iniciales

- GetAsset
- SearchAsset
- ListAssets

## Events iniciales

- AssetCreated
- AssetUpdated
- AssetArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Asset
- Update Asset
- Archive Asset
- Analyze Asset

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
