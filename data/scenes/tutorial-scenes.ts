/**
 * Tutorial Scenes
 * 
 * Scene definitions for the tutorial system. These scenes guide new players
 * through the core game mechanics and UI elements.
 */

import type { SceneSpec } from '@/types/scenes';
import { COMMON_ANCHORS, SCENE_TRIGGERS } from '@/types/scenes';

// First Launch Tutorial - Overall game introduction
export const SCENE_FIRST_LAUNCH: SceneSpec = {
  id: 'tutorial_first_launch',
  version: 1,
  title: 'Welcome to Creature Nexus TCG',
  description: 'Initial welcome and overview tutorial',
  triggers: [
    { type: 'onFirstLaunch' }
  ],
  backgroundImage: require('@/assets/images/scene/nexus_welcome_bg.png'),
  steps: [
    { type: 'showPortrait', side: 'right', uri: 'guide_portrait.png', animation: 'slideIn' },
    { type: 'say', speaker: 'Nexus Guide', text: 'Welcome to the Creature Nexus, summoner! I am your guide in this mystical realm.' },
    { type: 'say', speaker: 'Nexus Guide', text: 'Here, creatures from different elemental worlds converge. Your journey begins now!' },
    { type: 'choice', choices: [
      { id: 'ready', text: 'I\'m ready!', goto: 'intro_story' },
      { id: 'explain', text: 'Tell me more about this place', goto: 'lore_explanation' }
    ]},
    
    { type: 'label', name: 'lore_explanation' },
    { type: 'say', speaker: 'Nexus Guide', text: 'The Nexus is where four elemental realms intersect: Fire, Water, Earth, and Air.' },
    { type: 'say', speaker: 'Nexus Guide', text: 'Ancient beings have disturbed the balance. Only by mastering creatures from all elements can you restore harmony.' },
    { type: 'goto', label: 'intro_story' },
    
    { type: 'label', name: 'intro_story' },
    { type: 'say', speaker: 'Nexus Guide', text: 'Let me show you around. We\'ll start with the Story Mode to learn the basics.' },
    { type: 'setFlag', key: 'tutorial_first_launch_completed', value: true },
    { type: 'navigateTo', screen: 'story-mode' },
    { type: 'end' }
  ],
  priority: 100
};

// Story Mode Introduction
export const SCENE_STORY_MODE_INTRO: SceneSpec = {
  id: 'tutorial_story_intro',
  version: 1,
  title: 'Story Mode Introduction',
  description: 'Introduction to story mode and chapter navigation',
  triggers: [
    { type: 'onEnterScreen', screen: 'story-mode' }
  ],
  conditions: {
    flags: { 'tutorial_story_intro_completed': false }
  },
  steps: [
    { type: 'showPortrait', side: 'left', uri: 'guide_portrait.png', animation: 'slideIn' },
    { type: 'say', speaker: 'Nexus Guide', text: 'This is the Story Mode, where your adventure unfolds!' },
    { type: 'highlight', anchorId: COMMON_ANCHORS.CHAPTER_NODE, text: 'These are chapter nodes. Tap one to see the battles within.', maskInput: true, textPosition: "top" },
    { type: 'say', speaker: 'Nexus Guide', text: 'Each chapter takes you to a different elemental realm with unique challenges.' },
    { type: 'say', speaker: 'Nexus Guide', text: 'Complete the battles in a chapter to unlock the next realm.' },
    { type: 'say', speaker: 'Nexus Guide', text: 'Ready to begin your first battle? Tap on Chapter 1!' },
    { type: 'setFlag', key: 'tutorial_story_intro_completed', value: true },
    { type: 'hidePortrait', side: 'left', animation: 'slideOut' },
    { type: 'end' }
  ],
  priority: 90
};

