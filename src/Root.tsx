import { Composition } from 'remotion';
import { MainVideo } from './MainVideo';
import scenes from './scenes.json';

export const RemotionRoot = () => {
  return (
    <Composition
      id="MainVideo"
      component={MainVideo}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ scenes }}  // ✅ pass directly
    />
  );
};