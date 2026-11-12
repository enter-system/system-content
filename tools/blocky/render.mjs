// Render a Remotion composition with the machine's Chromium (WebGL via SwiftShader).
//   node render.mjs <CompositionId> <out.mp4> ['{"json":"props"}']
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import { createRequire } from 'node:module';

const [id = 'Test', out = 'out/test.mp4', props = '{}'] = process.argv.slice(2);
const require = createRequire(import.meta.url);
let browserExecutable = process.env.CHROME_PATH || null;
if (!browserExecutable) { try { browserExecutable = require('playwright').chromium.executablePath(); } catch {} }
const inputProps = JSON.parse(props);
const chromiumOptions = { gl: 'swangle' };
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.jsx'), publicDir: path.resolve('public') });
const composition = await selectComposition({ serveUrl, id, inputProps, browserExecutable, chromiumOptions });
await renderMedia({ composition, serveUrl, codec: 'h264', outputLocation: out, inputProps, browserExecutable, chromiumOptions,
  onProgress: ({ progress }) => process.stdout.write(`\r${Math.round(progress * 100)}%`) });
console.log('\nrendered', out);