// Chapter Map Tutorial
export const SCENE_CHAPTER_MAP_INTRO: SceneSpec = {
  id: 'tutorial_chapter_map',
  version: 1,
  title: 'Chapter Map Tutorial',
  description: 'How to navigate within a chapter',
  triggers: [
    { type: 'onEnterScreen', screen: 'chapter-map' }
  ],
  conditions: {
    flags: { 'tutorial_chapter_map_completed': false }
  },
  steps: [
    { type: 'showPortrait', side: 'right', uri: 'guide_portrait.png', animation: 'slideIn' },
    { type: 'say', speaker: 'Nexus Guide', text: 'Welcome to Chapter 1: The Water Realm!' },
    { type: 'highlight', anchorId: COMMON_ANCHORS.BATTLE_NODE, text: 'These are battle nodes. Each represents a unique encounter.', maskInput: true },
    { type: 'say', speaker: 'Nexus Guide', text: 'Completed battles glow gold, available ones adopt the chapter\'s colour, and inaccessible nodes appear dimmed.' },
    { type: 'say', speaker: 'Nexus Guide', text: 'You must complete battles in order to progress through the chapter.' },
    { type: 'highlight', anchorId: COMMON_ANCHORS.BATTLE_NODE, text: 'Tap on the first battle to begin!', maskInput: false },
    { type: 'setFlag', key: 'tutorial_chapter_map_completed', value: true },
    { type: 'hidePortrait', side: 'right', animation: 'slideOut' },
    { type: 'end' }
  ],
  priority: 85
};

// Battle Screen Tutorial - Comprehensive battle mechanics
/*
export const SCENE_BATTLE_TUTORIAL: SceneSpec = {
  id: 'tutorial_battle_basics',
  version: 1,
  title: 'Battle Basics',
  description: 'Complete tutorial for battle mechanics',
  triggers: [
    { type: 'onEnterScreen', screen: 'battle' }
  ],
  conditions: {
    flags: { 'tutorial_battle_completed': false }
  },
  steps: [
    { type: 'showPortrait', side: 'left', uri: 'guide_portrait.png', animation: 'slideIn' },
    { type: 'say', speaker: 'Battle Guide', text: 'Welcome to your first battle! Let me show you the basics.' },
    
    // UI Overview
    { type: 'highlight', anchorId: COMMON_ANCHORS.PLAYER_HP, text: 'This is your health. Don\'t let it reach zero!', maskInput: true },
    { type: 'highlight', anchorId: COMMON_ANCHORS.ENEMY_HP, text: 'This is your opponent\'s health. Reduce it to zero to win!', maskInput: true },
    { type: 'highlight', anchorId: COMMON_ANCHORS.ENERGY_DISPLAY, text: 'This shows your energy. You gain 1 energy each turn.', maskInput: true },
    
    // Hand and Cards
    { type: 'highlight', anchorId: COMMON_ANCHORS.HAND_AREA, text: 'These are your cards. Each creature has HP and attacks.', maskInput: true },
    { type: 'say', speaker: 'Battle Guide', text: 'Cards cost energy to play. Look at the energy cost in the top-right corner.' },
    
    // Playing Cards
    { type: 'say', speaker: 'Battle Guide', text: 'Try playing a card now. Tap on any card in your hand.' },
    { type: 'maskInput', enabled: false },
    // Wait for player to play a card (this would be handled by game state)
    { type: 'if', flag: 'card_played', then: 'after_card_played', else: 'wait_for_card' },
    
    { type: 'label', name: 'wait_for_card' },
    { type: 'wait', ms: 2000 },
    { type: 'if', flag: 'card_played', then: 'after_card_played', else: 'prompt_card_play' },
    
    { type: 'label', name: 'prompt_card_play' },
    { type: 'say', speaker: 'Battle Guide', text: 'Go ahead, tap on any card to play it!' },
    { type: 'goto', label: 'wait_for_card' },
    
    { type: 'label', name: 'after_card_played' },
    { type: 'say', speaker: 'Battle Guide', text: 'Excellent! Your creature is now on the battlefield.' },
    { type: 'highlight', anchorId: COMMON_ANCHORS.FIELD_AREA, text: 'This is the battlefield where your active creatures reside.', maskInput: true },
    
    // Attacking
    { type: 'say', speaker: 'Battle Guide', text: 'Now you can attack! Tap on your creature to see its attacks.' },
    { type: 'maskInput', enabled: false },
    { type: 'if', flag: 'creature_selected', then: 'explain_attacks', else: 'wait_for_selection' },
    
    { type: 'label', name: 'wait_for_selection' },
    { type: 'wait', ms: 2000 },
    { type: 'if', flag: 'creature_selected', then: 'explain_attacks', else: 'prompt_selection' },
    
    { type: 'label', name: 'prompt_selection' },
    { type: 'say', speaker: 'Battle Guide', text: 'Tap on your creature on the battlefield!' },
    { type: 'goto', label: 'wait_for_selection' },
    
    { type: 'label', name: 'explain_attacks' },
    { type: 'say', speaker: 'Battle Guide', text: 'Perfect! You can see the creature\'s attacks and their energy costs.' },
    { type: 'say', speaker: 'Battle Guide', text: 'Choose an attack and select a target to deal damage.' },
    
    // Turn System
    { type: 'highlight', anchorId: COMMON_ANCHORS.END_TURN_BUTTON, text: 'When you\'re done, click here to end your turn.', maskInput: true },
    { type: 'say', speaker: 'Battle Guide', text: 'Your opponent will then take their turn, and the cycle continues.' },
    
    // Strategy Tips
    { type: 'say', speaker: 'Battle Guide', text: 'Some strategy tips:' },
    { type: 'say', speaker: 'Battle Guide', text: '• Manage your energy wisely - stronger cards cost more.' },
    { type: 'say', speaker: 'Battle Guide', text: '• Different elements have advantages against others.' },
    { type: 'say', speaker: 'Battle Guide', text: '• Plan ahead - sometimes saving energy for next turn is better!' },
    
    // Finish Tutorial
    { type: 'say', speaker: 'Battle Guide', text: 'You\'re ready to battle! Remember, victory comes from smart strategy.' },
    { type: 'say', speaker: 'Battle Guide', text: 'Good luck, and may the Nexus guide you!' },
    { type: 'setFlag', key: 'tutorial_battle_completed', value: true },
    { type: 'hidePortrait', side: 'left', animation: 'slideOut' },
    { type: 'end' }
  ],
  priority: 80
};
*/

