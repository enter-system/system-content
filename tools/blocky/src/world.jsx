// Blocky "in this town" world: night suburb, backyard party, park, bedroom, and the hero avatar.
// Everything is built from boxes/cones so it renders fast in SwiftShader. y is up, ground is y=0.
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';

// ---------- helpers ----------
const rnd = (seed) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
export const canvasTex = (w, h, draw) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};
const Box = ({ p = [0, 0, 0], s = [1, 1, 1], c = '#888', r, e, cast = true, receive = true, ei = 1 }) => (
  <mesh position={p} rotation={r} castShadow={cast} receiveShadow={receive}>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} emissive={e || '#000'} emissiveIntensity={e ? ei : 0} roughness={0.85} />
  </mesh>
);

// ---------- faces ----------
const FACES = {
  smile: (g) => { eyes(g, 'dot'); g.beginPath(); g.arc(128, 150, 42, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); },
  grin: (g) => { eyes(g, 'happy'); g.beginPath(); g.moveTo(70, 140); g.quadraticCurveTo(128, 240, 186, 140); g.closePath(); g.fillStyle = '#d62d2d'; g.fill(); g.stroke(); },
  wink: (g) => { g.beginPath(); g.arc(88, 100, 13, 0, 7); g.fill(); g.beginPath(); g.moveTo(150, 102); g.lineTo(184, 92); g.stroke(); g.beginPath(); g.arc(128, 150, 40, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); },
  shock: (g) => { eyes(g, 'big'); g.beginPath(); g.ellipse(128, 170, 18, 26, 0, 0, 7); g.fillStyle = '#7a1414'; g.fill(); g.stroke(); },
  sad: (g) => { eyes(g, 'dot'); g.beginPath(); g.arc(128, 200, 36, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke(); },
  determined: (g) => { g.beginPath(); g.moveTo(66, 74); g.lineTo(110, 88); g.moveTo(190, 74); g.lineTo(146, 88); g.stroke(); eyes(g, 'dot'); g.beginPath(); g.moveTo(98, 168); g.lineTo(158, 164); g.stroke(); },
};
function eyes(g, kind) {
  if (kind === 'dot') { g.beginPath(); g.arc(88, 105, 13, 0, 7); g.arc(168, 105, 13, 0, 7); g.fill(); }
  if (kind === 'happy') { g.beginPath(); g.moveTo(66, 108); g.lineTo(90, 84); g.lineTo(112, 108); g.moveTo(144, 108); g.lineTo(166, 84); g.lineTo(190, 108); g.stroke(); }
  if (kind === 'big') { [88, 168].forEach((x) => { g.beginPath(); g.arc(x, 100, 24, 0, 7); g.fillStyle = '#fff'; g.fill(); g.stroke(); g.beginPath(); g.arc(x, 102, 11, 0, 7); g.fillStyle = '#111'; g.fill(); }); }
}
const faceCache = {};
const faceTex = (face, skin) => (faceCache[face + skin] ||= canvasTex(256, 256, (g) => {
  g.fillStyle = skin; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#111'; g.fillStyle = '#111'; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round';
  (FACES[face] || FACES.smile)(g);
}));

// Hoodie front print: "the system" in gold, small cyan line under it.
const printCache = {};
const printTex = (text, sub, color) => (printCache[text + sub + color] ||= canvasTex(512, 512, (g) => {
  g.fillStyle = color; g.fillRect(0, 0, 512, 512);
  g.textAlign = 'center'; g.fillStyle = '#f5c451'; g.font = '700 92px Raj, sans-serif'; g.fillText(text, 256, 250);
  g.fillStyle = '#5ee7ff'; g.font = '600 40px Raj, sans-serif'; g.fillText(sub, 256, 305);
  // drawstrings
  g.fillStyle = '#5ee7ff'; g.fillRect(200, 0, 12, 120); g.fillRect(300, 0, 12, 120);
}));
const starTex = () => (printCache.star ||= canvasTex(256, 256, (g) => {
  g.fillStyle = '#1d3a8a'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#f5c451'; g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 26 : 62; g.lineTo(128 + r * Math.cos(a), 140 + r * Math.sin(a)); }
  g.fill();
}));

// ---------- avatar ----------
// pose: idle | wave | walk | facepalm | pullup | read | pray | cheer | sit
// t = seconds into the shot. look = head yaw. outfit: 'hero' or an NPC color set.
export function Avatar({ pos = [0, 0, 0], rot = 0, pose = 'idle', t = 0, face = 'smile', hero = false, shirt = '#e86a8a', pants = '#3d4a6b', skin = '#f2d3b1', hat, scale = 1, lift = 0 }) {
  const s = Math.sin, k = t * Math.PI * 2;
  let la = 0, ra = 0, lz = 0, rz = 0, ll = 0, rl = 0, bob = 0, headTilt = 0, y = lift;
  if (pose === 'idle') { bob = s(k * 0.5) * 0.03; la = s(k * 0.5) * 0.05; ra = -la; }
  if (pose === 'wave') { ra = Math.PI * 0.95; rz = 0.35 + s(k * 1.6) * 0.3; }
  if (pose === 'walk') { la = s(k * 1.4) * 0.7; ra = -la; ll = -la; rl = la; bob = Math.abs(s(k * 1.4)) * 0.08; }
  if (pose === 'facepalm') { ra = Math.PI * 0.6; rz = -0.72; headTilt = 0.25; }
  if (pose === 'pullup') { la = ra = Math.PI; const u = (1 - Math.cos(k * 0.9)) / 2; y += u * 1.1; ll = rl = 0.15; }
  if (pose === 'read') { la = ra = Math.PI * 0.42; lz = 0.25; rz = -0.25; headTilt = 0.3; }
  if (pose === 'pray') { la = ra = Math.PI * 0.5; lz = 0.45; rz = -0.45; headTilt = 0.35; }
  if (pose === 'cheer') { la = ra = Math.PI * 0.9 + s(k * 1.5) * 0.12; lz = -0.35; rz = 0.35; bob = Math.abs(s(k * 1.5)) * 0.25; }
  if (pose === 'sit') { ll = rl = Math.PI / 2; y -= 0.95; la = ra = Math.PI * 0.35; }
  const sh = hero ? '#2f5fd0' : shirt, pa = hero ? '#2a54b8' : pants;
  const limb = (x, rx, rzz, color, top, hand) => (
    <group position={[x, top, 0]} rotation={[-rx, 0, rzz]}>
      <Box p={[0, hand ? -0.85 : -1, 0]} s={[0.98, hand ? 1.7 : 2, 0.98]} c={color} />
      {hand && <Box p={[0, -1.85, 0]} s={[0.9, 0.3, 0.9]} c={hand} />}
    </group>
  );
  return (
    <group position={[pos[0], pos[1] + y + bob, pos[2]]} rotation={[0, rot, 0]} scale={scale}>
      {limb(-0.5, ll, 0, pa, 2)}
      {limb(0.5, rl, 0, pa, 2)}
      {/* torso with print */}
      <mesh position={[0, 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 1]} />
        {[0, 1, 2, 3].map((i) => <meshStandardMaterial key={i} attach={`material-${i}`} color={sh} roughness={0.9} />)}
        {hero ? <meshStandardMaterial attach="material-4" map={printTex('the system', 'level up daily', sh)} roughness={0.9} /> : <meshStandardMaterial attach="material-4" color={sh} roughness={0.9} />}
        <meshStandardMaterial attach="material-5" color={sh} roughness={0.9} />
      </mesh>
      {limb(-1.5, la, lz, hero ? sh : skin, 4, hero && skin)}
      {limb(1.5, ra, rz, hero ? sh : skin, 4, hero && skin)}
      {/* head */}
      <group position={[0, 4.65, 0]} rotation={[headTilt, 0, 0]}>
        <RoundedBox args={[1.25, 1.25, 1.25]} radius={0.22} smoothness={3} castShadow>
          <meshStandardMaterial color={skin} roughness={0.8} />
        </RoundedBox>
        <mesh position={[0, -0.02, 0.63]}>
          <planeGeometry args={[1.0, 1.0]} />
          <meshStandardMaterial map={faceTex(face, skin)} transparent roughness={0.8} />
        </mesh>
        {hero && (
          <group position={[0, 0.6, 0]}>
            <RoundedBox args={[1.42, 0.62, 1.42]} radius={0.2} smoothness={3} castShadow><meshStandardMaterial color="#1d3a8a" roughness={0.95} /></RoundedBox>
            <Box p={[0, -0.22, 0]} s={[1.48, 0.2, 1.48]} c="#2f5fd0" />
            <mesh position={[0, 0.02, 0.715]}><planeGeometry args={[0.6, 0.6]} /><meshStandardMaterial map={starTex()} roughness={0.9} /></mesh>
          </group>
        )}
        {hat && (
          <mesh position={[0, 1.0, 0]} castShadow><coneGeometry args={[0.45, 0.9, 16]} /><meshStandardMaterial color={hat} roughness={0.7} /></mesh>
        )}
      </group>
    </group>
  );
}

// ---------- scenery ----------
export function Sky({ mood = 'night' }) {
  const top = mood === 'dusk' ? '#2b3a6b' : '#0d1530', bot = mood === 'dusk' ? '#e8a77a' : '#2a3b66';
  const tex = useMemo(() => canvasTex(16, 512, (g) => { const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, top); gr.addColorStop(0.75, bot); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, 16, 512); }), [mood]);
  const stars = useMemo(() => { const r = rnd(7); return Array.from({ length: 160 }, () => { const a = r() * Math.PI * 2, e = 0.15 + r() * 1.2; return [Math.cos(a) * Math.cos(e) * 380, Math.sin(e) * 380, Math.sin(a) * Math.cos(e) * 380]; }); }, []);
  return (
    <>
      <mesh><sphereGeometry args={[420, 24, 16]} /><meshBasicMaterial map={tex} side={THREE.BackSide} depthWrite={false} fog={false} /></mesh>
      {stars.map((p, i) => <mesh key={i} position={p}><sphereGeometry args={[0.7, 4, 4]} /><meshBasicMaterial color="#fff" fog={false} /></mesh>)}
      <mesh position={[-120, 170, -300]}><sphereGeometry args={[16, 16, 16]} /><meshBasicMaterial color="#fffbe8" fog={false} /></mesh>
    </>
  );
}

