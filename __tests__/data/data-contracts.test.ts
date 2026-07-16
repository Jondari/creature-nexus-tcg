import { ALL_BOOSTER_PACKS, getPackById } from '@/data/boosterPacks';
import en from '@/data/i18n_en.json';
import fr from '@/data/i18n_fr.json';
import monsterCards from '@/data/monster-cards.json';
import spellCards from '@/data/spell-cards.json';
import { STORY_CHAPTERS } from '@/data/storyMode';

const { AVAILABLE_BADGES } = require('@/data/badges.shared');
const { AVAILABLE_FRAMES } = require('@/data/frames.shared');
const { DEMO_QUESTS } = require('@/data/quests.demo');
const { SAMPLE_QUESTS } = require('@/data/quests.sample');

function hasPath(source: Record<string, unknown>, path: string): boolean {
  return path.split('.').every((segment) => {
    if (
      typeof source !== 'object' ||
      source === null ||
      !(segment in source)
    ) {
      return false;
    }
    source = source[segment] as Record<string, unknown>;
    return true;
  });
}

describe('project data contracts', () => {
  it('keeps monster names unique and combat values valid', () => {
    const names = monsterCards.map((card) => card.name);
    expect(new Set(names).size).toBe(names.length);

    for (const card of monsterCards) {
      expect(card.hp).toBeGreaterThan(0);
      expect(card.attacks.length).toBeGreaterThan(0);
      for (const attack of card.attacks) {
        expect(attack.damage).toBeGreaterThanOrEqual(0);
        expect(attack.energy).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('keeps spell names unique and energy costs non-negative', () => {
    const names = spellCards.map((card) => card.name);
    expect(new Set(names).size).toBe(names.length);

    for (const spell of spellCards) {
      expect(spell.energyCost).toBeGreaterThanOrEqual(0);
      expect(spell.effect).toBeTruthy();
    }
  });

  it('keeps pack and quest identifiers unique', () => {
    const packIds = ALL_BOOSTER_PACKS.map((pack) => pack.id);
    const quests = [...SAMPLE_QUESTS, ...DEMO_QUESTS];
    const questIds = quests.map((quest) => quest.id);

    expect(new Set(packIds).size).toBe(packIds.length);
    expect(new Set(questIds).size).toBe(questIds.length);
  });

  it('only references known packs, badges and avatar frames in quests', () => {
    const packIds = new Set(ALL_BOOSTER_PACKS.map((pack) => pack.id));
    const badgeIds = new Set(AVAILABLE_BADGES.map((badge: { id: string }) => badge.id));
    const frameIds = new Set(AVAILABLE_FRAMES.map((frame: { id: string }) => frame.id));

    for (const quest of [...SAMPLE_QUESTS, ...DEMO_QUESTS]) {
      for (const packId of quest.rewards.packs ?? []) {
        expect(packIds.has(packId)).toBe(true);
      }
      for (const badgeId of quest.rewards.badges ?? []) {
        expect(badgeIds.has(badgeId)).toBe(true);
      }
      for (const frameId of quest.rewards.avatarFrames ?? []) {
        expect(frameIds.has(frameId)).toBe(true);
      }
    }
  });

  it('supports the historical standard pack alias', () => {
    expect(getPackById('standard')?.id).toBe('standard_pack');
    expect(getPackById('standard_pack')?.id).toBe('standard_pack');
  });

  it('keeps story battle connections inside their chapter', () => {
    for (const chapter of STORY_CHAPTERS) {
      const battleIds = new Set(chapter.battles.map((battle) => battle.id));
      for (const battle of chapter.battles) {
        for (const connectionId of battle.connections) {
          expect(battleIds.has(connectionId)).toBe(true);
        }
      }
    }
  });

  it('provides every quest translation in English and French', () => {
    for (const quest of DEMO_QUESTS) {
      if (quest.titleKey) {
        expect(hasPath(en, quest.titleKey)).toBe(true);
        expect(hasPath(fr, quest.titleKey)).toBe(true);
      }
      if (quest.descriptionKey) {
        expect(hasPath(en, quest.descriptionKey)).toBe(true);
        expect(hasPath(fr, quest.descriptionKey)).toBe(true);
      }
    }
  });
});
