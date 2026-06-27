# Workflow

Proceso declarativo ejecutable por Workflow Runtime.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Workflow`
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

- CreateWorkflow
- UpdateWorkflow
- ArchiveWorkflow

## Queries iniciales

- GetWorkflow
- SearchWorkflow
- ListWorkflows

## Events iniciales

- WorkflowCreated
- WorkflowUpdated
- WorkflowArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Workflow
- Update Workflow
- Archive Workflow
- Analyze Workflow

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
