# Unity conectado a Flowly en Vercel

## URL base

En Unity no uses:

```text
ws://localhost:3001/flow-companion
```

Para Flowly en Vercel usa HTTP:

```text
https://flowlyia.com/api/companion/gateway/unity-config
```

## Prueba rápida desde navegador

Abre:

```text
https://flowlyia.com/api/companion/gateway/health
```

Debe responder:

```json
{ "ok": true, "service": "flow-companion-gateway" }
```

Luego prueba:

```text
https://flowlyia.com/api/companion/gateway/ping
```

Debe devolver comandos para Unity.

## Flujo recomendado

1. Unity pide `/unity-config`.
2. Unity usa `endpoints.ping` para probar conexión.
3. Unity usa `endpoints.event` para enviar eventos físicos.
4. Unity usa `endpoints.message` para conversar con Flowly Brain.
5. Más adelante, Unity pedirá `/realtime-session` para OpenAI Realtime.
