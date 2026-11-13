// Render stills to check a story: node still.mjs <props.json> <outdir> <sec> [sec...]
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const [propsFile, outDir, ...secs] = process.argv.slice(2);
const require = createRequire(import.meta.url);
const browserExecutable = process.env.CHROME_PATH || require('playwright').chromium.executablePath();
const inputProps = JSON.parse(fs.readFileSync(propsFile, 'utf8'));
const chromiumOptions = { gl: 'swangle' };
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.jsx'), publicDir: path.resolve('public') });
const composition = await selectComposition({ serveUrl, id: 'Story', inputProps, browserExecutable, chromiumOptions });
fs.mkdirSync(outDir, { recursive: true });
for (const s of secs) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * 30));
  await renderStill({ composition, serveUrl, frame, output: path.join(outDir, `f${String(frame).padStart(4, '0')}.jpg`), imageFormat: 'jpeg', inputProps, browserExecutable, chromiumOptions, scale: 0.5 });
  console.log('still', s);
}
