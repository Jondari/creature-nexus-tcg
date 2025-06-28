import { Card, Attack, Element, Rarity } from '../../types/game';

export class CardUtils {
  static createCard(
    id: string,
    name: string,
    element: Element,
    rarity: Rarity,
    hp: number,
    attacks: Attack[]
  ): Card {
    return {
      id,
      name,
      element,
      rarity,
      hp,
      maxHp: hp,
      attacks,
      isMythic: rarity === 'mythic',
    };
  }

  static canAttack(card: Card, currentTurn: number): boolean {
    if (!card.isMythic) return true;
    
    if (card.lastAttackTurn === undefined) return true;
    
    return currentTurn - card.lastAttackTurn >= 4;
  }

  static takeDamage(card: Card, damage: number): Card {
    const newHp = Math.max(0, card.hp - damage);
    return {
      ...card,
      hp: newHp,
    };
  }

  static heal(card: Card, amount: number): Card {
    const newHp = Math.min(card.maxHp || card.hp, card.hp + amount);
    return {
      ...card,
      hp: newHp,
    };
  }

  static isAlive(card: Card): boolean {
    return card.hp > 0;
  }

  static getEnergyCost(rarity: Rarity): number {
    // Playing cards to field is free - no energy cost
    return 0;
  }

  static clone(card: Card): Card {
    return {
      ...card,
      attacks: [...card.attacks],
    };
  }
}