export function Lights({ mood = 'night', glow = 0 }) {
  return (
    <>
      <hemisphereLight args={[mood === 'dusk' ? '#9fb3ff' : '#6f86d6', '#2b2a3a', mood === 'dusk' ? 1.5 : 1.35]} />
      <directionalLight position={[-30, 50, 25]} intensity={mood === 'dusk' ? 2.0 : 1.7} color={mood === 'dusk' ? '#ffd2a8' : '#b9c8ff'} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-40} shadow-camera-right={40} shadow-camera-top={40} shadow-camera-bottom={-40} shadow-camera-far={150} shadow-bias={-0.0005} />
      {glow > 0 && <pointLight position={[0, 6, 4]} intensity={glow * 60} distance={18} color="#f5c451" />}
    </>
  );
}

export function House({ p = [0, 0, 0], r = 0, c = '#c86b4a', roof = '#3b3f52', w = 9, d = 8, h = 6, lit = 0.6 }) {
  const win = (x, y, z, ry = 0, on = true) => <Box key={`${x}${y}${z}`} p={[x, y, z]} r={[0, ry, 0]} s={[1.4, 1.5, 0.12]} c={on ? '#ffd98a' : '#2a3350'} e={on ? '#ffc65a' : undefined} ei={0.9} cast={false} />;
  const r1 = rnd(Math.round(p[0] * 13 + p[2] * 7 + 99));
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Box p={[0, h / 2, 0]} s={[w, h, d]} c={c} />
      <mesh position={[0, h + 1.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[Math.hypot(w, d) / 2 + 0.6, 3, 4]} /><meshStandardMaterial color={roof} roughness={0.9} /></mesh>
      {win(-w / 4, h * 0.68, d / 2 + 0.06, 0, r1() < lit)}{win(w / 4, h * 0.68, d / 2 + 0.06, 0, r1() < lit)}{win(w / 4, h * 0.25, d / 2 + 0.06, 0, r1() < lit)}
      <Box p={[-w / 4, 1.3, d / 2 + 0.06]} s={[1.3, 2.6, 0.12]} c="#5a3a2a" cast={false} />
      <Box p={[w / 2 - 1.2, h + 2, 0]} s={[0.8, 2, 0.8]} c="#6b4a3a" />
    </group>
  );
}

