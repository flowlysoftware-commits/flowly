# Flow Companion — Fase 2: Motor de animación

## Fuente única

El personaje y todas las animaciones normales se cargan desde `public/models/flow/flow-master.fbx`.
El clip sentado actual se conserva temporalmente como compatibilidad hasta que exista dentro del FBX maestro.

## Arquitectura

- `animationCatalog.ts`: analiza automáticamente los clips, clasifica familias y genera metadatos de reproducción.
- `animationEngine.ts`: única autoridad sobre `AnimationMixer`, transiciones, loops, velocidad, historial y cooldowns.
- `FlowCharacter.tsx`: renderiza el personaje y añade microgestos sin gestionar directamente acciones del mixer.
- `animationLibrary.ts`: define la fuente del modelo y su orientación.

## Selección inteligente

Cada clip dispone de:

- categoría;
- peso;
- prioridad;
- cooldown;
- tipo de loop;
- blend de entrada y salida;
- rango de velocidad;
- duración;
- análisis de actividad de brazos, piernas, torso, cabeza y raíz.

La selección considera el modo actual, la emoción, clips recientes y cooldowns. Los gestos deliberados de saludar y señalar solo aceptan clips con nombres explícitos para evitar poses incorrectas.

## Reglas

- No se hace retarget entre FBX para las animaciones normales.
- Se elimina la traslación de raíz para impedir que el modelo se desplace dentro de su canvas.
- `FlowAnimationEngine` es el único propietario de `AnimationMixer`.
- Las animaciones se liberan correctamente al desmontar el personaje.
