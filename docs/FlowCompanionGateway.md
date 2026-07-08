# Flow Companion Gateway v0.2

Este módulo crea el primer puente real entre Flowly y Unity para el Flow Companion.

## Endpoints HTTP

### `GET /api/companion/gateway/session`
Devuelve la configuración que Unity debe usar.

### `GET|POST /api/companion/gateway/ping`
Prueba rápida para confirmar que el gateway responde.

### `POST /api/companion/gateway/event`
Recibe eventos del runtime y devuelve comandos para Unity.

### `POST /api/companion/gateway/message`
Procesa texto usando `runFlowlyBrain` y devuelve comandos `Thinking`, `Speaking`, `Say` e `Idle`.

### `POST /api/companion/gateway/realtime-session`
Crea una sesión efímera de OpenAI Realtime desde backend seguro.

## WebSocket local para Unity

Next.js no debe exponer WebSocket persistente desde route handlers serverless. Para desarrollo local se incluye un gateway dedicado sin dependencias externas:

```bash
npm run companion:gateway
```

Por defecto escucha en:

```text
ws://localhost:3001/flow-companion
```

Healthcheck:

```text
http://localhost:3001/health
```

## Mensaje mínimo desde Unity

```json
{
  "type": "ping",
  "companionId": "flow-companion-dev",
  "userId": "local-user"
}
```

Respuesta esperada:

```json
{
  "ok": true,
  "commands": [
    { "type": "debug", "name": "Pong", "payload": { "message": "Hola Unity" } },
    { "type": "attention", "name": "LookAtUser" }
  ]
}
```

## Variables recomendadas

```env
OPENAI_API_KEY=...
FLOW_COMPANION_WS_URL=ws://localhost:3001/flow-companion
FLOW_COMPANION_GATEWAY_PORT=3001
FLOW_COMPANION_GATEWAY_PATH=/flow-companion
OPENAI_REALTIME_MODEL=gpt-4o-realtime-preview
OPENAI_REALTIME_VOICE=alloy
```

## Siguiente fase

Cuando Unity reciba y aplique los comandos del gateway, el siguiente paso será sustituir el `ping/pong` por streaming real con OpenAI Realtime y eventos como:

- `user.speaking`
- `assistant.thinking`
- `assistant.response.started`
- `assistant.response.finished`
