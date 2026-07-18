import type { QuestTemplate } from '@/types/quest';

export const TEST_SHARED_QUESTS: QuestTemplate[] = [
  {
    id: 'first_victory',
    title: 'First Victory',
    type: 'permanent',
    conditions: [
      { id: 'first_victory_cond1', event: 'battle_won', count: 1 },
    ],
    rewards: {
      nexusCoins: 100,
      badges: ['beta_tester'],
    },
    rewardMode: 'auto_claim',
    repeatable: false,
    enabled: true,
  },
  {
    id: 'win_3_battles',
    title: 'Winning Streak',
    type: 'permanent',
    conditions: [
      { id: 'win_3_battles_cond1', event: 'battle_won', count: 3 },
    ],
    rewards: {
      nexusCoins: 200,
    },
    rewardMode: 'manual_claim',
    repeatable: false,
    enabled: true,
  },
  {
    id: 'daily_open_pack',
    title: 'Daily Pack',
    type: 'daily',
    conditions: [
      { id: 'daily_open_pack_cond1', event: 'pack_opened', count: 1 },
    ],
    rewards: {
      nexusCoins: 50,
    },
    rewardMode: 'manual_claim',
    repeatable: true,
    enabled: true,
  },
  {
    id: 'weekly_win_5',
    title: 'Weekly Warrior',
    type: 'weekly',
    conditions: [
      { id: 'weekly_win_5_cond1', event: 'battle_won', count: 5 },
    ],
    rewards: {
      nexusCoins: 300,
      packs: ['standard'],
    },
    rewardMode: 'manual_claim',
    repeatable: true,
    enabled: true,
  },
];

// Jest replacement for the private, gitignored data/quests.shared.js module.
export const SHARED_QUESTS = TEST_SHARED_QUESTS;
