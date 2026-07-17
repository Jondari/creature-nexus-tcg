import { Deck } from '@/modules/card/Deck';
import { TurnManager } from '@/modules/turn';
import {
  makeCard,
  makeDeckCards,
  makeGameState,
  makePlayer,
  resetGameFactorySequence,
} from '@/test/factories/game';

describe('TurnManager boundary behavior', () => {
  beforeEach(() => {
    resetGameFactorySequence();
  });

  it('currently declares deck-out immediately after drawing the final card', () => {
    const finalCard = makeCard({ id: 'final-card' });
    const player = makePlayer({
      id: 'player',
      field: [makeCard({ id: 'player-creature' })],
    });
    const opponent = makePlayer({
      id: 'opponent',
      isAI: true,
      field: [makeCard({ id: 'opponent-creature' })],
    });
    const decks: [Deck, Deck] = [
      new Deck([finalCard]),
      new Deck(makeDeckCards(2, 'opponent')),
    ];

    const updated = TurnManager.startTurn(
      makeGameState({
        players: [player, opponent],
        turnNumber: 2,
      }),
      decks
    );

    expect(updated.players[0].hand).toEqual([finalCard]);
    expect(decks[0].isEmpty()).toBe(true);
    expect(updated.isGameOver).toBe(true);
    expect(updated.winner).toBe(opponent.id);
    expect(updated.winReason).toBe('deckout');
  });

  it('only applies the field-wipe loss after turn two', () => {
    const player = makePlayer({ id: 'player', field: [] });
    const opponent = makePlayer({
      id: 'opponent',
      isAI: true,
      field: [makeCard()],
    });

    const turnTwo = TurnManager.checkWinConditions(
      makeGameState({
        players: [player, opponent],
        turnNumber: 2,
      }),
      [
        new Deck(makeDeckCards(2, 'player-turn-two')),
        new Deck(makeDeckCards(2, 'opponent-turn-two')),
      ]
    );

    expect(turnTwo.isGameOver).toBe(false);
    expect(turnTwo.winner).toBeUndefined();

    const turnThree = TurnManager.checkWinConditions(
      makeGameState({
        players: [player, opponent],
        turnNumber: 3,
      }),
      [
        new Deck(makeDeckCards(2, 'player-turn-three')),
        new Deck(makeDeckCards(2, 'opponent-turn-three')),
      ]
    );

    expect(turnThree.isGameOver).toBe(true);
    expect(turnThree.winner).toBe(opponent.id);
    expect(turnThree.winReason).toBe('fieldwipe');
  });

  it('prioritizes a points victory over simultaneous loss conditions', () => {
    const winner = makePlayer({
      id: 'winner',
      points: 3,
      field: [],
    });
    const opponent = makePlayer({
      id: 'opponent',
      isAI: true,
      field: [makeCard()],
    });

    const updated = TurnManager.checkWinConditions(
      makeGameState({
        players: [winner, opponent],
        turnNumber: 3,
        config: { pointsToWin: 3 },
      }),
      [
        new Deck([]),
        new Deck(makeDeckCards(2, 'opponent')),
      ]
    );

    expect(updated.isGameOver).toBe(true);
    expect(updated.winner).toBe(winner.id);
    expect(updated.winReason).toBe('points');
  });
});
