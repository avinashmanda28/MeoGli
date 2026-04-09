// remotion/src/index.tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import scenes from '../../output/scenes.json';

interface Scene {
  image: string;
  text: string;
  duration: number;
}

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pre-calculate start frames for each scene based on their durations
  let accumulatedFrames = 0;
  const scenesWithTiming = (scenes as Scene[]).map((scene) => {
    const durationFrames = scene.duration * fps;
    const startFrame = accumulatedFrames;
    accumulatedFrames += durationFrames;
    return { ...scene, startFrame, durationFrames };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {scenesWithTiming.map((scene, index) => {
        const { startFrame, durationFrames, image, text } = scene;
        const endFrame = startFrame + durationFrames;

        // Only render the scene if the current frame is within its active window
        if (frame < startFrame || frame >= endFrame) {
          return null;
        }

        // Calculate relative frame for scene-specific animations
        const localFrame = frame - startFrame;

        // Animations: slight zoom (1 to 1.1) and 1-second fade in
        const scale = 1 + (localFrame / durationFrames) * 0.1;
        const opacity = Math.min(localFrame / fps, 1);

        return (
          <AbsoluteFill key={index}>
            {/* Full screen background image */}
            <img
              src={image}
              alt={`Scene ${index}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                transform: `scale(${scale})`,
              }}
            />

            {/* Centered text overlay */}
            <AbsoluteFill
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                opacity: opacity,
              }}
            >
              <h1
                style={{
                  color: 'white',
                  fontSize: '80px',
                  textAlign: 'center',
                  margin: 0,
                  padding: '40px',
                }}
              >
                {text}
              </h1>
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
