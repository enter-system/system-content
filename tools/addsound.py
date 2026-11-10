#!/usr/bin/env python3
"""Add a sound from one of Nahum's screen recordings to the sound bank.

    python3 tools/addsound.py <recording.mp4> <id> <hype|calm> [--start S] [--end E] [--note "..."]

Writes sounds/<id>.m4a (the audio, trimmed) and sounds/<id>.json:
    { id, mood, bpm, beat (seconds per beat), beats: [...], drop, length, note }
`beats` are beat times in the clip; `drop` is the strongest hit (where the energy jumps).
render.cjs uses these to cut videos on the beat (post.sound = '<id>').
"""
import json, os, subprocess, sys
import numpy as np
import librosa

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    a = sys.argv[1:]
    if len(a) < 3:
        sys.exit(__doc__)
    src, sid, mood = a[0], a[1], a[2]
    opt = {a[i]: a[i + 1] for i in range(3, len(a) - 1, 2)}
    out_dir = os.path.join(ROOT, 'sounds'); os.makedirs(out_dir, exist_ok=True)
    m4a = os.path.join(out_dir, f'{sid}.m4a')
    cmd = ['ffmpeg', '-y', '-loglevel', 'error']
    if '--start' in opt: cmd += ['-ss', opt['--start']]
    cmd += ['-i', src]
    if '--end' in opt: cmd += ['-t', str(float(opt['--end']) - float(opt.get('--start', 0)))]
    cmd += ['-vn', '-ac', '2', '-ar', '44100', '-c:a', 'aac', '-b:a', '192k', m4a]
    subprocess.run(cmd, check=True)

    wav = os.path.join(out_dir, f'.{sid}.wav')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', m4a, '-ac', '1', '-ar', '22050', wav], check=True)
    y, sr = librosa.load(wav, sr=22050, mono=True); os.remove(wav)
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
    tempo = float(np.atleast_1d(tempo)[0])
    env = librosa.onset.onset_strength(y=y, sr=sr)
    times = librosa.times_like(env, sr=sr)
    # the drop: the beat after the biggest rise in loudness (1 s windows)
    rms = librosa.feature.rms(y=y)[0]; rt = librosa.times_like(rms, sr=sr)
    win = max(1, int(len(rms) / max(1, rt[-1])))
    smooth = np.convolve(rms, np.ones(win) / win, mode='same')
    rise = np.diff(smooth, prepend=smooth[0])
    drop_t = float(rt[int(np.argmax(rise))]) if len(rise) else 0.0
    beats = [round(float(b), 3) for b in beats]
    drop = min(beats, key=lambda b: abs(b - drop_t)) if beats else drop_t
    beat = float(np.median(np.diff(beats))) if len(beats) > 1 else 60 / max(tempo, 1)
    info = {'id': sid, 'mood': mood, 'bpm': round(tempo, 1), 'beat': round(beat, 4), 'beats': beats,
            'drop': drop, 'length': round(len(y) / sr, 2), 'note': opt.get('--note', ''),
            'loudest': [round(float(times[i]), 2) for i in sorted(np.argsort(env)[-6:])]}
    json.dump(info, open(os.path.join(out_dir, f'{sid}.json'), 'w'), indent=1)
    print(json.dumps({k: info[k] for k in ('id', 'mood', 'bpm', 'beat', 'drop', 'length')}), f'{len(beats)} beats')


if __name__ == '__main__':
    main()
