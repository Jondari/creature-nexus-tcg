import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useQuests } from '@/context/QuestContext';
import { RewardAnimation } from '@/components/Animation/RewardAnimation';
import { buildRewardAnimQueue, AnimItem } from '@/utils/rewardAnimUtils';
import type { RedeemCodeRewards } from '@/types/redeem';
import { t } from '@/utils/i18n';

export function QuestRewardOverlay() {
  const { pendingQuestRewards, clearPendingQuestRewards, questRewardOverlayEnabled } = useQuests();
  const [queue, setQueue] = useState<AnimItem[]>([]);
  const [current, setCurrent] = useState<AnimItem | null>(null);

  useEffect(() => {
    if (!questRewardOverlayEnabled) return;
    if (!pendingQuestRewards?.length) return;
    // Aggregate all rewards into one queue
    const merged = pendingQuestRewards.reduce<RedeemCodeRewards>(
      (acc, result) => ({
        nexusCoins: (acc.nexusCoins ?? 0) + (result.rewards.nexusCoins ?? 0),
        badges: [...(acc.badges ?? []), ...(result.rewards.badges ?? [])],
        avatarFrames: [...(acc.avatarFrames ?? []), ...(result.rewards.avatarFrames ?? [])],
        packs: [...(acc.packs ?? []), ...(result.rewards.packs ?? [])],
        cards: [...(acc.cards ?? []), ...(result.rewards.cards ?? [])],
      }),
      {}
    );
    const built = buildRewardAnimQueue(merged, {
      packs: pendingQuestRewards.flatMap(result => result.details?.packs ?? []),
      cards: pendingQuestRewards.flatMap(result => result.details?.cards ?? []),
    });
    if (built.length === 0) {
      clearPendingQuestRewards();
      return;
    }
    setQueue(built);
    setCurrent(built[0]);
  }, [pendingQuestRewards, questRewardOverlayEnabled]);

  const handleComplete = () => {
    if (queue.length <= 1) {
      setQueue([]);
      setCurrent(null);
      clearPendingQuestRewards();
      return;
    }
    const next = queue.slice(1);
    setQueue(next);
    setCurrent(next[0]);
  };

  if (!questRewardOverlayEnabled || !current) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <RewardAnimation
        type={current.type as any}
        eyebrow={t('quests.rewardCompleted')}
        message={
          current.type === 'coins'
            ? t('redeem.reward.coins', { amount: String(current.payload.amount) })
            : current.type === 'pack'
            ? t('redeem.reward.pack', { name: String(current.payload.pack.name) })
            : current.type === 'card'
            ? t('redeem.reward.card', { name: String(current.payload.card.name) })
            : current.type === 'badge'
            ? t('redeem.reward.badge', { name: t(`badge.name.${current.payload.badgeId}`) })
            : t('redeem.reward.avatarFrame', { name: t(`avatarFrame.name.${current.payload.frameId}`) })
        }
        coins={current.type === 'coins' ? current.payload.amount : undefined}
        pack={current.type === 'pack' ? current.payload.pack : undefined}
        card={current.type === 'card' ? current.payload.card : undefined}
        badgeId={current.type === 'badge' ? current.payload.badgeId : undefined}
        frameId={current.type === 'avatarFrame' ? current.payload.frameId : undefined}
        onComplete={handleComplete}
      />
    </View>
  );
}