// First Victory Celebration
/*
export const SCENE_FIRST_VICTORY: SceneSpec = {
  id: 'tutorial_first_victory',
  version: 1,
  title: 'First Victory!',
  description: 'Celebration and explanation of victory rewards',
  triggers: [
    { type: 'onBattleEnd', result: 'win' }
  ],
  conditions: {
    flags: { 'tutorial_first_victory_completed': false }
  },
  steps: [
    { type: 'setBackground', uri: 'victory_bg.png', transition: 'fade' },
    { type: 'showPortrait', side: 'right', uri: 'guide_portrait.png', animation: 'slideIn' },
    { type: 'say', speaker: 'Nexus Guide', text: 'Congratulations on your first victory!' },
    { type: 'say', speaker: 'Nexus Guide', text: 'Each victory grants you rewards: Nexus Coins and sometimes booster packs!' },
    { type: 'say', speaker: 'Nexus Guide', text: 'Nexus Coins can be used to buy more packs in the Store.' },
    { type: 'say', speaker: 'Nexus Guide', text: 'Booster packs contain new creatures to strengthen your collection.' },
    { type: 'say', speaker: 'Nexus Guide', text: 'Keep battling to unlock new chapters and discover powerful legendary creatures!' },
    { type: 'setFlag', key: 'tutorial_first_victory_completed', value: true },
    { type: 'setProgress', key: 'battles_won', value: 1 },
    { type: 'hidePortrait', side: 'right', animation: 'slideOut' },
    { type: 'end' }
  ],
  priority: 75
};
*/

// Home Screen Overview
export const SCENE_HOME_INTRO: SceneSpec = {
  id: 'tutorial_home_intro',
  version: 1,
  title: 'Welcome Home',
  description: 'Highlights key elements on the home screen',
  triggers: [
    { type: 'onEnterScreen', screen: 'home' }
  ],
  conditions: {
    flags: {
      'tutorial_home_completed': false,
      'tutorial_first_launch_completed': true,
    }
  },
  steps: [
    { type: 'showPortrait', side: 'left', uri: 'guide_portrait.png', animation: 'slideIn' },
    { type: 'say', speaker: 'Nexus Guide', text: 'This is your home base. From here you can access every feature of the Nexus.' },
    { type: 'highlight', anchorId: COMMON_ANCHORS.OPEN_PACK_BUTTON, text: 'Use this button to open your daily pack when it\'s ready.', maskInput: true },
    { type: 'highlight', anchorId: COMMON_ANCHORS.PACK_INVENTORY, text: 'Any unopened packs will appear here.', maskInput: true },
    { type: 'say', speaker: 'Nexus Guide', text: 'Tap on packs to open them and discover new creatures!' },
    { type: 'setFlag', key: 'tutorial_home_completed', value: true },
    { type: 'hidePortrait', side: 'left', animation: 'slideOut' },
    { type: 'end' }
  ],
  priority: 72
};

