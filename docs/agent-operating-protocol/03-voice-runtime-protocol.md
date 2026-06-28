# Voice Runtime Protocol

## Objetivo

La voz de Flow debe ser estable, natural y conectada al Brain.

## Pipeline aprobado

```text
Microphone
  -> MediaRecorder
  -> Audio Blob
  -> OpenAI Transcription
  -> Conversation Engine
  -> Brain
  -> TTS
  -> Companion Speaking State
  -> Listening resumes
```

## No usar en producción

- Múltiples hooks de voz activos.
- Web Speech API mezclada con MediaRecorder.
- Estados duplicados de `enabled`, `disabled`, `permission`, `recording` en varios sitios.
- Wake word rígida como único criterio para responder.

## Estados recomendados

- `unsupported`
- `permission`
- `passive`
- `recording`
- `transcribing`
- `thinking`
- `speaking`
- `error`

## Regla de integración

`/os/voice-test` puede existir para diagnóstico, pero debe compartir el mismo servicio central de voz o servir solo como referencia temporal.

El Companion de producción debe usar el runtime central.

## Seguridad y UX

- Pedir permiso de micrófono de forma clara.
- No bloquear el panel si el usuario rechaza el permiso.
- Permitir usar texto si no hay voz.
- Evitar que Flow se escuche a sí mismo durante TTS.
- Reiniciar escucha al finalizar respuesta.
