import { registerRoot, Composition } from 'remotion';
import { Test } from './Test.jsx';

const Root = () => (
  <>
    <Composition id="Test" component={Test} width={1080} height={1920} fps={30} durationInFrames={60} />
  </>
);
registerRoot(Root);