// Collection Tutorial
export const SCENE_COLLECTION_INTRO: SceneSpec = {
  id: 'tutorial_collection_intro',
  version: 1,
  title: 'Your Collection',
  description: 'Introduction to the collection screen',
  triggers: [
    { type: 'onEnterScreen', screen: 'collection' }
  ],
  conditions: {
    flags: { 'tutorial_collection_completed': false }
  },
  steps: [
    { type: 'showPortrait', side: 'left', uri: 'guide_portrait.png', animation: 'slideIn' },
    { type: 'say', speaker: 'Collection Guide', text: 'Welcome to your Collection! This is where all your creatures live.' },
    { type: 'highlight', anchorId: COMMON_ANCHORS.CARD_GRID, text: 'Here you can see all the creatures you\'ve collected.', maskInput: true },
    { type: 'say', speaker: 'Collection Guide', text: 'Cards are organized by rarity: Common, Rare, Epic, Legendary, and the ultra-rare Mythic!' },
    { type: 'say', speaker: 'Collection Guide', text: 'Each card shows its element, HP, and attacks. Study them to plan your strategies!' },
    { type: 'setFlag', key: 'tutorial_collection_completed', value: true },
    { type: 'hidePortrait', side: 'left', animation: 'slideOut' },
    { type: 'end' }
  ],
  priority: 70
};

// Deck Building Tutorial
export const SCENE_DECK_BUILDER_INTRO: SceneSpec = {
  id: 'tutorial_deck_builder',
  version: 1,
  title: 'Build Your Deck',
  description: 'Introduction to deck building mechanics',
  triggers: [
    { type: 'onEnterScreen', screen: 'decks' }
  ],
  conditions: {
    flags: { 'tutorial_deck_builder_completed': false }
  },
  steps: [
    { type: 'showPortrait', side: 'right', uri: 'guide_portrait.png', animation: 'slideIn' },
    { type: 'say', speaker: 'Deck Master', text: 'Time to build your own deck! This is where strategy begins.' },
    { type: 'highlight', anchorId: COMMON_ANCHORS.DECK_BUILDER_ENTRY, text: 'Tap here to open the Deck Editor.', maskInput: true, textPosition: 'top' },
    { type: 'maskInput', enabled: false },
    { type: 'label', name: 'wait_for_deck_builder' },
    { type: 'wait', ms: 400 },
    { type: 'if', flag: 'deck_builder_open', then: 'deck_builder_opened', else: 'prompt_open_deck_builder' },

    { type: 'label', name: 'prompt_open_deck_builder' },
    { type: 'say', speaker: 'Deck Master', text: 'Go ahead and tap “New Deck” to open the editor – I\'ll wait!' },
    { type: 'highlight', anchorId: COMMON_ANCHORS.DECK_BUILDER_ENTRY, text: 'Tap here to open the Deck Editor.', maskInput: true, textPosition: 'top' },
    { type: 'maskInput', enabled: false },
    { type: 'wait', ms: 600 },
    { type: 'goto', label: 'wait_for_deck_builder' },

    { type: 'label', name: 'deck_builder_opened' },
    { type: 'say', speaker: 'Deck Master', text: 'Great! Let me show you the key areas of the editor.' },
    { type: 'highlight', anchorId: COMMON_ANCHORS.DECK_EDITOR_INFO, text: 'Track your deck size and legality here.', maskInput: true },
    { type: 'highlight', anchorId: COMMON_ANCHORS.DECK_EDITOR_FILTERS, text: 'Use these filters to focus on specific card rarities.', maskInput: true },
    { type: 'highlight', anchorId: COMMON_ANCHORS.DECK_EDITOR_GRID, text: 'Tap cards in your collection to add them to the deck.', maskInput: true },
    { type: 'highlight', anchorId: COMMON_ANCHORS.DECK_EDITOR_CURRENT_DECK_BUTTON, text: 'Open your current deck to rename it or remove cards.', maskInput: true, textPosition: 'bottom' },
    { type: 'highlight', anchorId: COMMON_ANCHORS.DECK_EDITOR_SAVE_BUTTON, text: 'When you\'re happy with the list, save it here.', maskInput: true, textPosition: 'bottom' },
    { type: 'say', speaker: 'Deck Master', text: 'Remember: a deck must have between 20 and 60 cards with up to 3 copies of each creature.' },
    { type: 'say', speaker: 'Deck Master', text: 'Experiment with different combinations - there\'s no single perfect deck!' },
    { type: 'setFlag', key: 'tutorial_deck_builder_completed', value: true },
    { type: 'hidePortrait', side: 'right', animation: 'slideOut' },
    { type: 'end' }
  ],
  priority: 65
};

