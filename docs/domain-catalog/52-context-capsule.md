# Context Capsule

Paquete de contexto para razonamiento, ejecución o conversación.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `ContextCapsule`
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

- CreateContextCapsule
- UpdateContextCapsule
- ArchiveContextCapsule

## Queries iniciales

- GetContextCapsule
- SearchContextCapsule
- ListContextCapsules

## Events iniciales

- ContextCapsuleCreated
- ContextCapsuleUpdated
- ContextCapsuleArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Context Capsule
- Update Context Capsule
- Archive Context Capsule
- Analyze Context Capsule

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
