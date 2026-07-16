import React from 'react';
import { render, screen } from '@testing-library/react-native';
import CountdownTimer from '@/components/CountdownTimer';

jest.mock('@/utils/i18n', () => ({
  t: (key: string) => key,
}));

describe('CountdownTimer', () => {
  it('updates the displayed time and completes once when reaching zero', () => {
    const onComplete = jest.fn();
    const { rerender } = render(
      <CountdownTimer timeRemaining={2000} onComplete={onComplete} />
    );

    expect(screen.getByText('00:00:02')).toBeTruthy();

    rerender(<CountdownTimer timeRemaining={1000} onComplete={onComplete} />);
    expect(screen.getByText('00:00:01')).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();

    rerender(<CountdownTimer timeRemaining={0} onComplete={onComplete} />);
    expect(screen.getByText('00:00:00')).toBeTruthy();
    expect(onComplete).toHaveBeenCalledTimes(1);

    rerender(<CountdownTimer timeRemaining={0} onComplete={onComplete} />);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('completes immediately when initialized at zero', () => {
    const onComplete = jest.fn();
    render(<CountdownTimer timeRemaining={0} onComplete={onComplete} />);

    expect(screen.getByText('home.nextPack.ready')).toBeTruthy();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
