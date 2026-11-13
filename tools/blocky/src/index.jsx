import { registerRoot, Composition } from 'remotion';
import { Test } from './Test.jsx';
import { Story, storyFrames } from './Story.jsx';

const demo = { shots: [{ set: 'street', cam: { from: [0, 30, 40], to: [0, 26, 30], look: [0, 0, -10] }, words: 'in this town' }] };

const Root = () => (
  <>
    <Composition id="Test" component={Test} width={1080} height={1920} fps={30} durationInFrames={60} />
    <Composition id="Story" component={Story} width={1080} height={1920} fps={30} durationInFrames={60} defaultProps={demo}
      calculateMetadata={({ props }) => ({ durationInFrames: storyFrames(props) })} />
  </>
);
registerRoot(Root);
