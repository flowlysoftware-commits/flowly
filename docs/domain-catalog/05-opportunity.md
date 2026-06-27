# Opportunity

Oportunidad comercial con etapas, valor y probabilidad.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Opportunity`
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

- CreateOpportunity
- UpdateOpportunity
- ArchiveOpportunity

## Queries iniciales

- GetOpportunity
- SearchOpportunity
- ListOpportunitys

## Events iniciales

- OpportunityCreated
- OpportunityUpdated
- OpportunityArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Opportunity
- Update Opportunity
- Archive Opportunity
- Analyze Opportunity

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
