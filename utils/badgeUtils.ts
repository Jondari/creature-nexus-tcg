import { BadgeDefinition } from '@/types/badge';

export const MAX_DISPLAYED_BADGES = 3;

export const AVAILABLE_BADGES: BadgeDefinition[] = [
  { id: 'backer', name: 'backer' },
  { id: 'beta_tester', name: 'beta_tester' },
];

const BADGE_IDS = new Set(AVAILABLE_BADGES.map(b => b.id));

export function getBadgeImage(badgeId: string) {
  const badgeImages: Record<string, any> = {
    backer: require('@/assets/images/badge/backer.png'),
    beta_tester: require('@/assets/images/badge/beta_tester.png'),
  };
  return badgeImages[badgeId] ?? null;
}

export function isValidBadgeId(badgeId: string): boolean {
  return BADGE_IDS.has(badgeId);
}
