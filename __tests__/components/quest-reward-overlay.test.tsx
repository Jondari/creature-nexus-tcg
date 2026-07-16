import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import { QuestRewardOverlay } from '@/components/QuestRewardOverlay';

const mockUseQuests = jest.fn();
let mockCompleteReward: (() => void) | undefined;

jest.mock('@/context/QuestContext', () => ({
  useQuests: () => mockUseQuests(),
}));

jest.mock('@/utils/i18n', () => ({
  t: (key: string, params?: Record<string, string>) =>
    params ? `${key}:${Object.values(params).join(',')}` : key,
}));

jest.mock('@/components/Animation/RewardAnimation', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return {
    RewardAnimation: ({
      message,
      onComplete,
    }: {
      message: string;
      onComplete?: () => void;
    }) => {
      mockCompleteReward = onComplete;
      return React.createElement(
        Pressable,
        { testID: 'reward-animation' },
        React.createElement(Text, null, message)
      );
    },
  };
});

describe('QuestRewardOverlay', () => {
  beforeEach(() => {
    mockCompleteReward = undefined;
  });

  it('renders nothing while the overlay is disabled', () => {
    mockUseQuests.mockReturnValue({
      pendingQuestRewards: [
        { questId: 'quest', rewards: { nexusCoins: 10 } },
      ],
      clearPendingQuestRewards: jest.fn(),
      questRewardOverlayEnabled: false,
    });

    const { toJSON } = render(<QuestRewardOverlay />);

    expect(toJSON()).toBeNull();
  });

  it('plays aggregated rewards in order and clears them at the end', async () => {
    const clearPendingQuestRewards = jest.fn();
    mockUseQuests.mockReturnValue({
      pendingQuestRewards: [
        {
          questId: 'coins',
          rewards: { nexusCoins: 25 },
        },
        {
          questId: 'badge',
          rewards: { badges: ['beta_tester'] },
        },
      ],
      clearPendingQuestRewards,
      questRewardOverlayEnabled: true,
    });

    render(<QuestRewardOverlay />);

    expect(
      await screen.findByText('redeem.reward.coins:25')
    ).toBeTruthy();

    act(() => {
      mockCompleteReward?.();
    });
    expect(
      await screen.findByText('redeem.reward.badge:badge.name.beta_tester')
    ).toBeTruthy();

    act(() => {
      mockCompleteReward?.();
    });
    await waitFor(() => {
      expect(clearPendingQuestRewards).toHaveBeenCalledTimes(1);
    });
  });

  it('clears pending entries that contain no displayable reward', async () => {
    const clearPendingQuestRewards = jest.fn();
    mockUseQuests.mockReturnValue({
      pendingQuestRewards: [
        {
          questId: 'empty',
          rewards: {},
        },
      ],
      clearPendingQuestRewards,
      questRewardOverlayEnabled: true,
    });

    const { toJSON } = render(<QuestRewardOverlay />);

    await waitFor(() => {
      expect(clearPendingQuestRewards).toHaveBeenCalledTimes(1);
    });
    expect(toJSON()).toBeNull();
  });
});
