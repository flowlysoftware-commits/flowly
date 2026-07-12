# Flow Companion — Fase 6: Memory Engine

La memoria del Companion queda separada del chat y del componente visual.

## Incluye

- Memoria persistente versionada en `localStorage`.
- Hechos explícitos, preferencias, empresa, personas, rutas frecuentes y rutinas.
- Extracción conservadora: solo guarda datos personales cuando el usuario los expresa de forma explícita.
- Contexto compacto enviado al Gateway/OpenAI en cada consulta.
- Conversación reciente limitada para controlar tamaño y coste.
- API para recordar, olvidar y borrar memoria.
- Persistencia con debounce, límites y recuperación ante datos corruptos.
- Eventos internos `memory:changed` para futuras pantallas de configuración y sincronización con Flowly.

La memoria local es una capa de continuidad inmediata. La sincronización multiusuario y de servidor deberá conectarse a esta interfaz en la fase de integración con Flowly.
