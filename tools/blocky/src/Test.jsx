import { AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { ThreeCanvas } from '@remotion/three';

const Cube = () => {
  const f = useCurrentFrame();
  return (
    <mesh rotation={[f * 0.04, f * 0.06, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#5ee7ff" />
    </mesh>
  );
};

export const Test = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#070b14' }}>
      <ThreeCanvas width={1080} height={1920} camera={{ position: [0, 0, 7], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 4]} intensity={1.5} />
        <Cube />
      </ThreeCanvas>
      <style>{`@font-face{font-family:Raj;src:url(${staticFile('rajdhani-latin-700-normal.woff2')})}`}</style>
      <div style={{ position: 'absolute', top: 300, width: '100%', textAlign: 'center', fontFamily: 'Raj', fontSize: 110, color: '#fff', opacity: interpolate(f, [0, 10], [0, 1], { extrapolateRight: 'clamp' }) }}>
        LEVEL <span style={{ color: '#5ee7ff' }}>UP</span>
      </div>
      <Audio src={staticFile('sound.m4a')} />
    </AbsoluteFill>
  );
};
