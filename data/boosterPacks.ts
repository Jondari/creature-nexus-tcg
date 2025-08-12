import { BoosterPack, StandardPack, ElementalPack, PremiumPack } from '../models/BoosterPack';
import { CardRarity } from '../models/Card';

// Standard Packs
export const STANDARD_PACK: StandardPack = {
  id: 'standard_pack',
  name: 'Standard Pack',
  description: 'Contains 5 random cards from all available creatures. Perfect for building your collection!',
  cardCount: 5,
  type: 'standard',
  nexusCoinPrice: 100,
  realMoneyPrice: 99, // $0.99 in cents
  isAvailable: true,
  isPremium: false,
  imageUrl: require('@/assets/images/packs/standard_pack.png'),
  backgroundColor: '#4a90e2',
  bundleDiscount: {
    quantity: 10,
    bonus: 2
  }
};

export const FREE_DAILY_PACK: StandardPack = {
  id: 'free_daily_pack',
  name: 'Daily Free Pack',
  description: 'Your free daily pack! Available every 12 hours.',
  cardCount: 5,
  type: 'standard',
  nexusCoinPrice: 0,
  isAvailable: true,
  isPremium: false,
  imageUrl: require('@/assets/images/packs/standard_pack.png'), // Using standard pack image for free pack
  backgroundColor: '#28a745'
};

// Elemental Packs
export const FIRE_PACK: ElementalPack = {
  id: 'fire_pack',
  name: 'Fire Pack',
  description: 'Contains 5 cards, all with Fire element. Perfect for mono-Fire decks!',
  cardCount: 5,
  type: 'elemental',
  element: 'fire',
  nexusCoinPrice: 150,
  realMoneyPrice: 149, // $1.49
  isAvailable: true,
  isPremium: false,
  imageUrl: require('@/assets/images/packs/fire_pack.png'),
  backgroundColor: '#e74c3c',
  bundleDiscount: {
    quantity: 10,
    bonus: 2
  }
};

export const WATER_PACK: ElementalPack = {
  id: 'water_pack',
  name: 'Water Pack',
  description: 'Contains 5 cards, all with Water element. Dive into aquatic power!',
  cardCount: 5,
  type: 'elemental',
  element: 'water',
  nexusCoinPrice: 150,
  realMoneyPrice: 149,
  isAvailable: true,
  isPremium: false,
  imageUrl: require('@/assets/images/packs/water_pack.png'),
  backgroundColor: '#3498db',
  bundleDiscount: {
    quantity: 10,
    bonus: 2
  }
};

export const EARTH_PACK: ElementalPack = {
  id: 'earth_pack',
  name: 'Earth Pack',
  description: 'Contains 5 cards, all with Earth element. Harness the power of nature!',
  cardCount: 5,
  type: 'elemental',
  element: 'earth',
  nexusCoinPrice: 150,
  realMoneyPrice: 149,
  isAvailable: true,
  isPremium: false,
  imageUrl: require('@/assets/images/packs/earth_pack.png'),
  backgroundColor: '#27ae60',
  bundleDiscount: {
    quantity: 10,
    bonus: 2
  }
};

export const AIR_PACK: ElementalPack = {
  id: 'air_pack',
  name: 'Air Pack',
  description: 'Contains 5 cards, all with Air element. Soar with the winds!',
  cardCount: 5,
  type: 'elemental',
  element: 'air',
  nexusCoinPrice: 150,
  realMoneyPrice: 149,
  isAvailable: true,
  isPremium: false,
  imageUrl: require('@/assets/images/packs/air_pack.png'),
  backgroundColor: '#95a5a6',
  bundleDiscount: {
    quantity: 10,
    bonus: 2
  }
};

// Premium Packs (5-card packs only)
export const MYTHIC_GUARANTEED_PACK: PremiumPack = {
  id: 'mythic_guaranteed_pack',
  name: 'Mythic Guaranteed Pack',
  description: 'Contains 5 cards with one guaranteed Mythic rarity! The ultimate premium experience.',
  cardCount: 5,
  type: 'premium',
  subtype: 'mythic_guaranteed',
  guaranteedRarity: 'mythic',
  guaranteedCount: 1,
  nexusCoinPrice: 500,
  realMoneyPrice: 499, // $4.99
  isAvailable: true,
  isPremium: true,
  imageUrl: require('@/assets/images/packs/mythic_pack.png'),
  backgroundColor: '#e84b55'
};

export const LEGENDARY_GUARANTEED_PACK: PremiumPack = {
  id: 'legendary_guaranteed_pack',
  name: 'Legendary Guaranteed Pack',
  description: 'Contains 5 cards with one guaranteed Legendary rarity! Premium quality assured.',
  cardCount: 5,
  type: 'premium',
  subtype: 'legendary_guaranteed',
  guaranteedRarity: 'legendary',
  guaranteedCount: 1,
  nexusCoinPrice: 300,
  realMoneyPrice: 299, // $2.99
  isAvailable: true,
  isPremium: true,
  imageUrl: require('@/assets/images/packs/legendary_pack.png'),
  backgroundColor: '#df8c2b'
};

// All purchasable packs (no single-card packs for sale)
export const ALL_BOOSTER_PACKS: BoosterPack[] = [
  FREE_DAILY_PACK,
  STANDARD_PACK,
  FIRE_PACK,
  WATER_PACK,
  EARTH_PACK,
  AIR_PACK,
  MYTHIC_GUARANTEED_PACK,
  LEGENDARY_GUARANTEED_PACK
];

// Pack categories for UI organization
export const PACK_CATEGORIES = {
  free: [FREE_DAILY_PACK],
  standard: [STANDARD_PACK],
  elemental: [FIRE_PACK, WATER_PACK, EARTH_PACK, AIR_PACK],
  premium: [MYTHIC_GUARANTEED_PACK, LEGENDARY_GUARANTEED_PACK]
};

// Helper function to get pack by ID
export const getPackById = (id: string): BoosterPack | undefined => {
  return ALL_BOOSTER_PACKS.find(pack => pack.id === id);
};

// Helper function to get available packs
export const getAvailablePacks = (): BoosterPack[] => {
  return ALL_BOOSTER_PACKS.filter(pack => pack.isAvailable);
};

// Single-card packs for events/rewards only (not for sale)
export const createSingleCardPack = (packId: string, eventName?: string, guaranteedRarity?: CardRarity): PremiumPack => ({
  id: packId,
  name: eventName ? `${eventName} Reward` : 'Single Card Reward',
  description: eventName ? `Special reward card from ${eventName}` : 'A special reward card',
  cardCount: 1,
  type: 'premium',
  subtype: 'single_card',
  guaranteedRarity, // Can be any rarity or undefined for random
  guaranteedCount: guaranteedRarity ? 1 : undefined,
  nexusCoinPrice: 0, // Not for sale
  isAvailable: false, // Only available through events/rewards
  isPremium: true,
  imageUrl: '/images/packs/single_card_reward.png',
  backgroundColor: '#9d4edd'
});