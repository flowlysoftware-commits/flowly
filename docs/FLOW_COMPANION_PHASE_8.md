# Flow Companion — Fase 8: Voz y conversación

La Fase 8 integra la voz dentro del runtime oficial de Flow Companion.

## Arquitectura

- `useFlowlyVoiceRuntime`: captura, transcripción, wake word, interrupciones y síntesis.
- `voiceEngine.ts`: selección de voz, saneado del texto y envolvente labial.
- `FlowEngine.tsx`: conecta voz, Brain, estado, emociones y UI.
- `FlowCharacter.tsx`: recibe `speechLevel` y lo aplica a morph targets compatibles.

## Comportamiento

- El micrófono se activa únicamente por acción explícita del usuario.
- Flow escucha por segmentos cortos y envía órdenes útiles al mismo pipeline que el chat.
- El usuario puede interrumpir una respuesta hablada diciendo una nueva orden.
- Las respuestas del Brain se leen en voz alta cuando la voz está activa.
- El personaje cambia entre `listening`, `thinking` y `talking`.
- El lip sync usa morph targets `jawOpen`, `mouthOpen` o visemas equivalentes cuando existen.
- Si el FBX no contiene morph targets de boca, la voz sigue funcionando sin romper el render.

## Seguridad y compatibilidad

- No se solicita permiso de micrófono al cargar la página.
- La escucha se detiene al desmontar el runtime.
- La síntesis usa voces españolas del navegador y elige preferentemente una voz natural/premium.
- No se añade una segunda conexión al Brain ni un segundo runtime.
