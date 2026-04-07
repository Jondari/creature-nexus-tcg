// @ts-check
/**
 * Demo-only quest templates — loaded only in demo/offline mode.
 * These are merged on top of SHARED_QUESTS; demo wins on id collision.
 */

/** @type {import('../types/quest').QuestTemplate[]} */
const DEMO_QUESTS = [
  {
    id: 'demo_first_pack',
    title: 'First Pack (Demo)',
    titleKey: 'quests.demo_first_pack.title',
    type: 'permanent',
    description: 'Open your first pack in demo mode.',
    descriptionKey: 'quests.demo_first_pack.description',
    conditions: [
      { id: 'demo_first_pack_cond1', event: 'pack_opened', count: 1 },
    ],
    rewards: {
      nexusCoins: 75,
    },
    rewardMode: 'auto_claim',
    repeatable: false,
    enabled: true,
    sortOrder: 0,
  },
];

module.exports = { DEMO_QUESTS };
