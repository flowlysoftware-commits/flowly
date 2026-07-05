# Flow Certification Protocol

Flow Certification es la fase de control que valida si Developer está actuando como un ingeniero real antes de considerar una respuesta o cambio como terminado.

## Objetivo

El objetivo no es crear otro motor de IA. Flow Certification usa el mismo Brain, el mismo Context Builder, el mismo Mission Engine y el mismo Project Reader. Su función es certificar la salida del flujo existente.

## Regla central

Toda respuesta de Developer debe estar clasificada antes de razonar:

- Consulta
- Auditoría
- Planificación
- Ejecución
- Bug
- Refactor
- QA
- Deploy

Cada modo activa únicamente los motores necesarios. Los motores bloqueados no pueden aparecer como si hubieran trabajado.

## Auditorías certificables

Una auditoría solo es válida si contiene:

1. Clasificación del intent.
2. Motores activados y motores bloqueados.
3. Fuentes inspeccionadas: documentación, rutas, módulos o archivos reales.
4. Hallazgos con evidencia.
5. Límites: qué no puede concluirse con el contexto disponible.
6. Puntuación por áreas.
7. Veredicto: CERTIFICADO o NO CERTIFICADO.

## Respuestas no certificables

Developer debe rechazar como no certificables las respuestas que:

- Usen checklist genérico sin evidencias.
- Inventen archivos como index.html, about.html, header.php o estructuras ajenas al proyecto.
- Confundan auditoría con planificación.
- Propongan Pull Request cuando el modo es consulta o auditoría.
- Hablen de SEO en un módulo privado como CRM sin justificarlo con una fuente real.
- No citen archivos, docs o rutas reales cuando dicen haber auditado.

## Veredicto

- CERTIFICADO: la respuesta puede entregarse como válida.
- NO CERTIFICADO: Developer debe rehacer contexto o declarar que falta evidencia.

Flow Certification no sustituye a Build Guard ni QA. Para cambios de código, Build Guard y QA siguen siendo obligatorios antes de considerar terminada la misión.
