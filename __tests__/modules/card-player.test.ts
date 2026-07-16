import { CardUtils } from '@/modules/card';
import { Deck } from '@/modules/card/Deck';
import { PlayerUtils } from '@/modules/player';
import {
  makeCard,
  makePlayer,
  makeSpellCard,
  resetGameFactorySequence,
} from '@/test/factories/game';

describe('CardUtils and PlayerUtils', () => {
  beforeEach(() => {
    resetGameFactorySequence();
  });

  it('moves a card from hand to field', () => {
    const card = makeCard();
    const player = makePlayer({ hand: [card] });

    const updated = PlayerUtils.playCard(player, card.id);

    expect(updated.hand).toEqual([]);
    expect(updated.field).toEqual([card]);
    expect(player.hand).toEqual([card]);
  });

  it('does not play a fifth card onto a full field', () => {
    const card = makeCard();
    const player = makePlayer({
      hand: [card],
      field: [makeCard(), makeCard(), makeCard(), makeCard()],
    });

    expect(PlayerUtils.playCard(player, card.id)).toBe(player);
  });

  it('retires a field card for one energy', () => {
    const card = makeCard();
    const player = makePlayer({ field: [card], energy: 2 });

    const updated = PlayerUtils.retireCard(player, card.id);

    expect(updated.field).toEqual([]);
    expect(updated.hand).toEqual([card]);
    expect(updated.energy).toBe(1);
  });

  it('does not retire a card without enough energy', () => {
    const card = makeCard();
    const player = makePlayer({ field: [card], energy: 0 });

    expect(PlayerUtils.retireCard(player, card.id)).toBe(player);
  });

  it('draws the top card from a deck without mutating the player', () => {
    const card = makeCard();
    const deck = new Deck([card]);
    const player = makePlayer();

    const updated = PlayerUtils.drawCard(player, deck);

    expect(updated.hand).toEqual([card]);
    expect(player.hand).toEqual([]);
    expect(deck.isEmpty()).toBe(true);
  });

  it('activates Energy Catalyst and spends its energy cost', () => {
    const spell = makeSpellCard({ energyCost: 2 });
    const player = makePlayer({ energy: 3 });

    const updated = PlayerUtils.castSpell(player, spell);

    expect(updated.energy).toBe(1);
    expect(updated.hasEnergyBooster).toBe(true);
  });

  it('prevents casting a spell without enough energy', () => {
    const spell = makeSpellCard({ energyCost: 3 });
    const player = makePlayer({ energy: 2 });

    expect(PlayerUtils.castSpell(player, spell)).toBe(player);
  });

  it('clamps damage at zero HP and healing at max HP', () => {
    const card = makeCard({ hp: 40, maxHp: 50 });

    expect(CardUtils.takeDamage(card, 100).hp).toBe(0);
    expect(CardUtils.heal(card, 20).hp).toBe(50);
  });

  it('enforces the mythic four-turn attack cooldown', () => {
    const mythic = makeCard({ isMythic: true, lastAttackTurn: 3 });

    expect(CardUtils.canAttack(mythic, 6)).toBe(false);
    expect(CardUtils.canAttack(mythic, 7)).toBe(true);
  });
});
