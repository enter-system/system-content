// Renders one day's posts from a plan file.
//   node tools/render.cjs plans/2026-11-11.json
// Writes posts/<date>/<id>-<n>.jpg for slideshows and posts/<date>/<id>.mp4 for videos.
// Plan: { date, posts: [ {id, type:'slides', slides:[...]} | {id, type:'video', hook, hookBg?, scenes:[0-5]} | {id, type:'montage', hook?, frames:[{photo,text}], end?:true} ] }
// Photo paths are relative to the repo root (e.g. "photos/library/gym-01.jpg").
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOOLS = __dirname;
const SC = [[0, 3.2], [3.2, 7.0], [7.0, 10.6], [10.6, 14.0], [14.0, 16.8], [16.8, 20.5]]; // where each scene sits in track.m4a
const ENC = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30'];
const ff = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args]);
const fileUrl = (p) => 'file://' + path.join(ROOT, p);

async function frames(page, n, draw, out) {
  const tmp = out.replace(/\.mp4$/, '.tmp.mp4');
  const p = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', ...ENC, tmp]);
  for (let f = 0; f < n; f++) {
    await draw(f);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!p.stdin.write(buf)) await new Promise((r) => p.stdin.once('drain', r));
  }
  p.stdin.end();
  if ((await new Promise((r) => p.on('close', r))) !== 0) throw new Error('ffmpeg failed for ' + out);
  fs.renameSync(tmp, out);
}

async function hookCard(page, text, bg, out) {
  const q = `?t=${encodeURIComponent(text)}${bg ? `&bg=${encodeURIComponent(fileUrl(bg))}` : ''}`;
  await page.goto('file://' + path.join(TOOLS, 'hook.html') + q);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await frames(page, 60, (f) => page.evaluate((t) => render(t), f / 30), out);
}

function finish(parts, audioParts, outDir, id, work) {
  // parts: video files with matching settings; audioParts: [[start,end] in track.m4a]
  const list = path.join(work, `${id}.txt`);
  fs.writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n'));
  const silent = path.join(work, `${id}-v.mp4`);
  ff(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent]);
  const fc = audioParts.map(([a, e], i) => `[0:a]atrim=${a}:${e},asetpts=PTS-STARTPTS[a${i}]`).join(';') + ';' + audioParts.map((_, i) => `[a${i}]`).join('') + `concat=n=${audioParts.length}:v=0:a=1[out]`;
  const aud = path.join(work, `${id}-a.m4a`);
  ff(['-i', path.join(TOOLS, 'scenes', 'track.m4a'), '-filter_complex', fc, '-map', '[out]', '-c:a', 'aac', '-b:a', '160k', aud]);
  ff(['-i', silent, '-i', aud, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-shortest', '-movflags', '+faststart', path.join(outDir, `${id}.mp4`)]);
}

(async () => {
  const plan = JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), 'utf8'));
  const outDir = path.join(ROOT, 'posts', plan.date);
  const work = path.join(ROOT, '.work'); fs.mkdirSync(outDir, { recursive: true }); fs.mkdirSync(work, { recursive: true });
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const post of plan.posts) {
    if (post.type === 'slides') {
      await page.goto('file://' + path.join(TOOLS, 'slide.html'));
      for (let i = 0; i < post.slides.length; i++) {
        const sl = { ...post.slides[i] }; if (sl.bg) sl.bg = fileUrl(sl.bg);
        await page.evaluate((s) => show(s), sl);
        await page.waitForTimeout(60);
        await page.screenshot({ path: path.join(outDir, `${post.id}-${i + 1}.jpg`), type: 'jpeg', quality: 90 });
      }
    } else if (post.type === 'video') {
      const hk = path.join(work, `${post.id}-hook.mp4`);
      await hookCard(page, post.hook, post.hookBg, hk);
      finish([hk, ...post.scenes.map((i) => path.join(TOOLS, 'scenes', `scene${i}.mp4`))], [[0, 2.0], ...post.scenes.map((i) => SC[i])], outDir, post.id, work);
    } else if (post.type === 'montage') {
      const parts = [], audio = [];
      if (post.hook) { const hk = path.join(work, `${post.id}-hook.mp4`); await hookCard(page, post.hook, post.frames[0]?.photo, hk); parts.push(hk); audio.push([0, 2.0]); }
      await page.goto('file://' + path.join(TOOLS, 'montage.html'));
      const DUR = 2.6; let at = 3.2; // ride the beat section of the track
      for (let i = 0; i < post.frames.length; i++) {
        const f = post.frames[i]; const out = path.join(work, `${post.id}-m${i}.mp4`);
        await page.evaluate((fr) => setFrame(fr), { photo: fileUrl(f.photo), text: f.text });
        await frames(page, Math.round(DUR * 30), (n) => page.evaluate(([t, d]) => render(t, d), [n / 30, DUR]), out);
        parts.push(out); audio.push([at, at + DUR]); at += DUR; if (at + DUR > 16.8) at = 3.2;
      }
      if (post.end !== false) { parts.push(path.join(TOOLS, 'scenes', 'scene5.mp4')); audio.push(SC[5]); }
      finish(parts, audio, outDir, post.id, work);
    }
    console.log('rendered', post.id);
  }
  await b.close();
  fs.rmSync(work, { recursive: true, force: true });
})();
