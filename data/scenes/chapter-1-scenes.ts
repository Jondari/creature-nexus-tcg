/**
 * Chapter 1: Central Nexus World - Story Scenes
 *
 * The player discovers the Nexus, the mysterious hub where all elemental
 * energies converge. They learn about their role as a Summoner and face
 * the Nexus Core Guardian.
 *
 * Battles: nexus_1, nexus_2, nexus_3, nexus_4, nexus_boss
 */

import type { SceneSpec } from '@/types/scenes';

// ============================================================================
// CHAPTER 1 INTRODUCTION
// ============================================================================

/**
 * Chapter 1 Introduction
 * Triggered when player first enters Chapter 1
 */
export const SCENE_CHAPTER_1_INTRO: SceneSpec = {
  id: 'story_chapter_1_intro',
  version: 1,
  title: 'i18n:story.scenes.chapter_1.intro.title',
  description: 'Introduction to the Nexus and the Summoner\'s journey',
  triggers: [
    { type: 'onStoryProgress', chapterId: 1 }
  ],
  conditions: {
    flags: { 'story_chapter_1_intro_seen': false }
  },
  backgroundImage: 'nexus_bg.png',
  steps: [
    // Setup
    { type: 'setBackground', uri: 'nexus_welcome_bg.png', transition: 'fade' },

    // The Archivist greets the player
    { type: 'showPortrait', side: 'right', uri: 'archivist_portrait.png', animation: 'slideIn' },

    { type: 'say', speaker: 'i18n:story.characters.archivist', text: 'i18n:story.scenes.chapter_1.intro.line_1' },
    { type: 'say', speaker: 'i18n:story.characters.archivist', text: 'i18n:story.scenes.chapter_1.intro.line_2' },
    { type: 'say', speaker: 'i18n:story.characters.archivist', text: 'i18n:story.scenes.chapter_1.intro.line_3' },

    // Player choice
    { type: 'choice', choices: [
      {
        id: 'ask_nexus',
        text: 'i18n:story.scenes.chapter_1.intro.choice_nexus',
        goto: 'explain_nexus'
      },
      {
        id: 'ask_summoner',
        text: 'i18n:story.scenes.chapter_1.intro.choice_summoner',
        goto: 'explain_summoner'
      },
      {
        id: 'ready',
        text: 'i18n:story.scenes.chapter_1.intro.choice_ready',
        goto: 'ready_to_begin'
      }
    ]},

    // Branch: Explain the Nexus
    { type: 'label', name: 'explain_nexus' },
    { type: 'say', speaker: 'i18n:story.characters.archivist', text: 'i18n:story.scenes.chapter_1.intro.nexus_explain_1' },
    { type: 'say', speaker: 'i18n:story.characters.archivist', text: 'i18n:story.scenes.chapter_1.intro.nexus_explain_2' },
    { type: 'setFlag', key: 'learned_about_nexus', value: true },
    { type: 'goto', label: 'ready_to_begin' },

    // Branch: Explain Summoner role
    { type: 'label', name: 'explain_summoner' },
    { type: 'say', speaker: 'i18n:story.characters.archivist', text: 'i18n:story.scenes.chapter_1.intro.summoner_explain_1' },
    { type: 'say', speaker: 'i18n:story.characters.archivist', text: 'i18n:story.scenes.chapter_1.intro.summoner_explain_2' },
    { type: 'setFlag', key: 'learned_about_summoner', value: true },
    { type: 'goto', label: 'ready_to_begin' },

    // Ready to begin
    { type: 'label', name: 'ready_to_begin' },
    { type: 'say', speaker: 'i18n:story.characters.archivist', text: 'i18n:story.scenes.chapter_1.intro.ready_1' },
    { type: 'say', speaker: 'i18n:story.characters.archivist', text: 'i18n:story.scenes.chapter_1.intro.ready_2' },

    // Cleanup
    { type: 'setFlag', key: 'story_chapter_1_intro_seen', value: true },
    { type: 'hidePortrait', side: 'right', animation: 'slideOut' },
    { type: 'end' }
  ],
  priority: 50
};

// ============================================================================
// BATTLE: NEXUS_1 - First Encounter
// ============================================================================

