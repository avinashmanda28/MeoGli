import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  Img,
  interpolate,
  Easing,
  useCurrentFrame,
} from 'remotion';
import { SCENES } from './scenes';

const HIGHLIGHT_WORDS = ['AI', 'future', 'danger', 'money', 'growth', 'secret', 'win', 'change'];

type SceneType = 'HOOK' | 'CONTENT' | 'ENDING';

const getSceneType = (sceneIndex: number, sceneCount: number): SceneType => {
  if (sceneIndex === 0) {
    return 'HOOK';
  }

  if (sceneIndex === sceneCount - 1) {
    return 'ENDING';
  }

  return 'CONTENT';
};

const isHighlightWord = (word: string) =>
  HIGHLIGHT_WORDS.some((highlight) => word.toLowerCase().includes(highlight.toLowerCase()));

const getSceneTextSize = (sceneType: SceneType) => {
  switch (sceneType) {
    case 'HOOK':
      return 72;
    case 'ENDING':
      return 56;
    default:
      return 50;
  }
};

const getAlignment = (sceneType: SceneType, sceneIndex: number) => {
  if (sceneType === 'HOOK' || sceneType === 'ENDING') {
    return 'center' as const;
  }

  return sceneIndex % 2 === 1 ? 'flex-start' as const : 'center' as const;
};

const getTextAlign = (sceneType: SceneType, sceneIndex: number) => {
  if (sceneType === 'HOOK' || sceneType === 'ENDING') {
    return 'center' as const;
  }

  return sceneIndex % 2 === 1 ? 'left' as const : 'center' as const;
};

const getMotionType = (sceneType: SceneType, sceneIndex: number) => {
  if (sceneType === 'HOOK') {
    return 'hookZoom';
  }

  if (sceneType === 'ENDING') {
    return 'endingFloat';
  }

  const order = sceneIndex % 3;
  if (order === 1) {
    return 'zoomIn';
  }

  if (order === 2) {
    return 'panLeft';
  }

  return 'zoomOut';
};

interface WordProps {
  word: string;
  index: number;
  sceneDuration: number;
  localFrame: number;
}

