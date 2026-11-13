// "In this town" style blocky story (inspo: larpiverse "in this town!" + goopie.yt Roblox stories).
// Props: { shots: [...], sound?: 'sound.m4a', volume?: 0.8, end?: true }
// shot = {
//   set: 'street'|'party'|'park'|'room', mood: 'night'|'dusk',
//   cam: { from:[x,y,z], to?:[x,y,z], look:[x,y,z], lookTo?:[x,y,z], fov?:50 },
//   hero?: { pos, rot, pose, face, glow, lift } (omit to hide), npcFaces?, npcPoses?,
//   words: 'one word shows at a time', wps?: 0.42 (seconds per word), dur?: seconds, sfx?: 'HUFF!' (big caption, no words),
//   hud?: { type:'stats'|'pop'|'title'|'counter'|'levelup'|'quest', ... }
// }
import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing, delayRender, continueRender } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Avatar, Sky, Lights, Street, Party, Park, Room } from './world.jsx';

const FPS = 30;
export const END_SEC = 2.4;
export const shotDur = (s) => s.dur ?? Math.max(1.2, (s.sfx ? 1 : s.words.split(/\s+/).filter(Boolean).length) * (s.wps ?? 0.42) + 0.25);
export const storyFrames = (props) => Math.round((props.shots.reduce((a, s) => a + shotDur(s), 0) + (props.end === false ? 0 : END_SEC)) * FPS);

let fontsReady = false;
function useFonts() {
  const [ok, setOk] = React.useState(fontsReady);
  React.useEffect(() => {
    if (fontsReady) return;
    const h = delayRender('fonts');
    const faces = [new FontFace('Raj', `url(${staticFile('rajdhani-latin-700-normal.woff2')})`, { weight: '700' }), new FontFace('Nunito', `url(${staticFile('nunito-latin-900-normal.woff2')})`, { weight: '900' })];
    Promise.all(faces.map((f) => f.load())).then((fs) => { fs.forEach((f) => document.fonts.add(f)); fontsReady = true; setOk(true); continueRender(h); });
  }, []);
  return ok;
}

const lerp3 = (a, b, u) => a.map((v, i) => v + ((b || a)[i] - v) * u);
function CameraRig({ cam, u }) {
  const { camera } = useThree();
  const e = Easing.inOut(Easing.quad)(u);
  const p = lerp3(cam.from, cam.to, e), l = lerp3(cam.look, cam.lookTo, e);
  camera.position.set(...p);
  if (camera.fov !== (cam.fov ?? 50)) { camera.fov = cam.fov ?? 50; camera.updateProjectionMatrix(); }
  camera.lookAt(new THREE.Vector3(...l));
  return null;
}

function Sparkles({ t, at = [0, 3, 0] }) {
  return Array.from({ length: 22 }, (_, i) => {
    const a = i * 2.4 + t * 1.5, r = 2.2 + (i % 4) * 0.6, y = ((i * 0.37 + t * 1.8) % 6);
    return <mesh key={i} position={[at[0] + Math.cos(a) * r, at[1] + y - 1, at[2] + Math.sin(a) * r]} rotation={[t * 3 + i, t * 2, 0]}><boxGeometry args={[0.22, 0.22, 0.22]} /><meshBasicMaterial color={i % 3 ? '#f5c451' : '#5ee7ff'} /></mesh>;
  });
}

function World({ shot, t, u }) {
  const mood = shot.mood ?? (shot.set === 'party' ? 'dusk' : 'night');
  const h = shot.hero;
  return (
    <>
      <fog attach="fog" args={[mood === 'dusk' ? '#c99a8a' : '#1a2547', 40, 190]} />
      <CameraRig cam={shot.cam} u={u} />
      {shot.set !== 'room' && <Sky mood={mood} />}
      <Lights mood={shot.set === 'room' ? 'night' : mood} glow={h?.glow ? 1 : 0} />
      {shot.set === 'street' && <Street />}
      {shot.set === 'party' && <Party t={t} faces={shot.npcFaces ?? 'grin'} poses={shot.npcPoses ?? 'cheer'} />}
      {shot.set === 'park' && <Park />}
      {shot.set === 'room' && <Room />}
      {h && <Avatar hero pos={h.pos ?? [0, 0, 0]} rot={h.rot ?? 0} pose={h.pose ?? 'idle'} face={h.face ?? 'smile'} t={t} lift={h.lift ?? 0} />}
      {h?.glow && <Sparkles t={t} at={[(h.pos ?? [0])[0], 2, (h.pos ?? [0, 0, 0])[2]]} />}
    </>
  );
}