export function Tree({ p, s = 1 }) {
  return (
    <group position={p} scale={s}>
      <Box p={[0, 1.2, 0]} s={[0.6, 2.4, 0.6]} c="#5b3d28" />
      <mesh position={[0, 3.6, 0]} castShadow><icosahedronGeometry args={[1.8, 0]} /><meshStandardMaterial color="#2f6b3a" flatShading roughness={0.9} /></mesh>
    </group>
  );
}

export function Lamp({ p }) {
  return (
    <group position={p}>
      <Box p={[0, 2.5, 0]} s={[0.25, 5, 0.25]} c="#222" />
      <Box p={[0, 5.1, 0]} s={[0.7, 0.35, 0.7]} c="#fff1c2" e="#ffe08a" ei={1.5} cast={false} />
      <pointLight position={[0, 4.6, 0]} intensity={18} distance={11} color="#ffd98a" />
    </group>
  );
}

export function Car({ p, r = 0, c = '#3a8f5a' }) {
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Box p={[0, 0.9, 0]} s={[2.2, 1, 4.4]} c={c} />
      <Box p={[0, 1.8, -0.3]} s={[2, 0.9, 2.4]} c={c} />
      <Box p={[0, 1.8, 0.92]} s={[1.8, 0.7, 0.05]} c="#9fc3e6" cast={false} />
      {[[-1.1, 1.4], [1.1, 1.4], [-1.1, -1.4], [1.1, -1.4]].map(([x, z], i) => <Box key={i} p={[x, 0.45, z]} s={[0.3, 0.9, 0.9]} c="#111" />)}
    </group>
  );
}