const AnimatedWord: React.FC<WordProps> = ({
  word,
  index,
  sceneDuration,
  localFrame,
}) => {
  const ENTRY_DURATION = 10;
  const EXIT_DURATION = 14;
  const STAGGER_DELAY = 4;
  const wordStartFrame = Math.min(index * STAGGER_DELAY, ENTRY_DURATION);
  const wordEndFrame = sceneDuration - EXIT_DURATION;

  let opacity = 1;
  let translateY = 0;

  if (localFrame < wordStartFrame + ENTRY_DURATION) {
    const entryProgress = Math.max(0, localFrame - wordStartFrame);
    opacity = interpolate(entryProgress, [0, ENTRY_DURATION], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    translateY = interpolate(entryProgress, [0, ENTRY_DURATION], [28, 0], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }

  if (localFrame > wordEndFrame) {
    const exitProgress = localFrame - wordEndFrame;
    opacity = interpolate(exitProgress, [0, EXIT_DURATION], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }

  const isHighlighted = isHighlightWord(word);
  const pulse = Math.sin((localFrame + index * 2) / 8) * 0.02;
  const baseScale = isHighlighted ? 1.08 : 1;
  const wordScale = Math.max(0.95, baseScale + pulse);

  return (
    <span
      style={{
        display: 'inline-block',
        marginRight: '0.32em',
        opacity,
        transform: `translateY(${translateY}px) scale(${wordScale})`,
        color: isHighlighted ? '#FFD700' : 'white',
        fontWeight: isHighlighted ? 900 : 700,
        transition: 'none',
      }}
    >
      {word}
    </span>
  );
};

interface SceneProps {
  text: string;
  image: string;
  duration: number;
  sceneIndex: number;
  sceneCount: number;
}

const SceneComponent: React.FC<SceneProps> = ({ text, image, duration, sceneIndex, sceneCount }) => {
  const frame = useCurrentFrame();
  const sceneType = getSceneType(sceneIndex, sceneCount);
  const motionType = getMotionType(sceneType, sceneIndex);
  const alignment = getAlignment(sceneType, sceneIndex);
  const textAlign = getTextAlign(sceneType, sceneIndex);
  const textSize = getSceneTextSize(sceneType);
  const words = text.split(' ');

  const progress = frame / Math.max(1, duration - 1);
  const entryDuration = sceneType === 'HOOK' ? 10 : sceneType === 'ENDING' ? 22 : 16;
  const exitDuration = sceneType === 'ENDING' ? 22 : 16;

  const fadeIn = Math.min(1, frame / entryDuration);
  const fadeOut = Math.max(0, (duration - frame) / exitDuration);
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  let backgroundScale = 1;
  let translateX = 0;
  let translateY = 0;

  if (motionType === 'hookZoom') {
    backgroundScale = interpolate(progress, [0, 0.45, 1], [1, 1.1, 1.04], {
      extrapolateRight: 'clamp',
    });
  } else if (motionType === 'zoomIn') {
    backgroundScale = interpolate(progress, [0, 1], [1, 1.04], { extrapolateRight: 'clamp' });
  } else if (motionType === 'panLeft') {
    translateX = interpolate(progress, [0, 1], [0, -14], { extrapolateRight: 'clamp' });
    backgroundScale = 1.02;
  } else if (motionType === 'zoomOut') {
    backgroundScale = interpolate(progress, [0, 1], [1.06, 1], { extrapolateRight: 'clamp' });
    translateY = interpolate(progress, [0, 1], [0, 10], { extrapolateRight: 'clamp' });
  } else if (motionType === 'endingFloat') {
    backgroundScale = interpolate(progress, [0, 1], [1.03, 1.01], { extrapolateRight: 'clamp' });
    translateY = interpolate(progress, [0, 1], [0, 6], { extrapolateRight: 'clamp' });
  }

  const motionPulse = 1 + Math.sin(frame / 14) * 0.01;
  const backgroundTransform = `translate(${translateX}px, ${translateY}px) scale(${backgroundScale * motionPulse})`;

  const overlayDark = sceneType === 'HOOK' ? 'rgba(0, 0, 0, 0.76)' : 'rgba(0, 0, 0, 0.55)';
  const endingTone = sceneType === 'ENDING' ? 'rgba(30, 35, 50, 0.18)' : 'rgba(51, 102, 153, 0.08)';

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      <Img
        src={image}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: backgroundTransform,
          transformOrigin: 'center',
        }}
      />

      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${overlayDark}, rgba(0,0,0,0.18))`,
        }}
      />

      <AbsoluteFill
        style={{
          backgroundColor: endingTone,
        }}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: alignment,
          padding: '38px',
        }}
      >
        <div
          style={{
            fontSize: textSize,
            fontWeight: 800,
            textAlign,
            maxWidth: sceneType === 'HOOK' ? '88%' : '80%',
            lineHeight: sceneType === 'ENDING' ? 1.7 : 1.35,
            letterSpacing: '0.36px',
            transform: `translateX(${alignment === 'flex-start' ? '-5%' : '0'})`,
          }}
        >
          {words.map((word, idx) => (
            <AnimatedWord
              key={`${sceneIndex}-${idx}`}
              word={word}
              index={idx}
              sceneDuration={duration}
              localFrame={frame}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  let cumulativeFrame = 0;

  return (
    <>
      {SCENES.map((scene, sceneIndex) => {
        const isFirstScene = sceneIndex === 0;
        const isLastScene = sceneIndex === SCENES.length - 1;

        const adjustedDuration = isFirstScene
          ? Math.max(30, Math.round(scene.duration * 0.8))
          : isLastScene
          ? Math.round(scene.duration * 1.15)
          : scene.duration;

        const startFrame = cumulativeFrame;
        cumulativeFrame += adjustedDuration;

        return (
          <Sequence
            key={scene.id}
            from={startFrame}
            durationInFrames={adjustedDuration}
          >
            <SceneComponent
              text={scene.text}
              image={scene.image}
              duration={adjustedDuration}
              sceneIndex={sceneIndex}
              sceneCount={SCENES.length}
            />
          </Sequence>
        );
      })}
    </>
  );
};
