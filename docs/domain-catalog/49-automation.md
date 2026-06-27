# Automation

Automatización basada en triggers, condiciones y acciones.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Automation`
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

- CreateAutomation
- UpdateAutomation
- ArchiveAutomation

## Queries iniciales

- GetAutomation
- SearchAutomation
- ListAutomations

## Events iniciales

- AutomationCreated
- AutomationUpdated
- AutomationArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Automation
- Update Automation
- Archive Automation
- Analyze Automation

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
