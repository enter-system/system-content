// Renders the code-drawn anime ad (tools/anime.html) on the beat of a sound, then the app level-up scene and the end card.
//   node tools/anime-ad.cjs [soundId] [outName]   ->  posts/ads/<outName>.mp4
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), TOOLS = __dirname;
const ENC = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30'];
const BEATS = [2, 2, 2, 2, 2, 4, 3]; // beats per drawn scene
const ff = (a) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a]);
(async () => {
  const sid = process.argv[2] || 'hype-semdemora-01', name = process.argv[3] || 'ad-anime-quests';
  const snd = JSON.parse(fs.readFileSync(path.join(ROOT, 'sounds', sid + '.json'), 'utf8'));
  const start = snd.drop, g = snd.beats.filter((b) => b >= start - .001).map((b) => b - start);
  while (g.length < 200) g.push(g[g.length - 1] + snd.beat);
  const out = path.join(ROOT, 'posts', 'ads'), work = path.join(ROOT, '.work'); fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(work, { recursive: true });
  const b = await chromium.launch(), page = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(TOOLS, 'anime.html')); await page.evaluate(() => document.fonts.ready);
  const parts = []; let bi = 0;
  for (let i = 0; i < BEATS.length; i++) {
    const n = Math.round(g[bi + BEATS[i]] * 30) - Math.round(g[bi] * 30); bi += BEATS[i];
    const f = path.join(work, `an${i}.mp4`), tmp = path.join(work, `an${i}.tmp.mp4`);
    const p = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', ...ENC, tmp]);
    await page.evaluate((i) => setScene(i), i);
    for (let k = 0; k < n; k++) { await page.evaluate(([t, d]) => render(t, d), [k / 30, n / 30]); const buf = await page.screenshot({ type: 'jpeg', quality: 92 }); if (!p.stdin.write(buf)) await new Promise((r) => p.stdin.once('drain', r)); }
    p.stdin.end(); if ((await new Promise((r) => p.on('close', r))) !== 0) throw new Error('ffmpeg failed'); fs.renameSync(tmp, f); parts.push(f);
  }
  await b.close();
  parts.push(path.join(TOOLS, 'scenes', 'scene4.mp4'), path.join(TOOLS, 'scenes', 'scene5.mp4'));
  const list = path.join(work, 'an.txt'); fs.writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n'));
  const v = path.join(work, 'an-v.mp4'); ff(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', v]);
  const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', v]).toString());
  ff(['-i', v, '-stream_loop', '-1', '-ss', String(start), '-i', path.join(ROOT, 'sounds', sid + '.m4a'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', `afade=t=out:st=${(dur - .8).toFixed(2)}:d=0.8`, '-c:a', 'aac', '-b:a', '192k', '-t', dur.toFixed(3), '-movflags', '+faststart', path.join(out, name + '.mp4')]);
  fs.rmSync(work, { recursive: true, force: true }); console.log('rendered', name, dur.toFixed(1) + 's');
})();
