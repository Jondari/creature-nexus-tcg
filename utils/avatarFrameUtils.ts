import { AvatarFrameDefinition } from '@/types/avatarFrame';

// Shared with scripts/redeem-code.js — edit data/frames.shared.js to add new frames
export const AVAILABLE_FRAMES: AvatarFrameDefinition[] = (require('../data/frames.shared') as { AVAILABLE_FRAMES: AvatarFrameDefinition[] }).AVAILABLE_FRAMES;

const FRAME_IMAGES: Record<string, ReturnType<typeof require>> = {
  backer: require('@/assets/images/frame/avatar/backer.png'),
  beta_tester: require('@/assets/images/frame/avatar/beta_tester.png'),
  beta_tester_golden: require('@/assets/images/frame/avatar/beta_tester_golden.png'),
  fire: require('@/assets/images/frame/avatar/fire.png'),
  water: require('@/assets/images/frame/avatar/water.png'),
  earth: require('@/assets/images/frame/avatar/earth.png'),
  ice: require('@/assets/images/frame/avatar/ice.png'),
  vortex: require('@/assets/images/frame/avatar/vortex.png'),
};

export function getFrameImage(frameId: string): ReturnType<typeof require> | null {
  return FRAME_IMAGES[frameId] ?? null;
}

export function isValidFrameId(frameId: string): boolean {
  return frameId in FRAME_IMAGES;
}
