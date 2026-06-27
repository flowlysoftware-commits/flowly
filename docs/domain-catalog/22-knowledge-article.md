# Knowledge Article

Artículo de conocimiento reusable por personas y Companion.

## Tipo

Business Object oficial del dominio de Flowly OS.

## Identidad

- Object Type: `KnowledgeArticle`
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

- CreateKnowledgeArticle
- UpdateKnowledgeArticle
- ArchiveKnowledgeArticle

## Queries iniciales

- GetKnowledgeArticle
- SearchKnowledgeArticle
- ListKnowledgeArticles

## Events iniciales

- KnowledgeArticleCreated
- KnowledgeArticleUpdated
- KnowledgeArticleArchived

## Policies

- Debe respetar Organization Boundary.
- Debe respetar Authorization Engine.
- Toda modificación genera Events.

## Capabilities relacionadas

- Create Knowledge Article
- Update Knowledge Article
- Archive Knowledge Article
- Analyze Knowledge Article

## Observabilidad

Toda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.