// Store Introduction
export const SCENE_STORE_INTRO: SceneSpec = {
  id: 'tutorial_store_intro',
  version: 1,
  title: 'The Nexus Store',
  description: 'Introduction to the store and pack purchasing',
  triggers: [
    { type: 'onEnterScreen', screen: 'store' }
  ],
  conditions: {
    flags: { 'tutorial_store_completed': false }
  },
  steps: [
    { type: 'showPortrait', side: 'left', uri: 'merchant_portrait.png', animation: 'slideIn' },
    { type: 'say', speaker: 'Nexus Merchant', text: 'Welcome to my store, brave summoner!' },
    { type: 'highlight', anchorId: COMMON_ANCHORS.COIN_BALANCE, text: 'Here you can see your Nexus Coins.', maskInput: true },
    { type: 'highlight', anchorId: COMMON_ANCHORS.PACK_SHOP, text: 'These are the packs available for purchase.', maskInput: true },
    { type: 'say', speaker: 'Nexus Merchant', text: 'Standard Packs contain creatures from all elements.' },
    { type: 'say', speaker: 'Nexus Merchant', text: 'Elemental Packs guarantee creatures of a specific element.' },
    { type: 'say', speaker: 'Nexus Merchant', text: 'Premium Packs guarantee rare creatures - perfect for serious collectors!' },
    { type: 'say', speaker: 'Nexus Merchant', text: 'Don\'t forget - you get a free pack every 12 hours!' },
    { type: 'setFlag', key: 'tutorial_store_completed', value: true },
    { type: 'hidePortrait', side: 'left', animation: 'slideOut' },
    { type: 'end' }
  ],
  priority: 60
};

// Advanced Battle Mechanics (triggered after several battles)
/*
export const SCENE_ADVANCED_BATTLE: SceneSpec = {
  id: 'tutorial_advanced_battle',
  version: 1,
  title: 'Advanced Battle Tactics',
  description: 'Advanced battle strategies and element advantages',
  triggers: [
    { type: 'onBattleStart' }
  ],
  conditions: {
    flags: { 'tutorial_advanced_battle_completed': false },
    progress: { 'battles_won': 3 }
  },
  steps: [
    { type: 'showPortrait', side: 'right', uri: 'strategist_portrait.png', animation: 'slideIn' },
    { type: 'say', speaker: 'Battle Strategist', text: 'You\'re getting the hang of this! Let me share some advanced tactics.' },
    { type: 'say', speaker: 'Battle Strategist', text: 'Element Advantages: Fire beats Earth, Earth beats Water, Water beats Fire, and Air disrupts all!' },
    { type: 'say', speaker: 'Battle Strategist', text: 'When your element has advantage, your attacks deal extra damage!' },
    { type: 'say', speaker: 'Battle Strategist', text: 'Energy management is crucial - sometimes passing a turn to save energy is wise.' },
    { type: 'say', speaker: 'Battle Strategist', text: 'Watch your opponent\'s patterns. Good timing can turn the tide!' },
    { type: 'say', speaker: 'Battle Strategist', text: 'Finally, don\'t be afraid to retreat and reorganize your deck if you keep losing.' },
    { type: 'setFlag', key: 'tutorial_advanced_battle_completed', value: true },
    { type: 'hidePortrait', side: 'right', animation: 'slideOut' },
    { type: 'end' }
  ],
  priority: 55
};
*/

// Export all tutorial scenes
export const ALL_TUTORIAL_SCENES: SceneSpec[] = [
  SCENE_FIRST_LAUNCH,
  SCENE_STORY_MODE_INTRO,
  SCENE_CHAPTER_MAP_INTRO,
  //SCENE_BATTLE_TUTORIAL,
  //SCENE_FIRST_VICTORY,
  SCENE_HOME_INTRO,
  SCENE_COLLECTION_INTRO,
  SCENE_DECK_BUILDER_INTRO,
  SCENE_STORE_INTRO,
  //SCENE_ADVANCED_BATTLE,
];
