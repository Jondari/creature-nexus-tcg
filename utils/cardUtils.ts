import { Card, CardRarity, RARITY_WEIGHTS, CARD_NAMES, CARD_DESCRIPTIONS, CARD_IMAGES } from '../models/Card';

// Generate a random rarity based on weights
export const generateRandomRarity = (): CardRarity => {
  const weights = RARITY_WEIGHTS;
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const [rarity, weight] of Object.entries(weights)) {
    if (random < weight) {
      return rarity as CardRarity;
    }
    random -= weight;
  }
  
  return 'common'; // Default fallback
};

// Get a random element from an array
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Generate a single random card
export const generateRandomCard = (): Card => {
  const rarity = generateRandomRarity();
  const name = getRandomElement(CARD_NAMES[rarity]);
  const description = getRandomElement(CARD_DESCRIPTIONS[rarity]);
  const imageUrl = getRandomElement(CARD_IMAGES[rarity]);
  
  return {
    id: `${rarity}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    name,
    description,
    rarity,
    imageUrl,
    createdAt: new Date()
  };
};

// Generate a pack of cards (5 cards per pack)
export const generateCardPack = (size = 5): Card[] => {
  const cards: Card[] = [];
  
  for (let i = 0; i < size; i++) {
    cards.push(generateRandomCard());
  }
  
  return cards;
};

// Group cards by ID to count duplicates
export const groupCardsByName = (cards: Card[]): Record<string, Card[]> => {
  return cards.reduce((acc, card) => {
    const key = card.name;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(card);
    return acc;
  }, {} as Record<string, Card[]>);
};

// Filter cards by rarity
export const filterCardsByRarity = (cards: Card[], rarity: CardRarity | 'all'): Card[] => {
  if (rarity === 'all') {
    return cards;
  }
  return cards.filter(card => card.rarity === rarity);
};

// Check if enough time has passed since last pack opening (12 hours)
export const canOpenNewPack = (lastPackOpenedTimestamp: number | null): boolean => {
  if (!lastPackOpenedTimestamp) {
    return true;
  }
  
  const twelveHoursInMs = 12 * 60 * 60 * 1000;
  const timeSinceLastPack = Date.now() - lastPackOpenedTimestamp;
  
  return timeSinceLastPack >= twelveHoursInMs;
};

// Calculate time remaining until next pack can be opened
export const getTimeUntilNextPack = (lastPackOpenedTimestamp: number | null): number => {
  if (!lastPackOpenedTimestamp) {
    return 0;
  }
  
  const twelveHoursInMs = 12 * 60 * 60 * 1000;
  const timeSinceLastPack = Date.now() - lastPackOpenedTimestamp;
  const timeRemaining = twelveHoursInMs - timeSinceLastPack;
  
  return Math.max(0, timeRemaining);
};

// Format milliseconds to a readable time string (HH:MM:SS)
export const formatTimeRemaining = (milliseconds: number): string => {
  if (milliseconds <= 0) {
    return '00:00:00';
  }
  
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
};