export const SCENE_NEXUS_1_PRE: SceneSpec = {
  id: 'story_nexus_1_pre',
  version: 1,
  title: 'First Encounter',
  triggers: [
    { type: 'onBattleStart', chapterId: 1, battleId: 'nexus_1' }
  ],
  conditions: {
    flags: { 'story_nexus_1_pre_seen': false }
  },
  steps: [
    { type: 'setBackground', uri: 'nexus_bg.png', transition: 'fade' },
    { type: 'showPortrait', side: 'left', uri: 'guide_portrait.png', animation: 'slideIn' },

    { type: 'say', speaker: 'i18n:story.characters.guide', text: 'i18n:story.scenes.chapter_1.nexus_1.pre_1' },
    { type: 'say', speaker: 'i18n:story.characters.guide', text: 'i18n:story.scenes.chapter_1.nexus_1.pre_2' },
    { type: 'say', speaker: 'i18n:story.characters.guide', text: 'i18n:story.scenes.chapter_1.nexus_1.pre_3' },

    { type: 'setFlag', key: 'story_nexus_1_pre_seen', value: true },
    { type: 'hidePortrait', side: 'left', animation: 'slideOut' },
    { type: 'end' }
  ],
  priority: 45
};

export const SCENE_NEXUS_1_VICTORY: SceneSpec = {
  id: 'story_nexus_1_victory',
  version: 1,
  title: 'First Victory',
  triggers: [
    { type: 'onBattleEnd', result: 'win' }
  ],
  conditions: {
    flags: {
      'story_nexus_1_pre_seen': true,
      'story_nexus_1_victory_seen': false
    }
  },
  steps: [
    { type: 'setBackground', uri: 'nexus_bg.png', transition: 'fade' },
    { type: 'showPortrait', side: 'left', uri: 'guide_portrait.png', animation: 'fadeIn' },

    { type: 'say', speaker: 'i18n:story.characters.guide', text: 'i18n:story.scenes.chapter_1.nexus_1.victory_1' },
    { type: 'say', speaker: 'i18n:story.characters.guide', text: 'i18n:story.scenes.chapter_1.nexus_1.victory_2' },

    { type: 'setFlag', key: 'story_nexus_1_victory_seen', value: true },
    { type: 'hidePortrait', side: 'left', animation: 'fadeOut' },
    { type: 'end' }
  ],
  priority: 44
};

// ============================================================================
// BATTLE: NEXUS_2 - Portal Discovery
// ============================================================================

export const SCENE_NEXUS_2_PRE: SceneSpec = {
  id: 'story_nexus_2_pre',
  version: 1,
  title: 'Portal Discovery',
  triggers: [
    { type: 'onBattleStart', chapterId: 1, battleId: 'nexus_2' }
  ],
  conditions: {
    flags: { 'story_nexus_2_pre_seen': false }
  },
  steps: [
    { type: 'setBackground', uri: 'nexus_bg.png', transition: 'fade' },
    { type: 'showPortrait', side: 'right', uri: 'archivist_portrait.png', animation: 'slideIn' },

    { type: 'say', speaker: 'i18n:story.characters.archivist', text: 'i18n:story.scenes.chapter_1.nexus_2.pre_1' },
    { type: 'say', speaker: 'i18n:story.characters.archivist', text: 'i18n:story.scenes.chapter_1.nexus_2.pre_2' },

    { type: 'choice', choices: [
      {
        id: 'curious',
        text: 'i18n:story.scenes.chapter_1.nexus_2.choice_curious',
        setFlags: { 'player_curious': true }
      },
      {
        id: 'cautious',
        text: 'i18n:story.scenes.chapter_1.nexus_2.choice_cautious',
        setFlags: { 'player_cautious': true }
      }
    ]},

    { type: 'say', speaker: 'i18n:story.characters.archivist', text: 'i18n:story.scenes.chapter_1.nexus_2.pre_3' },

    { type: 'setFlag', key: 'story_nexus_2_pre_seen', value: true },
    { type: 'hidePortrait', side: 'right', animation: 'slideOut' },
    { type: 'end' }
  ],
  priority: 45
};

// ============================================================================
// BATTLE: NEXUS_3 - Ancient Guardians
// ============================================================================

export const SCENE_NEXUS_3_PRE: SceneSpec = {
  id: 'story_nexus_3_pre',
  version: 1,
  title: 'Ancient Guardians',
  triggers: [
    { type: 'onBattleStart', chapterId: 1, battleId: 'nexus_3' }
  ],
  conditions: {
    flags: { 'story_nexus_3_pre_seen': false }
  },
  steps: [
    { type: 'setBackground', uri: 'nexus_bg.png', transition: 'fade' },
    { type: 'showPortrait', side: 'left', uri: 'chap1/temple_guardian.png', animation: 'slideIn' },

    { type: 'say', speaker: 'i18n:story.characters.guardian', text: 'i18n:story.scenes.chapter_1.nexus_3.pre_1' },
    { type: 'say', speaker: 'i18n:story.characters.guardian', text: 'i18n:story.scenes.chapter_1.nexus_3.pre_2' },
    { type: 'say', speaker: 'i18n:story.characters.guardian', text: 'i18n:story.scenes.chapter_1.nexus_3.pre_3' },

    { type: 'setFlag', key: 'story_nexus_3_pre_seen', value: true },
    { type: 'hidePortrait', side: 'left', animation: 'slideOut' },
    { type: 'end' }
  ],
  priority: 45
};

