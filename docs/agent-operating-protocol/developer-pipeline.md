# Developer Pipeline

`/developer` es el centro único para construir Flowly OS mediante conversación.

## Flujo obligatorio

1. Idea en lenguaje natural.
2. Lectura de `AI_BOOTSTRAP.md`, `.github/copilot-instructions.md` y documentación relevante.
3. Consulta de Knowledge y Docs.
4. Construcción de Project Graph.
5. Blueprint con archivos afectados.
6. Aprobación humana.
7. Executor V3 crea rama segura y Pull Request.
8. GitHub/Vercel publican checks.
9. QA Agent corrige sobre la misma rama si el build falla.
10. Revisión humana y merge.

## Reglas

- Nunca modificar `main` directamente.
- Nunca crear motores duplicados si existe uno.
- Nunca crear PR falso si no hay cambios seguros.
- No crear documentación de conversación dentro de `docs/executor`.
- Toda corrección de build debe hacerse sobre la misma rama del PR.
- `/developer` debe explicar el plan en lenguaje normal y ocultar detalles técnicos hasta que el usuario los pida.

## Motores implicados

- Brain: entiende la intención.
- Knowledge: aporta memoria técnica.
- Project Graph: detecta impacto real.
- Studio/Generator: define blueprints y módulos.
- Executor V3: aplica cambios en rama segura.
- QA Agent: revisa checks y corrige builds.
- GitHub Executor: crea ramas, commits y Pull Requests.
