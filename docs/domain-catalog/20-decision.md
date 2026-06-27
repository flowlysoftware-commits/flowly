# Decision

Decisión registrada con alternativas, criterios, contexto y resultado.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Decision`
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

- CreateDecision
- UpdateDecision
- ArchiveDecision

## Queries iniciales

- GetDecision
- SearchDecision
- ListDecisions

## Events iniciales

- DecisionCreated
- DecisionUpdated
- DecisionArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Decision
- Update Decision
- Archive Decision
- Analyze Decision

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
