# AI_BOOTSTRAP.md — Flowly OS Agent Boot Protocol

This file is the first document every AI coding agent must read before modifying Flowly.

Flowly is not a traditional CRM. Flowly is an Intelligent Business Operating System. The Companion is not a mascot or a widget: it is the living interface of Flowly OS and must be connected to Brain, Heart, Memory, Event Bus and the business context.

## Mandatory first step

Before changing code, always read the relevant documentation:

1. `docs/SUMMARY.md`
2. `docs/README.md`
3. `docs/architecture-bible/01-vision-foundations.md`
4. `docs/architecture-bible/05-events.md`
5. `docs/architecture-bible/08-context-engine.md`
6. `docs/architecture-bible/09-memory-engine.md`
7. `docs/architecture-bible/15-evolution-engine.md`
8. `docs/architecture-bible/16-companion-os.md`
9. `docs/architecture-bible/19-conversation-engine.md`
10. `docs/architecture-bible/28-execution-engine.md`
11. `docs/architecture-bible/32-avatar-engine.md`
12. `docs/architecture-bible/33-voice-engine.md`
13. `docs/engineering-handbook/13-ai-assisted-development.md`
14. `docs/agent-operating-protocol/README.md`

If the task is about a specific area, also read the matching docs before touching files.

## Non-negotiable rules

- Do not create duplicate runtimes, hooks, engines, providers or APIs if one already exists.
- Search before creating a new file.
- Prefer fixing and consolidating existing architecture over adding parallel code.
- Never leave dead code or half-used legacy paths unless explicitly documented.
- Any Companion feature must integrate with Brain, Heart, Memory, Event Bus and Context where applicable.
- Any voice feature must use one single voice pipeline. Do not mix Web Speech API and MediaRecorder pipelines.
- Do not convert user conversations into Markdown files inside `docs/`.
- Store execution plans, memories and agent traces in structured runtime storage, not as random docs.
- Documentation is for architecture, product knowledge and operational decisions.
- Before finishing, run `npm run build` and fix errors.
- If a build fails, the task is not complete.
- If a feature cannot be verified, say exactly what could not be verified and why.

## Flowly OS mental model

Flowly OS is composed of:

- Brain: reasoning, planning and decision making.
- Heart: emotional state, motivation, celebrations and user feeling.
- Memory: persistent business memory, preferences, milestones and context.
- Knowledge: documentation and structured understanding of Flowly.
- Kernel: core governance, modules, capabilities and runtime registration.
- Event Bus: the nervous system. Every meaningful action emits events.
- Companion: the living interface, not a sidebar chatbot.
- Voice Engine: microphone, transcription, speech and conversation state.
- Avatar Engine: 3D character, animations, movement and presence.
- Movement Engine: NPC-style navigation across the panel.
- Emotion Engine: visible states, personality and reactions.
- Executor: safe code changes, build, tests and Pull Requests.
- Studio: architectural review and module design, not the main user experience.

## Development workflow

For every task:

1. Understand the user's request.
2. Read relevant docs.
3. Inspect existing code paths.
4. Identify duplicates or conflicting implementations.
5. Produce a short plan.
6. Modify only what is needed.
7. Remove or isolate obsolete code if it causes conflicts.
8. Run `npm run build`.
9. Explain what changed, what was verified and what remains.

## Companion-specific rule

The Companion must behave like a game character/NPC inside Flowly OS:

- It can walk to destinations.
- It can greet, think, talk, celebrate and wait.
- It should move as a whole character, not by randomly rotating limbs.
- Voice, animation and Brain responses must be coordinated by state.
- It must never be implemented as disconnected UI fragments.

## Voice-specific rule

There must be one voice runtime:

`Microphone -> MediaRecorder -> Transcription -> Conversation Engine -> Brain -> TTS -> Companion speaks -> restart listening`

Do not leave multiple competing hooks or routes for production voice. Diagnostic pages may exist, but they must reuse the same core voice service or clearly be marked as test-only.

## Git and safety

- Never commit `node_modules/`, `.next/`, `.env`, `.env.local` or generated cache files.
- Prefer branches and Pull Requests for risky changes.
- Never modify production secrets.
- Never paste secrets into docs.

