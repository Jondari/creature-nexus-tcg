import { Deck } from '@/modules/card/Deck';
import { TurnManager } from '@/modules/turn';
import {
  makeCard,
  makeDeckCards,
  makeGameState,
  makePlayer,
  makeSpellCard,
  resetGameFactorySequence,
} from '@/test/factories/game';

describe('TurnManager', () => {
  beforeEach(() => {
    resetGameFactorySequence();
  });

  it('starts a turn by adding energy, drawing and resetting attacks', () => {
    const player = makePlayer({ field: [makeCard()] });
    const opponent = makePlayer({ isAI: true, field: [makeCard()] });
    const state = makeGameState({
      players: [player, opponent],
      turnNumber: 1,
      phase: 'draw',
      attackedThisTurn: new Set(['old-card']),
    });
    const decks: [Deck, Deck] = [
      new Deck(makeDeckCards(3, 'player')),
      new Deck(makeDeckCards(3, 'opponent')),
    ];

    const updated = TurnManager.startTurn(state, decks);

    expect(updated.turnNumber).toBe(2);
    expect(updated.phase).toBe('main');
    expect(updated.players[0].energy).toBe(1);
    expect(updated.players[0].hand).toHaveLength(1);
    expect(updated.attackedThisTurn.size).toBe(0);
  });

  it('uses the current turn number as energy gain with an energy booster', () => {
    const player = makePlayer({
      energy: 2,
      hasEnergyBooster: true,
      field: [makeCard()],
    });
    const opponent = makePlayer({ isAI: true, field: [makeCard()] });
    const state = makeGameState({
      players: [player, opponent],
      turnNumber: 4,
      phase: 'draw',
    });
    const decks: [Deck, Deck] = [
      new Deck(makeDeckCards(3, 'player')),
      new Deck(makeDeckCards(3, 'opponent')),
    ];

    const updated = TurnManager.startTurn(state, decks);

    expect(updated.players[0].energy).toBe(6);
    expect(updated.turnNumber).toBe(5);
  });

  it('prevents the first player from attacking on turn one', () => {
    const player = makePlayer({ field: [makeCard()] });
    const state = makeGameState({
      players: [player, makePlayer({ isAI: true, field: [makeCard()] })],
      turnNumber: 1,
    });

    expect(
      TurnManager.canPerformAction(state, {
        type: 'ATTACK',
        playerId: player.id,
        cardId: player.field[0].id,
        targetCardId: state.players[1].field[0].id,
        attackName: player.field[0].attacks[0].name,
      })
    ).toBe(false);
  });

  it('rejects actions submitted for the inactive player', () => {
    const state = makeGameState();

    expect(
      TurnManager.canPerformAction(state, {
        type: 'END_TURN',
        playerId: state.players[1].id,
      })
    ).toBe(false);
  });

  it('allows an affordable spell and rejects an unaffordable one', () => {
    const spell = makeSpellCard({ energyCost: 2 });
    const player = makePlayer({ hand: [spell], energy: 2 });
    const state = makeGameState({
      players: [player, makePlayer({ isAI: true })],
    });

    expect(
      TurnManager.canPerformAction(state, {
        type: 'CAST_SPELL',
        playerId: player.id,
        cardId: spell.id,
      })
    ).toBe(true);

    const poorState = makeGameState({
      players: [{ ...player, energy: 1 }, makePlayer({ isAI: true })],
    });
    expect(
      TurnManager.canPerformAction(poorState, {
        type: 'CAST_SPELL',
        playerId: player.id,
        cardId: spell.id,
      })
    ).toBe(false);
  });

  it('ends the game when the configured points target is reached', () => {
    const winner = makePlayer({ points: 2, field: [makeCard()] });
    const loser = makePlayer({ isAI: true, field: [makeCard()] });
    const state = makeGameState({
      players: [winner, loser],
      config: { pointsToWin: 2 },
    });

    const updated = TurnManager.checkWinConditions(state, [
      new Deck(makeDeckCards(2, 'winner')),
      new Deck(makeDeckCards(2, 'loser')),
    ]);

    expect(updated.isGameOver).toBe(true);
    expect(updated.winner).toBe(winner.id);
    expect(updated.winReason).toBe('points');
  });

  it('detects deck-out and field-wipe losses', () => {
    const player = makePlayer({ field: [makeCard()] });
    const opponent = makePlayer({ isAI: true, field: [makeCard()] });
    const deckOutState = TurnManager.checkWinConditions(
      makeGameState({ players: [player, opponent], turnNumber: 2 }),
      [new Deck([]), new Deck(makeDeckCards(2, 'opponent'))]
    );

    expect(deckOutState.winner).toBe(opponent.id);
    expect(deckOutState.winReason).toBe('deckout');

    const fieldWipeState = TurnManager.checkWinConditions(
      makeGameState({
        players: [{ ...player, field: [] }, opponent],
        turnNumber: 3,
      }),
      [
        new Deck(makeDeckCards(2, 'player')),
        new Deck(makeDeckCards(2, 'opponent-2')),
      ]
    );

    expect(fieldWipeState.winner).toBe(opponent.id);
    expect(fieldWipeState.winReason).toBe('fieldwipe');
  });
});
