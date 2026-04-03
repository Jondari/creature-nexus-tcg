/**
 * questService.firebase - Firebase (production) implementation of QuestService.
 *
 * Templates are cached in memory for 5 minutes.
 * Player quests are stored in users/{uid}/quests/{questId}.
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  getDoc,
  query,
  where,
  arrayUnion,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { addNexusCoins } from '@/utils/currencyUtils';
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

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

export class QuestServiceFirebase implements QuestService {
  private cachedTemplates: QuestTemplate[] | null = null;
  private lastFetch = 0;

  async getQuestTemplates(): Promise<QuestTemplate[]> {
    const now = Date.now();
    if (this.cachedTemplates && now - this.lastFetch < CACHE_DURATION) {
      return this.cachedTemplates;
    }

    try {
      const snap = await getDocs(collection(db, 'quests'));
      const templates: QuestTemplate[] = [];
      snap.forEach((d) => {
        const data = d.data() as QuestTemplate;
        if (data.enabled !== false) {
          templates.push({ ...data, id: d.id });
        }
      });
      this.cachedTemplates = templates;
      this.lastFetch = now;
      return templates;
    } catch (error) {
      if (__DEV__) {
        console.warn('[QuestFirebase] Failed to fetch templates from Firestore:', error);
      }
      return [];
    }
  }

  async getPlayerQuests(userId: string): Promise<PlayerQuest[]> {
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'quests'));
      const quests: PlayerQuest[] = [];
      snap.forEach((d) => quests.push(d.data() as PlayerQuest));
      return quests;
    } catch {
      return [];
    }
  }

  private async finalizeQuestClaim(
    userId: string,
    template: QuestTemplate,
    questRef: any, // DocumentReference
    quest: PlayerQuest,
    now: string
  ): Promise<QuestClaimResult> {
    const rewards = template.rewards;
    const grantedPacks: any[] = [];
    const grantedCards: any[] = [];

    if (rewards.nexusCoins && rewards.nexusCoins > 0) {
      await addNexusCoins(userId, rewards.nexusCoins);
    }

    if (rewards.packs?.length) {
      try {
        const { addPackToInventory } = await import('@/utils/packInventory');
        const { getPackById } = await import('@/data/boosterPacks');
        for (const packId of rewards.packs) {
          const pack = getPackById(packId);
          if (pack) {
            grantedPacks.push(pack);
            await addPackToInventory(userId, pack, 'Quest Reward');
          }
        }
      } catch (e) {
        if (__DEV__) console.warn('[QuestFirebase] Pack reward failed:', e);
      }
    }

    if (rewards.badges?.length) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { unlockedBadges: arrayUnion(...rewards.badges) });
    }

    if (rewards.avatarFrames?.length) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { unlockedFrames: arrayUnion(...rewards.avatarFrames) });
    }

    // Grant cards
    if (rewards.cards?.length) {
      try {
        const { generateRandomCard } = await import('@/utils/cardUtils');
        const { getRandomCardByRarity } = await import('@/models/Card');
        const monsterCards = require('@/data/monster-cards.json');
        const { addCardToCollection } = await import('@/utils/cardRewards');

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
          if (card) {
            grantedCards.push(card);
            try {
              await addCardToCollection(userId, card, 'Quest Reward');
            } catch (e) {
              if (__DEV__) console.warn('[QuestFirebase] Card grant failed:', e);
            }
          }
        }
      } catch (e) {
        if (__DEV__) console.warn('[QuestFirebase] Card reward failed:', e);
      }
    }

    await setDoc(
      questRef,
      {
        questId: template.id,
        progressByCondition: quest.progressByCondition,
        completedAt: quest.completedAt ?? now,
        state: 'claimed',
        claimedAt: now,
        updatedAt: now,
      },
      { merge: true }
    );
    return {
      rewards,
      details: {
        packs: grantedPacks,
        cards: grantedCards,
      },
    };
  }

  async processEvent(userId: string, event: QuestRuntimeEvent): Promise<AutoClaimResult[]> {
    const templates = await this.getQuestTemplates();
    const now = new Date().toISOString();
    const autoClaimed: AutoClaimResult[] = [];

    for (const template of templates) {
      // Skip expired event quests
      if (template.type === 'event' && template.expiresAt) {
        if (new Date(template.expiresAt) < new Date()) continue;
      }

      const questRef = doc(db, 'users', userId, 'quests', template.id);
      const snap = await getDoc(questRef);
      const existing: PlayerQuest = snap.exists()
        ? (snap.data() as PlayerQuest)
        : {
            questId: template.id,
            state: 'available',
            progressByCondition: {},
            completedAt: null,
            claimedAt: null,
            lastResetAt: null,
            updatedAt: now,
          };

      if (existing.state !== 'available') continue;

      let changed = false;
      for (const condition of template.conditions) {
        if (!conditionMatchesEvent(condition, event)) continue;

        const current = existing.progressByCondition[condition.id] ?? 0;
        if (current >= condition.count) continue;

        const increment = event.amount ?? 1;
        existing.progressByCondition[condition.id] = Math.min(current + increment, condition.count);
        changed = true;
      }

      if (changed) {
        existing.updatedAt = now;
        if (isQuestComplete(template, existing)) {
          if (template.rewardMode === 'auto_claim') {
            existing.completedAt = now;
            const result = await this.finalizeQuestClaim(userId, template, questRef, existing, now);
            autoClaimed.push({ questId: template.id, rewards: result.rewards, details: result.details });
          } else {
            existing.state = 'completed';
            existing.completedAt = now;
            await setDoc(questRef, existing, { merge: true });
          }
        } else {
          await setDoc(questRef, existing, { merge: true });
        }
      }
    }

    return autoClaimed;
  }

  async claimQuest(userId: string, questId: string): Promise<QuestClaimResult | null> {
    const questRef = doc(db, 'users', userId, 'quests', questId);
    const snap = await getDoc(questRef);
    if (!snap.exists()) return null;

    const quest = snap.data() as PlayerQuest;
    if (quest.state !== 'completed') return null;

    const templates = await this.getQuestTemplates();
    const template = templates.find((t) => t.id === questId);
    if (!template) return null;

    const now = new Date().toISOString();
    return this.finalizeQuestClaim(userId, template, questRef, quest, now);
  }

  async resetRecurringQuestsIfNeeded(userId: string): Promise<void> {
    const templates = await this.getQuestTemplates();
    const now = new Date().toISOString();
    const dailyBoundary = getLastResetBoundary();
    const weeklyBoundary = getLastWeeklyResetBoundary();

    const repeatableIds = templates
      .filter((t) => t.repeatable && (t.type === 'daily' || t.type === 'weekly'))
      .map((t) => t.id);

    if (repeatableIds.length === 0) return;

    const playerSnap = await getDocs(
      query(
        collection(db, 'users', userId, 'quests'),
        where('state', 'in', ['claimed', 'completed'])
      )
    );

    const promises: Promise<void>[] = [];

    playerSnap.forEach((d) => {
      const quest = d.data() as PlayerQuest;
      if (!repeatableIds.includes(quest.questId)) return;

      const template = templates.find((t) => t.id === quest.questId);
      if (!template || !template.repeatable) return;

      let boundary: string | null = null;
      if (template.type === 'daily') boundary = dailyBoundary;
      if (template.type === 'weekly') boundary = weeklyBoundary;
      if (!boundary) return;

      const lastReset = quest.lastResetAt ?? quest.claimedAt ?? quest.completedAt ?? null;
      if (!lastReset || lastReset < boundary) {
        const reset: PlayerQuest = {
          questId: quest.questId,
          state: 'available',
          progressByCondition: {},
          completedAt: null,
          claimedAt: null,
          lastResetAt: now,
          updatedAt: now,
        };
        promises.push(setDoc(d.ref, reset));
      }
    });

    await Promise.all(promises);
  }
}
