import type { RedeemCodeRewards } from '@/types/redeem';
import type { BoosterPack } from '@/models/BoosterPack';
import type { Card } from '@/types/game';
import type { ExtendedCard } from '@/models/cards-extended';

export type QuestType = 'permanent' | 'daily' | 'weekly' | 'event';

export type QuestRewardMode = 'manual_claim' | 'auto_claim';

export type QuestEventName =
  | 'battle_won'
  | 'battle_lost'
  | 'pack_opened'
  | 'cards_collected'
  | 'login_streak'
  | 'redeem_code';

export interface QuestCondition {
  id: string;
  event: QuestEventName;
  count: number;
  filters?: {
    rankedOnly?: boolean;
    packId?: string;
    cardId?: string;
    rarity?: string;
    element?: string;
  };
}

export type QuestRewards = RedeemCodeRewards;

export interface QuestTemplate {
  id: string;
  title: string;
  titleKey?: string;
  type: QuestType;
  description?: string;
  descriptionKey?: string;
  conditions: QuestCondition[];
  rewards: QuestRewards;
  rewardMode?: QuestRewardMode; // default 'manual_claim'
  hidden?: boolean;
  expiresAt?: string | null;
  repeatable?: boolean;
  enabled?: boolean;
  sortOrder?: number;
  updatedAt?: string;
}

export type PlayerQuestState = 'available' | 'completed' | 'claimed' | 'expired';

export interface PlayerQuest {
  questId: string;
  state: PlayerQuestState;
  progressByCondition: Record<string, number>;
  completedAt?: string | null;
  claimedAt?: string | null;
  lastResetAt?: string | null;
  updatedAt?: string;
}

export interface QuestRuntimeEvent {
  name: QuestEventName;
  userId: string;
  occurredAt: string;
  amount?: number;
  metadata?: {
    rankedOnly?: boolean;
    packId?: string;
    cardId?: string;
    rarity?: string;
    element?: string;
  };
}

export interface AutoClaimResult {
  questId: string;
  rewards: QuestRewards;
  details?: QuestClaimDetails;
}

export interface QuestClaimDetails {
  packs?: BoosterPack[];
  cards?: Array<Card | ExtendedCard>;
}

export interface QuestClaimResult {
  rewards: QuestRewards;
  details?: QuestClaimDetails;
}

export interface QuestService {
  getQuestTemplates(): Promise<QuestTemplate[]>;
  getPlayerQuests(userId: string): Promise<PlayerQuest[]>;
  processEvent(userId: string, event: QuestRuntimeEvent): Promise<AutoClaimResult[]>;
  claimQuest(userId: string, questId: string): Promise<QuestClaimResult | null>;
  resetRecurringQuestsIfNeeded(userId: string): Promise<void>;
}
