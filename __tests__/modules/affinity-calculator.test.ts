import { AffinityCalculator } from '@/modules/affinity';

describe('AffinityCalculator', () => {
  it.each([
    ['fire', 'air', 20],
    ['water', 'fire', 20],
    ['air', 'earth', 20],
    ['earth', 'water', 20],
    ['fire', 'water', -20],
    ['water', 'earth', -20],
    ['air', 'fire', -20],
    ['earth', 'air', -20],
    ['all', 'fire', 0],
  ] as const)(
    'returns the expected modifier for %s against %s',
    (attacker, defender, expectedModifier) => {
      expect(
        AffinityCalculator.calculateDamageModifier(attacker, defender)
      ).toBe(expectedModifier);
    }
  );

  it('applies affinity bonuses to base damage', () => {
    expect(AffinityCalculator.calculateFinalDamage(30, 'fire', 'air')).toBe(50);
  });

  it('never returns negative damage', () => {
    expect(AffinityCalculator.calculateFinalDamage(10, 'water', 'earth')).toBe(0);
  });

  it('reports advantage and disadvantage consistently', () => {
    expect(AffinityCalculator.hasAdvantage('fire', 'air')).toBe(true);
    expect(AffinityCalculator.hasDisadvantage('fire', 'water')).toBe(true);
    expect(AffinityCalculator.hasAdvantage('all', 'fire')).toBe(false);
  });
});
