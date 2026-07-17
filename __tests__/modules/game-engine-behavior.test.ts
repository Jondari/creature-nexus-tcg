import { GameEngine } from '@/modules/game';
import type { GameAction, GameState } from '@/types/game';
import {
  makeAttack,
  makeCard,
  makeDeckCards,
  makeGameState,
  makePlayer,
  makeSpellCard,
  resetGameFactorySequence,
} from '@/test/factories/game';

describe('GameEngine behavior contracts', () => {
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

  function setGameState(engine: GameEngine, state: GameState): void {
    Object.assign(engine, { gameState: state });
  }

  it('rejects playing a card that is absent from the hand', () => {
    const engine = createEngine();
    const human = makePlayer({
      id: 'human',
      hand: [makeCard({ id: 'available-card' })],
    });
    const ai = makePlayer({ id: 'ai', isAI: true });

    setGameState(
      engine,
      makeGameState({ players: [human, ai], turnNumber: 2 })
    );

    const before = engine.getGameState();

    expect(
      engine.executeAction({
        type: 'PLAY_CARD',
        playerId: human.id,
        cardId: 'missing-card',
      })
    ).toBe(false);
    expect(engine.getGameState()).toEqual(before);
  });

  it('allows playing a creature with zero energy because creature play is free', () => {
    const engine = createEngine();
    const card = makeCard({ id: 'free-creature' });
    const human = makePlayer({
      id: 'human',
      hand: [card],
      energy: 0,
    });
    const ai = makePlayer({ id: 'ai', isAI: true });

    setGameState(
      engine,
      makeGameState({ players: [human, ai], turnNumber: 2 })
    );

    expect(
      engine.executeAction({
        type: 'PLAY_CARD',
        playerId: human.id,
        cardId: card.id,
      })
    ).toBe(true);
    expect(engine.getCurrentPlayer().field).toEqual([card]);
    expect(engine.getCurrentPlayer().hand).toEqual([]);
    expect(engine.getCurrentPlayer().energy).toBe(0);
  });

  it('rejects an attack without enough energy and preserves the state', () => {
    const engine = createEngine();
    const attack = makeAttack({ name: 'Expensive', damage: 30, energy: 2 });
    const attacker = makeCard({ id: 'attacker', attacks: [attack] });
    const target = makeCard({ id: 'target', element: 'earth' });
    const human = makePlayer({
      id: 'human',
      field: [attacker],
      energy: 1,
    });
    const ai = makePlayer({
      id: 'ai',
      isAI: true,
      field: [target],
    });

    setGameState(
      engine,
      makeGameState({ players: [human, ai], turnNumber: 2 })
    );

    const before = engine.getGameState();

    expect(
      engine.executeAction({
        type: 'ATTACK',
        playerId: human.id,
        cardId: attacker.id,
        targetCardId: target.id,
        attackName: attack.name,
      })
    ).toBe(false);
    expect(engine.getGameState()).toEqual(before);
  });

  it('spends attack energy once and rejects a second attack by the same card', () => {
    const engine = createEngine();
    const attack = makeAttack({ name: 'Strike', damage: 30, energy: 2 });
    const attacker = makeCard({ id: 'attacker', attacks: [attack] });
    const reserve = makeCard({ id: 'reserve' });
    const target = makeCard({
      id: 'target',
      element: 'earth',
      hp: 100,
      maxHp: 100,
    });
    const human = makePlayer({
      id: 'human',
      field: [attacker, reserve],
      energy: 4,
    });
    const ai = makePlayer({
      id: 'ai',
      isAI: true,
      field: [target],
    });
    const action: GameAction = {
      type: 'ATTACK',
      playerId: human.id,
      cardId: attacker.id,
      targetCardId: target.id,
      attackName: attack.name,
    };

    setGameState(
      engine,
      makeGameState({ players: [human, ai], turnNumber: 2 })
    );

    expect(engine.executeAction(action)).toBe(true);
    expect(engine.getCurrentPlayer().energy).toBe(2);
    expect(engine.getPlayers()[1].field[0].hp).toBe(70);

    expect(engine.executeAction(action)).toBe(false);
    expect(engine.getCurrentPlayer().energy).toBe(2);
    expect(engine.getPlayers()[1].field[0].hp).toBe(70);
    expect(engine.getCurrentPlayer().points).toBe(0);
    expect(engine.getGameState().attackedThisTurn).toEqual(
      new Set([attacker.id])
    );
  });

  it('removes a defeated creature and awards exactly one point', () => {
    const engine = createEngine(3);
    const attack = makeAttack({ name: 'Finisher', damage: 30, energy: 1 });
    const attacker = makeCard({ id: 'attacker', attacks: [attack] });
    const reserve = makeCard({ id: 'reserve' });
    const target = makeCard({
      id: 'target',
      element: 'earth',
      hp: 20,
      maxHp: 20,
    });
    const human = makePlayer({
      id: 'human',
      field: [attacker, reserve],
      energy: 3,
      points: 1,
    });
    const ai = makePlayer({
      id: 'ai',
      isAI: true,
      field: [target],
    });
    const action: GameAction = {
      type: 'ATTACK',
      playerId: human.id,
      cardId: attacker.id,
      targetCardId: target.id,
      attackName: attack.name,
    };

    setGameState(
      engine,
      makeGameState({ players: [human, ai], turnNumber: 2 })
    );

    expect(engine.executeAction(action)).toBe(true);
    expect(engine.getPlayers()[1].field).toEqual([]);
    expect(engine.getPlayers()[0].points).toBe(2);

    expect(engine.executeAction(action)).toBe(false);
    expect(engine.getPlayers()[0].points).toBe(2);
  });

  it('automatically ends the turn when no legal attack remains', () => {
    const engine = createEngine();
    const attack = makeAttack({ name: 'Last attack', energy: 1 });
    const attacker = makeCard({ id: 'attacker', attacks: [attack] });
    const target = makeCard({
      id: 'target',
      element: 'earth',
      hp: 100,
    });
    const human = makePlayer({
      id: 'human',
      field: [attacker],
      energy: 1,
    });
    const ai = makePlayer({
      id: 'ai',
      isAI: true,
      field: [target],
      hand: [],
      energy: 0,
    });

    setGameState(
      engine,
      makeGameState({ players: [human, ai], turnNumber: 2 })
    );

    expect(
      engine.executeAction({
        type: 'ATTACK',
        playerId: human.id,
        cardId: attacker.id,
        targetCardId: target.id,
        attackName: attack.name,
      })
    ).toBe(true);

    const state = engine.getGameState();

    expect(state.currentPlayerIndex).toBe(1);
    expect(state.turnNumber).toBe(3);
    expect(state.players[0].energy).toBe(0);
    expect(state.players[1].energy).toBe(1);
    expect(state.players[1].hand).toHaveLength(1);
    expect(state.attackedThisTurn.size).toBe(0);
  });

  it('does not automatically end the turn while another legal attack exists', () => {
    const engine = createEngine();
    const attack = makeAttack({ name: 'First attack', energy: 1 });
    const attacker = makeCard({ id: 'attacker', attacks: [attack] });
    const reserve = makeCard({ id: 'reserve' });
    const target = makeCard({
      id: 'target',
      element: 'earth',
      hp: 100,
    });
    const human = makePlayer({
      id: 'human',
      field: [attacker, reserve],
      energy: 2,
    });
    const ai = makePlayer({
      id: 'ai',
      isAI: true,
      field: [target],
    });

    setGameState(
      engine,
      makeGameState({ players: [human, ai], turnNumber: 2 })
    );

    expect(
      engine.executeAction({
        type: 'ATTACK',
        playerId: human.id,
        cardId: attacker.id,
        targetCardId: target.id,
        attackName: attack.name,
      })
    ).toBe(true);

    const state = engine.getGameState();

    expect(state.currentPlayerIndex).toBe(0);
    expect(state.turnNumber).toBe(2);
    expect(state.players[0].energy).toBe(1);
    expect(state.attackedThisTurn).toEqual(new Set([attacker.id]));
  });

  it('casts Energy Catalyst through the engine exactly once', () => {
    const engine = createEngine();
    const catalyst = makeSpellCard({
      id: 'energy-catalyst',
      energyCost: 2,
    });
    const remainingCard = makeCard({ id: 'remaining-card' });
    const human = makePlayer({
      id: 'human',
      hand: [catalyst, remainingCard],
      energy: 3,
    });
    const ai = makePlayer({ id: 'ai', isAI: true });
    const action: GameAction = {
      type: 'CAST_SPELL',
      playerId: human.id,
      cardId: catalyst.id,
    };

    setGameState(
      engine,
      makeGameState({ players: [human, ai], turnNumber: 2 })
    );

    expect(engine.executeAction(action)).toBe(true);
    expect(engine.getCurrentPlayer().energy).toBe(1);
    expect(engine.getCurrentPlayer().hasEnergyBooster).toBe(true);
    expect(engine.getCurrentPlayer().hand).toEqual([remainingCard]);

    const afterFirstCast = engine.getGameState();

    expect(engine.executeAction(action)).toBe(false);
    expect(engine.getGameState()).toEqual(afterFirstCast);
  });

  it('does not stack the Energy Catalyst gain after casting two copies', () => {
    const engine = createEngine();
    const firstCatalyst = makeSpellCard({
      id: 'energy-catalyst-1',
      energyCost: 2,
    });
    const secondCatalyst = makeSpellCard({
      id: 'energy-catalyst-2',
      energyCost: 2,
    });
    const human = makePlayer({
      id: 'human',
      hand: [firstCatalyst, secondCatalyst],
      field: [makeCard({ id: 'human-creature' })],
      energy: 5,
    });
    const ai = makePlayer({
      id: 'ai',
      isAI: true,
      field: [makeCard({ id: 'ai-creature' })],
    });

    setGameState(
      engine,
      makeGameState({ players: [human, ai], turnNumber: 4 })
    );

    expect(
      engine.executeAction({
        type: 'CAST_SPELL',
        playerId: human.id,
        cardId: firstCatalyst.id,
      })
    ).toBe(true);
    expect(
      engine.executeAction({
        type: 'CAST_SPELL',
        playerId: human.id,
        cardId: secondCatalyst.id,
      })
    ).toBe(true);

    expect(engine.getCurrentPlayer().energy).toBe(1);
    expect(engine.getCurrentPlayer().hasEnergyBooster).toBe(true);

    expect(
      engine.executeAction({ type: 'END_TURN', playerId: human.id })
    ).toBe(true);
    expect(
      engine.executeAction({ type: 'END_TURN', playerId: ai.id })
    ).toBe(true);

    expect(engine.getCurrentPlayer().id).toBe(human.id);
    expect(engine.getCurrentPlayer().energy).toBe(6);
  });

  it('spends retirement energy once and moves the card back to the hand', () => {
    const engine = createEngine();
    const card = makeCard({ id: 'retired-card' });
    const human = makePlayer({
      id: 'human',
      field: [card],
      energy: 2,
    });
    const ai = makePlayer({ id: 'ai', isAI: true });
    const action: GameAction = {
      type: 'RETIRE_CARD',
      playerId: human.id,
      cardId: card.id,
    };

    setGameState(
      engine,
      makeGameState({ players: [human, ai], turnNumber: 2 })
    );

    expect(engine.executeAction(action)).toBe(true);
    expect(engine.getCurrentPlayer().energy).toBe(1);
    expect(engine.getCurrentPlayer().field).toEqual([]);
    expect(engine.getCurrentPlayer().hand).toEqual([card]);

    const afterRetirement = engine.getGameState();

    expect(engine.executeAction(action)).toBe(false);
    expect(engine.getGameState()).toEqual(afterRetirement);
  });

  it('rejects playing a fifth creature through the complete engine', () => {
    const engine = createEngine();
    const card = makeCard({ id: 'fifth-card' });
    const human = makePlayer({
      id: 'human',
      hand: [card],
      field: [
        makeCard(),
        makeCard(),
        makeCard(),
        makeCard(),
      ],
    });
    const ai = makePlayer({ id: 'ai', isAI: true });

    setGameState(
      engine,
      makeGameState({ players: [human, ai], turnNumber: 2 })
    );

    const before = engine.getGameState();

    expect(
      engine.executeAction({
        type: 'PLAY_CARD',
        playerId: human.id,
        cardId: card.id,
      })
    ).toBe(false);
    expect(engine.getGameState()).toEqual(before);
  });

  it('rejects malformed attacks without mutating the state', () => {
    const engine = createEngine();
    const attack = makeAttack({ name: 'Valid attack', energy: 1 });
    const attacker = makeCard({ id: 'attacker', attacks: [attack] });
    const target = makeCard({ id: 'target', element: 'earth' });
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
    const invalidActions: GameAction[] = [
      {
        type: 'ATTACK',
        playerId: human.id,
        cardId: 'missing-attacker',
        targetCardId: target.id,
        attackName: attack.name,
      },
      {
        type: 'ATTACK',
        playerId: human.id,
        cardId: attacker.id,
        targetCardId: 'missing-target',
        attackName: attack.name,
      },
      {
        type: 'ATTACK',
        playerId: human.id,
        cardId: attacker.id,
        targetCardId: target.id,
        attackName: 'missing-attack',
      },
    ];

    setGameState(
      engine,
      makeGameState({ players: [human, ai], turnNumber: 2 })
    );

    for (const action of invalidActions) {
      const before = engine.getGameState();

      expect(engine.executeAction(action)).toBe(false);
      expect(engine.getGameState()).toEqual(before);
    }
  });

  it('enforces the mythic attack cooldown through the complete engine', () => {
    const engine = createEngine();
    const attack = makeAttack({ name: 'Mythic attack', energy: 1 });
    const mythic = makeCard({
      id: 'mythic',
      isMythic: true,
      lastAttackTurn: 3,
      attacks: [attack],
    });
    const target = makeCard({
      id: 'target',
      element: 'earth',
      hp: 100,
    });
    const human = makePlayer({
      id: 'human',
      field: [mythic],
      energy: 3,
    });
    const ai = makePlayer({
      id: 'ai',
      isAI: true,
      field: [target],
    });
    const action: GameAction = {
      type: 'ATTACK',
      playerId: human.id,
      cardId: mythic.id,
      targetCardId: target.id,
      attackName: attack.name,
    };

    setGameState(
      engine,
      makeGameState({ players: [human, ai], turnNumber: 6 })
    );

    const beforeCooldownExpires = engine.getGameState();

    expect(engine.executeAction(action)).toBe(false);
    expect(engine.getGameState()).toEqual(beforeCooldownExpires);

    setGameState(
      engine,
      makeGameState({ players: [human, ai], turnNumber: 7 })
    );

    expect(engine.executeAction(action)).toBe(true);
    expect(engine.getPlayers()[1].field[0].hp).toBe(70);
  });

  it('reports the human energy gain once with the correct amount', () => {
    const engine = createEngine();
    const onEnergyGain = jest.fn();
    const human = makePlayer({
      id: 'human',
      field: [makeCard({ id: 'human-creature' })],
      energy: 1,
      hasEnergyBooster: true,
    });
    const ai = makePlayer({
      id: 'ai',
      isAI: true,
      field: [makeCard({ id: 'ai-creature' })],
    });

    setGameState(
      engine,
      makeGameState({
        players: [human, ai],
        currentPlayerIndex: 1,
        turnNumber: 4,
      })
    );
    engine.setOnPlayerEnergyGain(onEnergyGain);

    expect(
      engine.executeAction({
        type: 'END_TURN',
        playerId: ai.id,
      })
    ).toBe(true);

    expect(onEnergyGain).toHaveBeenCalledTimes(1);
    expect(onEnergyGain).toHaveBeenCalledWith(human.id, 4);
    expect(engine.getCurrentPlayer().energy).toBe(5);
  });

  // Known defect: GameEngine currently accepts actions after the game is over.
  // Remove `.failing` once actions are rejected without mutating the game state.
  it.failing('rejects every action after the game is over', () => {
    const engine = createEngine();
    const card = makeCard({ id: 'late-card' });
    const human = makePlayer({
      id: 'human',
      hand: [card],
      field: [makeCard({ id: 'human-creature' })],
    });
    const ai = makePlayer({
      id: 'ai',
      isAI: true,
      field: [makeCard({ id: 'ai-creature' })],
    });

    setGameState(
      engine,
      makeGameState({
        players: [human, ai],
        isGameOver: true,
        winner: ai.id,
        winReason: 'points',
      })
    );

    const before = engine.getGameState();

    expect(
      engine.executeAction({
        type: 'PLAY_CARD',
        playerId: human.id,
        cardId: card.id,
      })
    ).toBe(false);
    expect(engine.getGameState()).toEqual(before);
  });
});
