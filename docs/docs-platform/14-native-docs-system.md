# Native Docs System

Flowly Docs deja de ser una biblioteca estática y pasa a funcionar como sistema vivo.

## Capacidades incluidas

- Buscador sobre libros y capítulos.
- Preguntas rápidas basadas en resultados de documentación.
- Editor interno conectado a Supabase.
- Importador Markdown con división automática por capítulos.
- Exportación a Markdown, HTML y Word básico.
- Enlaces entre documentación y archivos de código.
- Versionado de capítulos mediante snapshots.

## Instalación

1. Ejecutar `supabase/flowly_docs.sql` en Supabase.
2. Abrir `/docs/studio`.
3. Pulsar `Sincronizar Docs actuales`.
4. Empezar a crear, importar o exportar libros.

## Nota

La búsqueda semántica real con embeddings queda preparada como siguiente iteración. La versión actual implementa búsqueda textual robusta sin añadir dependencias externas ni costes de IA.
