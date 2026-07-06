# Realistic Companion Life Engine

Esta fase convierte el Companion en una presencia viva dentro de Flowly OS, no en una ventana de chat.

## Principio central

Developer y Companion comparten el mismo Brain. La diferencia no está en la inteligencia, sino en la interfaz, el contexto, la intención visible, la voz y el movimiento.

## Las 5 capas activas

1. **Presence Engine**: el Companion nunca queda congelado. Respira, mira, parpadea, cambia micro-postura y mantiene presencia aun en silencio.
2. **Emotion Engine**: la emoción se expresa antes de hablar mediante cabeza, postura, gesto y ritmo.
3. **Spatial Awareness**: el Companion habita Flowly. Cambia posición y atención según CRM, Facturación, Marketing, Docs o Studio.
4. **Initiative Engine**: puede iniciar micro-interacciones útiles y no invasivas cuando detecta contexto suficiente.
5. **Relationship Engine**: evoluciona con el usuario mediante preferencias, estilo de trabajo y confianza acumulada.

## Regla de arquitectura

GPT no mueve huesos. GPT decide intención, estado emocional y contexto. El motor gráfico decide la animación concreta mediante una Animation State Machine.

Estados base:

- Idle
- Breathing
- Looking
- Listening
- Thinking
- Talking
- Walking
- Pointing
- Reading
- Typing
- Happy
- Concerned
- Celebrating

## Voz

El texto no cambia por la voz. El Life Engine acompaña cada respuesta con estilo vocal: velocidad, pausas, tono, intensidad y énfasis. Esto permite que el mismo texto suene cercano, serio, alegre o concentrado sin romper el Brain compartido.

## UX

Toda mejora debe responder sí a esta pregunta:

> ¿Hace que el usuario sienta que realmente hay alguien con él?

Si la respuesta es no, se descarta.
