# Flow Companion Gateway

El Flow Companion Gateway es el puente entre Flowly Cloud y el cuerpo visual del Companion en Unity.

## Estado actual

Esta versión está preparada para **GitHub + Vercel + Supabase**.

Por ese motivo el Gateway principal funciona por **HTTP API Routes**, no por un WebSocket persistente dentro de Vercel. Esto evita depender de procesos locales como `npm run companion:gateway` y permite probar desde el deploy normal de Vercel.

Unity no debe conocer `OPENAI_API_KEY`. Unity solo llama a Flowly y Flowly decide qué comandos físicos debe ejecutar el Companion.

```text
Unity Companion Engine
  ↓ HTTPS
Flowly / Vercel Gateway
  ↓
Flowly Brain / OpenAI / Supabase Memory
  ↓ HTTPS
Unity Runtime Commands
```

## Endpoints Vercel-safe

### `GET /api/companion/gateway/health`

Comprueba que el Gateway está vivo.

### `GET /api/companion/gateway/unity-config`

Devuelve la configuración que Unity debe usar.

Ejemplo:

```json
{
  "ok": true,
  "mode": "http",
  "gatewayBaseUrl": "https://flowlyia.com",
  "endpoints": {
    "event": "https://flowlyia.com/api/companion/gateway/event",
    "message": "https://flowlyia.com/api/companion/gateway/message",
    "ping": "https://flowlyia.com/api/companion/gateway/ping"
  }
}
```

### `GET|POST /api/companion/gateway/session`

Crea una sesión del Companion y devuelve endpoints para Unity.

### `GET|POST /api/companion/gateway/ping`

Prueba rápida para Unity.

Debe devolver comandos como:

```json
{
  "ok": true,
  "commands": [
    { "type": "debug", "name": "Pong", "payload": { "message": "Hola Unity" } },
    { "type": "attention", "name": "LookAtUser" }
  ]
}
```

### `POST /api/companion/gateway/event`

Recibe eventos externos y devuelve comandos físicos para Unity.

Eventos soportados:

- `session.started`
- `session.ended`
- `mouse.move`
- `mouse.click`
- `user.speaking`
- `user.silence`
- `assistant.thinking`
- `assistant.response.started`
- `assistant.response.finished`
- `assistant.response.interrupted`
- `text.message`

### `POST /api/companion/gateway/message`

Envía texto al Brain de Flowly y devuelve respuesta + comandos para Unity.

### `POST /api/companion/gateway/realtime-session`

Crea una sesión efímera de OpenAI Realtime desde backend.

Variables necesarias en Vercel:

```env
OPENAI_API_KEY=...
OPENAI_REALTIME_MODEL=gpt-4o-realtime-preview
OPENAI_REALTIME_VOICE=alloy
```

## Importante sobre WebSockets

El script local `scripts/flow-companion-gateway.mjs` queda solo como laboratorio local opcional.

Para producción con Vercel, usa los endpoints HTTP anteriores. Si más adelante necesitas audio bidireccional persistente, lo correcto será mover el Gateway Realtime a un servicio dedicado y dejar Vercel como panel/API principal.
