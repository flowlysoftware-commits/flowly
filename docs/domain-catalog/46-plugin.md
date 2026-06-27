# Plugin

Extensión instalada con permisos, identidad y Trust Score.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `Plugin`
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

- CreatePlugin
- UpdatePlugin
- ArchivePlugin

## Queries iniciales

- GetPlugin
- SearchPlugin
- ListPlugins

## Events iniciales

- PluginCreated
- PluginUpdated
- PluginArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Plugin
- Update Plugin
- Archive Plugin
- Analyze Plugin

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
