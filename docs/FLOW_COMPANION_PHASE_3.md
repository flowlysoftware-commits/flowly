# Flow Companion — Fase 3: Movimiento real

## Resultado

La locomoción deja de ser una transición visual simple y pasa a estar gobernada por un controlador de movimiento cancelable y sincronizado con la animación.

## Cambios

- Giro previo hacia el destino.
- Aceleración y frenado progresivos.
- Velocidad de desplazamiento medida en cada frame.
- Sincronización del `AnimationMixer` con la velocidad real de pantalla.
- Cancelación segura al arrastrar a Flow o iniciar otro movimiento.
- Cálculo inteligente del lado desde el que Flow se aproxima a un elemento.
- Orientación final hacia el control que va a señalar.
- Revalidación del elemento DOM antes de pulsarlo.
- Foco accesible antes del clic.
- Limpieza de estado al llegar o cancelar.

## Archivos

- `components/flow-engine/movementController.ts`
- `components/flow-engine/domNavigator.ts`
- `components/flow-engine/types.ts`
- `components/flow-engine/stateMachine.ts`
- `components/flow-engine/animationEngine.ts`
- `components/flow-engine/FlowCharacter.tsx`
- `components/flow-engine/FlowEngine.tsx`