export function Fence({ from, to, h = 2.2, c = '#6b4a35' }) {
  const len = Math.hypot(to[0] - from[0], to[2] - from[2]), ang = Math.atan2(to[0] - from[0], to[2] - from[2]);
  return <Box p={[(from[0] + to[0]) / 2, h / 2, (from[2] + to[2]) / 2]} r={[0, ang, 0]} s={[0.25, h, len]} c={c} />;
}

export function StringLights({ from, to, n = 14, y = 5.5 }) {
  const cols = ['#ff5c6a', '#ffd25e', '#5ee7ff', '#7dff8a', '#c88bff', '#ff9f6b'];
  return Array.from({ length: n }, (_, i) => {
    const u = i / (n - 1), sag = Math.sin(u * Math.PI) * 0.8;
    return <Box key={i} p={[from[0] + (to[0] - from[0]) * u, y - sag, from[2] + (to[2] - from[2]) * u]} s={[0.35, 0.45, 0.35]} c={cols[i % 6]} e={cols[i % 6]} ei={1.4} cast={false} />;
  });
}

export function Ground({ c = '#2f5a35', size = 400 }) {
  return <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[size, size]} /><meshStandardMaterial color={c} roughness={1} /></mesh>;
}

// Street: road along z, houses on both sides.
export function Street() {
  const r = rnd(3), cols = ['#c86b4a', '#e2c36b', '#6b8fc8', '#d98fae', '#8fc88f', '#b88a6b', '#e8e2d0'];
  const houses = [];
  for (let i = -6; i <= 3; i++) for (const side of [-1, 1]) houses.push({ p: [side * 13, 0, i * 12], r: side > 0 ? -Math.PI / 2 : Math.PI / 2, c: cols[Math.floor(r() * 7)], roof: r() < 0.5 ? '#3b3f52' : '#7a3b34' });
  return (
    <group>
      <Ground />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -15]} receiveShadow><planeGeometry args={[10, 160]} /><meshStandardMaterial color="#2c2e36" roughness={1} /></mesh>
      {Array.from({ length: 16 }, (_, i) => <Box key={i} p={[0, 0.04, 40 - i * 10]} s={[0.25, 0.02, 3]} c="#e8c64a" cast={false} />)}
      {[-1, 1].map((s) => <Box key={s} p={[s * 6.5, 0.1, -15]} s={[3, 0.2, 160]} c="#8a8a90" cast={false} />)}
      {houses.map((h, i) => <House key={i} {...h} />)}
      {[-50, -26, -2, 22].map((z) => [-1, 1].map((s) => <Lamp key={z + s} p={[s * 7.6, 0, z]} />))}
      {[-44, -32, -8, 8, 28].map((z, i) => <Tree key={z} p={[(i % 2 ? 1 : -1) * 8.5, 0, z + 5]} s={0.9} />)}
      <Car p={[-3.4, 0, -6]} c="#3a8f5a" /><Car p={[3.4, 0, 10]} r={Math.PI} c="#c84a4a" /><Car p={[-3.4, 0, -30]} c="#e8e2d0" />
      <mesh position={[0, 0, -150]}><coneGeometry args={[90, 22, 6]} /><meshStandardMaterial color="#24432c" flatShading /></mesh>
    </group>
  );
}

