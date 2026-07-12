# Flow Companion — Fase 4: Behaviour Engine 2.0

## Objetivo

Convertir el comportamiento autónomo de Flow en un sistema de decisiones desacoplado, priorizado e interrumpible.

## Arquitectura

- `behaviourTree.ts`: nodos genéricos `selector`, `sequence`, `condition` y `action`.
- `behaviourEngine.ts`: contexto, objetivos, rutinas, puntuación, prioridades, cooldowns e interrupciones.
- `FlowEngine.tsx`: traduce decisiones de comportamiento a acciones visibles del runtime.

## Objetivos disponibles

- `engage`: responder a actividad reciente del usuario.
- `recover`: reducir actividad corporal cuando aumenta el estrés.
- `focus`: entrar en momentos breves de reflexión.
- `explore`: observar el panel de manera autónoma.
- `presence`: mantener microactividad natural.
- `rest`: caminar al trono después de inactividad prolongada y baja energía.

## Garantías

- Una interacción del usuario interrumpe rutinas de baja prioridad.
- Las decisiones no se repiten consecutivamente gracias a historial y cooldowns.
- Las ramas críticas tienen prioridad sobre las rutinas ambientales.
- El Behaviour Engine no conoce React ni Three.js.
- El runtime sigue siendo el único responsable de navegación, movimiento y representación.
