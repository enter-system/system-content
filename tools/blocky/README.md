# tools/blocky: 3D videos (Three.js + Remotion)

- **Three.js** (via `@react-three/fiber`, `@react-three/drei`, `@remotion/three`) draws the 3D scenes.
- **Remotion** handles captions (`@remotion/captions`), audio (`<Audio>`, `@remotion/media-utils`), transitions, fonts and the mp4 render.

Setup: `cd tools/blocky && npm install`

Render: `node render.mjs <CompositionId> out/<file>.mp4 '{"props":"json"}'`
(uses the machine's Chromium with SwiftShader WebGL; set `CHROME_PATH` to use another browser).

Compositions are registered in `src/index.jsx`. `src/Test.jsx` is a smoke test (spinning cube + caption + sound).
Put sounds/fonts the video needs in `public/` (sounds are copied from `sounds/` at render time, not committed).
