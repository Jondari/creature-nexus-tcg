import cardsData from '../data/cards.json';

// Re-export battle engine types and interfaces
export type { Element, Rarity, Attack, Card } from '../types/game';

// For backwards compatibility, also export as CardRarity
export type CardRarity = import('../types/game').Rarity;

export const RARITY_WEIGHTS = {
  common: 60,
  rare: 25,
  epic: 10,
  legendary: 4,
  mythic: 1
};

export const RARITY_COLORS = {
  common: '#8e919f',
  rare: '#3e7cc9',
  epic: '#9855d4',
  legendary: '#df8c2b',
  mythic: '#e84b55'
};

export const CARD_NAMES = {
  common: [
    'Forest Sprite', 'Mountain Goat', 'River Otter', 
    'Meadow Fairy', 'Cave Bat', 'Desert Scorpion',
    'Tundra Wolf', 'Jungle Parrot', 'Coastal Crab',
    'Prairie Dog', 'Swamp Frog', 'Valley Rabbit'
  ],
  rare: [
    'Flame Salamander', 'Frost Owl', 'Thunder Hawk', 
    'Earth Tortoise', 'Wind Falcon', 'Water Serpent',
    'Light Unicorn', 'Shadow Panther', 'Nature Deer',
    'Metal Rhino', 'Crystal Fox', 'Lava Lizard'
  ],
  epic: [
    'Ancient Dragon', 'Storm Griffin', 'Void Kraken', 
    'Solar Phoenix', 'Lunar Wolf', 'Terra Golem',
    'Celestial Eagle', 'Infernal Hellhound', 'Arcane Sphinx',
    'Mystic Hydra', 'Ethereal Pegasus', 'Abyssal Leviathan'
  ],
  legendary: [
    'Chronos, Time Keeper', 'Gaia, Earth Mother', 'Poseidon, Sea Lord', 
    'Zeus, Thunder King', 'Artemis, Moon Hunter', 'Apollo, Sun Bringer',
    'Hades, Underworld Ruler', 'Athena, Wisdom Goddess', 'Ares, War Master'
  ],
  mythic: [
    'Yggdrasil, World Tree', 'Fenrir, Devourer of Worlds', 'Jormungandr, World Serpent', 
    'Bahamut, Dragon Emperor', 'Tiamat, Dragon Queen', 'Cthulhu, Ancient One',
    'Quetzalcoatl, Feathered Serpent', 'Odin, All-Father', 'Kagutsuchi, Fire God'
  ]
};

export const CARD_DESCRIPTIONS = {
  common: [
    'A humble creature of the wilds.',
    'Common but reliable ally.',
    'Found in abundance across the realm.',
    'A friendly creature that adapts easily.',
    'Small but resourceful being.'
  ],
  rare: [
    'Uncommon creature with special abilities.',
    'Possesses rare talents and skills.',
    'A sought-after ally in battle.',
    'Has mastered the elements.',
    'Trained in ancient techniques.'
  ],
  epic: [
    'Powerful entity born of magic.',
    'Commands respect on the battlefield.',
    'Ancient creature of immense power.',
    'Channels elemental forces.',
    'Legendary creature of myth and lore.'
  ],
  legendary: [
    'Divine being with incredible powers.',
    'Ancient ruler of their domain.',
    'Blessed with celestial magic.',
    'One of the last of their kind.',
    'Their name echoes through history.'
  ],
  mythic: [
    'God-like entity beyond mortal comprehension.',
    'Reality bends to their will.',
    'Existence itself acknowledges their power.',
    'Ancient beyond measure, powerful beyond compare.',
    'The mere mention of their name changes fate.'
  ]
};

export const CARD_IMAGES = {
  common: [
    'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg',
    'https://images.pexels.com/photos/45911/peacock-plumage-bird-peafowl-45911.jpeg',
    'https://images.pexels.com/photos/47547/squirrel-animal-cute-rodents-47547.jpeg',
    'https://images.pexels.com/photos/39857/leopard-leopard-spots-animal-wild-39857.jpeg',
    'https://images.pexels.com/photos/460775/pexels-photo-460775.jpeg'
  ],
  rare: [
    'https://images.pexels.com/photos/572861/pexels-photo-572861.jpeg',
    'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg',
    'https://images.pexels.com/photos/1181181/pexels-photo-1181181.jpeg',
    'https://images.pexels.com/photos/1165312/pexels-photo-1165312.jpeg',
    'https://images.pexels.com/photos/2115984/pexels-photo-2115984.jpeg'
  ],
  epic: [
    'https://images.pexels.com/photos/1366957/pexels-photo-1366957.jpeg',
    'https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg',
    'https://images.pexels.com/photos/1616463/pexels-photo-1616463.jpeg',
    'https://images.pexels.com/photos/1067333/pexels-photo-1067333.jpeg',
    'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg'
  ],
  legendary: [
    'https://images.pexels.com/photos/2876036/pexels-photo-2876036.jpeg',
    'https://images.pexels.com/photos/1144687/pexels-photo-1144687.jpeg',
    'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg',
    'https://images.pexels.com/photos/5477745/pexels-photo-5477745.jpeg',
    'https://images.pexels.com/photos/3270223/pexels-photo-3270223.jpeg'
  ],
  mythic: [
    'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg',
    'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg',
    'https://images.pexels.com/photos/3270224/pexels-photo-3270224.jpeg',
    'https://images.pexels.com/photos/952670/pexels-photo-952670.jpeg',
    'https://images.pexels.com/photos/1591305/pexels-photo-1591305.jpeg'
  ]
};

// Card database from battle engine
export const CARDS_DATABASE = cardsData;

// Helper functions to get cards by rarity
export const getCardsByRarity = (rarity: CardRarity) => {
  return CARDS_DATABASE.filter(card => card.rarity === rarity);
};

export const getRandomCardByRarity = (rarity: CardRarity) => {
  const cards = getCardsByRarity(rarity);
  return cards[Math.floor(Math.random() * cards.length)];
};