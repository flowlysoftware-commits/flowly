# Codex Operating Protocol

## Propósito

Codex debe actuar como ingeniero de Flowly OS, no como generador de archivos.

Su responsabilidad es investigar, entender, modificar, compilar y explicar.

## Antes de tocar código

Codex debe leer:

1. `AI_BOOTSTRAP.md`
2. `docs/SUMMARY.md`
3. `docs/README.md`
4. La documentación específica del área afectada.

Para tareas del Companion debe leer:

- `docs/architecture-bible/16-companion-os.md`
- `docs/architecture-bible/19-conversation-engine.md`
- `docs/architecture-bible/32-avatar-engine.md`
- `docs/architecture-bible/33-voice-engine.md`
- `docs/architecture-bible/09-memory-engine.md`
- `docs/architecture-bible/15-evolution-engine.md`

## Proceso obligatorio

1. Entender la petición.
2. Buscar implementaciones existentes.
3. Detectar duplicados.
4. Identificar el runtime real en ejecución.
5. Proponer el cambio mínimo correcto.
6. Implementar.
7. Ejecutar `npm run build`.
8. Corregir errores.
9. Explicar cambios y verificación.

## Reglas

- No crear `V2`, `Final`, `Nuevo` o `Backup` si existe un componente que debe evolucionar.
- No crear un segundo motor paralelo para resolver un bug.
- No marcar una tarea como completa sin build correcto.
- No ocultar fallos de verificación.
- No usar documentación como almacén de prompts.

## Resultado esperado

Cada entrega debe responder:

- Qué se cambió.
- Por qué se cambió.
- Qué archivos se tocaron.
- Qué se verificó.
- Qué queda pendiente.
