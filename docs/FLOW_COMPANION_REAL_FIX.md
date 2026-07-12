# Flow Companion — corrección física y memoria

## Cambios

- El modelo 3D ya no se desmonta al ocupar el trono.
- La pose sentada procedural se ha suavizado y recalibrado.
- Los gestos fallback de saludo y señalamiento tienen menor amplitud.
- La locomoción usa rutas ortogonales y giros antes de cada tramo.
- La velocidad visual alimenta el gait del AnimationMixer.
- La aproximación al DOM evalúa izquierda, derecha y parte inferior y penaliza solapamientos con controles y títulos visibles.
- La memoria responde de inmediato al guardar nombre, empresa, preferencias o hechos explícitos.

## Pruebas

1. `Llévame al CRM`: debe girar, desplazarse por tramos y detenerse al lado del objetivo.
2. Dejarlo inactivo o enviarlo al trono: el modelo 3D debe seguir visible y sentado.
3. `Me llamo Ricky, recuérdalo`: debe confirmar que guardará el nombre.
4. Recargar y preguntar `¿Cómo me llamo?`: debe responder desde memoria local.

## Validación

El ZIP fuente no incluía `node_modules`. La instalación de dependencias superó el tiempo disponible del entorno, por lo que no se pudo completar `next build` aquí. Los cambios no añaden dependencias nuevas.
