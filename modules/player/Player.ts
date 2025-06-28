import { Player, Card } from '../../types/game';
import { CardUtils } from '../card';
import { Deck } from '../card/Deck';

export class PlayerUtils {
  static createPlayer(id: string, name: string, deck: Card[], isAI: boolean = false): Player {
    return {
      id,
      name,
      deck: [...deck],
      hand: [],
      field: [],
      energy: 0,
      points: 0,
      isAI,
    };
  }

  static drawCard(player: Player, deck: Deck): Player {
    const drawnCard = deck.draw();
    if (!drawnCard) return player;

    return {
      ...player,
      hand: [...player.hand, drawnCard],
    };
  }

  static canPlayCard(player: Player, card: Card): boolean {
    // Only check field space limit - no energy required to play cards
    return player.field.length < 4;
  }

  static playCard(player: Player, cardId: string): Player {
    const cardIndex = player.hand.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return player;

    const card = player.hand[cardIndex];
    
    if (!PlayerUtils.canPlayCard(player, card)) return player;

    const newHand = player.hand.filter((_, index) => index !== cardIndex);
    const newField = [...player.field, card];

    return {
      ...player,
      hand: newHand,
      field: newField,
    };
  }

  static canRetireCard(player: Player, cardId: string): boolean {
    const hasCard = player.field.some(card => card.id === cardId);
    return hasCard && player.energy >= 1;
  }

  static retireCard(player: Player, cardId: string): Player {
    if (!PlayerUtils.canRetireCard(player, cardId)) return player;

    const cardIndex = player.field.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return player;

    const card = player.field[cardIndex];
    const newField = player.field.filter((_, index) => index !== cardIndex);
    const newHand = [...player.hand, card];
    const newEnergy = player.energy - 1;

    return {
      ...player,
      field: newField,
      hand: newHand,
      energy: newEnergy,
    };
  }

  static addEnergy(player: Player, amount: number = 1): Player {
    return {
      ...player,
      energy: player.energy + amount,
    };
  }

  static addPoints(player: Player, points: number): Player {
    return {
      ...player,
      points: player.points + points,
    };
  }

  static updateFieldCard(player: Player, cardId: string, updatedCard: Card): Player {
    const cardIndex = player.field.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return player;

    const newField = [...player.field];
    newField[cardIndex] = updatedCard;

    return {
      ...player,
      field: newField,
    };
  }

  static removeDeadCards(player: Player): Player {
    const aliveCards = player.field.filter(card => CardUtils.isAlive(card));
    
    return {
      ...player,
      field: aliveCards,
    };
  }

  static hasLost(player: Player, deck: Deck, turnNumber: number): boolean {
    // Player loses if deck is empty
    if (deck.isEmpty()) {
      return true;
    }
    
    // Player loses if field is empty, but only after turn 2 
    // (so both players have had at least one turn to play cards)
    if (player.field.length === 0 && turnNumber > 2) {
      return true;
    }
    
    return false;
  }

  static hasWon(player: Player): boolean {
    return player.points >= 4;
  }
}