// ---------- 2D layer ----------
const outline = (w, c = '#000') => `-${w}px -${w}px 0 ${c}, ${w}px -${w}px 0 ${c}, -${w}px ${w}px 0 ${c}, ${w}px ${w}px 0 ${c}, 0 ${w}px 0 ${c}, 0 -${w}px 0 ${c}, ${w}px 0 0 ${c}, -${w}px 0 0 ${c}, 0 8px 18px rgba(0,0,0,.55)`;

function Caption({ shot, t, d }) {
  if (shot.sfx) {
    const s = interpolate(t, [0, 0.12], [1.5, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2)) });
    return <div style={{ position: 'absolute', top: 1060, width: '100%', textAlign: 'center', fontFamily: 'Nunito', fontWeight: 900, fontSize: 120, color: '#fff', textShadow: outline(6), transform: `scale(${s})` }}>{shot.sfx}</div>;
  }
  const words = shot.words.split(/\s+/).filter(Boolean);
  const per = (d - 0.15) / words.length, i = Math.min(words.length - 1, Math.floor(t / per));
  const lt = t - i * per, s = interpolate(lt, [0, 0.08], [1.18, 1], { extrapolateRight: 'clamp' });
  return <div style={{ position: 'absolute', top: 1060, width: '100%', textAlign: 'center', fontFamily: 'Nunito', fontWeight: 900, fontSize: 96, color: '#fff', textShadow: outline(5), transform: `scale(${s})` }}>{words[i]}</div>;
}

