# Flowly Executor V3 - Plan inteligente

Fecha: 2026-06-27T23:27:40.401Z

## Instrucción

vamos a trabajar con el companion, quiero que el avatar sea de cuerpo completo y que camine de forma natural por el panel, que se mueva, que sea capaz de entender donde esta

## Resumen

Executor V3 ha construido Project Graph: 699 archivos, 10 módulos, 480 dependencias y 32 candidatos relacionados.

## Módulos detectados

- Companion Runtime

## Mapa del proyecto

- Archivos analizados: 699
- Archivos relacionados: 32
- Archivos editables: 32
- Dependencias detectadas: 57

## Archivos principales candidatos

- `app/api/brand-avatar/assistant/route.ts` — Archivo principal probable. Prioridad alta para revisar antes de crear archivos nuevos. Puntuación: 42
- `components/EvolutionaryCompanionAvatar.tsx` — Archivo principal probable. Prioridad alta para revisar antes de crear archivos nuevos. Puntuación: 31
- `app/api/brand-avatar/generate/route.ts` — Archivo principal probable. Prioridad alta para revisar antes de crear archivos nuevos. Puntuación: 30
- `docs/companion/08-avatar-behaviour.md` — Archivo principal probable. Prioridad alta para revisar antes de crear archivos nuevos. Puntuación: 27
- `app/companion/page.tsx` — Archivo principal probable. Prioridad alta para revisar antes de crear archivos nuevos. Puntuación: 19
- `app/ia-assistant/page.tsx` — Archivo principal probable. Prioridad alta para revisar antes de crear archivos nuevos. Puntuación: 19
- `lib/brandAvatar.ts` — Archivo principal probable. Prioridad alta para revisar antes de crear archivos nuevos. Puntuación: 18
- `components/FlowlyAssistant3D.tsx` — Archivo principal probable. Prioridad alta para revisar antes de crear archivos nuevos. Puntuación: 17
- `components/FlowlyCompanionRuntime.tsx` — Archivo relacionado detectado por contexto, imports o palabras clave. Puntuación: 17
- `app/api/companion/chat/route.ts` — Archivo relacionado detectado por contexto, imports o palabras clave. Puntuación: 16
- `app/api/studio/projects/ia-assistant/route.ts` — Archivo relacionado detectado por contexto, imports o palabras clave. Puntuación: 16
- `lib/flowlyCompanionRuntime.ts` — Archivo relacionado detectado por contexto, imports o palabras clave. Puntuación: 16

## Project Graph

- Módulos del grafo: Knowledge / Docs, Kernel, Companion Runtime, Studio / Builder, Brain / AI Engine, Facturación, Panel comercial, WhatsApp, CRM, Marketing
- Rutas: 46
- APIs: 82
- Componentes: 5
- Dependencias: 480

## Archivos que deben revisarse antes de crear duplicados

- `components/EvolutionaryCompanionAvatar.tsx`
- `app/api/brand-avatar/assistant/route.ts`
- `app/api/brand-avatar/generate/route.ts`
- `components/FlowlyCompanionRuntime.tsx`
- `lib/flowlyCompanionRuntime.ts`
- `docs/companion/08-avatar-behaviour.md`
- `app/docs/studio/page.tsx`

## Razonamiento

- Se han analizado 699 archivos del repositorio antes de proponer cambios.
- Se han detectado 32 archivos relacionados y 32 editables.
- Project Graph detecta 10 módulos, 82 APIs y 480 dependencias.
- Executor V3 prioriza editar piezas existentes antes de crear componentes duplicados.
- El cambio se preparará en una rama nueva y Pull Request para revisión humana.

## Pasos propuestos

1. Construir Project Graph del repositorio completo.
2. Detectar módulos, rutas, APIs, componentes, SQL y dependencias.
3. Leer archivos principales antes de decidir cambios.
4. Preparar una modificación pequeña y coherente con la arquitectura actual.
5. Crear rama segura y Pull Request.
6. Esperar revisión humana antes de merge/deploy.

## Seguridad

Executor V3 nunca modifica main directamente. Crea una rama y Pull Request para revisión humana.