// ============================================================================
// BATTLE: NEXUS_4 - Elemental Convergence
// ============================================================================

export const SCENE_NEXUS_4_PRE: SceneSpec = {
  id: 'story_nexus_4_pre',
  version: 1,
  title: 'Elemental Convergence',
  triggers: [
    { type: 'onBattleStart', chapterId: 1, battleId: 'nexus_4' }
  ],
  conditions: {
    flags: { 'story_nexus_4_pre_seen': false }
  },
  steps: [
    { type: 'setBackground', uri: 'nexus_bg.png', transition: 'fade' },
    { type: 'showPortrait', side: 'right', uri: 'archivist_portrait.png', animation: 'slideIn' },

    { type: 'say', speaker: 'i18n:story.characters.archivist', text: 'i18n:story.scenes.chapter_1.nexus_4.pre_1' },
    { type: 'say', speaker: 'i18n:story.characters.archivist', text: 'i18n:story.scenes.chapter_1.nexus_4.pre_2' },

    { type: 'say', speaker: 'i18n:story.characters.narrator', text: 'i18n:story.scenes.chapter_1.nexus_4.pre_3' },

    { type: 'setFlag', key: 'story_nexus_4_pre_seen', value: true },
    { type: 'hidePortrait', side: 'right', animation: 'slideOut' },
    { type: 'end' }
  ],
  priority: 45
};

// ============================================================================
// BATTLE: NEXUS_BOSS - Nexus Core Guardian
// ============================================================================

export const SCENE_NEXUS_BOSS_PRE: SceneSpec = {
  id: 'story_nexus_boss_pre',
  version: 1,
  title: 'The Core Guardian',
  triggers: [
    { type: 'onBattleStart', chapterId: 1, battleId: 'nexus_boss' }
  ],
  conditions: {
    flags: { 'story_nexus_boss_pre_seen': false }
  },
  steps: [
    { type: 'setBackground', uri: 'nexus_bg.png', transition: 'fade' },

    // Dramatic entrance
    { type: 'say', speaker: 'i18n:story.characters.narrator', text: 'i18n:story.scenes.chapter_1.nexus_boss.pre_1' },

    { type: 'showPortrait', side: 'left', uri: 'chap1/shadow_figure.png', animation: 'fadeIn' },

    { type: 'say', speaker: 'i18n:story.characters.core_guardian', text: 'i18n:story.scenes.chapter_1.nexus_boss.pre_2' },
    { type: 'say', speaker: 'i18n:story.characters.core_guardian', text: 'i18n:story.scenes.chapter_1.nexus_boss.pre_3' },

    // Player response choice
    { type: 'choice', choices: [
      {
        id: 'brave',
        text: 'i18n:story.scenes.chapter_1.nexus_boss.choice_brave',
        goto: 'brave_response'
      },
      {
        id: 'diplomatic',
        text: 'i18n:story.scenes.chapter_1.nexus_boss.choice_diplomatic',
        goto: 'diplomatic_response'
      },
      {
        id: 'determined',
        text: 'i18n:story.scenes.chapter_1.nexus_boss.choice_determined',
        goto: 'determined_response'
      }
    ]},

    { type: 'label', name: 'brave_response' },
    { type: 'say', speaker: 'i18n:story.characters.core_guardian', text: 'i18n:story.scenes.chapter_1.nexus_boss.brave_reply' },
    { type: 'setFlag', key: 'boss_response_brave', value: true },
    { type: 'goto', label: 'battle_start' },

    { type: 'label', name: 'diplomatic_response' },
    { type: 'say', speaker: 'i18n:story.characters.core_guardian', text: 'i18n:story.scenes.chapter_1.nexus_boss.diplomatic_reply' },
    { type: 'setFlag', key: 'boss_response_diplomatic', value: true },
    { type: 'goto', label: 'battle_start' },

    { type: 'label', name: 'determined_response' },
    { type: 'say', speaker: 'i18n:story.characters.core_guardian', text: 'i18n:story.scenes.chapter_1.nexus_boss.determined_reply' },
    { type: 'setFlag', key: 'boss_response_determined', value: true },
    { type: 'goto', label: 'battle_start' },

    { type: 'label', name: 'battle_start' },
    { type: 'say', speaker: 'i18n:story.characters.core_guardian', text: 'i18n:story.scenes.chapter_1.nexus_boss.pre_4' },

    { type: 'setFlag', key: 'story_nexus_boss_pre_seen', value: true },
    { type: 'hidePortrait', side: 'left', animation: 'fadeOut' },
    { type: 'end' }
  ],
  priority: 40
};

