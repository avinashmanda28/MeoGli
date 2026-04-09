/**
 * Remotion composition root component.
 * Defines video composition settings and parameters.
 */

import React from 'react';
import { Composition, Folder, staticFile } from 'remotion';
import { MainVideo } from './MainVideo';

// ────────────────────────────────────────────────────────────────
// Type Definitions
// ────────────────────────────────────────────────────────────────
export interface MainVideoProps {
  scenesJsonPath?: string;   // ✅ NEW: path to scenes.json
  mode?: 'short' | 'long';  // ✅ NEW: video mode
  [key: string]: unknown;
}

// ────────────────────────────────────────────────────────────────
// Composition Constants
// ────────────────────────────────────────────────────────────────
const FPS = 30;

const LONG_FORMAT = {
  width:           1280,
  height:          720,
  durationInFrames: 300,   // 10 seconds
} as const;

const SHORT_FORMAT = {
  width:           720,
  height:          1280,
  durationInFrames: 270,   // 9 seconds
} as const;

// ✅ NEW: Default props for each composition
const longDefaultProps: MainVideoProps = {
  scenesJsonPath: staticFile('scenes.json'),
  mode: 'long',
};

const shortDefaultProps: MainVideoProps = {
  scenesJsonPath: staticFile('scenes.json'),
  mode: 'short',
};

// ────────────────────────────────────────────────────────────────
// Root Component
// ────────────────────────────────────────────────────────────────
/**
 * Root Composition Component
 *
 * Registers all Remotion compositions grouped by format:
 * - Long Format:  1280×720  (16:9) @ 30fps — 10s
 * - Short Format:  720×1280  (9:16) @ 30fps — 9s
 *
 * Compositions are grouped in folders for better organization.
 * Settings are overridable during export via CLI or Remotion Studio.
 */
export const Root: React.FC = () => {
  return (
    <>
      {/* ── Long Format (16:9) ── */}
      <Folder name="Long Format">
        <Composition<MainVideoProps>
          id="MainVideo"
          component={MainVideo}
          durationInFrames={LONG_FORMAT.durationInFrames}
          fps={FPS}
          width={LONG_FORMAT.width}
          height={LONG_FORMAT.height}
          defaultProps={longDefaultProps}
        />
      </Folder>

      {/* ── Short Format (9:16) ── */}
      <Folder name="Short Format">
        <Composition<MainVideoProps>
          id="MainVideoShort"
          component={MainVideo}
          durationInFrames={SHORT_FORMAT.durationInFrames}
          fps={FPS}
          width={SHORT_FORMAT.width}
          height={SHORT_FORMAT.height}
          defaultProps={shortDefaultProps}
        />
      </Folder>
    </>
  );
};
