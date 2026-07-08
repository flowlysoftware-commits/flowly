# Flow Companion Gateway

Gateway HTTP seguro para conectar Unity Flow Companion con Flowly en Vercel.

## Transporte actual

En Vercel usamos HTTP API Routes, no WebSocket persistente. Esto evita problemas de conexiones largas y permite probar ya la comunicación Unity → Flowly.

## Endpoints principales

Rutas cortas recomendadas:

- `GET /api/companion/ping` — prueba rápida del gateway.
- `GET /api/companion/health` — estado del servicio.
- `GET|POST /api/companion/session` — crea/lee configuración de sesión.
- `POST /api/companion/event` — envía eventos del Companion.
- `POST /api/companion/message` — envía texto al cerebro Flowly.
- `GET /api/companion/unity-config` — configuración para Unity.
- `POST /api/companion/realtime-session` — crea sesión efímera para OpenAI Realtime.

Rutas canónicas equivalentes:

- `/api/companion/gateway/ping`
- `/api/companion/gateway/health`
- `/api/companion/gateway/session`
- `/api/companion/gateway/event`
- `/api/companion/gateway/message`
- `/api/companion/gateway/unity-config`
- `/api/companion/gateway/realtime-session`

## Prueba rápida

Después del deploy en Vercel abre:

```txt
https://flowlyia.com/api/companion/ping
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "pong"
}
```

## Variables de entorno

Para mensajería avanzada y Realtime:

```env
OPENAI_API_KEY=...
OPENAI_REALTIME_MODEL=gpt-4o-realtime-preview
OPENAI_REALTIME_VOICE=alloy
NEXT_PUBLIC_FLOWLY_URL=https://flowlyia.com
```

`OPENAI_API_KEY` nunca debe ir dentro de Unity.

## Unity

Durante esta fase Unity debe llamar por HTTP a:

```txt
https://flowlyia.com/api/companion/ping
https://flowlyia.com/api/companion/event
https://flowlyia.com/api/companion/message
```

WebSocket quedará para un Gateway dedicado futuro si se necesita streaming persistente.
