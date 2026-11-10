// Renders one day's posts from a plan file.
//   node tools/render.cjs plans/2026-11-11.json
// Writes posts/<date>/<id>-<n>.jpg for slideshows and posts/<date>/<id>.mp4 for videos.
// Plan: { date, posts: [ {id, type:'explainer', scenes:[{cap, show, ...}]} | {id, type:'slides', slides:[...]} | {id, type:'video', hook, kicker?, calm?, speed?, hookBg?, scenes:[0-5]} | {id, type:'montage', hook?, frames:[{photo,text}], end?:true} ] }
// Photo paths are relative to the repo root (e.g. "photos/library/gym-01.jpg").
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOOLS = __dirname;
const SC = [[0, 3.2], [3.2, 7.0], [7.0, 10.6], [10.6, 14.0], [14.0, 16.8], [16.8, 20.5]]; // where each scene sits in track.m4a
const ENC = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30'];
const HOOK_FRAMES = 45; // 1.5 s
const HOOK_AUDIO = [3.15, 4.65]; // the bass impact + first beats of the track
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

async function hookCard(page, text, bg, out, kicker, calm) {
  const q = `?t=${encodeURIComponent(text)}&k=${encodeURIComponent(kicker || 'WARNING')}${calm ? '&calm=1' : ''}${bg ? `&bg=${encodeURIComponent(fileUrl(bg))}` : ''}`;
  await page.goto('file://' + path.join(TOOLS, 'hook.html') + q);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await frames(page, HOOK_FRAMES, (f) => page.evaluate((t) => render(t), f / 30), out);
}

function finish(parts, audioParts, outDir, id, work, speed = 1.2) {
  // parts: video files with matching settings; audioParts: [[start,end] in track.m4a]
  const list = path.join(work, `${id}.txt`);
  fs.writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n'));
  const silent = path.join(work, `${id}-v.mp4`);
  ff(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', silent]);
  const fc = audioParts.map(([a, e], i) => `[0:a]atrim=${a}:${e},asetpts=PTS-STARTPTS[a${i}]`).join(';') + ';' + audioParts.map((_, i) => `[a${i}]`).join('') + `concat=n=${audioParts.length}:v=0:a=1[out]`;
  const aud = path.join(work, `${id}-a.m4a`);
  ff(['-i', path.join(TOOLS, 'scenes', 'track.m4a'), '-filter_complex', fc, '-map', '[out]', '-c:a', 'aac', '-b:a', '160k', aud]);
  const muxed = path.join(work, `${id}-m.mp4`);
  ff(['-i', silent, '-i', aud, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-shortest', muxed]);
  // Speed the whole cut up a little so it feels urgent (speed 1 = as rendered).
  if (speed === 1) fs.copyFileSync(muxed, path.join(outDir, `${id}.mp4`));
  else ff(['-i', muxed, '-filter_complex', `[0:v]setpts=PTS/${speed}[v];[0:a]atempo=${speed}[a]`, '-map', '[v]', '-map', '[a]', ...ENC, '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', path.join(outDir, `${id}.mp4`)]);
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
      await hookCard(page, post.hook, post.hookBg, hk, post.kicker, post.calm);
      finish([hk, ...post.scenes.map((i) => path.join(TOOLS, 'scenes', `scene${i}.mp4`))], [HOOK_AUDIO, ...post.scenes.map((i) => SC[i])], outDir, post.id, work, post.speed ?? 1.2);
    } else if (post.type === 'explainer') {
      // Minimal animated explainer (tools/explain.html). post.scenes = [{cap, show, ...}], ends on the coming-soon end card.
      await page.goto('file://' + path.join(TOOLS, 'explain.html'));
      await page.evaluate(() => document.fonts.ready);
      const total = await page.evaluate((s) => load(s), post.scenes);
      const out = path.join(work, `${post.id}-x.mp4`);
      await frames(page, Math.round(total * 30), (f) => page.evaluate((t) => render(t), f / 30), out);
      const audio = []; let left = total, at = 3.2; // ride the beat section of the track, looping if needed
      while (left > 0.01) { const d = Math.min(left, 16.8 - at); audio.push([at, at + d]); left -= d; at = 3.2; }
      finish([out, path.join(TOOLS, 'scenes', 'scene5.mp4')], [...audio, SC[5]], outDir, post.id, work, post.speed ?? 1);
    } else if (post.type === 'montage') {
      const parts = [], audio = [];
      if (post.hook && !post.mood) { const hk = path.join(work, `${post.id}-hook.mp4`); await hookCard(page, post.hook, post.frames[0]?.photo, hk, post.kicker, post.calm); parts.push(hk); audio.push(HOOK_AUDIO); }
      await page.goto('file://' + path.join(TOOLS, 'montage.html'));
      const DUR = post.dur ?? 2.6; let at = 3.2; // ride the beat section of the track
      for (let i = 0; i < post.frames.length; i++) {
        const f = post.frames[i]; const out = path.join(work, `${post.id}-m${i}.mp4`);
        await page.evaluate((fr) => setFrame(fr), { photo: fileUrl(f.photo), text: f.text ?? post.word, mood: post.mood });
        await frames(page, Math.round(DUR * 30), (n) => page.evaluate(([t, d]) => render(t, d), [n / 30, DUR]), out);
        parts.push(out); audio.push([at, at + DUR]); at += DUR; if (at + DUR > 16.8) at = 3.2;
      }
      if (post.end !== false) { parts.push(path.join(TOOLS, 'scenes', 'scene5.mp4')); audio.push(SC[5]); }
      finish(parts, audio, outDir, post.id, work, post.speed ?? 1.15);
    }
    console.log('rendered', post.id);
  }
  await b.close();
  fs.rmSync(work, { recursive: true, force: true });
})();
