# AI Agent

Agente especializado dentro de la Digital Workforce.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `AIAgent`
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

- CreateAIAgent
- UpdateAIAgent
- ArchiveAIAgent

## Queries iniciales

- GetAIAgent
- SearchAIAgent
- ListAIAgents

## Events iniciales

- AIAgentCreated
- AIAgentUpdated
- AIAgentArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create AI Agent
- Update AI Agent
- Archive AI Agent
- Analyze AI Agent

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
