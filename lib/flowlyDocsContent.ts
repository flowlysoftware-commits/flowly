export type FlowlyDocStatus = "ready" | "draft" | "next";

export type FlowlyDocChapterContent = {
  slug: string;
  title: string;
  summary: string;
  status: FlowlyDocStatus;
  content: string;
};

export type FlowlyDocBook = {
  slug: string;
  title: string;
  badge: string;
  description: string;
  chapters: FlowlyDocChapterContent[];
};

export const flowlyDocBooks: FlowlyDocBook[] = [
  {
    "slug": "constitution",
    "title": "Flowly Constitution",
    "badge": "Identidad",
    "description": "Documento ejecutivo con propósito, principios y promesa fundacional de Flowly OS.",
    "chapters": [
      {
        "slug": "purpose",
        "title": "Purpose",
        "summary": "Flowly existe para construir una nueva generación de software empresarial centrado en la colaboración entre personas e inteligencia artificial.",
        "status": "ready",
        "content": "# Purpose\n\nFlowly existe para construir una nueva generación de software empresarial centrado en la colaboración entre personas e inteligencia artificial.\n\nNo pretende ser simplemente un ERP, un CRM o un chatbot. Flowly OS se define como un **Living Business Operating System**: una plataforma capaz de representar, comprender y acompañar organizaciones vivas.\n\n## Misión\n\nAyudar a las organizaciones a comprenderse mejor, trabajar con más claridad y tomar mejores decisiones.\n\n## Promesa\n\nLa tecnología debe servir a las personas, no sustituirlas. La inteligencia debe ser transparente. La arquitectura debe proteger el futuro.\n"
      },
      {
        "slug": "non-negotiable-principles",
        "title": "Non-Negotiable Principles",
        "summary": "1. El dominio empresarial es el centro. 2. Los Business Objects son la fuente de verdad. 3. La IA nunca posee el dominio. 4. Todo debe ser observable. 5. Todo debe ser ex",
        "status": "ready",
        "content": "# Non-Negotiable Principles\n\n1. El dominio empresarial es el centro.\n2. Los Business Objects son la fuente de verdad.\n3. La IA nunca posee el dominio.\n4. Todo debe ser observable.\n5. Todo debe ser explicable.\n6. Todo debe ser versionable.\n7. Ningún componente es privilegiado.\n8. El usuario conserva el control.\n9. La arquitectura prevalece sobre la implementación.\n10. Flowly se construye para durar décadas.\n"
      },
      {
        "slug": "manifesto",
        "title": "Manifesto",
        "summary": "No queremos construir software que haga más cosas. Queremos construir software que ayude mejor a las personas.",
        "status": "ready",
        "content": "# Manifesto\n\nNo queremos construir software que haga más cosas. Queremos construir software que ayude mejor a las personas.\n\nFlowly no existe para captar atención. Existe para devolver tiempo, claridad y capacidad operativa.\n\nLa IA es una herramienta de colaboración, no una autoridad. Las mejores empresas del futuro no serán las que tengan más IA, sino las que mejor colaboren con ella.\n"
      },
      {
        "slug": "human-control",
        "title": "Human Control",
        "summary": "Flowly puede observar, recomendar, planificar y ejecutar, pero las decisiones relevantes pertenecen a las personas o a políticas explícitamente delegadas.",
        "status": "ready",
        "content": "# Human Control\n\nFlowly puede observar, recomendar, planificar y ejecutar, pero las decisiones relevantes pertenecen a las personas o a políticas explícitamente delegadas.\n\n## Regla\n\nToda acción crítica requiere autorización, política o aprobación humana.\n\n## Consecuencia\n\nEl Companion propone. El usuario decide. El Execution Engine ejecuta solo cuando la decisión está aprobada.\n"
      },
      {
        "slug": "living-business-os",
        "title": "Living Business OS",
        "summary": "Flowly OS es un sistema operativo empresarial vivo.",
        "status": "ready",
        "content": "# Living Business OS\n\nFlowly OS es un sistema operativo empresarial vivo.\n\nRepresenta empresas mediante Business Objects, Capabilities, Engines, Memory, Context, Decisions, Workflows y Companion OS.\n\nSu objetivo no es almacenar datos, sino convertir la información de la organización en conocimiento accionable.\n"
      }
    ]
  },
  {
    "slug": "architecture-bible",
    "title": "Architecture Bible",
    "badge": "Visión",
    "description": "Libro conceptual que define Flowly OS como Living Business Operating System.",
    "chapters": [
      {
        "slug": "vision-foundations",
        "title": "Vision & Foundations",
        "summary": "La base conceptual de Flowly OS como sistema operativo empresarial.",
        "status": "ready",
        "content": "# Vision & Foundations\n\nLa base conceptual de Flowly OS como sistema operativo empresarial.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "business-objects",
        "title": "Business Objects",
        "summary": "El dominio como fuente de verdad y entidad viva.",
        "status": "ready",
        "content": "# Business Objects\n\nEl dominio como fuente de verdad y entidad viva.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "enterprise-knowledge-graph",
        "title": "Enterprise Knowledge Graph",
        "summary": "La empresa como red de entidades, relaciones y conocimiento.",
        "status": "ready",
        "content": "# Enterprise Knowledge Graph\n\nLa empresa como red de entidades, relaciones y conocimiento.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "commands-queries",
        "title": "Commands & Queries",
        "summary": "Separación entre lectura y modificación del dominio.",
        "status": "ready",
        "content": "# Commands & Queries\n\nSeparación entre lectura y modificación del dominio.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "events",
        "title": "Events",
        "summary": "Toda acción relevante deja un hecho observable.",
        "status": "ready",
        "content": "# Events\n\nToda acción relevante deja un hecho observable.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "workflow-engine",
        "title": "Workflow Engine",
        "summary": "Procesos empresariales reutilizables y gobernados.",
        "status": "ready",
        "content": "# Workflow Engine\n\nProcesos empresariales reutilizables y gobernados.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "automation-engine",
        "title": "Automation Engine",
        "summary": "Automatizaciones seguras bajo políticas explícitas.",
        "status": "ready",
        "content": "# Automation Engine\n\nAutomatizaciones seguras bajo políticas explícitas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "context-engine",
        "title": "Context Engine",
        "summary": "Construcción de Context Capsules para cada operación.",
        "status": "ready",
        "content": "# Context Engine\n\nConstrucción de Context Capsules para cada operación.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "memory-engine",
        "title": "Memory Engine",
        "summary": "Memoria empresarial gobernada y reutilizable.",
        "status": "ready",
        "content": "# Memory Engine\n\nMemoria empresarial gobernada y reutilizable.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "learning-engine",
        "title": "Learning Engine",
        "summary": "Aprendizaje a partir de uso, eventos y resultados.",
        "status": "ready",
        "content": "# Learning Engine\n\nAprendizaje a partir de uso, eventos y resultados.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "observation-engine",
        "title": "Observation Engine",
        "summary": "Detección de señales relevantes en el negocio.",
        "status": "ready",
        "content": "# Observation Engine\n\nDetección de señales relevantes en el negocio.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "business-consciousness",
        "title": "Business Consciousness",
        "summary": "Representación del estado vivo de la organización.",
        "status": "ready",
        "content": "# Business Consciousness\n\nRepresentación del estado vivo de la organización.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "knowledge-engine",
        "title": "Knowledge Engine",
        "summary": "Conocimiento explícito conectado al dominio.",
        "status": "ready",
        "content": "# Knowledge Engine\n\nConocimiento explícito conectado al dominio.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "recommendation-engine",
        "title": "Recommendation Engine",
        "summary": "Recomendaciones explicables y contextualizadas.",
        "status": "ready",
        "content": "# Recommendation Engine\n\nRecomendaciones explicables y contextualizadas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "evolution-engine",
        "title": "Evolution Engine",
        "summary": "Transformar aprendizaje en mejoras controladas.",
        "status": "ready",
        "content": "# Evolution Engine\n\nTransformar aprendizaje en mejoras controladas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "companion-os",
        "title": "Companion OS",
        "summary": "La interfaz conversacional, persistente y contextual.",
        "status": "ready",
        "content": "# Companion OS\n\nLa interfaz conversacional, persistente y contextual.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "companion-identity-engine",
        "title": "Companion Identity Engine",
        "summary": "Identidad permanente del Companion.",
        "status": "ready",
        "content": "# Companion Identity Engine\n\nIdentidad permanente del Companion.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "companion-initiative-engine",
        "title": "Companion Initiative Engine",
        "summary": "Cuándo debe intervenir y cuándo callar.",
        "status": "ready",
        "content": "# Companion Initiative Engine\n\nCuándo debe intervenir y cuándo callar.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "conversation-engine",
        "title": "Conversation Engine",
        "summary": "Conversaciones como colaboración persistente.",
        "status": "ready",
        "content": "# Conversation Engine\n\nConversaciones como colaboración persistente.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "multi-agent-collaboration",
        "title": "Multi-Agent Collaboration",
        "summary": "Especialistas internos coordinados por un único Companion.",
        "status": "ready",
        "content": "# Multi-Agent Collaboration\n\nEspecialistas internos coordinados por un único Companion.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "tool-ecosystem",
        "title": "Tool Ecosystem",
        "summary": "Tools como capacidades oficiales y versionadas.",
        "status": "ready",
        "content": "# Tool Ecosystem\n\nTools como capacidades oficiales y versionadas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "extensibility-platform",
        "title": "Extensibility Platform",
        "summary": "Apps, Plugins, Tools y Packs sin romper el Core.",
        "status": "ready",
        "content": "# Extensibility Platform\n\nApps, Plugins, Tools y Packs sin romper el Core.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "identity-trust-engine",
        "title": "Identity & Trust Engine",
        "summary": "Identidades, permisos, delegación y confianza.",
        "status": "ready",
        "content": "# Identity & Trust Engine\n\nIdentidades, permisos, delegación y confianza.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "reasoning-engine",
        "title": "Reasoning Engine",
        "summary": "Razonamiento estructurado y separable del LLM.",
        "status": "ready",
        "content": "# Reasoning Engine\n\nRazonamiento estructurado y separable del LLM.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "decision-engine",
        "title": "Decision Engine",
        "summary": "Evaluar alternativas antes de ejecutar.",
        "status": "ready",
        "content": "# Decision Engine\n\nEvaluar alternativas antes de ejecutar.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "simulation-engine",
        "title": "Simulation Engine",
        "summary": "Escenarios hipotéticos sin modificar el dominio real.",
        "status": "ready",
        "content": "# Simulation Engine\n\nEscenarios hipotéticos sin modificar el dominio real.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "planning-engine",
        "title": "Planning Engine",
        "summary": "Convertir objetivos en planes ejecutables.",
        "status": "ready",
        "content": "# Planning Engine\n\nConvertir objetivos en planes ejecutables.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "execution-engine",
        "title": "Execution Engine",
        "summary": "Convertir planes aprobados en trabajo real.",
        "status": "ready",
        "content": "# Execution Engine\n\nConvertir planes aprobados en trabajo real.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "flowly-cognitive-loop",
        "title": "Flowly Cognitive Loop",
        "summary": "Observación, memoria, razonamiento, decisión y ejecución.",
        "status": "ready",
        "content": "# Flowly Cognitive Loop\n\nObservación, memoria, razonamiento, decisión y ejecución.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "flowly-internal-protocol",
        "title": "Flowly Internal Protocol",
        "summary": "FIP como protocolo oficial de comunicación interna.",
        "status": "ready",
        "content": "# Flowly Internal Protocol\n\nFIP como protocolo oficial de comunicación interna.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "personality-engine",
        "title": "Personality Engine",
        "summary": "Personalidad profesional y adaptativa.",
        "status": "ready",
        "content": "# Personality Engine\n\nPersonalidad profesional y adaptativa.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "avatar-engine",
        "title": "Avatar Engine",
        "summary": "Representación visual viva del Companion.",
        "status": "ready",
        "content": "# Avatar Engine\n\nRepresentación visual viva del Companion.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "voice-engine",
        "title": "Voice Engine",
        "summary": "Conversación hablada natural e interrumpible.",
        "status": "ready",
        "content": "# Voice Engine\n\nConversación hablada natural e interrumpible.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "collaboration-engine",
        "title": "Collaboration Engine",
        "summary": "Relaciones de trabajo persistentes.",
        "status": "ready",
        "content": "# Collaboration Engine\n\nRelaciones de trabajo persistentes.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "presence-engine",
        "title": "Presence Engine",
        "summary": "Presencia contextual del Companion dentro del workspace.",
        "status": "ready",
        "content": "# Presence Engine\n\nPresencia contextual del Companion dentro del workspace.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "app-runtime",
        "title": "App Runtime",
        "summary": "Apps como experiencias sobre el mismo Core.",
        "status": "ready",
        "content": "# App Runtime\n\nApps como experiencias sobre el mismo Core.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "plugin-runtime",
        "title": "Plugin Runtime",
        "summary": "Extensiones aisladas y gobernadas.",
        "status": "ready",
        "content": "# Plugin Runtime\n\nExtensiones aisladas y gobernadas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "business-object-runtime",
        "title": "Business Object Runtime",
        "summary": "Ciclo de vida oficial de entidades empresariales.",
        "status": "ready",
        "content": "# Business Object Runtime\n\nCiclo de vida oficial de entidades empresariales.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "ai-runtime",
        "title": "AI Runtime",
        "summary": "Abstracción universal sobre modelos de IA.",
        "status": "ready",
        "content": "# AI Runtime\n\nAbstracción universal sobre modelos de IA.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "resource-manager",
        "title": "Resource Manager",
        "summary": "Gestión de recursos, costes y capacidad cognitiva.",
        "status": "ready",
        "content": "# Resource Manager\n\nGestión de recursos, costes y capacidad cognitiva.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "governance-engine",
        "title": "Governance Engine",
        "summary": "Políticas como arquitectura.",
        "status": "ready",
        "content": "# Governance Engine\n\nPolíticas como arquitectura.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "evolution-governance",
        "title": "Evolution Governance",
        "summary": "Cambios compatibles, migraciones y deprecaciones.",
        "status": "ready",
        "content": "# Evolution Governance\n\nCambios compatibles, migraciones y deprecaciones.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "observability-platform",
        "title": "Observability Platform",
        "summary": "Trazabilidad completa de negocio, IA y sistema.",
        "status": "ready",
        "content": "# Observability Platform\n\nTrazabilidad completa de negocio, IA y sistema.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "architecture-principles",
        "title": "Architecture Principles",
        "summary": "Principios inmutables de Flowly OS.",
        "status": "ready",
        "content": "# Architecture Principles\n\nPrincipios inmutables de Flowly OS.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "the-living-company",
        "title": "The Living Company",
        "summary": "La empresa como organismo vivo.",
        "status": "ready",
        "content": "# The Living Company\n\nLa empresa como organismo vivo.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "future-of-business-software",
        "title": "Future of Business Software",
        "summary": "La nueva generación de software empresarial.",
        "status": "ready",
        "content": "# Future of Business Software\n\nLa nueva generación de software empresarial.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "flowly-manifesto",
        "title": "Flowly Manifesto",
        "summary": "Por qué existe Flowly.",
        "status": "ready",
        "content": "# Flowly Manifesto\n\nPor qué existe Flowly.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "evolution-roadmap",
        "title": "Evolution Roadmap",
        "summary": "Las etapas de crecimiento de Flowly OS.",
        "status": "ready",
        "content": "# Evolution Roadmap\n\nLas etapas de crecimiento de Flowly OS.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "flowly-os-constitution",
        "title": "Flowly OS Constitution",
        "summary": "La norma superior del sistema operativo.",
        "status": "ready",
        "content": "# Flowly OS Constitution\n\nLa norma superior del sistema operativo.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "reference-architecture-bridge",
        "title": "Reference Architecture Bridge",
        "summary": "Puente entre visión conceptual e implementación técnica.",
        "status": "ready",
        "content": "# Reference Architecture Bridge\n\nPuente entre visión conceptual e implementación técnica.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      }
    ]
  },
  {
    "slug": "reference-architecture",
    "title": "Reference Architecture",
    "badge": "Arquitectura",
    "description": "Plano técnico de Kernel, Engines, Capabilities, Organizations, Identity, Context y Governance.",
    "chapters": [
      {
        "slug": "the-big-picture",
        "title": "The Big Picture",
        "summary": "Vista global de las capas principales de Flowly OS.",
        "status": "ready",
        "content": "# The Big Picture\n\nVista global de las capas principales de Flowly OS.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "system-flow",
        "title": "System Flow",
        "summary": "Flujo oficial de una operación dentro de Flowly.",
        "status": "ready",
        "content": "# System Flow\n\nFlujo oficial de una operación dentro de Flowly.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "repository-architecture",
        "title": "Repository Architecture",
        "summary": "Organización física del repositorio.",
        "status": "ready",
        "content": "# Repository Architecture\n\nOrganización física del repositorio.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "communication-architecture",
        "title": "Communication Architecture",
        "summary": "Commands, Queries, Events, Contracts y Capabilities.",
        "status": "ready",
        "content": "# Communication Architecture\n\nCommands, Queries, Events, Contracts y Capabilities.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "responsibility-map",
        "title": "Responsibility Map",
        "summary": "Responsabilidad única por componente.",
        "status": "ready",
        "content": "# Responsibility Map\n\nResponsabilidad única por componente.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "domain-architecture",
        "title": "Domain Architecture",
        "summary": "El dominio como núcleo independiente.",
        "status": "draft",
        "content": "# Domain Architecture\n\nEl dominio como núcleo independiente.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "business-object-architecture",
        "title": "Business Object Architecture",
        "summary": "Estructura oficial de Business Objects.",
        "status": "ready",
        "content": "# Business Object Architecture\n\nEstructura oficial de Business Objects.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "business-object-registry",
        "title": "Business Object Registry",
        "summary": "Catálogo central del dominio.",
        "status": "ready",
        "content": "# Business Object Registry\n\nCatálogo central del dominio.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "relationship-architecture",
        "title": "Relationship Architecture",
        "summary": "Relaciones semánticas entre objetos.",
        "status": "ready",
        "content": "# Relationship Architecture\n\nRelaciones semánticas entre objetos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "capability-architecture",
        "title": "Capability Architecture",
        "summary": "Funcionalidad reutilizable basada en capacidades.",
        "status": "ready",
        "content": "# Capability Architecture\n\nFuncionalidad reutilizable basada en capacidades.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "capability-registry",
        "title": "Capability Registry",
        "summary": "Registro y descubrimiento de capacidades.",
        "status": "ready",
        "content": "# Capability Registry\n\nRegistro y descubrimiento de capacidades.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "capability-runtime",
        "title": "Capability Runtime",
        "summary": "Ejecución segura de capacidades.",
        "status": "ready",
        "content": "# Capability Runtime\n\nEjecución segura de capacidades.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "application-architecture",
        "title": "Application Architecture",
        "summary": "Apps como experiencias sin dominio propio.",
        "status": "ready",
        "content": "# Application Architecture\n\nApps como experiencias sin dominio propio.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "plugin-architecture",
        "title": "Plugin Architecture",
        "summary": "Extensiones mediante contratos oficiales.",
        "status": "ready",
        "content": "# Plugin Architecture\n\nExtensiones mediante contratos oficiales.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "engine-architecture",
        "title": "Engine Architecture",
        "summary": "Diseño uniforme de Engines.",
        "status": "ready",
        "content": "# Engine Architecture\n\nDiseño uniforme de Engines.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "engine-orchestration",
        "title": "Engine Orchestration",
        "summary": "Coordinación dinámica entre Engines.",
        "status": "ready",
        "content": "# Engine Orchestration\n\nCoordinación dinámica entre Engines.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "kernel-architecture",
        "title": "Kernel Architecture",
        "summary": "Servicios permanentes que sostienen Flowly OS.",
        "status": "ready",
        "content": "# Kernel Architecture\n\nServicios permanentes que sostienen Flowly OS.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "organization-architecture",
        "title": "Organization Architecture",
        "summary": "Aislamiento multiempresa completo.",
        "status": "ready",
        "content": "# Organization Architecture\n\nAislamiento multiempresa completo.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "identity-architecture",
        "title": "Identity Architecture",
        "summary": "Toda entidad que actúa tiene identidad.",
        "status": "ready",
        "content": "# Identity Architecture\n\nToda entidad que actúa tiene identidad.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "authorization-architecture",
        "title": "Authorization Architecture",
        "summary": "Permisos dinámicos, contexto y políticas.",
        "status": "ready",
        "content": "# Authorization Architecture\n\nPermisos dinámicos, contexto y políticas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "memory-architecture",
        "title": "Memory Architecture",
        "summary": "Memoria empresarial estructurada.",
        "status": "ready",
        "content": "# Memory Architecture\n\nMemoria empresarial estructurada.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "context-architecture",
        "title": "Context Architecture",
        "summary": "Context Capsules para cada operación.",
        "status": "ready",
        "content": "# Context Architecture\n\nContext Capsules para cada operación.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "reasoning-architecture",
        "title": "Reasoning Architecture",
        "summary": "Razonamiento independiente del proveedor de IA.",
        "status": "draft",
        "content": "# Reasoning Architecture\n\nRazonamiento independiente del proveedor de IA.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "planning-architecture",
        "title": "Planning Architecture",
        "summary": "Objetivos transformados en planes.",
        "status": "ready",
        "content": "# Planning Architecture\n\nObjetivos transformados en planes.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "decision-architecture",
        "title": "Decision Architecture",
        "summary": "Evaluación de alternativas antes de ejecutar.",
        "status": "ready",
        "content": "# Decision Architecture\n\nEvaluación de alternativas antes de ejecutar.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "execution-architecture",
        "title": "Execution Architecture",
        "summary": "Ejecución idempotente y observable.",
        "status": "ready",
        "content": "# Execution Architecture\n\nEjecución idempotente y observable.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "tool-architecture",
        "title": "Tool Architecture",
        "summary": "Integraciones externas encapsuladas.",
        "status": "ready",
        "content": "# Tool Architecture\n\nIntegraciones externas encapsuladas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "ai-runtime-architecture",
        "title": "AI Runtime Architecture",
        "summary": "Abstracción sobre proveedores y modelos.",
        "status": "ready",
        "content": "# AI Runtime Architecture\n\nAbstracción sobre proveedores y modelos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "observability-architecture",
        "title": "Observability Architecture",
        "summary": "Logs, métricas, traces, events y health.",
        "status": "ready",
        "content": "# Observability Architecture\n\nLogs, métricas, traces, events y health.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "governance-architecture",
        "title": "Governance Architecture",
        "summary": "Políticas, compliance, IA responsable y retención.",
        "status": "ready",
        "content": "# Governance Architecture\n\nPolíticas, compliance, IA responsable y retención.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "evolution-architecture",
        "title": "Evolution Architecture",
        "summary": "Versionado, migraciones y compatibilidad.",
        "status": "ready",
        "content": "# Evolution Architecture\n\nVersionado, migraciones y compatibilidad.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "architectural-principles",
        "title": "Architectural Principles",
        "summary": "Principios finales de la arquitectura técnica.",
        "status": "ready",
        "content": "# Architectural Principles\n\nPrincipios finales de la arquitectura técnica.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      }
    ]
  },
  {
    "slug": "engineering-handbook",
    "title": "Engineering Handbook",
    "badge": "Ingeniería",
    "description": "Manual oficial para programar Flowly respetando arquitectura, calidad, testing y cultura técnica.",
    "chapters": [
      {
        "slug": "engineering-philosophy",
        "title": "Engineering Philosophy",
        "summary": "Filosofía oficial de desarrollo de Flowly OS.",
        "status": "ready",
        "content": "# Engineering Philosophy\n\nFilosofía oficial de desarrollo de Flowly OS.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "project-structure",
        "title": "Project Structure",
        "summary": "Estructura oficial del código y monorepo.",
        "status": "ready",
        "content": "# Project Structure\n\nEstructura oficial del código y monorepo.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "coding-standards",
        "title": "Coding Standards",
        "summary": "Estándares TypeScript, nombres, errores y observabilidad.",
        "status": "ready",
        "content": "# Coding Standards\n\nEstándares TypeScript, nombres, errores y observabilidad.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "business-object-development",
        "title": "Business Object Development",
        "summary": "Cómo crear Business Objects completos y consistentes.",
        "status": "ready",
        "content": "# Business Object Development\n\nCómo crear Business Objects completos y consistentes.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "capability-development",
        "title": "Capability Development",
        "summary": "Cómo crear Capabilities con contratos, tests y eventos.",
        "status": "ready",
        "content": "# Capability Development\n\nCómo crear Capabilities con contratos, tests y eventos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "engine-development",
        "title": "Engine Development",
        "summary": "Cómo desarrollar Engines transversales.",
        "status": "ready",
        "content": "# Engine Development\n\nCómo desarrollar Engines transversales.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "app-development",
        "title": "App Development",
        "summary": "Cómo crear Apps sin contaminar el dominio.",
        "status": "ready",
        "content": "# App Development\n\nCómo crear Apps sin contaminar el dominio.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "plugin-development",
        "title": "Plugin Development",
        "summary": "Cómo desarrollar Plugins seguros y gobernados.",
        "status": "ready",
        "content": "# Plugin Development\n\nCómo desarrollar Plugins seguros y gobernados.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "api-development",
        "title": "API Development",
        "summary": "Cómo exponer Capabilities mediante APIs públicas.",
        "status": "ready",
        "content": "# API Development\n\nCómo exponer Capabilities mediante APIs públicas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "documentation-standards",
        "title": "Documentation Standards",
        "summary": "Documentación viva, ADR, README y contratos.",
        "status": "ready",
        "content": "# Documentation Standards\n\nDocumentación viva, ADR, README y contratos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "testing-strategy",
        "title": "Testing Strategy",
        "summary": "Unit, Contract, Integration, E2E, Architecture y AI tests.",
        "status": "ready",
        "content": "# Testing Strategy\n\nUnit, Contract, Integration, E2E, Architecture y AI tests.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "ci-cd-release-strategy",
        "title": "CI/CD & Release Strategy",
        "summary": "Integración continua, quality gates, releases y rollback.",
        "status": "ready",
        "content": "# CI/CD & Release Strategy\n\nIntegración continua, quality gates, releases y rollback.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "ai-assisted-development",
        "title": "AI-Assisted Development",
        "summary": "Cómo usar IA para desarrollar sin romper arquitectura.",
        "status": "ready",
        "content": "# AI-Assisted Development\n\nCómo usar IA para desarrollar sin romper arquitectura.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "engineering-culture",
        "title": "Engineering Culture",
        "summary": "Cultura técnica, responsabilidad y calidad a largo plazo.",
        "status": "ready",
        "content": "# Engineering Culture\n\nCultura técnica, responsabilidad y calidad a largo plazo.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      }
    ]
  },
  {
    "slug": "implementation-blueprint",
    "title": "Implementation Blueprint",
    "badge": "Construcción",
    "description": "Plan técnico para construir Flowly sobre el proyecto actual con Supabase, Next.js, Vercel y GitHub.",
    "chapters": [
      {
        "slug": "implementation-strategy",
        "title": "01-implementation-strategy",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "existing-project-assessment",
        "title": "02-existing-project-assessment",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "monorepo-setup",
        "title": "03-monorepo-setup",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "environment-configuration",
        "title": "04-environment-configuration",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "supabase-foundation",
        "title": "05-supabase-foundation",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "organization-foundation",
        "title": "06-organization-foundation",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "identity-foundation",
        "title": "07-identity-foundation",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "authorization-foundation",
        "title": "08-authorization-foundation",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "kernel-minimal-version",
        "title": "09-kernel-minimal-version",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "capability-runtime-mvp",
        "title": "10-capability-runtime-mvp",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "business-object-runtime-mvp",
        "title": "11-business-object-runtime-mvp",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "event-system-mvp",
        "title": "12-event-system-mvp",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "observability-mvp",
        "title": "13-observability-mvp",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "docs-module",
        "title": "14-docs-module",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "crm-foundation",
        "title": "15-crm-foundation",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "finance-foundation",
        "title": "16-finance-foundation",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "commercial-panel",
        "title": "17-commercial-panel",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "whatsapp-foundation",
        "title": "18-whatsapp-foundation",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "companion-mvp",
        "title": "19-companion-mvp",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "memory-mvp",
        "title": "20-memory-mvp",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "context-mvp",
        "title": "21-context-mvp",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "ai-runtime-mvp",
        "title": "22-ai-runtime-mvp",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "document-generation",
        "title": "23-document-generation",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "workflow-mvp",
        "title": "24-workflow-mvp",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "marketplace-skeleton",
        "title": "25-marketplace-skeleton",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "testing-setup",
        "title": "26-testing-setup",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "ci-cd-setup",
        "title": "27-ci-cd-setup",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "migration-from-current-flowly",
        "title": "28-migration-from-current-flowly",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "mvp-scope",
        "title": "29-mvp-scope",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "beta-launch-plan",
        "title": "30-beta-launch-plan",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "performance-baseline",
        "title": "31-performance-baseline",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "security-baseline",
        "title": "32-security-baseline",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "backup-recovery",
        "title": "33-backup-recovery",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "roadmap-90-days",
        "title": "34-roadmap-90-days",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "roadmap-12-months",
        "title": "35-roadmap-12-months",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      }
    ]
  },
  {
    "slug": "domain-catalog",
    "title": "Domain Catalog",
    "badge": "Dominio",
    "description": "Catálogo oficial de Business Objects, relaciones, estados, Commands, Queries, Events y Policies.",
    "chapters": [
      {
        "slug": "customer",
        "title": "Customer",
        "summary": "Cliente con historial, relaciones, métricas y capacidades comerciales.",
        "status": "draft",
        "content": "# Customer\n\nCliente con historial, relaciones, métricas y capacidades comerciales.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Customer`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateCustomer\n- UpdateCustomer\n- ArchiveCustomer\n\n## Queries iniciales\n\n- GetCustomer\n- SearchCustomer\n- ListCustomers\n\n## Events iniciales\n\n- CustomerCreated\n- CustomerUpdated\n- CustomerArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Customer\n- Update Customer\n- Archive Customer\n- Analyze Customer\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "contact",
        "title": "Contact",
        "summary": "Persona de contacto vinculada a clientes, empresas y oportunidades.",
        "status": "draft",
        "content": "# Contact\n\nPersona de contacto vinculada a clientes, empresas y oportunidades.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Contact`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateContact\n- UpdateContact\n- ArchiveContact\n\n## Queries iniciales\n\n- GetContact\n- SearchContact\n- ListContacts\n\n## Events iniciales\n\n- ContactCreated\n- ContactUpdated\n- ContactArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Contact\n- Update Contact\n- Archive Contact\n- Analyze Contact\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "company",
        "title": "Company",
        "summary": "Empresa u organización externa con relaciones comerciales y fiscales.",
        "status": "draft",
        "content": "# Company\n\nEmpresa u organización externa con relaciones comerciales y fiscales.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Company`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateCompany\n- UpdateCompany\n- ArchiveCompany\n\n## Queries iniciales\n\n- GetCompany\n- SearchCompany\n- ListCompanys\n\n## Events iniciales\n\n- CompanyCreated\n- CompanyUpdated\n- CompanyArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Company\n- Update Company\n- Archive Company\n- Analyze Company\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "lead",
        "title": "Lead",
        "summary": "Contacto comercial inicial antes de ser cualificado.",
        "status": "draft",
        "content": "# Lead\n\nContacto comercial inicial antes de ser cualificado.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Lead`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateLead\n- UpdateLead\n- ArchiveLead\n\n## Queries iniciales\n\n- GetLead\n- SearchLead\n- ListLeads\n\n## Events iniciales\n\n- LeadCreated\n- LeadUpdated\n- LeadArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Lead\n- Update Lead\n- Archive Lead\n- Analyze Lead\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "opportunity",
        "title": "Opportunity",
        "summary": "Oportunidad comercial con etapas, valor y probabilidad.",
        "status": "draft",
        "content": "# Opportunity\n\nOportunidad comercial con etapas, valor y probabilidad.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Opportunity`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateOpportunity\n- UpdateOpportunity\n- ArchiveOpportunity\n\n## Queries iniciales\n\n- GetOpportunity\n- SearchOpportunity\n- ListOpportunitys\n\n## Events iniciales\n\n- OpportunityCreated\n- OpportunityUpdated\n- OpportunityArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Opportunity\n- Update Opportunity\n- Archive Opportunity\n- Analyze Opportunity\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "proposal",
        "title": "Proposal",
        "summary": "Propuesta comercial generada para un cliente.",
        "status": "draft",
        "content": "# Proposal\n\nPropuesta comercial generada para un cliente.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Proposal`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateProposal\n- UpdateProposal\n- ArchiveProposal\n\n## Queries iniciales\n\n- GetProposal\n- SearchProposal\n- ListProposals\n\n## Events iniciales\n\n- ProposalCreated\n- ProposalUpdated\n- ProposalArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Proposal\n- Update Proposal\n- Archive Proposal\n- Analyze Proposal\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "quote",
        "title": "Quote",
        "summary": "Presupuesto formal con líneas, importes y aprobación.",
        "status": "draft",
        "content": "# Quote\n\nPresupuesto formal con líneas, importes y aprobación.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Quote`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateQuote\n- UpdateQuote\n- ArchiveQuote\n\n## Queries iniciales\n\n- GetQuote\n- SearchQuote\n- ListQuotes\n\n## Events iniciales\n\n- QuoteCreated\n- QuoteUpdated\n- QuoteArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Quote\n- Update Quote\n- Archive Quote\n- Analyze Quote\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "invoice",
        "title": "Invoice",
        "summary": "Factura fiscal con estados, documentos y pagos.",
        "status": "draft",
        "content": "# Invoice\n\nFactura fiscal con estados, documentos y pagos.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Invoice`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateInvoice\n- UpdateInvoice\n- ArchiveInvoice\n\n## Queries iniciales\n\n- GetInvoice\n- SearchInvoice\n- ListInvoices\n\n## Events iniciales\n\n- InvoiceCreated\n- InvoiceUpdated\n- InvoiceArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Invoice\n- Update Invoice\n- Archive Invoice\n- Analyze Invoice\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "expense",
        "title": "Expense",
        "summary": "Gasto registrado con justificante y aprobación.",
        "status": "draft",
        "content": "# Expense\n\nGasto registrado con justificante y aprobación.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Expense`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateExpense\n- UpdateExpense\n- ArchiveExpense\n\n## Queries iniciales\n\n- GetExpense\n- SearchExpense\n- ListExpenses\n\n## Events iniciales\n\n- ExpenseCreated\n- ExpenseUpdated\n- ExpenseArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Expense\n- Update Expense\n- Archive Expense\n- Analyze Expense\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "budget",
        "title": "Budget",
        "summary": "Presupuesto interno o externo para planificación financiera.",
        "status": "draft",
        "content": "# Budget\n\nPresupuesto interno o externo para planificación financiera.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Budget`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateBudget\n- UpdateBudget\n- ArchiveBudget\n\n## Queries iniciales\n\n- GetBudget\n- SearchBudget\n- ListBudgets\n\n## Events iniciales\n\n- BudgetCreated\n- BudgetUpdated\n- BudgetArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Budget\n- Update Budget\n- Archive Budget\n- Analyze Budget\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "payment",
        "title": "Payment",
        "summary": "Pago recibido o emitido vinculado a facturas o gastos.",
        "status": "draft",
        "content": "# Payment\n\nPago recibido o emitido vinculado a facturas o gastos.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Payment`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreatePayment\n- UpdatePayment\n- ArchivePayment\n\n## Queries iniciales\n\n- GetPayment\n- SearchPayment\n- ListPayments\n\n## Events iniciales\n\n- PaymentCreated\n- PaymentUpdated\n- PaymentArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Payment\n- Update Payment\n- Archive Payment\n- Analyze Payment\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "subscription",
        "title": "Subscription",
        "summary": "Relación recurrente de servicio, plan y cobro.",
        "status": "draft",
        "content": "# Subscription\n\nRelación recurrente de servicio, plan y cobro.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Subscription`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateSubscription\n- UpdateSubscription\n- ArchiveSubscription\n\n## Queries iniciales\n\n- GetSubscription\n- SearchSubscription\n- ListSubscriptions\n\n## Events iniciales\n\n- SubscriptionCreated\n- SubscriptionUpdated\n- SubscriptionArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Subscription\n- Update Subscription\n- Archive Subscription\n- Analyze Subscription\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "tax-document",
        "title": "Tax Document",
        "summary": "Documento fiscal asociado a facturación, impuestos o cumplimiento.",
        "status": "draft",
        "content": "# Tax Document\n\nDocumento fiscal asociado a facturación, impuestos o cumplimiento.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `TaxDocument`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateTaxDocument\n- UpdateTaxDocument\n- ArchiveTaxDocument\n\n## Queries iniciales\n\n- GetTaxDocument\n- SearchTaxDocument\n- ListTaxDocuments\n\n## Events iniciales\n\n- TaxDocumentCreated\n- TaxDocumentUpdated\n- TaxDocumentArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Tax Document\n- Update Tax Document\n- Archive Tax Document\n- Analyze Tax Document\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "project",
        "title": "Project",
        "summary": "Proyecto con fases, tareas, responsables y entregables.",
        "status": "draft",
        "content": "# Project\n\nProyecto con fases, tareas, responsables y entregables.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Project`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateProject\n- UpdateProject\n- ArchiveProject\n\n## Queries iniciales\n\n- GetProject\n- SearchProject\n- ListProjects\n\n## Events iniciales\n\n- ProjectCreated\n- ProjectUpdated\n- ProjectArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Project\n- Update Project\n- Archive Project\n- Analyze Project\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "task",
        "title": "Task",
        "summary": "Unidad de trabajo asignable y medible.",
        "status": "draft",
        "content": "# Task\n\nUnidad de trabajo asignable y medible.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Task`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateTask\n- UpdateTask\n- ArchiveTask\n\n## Queries iniciales\n\n- GetTask\n- SearchTask\n- ListTasks\n\n## Events iniciales\n\n- TaskCreated\n- TaskUpdated\n- TaskArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Task\n- Update Task\n- Archive Task\n- Analyze Task\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "milestone",
        "title": "Milestone",
        "summary": "Hito verificable dentro de un proyecto o plan.",
        "status": "draft",
        "content": "# Milestone\n\nHito verificable dentro de un proyecto o plan.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Milestone`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateMilestone\n- UpdateMilestone\n- ArchiveMilestone\n\n## Queries iniciales\n\n- GetMilestone\n- SearchMilestone\n- ListMilestones\n\n## Events iniciales\n\n- MilestoneCreated\n- MilestoneUpdated\n- MilestoneArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Milestone\n- Update Milestone\n- Archive Milestone\n- Analyze Milestone\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "deliverable",
        "title": "Deliverable",
        "summary": "Resultado entregable asociado a proyecto, cliente u objetivo.",
        "status": "draft",
        "content": "# Deliverable\n\nResultado entregable asociado a proyecto, cliente u objetivo.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Deliverable`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateDeliverable\n- UpdateDeliverable\n- ArchiveDeliverable\n\n## Queries iniciales\n\n- GetDeliverable\n- SearchDeliverable\n- ListDeliverables\n\n## Events iniciales\n\n- DeliverableCreated\n- DeliverableUpdated\n- DeliverableArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Deliverable\n- Update Deliverable\n- Archive Deliverable\n- Analyze Deliverable\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "objective",
        "title": "Objective",
        "summary": "Objetivo empresarial como Business Object vivo.",
        "status": "draft",
        "content": "# Objective\n\nObjetivo empresarial como Business Object vivo.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Objective`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateObjective\n- UpdateObjective\n- ArchiveObjective\n\n## Queries iniciales\n\n- GetObjective\n- SearchObjective\n- ListObjectives\n\n## Events iniciales\n\n- ObjectiveCreated\n- ObjectiveUpdated\n- ObjectiveArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Objective\n- Update Objective\n- Archive Objective\n- Analyze Objective\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "collaboration",
        "title": "Collaboration",
        "summary": "Relación de trabajo persistente entre usuarios, Companion y objetivos.",
        "status": "draft",
        "content": "# Collaboration\n\nRelación de trabajo persistente entre usuarios, Companion y objetivos.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Collaboration`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateCollaboration\n- UpdateCollaboration\n- ArchiveCollaboration\n\n## Queries iniciales\n\n- GetCollaboration\n- SearchCollaboration\n- ListCollaborations\n\n## Events iniciales\n\n- CollaborationCreated\n- CollaborationUpdated\n- CollaborationArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Collaboration\n- Update Collaboration\n- Archive Collaboration\n- Analyze Collaboration\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "decision",
        "title": "Decision",
        "summary": "Decisión registrada con alternativas, criterios, contexto y resultado.",
        "status": "draft",
        "content": "# Decision\n\nDecisión registrada con alternativas, criterios, contexto y resultado.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Decision`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateDecision\n- UpdateDecision\n- ArchiveDecision\n\n## Queries iniciales\n\n- GetDecision\n- SearchDecision\n- ListDecisions\n\n## Events iniciales\n\n- DecisionCreated\n- DecisionUpdated\n- DecisionArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Decision\n- Update Decision\n- Archive Decision\n- Analyze Decision\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "document",
        "title": "Document",
        "summary": "Archivo o documento estructurado con metadatos y conocimiento.",
        "status": "draft",
        "content": "# Document\n\nArchivo o documento estructurado con metadatos y conocimiento.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Document`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateDocument\n- UpdateDocument\n- ArchiveDocument\n\n## Queries iniciales\n\n- GetDocument\n- SearchDocument\n- ListDocuments\n\n## Events iniciales\n\n- DocumentCreated\n- DocumentUpdated\n- DocumentArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Document\n- Update Document\n- Archive Document\n- Analyze Document\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "knowledge-article",
        "title": "Knowledge Article",
        "summary": "Artículo de conocimiento reusable por personas y Companion.",
        "status": "draft",
        "content": "# Knowledge Article\n\nArtículo de conocimiento reusable por personas y Companion.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `KnowledgeArticle`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateKnowledgeArticle\n- UpdateKnowledgeArticle\n- ArchiveKnowledgeArticle\n\n## Queries iniciales\n\n- GetKnowledgeArticle\n- SearchKnowledgeArticle\n- ListKnowledgeArticles\n\n## Events iniciales\n\n- KnowledgeArticleCreated\n- KnowledgeArticleUpdated\n- KnowledgeArticleArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Knowledge Article\n- Update Knowledge Article\n- Archive Knowledge Article\n- Analyze Knowledge Article\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "meeting",
        "title": "Meeting",
        "summary": "Reunión con asistentes, agenda, notas y decisiones.",
        "status": "draft",
        "content": "# Meeting\n\nReunión con asistentes, agenda, notas y decisiones.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Meeting`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateMeeting\n- UpdateMeeting\n- ArchiveMeeting\n\n## Queries iniciales\n\n- GetMeeting\n- SearchMeeting\n- ListMeetings\n\n## Events iniciales\n\n- MeetingCreated\n- MeetingUpdated\n- MeetingArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Meeting\n- Update Meeting\n- Archive Meeting\n- Analyze Meeting\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "note",
        "title": "Note",
        "summary": "Nota contextual asociada a objetos o colaboraciones.",
        "status": "draft",
        "content": "# Note\n\nNota contextual asociada a objetos o colaboraciones.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Note`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateNote\n- UpdateNote\n- ArchiveNote\n\n## Queries iniciales\n\n- GetNote\n- SearchNote\n- ListNotes\n\n## Events iniciales\n\n- NoteCreated\n- NoteUpdated\n- NoteArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Note\n- Update Note\n- Archive Note\n- Analyze Note\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "employee",
        "title": "Employee",
        "summary": "Empleado con rol, equipo, disponibilidad y relación operativa.",
        "status": "draft",
        "content": "# Employee\n\nEmpleado con rol, equipo, disponibilidad y relación operativa.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Employee`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateEmployee\n- UpdateEmployee\n- ArchiveEmployee\n\n## Queries iniciales\n\n- GetEmployee\n- SearchEmployee\n- ListEmployees\n\n## Events iniciales\n\n- EmployeeCreated\n- EmployeeUpdated\n- EmployeeArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Employee\n- Update Employee\n- Archive Employee\n- Analyze Employee\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "user",
        "title": "User",
        "summary": "Identidad humana autenticada dentro de Flowly.",
        "status": "draft",
        "content": "# User\n\nIdentidad humana autenticada dentro de Flowly.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `User`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateUser\n- UpdateUser\n- ArchiveUser\n\n## Queries iniciales\n\n- GetUser\n- SearchUser\n- ListUsers\n\n## Events iniciales\n\n- UserCreated\n- UserUpdated\n- UserArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create User\n- Update User\n- Archive User\n- Analyze User\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "team",
        "title": "Team",
        "summary": "Grupo de usuarios con objetivos, permisos y responsabilidades.",
        "status": "draft",
        "content": "# Team\n\nGrupo de usuarios con objetivos, permisos y responsabilidades.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Team`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateTeam\n- UpdateTeam\n- ArchiveTeam\n\n## Queries iniciales\n\n- GetTeam\n- SearchTeam\n- ListTeams\n\n## Events iniciales\n\n- TeamCreated\n- TeamUpdated\n- TeamArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Team\n- Update Team\n- Archive Team\n- Analyze Team\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "role",
        "title": "Role",
        "summary": "Agrupación de capacidades y permisos.",
        "status": "draft",
        "content": "# Role\n\nAgrupación de capacidades y permisos.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Role`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateRole\n- UpdateRole\n- ArchiveRole\n\n## Queries iniciales\n\n- GetRole\n- SearchRole\n- ListRoles\n\n## Events iniciales\n\n- RoleCreated\n- RoleUpdated\n- RoleArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Role\n- Update Role\n- Archive Role\n- Analyze Role\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "department",
        "title": "Department",
        "summary": "Unidad organizativa dentro de una Organization.",
        "status": "draft",
        "content": "# Department\n\nUnidad organizativa dentro de una Organization.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Department`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateDepartment\n- UpdateDepartment\n- ArchiveDepartment\n\n## Queries iniciales\n\n- GetDepartment\n- SearchDepartment\n- ListDepartments\n\n## Events iniciales\n\n- DepartmentCreated\n- DepartmentUpdated\n- DepartmentArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Department\n- Update Department\n- Archive Department\n- Analyze Department\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "business-unit",
        "title": "Business Unit",
        "summary": "Unidad de negocio con objetivos y métricas propias.",
        "status": "draft",
        "content": "# Business Unit\n\nUnidad de negocio con objetivos y métricas propias.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `BusinessUnit`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateBusinessUnit\n- UpdateBusinessUnit\n- ArchiveBusinessUnit\n\n## Queries iniciales\n\n- GetBusinessUnit\n- SearchBusinessUnit\n- ListBusinessUnits\n\n## Events iniciales\n\n- BusinessUnitCreated\n- BusinessUnitUpdated\n- BusinessUnitArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Business Unit\n- Update Business Unit\n- Archive Business Unit\n- Analyze Business Unit\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "campaign",
        "title": "Campaign",
        "summary": "Campaña de marketing o ventas con audiencia, canal y resultados.",
        "status": "draft",
        "content": "# Campaign\n\nCampaña de marketing o ventas con audiencia, canal y resultados.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Campaign`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateCampaign\n- UpdateCampaign\n- ArchiveCampaign\n\n## Queries iniciales\n\n- GetCampaign\n- SearchCampaign\n- ListCampaigns\n\n## Events iniciales\n\n- CampaignCreated\n- CampaignUpdated\n- CampaignArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Campaign\n- Update Campaign\n- Archive Campaign\n- Analyze Campaign\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "audience",
        "title": "Audience",
        "summary": "Segmento de personas o empresas para campañas.",
        "status": "draft",
        "content": "# Audience\n\nSegmento de personas o empresas para campañas.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Audience`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateAudience\n- UpdateAudience\n- ArchiveAudience\n\n## Queries iniciales\n\n- GetAudience\n- SearchAudience\n- ListAudiences\n\n## Events iniciales\n\n- AudienceCreated\n- AudienceUpdated\n- AudienceArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Audience\n- Update Audience\n- Archive Audience\n- Analyze Audience\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "content",
        "title": "Content",
        "summary": "Pieza de contenido para marketing, soporte o documentación.",
        "status": "draft",
        "content": "# Content\n\nPieza de contenido para marketing, soporte o documentación.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Content`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateContent\n- UpdateContent\n- ArchiveContent\n\n## Queries iniciales\n\n- GetContent\n- SearchContent\n- ListContents\n\n## Events iniciales\n\n- ContentCreated\n- ContentUpdated\n- ContentArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Content\n- Update Content\n- Archive Content\n- Analyze Content\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "landing-page",
        "title": "Landing Page",
        "summary": "Página de captación conectada con campañas y formularios.",
        "status": "draft",
        "content": "# Landing Page\n\nPágina de captación conectada con campañas y formularios.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `LandingPage`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateLandingPage\n- UpdateLandingPage\n- ArchiveLandingPage\n\n## Queries iniciales\n\n- GetLandingPage\n- SearchLandingPage\n- ListLandingPages\n\n## Events iniciales\n\n- LandingPageCreated\n- LandingPageUpdated\n- LandingPageArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Landing Page\n- Update Landing Page\n- Archive Landing Page\n- Analyze Landing Page\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "form",
        "title": "Form",
        "summary": "Formulario capturador de datos y generador de eventos.",
        "status": "draft",
        "content": "# Form\n\nFormulario capturador de datos y generador de eventos.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Form`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateForm\n- UpdateForm\n- ArchiveForm\n\n## Queries iniciales\n\n- GetForm\n- SearchForm\n- ListForms\n\n## Events iniciales\n\n- FormCreated\n- FormUpdated\n- FormArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Form\n- Update Form\n- Archive Form\n- Analyze Form\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "ticket",
        "title": "Ticket",
        "summary": "Solicitud o incidencia de soporte con SLA y resolución.",
        "status": "draft",
        "content": "# Ticket\n\nSolicitud o incidencia de soporte con SLA y resolución.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Ticket`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateTicket\n- UpdateTicket\n- ArchiveTicket\n\n## Queries iniciales\n\n- GetTicket\n- SearchTicket\n- ListTickets\n\n## Events iniciales\n\n- TicketCreated\n- TicketUpdated\n- TicketArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Ticket\n- Update Ticket\n- Archive Ticket\n- Analyze Ticket\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "incident",
        "title": "Incident",
        "summary": "Incidencia operativa, técnica o de cliente.",
        "status": "draft",
        "content": "# Incident\n\nIncidencia operativa, técnica o de cliente.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Incident`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateIncident\n- UpdateIncident\n- ArchiveIncident\n\n## Queries iniciales\n\n- GetIncident\n- SearchIncident\n- ListIncidents\n\n## Events iniciales\n\n- IncidentCreated\n- IncidentUpdated\n- IncidentArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Incident\n- Update Incident\n- Archive Incident\n- Analyze Incident\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "sla",
        "title": "SLA",
        "summary": "Acuerdo de nivel de servicio medible.",
        "status": "draft",
        "content": "# SLA\n\nAcuerdo de nivel de servicio medible.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `SLA`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateSLA\n- UpdateSLA\n- ArchiveSLA\n\n## Queries iniciales\n\n- GetSLA\n- SearchSLA\n- ListSLAs\n\n## Events iniciales\n\n- SLACreated\n- SLAUpdated\n- SLAArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create SLA\n- Update SLA\n- Archive SLA\n- Analyze SLA\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "supplier",
        "title": "Supplier",
        "summary": "Proveedor con contratos, pedidos, gastos y rendimiento.",
        "status": "draft",
        "content": "# Supplier\n\nProveedor con contratos, pedidos, gastos y rendimiento.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Supplier`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateSupplier\n- UpdateSupplier\n- ArchiveSupplier\n\n## Queries iniciales\n\n- GetSupplier\n- SearchSupplier\n- ListSuppliers\n\n## Events iniciales\n\n- SupplierCreated\n- SupplierUpdated\n- SupplierArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Supplier\n- Update Supplier\n- Archive Supplier\n- Analyze Supplier\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "purchase-order",
        "title": "Purchase Order",
        "summary": "Orden de compra vinculada a proveedor e inventario.",
        "status": "draft",
        "content": "# Purchase Order\n\nOrden de compra vinculada a proveedor e inventario.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `PurchaseOrder`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreatePurchaseOrder\n- UpdatePurchaseOrder\n- ArchivePurchaseOrder\n\n## Queries iniciales\n\n- GetPurchaseOrder\n- SearchPurchaseOrder\n- ListPurchaseOrders\n\n## Events iniciales\n\n- PurchaseOrderCreated\n- PurchaseOrderUpdated\n- PurchaseOrderArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Purchase Order\n- Update Purchase Order\n- Archive Purchase Order\n- Analyze Purchase Order\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "product",
        "title": "Product",
        "summary": "Producto o servicio vendible con precio, coste y catálogo.",
        "status": "draft",
        "content": "# Product\n\nProducto o servicio vendible con precio, coste y catálogo.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Product`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateProduct\n- UpdateProduct\n- ArchiveProduct\n\n## Queries iniciales\n\n- GetProduct\n- SearchProduct\n- ListProducts\n\n## Events iniciales\n\n- ProductCreated\n- ProductUpdated\n- ProductArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Product\n- Update Product\n- Archive Product\n- Analyze Product\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "inventory-item",
        "title": "Inventory Item",
        "summary": "Elemento de inventario con stock y ubicación.",
        "status": "draft",
        "content": "# Inventory Item\n\nElemento de inventario con stock y ubicación.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `InventoryItem`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateInventoryItem\n- UpdateInventoryItem\n- ArchiveInventoryItem\n\n## Queries iniciales\n\n- GetInventoryItem\n- SearchInventoryItem\n- ListInventoryItems\n\n## Events iniciales\n\n- InventoryItemCreated\n- InventoryItemUpdated\n- InventoryItemArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Inventory Item\n- Update Inventory Item\n- Archive Inventory Item\n- Analyze Inventory Item\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "warehouse",
        "title": "Warehouse",
        "summary": "Almacén o ubicación logística.",
        "status": "draft",
        "content": "# Warehouse\n\nAlmacén o ubicación logística.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Warehouse`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateWarehouse\n- UpdateWarehouse\n- ArchiveWarehouse\n\n## Queries iniciales\n\n- GetWarehouse\n- SearchWarehouse\n- ListWarehouses\n\n## Events iniciales\n\n- WarehouseCreated\n- WarehouseUpdated\n- WarehouseArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Warehouse\n- Update Warehouse\n- Archive Warehouse\n- Analyze Warehouse\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "asset",
        "title": "Asset",
        "summary": "Activo de la empresa con ciclo de vida y mantenimiento.",
        "status": "draft",
        "content": "# Asset\n\nActivo de la empresa con ciclo de vida y mantenimiento.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Asset`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateAsset\n- UpdateAsset\n- ArchiveAsset\n\n## Queries iniciales\n\n- GetAsset\n- SearchAsset\n- ListAssets\n\n## Events iniciales\n\n- AssetCreated\n- AssetUpdated\n- AssetArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Asset\n- Update Asset\n- Archive Asset\n- Analyze Asset\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "integration",
        "title": "Integration",
        "summary": "Conexión autorizada con un proveedor externo.",
        "status": "draft",
        "content": "# Integration\n\nConexión autorizada con un proveedor externo.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Integration`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateIntegration\n- UpdateIntegration\n- ArchiveIntegration\n\n## Queries iniciales\n\n- GetIntegration\n- SearchIntegration\n- ListIntegrations\n\n## Events iniciales\n\n- IntegrationCreated\n- IntegrationUpdated\n- IntegrationArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Integration\n- Update Integration\n- Archive Integration\n- Analyze Integration\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "plugin",
        "title": "Plugin",
        "summary": "Extensión instalada con permisos, identidad y Trust Score.",
        "status": "draft",
        "content": "# Plugin\n\nExtensión instalada con permisos, identidad y Trust Score.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Plugin`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreatePlugin\n- UpdatePlugin\n- ArchivePlugin\n\n## Queries iniciales\n\n- GetPlugin\n- SearchPlugin\n- ListPlugins\n\n## Events iniciales\n\n- PluginCreated\n- PluginUpdated\n- PluginArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Plugin\n- Update Plugin\n- Archive Plugin\n- Analyze Plugin\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "app",
        "title": "App",
        "summary": "Aplicación o experiencia dentro del App Runtime.",
        "status": "draft",
        "content": "# App\n\nAplicación o experiencia dentro del App Runtime.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `App`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateApp\n- UpdateApp\n- ArchiveApp\n\n## Queries iniciales\n\n- GetApp\n- SearchApp\n- ListApps\n\n## Events iniciales\n\n- AppCreated\n- AppUpdated\n- AppArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create App\n- Update App\n- Archive App\n- Analyze App\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "workflow",
        "title": "Workflow",
        "summary": "Proceso declarativo ejecutable por Workflow Runtime.",
        "status": "draft",
        "content": "# Workflow\n\nProceso declarativo ejecutable por Workflow Runtime.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Workflow`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateWorkflow\n- UpdateWorkflow\n- ArchiveWorkflow\n\n## Queries iniciales\n\n- GetWorkflow\n- SearchWorkflow\n- ListWorkflows\n\n## Events iniciales\n\n- WorkflowCreated\n- WorkflowUpdated\n- WorkflowArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Workflow\n- Update Workflow\n- Archive Workflow\n- Analyze Workflow\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "automation",
        "title": "Automation",
        "summary": "Automatización basada en triggers, condiciones y acciones.",
        "status": "draft",
        "content": "# Automation\n\nAutomatización basada en triggers, condiciones y acciones.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Automation`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateAutomation\n- UpdateAutomation\n- ArchiveAutomation\n\n## Queries iniciales\n\n- GetAutomation\n- SearchAutomation\n- ListAutomations\n\n## Events iniciales\n\n- AutomationCreated\n- AutomationUpdated\n- AutomationArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Automation\n- Update Automation\n- Archive Automation\n- Analyze Automation\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "notification",
        "title": "Notification",
        "summary": "Aviso generado para una identidad o canal.",
        "status": "draft",
        "content": "# Notification\n\nAviso generado para una identidad o canal.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Notification`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateNotification\n- UpdateNotification\n- ArchiveNotification\n\n## Queries iniciales\n\n- GetNotification\n- SearchNotification\n- ListNotifications\n\n## Events iniciales\n\n- NotificationCreated\n- NotificationUpdated\n- NotificationArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Notification\n- Update Notification\n- Archive Notification\n- Analyze Notification\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "policy",
        "title": "Policy",
        "summary": "Regla de gobierno versionada y auditable.",
        "status": "draft",
        "content": "# Policy\n\nRegla de gobierno versionada y auditable.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Policy`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreatePolicy\n- UpdatePolicy\n- ArchivePolicy\n\n## Queries iniciales\n\n- GetPolicy\n- SearchPolicy\n- ListPolicys\n\n## Events iniciales\n\n- PolicyCreated\n- PolicyUpdated\n- PolicyArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Policy\n- Update Policy\n- Archive Policy\n- Analyze Policy\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "context-capsule",
        "title": "Context Capsule",
        "summary": "Paquete de contexto para razonamiento, ejecución o conversación.",
        "status": "draft",
        "content": "# Context Capsule\n\nPaquete de contexto para razonamiento, ejecución o conversación.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `ContextCapsule`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateContextCapsule\n- UpdateContextCapsule\n- ArchiveContextCapsule\n\n## Queries iniciales\n\n- GetContextCapsule\n- SearchContextCapsule\n- ListContextCapsules\n\n## Events iniciales\n\n- ContextCapsuleCreated\n- ContextCapsuleUpdated\n- ContextCapsuleArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Context Capsule\n- Update Context Capsule\n- Archive Context Capsule\n- Analyze Context Capsule\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "memory-entry",
        "title": "Memory Entry",
        "summary": "Recuerdo empresarial gobernado por políticas.",
        "status": "draft",
        "content": "# Memory Entry\n\nRecuerdo empresarial gobernado por políticas.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `MemoryEntry`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateMemoryEntry\n- UpdateMemoryEntry\n- ArchiveMemoryEntry\n\n## Queries iniciales\n\n- GetMemoryEntry\n- SearchMemoryEntry\n- ListMemoryEntrys\n\n## Events iniciales\n\n- MemoryEntryCreated\n- MemoryEntryUpdated\n- MemoryEntryArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Memory Entry\n- Update Memory Entry\n- Archive Memory Entry\n- Analyze Memory Entry\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "companion",
        "title": "Companion",
        "summary": "Identidad operativa del compañero IA de una Organization.",
        "status": "draft",
        "content": "# Companion\n\nIdentidad operativa del compañero IA de una Organization.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Companion`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateCompanion\n- UpdateCompanion\n- ArchiveCompanion\n\n## Queries iniciales\n\n- GetCompanion\n- SearchCompanion\n- ListCompanions\n\n## Events iniciales\n\n- CompanionCreated\n- CompanionUpdated\n- CompanionArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Companion\n- Update Companion\n- Archive Companion\n- Analyze Companion\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "ai-agent",
        "title": "AI Agent",
        "summary": "Agente especializado dentro de la Digital Workforce.",
        "status": "draft",
        "content": "# AI Agent\n\nAgente especializado dentro de la Digital Workforce.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `AIAgent`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateAIAgent\n- UpdateAIAgent\n- ArchiveAIAgent\n\n## Queries iniciales\n\n- GetAIAgent\n- SearchAIAgent\n- ListAIAgents\n\n## Events iniciales\n\n- AIAgentCreated\n- AIAgentUpdated\n- AIAgentArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create AI Agent\n- Update AI Agent\n- Archive AI Agent\n- Analyze AI Agent\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "operation",
        "title": "Operation",
        "summary": "Ejecución completa trazada por Operation ID.",
        "status": "draft",
        "content": "# Operation\n\nEjecución completa trazada por Operation ID.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Operation`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateOperation\n- UpdateOperation\n- ArchiveOperation\n\n## Queries iniciales\n\n- GetOperation\n- SearchOperation\n- ListOperations\n\n## Events iniciales\n\n- OperationCreated\n- OperationUpdated\n- OperationArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Operation\n- Update Operation\n- Archive Operation\n- Analyze Operation\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "event",
        "title": "Event",
        "summary": "Hecho ocurrido dentro del sistema.",
        "status": "draft",
        "content": "# Event\n\nHecho ocurrido dentro del sistema.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Event`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateEvent\n- UpdateEvent\n- ArchiveEvent\n\n## Queries iniciales\n\n- GetEvent\n- SearchEvent\n- ListEvents\n\n## Events iniciales\n\n- EventCreated\n- EventUpdated\n- EventArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Event\n- Update Event\n- Archive Event\n- Analyze Event\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "command",
        "title": "Command",
        "summary": "Intención de modificar el dominio.",
        "status": "draft",
        "content": "# Command\n\nIntención de modificar el dominio.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Command`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateCommand\n- UpdateCommand\n- ArchiveCommand\n\n## Queries iniciales\n\n- GetCommand\n- SearchCommand\n- ListCommands\n\n## Events iniciales\n\n- CommandCreated\n- CommandUpdated\n- CommandArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Command\n- Update Command\n- Archive Command\n- Analyze Command\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      },
      {
        "slug": "query",
        "title": "Query",
        "summary": "Solicitud de lectura sin modificar estado.",
        "status": "draft",
        "content": "# Query\n\nSolicitud de lectura sin modificar estado.\n\n## Tipo\n\nBusiness Object oficial del dominio de Flowly OS.\n\n## Identidad\n\n- Object Type: `Query`\n- Organization scoped: Sí\n- Versionado: Sí\n- Timeline: Sí\n\n## Estados iniciales\n\n```text\nDraft\n↓\nActive\n↓\nArchived\n```\n\n## Relaciones habituales\n\n- Organization\n- Identity\n- Event\n- Document\n- Collaboration\n\n## Commands iniciales\n\n- CreateQuery\n- UpdateQuery\n- ArchiveQuery\n\n## Queries iniciales\n\n- GetQuery\n- SearchQuery\n- ListQuerys\n\n## Events iniciales\n\n- QueryCreated\n- QueryUpdated\n- QueryArchived\n\n## Policies\n\n- Debe respetar Organization Boundary.\n- Debe respetar Authorization Engine.\n- Toda modificación genera Events.\n\n## Capabilities relacionadas\n\n- Create Query\n- Update Query\n- Archive Query\n- Analyze Query\n\n## Observabilidad\n\nToda operación sobre este Business Object debe registrar Operation ID, Identity ID, Organization ID, Events y métricas de ejecución.\n"
      }
    ]
  },
  {
    "slug": "capability-catalog",
    "title": "Capability Catalog",
    "badge": "Capacidades",
    "description": "Catálogo de acciones reutilizables que Flowly sabe ejecutar.",
    "chapters": [
      {
        "slug": "create-customer",
        "title": "Create Customer",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Create Customer\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Customer** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "update-customer",
        "title": "Update Customer",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Update Customer\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Update Customer** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "archive-customer",
        "title": "Archive Customer",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Archive Customer\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Archive Customer** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "merge-customers",
        "title": "Merge Customers",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Merge Customers\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Merge Customers** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "create-lead",
        "title": "Create Lead",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Create Lead\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Lead** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "qualify-lead",
        "title": "Qualify Lead",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Qualify Lead\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Qualify Lead** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "convert-lead",
        "title": "Convert Lead",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Convert Lead\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Convert Lead** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "create-opportunity",
        "title": "Create Opportunity",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Create Opportunity\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Opportunity** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "update-opportunity-stage",
        "title": "Update Opportunity Stage",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Update Opportunity Stage\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Update Opportunity Stage** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "generate-proposal",
        "title": "Generate Proposal",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Generate Proposal\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Generate Proposal** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "generate-quote",
        "title": "Generate Quote",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Generate Quote\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Generate Quote** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "approve-quote",
        "title": "Approve Quote",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Approve Quote\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Approve Quote** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "create-invoice",
        "title": "Create Invoice",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Create Invoice\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Invoice** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "send-invoice",
        "title": "Send Invoice",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Send Invoice\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Send Invoice** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "mark-invoice-paid",
        "title": "Mark Invoice Paid",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Mark Invoice Paid\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Mark Invoice Paid** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "create-expense",
        "title": "Create Expense",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Create Expense\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Expense** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "approve-expense",
        "title": "Approve Expense",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Approve Expense\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Approve Expense** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "generate-budget",
        "title": "Generate Budget",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Generate Budget\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Generate Budget** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "generate-pdf",
        "title": "Generate PDF",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Generate PDF\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Generate PDF** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "store-document",
        "title": "Store Document",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Store Document\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Store Document** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "send-email",
        "title": "Send Email",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Send Email\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Send Email** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "send-whatsapp",
        "title": "Send WhatsApp",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Send WhatsApp\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Send WhatsApp** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "schedule-meeting",
        "title": "Schedule Meeting",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Schedule Meeting\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Schedule Meeting** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "create-project",
        "title": "Create Project",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Create Project\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Project** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "assign-task",
        "title": "Assign Task",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Assign Task\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Assign Task** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "complete-task",
        "title": "Complete Task",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Complete Task\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Complete Task** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "create-objective",
        "title": "Create Objective",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Create Objective\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Objective** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "track-objective-progress",
        "title": "Track Objective Progress",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Track Objective Progress\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Track Objective Progress** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "create-collaboration",
        "title": "Create Collaboration",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Create Collaboration\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Collaboration** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "summarize-conversation",
        "title": "Summarize Conversation",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Summarize Conversation\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Summarize Conversation** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "build-context-capsule",
        "title": "Build Context Capsule",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Build Context Capsule\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Build Context Capsule** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "retrieve-memory",
        "title": "Retrieve Memory",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Retrieve Memory\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Retrieve Memory** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "create-workflow",
        "title": "Create Workflow",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Create Workflow\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Workflow** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "run-workflow",
        "title": "Run Workflow",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Run Workflow\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Run Workflow** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "install-plugin",
        "title": "Install Plugin",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Install Plugin\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Install Plugin** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "register-capability",
        "title": "Register Capability",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Register Capability\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Register Capability** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "analyze-customer",
        "title": "Analyze Customer",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Analyze Customer\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Analyze Customer** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "reason-about-goal",
        "title": "Reason About Goal",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Reason About Goal\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Reason About Goal** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "generate-plan",
        "title": "Generate Plan",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Generate Plan\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Generate Plan** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "evaluate-decision",
        "title": "Evaluate Decision",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Evaluate Decision\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Evaluate Decision** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "run-simulation",
        "title": "Run Simulation",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Run Simulation\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Run Simulation** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "execute-command",
        "title": "Execute Command",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Execute Command\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Execute Command** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "create-notification",
        "title": "Create Notification",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Create Notification\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Notification** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "search-knowledge",
        "title": "Search Knowledge",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Search Knowledge\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Search Knowledge** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "index-document",
        "title": "Index Document",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Index Document\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Index Document** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "translate-document",
        "title": "Translate Document",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Translate Document\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Translate Document** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "extract-data",
        "title": "Extract Data",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Extract Data\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Extract Data** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "classify-ticket",
        "title": "Classify Ticket",
        "summary": "Capability.",
        "status": "draft",
        "content": "# Classify Ticket\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Classify Ticket** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      }
    ]
  },
  {
    "slug": "product-modules",
    "title": "Product Modules",
    "badge": "Producto",
    "description": "Módulos principales de Flowly: CRM, Finanzas, Comercial, WhatsApp, Docs, Marketplace y Companion.",
    "chapters": [
      {
        "slug": "product-principles",
        "title": "Product Principles",
        "summary": "Módulos como experiencias, no dueños del dominio.",
        "status": "ready",
        "content": "# Product Principles\n\nMódulos como experiencias, no dueños del dominio.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "dashboard",
        "title": "Dashboard",
        "summary": "Panel principal y navegación por capacidades.",
        "status": "ready",
        "content": "# Dashboard\n\nPanel principal y navegación por capacidades.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "crm",
        "title": "CRM",
        "summary": "Clientes, contactos, oportunidades y actividades.",
        "status": "ready",
        "content": "# CRM\n\nClientes, contactos, oportunidades y actividades.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "finance",
        "title": "Finance",
        "summary": "Ingresos, gastos, presupuestos, facturas y configuración.",
        "status": "ready",
        "content": "# Finance\n\nIngresos, gastos, presupuestos, facturas y configuración.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "commercial-panel",
        "title": "Commercial Panel",
        "summary": "Embajadores, fichaje, comisiones y ventas.",
        "status": "ready",
        "content": "# Commercial Panel\n\nEmbajadores, fichaje, comisiones y ventas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "whatsapp",
        "title": "WhatsApp",
        "summary": "Mensajería, bandeja, plantillas y automatizaciones.",
        "status": "ready",
        "content": "# WhatsApp\n\nMensajería, bandeja, plantillas y automatizaciones.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "docs",
        "title": "Docs",
        "summary": "Centro de conocimiento nativo.",
        "status": "ready",
        "content": "# Docs\n\nCentro de conocimiento nativo.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "companion-module",
        "title": "Companion Module",
        "summary": "Interfaz del Companion dentro del workspace.",
        "status": "ready",
        "content": "# Companion Module\n\nInterfaz del Companion dentro del workspace.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "marketplace-module",
        "title": "Marketplace Module",
        "summary": "Apps, Plugins, Tools y Capabilities.",
        "status": "ready",
        "content": "# Marketplace Module\n\nApps, Plugins, Tools y Capabilities.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "admin-module",
        "title": "Admin Module",
        "summary": "Gestión de organizaciones, usuarios y políticas.",
        "status": "ready",
        "content": "# Admin Module\n\nGestión de organizaciones, usuarios y políticas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "settings",
        "title": "Settings",
        "summary": "Configuración empresarial y personalización.",
        "status": "ready",
        "content": "# Settings\n\nConfiguración empresarial y personalización.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "analytics",
        "title": "Analytics",
        "summary": "KPIs, observabilidad y métricas de negocio.",
        "status": "ready",
        "content": "# Analytics\n\nKPIs, observabilidad y métricas de negocio.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "hr",
        "title": "HR",
        "summary": "Empleados, equipos, permisos y fichaje.",
        "status": "ready",
        "content": "# HR\n\nEmpleados, equipos, permisos y fichaje.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "projects",
        "title": "Projects",
        "summary": "Proyectos, tareas, hitos y colaboraciones.",
        "status": "ready",
        "content": "# Projects\n\nProyectos, tareas, hitos y colaboraciones.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "support",
        "title": "Support",
        "summary": "Tickets, incidencias y SLA.",
        "status": "ready",
        "content": "# Support\n\nTickets, incidencias y SLA.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "product-roadmap",
        "title": "Product Roadmap",
        "summary": "Evolución del producto por módulos.",
        "status": "ready",
        "content": "# Product Roadmap\n\nEvolución del producto por módulos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      }
    ]
  },
  {
    "slug": "design-system",
    "title": "Design System",
    "badge": "UI",
    "description": "Tokens, componentes, layouts, accesibilidad, motion, branding y reglas visuales de Flowly.",
    "chapters": [
      {
        "slug": "design-principles",
        "title": "Design Principles",
        "summary": "Principios visuales: claridad, foco, confianza y elegancia.",
        "status": "ready",
        "content": "# Design Principles\n\nPrincipios visuales: claridad, foco, confianza y elegancia.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "brand-foundation",
        "title": "Brand Foundation",
        "summary": "Uso de marca, logo, voz visual y coherencia.",
        "status": "ready",
        "content": "# Brand Foundation\n\nUso de marca, logo, voz visual y coherencia.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "color-system",
        "title": "Color System",
        "summary": "Tokens de color, estados, contraste y temas.",
        "status": "ready",
        "content": "# Color System\n\nTokens de color, estados, contraste y temas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "typography",
        "title": "Typography",
        "summary": "Jerarquía tipográfica y lectura profesional.",
        "status": "ready",
        "content": "# Typography\n\nJerarquía tipográfica y lectura profesional.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "spacing-layout",
        "title": "Spacing & Layout",
        "summary": "Sistema de espaciados, grids y composición.",
        "status": "ready",
        "content": "# Spacing & Layout\n\nSistema de espaciados, grids y composición.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "components",
        "title": "Components",
        "summary": "Botones, cards, formularios, tablas, tabs y modales.",
        "status": "ready",
        "content": "# Components\n\nBotones, cards, formularios, tablas, tabs y modales.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "navigation",
        "title": "Navigation",
        "summary": "Menús, sidebars, breadcrumbs y rutas.",
        "status": "ready",
        "content": "# Navigation\n\nMenús, sidebars, breadcrumbs y rutas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "dashboards",
        "title": "Dashboards",
        "summary": "Principios para paneles ejecutivos y operativos.",
        "status": "ready",
        "content": "# Dashboards\n\nPrincipios para paneles ejecutivos y operativos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "forms",
        "title": "Forms",
        "summary": "Formularios claros, validación y estados.",
        "status": "ready",
        "content": "# Forms\n\nFormularios claros, validación y estados.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "data-tables",
        "title": "Data Tables",
        "summary": "Tablas empresariales, filtros, acciones y estados.",
        "status": "ready",
        "content": "# Data Tables\n\nTablas empresariales, filtros, acciones y estados.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "motion",
        "title": "Motion",
        "summary": "Animaciones útiles y no decorativas.",
        "status": "ready",
        "content": "# Motion\n\nAnimaciones útiles y no decorativas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "accessibility",
        "title": "Accessibility",
        "summary": "WCAG, teclado, contraste y reducción de movimiento.",
        "status": "ready",
        "content": "# Accessibility\n\nWCAG, teclado, contraste y reducción de movimiento.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "responsive",
        "title": "Responsive",
        "summary": "Diseño para móvil, tablet, escritorio y pantallas grandes.",
        "status": "ready",
        "content": "# Responsive\n\nDiseño para móvil, tablet, escritorio y pantallas grandes.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "avatar-ui",
        "title": "Avatar UI",
        "summary": "Integración visual del Companion sin competir con el trabajo.",
        "status": "ready",
        "content": "# Avatar UI\n\nIntegración visual del Companion sin competir con el trabajo.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "docs-ui",
        "title": "Docs UI",
        "summary": "Patrones del módulo Flowly Docs.",
        "status": "ready",
        "content": "# Docs UI\n\nPatrones del módulo Flowly Docs.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "design-tokens",
        "title": "Design Tokens",
        "summary": "Variables oficiales para UI y theming.",
        "status": "ready",
        "content": "# Design Tokens\n\nVariables oficiales para UI y theming.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "component-governance",
        "title": "Component Governance",
        "summary": "Cómo aprobar y evolucionar componentes.",
        "status": "ready",
        "content": "# Component Governance\n\nCómo aprobar y evolucionar componentes.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "design-roadmap",
        "title": "Design Roadmap",
        "summary": "Evolución del sistema visual.",
        "status": "ready",
        "content": "# Design Roadmap\n\nEvolución del sistema visual.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      }
    ]
  },
  {
    "slug": "database-supabase",
    "title": "Database & Supabase",
    "badge": "Datos",
    "description": "Modelo físico inicial, RLS, Storage, Edge Functions, migraciones, backups y rendimiento.",
    "chapters": [
      {
        "slug": "database-principles",
        "title": "Database Principles",
        "summary": "Reglas para PostgreSQL, dominio y aislamiento.",
        "status": "ready",
        "content": "# Database Principles\n\nReglas para PostgreSQL, dominio y aislamiento.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "schema-foundation",
        "title": "Schema Foundation",
        "summary": "Tablas base para organizaciones, identidades y eventos.",
        "status": "ready",
        "content": "# Schema Foundation\n\nTablas base para organizaciones, identidades y eventos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "organizations",
        "title": "Organizations Schema",
        "summary": "Modelo físico de organizaciones y workspaces.",
        "status": "ready",
        "content": "# Organizations Schema\n\nModelo físico de organizaciones y workspaces.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "identities",
        "title": "Identities Schema",
        "summary": "Usuarios, agentes, Apps, Plugins y servicios.",
        "status": "ready",
        "content": "# Identities Schema\n\nUsuarios, agentes, Apps, Plugins y servicios.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "business-objects",
        "title": "Business Objects Schema",
        "summary": "Estructura física genérica para objetos vivos.",
        "status": "ready",
        "content": "# Business Objects Schema\n\nEstructura física genérica para objetos vivos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "relationships",
        "title": "Relationships Schema",
        "summary": "Grafo empresarial y relaciones semánticas.",
        "status": "ready",
        "content": "# Relationships Schema\n\nGrafo empresarial y relaciones semánticas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "events",
        "title": "Events Schema",
        "summary": "Event Store, Operation ID y trazabilidad.",
        "status": "ready",
        "content": "# Events Schema\n\nEvent Store, Operation ID y trazabilidad.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "capabilities",
        "title": "Capabilities Schema",
        "summary": "Registry de Capabilities y providers.",
        "status": "ready",
        "content": "# Capabilities Schema\n\nRegistry de Capabilities y providers.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "memory",
        "title": "Memory Schema",
        "summary": "Memoria empresarial, embeddings y políticas.",
        "status": "ready",
        "content": "# Memory Schema\n\nMemoria empresarial, embeddings y políticas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "documents-storage",
        "title": "Documents & Storage",
        "summary": "Archivos, buckets y metadatos.",
        "status": "ready",
        "content": "# Documents & Storage\n\nArchivos, buckets y metadatos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "rls-strategy",
        "title": "RLS Strategy",
        "summary": "Aislamiento multiempresa con Row Level Security.",
        "status": "ready",
        "content": "# RLS Strategy\n\nAislamiento multiempresa con Row Level Security.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "edge-functions",
        "title": "Edge Functions",
        "summary": "Funciones server-side oficiales.",
        "status": "ready",
        "content": "# Edge Functions\n\nFunciones server-side oficiales.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "migrations",
        "title": "Migrations",
        "summary": "Estrategia de migraciones versionadas.",
        "status": "ready",
        "content": "# Migrations\n\nEstrategia de migraciones versionadas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "seed-data",
        "title": "Seed Data",
        "summary": "Datos iniciales y demos controladas.",
        "status": "ready",
        "content": "# Seed Data\n\nDatos iniciales y demos controladas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "indexes-performance",
        "title": "Indexes & Performance",
        "summary": "Índices, consultas y rendimiento.",
        "status": "ready",
        "content": "# Indexes & Performance\n\nÍndices, consultas y rendimiento.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "backups",
        "title": "Backups",
        "summary": "Copias, restauración y auditoría.",
        "status": "ready",
        "content": "# Backups\n\nCopias, restauración y auditoría.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "data-retention",
        "title": "Data Retention",
        "summary": "Retención, anonimización y borrado.",
        "status": "ready",
        "content": "# Data Retention\n\nRetención, anonimización y borrado.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "database-roadmap",
        "title": "Database Roadmap",
        "summary": "Evolución del modelo físico.",
        "status": "ready",
        "content": "# Database Roadmap\n\nEvolución del modelo físico.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      }
    ]
  },
  {
    "slug": "workflow-automation",
    "title": "Workflow & Automation",
    "badge": "Procesos",
    "description": "Diseño de Workflows, Triggers, Steps, Human Approval, Scheduler y automatizaciones.",
    "chapters": [
      {
        "slug": "workflow-principles",
        "title": "Workflow Principles",
        "summary": "Procesos declarativos y gobernados.",
        "status": "ready",
        "content": "# Workflow Principles\n\nProcesos declarativos y gobernados.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "workflow-dsl",
        "title": "Workflow DSL",
        "summary": "Estructura declarativa de triggers, steps y outputs.",
        "status": "ready",
        "content": "# Workflow DSL\n\nEstructura declarativa de triggers, steps y outputs.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "triggers",
        "title": "Triggers",
        "summary": "Eventos, tiempo, webhooks y condiciones.",
        "status": "ready",
        "content": "# Triggers\n\nEventos, tiempo, webhooks y condiciones.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "conditions",
        "title": "Conditions",
        "summary": "Reglas para bifurcaciones y validaciones.",
        "status": "ready",
        "content": "# Conditions\n\nReglas para bifurcaciones y validaciones.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "steps",
        "title": "Steps",
        "summary": "Acciones basadas en Capabilities.",
        "status": "ready",
        "content": "# Steps\n\nAcciones basadas en Capabilities.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "human-approval",
        "title": "Human Approval",
        "summary": "Puntos de aprobación humana.",
        "status": "ready",
        "content": "# Human Approval\n\nPuntos de aprobación humana.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "scheduler",
        "title": "Scheduler",
        "summary": "Ejecución programada y diferida.",
        "status": "ready",
        "content": "# Scheduler\n\nEjecución programada y diferida.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "retry-policy",
        "title": "Retry Policy",
        "summary": "Reintentos, backoff e idempotencia.",
        "status": "ready",
        "content": "# Retry Policy\n\nReintentos, backoff e idempotencia.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "compensation",
        "title": "Compensation",
        "summary": "Acciones compensatorias y recuperación.",
        "status": "ready",
        "content": "# Compensation\n\nAcciones compensatorias y recuperación.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "workflow-observability",
        "title": "Workflow Observability",
        "summary": "Timeline, métricas y Execution Replay.",
        "status": "ready",
        "content": "# Workflow Observability\n\nTimeline, métricas y Execution Replay.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "workflow-templates",
        "title": "Workflow Templates",
        "summary": "Plantillas reutilizables por sector.",
        "status": "ready",
        "content": "# Workflow Templates\n\nPlantillas reutilizables por sector.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "automation-rules",
        "title": "Automation Rules",
        "summary": "Automatizaciones simples para usuarios.",
        "status": "ready",
        "content": "# Automation Rules\n\nAutomatizaciones simples para usuarios.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "business-events",
        "title": "Business Events",
        "summary": "Eventos de dominio como disparadores.",
        "status": "ready",
        "content": "# Business Events\n\nEventos de dominio como disparadores.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "workflow-security",
        "title": "Workflow Security",
        "summary": "Permisos y ejecución con identidad.",
        "status": "ready",
        "content": "# Workflow Security\n\nPermisos y ejecución con identidad.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "workflow-testing",
        "title": "Workflow Testing",
        "summary": "Pruebas y simulación de flujos.",
        "status": "ready",
        "content": "# Workflow Testing\n\nPruebas y simulación de flujos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "workflow-roadmap",
        "title": "Workflow Roadmap",
        "summary": "Evolución del runtime.",
        "status": "ready",
        "content": "# Workflow Roadmap\n\nEvolución del runtime.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      }
    ]
  },
  {
    "slug": "tools-integrations",
    "title": "Tools & Integrations",
    "badge": "Integraciones",
    "description": "Arquitectura de Tools, proveedores externos, WhatsApp, email, calendar, pagos, firma y observabilidad.",
    "chapters": [
      {
        "slug": "tool-principles",
        "title": "Tool Principles",
        "summary": "Herramientas como adaptadores oficiales.",
        "status": "ready",
        "content": "# Tool Principles\n\nHerramientas como adaptadores oficiales.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "tool-contract",
        "title": "Tool Contract",
        "summary": "Input, output, errores, timeout y permisos.",
        "status": "ready",
        "content": "# Tool Contract\n\nInput, output, errores, timeout y permisos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "smart-tool-router",
        "title": "Smart Tool Router",
        "summary": "Selección automática de proveedor.",
        "status": "ready",
        "content": "# Smart Tool Router\n\nSelección automática de proveedor.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "whatsapp-tool",
        "title": "WhatsApp Tool",
        "summary": "WhatsApp Cloud API y proveedores alternativos.",
        "status": "ready",
        "content": "# WhatsApp Tool\n\nWhatsApp Cloud API y proveedores alternativos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "email-tool",
        "title": "Email Tool",
        "summary": "Gmail, SMTP, Microsoft 365 y SES.",
        "status": "ready",
        "content": "# Email Tool\n\nGmail, SMTP, Microsoft 365 y SES.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "calendar-tool",
        "title": "Calendar Tool",
        "summary": "Google Calendar y eventos.",
        "status": "ready",
        "content": "# Calendar Tool\n\nGoogle Calendar y eventos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "payment-tool",
        "title": "Payment Tool",
        "summary": "Stripe y futuros proveedores.",
        "status": "ready",
        "content": "# Payment Tool\n\nStripe y futuros proveedores.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "signature-tool",
        "title": "Signature Tool",
        "summary": "Firma electrónica y evidencias.",
        "status": "ready",
        "content": "# Signature Tool\n\nFirma electrónica y evidencias.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "pdf-tool",
        "title": "PDF Tool",
        "summary": "Generación de PDF y plantillas.",
        "status": "ready",
        "content": "# PDF Tool\n\nGeneración de PDF y plantillas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "storage-tool",
        "title": "Storage Tool",
        "summary": "Subida, descarga y permisos.",
        "status": "ready",
        "content": "# Storage Tool\n\nSubida, descarga y permisos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "ocr-tool",
        "title": "OCR Tool",
        "summary": "Lectura de documentos e imágenes.",
        "status": "ready",
        "content": "# OCR Tool\n\nLectura de documentos e imágenes.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "search-tool",
        "title": "Search Tool",
        "summary": "Búsqueda web o interna gobernada.",
        "status": "ready",
        "content": "# Search Tool\n\nBúsqueda web o interna gobernada.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "webhook-tool",
        "title": "Webhook Tool",
        "summary": "Webhooks salientes con seguridad.",
        "status": "ready",
        "content": "# Webhook Tool\n\nWebhooks salientes con seguridad.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "tool-observability",
        "title": "Tool Observability",
        "summary": "Latencia, coste, errores y health.",
        "status": "ready",
        "content": "# Tool Observability\n\nLatencia, coste, errores y health.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "tool-testing",
        "title": "Tool Testing",
        "summary": "Sandbox y pruebas contractuales.",
        "status": "ready",
        "content": "# Tool Testing\n\nSandbox y pruebas contractuales.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "integration-roadmap",
        "title": "Integration Roadmap",
        "summary": "Mapa de integraciones futuras.",
        "status": "ready",
        "content": "# Integration Roadmap\n\nMapa de integraciones futuras.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      }
    ]
  },
  {
    "slug": "ai-specification",
    "title": "AI Specification",
    "badge": "IA",
    "description": "Prompts, modelos, embeddings, RAG, validación, costes, privacidad y evaluación de calidad.",
    "chapters": [
      {
        "slug": "ai-principles",
        "title": "AI Principles",
        "summary": "IA como infraestructura, no autoridad.",
        "status": "ready",
        "content": "# AI Principles\n\nIA como infraestructura, no autoridad.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "model-registry",
        "title": "Model Registry",
        "summary": "Modelos, capacidades, coste y limitaciones.",
        "status": "ready",
        "content": "# Model Registry\n\nModelos, capacidades, coste y limitaciones.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "provider-adapters",
        "title": "Provider Adapters",
        "summary": "OpenAI, Anthropic, Google, Mistral y locales.",
        "status": "ready",
        "content": "# Provider Adapters\n\nOpenAI, Anthropic, Google, Mistral y locales.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "prompt-registry",
        "title": "Prompt Registry",
        "summary": "Prompts versionados y auditables.",
        "status": "ready",
        "content": "# Prompt Registry\n\nPrompts versionados y auditables.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "context-injection",
        "title": "Context Injection",
        "summary": "Uso de Context Capsules en IA.",
        "status": "ready",
        "content": "# Context Injection\n\nUso de Context Capsules en IA.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "rag-strategy",
        "title": "RAG Strategy",
        "summary": "Búsqueda, embeddings y Knowledge Graph.",
        "status": "ready",
        "content": "# RAG Strategy\n\nBúsqueda, embeddings y Knowledge Graph.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "embeddings",
        "title": "Embeddings",
        "summary": "Índices vectoriales y actualización.",
        "status": "ready",
        "content": "# Embeddings\n\nÍndices vectoriales y actualización.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "output-validation",
        "title": "Output Validation",
        "summary": "Validadores de formato, seguridad y calidad.",
        "status": "ready",
        "content": "# Output Validation\n\nValidadores de formato, seguridad y calidad.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "ai-evaluation",
        "title": "AI Evaluation",
        "summary": "Pruebas de calidad y benchmarks internos.",
        "status": "ready",
        "content": "# AI Evaluation\n\nPruebas de calidad y benchmarks internos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "ai-cost-control",
        "title": "AI Cost Control",
        "summary": "Presupuesto, cuotas y Cognitive QoS.",
        "status": "ready",
        "content": "# AI Cost Control\n\nPresupuesto, cuotas y Cognitive QoS.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "ai-privacy",
        "title": "AI Privacy",
        "summary": "Minimización y políticas de datos.",
        "status": "ready",
        "content": "# AI Privacy\n\nMinimización y políticas de datos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "ai-safety",
        "title": "AI Safety",
        "summary": "Aprobaciones, límites y acciones críticas.",
        "status": "ready",
        "content": "# AI Safety\n\nAprobaciones, límites y acciones críticas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "ai-observability",
        "title": "AI Observability",
        "summary": "Tokens, coste, confianza y trazabilidad.",
        "status": "ready",
        "content": "# AI Observability\n\nTokens, coste, confianza y trazabilidad.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "ai-fallback",
        "title": "AI Fallback",
        "summary": "Failover y degradación elegante.",
        "status": "ready",
        "content": "# AI Fallback\n\nFailover y degradación elegante.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "local-models",
        "title": "Local Models",
        "summary": "Modelos privados y soberanía del dato.",
        "status": "ready",
        "content": "# Local Models\n\nModelos privados y soberanía del dato.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "ai-roadmap",
        "title": "AI Roadmap",
        "summary": "Evolución de capacidades cognitivas.",
        "status": "ready",
        "content": "# AI Roadmap\n\nEvolución de capacidades cognitivas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      }
    ]
  },
  {
    "slug": "api",
    "title": "API Specification",
    "badge": "API",
    "description": "Contratos públicos, autenticación, errores, webhooks, versionado y SDK generation.",
    "chapters": [
      {
        "slug": "api-principles",
        "title": "01-api-principles",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "authentication",
        "title": "02-authentication",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "authorization",
        "title": "03-authorization",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "errors",
        "title": "04-errors",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "pagination",
        "title": "05-pagination",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "webhooks",
        "title": "06-webhooks",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "rate-limits",
        "title": "07-rate-limits",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "versioning",
        "title": "08-versioning",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "openapi-generation",
        "title": "09-openapi-generation",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "sdk-generation",
        "title": "10-sdk-generation",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "api-explorer",
        "title": "11-api-explorer",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "public-api-roadmap",
        "title": "12-public-api-roadmap",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      }
    ]
  },
  {
    "slug": "sdk",
    "title": "SDK Specification",
    "badge": "SDK",
    "description": "Guías para SDK TypeScript, Python, PHP, .NET y toolkit de partners.",
    "chapters": [
      {
        "slug": "sdk-philosophy",
        "title": "01-sdk-philosophy",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "typescript-sdk",
        "title": "02-typescript-sdk",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "python-sdk",
        "title": "03-python-sdk",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "php-sdk",
        "title": "04-php-sdk",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "dotnet-sdk",
        "title": "05-dotnet-sdk",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "authentication-helpers",
        "title": "06-authentication-helpers",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "capability-client",
        "title": "07-capability-client",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "webhook-client",
        "title": "08-webhook-client",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "examples",
        "title": "09-examples",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "sdk-versioning",
        "title": "10-sdk-versioning",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "sdk-generator",
        "title": "11-sdk-generator",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "partner-toolkit",
        "title": "12-partner-toolkit",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      }
    ]
  },
  {
    "slug": "marketplace",
    "title": "Marketplace Specification",
    "badge": "Ecosistema",
    "description": "Apps, Plugins, Tools, Capabilities, certificación, Trust Score y consola de desarrolladores.",
    "chapters": [
      {
        "slug": "marketplace-vision",
        "title": "01-marketplace-vision",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "app-listing",
        "title": "02-app-listing",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "plugin-listing",
        "title": "03-plugin-listing",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "capability-marketplace",
        "title": "04-capability-marketplace",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "tool-providers",
        "title": "05-tool-providers",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "certification",
        "title": "06-certification",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "trust-score",
        "title": "07-trust-score",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "billing",
        "title": "08-billing",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "reviews",
        "title": "09-reviews",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "enterprise-policies",
        "title": "10-enterprise-policies",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "developer-console",
        "title": "11-developer-console",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "marketplace-roadmap",
        "title": "12-marketplace-roadmap",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      }
    ]
  },
  {
    "slug": "companion",
    "title": "Companion Specification",
    "badge": "Companion",
    "description": "Especificación operativa de identidad, personalidad, voz, avatar, memoria, contexto y seguridad del Companion.",
    "chapters": [
      {
        "slug": "companion-identity",
        "title": "01-companion-identity",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "personality-profiles",
        "title": "02-personality-profiles",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "conversation-model",
        "title": "03-conversation-model",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "memory-usage",
        "title": "04-memory-usage",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "context-usage",
        "title": "05-context-usage",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "initiative-rules",
        "title": "06-initiative-rules",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "presence-rules",
        "title": "07-presence-rules",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "avatar-behaviour",
        "title": "08-avatar-behaviour",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "voice-behaviour",
        "title": "09-voice-behaviour",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "tool-usage",
        "title": "10-tool-usage",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "human-approval",
        "title": "11-human-approval",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "companion-workspace",
        "title": "12-companion-workspace",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "companion-observability",
        "title": "13-companion-observability",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "companion-safety",
        "title": "14-companion-safety",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "companion-development",
        "title": "15-companion-development",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "companion-roadmap",
        "title": "16-companion-roadmap",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      }
    ]
  },
  {
    "slug": "security-governance",
    "title": "Security & Governance",
    "badge": "Confianza",
    "description": "Identidad, autorización, RLS, secretos, auditoría, RGPD, IA responsable e incident response.",
    "chapters": [
      {
        "slug": "security-principles",
        "title": "01-security-principles",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "identity-model",
        "title": "02-identity-model",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "authorization-model",
        "title": "03-authorization-model",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "rls-strategy",
        "title": "04-rls-strategy",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "secrets-management",
        "title": "05-secrets-management",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "audit-logs",
        "title": "06-audit-logs",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "gdpr",
        "title": "07-gdpr",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "data-retention",
        "title": "08-data-retention",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "ai-governance",
        "title": "09-ai-governance",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "plugin-security",
        "title": "10-plugin-security",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "incident-response",
        "title": "11-incident-response",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "security-roadmap",
        "title": "12-security-roadmap",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      }
    ]
  },
  {
    "slug": "devops-manual",
    "title": "DevOps Manual",
    "badge": "Operación técnica",
    "description": "Vercel, Supabase, GitHub Actions, entornos, observabilidad, backups, release y disaster recovery.",
    "chapters": [
      {
        "slug": "devops-principles",
        "title": "DevOps Principles",
        "summary": "Despliegues rutinarios, seguros y observables.",
        "status": "ready",
        "content": "# DevOps Principles\n\nDespliegues rutinarios, seguros y observables.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "environments",
        "title": "Environments",
        "summary": "Development, integration, staging y production.",
        "status": "ready",
        "content": "# Environments\n\nDevelopment, integration, staging y production.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "vercel-deployment",
        "title": "Vercel Deployment",
        "summary": "Build, preview, production y variables.",
        "status": "ready",
        "content": "# Vercel Deployment\n\nBuild, preview, production y variables.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "supabase-operations",
        "title": "Supabase Operations",
        "summary": "DB, Auth, Storage y Edge Functions.",
        "status": "ready",
        "content": "# Supabase Operations\n\nDB, Auth, Storage y Edge Functions.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "github-actions",
        "title": "GitHub Actions",
        "summary": "Pipelines de CI/CD y quality gates.",
        "status": "ready",
        "content": "# GitHub Actions\n\nPipelines de CI/CD y quality gates.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "secrets-management",
        "title": "Secrets Management",
        "summary": "Gestión de secretos y rotación.",
        "status": "ready",
        "content": "# Secrets Management\n\nGestión de secretos y rotación.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "monitoring",
        "title": "Monitoring",
        "summary": "Health, logs, métricas y alertas.",
        "status": "ready",
        "content": "# Monitoring\n\nHealth, logs, métricas y alertas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "release-process",
        "title": "Release Process",
        "summary": "Versionado, notas y release train.",
        "status": "ready",
        "content": "# Release Process\n\nVersionado, notas y release train.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "rollback",
        "title": "Rollback",
        "summary": "Estrategias de reversión.",
        "status": "ready",
        "content": "# Rollback\n\nEstrategias de reversión.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "backup-recovery",
        "title": "Backup & Recovery",
        "summary": "Backups y restauración.",
        "status": "ready",
        "content": "# Backup & Recovery\n\nBackups y restauración.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "incident-response",
        "title": "Incident Response",
        "summary": "Runbook de incidentes técnicos.",
        "status": "ready",
        "content": "# Incident Response\n\nRunbook de incidentes técnicos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "performance-ops",
        "title": "Performance Ops",
        "summary": "Rendimiento y optimización.",
        "status": "ready",
        "content": "# Performance Ops\n\nRendimiento y optimización.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "cost-ops",
        "title": "Cost Ops",
        "summary": "Costes de infraestructura e IA.",
        "status": "ready",
        "content": "# Cost Ops\n\nCostes de infraestructura e IA.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "security-ops",
        "title": "Security Ops",
        "summary": "Controles y auditorías.",
        "status": "ready",
        "content": "# Security Ops\n\nControles y auditorías.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "disaster-recovery",
        "title": "Disaster Recovery",
        "summary": "Recuperación ante desastre.",
        "status": "ready",
        "content": "# Disaster Recovery\n\nRecuperación ante desastre.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "devops-roadmap",
        "title": "DevOps Roadmap",
        "summary": "Madurez operativa.",
        "status": "ready",
        "content": "# DevOps Roadmap\n\nMadurez operativa.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      }
    ]
  },
  {
    "slug": "operations-manual",
    "title": "Operations Manual",
    "badge": "Soporte",
    "description": "Soporte, incidencias, mantenimiento, onboarding, clientes, facturación, seguridad y runbooks.",
    "chapters": [
      {
        "slug": "operations-principles",
        "title": "Operations Principles",
        "summary": "Operar Flowly con claridad y trazabilidad.",
        "status": "ready",
        "content": "# Operations Principles\n\nOperar Flowly con claridad y trazabilidad.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "customer-onboarding",
        "title": "Customer Onboarding",
        "summary": "Alta de clientes y configuración inicial.",
        "status": "ready",
        "content": "# Customer Onboarding\n\nAlta de clientes y configuración inicial.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "support-process",
        "title": "Support Process",
        "summary": "Soporte, prioridades y escalado.",
        "status": "ready",
        "content": "# Support Process\n\nSoporte, prioridades y escalado.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "incident-management",
        "title": "Incident Management",
        "summary": "Gestión de incidencias de producto.",
        "status": "ready",
        "content": "# Incident Management\n\nGestión de incidencias de producto.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "billing-operations",
        "title": "Billing Operations",
        "summary": "Cobros, planes, Stripe y facturación.",
        "status": "ready",
        "content": "# Billing Operations\n\nCobros, planes, Stripe y facturación.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "sales-operations",
        "title": "Sales Operations",
        "summary": "Panel comercial, comisiones y embajadores.",
        "status": "ready",
        "content": "# Sales Operations\n\nPanel comercial, comisiones y embajadores.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "docs-operations",
        "title": "Docs Operations",
        "summary": "Mantenimiento del Knowledge Portal.",
        "status": "ready",
        "content": "# Docs Operations\n\nMantenimiento del Knowledge Portal.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "security-reviews",
        "title": "Security Reviews",
        "summary": "Revisiones periódicas de seguridad.",
        "status": "ready",
        "content": "# Security Reviews\n\nRevisiones periódicas de seguridad.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "data-requests",
        "title": "Data Requests",
        "summary": "Exportación, borrado y solicitudes RGPD.",
        "status": "ready",
        "content": "# Data Requests\n\nExportación, borrado y solicitudes RGPD.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "migration-operations",
        "title": "Migration Operations",
        "summary": "Migraciones de clientes y datos.",
        "status": "ready",
        "content": "# Migration Operations\n\nMigraciones de clientes y datos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "training",
        "title": "Training",
        "summary": "Formación interna y de clientes.",
        "status": "ready",
        "content": "# Training\n\nFormación interna y de clientes.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "health-checks",
        "title": "Health Checks",
        "summary": "Revisiones operativas recurrentes.",
        "status": "ready",
        "content": "# Health Checks\n\nRevisiones operativas recurrentes.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "communication",
        "title": "Communication",
        "summary": "Comunicación de cambios e incidencias.",
        "status": "ready",
        "content": "# Communication\n\nComunicación de cambios e incidencias.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "operations-metrics",
        "title": "Operations Metrics",
        "summary": "KPIs operativos.",
        "status": "ready",
        "content": "# Operations Metrics\n\nKPIs operativos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      }
    ]
  },
  {
    "slug": "docs-platform",
    "title": "Flowly Docs Platform",
    "badge": "Docs",
    "description": "Arquitectura del módulo Docs nativo, búsqueda IA, importación Markdown, exportaciones y producto comercial.",
    "chapters": [
      {
        "slug": "docs-vision",
        "title": "Docs Vision",
        "summary": "Flowly Docs como knowledge system nativo.",
        "status": "ready",
        "content": "# Docs Vision\n\nFlowly Docs como knowledge system nativo.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "content-model",
        "title": "Content Model",
        "summary": "Libros, capítulos, términos, objetos y capacidades.",
        "status": "ready",
        "content": "# Content Model\n\nLibros, capítulos, términos, objetos y capacidades.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "markdown-ingestion",
        "title": "Markdown Ingestion",
        "summary": "Importar y renderizar Markdown del repo.",
        "status": "ready",
        "content": "# Markdown Ingestion\n\nImportar y renderizar Markdown del repo.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "docs-search",
        "title": "Docs Search",
        "summary": "Búsqueda por texto y semántica.",
        "status": "ready",
        "content": "# Docs Search\n\nBúsqueda por texto y semántica.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "docs-ai-assistant",
        "title": "Docs AI Assistant",
        "summary": "Preguntar a Flowly Docs con contexto.",
        "status": "ready",
        "content": "# Docs AI Assistant\n\nPreguntar a Flowly Docs con contexto.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "cross-links",
        "title": "Cross Links",
        "summary": "Enlaces automáticos entre docs y código.",
        "status": "ready",
        "content": "# Cross Links\n\nEnlaces automáticos entre docs y código.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "diagrams",
        "title": "Diagrams",
        "summary": "Diagramas estáticos e interactivos.",
        "status": "ready",
        "content": "# Diagrams\n\nDiagramas estáticos e interactivos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "exports",
        "title": "Exports",
        "summary": "Exportación a PDF, Word, Markdown y HTML.",
        "status": "ready",
        "content": "# Exports\n\nExportación a PDF, Word, Markdown y HTML.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "versioning",
        "title": "Docs Versioning",
        "summary": "Versionado de documentos.",
        "status": "ready",
        "content": "# Docs Versioning\n\nVersionado de documentos.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "permissions",
        "title": "Docs Permissions",
        "summary": "Acceso por rol, empresa y visibilidad.",
        "status": "ready",
        "content": "# Docs Permissions\n\nAcceso por rol, empresa y visibilidad.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "client-docs",
        "title": "Client Docs",
        "summary": "Documentación de procesos de clientes.",
        "status": "ready",
        "content": "# Client Docs\n\nDocumentación de procesos de clientes.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "docs-as-product",
        "title": "Docs as Product",
        "summary": "Flowly Docs como producto comercial.",
        "status": "ready",
        "content": "# Docs as Product\n\nFlowly Docs como producto comercial.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "docs-roadmap",
        "title": "Docs Roadmap",
        "summary": "Evolución del módulo.",
        "status": "ready",
        "content": "# Docs Roadmap\n\nEvolución del módulo.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza concreta para que producto, arquitectura e ingeniería trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe implementar esta pieza mediante **contratos oficiales**, reutilizando Business Objects, Capabilities, Engines y Kernel Services existentes antes de crear componentes nuevos.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- No acceder directamente a infraestructura desde dominio o Apps.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Respetar Identity, Authorization y Governance en toda acción relevante.\n- Documentar cambios con ADR cuando afecten a arquitectura o contratos públicos.\n\n## Artefactos relacionados\n\n- Business Objects implicados.\n- Capabilities requeridas.\n- Policies aplicables.\n- Events generados.\n- Tests obligatorios.\n\n## Estado\n\nREADY\n"
      }
    ]
  },
  {
    "slug": "roadmap",
    "title": "Roadmap",
    "badge": "Evolución",
    "description": "MVP, planes a 90 días, 12 meses, Companion, Marketplace, IA y Enterprise.",
    "chapters": [
      {
        "slug": "mvp-roadmap",
        "title": "01-mvp-roadmap",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "90-day-plan",
        "title": "02-90-day-plan",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "12-month-plan",
        "title": "03-12-month-plan",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "companion-roadmap",
        "title": "04-companion-roadmap",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "marketplace-roadmap",
        "title": "05-marketplace-roadmap",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "enterprise-roadmap",
        "title": "06-enterprise-roadmap",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "ai-roadmap",
        "title": "07-ai-roadmap",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      },
      {
        "slug": "docs-roadmap",
        "title": "08-docs-roadmap",
        "summary": "draft",
        "status": "draft",
        "content": "draft\n"
      }
    ]
  },
  {
    "slug": "glossary",
    "title": "Glossary",
    "badge": "Lenguaje",
    "description": "Diccionario oficial de términos arquitectónicos y de ingeniería de Flowly OS.",
    "chapters": [
      {
        "slug": "business-object",
        "title": "Business Object",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Business Object\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "capability",
        "title": "Capability",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Capability\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "engine",
        "title": "Engine",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Engine\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "kernel",
        "title": "Kernel",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Kernel\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "context-capsule",
        "title": "Context Capsule",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Context Capsule\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "memory",
        "title": "Memory",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Memory\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "companion",
        "title": "Companion",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Companion\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "operation-id",
        "title": "Operation ID",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Operation ID\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "event",
        "title": "Event",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Event\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "command",
        "title": "Command",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Command\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "query",
        "title": "Query",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Query\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "policy",
        "title": "Policy",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Policy\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "organization",
        "title": "Organization",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Organization\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "identity",
        "title": "Identity",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Identity\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "workflow",
        "title": "Workflow",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Workflow\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "tool",
        "title": "Tool",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Tool\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "ai-runtime",
        "title": "AI Runtime",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# AI Runtime\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "governance",
        "title": "Governance",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Governance\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "observability",
        "title": "Observability",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Observability\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "digital-workforce",
        "title": "Digital Workforce",
        "summary": "Definición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.",
        "status": "draft",
        "content": "# Digital Workforce\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      }
    ]
  },
  {
    "slug": "adr",
    "title": "Adr",
    "badge": "Docs",
    "description": "Sección documental de Flowly OS.",
    "chapters": []
  },
  {
    "slug": "api-sdk-marketplace",
    "title": "API · SDK · Marketplace",
    "badge": "Ecosistema",
    "description": "Vista combinada para integradores, partners y extensiones.",
    "chapters": [
      {
        "slug": "api-specification",
        "title": "API Specification",
        "summary": "Las APIs públicas de Flowly exponen Capabilities oficiales, nunca implementaciones internas.",
        "status": "ready",
        "content": "# API Specification\n\nLas APIs públicas de Flowly exponen Capabilities oficiales, nunca implementaciones internas.\n\n## Reglas\n\n- Toda API pasa por Capability Runtime.\n- Toda llamada tiene Identity, Authorization y Observability.\n- Los contratos públicos son versionados.\n"
      },
      {
        "slug": "sdk-specification",
        "title": "SDK Specification",
        "summary": "Los SDKs oficiales facilitan el consumo de Flowly desde herramientas externas.",
        "status": "ready",
        "content": "# SDK Specification\n\nLos SDKs oficiales facilitan el consumo de Flowly desde herramientas externas.\n\n## Regla\n\nEl SDK se genera desde contratos oficiales siempre que sea posible.\n"
      },
      {
        "slug": "marketplace-specification",
        "title": "Marketplace Specification",
        "summary": "El Marketplace distribuye capacidades, Apps, Plugins y Tools certificadas.",
        "status": "ready",
        "content": "# Marketplace Specification\n\nEl Marketplace distribuye capacidades, Apps, Plugins y Tools certificadas.\n\n## Regla\n\nToda extensión se ejecuta mediante Runtime oficial, con permisos explícitos y observabilidad.\n"
      }
    ]
  }
];

export function getFlowlyDocBook(slug: string) {
  return flowlyDocBooks.find((book) => book.slug === slug);
}

export function getFlowlyDocChapter(bookSlug: string, chapterSlug: string) {
  const book = getFlowlyDocBook(bookSlug);
  const chapter = book?.chapters.find((item) => item.slug === chapterSlug);
  return { book, chapter };
}

export function searchFlowlyDocs(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return flowlyDocBooks.flatMap((book) =>
    book.chapters
      .filter((chapter) => [book.title, book.description, chapter.title, chapter.summary, chapter.content].join(' ').toLowerCase().includes(normalized))
      .map((chapter) => ({ book, chapter }))
  );
}
