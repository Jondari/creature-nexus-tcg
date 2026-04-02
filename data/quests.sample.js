// @ts-check
/**
 * Sample quest catalogue.
 *
 * Purpose:
 * - document the expected quest format
 * - provide a safe example in the repository
 *
 * Important:
 * - this file is NOT used by the app
 * - this file is NOT pushed to Firebase
 * - only data/quests.shared.js is pushed to Firebase by scripts/push-quests.js
 *
 * Demo mode uses:
 * - data/quests.shared.js
 * - data/quests.demo.js
 */

/** @type {import('../types/quest').QuestTemplate[]} */
const SAMPLE_QUESTS = [
  {
    id: 'sample_first_victory',
    title: 'Sample First Victory',
    type: 'permanent',
    description: 'Win your first battle.',
    conditions: [
      { id: 'sample_first_victory_cond1', event: 'battle_won', count: 1 },
    ],
    rewards: {
      nexusCoins: 100,
      badges: ['beta_tester'],
    },
    rewardMode: 'auto_claim',
    repeatable: false,
    enabled: true,
    sortOrder: 1,
  },
  {
    id: 'sample_daily_open_pack',
    title: 'Sample Daily Pack',
    type: 'daily',
    description: 'Open 1 pack today.',
    conditions: [
      { id: 'sample_daily_open_pack_cond1', event: 'pack_opened', count: 1 },
    ],
    rewards: {
      nexusCoins: 50,
    },
    rewardMode: 'manual_claim',
    repeatable: true,
    enabled: true,
    sortOrder: 10,
  },
];

module.exports = { SAMPLE_QUESTS };
