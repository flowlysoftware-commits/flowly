# Companion Debug Protocol

## Principio

El Companion es el personaje central de Flowly OS. No debe depurarse como un botón o widget aislado.

El flujo correcto debe considerar:

- Brain
- Heart
- Memory
- Context
- Event Bus
- Voice Engine
- Avatar Engine
- Movement Engine
- Emotion Engine
- Dialogue System

## Cuando algo falla

Antes de cambiar código, comparar:

1. Componente que funciona.
2. Componente que falla.
3. Rutas API usadas.
4. Hooks usados.
5. Providers montados.
6. Estados compartidos.
7. Efectos `useEffect` que inicializan o limpian recursos.
8. Rutas antiguas que puedan seguir activas.

## Checklist para voz

- ¿Se monta el Companion Runtime?
- ¿Se monta una sola vez?
- ¿Se llama a `start()`?
- ¿`getUserMedia()` se ejecuta?
- ¿`MediaRecorder` llega a `recording`?
- ¿Hay audio blob con KB reales?
- ¿Se llama a transcripción?
- ¿Se recibe texto?
- ¿Se envía al Brain?
- ¿El Brain responde?
- ¿TTS empieza?
- ¿La escucha se reinicia al terminar TTS?

## Reglas de movimiento

- Mover el personaje completo, no extremidades sueltas.
- Usar destinos: centro, izquierda, derecha, esquina, foco contextual.
- Al caminar: girar hacia destino, avanzar, cambiar a idle al llegar.
- Evitar animaciones que rompan piernas o brazos.

## Diagnóstico visible

Si un bug no se puede resolver de forma evidente, añadir diagnóstico temporal:

- Fase actual.
- Último evento.
- Último error.
- Última transcripción.
- Última respuesta Brain.
- Contador de grabaciones.
- Tamaño del último audio.

Eliminar o esconder diagnósticos en producción cuando ya no sean necesarios.
