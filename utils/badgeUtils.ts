import { BadgeDefinition } from '@/types/badge';

export const MAX_DISPLAYED_BADGES = 3;

// Shared with scripts/redeem-code.js — edit data/badges.shared.js to add new badges
export const AVAILABLE_BADGES: BadgeDefinition[] = (require('../data/badges.shared') as { AVAILABLE_BADGES: BadgeDefinition[] }).AVAILABLE_BADGES;

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