// Backyard party: fence, string lights, a table, NPCs with party hats.
const NPC = [['#e86a8a', '#f5c451'], ['#6bd0a0', '#ff6a5c'], ['#f5f0e6', '#a98bff'], ['#ff9f6b', '#5ee7ff'], ['#a98bff', '#7dff8a'], ['#e2c36b', '#ff5c6a']];
export function Party({ t = 0, faces = 'grin', poses = 'cheer' }) {
  return (
    <group>
      <Ground c="#35603a" />
      <House p={[0, 0, -14]} c="#d98fae" roof="#3b3f52" w={14} d={9} lit={1} />
      <Fence from={[-14, 0, -9]} to={[-14, 0, 14]} /><Fence from={[14, 0, -9]} to={[14, 0, 14]} />
      <StringLights from={[-12, 0, -6]} to={[12, 0, -6]} y={6.5} /><StringLights from={[-12, 0, 2]} to={[12, 0, 2]} y={6.8} />
      <Box p={[0, 1.4, -3]} s={[7, 0.3, 2.6]} c="#f2f2f2" /><Box p={[0, 0.7, -3]} s={[6.4, 1.4, 2]} c="#d8d8d8" />
      <Box p={[-1.8, 1.8, -3]} s={[1.4, 0.5, 1.4]} c="#e2a24a" /><Box p={[1.6, 1.9, -3]} s={[0.8, 0.8, 0.8]} c="#ff6a8a" />
      {[[-7, 1], [-4, 4], [3, 3.5], [6.5, 0.5], [-1, 6], [8, 6], [-8, 6.5]].map(([x, z], i) => (
        <Avatar key={i} pos={[x, 0, z]} rot={(i % 3 - 1) * 0.4} pose={typeof poses === 'string' ? (i % 3 === 2 ? 'idle' : poses) : poses[i % poses.length]} t={t + i * 0.37} face={typeof faces === 'string' ? faces : faces[i % faces.length]} shirt={NPC[i % 6][0]} hat={NPC[i % 6][1]} scale={0.85} />
      ))}
      <pointLight position={[0, 5, 2]} intensity={40} distance={22} color="#ff9fd0" />
    </group>
  );
}

// Park at night: court, pull-up bar, fence, lamps.
export function Park({ bar = [0, 0, 0] }) {
  return (
    <group>
      <Ground c="#2a4d30" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow><planeGeometry args={[30, 30]} /><meshStandardMaterial color="#3a4a6b" roughness={1} /></mesh>
      {[-1, 1].map((s) => <Box key={s} p={[s * 7.5, 0.05, 0]} s={[0.2, 0.02, 30]} c="#e8e8e8" cast={false} />)}
      <group position={bar}>
        <Box p={[-2.6, 4, 0]} s={[0.35, 8, 0.35]} c="#c84a4a" /><Box p={[2.6, 4, 0]} s={[0.35, 8, 0.35]} c="#c84a4a" />
        <Box p={[0, 7.4, 0]} s={[5.6, 0.25, 0.25]} c="#d8d8d8" />
      </group>
      <Fence from={[-15, 0, -15]} to={[15, 0, -15]} h={4} c="#556070" /><Fence from={[-15, 0, -15]} to={[-15, 0, 15]} h={4} c="#556070" /><Fence from={[15, 0, -15]} to={[15, 0, 15]} h={4} c="#556070" />
      <Lamp p={[-9, 0, -12]} /><Lamp p={[9, 0, -12]} /><Lamp p={[-9, 0, 9]} />
      {[[-24, -28], [-10, -30], [8, -26], [22, -30]].map(([x, z], i) => <House key={i} p={[x, 0, z]} c={['#6b8fc8', '#e2c36b', '#c86b4a', '#8fc88f'][i]} lit={0.5} />)}
      <Tree p={[-20, 0, -6]} /><Tree p={[20, 0, 4]} />
    </group>
  );
}

