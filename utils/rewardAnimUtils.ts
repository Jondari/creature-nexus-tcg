import type { RedeemCodeRewards } from '@/types/redeem';
import type { BoosterPack } from '@/models/BoosterPack';
import type { Card } from '@/types/game';
import type { ExtendedCard } from '@/models/cards-extended';

export type AnimItem =
  | { type: 'coins'; payload: { amount: number } }
  | { type: 'pack'; payload: { pack: BoosterPack } }
  | { type: 'card'; payload: { card: Card | ExtendedCard } }
  | { type: 'badge'; payload: { badgeId: string } }
  | { type: 'avatarFrame'; payload: { frameId: string } };

interface RewardAnimDetails {
  packs?: BoosterPack[];
  cards?: Array<Card | ExtendedCard>;
}

export function buildRewardAnimQueue(
  rewards: RedeemCodeRewards,
  details?: RewardAnimDetails
): AnimItem[] {
  const queue: AnimItem[] = [];
  if (rewards.nexusCoins && rewards.nexusCoins > 0) {
    queue.push({ type: 'coins', payload: { amount: rewards.nexusCoins } });
  }
  if (details?.packs?.length) {
    details.packs.forEach(pack => queue.push({ type: 'pack', payload: { pack } }));
  }
  if (details?.cards?.length) {
    details.cards.forEach(card => queue.push({ type: 'card', payload: { card } }));
  }
  if (rewards.badges?.length) {
    rewards.badges.forEach(id => queue.push({ type: 'badge', payload: { badgeId: id } }));
  }
  if (rewards.avatarFrames?.length) {
    rewards.avatarFrames.forEach(id => queue.push({ type: 'avatarFrame', payload: { frameId: id } }));
  }
  return queue;
}
