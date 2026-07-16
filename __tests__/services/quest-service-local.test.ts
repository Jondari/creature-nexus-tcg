import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuestServiceLocal } from '@/services/questService.local';
import type { QuestRuntimeEvent } from '@/types/quest';
import {
  DEMO_STORAGE_KEYS,
  getDemoCoins,
  getDemoPacks,
  getDemoUser,
  type DemoUserProfile,
} from '@/utils/localStorageUtils';

jest.mock(
  '@/data/quests.shared',
  () => ({
    SHARED_QUESTS: require('@/test/fixtures/quests').TEST_SHARED_QUESTS,
  }),
  { virtual: true }
);

const userId = 'demo-user';

function makeEvent(
  name: QuestRuntimeEvent['name'],
  amount?: number
): QuestRuntimeEvent {
  return {
    name,
    userId,
    occurredAt: new Date().toISOString(),
    amount,
  };
}

async function seedDemoState(): Promise<void> {
  const profile: DemoUserProfile = {
    uid: userId,
    pseudo: 'Tester',
    pseudoChangeUsed: false,
    avatarCreature: null,
    unlockedBadges: [],
    selectedBadges: [],
    unlockedFrames: [],
    selectedFrame: null,
    isAnonymous: true,
    createdAt: new Date().toISOString(),
  };

  await AsyncStorage.multiSet([
    [DEMO_STORAGE_KEYS.USER, JSON.stringify(profile)],
    [DEMO_STORAGE_KEYS.COINS, '0'],
    [DEMO_STORAGE_KEYS.CARDS, JSON.stringify([])],
    [DEMO_STORAGE_KEYS.PACKS, JSON.stringify([])],
    [DEMO_STORAGE_KEYS.QUEST_PROGRESS, JSON.stringify({})],
  ]);
}

describe('QuestServiceLocal', () => {
  let service: QuestServiceLocal;

  beforeEach(async () => {
    jest.useRealTimers();
    await AsyncStorage.clear();
    await seedDemoState();
    service = new QuestServiceLocal();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('merges shared and demo quest templates', async () => {
    const templates = await service.getQuestTemplates();

    expect(templates.map((quest) => quest.id)).toEqual(
      expect.arrayContaining([
        'first_victory',
        'win_3_battles',
        'daily_open_pack',
        'weekly_win_5',
        'demo_first_pack',
      ])
    );
  });

  it('auto-claims the first demo pack quest once', async () => {
    const results = await service.processEvent(userId, makeEvent('pack_opened'));

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      questId: 'demo_first_pack',
      rewards: { nexusCoins: 75 },
    });
    expect(await getDemoCoins()).toBe(75);

    const secondResults = await service.processEvent(
      userId,
      makeEvent('pack_opened')
    );
    expect(secondResults).toEqual([]);
    expect(await getDemoCoins()).toBe(75);
  });

  it('auto-claims first victory and unlocks its badge', async () => {
    const results = await service.processEvent(userId, makeEvent('battle_won'));
    const profile = await getDemoUser();

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          questId: 'first_victory',
          rewards: expect.objectContaining({ nexusCoins: 100 }),
        }),
      ])
    );
    expect(await getDemoCoins()).toBe(100);
    expect(profile?.unlockedBadges).toContain('beta_tester');
  });

  it('completes a manual quest and prevents a second claim', async () => {
    await service.processEvent(userId, makeEvent('battle_won'));
    await service.processEvent(userId, makeEvent('battle_won'));
    await service.processEvent(userId, makeEvent('battle_won'));

    const quests = await service.getPlayerQuests(userId);
    expect(quests.find((quest) => quest.questId === 'win_3_battles')?.state).toBe(
      'completed'
    );

    const result = await service.claimQuest(userId, 'win_3_battles');
    expect(result?.rewards.nexusCoins).toBe(200);
    expect(await service.claimQuest(userId, 'win_3_battles')).toBeNull();
    expect(await getDemoCoins()).toBe(300);
  });

  it('caps event progress at the quest target', async () => {
    await service.processEvent(userId, makeEvent('pack_opened', 50));

    const quests = await service.getPlayerQuests(userId);
    const daily = quests.find((quest) => quest.questId === 'daily_open_pack');

    expect(daily?.progressByCondition.daily_open_pack_cond1).toBe(1);
    expect(daily?.state).toBe('completed');
  });

  it('awards a canonical standard pack for the weekly quest', async () => {
    for (let index = 0; index < 5; index += 1) {
      await service.processEvent(userId, makeEvent('battle_won'));
    }

    const result = await service.claimQuest(userId, 'weekly_win_5');
    const packs = await getDemoPacks();

    expect(result?.details?.packs?.[0]?.id).toBe('standard_pack');
    expect(packs).toHaveLength(1);
    expect(packs[0].packId).toBe('standard_pack');
  });

  it('resets a completed daily quest after the reset boundary', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-16T12:00:00.000Z'));

    await AsyncStorage.setItem(
      DEMO_STORAGE_KEYS.QUEST_PROGRESS,
      JSON.stringify({
        daily_open_pack: {
          questId: 'daily_open_pack',
          state: 'completed',
          progressByCondition: { daily_open_pack_cond1: 1 },
          completedAt: '2026-07-14T21:00:00.000Z',
          claimedAt: null,
          lastResetAt: null,
          updatedAt: '2026-07-14T21:00:00.000Z',
        },
      })
    );

    await service.resetRecurringQuestsIfNeeded(userId);

    const [quest] = await service.getPlayerQuests(userId);
    expect(quest).toMatchObject({
      questId: 'daily_open_pack',
      state: 'available',
      progressByCondition: {},
      completedAt: null,
      claimedAt: null,
    });
  });
});
