# Flow Companion — Fase 5: Emotion Engine

La emoción deja de ser un objeto estático y pasa a ser un sistema dinámico, desacoplado y observable.

## Incluido

- Motor emocional único con transiciones suaves.
- Estados: neutral, calma, alegría, curiosidad, empatía, concentración, cansancio y estrés.
- Estímulos por actividad, chat, navegación, errores, descanso, despertar y Gateway.
- Recuperación progresiva hacia una línea emocional base.
- Emisión de snapshots tipados mediante el Event Bus.
- Integración con Behaviour Engine, Animation Engine y microgestos del personaje.

Las emociones no cambian de golpe: cada estímulo modifica un objetivo interno y el motor interpola el cuerpo hacia ese estado.