// ============================================================================
// CHAPTER 1 COMPLETION
// ============================================================================

export const SCENE_CHAPTER_1_COMPLETE: SceneSpec = {
  id: 'story_chapter_1_complete',
  version: 1,
  title: 'Nexus Awakened',
  triggers: [
    { type: 'onBattleEnd', result: 'win' }
  ],
  conditions: {
    flags: {
      'story_nexus_boss_pre_seen': true,
      'story_chapter_1_complete_seen': false
    }
  },
  steps: [
    { type: 'setBackground', uri: 'victory_bg.png', transition: 'fade' },

    // Victory moment
    { type: 'say', speaker: 'i18n:story.characters.narrator', text: 'i18n:story.scenes.chapter_1.complete.line_1' },

    { type: 'showPortrait', side: 'left', uri: 'chap1/shadow_figure.png', animation: 'fadeIn' },
    { type: 'say', speaker: 'i18n:story.characters.core_guardian', text: 'i18n:story.scenes.chapter_1.complete.line_2' },
    { type: 'say', speaker: 'i18n:story.characters.core_guardian', text: 'i18n:story.scenes.chapter_1.complete.line_3' },
    { type: 'hidePortrait', side: 'left', animation: 'fadeOut' },

    // Archivist returns
    { type: 'showPortrait', side: 'right', uri: 'archivist_portrait.png', animation: 'slideIn' },
    { type: 'say', speaker: 'i18n:story.characters.archivist', text: 'i18n:story.scenes.chapter_1.complete.line_4' },
    { type: 'say', speaker: 'i18n:story.characters.archivist', text: 'i18n:story.scenes.chapter_1.complete.line_5' },
    { type: 'say', speaker: 'i18n:story.characters.archivist', text: 'i18n:story.scenes.chapter_1.complete.line_6' },

    // Reward notification
    { type: 'say', speaker: 'i18n:story.characters.narrator', text: 'i18n:story.scenes.chapter_1.complete.reward' },

    // Tease next chapter
    { type: 'say', speaker: 'i18n:story.characters.archivist', text: 'i18n:story.scenes.chapter_1.complete.tease_water' },

    { type: 'setFlag', key: 'story_chapter_1_complete_seen', value: true },
    { type: 'setFlag', key: 'chapter_1_completed', value: true },
    { type: 'setProgress', key: 'chapters_completed', value: 1 },
    { type: 'hidePortrait', side: 'right', animation: 'slideOut' },
    { type: 'end' }
  ],
  priority: 35
};

// ============================================================================
// CHAPTER 1 DEFEAT (Generic)
// ============================================================================

export const SCENE_CHAPTER_1_DEFEAT: SceneSpec = {
  id: 'story_chapter_1_defeat',
  version: 1,
  title: 'Defeat',
  triggers: [
    { type: 'onBattleEnd', result: 'lose' }
  ],
  conditions: {
    flags: { 'story_chapter_1_intro_seen': true }
  },
  steps: [
    { type: 'setBackground', uri: 'defeat_bg.png', transition: 'fade' },

    { type: 'showPortrait', side: 'right', uri: 'guide_portrait.png', animation: 'fadeIn' },
    { type: 'say', speaker: 'i18n:story.characters.guide', text: 'i18n:story.scenes.chapter_1.defeat.line_1' },
    { type: 'say', speaker: 'i18n:story.characters.guide', text: 'i18n:story.scenes.chapter_1.defeat.line_2' },
    { type: 'say', speaker: 'i18n:story.characters.guide', text: 'i18n:story.scenes.chapter_1.defeat.line_3' },

    { type: 'hidePortrait', side: 'right', animation: 'fadeOut' },
    { type: 'end' }
  ],
  priority: 30
};

// ============================================================================
// EXPORT ALL CHAPTER 1 SCENES
// ============================================================================

export const CHAPTER_1_SCENES: SceneSpec[] = [
  SCENE_CHAPTER_1_INTRO,
  SCENE_NEXUS_1_PRE,
  SCENE_NEXUS_1_VICTORY,
  SCENE_NEXUS_2_PRE,
  SCENE_NEXUS_3_PRE,
  SCENE_NEXUS_4_PRE,
  SCENE_NEXUS_BOSS_PRE,
  SCENE_CHAPTER_1_COMPLETE,
  SCENE_CHAPTER_1_DEFEAT,
];
