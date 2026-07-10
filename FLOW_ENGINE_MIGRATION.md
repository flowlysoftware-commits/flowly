# Flow Engine V1

This package mounts a single runtime from `components/flow-engine/FlowEngine.tsx`.
Legacy companion renderers are hidden by CSS and the old `flow-companion` entrypoints re-export the engine for compatibility.

After the project compiles, these obsolete files/folders can be deleted from the full repository after confirming they have no remaining imports:
- old Unity WebGL public folders
- legacy Flow overlay components
- legacy `FlowlyAssistant3D` renderers
- duplicate companion widgets

The engine expects the existing model and animation assets under `/public/models/flow` and `/public/avatars`.
