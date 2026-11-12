import { registerRoot, Composition } from 'remotion';
import { Blocky } from './Blocky.jsx';

// Props come from render.mjs: { beats: [frames from video start], soundFrom: frame offset into the sound, total }
const Root = () => (
  <Composition id="Blocky" component={Blocky} width={1080} height={1920} fps={30}
    durationInFrames={900} defaultProps={{ beats: Array.from({ length: 80 }, (_, i) => Math.round(i * 18.1)), soundFrom: 0, total: 900, sound: null }}
    calculateMetadata={({ props }) => ({ durationInFrames: props.total })} />
);
registerRoot(Root);
