#!/usr/bin/env python3
"""Make Story versions of a day's slideshows.

    python3 tools/story.py plans/2026-11-12.json [more plans...]

For every `type: slides` post, joins its rendered slides (posts/<date>/<id>-N.jpg)
into posts/<date>/<id>-story.mp4: 1080x1920, 2.5 s per slide (3 s for the cover),
with a silent audio track so Instagram/Facebook Stories accept it.
Videos don't need this: their own mp4 goes to Stories as is.
"""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def story(date, post):
    d = os.path.join(ROOT, 'posts', date)
    n = len(post['slides'])
    imgs = [os.path.join(d, f"{post['id']}-{i}.jpg") for i in range(1, n + 1)]
    durs = [3.0] + [2.5] * (n - 1)
    out = os.path.join(d, f"{post['id']}-story.mp4")
    args = ['ffmpeg', '-y', '-loglevel', 'error']
    for img, t in zip(imgs, durs):
        args += ['-loop', '1', '-t', str(t), '-i', img]
    args += ['-f', 'lavfi', '-t', str(sum(durs)), '-i', 'anullsrc=r=44100:cl=stereo']
    scale = ''.join(f'[{i}:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v{i}];' for i in range(n))
    fc = scale + ''.join(f'[v{i}]' for i in range(n)) + f'concat=n={n}:v=1:a=0[v]'
    args += ['-filter_complex', fc, '-map', '[v]', '-map', f'{n}:a', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
             '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', '-movflags', '+faststart', out]
    subprocess.run(args, check=True)
    print('story', os.path.relpath(out, ROOT), f'{sum(durs):.1f}s')

for p in sys.argv[1:]:
    plan = json.load(open(p))
    for post in plan['posts']:
        if post.get('type') == 'slides' and not post['id'].startswith('draft-'):
            story(plan['date'], post)
