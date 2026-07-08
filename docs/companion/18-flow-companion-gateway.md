# Flow Companion Gateway

El Flow Companion Gateway es el puente entre Flowly Cloud y el cuerpo visual del Companion en Unity.

## Principio central

Unity no debe conocer `OPENAI_API_KEY`. Unity solo recibe eventos y comandos seguros desde Flowly.

```text
Flowly Cloud / Next.js
  ├─ Brain
  ├─ Memory
  ├─ Personality
  ├─ OpenAI Realtime
  └─ Companion Gateway
        ↓ HTTP/WebSocket protocol
Unity Companion Engine
  ├─ Nervous System
  ├─ Reaction Engine
  ├─ Attention Engine
  ├─ Voice Engine
  └─ Animation Rigging
```

## Rutas añadidas

### `GET /api/companion/gateway/session`

Crea una configuración de sesión segura para Unity.

Query opcional:

- `companionId`
- `userId`
- `sessionId`

Devuelve endpoints, identificadores y configuración runtime.

### `POST /api/companion/gateway/event`

Recibe eventos externos y devuelve comandos para Unity.

Ejemplo:

```json
{
  "type": "user.speaking",
  "companionId": "flow-companion-dev",
  "userId": "local-user",
  "sessionId": "flow-session-1"
}
```

Respuesta resumida:

```json
{
  "ok": true,
  "commands": [
    { "type": "state", "name": "Listening" },
    { "type": "reaction", "name": "UserSpeaking" },
    { "type": "attention", "name": "LookAtUser" }
  ]
}
```

### `POST /api/companion/gateway/message`

Envía un mensaje de texto al Brain de Flowly y devuelve:

- respuesta del Brain,
- comandos físicos para Unity,
- estados `Thinking`, `Speaking` e `Idle`.

### `POST /api/companion/gateway/realtime-session`

Crea una sesión efímera de OpenAI Realtime desde backend.

Variables necesarias:

- `OPENAI_API_KEY`
- `OPENAI_REALTIME_MODEL` opcional
- `OPENAI_REALTIME_VOICE` opcional

## Eventos soportados

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

## Siguiente paso

Crear en Unity un cliente HTTP/WebSocket que consuma estos endpoints y traduzca los comandos a:

- `FlowNervousSystem.SetState(...)`
- `FlowReactionEngine.TriggerReaction(...)`
- `FlowAttentionEngine.LookAtUser()` / `LookAround()` / `LookAtScreenPoint(...)`
- `FlowBrain.Say(...)`
