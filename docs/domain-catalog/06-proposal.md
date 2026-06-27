# Proposal

Propuesta comercial generada para un cliente.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Proposal`
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

- CreateProposal
- UpdateProposal
- ArchiveProposal

## Queries iniciales

- GetProposal
- SearchProposal
- ListProposals

## Events iniciales

- ProposalCreated
- ProposalUpdated
- ProposalArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Proposal
- Update Proposal
- Archive Proposal
- Analyze Proposal

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
