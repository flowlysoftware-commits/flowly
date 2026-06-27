# Execute Command

## Tipo

Capability.

## Propósito

Permitir que Flowly ejecute la capacidad **Execute Command** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.

## Contrato base

### Input

Pendiente de especificación detallada.

### Output

Resultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.

## Reglas

- Debe registrarse en el Capability Registry.
- Debe ejecutarse mediante el Capability Runtime.
- Debe generar observabilidad.
- Debe declarar permisos y políticas.

## Events

- CapabilityRequested
- CapabilityExecuted
- CapabilityFailed

## Estado

Borrador inicial preparado para desarrollo.
