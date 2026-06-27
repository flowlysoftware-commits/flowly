# Incident

Incidencia operativa, técnica o de cliente.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Incident`
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

- CreateIncident
- UpdateIncident
- ArchiveIncident

## Queries iniciales

- GetIncident
- SearchIncident
- ListIncidents

## Events iniciales

- IncidentCreated
- IncidentUpdated
- IncidentArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Incident
- Update Incident
- Archive Incident
- Analyze Incident

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
