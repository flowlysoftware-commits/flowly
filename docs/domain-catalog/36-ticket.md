# Ticket

Solicitud o incidencia de soporte con SLA y resolución.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Ticket`
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

- CreateTicket
- UpdateTicket
- ArchiveTicket

## Queries iniciales

- GetTicket
- SearchTicket
- ListTickets

## Events iniciales

- TicketCreated
- TicketUpdated
- TicketArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Ticket
- Update Ticket
- Archive Ticket
- Analyze Ticket

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
