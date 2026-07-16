import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { CardActionButtons } from '@/components/CardActionButtons';
import {
  makeCard,
  makeSpellCard,
  resetGameFactorySequence,
} from '@/test/factories/game';

jest.mock('@/utils/i18n', () => ({
  t: (key: string) => key,
}));

describe('CardActionButtons', () => {
  beforeEach(() => {
    resetGameFactorySequence();
  });

  it('renders nothing when it is hidden', () => {
    const { toJSON } = render(<CardActionButtons visible={false} />);

    expect(toJSON()).toBeNull();
  });

  it('renders play and retire actions and invokes their callbacks', () => {
    const onPlay = jest.fn();
    const onRetire = jest.fn();

    render(
      <CardActionButtons
        visible
        showPlay
        showRetire
        card={makeCard()}
        onPlay={onPlay}
        onRetire={onRetire}
      />
    );

    fireEvent.press(screen.getByText('actions.play'));
    fireEvent.press(screen.getByText('actions.retire'));

    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onRetire).toHaveBeenCalledTimes(1);
  });

  it('uses the cast action for spell cards', () => {
    render(
      <CardActionButtons
        visible
        showPlay
        card={makeSpellCard()}
      />
    );

    expect(screen.getByText('actions.cast')).toBeTruthy();
    expect(screen.queryByText('actions.play')).toBeNull();
  });
});
