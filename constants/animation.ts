// Centralized animation timing constants

// Spell timing
export const SPELL_CAST_ENGINE_DELAY_MS = 1200; // delay before executing spell effect

// Damage animation durations
export const KILL_ANIM_MS = 600; // short & snappy so lethal hits feel responsive
export const NON_KILL_ANIM_MS = 1000; // longer feedback for non-lethal hits
export const HITSTOP_DURATION_MS = 80; // freeze frame before impact lands

// Card lifecycle
export const CARD_ENTRY_DURATION_MS = 350; // card appears on field (scale + opacity)
export const CARD_DEATH_DURATION_MS = 600; // death dissolve/shrink animation
export const CARD_RETIRE_DURATION_MS = 400; // card retire fade + slide

// Damage numbers
export const DAMAGE_NUMBER_DURATION_MS = 900; // float up + fade out

// Turn & game flow
export const TURN_TRANSITION_DURATION_MS = 1200; // turn banner slide in + hold + slide out
export const GAME_OVER_ANIM_DURATION_MS = 1500; // victory/defeat animation

// Z-indices for animation layers
export const Z_INDEX = {
  BATTLEFIELD: 0,
  CARD: 1,
  CARD_GLOW: 2,
  DAMAGE_EFFECT: 10,
  DAMAGE_NUMBER: 11,
  ATTACK_EFFECT: 12,
  TURN_BANNER: 20,
  GAME_OVER: 30,
} as const;