// Bedroom: walls, bed, desk, lamp, open Bible, window with the moon.
export function Room() {
  const bible = useMemo(() => canvasTex(512, 256, (g) => { g.fillStyle = '#f6efdc'; g.fillRect(0, 0, 512, 256); g.fillStyle = '#9a8c70'; for (let y = 30; y < 236; y += 20) { g.fillRect(24, y, 200, 6); g.fillRect(288, y, 200, 6); } g.fillStyle = '#5a4a3a'; g.fillRect(252, 0, 8, 256); }), []);
  return (
    <group>
      <Box p={[0, -0.05, 0]} s={[22, 0.1, 22]} c="#7a5a40" />
      <Box p={[0, 6, -8]} s={[22, 12, 0.3]} c="#3c4f7a" /><Box p={[-9, 6, 0]} s={[0.3, 12, 22]} c="#34466e" /><Box p={[9, 6, 0]} s={[0.3, 12, 22]} c="#34466e" />
      {/* window */}
      <Box p={[-4, 6.5, -7.8]} s={[4.4, 3.6, 0.1]} c="#0d1530" e="#0d1530" ei={0.3} cast={false} />
      <mesh position={[-3.2, 7.3, -7.7]}><circleGeometry args={[0.5, 20]} /><meshBasicMaterial color="#fffbe8" /></mesh>
      <Box p={[-4, 6.5, -7.7]} s={[0.15, 3.6, 0.1]} c="#e8e2d0" /><Box p={[-4, 6.5, -7.7]} s={[4.4, 0.15, 0.1]} c="#e8e2d0" />
      {/* bed */}
      <Box p={[-5.5, 1, 1]} s={[5, 2, 8]} c="#e8e2d0" /><Box p={[-5.5, 2.1, 2]} s={[5, 0.3, 6]} c="#1f3f8f" /><Box p={[-5.5, 2.3, -2]} s={[3, 0.6, 1.6]} c="#ffffff" />
      {/* desk */}
      <Box p={[4, 3, -5]} s={[7, 0.3, 4]} c="#8a6a48" />
      {[[-3.2, -1.8], [3.2, -1.8], [-3.2, 1.8], [3.2, 1.8]].map(([x, z], i) => <Box key={i} p={[4 + x, 1.45, -5 + z]} s={[0.3, 2.9, 0.3]} c="#6b4f35" />)}
      <mesh position={[4, 3.2, -4.4]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.6, 1.3]} /><meshStandardMaterial map={bible} /></mesh>
      <Box p={[4, 3.17, -4.4]} s={[2.8, 0.06, 1.45]} c="#5a1f1f" />
      <Box p={[6.4, 3.4, -6]} s={[1.2, 0.4, 1.6]} c="#2a6b8f" />
      <Box p={[1.5, 4, -6.2]} s={[0.2, 2, 0.2]} c="#222" /><Box p={[1.5, 5.1, -6.2]} s={[1, 0.6, 1]} c="#ffe8a8" e="#ffd77a" ei={1.2} cast={false} />
      <pointLight position={[1.8, 5.5, -4.5]} intensity={30} distance={14} color="#ffd98a" castShadow={false} />
      {/* poster */}
      <Box p={[5, 8, -7.8]} s={[3, 3.6, 0.05]} c="#070b14" e="#5ee7ff" ei={0.15} cast={false} />
    </group>
  );
}
