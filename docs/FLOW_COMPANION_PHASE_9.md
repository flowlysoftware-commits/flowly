# Flow Companion — Fase 9: Calidad cinematográfica

Esta fase añade una capa de vida secundaria sobre las animaciones del FBX maestro sin crear un runtime paralelo.

## Sistemas incorporados

- `FlowCinematicLifeEngine`: respiración, balance corporal, transferencia de peso, mirada y microexpresiones.
- Seguimiento ocular suave del cursor con sacádicos aleatorios y respuesta emocional.
- Movimiento coordinado de ojos, cabeza y cuello.
- Respiración de pecho y hombros adaptada a energía y estrés.
- Microgestos de dedos durante conversación, espera y tensión.
- Morph targets faciales para sonrisa, cejas, entrecerrado y lip sync cuando el FBX los ofrece.
- Degradación segura cuando el rig no contiene ojos, dedos o expresiones compatibles.
- Materiales con sombras y render de mayor densidad.
- Iluminación de tres puntos optimizada para fondo transparente.

## Arquitectura

La capa cinematográfica es determinista por frame, no controla `AnimationMixer` y no selecciona clips. Solo añade movimiento secundario, por lo que permanece desacoplada del Animation Engine, Behaviour Engine y Emotion Engine.
