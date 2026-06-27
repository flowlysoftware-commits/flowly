# Subscription

Relación recurrente de servicio, plan y cobro.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Subscription`
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

- CreateSubscription
- UpdateSubscription
- ArchiveSubscription

## Queries iniciales

- GetSubscription
- SearchSubscription
- ListSubscriptions

## Events iniciales

- SubscriptionCreated
- SubscriptionUpdated
- SubscriptionArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Subscription
- Update Subscription
- Archive Subscription
- Analyze Subscription

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