const RAJ = { fontFamily: 'Raj', fontWeight: 700, letterSpacing: 4 };
function Hud({ hud, t }) {
  if (!hud) return null;
  const inn = interpolate(t, [0, 0.18], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.6)) });
  if (hud.type === 'stats') return (
    <div style={{ position: 'absolute', top: 260, left: 150, right: 150, padding: '36px 44px', background: 'rgba(7,11,20,.82)', border: '3px solid #5ee7ff', boxShadow: '0 0 40px rgba(94,231,255,.45)', borderRadius: 10, transform: `scale(${inn})`, ...RAJ }}>
      <div style={{ color: '#5ee7ff', fontSize: 40, textAlign: 'center', marginBottom: 22 }}>[ {hud.title ?? 'YOUR STATS'} ]</div>
      {hud.rows.map(([n, v, col], i) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 24, margin: '14px 0', fontSize: 52, color: '#fff' }}>
          <span style={{ width: 120 }}>{n}</span>
          <div style={{ flex: 1, height: 22, background: '#1b2438', borderRadius: 11 }}><div style={{ width: `${Math.min(100, v * (hud.max ? 100 / hud.max : 10)) * interpolate(t, [0.2 + i * 0.1, 0.7 + i * 0.1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}%`, height: '100%', borderRadius: 11, background: col ?? (hud.color === 'red' ? '#ff4d5e' : '#5ee7ff') }} /></div>
          <span style={{ width: 120, textAlign: 'right', color: col ?? (hud.color === 'red' ? '#ff4d5e' : '#f5c451') }}>LV {v}</span>
        </div>
      ))}
    </div>
  );
  if (hud.type === 'quest') return (
    <div style={{ position: 'absolute', top: 250, left: 110, right: 110, padding: '30px 36px', background: 'rgba(7,11,20,.85)', border: '3px solid #5ee7ff', borderRadius: 10, boxShadow: '0 0 40px rgba(94,231,255,.4)', transform: `scale(${inn})`, textAlign: 'center', ...RAJ }}>
      <div style={{ color: '#5ee7ff', fontSize: 38 }}>[ {hud.kick ?? 'NEW QUEST'} ]</div>
      <div style={{ color: '#fff', fontSize: 64, lineHeight: 1.05, marginTop: 12 }}>{hud.text}</div>
      {hud.xp && <div style={{ color: '#f5c451', fontSize: 44, marginTop: 14 }}>{hud.xp}</div>}
    </div>
  );
  if (hud.type === 'pop') {
    const y = interpolate(t, [0, 1.2], [0, -160], { extrapolateRight: 'clamp' }), o = interpolate(t, [0.9, 1.3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return <div style={{ position: 'absolute', top: (hud.y ?? 560) + y, width: '100%', textAlign: 'center', fontFamily: 'Nunito', fontWeight: 900, fontSize: 130, color: '#f5c451', textShadow: outline(6, '#3a2400'), opacity: o, transform: `scale(${inn})` }}>{hud.text}</div>;
  }
  if (hud.type === 'title') return (
    <div style={{ position: 'absolute', top: 330, width: '100%', textAlign: 'center', fontFamily: 'Nunito', fontWeight: 900, fontSize: 120, lineHeight: 1, color: '#ffe14d', textShadow: outline(7), transform: `scale(${inn}) rotate(-3deg)` }}>{hud.text}</div>
  );
  if (hud.type === 'counter') {
    const n = Math.round(interpolate(t, [0.1, hud.over ?? 1.6], [hud.from ?? 0, hud.to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
    return (
      <div style={{ position: 'absolute', top: 230, width: '100%', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 260, lineHeight: 1, color: '#fff', textShadow: outline(9) }}>{n}</div>
        <div style={{ ...RAJ, fontSize: 54, color: '#5ee7ff', textShadow: outline(4) }}>{hud.label}</div>
      </div>
    );
  }
  if (hud.type === 'levelup') return (
    <div style={{ position: 'absolute', top: 300, width: '100%', textAlign: 'center', transform: `scale(${inn})` }}>
      <div style={{ ...RAJ, fontSize: 44, color: '#5ee7ff', textShadow: outline(4) }}>[ SYSTEM ]</div>
      <div style={{ ...RAJ, fontSize: 170, lineHeight: 1, color: '#f5c451', textShadow: `0 0 40px rgba(245,196,81,.9), ${outline(6, '#3a2400')}` }}>LEVEL UP</div>
      {hud.sub && <div style={{ ...RAJ, fontSize: 56, color: '#fff', textShadow: outline(4) }}>{hud.sub}</div>}
    </div>
  );
  return null;
}

function EndCard({ t }) {
  const o = interpolate(t, [0, 0.25], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 45%, #0f2240 0%, #070b14 65%)', opacity: o, alignItems: 'center', justifyContent: 'center', textAlign: 'center', ...RAJ }}>
      <div style={{ fontSize: 46, color: '#5ee7ff', letterSpacing: 12 }}>[ SYSTEM NOTICE ]</div>
      <div style={{ fontSize: 190, lineHeight: 1, color: '#fff', textShadow: '0 0 50px rgba(94,231,255,.8)', marginTop: 20 }}>THE<br />SYSTEM</div>
      <div style={{ fontSize: 72, color: '#f5c451', marginTop: 40, letterSpacing: 10 }}>COMING SOON</div>
      <div style={{ fontSize: 44, color: '#9fb0c8', marginTop: 24, letterSpacing: 8 }}>FOLLOW TO JOIN</div>
    </AbsoluteFill>
  );
}

export const Story = (props) => {
  const fontsOk = useFonts();
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const T = frame / FPS;
  let acc = 0, idx = -1, st = 0, d = 0;
  for (let i = 0; i < props.shots.length; i++) { d = shotDur(props.shots[i]); if (T < acc + d) { idx = i; st = T - acc; break; } acc += d; }
  const shot = idx >= 0 ? props.shots[idx] : null;
  return (
    <AbsoluteFill style={{ background: '#070b14' }}>
      {shot && fontsOk && (
        <>
          <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true, preserveDrawingBuffer: true }} camera={{ fov: 50, near: 0.1, far: 900 }}>
            <World shot={shot} t={st} u={st / d} />
          </ThreeCanvas>
          <Hud hud={shot.hud} t={st} />
          <Caption shot={shot} t={st} d={d} />
        </>
      )}
      {!shot && <EndCard t={T - acc} />}
      {props.sound && <Audio src={staticFile(props.sound)} loop volume={props.volume ?? 0.8} />}
    </AbsoluteFill>
  );
};
