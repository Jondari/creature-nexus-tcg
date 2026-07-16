import type { SpellCardData } from '@/models/cards-extended';
import type {
  Attack,
  Card,
  GameConfig,
  GameState,
  Player,
} from '@/types/game';
import { DEFAULT_GAME_CONFIG } from '@/types/game';

let sequence = 0;

export function resetGameFactorySequence(): void {
  sequence = 0;
}

export function makeAttack(overrides: Partial<Attack> = {}): Attack {
  sequence += 1;
  return {
    name: `attack-${sequence}`,
    damage: 30,
    energy: 1,
    ...overrides,
  };
}

export function makeCard(overrides: Partial<Card> = {}): Card {
  sequence += 1;
  const hp = overrides.hp ?? 100;

  return {
    id: `card-${sequence}`,
    name: `Card ${sequence}`,
    element: 'fire',
    rarity: 'common',
    hp,
    maxHp: overrides.maxHp ?? hp,
    attacks: [makeAttack()],
    ...overrides,
  };
}

export type TestSpellCard = Card & SpellCardData & { type: 'spell' };

export function makeSpellCard(
  overrides: Partial<TestSpellCard> = {}
): TestSpellCard {
  sequence += 1;

  return {
    id: `spell-${sequence}`,
    name: 'Energy Catalyst',
    type: 'spell',
    element: 'all',
    rarity: 'rare',
    hp: 0,
    maxHp: 0,
    attacks: [],
    effect: 'Increase energy gained each turn.',
    energyCost: 2,
    spellType: 'permanent',
    targetType: 'self',
    ...overrides,
  };
}

export function makePlayer(overrides: Partial<Player> = {}): Player {
  sequence += 1;

  return {
    id: `player-${sequence}`,
    name: `Player ${sequence}`,
    deck: [],
    hand: [],
    field: [],
    energy: 0,
    points: 0,
    isAI: false,
    hasEnergyBooster: false,
    ...overrides,
  };
}

export function makeGameState(
  overrides: Partial<GameState> & {
    players?: [Player, Player];
    config?: Partial<GameConfig>;
  } = {}
): GameState {
  const { players: playerOverrides, config: configOverrides, ...stateOverrides } = overrides;
  const players: [Player, Player] =
    playerOverrides ??
    [makePlayer({ id: 'player-1' }), makePlayer({ id: 'player-2', isAI: true })];

  return {
    currentPlayerIndex: 0,
    turnNumber: 1,
    phase: 'main',
    isGameOver: false,
    attackedThisTurn: new Set<string>(),
    ...stateOverrides,
    players,
    config: {
      ...DEFAULT_GAME_CONFIG,
      ...configOverrides,
    },
  };
}

export function makeDeckCards(count = 12, prefix = 'deck'): Card[] {
  return Array.from({ length: count }, (_, index) =>
    makeCard({
      id: `${prefix}-${index + 1}`,
      name: `${prefix} card ${index + 1}`,
    })
  );
}
