# Flowly Executor V3 - Plan inteligente

Fecha: 2026-06-27T22:43:58.998Z

## Instrucción

Analiza todo el Companion existente. No crees archivos duplicados ni versiones V2 si ya existe un componente equivalente. Identifica todos los archivos relacionados con el Companion, construye un mapa de dependencias y propón una evolución para convertirlo en un avatar vivo con emociones, animaciones, memoria y comportamiento. Después modifica únicamente los archivos necesarios, ejecuta el build, verifica que no haya errores y crea un Pull Request.

## Resumen

Executor V3 ha analizado 696 archivos, detectado 32 relacionados y priorizado 6 candidatos principales.

## Módulos detectados

- Companion Runtime

## Mapa del proyecto

- Archivos analizados: 696
- Archivos relacionados: 32
- Archivos editables: 32
- Dependencias detectadas: 20

## Archivos principales candidatos

- `app/api/brand-avatar/assistant/route.ts` — Archivo principal probable. Prioridad alta para revisar antes de crear archivos nuevos. Puntuación: 42
- `components/EvolutionaryCompanionAvatar.tsx` — Archivo principal probable. Prioridad alta para revisar antes de crear archivos nuevos. Puntuación: 33
- `app/api/brand-avatar/generate/route.ts` — Archivo principal probable. Prioridad alta para revisar antes de crear archivos nuevos. Puntuación: 30
- `docs/companion/08-avatar-behaviour.md` — Archivo principal probable. Prioridad alta para revisar antes de crear archivos nuevos. Puntuación: 29
- `app/companion/page.tsx` — Archivo principal probable. Prioridad alta para revisar antes de crear archivos nuevos. Puntuación: 21
- `app/ia-assistant/page.tsx` — Archivo principal probable. Prioridad alta para revisar antes de crear archivos nuevos. Puntuación: 19
- `components/FlowlyCompanionRuntime.tsx` — Archivo principal probable. Prioridad alta para revisar antes de crear archivos nuevos. Puntuación: 19
- `app/api/companion/chat/route.ts` — Archivo principal probable. Prioridad alta para revisar antes de crear archivos nuevos. Puntuación: 18
- `lib/brandAvatar.ts` — Archivo relacionado detectado por contexto, imports o palabras clave. Puntuación: 18
- `lib/flowlyCompanionRuntime.ts` — Archivo relacionado detectado por contexto, imports o palabras clave. Puntuación: 18
- `components/FlowlyAssistant3D.tsx` — Archivo relacionado detectado por contexto, imports o palabras clave. Puntuación: 17
- `app/api/studio/projects/ia-assistant/route.ts` — Archivo relacionado detectado por contexto, imports o palabras clave. Puntuación: 16

## Razonamiento

- Se han analizado 696 archivos del repositorio antes de proponer cambios.
- Se han detectado 32 archivos relacionados y 32 editables.
- Executor V3 prioriza editar piezas existentes antes de crear componentes duplicados.
- El cambio se preparará en una rama nueva y Pull Request para revisión humana.

## Pasos propuestos

1. Construir mapa del proyecto y dependencias relevantes.
2. Leer archivos principales antes de decidir cambios.
3. Preparar una modificación pequeña y coherente con la arquitectura actual.
4. Crear rama segura y Pull Request.
5. Esperar revisión humana antes de merge/deploy.

## Seguridad

Executor V3 nunca modifica main directamente. Crea una rama y Pull Request para revisión humana.
