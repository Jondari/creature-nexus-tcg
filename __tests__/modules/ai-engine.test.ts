import { AIEngine } from '@/modules/ai';
import {
  makeAttack,
  makeCard,
  makeGameState,
  makePlayer,
  makeSpellCard,
  resetGameFactorySequence,
} from '@/test/factories/game';

describe('AIEngine', () => {
  beforeEach(() => {
    resetGameFactorySequence();
  });

  it('ends the turn when no valid action is available', () => {
    const ai = makePlayer({ id: 'ai', isAI: true });
    const opponent = makePlayer({ id: 'human' });
    const decision = AIEngine.makeDecision(
      makeGameState({ players: [ai, opponent], currentPlayerIndex: 0 })
    );

    expect(decision.action).toEqual({
      type: 'END_TURN',
      playerId: 'ai',
    });
  });

  it('prioritizes a lethal attack', () => {
    const attack = makeAttack({ name: 'Lethal', damage: 40, energy: 1 });
    const attacker = makeCard({ id: 'attacker', attacks: [attack] });
    const target = makeCard({ id: 'target', hp: 20, element: 'earth' });
    const ai = makePlayer({
      id: 'ai',
      isAI: true,
      field: [attacker],
      hand: [makeCard({ id: 'hand-card' })],
      energy: 3,
      points: 2,
    });
    const opponent = makePlayer({ id: 'human', field: [target] });

    const decision = AIEngine.makeDecision(
      makeGameState({
        players: [ai, opponent],
        turnNumber: 4,
        config: { pointsToWin: 3 },
      })
    );

    expect(decision.action.type).toBe('ATTACK');
    expect(decision.action.targetCardId).toBe(target.id);
  });

  it('casts Energy Catalyst early when it is affordable', () => {
    const catalyst = makeSpellCard({ id: 'catalyst', energyCost: 2 });
    const ai = makePlayer({
      id: 'ai',
      isAI: true,
      hand: [catalyst],
      energy: 2,
    });
    const opponent = makePlayer({ id: 'human' });

    const decision = AIEngine.makeDecision(
      makeGameState({
        players: [ai, opponent],
        turnNumber: 3,
      })
    );

    expect(decision.action).toMatchObject({
      type: 'CAST_SPELL',
      playerId: 'ai',
      cardId: catalyst.id,
    });
  });

  it('does not choose a spell that it cannot afford', () => {
    const spell = makeSpellCard({ energyCost: 5 });
    const ai = makePlayer({
      id: 'ai',
      isAI: true,
      hand: [spell],
      energy: 1,
    });
    const opponent = makePlayer({ id: 'human' });

    const decision = AIEngine.makeDecision(
      makeGameState({ players: [ai, opponent] })
    );

    expect(decision.action.type).toBe('END_TURN');
  });
});
