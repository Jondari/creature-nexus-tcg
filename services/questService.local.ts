/**
 * questService.local - Local (demo mode) implementation of QuestService.
 *
 * Stores quest progress in AsyncStorage under @demo_quest_progress.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addDemoCoins,
  addDemoPack,
  getDemoUser,
  updateDemoUser,
  DEMO_STORAGE_KEYS,
} from '@/utils/localStorageUtils';
import { STANDARD_PACK } from '@/data/boosterPacks';
import type {
  QuestService,
  QuestTemplate,
  PlayerQuest,
  QuestRuntimeEvent,
  QuestClaimResult,
  QuestCondition,
  AutoClaimResult,
} from '@/types/quest';
import { getLastResetBoundary, getLastWeeklyResetBoundary } from '@/services/questService';

let SHARED_QUESTS: QuestTemplate[] = [];
try {
  ({ SHARED_QUESTS } = require('@/data/quests.shared'));
} catch {
  SHARED_QUESTS = [];
}
const { DEMO_QUESTS } = require('@/data/quests.demo');

function mergeQuests(): QuestTemplate[] {
  const map = new Map<string, QuestTemplate>();
  for (const q of SHARED_QUESTS) {
    map.set(q.id, q);
  }
  // Demo quests win on id collision
  for (const q of DEMO_QUESTS as QuestTemplate[]) {
    map.set(q.id, q);
  }
  return Array.from(map.values()).filter((q) => q.enabled !== false);
}

async function loadProgress(): Promise<Record<string, PlayerQuest>> {
  try {
    const data = await AsyncStorage.getItem(DEMO_STORAGE_KEYS.QUEST_PROGRESS);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

async function saveProgress(progress: Record<string, PlayerQuest>): Promise<void> {
  await AsyncStorage.setItem(DEMO_STORAGE_KEYS.QUEST_PROGRESS, JSON.stringify(progress));
}

function conditionMatchesEvent(
  condition: QuestCondition,
  event: QuestRuntimeEvent
): boolean {
  if (condition.event !== event.name) return false;
  if (!condition.filters) return true;

  const f = condition.filters;
  const m = event.metadata ?? {};

  if (f.rankedOnly !== undefined && f.rankedOnly !== m.rankedOnly) return false;
  if (f.packId !== undefined && f.packId !== m.packId) return false;
  if (f.cardId !== undefined && f.cardId !== m.cardId) return false;
  if (f.rarity !== undefined && f.rarity !== m.rarity) return false;
  if (f.element !== undefined && f.element !== m.element) return false;

  return true;
}

function isQuestComplete(template: QuestTemplate, quest: PlayerQuest): boolean {
  return template.conditions.every(
    (c) => (quest.progressByCondition[c.id] ?? 0) >= c.count
  );
}

export class QuestServiceLocal implements QuestService {
  private async finalizeQuestClaim(
    template: QuestTemplate,
    quest: PlayerQuest,
    progress: Record<string, PlayerQuest>
  ): Promise<QuestClaimResult> {
    const rewards = template.rewards;
    const now = new Date().toISOString();
    const grantedPacks: any[] = [];
    const grantedCards: any[] = [];

    // Grant nexusCoins
    if (rewards.nexusCoins && rewards.nexusCoins > 0) {
      await addDemoCoins(rewards.nexusCoins);
    }

    // Grant packs (standard only in local mode)
    if (rewards.packs && rewards.packs.length > 0) {
      for (const packId of rewards.packs) {
        if (packId === 'standard') {
          grantedPacks.push(STANDARD_PACK);
          await addDemoPack({
            packId: STANDARD_PACK.id,
            packName: STANDARD_PACK.name,
            packType: STANDARD_PACK.type,
            earnedAt: now,
            reason: 'Quest Reward',
          });
        } else if (__DEV__) {
          console.warn(`[QuestLocal] Pack reward "${packId}" not handled in demo mode — skipping.`);
        }
      }
    }

    // Grant badges
    if (rewards.badges && rewards.badges.length > 0) {
      const demoUser = await getDemoUser();
      if (demoUser) {
        const existing = demoUser.unlockedBadges ?? [];
        const toAdd = rewards.badges.filter((b) => !existing.includes(b));
        if (toAdd.length > 0) {
          await updateDemoUser({ unlockedBadges: [...existing, ...toAdd] });
        }
      }
    }

    // Grant avatarFrames
    if (rewards.avatarFrames && rewards.avatarFrames.length > 0) {
      const demoUser = await getDemoUser();
      if (demoUser) {
        const existing = demoUser.unlockedFrames ?? [];
        const toAdd = rewards.avatarFrames.filter((f) => !existing.includes(f));
        if (toAdd.length > 0) {
          await updateDemoUser({ unlockedFrames: [...existing, ...toAdd] });
        }
      }
    }

    // Grant cards
    if (rewards.cards && rewards.cards.length > 0) {
      try {
        const { generateRandomCard } = await import('@/utils/cardUtils');
        const { getRandomCardByRarity } = await import('@/models/Card');
        const monsterCards = require('@/data/monster-cards.json');

        const { addDemoCards } = await import('@/utils/localStorageUtils');

        for (const cardIdentifier of rewards.cards) {
          let card: any = null;
          if (cardIdentifier === 'random') {
            card = generateRandomCard();
          } else if (cardIdentifier.startsWith('random_')) {
            const rarity = cardIdentifier.slice('random_'.length) as any;
            const base = getRandomCardByRarity(rarity);
            if (base) {
              card = {
                ...base,
                id: `${base.name}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                maxHp: base.hp,
                isMythic: base.rarity === 'mythic',
              };
            }
          } else {
            const base = (monsterCards as any[]).find((c: any) => c.name === cardIdentifier);
            if (base) {
              card = {
                ...base,
                id: `${base.name}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                maxHp: base.hp,
                isMythic: base.rarity === 'mythic',
              };
            }
          }
          if (card) grantedCards.push(card);
        }

        if (grantedCards.length > 0) {
          await addDemoCards(grantedCards);
        }
      } catch (e) {
        if (__DEV__) console.warn('[QuestLocal] Card reward failed:', e);
      }
    }

    quest.state = 'claimed';
    quest.claimedAt = now;
    quest.updatedAt = now;
    progress[template.id] = quest;
    await saveProgress(progress);

    return {
      rewards,
      details: {
        packs: grantedPacks,
        cards: grantedCards,
      },
    };
  }

  async getQuestTemplates(): Promise<QuestTemplate[]> {
    return mergeQuests();
  }

  async getPlayerQuests(_userId: string): Promise<PlayerQuest[]> {
    const progress = await loadProgress();
    return Object.values(progress);
  }

  async processEvent(userId: string, event: QuestRuntimeEvent): Promise<AutoClaimResult[]> {
    const templates = mergeQuests();
    const progress = await loadProgress();
    const now = new Date().toISOString();
    const autoClaimed: AutoClaimResult[] = [];

    for (const template of templates) {
      // Skip event-type quests that have expired
      if (template.type === 'event' && template.expiresAt) {
        if (new Date(template.expiresAt) < new Date()) {
          const existing = progress[template.id];
          if (existing && existing.state === 'available') {
            progress[template.id] = { ...existing, state: 'expired', updatedAt: now };
          }
          continue;
        }
      }

      const existing: PlayerQuest = progress[template.id] ?? {
        questId: template.id,
        state: 'available',
        progressByCondition: {},
        completedAt: null,
        claimedAt: null,
        lastResetAt: null,
        updatedAt: now,
      };

      // Skip already completed/claimed/expired quests
      if (existing.state !== 'available') continue;

      let changed = false;
      for (const condition of template.conditions) {
        if (!conditionMatchesEvent(condition, event)) continue;

        const current = existing.progressByCondition[condition.id] ?? 0;
        if (current >= condition.count) continue; // already maxed

        const increment = event.amount ?? 1;
        const next = Math.min(current + increment, condition.count);
        existing.progressByCondition[condition.id] = next;
        changed = true;
      }

      if (changed) {
        existing.updatedAt = now;
        if (isQuestComplete(template, existing)) {
          if (template.rewardMode === 'auto_claim') {
            existing.completedAt = now;
            const result = await this.finalizeQuestClaim(template, existing, progress);
            autoClaimed.push({ questId: template.id, rewards: result.rewards, details: result.details });
          } else {
            existing.state = 'completed';
            existing.completedAt = now;
            progress[template.id] = existing;
          }
        } else {
          progress[template.id] = existing;
        }
      }
    }

    await saveProgress(progress);
    return autoClaimed;
  }

  async claimQuest(userId: string, questId: string): Promise<QuestClaimResult | null> {
    const progress = await loadProgress();
    const quest = progress[questId];

    if (!quest || quest.state !== 'completed') return null;

    const templates = mergeQuests();
    const template = templates.find((t) => t.id === questId);
    if (!template) return null;

    return this.finalizeQuestClaim(template, quest, progress);
  }

  async resetRecurringQuestsIfNeeded(_userId: string): Promise<void> {
    const templates = mergeQuests();
    const progress = await loadProgress();
    const now = new Date().toISOString();
    const dailyBoundary = getLastResetBoundary();
    const weeklyBoundary = getLastWeeklyResetBoundary();
    let changed = false;

    for (const template of templates) {
      if (!template.repeatable) continue;

      const quest = progress[template.id];
      if (!quest) continue;

      // Only reset claimed or completed quests
      if (quest.state !== 'claimed' && quest.state !== 'completed') continue;

      let boundary: string | null = null;
      if (template.type === 'daily') boundary = dailyBoundary;
      if (template.type === 'weekly') boundary = weeklyBoundary;
      if (!boundary) continue;

      const lastReset = quest.lastResetAt ?? quest.claimedAt ?? quest.completedAt ?? null;
      if (!lastReset || lastReset < boundary) {
        progress[template.id] = {
          questId: template.id,
          state: 'available',
          progressByCondition: {},
          completedAt: null,
          claimedAt: null,
          lastResetAt: now,
          updatedAt: now,
        };
        changed = true;
      }
    }

    if (changed) {
      await saveProgress(progress);
    }
  }
}
