# Payment

Pago recibido o emitido vinculado a facturas o gastos.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Payment`
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

- CreatePayment
- UpdatePayment
- ArchivePayment

## Queries iniciales

- GetPayment
- SearchPayment
- ListPayments

## Events iniciales

- PaymentCreated
- PaymentUpdated
- PaymentArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Payment
- Update Payment
- Archive Payment
- Analyze Payment

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
