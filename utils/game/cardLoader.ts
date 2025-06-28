import { Card, Element, Rarity } from '../../types/game';
import cardData from '../../data/cards.json';

export class CardLoader {
  private static cards: Card[] = [];

  static loadCards(): Card[] {
    if (this.cards.length === 0) {
      this.cards = cardData.map((card, index) => ({
        ...card,
        element: card.element as Element,
        rarity: card.rarity as Rarity,
        id: card.name.toLowerCase().replace(/\s+/g, '_') + '_' + index,
        maxHp: card.hp,
        isMythic: card.rarity === 'mythic',
      }));
    }
    return [...this.cards];
  }

  static getCardById(id: string): Card | undefined {
    const cards = this.loadCards();
    return cards.find(card => card.id === id);
  }

  static getCardsByElement(element: string): Card[] {
    const cards = this.loadCards();
    return cards.filter(card => card.element === element);
  }

  static getCardsByRarity(rarity: string): Card[] {
    const cards = this.loadCards();
    return cards.filter(card => card.rarity === rarity);
  }

  static createRandomDeck(size: number = 25): Card[] {
    const allCards = this.loadCards();
    const deck: Card[] = [];
    
    for (let i = 0; i < size; i++) {
      const randomIndex = Math.floor(Math.random() * allCards.length);
      const selectedCard = { ...allCards[randomIndex] };
      selectedCard.id = selectedCard.id + '_deck_' + i;
      deck.push(selectedCard);
    }
    
    return deck;
  }

  static createBalancedDeck(size: number = 25): Card[] {
    const allCards = this.loadCards();
    const deck: Card[] = [];
    
    const commonCards = allCards.filter(c => c.rarity === 'common');
    const rareCards = allCards.filter(c => c.rarity === 'rare');
    const epicCards = allCards.filter(c => c.rarity === 'epic');
    const legendaryCards = allCards.filter(c => c.rarity === 'legendary');
    const mythicCards = allCards.filter(c => c.rarity === 'mythic');
    
    const commonCount = Math.floor(size * 0.5);
    const rareCount = Math.floor(size * 0.25);
    const epicCount = Math.floor(size * 0.15);
    const legendaryCount = Math.floor(size * 0.08);
    const mythicCount = size - commonCount - rareCount - epicCount - legendaryCount;
    
    this.addRandomCards(deck, commonCards, commonCount);
    this.addRandomCards(deck, rareCards, rareCount);
    this.addRandomCards(deck, epicCards, epicCount);
    this.addRandomCards(deck, legendaryCards, legendaryCount);
    this.addRandomCards(deck, mythicCards, mythicCount);
    
    return deck;
  }

  private static addRandomCards(deck: Card[], sourceCards: Card[], count: number): void {
    for (let i = 0; i < count && sourceCards.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * sourceCards.length);
      const selectedCard = { ...sourceCards[randomIndex] };
      selectedCard.id = selectedCard.id + '_deck_' + deck.length;
      deck.push(selectedCard);
    }
  }
}