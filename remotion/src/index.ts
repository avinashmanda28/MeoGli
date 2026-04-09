/**
 * Remotion entry point.
 *
 * Registers the root composition with the Remotion renderer.
 * This file is the main entry point for:
 * - Remotion Studio (npx remotion studio)
 * - Remotion CLI rendering (npx remotion render)
 * - Lambda rendering (@remotion/lambda)
 *
 * ⚠️ Do NOT import anything else here —
 * keep this file minimal to avoid side effects.
 */

import { registerRoot } from 'remotion';
import { Root } from './Root';

// ✅ Register root composition with Remotion renderer
registerRoot(Root);
