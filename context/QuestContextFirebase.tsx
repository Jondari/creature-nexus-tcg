/**
 * QuestContextFirebase - Firebase (production) quest context.
 *
 * Templates fetched once on mount; player quests via onSnapshot for real-time updates.
 * Loaded conditionally via Providers.tsx in production mode.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { QuestServiceFirebase } from '@/services/questService.firebase';
import { useAuth } from '@/context/AuthContext';
import { gameEventBus } from '@/utils/gameEventBus';
import type {
  QuestTemplate,
  PlayerQuest,
  QuestRuntimeEvent,
  QuestClaimResult,
  QuestEventName,
} from '@/types/quest';
import type { QuestContextType } from '@/context/QuestContextLocal';

export type { QuestContextType };

const QuestContext = createContext<QuestContextType | null>(null);

const service = new QuestServiceFirebase();

export function QuestProvider({ children }: { children: ReactNode }) {
  const { user, refreshBadges, refreshFrames } = useAuth();
  const [templates, setTemplates] = useState<QuestTemplate[]>([]);
  const [playerQuests, setPlayerQuests] = useState<PlayerQuest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingQuestRewards, setPendingQuestRewards] = useState<QuestClaimResult[] | null>(null);
  const [questRewardOverlayEnabled, setQuestRewardOverlayEnabled] = useState(true);

  const userId = user?.uid ?? '';

  // Fetch templates once on mount / userId change
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setIsLoading(true);
      try {
        await service.resetRecurringQuestsIfNeeded(userId);
        const tpl = await service.getQuestTemplates();
        if (!cancelled) setTemplates(tpl);
      } catch (error) {
        if (__DEV__) {
          console.warn('[QuestFirebase] Failed to load templates:', error);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Subscribe to player quests subcollection for real-time updates
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = onSnapshot(
      collection(db, 'users', userId, 'quests'),
      (snap) => {
        const quests: PlayerQuest[] = [];
        snap.forEach((d) => quests.push(d.data() as PlayerQuest));
        setPlayerQuests(quests);
      },
      (error) => {
        if (__DEV__) {
          console.warn('[QuestFirebase] onSnapshot error:', error);
        }
      }
    );

    return unsubscribe;
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const tpl = await service.getQuestTemplates();
      setTemplates(tpl);
      // playerQuests are already live via onSnapshot
    } catch (error) {
      if (__DEV__) {
        console.warn('[QuestFirebase] Failed to refresh templates:', error);
      }
    }
  }, [userId]);

  // Subscribe to game events via bus
  useEffect(() => {
    if (!userId) return;
    const events: QuestEventName[] = ['battle_won', 'battle_lost', 'pack_opened', 'cards_collected'];
    const unsubs = events.map(name =>
      gameEventBus.on(name, (payload) => {
        const fullEvent: QuestRuntimeEvent = {
          name,
          userId,
          occurredAt: new Date().toISOString(),
          amount: payload?.amount,
          metadata: payload?.metadata as any,
        };
        service.processEvent(userId, fullEvent).then(async autoClaimed => {
          if (autoClaimed.length > 0) {
            setPendingQuestRewards(autoClaimed.map(r => ({ rewards: r.rewards, details: r.details })));

            const shouldRefreshBadges = autoClaimed.some(r => (r.rewards.badges?.length ?? 0) > 0);
            const shouldRefreshFrames = autoClaimed.some(r => (r.rewards.avatarFrames?.length ?? 0) > 0);

            if (shouldRefreshBadges) {
              await refreshBadges();
            }
            if (shouldRefreshFrames) {
              await refreshFrames();
            }
          }
          await refresh();
        }).catch((error) => {
          if (__DEV__) {
            console.warn(`[QuestFirebase] Failed to process "${name}" event:`, error);
          }
        });
      })
    );
    return () => unsubs.forEach(fn => fn());
  }, [userId, refresh, refreshBadges, refreshFrames]);

  const processEvent = useCallback(
    async (event: Omit<QuestRuntimeEvent, 'userId' | 'occurredAt'>) => {
      if (!userId) return;
      const fullEvent: QuestRuntimeEvent = {
        ...event,
        userId,
        occurredAt: new Date().toISOString(),
      };
      const autoClaimed = await service.processEvent(userId, fullEvent);
      if (autoClaimed.length > 0) {
        setPendingQuestRewards(autoClaimed.map(r => ({ rewards: r.rewards, details: r.details })));

        const shouldRefreshBadges = autoClaimed.some(r => (r.rewards.badges?.length ?? 0) > 0);
        const shouldRefreshFrames = autoClaimed.some(r => (r.rewards.avatarFrames?.length ?? 0) > 0);

        if (shouldRefreshBadges) {
          await refreshBadges();
        }
        if (shouldRefreshFrames) {
          await refreshFrames();
        }
      }
      // playerQuests update via onSnapshot automatically
    },
    [userId, refreshBadges, refreshFrames]
  );

  const claimQuest = useCallback(
    async (questId: string): Promise<QuestClaimResult | null> => {
      if (!userId) return null;
      const rewards = await service.claimQuest(userId, questId);
      if (rewards) {
        setPendingQuestRewards([rewards]);

        if ((rewards.rewards.badges?.length ?? 0) > 0) {
          await refreshBadges();
        }
        if ((rewards.rewards.avatarFrames?.length ?? 0) > 0) {
          await refreshFrames();
        }
      }
      // onSnapshot will pick up the state change
      return rewards;
    },
    [userId, refreshBadges, refreshFrames]
  );

  const getPlayerQuest = useCallback(
    (questId: string): PlayerQuest | undefined =>
      playerQuests.find((q) => q.questId === questId),
    [playerQuests]
  );

  const clearPendingQuestRewards = useCallback(() => {
    setPendingQuestRewards(null);
  }, []);

  return (
    <QuestContext.Provider
      value={{
        templates,
        playerQuests,
        isLoading,
        processEvent,
        claimQuest,
        refresh,
        getPlayerQuest,
        pendingQuestRewards,
        clearPendingQuestRewards,
        questRewardOverlayEnabled,
        setQuestRewardOverlayEnabled,
      }}
    >
      {children}
    </QuestContext.Provider>
  );
}

export function useQuests(): QuestContextType {
  const ctx = useContext(QuestContext);
  if (!ctx) throw new Error('useQuests must be used within a QuestProvider');
  return ctx;
}
