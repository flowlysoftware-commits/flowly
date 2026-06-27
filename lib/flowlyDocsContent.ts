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
    "description": "Documento breve que resume qué es Flowly, qué no debe romperse y qué principios gobiernan todo el sistema.",
    "chapters": [
      {
        "slug": "purpose",
        "title": "Purpose",
        "summary": "Por qué existe Flowly y qué problema quiere resolver.",
        "status": "ready",
        "content": "# Purpose\n\nFlowly existe para construir una nueva generación de software empresarial centrado en la colaboración entre personas e inteligencia artificial.\n\nNo pretende ser simplemente un ERP, un CRM o un chatbot. Flowly OS se define como un **Living Business Operating System**: una plataforma capaz de representar, comprender y acompañar organizaciones vivas.\n\n## Misión\n\nAyudar a las organizaciones a comprenderse mejor, trabajar con más claridad y tomar mejores decisiones.\n\n## Promesa\n\nLa tecnología debe servir a las personas, no sustituirlas. La inteligencia debe ser transparente. La arquitectura debe proteger el futuro.\n"
      },
      {
        "slug": "non-negotiable-principles",
        "title": "Non-Negotiable Principles",
        "summary": "Los principios que no se deben romper durante el desarrollo.",
        "status": "ready",
        "content": "# Non-Negotiable Principles\n\n1. El dominio empresarial es el centro.\n2. Los Business Objects son la fuente de verdad.\n3. La IA nunca posee el dominio.\n4. Todo debe ser observable.\n5. Todo debe ser explicable.\n6. Todo debe ser versionable.\n7. Ningún componente es privilegiado.\n8. El usuario conserva el control.\n9. La arquitectura prevalece sobre la implementación.\n10. Flowly se construye para durar décadas.\n"
      },
      {
        "slug": "manifesto",
        "title": "Manifesto",
        "summary": "La declaración cultural de Flowly.",
        "status": "ready",
        "content": "# Manifesto\n\nNo queremos construir software que haga más cosas. Queremos construir software que ayude mejor a las personas.\n\nFlowly no existe para captar atención. Existe para devolver tiempo, claridad y capacidad operativa.\n\nLa IA es una herramienta de colaboración, no una autoridad. Las mejores empresas del futuro no serán las que tengan más IA, sino las que mejor colaboren con ella.\n"
      },
      {
        "slug": "human-control",
        "title": "Human Control",
        "summary": "Cómo se protege la decisión humana.",
        "status": "ready",
        "content": "# Human Control\n\nFlowly puede observar, recomendar, planificar y ejecutar, pero las decisiones relevantes pertenecen a las personas o a políticas explícitamente delegadas.\n\n## Regla\n\nToda acción crítica requiere autorización, política o aprobación humana.\n\n## Consecuencia\n\nEl Companion propone. El usuario decide. El Execution Engine ejecuta solo cuando la decisión está aprobada.\n"
      },
      {
        "slug": "living-business-os",
        "title": "Living Business OS",
        "summary": "La definición oficial de Flowly OS.",
        "status": "ready",
        "content": "# Living Business OS\n\nFlowly OS es un sistema operativo empresarial vivo.\n\nRepresenta empresas mediante Business Objects, Capabilities, Engines, Memory, Context, Decisions, Workflows y Companion OS.\n\nSu objetivo no es almacenar datos, sino convertir la información de la organización en conocimiento accionable.\n"
      }
    ]
  },
  {
    "slug": "architecture-bible",
    "title": "Architecture Bible",
    "badge": "Visión completa",
    "description": "Los capítulos conceptuales que definen Flowly OS como Living Business Operating System.",
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
    "badge": "Plano técnico",
    "description": "Mapa técnico del Kernel, Engines, Capabilities, Organizations, Identity, Context y Governance.",
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
        "status": "ready",
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
        "status": "ready",
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
    "badge": "Desarrollo",
    "description": "Normas para programar Flowly respetando arquitectura, dominio, tests y documentación.",
    "chapters": [
      {
        "slug": "engineering-philosophy",
        "title": "Engineering Philosophy",
        "summary": "La forma oficial de pensar al construir Flowly.",
        "status": "ready",
        "content": "# Engineering Philosophy\n\nLa forma oficial de pensar al construir Flowly.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "project-structure",
        "title": "Project Structure",
        "summary": "Estructura del monorepo y carpetas.",
        "status": "ready",
        "content": "# Project Structure\n\nEstructura del monorepo y carpetas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "coding-standards",
        "title": "Coding Standards",
        "summary": "Estándares de TypeScript, naming, errores y legibilidad.",
        "status": "ready",
        "content": "# Coding Standards\n\nEstándares de TypeScript, naming, errores y legibilidad.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "business-object-development",
        "title": "Business Object Development",
        "summary": "Cómo crear Business Objects.",
        "status": "ready",
        "content": "# Business Object Development\n\nCómo crear Business Objects.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "capability-development",
        "title": "Capability Development",
        "summary": "Cómo crear Capabilities.",
        "status": "ready",
        "content": "# Capability Development\n\nCómo crear Capabilities.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "engine-development",
        "title": "Engine Development",
        "summary": "Cómo crear Engines.",
        "status": "ready",
        "content": "# Engine Development\n\nCómo crear Engines.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "app-development",
        "title": "App Development",
        "summary": "Cómo crear Apps sin lógica de negocio.",
        "status": "ready",
        "content": "# App Development\n\nCómo crear Apps sin lógica de negocio.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "plugin-development",
        "title": "Plugin Development",
        "summary": "Cómo extender Flowly sin invadir el Core.",
        "status": "ready",
        "content": "# Plugin Development\n\nCómo extender Flowly sin invadir el Core.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "api-development",
        "title": "API Development",
        "summary": "APIs como exposición de Capabilities.",
        "status": "ready",
        "content": "# API Development\n\nAPIs como exposición de Capabilities.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "documentation-standards",
        "title": "Documentation Standards",
        "summary": "Documentación viva como activo de ingeniería.",
        "status": "ready",
        "content": "# Documentation Standards\n\nDocumentación viva como activo de ingeniería.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "testing-strategy",
        "title": "Testing Strategy",
        "summary": "Pruebas unitarias, contratos, integración, arquitectura y E2E.",
        "status": "ready",
        "content": "# Testing Strategy\n\nPruebas unitarias, contratos, integración, arquitectura y E2E.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "ci-cd-release-strategy",
        "title": "CI/CD & Release Strategy",
        "summary": "Pipelines, Quality Gates, Releases y Rollback.",
        "status": "ready",
        "content": "# CI/CD & Release Strategy\n\nPipelines, Quality Gates, Releases y Rollback.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "ai-assisted-development",
        "title": "AI-Assisted Development",
        "summary": "Uso de IA sin comprometer arquitectura.",
        "status": "ready",
        "content": "# AI-Assisted Development\n\nUso de IA sin comprometer arquitectura.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      },
      {
        "slug": "engineering-culture",
        "title": "Engineering Culture",
        "summary": "Cultura técnica para construir durante décadas.",
        "status": "ready",
        "content": "# Engineering Culture\n\nCultura técnica para construir durante décadas.\n\n## Propósito\n\nEste capítulo forma parte de la documentación viva de Flowly OS. Define una pieza del sistema para que arquitectura, desarrollo y producto trabajen con el mismo lenguaje.\n\n## Decisión principal\n\nFlowly debe construir esta capacidad respetando dominio, contratos, observabilidad, seguridad y evolución.\n\n## Reglas de implementación\n\n- No duplicar lógica existente.\n- Usar Business Objects, Capabilities, Engines y Kernel Services oficiales.\n- Mantener trazabilidad mediante Operation ID, Events y Observability.\n- Documentar cambios con ADR cuando afecten a arquitectura.\n\n## Estado\n\nREADY\n"
      }
    ]
  },
  {
    "slug": "implementation-blueprint",
    "title": "Implementation Blueprint",
    "badge": "Construcción",
    "description": "Plano ejecutable para construir Flowly OS encima del proyecto actual.",
    "chapters": [
      {
        "slug": "implementation-strategy",
        "title": "Implementation Strategy",
        "summary": "Cómo pasar de documentación a construcción real.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "existing-project-assessment",
        "title": "Existing Project Assessment",
        "summary": "Cómo construir encima del Flowly actual sin tirar todo.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "monorepo-setup",
        "title": "Monorepo Setup",
        "summary": "Estructura definitiva de carpetas y paquetes.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "environment-configuration",
        "title": "Environment Configuration",
        "summary": "Variables, entornos, secretos y configuración.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "supabase-foundation",
        "title": "Supabase Foundation",
        "summary": "Auth, database, storage, RLS y Edge Functions.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "organization-foundation",
        "title": "Organization Foundation",
        "summary": "Tablas y servicios base multiempresa.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "identity-foundation",
        "title": "Identity Foundation",
        "summary": "Usuarios, roles, equipos e identidades técnicas.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "authorization-foundation",
        "title": "Authorization Foundation",
        "summary": "Permisos, policies y capability guards.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "kernel-minimal-version",
        "title": "Kernel Minimal Version",
        "summary": "Kernel inicial para MVP.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "capability-runtime-mvp",
        "title": "Capability Runtime MVP",
        "summary": "Resolver y ejecutar capacidades internas.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "business-object-runtime-mvp",
        "title": "Business Object Runtime MVP",
        "summary": "Crear y validar entidades empresariales.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "event-system-mvp",
        "title": "Event System MVP",
        "summary": "Eventos internos y trazabilidad.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "observability-mvp",
        "title": "Observability MVP",
        "summary": "Logs estructurados y Operation ID.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "docs-module",
        "title": "Docs Module",
        "summary": "Flowly Docs como módulo nativo.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "crm-foundation",
        "title": "CRM Foundation",
        "summary": "Clientes, contactos, leads y oportunidades.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "finance-foundation",
        "title": "Finance Foundation",
        "summary": "Ingresos, gastos, presupuestos y facturas.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "commercial-panel",
        "title": "Commercial Panel",
        "summary": "Embajadores, comisiones, fichajes y seguimiento.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "whatsapp-foundation",
        "title": "WhatsApp Foundation",
        "summary": "Conector oficial y conversaciones.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "companion-mvp",
        "title": "Companion MVP",
        "summary": "Chat contextual inicial sin avatar complejo.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "memory-mvp",
        "title": "Memory MVP",
        "summary": "Memoria básica por organización.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "context-mvp",
        "title": "Context MVP",
        "summary": "Context Capsules iniciales.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "ai-runtime-mvp",
        "title": "AI Runtime MVP",
        "summary": "Provider abstraction y uso gobernado de modelos.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "document-generation",
        "title": "Document Generation",
        "summary": "PDF, presupuestos, facturas y contratos.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "workflow-mvp",
        "title": "Workflow MVP",
        "summary": "Automatizaciones básicas.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "marketplace-skeleton",
        "title": "Marketplace Skeleton",
        "summary": "Base para Apps, Plugins y Capabilities.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "testing-setup",
        "title": "Testing Setup",
        "summary": "Tests, architecture checks y calidad.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "ci-cd-setup",
        "title": "CI/CD Setup",
        "summary": "GitHub Actions, Vercel y validaciones.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "migration-from-current-flowly",
        "title": "Migration from Current Flowly",
        "summary": "Plan para adaptar lo ya construido.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "mvp-scope",
        "title": "MVP Scope",
        "summary": "Qué entra y qué no entra en la primera versión.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "beta-launch-plan",
        "title": "Beta Launch Plan",
        "summary": "Plan de beta con clientes reales.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "performance-baseline",
        "title": "Performance Baseline",
        "summary": "Métricas iniciales de rendimiento.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "security-baseline",
        "title": "Security Baseline",
        "summary": "Hardening mínimo de seguridad.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "backup-recovery",
        "title": "Backup & Recovery",
        "summary": "Copias, restauración y continuidad.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "roadmap-90-days",
        "title": "Roadmap 90 Days",
        "summary": "Plan de implementación por 90 días.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "roadmap-12-months",
        "title": "Roadmap 12 Months",
        "summary": "Plan anual de evolución.",
        "status": "ready",
        "content": "draft"
      }
    ]
  },
  {
    "slug": "domain-catalog",
    "title": "Domain Catalog",
    "badge": "Dominio",
    "description": "Catálogo oficial de Business Objects base para Flowly OS.",
    "chapters": [
      {
        "slug": "organization",
        "title": "Organization",
        "summary": "Business Object Organization: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Organization\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Organization** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateOrganization\n- UpdateOrganization\n- ArchiveOrganization\n\n## Queries iniciales\n\n- GetOrganization\n- SearchOrganization\n- ListOrganizations\n\n## Events iniciales\n\n- OrganizationCreated\n- OrganizationUpdated\n- OrganizationArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "workspace",
        "title": "Workspace",
        "summary": "Business Object Workspace: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Workspace\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Workspace** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateWorkspace\n- UpdateWorkspace\n- ArchiveWorkspace\n\n## Queries iniciales\n\n- GetWorkspace\n- SearchWorkspace\n- ListWorkspaces\n\n## Events iniciales\n\n- WorkspaceCreated\n- WorkspaceUpdated\n- WorkspaceArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "user",
        "title": "User",
        "summary": "Business Object User: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# User\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **User** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateUser\n- UpdateUser\n- ArchiveUser\n\n## Queries iniciales\n\n- GetUser\n- SearchUser\n- ListUsers\n\n## Events iniciales\n\n- UserCreated\n- UserUpdated\n- UserArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "team",
        "title": "Team",
        "summary": "Business Object Team: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Team\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Team** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateTeam\n- UpdateTeam\n- ArchiveTeam\n\n## Queries iniciales\n\n- GetTeam\n- SearchTeam\n- ListTeams\n\n## Events iniciales\n\n- TeamCreated\n- TeamUpdated\n- TeamArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "role",
        "title": "Role",
        "summary": "Business Object Role: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Role\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Role** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateRole\n- UpdateRole\n- ArchiveRole\n\n## Queries iniciales\n\n- GetRole\n- SearchRole\n- ListRoles\n\n## Events iniciales\n\n- RoleCreated\n- RoleUpdated\n- RoleArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "identity",
        "title": "Identity",
        "summary": "Business Object Identity: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Identity\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Identity** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateIdentity\n- UpdateIdentity\n- ArchiveIdentity\n\n## Queries iniciales\n\n- GetIdentity\n- SearchIdentity\n- ListIdentitys\n\n## Events iniciales\n\n- IdentityCreated\n- IdentityUpdated\n- IdentityArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "customer",
        "title": "Customer",
        "summary": "Business Object Customer: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Customer\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Customer** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateCustomer\n- UpdateCustomer\n- ArchiveCustomer\n\n## Queries iniciales\n\n- GetCustomer\n- SearchCustomer\n- ListCustomers\n\n## Events iniciales\n\n- CustomerCreated\n- CustomerUpdated\n- CustomerArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "contact",
        "title": "Contact",
        "summary": "Business Object Contact: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Contact\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Contact** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateContact\n- UpdateContact\n- ArchiveContact\n\n## Queries iniciales\n\n- GetContact\n- SearchContact\n- ListContacts\n\n## Events iniciales\n\n- ContactCreated\n- ContactUpdated\n- ContactArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "company",
        "title": "Company",
        "summary": "Business Object Company: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Company\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Company** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateCompany\n- UpdateCompany\n- ArchiveCompany\n\n## Queries iniciales\n\n- GetCompany\n- SearchCompany\n- ListCompanys\n\n## Events iniciales\n\n- CompanyCreated\n- CompanyUpdated\n- CompanyArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "lead",
        "title": "Lead",
        "summary": "Business Object Lead: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Lead\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Lead** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateLead\n- UpdateLead\n- ArchiveLead\n\n## Queries iniciales\n\n- GetLead\n- SearchLead\n- ListLeads\n\n## Events iniciales\n\n- LeadCreated\n- LeadUpdated\n- LeadArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "opportunity",
        "title": "Opportunity",
        "summary": "Business Object Opportunity: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Opportunity\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Opportunity** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateOpportunity\n- UpdateOpportunity\n- ArchiveOpportunity\n\n## Queries iniciales\n\n- GetOpportunity\n- SearchOpportunity\n- ListOpportunitys\n\n## Events iniciales\n\n- OpportunityCreated\n- OpportunityUpdated\n- OpportunityArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "proposal",
        "title": "Proposal",
        "summary": "Business Object Proposal: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Proposal\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Proposal** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateProposal\n- UpdateProposal\n- ArchiveProposal\n\n## Queries iniciales\n\n- GetProposal\n- SearchProposal\n- ListProposals\n\n## Events iniciales\n\n- ProposalCreated\n- ProposalUpdated\n- ProposalArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "quote",
        "title": "Quote",
        "summary": "Business Object Quote: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Quote\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Quote** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateQuote\n- UpdateQuote\n- ArchiveQuote\n\n## Queries iniciales\n\n- GetQuote\n- SearchQuote\n- ListQuotes\n\n## Events iniciales\n\n- QuoteCreated\n- QuoteUpdated\n- QuoteArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "invoice",
        "title": "Invoice",
        "summary": "Business Object Invoice: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Invoice\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Invoice** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateInvoice\n- UpdateInvoice\n- ArchiveInvoice\n\n## Queries iniciales\n\n- GetInvoice\n- SearchInvoice\n- ListInvoices\n\n## Events iniciales\n\n- InvoiceCreated\n- InvoiceUpdated\n- InvoiceArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "expense",
        "title": "Expense",
        "summary": "Business Object Expense: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Expense\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Expense** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateExpense\n- UpdateExpense\n- ArchiveExpense\n\n## Queries iniciales\n\n- GetExpense\n- SearchExpense\n- ListExpenses\n\n## Events iniciales\n\n- ExpenseCreated\n- ExpenseUpdated\n- ExpenseArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "payment",
        "title": "Payment",
        "summary": "Business Object Payment: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Payment\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Payment** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreatePayment\n- UpdatePayment\n- ArchivePayment\n\n## Queries iniciales\n\n- GetPayment\n- SearchPayment\n- ListPayments\n\n## Events iniciales\n\n- PaymentCreated\n- PaymentUpdated\n- PaymentArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "subscription",
        "title": "Subscription",
        "summary": "Business Object Subscription: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Subscription\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Subscription** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateSubscription\n- UpdateSubscription\n- ArchiveSubscription\n\n## Queries iniciales\n\n- GetSubscription\n- SearchSubscription\n- ListSubscriptions\n\n## Events iniciales\n\n- SubscriptionCreated\n- SubscriptionUpdated\n- SubscriptionArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "product",
        "title": "Product",
        "summary": "Business Object Product: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Product\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Product** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateProduct\n- UpdateProduct\n- ArchiveProduct\n\n## Queries iniciales\n\n- GetProduct\n- SearchProduct\n- ListProducts\n\n## Events iniciales\n\n- ProductCreated\n- ProductUpdated\n- ProductArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "service",
        "title": "Service",
        "summary": "Business Object Service: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Service\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Service** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateService\n- UpdateService\n- ArchiveService\n\n## Queries iniciales\n\n- GetService\n- SearchService\n- ListServices\n\n## Events iniciales\n\n- ServiceCreated\n- ServiceUpdated\n- ServiceArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "project",
        "title": "Project",
        "summary": "Business Object Project: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Project\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Project** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateProject\n- UpdateProject\n- ArchiveProject\n\n## Queries iniciales\n\n- GetProject\n- SearchProject\n- ListProjects\n\n## Events iniciales\n\n- ProjectCreated\n- ProjectUpdated\n- ProjectArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "task",
        "title": "Task",
        "summary": "Business Object Task: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Task\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Task** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateTask\n- UpdateTask\n- ArchiveTask\n\n## Queries iniciales\n\n- GetTask\n- SearchTask\n- ListTasks\n\n## Events iniciales\n\n- TaskCreated\n- TaskUpdated\n- TaskArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "milestone",
        "title": "Milestone",
        "summary": "Business Object Milestone: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Milestone\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Milestone** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateMilestone\n- UpdateMilestone\n- ArchiveMilestone\n\n## Queries iniciales\n\n- GetMilestone\n- SearchMilestone\n- ListMilestones\n\n## Events iniciales\n\n- MilestoneCreated\n- MilestoneUpdated\n- MilestoneArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "collaboration",
        "title": "Collaboration",
        "summary": "Business Object Collaboration: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Collaboration\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Collaboration** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateCollaboration\n- UpdateCollaboration\n- ArchiveCollaboration\n\n## Queries iniciales\n\n- GetCollaboration\n- SearchCollaboration\n- ListCollaborations\n\n## Events iniciales\n\n- CollaborationCreated\n- CollaborationUpdated\n- CollaborationArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "document",
        "title": "Document",
        "summary": "Business Object Document: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Document\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Document** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateDocument\n- UpdateDocument\n- ArchiveDocument\n\n## Queries iniciales\n\n- GetDocument\n- SearchDocument\n- ListDocuments\n\n## Events iniciales\n\n- DocumentCreated\n- DocumentUpdated\n- DocumentArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "contract",
        "title": "Contract",
        "summary": "Business Object Contract: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Contract\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Contract** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateContract\n- UpdateContract\n- ArchiveContract\n\n## Queries iniciales\n\n- GetContract\n- SearchContract\n- ListContracts\n\n## Events iniciales\n\n- ContractCreated\n- ContractUpdated\n- ContractArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "campaign",
        "title": "Campaign",
        "summary": "Business Object Campaign: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Campaign\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Campaign** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateCampaign\n- UpdateCampaign\n- ArchiveCampaign\n\n## Queries iniciales\n\n- GetCampaign\n- SearchCampaign\n- ListCampaigns\n\n## Events iniciales\n\n- CampaignCreated\n- CampaignUpdated\n- CampaignArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "audience",
        "title": "Audience",
        "summary": "Business Object Audience: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Audience\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Audience** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateAudience\n- UpdateAudience\n- ArchiveAudience\n\n## Queries iniciales\n\n- GetAudience\n- SearchAudience\n- ListAudiences\n\n## Events iniciales\n\n- AudienceCreated\n- AudienceUpdated\n- AudienceArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "form",
        "title": "Form",
        "summary": "Business Object Form: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Form\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Form** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateForm\n- UpdateForm\n- ArchiveForm\n\n## Queries iniciales\n\n- GetForm\n- SearchForm\n- ListForms\n\n## Events iniciales\n\n- FormCreated\n- FormUpdated\n- FormArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "ticket",
        "title": "Ticket",
        "summary": "Business Object Ticket: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Ticket\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Ticket** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateTicket\n- UpdateTicket\n- ArchiveTicket\n\n## Queries iniciales\n\n- GetTicket\n- SearchTicket\n- ListTickets\n\n## Events iniciales\n\n- TicketCreated\n- TicketUpdated\n- TicketArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "incident",
        "title": "Incident",
        "summary": "Business Object Incident: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Incident\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Incident** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateIncident\n- UpdateIncident\n- ArchiveIncident\n\n## Queries iniciales\n\n- GetIncident\n- SearchIncident\n- ListIncidents\n\n## Events iniciales\n\n- IncidentCreated\n- IncidentUpdated\n- IncidentArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "supplier",
        "title": "Supplier",
        "summary": "Business Object Supplier: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Supplier\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Supplier** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateSupplier\n- UpdateSupplier\n- ArchiveSupplier\n\n## Queries iniciales\n\n- GetSupplier\n- SearchSupplier\n- ListSuppliers\n\n## Events iniciales\n\n- SupplierCreated\n- SupplierUpdated\n- SupplierArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "employee",
        "title": "Employee",
        "summary": "Business Object Employee: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Employee\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Employee** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateEmployee\n- UpdateEmployee\n- ArchiveEmployee\n\n## Queries iniciales\n\n- GetEmployee\n- SearchEmployee\n- ListEmployees\n\n## Events iniciales\n\n- EmployeeCreated\n- EmployeeUpdated\n- EmployeeArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "objective",
        "title": "Objective",
        "summary": "Business Object Objective: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Objective\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Objective** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateObjective\n- UpdateObjective\n- ArchiveObjective\n\n## Queries iniciales\n\n- GetObjective\n- SearchObjective\n- ListObjectives\n\n## Events iniciales\n\n- ObjectiveCreated\n- ObjectiveUpdated\n- ObjectiveArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "decision",
        "title": "Decision",
        "summary": "Business Object Decision: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Decision\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Decision** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateDecision\n- UpdateDecision\n- ArchiveDecision\n\n## Queries iniciales\n\n- GetDecision\n- SearchDecision\n- ListDecisions\n\n## Events iniciales\n\n- DecisionCreated\n- DecisionUpdated\n- DecisionArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "workflow",
        "title": "Workflow",
        "summary": "Business Object Workflow: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Workflow\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Workflow** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateWorkflow\n- UpdateWorkflow\n- ArchiveWorkflow\n\n## Queries iniciales\n\n- GetWorkflow\n- SearchWorkflow\n- ListWorkflows\n\n## Events iniciales\n\n- WorkflowCreated\n- WorkflowUpdated\n- WorkflowArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "automation",
        "title": "Automation",
        "summary": "Business Object Automation: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Automation\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Automation** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateAutomation\n- UpdateAutomation\n- ArchiveAutomation\n\n## Queries iniciales\n\n- GetAutomation\n- SearchAutomation\n- ListAutomations\n\n## Events iniciales\n\n- AutomationCreated\n- AutomationUpdated\n- AutomationArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "notification",
        "title": "Notification",
        "summary": "Business Object Notification: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Notification\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Notification** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateNotification\n- UpdateNotification\n- ArchiveNotification\n\n## Queries iniciales\n\n- GetNotification\n- SearchNotification\n- ListNotifications\n\n## Events iniciales\n\n- NotificationCreated\n- NotificationUpdated\n- NotificationArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "integration",
        "title": "Integration",
        "summary": "Business Object Integration: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Integration\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Integration** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateIntegration\n- UpdateIntegration\n- ArchiveIntegration\n\n## Queries iniciales\n\n- GetIntegration\n- SearchIntegration\n- ListIntegrations\n\n## Events iniciales\n\n- IntegrationCreated\n- IntegrationUpdated\n- IntegrationArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "plugin",
        "title": "Plugin",
        "summary": "Business Object Plugin: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# Plugin\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **Plugin** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreatePlugin\n- UpdatePlugin\n- ArchivePlugin\n\n## Queries iniciales\n\n- GetPlugin\n- SearchPlugin\n- ListPlugins\n\n## Events iniciales\n\n- PluginCreated\n- PluginUpdated\n- PluginArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      },
      {
        "slug": "app",
        "title": "App",
        "summary": "Business Object App: identidad, estados, relaciones, commands, queries, events y policies.",
        "status": "draft",
        "content": "# App\n\n## Tipo\n\nBusiness Object.\n\n## Propósito\n\nRepresenta el concepto empresarial **App** dentro de Flowly OS.\n\n## Estructura obligatoria\n\n- Identity\n- Metadata\n- Attributes\n- Relationships\n- State\n- Timeline\n- Policies\n- Capabilities\n- Permissions\n- Knowledge\n- Metrics\n\n## Commands iniciales\n\n- CreateApp\n- UpdateApp\n- ArchiveApp\n\n## Queries iniciales\n\n- GetApp\n- SearchApp\n- ListApps\n\n## Events iniciales\n\n- AppCreated\n- AppUpdated\n- AppArchived\n\n## Estado\n\nBorrador técnico preparado para completar durante el Implementation Blueprint.\n"
      }
    ]
  },
  {
    "slug": "capability-catalog",
    "title": "Capability Catalog",
    "badge": "Capacidades",
    "description": "Catálogo inicial de capacidades reutilizables del sistema.",
    "chapters": [
      {
        "slug": "create-customer",
        "title": "Create Customer",
        "summary": "Capability Create Customer: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Create Customer\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Customer** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "update-customer",
        "title": "Update Customer",
        "summary": "Capability Update Customer: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Update Customer\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Update Customer** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "archive-customer",
        "title": "Archive Customer",
        "summary": "Capability Archive Customer: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Archive Customer\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Archive Customer** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "merge-customers",
        "title": "Merge Customers",
        "summary": "Capability Merge Customers: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Merge Customers\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Merge Customers** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "create-lead",
        "title": "Create Lead",
        "summary": "Capability Create Lead: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Create Lead\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Lead** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "qualify-lead",
        "title": "Qualify Lead",
        "summary": "Capability Qualify Lead: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Qualify Lead\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Qualify Lead** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "convert-lead",
        "title": "Convert Lead",
        "summary": "Capability Convert Lead: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Convert Lead\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Convert Lead** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "create-opportunity",
        "title": "Create Opportunity",
        "summary": "Capability Create Opportunity: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Create Opportunity\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Opportunity** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "update-opportunity-stage",
        "title": "Update Opportunity Stage",
        "summary": "Capability Update Opportunity Stage: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Update Opportunity Stage\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Update Opportunity Stage** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "generate-proposal",
        "title": "Generate Proposal",
        "summary": "Capability Generate Proposal: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Generate Proposal\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Generate Proposal** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "generate-quote",
        "title": "Generate Quote",
        "summary": "Capability Generate Quote: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Generate Quote\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Generate Quote** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "approve-quote",
        "title": "Approve Quote",
        "summary": "Capability Approve Quote: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Approve Quote\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Approve Quote** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "create-invoice",
        "title": "Create Invoice",
        "summary": "Capability Create Invoice: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Create Invoice\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Invoice** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "send-invoice",
        "title": "Send Invoice",
        "summary": "Capability Send Invoice: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Send Invoice\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Send Invoice** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "mark-invoice-paid",
        "title": "Mark Invoice Paid",
        "summary": "Capability Mark Invoice Paid: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Mark Invoice Paid\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Mark Invoice Paid** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "create-expense",
        "title": "Create Expense",
        "summary": "Capability Create Expense: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Create Expense\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Expense** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "approve-expense",
        "title": "Approve Expense",
        "summary": "Capability Approve Expense: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Approve Expense\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Approve Expense** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "generate-budget",
        "title": "Generate Budget",
        "summary": "Capability Generate Budget: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Generate Budget\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Generate Budget** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "generate-pdf",
        "title": "Generate PDF",
        "summary": "Capability Generate PDF: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Generate PDF\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Generate PDF** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "store-document",
        "title": "Store Document",
        "summary": "Capability Store Document: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Store Document\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Store Document** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "send-email",
        "title": "Send Email",
        "summary": "Capability Send Email: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Send Email\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Send Email** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "send-whatsapp",
        "title": "Send WhatsApp",
        "summary": "Capability Send WhatsApp: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Send WhatsApp\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Send WhatsApp** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "schedule-meeting",
        "title": "Schedule Meeting",
        "summary": "Capability Schedule Meeting: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Schedule Meeting\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Schedule Meeting** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "create-project",
        "title": "Create Project",
        "summary": "Capability Create Project: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Create Project\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Project** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "assign-task",
        "title": "Assign Task",
        "summary": "Capability Assign Task: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Assign Task\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Assign Task** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "complete-task",
        "title": "Complete Task",
        "summary": "Capability Complete Task: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Complete Task\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Complete Task** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "create-objective",
        "title": "Create Objective",
        "summary": "Capability Create Objective: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Create Objective\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Objective** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "track-objective-progress",
        "title": "Track Objective Progress",
        "summary": "Capability Track Objective Progress: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Track Objective Progress\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Track Objective Progress** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "create-collaboration",
        "title": "Create Collaboration",
        "summary": "Capability Create Collaboration: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Create Collaboration\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Collaboration** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "summarize-conversation",
        "title": "Summarize Conversation",
        "summary": "Capability Summarize Conversation: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Summarize Conversation\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Summarize Conversation** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "build-context-capsule",
        "title": "Build Context Capsule",
        "summary": "Capability Build Context Capsule: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Build Context Capsule\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Build Context Capsule** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "retrieve-memory",
        "title": "Retrieve Memory",
        "summary": "Capability Retrieve Memory: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Retrieve Memory\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Retrieve Memory** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "create-workflow",
        "title": "Create Workflow",
        "summary": "Capability Create Workflow: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Create Workflow\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Workflow** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "run-workflow",
        "title": "Run Workflow",
        "summary": "Capability Run Workflow: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Run Workflow\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Run Workflow** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "install-plugin",
        "title": "Install Plugin",
        "summary": "Capability Install Plugin: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Install Plugin\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Install Plugin** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "register-capability",
        "title": "Register Capability",
        "summary": "Capability Register Capability: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Register Capability\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Register Capability** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "analyze-customer",
        "title": "Analyze Customer",
        "summary": "Capability Analyze Customer: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Analyze Customer\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Analyze Customer** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "reason-about-goal",
        "title": "Reason About Goal",
        "summary": "Capability Reason About Goal: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Reason About Goal\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Reason About Goal** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "generate-plan",
        "title": "Generate Plan",
        "summary": "Capability Generate Plan: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Generate Plan\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Generate Plan** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "evaluate-decision",
        "title": "Evaluate Decision",
        "summary": "Capability Evaluate Decision: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Evaluate Decision\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Evaluate Decision** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "run-simulation",
        "title": "Run Simulation",
        "summary": "Capability Run Simulation: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Run Simulation\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Run Simulation** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "execute-command",
        "title": "Execute Command",
        "summary": "Capability Execute Command: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Execute Command\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Execute Command** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "create-notification",
        "title": "Create Notification",
        "summary": "Capability Create Notification: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Create Notification\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Create Notification** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "search-knowledge",
        "title": "Search Knowledge",
        "summary": "Capability Search Knowledge: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Search Knowledge\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Search Knowledge** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "index-document",
        "title": "Index Document",
        "summary": "Capability Index Document: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Index Document\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Index Document** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "translate-document",
        "title": "Translate Document",
        "summary": "Capability Translate Document: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Translate Document\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Translate Document** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "extract-data",
        "title": "Extract Data",
        "summary": "Capability Extract Data: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Extract Data\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Extract Data** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      },
      {
        "slug": "classify-ticket",
        "title": "Classify Ticket",
        "summary": "Capability Classify Ticket: contrato, permisos, input, output, eventos y observabilidad.",
        "status": "draft",
        "content": "# Classify Ticket\n\n## Tipo\n\nCapability.\n\n## Propósito\n\nPermitir que Flowly ejecute la capacidad **Classify Ticket** desde Apps, Companion, Workflows, APIs o Plugins sin duplicar lógica.\n\n## Contrato base\n\n### Input\n\nPendiente de especificación detallada.\n\n### Output\n\nResultado estructurado, nunca texto libre salvo que la capacidad sea de generación de contenido.\n\n## Reglas\n\n- Debe registrarse en el Capability Registry.\n- Debe ejecutarse mediante el Capability Runtime.\n- Debe generar observabilidad.\n- Debe declarar permisos y políticas.\n\n## Events\n\n- CapabilityRequested\n- CapabilityExecuted\n- CapabilityFailed\n\n## Estado\n\nBorrador inicial preparado para desarrollo.\n"
      }
    ]
  },
  {
    "slug": "api",
    "title": "API Specification",
    "badge": "Integraciones",
    "description": "Especificación de APIs públicas basadas en Capabilities.",
    "chapters": [
      {
        "slug": "api-principles",
        "title": "API Principles",
        "summary": "APIs como entrada al Capability Runtime.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "authentication",
        "title": "Authentication",
        "summary": "Autenticación externa con Identity Engine.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "authorization",
        "title": "Authorization",
        "summary": "Evaluación de permisos por Capability.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "errors",
        "title": "Errors",
        "summary": "Formato oficial de errores.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "pagination",
        "title": "Pagination",
        "summary": "Paginación estándar.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "webhooks",
        "title": "Webhooks",
        "summary": "Eventos salientes para integraciones.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "rate-limits",
        "title": "Rate Limits",
        "summary": "Límites por organización y token.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "versioning",
        "title": "Versioning",
        "summary": "Versionado público estable.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "openapi-generation",
        "title": "OpenAPI Generation",
        "summary": "Documentación automática.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "sdk-generation",
        "title": "SDK Generation",
        "summary": "SDKs generados desde contratos.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "api-explorer",
        "title": "API Explorer",
        "summary": "Explorador interactivo para partners.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "public-api-roadmap",
        "title": "Public API Roadmap",
        "summary": "Evolución de endpoints públicos.",
        "status": "ready",
        "content": "draft"
      }
    ]
  },
  {
    "slug": "sdk",
    "title": "SDK Specification",
    "badge": "Desarrolladores",
    "description": "Cómo se construirán SDKs oficiales de Flowly.",
    "chapters": [
      {
        "slug": "sdk-philosophy",
        "title": "SDK Philosophy",
        "summary": "SDKs como clientes de contratos oficiales.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "typescript-sdk",
        "title": "TypeScript SDK",
        "summary": "SDK principal para Apps y Plugins.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "python-sdk",
        "title": "Python SDK",
        "summary": "SDK para automatización y datos.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "php-sdk",
        "title": "PHP SDK",
        "summary": "SDK para integraciones empresariales tradicionales.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "dotnet-sdk",
        "title": "DotNet SDK",
        "summary": "SDK para entornos corporativos.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "authentication-helpers",
        "title": "Authentication Helpers",
        "summary": "Gestión de tokens.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "capability-client",
        "title": "Capability Client",
        "summary": "Cliente universal de Capabilities.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "webhook-client",
        "title": "Webhook Client",
        "summary": "Cliente para Events.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "examples",
        "title": "Examples",
        "summary": "Ejemplos mantenidos y probados.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "sdk-versioning",
        "title": "SDK Versioning",
        "summary": "Versionado y compatibilidad.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "sdk-generator",
        "title": "SDK Generator",
        "summary": "Generación automática.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "partner-toolkit",
        "title": "Partner Toolkit",
        "summary": "Herramientas para partners.",
        "status": "ready",
        "content": "draft"
      }
    ]
  },
  {
    "slug": "marketplace",
    "title": "Marketplace Specification",
    "badge": "Ecosistema",
    "description": "Apps, Plugins, Tools, Capabilities y monetización.",
    "chapters": [
      {
        "slug": "marketplace-vision",
        "title": "Marketplace Vision",
        "summary": "Extensiones como capacidades gobernadas.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "app-listing",
        "title": "App Listing",
        "summary": "Publicación de Apps.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "plugin-listing",
        "title": "Plugin Listing",
        "summary": "Publicación de Plugins.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "capability-marketplace",
        "title": "Capability Marketplace",
        "summary": "Capacidades independientes como producto.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "tool-providers",
        "title": "Tool Providers",
        "summary": "Proveedores externos.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "certification",
        "title": "Certification",
        "summary": "Verified, Certified y Enterprise Ready.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "trust-score",
        "title": "Trust Score",
        "summary": "Confianza dinámica por extensión.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "billing",
        "title": "Billing",
        "summary": "Modelo de monetización.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "reviews",
        "title": "Reviews",
        "summary": "Opiniones y métricas.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "enterprise-policies",
        "title": "Enterprise Policies",
        "summary": "Restricciones empresariales.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "developer-console",
        "title": "Developer Console",
        "summary": "Panel para creadores.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "marketplace-roadmap",
        "title": "Marketplace Roadmap",
        "summary": "Evolución del ecosistema.",
        "status": "ready",
        "content": "draft"
      }
    ]
  },
  {
    "slug": "companion",
    "title": "Companion Specification",
    "badge": "IA Operativa",
    "description": "Especificación específica del Companion OS.",
    "chapters": [
      {
        "slug": "companion-identity",
        "title": "Companion Identity",
        "summary": "Identidad estable del Companion.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "personality-profiles",
        "title": "Personality Profiles",
        "summary": "Perfiles de comunicación.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "conversation-model",
        "title": "Conversation Model",
        "summary": "Conversaciones como colaboración.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "memory-usage",
        "title": "Memory Usage",
        "summary": "Uso gobernado de memoria.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "context-usage",
        "title": "Context Usage",
        "summary": "Context Capsules en cada interacción.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "initiative-rules",
        "title": "Initiative Rules",
        "summary": "Cuándo intervenir.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "presence-rules",
        "title": "Presence Rules",
        "summary": "Dónde aparece.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "avatar-behaviour",
        "title": "Avatar Behaviour",
        "summary": "Comportamiento visual.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "voice-behaviour",
        "title": "Voice Behaviour",
        "summary": "Conversación hablada.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "tool-usage",
        "title": "Tool Usage",
        "summary": "Cómo solicita capacidades.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "human-approval",
        "title": "Human Approval",
        "summary": "Control humano.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "companion-workspace",
        "title": "Companion Workspace",
        "summary": "Espacio de trabajo persistente.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "companion-observability",
        "title": "Companion Observability",
        "summary": "Trazabilidad.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "companion-safety",
        "title": "Companion Safety",
        "summary": "Límites y seguridad.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "companion-development",
        "title": "Companion Development",
        "summary": "Cómo evolucionarlo.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "companion-roadmap",
        "title": "Companion Roadmap",
        "summary": "MVP y futuro.",
        "status": "ready",
        "content": "draft"
      }
    ]
  },
  {
    "slug": "security-governance",
    "title": "Security & Governance",
    "badge": "Confianza",
    "description": "Seguridad, privacidad, cumplimiento y gobierno.",
    "chapters": [
      {
        "slug": "security-principles",
        "title": "Security Principles",
        "summary": "Seguridad por diseño.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "identity-model",
        "title": "Identity Model",
        "summary": "Toda acción con identidad.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "authorization-model",
        "title": "Authorization Model",
        "summary": "Permisos dinámicos.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "rls-strategy",
        "title": "RLS Strategy",
        "summary": "Row Level Security en Supabase.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "secrets-management",
        "title": "Secrets Management",
        "summary": "Gestión de secretos.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "audit-logs",
        "title": "Audit Logs",
        "summary": "Auditoría inmutable.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "gdpr",
        "title": "GDPR",
        "summary": "Privacidad y derechos de usuario.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "data-retention",
        "title": "Data Retention",
        "summary": "Retención y eliminación.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "ai-governance",
        "title": "AI Governance",
        "summary": "Uso seguro de IA.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "plugin-security",
        "title": "Plugin Security",
        "summary": "Aislamiento de extensiones.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "incident-response",
        "title": "Incident Response",
        "summary": "Respuesta ante incidentes.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "security-roadmap",
        "title": "Security Roadmap",
        "summary": "Evolución de seguridad.",
        "status": "ready",
        "content": "draft"
      }
    ]
  },
  {
    "slug": "roadmap",
    "title": "Roadmap",
    "badge": "Evolución",
    "description": "Planes de implementación y crecimiento.",
    "chapters": [
      {
        "slug": "mvp-roadmap",
        "title": "MVP Roadmap",
        "summary": "Primer producto usable.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "90-day-plan",
        "title": "90-Day Plan",
        "summary": "Primeros 90 días.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "12-month-plan",
        "title": "12-Month Plan",
        "summary": "Primer año.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "companion-roadmap",
        "title": "Companion Roadmap",
        "summary": "Evolución del Companion.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "marketplace-roadmap",
        "title": "Marketplace Roadmap",
        "summary": "Evolución del ecosistema.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "enterprise-roadmap",
        "title": "Enterprise Roadmap",
        "summary": "Capacidades enterprise.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "ai-roadmap",
        "title": "AI Roadmap",
        "summary": "Estrategia de IA.",
        "status": "ready",
        "content": "draft"
      },
      {
        "slug": "docs-roadmap",
        "title": "Docs Roadmap",
        "summary": "Flowly Docs como producto.",
        "status": "ready",
        "content": "draft"
      }
    ]
  },
  {
    "slug": "glossary",
    "title": "Glossary",
    "badge": "Lenguaje común",
    "description": "Diccionario oficial de términos de Flowly OS.",
    "chapters": [
      {
        "slug": "business-object",
        "title": "Business Object",
        "summary": "Definición oficial de Business Object.",
        "status": "draft",
        "content": "# Business Object\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "capability",
        "title": "Capability",
        "summary": "Definición oficial de Capability.",
        "status": "draft",
        "content": "# Capability\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "engine",
        "title": "Engine",
        "summary": "Definición oficial de Engine.",
        "status": "draft",
        "content": "# Engine\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "kernel",
        "title": "Kernel",
        "summary": "Definición oficial de Kernel.",
        "status": "draft",
        "content": "# Kernel\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "context-capsule",
        "title": "Context Capsule",
        "summary": "Definición oficial de Context Capsule.",
        "status": "draft",
        "content": "# Context Capsule\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "memory",
        "title": "Memory",
        "summary": "Definición oficial de Memory.",
        "status": "draft",
        "content": "# Memory\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "companion",
        "title": "Companion",
        "summary": "Definición oficial de Companion.",
        "status": "draft",
        "content": "# Companion\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "operation-id",
        "title": "Operation ID",
        "summary": "Definición oficial de Operation ID.",
        "status": "draft",
        "content": "# Operation ID\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "event",
        "title": "Event",
        "summary": "Definición oficial de Event.",
        "status": "draft",
        "content": "# Event\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "command",
        "title": "Command",
        "summary": "Definición oficial de Command.",
        "status": "draft",
        "content": "# Command\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "query",
        "title": "Query",
        "summary": "Definición oficial de Query.",
        "status": "draft",
        "content": "# Query\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "policy",
        "title": "Policy",
        "summary": "Definición oficial de Policy.",
        "status": "draft",
        "content": "# Policy\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "organization",
        "title": "Organization",
        "summary": "Definición oficial de Organization.",
        "status": "draft",
        "content": "# Organization\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "identity",
        "title": "Identity",
        "summary": "Definición oficial de Identity.",
        "status": "draft",
        "content": "# Identity\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "workflow",
        "title": "Workflow",
        "summary": "Definición oficial de Workflow.",
        "status": "draft",
        "content": "# Workflow\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "tool",
        "title": "Tool",
        "summary": "Definición oficial de Tool.",
        "status": "draft",
        "content": "# Tool\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "ai-runtime",
        "title": "AI Runtime",
        "summary": "Definición oficial de AI Runtime.",
        "status": "draft",
        "content": "# AI Runtime\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "governance",
        "title": "Governance",
        "summary": "Definición oficial de Governance.",
        "status": "draft",
        "content": "# Governance\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "observability",
        "title": "Observability",
        "summary": "Definición oficial de Observability.",
        "status": "draft",
        "content": "# Observability\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      },
      {
        "slug": "digital-workforce",
        "title": "Digital Workforce",
        "summary": "Definición oficial de Digital Workforce.",
        "status": "draft",
        "content": "# Digital Workforce\n\nDefinición oficial pendiente de ampliación. Este término forma parte del lenguaje arquitectónico de Flowly OS.\n"
      }
    ]
  },
  {
    "slug": "api-sdk-marketplace",
    "title": "API · SDK · Marketplace",
    "badge": "Ecosistema",
    "description": "Vista conjunta para integradores, SDKs, APIs, Plugins, Tools y partners.",
    "chapters": [
      {
        "slug": "api-specification",
        "title": "API Specification",
        "summary": "APIs públicas como exposición de Capabilities oficiales.",
        "status": "draft",
        "content": "# API Specification\n\nLas APIs públicas de Flowly exponen Capabilities oficiales, nunca implementaciones internas.\n\n## Reglas\n\n- Toda API pasa por Capability Runtime.\n- Toda llamada tiene Identity, Authorization y Observability.\n- Los contratos públicos son versionados."
      },
      {
        "slug": "sdk-specification",
        "title": "SDK Specification",
        "summary": "SDKs generados desde contratos y ejemplos prácticos.",
        "status": "draft",
        "content": "# SDK Specification\n\nLos SDKs oficiales facilitan el consumo de Flowly desde herramientas externas.\n\n## Regla\n\nEl SDK se genera desde contratos oficiales siempre que sea posible."
      },
      {
        "slug": "marketplace-specification",
        "title": "Marketplace Specification",
        "summary": "Apps, Plugins, Tools, Capabilities y Trust Score.",
        "status": "draft",
        "content": "# Marketplace Specification\n\nEl Marketplace distribuye capacidades, Apps, Plugins y Tools certificadas.\n\n## Regla\n\nToda extensión se ejecuta mediante Runtime oficial, con permisos explícitos y observabilidad."
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
