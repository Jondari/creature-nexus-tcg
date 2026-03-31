import { AvatarFrameDefinition } from '@/types/avatarFrame';

export const AVAILABLE_FRAMES: AvatarFrameDefinition[] = [
  { id: 'backer', name: 'backer' },
  { id: 'beta_tester', name: 'beta_tester' },
  { id: 'beta_tester_golden', name: 'beta_tester_golden' },
  { id: 'fire', name: 'fire' },
  { id: 'water', name: 'water' },
  { id: 'earth', name: 'earth' },
  { id: 'ice', name: 'ice' },
  { id: 'vortex', name: 'vortex' },
];

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
