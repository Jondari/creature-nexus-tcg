/**
 * Story Scenes Index
 * Aggregates all chapter-specific story scenes for registration
 */
import { SceneDefinition } from '@/types/scenes';

// Import chapter scenes
import { CHAPTER_1_SCENES } from './chapter-1-scenes';
import { CHAPTER_2_SCENES } from './chapter-2-scenes';
import { CHAPTER_3_SCENES } from './chapter-3-scenes';
import { CHAPTER_4_SCENES } from './chapter-4-scenes';
import { CHAPTER_5_SCENES } from './chapter-5-scenes';
import { CHAPTER_6_SCENES } from './chapter-6-scenes';

// Combined export of all story scenes
export const ALL_STORY_SCENES: SceneDefinition[] = [
  ...CHAPTER_1_SCENES,
  ...CHAPTER_2_SCENES,
  ...CHAPTER_3_SCENES,
  ...CHAPTER_4_SCENES,
  ...CHAPTER_5_SCENES,
  ...CHAPTER_6_SCENES,
];

// Re-export individual chapter scenes for direct access if needed
export {
  CHAPTER_1_SCENES,
  CHAPTER_2_SCENES,
  CHAPTER_3_SCENES,
  CHAPTER_4_SCENES,
  CHAPTER_5_SCENES,
  CHAPTER_6_SCENES,
};
