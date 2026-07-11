# Flow Companion Engine V2 — Fase 1

## Runtime oficial

`components/flow-engine/FlowEngine.tsx` es el único runtime ejecutable del Companion.

Las rutas históricas conservadas son adaptadores de compatibilidad y no contienen una segunda implementación. En especial, `components/flow-runtime/FlowRuntime.tsx` reexporta el runtime oficial.

## Núcleo desacoplado

La infraestructura compartida está en `components/flow-engine/core/`:

- `config.ts`: configuración centralizada y transporte del Gateway.
- `eventBus.ts`: eventos tipados entre subsistemas.
- `logger.ts`: logging uniforme por ámbito.
- `runtimeRegistry.ts`: impide montar dos runtimes simultáneamente.
- `services.ts`: composición explícita de dependencias del núcleo.
- `storage.ts`: persistencia segura y versionada del estado local.

## Reglas para las siguientes fases

1. Ningún componente puede crear un segundo runtime.
2. La configuración no se declara dentro de componentes visuales.
3. Los subsistemas se comunican mediante contratos tipados o el Event Bus.
4. El Companion nunca debe derribar el panel de Flowly si falla al renderizar.
5. Los imports antiguos deben apuntar al runtime oficial hasta que puedan retirarse sin romper consumidores.
