/**
 * QuestContextLocal - Local (demo mode) quest context.
 *
 * Provides the same interface as QuestContextFirebase but backed by AsyncStorage.
 * Loaded conditionally via Providers.tsx in demo mode.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { QuestServiceLocal } from '@/services/questService.local';
import { useAuth } from '@/context/AuthContextLocal';
import { gameEventBus } from '@/utils/gameEventBus';
import type {
  QuestTemplate,
  PlayerQuest,
  QuestRuntimeEvent,
  QuestClaimResult,
  QuestEventName,
} from '@/types/quest';

export interface QuestContextType {
  templates: QuestTemplate[];
  playerQuests: PlayerQuest[];
  isLoading: boolean;
  processEvent: (event: Omit<QuestRuntimeEvent, 'userId' | 'occurredAt'>) => Promise<void>;
  claimQuest: (questId: string) => Promise<QuestClaimResult | null>;
  refresh: () => Promise<void>;
  getPlayerQuest: (questId: string) => PlayerQuest | undefined;
  pendingQuestRewards: QuestClaimResult[] | null;
  clearPendingQuestRewards: () => void;
  questRewardOverlayEnabled: boolean;
  setQuestRewardOverlayEnabled: (enabled: boolean) => void;
}

const QuestContext = createContext<QuestContextType | null>(null);

const service = new QuestServiceLocal();

export function QuestProvider({ children }: { children: ReactNode }) {
  const { user, refreshBadges, refreshFrames } = useAuth();
  const [templates, setTemplates] = useState<QuestTemplate[]>([]);
  const [playerQuests, setPlayerQuests] = useState<PlayerQuest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingQuestRewards, setPendingQuestRewards] = useState<QuestClaimResult[] | null>(null);
  const [questRewardOverlayEnabled, setQuestRewardOverlayEnabled] = useState(true);

  const userId = user?.uid ?? '';

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const [tpl, pq] = await Promise.all([
        service.getQuestTemplates(),
        service.getPlayerQuests(userId),
      ]);
      setTemplates(tpl);
      setPlayerQuests(pq);
    } catch (error) {
      if (__DEV__) {
        console.warn('[QuestLocal] Failed to refresh quest state:', error);
      }
    }
  }, [userId]);

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
        if (!cancelled) {
          await refresh();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, refresh]);

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
            console.warn(`[QuestLocal] Failed to process "${name}" event:`, error);
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
      await refresh();
    },
    [userId, refresh, refreshBadges, refreshFrames]
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
      await refresh();
      return rewards;
    },
    [userId, refresh, refreshBadges, refreshFrames]
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
