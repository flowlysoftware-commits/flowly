# Flow Companion — Fase 10: autonomía e iniciativa

Esta fase añade una capa de iniciativa desacoplada del runtime, el motor de comportamiento y el Brain.

## Responsabilidades

- Observar contexto del panel, conversación, memoria, emoción y conectividad.
- Detectar oportunidades, seguimientos, rutinas y problemas.
- Priorizar iniciativas por riesgo e impacto.
- Evitar repeticiones mediante fingerprint, caducidad y cooldown.
- Proponer acciones sin ejecutarlas silenciosamente.
- Ejecutar únicamente después de una aceptación explícita del usuario.
- Emitir eventos de auditoría para creación, aceptación y descarte.

## Seguridad

La autonomía no ejecuta acciones de escritura por sí sola. Las propuestas se convierten en llamadas al Tool Executor únicamente cuando el usuario pulsa la acción correspondiente. El motor se degrada de forma segura si no hay memoria, panel o conexión al Brain.

## Archivos

- `components/flow-engine/autonomy/autonomyEngine.ts`
- `components/flow-engine/autonomy/types.ts`
- `components/flow-engine/autonomy/index.ts`
- `components/flow-engine/FlowEngine.tsx`
- `components/flow-engine/core/config.ts`
- `components/flow-engine/core/eventBus.ts`
- `app/globals.css`
