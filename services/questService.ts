/**
 * questService - Shared utilities for quest reset boundary calculations.
 *
 * The QuestService interface is defined in types/quest.ts.
 * Local implementation: services/questService.local.ts
 * Firebase implementation: services/questService.firebase.ts
 */

export type { QuestService } from '@/types/quest';

/** Returns the ISO string of the most recent 22:00:00Z boundary (daily reset). */
export function getLastResetBoundary(): string {
  const now = new Date();
  const boundary = new Date(now);
  boundary.setUTCHours(22, 0, 0, 0);
  if (boundary > now) {
    boundary.setUTCDate(boundary.getUTCDate() - 1);
  }
  return boundary.toISOString();
}

/** Returns the ISO string of the most recent Monday 22:00:00Z (weekly reset). */
export function getLastWeeklyResetBoundary(): string {
  const now = new Date();
  // Find the most recent Monday
  const day = now.getUTCDay(); // 0=Sun, 1=Mon...
  const daysToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setUTCDate(monday.getUTCDate() - daysToMonday);
  monday.setUTCHours(22, 0, 0, 0);
  if (monday > now) {
    monday.setUTCDate(monday.getUTCDate() - 7);
  }
  return monday.toISOString();
}
