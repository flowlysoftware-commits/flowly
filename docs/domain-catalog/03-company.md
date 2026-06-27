# Company

Empresa u organización externa con relaciones comerciales y fiscales.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Company`
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

- CreateCompany
- UpdateCompany
- ArchiveCompany

## Queries iniciales

- GetCompany
- SearchCompany
- ListCompanys

## Events iniciales

- CompanyCreated
- CompanyUpdated
- CompanyArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Company
- Update Company
- Archive Company
- Analyze Company

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
