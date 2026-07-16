import { GameEngine } from '@/modules/game';
import {
  makeAttack,
  makeCard,
  makeDeckCards,
  makeGameState,
  makePlayer,
  resetGameFactorySequence,
} from '@/test/factories/game';

describe('GameEngine', () => {
  beforeEach(() => {
    resetGameFactorySequence();
    jest.spyOn(Math, 'random').mockReturnValue(0.999999);
  });

  function createEngine(pointsToWin = 3): GameEngine {
    return new GameEngine(
      makePlayer({ id: 'human', name: 'Human' }),
      makePlayer({ id: 'ai', name: 'AI', isAI: true }),
      makeDeckCards(12, 'human'),
      makeDeckCards(12, 'ai'),
      { pointsToWin }
    );
  }

  it('initializes the first turn with deterministic hand sizes', () => {
    const engine = createEngine();
    const state = engine.getGameState();

    expect(state.turnNumber).toBe(1);
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.players[0].hand).toHaveLength(6);
    expect(state.players[1].hand).toHaveLength(5);
    expect(state.players[0].energy).toBe(1);
  });

  it('plays a card from the active player hand', () => {
    const engine = createEngine();
    const card = engine.getCurrentPlayer().hand[0];

    expect(
      engine.executeAction({
        type: 'PLAY_CARD',
        playerId: 'human',
        cardId: card.id,
      })
    ).toBe(true);
    expect(engine.getCurrentPlayer().field).toContainEqual(card);
    expect(engine.getCurrentPlayer().hand).not.toContainEqual(card);
  });

  it('rejects an action from the inactive player', () => {
    const engine = createEngine();

    expect(
      engine.executeAction({
        type: 'END_TURN',
        playerId: 'ai',
      })
    ).toBe(false);
  });

  it('ends the turn and starts the opponent turn', () => {
    const engine = createEngine();

    expect(
      engine.executeAction({
        type: 'END_TURN',
        playerId: 'human',
      })
    ).toBe(true);

    const state = engine.getGameState();
    expect(state.currentPlayerIndex).toBe(1);
    expect(state.turnNumber).toBe(2);
    expect(state.players[1].energy).toBe(1);
    expect(state.players[1].hand).toHaveLength(6);
  });

  it('applies affinity damage to a targeted creature', () => {
    const engine = createEngine();
    const attack = makeAttack({ name: 'Flame', damage: 30, energy: 1 });
    const attacker = makeCard({
      id: 'attacker',
      element: 'fire',
      attacks: [attack],
    });
    const target = makeCard({
      id: 'target',
      element: 'air',
      hp: 100,
      maxHp: 100,
    });
    const human = makePlayer({
      id: 'human',
      field: [attacker],
      energy: 3,
    });
    const ai = makePlayer({
      id: 'ai',
      isAI: true,
      field: [target],
    });

    (engine as any).gameState = makeGameState({
      players: [human, ai],
      turnNumber: 2,
    });

    expect(
      engine.executeAction({
        type: 'ATTACK',
        playerId: 'human',
        cardId: attacker.id,
        targetCardId: target.id,
        attackName: attack.name,
      })
    ).toBe(true);
    expect(engine.getPlayers()[1].field[0].hp).toBe(50);
  });

  it('awards a point and ends the game after a lethal attack', () => {
    const engine = createEngine(1);
    const attack = makeAttack({ name: 'Finisher', damage: 30, energy: 1 });
    const attacker = makeCard({ id: 'attacker', attacks: [attack] });
    const target = makeCard({ id: 'target', element: 'earth', hp: 20 });
    const human = makePlayer({
      id: 'human',
      field: [attacker],
      energy: 2,
    });
    const ai = makePlayer({
      id: 'ai',
      isAI: true,
      field: [target],
    });

    (engine as any).gameState = makeGameState({
      players: [human, ai],
      turnNumber: 2,
      config: { pointsToWin: 1 },
    });

    expect(
      engine.executeAction({
        type: 'ATTACK',
        playerId: 'human',
        cardId: attacker.id,
        targetCardId: target.id,
        attackName: attack.name,
      })
    ).toBe(true);
    expect(engine.isGameOver()).toBe(true);
    expect(engine.getWinner()).toBe('human');
    expect(engine.getPlayers()[0].points).toBe(1);
  });

  it('rejects direct attacks without a target', () => {
    const engine = createEngine();
    const attacker = makeCard({ id: 'attacker' });
    const human = makePlayer({
      id: 'human',
      field: [attacker],
      energy: 2,
    });
    const ai = makePlayer({ id: 'ai', isAI: true, field: [] });

    (engine as any).gameState = makeGameState({
      players: [human, ai],
      turnNumber: 2,
    });

    expect(
      engine.executeAction({
        type: 'ATTACK',
        playerId: 'human',
        cardId: attacker.id,
        attackName: attacker.attacks[0].name,
      })
    ).toBe(false);
  });
});
